import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  logout: () => Promise<{ success: boolean; error?: string }>;
  setPersistenceType: (rememberMe: boolean) => Promise<void>;
  refreshAuthToken: () => Promise<{ success: boolean; token?: string; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
