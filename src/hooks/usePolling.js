import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Generic polling hook for async operations
 * 
 * @param {Function|null} fetcher - Async function to poll (returns Promise)
 * @param {Object} options - Polling options
 * @param {number} options.interval - Polling interval in ms (default: 5000)
 * @param {Function} options.stopCondition - Function that returns true to stop polling
 * @param {boolean} options.enabled - Whether polling is enabled (default: true)
 * @returns {Object} { data, isPolling, error, startPolling, stopPolling, resetPolling }
 * 
 * @example
 * const { data, isPolling } = usePolling(
 *   () => fetchStatus(id),
 *   {
 *     interval: 5000,
 *     stopCondition: (data) => data.status === 'completed'
 *   }
 * );
 */
export function usePolling(fetcher, options = {}) {
  const { 
    interval = 5000, 
    stopCondition = null,
    enabled = true 
  } = options;
  
  const [data, setData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  
  const intervalIdRef = useRef(null);
  const isMountedRef = useRef(true);
  const stoppedByConditionRef = useRef(false); // Track if stopped by stop condition

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Start polling
  const startPolling = useCallback(() => {
    if (!fetcher || !enabled) return;
    
    setIsPolling(true);
    setError(null);
  }, [fetcher, enabled]);

  // Reset polling state
  const resetPolling = useCallback(() => {
    stopPolling();
    setData(null);
    setError(null);
  }, [stopPolling]);

  // Polling effect
  useEffect(() => {
    if (!fetcher || !enabled || !isPolling) {
      return;
    }

    const poll = async () => {
      try {
        const result = await fetcher();
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setData(result);
          setError(null);

          // Check stop condition
          if (stopCondition && stopCondition(result)) {
            console.log('[usePolling] Stop condition met, stopping polling');
            stoppedByConditionRef.current = true; // Mark as stopped by condition
            stopPolling();
          }
        }
      } catch (err) {
        console.error('[usePolling] Polling error:', err);
        
        // Check if it's a 404 error (job not found)
        const is404 = err.response?.status === 404 || err.message?.includes('404') || err.message?.includes('not found');
        
        if (is404) {
          console.log('[usePolling] ❌ Job not found (404), stopping polling permanently');
          stoppedByConditionRef.current = true; // Mark as permanently stopped
        }
        
        if (isMountedRef.current) {
          setError(err);
          stopPolling();
        }
      }
    };

    // Poll immediately
    poll();

    // Then poll at intervals
    intervalIdRef.current = setInterval(poll, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [fetcher, enabled, isPolling, interval, stopCondition, stopPolling]);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-start polling when fetcher and enabled change
  // BUT don't restart if polling was stopped by stop condition
  useEffect(() => {
    if (fetcher && enabled && !isPolling && !stoppedByConditionRef.current) {
      startPolling();
    }
  }, [fetcher, enabled, isPolling, startPolling]);

  return { 
    data, 
    isPolling, 
    error, 
    startPolling,
    stopPolling,
    resetPolling
  };
}

export default usePolling;

