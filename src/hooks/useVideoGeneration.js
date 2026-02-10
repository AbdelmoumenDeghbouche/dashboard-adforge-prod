import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePolling } from './usePolling';
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';

/**
 * Hook to trigger and poll video generation
 * Handles video generation from approved creative variations
 * 
 * @param {string} brandId - Brand ID
 * @param {string} productId - Product ID
 * @param {string} videoStyle - Video style format ('perfect_ugc_hybrid' or 'ugc_creative_kling')
 * @returns {Object} { generateVideo, videoStatus, isGenerating, isPolling, error, resetVideoGeneration }
 * 
 * @example
 * const { 
 *   generateVideo, 
 *   videoStatus, 
 *   isGenerating,
 *   progress 
 * } = useVideoGeneration(brandId, productId, 'perfect_ugc_hybrid');
 * 
 * // Call generateVideo(creativeGenId, variationId) when user selects creative
 * // Automatically polls until status === 'completed'
 */
export function useVideoGeneration(brandId, productId, videoStyle = 'perfect_ugc_hybrid') {
  const [jobId, setJobId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // Create fetcher function only when jobId exists
  const fetcher = useMemo(() => {
    if (!jobId) {
      return null;
    }
    
    return () => strategicAnalysisAPI.getVideoJobStatus(jobId);
  }, [jobId]);

  // Poll video job status
  const { data, isPolling, error: pollingError } = usePolling(fetcher, {
    interval: 10000, // Poll every 10 seconds (videos take 5-10 minutes)
    stopCondition: (data) => {
      const status = data?.data?.status;
      return status === 'completed' || status === 'failed';
    },
    enabled: !!fetcher
  });

  // Trigger video generation
  const generateVideo = useCallback(async (creativeGenId, variationId) => {
    if (!brandId || !productId || !creativeGenId || !variationId) {
      console.error('[useVideoGeneration] Missing required parameters');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);
      
      console.log('[useVideoGeneration] 🎬🎬🎬 Triggering video generation with:', {
        creativeGenId,
        variationId,
        videoStyle
      });
      console.log('[useVideoGeneration] 🎬 VIDEO_STYLE BEING SENT TO API:', videoStyle);
      
      const response = await strategicAnalysisAPI.generateVideo(
        brandId,
        productId,
        creativeGenId,
        variationId,
        videoStyle
      );
      
      const newJobId = response?.data?.job_id;
      
      if (newJobId) {
        console.log('[useVideoGeneration] Video job submitted:', newJobId);
        setJobId(newJobId);
      } else {
        throw new Error('No job_id returned from API');
      }
    } catch (err) {
      console.error('[useVideoGeneration] Error generating video:', err);
      setGenerationError(err);
    } finally {
      setIsGenerating(false);
    }
  }, [brandId, productId, videoStyle]);

  // Reset video generation state
  const resetVideoGeneration = useCallback(() => {
    setJobId(null);
    setGenerationError(null);
    setIsGenerating(false);
  }, []);

  // Extract video status from response
  const videoJobData = data?.data || null;
  const videoStatus = videoJobData?.status || null;
  const videoUrl = videoJobData?.video_url || null;
  const progress = videoJobData?.progress_percentage || 0;
  const currentStep = videoJobData?.current_step || null;
  const duration = videoJobData?.duration || null;

  // Combine errors
  const error = generationError || pollingError;
  
  // Clear jobId if 404 error (job not found)
  useEffect(() => {
    if (pollingError) {
      const is404 = pollingError.response?.status === 404 || 
                    pollingError.message?.includes('404') || 
                    pollingError.message?.includes('not found');
      
      if (is404) {
        console.log('[useVideoGeneration] ❌ Job not found, clearing jobId');
        setJobId(null);
      }
    }
  }, [pollingError]);

  return {
    // Actions
    generateVideo,
    resetVideoGeneration,
    
    // State
    jobId,
    videoStatus,
    videoUrl,
    videoJobData,
    isGenerating,
    isPolling,
    error,
    
    // Progress info
    progress,
    currentStep,
    duration,
    
    // Computed flags
    isLoading: isGenerating || isPolling,
    isCompleted: videoStatus === 'completed',
    isFailed: videoStatus === 'failed',
    hasVideo: !!videoUrl,
  };
}

export default useVideoGeneration;

