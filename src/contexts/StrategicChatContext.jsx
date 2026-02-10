import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Strategic Chat Context
 * Manages state for the strategic analysis chat interface
 * 
 * State includes:
 * - Chat messages array
 * - Current workflow step
 * - Selected items (angle, creative)
 * - IDs for API calls (analysisId, creativeGenId, videoJobId)
 * - Product context
 */

// Create context
const StrategicChatContext = createContext(null);

// Workflow steps enum
export const CHAT_STEPS = {
  WAITING_FOR_RESEARCH: 'waiting_for_research',
  SHOWING_SUMMARY: 'showing_summary',
  SELECTING_PERSONA: 'selecting_persona', // NEW: Persona selection step
  ANALYZING_ANGLES: 'analyzing_angles',
  SHOWING_ANGLES: 'showing_angles',
  GENERATING_CREATIVES: 'generating_creatives',
  SHOWING_CREATIVES: 'showing_creatives',
  GENERATING_VIDEO: 'generating_video',
  VIDEO_READY: 'video_ready',
};

// Message types enum
export const MESSAGE_TYPES = {
  TEXT: 'text',
  RESEARCH_SUMMARY: 'research_summary',
  PERSONA_SELECTOR: 'persona_selector', // NEW: Persona selector message type
  ANGLES: 'angles',
  PLATFORM_AD_LENGTH_SELECTOR: 'platform_ad_length_selector',
  CREATIVES: 'creatives',
  VIDEO: 'video',
};

/**
 * Strategic Chat Provider Component
 */
export function StrategicChatProvider({ children }) {
  // Chat messages
  const [messages, setMessages] = useState([]);
  
  // Current workflow step
  const [currentStep, setCurrentStep] = useState(CHAT_STEPS.WAITING_FOR_RESEARCH);
  
  // Product context
  const [brandId, setBrandId] = useState(null);
  const [productId, setProductId] = useState(null);
  const [researchId, setResearchId] = useState(null);
  
  // Analysis & generation IDs
  const [analysisId, setAnalysisId] = useState(null);
  const [creativeGenId, setCreativeGenId] = useState(null);
  const [videoJobId, setVideoJobId] = useState(null);
  
  // Selected items
  const [selectedAngle, setSelectedAngle] = useState(null);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null); // NEW: Selected persona
  
  // Research summary data
  const [researchSummary, setResearchSummary] = useState(null);
  
  // Personas data
  const [personas, setPersonas] = useState([]); // NEW: Available personas
  
  // Analysis result data
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Creative variations data
  const [creativeVariations, setCreativeVariations] = useState(null);
  
  // Video data
  const [videoData, setVideoData] = useState(null);

  /**
   * Add a message to the chat
   */
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: message.id || `msg-${Date.now()}-${Math.random()}`,
      sender: message.sender || 'agent', // 'agent' or 'user'
      type: message.type || MESSAGE_TYPES.TEXT,
      content: message.content || '',
      data: message.data || null,
      timestamp: message.timestamp || new Date().toISOString(),
      // Optional callbacks for interactive messages
      onAnalyzeClick: message.onAnalyzeClick || null, // For "Analyze Marketing Angles" button
      onPersonaSelect: message.onPersonaSelect || null, // For persona selection
      onPersonaSkip: message.onPersonaSkip || null, // For skipping persona selection
      onAngleSelect: message.onAngleSelect || null,
      onCreativeSelect: message.onCreativeSelect || null,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    console.log('[StrategicChatContext] Message added:', {
      type: newMessage.type,
      sender: newMessage.sender,
      hasAnalyzeHandler: !!newMessage.onAnalyzeClick,
      hasPersonaHandler: !!newMessage.onPersonaSelect
    });
  }, []);

  /**
   * Add multiple messages at once
   */
  const addMessages = useCallback((newMessages) => {
    const formattedMessages = newMessages.map((msg) => ({
      id: msg.id || `msg-${Date.now()}-${Math.random()}`,
      sender: msg.sender || 'agent',
      type: msg.type || MESSAGE_TYPES.TEXT,
      content: msg.content || '',
      data: msg.data || null,
      timestamp: msg.timestamp || new Date().toISOString(),
      onAnalyzeClick: msg.onAnalyzeClick || null,
      onAngleSelect: msg.onAngleSelect || null,
      onCreativeSelect: msg.onCreativeSelect || null,
    }));
    
    setMessages((prev) => [...prev, ...formattedMessages]);
  }, []);

  /**
   * Initialize chat with product context
   */
  const initializeChat = useCallback((brand, product, research) => {
    setBrandId(brand);
    setProductId(product);
    setResearchId(research);
    setMessages([]);
    setCurrentStep(CHAT_STEPS.WAITING_FOR_RESEARCH);
    
    console.log('[StrategicChatContext] Chat initialized:', {
      brandId: brand,
      productId: product,
      researchId: research
    });
  }, []);

  /**
   * Reset all chat state
   */
  const reset = useCallback(() => {
    setMessages([]);
    setCurrentStep(CHAT_STEPS.WAITING_FOR_RESEARCH);
    setBrandId(null);
    setProductId(null);
    setResearchId(null);
    setAnalysisId(null);
    setCreativeGenId(null);
    setVideoJobId(null);
    setSelectedAngle(null);
    setSelectedCreative(null);
    setSelectedPersona(null); // NEW: Reset persona
    setResearchSummary(null);
    setAnalysisResult(null);
    setCreativeVariations(null);
    setVideoData(null);
    setPersonas([]); // NEW: Reset personas
    
    console.log('[StrategicChatContext] Chat reset');
  }, []);

  /**
   * Clear messages but keep product context
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentStep(CHAT_STEPS.WAITING_FOR_RESEARCH);
    
    console.log('[StrategicChatContext] Messages cleared');
  }, []);

  // Context value
  const value = {
    // Messages
    messages,
    addMessage,
    addMessages,
    clearMessages,
    
    // Workflow
    currentStep,
    setCurrentStep,
    
    // Product context
    brandId,
    productId,
    researchId,
    setBrandId,
    setProductId,
    setResearchId,
    
    // IDs
    analysisId,
    setAnalysisId,
    creativeGenId,
    setCreativeGenId,
    videoJobId,
    setVideoJobId,
    
    // Selected items
    selectedAngle,
    setSelectedAngle,
    selectedCreative,
    setSelectedCreative,
    selectedPersona, // NEW: Selected persona
    setSelectedPersona, // NEW
    
    // Data
    researchSummary,
    setResearchSummary,
    analysisResult,
    setAnalysisResult,
    creativeVariations,
    setCreativeVariations,
    videoData,
    setVideoData,
    personas, // NEW: Personas list
    setPersonas, // NEW
    
    // Actions
    initializeChat,
    reset,
  };

  return (
    <StrategicChatContext.Provider value={value}>
      {children}
    </StrategicChatContext.Provider>
  );
}

/**
 * Hook to use Strategic Chat Context
 */
export function useStrategicChat() {
  const context = useContext(StrategicChatContext);
  
  if (!context) {
    throw new Error('useStrategicChat must be used within StrategicChatProvider');
  }
  
  return context;
}

export default StrategicChatContext;

