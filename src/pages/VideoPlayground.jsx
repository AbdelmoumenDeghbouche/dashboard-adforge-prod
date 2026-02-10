import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { videoPlaygroundAPI, creditsAPI } from '../services/apiService';
import ImageUpload from '../components/VideoPlayground/ImageUpload';
import PromptInput from '../components/VideoPlayground/PromptInput';
import OptionsPanel from '../components/VideoPlayground/OptionsPanel';
import ProgressTracker from '../components/VideoPlayground/ProgressTracker';
import VideoPlayer from '../components/VideoPlayground/VideoPlayer';
import InsufficientCreditsModal from '../components/common/InsufficientCreditsModal';

const VideoPlayground = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState({
    aspect_ratio: '9:16',
    platform: 'tiktok',
    duration: 12,
    provider: 'openai',
  });

  // Generation state
  const [generationState, setGenerationState] = useState('idle'); // idle, enhancing, enhanced, generating, completed, failed
  const [jobId, setJobId] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');

  // Job status state
  const [jobStatus, setJobStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // Credits state
  const [credits, setCredits] = useState(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);

  // Polling ref
  const pollingIntervalRef = useRef(null);
  
  // Track failed polls for 404 handling
  const failedPollsRef = useRef({});

  // Fetch user credits on mount
  useEffect(() => {
    fetchCredits();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const fetchCredits = async () => {
    try {
      console.log('[VideoPlayground] Fetching credits...');
      const response = await creditsAPI.getBalance();
      console.log('[VideoPlayground] Full response:', response);
      console.log('[VideoPlayground] response.data keys:', Object.keys(response.data || {}));
      console.log('[VideoPlayground] response.data content:', JSON.stringify(response.data, null, 2));
      
      if (response.success && response.data) {
        // Check different possible field names
        const totalCredits = 
          response.data.total_credits || 
          response.data.totalCredits || 
          response.data.total || 
          response.data.balance ||
          response.data.credits ||
          0;
        
        setCredits(totalCredits);
        console.log('[VideoPlayground] Credits set to:', totalCredits);
      } else {
        console.error('[VideoPlayground] Invalid response:', response);
        setCredits(0);
      }
    } catch (error) {
      console.error('[VideoPlayground] Failed to fetch credits:', error);
      console.error('[VideoPlayground] Error details:', error.response || error);
      setCredits(0);
    }
  };

  const isFormValid = () => {
    const validation = {
      promptLength: prompt.length >= 10 && prompt.length <= 2000,
      promptLengthValue: prompt.length,
      aspectRatio: !!options.aspect_ratio,
      platform: !!options.platform,
      duration: !!options.duration,
      provider: !!options.provider
    };
    
    const isValid = (
      validation.promptLength &&
      validation.aspectRatio &&
      validation.platform &&
      validation.duration &&
      validation.provider
    );
    
    if (!isValid) {
      console.log('[VideoPlayground] Form validation:', validation);
    }
    
    return isValid;
  };

  const handleGenerate = async () => {
    console.log('[VideoPlayground] Generate button clicked!');
    console.log('[VideoPlayground] Form valid:', isFormValid());
    console.log('[VideoPlayground] Current credits:', credits);
    console.log('[VideoPlayground] Form data:', { prompt: prompt.substring(0, 50), options });
    
    if (!isFormValid()) {
      console.error('[VideoPlayground] Form validation failed');
      setError('Please complete all required fields correctly.');
      return;
    }

    // Check if user has enough credits
    if (credits !== null && credits < 1000) {
      console.error('[VideoPlayground] Insufficient credits:', credits);
      const needed = 1000 - credits;
      setError(`Insufficient credits. You need at least 1000 credits to generate a video. You currently have ${credits} credits. Please purchase ${needed} more credits.`);
      setShowInsufficientCreditsModal(true);
      return;
    }

    console.log('[VideoPlayground] All checks passed, starting generation...');
    setError('');
    setGenerationState('enhancing');

    try {
      // Call generate video API
      const response = await videoPlaygroundAPI.generateVideo(
        prompt,
        imageUrl,
        options.aspect_ratio,
        options.platform,
        options.duration,
        options.provider
      );

      if (response.success && response.data) {
        const { job_id, enhanced_prompt, credits_remaining } = response.data;

        setJobId(job_id);
        setEnhancedPrompt(enhanced_prompt);
        setCredits(credits_remaining);
        setGenerationState('generating');

        // Start polling for job status
        startPolling(job_id);
      } else {
        throw new Error(response.message || 'Failed to start video generation');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      
      // Check for insufficient credits error (402)
      if (error.response?.status === 402) {
        setShowInsufficientCreditsModal(true);
        setGenerationState('idle');
      } else {
        setError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
        setGenerationState('idle');
      }
    }
  };

  const startPolling = (jobId) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll immediately
    checkJobStatus(jobId);

    // Then poll every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      checkJobStatus(jobId);
    }, 5000);
  };

  const checkJobStatus = async (jobId) => {
    try {
      const response = await videoPlaygroundAPI.getJobStatus(jobId);

      // Reset failed polls counter on successful response
      if (failedPollsRef.current[jobId]) {
        failedPollsRef.current[jobId] = 0;
      }

      if (response.success && response.data) {
        const jobData = response.data;
        setJobStatus(jobData);
        setProgress(jobData.progress_percentage || 0);
        setCurrentStep(jobData.current_step || '');

        // Stop polling if terminal state
        if (jobData.status === 'completed') {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          delete failedPollsRef.current[jobId];

          // Extract video data
          const videoUrl = jobData.result_data?.video_url;
          if (videoUrl) {
            setVideoUrl(videoUrl);
            setVideoData({
              duration: jobData.result_data?.duration || options.duration,
              aspect_ratio: jobData.result_data?.aspect_ratio || options.aspect_ratio,
              platform: jobData.result_data?.platform || options.platform,
              provider: jobData.result_data?.provider || options.provider,
            });
            setGenerationState('completed');
          } else {
            throw new Error('Video URL not found in response');
          }
        } else if (jobData.status === 'failed' || jobData.status === 'cancelled') {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          delete failedPollsRef.current[jobId];

          setError(jobData.error_message || `Video generation ${jobData.status}`);
          setGenerationState('failed');
          
          // Refresh credits (should be refunded)
          fetchCredits();
        }
        // Continue polling for 'processing' or 'queued' states
      }
    } catch (error) {
      console.error('Error checking job status:', error);
      
      // Handle 404 errors - job not found
      if (error.response?.status === 404 || error.message?.includes('404')) {
        console.log(`[VideoPlayground] Job ${jobId} not found (404)`);
        
        // Track failed polls
        failedPollsRef.current[jobId] = (failedPollsRef.current[jobId] || 0) + 1;
        
        // Stop after 3 consecutive 404s
        if (failedPollsRef.current[jobId] >= 3) {
          console.log(`[VideoPlayground] Stopping poll for job ${jobId} after 3 consecutive 404s`);
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          delete failedPollsRef.current[jobId];
          
          setError('Job not found. It may have expired or been cancelled.');
          setGenerationState('failed');
          fetchCredits();
          return;
        }
      }
      // Don't stop polling on other network errors, just log them
    }
  };

  const handleGenerateAnother = () => {
    // Reset all state
    setImageUrl('');
    setPrompt('');
    setOptions({
      aspect_ratio: '9:16',
      platform: 'tiktok',
      duration: 12,
      provider: 'openai',
    });
    setGenerationState('idle');
    setJobId(null);
    setEnhancedPrompt('');
    setVideoUrl('');
    setVideoData(null);
    setError('');
    setJobStatus(null);
    setProgress(0);
    setCurrentStep('');

    // Refresh credits
    fetchCredits();

    // Stop any polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  const isFormDisabled = generationState !== 'idle' && generationState !== 'failed';

  return (
    <div className="bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Video Playground</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Create UGC-style videos with AI - just describe what you want
              </p>
            </div>
          </div>
          {credits !== null && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] border border-[#262626] rounded-lg">
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold text-white">{credits.toLocaleString()}</span>
              <span className="text-xs text-gray-400">credits</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="space-y-8">
          {/* Form Section (only show if not completed) */}
          {generationState !== 'completed' && (
            <div className="space-y-8">
              {/* Image Upload */}
              <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6">
                <ImageUpload
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  disabled={isFormDisabled}
                />
              </div>

              {/* Prompt Input */}
              <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6">
                <PromptInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  disabled={isFormDisabled}
                />
              </div>

              {/* Options Panel */}
              <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6">
                <OptionsPanel
                  options={options}
                  setOptions={setOptions}
                  disabled={isFormDisabled}
                />
              </div>

              {/* Error Display */}
              {error && generationState === 'idle' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
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
                      <p className="text-sm text-red-300 font-medium">Error</p>
                      <p className="text-xs text-red-400/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              {generationState === 'idle' && (
                <button
                  onClick={handleGenerate}
                  disabled={!isFormValid() || isFormDisabled}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Generate Video →</span>
                </button>
              )}
            </div>
          )}

          {/* Loading State (Enhancing Prompt) */}
          {generationState === 'enhancing' && (
            <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Enhancing your prompt with our AI agent...
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">
                    This will only take a moment
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tracker */}
          {(generationState === 'generating' || generationState === 'failed') && (
            <ProgressTracker
              status={jobStatus?.status || 'queued'}
              progress={progress}
              currentStep={currentStep}
              estimatedTime={jobStatus?.estimated_duration_minutes ? jobStatus.estimated_duration_minutes * 60 : 300}
            />
          )}

          {/* Video Player (Completed) */}
          {generationState === 'completed' && videoUrl && (
            <VideoPlayer
              videoUrl={videoUrl}
              videoData={videoData}
              onGenerateAnother={handleGenerateAnother}
            />
          )}

          {/* Try Again Button (Failed) */}
          {generationState === 'failed' && (
            <button
              onClick={() => {
                setGenerationState('idle');
                setError('');
              }}
              className="w-full py-4 bg-[#1A1A1A] border border-[#262626] text-white text-lg font-semibold rounded-xl hover:border-purple-500/50 transition-all flex items-center justify-center space-x-2"
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>

      {/* Insufficient Credits Modal */}
      {showInsufficientCreditsModal && (
        <InsufficientCreditsModal
          onClose={() => setShowInsufficientCreditsModal(false)}
          requiredCredits={1000}
          currentCredits={credits || 0}
        />
      )}
    </div>
  );
};

export default VideoPlayground;

