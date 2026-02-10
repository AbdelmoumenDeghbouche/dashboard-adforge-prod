import { useEffect, useRef } from 'react';
import { useStrategicChat, CHAT_STEPS } from '../../contexts/StrategicChatContext';
import { useResearchStatus } from '../../hooks/useResearchStatus';
import ChatMessage from './ChatMessage';
import ResearchLoadingAnimation from './ResearchLoadingAnimation';
import ErrorMessage from './ErrorMessage';
import { ArrowLeft } from 'lucide-react';

/**
 * Strategic Chat Container
 * Main chat interface for strategic analysis workflow
 * 
 * Flow:
 * 1. Check research status (if not completed, show loading animation)
 * 2. When research completes, show summary message
 * 3. User triggers strategic analysis
 * 4. Show angles, user selects angle
 * 5. Show creatives, user selects creative
 * 6. Generate video
 * 7. Show video preview
 */
export default function StrategicChatContainer({ product, onBack, onAnalyzeAngles, onConfirmPlatformAdLength }) {
  const chatEndRef = useRef(null);
  
  const {
    messages,
    currentStep,
    brandId,
    productId,
    researchId,
  } = useStrategicChat();

  // Get initial research status from product
  const initialResearchStatus = product?.research?.status || null;
  
  // Only poll if research is in progress (not completed or failed)
  // This prevents unnecessary polling spam
  const shouldPoll = initialResearchStatus === 'processing';
  
  // Check research status with polling ONLY if status is 'processing'
  const { researchStatus: polledStatus, isPolling } = useResearchStatus(
    shouldPoll ? brandId : null,
    shouldPoll ? productId : null,
    shouldPoll ? researchId : null
  );
  
  // Use polled status if polling, otherwise use initial status from product
  const researchStatus = shouldPoll ? polledStatus : initialResearchStatus;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine if we should show loading animation
  // ONLY show loading if research is actually processing (not completed)
  const showLoading = (currentStep === CHAT_STEPS.WAITING_FOR_RESEARCH) && 
                      (researchStatus === 'processing') &&
                      isPolling;

  // Research failed state
  const showResearchError = (currentStep === CHAT_STEPS.WAITING_FOR_RESEARCH) && 
                            (researchStatus === 'failed');
  
  // If research is completed but we have no messages yet, we're loading the summary
  const isLoadingSummary = (currentStep === CHAT_STEPS.WAITING_FOR_RESEARCH) && 
                           (researchStatus === 'completed') &&
                           (messages.length === 0);

  const handleRetryResearch = () => {
    // Trigger research retry - would need to be implemented in backend
    window.location.reload(); // Simple reload for now
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#262626] px-6 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#262626] rounded-full transition-colors"
          aria-label="Back to products"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        
        <div className="flex items-center gap-3">
          {product.images && product.images.length > 0 && (
            <img 
              src={product.images[0]} 
              alt={product.productName}
              className="w-12 h-12 rounded-lg object-cover border border-[#262626]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <h2 className="font-semibold text-white">{product.productName}</h2>
            <p className="text-sm text-gray-400">Strategic Analysis Chat</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth">
        {showLoading ? (
          // SHOW LOADING ANIMATION IF RESEARCH IS PROCESSING
          <ResearchLoadingAnimation />
        ) : showResearchError ? (
          // SHOW ERROR IF RESEARCH FAILED
          <div className="max-w-2xl mx-auto">
            <ErrorMessage 
              message="Research failed to complete. This might be due to insufficient product data or a temporary issue. Please try again or select a different product."
              onRetry={handleRetryResearch}
            />
          </div>
        ) : isLoadingSummary ? (
          // SHOW SIMPLE LOADER IF RESEARCH IS COMPLETE BUT SUMMARY IS LOADING
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">Chargement du résumé de recherche...</p>
          </div>
        ) : messages.length === 0 ? (
          // NO MESSAGES AND RESEARCH IS COMPLETE - SHOW HELPFUL MESSAGE
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">Prêt à analyser</h3>
            <p className="text-gray-400 text-sm">
              La recherche est terminée. Le résumé va se charger automatiquement...
            </p>
          </div>
        ) : (
          // SHOW CHAT MESSAGES
          <>
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onAnalyzeAngles={onAnalyzeAngles}
                onConfirmPlatformAdLength={onConfirmPlatformAdLength}
              />
            ))}
          </>
        )}
        
        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Status Bar (optional - show current step) */}
      {currentStep !== CHAT_STEPS.WAITING_FOR_RESEARCH && messages.length > 0 && (
        <div className="bg-[#1A1A1A] border-t border-[#262626] px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>
              {currentStep === CHAT_STEPS.SHOWING_SUMMARY && 'Research complete - Ready to analyze'}
              {currentStep === CHAT_STEPS.ANALYZING_ANGLES && 'Analyzing marketing angles...'}
              {currentStep === CHAT_STEPS.SHOWING_ANGLES && 'Select your preferred marketing angle'}
              {currentStep === CHAT_STEPS.GENERATING_CREATIVES && 'Generating creative variations...'}
              {currentStep === CHAT_STEPS.SHOWING_CREATIVES && 'Select a creative variation to generate video'}
              {currentStep === CHAT_STEPS.GENERATING_VIDEO && 'Generating your video...'}
              {currentStep === CHAT_STEPS.VIDEO_READY && 'Video ready!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

