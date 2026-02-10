import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';

const CreditsDisplay = () => {
  const navigate = useNavigate();
  const { availableCredits, usedCredits, subscriptionPlan, loading } = useDashboardData();
  
  const totalCredits = availableCredits + usedCredits;
  const usagePercentage = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0;
  
  const getPlanColor = (plan) => {
    switch(plan?.toLowerCase()) {
      case 'free':
        return 'text-gray-400';
      case 'starter':
        return 'text-blue-400';
      case 'pro':
        return 'text-purple-400';
      case 'growth':
        return 'text-pink-400';
      case 'agency':
        return 'text-yellow-400';
      case 'enterprise':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };
  
  const getPlanLabel = (plan) => {
    switch(plan?.toLowerCase()) {
      case 'free':
        return 'Gratuit';
      case 'starter':
        return 'Starter';
      case 'pro':
        return 'Pro';
      case 'growth':
        return 'Growth';
      case 'agency':
        return 'Agency';
      case 'enterprise':
        return 'Enterprise';
      default:
        return plan || 'Gratuit';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl p-5 sm:p-6 border border-gray-800/50 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-800 rounded w-32"></div>
          <div className="h-6 bg-gray-800 rounded w-20"></div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full mb-3"></div>
        <div className="h-4 bg-gray-800 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-5 sm:p-6 border border-gray-800/50 hover:border-gray-700 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-white text-sm sm:text-base font-semibold">Crédits Disponibles</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPlanColor(subscriptionPlan)} bg-gray-800/50`}>
          {getPlanLabel(subscriptionPlan)}
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-3xl sm:text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors">
            {availableCredits.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400">
            / {totalCredits.toLocaleString()} crédits
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500"
            style={{ width: `${100 - usagePercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>{usedCredits.toLocaleString()} crédits utilisés</span>
        <span>{usagePercentage}% utilisé</span>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => navigate('/account', { state: { tab: 'credits' } })}
          className="flex-1 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 hover:text-yellow-300 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
        >
          Acheter des crédits
        </button>
        {subscriptionPlan === 'free' && (
          <button 
            onClick={() => navigate('/account', { state: { tab: 'subscription' } })}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
          >
            Passer à Pro
          </button>
        )}
      </div>
    </div>
  );
};

export default CreditsDisplay;

