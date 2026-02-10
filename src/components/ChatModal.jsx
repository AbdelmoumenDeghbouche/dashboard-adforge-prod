import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, adsAPI } from '../services/apiService';

const ChatModal = ({ isOpen, onClose, imageData }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [error, setError] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedBackend, setSelectedBackend] = useState('kie'); // 'openai' or 'kie' (kie is default)
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Remix state
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixJobId, setRemixJobId] = useState(null);
  const [remixProgress, setRemixProgress] = useState(null);
  const [remixedAds, setRemixedAds] = useState([]);
  const [showRemixResults, setShowRemixResults] = useState(false);
  const remixPollIntervalRef = useRef(null);
  
  // Track failed polls for 404 handling
  const failedPollsRef = useRef({});

  // Reset state when imageData changes (new image selected)
  React.useEffect(() => {
    if (imageData?.firebase_url && imageData?.conversation_id) {
      // Set current image to the provided image
      setCurrentImageUrl(imageData.firebase_url);
      // By default, select the first image for modification
      setSelectedImageUrl(imageData.firebase_url);
    }
    // Reset conversation state for the new image
    setConversationId(imageData?.conversation_id || null);
    setMessages([]);
    setError('');
  }, [imageData]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('[ChatModal] 📨 Messages updated, count:', messages.length);
    if (messages.length > 0) {
      console.log('[ChatModal] Latest message:', messages[messages.length - 1]);
    }
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('[ChatModal] 🖼️ Current image URL changed to:', currentImageUrl);
  }, [currentImageUrl]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize conversation or load existing one
  useEffect(() => {
    if (isOpen && conversationId && imageData) {
      loadConversation();
    } else if (isOpen && !conversationId && imageData) {
      initializeConversation();
    }
  }, [isOpen, conversationId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputText('');
      setError('');
      setIsSending(false);
      setIsLoading(false);
      setIsRemixing(false);
      setRemixJobId(null);
      setRemixProgress(null);
      setRemixedAds([]);
      setShowRemixResults(false);
      // Clear polling interval
      if (remixPollIntervalRef.current) {
        clearInterval(remixPollIntervalRef.current);
        remixPollIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (remixPollIntervalRef.current) {
        clearInterval(remixPollIntervalRef.current);
      }
    };
  }, []);

  const initializeConversation = async () => {
    setIsLoading(true);
    setError('');
    try {
      // If ad already has a conversation_id from bulk generation, use that
      if (imageData.conversation_id && imageData.brand_id && imageData.product_id) {
        const response = await chatAPI.getConversation(
          imageData.brand_id,
          imageData.product_id,
          imageData.conversation_id
        );
        
        setConversationId(imageData.conversation_id);
        setMessages(response.messages || []);
        
        // Set the current image URL from response
        if (response.currentImageUrl) {
          setCurrentImageUrl(response.currentImageUrl);
        }
        
        // If no messages yet, get the first image from the conversation for selection
        if (response.messages && response.messages.length > 0) {
          const firstMessage = response.messages[0];
          if (firstMessage.imageUrl) {
            console.log('[ChatModal] Setting first image as selected for modification');
            setSelectedImageUrl(firstMessage.imageUrl);
          }
        } else if (imageData.firebase_url) {
          setSelectedImageUrl(imageData.firebase_url);
        }
      } else {
        // Missing required data
        setError('Données manquantes (brand_id, product_id ou conversation_id). Veuillez régénérer l\'annonce.');
      }
    } catch (err) {
      console.error('Error initializing conversation:', err);
      
      // More specific error messages
      if (err.response?.status === 404 || err.message.includes('404') || err.message.includes('not found')) {
        setError('Conversation non trouvée. Cette image n\'a peut-être pas encore de conversation associée.');
      } else if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
        setError('Erreur de connexion. Veuillez vérifier votre connexion et réessayer.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Erreur lors de l\'initialisation de la conversation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!imageData.brand_id || !imageData.product_id || !conversationId) {
        setError('Données manquantes pour charger la conversation.');
        return;
      }
      
      const response = await chatAPI.getConversation(
        imageData.brand_id,
        imageData.product_id,
        conversationId
      );
      
      setMessages(response.messages || []);
      
      // Set the current image URL from response
      if (response.currentImageUrl) {
        setCurrentImageUrl(response.currentImageUrl);
      }
      
      // If no selected image yet, use the first image from conversation
      if (!selectedImageUrl && response.messages && response.messages.length > 0) {
        const firstMessage = response.messages[0];
        if (firstMessage.imageUrl) {
          console.log('[ChatModal] Setting first image as selected for modification');
          setSelectedImageUrl(firstMessage.imageUrl);
        }
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      
      // More specific error messages
      if (err.response?.status === 404 || err.message.includes('404') || err.message.includes('not found')) {
        setError('Conversation non trouvée. Veuillez réessayer.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Erreur lors du chargement de la conversation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const messageText = customText || inputText.trim();
    if (!messageText || !conversationId || isSending) return;

    const userMessage = {
      messageId: `temp-${Date.now()}`,
      content: messageText,
      text: messageText,
      timestamp: new Date().toISOString(),
      role: 'user',
      type: 'modification'
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);
    setError('');

    try {
      console.log('[ChatModal] 📤 Sending message:', messageText);
      console.log('[ChatModal] Conversation ID:', conversationId);
      console.log('[ChatModal] Using backend:', selectedBackend);
      
      // Send the message with selected backend
      await chatAPI.sendMessage(conversationId, messageText, selectedBackend);
      console.log('[ChatModal] ✅ Message sent successfully');
      
      // Fetch the updated conversation to get the new image and messages
      console.log('[ChatModal] 🔄 Fetching updated conversation...');
      const updatedConversation = await chatAPI.getConversation(
        imageData.brand_id,
        imageData.product_id,
        conversationId
      );
      
      console.log('[ChatModal] ✅ Conversation fetched:', updatedConversation);
      
      // Update messages from fetched conversation
      if (updatedConversation.messages && Array.isArray(updatedConversation.messages)) {
        console.log('[ChatModal] 📝 Updating messages (count:', updatedConversation.messages.length, ')');
        console.log('[ChatModal] Latest message:', updatedConversation.messages[updatedConversation.messages.length - 1]);
        setMessages([...updatedConversation.messages]);
      } else {
        console.error('[ChatModal] ❌ No messages found in fetched conversation!');
      }
      
      // Update current image URL from fetched conversation
      if (updatedConversation.currentImageUrl) {
        console.log('[ChatModal] 🖼️ Updating current image to:', updatedConversation.currentImageUrl);
        setCurrentImageUrl(updatedConversation.currentImageUrl);
      } else {
        console.warn('[ChatModal] ⚠️ No currentImageUrl in fetched conversation');
      }
      
      // Scroll to bottom to show new content
      setTimeout(() => {
        scrollToBottom();
      }, 200);
      
    } catch (err) {
      console.error('[ChatModal] ❌ Error sending message:', err);
      console.error('[ChatModal] Error details:', {
        message: err.message,
        response: err.response,
        data: err.response?.data
      });
      setError(err.response?.data?.detail || err.message || 'Erreur lors de l\'envoi du message');
      // Remove the temp message on error
      setMessages(prev => prev.filter(m => m.messageId !== userMessage.messageId));
    } finally {
      setIsSending(false);
    }
  };

  // Remix handler
  const handleRemix = async () => {
    if (!conversationId || !imageData?.brand_id || !imageData?.product_id || isRemixing) {
      console.error('[ChatModal] Missing data for remix:', { conversationId, brandId: imageData?.brand_id, productId: imageData?.product_id });
      setError('Données manquantes pour le remix. Veuillez réessayer.');
      return;
    }

    setIsRemixing(true);
    setError('');
    setRemixProgress(null);
    setRemixedAds([]);
    setShowRemixResults(false);

    try {
      console.log('[ChatModal] Starting remix for conversation:', conversationId);
      console.log('[ChatModal] imageData:', imageData);
      
      // Trigger remix job
      const response = await adsAPI.remixAd(
        conversationId,
        imageData.brand_id,
        imageData.product_id,
        imageData.brand_name || '',
        imageData.product_full_name || imageData.product_name || '',
        'similar',
        5
      );

      console.log('[ChatModal] Remix job initiated:', response);

      if (response.success && response.data?.job_id) {
        const jobId = response.data.job_id;
        setRemixJobId(jobId);
        
        // Start polling for job status
        pollRemixJobStatus(jobId);
      } else {
        throw new Error('Failed to start remix job');
      }
    } catch (err) {
      console.error('[ChatModal] Error starting remix:', err);
      setError(err.message || 'Erreur lors du démarrage du remix');
      setIsRemixing(false);
    }
  };

  // Poll job status
  const pollRemixJobStatus = (jobId) => {
    console.log('[ChatModal] Starting to poll job status:', jobId);
    
    // Clear any existing interval
    if (remixPollIntervalRef.current) {
      clearInterval(remixPollIntervalRef.current);
    }

    // Poll every 3 seconds
    remixPollIntervalRef.current = setInterval(async () => {
      try {
        console.log('[ChatModal] Polling job status for:', jobId);
        const statusResponse = await adsAPI.getJobStatus(jobId);
        
        // Reset failed polls counter on successful response
        if (failedPollsRef.current[jobId]) {
          failedPollsRef.current[jobId] = 0;
        }
        
        console.log('[ChatModal] Job status:', statusResponse);

        if (statusResponse.success && statusResponse.data) {
          const jobData = statusResponse.data;
          setRemixProgress(jobData.progress);

          // Stop polling if terminal state
          if (jobData.status === 'completed') {
            console.log('[ChatModal] Remix job completed!');
            clearInterval(remixPollIntervalRef.current);
            remixPollIntervalRef.current = null;
            delete failedPollsRef.current[jobId];
            
            // Fetch the remixed ads
            await fetchRemixedAds();
          } else if (jobData.status === 'failed' || jobData.status === 'cancelled') {
            console.error('[ChatModal] Remix job ' + jobData.status + ':', jobData.message);
            clearInterval(remixPollIntervalRef.current);
            remixPollIntervalRef.current = null;
            delete failedPollsRef.current[jobId];
            
            setError(`Le remix a ${jobData.status === 'cancelled' ? 'été annulé' : 'échoué'}. Veuillez réessayer.`);
            setIsRemixing(false);
          }
          // Continue polling for 'processing' or 'queued' states
        }
      } catch (err) {
        console.error('[ChatModal] Error polling job status:', err);
        
        // Handle 404 errors - job not found
        if (err.response?.status === 404 || err.message?.includes('404')) {
          console.log(`[ChatModal] Job ${jobId} not found (404)`);
          
          // Track failed polls
          failedPollsRef.current[jobId] = (failedPollsRef.current[jobId] || 0) + 1;
          
          // Stop after 3 consecutive 404s
          if (failedPollsRef.current[jobId] >= 3) {
            console.log(`[ChatModal] Stopping poll for job ${jobId} after 3 consecutive 404s`);
            
            clearInterval(remixPollIntervalRef.current);
            remixPollIntervalRef.current = null;
            delete failedPollsRef.current[jobId];
            
            setError('Job non trouvé. Il a peut-être expiré ou été annulé.');
            setIsRemixing(false);
            return;
          }
        }
        // Don't stop polling on other single errors, but log them
      }
    }, 3000); // Poll every 3 seconds
  };

  // Fetch remixed ads after job completion
  const fetchRemixedAds = async () => {
    try {
      console.log('[ChatModal] Fetching remixed ads for product:', imageData.product_id);
      
      // Fetch all ads for this product to get the remixed ones
      const response = await adsAPI.getProductAds(imageData.brand_id, imageData.product_id, 100);
      
      if (response.success && response.data?.ads) {
        // Filter for remixed ads from this conversation
        const remixed = response.data.ads.filter(ad => 
          ad.generation_type === 'remix' && 
          ad.remix_source_conversation_id === conversationId
        );
        
        console.log('[ChatModal] Found', remixed.length, 'remixed ads');
        setRemixedAds(remixed);
        setShowRemixResults(true);
        setIsRemixing(false);
      } else {
        throw new Error('Failed to fetch remixed ads');
      }
    } catch (err) {
      console.error('[ChatModal] Error fetching remixed ads:', err);
      setError('Erreur lors du chargement des variations. Veuillez rafraîchir la page.');
      setIsRemixing(false);
    }
  };

  // Quick recommendations
  const recommendations = [
    { text: 'fix text', label: 'Corriger le texte', icon: '✍️' },
    { text: 'make text bigger', label: 'Agrandir le texte', icon: '🔤' },
    { text: 'change background color', label: 'Changer le fond', icon: '🎨' },
    { text: 'add sparkles', label: 'Ajouter des paillettes', icon: '✨' },
    { text: 'make it more colorful', label: 'Plus coloré', icon: '🌈' },
    { text: 'improve quality', label: 'Améliorer la qualité', icon: '⚡' }
  ];

  if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#262626] w-full max-w-[95vw] h-[92vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg sm:text-xl font-bold font-poppins">Modifier l&apos;image</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Décrivez les modifications souhaitées</p>
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
            {/* Left: Images Side by Side */}
            <div className="w-[45%] p-3 border-r border-[#262626] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Cliquez sur une image pour la modifier</span>
            </div>

            <div className="flex-1 flex gap-3 min-h-0">
              {/* Selected Image to Modify */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-white text-sm font-semibold mb-3 font-poppins">
                  Image à modifier
                  <span className="ml-2 text-xs text-blue-400">● Sélectionnée</span>
                </h3>
                <div 
                  className="flex-1 bg-[#0F0F0F] rounded-xl border-2 border-blue-500 shadow-lg shadow-blue-500/30 overflow-hidden flex items-center justify-center relative"
                >
                  {selectedImageUrl ? (
                    <>
                      <img
                        src={selectedImageUrl}
                        alt="Selected for modification"
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        À modifier
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">Cliquez sur une image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current/Latest Image */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-white text-sm font-semibold mb-3 font-poppins">
                  Image actuelle
                  <span className="ml-2 text-xs text-green-400">● Dernière version</span>
                </h3>
                <div 
                  className={`flex-1 bg-[#0F0F0F] rounded-xl border-2 overflow-hidden flex items-center justify-center relative transition-all duration-200 ${
                    selectedImageUrl === currentImageUrl 
                      ? 'border-[#262626]' 
                      : 'border-[#262626] hover:border-blue-400/50 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (currentImageUrl && selectedImageUrl !== currentImageUrl) {
                      setSelectedImageUrl(currentImageUrl);
                      console.log('[ChatModal] 🎯 Selected current image for modification');
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-sm">Chargement...</p>
                    </div>
                  ) : selectedImageUrl === currentImageUrl ? (
                    // Show empty placeholder when same as selected
                    <div className="flex flex-col items-center gap-3 text-gray-600">
                      <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-dashed border-gray-700 flex items-center justify-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Image déjà sélectionnée</p>
                    </div>
                  ) : currentImageUrl ? (
                    <img
                      key={`current-${currentImageUrl}-${Date.now()}`}
                      src={currentImageUrl}
                      alt="Current version"
                      className="max-w-full max-h-full object-contain"
                      onLoad={() => console.log('[ChatModal] ✅ Current image loaded:', currentImageUrl)}
                      onError={(e) => console.error('[ChatModal] ❌ Error loading current image:', currentImageUrl, e)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Aucune image à afficher</p>
                    </div>
                  )}
                  {isSending && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-fadeIn">
                      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-white text-sm font-semibold">Génération en cours...</p>
                      <p className="text-gray-400 text-xs">L&apos;IA modifie votre image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

            {/* Right: Chat Interface */}
            <div className="w-[55%] flex flex-col bg-[#0F0F0F]">

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3 font-poppins">Commencez à modifier</h3>
                    <p className="text-gray-400 text-base max-w-md mb-6 leading-relaxed">
                      Utilisez les suggestions rapides ci-dessous ou décrivez précisément vos modifications
                    </p>
                    
                    <div className="w-full max-w-md bg-[#1A1A1A] rounded-xl border border-[#262626] p-5 space-y-3">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Exemples de modifications</p>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm text-purple-300">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <p>&quot;Changer l&apos;arrière-plan en bleu&quot;</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-pink-300">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          <p>&quot;Ajouter des éléments décoratifs&quot;</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-purple-300">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <p>&quot;Modifier la position du texte&quot;</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-pink-300">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          <p>&quot;Agrandir le texte principal&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {messages.map((message, index) => {
                // Check if this is the first message (initial generation)
                const isFirstMessage = index === 0;
                const hasImage = message.imageUrl && message.imageUrl.trim() !== '';
                
                // For the first message with an image, only show the image, not the text
                const shouldShowText = !isFirstMessage || !hasImage;
                
                return (
                  <div
                    key={message.messageId}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                  >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-xl px-3 py-2 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-[#1A1A1A] border border-[#262626] text-gray-200'
                          }`}
                        >
                          {shouldShowText && (
                            <p className="text-sm font-poppins">{message.content || message.text}</p>
                          )}
                        {hasImage && (
                          <div 
                            className={`${shouldShowText ? "mt-2" : ""} rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 relative max-w-xs ${
                              selectedImageUrl === message.imageUrl 
                                ? 'border-blue-500 shadow-md' 
                                : 'border-white/20 hover:border-blue-400/50'
                            }`}
                            onClick={() => {
                              setSelectedImageUrl(message.imageUrl);
                              console.log('[ChatModal] 🎯 Selected message image for modification');
                            }}
                          >
                            <img
                              src={message.imageUrl}
                              alt="Modified version"
                              className="w-full h-auto"
                            />
                            {selectedImageUrl === message.imageUrl && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}

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

            {/* Quick Recommendations - Always Visible */}
            <div className="px-4 py-2.5 border-t border-[#262626] bg-[#0F0F0F]">
              <div className="flex flex-wrap gap-2">
                {recommendations.map((rec, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(null, rec.text)}
                    disabled={isSending || isLoading || !conversationId}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/50 text-pink-300 text-xs font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <span className="text-sm">{rec.icon}</span>
                    <span>{rec.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Backend Selector */}
            <div className="px-4 py-2 border-t border-[#262626] bg-[#0F0F0F]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-[10px] font-medium">Moteur IA:</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBackend('openai')}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    selectedBackend === 'openai'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-[#1A1A1A] border border-[#262626] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-semibold text-xs">OpenAI</span>
                    <span className="text-[9px] opacity-70">Créatif</span>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedBackend('kie')}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    selectedBackend === 'kie'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'bg-[#1A1A1A] border border-[#262626] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-semibold text-xs">Nano Banana</span>
                    <span className="text-[9px] opacity-70">Préserve</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Remix Button and Progress */}
            <div className="px-4 py-3 border-t border-[#262626] bg-[#0F0F0F]">
              {isRemixing ? (
                <div className="bg-[#1A1A1A] rounded-xl border border-purple-500/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1">Génération de variations...</h4>
                      {remixProgress && (
                        <>
                          <p className="text-gray-400 text-xs mb-2">{remixProgress.current_step}</p>
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${remixProgress.percentage || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {remixProgress.percentage || 0}% - {remixProgress.completed_ads || 0}/{remixProgress.total_ads || 5} variations
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
               ) : showRemixResults ? (
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <h4 className="text-white font-semibold text-sm">✨ {remixedAds.length} Variations au total</h4>
                     <button
                       onClick={() => setShowRemixResults(false)}
                       className="text-gray-400 hover:text-white text-xs"
                     >
                       Masquer
                     </button>
                   </div>
                   
                   {/* Batches grouped by time */}
                   <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
                     {remixBatches.map((batch, batchIndex) => {
                       // Calculate relative time
                       const now = new Date();
                       const diffMs = now - batch.timestamp;
                       const diffMins = Math.floor(diffMs / 60000);
                       const diffHours = Math.floor(diffMs / 3600000);
                       const diffDays = Math.floor(diffMs / 86400000);
                       
                       let relativeTime;
                       if (diffMins < 1) {
                         relativeTime = "À l'instant";
                       } else if (diffMins < 60) {
                         relativeTime = `Il y a ${diffMins} min`;
                       } else if (diffHours < 24) {
                         relativeTime = `Il y a ${diffHours}h`;
                       } else {
                         relativeTime = `Il y a ${diffDays}j`;
                       }
                       
                       return (
                         <div key={batchIndex} className="bg-[#1A1A1A] rounded-lg border border-[#262626] p-3">
                           {/* Batch Header */}
                           <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#262626]">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                               <span className="text-gray-400 text-xs font-medium">
                                 Batch #{remixBatches.length - batchIndex}
                               </span>
                               <span className="text-gray-600 text-xs">•</span>
                               <span className="text-gray-500 text-xs">{relativeTime}</span>
                             </div>
                             <span className="text-purple-400 text-xs font-semibold">
                               {batch.ads.length} variation{batch.ads.length > 1 ? 's' : ''}
                             </span>
                           </div>
                           
                           {/* Batch Ads Grid */}
                           <div className="grid grid-cols-2 gap-2">
                             {batch.ads.map((ad, adIndex) => (
                               <div key={ad.adId || adIndex} className="relative group">
                                 <img
                                   src={ad.currentImageUrl}
                                   alt={`Batch ${batchIndex + 1} - Variation ${adIndex + 1}`}
                                   className="w-full aspect-square object-cover rounded-lg border border-[#262626] hover:border-purple-500/50 transition-all"
                                 />
                                 {/* Hover Overlay */}
                                 <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                                   <a
                                     href={ad.currentImageUrl}
                                     download
                                     onClick={(e) => e.stopPropagation()}
                                     className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg flex items-center gap-1"
                                   >
                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                     </svg>
                                     Télécharger
                                   </a>
                                   {ad.concept_name && (
                                     <div className="text-white text-[10px] text-center px-2 max-w-full line-clamp-2">
                                       {ad.concept_name}
                                     </div>
                                   )}
                                 </div>
                                 {/* Badge */}
                                 <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                                   #{ad.remix_index || adIndex + 1}
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                   
                   {/* Generate New Batch Button */}
                   <button
                     onClick={handleRemix}
                     className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                     Générer un nouveau batch de 5 variations
                   </button>
                 </div>
              ) : (
                <button
                  onClick={handleRemix}
                  disabled={!conversationId || isLoading || isSending}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Générer 5 Variations Similaires</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">AI</span>
                </button>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#262626]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Décrivez les modifications..."
                  disabled={isSending || isLoading}
                  className="flex-1 px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending || isLoading || !conversationId}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:scale-100 flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Envoyer</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

