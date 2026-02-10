import axios from 'axios';
import { auth } from '../config/firebase';

// Validate API configuration on load
const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  throw new Error('Configuration error: Backend URL is not set');
}

// Create axios instance for strategic analysis API
const api = axios.create({
  baseURL: baseURL,
  timeout: 900000, // 15 MINUTES - max for ALB with ECS
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Auth interceptor
api.interceptors.request.use(
  async (config) => {
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('[strategicAnalysisService] Token retrieval failed:', error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error('[strategicAnalysisService] Server error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      const message = 
        error.response.data?.message || 
        error.response.data?.detail || 
        "Une erreur est survenue lors de l'analyse stratégique";
      
      const customError = new Error(message);
      customError.response = error.response;
      return Promise.reject(customError);
    } else if (error.request) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
        timeoutMsg: error.code === 'ECONNABORTED' ? '⏱️ REQUEST TIMED OUT!' : ''
      };
      console.error('[strategicAnalysisService] ❌ Connection/Timeout error:');
      console.error('  Message:', errorDetails.message);
      console.error('  Code:', errorDetails.code);
      console.error('  URL:', errorDetails.url);
      console.error('  Base URL:', errorDetails.baseURL);
      console.error('  Timeout setting:', errorDetails.timeout, 'ms');
      if (errorDetails.timeoutMsg) console.error('  ⚠️', errorDetails.timeoutMsg);
      return Promise.reject(new Error('Le serveur est temporairement indisponible. Veuillez réessayer.'));
    } else {
      console.error('[strategicAnalysisService] Request setup error:', error.message);
      return Promise.reject(new Error('Une erreur est survenue. Veuillez réessayer.'));
    }
  }
);

/**
 * Strategic Analysis API Service
 * Handles angle intelligence, creative generation, and video generation
 */
export const strategicAnalysisAPI = {
  /**
   * Get personas extracted from research
   * GET /api/v1/strategic-analysis/products/{brandId}/{productId}/research/{researchId}/personas
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} researchId - Research ID
   * @returns {Promise<{success: boolean, personas: Array}>}
   */
  getPersonas: async (brandId, productId, researchId) => {
    try {
      console.log('[strategicAnalysisAPI] Fetching personas:', {
        brandId,
        productId,
        researchId
      });
      
      const response = await api.get(
        `/api/v1/strategic-analysis/products/${brandId}/${productId}/research/${researchId}/personas`,
        { timeout: 180000 } // 3 MINUTES - AI persona extraction takes time
      );
      
      console.log('[strategicAnalysisAPI] Personas fetched:', response);
      return response;
    } catch (error) {
      console.error('[strategicAnalysisAPI] Error fetching personas:', error);
      throw error;
    }
  },

  /**
   * Trigger strategic analysis (Module 1 + 2: Angle Intelligence + Offer Diagnostic)
   * POST /api/v1/strategic-analysis/products/{brandId}/{productId}/research/{researchId}/analyze?target_persona_id=...
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} researchId - Research ID
   * @param {string} targetPersonaId - Optional persona ID to filter analysis
   * @returns {Promise<{analysis_id: string}>}
   */
  triggerStrategicAnalysis: async (brandId, productId, researchId, targetPersonaId = null, onProgress = null) => {
    try {
      console.log('[strategicAnalysisAPI] Triggering strategic analysis (job-based):', {
        brandId,
        productId,
        researchId,
        targetPersonaId
      });
      
      // Build URL with -job suffix for job-based endpoint
      let url = `/api/v1/strategic-analysis/products/${brandId}/${productId}/research/${researchId}/analyze-job`;
      const body = {};
      
      if (targetPersonaId) {
        body.target_persona_id = targetPersonaId;
        console.log('[strategicAnalysisAPI] 🎯 Targeting persona:', targetPersonaId);
      } else {
        console.log('[strategicAnalysisAPI] 🌍 Using general audience (no persona targeting)');
      }
      
      // Step 1: Trigger job (returns immediately with job_id)
      const jobResponse = await api.post(url, body, { timeout: 30000 }); // 30s timeout for job creation
      const jobId = jobResponse.data?.job_id || jobResponse.job_id;
      
      if (!jobId) {
        throw new Error('No job_id returned from server');
      }
      
      console.log(`[strategicAnalysisAPI] Job created: ${jobId}. Polling for completion...`);
      
      // Step 2: Poll for completion (import pollJobStatus from apiService)
      const { pollJobStatus } = await import('./apiService.js');
      const result = await pollJobStatus(jobId, onProgress, 2000, 300); // Poll every 2s for up to 10 minutes
      
      console.log('[strategicAnalysisAPI] Job result:', result);
      
      // Step 3: Fetch full analysis data (job result only has metadata)
      const analysisId = result.analysis_id;
      if (analysisId) {
        console.log('[strategicAnalysisAPI] Fetching full analysis data:', analysisId);
        const fullAnalysis = await strategicAnalysisAPI.getStrategicAnalysis(brandId, productId, analysisId);
        console.log('[strategicAnalysisAPI] Full analysis retrieved:', fullAnalysis);
        
        // Return in format expected by hook (with nested data property)
        return {
          data: {
            analysis_id: analysisId,
            ...fullAnalysis.data
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('[strategicAnalysisAPI] Error triggering strategic analysis:', error);
      throw error;
    }
  },

  /**
   * Get strategic analysis status (for polling)
   * GET /api/v1/strategic-analysis/analysis/{brandId}/{productId}/{analysisId}
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} analysisId - Analysis ID
   * @returns {Promise<{analysis_id: string, status: string, angle_intelligence: {...}, offer_diagnostic: {...}}>}
   */
  getStrategicAnalysis: async (brandId, productId, analysisId) => {
    try {
      console.log('[strategicAnalysisAPI] Polling strategic analysis:', {
        brandId,
        productId,
        analysisId
      });
      
      const response = await api.get(
        `/api/v1/strategic-analysis/analysis/${brandId}/${productId}/${analysisId}`,
        { timeout: 60000 } // 1 minute for polling requests
      );
      
      console.log('[strategicAnalysisAPI] Strategic analysis status:', response.data?.status);
      return response;
    } catch (error) {
      console.error('[strategicAnalysisAPI] Error fetching strategic analysis:', error);
      throw error;
    }
  },

  /**
   * Approve angle and generate creatives (Module 3-5: Creative Generation)
   * POST /api/v1/strategic-analysis/analysis/{brandId}/{productId}/{analysisId}/approve-angle
   * 
   * ⚠️ CRITICAL: video_style MUST be "perfect_ugc_hybrid" (Kling + Sora overlay)
   * This is HARDCODED and should NEVER be changed!
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} analysisId - Analysis ID
   * @param {number} angleRank - Selected angle rank (1-7)
   * @param {number} adLength - Ad length in seconds (default: 40)
   * @returns {Promise<{creative_gen_id: string, selected_angle: {...}, creatives: {...}}>}
   */
  approveAngleAndGenerateCreatives: async (
    brandId, 
    productId, 
    analysisId, 
    angleRank, 
    adLength = 40,
    videoStyle = 'perfect_ugc_hybrid',
    onProgress = null
  ) => {
    const payload = {
      angle_rank: angleRank, // Backend expects angle_rank for job endpoint
      ad_length: adLength,
      video_style: videoStyle, // User-selected format
      awareness_level: 'solution_aware',
      campaign_objective: 'conversion'
    };
    
    try {
      console.log('[strategicAnalysisAPI] Approving angle and generating creatives (job-based):', {
        brandId,
        productId,
        analysisId,
        angleRank,
        adLength,
        videoStyle
      });
      
      console.log('[strategicAnalysisAPI] 🎬 Using video_style for creatives:', videoStyle);
      console.log('[strategicAnalysisAPI] 📤 Sending payload to backend:', JSON.stringify(payload, null, 2));
      
      // Step 1: Trigger job (returns immediately with job_id)
      const jobResponse = await api.post(
        `/api/v1/strategic-analysis/analysis/${brandId}/${productId}/${analysisId}/approve-angle-job`,
        payload,
        { timeout: 30000 } // 30s timeout for job creation
      );
      
      const jobId = jobResponse.data?.job_id || jobResponse.job_id;
      
      if (!jobId) {
        throw new Error('No job_id returned from server');
      }
      
      console.log(`[strategicAnalysisAPI] Creative generation job created: ${jobId}. Polling for completion...`);
      
      // Step 2: Poll for completion
      const { pollJobStatus } = await import('./apiService.js');
      const result = await pollJobStatus(jobId, onProgress, 2000, 150); // Poll every 2s for up to 5 minutes
      
      console.log('[strategicAnalysisAPI] Creatives generated:', result);
      return result;
    } catch (error) {
      console.error('[strategicAnalysisAPI] Error approving angle:', error);
      console.error('[strategicAnalysisAPI] 🔍 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        payload: payload
      });
      console.error('[strategicAnalysisAPI] 🔍 Validation errors:', JSON.stringify(error.response?.data?.detail, null, 2));
      throw error;
    }
  },

  /**
   * Generate video from approved creative
   * POST /api/v1/sora/generate/{brandId}/{productId}
   * 
   * ⚠️ CRITICAL: 
   * - video_style MUST be "perfect_ugc_hybrid" (Kling + Sora overlay)
   * - ai_model MUST be "claude"
   * These are HARDCODED and should NEVER be changed!
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} creativeGenId - Creative generation ID
   * @param {string} variationId - Variation ID ('proof', 'fear', or 'desire')
   * @returns {Promise<{job_id: string}>}
   */
  generateVideo: async (brandId, productId, creativeGenId, variationId, videoStyle = 'perfect_ugc_hybrid') => {
    try {
      console.log('[strategicAnalysisAPI] Triggering video generation:', {
        brandId,
        productId,
        creativeGenId,
        variationId,
        videoStyle
      });
      
      const payload = {
        creative_gen_id: creativeGenId,
        variation_id: variationId,
        video_style: videoStyle, // User-selected format
        ai_model: 'claude' // Always use Claude
      };
      
      console.log('[strategicAnalysisAPI] 🎬 Using video_style:', videoStyle);
      console.log('[strategicAnalysisAPI] 🤖 Using ai_model: claude');
      
      const response = await api.post(
        `/api/v1/sora/generate/${brandId}/${productId}`,
        payload,
        { timeout: 900000 } // 15 MINUTES - max for ALB with ECS
      );
      
      console.log('[strategicAnalysisAPI] Video generation job submitted:', response);
      return response;
    } catch (error) {
      console.error('[strategicAnalysisAPI] Error generating video:', error);
      throw error;
    }
  },

  /**
   * Get video generation job status (for polling)
   * GET /api/v1/jobs/{jobId}
   * 
   * Uses the centralized jobs endpoint (not the Sora-specific endpoint)
   * 
   * @param {string} jobId - Video job ID
   * @returns {Promise<{job_id: string, status: string, video_url?: string, progress_percentage?: number, current_step?: string}>}
   */
  getVideoJobStatus: async (jobId) => {
    try {
      const response = await api.get(
        `/api/v1/jobs/${jobId}`,
        { timeout: 10000 }
      );
      
      // Only log when status changes to avoid spam
      if (response.data?.status !== 'processing') {
        console.log('[strategicAnalysisAPI] Video job status:', response.data?.status);
      }
      
      return response;
    } catch (error) {
      console.error('[strategicAnalysisAPI] Error fetching video job status:', error);
      throw error;
    }
  },

  /**
   * Get creative generation with full creative details
   * GET /api/v1/strategic-analysis/creatives/{brandId}/{productId}/{creativeGenId}
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} creativeGenId - Creative generation ID
   * @returns {Promise<{success: boolean, data: {creative_gen_id: string, creatives: Array}}>}
   */
  getCreativeGeneration: async (brandId, productId, creativeGenId) => {
    try {
      console.log('[strategicAnalysisAPI] Fetching creative generation:', {
        brandId,
        productId,
        creativeGenId
      });
      
      const response = await api.get(
        `/api/v1/strategic-analysis/creatives/${brandId}/${productId}/${creativeGenId}`,
        { timeout: 30000 } // 30s timeout
      );
      
      console.log('[strategicAnalysisAPI] Creative generation retrieved:', {
        creatives_count: response.data?.creatives?.length || 0,
        creative_gen_id: response.data?.creative_gen_id
      });
      
      return response;
    } catch (error) {
      console.error('[strategicAnalysisAPI] Error fetching creative generation:', error);
      throw error;
    }
  },
};

export default strategicAnalysisAPI;

