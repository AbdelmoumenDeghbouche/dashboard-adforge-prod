import React from 'react';
import { useNavigate } from 'react-router-dom';

const InsufficientCreditsModal = ({ isOpen, onClose, creditsNeeded, creditsAvailable, currentPlan }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate('/account');
    onClose();
  };

  const creditShortfall = creditsNeeded - creditsAvailable;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#262626] max-w-md w-full p-6 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Crédits insuffisants
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-center mb-6">
          Vous n'avez pas assez de crédits pour effectuer cette opération.
        </p>

        {/* Credits Info */}
        <div className="bg-[#111111] rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Crédits requis:</span>
            <span className="text-white font-semibold">{creditsNeeded.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Crédits disponibles:</span>
            <span className="text-white font-semibold">{creditsAvailable.toLocaleString()}</span>
          </div>
          <div className="h-px bg-gray-700 my-2"></div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Manquants:</span>
            <span className="text-red-400 font-bold">{creditShortfall.toLocaleString()}</span>
          </div>
        </div>

        {/* Current Plan Badge */}
        {currentPlan && (
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500">Plan actuel: </span>
            <span className="text-sm text-purple-400 font-semibold capitalize">
              {currentPlan}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Améliorer mon plan
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Vous pouvez également acheter des crédits supplémentaires sur la page Compte
        </p>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InsufficientCreditsModal;


