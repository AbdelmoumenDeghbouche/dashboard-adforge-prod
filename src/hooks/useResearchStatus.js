import { useMemo } from 'react';
import { usePolling } from './usePolling';
import { researchAPI } from '../services/researchService';

/**
 * Hook to poll research status
 * Polls every 5 seconds until research is completed or failed
 * 
 * @param {string} brandId - Brand ID
 * @param {string} productId - Product ID
 * @param {string} researchId - Research ID (if null, polling is disabled)
 * @returns {Object} { researchStatus, researchData, isPolling, error }
 * 
 * @example
 * const { researchStatus, researchData, isPolling } = useResearchStatus(
 *   brandId,
 *   productId,
 *   researchId
 * );
 * 
 * // researchStatus: 'processing' | 'completed' | 'failed' | null
 */
export function useResearchStatus(brandId, productId, researchId) {
  // Create fetcher function only when all IDs are present
  const fetcher = useMemo(() => {
    if (!brandId || !productId || !researchId) {
      return null;
    }
    
    return () => researchAPI.getResearchDetails(brandId, productId, researchId);
  }, [brandId, productId, researchId]);

  // Poll research status
  const { data, isPolling, error } = usePolling(fetcher, {
    interval: 5000, // Poll every 5 seconds
    stopCondition: (data) => {
      const status = data?.data?.status;
      return status === 'completed' || status === 'failed';
    },
    enabled: !!fetcher
  });

  // Extract status from response
  const researchStatus = data?.data?.status || null;
  const researchData = data?.data || null;

  return {
    researchStatus,
    researchData,
    isPolling,
    error
  };
}

export default useResearchStatus;

