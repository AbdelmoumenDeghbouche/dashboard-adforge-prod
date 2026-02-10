import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerWithEmail, loginWithGoogle, loginWithApple } from '../services/authService';
import signupBanner from '../assets/signup_banner.svg';
import adForgeLogo from '../assets/ad_forge.svg';
import googleIcon from '../assets/google_icon.svg';
import appleIcon from '../assets/apple_icon.svg';
import emailIcon from '../assets/email_icon.svg';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { currentUser, setPersistenceType } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/accueil', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await setPersistenceType(true); // Remember user by default for registration
      const result = await loginWithGoogle();
      if (result.success) {
        navigate('/accueil', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Une erreur est survenue lors de l\'inscription avec Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await setPersistenceType(true); // Remember user by default for registration
      const result = await loginWithApple();
      if (result.success) {
        navigate('/accueil', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Une erreur est survenue lors de l\'inscription avec Apple.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = (e) => {
    e.preventDefault();
    setError('');
    
    if (!showPasswordFields) {
      // Show password fields
      setShowPasswordFields(true);
    } else {
      // Validate and register
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      
      handleRegistration();
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    try {
      await setPersistenceType(true); // Remember user by default for registration
      const result = await registerWithEmail(email, password, displayName);
      if (result.success) {
        navigate('/accueil', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#000000E9' }}>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 animate-fadeIn">
        <div className="w-full h-full flex items-center justify-center bg-black rounded-3xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
          <img 
            src={signupBanner} 
            alt="Signup Banner" 
            className="w-5/6 h-5/6 object-contain animate-float"
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl px-4 sm:px-6 md:px-8 animate-fadeIn">
          <div className="flex justify-center mb-8 sm:mb-12 md:mb-20 mt-8 sm:mt-12 md:mt-16 animate-slideDown">
            <img src={adForgeLogo} alt="AD Forge" className="h-12 sm:h-16 md:h-20 transition-all duration-300" />
          </div>
          <div className="mb-6 sm:mb-8 text-center animate-slideUp">
            <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-6 transition-all duration-300">
              Bienvenue sur AD Forge
            </h1>
            <p className="text-[#757575] justify-center leading-relaxed px-2 sm:px-4 text-xs sm:text-sm md:text-base">
              Avec AG Forge, transformez vos produits en pubs vidéo prêtes à scaler.
              Notre IA crée plusieurs variantes, les teste et sélectionne les plus performantes automatiquement.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500 rounded-lg animate-shake mx-2 sm:mx-0">
              <p className="text-red-500 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 mx-2 sm:mx-0 animate-slideUp">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white text-black py-3 sm:py-3.5 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
            >
              <img src={googleIcon} alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Continuer avec Google</span>
              <span className="xs:hidden">Google</span>
            </button>

            <button
              onClick={handleAppleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white text-black py-3 sm:py-3.5 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
            >
              <img src={appleIcon} alt="Apple" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Continuer avec Apple</span>
              <span className="xs:hidden">Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 mx-2 sm:mx-0 animate-fadeIn">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-[#757575] text-xs sm:text-sm">Ou</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-3 sm:space-y-4 mx-2 sm:mx-0 animate-slideUp">
            <div className="relative group">
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110">
                <img src={emailIcon} alt="Email" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="email"
                placeholder="Nom@Domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-black placeholder:text-gray-400 text-sm sm:text-base transition-all duration-300 hover:border-gray-400"
                required
                disabled={loading}
              />
            </div>

            {showPasswordFields && (
              <div className="space-y-3 sm:space-y-4 animate-slideDown">
                <div className="relative group">
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom complet (optionnel)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-black placeholder:text-gray-400 text-sm sm:text-base transition-all duration-300 hover:border-gray-400"
                    disabled={loading}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-black placeholder:text-gray-400 text-sm sm:text-base transition-all duration-300 hover:border-gray-400"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-black placeholder:text-gray-400 text-sm sm:text-base transition-all duration-300 hover:border-gray-400"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366F1] text-white py-3 sm:py-3.5 px-4 rounded-lg font-medium hover:bg-[#5558E3] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Inscription...' : (showPasswordFields ? 'S\'inscrire' : 'Continuer avec l\'adresse email')}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center mx-2 sm:mx-0 animate-fadeIn">
            <span className="text-[#757575] text-xs sm:text-sm">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-[#6366F1] hover:text-[#5558E3] hover:underline transition-colors duration-300">
                Connectez vous
              </Link>
            </span>
          </div>

          <div className="mt-12 sm:mt-24 md:mt-36 mb-6 sm:mb-0 text-center text-[10px] sm:text-xs text-[#757575] px-2 sm:px-0 animate-fadeIn">
            En vous inscrivant, vous acceptez nos{' '}
            <a href="#" className="underline hover:text-gray-400 transition-colors duration-300">
              Conditions d'utilisation
            </a>{' '}
            &{' '}
            <a href="#" className="underline hover:text-gray-400 transition-colors duration-300">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
