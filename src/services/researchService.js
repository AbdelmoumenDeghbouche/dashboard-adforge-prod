import axios from 'axios';
import { auth } from '../config/firebase';

// Validate API configuration on load
const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  throw new Error('Configuration error: Backend URL is not set');
}

// Create axios instance for research API
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
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
        console.error('[researchService] Token retrieval failed:', error);
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
      console.error('[researchService] Server error:', {
        status: error.response.status,
        data: error.response.data,
      });
      
      const message = 
        error.response.data?.message || 
        error.response.data?.detail || 
        'Une erreur est survenue lors de la recherche';
      
      const customError = new Error(message);
      customError.response = error.response;
      return Promise.reject(customError);
    } else if (error.request) {
      return Promise.reject(new Error('Le serveur est temporairement indisponible. Veuillez réessayer.'));
    } else {
      return Promise.reject(new Error('Une erreur est survenue. Veuillez réessayer.'));
    }
  }
);

/**
 * Research API Service
 * Handles product research operations for strategic analysis
 */
export const researchAPI = {
  /**
   * Get research record details (for polling status)
   * GET /api/v1/research/products/{brandId}/{productId}/research/{researchId}
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} researchId - Research ID
   * @returns {Promise<{research_id: string, status: string, product_name: string, ...}>}
   */
  getResearchDetails: async (brandId, productId, researchId) => {
    try {
      console.log('[researchAPI] Fetching research details:', { brandId, productId, researchId });
      
      const response = await api.get(
        `/api/v1/research/products/${brandId}/${productId}/research/${researchId}`,
        { timeout: 300000 } // 5 minutes for research details
      );
      
      console.log('[researchAPI] Research details received:', response);
      return response;
    } catch (error) {
      console.error('[researchAPI] Error fetching research details:', error);
      throw error;
    }
  },

  /**
   * Get research summary (for first chat message)
   * GET /api/v1/research/products/{brandId}/{productId}/research/{researchId}/summary
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @param {string} researchId - Research ID
   * @returns {Promise<{research_id: string, product_name: string, summary: {...}}>}
   */
  getResearchSummary: async (brandId, productId, researchId) => {
    try {
      console.log('[researchAPI] Fetching research summary:', { brandId, productId, researchId });
      
      const response = await api.get(
        `/api/v1/research/products/${brandId}/${productId}/research/${researchId}/summary`,
        { timeout: 300000 } // 5 minutes for research summary
      );
      
      console.log('[researchAPI] Research summary received');
      return response;
    } catch (error) {
      console.error('[researchAPI] Error fetching research summary:', error);
      throw error;
    }
  },

  /**
   * Manually trigger research (if needed)
   * POST /api/v1/research/products/{brandId}/{productId}/research/trigger
   * 
   * @param {string} brandId - Brand ID
   * @param {string} productId - Product ID
   * @returns {Promise<{research_id: string, status: string}>}
   */
  triggerResearch: async (brandId, productId) => {
    try {
      console.log('[researchAPI] Triggering research for product:', { brandId, productId });
      
      const response = await api.post(
        `/api/v1/research/products/${brandId}/${productId}/research/trigger`,
        {},
        { timeout: 30000 }
      );
      
      console.log('[researchAPI] Research triggered:', response);
      return response;
    } catch (error) {
      console.error('[researchAPI] Error triggering research:', error);
      throw error;
    }
  },

  /**
   * Get products with research status
   * GET /api/v1/brands/{brandId}/products?include_research_status=true
   * 
   * @param {string} brandId - Brand ID
   * @returns {Promise<{products: Array, count: number}>}
   */
  getProductsWithResearch: async (brandId) => {
    try {
      console.log('[researchAPI] Fetching products with research status for brand:', brandId);
      
      const response = await api.get(
        `/api/v1/brands/${brandId}/products`,
        { 
          params: { include_research_status: true },
          timeout: 15000 
        }
      );
      
      console.log('[researchAPI] Products with research status received:', response);
      return response;
    } catch (error) {
      console.error('[researchAPI] Error fetching products with research:', error);
      // Return empty array if endpoint fails
      if (error.response?.status === 404) {
        return { success: true, data: { products: [], count: 0 } };
      }
      throw error;
    }
  },
};

export default researchAPI;

