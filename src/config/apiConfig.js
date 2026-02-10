// API Configuration and validation

/**
 * Validates that required environment variables are set
 */
export const validateConfig = () => {
  const requiredVars = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  };

  const missing = [];
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: 'Configuration error: Missing required environment variables',
      missing
    };
  }

  return {
    valid: true,
    error: null,
    missing: []
  };
};

/**
 * API Configuration
 */
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 10 seconds
  validateStatus: (status) => {
    // Consider 2xx and 401 as valid responses (401 will be handled separately)
    return (status >= 200 && status < 300) || status === 401;
  }
};

/**
 * API Base URL (for direct fetch calls)
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

/**
 * Check if backend is reachable
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

