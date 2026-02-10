import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobNotificationContext } from '../contexts/JobNotificationContext';

const NotificationToast = () => {
  // Defensive: Check if context is available (handles hot reload edge cases)
  let notifications = [];
  let dismissNotification = () => {};
  
  try {
    const context = useJobNotificationContext();
    notifications = context.notifications;
    dismissNotification = context.dismissNotification;
  } catch (error) {
    // Context not available yet (hot reload), render nothing
    console.warn('[NotificationToast] Context not available yet:', error.message);
    return null;
  }
  
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
          onAction={(url, external, state) => {
            if (external) {
              window.open(url, '_blank');
            } else {
              navigate(url, state ? { state } : undefined);
            }
            dismissNotification(notification.id);
          }}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ notification, onDismiss, onAction }) => {
  const toastRef = useRef(null);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toastRef.current && !toastRef.current.contains(event.target)) {
        onDismiss();
      }
    };

    // Add a small delay before enabling click-outside
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500/30';
      case 'error':
        return 'border-red-500/30';
      case 'info':
        return 'border-blue-500/30';
      case 'warning':
        return 'border-yellow-500/30';
      default:
        return 'border-gray-500/30';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900/20';
      case 'error':
        return 'bg-red-900/20';
      case 'info':
        return 'bg-blue-900/20';
      case 'warning':
        return 'bg-yellow-900/20';
      default:
        return 'bg-gray-900/20';
    }
  };

  return (
    <div
      ref={toastRef}
      className={`pointer-events-auto min-w-[320px] max-w-md ${getBackgroundColor()} backdrop-blur-lg border ${getBorderColor()} rounded-lg shadow-2xl animate-slide-in-right overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              {notification.message}
            </p>
            
            {notification.action && (
              <button
                onClick={() => onAction(notification.action.url, notification.action.external, notification.action.state)}
                className="mt-3 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group"
              >
                <span>{notification.action.label}</span>
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
          
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      <div className="h-1 bg-gray-700/50">
        <div
          className={`h-full ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            notification.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } animate-progress-bar`}
        />
      </div>
    </div>
  );
};

export default NotificationToast;

