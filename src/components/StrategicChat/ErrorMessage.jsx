import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error Message Component
 * Displays user-friendly error messages with retry capability
 * 
 * Props:
 * - message: Error message text
 * - onRetry: Optional retry callback function
 * - type: 'error' | 'warning' | 'info' (default: 'error')
 */
export default function ErrorMessage({ message, onRetry, type = 'error' }) {
  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-300',
      icon: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-300',
      icon: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      icon: 'text-blue-400'
    }
  };

  const style = styles[type] || styles.error;

  return (
    <div className={`p-4 ${style.bg} border ${style.border} rounded-lg animate-shake`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm ${style.text} leading-relaxed`}>
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

