import { useState, useEffect } from 'react';

const PromptInput = ({ prompt, setPrompt, disabled }) => {
  const MIN_LENGTH = 10;
  const MAX_LENGTH = 2000;
  const [charCount, setCharCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const count = prompt.length;
    setCharCount(count);
    setIsValid(count >= MIN_LENGTH && count <= MAX_LENGTH);
  }, [prompt]);

  const getCharCountColor = () => {
    if (charCount < MIN_LENGTH) return 'text-gray-400';
    if (charCount > MAX_LENGTH * 0.9) return 'text-yellow-400';
    if (charCount > MAX_LENGTH) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          2. Describe Your Video
        </h3>
        <span className={`text-sm font-medium ${getCharCountColor()}`}>
          {charCount} / {MAX_LENGTH}
        </span>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled}
          placeholder="e.g., Woman in her car showing new skincare product, excited about the amazing results she's seeing. She applies the cream while explaining how it transformed her skin in just 2 weeks..."
          className="w-full h-40 px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={MAX_LENGTH}
        />

        {/* Validation Indicator */}
        {prompt.length > 0 && (
          <div className="absolute top-3 right-3">
            {isValid ? (
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-500"
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
            ) : charCount > MAX_LENGTH ? (
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tip Section */}
      <div className="flex items-start space-x-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-purple-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-purple-300 font-medium">
            💡 Keep it simple - Claude AI will enhance it!
          </p>
          <p className="text-xs text-purple-400/80 mt-1">
            Just describe what you want to see. Our AI will transform your idea
            into a professional video prompt.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {prompt.length > 0 && prompt.length < MIN_LENGTH && (
        <div className="flex items-center space-x-2 text-yellow-400 text-sm">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            At least {MIN_LENGTH} characters required ({MIN_LENGTH - charCount}{' '}
            more needed)
          </span>
        </div>
      )}

      {prompt.length > MAX_LENGTH && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Maximum length exceeded ({charCount - MAX_LENGTH} characters over)
          </span>
        </div>
      )}
    </div>
  );
};

export default PromptInput;

