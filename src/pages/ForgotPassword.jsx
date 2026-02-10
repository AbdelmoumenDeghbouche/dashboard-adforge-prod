import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import adForgeLogo from '../assets/ad_forge.svg';
import emailIcon from '../assets/email_icon.svg';
import loginBanner from '../assets/login_banner.svg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const result = await resetPassword(email);
    
    if (result.success) {
      setSuccess(true);
      setEmail('');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#000000E9' }}>
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-md px-4 sm:px-6 md:px-8 animate-fadeIn">
          <div className="flex justify-center mb-8 sm:mb-12 animate-slideDown">
            <img src={adForgeLogo} alt="AD Forge" className="h-12 sm:h-16 md:h-20 transition-all duration-300" />
          </div>

          <div className="mb-6 sm:mb-8 animate-slideUp">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-3 transition-all duration-300">
              Mot de passe oublié ?
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500 rounded-lg animate-shake">
              <p className="text-red-500 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 sm:p-4 bg-green-500/10 border border-green-500 rounded-lg animate-slideDown">
              <p className="text-green-500 text-xs sm:text-sm">
                Un email de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte de réception.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 animate-slideUp">
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
                disabled={loading || success}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#6366F1] text-white py-3 sm:py-3.5 px-4 rounded-lg font-medium hover:bg-[#5558E3] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center animate-fadeIn">
            <Link to="/login" className="text-[#6366F1] text-xs sm:text-sm hover:text-[#5558E3] hover:underline flex items-center justify-center gap-2 transition-all duration-300 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Retour à la connexion
            </Link>
          </div>

          <div className="mt-6 sm:mt-8 mb-6 sm:mb-0 text-center animate-fadeIn">
            <span className="text-[#757575] text-xs sm:text-sm">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-[#6366F1] hover:text-[#5558E3] hover:underline transition-colors duration-300">
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
            alt="Reset Password Banner" 
            className="w-5/6 h-5/6 object-contain animate-float"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
