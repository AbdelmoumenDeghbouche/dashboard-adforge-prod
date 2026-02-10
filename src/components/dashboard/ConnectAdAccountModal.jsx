import React, { useState } from 'react';
import { platforms } from '../../utils/mockAdAccounts';
import { socialAuthAPI } from '../../services/apiService';

/**
 * ConnectAdAccountModal Component
 * Modal for connecting ad accounts via OAuth
 * Steps: 1) Platform selection, 2) OAuth connection (redirect to provider)
 */
const ConnectAdAccountModal = ({ isOpen, onClose, onConnect }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  if (!isOpen) return null;

  // Reset modal state when closed
  const handleClose = () => {
    setCurrentStep(1);
    setSelectedPlatform(null);
    onClose();
  };

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setError(null);
    setCurrentStep(2);
  };

  // Handle OAuth connection (real implementation)
  const handleOAuthConnect = async () => {
    try {
      console.log(`🔗 Initiating OAuth flow for ${selectedPlatform.name}...`);

      // Get current window origin for redirect URI
      const redirectUri = `${window.location.origin}/oauth/callback/${selectedPlatform.id}`;
      console.log('Redirect URI:', redirectUri);

      let response;
      if (selectedPlatform.id === 'meta') {
        response = await socialAuthAPI.initMetaOAuth(redirectUri);
      } else if (selectedPlatform.id === 'tiktok') {
        response = await socialAuthAPI.initTikTokOAuth(redirectUri);
      }

      console.log('[OAuth] Authorize response:', response);
      console.log('[OAuth] State generated:', response?.state);

      // Backend returns: { success: true, oauth_url: "...", state: "...", data: {...} }
      const authUrl = response?.oauth_url;

      if (authUrl) {
        console.log('[OAuth] Redirecting to:', authUrl);
        // Redirect to OAuth provider
        window.location.href = authUrl;
      } else {
        console.error('[OAuth] Full response structure:', JSON.stringify(response, null, 2));
        throw new Error('URL d\'autorisation manquante dans la réponse');
      }
    } catch (error) {
      console.error('OAuth initiation error:', error);
      alert(error.message || `Erreur lors de la connexion à ${selectedPlatform.name}`);
    }
  };


  // Platform icons as SVG
  const MetaIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const TikTokIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PlatformSelection onSelect={handlePlatformSelect} />;
      case 2:
        return <Step2OAuthConnection platform={selectedPlatform} onConnect={handleOAuthConnect} onBack={() => setCurrentStep(1)} />;
      default:
        return null;
    }
  };

  // Step 1: Platform Selection
  const Step1PlatformSelection = ({ onSelect }) => (
    <div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Choisissez une plateforme
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Sélectionnez la plateforme publicitaire que vous souhaitez connecter
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onSelect(platform)}
            className="group relative bg-[#0F0F0F] hover:bg-[#1A1A1A] border-2 border-[#262626] hover:border-[#8B5CF6] rounded-xl p-6 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Icon */}
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                platform.id === 'meta'
                  ? 'bg-[#1877F2] text-white group-hover:shadow-lg group-hover:shadow-blue-500/30'
                  : 'bg-black border-2 border-[#00F2EA] text-[#00F2EA] group-hover:shadow-lg group-hover:shadow-cyan-500/30'
              }`}
            >
              {platform.id === 'meta' ? <MetaIcon /> : <TikTokIcon />}
            </div>

            {/* Name */}
            <h4 className="text-white text-lg font-semibold mb-1">
              {platform.fullName}
            </h4>

            {/* Description */}
            <p className="text-gray-400 text-sm">{platform.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: OAuth Connection
  const Step2OAuthConnection = ({ platform, onConnect, onBack }) => (
    <div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Connexion à {platform.name}
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Vous allez être redirigé vers {platform.fullName} pour autoriser l'accès
      </p>

      {/* Platform Info Card */}
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              platform.id === 'meta'
                ? 'bg-[#1877F2] text-white'
                : 'bg-black border-2 border-[#00F2EA] text-[#00F2EA]'
            }`}
          >
            {platform.id === 'meta' ? <MetaIcon /> : <TikTokIcon />}
          </div>
          <div>
            <h4 className="text-white font-semibold">{platform.fullName}</h4>
            <p className="text-gray-400 text-sm">{platform.description}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-gray-300">
            <svg className="w-5 h-5 text-[#23DC00] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Accès aux comptes publicitaires</span>
          </div>
          <div className="flex items-start gap-2 text-gray-300">
            <svg className="w-5 h-5 text-[#23DC00] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Lecture des campagnes et statistiques</span>
          </div>
          <div className="flex items-start gap-2 text-gray-300">
            <svg className="w-5 h-5 text-[#23DC00] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Création et modification de publicités</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-400 text-sm font-medium">Erreur de connexion</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connect Button */}
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full px-6 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/30 mb-3 flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connexion en cours...
          </>
        ) : (
          `Connecter avec ${platform.name}`
        )}
      </button>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full px-6 py-3 bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] text-gray-300 rounded-xl font-medium transition-all"
      >
        Retour
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0F0F0F] rounded-2xl border border-[#262626] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Connecter un compte publicitaire
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Étape {currentStep} sur 2
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-[#1A1A1A]">
          <div
            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#23DC00] transition-all duration-300"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ConnectAdAccountModal;
