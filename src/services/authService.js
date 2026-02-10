import { 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from './apiService';

// Email/Password Authentication
export const registerWithEmail = async (email, password, displayName = null) => {
  try {
    // Create user via backend
    await authAPI.signup(email, password, displayName);
    
    // Now login with Firebase to get authenticated
    // Note: Token verification will be handled automatically by AuthContext
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    // If error has a message property, use it (from our custom errors)
    if (error.message && !error.code) {
      return { success: false, error: error.message };
    }
    return { success: false, error: getErrorMessage(error.code) };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Note: Token verification will be handled automatically by AuthContext
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    // If error has a message property, use it (from our custom errors)
    if (error.message && !error.code) {
      return { success: false, error: error.message };
    }
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Google Authentication
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Add required scopes
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    // Note: Token verification will be handled automatically by AuthContext
    
    return { success: true, user: result.user };
  } catch (error) {
    // If error has a message property, use it (from our custom errors)
    if (error.message && !error.code) {
      return { success: false, error: error.message };
    }
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Apple Authentication
export const loginWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    
    // Set language
    provider.setCustomParameters({
      locale: 'fr'
    });
    
    const result = await signInWithPopup(auth, provider);
    // Note: Token verification will be handled automatically by AuthContext
    
    return { success: true, user: result.user };
  } catch (error) {
    // If error has a message property, use it (from our custom errors)
    if (error.message && !error.code) {
      return { success: false, error: error.message };
    }
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Sign Out
export const logout = async () => {
  try {
    // Revoke refresh tokens on backend
    try {
      await authAPI.logout();
    } catch {
      // Continue with logout even if backend fails
    }
    
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  try {
    await authAPI.resendVerification(email);
    return { success: true };
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de l\'envoi de l\'email de vérification.' };
  }
};

// Error message helper
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/invalid-email': 'L\'adresse email est invalide.',
    'auth/user-disabled': 'Ce compte a été désactivé.',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre réseau.',
    'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée.',
    'auth/cancelled-popup-request': 'Demande d\'authentification annulée.',
    'auth/invalid-credential': 'Les identifiants sont invalides.',
    'auth/popup-blocked': 'La fenêtre popup a été bloquée par le navigateur.',
    'auth/unauthorized-domain': 'Ce domaine n\'est pas autorisé pour l\'authentification.',
    'auth/operation-not-allowed': 'Cette méthode d\'authentification n\'est pas activée.',
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec un autre mode de connexion.',
  };
  
  return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
};

