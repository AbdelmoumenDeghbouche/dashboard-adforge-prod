import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { adsAPI } from '../services/apiService';
import { useAuth } from './AuthContext';

/**
 * JobNotificationContext
 * 
 * Manages background job tracking and notifications with these features:
 * - Polls backend every 15 seconds for active job status
 * - Shows toast notifications when jobs complete/fail
 * - Persists active jobs to localStorage (survives page refreshes)
 * - Automatically cleans up stale jobs (30+ minutes old)
 * - Only polls when there are active jobs (efficient)
 * 
 * Usage:
 *   const { trackJob, dismissNotification } = useJobNotificationContext();
 *   trackJob(jobId, 'scraping', { url, brandId });
 */
const JobNotificationContext = createContext();

export const useJobNotificationContext = () => {
  const context = useContext(JobNotificationContext);
  if (!context) {
    throw new Error('useJobNotificationContext must be used within a JobNotificationProvider');
  }
  return context;
};

const STORAGE_KEY = 'activeJobs';

export const JobNotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Initialize activeJobs from localStorage
  const [activeJobs, setActiveJobs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[JobNotificationContext] 🔄 Restored', parsed.length, 'active jobs from localStorage');
        return parsed;
      }
    } catch (error) {
      console.error('[JobNotificationContext] Error loading jobs from localStorage:', error);
    }
    return [];
  });
  
  const [notifications, setNotifications] = useState([]); // Notifications to display
  const [isPolling, setIsPolling] = useState(false);
  
  // Track failed polls per job (for 404 handling)
  const failedPollsRef = useRef({});

  /**
   * Save activeJobs to localStorage whenever they change
   */
  useEffect(() => {
    try {
      if (activeJobs.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeJobs));
        console.log('[JobNotificationContext] 💾 Saved', activeJobs.length, 'active jobs to localStorage');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[JobNotificationContext] 🗑️ Cleared active jobs from localStorage');
      }
    } catch (error) {
      console.error('[JobNotificationContext] Error saving jobs to localStorage:', error);
    }
  }, [activeJobs]);

  /**
   * Add a new active job to track
   */
  const trackJob = useCallback((jobId, jobType, metadata = {}) => {
    console.log('[JobNotificationContext] 🆕 Tracking new job:', jobId, jobType);
    setActiveJobs(prev => {
      // Avoid duplicates
      if (prev.some(j => j.jobId === jobId)) {
        return prev;
      }
      return [...prev, { jobId, jobType, metadata, startTime: Date.now() }];
    });
  }, []);

  /**
   * Remove a job from tracking
   */
  const removeJob = useCallback((jobId) => {
    console.log('[JobNotificationContext] 🗑️ Removing job from tracking:', jobId);
    setActiveJobs(prev => prev.filter(j => j.jobId !== jobId));
  }, []);

  /**
   * Clear all active jobs (useful for cleanup)
   */
  const clearAllJobs = useCallback(() => {
    console.log('[JobNotificationContext] 🗑️ Clearing ALL active jobs');
    setActiveJobs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Add a notification to display
   */
  const addNotification = useCallback((notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now(),
    };
    
    console.log('[JobNotificationContext] 🔔 Adding notification:', newNotification);
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 10 seconds if not manually dismissed
    setTimeout(() => {
      dismissNotification(id);
    }, 10000);
  }, []);

  /**
   * Dismiss a notification
   */
  const dismissNotification = useCallback((notificationId) => {
    console.log('[JobNotificationContext] ❌ Dismissing notification:', notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  /**
   * Check status of all active jobs
   */
  const checkJobsStatus = useCallback(async () => {
    if (activeJobs.length === 0) {
      return; // No jobs to check
    }

    console.log('[JobNotificationContext] 🔍 Checking status of', activeJobs.length, 'active jobs');

    for (const job of activeJobs) {
      try {
        const response = await adsAPI.getJobStatus(job.jobId);
        
        // Reset failed polls counter on successful response
        if (failedPollsRef.current[job.jobId]) {
          failedPollsRef.current[job.jobId] = 0;
        }
        
        if (response.success && response.data) {
          const { status, result, error } = response.data;
          
          console.log(`[JobNotificationContext] Job ${job.jobId} status:`, status);

          // Stop polling if terminal state
          if (status === 'completed') {
            // Job completed successfully
            removeJob(job.jobId);
            delete failedPollsRef.current[job.jobId];
            
            // Create notification based on job type
            let notification = {
              type: 'success',
              title: 'Job completed!',
              message: 'Your job has finished processing.',
              jobType: job.jobType,
              jobId: job.jobId,
              result,
            };

            if (job.jobType === 'scraping') {
              const productId = result?.product_id || job.metadata?.productId;
              const brandId = result?.brand_id || job.metadata?.brandId;
              
              notification = {
                ...notification,
                title: '✅ Product Scraped Successfully!',
                message: `Product "${result?.product_name || result?.title || 'Unknown'}" has been added to your brand.`,
                action: productId ? {
                  label: 'View Product',
                  url: `/product/${productId}`,
                  state: brandId ? { preserveBrand: brandId } : undefined,
                } : null,
              };
            } else if (job.jobType === 'ad_generation') {
              const adsCount = result?.ads?.length || result?.generated_images?.length || 0;
              const productId = result?.product_id || job.metadata?.productId;
              const brandId = result?.brand_id || job.metadata?.brandId;
              
              notification = {
                ...notification,
                title: '✅ Ads Generated Successfully!',
                message: `${adsCount} ad${adsCount !== 1 ? 's' : ''} have been generated${result?.product_name ? ` for "${result.product_name}"` : ''}.`,
                action: productId ? {
                  label: 'View Product',
                  url: `/product/${productId}`,
                  state: brandId ? { preserveBrand: brandId } : undefined,
                } : {
                  label: 'View All Ads',
                  url: '/generated-ads',
                },
              };
            } else if (job.jobType === 'video_generation') {
              const productName = job.metadata?.productName || result?.product_name || 'your product';
              const productId = result?.product_id || job.metadata?.productId;
              const brandId = result?.brand_id || job.metadata?.brandId;
              const conversationId = result?.conversation_id || job.metadata?.conversationId;
              
              notification = {
                ...notification,
                title: '✅ Video Generated Successfully!',
                message: `Your video for "${productName}" is ready to view.`,
                action: productId ? {
                  label: 'View Product',
                  url: `/product/${productId}`,
                  state: brandId ? { preserveBrand: brandId } : undefined,
                } : conversationId ? {
                  label: 'Open Video Chat',
                  url: `/video-generation`,
                  state: { openConversation: conversationId },
                } : null,
              };
            }

            addNotification(notification);
          } else if (status === 'failed' || status === 'cancelled') {
            // Job failed or cancelled
            removeJob(job.jobId);
            delete failedPollsRef.current[job.jobId];
            
            const errorTitles = {
              'scraping': 'Scraping',
              'ad_generation': 'Ad Generation',
              'video_generation': 'Video Generation',
            };
            
            addNotification({
              type: 'error',
              title: `❌ ${errorTitles[job.jobType] || 'Job'} ${status === 'cancelled' ? 'Cancelled' : 'Failed'}`,
              message: error || 'An error occurred during processing. Please try again.',
              jobType: job.jobType,
              jobId: job.jobId,
            });
          }
          // If status is 'processing' or 'queued', keep polling
        }
      } catch (err) {
        console.error(`[JobNotificationContext] Error checking job ${job.jobId}:`, err);
        
        // Handle 404 errors - job not found
        if (err.response?.status === 404 || err.message?.includes('404')) {
          console.log(`[JobNotificationContext] Job ${job.jobId} not found (404)`);
          
          // Track failed polls
          failedPollsRef.current[job.jobId] = (failedPollsRef.current[job.jobId] || 0) + 1;
          
          // Stop after 3 consecutive 404s
          if (failedPollsRef.current[job.jobId] >= 3) {
            console.log(`[JobNotificationContext] Stopping poll for job ${job.jobId} after 3 consecutive 404s`);
            removeJob(job.jobId);
            delete failedPollsRef.current[job.jobId];
            
            // Optionally notify user
            addNotification({
              type: 'error',
              title: '❌ Job Not Found',
              message: 'The job could not be found. It may have been cancelled or expired.',
              jobType: job.jobType,
              jobId: job.jobId,
            });
          }
        }
        // Don't remove job on other errors - it might be a temporary network issue
      }
    }
  }, [activeJobs, removeJob, addNotification]);

  /**
   * Start polling for job status
   */
  const startPolling = useCallback(() => {
    console.log('[JobNotificationContext] 🚀 Starting job status polling');
    setIsPolling(true);
  }, []);

  /**
   * Stop polling for job status
   */
  const stopPolling = useCallback(() => {
    console.log('[JobNotificationContext] 🛑 Stopping job status polling');
    setIsPolling(false);
  }, []);

  /**
   * ❌ DISABLED - No longer showing notification on mount
   * Jobs are only tracked when user is on Tasks page
   */
  // const mountRef = useRef(false);
  // useEffect(() => {
  //   if (!mountRef.current && currentUser && activeJobs.length > 0) {
  //     mountRef.current = true;
  //     const restoredCount = activeJobs.length;
  //     console.log(`[JobNotificationContext] 📬 Found ${restoredCount} active job(s) after page load`);
  //     
  //     // Show a notification that jobs are being tracked
  //     const id = `notification-${Date.now()}-${Math.random()}`;
  //     const notification = {
  //       id,
  //       type: 'info',
  //       title: '⏳ Jobs in Progress',
  //       message: `Tracking ${restoredCount} background job${restoredCount > 1 ? 's' : ''}. You'll be notified when ${restoredCount > 1 ? 'they complete' : 'it completes'}.`,
  //       timestamp: Date.now(),
  //     };
  //     
  //     setNotifications(prev => [...prev, notification]);
  //     
  //     // Auto-remove after 10 seconds
  //     setTimeout(() => {
  //       setNotifications(prev => prev.filter(n => n.id !== id));
  //     }, 10000);
  //   }
  // }, [currentUser, activeJobs.length]);

  /**
   * Clear jobs when user logs out
   */
  useEffect(() => {
    if (!currentUser) {
      // User not logged in, clear everything
      console.log('[JobNotificationContext] 🚪 User logged out, clearing all jobs');
      setActiveJobs([]);
      setNotifications([]);
      setIsPolling(false);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  /**
   * ❌ POLLING DISABLED - Only polls when user is on Tasks page
   * 
   * Old behavior: Auto-polled every 30s if there were active jobs
   * New behavior: Manual polling only (from Tasks/Operations page)
   */
  // useEffect(() => {
  //   if (!currentUser) {
  //     return;
  //   }

  //   if (activeJobs.length === 0) {
  //     // No active jobs, no need to poll
  //     return;
  //   }

  //   // Start polling if there are active jobs
  //   console.log('[JobNotificationContext] 🔄 Starting polling for', activeJobs.length, 'jobs');
  //   setIsPolling(true);

  //   // Check immediately on mount/when jobs change
  //   checkJobsStatus();

  //   // Then check every 30 seconds (increased from 15s to reduce backend spam)
  //   const interval = setInterval(() => {
  //     checkJobsStatus();
  //   }, 30000);

  //   return () => {
  //     console.log('[JobNotificationContext] 🛑 Stopping polling interval');
  //     clearInterval(interval);
  //   };
  // }, [currentUser, activeJobs.length, checkJobsStatus]);

  /**
   * Cleanup stale jobs (older than 30 minutes)
   */
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      
      setActiveJobs(prev => {
        const filtered = prev.filter(job => {
          const isStale = (now - job.startTime) > thirtyMinutes;
          if (isStale) {
            console.log('[JobNotificationContext] 🧹 Removing stale job:', job.jobId);
          }
          return !isStale;
        });
        return filtered;
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  const value = {
    activeJobs,
    notifications,
    trackJob,
    removeJob,
    clearAllJobs,
    addNotification,
    dismissNotification,
    startPolling,
    stopPolling,
    isPolling,
    checkJobsStatus, // Expose for manual polling
  };

  return (
    <JobNotificationContext.Provider value={value}>
      {children}
    </JobNotificationContext.Provider>
  );
};

