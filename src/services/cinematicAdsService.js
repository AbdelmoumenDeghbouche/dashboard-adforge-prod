import api from './apiService';

/**
 * Cinematic Ads API Service
 * Simple one-step video generation for product showcases
 */

/**
 * Generate a complete cinematic ad from product info
 * @param {Object} params - Generation parameters
 * @param {string} params.product_name - Product name (required)
 * @param {string} params.product_description - Product description (required)
 * @param {string} params.product_image_url - Product image URL (optional, recommended)
 * @param {string} params.brand_name - Brand name (optional)
 * @param {string} params.brand_logo_url - Brand logo URL (optional)
 * @param {number} params.target_duration - Video duration in seconds (10-15, default: 15)
 * @param {string[]} params.style_modifiers - Style modifiers array (optional)
 * @param {boolean} params.prefer_kie - Use KIE Sora 2 Pro (default: true)
 * @returns {Promise<Object>} Generation response with task_id
 */
export const generateCinematicAd = async ({
  product_name,
  product_description,
  product_image_url = null,
  brand_name = null,
  brand_logo_url = null,
  target_duration = 15,
  style_modifiers = [],
  prefer_kie = true
}) => {
  try {
    console.log('[CinematicAds] 🎬 Generating cinematic ad:', {
      product_name,
      target_duration,
      style_modifiers,
      has_image: !!product_image_url,
      has_logo: !!brand_logo_url
    });

    const payload = {
      product_name,
      product_description,
      target_duration,
      prefer_kie
    };

    // Add optional fields only if provided
    if (product_image_url) payload.product_image_url = product_image_url;
    if (brand_name) payload.brand_name = brand_name;
    if (brand_logo_url) payload.brand_logo_url = brand_logo_url;
    if (style_modifiers && style_modifiers.length > 0) {
      payload.style_modifiers = style_modifiers;
    }

    const response = await api.post('/api/v1/cinematic-ads/generate-complete', payload, {
      timeout: 120000, // 2 minutes
    });

    console.log('[CinematicAds] ✅ Generation started - FULL RESPONSE:', JSON.stringify(response, null, 2));
    console.log('[CinematicAds] Response keys:', Object.keys(response));
    console.log('[CinematicAds] task_id:', response.task_id);
    console.log('[CinematicAds] job_id:', response.job_id);
    console.log('[CinematicAds] data:', response.data);
    return response;
  } catch (error) {
    console.error('[CinematicAds] ❌ Error generating cinematic ad:', error);
    throw error;
  }
};

/**
 * Get job status for cinematic video generation
 * Uses the centralized jobs endpoint (consistent with rest of app)
 * @param {string} jobId - Job ID (returned as task_id from generate-complete)
 * @returns {Promise<Object>} Job status with video URL when complete
 */
export const getTaskStatus = async (jobId) => {
  try {
    console.log('[CinematicAds] 📊 Checking job status:', jobId);
    
    // Use the centralized jobs endpoint (same as strategic analysis, ads, etc.)
    const response = await api.get(`/api/v1/jobs/${jobId}`, {
      timeout: 30000, // 30 seconds
    });

    console.log('[CinematicAds] 📊 Job status:', response.data?.status);
    
    // The response structure from /api/v1/jobs/{jobId}:
    // { success: true, data: { job_id, status, result_data: { video_url } } }
    return response.data || response;
  } catch (error) {
    console.error('[CinematicAds] ❌ Error checking job status:', error);
    throw error;
  }
};

/**
 * Style modifier options for cinematic ads
 */
export const STYLE_MODIFIERS = {
  MINIMAL: '--minimal',
  LUXURY: '--luxury',
  HYPERCUT: '--hypercut',
  DRAMATIC: '--dramatic',
  SLOWMO: '--slowmo',
  NATURAL: '--natural',
  MACRO: '--macro'
};

/**
 * Style modifier display names and descriptions
 */
export const STYLE_MODIFIER_INFO = {
  '--minimal': {
    name: 'Minimal',
    description: 'Fewer shots, more breathing room',
    icon: '▪️'
  },
  '--luxury': {
    name: 'Luxury',
    description: 'Premium feel, high-end aesthetic',
    icon: '💎'
  },
  '--hypercut': {
    name: 'Hypercut',
    description: 'Fast-paced MTV-style editing',
    icon: '⚡'
  },
  '--dramatic': {
    name: 'Dramatic',
    description: 'High contrast lighting, intense mood',
    icon: '🎭'
  },
  '--slowmo': {
    name: 'Slow Motion',
    description: 'Prioritize slow-motion shots',
    icon: '🐌'
  },
  '--natural': {
    name: 'Natural',
    description: 'Lifestyle setting, organic feel',
    icon: '🌿'
  },
  '--macro': {
    name: 'Macro',
    description: 'Extreme close-ups, product details',
    icon: '🔍'
  }
};

export default {
  generateCinematicAd,
  getTaskStatus,
  STYLE_MODIFIERS,
  STYLE_MODIFIER_INFO
};

