import axios from 'axios';
import { auth } from '../config/firebase';
import { apiConfig } from '../config/apiConfig';

// Validate API configuration on load
const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  throw new Error('Configuration error: Backend URL is not set');
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: baseURL,
  timeout: apiConfig.timeout || 300000, // 5 minutes default timeout
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
  },
});

// Create separate axios instance for FormData without default Content-Type
const apiFormData = axios.create({
  baseURL: baseURL,
  timeout: apiConfig.timeout || 300000, // 5 minutes default timeout
  headers: {
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
  },
  // No default Content-Type header - let browser set it for FormData
});

// Shared auth interceptor logic
const authInterceptor = async (config) => {
  const publicRoutes = [
    '/api/v1/auth/signup',
    '/api/v1/auth/verify-token',
    '/api/v1/auth/login',
    '/api/v1/auth/resend-verification'
  ];
  
  // Always add ngrok skip header to avoid HTML warning pages
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
  
  if (!isPublicRoute) {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Token retrieval failed - will be handled by response interceptor
      }
    }
  }
  
  return config;
};

// Apply auth interceptor to both instances
api.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
apiFormData.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Shared response interceptor logic
const responseInterceptor = (response) => response.data;
const errorInterceptor = (error) => {
  if (error.response) {
    console.error('[API Interceptor] Server error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    
    if (error.response.status === 422 && error.response.data?.detail) {
      const detailMsg = Array.isArray(error.response.data.detail) 
        ? error.response.data.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
        : JSON.stringify(error.response.data.detail);
      
      const fullError = new Error(`Validation error: ${detailMsg}`);
      fullError.response = error.response;
      return Promise.reject(fullError);
    }
    
    const message = 
      error.response.data?.message || 
      error.response.data?.detail || 
      'Une erreur est survenue';
    
    const customError = new Error(message);
    customError.response = error.response;
    return Promise.reject(customError);
  } else if (error.request) {
    return Promise.reject(new Error('Le serveur est temporairement indisponible. Veuillez réessayer.'));
  } else if (error.code === 'ECONNABORTED') {
    return Promise.reject(new Error('Le serveur met trop de temps à répondre.'));
  } else {
    return Promise.reject(new Error('Une erreur est survenue. Veuillez réessayer.'));
  }
};

// Apply response interceptor to both instances
api.interceptors.response.use(responseInterceptor, errorInterceptor);
apiFormData.interceptors.response.use(responseInterceptor, errorInterceptor);

// ========================================
// Job Polling Helper
// ========================================

/**
 * Poll a job until completion
 * @param {string} jobId - The job ID to poll
 * @param {function} onProgress - Callback for progress updates (optional)
 * @param {number} pollInterval - Polling interval in ms (default: 2000)
 * @param {number} maxAttempts - Maximum polling attempts (default: 300 = 10 minutes)
 * @returns {Promise<any>} - The job result when completed
 */
export async function pollJobStatus(jobId, onProgress = null, pollInterval = 2000, maxAttempts = 450) {
  console.log(`[pollJobStatus] Starting polling for job: ${jobId}`);
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await api.get(`/api/v1/jobs/${jobId}`);
      const job = response.data || response;

      console.log(`[pollJobStatus] Job ${jobId} status: ${job.status} (${job.progress_data?.percentage || 0}%)`);

      // Update progress if callback provided
      if (onProgress && job.progress_data) {
        onProgress({
          percentage: job.progress_data.percentage || 0,
          message: job.progress_data.current_step || 'Processing...',
          status: job.status
        });
      }

      // Check if job is completed
      if (job.status === 'completed') {
        console.log(`[pollJobStatus] Job ${jobId} completed successfully`);
        return job.result_data || job.result || {};
      }

      // Check if job failed
      if (job.status === 'failed') {
        console.error(`[pollJobStatus] Job ${jobId} failed:`, job.error_data);
        const errorMessage = job.error_data?.message || 'Job failed';
        throw new Error(errorMessage);
      }

      // Still processing, wait and retry
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

    } catch (error) {
      // If it's a job failure error, throw it
      if (error.message && error.message !== 'Network Error') {
        throw error;
      }

      // For network errors, retry
      console.warn(`[pollJobStatus] Polling error (attempt ${attempts + 1}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }
  }

  // Max attempts reached
  throw new Error(`Job ${jobId} timeout - taking longer than expected. Check the tasks page for status.`);
}

// Auth API endpoints
export const authAPI = {
  // Create new user via backend
  signup: async (email, password, displayName) => {
    return api.post('/api/v1/auth/signup', {
      email,
      password,
      display_name: displayName
    });
  },

  // Verify token with backend after Firebase login
  verifyToken: async (idToken) => {
    return api.post('/api/v1/auth/verify-token', { id_token: idToken });
  },

  // Get current user from backend
  getCurrentUser: async () => {
    return api.get('/api/v1/auth/me');
  },

  // Update user profile
  updateProfile: async (data) => {
    return api.patch('/api/v1/auth/me', data);
  },

  // Delete account
  deleteAccount: async () => {
    return api.delete('/api/v1/auth/me');
  },

  // Logout (revoke refresh tokens)
  logout: async () => {
    return api.post('/api/v1/auth/logout');
  },

  // Resend verification email
  resendVerification: async (email) => {
    return api.post('/api/v1/auth/resend-verification', { email });
  },
};

// Scraping API endpoints
export const scrapingAPI = {
  /**
   * Scrape product data from URL (JOB-BASED - returns job ID immediately)
   * Use jobAPI.getJobStatus() to poll for completion
   * 
   * Backend auto-triggers research pipeline in background after scraping completes
   * 
   * @param {string} url - Product URL to scrape
   * @param {string|null} brandId - Optional brand ID (backend creates brand if null)
   * @returns {Promise<{success: boolean, data: {job_id, status, created_at, estimated_completion, status_url}}>}
   */
  scrapeProduct: async (url, brandId) => {
    console.log('[scrapingAPI] 🔍 Starting JOB-BASED product scraping:', { url, brandId });
    return api.post('/api/v1/scraping/scrape-product-job', { url, brand_id: brandId }, {
      timeout: 120000, // 2 minutes for job submission
    });
  },
  
  /**
   * Scrape entire store from URL (JOB-BASED - returns job ID immediately)
   * Use jobAPI.getJobStatus() to poll for completion
   * 
   * @param {string} url - Store URL to scrape
   * @param {string|null} brandId - Optional brand ID
   * @returns {Promise<{success: boolean, data: {job_id, status, created_at, estimated_completion, status_url}}>}
   */
  scrapeStore: async (url, brandId) => {
    console.log('[scrapingAPI] 🏪 Starting JOB-BASED store scraping:', { url, brandId });
    return api.post('/api/v1/scraping/scrape-store-job', { url, brand_id: brandId }, {
      timeout: 180000, // 3 minutes for job submission
    });
  },
  
  // Health check for scraping service
  healthCheck: async () => {
    return api.get('/api/v1/scraping/health');
  },
};

// Ads Generation API endpoints
export const adsAPI = {
  // Generate bulk ads (JOB-BASED - returns immediately with job ID)
  generateBulkAds: async (formData) => {
    try {
      console.log('[adsAPI] Sending bulk ad generation request (job-based)');
      
      const response = await apiFormData.post('/api/v1/ads/generate-bulk-dynamic-job', formData, {
        timeout: 30000, // 30 seconds for job submission
      });
      
      console.log('[adsAPI] Job submitted:', response);
      
      return response;
    } catch (error) {
      console.error('[adsAPI] Error submitting ad generation job:', {
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Get ad generation job status (uses generic jobs endpoint)
  getAdJobStatus: async (jobId) => {
    try {
      const response = await api.get(`/api/v1/jobs/${jobId}`, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error checking ad job status:', error);
      throw error;
    }
  },

  /**
   * Get all ads for a specific brand
   * Expected: GET /api/v1/brands/{brandId}/ads
   */
  getBrandAds: async (brandId) => {
    try {
      console.log(`[adsAPI] Fetching ads for brand: ${brandId}`);
      const response = await api.get(`/api/v1/brands/${brandId}/ads`, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error fetching brand ads:', error);
      if (error.response?.status === 404) {
        return { success: true, data: { ads: [], count: 0 } };
      }
      throw error;
    }
  },

  /**
   * Get all ads for a specific product
   * Expected: GET /api/v1/brands/{brandId}/products/{productId}/ads
   */
  getProductAds: async (brandId, productId, limit = 100) => {
    try {
      const response = await api.get(`/api/v1/brands/${brandId}/products/${productId}/ads`, {
        params: { limit },
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error fetching product ads:', error);
      if (error.response?.status === 404) {
        return { success: true, data: { ads: [], count: 0, product: null, brand: null } };
      }
      throw error;
    }
  },

  /**
   * Get all ads for the current user (across all brands)
   * NOTE: Backend endpoint needs to be implemented
   * Expected: GET /api/v1/ads
   */
  getAllAds: async () => {
    try {
      const response = await api.get('/api/v1/ads', {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error fetching all ads:', error);
      if (error.response?.status === 404) {
        return { success: true, data: { ads: [], count: 0 } };
      }
      throw error;
    }
  },

  /**
   * Delete an ad
   * Expected: DELETE /api/v1/brands/{brandId}/ads/{adId}
   */
  deleteAd: async (brandId, adId) => {
    try {
      const response = await api.delete(`/api/v1/brands/${brandId}/ads/${adId}`, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error deleting ad:', error);
      throw error;
    }
  },

  /**
   * Get all ads for a brand, grouped by product
   * NEW METHOD for Firestore restructure
   * Expected: GET /api/v1/brands/{brandId}/ads/grouped-by-product
   */
  getBrandAdsGroupedByProduct: async (brandId) => {
    try {
      const response = await api.get(`/api/v1/brands/${brandId}/ads/grouped-by-product`, {
        timeout: 15000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error fetching grouped ads:', error);
      if (error.response?.status === 404) {
        return { success: true, data: { products: [], totalAds: 0, brand: null } };
      }
      throw error;
    }
  },

  /**
   * Remix/create variations of an existing ad conversation
   * POST /api/v1/ads/conversations/{conversationId}/remix
   */
  remixAd: async (conversationId, brandId, productId, brandName, productName, remixMode = 'similar', variationsCount = 5) => {
    try {
      console.log('[adsAPI] Triggering remix for conversation:', conversationId);
      const formData = new FormData();
      formData.append('brand_id', brandId);
      formData.append('product_id', productId);
      formData.append('brand_name', brandName || '');
      formData.append('product_name', productName || '');
      formData.append('remix_mode', remixMode);
      formData.append('variations_count', variationsCount);

      const response = await apiFormData.post(
        `/api/v1/ads/conversations/${conversationId}/remix`,
        formData,
        { timeout: 30000 } // 30 seconds for job submission
      );
      return response;
    } catch (error) {
      console.error('[adsAPI] Error triggering remix:', error);
      throw error;
    }
  },

  /**
   * Check job status (for remix and other long-running operations)
   * GET /api/v1/jobs/{jobId}
   */
  getJobStatus: async (jobId) => {
    try {
      const response = await api.get(`/api/v1/jobs/${jobId}`, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error checking job status:', error);
      throw error;
    }
  },
  
  /**
   * Get all jobs for current user (centralized job tracking)
   * GET /api/v1/jobs?status=all&limit=50
   */
  getAllJobs: async (status = 'all', limit = 50) => {
    try {
      const response = await api.get('/api/v1/jobs', {
        params: { status, limit },
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error fetching all jobs:', error);
      throw error;
    }
  },
  
  /**
   * Cancel a job
   * POST /api/v1/jobs/{jobId}/cancel
   */
  cancelJob: async (jobId) => {
    try {
      const response = await api.post(`/api/v1/jobs/${jobId}/cancel`, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error cancelling job:', error);
      throw error;
    }
  },

  /**
   * Get similar trending ads with smart Gemini query generation
   * GET /foreplay/trending-ads/
   * 
   * Pass product/brand data directly for Gemini to generate optimal query
   */
  getSimilarTrendingAds: async (query, languages = 'English', minRunningDays = null, maxRunningDays = null, order = 'longest_running', limit = 20, displayFormat = 'video', productId = null, brandId = null) => {
    try {
      console.log('[adsAPI] Fetching trending ads with:', { query, productId, brandId, limit });
      
      const params = {
        languages: languages,
        limit: limit,
        order: order,
        display_format: displayFormat
      };
      
      // Add product/brand IDs for smart query generation (generates 5 variations)
      if (productId) params.product_id = productId;
      if (brandId) params.brand_id = brandId;
      if (query) params.query = query;
      
      if (minRunningDays) params.min_running_days = minRunningDays;
      if (maxRunningDays) params.max_running_days = maxRunningDays;
      
      const response = await api.get('/api/v1/foreplay/trending-ads/', {
        params,
        timeout: 600000, // 3 minutes - allows time for Gemini to generate 5 queries + fetch ads for each
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error fetching trending ads:', error);
      throw error;
    }
  },

  /**
   * Get all template ads for a specific brand
   * GET /api/v1/ads/image/template/brand/{brand_id}
   */
  getTemplateAdsByBrand: async (brandId) => {
    try {
      console.log('[adsAPI] Fetching template ads for brand:', brandId);
      const response = await api.get(`/api/v1/ads/image/template/brand/${brandId}`, {
        timeout: 15000,
      });
      return response;
    } catch (error) {
      console.error('[adsAPI] Error fetching template ads:', error);
      if (error.response?.status === 404) {
        return { success: true, data: { ads: [], count: 0 } };
      }
      throw error;
    }
  },

  /**
   * Generate template-based ad images
   * POST /api/v1/ads/image/template
   */
  generateTemplateImages: async (formData, onProgress = null) => {
    try {
      console.log('[adsAPI] Generating template images (job-based)');
      
      // Step 1: Trigger job (returns immediately with job_id)
      const jobResponse = await apiFormData.post('/api/v1/ads/image/template-job', formData, {
        timeout: 30000, // 30s timeout for job creation
      });
      
      const jobId = jobResponse.data?.job_id || jobResponse.job_id;
      
      if (!jobId) {
        throw new Error('No job_id returned from server');
      }
      
      console.log(`[adsAPI] Image generation job created: ${jobId}. Polling for completion...`);
      
      // Step 2: Poll for completion
      const result = await pollJobStatus(jobId, onProgress, 2000, 150); // Poll every 2s for up to 5 minutes
      
      console.log('[adsAPI] Template images generated:', result);
      return result;
    } catch (error) {
      console.error('[adsAPI] Error generating template images:', error);
      throw error;
    }
  },
};

// Script Enhancement API endpoints (emotion markers, voice preview)
export const scriptAPI = {
  /**
   * Enhance script with ElevenLabs emotion markers using AI
   * POST /api/v1/scripts/enhance-emotions
   */
  enhanceEmotions: async (script, scriptType = 'product_demo', tonePreference = null, intensity = 'balanced') => {
    try {
      console.log('[scriptAPI] Enhancing script with emotions:', { scriptType, intensity });
      
      const payload = {
        script,
        script_type: scriptType,
        intensity
      };
      
      if (tonePreference) {
        payload.tone_preference = tonePreference;
      }
      
      const response = await api.post('/api/v1/scripts/enhance-emotions', payload, {
        timeout: 60000, // 1 minute for AI enhancement
      });
      
      console.log('[scriptAPI] Enhancement response:', response);
      return response;
    } catch (error) {
      console.error('[scriptAPI] Error enhancing script:', error);
      throw error;
    }
  },

  /**
   * Get voice recommendations based on script and avatar
   * POST /api/v1/scripts/recommend-voice
   */
  recommendVoice: async (script, avatarImageUrl = null, avatarDescription = null, limit = 10) => {
    try {
      console.log('[scriptAPI] Getting voice recommendations:', { 
        scriptLength: script.length, 
        hasAvatar: !!avatarImageUrl,
        hasDescription: !!avatarDescription,
        limit 
      });
      
      const payload = {
        script,
        limit
      };
      
      if (avatarImageUrl) {
        payload.avatar_image_url = avatarImageUrl;
      }
      
      if (avatarDescription) {
        payload.avatar_description = avatarDescription;
      }
      
      const response = await api.post('/api/v1/scripts/recommend-voice', payload, {
        timeout: 60000, // 1 minute for voice analysis
      });
      
      console.log('[scriptAPI] Voice recommendations received:', response);
      return response;
    } catch (error) {
      console.error('[scriptAPI] Error getting voice recommendations:', error);
      throw error;
    }
  },

  /**
   * Preview voice with script using ElevenLabs TTS
   * POST /api/v1/scripts/preview-voice
   */
  previewVoice: async (script, voiceId = '21m00Tcm4TlvDq8ikWAM', voiceStability = 0.50, voiceSimilarity = 0.60, voiceStyle = 0.75, modelId = 'eleven_multilingual_v2') => {
    try {
      console.log('[scriptAPI] Generating voice preview:', { voiceId, script: script.substring(0, 50) + '...' });
      
      const payload = {
        script,
        voice_id: voiceId,
        voice_stability: voiceStability,
        voice_similarity: voiceSimilarity,
        voice_style: voiceStyle,
        model_id: modelId
      };
      
      const response = await api.post('/api/v1/scripts/preview-voice', payload, {
        timeout: 120000, // 2 minutes for TTS generation
      });
      
      console.log('[scriptAPI] Voice preview response:', response);
      return response;
    } catch (error) {
      console.error('[scriptAPI] Error generating voice preview:', error);
      throw error;
    }
  },

  /**
   * Get available emotion markers
   * GET /api/v1/scripts/available-emotions
   */
  getAvailableEmotions: async () => {
    try {
      const response = await api.get('/api/v1/scripts/available-emotions', {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[scriptAPI] Error fetching available emotions:', error);
      throw error;
    }
  },

  /**
   * Validate emotion markers in script
   * POST /api/v1/scripts/validate-emotions
   */
  validateEmotions: async (script) => {
    try {
      const response = await api.post('/api/v1/scripts/validate-emotions', { script }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[scriptAPI] Error validating emotions:', error);
      throw error;
    }
  },
};

// Avatar Video Generation API endpoints
// Voice API
export const voiceAPI = {
  /**
   * Get voice recommendations based on character/script
   * POST /api/v1/voice/recommend
   */
  getVoiceRecommendations: async (params) => {
    try {
      console.log('[voiceAPI] Getting voice recommendations:', params);
      
      const payload = {
        avatar_description: params.avatar_description || params.avatarDescription,
        script: params.script,
        avatar_image_url: params.avatar_image_url || params.avatarImageUrl,
        limit: params.limit || 20,
      };

      const response = await api.post('/api/v1/voice/recommend', payload, {
        timeout: 30000,
      });

      console.log('[voiceAPI] Voice recommendations received:', response);
      return response;
    } catch (error) {
      console.error('[voiceAPI] Error getting voice recommendations:', error);
      throw error;
    }
  },

  /**
   * Change voice in video using Speech-to-Speech
   * POST /api/v1/voice/generate
   */
  changeVoice: async (params) => {
    try {
      console.log('[voiceAPI] Changing voice in video:', params);
      
      const payload = {
        video_url: params.video_url || params.videoUrl,
        voice_id: params.voice_id || params.voiceId,
        stability: params.stability !== undefined ? params.stability : 0.55,
        similarity_boost: params.similarity_boost !== undefined ? params.similarity_boost : (params.similarityBoost !== undefined ? params.similarityBoost : 0.60),
        style: params.style !== undefined ? params.style : 0.15,
      };

      const response = await api.post('/api/v1/voice/generate', payload, {
        timeout: 120000, // 2 minutes for voice transformation
      });

      console.log('[voiceAPI] Voice change response:', response);
      return response;
    } catch (error) {
      console.error('[voiceAPI] Error changing voice:', error);
      throw error;
    }
  },
};

export const avatarAPI = {
  /**
   * Generate product avatar video
   * POST /avatars/product-video/generate
   */
  generateVideo: async (params) => {
    try {
      console.log('[avatarAPI] Generating product avatar video with params:', params);
      
      // Build request payload matching backend expectations
      const payload = {
        avatar_source: params.avatar_source || params.avatarSource || 'provided',
        script: params.script,
        video_provider: params.video_provider || params.videoProvider || 'omni',
        aspect_ratio: params.aspect_ratio || params.aspectRatio || '9:16',
        add_ambient_sound: params.add_ambient_sound !== undefined ? params.add_ambient_sound : (params.addAmbientSound !== undefined ? params.addAmbientSound : true),
        ambient_setting: params.ambient_setting || params.ambientSetting || 'studio',
        ambient_volume: params.ambient_volume !== undefined ? params.ambient_volume : (params.ambientVolume !== undefined ? params.ambientVolume : 0.25),
        voice_id: params.voice_id || params.voiceId || '21m00Tcm4TlvDq8ikWAM', // Default voice if not provided
        voice_stability: params.voiceStability !== undefined ? params.voiceStability : 0.5,
        voice_similarity: params.voiceSimilarity !== undefined ? params.voiceSimilarity : 0.75,
      };

      // Add product fields only if provided (optional for avatar-only mode)
      const productImageUrl = params.product_image_url || params.productImageUrl;
      const productName = params.product_name || params.productName;
      
      if (productImageUrl) {
        payload.product_image_url = productImageUrl;
      }
      if (productName) {
        payload.product_name = productName;
      }

      // Add avatar-specific fields based on source
      if (payload.avatar_source === 'provided') {
        payload.avatar_image_url = params.avatar_image_url || params.avatarImageUrl;
      } else if (payload.avatar_source === 'generated') {
        payload.avatar_description = params.avatar_description || params.avatarDescription;
      }
      
      console.log('[avatarAPI] Final payload:', payload);
      
      const response = await api.post('/api/v1/avatars/product-video/generate', payload, {
        timeout: 180000, // 3 minutes - allows time for Nano Banana avatar generation + video generation
      });
      return response;
    } catch (error) {
      console.error('[avatarAPI] Error generating product avatar video:', error);
      throw error;
    }
  },

  /**
   * Get generated videos for user (with optional model filter)
   * GET /avatars/videos
   */
  getGeneratedVideos: async (model = null, limit = 50) => {
    try {
      console.log('[avatarAPI] Fetching generated videos:', { model, limit });
      
      const params = { limit };
      if (model) {
        params.model = model;
      }
      
      // Note: Response interceptor automatically unwraps response.data
      const response = await api.get('/api/v1/avatars/videos', {
        params,
        timeout: 15000,
      });
      
      console.log('[avatarAPI] Response (already unwrapped by interceptor):', response);
      console.log('[avatarAPI] Response type:', typeof response);
      console.log('[avatarAPI] Is array:', Array.isArray(response));
      
      return response; // Already unwrapped by interceptor
    } catch (error) {
      console.error('[avatarAPI] Error fetching videos:', error);
      throw error;
    }
  },

  /**
   * Get video generation job status
   * GET /avatars/job/:jobId
   */
  getJobStatus: async (jobId) => {
    try {
      const response = await api.get(`/api/v1/avatars/job/${jobId}`, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[avatarAPI] Error fetching job status:', error);
      throw error;
    }
  },

  /**
   * Get avatars from Firestore
   * GET /avatars/list
   */
  getAvatars: async (limit = 50, lastDocId = null) => {
    try {
      console.log('[avatarAPI] Fetching avatars:', { limit, lastDocId });
      
      const params = { limit };
      if (lastDocId) {
        params.last_doc_id = lastDocId;
      }
      
      const response = await api.get('/api/v1/avatars/list', {
        params,
        timeout: 15000,
      });
      
      console.log('[avatarAPI] Response status:', response.status);
      console.log('[avatarAPI] Response data:', response);
      
      return response;
    } catch (error) {
      console.error('[avatarAPI] Error fetching avatars:', error);
      console.error('[avatarAPI] Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Search avatars with filters
   * GET /avatars/search
   */
  searchAvatars: async (query, filters = {}, limit = null) => {
    try {
      console.log('[avatarAPI] Searching avatars:', { query, filters, limit });
      
      const params = { 
        query: query || ''
      };
      
      // Add limit if specified
      if (limit) params.limit = limit;
      
      // Add optional filters
      if (filters.gender) params.gender = filters.gender;
      if (filters.age) params.age = filters.age;
      if (filters.situation) params.situation = filters.situation;
      if (filters.accessories) params.accessories = filters.accessories;
      if (filters.emotions) params.emotions = filters.emotions;
      if (filters.ethnicity) params.ethnicity = filters.ethnicity;
      if (filters.hairStyle) params.hair_style = filters.hairStyle;
      if (filters.hairColor) params.hair_color = filters.hairColor;
      
      console.log('[avatarAPI] Request params:', params);
      console.log('[avatarAPI] Request URL:', '/api/v1/avatars/search');
      
      const response = await api.get('/api/v1/avatars/search', {
        params,
        timeout: 15000,
      });
      
      console.log('[avatarAPI] Response status:', response.status);
      console.log('[avatarAPI] Response data:', response);
      
      return response;
    } catch (error) {
      console.error('[avatarAPI] Error searching avatars:', error);
      console.error('[avatarAPI] Error response:', error.response?.data);
      console.error('[avatarAPI] Error status:', error.response?.status);
      throw error;
    }
  },
};

// Chat API endpoints for image modification
export const chatAPI = {
  createConversation: async (brandId, productId, imageFile, initialMessage = null) => {
    const formData = new FormData();
    formData.append('brand_id', brandId);
    formData.append('product_id', productId);
    formData.append('initial_image', imageFile);
    if (initialMessage) {
      formData.append('initial_message', initialMessage);
    }
    
    // Use apiFormData instance for FormData uploads
    const response = await apiFormData.post('/api/v1/chat/conversations', formData, {
      timeout: 280000, // 3 minutes for initial image creation
    });
    
    return response.data;
  },
  
  sendMessage: async (conversationId, text, backend = 'openai') => {
    const requestBody = { text: text };
    
    if (backend && backend !== 'openai') {
      requestBody.backend = backend;
    }
    
    console.log('[chatAPI] Sending message with backend:', backend);
    
    const response = await api.post(
      `/api/v1/chat/conversations/${conversationId}/messages`,
      requestBody,
      {
        timeout: 300000, // 5 minutes for AI image modification
      }
    );
    
    return response.data;
  },
  
  getConversation: async (brandId, productId, conversationId) => {
    const response = await api.get(`/api/v1/chat/brands/${brandId}/products/${productId}/conversations/${conversationId}`, {
      timeout: 30000, // 30 seconds for fetching conversation history
    });
    
    return response.data;
  },
  
  listConversations: async (brandId, productId, limit = 50) => {
    const response = await api.get(`/api/v1/chat/brands/${brandId}/products/${productId}/conversations`, {
      params: { limit },
      timeout: 30000, // 30 seconds for listing conversations
    });
    
    return response.data;
  },
};

// Social Auth API endpoints (OAuth for Meta & TikTok Ads)
export const socialAuthAPI = {
  /**
   * Initiate Meta Ads OAuth flow
   * POST /api/v1/social-auth/meta/authorize
   */
  initMetaOAuth: async (redirectUri) => {
    try {
      const response = await api.post('/api/v1/social-auth/meta/authorize', {
        redirect_uri: redirectUri
      }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[socialAuthAPI] Error initiating Meta OAuth:', error);
      throw error;
    }
  },

  /**
   * Initiate TikTok Ads OAuth flow
   * POST /api/v1/social-auth/tiktok/authorize
   */
  initTikTokOAuth: async (redirectUri) => {
    try {
      const response = await api.post('/api/v1/social-auth/tiktok/authorize', {
        redirect_uri: redirectUri
      }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[socialAuthAPI] Error initiating TikTok OAuth:', error);
      throw error;
    }
  },

  /**
   * Get all connected social accounts
   * GET /api/v1/social-auth/accounts
   */
  getConnectedAccounts: async () => {
    try {
      console.log('[socialAuthAPI] Fetching connected accounts');
      const response = await api.get('/api/v1/social-auth/accounts', {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[socialAuthAPI] Error fetching connected accounts:', error);
      if (error.response?.status === 404) {
        return { success: true, data: { accounts: [] } };
      }
      throw error;
    }
  },

  /**
   * Get ad accounts for a connected social account
   * GET /api/v1/social-auth/accounts/{accountId}/ad-accounts
   */
  getAdAccounts: async (accountId, refresh = false) => {
    try {
      const response = await api.get(`/api/v1/social-auth/accounts/${accountId}/ad-accounts`, {
        params: { refresh },
        timeout: 15000,
      });
      return response;
    } catch (error) {
      console.error('[socialAuthAPI] Error fetching ad accounts:', error);
      throw error;
    }
  },

  /**
   * Disconnect a social account
   * DELETE /api/v1/social-auth/accounts/{accountId}
   */
  disconnectAccount: async (accountId) => {
    try {
      const response = await api.delete(`/api/v1/social-auth/accounts/${accountId}`, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[socialAuthAPI] Error disconnecting account:', error);
      throw error;
    }
  },

  /**
   * Health check for social auth service
   * GET /api/v1/social-auth/health
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/api/v1/social-auth/health', {
        timeout: 5000,
      });
      return response;
    } catch (error) {
      console.error('[socialAuthAPI] Health check failed:', error);
      throw error;
    }
  },
};

// Brands API endpoints
export const brandsAPI = {
  createBrand: async (brandData, logoFile) => {
    try {
      // Step 1: Create brand without logo (JSON only)
      const createResponse = await api.post('/api/v1/brands', {
        brandName: brandData.brandName,
        domain: brandData.domain,
        primaryColor: brandData.primaryColor || '#000000',
        secondaryColor: brandData.secondaryColor || '#FFFFFF',
        accentColor: brandData.accentColor || null,
      }, {
        timeout: 30000,
      });
      
      if (!createResponse.success) {
        return createResponse;
      }
      
      const createdBrand = createResponse.data;
      
      if (logoFile) {
            const formData = new FormData();
            formData.append('logo_file', logoFile);
            
            try {
              const logoResponse = await apiFormData.post(
                `/api/v1/brands/${createdBrand.brandId}/upload-logo`,
            formData,
            { 
              timeout: 30000,
            }
          );
          
          return logoResponse;
        } catch (logoError) {
          console.error('Logo upload failed, but brand was created:', logoError);
          return createResponse;
        }
      }
      
      return createResponse;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  },

  updateBrand: async (brandId, updates, logoFile) => {
    try {
      // Step 1: Update brand fields (JSON only)
      const updateResponse = await api.patch(`/api/v1/brands/${brandId}`, updates, {
        timeout: 30000,
      });
      
      if (!updateResponse.success) {
        return updateResponse;
      }
      
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo_file', logoFile);
        
        try {
          const logoResponse = await apiFormData.post(
            `/api/v1/brands/${brandId}/upload-logo`,
            formData,
            { 
              timeout: 30000,
            }
          );
          
          return logoResponse;
        } catch (logoError) {
          console.error('Logo upload failed, but brand was updated:', logoError);
          return updateResponse;
        }
      }
      
      return updateResponse;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  getBrands: async () => {
    try {
      console.log('[brandsAPI] Calling GET /api/v1/brands');
      const response = await api.get('/api/v1/brands', {
        timeout: 30000, // Increased to 30 seconds to handle slow brand + ads fetching
      });
      console.log('[brandsAPI] Response from getBrands:', response);
      return response;
    } catch (error) {
      console.error('[brandsAPI] Error in getBrands:', error);
      console.error('[brandsAPI] Error response:', error.response);
      throw error;
    }
  },

  getBrand: async (brandId) => {
    return api.get(`/api/v1/brands/${brandId}`, {
      timeout: 10000,
    });
  },

  deleteBrand: async (brandId) => {
    return api.delete(`/api/v1/brands/${brandId}`, {
      timeout: 10000,
    });
  },

  getBrandProducts: async (brandId) => {
    return api.get(`/api/v1/brands/${brandId}/products`, {
      timeout: 10000,
    });
  },

  deleteProduct: async (brandId, productId) => {
    return api.delete(`/api/v1/brands/${brandId}/products/${productId}`, {
      timeout: 10000,
    });
  },
};

// Video Chat API endpoints for video generation
export const videoChatAPI = {
  // Create a new video conversation
  createVideoConversation: async (brandId, productId = null, referenceImageUrl, duration = null, provider = 'kie_story', platform = 'tiktok', aspectRatio = '9:16', language = 'en') => {
    try {
      const payload = {
        reference_image_url: referenceImageUrl
      };
      
      // Add duration if specified
      if (duration) {
        payload.duration = duration;
      }
      
      // Add provider (default: kie_story)
      if (provider) {
        payload.provider = provider;
      }
      
      // Add platform (default: tiktok)
      if (platform) {
        payload.platform = platform;
      }
      
      // Add aspect_ratio (default: 9:16)
      if (aspectRatio) {
        payload.aspect_ratio = aspectRatio;
      }
      
      // Add language (default: en)
      if (language) {
        payload.language = language;
      }
      
      console.log('[videoChatAPI] Creating video conversation with:', {
        brandId,
        productId: productId || 'no_product (avatar-only)',
        duration: duration || 'default',
        provider,
        platform,
        aspect_ratio: aspectRatio,
        language,
        has_reference_image: !!referenceImageUrl
      });
      
      // Build URL with optional product_id query param
      let url = `/api/v1/video-chat/brands/${brandId}/video-conversations`;
      if (productId) {
        url += `?product_id=${encodeURIComponent(productId)}`;
      }
      
      const response = await api.post(
        url,
        payload,
        { timeout: 30000 }
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error creating video conversation:', error);
      throw error;
    }
  },

  // Send a message in a video conversation
  sendVideoMessage: async (brandId, productId, conversationId, message, finish = false) => {
    try {
      const response = await api.post(
        `/api/v1/video-chat/brands/${brandId}/products/${productId}/video-conversations/${conversationId}/messages`,
        { message, finish },
        { timeout: 120000 } // 2 minutes for LLM response
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error sending message:', error);
      throw error;
    }
  },

  // Get conversation history
  getVideoConversation: async (brandId, productId, conversationId) => {
    try {
      const response = await api.get(
        `/api/v1/video-chat/brands/${brandId}/products/${productId}/video-conversations/${conversationId}`,
        { timeout: 30000 }
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error getting conversation:', error);
      throw error;
    }
  },

  // List all conversations for a product
  listVideoConversations: async (brandId, productId, limit = 50) => {
    try {
      const response = await api.get(
        `/api/v1/video-chat/brands/${brandId}/products/${productId}/video-conversations`,
        { params: { limit }, timeout: 30000 }
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error listing conversations:', error);
      throw error;
    }
  },

  // Generate Sora prompt from video description
  generateSoraPrompt: async (videoDescription, brandName = '', productName = '', productCategory = '', referenceImageUrl = '', additionalImageUrls = null) => {
    try {
      const response = await api.post(
        '/api/v1/video-chat/generate-sora-prompt',
        {
          video_description: videoDescription,
          brand_name: brandName,
          product_name: productName,
          product_category: productCategory,
          reference_image_url: referenceImageUrl,
          additional_image_urls: additionalImageUrls,
          total_duration: 24 
        },
        { timeout: 340000 } // 2 minutes for prompt generation
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error generating Sora prompt:', error);
      throw error;
    }
  },

  // Trigger video generation with Sora
  triggerVideoGeneration: async (brandId, productId, conversationId, soraPrompt, soraAnalysis, referenceImageUrl, provider = 'kie_story') => {
    try {
      const payload = {
        sora_prompt: soraPrompt,  // ← FULL object including "prompt" field with optional duration
        sora_analysis: soraAnalysis,
        reference_image_url: referenceImageUrl,
        provider: provider // ← 'openai', 'kie', or 'kie_story'
      };
      
      console.log('[videoChatAPI] Triggering video generation with payload:');
      console.log('[videoChatAPI] - provider:', provider);
      console.log('[videoChatAPI] - sora_prompt has "prompt" field:', !!soraPrompt?.prompt);
      console.log('[videoChatAPI] - prompt length:', soraPrompt?.prompt?.length || 0);
      console.log('[videoChatAPI] - duration:', soraPrompt?.duration || 'default');
      console.log('[videoChatAPI] - Full payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post(
        `/api/v1/video-chat/brands/${brandId}/products/${productId}/video-conversations/${conversationId}/generate-video`,
        payload,
        { timeout: 60000 } // 1 minute for job submission
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error triggering video generation:', error);
      throw error;
    }
  },

  // Get video job status
  getVideoJobStatus: async (jobId) => {
    try {
      const response = await api.get(
        `/api/v1/video-chat/video-jobs/${jobId}`,
        { timeout: 10000 }
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error getting job status:', error);
      throw error;
    }
  },

  // Delete a video conversation
  deleteVideoConversation: async (brandId, productId, conversationId) => {
    try {
      console.log('[videoChatAPI] Sending DELETE request:', {
        brandId,
        productId,
        conversationId,
        url: `/api/v1/video-chat/brands/${brandId}/products/${productId}/video-conversations/${conversationId}`
      });
      
      const response = await api.delete(
        `/api/v1/video-chat/brands/${brandId}/products/${productId}/video-conversations/${conversationId}`,
        { timeout: 10000 }
      );
      
      console.log('[videoChatAPI] DELETE response received:', response);
      
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error deleting conversation:', error);
      console.error('[videoChatAPI] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Get all videos from a conversation
  getConversationVideos: async (brandId, productId, conversationId) => {
    try {
      const response = await api.get(
        `/api/v1/video-chat/brands/${brandId}/products/${productId}/video-conversations/${conversationId}/videos`,
        { timeout: 30000 }
      );
      return response;
    } catch (error) {
      console.error('[videoChatAPI] Error getting conversation videos:', error);
      throw error;
    }
  },
};

// Subscription API endpoints
export const subscriptionAPI = {
  // Get all available plans
  getPlans: async () => {
    try {
      const response = await api.get('/api/v1/subscriptions/plans', {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error fetching plans:', error);
      throw error;
    }
  },

  // Get current user's subscription
  getSubscription: async () => {
    try {
      const response = await api.get('/api/v1/subscriptions/subscription', {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error fetching subscription:', error);
      throw error;
    }
  },

  // Create checkout session
  createCheckout: async (plan, successUrl, cancelUrl) => {
    try {
      const response = await api.post('/api/v1/subscriptions/checkout', {
        plan,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error creating checkout:', error);
      throw error;
    }
  },

  // Create billing portal session
  createBillingPortal: async (returnUrl) => {
    try {
      const response = await api.post('/api/v1/subscriptions/billing-portal', {
        return_url: returnUrl,
      }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error creating billing portal:', error);
      throw error;
    }
  },

  // Check if user has enough credits
  checkCredits: async (operationType, quantity = 1) => {
    try {
      const response = await api.post('/api/v1/subscriptions/check-credits', {
        operation_type: operationType,
        quantity,
      }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error checking credits:', error);
      throw error;
    }
  },

  // Deduct credits (called by backend services)
  deductCredits: async (operationType, quantity = 1) => {
    try {
      const response = await api.post('/api/v1/subscriptions/deduct-credits', {
        operation_type: operationType,
        quantity,
      }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error deducting credits:', error);
      throw error;
    }
  },

  // Schedule subscription cancellation (downgrade to free at period end)
  scheduleCancellation: async () => {
    try {
      const response = await api.post('/api/v1/subscriptions/schedule-cancellation', {}, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error scheduling cancellation:', error);
      throw error;
    }
  },

  // Reactivate subscription (cancel scheduled cancellation)
  reactivate: async () => {
    try {
      const response = await api.post('/api/v1/subscriptions/reactivate', {}, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error reactivating subscription:', error);
      throw error;
    }
  },

  // Schedule plan downgrade (lower tier plan at period end)
  scheduleDowngrade: async (targetPlan) => {
    try {
      const response = await api.post('/api/v1/subscriptions/schedule-downgrade', 
        { target_plan: targetPlan },
        { timeout: 10000 }
      );
      return response;
    } catch (error) {
      console.error('[subscriptionAPI] Error scheduling downgrade:', error);
      throw error;
    }
  },
};

// Credits API (one-time credit purchases)
export const creditsAPI = {
  // Get available credit packages
  getPackages: async () => {
    try {
      const response = await api.get('/api/v1/credits/packages', {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[creditsAPI] Error getting packages:', error);
      throw error;
    }
  },

  // Get credit balance
  getBalance: async () => {
    try {
      console.log('[creditsAPI] Calling GET /api/v1/credits/balance');
      const response = await api.get('/api/v1/credits/balance', {
        timeout: 10000,
      });
      console.log('[creditsAPI] Response from getBalance:', response);
      return response;
    } catch (error) {
      console.error('[creditsAPI] Error getting balance:', error);
      console.error('[creditsAPI] Error response:', error.response);
      throw error;
    }
  },

  // Purchase credits
  purchaseCredits: async (packageId, successUrl, cancelUrl) => {
    try {
      const response = await api.post('/api/v1/credits/purchase', {
        package_id: packageId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }, {
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[creditsAPI] Error purchasing credits:', error);
      throw error;
    }
  },

  // Get transaction history
  getTransactions: async (limit = 50) => {
    try {
      const response = await api.get('/api/v1/credits/transactions', {
        params: { limit },
        timeout: 10000,
      });
      return response;
    } catch (error) {
      console.error('[creditsAPI] Error getting transactions:', error);
      throw error;
    }
  },
};

// ============================================
// VIDEO PLAYGROUND API
// ============================================
export const videoPlaygroundAPI = {
  // Generate video from playground (simple prompt + image)
  generateVideo: async (prompt, imageUrl, aspectRatio = '9:16', platform = 'tiktok', duration = null, provider = 'openai') => {
    try {
      const payload = {
        prompt,
        image_url: imageUrl,
        aspect_ratio: aspectRatio,
        platform,
        provider
      };
      
      // Add duration if specified
      if (duration !== null) {
        payload.duration = duration;
      }
      
      console.log('[videoPlaygroundAPI] Submitting video generation:', payload);
      
      const response = await api.post(
        '/api/v1/video-playground/playground/generate-video',
        payload,
        { timeout: 600000 } // 3 minutes for job submission (includes Claude prompt enhancement)
      );
      return response;
    } catch (error) {
      console.error('[videoPlaygroundAPI] Error generating video:', error);
      throw error;
    }
  },

  // Poll job status (reuses existing endpoint)
  getJobStatus: async (jobId) => {
    try {
      const response = await api.get(
        `/api/v1/video-chat/video-jobs/${jobId}`,
        { timeout: 10000 }
      );
      return response;
    } catch (error) {
      console.error('[videoPlaygroundAPI] Error getting job status:', error);
      throw error;
    }
  },

  // Get all playground videos for current user
  getAllVideos: async (limit = 100, filter = 'all') => {
    try {
      const response = await api.get(
        '/api/v1/video-playground/videos',
        { 
          params: { limit, filter },
          timeout: 10000 
        }
      );
      return response;
    } catch (error) {
      console.error('[videoPlaygroundAPI] Error getting all videos:', error);
      // Return empty array if endpoint doesn't exist yet
      if (error.response?.status === 404) {
        return { success: true, data: { videos: [] } };
      }
      throw error;
    }
  },

  // Get videos from jobs API (alternative source for completed video jobs)
  getVideosFromJobs: async (limit = 100) => {
    try {
      const response = await api.get(
        '/api/v1/jobs',
        { 
          params: { 
            status: 'completed',
            type: 'video_generation',
            limit 
          },
          timeout: 10000 
        }
      );
      
      // Transform jobs into video format
      if (response.success && response.data?.jobs) {
        const videos = response.data.jobs
          .filter(job => job.result_data?.video_url)
          .map(job => ({
            id: job.job_id,
            job_id: job.job_id,
            video_url: job.result_data.video_url,
            brand_id: job.brand_id,
            product_id: job.product_id,
            status: job.status,
            created_at: job.created_at,
            completed_at: job.completed_at,
          }));
        
        return { success: true, data: { videos } };
      }
      
      return { success: true, data: { videos: [] } };
    } catch (error) {
      console.error('[videoPlaygroundAPI] Error getting videos from jobs:', error);
      return { success: true, data: { videos: [] } };
    }
  },
};

// ============================================
// SHOPIFY API
// ============================================
export const shopifyAPI = {
  // Initiate OAuth
  initiateOAuth: async (shop) => {
    try {
      const response = await api.post('/api/v1/shopify/install', {
        shop: shop
      });
      return response;
    } catch (error) {
      console.error('[shopifyAPI] Error initiating OAuth:', error);
      throw error;
    }
  },

  // Get user's Shopify stores
  getStores: async () => {
    try {
      const response = await api.get('/api/v1/shopify/stores');
      return response;
    } catch (error) {
      console.error('[shopifyAPI] Error getting stores:', error);
      throw error;
    }
  },

  // Get sync status
  getSyncStatus: async (shop) => {
    try {
      const response = await api.get(`/api/v1/shopify/sync-status/${shop}`);
      return response;
    } catch (error) {
      console.error('[shopifyAPI] Error getting sync status:', error);
      throw error;
    }
  },

  // Setup brand
  setupBrand: async (shop, brandName, primaryColor, secondaryColor, logoFile) => {
    try {
      const formData = new FormData();
      formData.append('shop', shop);
      formData.append('brand_name', brandName);
      formData.append('primary_color', primaryColor);
      formData.append('secondary_color', secondaryColor);
      formData.append('logo', logoFile);

      const response = await apiFormData.post('/api/v1/shopify/setup-brand', formData, {
        timeout: 30000
      });
      return response;
    } catch (error) {
      console.error('[shopifyAPI] Error setting up brand:', error);
      throw error;
    }
  },

  // Sync products
  syncProducts: async (shop) => {
    try {
      const formData = new FormData();
      formData.append('shop', shop);

      const response = await apiFormData.post('/api/v1/shopify/sync-products', formData, {
        timeout: 120000 // 2 minutes for large stores
      });
      return response;
    } catch (error) {
      console.error('[shopifyAPI] Error syncing products:', error);
      throw error;
    }
  },
};

export default api;