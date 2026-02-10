import { useState } from 'react';

const EnhancedPromptDisplay = ({ originalPrompt, enhancedPrompt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const truncateText = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          ✨ Prompt Enhanced!
        </h3>
      </div>

      {/* Original Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Your Original Prompt:
        </label>
        <div className="p-3 bg-[#0F0F0F] border border-[#262626] rounded-lg">
          <p className="text-sm text-gray-300">{originalPrompt}</p>
        </div>
      </div>

      {/* Enhanced Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Claude-Enhanced Prompt:
        </label>
        <div className="relative p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
          <div
            className={`text-sm text-white leading-relaxed whitespace-pre-wrap ${
              !isExpanded ? 'max-h-40 overflow-hidden' : ''
            }`}
          >
            {isExpanded ? enhancedPrompt : truncateText(enhancedPrompt)}
          </div>
          {!isExpanded && enhancedPrompt.length > 300 && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1A1A1A] to-transparent rounded-b-lg" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {enhancedPrompt.length > 300 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1"
          >
            <span>{isExpanded ? 'Show Less' : 'Show Full Prompt'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center space-x-2 px-4 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg hover:border-purple-500/50 transition-colors"
        >
          {copySuccess ? (
            <>
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm font-medium text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-400">
                Copy to Clipboard
              </span>
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="flex items-start space-x-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mt-4">
        <svg
          className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
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
          <p className="text-xs text-purple-300">
            Claude AI has enhanced your prompt with detailed scene descriptions,
            camera movements, and cinematic elements to create a professional
            UGC-style video.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPromptDisplay;

