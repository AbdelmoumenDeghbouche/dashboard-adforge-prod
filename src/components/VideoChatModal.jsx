import React, { useState, useEffect, useRef } from 'react';
import { videoChatAPI } from '../services/apiService';
import { getFirebaseImageUrl } from '../utils/storageHelpers';
import { useJobNotificationContext } from '../contexts/JobNotificationContext';

const VideoChatModal = ({ isOpen, onClose, product, brandId, existingConversation = null }) => {
  // Job notification context for tracking video generation jobs
  const { trackJob } = useJobNotificationContext();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversationData, setConversationData] = useState(null); // Store full conversation including reference_image_url
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false); // Track if user clicked Start
  const [provider, setProvider] = useState('kie_story'); // Video generation provider: 'openai', 'kie', or 'kie_story'
  const [duration, setDuration] = useState(15); // Video duration in seconds
  const [platform, setPlatform] = useState('tiktok'); // Target platform: 'tiktok', 'snap', 'facebook', 'youtube'
  const [aspectRatio, setAspectRatio] = useState('9:16'); // Aspect ratio: '9:16' or '16:9'
  const [language, setLanguage] = useState('en'); // Language: ISO 639-1 code
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isResumingConversation, setIsResumingConversation] = useState(false);
  const hasInitializedRef = useRef(false);
  const [conversationVideos, setConversationVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Debug product data when component mounts or product changes
  useEffect(() => {
    if (product) {
      console.log('[VideoChatModal] Product data received:', product);
      console.log('[VideoChatModal] Product image URLs:', {
        main_image_url: product.main_image_url,
        imageUrl: product.imageUrl,
        productId: product.productId,
        name: product.name,
        productName: product.productName
      });
    }
  }, [product]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize or resume conversation when modal opens
  useEffect(() => {
    if (isOpen && product) {
      console.log('[VideoChatModal] useEffect triggered - isOpen:', isOpen, 'existingConversation:', existingConversation, 'hasInitialized:', hasInitializedRef.current);
      
      // Prevent duplicate initialization
      if (hasInitializedRef.current) {
        console.log('[VideoChatModal] Already initialized, skipping');
        return;
      }
      
      if (existingConversation && existingConversation.conversation_id) {
        // Resume existing conversation
        console.log('[VideoChatModal] Will resume existing conversation:', existingConversation.conversation_id);
        console.log('[VideoChatModal] existingConversation object:', JSON.stringify(existingConversation, null, 2));
        
        // Pre-populate from existingConversation if available (before async fetch)
        if (existingConversation.duration) {
          setDuration(existingConversation.duration);
          console.log('[VideoChatModal] ✅ Pre-populated duration from existingConversation:', existingConversation.duration);
        } else {
          console.warn('[VideoChatModal] ⚠️ existingConversation.duration is missing, will wait for getVideoConversation API');
        }
        
        if (existingConversation.provider) {
          setProvider(existingConversation.provider);
          console.log('[VideoChatModal] ✅ Pre-populated provider from existingConversation:', existingConversation.provider);
        } else {
          console.warn('[VideoChatModal] ⚠️ existingConversation.provider is missing, will wait for getVideoConversation API');
        }
        
        // Pre-populate platform, aspect_ratio, language if available
        if (existingConversation.platform) {
          setPlatform(existingConversation.platform);
        }
        if (existingConversation.aspect_ratio) {
          setAspectRatio(existingConversation.aspect_ratio);
        }
        if (existingConversation.language) {
          setLanguage(existingConversation.language);
        }
        
        hasInitializedRef.current = true;
        resumeExistingConversation();
      }
      // NOTE: For NEW conversations, we now wait for user to click Start button
      // (after configuring duration/provider settings) before creating the conversation
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product, existingConversation?.conversation_id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log('[VideoChatModal] Modal closing - resetting all state');
      setMessages([]);
      setInputText('');
      setError('');
      setIsSending(false);
      setConversationId(null);
      setConversationData(null); // Clear conversation data including reference_image_url
      setIsGenerating(false);
      setVideoGenerated(false);
      setExistingVideoUrl(null);
      setConversationStarted(false); // Reset conversation started state
      setIsResumingConversation(false);
      setIsInitializing(false);
      setProvider('kie_story'); // Reset provider to default
      setDuration(15); // Reset duration to default
      setPlatform('tiktok'); // Reset platform to default
      setAspectRatio('9:16'); // Reset aspect ratio to default
      setLanguage('en'); // Reset language to default
      hasInitializedRef.current = false; // Reset initialization flag
      setConversationVideos([]); // Reset videos
    }
  }, [isOpen]);

  const resumeExistingConversation = async () => {
    if (!existingConversation || !product || !brandId) {
      console.error('[VideoChatModal] Missing data for resuming conversation');
      return;
    }

    setIsResumingConversation(true);
    setError('');

    try {
      console.log('[VideoChatModal] Resuming conversation:', existingConversation.conversation_id);
      
      // Set conversation ID
      setConversationId(existingConversation.conversation_id);
      
      // Fetch full conversation history
      const response = await videoChatAPI.getVideoConversation(
        brandId,
        product.productId,
        existingConversation.conversation_id
      );

      console.log('[VideoChatModal] Conversation loaded:', response);

      if (response.success && response.data) {
        // Store full conversation data including reference_image_url
        setConversationData(response.data);
        console.log('[VideoChatModal] Stored conversation data with reference_image_url:', response.data.reference_image_url);
        console.log('[VideoChatModal] Full conversation data:', JSON.stringify(response.data, null, 2));
        
        // Restore duration, provider, platform, and language from conversation data if available
        if (response.data.duration) {
          setDuration(response.data.duration);
          console.log('[VideoChatModal] ✅ Restored duration:', response.data.duration);
        } else {
          console.warn('[VideoChatModal] ⚠️ No duration found in conversation data');
        }
        
        if (response.data.provider) {
          setProvider(response.data.provider);
          console.log('[VideoChatModal] ✅ Restored provider:', response.data.provider);
        } else {
          console.warn('[VideoChatModal] ⚠️ No provider found in conversation data');
        }
        
        // Restore platform, aspect_ratio, language if available
        if (response.data.platform) {
          setPlatform(response.data.platform);
        }
        if (response.data.aspect_ratio) {
          setAspectRatio(response.data.aspect_ratio);
        }
        if (response.data.language) {
          setLanguage(response.data.language);
        }
        if (response.data.platform) {
          setPlatform(response.data.platform);
          console.log('[VideoChatModal] Restored platform:', response.data.platform);
        }
        if (response.data.language) {
          setLanguage(response.data.language);
          console.log('[VideoChatModal] Restored language:', response.data.language);
        }
        
        // Convert messages to proper format
        const allMessages = (response.data.messages || []).map((msg, index) => ({
          messageId: `msg-${index}`,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
          role: msg.role
        }));

        // Filter out backend-only message patterns
        const filteredMessages = filterBackendMessages(allMessages);

        setMessages(filteredMessages);
        console.log('[VideoChatModal] Loaded', allMessages.length, 'messages,', filteredMessages.length, 'displayed after filtering');

        // Mark conversation as started since we're resuming an existing one
        setConversationStarted(true);

        // Check video status
        if (response.data.video_status === 'completed' && response.data.video_url) {
          setVideoGenerated(true);
        }
        
        // Store existing video URL if present
        if (response.data.video_url) {
          setExistingVideoUrl(response.data.video_url);
        }

        // Fetch all videos for this conversation
        fetchConversationVideos();
      } else {
        setError('Impossible de charger la conversation');
      }
    } catch (err) {
      console.error('[VideoChatModal] Error resuming conversation:', err);
      setError('Erreur lors du chargement de la conversation');
    } finally {
      setIsResumingConversation(false);
    }
  };

  const fetchConversationVideos = async () => {
    if (!conversationId || !brandId || !product) {
      console.log('[VideoChatModal] Cannot fetch videos - missing required data:', {
        conversationId: !!conversationId,
        brandId: !!brandId,
        product: !!product
      });
      return;
    }

    setLoadingVideos(true);
    try {
      console.log('[VideoChatModal] Fetching videos for conversation:', conversationId);
      const response = await videoChatAPI.getConversationVideos(
        brandId,
        product.productId,
        conversationId
      );

      if (response.success && response.data?.videos) {
        console.log('[VideoChatModal] ✅ Loaded', response.data.videos.length, 'video(s)');
        setConversationVideos(response.data.videos);
      } else {
        console.log('[VideoChatModal] No videos found or empty response');
        setConversationVideos([]);
      }
    } catch (err) {
      console.error('[VideoChatModal] Error fetching videos:', err);
      setConversationVideos([]); // Set to empty array on error
    } finally {
      setLoadingVideos(false);
    }
  };

  // Fetch videos whenever conversationId changes or modal opens
  useEffect(() => {
    if (isOpen && conversationId && brandId && product) {
      console.log('[VideoChatModal] Modal opened with conversation, fetching videos...');
      fetchConversationVideos();
    }
  }, [isOpen, conversationId, brandId, product]);

  // Filter out backend-only messages (3-message pattern: user -> user -> assistant)
  const filterBackendMessages = (messages) => {
    const backendUserMessages = [
      'give me the full sora prompt and make sure it is less than 5000 characters, while including all the user mentioned details',
      "I'm ready! Please provide the complete natural language description of my video ad concept covering: Core Vision, Emotional Core, Visual Identity, Key Scenes, Product Presentation, Target Audience Emotion, and Conversion Logic. Remember to provide this as a detailed natural language description, NOT as a technical JSON prompt.",
      "I'm ready! IN LESS THAN 4500 CHARACTERS, Please provide the complete natural language description of my video ad concept covering: Core Vision, Emotional Core, Visual Identity, Key Scenes, Product Presentation, Target Audience Emotion, and Conversion Logic. Remember to provide this as a detailed natural language description, NOT as a technical JSON prompt.",
      'give me the full sora prompt'
    ];

    const filtered = [];
    
    // ALWAYS skip the first 2 messages (index 0 and 1) - they are the initial hidden system prompt
    // Start from index 2 onwards
    let i = 2;
    console.log('[VideoChatModal] Always skipping first 2 messages (index 0 and 1)');

    while (i < messages.length) {
      const currentMsg = messages[i];
      const nextMsg = messages[i + 1];
      const afterNextMsg = messages[i + 2];

      // Check for the 3-message pattern: user (backend msg 1) -> user (backend msg 2) -> assistant
      if (
        i + 2 < messages.length &&
        currentMsg.role === 'user' &&
        nextMsg.role === 'user' &&
        afterNextMsg.role === 'assistant'
      ) {
        // Check if both user messages are backend messages
        const isFirstBackend = backendUserMessages.some(backendMsg =>
          currentMsg.content.toLowerCase().includes(backendMsg.toLowerCase()) ||
          backendMsg.toLowerCase().includes(currentMsg.content.toLowerCase())
        );
        
        const isSecondBackend = backendUserMessages.some(backendMsg =>
          nextMsg.content.toLowerCase().includes(backendMsg.toLowerCase()) ||
          backendMsg.toLowerCase().includes(nextMsg.content.toLowerCase())
        );

        if (isFirstBackend && isSecondBackend) {
          console.log('[VideoChatModal] Filtering out backend pattern at index', i);
          console.log('[VideoChatModal] - User msg 1:', currentMsg.content.substring(0, 50) + '...');
          console.log('[VideoChatModal] - User msg 2:', nextMsg.content.substring(0, 50) + '...');
          console.log('[VideoChatModal] - Assistant response:', afterNextMsg.content.substring(0, 50) + '...');
          // Skip all 3 messages
          i += 3;
          continue;
        }
      }

      // Check for single backend message followed by assistant response
      if (
        i + 1 < messages.length &&
        currentMsg.role === 'user' &&
        nextMsg.role === 'assistant'
      ) {
        const isBackend = backendUserMessages.some(backendMsg =>
          currentMsg.content.toLowerCase().includes(backendMsg.toLowerCase()) ||
          backendMsg.toLowerCase().includes(currentMsg.content.toLowerCase())
        );

        if (isBackend) {
          console.log('[VideoChatModal] Filtering out single backend message at index', i);
          console.log('[VideoChatModal] - User msg:', currentMsg.content.substring(0, 50) + '...');
          console.log('[VideoChatModal] - Assistant response:', nextMsg.content.substring(0, 50) + '...');
          // Skip both messages
          i += 2;
          continue;
        }
      }

      // Keep this message
      filtered.push(currentMsg);
      i++;
    }

    return filtered;
  };

  const initializeConversation = async () => {
    if (!product || !brandId) {
      console.error('[VideoChatModal] Missing product or brandId:', { product, brandId });
      return;
    }
    
    setIsInitializing(true);
    setError('');
    
    try {
      console.log('[VideoChatModal] Creating video conversation for product:', product);
      console.log('[VideoChatModal] Product ID:', product.productId);
      console.log('[VideoChatModal] Brand ID:', brandId);
      console.log('[VideoChatModal] Duration:', duration, 'seconds');
      console.log('[VideoChatModal] Provider:', provider);
      
      // Create conversation with product's main image as reference (prioritize selectedImageUrl)
      // Product is optional - if no product, use avatar-only mode
      const productId = product?.productId || null;
      const imageUrl = product ? (product.selectedImageUrl || product.main_image_url || product.imageUrl || product.image || (product.images && product.images[0]) || '') : '';
      
      if (productId) {
        console.log('[VideoChatModal] Creating PRODUCT-FOCUSED video conversation');
        console.log('[VideoChatModal] Product object:', product);
      } else {
        console.log('[VideoChatModal] Creating AVATAR-ONLY video conversation (no product)');
      }
      console.log('[VideoChatModal] Reference image URL:', imageUrl);
      
      // Create conversation with duration, provider, platform, aspect_ratio, and language
      const response = await videoChatAPI.createVideoConversation(
        brandId,
        productId,   // Pass null for avatar-only videos
        imageUrl,
        duration,    // Pass duration to conversation creation
        provider,    // Pass provider to conversation creation
        platform,    // Pass platform to conversation creation
        aspectRatio, // Pass aspect ratio to conversation creation
        language     // Pass language to conversation creation
      );
      
      console.log('[VideoChatModal] Create conversation response:', response);
      
      if (response.success && response.data) {
        const convId = response.data.conversation_id;
        setConversationId(convId);
        
        // Store conversation data including reference_image_url, duration, provider, platform, and language
        setConversationData({
          conversation_id: convId,
          reference_image_url: imageUrl,
          duration: duration,
          provider: provider,
          platform: platform,
          language: language,
          ...response.data
        });
        
        console.log('[VideoChatModal] ✅ Conversation created with ID:', convId);
        console.log('[VideoChatModal] ✅ GPT-5 now knows: duration =', duration, 's, provider =', provider);
        console.log('[VideoChatModal] Saved reference_image_url:', imageUrl);
        console.log('[VideoChatModal] Conversation ready - waiting for user to click Start');
      } else {
        console.error('[VideoChatModal] Failed to create conversation - invalid response:', response);
        setError('Failed to create conversation');
      }
    } catch (err) {
      console.error('[VideoChatModal] Error initializing conversation:', err);
      console.error('[VideoChatModal] Error stack:', err.stack);
      setError(err.message || 'Failed to initialize conversation');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStartConversation = async () => {
    // If conversation already exists (resuming), just mark as started
    if (conversationId) {
      console.log('[VideoChatModal] Conversation already exists, starting chat...');
      setConversationStarted(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return;
    }

    // For new conversations: create conversation with user-selected duration and provider
    console.log('[VideoChatModal] Creating new conversation with settings:', { duration, provider });
    
    try {
      // Mark that initialization has started
      hasInitializedRef.current = true;
      
      // Create the conversation
      await initializeConversation();
      
      // Mark conversation as started (initializeConversation sets conversationId)
      setConversationStarted(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error('[VideoChatModal] Failed to create conversation:', error);
      // Error is already set in initializeConversation
      hasInitializedRef.current = false; // Allow retry
    }
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const messageText = customText || inputText.trim();
    if (!messageText || !conversationId || isSending) return;

    // Add user message to UI
    const userMessage = {
      messageId: `temp-${Date.now()}`,
      content: messageText,
      timestamp: new Date().toISOString(),
      role: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    
    setInputText('');
    setIsSending(true);
    setError('');

    try {
      console.log('[VideoChatModal] Sending message:', messageText);
      
      const response = await videoChatAPI.sendVideoMessage(
        brandId,
        product.productId,
        conversationId,
        messageText,
        false // Not finishing yet
      );
      
      console.log('[VideoChatModal] Full API response:', response);
      
      // Handle the response structure
      let aiResponseText = '';
      if (response.success && response.data) {
        aiResponseText = response.data.response;
      } else if (response.response) {
        aiResponseText = response.response;
      } else {
        throw new Error('Invalid response structure from API');
      }
      
      console.log('[VideoChatModal] AI response text:', aiResponseText);
      
      if (aiResponseText) {
        const aiMessage = {
          messageId: `ai-${Date.now()}`,
          content: aiResponseText,
          timestamp: new Date().toISOString(),
          role: 'assistant',
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('No response text received from AI');
      }
    } catch (err) {
      console.error('[VideoChatModal] Error sending message:', err);
      
      // Show user-friendly error message
      const errorMessage = err.message || err.response?.data?.message || '';
      setError(errorMessage || 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
      
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.messageId.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!conversationId || isGenerating) return;

    // Inform user that a new video will be added (multiple videos are now supported)
    if (existingVideoUrl || conversationVideos.length > 0) {
      const videoCount = conversationVideos.length || 1;
      const confirmGenerate = window.confirm(
        `✨ Cette conversation a déjà ${videoCount} vidéo${videoCount > 1 ? 's' : ''}. Une nouvelle vidéo sera ajoutée à la liste. Voulez-vous continuer ?`
      );
      if (!confirmGenerate) {
        return;
      }
    }

    setIsGenerating(true);
    setError('');

    try {
      console.log('[VideoChatModal] Finalizing conversation...');
      
      // Step 1: Send final message with finish=true to get the Sora prompt JSON from AI
      const finishResponse = await videoChatAPI.sendVideoMessage(
        brandId,
        product.productId,
        conversationId,
        "I'm ready to generate the video",
        true // finish=true - tells backend conversation is done, AI returns the prompt JSON
      );

      if (!finishResponse.success || !finishResponse.data) {
        throw new Error('Failed to finalize conversation');
      }

      const finalAIResponse = finishResponse.data.response;
      console.log('[VideoChatModal] Final AI response received');
      console.log('[VideoChatModal] Full response length:', finalAIResponse.length, 'characters');
      console.log('[VideoChatModal] Response preview:', finalAIResponse.substring(0, 300) + '...');

      // Step 2: Create sora_prompt object with full AI response as prompt
      const videoDuration = conversationData?.duration || duration;
      const videoProvider = conversationData?.provider || provider;
      
      const soraPromptJSON = {
        prompt: finalAIResponse,  // Full AI response as the prompt
        duration: videoDuration    // Add duration to the object
      };
      
      console.log('[VideoChatModal] ✅ Created sora_prompt object with FULL AI message');
      console.log('[VideoChatModal] - Full AI message length:', finalAIResponse.length, 'characters');
      console.log('[VideoChatModal] - Provider:', videoProvider);
      console.log('[VideoChatModal] - Duration:', videoDuration, 'seconds (set at conversation creation)');

      // Step 4: Get reference image URL
      const imageUrl = conversationData?.reference_image_url || product.selectedImageUrl || product.main_image_url || product.imageUrl || product.image || (product.images && product.images[0]) || '';
      console.log('[VideoChatModal] Using reference image:', imageUrl);

      // Step 5: Trigger video generation with modified JSON object (including provider)
      console.log('[VideoChatModal] Triggering video generation with full context...');
      
      const generationResponse = await videoChatAPI.triggerVideoGeneration(
        brandId,
        product.productId,
        conversationId,
        soraPromptJSON,  // ← JSON object with FULL AI message in "prompt" field + duration
        '',              // Empty analysis - not needed
        imageUrl,
        videoProvider    // ← Provider selection from conversation creation: 'openai' or 'kie_story'
      );

      if (generationResponse.success) {
        console.log('[VideoChatModal] ✅ Video generation triggered successfully');
        console.log('[VideoChatModal] Job ID:', generationResponse.data?.job_id);
        
        // Track the video generation job for notifications
        if (generationResponse.data?.job_id) {
          trackJob(generationResponse.data.job_id, 'video_generation', {
            brandId: brandId,
            productId: product.productId,
            conversationId: conversationId,
            productName: product.productName || product.name,
            provider: videoProvider,
            duration: videoDuration,
          });
          console.log('[VideoChatModal] 🔔 Tracking video generation job:', generationResponse.data.job_id);
        }
        
        setVideoGenerated(true);
        
        // Refresh videos list after generation
        setTimeout(() => fetchConversationVideos(), 2000);
      } else {
        throw new Error('Failed to trigger video generation');
      }
    } catch (err) {
      console.error('[VideoChatModal] Error generating video:', err);
      
      // Check if error is related to character limits or prompt length
      const errorMessage = err.message || err.response?.data?.message || '';
      const isCharacterLimitError = 
        errorMessage.toLowerCase().includes('character') ||
        errorMessage.toLowerCase().includes('5000') ||
        errorMessage.toLowerCase().includes('4500') ||
        errorMessage.toLowerCase().includes('video_description') ||
        errorMessage.toLowerCase().includes('too long') ||
        errorMessage.toLowerCase().includes('exceed');
      
      if (isCharacterLimitError) {
        setError(
          '🔄 La description générée est trop longue. Veuillez réessayer - parfois les services d\'IA peuvent générer des réponses plus longues que prévu. C\'est indépendant de notre contrôle. Merci de votre compréhension !'
        );
      } else {
        setError(err.message || 'Une erreur est survenue lors de la génération de la vidéo. Veuillez réessayer.');
      }
      
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    console.log('[VideoChatModal] Modal is closed, not rendering');
    return null;
  }

  console.log('[VideoChatModal] Rendering modal - conversationId:', conversationId, 'messages:', messages.length);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#262626] w-full max-w-[95vw] h-[92vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg sm:text-xl font-bold font-poppins">Créer une vidéo publicitaire</h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                {product ? (product.productName || product.name || 'Produit') : '📹 Avatar uniquement (sans produit)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#262626] rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Product Image */}
          <div className="w-[35%] p-6 border-r border-[#262626] flex flex-col">
            <h3 className="text-white text-sm font-semibold mb-3 font-poppins">Produit</h3>
            <div className="flex-1 bg-[#0F0F0F] rounded-xl border border-[#262626] overflow-hidden flex items-center justify-center p-4">
              {(() => {
                // Prioritize reference_image_url from conversation, then fall back to product images
                const imageUrl = conversationData?.reference_image_url || product?.selectedImageUrl || product?.main_image_url || product?.imageUrl || product?.image || product?.images?.[0];
                console.log('[VideoChatModal] Product image URL check:', {
                  reference_image_url_from_conversation: conversationData?.reference_image_url,
                  selectedImageUrl: product?.selectedImageUrl,
                  main_image_url: product?.main_image_url,
                  imageUrl: product?.imageUrl,
                  image: product?.image,
                  firstImageInArray: product?.images?.[0],
                  finalUrl: imageUrl,
                  source: conversationData?.reference_image_url ? 'conversation' : 'product'
                });
                
                return imageUrl ? (
                  <img
                    src={getFirebaseImageUrl(imageUrl)}
                    alt={product.productName || product.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onLoad={() => console.log('[VideoChatModal] Image loaded successfully')}
                    onError={(e) => {
                      console.error('[VideoChatModal] Image load error for URL:', imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Aucune image</p>
                  </div>
                );
              })()}
            </div>
            
            {/* Product Info */}
            {product ? (
              <div className="mt-4 p-4 bg-[#0F0F0F] rounded-xl border border-[#262626]">
                <h4 className="text-white text-sm font-semibold mb-2">{product.productName || product.name}</h4>
                {product.description && (
                  <p className="text-gray-400 text-xs line-clamp-3">{product.description}</p>
                )}
                {product.price && (
                  <p className="text-purple-400 text-sm font-semibold mt-2">{product.price}</p>
                )}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-blue-400 text-sm font-semibold mb-1">Mode Avatar Uniquement</h4>
                    <p className="text-blue-300/80 text-xs">
                      Création de vidéo avec avatar et script uniquement, sans intégration de produit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Videos - Show when conversation exists */}
            {conversationId && (
              <div className="mt-4 overflow-y-auto max-h-[400px]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                    Vidéos générées
                    {conversationVideos.length > 0 && (
                      <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-[10px] font-medium rounded-full">
                        {conversationVideos.length}
                      </span>
                    )}
                  </h4>
                  {loadingVideos && (
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                {conversationVideos.length > 0 ? (
                  <div className="space-y-3">
                    {conversationVideos.map((video, index) => (
                      <div key={video.sora_job_id || index} className="bg-[#1A1A1A] rounded-lg border border-[#262626] p-3 hover:border-purple-500/50 transition-colors">
                        {video.video_url ? (
                          <div className="space-y-2">
                            {/* Latest badge */}
                            {video.is_latest && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600/20 text-purple-400 text-[10px] font-medium rounded-full">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Plus récente
                              </span>
                            )}
                            <video 
                              src={video.video_url} 
                              controls 
                              className="w-full rounded-lg bg-black"
                              style={{ maxHeight: '200px' }}
                            />
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  {new Date(video.created_at).toLocaleDateString('fr-FR', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="text-green-400 font-medium">✓ Complété</span>
                              </div>
                              {/* Video metadata */}
                              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                {video.duration && (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {video.duration}s
                                  </span>
                                )}
                                {video.size && (
                                  <span>• {video.size}</span>
                                )}
                                {video.provider && (
                                  <span className="px-1.5 py-0.5 bg-gray-800 rounded">
                                    {video.provider === 'openai' ? 'OpenAI Sora' : video.provider === 'kie' ? 'KIE Sora' : video.provider}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : video.status === 'processing' || video.status === 'queued' ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>{video.status === 'queued' ? 'En attente...' : 'Génération en cours...'}</span>
                          </div>
                        ) : video.status === 'failed' ? (
                          <div className="text-sm text-red-400">
                            ❌ Échec de la génération
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : !loadingVideos && conversationStarted ? (
                  <p className="text-gray-500 text-xs text-center py-4">
                    Aucune vidéo générée pour le moment
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Right: Chat Interface */}
          <div className="w-[65%] flex flex-col bg-[#0F0F0F]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(isInitializing || isResumingConversation) ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">
                  {isResumingConversation ? 'Chargement de la conversation...' : 'Initialisation de la conversation...'}
                </p>
              </div>
            ) : !conversationStarted ? (
                <div className="flex flex-col items-center justify-start h-full text-center px-6 overflow-y-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mt-6">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-4 font-poppins">Configurer votre vidéo</h3>
                  <p className="text-gray-400 text-sm max-w-md mb-6">
                    Choisissez les paramètres de génération avant de commencer
                  </p>

                  {/* Video Generation Settings - BEFORE conversation starts */}
                  <div className="w-full max-w-md space-y-4 mb-6">
                    {/* Provider Selection */}
                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626] space-y-2 text-left">
                      <label className="text-gray-300 text-xs font-medium">Fournisseur</label>
                      <select
                        value={provider}
                        onChange={(e) => {
                          const newProvider = e.target.value;
                          setProvider(newProvider);
                          
                          // Set default duration based on provider
                          if (newProvider === 'openai') {
                            setDuration(12); // OpenAI default: 12s
                          } else if (newProvider === 'kie') {
                            setDuration(15); // KIE default: 15s
                          } else if (newProvider === 'kie_story') {
                            setDuration(15); // KIE STORY default: 15s
                          }
                        }}
                        disabled={isInitializing}
                        className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                      >
                        <option value="openai">OpenAI Sora 2 Pro (8s/12s)</option>
                        <option value="kie">KIE Sora 2 Pro (10s/15s)</option>
                        <option value="kie_story">KIE Sora 2 Pro Storyboard (10s/15s/25s) ⭐</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        {provider === 'openai' && '⚡ Scène unique rapide. Défaut: 12s'}
                        {provider === 'kie' && '🎬 Scène unique longue. Défaut: 15s'}
                        {provider === 'kie_story' && '📖 3 scènes (Hook→Value→CTA). Défaut: 15s'}
                      </p>
                    </div>

                    {/* Platform Selection */}
                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626] space-y-2 text-left">
                      <label className="text-gray-300 text-xs font-medium">Plateforme</label>
                      <select
                        value={platform}
                        onChange={(e) => {
                          const newPlatform = e.target.value;
                          setPlatform(newPlatform);
                          // Auto-adjust aspect ratio based on platform
                          if (newPlatform === 'youtube') {
                            setAspectRatio('16:9'); // Horizontal for YouTube
                          } else {
                            setAspectRatio('9:16'); // Vertical for TikTok/Snap/Facebook
                          }
                        }}
                        disabled={isInitializing}
                        className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                      >
                        <option value="tiktok">TikTok (rapide, Gen Z)</option>
                        <option value="snap">Snapchat (authentique)</option>
                        <option value="facebook">Facebook (storytelling)</option>
                        <option value="youtube">YouTube (long format)</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        {platform === 'tiktok' && 'Hook en 0.5s, coupes rapides'}
                        {platform === 'snap' && 'Vrai & casual, vibe ami-à-ami'}
                        {platform === 'facebook' && 'Large audience, CTAs clairs'}
                        {platform === 'youtube' && 'Storytelling, éducation'}
                      </p>
                    </div>

                    {/* Aspect Ratio Selection */}
                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626] space-y-2 text-left">
                      <label className="text-gray-300 text-xs font-medium">Format</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        disabled={isInitializing}
                        className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                      >
                        <option value="9:16">9:16 (Vertical - Mobile)</option>
                        <option value="16:9">16:9 (Horizontal - Desktop)</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        {aspectRatio === '9:16' ? 'TikTok, Snapchat, Stories' : 'YouTube, Facebook Desktop'}
                      </p>
                    </div>

                    {/* Language Selection */}
                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626] space-y-2 text-left">
                      <label className="text-gray-300 text-xs font-medium">Langue</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isInitializing}
                        className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                        <option value="ar">العربية</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                        <option value="pt">Português</option>
                        <option value="it">Italiano</option>
                        <option value="ru">Русский</option>
                        <option value="hi">हिंदी</option>
                        <option value="tr">Türkçe</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        L'IA posera des questions dans cette langue
                      </p>
                    </div>

                    {/* Duration Selection */}
                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626] space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300 text-xs font-medium">Durée</label>
                        <span className="text-purple-400 text-sm font-bold">{duration}s</span>
                      </div>
                      
                      {(provider === 'openai' || provider === 'kie') ? (
                        <>
                          {/* OpenAI/KIE: Dropdown with exact valid durations */}
                          <select
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            disabled={isInitializing}
                            className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                          >
                            {provider === 'openai' && (
                              <>
                                <option value={8}>8 secondes</option>
                                <option value={12}>12 secondes</option>
                              </>
                            )}
                            {provider === 'kie' && (
                              <>
                                <option value={10}>10 secondes</option>
                                <option value={15}>15 secondes</option>
                              </>
                            )}
                          </select>
                          <p className="text-xs text-gray-500">
                            {provider === 'openai' ? 'Valeurs: 8s ou 12s seulement' : 'Valeurs: 10s ou 15s seulement'}
                          </p>
                        </>
                      ) : (
                        <>
                          {/* KIE STORY: Preset buttons 10, 15, 25s */}
                          <div className="grid grid-cols-3 gap-2">
                            {[10, 15, 25].map((value) => (
                              <button
                                key={value}
                                onClick={() => setDuration(value)}
                                disabled={isInitializing}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                  duration === value
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'bg-[#0F0F0F] text-gray-400 border border-[#262626] hover:border-purple-500 hover:text-purple-400'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {value}s
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            Hook (25%) → Value (50%) → CTA (25%)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-yellow-500 mb-4 max-w-md">
                    💡 L'IA connaîtra ces paramètres dès le début de la conversation
                  </p>
                </div>
              ) : videoGenerated ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-3 font-poppins">Vidéo Validée !</h3>
                  <p className="text-gray-400 text-base max-w-md mb-2">
                    Votre vidéo a été validée et est en cours de génération. Ce processus peut prendre quelques minutes.
                  </p>
                  <p className="text-purple-400 text-sm mb-6">
                    Vous recevrez un email une fois la génération terminée.
                  </p>
                  <button
                    onClick={() => setVideoGenerated(false)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à la conversation
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.messageId}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                    >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-[#1A1A1A] border border-[#262626] text-gray-200'
                          }`}
                        >
                          <p className="text-sm font-poppins whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-2">
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isSending && (
                    <div className="flex justify-start animate-slideUp">
                      <div>
                        <div className="rounded-xl px-4 py-3 bg-[#1A1A1A] border border-[#262626] w-fit">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-2">
                          L'assistant écrit...
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-shake">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input and Generate Button */}
            {!videoGenerated && !isInitializing && (
              <>
                {/* Show Start button if conversation not started, otherwise show chat input and Generate button */}
                {!conversationStarted ? (
                  <div className="p-4 border-t border-[#262626]">
                    <button
                      onClick={handleStartConversation}
                      disabled={isInitializing || isSending}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                    >
                      {isInitializing ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Création de la conversation...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Commencer</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-3">
                      {conversationId ? 'Conversation créée - Cliquez pour commencer' : 'Cliquez pour créer et commencer la conversation'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Display Selected Settings (Read-only) */}
                    <div className="px-4 py-2 border-t border-[#262626] bg-[#0F0F0F]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-gray-400">
                            <span className="text-gray-500">Fournisseur:</span> 
                            <span className="text-purple-400 font-semibold ml-1">
                              {(() => {
                                const p = conversationData?.provider || provider;
                                if (p === 'openai') return 'OpenAI';
                                if (p === 'kie') return 'KIE';
                                return 'KIE Story';
                              })()}
                            </span>
                          </span>
                          <span className="text-gray-400">
                            <span className="text-gray-500">Durée:</span> 
                            <span className="text-purple-400 font-semibold ml-1">{conversationData?.duration || duration}s</span>
                          </span>
                          <span className="text-gray-400">
                            <span className="text-gray-500">Plateforme:</span> 
                            <span className="text-purple-400 font-semibold ml-1 capitalize">{conversationData?.platform || platform}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">
                            <span className="text-gray-500">Format:</span> 
                            <span className="text-purple-400 font-semibold ml-1">{conversationData?.aspect_ratio || aspectRatio}</span>
                          </span>
                          <span className="text-gray-400">
                            <span className="text-gray-500">Langue:</span> 
                            <span className="text-purple-400 font-semibold ml-1">{(conversationData?.language || language).toUpperCase()}</span>
                          </span>
                        </div>
                        <span className="text-gray-600 text-[10px]">
                          ✓ Configuration enregistrée
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-[#262626]">
                      <button
                        onClick={handleGenerateVideo}
                        disabled={isGenerating || messages.length < 3}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Validation en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Valider et Générer la Vidéo</span>
                          </>
                        )}
                      </button>
                      {messages.length < 3 ? (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Répondez aux questions de l'IA avant de valider
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-500 text-center mt-2 font-medium">
                          ⚠️ Appuyez seulement quand la description finale est générée
                        </p>
                      )}
                    </div>

                    <div className="p-4 border-t border-[#262626]">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Répondez à la question..."
                          disabled={isSending || isInitializing}
                          className="flex-1 px-4 py-3 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-xl transition-all duration-200 outline-none placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                        />
                        <button
                          type="submit"
                          disabled={!inputText.trim() || isSending || isInitializing}
                          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                        >
                          {isSending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Envoi...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              <span>Envoyer</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatModal;

