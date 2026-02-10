import { useState, useEffect } from 'react';

const ProgressTracker = ({ status, progress, currentStep, estimatedTime }) => {
  const [fakeProgress, setFakeProgress] = useState(0);
  const [startTime] = useState(Date.now());

  // Calculate fake progress based on time elapsed (max 60 minutes)
  useEffect(() => {
    if (status === 'completed') {
      setFakeProgress(100);
      return;
    }

    if (status !== 'processing' && status !== 'queued') {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime; // milliseconds
      const maxDuration = 60 * 60 * 1000; // 60 minutes in milliseconds
      
      // Calculate percentage (0-95%, never reaches 100 until actually completed)
      const calculatedProgress = Math.min(95, (elapsed / maxDuration) * 100);
      setFakeProgress(Math.floor(calculatedProgress));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [status, startTime]);

  // Use fake progress if backend progress is 0 or undefined
  const displayProgress = (progress > 0) ? progress : fakeProgress;

  const getStatusColor = () => {
    switch (status) {
      case 'queued':
        return 'text-blue-400';
      case 'processing':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'queued':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'processing':
        return (
          <div className="w-6 h-6 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        );
      case 'completed':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'failed':
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const statusColor = getStatusColor();

  // Calculate estimated time remaining based on fake progress
  const getEstimatedTimeRemaining = () => {
    if (status !== 'processing') return null;
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const maxDuration = 60; // max 60 minutes
    const remaining = Math.max(1, Math.ceil(maxDuration - elapsed));
    return remaining;
  };

  const estimatedRemaining = getEstimatedTimeRemaining();

  return (
    <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={statusColor}>{getStatusIcon()}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {status === 'queued' && 'Waiting in Queue'}
              {status === 'processing' && 'Generating Your Video'}
              {status === 'completed' && 'Video Ready!'}
              {status === 'failed' && 'Generation Failed'}
            </h3>
            <p className={`text-sm ${statusColor}`}>
              {currentStep || 'Initializing...'}
            </p>
          </div>
        </div>
        {status === 'processing' && estimatedRemaining && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Est. time remaining</div>
            <div className="text-lg font-semibold text-white">
              ~{estimatedRemaining} min
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'queued' || status === 'processing') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="font-semibold text-white">{displayProgress}%</span>
          </div>
          <div className="relative w-full h-3 bg-[#0F0F0F] rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                status === 'processing'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}
              style={{ width: `${displayProgress}%` }}
            />
            {status === 'processing' && (
              <div
                className="absolute top-0 h-full w-1/3 bg-white/20 animate-shimmer"
                style={{
                  animation: 'shimmer 2s infinite',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Status-specific content */}
      {status === 'queued' && (
        <div className="flex items-start space-x-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <svg
            className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-300 font-medium">
              Your video is in the queue
            </p>
            <p className="text-xs text-blue-400/80 mt-1">
              We'll start processing it shortly. This page will update
              automatically.
            </p>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex items-start space-x-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <svg
            className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-yellow-300 font-medium">
              AI is working its magic
            </p>
            <p className="text-xs text-yellow-400/80 mt-1">
              This typically takes 3-5 minutes. Feel free to navigate away -
              we'll save your video!
            </p>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="flex items-start space-x-3 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <svg
            className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-green-300 font-medium">
              Your video is ready!
            </p>
            <p className="text-xs text-green-400/80 mt-1">
              Watch it below and download when ready.
            </p>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex items-start space-x-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-red-300 font-medium">
              Video generation failed
            </p>
            <p className="text-xs text-red-400/80 mt-1">
              Your credits have been refunded. Please try again with a different
              prompt or image.
            </p>
          </div>
        </div>
      )}

      {/* Add shimmer animation to styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressTracker;
