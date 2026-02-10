import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithEmail, loginWithGoogle, loginWithApple } from '../services/authService';
import loginBanner from '../assets/login_banner.svg';
import adForgeLogo from '../assets/ad_forge.svg';
import googleIcon from '../assets/google_icon.svg';
import appleIcon from '../assets/apple_icon.svg';
import emailIcon from '../assets/email_icon.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { currentUser, setPersistenceType, error: authError } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/accueil', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await setPersistenceType(rememberMe);
      const result = await loginWithGoogle();
      if (result.success) {
        navigate('/accueil', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion avec Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await setPersistenceType(rememberMe);
      const result = await loginWithApple();
      if (result.success) {
        navigate('/accueil', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion avec Apple.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await setPersistenceType(rememberMe);
      const result = await loginWithEmail(email, password);
      if (result.success) {
        navigate('/accueil', { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#000000E9' }}>
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl px-8">
          <div className="flex justify-center mb-20 mt-16">
            <img src={adForgeLogo} alt="AD Forge" className="h-20" />
          </div>
          <div className="mb-8">
            <h1 className="text-white text-5xl font-semibold mb-6">
              Bon retour !
            </h1>
          </div>

          {(error || authError) && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">{error || authError}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <img src={emailIcon} alt="Email" className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="Nom@Domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-black placeholder:text-gray-400"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-black placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-[#757575] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 accent-[#6366F1]"
                />
                Se souvenir de moi
              </label>
              <Link to="/forgot-password" className="text-[#757575] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366F1] text-white py-3.5 px-4 rounded-lg font-medium hover:bg-[#5558E3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-[#757575] text-sm">Ou</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Continuer avec Google
            </button>

            <button
              onClick={handleAppleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src={appleIcon} alt="Apple" className="w-5 h-5" />
              Continuer avec Apple
            </button>
          </div>

          <div className="text-center">
            <span className="text-[#757575] text-sm">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-[#6366F1] hover:underline">
                Inscrivez vous
              </Link>
            </span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 animate-fadeIn">
        <div className="w-full h-full flex items-center justify-center bg-black rounded-3xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
          <img 
            src={loginBanner} 
            alt="Login Banner" 
            className="w-5/6 h-5/6 object-contain animate-float"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
