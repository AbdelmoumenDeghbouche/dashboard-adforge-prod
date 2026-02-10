import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdAccountCard from '../components/dashboard/AdAccountCard';
import ConnectAdAccountModal from '../components/dashboard/ConnectAdAccountModal';
import { socialAuthAPI } from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdAccounts = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch connected accounts on mount and after OAuth success
  useEffect(() => {
    fetchConnectedAccounts();

    // Check if we're returning from OAuth success
    if (location.state?.oauthSuccess) {
      setSuccessMessage(`Compte ${location.state.platform} connecté avec succès!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const fetchConnectedAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[AdAccounts] Fetching connected accounts...');
      const response = await socialAuthAPI.getConnectedAccounts();

      if (response?.success && response?.data?.accounts) {
        // Transform backend data to match frontend format
        const transformedAccounts = await transformAccounts(response.data.accounts);
        setAccounts(transformedAccounts);
        console.log('[AdAccounts] Loaded accounts:', transformedAccounts);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.error('[AdAccounts] Error fetching accounts:', err);
      setError(err.message || 'Erreur lors du chargement des comptes');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const transformAccounts = async (backendAccounts) => {
    const transformed = [];

    for (const account of backendAccounts) {
      try {
        // Fetch ad accounts for each connected social account
        const adAccountsResponse = await socialAuthAPI.getAdAccounts(account.id);

        if (adAccountsResponse?.success && adAccountsResponse?.data?.ad_accounts) {
          // Transform each ad account
          adAccountsResponse.data.ad_accounts.forEach(adAccount => {
            transformed.push({
              id: adAccount.id,
              platform: account.platform,
              accountName: adAccount.name,
              accountTitle: `Ad Account ${adAccount.id}`,
              avatarUrl: generateAvatarUrl(adAccount.name, account.platform),
              status: adAccount.account_status === 'ACTIVE' ? 'active' : 'inactive',
              connectedAt: account.connected_at,
              socialAccountId: account.id,
            });
          });
        }
      } catch (err) {
        console.error(`[AdAccounts] Error fetching ad accounts for ${account.id}:`, err);
      }
    }

    return transformed;
  };

  const generateAvatarUrl = (name, platform) => {
    const bgColor = platform === 'meta' ? '1877f2' : '000000';
    const fgColor = platform === 'meta' ? 'fff' : '00f2ea';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=${fgColor}&size=200`;
  };

  const handleConnectAccounts = () => {
    // Modal will handle OAuth flow
    console.log('✅ Initiating OAuth connection...');
  };

  const handleDisconnectAccount = async (socialAccountId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir déconnecter ce compte?')) {
      return;
    }

    try {
      await socialAuthAPI.disconnectAccount(socialAccountId);
      // Refresh accounts list
      await fetchConnectedAccounts();
      setSuccessMessage('Compte déconnecté avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('[AdAccounts] Error disconnecting account:', err);
      alert(err.message || 'Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-[#23DC00]/10 border border-[#23DC00]/30 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-[#23DC00] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[#23DC00] font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Mes Comptes Publicitaires
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Gérez vos comptes publicitaires Meta et TikTok
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#23DC00] hover:bg-[#1FC700] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-green-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Connecter un compte</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-400 text-sm font-medium">Erreur de chargement</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchConnectedAccounts}
                  className="mt-2 text-red-400 underline text-sm hover:text-red-300"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-400">Chargement des comptes...</p>
          </div>
        ) : (
          <>
            {accounts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Comptes</p>
                  <p className="text-white text-2xl font-bold">{accounts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Comptes Meta</p>
                  <p className="text-white text-2xl font-bold">
                    {accounts.filter(acc => acc.platform === 'meta').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#262626]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-black border-2 border-[#00F2EA] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#00F2EA]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Comptes TikTok</p>
                  <p className="text-white text-2xl font-bold">
                    {accounts.filter(acc => acc.platform === 'tiktok').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {accounts.length > 0 ? (
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">
              Comptes Connectés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                  className="relative"
                >
                  <AdAccountCard account={account} />
                  {/* Disconnect Button */}
                  <button
                    onClick={() => handleDisconnectAccount(account.socialAccountId)}
                    className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                    title="Déconnecter"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 animate-fade-in">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#1A1A1A] border-2 border-[#262626] flex items-center justify-center mb-6">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-semibold mb-2">
              Aucun compte publicitaire
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6 text-center max-w-md">
              Connectez votre premier compte publicitaire Meta ou TikTok pour commencer à gérer vos campagnes
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Connecter mon premier compte</span>
            </button>
          </div>
        )}

        <ConnectAdAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConnect={handleConnectAccounts}
        />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdAccounts;
