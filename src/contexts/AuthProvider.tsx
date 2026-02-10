import { useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User,
  Persistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../services/apiService';
import { AuthContext, AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          await authAPI.verifyToken(token);
          setCurrentUser(user);
          setError(null);
        } catch (err) {
          console.error('[Auth] Token error:', err);
          setError('فشل التحقق من الجلسة');
          setCurrentUser(null);
          await firebaseSignOut(auth);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await authAPI.logout();
      await firebaseSignOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      setCurrentUser(null);
      setError(null);
      return { success: true };
    } catch (err) {
      const errorObject = err as { message?: string };
      console.error('[Auth] Logout error:', err);
      setError('فشل تسجيل الخروج');
      return { success: false, error: errorObject.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Verify token with backend
      const token = await user.getIdToken();
      await authAPI.verifyToken(token);
      
      setCurrentUser(user);
      setError(null);
      return { success: true };
    } catch (err) {
      const errorObject = err as { message?: string };
      console.error('[Auth] Google login error:', err);
      setError('فشل تسجيل الدخول باستخدام Google');
      return { success: false, error: errorObject.message };
    } finally {
      setLoading(false);
    }
  };

  const setPersistenceType = async (rememberMe: boolean) => {
    try {
      const persistenceType: Persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
    } catch (err) {
       console.error('[Auth] Persistence error:', err);
       throw err;
    }
  };

  const refreshAuthToken = async () => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const token = await currentUser.getIdToken(true);
      return { success: true, token };
    } catch (err) {
      const errorObject = err as { message?: string };
      console.error('[Auth] Token refresh error:', err);
      return { success: false, error: errorObject.message };
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    error,
    setError,
    logout,
    setPersistenceType,
    refreshAuthToken,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
