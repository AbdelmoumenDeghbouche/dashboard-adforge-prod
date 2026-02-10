import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionAPI, creditsAPI } from '../../services/apiService';

const CombinedCreditsDisplay = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [purchasedBalance, setPurchasedBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subResponse, creditsResponse] = await Promise.all([
        subscriptionAPI.getSubscription(),
        creditsAPI.getBalance()
      ]);
      
      if (subResponse.success) {
        setSubscription(subResponse.data);
      }
      
      if (creditsResponse.success) {
        setPurchasedBalance(creditsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'free':
        return 'from-gray-600 to-gray-700';
      case 'starter':
        return 'from-blue-600 to-blue-700';
      case 'pro':
        return 'from-purple-600 to-purple-700';
      case 'growth':
        return 'from-pink-600 to-pink-700';
      case 'agency':
        return 'from-indigo-600 to-indigo-700';
      case 'enterprise':
        return 'from-orange-600 to-orange-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getPlanName = (plan) => {
    const names = {
      'free': 'Free',
      'starter': 'Starter',
      'pro': 'Pro',
      'growth': 'Growth',
      'agency': 'Agency',
      'enterprise': 'Enterprise'
    };
    return names[plan] || 'Free';
  };

  if (loading) {
    return (
      <div className="p-4 border-t border-[#262626]">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const plan = subscription.plan || 'free';
  const planCredits = subscription.credits || 0;
  const planCreditsUsed = subscription.creditsUsed || 0;
  const purchasedCredits = purchasedBalance?.credits || 0;
  const purchasedCreditsUsed = purchasedBalance?.credits_used || 0;
  
  // Calculate totals
  const totalAvailable = planCredits + purchasedCredits;
  const totalUsed = planCreditsUsed + purchasedCreditsUsed;
  const totalAccumulated = totalAvailable + totalUsed;
  
  // Usage percentage
  const usagePercentage = totalAccumulated > 0 ? (totalUsed / totalAccumulated) * 100 : 0;

  return (
    <div className="p-4 border-t border-[#262626]">
      <button
        onClick={() => navigate('/account')}
        className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 hover:from-gray-800 hover:to-gray-700 transition-all duration-200 border border-gray-700"
      >
        {/* Plan Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getPlanColor(plan)}`}>
            {getPlanName(plan)}
          </span>
        </div>

        {/* Total Credits Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Crédits disponibles</span>
            <span className="text-white font-bold text-2xl">
              {totalAvailable.toLocaleString()}
            </span>
          </div>
          
          {/* Progress Bar */}
          {totalAccumulated > 0 && (
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getPlanColor(plan)} transition-all duration-300`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          )}
          
          {/* Usage Info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {totalUsed.toLocaleString()} utilisés sur {totalAccumulated.toLocaleString()}
            </span>
            {usagePercentage > 80 && (
              <span className="text-orange-400 font-medium">
                ⚠️ Faible
              </span>
            )}
          </div>

          {/* Breakdown - Compact */}
          {(planCredits > 0 || purchasedCredits > 0) && (
            <div className="pt-2 border-t border-gray-700/50 flex items-center justify-between text-xs">
              {planCredits > 0 && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getPlanColor(plan)}`}></div>
                  <span className="text-gray-500">{planCredits.toLocaleString()}</span>
                </div>
              )}
              {purchasedCredits > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                  <span className="text-emerald-400 font-medium">+{purchasedCredits.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA for free users */}
        {plan === 'free' && totalAvailable < 20 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-purple-400 text-center font-medium">
              Cliquez pour améliorer votre plan
            </p>
          </div>
        )}
      </button>
    </div>
  );
};

export default CombinedCreditsDisplay;

