import { useState, useCallback } from 'react';

/**
 * Custom hook to handle API errors, especially insufficient credits (402)
 * 
 * Usage:
 * const { showInsufficientCredits, InsufficientCreditsModal } = useApiError();
 * 
 * // In your API call:
 * try {
 *   const response = await adsAPI.generateAds(...);
 * } catch (error) {
 *   if (error.response?.status === 402) {
 *     showInsufficientCredits(error.response.data);
 *   }
 * }
 */
export const useApiError = () => {
  const [errorState, setErrorState] = useState({
    show: false,
    creditsNeeded: 0,
    creditsAvailable: 0,
    currentPlan: 'free',
    message: ''
  });

  const showInsufficientCredits = useCallback((errorData) => {
    // Extract credits info from error response
    const errorDetails = errorData?.error_details || {};
    const message = errorData?.message || 'Crédits insuffisants';
    
    setErrorState({
      show: true,
      creditsNeeded: errorDetails.credits_needed || 0,
      creditsAvailable: errorDetails.credits_available || 0,
      currentPlan: errorDetails.current_plan || 'free',
      message: message
    });
  }, []);

  const hideInsufficientCredits = useCallback(() => {
    setErrorState(prev => ({ ...prev, show: false }));
  }, []);

  const handleApiError = useCallback((error, defaultMessage = 'Une erreur est survenue') => {
    if (error.response?.status === 402) {
      // Insufficient credits error
      showInsufficientCredits(error.response.data);
      return true; // Handled
    } else if (error.response?.data?.message) {
      // Other API errors with message
      console.error('API Error:', error.response.data.message);
      return false; // Not handled, let caller handle it
    } else {
      // Generic error
      console.error('Error:', defaultMessage, error);
      return false; // Not handled
    }
  }, [showInsufficientCredits]);

  return {
    errorState,
    showInsufficientCredits,
    hideInsufficientCredits,
    handleApiError
  };
};


