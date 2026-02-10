import React from 'react';

const AlertModal = ({ isOpen, onClose, title, message, type = 'success', buttonText = 'OK' }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500/50',
          bg: 'bg-green-900/20',
          icon: (
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-900/20',
          icon: (
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          border: 'border-orange-500/50',
          bg: 'bg-orange-900/20',
          icon: (
            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'info':
        return {
          border: 'border-blue-500/50',
          bg: 'bg-blue-900/20',
          icon: (
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          border: 'border-purple-500/50',
          bg: 'bg-purple-900/20',
          icon: (
            <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 scale-100">
        {/* Icon */}
        <div className={`flex items-center justify-center mb-4 p-4 rounded-lg ${styles.bg} border ${styles.border}`}>
          {styles.icon}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-3 text-center">
          {title}
        </h2>

        {/* Message */}
        <div className="text-gray-300 mb-6 text-sm leading-relaxed whitespace-pre-line text-center">
          {message}
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 ${styles.button} text-white rounded-lg font-semibold transition-all`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default AlertModal;

