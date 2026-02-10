import { useState, useMemo, useCallback } from 'react';
import { usePolling } from './usePolling';
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';

/**
 * Hook to trigger and poll strategic analysis
 * Handles angle intelligence and offer diagnostic (Module 1 + 2)
 * 
 * @param {string} brandId - Brand ID
 * @param {string} productId - Product ID
 * @param {string} researchId - Research ID
 * @returns {Object} { startAnalysis, analysisResult, isTriggering, isPolling, error, resetAnalysis }
 * 
 * @example
 * const { 
 *   startAnalysis, 
 *   analysisResult, 
 *   isTriggering, 
 *   isPolling 
 * } = useStrategicAnalysis(brandId, productId, researchId);
 * 
 * // Call startAnalysis() when user clicks "Analyze Marketing Angles"
 * // Automatically polls until status === 'completed'
 */
export function useStrategicAnalysis(brandId, productId, researchId) {
  const [analysisId, setAnalysisId] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState(null);

  // Create fetcher function only when analysisId exists
  const fetcher = useMemo(() => {
    if (!brandId || !productId || !analysisId) {
      return null;
    }
    
    return () => strategicAnalysisAPI.getStrategicAnalysis(brandId, productId, analysisId);
  }, [brandId, productId, analysisId]);

  // Poll analysis status
  const { data, isPolling, error: pollingError } = usePolling(fetcher, {
    interval: 5000, // Poll every 5 seconds
    stopCondition: (data) => {
      const status = data?.data?.status;
      return status === 'completed' || status === 'failed';
    },
    enabled: !!fetcher
  });

  // Trigger strategic analysis
  const startAnalysis = useCallback(async (targetPersonaId = null) => {
    if (!brandId || !productId || !researchId) {
      console.error('[useStrategicAnalysis] Missing required IDs');
      return;
    }

    try {
      setIsTriggering(true);
      setTriggerError(null);
      
      console.log('[useStrategicAnalysis] Triggering strategic analysis...', { targetPersonaId });
      
      const response = await strategicAnalysisAPI.triggerStrategicAnalysis(
        brandId,
        productId,
        researchId,
        targetPersonaId
      );
      
      // Handle both old (response.data.analysis_id) and new job-based (response.analysis_id) structures
      const newAnalysisId = response?.data?.analysis_id || response?.analysis_id;
      
      if (newAnalysisId) {
        console.log('[useStrategicAnalysis] Analysis triggered:', newAnalysisId);
        setAnalysisId(newAnalysisId);
      } else {
        console.error('[useStrategicAnalysis] No analysis_id in response:', response);
        throw new Error('No analysis_id returned from API');
      }
    } catch (err) {
      console.error('[useStrategicAnalysis] Error triggering analysis:', err);
      setTriggerError(err);
    } finally {
      setIsTriggering(false);
    }
  }, [brandId, productId, researchId]);

  // Reset analysis state
  const resetAnalysis = useCallback(() => {
    setAnalysisId(null);
    setTriggerError(null);
    setIsTriggering(false);
  }, []);

  // Extract analysis result
  const analysisResult = data?.data || null;
  const analysisStatus = analysisResult?.status || null;

  // Combine errors
  const error = triggerError || pollingError;

  return {
    // Actions
    startAnalysis,
    resetAnalysis,
    
    // State
    analysisId,
    analysisResult,
    analysisStatus,
    isTriggering,
    isPolling,
    error,
    
    // Computed flags
    isLoading: isTriggering || isPolling,
    isCompleted: analysisStatus === 'completed',
    isFailed: analysisStatus === 'failed',
  };
}

export default useStrategicAnalysis;

