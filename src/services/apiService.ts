import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { auth } from '../config/firebase';

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase ID token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting ID token:', error);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized globally if needed (e.g., force logout)
    if (error.response && error.response.status === 401) {
      // Logic to handle token expiration/invalidity could go here
      // But AuthContext mostly handles this via onAuthStateChanged
    }
    return Promise.reject(error);
  }
);

// Auth API Endpoints
export const authAPI = {
  // 1. Sign Up (Backend-driven, though normally we use Firebase client + verifyToken)
  signup: async (email: string, password: string, displayName: string) => {
    return api.post('/api/v1/auth/signup', { email, password, display_name: displayName });
  },

  // 2. Verify Token (Critical link between Firebase and Backend)
  verifyToken: async (idToken: string) => {
    return api.post('/api/v1/auth/verify-token', { id_token: idToken });
  },

  // 3. Get Current User
  getCurrentUser: async () => {
    return api.get('/api/v1/auth/me');
  },

  // 4. Update Profile
  updateProfile: async (data: { display_name?: string; photo_url?: string }) => {
    return api.patch('/api/v1/auth/me', data);
  },

  // 5. Delete Account
  deleteAccount: async () => {
    return api.delete('/api/v1/auth/me');
  },

  // 6. Logout (Backend cleanup)
  logout: async () => {
    return api.post('/api/v1/auth/logout');
  },

  // 7. Resend Verification Email
  resendVerification: async (email: string) => {
    return api.post('/api/v1/auth/resend-verification', { email });
  }
};

export default api;

