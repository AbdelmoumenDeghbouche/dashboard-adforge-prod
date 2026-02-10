import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProductCardSimple from '../components/dashboard/ProductCardSimple';
import StrategicChatContainer from '../components/StrategicChat/StrategicChatContainer';
import FormatSelector from '../components/StrategicChat/FormatSelector';
import CinematicAdForm from '../components/StrategicChat/CinematicAdForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/StrategicChat/ErrorMessage';
import { StrategicChatProvider, useStrategicChat, CHAT_STEPS, MESSAGE_TYPES } from '../contexts/StrategicChatContext';
import { useBrand } from '../contexts/BrandContext';
import { useTasksContext } from '../contexts/TasksContext';
import { useStrategicAnalysis } from '../hooks/useStrategicAnalysis';
import { useVideoGeneration } from '../hooks/useVideoGeneration';
import { researchAPI } from '../services/researchService';
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';
import { generateCinematicAd, getTaskStatus as getCinematicTaskStatus } from '../services/cinematicAdsService';

/**
 * Strategic Analysis Page - Inner Component
 * Handles the complete strategic analysis workflow
 */
function StrategicAnalysisInner() {
  const navigate = useNavigate();
  const { brands, selectedBrand, brandProducts, loadingProducts } = useBrand();
  const { addTask, updateTask } = useTasksContext();
  const {
    messages,
    addMessage,
    currentStep,
    setCurrentStep,
    brandId,
    productId,
    researchId,
    analysisId,
    creativeGenId,
    initializeChat,
    setBrandId,
    setProductId,
    setResearchId,
    setAnalysisId,
    setCreativeGenId,
    setSelectedAngle,
    setSelectedCreative,
    personas, // NEW
    setPersonas, // NEW
    selectedPersona, // NEW
    setSelectedPersona, // NEW
    reset,
  } = useStrategicChat();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [errorState, setErrorState] = useState(null);
  
  // Video Format Selection (NEW!)
  const [selectedVideoStyle, setSelectedVideoStyle] = useState('perfect_ugc_hybrid'); // Default to format 1
  const [selectedFormatId, setSelectedFormatId] = useState('format_1');
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  
  // Task IDs for tracking operations
  const [analysisTaskId, setAnalysisTaskId] = useState(null);
  const [creativeTaskId, setCreativeTaskId] = useState(null);
  const [videoTaskId, setVideoTaskId] = useState(null);
  
  // Video generation success modal
  const [showVideoSuccessModal, setShowVideoSuccessModal] = useState(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  
  // Store current platform/ad-length callback (to avoid losing it in state)
  const platformAdLengthCallbackRef = useRef(null);

  // Cinematic Ad (Format #3) states
  const [isCinematicGenerating, setIsCinematicGenerating] = useState(false);
  const [cinematicTaskId, setCinematicTaskId] = useState(null);
  const [cinematicVideoUrl, setCinematicVideoUrl] = useState(null);
  const [cinematicError, setCinematicError] = useState(null);
  const cinematicPollIntervalRef = useRef(null);

  // Strategic analysis hook
  const {
    startAnalysis,
    analysisResult,
    analysisStatus,
    isTriggering,
    isPolling: isAnalysisPolling,
    error: analysisError,
  } = useStrategicAnalysis(brandId, productId, researchId);

  // Video generation hook (with selected video style)
  const {
    generateVideo,
    videoUrl,
    isGenerating,
    isPolling: isVideoPolling,
    progress,
    currentStep: videoStep,
    error: videoError,
  } = useVideoGeneration(brandId, productId, selectedVideoStyle);

  // State for products with research data
  const [productsWithResearch, setProductsWithResearch] = useState([]);
  const [loadingResearch, setLoadingResearch] = useState(false);

  // Fetch products with research status when brand changes
  useEffect(() => {
    if (selectedBrand?.brandId) {
      loadProductsWithResearch();
    }
  }, [selectedBrand]);

  const loadProductsWithResearch = async () => {
    if (!selectedBrand?.brandId) return;
    
    setLoadingResearch(true);
    try {
      const response = await researchAPI.getProductsWithResearch(selectedBrand.brandId);
      if (response.success && response.data) {
        setProductsWithResearch(response.data.products || []);
      }
    } catch (error) {
      console.error('[StrategicAnalysis] Error loading products with research:', error);
      // Fallback to brandProducts if API fails
      setProductsWithResearch(brandProducts || []);
    } finally {
      setLoadingResearch(false);
    }
  };

  // Filter products based on search
  const filteredProducts = productsWithResearch?.filter((product) =>
    product.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle "Analyze Angles" button click - Now fetches personas first
  const handleAnalyzeAngles = useCallback(async () => {
    console.log('[StrategicAnalysis] handleAnalyzeAngles called with IDs:', {
      brandId,
      productId,
      researchId
    });
    
    // Safety check: ensure IDs are available
    if (!brandId || !productId || !researchId) {
      console.error('[StrategicAnalysis] Missing IDs in handleAnalyzeAngles!', {
        brandId,
        productId,
        researchId
      });
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: '⚠️ Une erreur s\'est produite. Veuillez recharger la page et réessayer.',
      });
      return;
    }
    
    // Add user message
    addMessage({
      sender: 'user',
      type: MESSAGE_TYPES.TEXT,
      content: "Let's analyze the marketing angles",
    });
    
    // Add loading message (simple text, not the selector yet)
    addMessage({
      sender: 'agent',
      type: MESSAGE_TYPES.TEXT,
      content: '🔍 Extracting personas from research...',
    });
    
    setCurrentStep(CHAT_STEPS.SELECTING_PERSONA);
    
    try {
      // Fetch personas from backend
      console.log('[StrategicAnalysis] Fetching personas...');
      const response = await strategicAnalysisAPI.getPersonas(brandId, productId, researchId);
      
      if (response.success && response.personas) {
        console.log('[StrategicAnalysis] Personas fetched:', response.personas);
        setPersonas(response.personas);
        
        // Add persona selector with fetched personas
        addMessage({
          sender: 'agent',
          type: MESSAGE_TYPES.PERSONA_SELECTOR,
          data: {
            personas: response.personas,
            isLoading: false,
          },
          onPersonaSelect: handlePersonaSelect,
          onPersonaSkip: handlePersonaSkip,
        });
      } else {
        console.warn('[StrategicAnalysis] No personas returned, skipping persona selection');
        // Skip directly to analysis without persona
        await handlePersonaSkip();
      }
    } catch (error) {
      console.error('[StrategicAnalysis] Error fetching personas:', error);
      
      // Show error and fallback to analysis without persona
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: '⚠️ Impossible de charger les personas. Nous allons continuer avec un public général.',
      });
      
      // Skip to analysis without persona
      await handlePersonaSkip();
    }
  }, [addMessage, setCurrentStep, brandId, productId, researchId, setPersonas]);

  // Handle persona selection
  const handlePersonaSelect = useCallback(async (persona) => {
    console.log('[StrategicAnalysis] 🎯 handlePersonaSelect called');
    console.log('[StrategicAnalysis] Persona selected:', persona);
    console.log('[StrategicAnalysis] Current IDs:', { brandId, productId, researchId });
    
    try {
      setSelectedPersona(persona);
      
      // Add user message confirming selection
      addMessage({
        sender: 'user',
        type: MESSAGE_TYPES.TEXT,
        content: `Target: ${persona.label}`,
      });
      
      // Add loading message
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: `Analyzing marketing angles for ${persona.label}... This will take 2-3 minutes.`,
      });
      
      setCurrentStep(CHAT_STEPS.ANALYZING_ANGLES);
      
      // Create task for strategic analysis
      const taskId = addTask({
        taskType: 'strategic_analysis',
        status: 'processing',
        progress: 0,
        title: `Strategic Analysis: ${selectedProduct?.productName || 'Product'}`,
        description: `Analyzing marketing angles for ${persona.label}`,
        metadata: {
          brandId,
          productId,
          researchId,
          personaId: persona.id,
          productName: selectedProduct?.productName,
        },
      });
      setAnalysisTaskId(taskId);
      console.log('[StrategicAnalysis] 📋 Analysis task created:', taskId);
      
      // Trigger analysis with persona ID
      const personaIdToUse = persona.id === 'all' ? null : persona.id;
      console.log('[StrategicAnalysis] 🚀 Starting analysis with persona ID:', personaIdToUse);
      await startAnalysis(personaIdToUse);
      console.log('[StrategicAnalysis] ✅ Analysis started successfully');
    } catch (error) {
      console.error('[StrategicAnalysis] ❌ Error in handlePersonaSelect:', error);
    }
  }, [addMessage, setCurrentStep, startAnalysis, brandId, productId, researchId, addTask, selectedProduct, setSelectedPersona]);

  // Handle skipping persona selection
  const handlePersonaSkip = useCallback(async () => {
    console.log('[StrategicAnalysis] Skipping persona selection');
    
    // Add loading message
    addMessage({
      sender: 'agent',
      type: MESSAGE_TYPES.TEXT,
      content: 'Analyzing marketing angles... This will take 2-3 minutes.',
    });
    
    setCurrentStep(CHAT_STEPS.ANALYZING_ANGLES);
    
    // Create task for strategic analysis
    const taskId = addTask({
      taskType: 'strategic_analysis',
      status: 'processing',
      progress: 0,
      title: `Strategic Analysis: ${selectedProduct?.productName || 'Product'}`,
      description: 'Analyzing marketing angles for general audience',
      metadata: {
        brandId,
        productId,
        researchId,
        productName: selectedProduct?.productName,
      },
    });
    setAnalysisTaskId(taskId);
    console.log('[StrategicAnalysis] 📋 Analysis task created:', taskId);
    
    // Trigger analysis without persona
    await startAnalysis(null);
  }, [addMessage, setCurrentStep, startAnalysis, brandId, productId, researchId, addTask, selectedProduct]);

  // Load research summary and show as first message
  const loadResearchSummary = useCallback(async (brand, prod, research) => {
    if (!research) {
      console.error('[StrategicAnalysis] No research ID provided');
      return;
    }
    
    console.log('[StrategicAnalysis] Loading research summary:', { brand, prod, research });
    setIsLoadingSummary(true);
    
    // Check cache first - but only use it if context IDs are properly set
    const cacheKey = `research_summary_${brand}_${prod}_${research}`;
    const cachedSummary = sessionStorage.getItem(cacheKey);
    
    try {
      let summaryData;
      
      // Only use cache if context IDs are set (prevents null closure issues)
      if (cachedSummary && brandId && productId && researchId) {
        console.log('[StrategicAnalysis] ✅ Using cached summary (instant load!)');
        summaryData = JSON.parse(cachedSummary);
        
        // Add small delay to ensure hooks are fully updated
        await new Promise(resolve => setTimeout(resolve, 150));
        
        console.log('[StrategicAnalysis] 📤 Adding cached summary with IDs:', {
          brandId,
          productId,
          researchId,
          hasCallback: !!handleAnalyzeAngles
        });
        
        // Add cached summary message with current callback
        addMessage({
          sender: 'agent',
          type: MESSAGE_TYPES.RESEARCH_SUMMARY,
          data: summaryData,
          onAnalyzeClick: handleAnalyzeAngles,
        });
        
        setCurrentStep(CHAT_STEPS.SHOWING_SUMMARY);
        setIsLoadingSummary(false);
        return; // Exit early - no need to fetch from backend
      } else if (cachedSummary) {
        console.warn('[StrategicAnalysis] ⚠️ Cache exists but IDs not set yet - fetching from backend instead');
      }
      
      // No cache - fetch from backend
      const summary = await researchAPI.getResearchSummary(brand, prod, research);
      console.log('[StrategicAnalysis] Summary loaded from backend:', summary);
      
      summaryData = summary.data;
      
      // Cache the summary for future loads (instant reload!)
      sessionStorage.setItem(cacheKey, JSON.stringify(summaryData));
      console.log('[StrategicAnalysis] 💾 Cached summary for next time');
      
      // Add summary message to chat with analyze handler
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.RESEARCH_SUMMARY,
        data: summaryData,
        onAnalyzeClick: handleAnalyzeAngles, // Connect the button to the handler
      });
      
      setCurrentStep(CHAT_STEPS.SHOWING_SUMMARY);
    } catch (error) {
      console.error('[StrategicAnalysis] Error loading summary:', error);
      
      // Determine error message based on error type
      let errorMessage = '⚠️ Une erreur s\'est produite lors du chargement du résumé de recherche.';
      
      if (error.message.includes('temporairement indisponible')) {
        errorMessage = '🔴 **Le serveur backend n\'est pas disponible.**\n\nAssurez-vous que le serveur API est démarré sur le port 8000.\n\nPour démarrer le backend:\n```\ncd ../adforge-server-api\nnpm run dev\n```';
      } else if (error.message.includes('trop de temps')) {
        errorMessage = '⏱️ **Le serveur met trop de temps à répondre.**\n\nVeuillez réessayer dans quelques instants.';
      }
      
      // Add error message to chat
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: errorMessage,
      });
      
      // Set step to show summary anyway (so we don't stay in loading state)
      setCurrentStep(CHAT_STEPS.SHOWING_SUMMARY);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [addMessage, setCurrentStep, handleAnalyzeAngles, brandId, productId, researchId]);

  // Handle product selection - Show format selector first (NEW!)
  const handleProductSelect = useCallback((product) => {
    console.log('[StrategicAnalysis] Product selected:', product);
    console.log('[StrategicAnalysis] Research data:', product.research);
    
    // Validate product has research
    if (!product.research) {
      alert('Ce produit n\'a pas encore de recherche. Veuillez d\'abord générer la recherche pour ce produit.');
      return;
    }
    
    // Store product temporarily and show format selector
    setSelectedProduct(product);
    setShowFormatSelector(true);
  }, []);

  // Handle format selection and proceed to chat
  const handleFormatSelect = useCallback((videoStyle, formatId) => {
    console.log('[StrategicAnalysis] 🎬 Format selected:', { videoStyle, formatId });
    console.log('[StrategicAnalysis] 🎬 Updating selectedVideoStyle to:', videoStyle);
    setSelectedVideoStyle(videoStyle);
    setSelectedFormatId(formatId);
  }, []);

  // Confirm format selection and proceed to chat
  const handleConfirmFormat = useCallback(() => {
    if (!selectedProduct) return;
    
    console.log('[StrategicAnalysis] 🎬 Confirming format and proceeding to chat');
    console.log('[StrategicAnalysis] 🎬 Current selectedVideoStyle:', selectedVideoStyle);
    console.log('[StrategicAnalysis] 🎬 Current selectedFormatId:', selectedFormatId);
    
    // Format #3 (Cinematic) doesn't need chat - just stay here to show form
    if (selectedFormatId === 'format_3') {
      console.log('[StrategicAnalysis] 🎬 Format 3 selected - showing cinematic ad form');
      // Form will be rendered in the format selector section
      return;
    }
    
    const brand = selectedBrand?.brandId;
    const prod = selectedProduct.productId;
    const research = selectedProduct.research?.research_id;
    
    if (!brand || !prod) {
      console.error('[StrategicAnalysis] Missing brand or product ID');
      return;
    }
    
    // Initialize chat with product context (formats 1 & 2 only)
    initializeChat(brand, prod, research);
    setBrandId(brand);
    setProductId(prod);
    setResearchId(research);
    setShowFormatSelector(false); // Hide format selector
    
    // Check if research is completed
    if (selectedProduct.research?.status === 'completed') {
      // Load research summary after a short delay
      setTimeout(() => {
        loadResearchSummary(brand, prod, research);
      }, 500);
    }
  }, [selectedProduct, selectedBrand, selectedVideoStyle, selectedFormatId, initializeChat, setBrandId, setProductId, setResearchId, loadResearchSummary]);

  // Handle Cinematic Ad generation (Format #3)
  const handleCinematicAdSubmit = useCallback(async (formData) => {
    console.log('[StrategicAnalysis] 🎬✨ Cinematic ad generation started:', formData);
    
    setIsCinematicGenerating(true);
    setCinematicError(null);
    
    try {
      const response = await generateCinematicAd(formData);
      
      console.log('[StrategicAnalysis] 🔍 FULL RESPONSE from generateCinematicAd:', JSON.stringify(response, null, 2));
      console.log('[StrategicAnalysis] 🔍 Response.task_id:', response.task_id);
      console.log('[StrategicAnalysis] 🔍 Response.job_id:', response.job_id);
      console.log('[StrategicAnalysis] 🔍 Response.data:', response.data);
      
      // The backend might return task_id OR job_id - we need to use the correct one
      const jobId = response.job_id || response.task_id;
      
      if (response.success && jobId) {
        console.log('[StrategicAnalysis] ✅ Cinematic ad job started. Using ID:', jobId);
        setCinematicTaskId(jobId);
        
        // Create task for tracking
        const taskId = addTask({
          taskType: 'cinematic_video',
          status: 'processing',
          progress: 0,
          title: `Cinematic Ad: ${formData.product_name}`,
          description: 'Generating cinematic product video',
          metadata: {
            brandId: selectedBrand?.brandId,
            productId: selectedProduct?.productId,
            taskId: response.task_id,
            duration: formData.target_duration,
            style_modifiers: formData.style_modifiers
          },
        });
        
        console.log('[StrategicAnalysis] 📋 Cinematic task created:', taskId);
        
        // Start polling for video status
        console.log('[StrategicAnalysis] 🔄 Starting polling with ID:', jobId);
        pollCinematicTaskStatus(jobId);
      } else {
        throw new Error(response.error || 'Failed to start cinematic ad generation');
      }
    } catch (error) {
      console.error('[StrategicAnalysis] ❌ Error generating cinematic ad:', error);
      setCinematicError(error.message || 'Failed to generate cinematic ad');
      setIsCinematicGenerating(false);
    }
  }, [selectedBrand, selectedProduct, addTask]);

  // Poll cinematic task status
  const pollCinematicTaskStatus = useCallback((taskId) => {
    console.log('[StrategicAnalysis] 🔄 Starting to poll cinematic task:', taskId);
    
    // Clear any existing interval
    if (cinematicPollIntervalRef.current) {
      clearInterval(cinematicPollIntervalRef.current);
    }

    // Poll every 5 seconds
    cinematicPollIntervalRef.current = setInterval(async () => {
      try {
        console.log('[StrategicAnalysis] 📊 Polling cinematic task status:', taskId);
        const statusResponse = await getCinematicTaskStatus(taskId);
        
        console.log('[StrategicAnalysis] 📊 Job status:', statusResponse.status);

        // Jobs endpoint returns: { job_id, status, result_data: { video_url } }
        const videoUrl = statusResponse.result_data?.video_url;

        if (statusResponse.status === 'completed' && videoUrl) {
          console.log('[StrategicAnalysis] ✅ Cinematic video ready:', videoUrl);
          
          // Stop polling
          if (cinematicPollIntervalRef.current) {
            clearInterval(cinematicPollIntervalRef.current);
            cinematicPollIntervalRef.current = null;
          }
          
          // Update state
          setCinematicVideoUrl(videoUrl);
          setIsCinematicGenerating(false);
          setShowVideoSuccessModal(true);
          
          // Update task
          updateTask(cinematicTaskId, {
            status: 'completed',
            progress: 100
          });
        } else if (statusResponse.status === 'failed') {
          console.error('[StrategicAnalysis] ❌ Cinematic video generation failed');
          
          // Stop polling
          if (cinematicPollIntervalRef.current) {
            clearInterval(cinematicPollIntervalRef.current);
            cinematicPollIntervalRef.current = null;
          }
          
          setCinematicError('Video generation failed. Please try again.');
          setIsCinematicGenerating(false);
          
          // Update task
          updateTask(cinematicTaskId, {
            status: 'failed'
          });
        }
      } catch (error) {
        console.error('[StrategicAnalysis] ❌ Error polling task status:', error);
        // Continue polling on error (might be temporary network issue)
      }
    }, 5000); // Poll every 5 seconds
  }, [updateTask, cinematicTaskId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (cinematicPollIntervalRef.current) {
        clearInterval(cinematicPollIntervalRef.current);
      }
    };
  }, []);

  // Track which analysis_id we've already shown to prevent infinite loop
  const shownAnalysisIdRef = useRef(null);
  // Store current analysis_id in ref for immediate access
  const currentAnalysisIdRef = useRef(null);
  
  // When analysis completes, show angles (ONCE per analysis_id)
  useEffect(() => {
    const currentAnalysisId = analysisResult?.analysis_id;
    
    if (
      analysisStatus === 'completed' && 
      analysisResult?.angle_intelligence && 
      currentAnalysisId &&
      shownAnalysisIdRef.current !== currentAnalysisId
    ) {
      shownAnalysisIdRef.current = currentAnalysisId;
      currentAnalysisIdRef.current = currentAnalysisId; // Store in ref for immediate access
      
      // Get angles and take only top 3
      const allAngles = analysisResult.angle_intelligence.top_5_angles || analysisResult.angle_intelligence.top_7_angles || [];
      const topThreeAngles = allAngles.slice(0, 3);
      
      console.log('[StrategicAnalysis] Showing top 3 angles for analysis:', currentAnalysisId, topThreeAngles);
      
      // Update task to completed
      if (analysisTaskId) {
        updateTask(analysisTaskId, {
          status: 'completed',
          progress: 100,
          metadata: {
            brandId,
            productId,
            researchId,
            analysisId: currentAnalysisId,
            productName: selectedProduct?.productName,
            result: analysisResult,
          },
        });
        console.log('[StrategicAnalysis] ✅ Analysis task completed:', analysisTaskId);
      }
      
      // Set analysisId in context BEFORE adding message
      setAnalysisId(currentAnalysisId);
      setCurrentStep(CHAT_STEPS.SHOWING_ANGLES);
      
      // Add message after a small delay to ensure state is updated
      setTimeout(() => {
        addMessage({
          sender: 'agent',
          type: MESSAGE_TYPES.ANGLES,
          data: { angles: topThreeAngles },
          onAngleSelect: handleAngleSelect,
        });
      }, 50);
    }
  }, [analysisStatus, analysisResult, analysisTaskId, updateTask, brandId, productId, researchId, selectedProduct]);

  // Handle analysis errors
  useEffect(() => {
    if (analysisStatus === 'failed' || analysisError) {
      // Update task to failed
      if (analysisTaskId) {
        updateTask(analysisTaskId, {
          status: 'failed',
          progress: 0,
          metadata: {
            brandId,
            productId,
            researchId,
            productName: selectedProduct?.productName,
            error: analysisError?.message || 'Analysis failed',
          },
        });
        console.log('[StrategicAnalysis] ❌ Analysis task failed:', analysisTaskId);
      }
      
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: (
          <ErrorMessage 
            message="Failed to analyze marketing angles. This could be due to insufficient research data or a temporary issue."
            onRetry={handleAnalyzeAngles}
          />
        ),
      });
      setCurrentStep(CHAT_STEPS.SHOWING_SUMMARY);
    }
  }, [analysisStatus, analysisError]);

  // Handle video generation errors
  useEffect(() => {
    if (videoError) {
      // Update task to failed
      if (videoTaskId) {
        updateTask(videoTaskId, {
          status: 'failed',
          progress: 0,
          metadata: {
            brandId,
            productId,
            creativeGenId,
            productName: selectedProduct?.productName,
            error: videoError.message || 'Video generation failed',
          },
        });
        console.log('[StrategicAnalysis] ❌ Video generation task failed:', videoTaskId);
      }
      
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: (
          <ErrorMessage 
            message="Video generation failed. You can try selecting a different creative variation."
            onRetry={() => setCurrentStep(CHAT_STEPS.SHOWING_CREATIVES)}
          />
        ),
      });
    }
  }, [videoError, videoTaskId, updateTask, brandId, productId, creativeGenId, selectedProduct]);

  // Handle angle selection - Show platform/ad-length selector
  const handleAngleSelect = useCallback((angle) => {
    // Use ref as fallback if state hasn't updated yet
    const activeAnalysisId = analysisId || currentAnalysisIdRef.current;
    
    console.log('[StrategicAnalysis] Angle selected:', angle);
    console.log('[StrategicAnalysis] Using analysis ID:', activeAnalysisId);
    
    if (!activeAnalysisId) {
      console.error('[StrategicAnalysis] No analysis ID available!');
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: 'Erreur: Aucun ID d\'analyse disponible. Veuillez réessayer.',
      });
      return;
    }
    
    // Add user message
    addMessage({
      sender: 'user',
      type: MESSAGE_TYPES.TEXT,
      content: `I'll go with Angle #${angle.rank}: ${angle.angle_name}`,
    });
    
    // Show platform and ad length selector
    setSelectedAngle(angle);
    
    // Store callback in ref (functions can't be stored in state)
    platformAdLengthCallbackRef.current = (config) => {
      console.log('[StrategicAnalysis] platformAdLengthCallbackRef called with config:', config);
      console.log('[StrategicAnalysis] Calling handlePlatformAdLengthConfirm with:', { 
        angle: angle.angle_name, 
        config, 
        activeAnalysisId 
      });
      handlePlatformAdLengthConfirm(angle, config, activeAnalysisId);
    };
    
    addMessage({
      sender: 'agent',
      type: MESSAGE_TYPES.PLATFORM_AD_LENGTH_SELECTOR,
      data: {
        selectedAngle: angle,
      },
    });
  }, [brandId, productId, researchId, analysisId, selectedProduct, addMessage]);

  // Handle platform & ad length confirmation - Generate creatives
  const handlePlatformAdLengthConfirm = useCallback(async (angle, config, activeAnalysisId) => {
    console.log('[StrategicAnalysis] ========== handlePlatformAdLengthConfirm START ==========');
    console.log('[StrategicAnalysis] Received angle:', angle);
    console.log('[StrategicAnalysis] Received config:', config);
    console.log('[StrategicAnalysis] Received activeAnalysisId:', activeAnalysisId);
    console.log('[StrategicAnalysis] Current brandId:', brandId);
    console.log('[StrategicAnalysis] Current productId:', productId);
    
    // Add user confirmation message
    addMessage({
      sender: 'user',
      type: MESSAGE_TYPES.TEXT,
      content: `Platform: ${config.platform} • Length: ${config.adLength}s`,
    });
    
    // Add loading message
    addMessage({
      sender: 'agent',
      type: MESSAGE_TYPES.TEXT,
      content: 'Generating creative variations for this angle...',
    });
    
    setCurrentStep(CHAT_STEPS.GENERATING_CREATIVES);
    
    // Create task for creative generation
    const taskId = addTask({
      taskType: 'creative_generation',
      status: 'processing',
      progress: 0,
      title: `Creative Generation: ${angle.angle_name}`,
      description: `Generating 3 creative variations for ${config.platform} (${config.adLength}s)`,
      metadata: {
        brandId,
        productId,
        analysisId: activeAnalysisId,
        angleRank: angle.rank,
        angleName: angle.angle_name,
        platform: config.platform,
        adLength: config.adLength,
        productName: selectedProduct?.productName,
      },
    });
    setCreativeTaskId(taskId);
    console.log('[StrategicAnalysis] 📋 Creative generation task created:', taskId);
    
    try {
      // Call approve angle API with user-selected ad length and video style
      console.log('[StrategicAnalysis] 🎬 Calling approveAngleAndGenerateCreatives with videoStyle:', selectedVideoStyle);
      const result = await strategicAnalysisAPI.approveAngleAndGenerateCreatives(
        brandId,
        productId,
        activeAnalysisId,
        angle.rank,
        config.adLength, // Use user-selected ad length
        selectedVideoStyle // Use user-selected video format
      );
      
      console.log('[StrategicAnalysis] Creatives generated:', result);
      
      // Fetch full creative details using the creative_gen_id
      console.log('[StrategicAnalysis] 📥 Fetching full creative details...');
      const fullCreatives = await strategicAnalysisAPI.getCreativeGeneration(
        brandId,
        productId,
        result.creative_gen_id
      );
      console.log('[StrategicAnalysis] ✅ Full creatives fetched:', fullCreatives.data);
      
      // Update task to completed
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        metadata: {
          brandId,
          productId,
          analysisId: activeAnalysisId,
          creativeGenId: result.creative_gen_id, // Job-based result is not wrapped in .data
          angleRank: angle.rank,
          angleName: angle.angle_name,
          platform: config.platform,
          adLength: config.adLength,
          productName: selectedProduct?.productName,
          result: result, // Job-based result is not wrapped in .data
        },
      });
      console.log('[StrategicAnalysis] ✅ Creative generation task completed:', taskId);
      
      // Set creativeGenId for state management
      setCreativeGenId(result.creative_gen_id); // Job-based result is not wrapped in .data
      setCurrentStep(CHAT_STEPS.SHOWING_CREATIVES);
      
      // Add creatives message with FULL creative data
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.CREATIVES,
        data: fullCreatives.data, // Pass the full creatives data
        onCreativeSelect: handleCreativeSelect,
      });
    } catch (error) {
      console.error('[StrategicAnalysis] Error generating creatives:', error);
      
      // Update task to failed
      updateTask(taskId, {
        status: 'failed',
        progress: 0,
        metadata: {
          brandId,
          productId,
          analysisId: activeAnalysisId,
          angleRank: angle.rank,
          angleName: angle.angle_name,
          platform: config.platform,
          adLength: config.adLength,
          productName: selectedProduct?.productName,
          error: error.message || 'Creative generation failed',
        },
      });
      console.log('[StrategicAnalysis] ❌ Creative generation task failed:', taskId);
      
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.TEXT,
        content: 'Sorry, I encountered an error generating creatives. Please try again.',
      });
    }
  }, [brandId, productId, analysisId, addMessage, setCurrentStep, setSelectedAngle, setCreativeGenId, addTask, updateTask, selectedProduct]);

  // Handle creative selection
  const handleCreativeSelect = useCallback(async (variationId, passedCreativeGenId) => {
    // Use passed creative_gen_id or fall back to state
    const activeCreativeGenId = passedCreativeGenId || creativeGenId;
    
    console.log('[StrategicAnalysis] Creative selected:', variationId);
    console.log('[StrategicAnalysis] Using creative_gen_id:', activeCreativeGenId);
    
    if (!activeCreativeGenId) {
      console.error('[StrategicAnalysis] No creative_gen_id available!');
      return;
    }
    
    // Add user message
    addMessage({
      sender: 'user',
      type: MESSAGE_TYPES.TEXT,
      content: `Generate video with ${variationId} variation`,
    });
    
    // Add loading message
    addMessage({
      sender: 'agent',
      type: MESSAGE_TYPES.TEXT,
      content: 'Generating your video... This will take 5-10 minutes. I\'ll show you the progress.',
    });
    
    setCurrentStep(CHAT_STEPS.GENERATING_VIDEO);
    setSelectedCreative(variationId);
    setIsSubmittingVideo(true); // Start loading
    
    try {
      // Create task for video generation
      const taskId = addTask({
        taskType: 'video_generation',
        status: 'processing',
        progress: 0,
        title: `Video Generation: ${variationId}`,
        description: `Generating Sora video for ${variationId} creative variation`,
        metadata: {
          brandId,
          productId,
          creativeGenId: activeCreativeGenId,
          variationId,
          productName: selectedProduct?.productName,
        },
      });
      setVideoTaskId(taskId);
      console.log('[StrategicAnalysis] 📋 Video generation task created:', taskId);
      
      // Trigger video generation with the active creative_gen_id
      await generateVideo(activeCreativeGenId, variationId);
      
      // Show success modal after API call completes
      setShowVideoSuccessModal(true);
    } catch (error) {
      console.error('[StrategicAnalysis] Error generating video:', error);
      // Error handling - you can add error UI here if needed
    } finally {
      setIsSubmittingVideo(false); // Stop loading
    }
  }, [creativeGenId, addMessage, setCurrentStep, setSelectedCreative, generateVideo, addTask, brandId, productId, selectedProduct]);

  // When video generation completes, show video
  useEffect(() => {
    if (videoUrl && currentStep === CHAT_STEPS.GENERATING_VIDEO) {
      // Update task to completed
      if (videoTaskId) {
        updateTask(videoTaskId, {
          status: 'completed',
          progress: 100,
          metadata: {
            brandId,
            productId,
            creativeGenId,
            productName: selectedProduct?.productName,
            videoUrl,
          },
        });
        console.log('[StrategicAnalysis] ✅ Video generation task completed:', videoTaskId);
      }
      
      addMessage({
        sender: 'agent',
        type: MESSAGE_TYPES.VIDEO,
        data: { video_url: videoUrl },
      });
      
      setCurrentStep(CHAT_STEPS.VIDEO_READY);
    }
  }, [videoUrl, currentStep, videoTaskId, updateTask, brandId, productId, creativeGenId, selectedProduct]);

  // Handle back to product list
  const handleBack = () => {
    setSelectedProduct(null);
    reset();
  };

  // Show product list or format selector or chat
  if (!selectedProduct) {
    return (
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Strategic Analysis</h1>
          <p className="text-gray-400">
            AI-powered research and video generation based on strategic marketing angles
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-3 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Products Grid */}
        {loadingProducts || loadingResearch ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCardSimple
                key={product.productId}
                product={product}
                brandInfo={selectedBrand}
                onCardClick={() => handleProductSelect(product)}
                hideGenerateButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">
              {selectedBrand ? 'Aucun produit trouvé pour cette marque' : 'Sélectionnez une marque pour voir les produits'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show format selector before chat (NEW!)
  if (showFormatSelector && selectedProduct) {
    return (
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            setShowFormatSelector(false);
            setSelectedProduct(null);
          }}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        {/* Product Info */}
        <div className="mb-8 bg-[#1A1A1A] border border-[#262626] rounded-lg p-6">
          <div className="flex items-center gap-4">
            {selectedProduct.imageUrl && (
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.productName}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{selectedProduct.productName}</h2>
              <p className="text-gray-400 text-sm">Selected Product</p>
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <FormatSelector 
          onSelect={handleFormatSelect}
          initialFormat={selectedFormatId}
        />

        {/* Cinematic Ad Form (Format #3) or Continue Button (Formats #1 & #2) */}
        {selectedFormatId === 'format_3' ? (
          <div className="mt-8">
            <CinematicAdForm 
              product={{
                ...selectedProduct,
                brandName: selectedBrand?.brandName,
                brandLogoUrl: selectedBrand?.logoUrl
              }}
              onSubmit={handleCinematicAdSubmit}
              isSubmitting={isCinematicGenerating}
            />
            
            {cinematicError && (
              <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">Error:</h4>
                    <p className="text-gray-300 text-sm">{cinematicError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Debug Info */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm">
              <p className="text-gray-400">
                Selected: <span className="text-purple-400 font-bold">
                  {selectedFormatId === 'format_1' ? 'Perfect UGC Hybrid' : selectedFormatId === 'format_2' ? 'Creative Kling' : 'Unknown'}
                </span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                video_style: <span className="text-green-400 font-mono">{selectedVideoStyle}</span>
              </p>
            </div>
            
            <button
              onClick={handleConfirmFormat}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all text-lg"
            >
              Continue with {selectedFormatId === 'format_1' ? 'Perfect UGC Hybrid' : 'Creative Kling'} →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show chat interface (with format info badge)
  return (
    <div className="relative">
      {/* Selected Format Badge */}
      <div className="fixed top-20 right-6 z-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span className="text-2xl">{selectedFormatId === 'format_1' ? '🎤+🎥' : '🎬'}</span>
          <div>
            <p className="text-xs opacity-75">Video Format:</p>
            <p className="font-bold text-sm">
              {selectedFormatId === 'format_1' ? 'Perfect UGC Hybrid' : 'Creative Kling'}
            </p>
          </div>
        </div>
      </div>
      
      <StrategicChatContainer
        product={selectedProduct}
        onBack={handleBack}
        onAnalyzeAngles={handleAnalyzeAngles}
        onConfirmPlatformAdLength={platformAdLengthCallbackRef}
      />
      
      {/* Loading Overlay - Video Submission */}
      {isSubmittingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1A1A1A] border border-[#262626] rounded-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              {/* Animated Spinner */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              
              {/* Text */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  🎬 Starting Video Generation...
                </h3>
                <p className="text-gray-400 text-sm">
                  Please wait while we submit your request
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Generation Success Modal */}
      {showVideoSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#262626] rounded-2xl max-w-md w-full p-6 animate-slideUp">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              {cinematicVideoUrl ? '✨ Cinematic Ad Ready!' : '🎬 Video Generation Started!'}
            </h3>
            
            {/* Message */}
            <p className="text-gray-300 text-center mb-6">
              {cinematicVideoUrl ? (
                <>
                  Your cinematic ad has been generated successfully!
                  <br /><br />
                  Go to the <span className="text-purple-400 font-semibold">Video Playground</span> section to view and download your video.
                </>
              ) : selectedFormatId === 'format_3' ? (
                <>
                  Your cinematic ad is being generated. This process typically takes <span className="text-green-400 font-semibold">60-90 seconds</span>.
                  <br /><br />
                  Come back to the <span className="text-purple-400 font-semibold">Video Playground</span> section to find your video.
                </>
              ) : (
                <>
                  Your video is being generated. This process typically takes <span className="text-green-400 font-semibold">5-10 minutes</span>.
                  <br /><br />
                  Come back later to the <span className="text-purple-400 font-semibold">Video Playground</span> section to find your video.
                </>
              )}
            </p>
            
            {/* Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowVideoSuccessModal(false);
                  navigate('/generation');
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Go to Video Playground
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Strategic Analysis Page - Outer Component with Provider
 */
export default function StrategicAnalysis() {
  return (
    <DashboardLayout>
      <StrategicChatProvider>
        <StrategicAnalysisInner />
      </StrategicChatProvider>
    </DashboardLayout>
  );
}

