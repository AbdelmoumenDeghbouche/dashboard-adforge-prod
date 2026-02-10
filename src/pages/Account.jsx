import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI, authAPI, creditsAPI } from '../services/apiService';
import { loadStripe } from '@stripe/stripe-js';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ConfirmModal from '../components/common/ConfirmModal';
import AlertModal from '../components/common/AlertModal';

// Initialize Stripe (you'll need to set this in your .env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const Account = () => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);
  const [creditBalance, setCreditBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [userInfo, setUserInfo] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || ''
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subResponse, plansResponse, packagesResponse, balanceResponse] = await Promise.all([
        subscriptionAPI.getSubscription(),
        subscriptionAPI.getPlans(),
        creditsAPI.getPackages(),
        creditsAPI.getBalance()
      ]);

      if (subResponse.success) {
        setSubscription(subResponse.data);
      }

      if (plansResponse.success) {
        setPlans(plansResponse.data.plans);
      }

      if (packagesResponse.success) {
        setCreditPackages(packagesResponse.data.packages);
      }

      if (balanceResponse.success) {
        setCreditBalance(balanceResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    // Determine if this is an upgrade or downgrade
    const planPriority = {
      'free': 0,
      'starter': 1,
      'pro': 2,
      'growth': 3,
      'agency': 4,
      'enterprise': 5
    };

    const currentPriority = planPriority[subscription?.plan || 'free'];
    const targetPriority = planPriority[planId];

    // If downgrading, schedule it for the end of the period
    if (targetPriority < currentPriority) {
      const targetPlanName = planId.charAt(0).toUpperCase() + planId.slice(1);
      const confirmMessage = 
        `✓ Vous conserverez votre plan actuel jusqu'à la fin de votre période de facturation (${formatDate(subscription?.currentPeriodEnd)})\n` +
        `✓ TOUS vos crédits seront préservés\n` +
        `✓ Vous ne serez plus facturé pour votre plan actuel\n` +
        `✓ Après cette date, vous serez sur le plan ${targetPlanName}\n` +
        `✓ Les crédits du plan ${targetPlanName} seront ajoutés à vos crédits existants\n\n` +
        `Voulez-vous programmer cette rétrogradation ?`;

      setConfirmModal({
        isOpen: true,
        title: `Rétrograder vers ${targetPlanName}`,
        message: confirmMessage,
        type: 'warning',
        onConfirm: async () => {
          try {
            const response = await subscriptionAPI.scheduleDowngrade(planId);
            if (response.success) {
              setAlertModal({
                isOpen: true,
                title: 'Rétrogradation programmée',
                message: response.data.message || `Votre plan changera vers ${targetPlanName} le ${formatDate(subscription?.currentPeriodEnd)}`,
                type: 'success'
              });
              await fetchData();
              setShowPricingModal(false);
            }
          } catch (error) {
            console.error('Error scheduling downgrade:', error);
            setAlertModal({
              isOpen: true,
              title: 'Erreur',
              message: error.response?.data?.message || 'Erreur lors de la programmation de la rétrogradation.',
              type: 'error'
            });
          }
        }
      });
      return;
    }

    // If upgrading, proceed with immediate checkout
    setProcessingCheckout(true);
    try {
      const successUrl = `${window.location.origin}/account?checkout=success`;
      const cancelUrl = `${window.location.origin}/account?checkout=cancelled`;

      const response = await subscriptionAPI.createCheckout(planId, successUrl, cancelUrl);

      if (response.success && response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setAlertModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de la création de la session de paiement. Veuillez réessayer.',
        type: 'error'
      });
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const returnUrl = `${window.location.origin}/account`;
      const response = await subscriptionAPI.createBillingPortal(returnUrl);

      if (response.success && response.data.url) {
        // Redirect to Stripe billing portal
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      setAlertModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de l\'ouverture du portail de facturation. Veuillez réessayer.',
        type: 'error'
      });
    }
  };

  const handleScheduleCancellation = async () => {
    const confirmMessage = 
      '✓ Vous conserverez votre plan actuel jusqu\'à la fin de votre période de facturation (' + formatDate(subscription?.currentPeriodEnd) + ')\n' +
      '✓ TOUS vos crédits seront préservés (ils ne seront jamais supprimés)\n' +
      '✓ Vous ne serez pas facturé lors du prochain cycle de facturation\n' +
      '✓ Après cette date, vous serez rétrogradé au plan gratuit mais conserverez tous vos crédits\n\n' +
      'Voulez-vous continuer ?';
    
    setConfirmModal({
      isOpen: true,
      title: 'Rétrograder votre plan',
      message: confirmMessage,
      type: 'warning',
      onConfirm: async () => {
        try {
          const response = await subscriptionAPI.scheduleCancellation();
          if (response.success) {
            setAlertModal({
              isOpen: true,
              title: 'Rétrogradation programmée',
              message: 'Vous conservez votre plan actuel et tous vos crédits jusqu\'au ' + formatDate(subscription?.currentPeriodEnd),
              type: 'success'
            });
            await fetchData(); // Refresh subscription data
          }
        } catch (error) {
          console.error('Error scheduling cancellation:', error);
          setAlertModal({
            isOpen: true,
            title: 'Erreur',
            message: 'Erreur lors de la planification de l\'annulation. Veuillez réessayer.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleReactivate = async () => {
    try {
      const response = await subscriptionAPI.reactivate();
      if (response.success) {
        setAlertModal({
          isOpen: true,
          title: 'Abonnement réactivé',
          message: 'Votre abonnement a été réactivé avec succès !',
          type: 'success'
        });
        await fetchData(); // Refresh subscription data
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      setAlertModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de la réactivation. Veuillez réessayer.',
        type: 'error'
      });
    }
  };

  const handlePurchaseCredits = async (packageId) => {
    setProcessingCheckout(true);
    try {
      const successUrl = `${window.location.origin}/account?credits=success`;
      const cancelUrl = `${window.location.origin}/account?credits=cancelled`;

      const response = await creditsAPI.purchaseCredits(packageId, successUrl, cancelUrl);

      if (response.success && response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      setAlertModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de l\'achat de crédits. Veuillez réessayer.',
        type: 'error'
      });
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    try {
      const updates = {};
      if (userInfo.displayName !== currentUser?.displayName) {
        updates.display_name = userInfo.displayName;
      }
      if (userInfo.email !== currentUser?.email) {
        updates.email = userInfo.email;
      }

      if (Object.keys(updates).length === 0) {
        setEditingProfile(false);
        return;
      }

      const response = await authAPI.updateProfile(updates);
      if (response.success) {
        setAlertModal({
          isOpen: true,
          title: 'Succès',
          message: 'Profil mis à jour avec succès',
          type: 'success'
        });
        setEditingProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Erreur lors de la mise à jour du profil',
        type: 'error'
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-600';
      case 'starter':
        return 'bg-blue-600';
      case 'pro':
        return 'bg-purple-600';
      case 'growth':
        return 'bg-pink-600';
      case 'agency':
        return 'bg-indigo-600';
      case 'enterprise':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres du compte</h1>
          <p className="text-gray-400">Gérez votre profil, abonnement et facturation</p>
        </div>

        {/* Profile Section */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Profil</h2>
            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nom d'affichage
              </label>
              <input
                type="text"
                value={userInfo.displayName}
                onChange={(e) => setUserInfo({ ...userInfo, displayName: e.target.value })}
                disabled={!editingProfile}
                className="w-full px-4 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                disabled={!editingProfile}
                className="w-full px-4 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white disabled:opacity-50"
              />
            </div>

            {editingProfile && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updatingProfile ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setUserInfo({
                      displayName: currentUser?.displayName || '',
                      email: currentUser?.email || ''
                    });
                  }}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Abonnement</h2>

          {subscription && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="p-4 bg-[#0F0F0F] rounded-lg border border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`${getPlanColor(subscription.plan)} text-white px-4 py-2 rounded-lg font-semibold text-sm uppercase`}>
                      {subscription.plan}
                    </span>
                    <div>
                      <p className="text-white font-medium">Plan actuel</p>
                      <p className="text-sm text-gray-400">
                        {subscription.status === 'active' ? 'Actif' : subscription.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {subscription.plan !== 'free' && !subscription.cancelAtPeriodEnd && (
                      <>
                        <button
                          onClick={handleManageBilling}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Gérer la facturation
                        </button>
                        <button
                          onClick={handleScheduleCancellation}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Rétrograder
                        </button>
                      </>
                    )}
                    {subscription.cancelAtPeriodEnd && (
                      <button
                        onClick={handleReactivate}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Réactiver l'abonnement
                      </button>
                    )}
                  </div>
                </div>

                {/* Cancellation Warning */}
                {subscription.cancelAtPeriodEnd && (
                  <div className="p-4 bg-orange-900/20 border border-orange-500/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-orange-400 font-semibold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Rétrogradation programmée</span>
                    </div>
                    <div className="text-sm text-orange-300 space-y-1 ml-7">
                      <p>• Votre plan <strong>{subscription.plan.toUpperCase()}</strong> restera actif jusqu'au <strong>{formatDate(subscription.currentPeriodEnd)}</strong></p>
                      <p>• Vous ne serez pas facturé lors du prochain cycle</p>
                      <p className="text-green-400 font-semibold">• Tous vos crédits ({subscription.credits.toLocaleString()}) seront conservés</p>
                      <p>• Après cette date, vous serez sur le plan <strong className="capitalize">{subscription.scheduledDowngrade?.targetPlan || 'gratuit'}</strong> avec tous vos crédits</p>
                    </div>
                  </div>
                )}

                {/* Billing Period Info */}
                {subscription.plan !== 'free' && subscription.currentPeriodEnd && !subscription.cancelAtPeriodEnd && (
                  <div className="text-sm text-gray-400">
                    Prochain renouvellement: <strong className="text-white">{formatDate(subscription.currentPeriodEnd)}</strong>
                  </div>
                )}
              </div>

              {/* Credits - Single Box */}
              <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Crédits totaux</p>
                    <p className="text-4xl font-bold text-white mb-2">
                      {(() => {
                        const planCredits = subscription.credits || 0;
                        const planUsed = subscription.creditsUsed || 0;
                        const purchasedCredits = creditBalance?.credits || 0;
                        const purchasedUsed = creditBalance?.credits_used || 0;
                        const totalAccumulated = planCredits + planUsed + purchasedCredits + purchasedUsed;
                        return totalAccumulated.toLocaleString();
                      })()}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">
                        <strong>
                          {(() => {
                            const planCredits = subscription.credits || 0;
                            const purchasedCredits = creditBalance?.credits || 0;
                            return (planCredits + purchasedCredits).toLocaleString();
                          })()}
                        </strong> disponibles
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">
                        {(() => {
                          const planUsed = subscription.creditsUsed || 0;
                          const purchasedUsed = creditBalance?.credits_used || 0;
                          return (planUsed + purchasedUsed).toLocaleString();
                        })()} utilisés
                      </span>
                    </div>
                    {/* Breakdown */}
                    {(subscription.credits > 0 || (creditBalance?.credits || 0) > 0) && (
                      <div className="flex items-center gap-4 text-xs mt-2 pt-2 border-t border-purple-500/20">
                        {subscription.credits > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-gray-400">Plan: {subscription.credits.toLocaleString()}</span>
                          </div>
                        )}
                        {(creditBalance?.credits || 0) > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-emerald-400">Achetés: {creditBalance.credits.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowCreditsModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all text-sm whitespace-nowrap"
                    >
                      💎 Acheter des crédits
                    </button>
                    {subscription.plan !== 'enterprise' && (
                      <button
                        onClick={() => setShowPricingModal(true)}
                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg font-semibold transition-all text-sm whitespace-nowrap"
                      >
                        ⬆️ {subscription.plan === 'free' ? 'Améliorer' : 'Changer'} le plan
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              {subscription.billing && (
                <div className={`p-4 rounded-lg border ${
                  subscription.billing.willBeBilled 
                    ? 'bg-[#0F0F0F] border-[#262626]' 
                    : 'bg-blue-900/20 border-blue-500/50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-400">Prochaine facturation</p>
                    {subscription.billing.willBeBilled && (
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                        Actif
                      </span>
                    )}
                    {!subscription.billing.willBeBilled && subscription.cancelAtPeriodEnd && (
                      <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded">
                        Programmé
                      </span>
                    )}
                  </div>
                  
                  {subscription.billing.willBeBilled ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-lg font-semibold">
                          {formatDate(subscription.billing.nextBillingDate)}
                        </span>
                        <span className="text-2xl font-bold text-white">
                          €{subscription.billing.nextAmount?.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Votre abonnement <strong className="text-white capitalize">{subscription.billing.nextPlan}</strong> sera renouvelé automatiquement
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Aucune facturation automatique</span>
                      </div>
                      {subscription.scheduledDowngrade ? (
                        <div>
                          <p className="text-white text-sm">
                            Changement programmé vers <strong className="capitalize">{subscription.scheduledDowngrade.targetPlan}</strong>
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Date effective: <strong className="text-white">{formatDate(subscription.scheduledDowngrade.effectiveDate)}</strong>
                          </p>
                          <p className="text-green-400 text-xs mt-2">
                            ✓ Tous vos crédits seront conservés et les crédits du nouveau plan seront ajoutés
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">{subscription.billing.message}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Current Billing Period (if active) */}
              {subscription.currentPeriodStart && subscription.plan !== 'free' && (
                <div className="text-xs text-gray-500 text-center">
                  Période actuelle: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </div>
              )}
              
              {/* Manage Billing Button */}
              {subscription.plan !== 'free' && subscription.stripeCustomerId && (
                <button
                  onClick={handleManageBilling}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Gérer la facturation
                </button>
              )}
            </div>
          )}
        </div>


        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Choisissez votre plan</h2>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {plans.filter(p => p.id !== 'free').map((plan) => {
                  // Determine plan hierarchy
                  const planHierarchy = ['free', 'starter', 'pro', 'growth', 'agency', 'enterprise'];
                  const currentPlanIndex = planHierarchy.indexOf(subscription?.plan || 'free');
                  const thisPlanIndex = planHierarchy.indexOf(plan.id);
                  const isCurrentPlan = subscription?.plan === plan.id;
                  const isUpgrade = thisPlanIndex > currentPlanIndex;
                  const isDowngrade = thisPlanIndex < currentPlanIndex;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`bg-[#0F0F0F] rounded-xl border p-6 transition-all relative ${
                        isCurrentPlan ? 'border-purple-600' : 'border-[#262626] hover:border-purple-600'
                      }`}
                    >
                      {isCurrentPlan && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Plan actuel
                          </span>
                        </div>
                      )}
                      
                      <div className={`${getPlanColor(plan.id)} text-white px-3 py-1 rounded-lg font-semibold text-sm uppercase inline-block mb-4`}>
                        {plan.name}
                      </div>
                      
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-white">{plan.price}€</span>
                        <span className="text-gray-400">/mois</span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{plan.credits.toLocaleString()} crédits/mois</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>~{plan.features.video_ads_kai} vidéos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>~{plan.features.image_ads} images ads</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={processingCheckout || isCurrentPlan}
                        className={`w-full py-2 rounded-lg font-semibold transition-all ${
                          isCurrentPlan
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : isUpgrade
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {isCurrentPlan ? 'Plan actuel' : processingCheckout ? 'Chargement...' : isUpgrade ? 'Améliorer' : 'Gérer via facturation'}
                      </button>
                      
                      {isDowngrade && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Utilisez "Gérer la facturation" pour rétrograder
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Credits Purchase Modal */}
        {showCreditsModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Acheter des crédits</h2>
                <button
                  onClick={() => setShowCreditsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-[#0F0F0F] rounded-xl border border-[#262626] p-6 hover:border-purple-600 transition-all relative"
                  >
                    {/* Best Value Badge for Value Pack */}
                    {pkg.id === 'package_600' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Meilleure valeur
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="text-white font-bold text-lg mb-2">{pkg.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-white">{pkg.price}€</span>
                      </div>
                      <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg py-3 px-4 mb-4">
                        <p className="text-3xl font-bold text-purple-400">{pkg.credits.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">crédits</p>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {(pkg.price / pkg.credits * 100).toFixed(2)}€ par 100 crédits
                      </p>
                    </div>

                    <div className="space-y-2 mb-6 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>~{Math.floor(pkg.credits / 10)} image ads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>~{Math.floor(pkg.credits / 25)} vidéos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Pas d'expiration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Paiement unique</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchaseCredits(pkg.id)}
                      disabled={processingCheckout}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {processingCheckout ? 'Chargement...' : 'Acheter'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Modals */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
        />

        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />
      </div>
    </DashboardLayout>
  );
};

export default Account;

