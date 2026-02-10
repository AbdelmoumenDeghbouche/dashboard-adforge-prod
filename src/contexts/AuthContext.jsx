import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../services/apiService';

const AuthContext = createContext({});

// Custom hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in - verify token with backend
        setIsVerifying(true);
        
        let verificationSuccess = false;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (!verificationSuccess && retryCount <= maxRetries) {
          try {
            // Force refresh token on retry attempts
            const forceRefresh = retryCount > 0;
            const idToken = await user.getIdToken(forceRefresh);
            
            console.log(`[AuthContext] Verifying token (attempt ${retryCount + 1}/${maxRetries + 1})${forceRefresh ? ' with refresh' : ''}`);
            
            await authAPI.verifyToken(idToken);
            
            // Verification successful
            console.log('[AuthContext] Token verified successfully');
            setCurrentUser(user);
            setError(null);
            verificationSuccess = true;
            
          } catch (error) {
            console.error(`[AuthContext] Token verification failed (attempt ${retryCount + 1}):`, error);
            
            retryCount++;
            
            if (retryCount > maxRetries) {
              // All retries exhausted - clear auth state and sign out
              console.error('[AuthContext] All token verification attempts failed, signing out');
              
              try {
                // Clear browser storage
                localStorage.clear();
                sessionStorage.clear();
                
                // Sign out from Firebase
                await signOut(auth);
                
                setCurrentUser(null);
                setError('Session expirée. Veuillez vous reconnecter.');
              } catch (signOutError) {
                console.error('[AuthContext] Error during sign out:', signOutError);
                setCurrentUser(null);
                setError('Erreur de déconnexion. Veuillez rafraîchir la page.');
              }
            } else {
              // Wait before retry (exponential backoff)
              const waitTime = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s
              console.log(`[AuthContext] Retrying in ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }
        }
        
        setIsVerifying(false);
        setLoading(false);
      } else {
        // User is signed out
        console.log('[AuthContext] User signed out');
        setCurrentUser(null);
        setError(null);
        setIsVerifying(false);
        setLoading(false);
      }
    }, (error) => {
      console.error('[AuthContext] Auth state change error:', error);
      setError(error.message);
      setLoading(false);
      setIsVerifying(false);
    });

    return unsubscribe;
  }, []);

  const setPersistenceType = async (rememberMe) => {
    try {
      const persistenceType = rememberMe 
        ? browserLocalPersistence 
        : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
    } catch (error) {
      console.error('Error setting persistence:', error);
      throw error;
    }
  };

  // Manual logout function with proper cleanup
  const logout = async () => {
    try {
      console.log('[AuthContext] Manual logout initiated');
      
      // Clear all browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Firebase
      await signOut(auth);
      
      console.log('[AuthContext] Logout successful');
      setCurrentUser(null);
      setError(null);
      
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      setError('Erreur lors de la déconnexion');
      return { success: false, error: error.message };
    }
  };

  // Manual token refresh function
  const refreshAuthToken = async () => {
    if (!currentUser) {
      console.warn('[AuthContext] Cannot refresh token - no user logged in');
      return { success: false, error: 'No user logged in' };
    }

    try {
      console.log('[AuthContext] Manually refreshing token');
      const idToken = await currentUser.getIdToken(true); // Force refresh
      await authAPI.verifyToken(idToken);
      
      console.log('[AuthContext] Token refresh successful');
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Token refresh failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    loading: loading || isVerifying,
    error,
    setError,
    setPersistenceType,
    logout,
    refreshAuthToken,
    isAuthenticated: !!currentUser && !isVerifying
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && !isVerifying && children}
    </AuthContext.Provider>
  );
};

