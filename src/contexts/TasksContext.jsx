import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { adsAPI } from '../services/apiService';

/**
 * TasksContext - BACKEND JOB TRACKING (NO LOCAL STORAGE)
 * 
 * Uses centralized backend API: GET /api/v1/jobs
 * All jobs (ad generation, video generation, scraping, etc.) tracked in one place
 * 
 * Backend Job Types:
 * - ad_generation: Ad image generation
 * - video_generation: Sora video generation
 * - scraping: Product/store scraping
 * - avatar_video: Avatar video generation
 * - remix: Ad remix generation
 * 
 * Job States (from backend):
 * - queued: Waiting to start
 * - processing: Currently running
 * - completed: Finished successfully
 * - failed: Error occurred
 * - cancelled: User cancelled
 * 
 * Features:
 * - ✅ Backend persistence (survives refreshes, no localStorage)
 * - ✅ Real-time progress tracking
 * - ✅ Centralized job management
 * - ✅ Cancel jobs from UI
 */
const TasksContext = createContext();

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

export const TasksProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Jobs from backend (no localStorage)
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Use ref to prevent infinite loops
  const loadingRef = React.useRef(false);
  
  const [filterType, setFilterType] = useState('all'); // 'all' | task type
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | task status
  
  /**
   * Fetch all jobs from backend
   */
  const fetchJobs = useCallback(async () => {
    if (!currentUser || loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await adsAPI.getAllJobs('all', 50);
      
      if (response.success && response.data?.jobs) {
        // Map backend jobs to frontend task format
        const mappedTasks = response.data.jobs.map(job => ({
          taskId: job.job_id,
          taskType: job.type || job.job_type || 'unknown',
          status: job.status, // queued, processing, completed, failed, cancelled
          progress: job.progress || (job.status === 'completed' ? 100 : job.status === 'processing' ? 50 : 0),
          title: job.title || `${job.type || 'Job'} #${job.job_id.slice(-8)}`,
          description: job.message || job.current_step || '',
          startTime: new Date(job.created_at).getTime(),
          endTime: job.completed_at ? new Date(job.completed_at).getTime() : null,
          metadata: {
            jobId: job.job_id,
            result: job.result_data,
            error: job.error_message,
            total_ads: job.total_ads,
            completed_ads: job.completed_ads,
            ads_generated: job.ads_generated,
          }
        }));
        
        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error('[TasksContext] Error fetching jobs:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentUser]);
  
  /**
   * Add a new task (NO-OP - backend creates jobs automatically)
   * Kept for backwards compatibility with existing code
   */
  const addTask = useCallback((taskData) => {
    console.log('[TasksContext] Job created on backend:', taskData.metadata?.jobId || taskData.taskId);
    // Trigger immediate refresh to show new job
    fetchJobs();
    return taskData.metadata?.jobId || taskData.taskId;
  }, [fetchJobs]);
  
  /**
   * Update an existing task (NO-OP - backend updates jobs automatically)
   * Kept for backwards compatibility
   */
  const updateTask = useCallback((taskId, updates) => {
    // Backend handles updates, just refresh
    if (updates.status === 'completed' || updates.status === 'failed') {
      console.log('[TasksContext] Job', updates.status + ':', taskId);
      fetchJobs();
    }
  }, [fetchJobs]);
  
  /**
   * Remove a task (cancels backend job)
   */
  const removeTask = useCallback(async (taskId) => {
    try {
      await adsAPI.cancelJob(taskId);
      fetchJobs(); // Refresh list
    } catch (error) {
      console.error('[TasksContext] Error cancelling job:', error);
    }
  }, [fetchJobs]);
  
  /**
   * Clear all completed/failed tasks
   */
  const clearCompletedTasks = useCallback(() => {
    // Just filter frontend view (backend keeps history)
    setTasks(prev => prev.filter(t => t.status === 'queued' || t.status === 'processing'));
  }, []);
  
  /**
   * Clear all tasks (frontend view only)
   */
  const clearAllTasks = useCallback(() => {
    setTasks([]);
  }, []);
  
  /**
   * Get filtered tasks
   */
  const getFilteredTasks = useCallback(() => {
    let filtered = tasks;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.taskType === filterType);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    // Sort by startTime (newest first)
    return filtered.sort((a, b) => b.startTime - a.startTime);
  }, [tasks, filterType, filterStatus]);
  
  /**
   * Get task counts by status
   */
  const getTaskCounts = useCallback(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      processing: tasks.filter(t => t.status === 'processing').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };
  }, [tasks]);
  
  /**
   * ❌ POLLING DISABLED - Only fetches when user opens Tasks page
   * 
   * Old behavior: Auto-fetched jobs on mount and polled every 30s
   * New behavior: Manual fetch only (call refreshJobs() from Tasks page)
   */
  // useEffect(() => {
  //   if (!currentUser) {
  //     setTasks([]);
  //     return;
  //   }
  //   
  //   // Fetch immediately
  //   fetchJobs();
  // }, [currentUser, fetchJobs]);
  
  /**
   * ❌ POLLING DISABLED - Only polls when user is on Tasks page
   */
  // useEffect(() => {
  //   if (!currentUser) {
  //     return;
  //   }
  //   
  //   const interval = setInterval(() => {
  //     // Check if there are active jobs (use current state)
  //     setTasks(currentTasks => {
  //       const activeJobs = currentTasks.filter(t => t.status === 'queued' || t.status === 'processing');
  //       if (activeJobs.length > 0) {
  //         fetchJobs(); // Refresh if there are active jobs
  //       }
  //       return currentTasks; // Don't change state, just trigger fetch
  //     });
  //   }, 30000);
  //   
  //   return () => clearInterval(interval);
  // }, [currentUser, fetchJobs]);
  
  /**
   * Clear all tasks when user logs out
   */
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
    }
  }, [currentUser]);
  
  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    removeTask,
    clearCompletedTasks,
    clearAllTasks,
    getFilteredTasks,
    getTaskCounts,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    refreshJobs: fetchJobs, // Expose refresh function
  };
  
  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export default TasksContext;

