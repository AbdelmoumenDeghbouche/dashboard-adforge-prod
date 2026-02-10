import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { auth } from '../config/firebase';

/**
 * OAuthCallback Component
 * Handles OAuth callbacks for both Meta and TikTok
 * Routes: /oauth/callback/meta and /oauth/callback/tiktok
 */
const OAuthCallback = ({ platform }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connexion en cours...');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (!isProcessing) {
      setIsProcessing(true);
      handleOAuthCallback();
    }
  }, []);

  const handleOAuthCallback = async () => {
    try {
      console.log(`[OAuth ${platform}] Starting callback handler`);

      // Get query parameters
      const code = searchParams.get('code') || searchParams.get('auth_code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description') || searchParams.get('error_reason');

      console.log(`[OAuth ${platform}] Parameters:`, { code: code?.substring(0, 20) + '...', state, error });

      // Check for errors from OAuth provider
      if (error) {
        console.error(`[OAuth ${platform}] Error from provider:`, error, errorDescription);
        setStatus('error');
        setMessage(errorDescription || `Erreur lors de la connexion à ${platform}`);
        setTimeout(() => navigate('/ad-accounts'), 3000);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        console.error(`[OAuth ${platform}] Missing code or state parameter`);
        setStatus('error');
        setMessage('Paramètres OAuth manquants');
        setTimeout(() => navigate('/ad-accounts'), 3000);
        return;
      }

      // Get Firebase ID token
      const user = auth.currentUser;
      if (!user) {
        console.error('[OAuth] User not authenticated');
        setStatus('error');
        setMessage('Utilisateur non authentifié');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const idToken = await user.getIdToken();
      console.log(`[OAuth ${platform}] Got Firebase token`);
      console.log(`[OAuth ${platform}] User UID:`, user.uid);

      // The backend will handle the callback automatically via GET request
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const callbackUrl = platform === 'meta'
        ? `${baseURL}/api/v1/social-auth/meta/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        : `${baseURL}/api/v1/social-auth/tiktok/callback?auth_code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

      console.log(`[OAuth ${platform}] Calling backend callback:`, callbackUrl);

      // Make request to backend callback endpoint
      const response = await fetch(callbackUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log(`[OAuth ${platform}] Backend response status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        console.error(`[OAuth ${platform}] Backend error:`, errorData);
        throw new Error(errorData.message || errorData.detail || `Erreur lors de la connexion à ${platform}`);
      }

      const data = await response.json();
      console.log(`[OAuth ${platform}] Backend response data:`, data);

      // Check if the response indicates success
      if (data.success === true) {
        console.log(`[OAuth ${platform}] Success:`, data);
        setStatus('success');
        setMessage(`Compte ${platform} connecté avec succès!`);

        // Redirect to ad accounts page after 2 seconds
        setTimeout(() => {
          navigate('/ad-accounts', {
            state: {
              oauthSuccess: true,
              platform,
              accountData: data
            }
          });
        }, 2000);
      } else {
        // Backend returned success: false
        console.error(`[OAuth ${platform}] Backend returned error:`, data);
        throw new Error(data.message || data.error || 'Erreur lors de la connexion');
      }

    } catch (error) {
      console.error(`[OAuth ${platform}] Error:`, error);
      setStatus('error');
      setMessage(error.message || 'Une erreur est survenue lors de la connexion');
      setTimeout(() => navigate('/ad-accounts'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#262626] p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="mb-6">
                <LoadingSpinner />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">
                Connexion en cours
              </h2>
              <p className="text-gray-400">
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-[#23DC00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#23DC00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">
                Connexion réussie!
              </h2>
              <p className="text-gray-400">
                {message}
              </p>
              <p className="text-gray-500 text-sm mt-4">
                Redirection en cours...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">
                Erreur de connexion
              </h2>
              <p className="text-gray-400">
                {message}
              </p>
              <p className="text-gray-500 text-sm mt-4">
                Redirection en cours...
              </p>
            </>
          )}
        </div>

        {/* Platform Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Connexion avec {platform === 'meta' ? 'Meta Business Suite' : 'TikTok Ads Manager'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
