import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useBrand } from '../contexts/BrandContext';
import { useTasksContext } from '../contexts/TasksContext';
import { avatarAPI, scriptAPI } from '../services/apiService';

const AvatarVideoGeneration = () => {
  const { selectedBrand, brandProducts, loadingProducts } = useBrand();
  const { addTask, updateTask } = useTasksContext();

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Product Selection
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductImage, setSelectedProductImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loadingProductImages, setLoadingProductImages] = useState(false);

  // Step 2: Avatar Selection
  const [avatarMode, setAvatarMode] = useState('select'); // 'select' or 'describe'
  const [avatars, setAvatars] = useState([]);
  const [filteredAvatars, setFilteredAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarDescription, setAvatarDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
  const [lastDocId, setLastDocId] = useState(null);
  const [hasMoreAvatars, setHasMoreAvatars] = useState(true);
  
  // Avatar filters
  const [filters, setFilters] = useState({
    gender: '',
    age: '',
    situation: '',
    accessories: '',
    emotions: '',
    ethnicity: '',
    hairStyle: '',
    hairColor: ''
  });
  
  // Avatar detail modal
  const [avatarDetailModal, setAvatarDetailModal] = useState(null);
  const [fullQualityImage, setFullQualityImage] = useState(null);
  
  // Image cache and loading states
  const [imageCache] = useState(new Map());
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Step 3: Model Selection
  const [selectedModel, setSelectedModel] = useState('');
  const models = [
    { id: 'omni', name: 'Omni Human', maxWords: 70, description: 'High quality human avatars' },
    { id: 'kling', name: 'Kling', maxWords: 70, description: 'Advanced AI avatar generation' },
    { id: 'veo', name: 'Veo', maxWords: 10, description: 'Quick 8-second videos' }
  ];

  // Step 4: Script Writing
  const [script, setScript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  // Emotion Enhancement & Voice Preview
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const audioRef = useRef(null);
  
  // Default emotion settings (no UI controls - simplified)
  const scriptType = 'product_demo';
  const emotionIntensity = 'balanced';
  
  // Voice Recommendation (NEW!)
  const [isFindingVoices, setIsFindingVoices] = useState(false);
  const [recommendedVoices, setRecommendedVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  
  // Custom editor ref for emotion highlighting
  const scriptEditorRef = useRef(null);
  
  // Voice Control Sliders (NEW!)
  const [voiceStability, setVoiceStability] = useState(0.5);
  const [voiceSimilarity, setVoiceSimilarity] = useState(0.75);
  const [voiceStyle, setVoiceStyle] = useState(0.75);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
  // Video Settings (default values, no UI controls)
  const aspectRatio = '9:16'; // Default to vertical
  const addAmbientSound = true;
  const ambientSetting = 'studio';
  const ambientVolume = 0.25;

  // Generation & Results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoFilter, setVideoFilter] = useState(null); // null = all, 'omni', 'kling', 'veo'

  // Word count tracker
  useEffect(() => {
    const words = script.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [script]);

  // Load avatars from Firestore
  const loadAvatars = async (loadMore = false) => {
    if (isLoadingAvatars || (!loadMore && avatars.length > 0)) return;
    
    setIsLoadingAvatars(true);
    try {
      console.log('[Avatars] Loading avatars from Firestore...', { loadMore, lastDocId });
      
      const response = await avatarAPI.getAvatars(50, loadMore ? lastDocId : null);
      
      console.log('[Avatars] Full response:', response);
      console.log('[Avatars] response.success:', response.success);
      console.log('[Avatars] response.data:', response.data);
      console.log('[Avatars] response.avatars:', response.avatars);
      console.log('[Avatars] typeof response.data:', typeof response.data);
      
      // Handle two response formats:
      // Format 1: {success: true, data: {avatars: [...]}}
      // Format 2: {avatars: [...]} (direct from backend)
      let avatarsData, newAvatars;
      
      if (response.success && response.data) {
        // Format 1: Wrapped response
        console.log('[Avatars] Using wrapped format (response.data.avatars)');
        avatarsData = response.data;
        newAvatars = response.data.avatars || response.data;
      } else if (response.avatars) {
        // Format 2: Direct response
        console.log('[Avatars] Using direct format (response.avatars)');
        avatarsData = response;
        newAvatars = response.avatars;
      } else {
        console.warn('[Avatars] ❌ Unknown response format');
        setHasMoreAvatars(false);
        setIsLoadingAvatars(false);
        return;
      }
      
      if (avatarsData) {
        console.log('[Avatars] Extracting avatars...');
        console.log('[Avatars] newAvatars:', newAvatars);
        console.log('[Avatars] Is array?:', Array.isArray(newAvatars));
        
        console.log('[Avatars] newAvatars:', newAvatars);
        console.log('[Avatars] newAvatars length:', newAvatars?.length);
        console.log('[Avatars] Is newAvatars array?:', Array.isArray(newAvatars));
        
        if (Array.isArray(newAvatars) && newAvatars.length > 0) {
          const hasActiveFilters = searchQuery.trim() || 
            filters.gender || filters.age || filters.situation || 
            filters.accessories || filters.emotions || filters.ethnicity || 
            filters.hairStyle || filters.hairColor;
          
          if (loadMore) {
            const updatedAvatars = [...avatars, ...newAvatars];
            setAvatars(updatedAvatars);
            // Update filtered avatars if no filters active
            if (!hasActiveFilters) {
              setFilteredAvatars(updatedAvatars);
            }
          } else {
            setAvatars(newAvatars);
            // Update filtered avatars if no filters active
            if (!hasActiveFilters) {
              setFilteredAvatars(newAvatars);
            }
          }
          
          // Update pagination state
          setLastDocId(avatarsData.last_doc_id || avatarsData.last_doc_id);
          setHasMoreAvatars(avatarsData.has_more !== undefined ? avatarsData.has_more : newAvatars.length === 50);
          
          console.log('[Avatars] ✅ Loaded avatars:', newAvatars.length);
          console.log('[Avatars] ✅ Set to state, filteredAvatars will show:', !hasActiveFilters ? newAvatars.length : 'filters active');
        } else {
          console.warn('[Avatars] ⚠️ No avatars in response or not an array');
          setHasMoreAvatars(false);
        }
      } else {
        console.warn('[Avatars] ❌ No avatars returned - response check failed');
        console.warn('[Avatars] response.success:', response.success);
        console.warn('[Avatars] response.data exists:', !!response.data);
        setHasMoreAvatars(false);
      }
    } catch (error) {
      console.error('[Avatars] ❌ Error loading avatars:', error);
      console.error('[Avatars] Error details:', error.response?.data || error.message);
      alert('Failed to load avatars: ' + error.message);
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  // Search avatars using backend with filters
  const searchAvatars = async () => {
    // Check if any filter is active
    const hasActiveFilters = searchQuery.trim() || 
      filters.gender || filters.age || filters.situation || 
      filters.accessories || filters.emotions || filters.ethnicity || 
      filters.hairStyle || filters.hairColor;
    
    if (!hasActiveFilters) {
      setFilteredAvatars(avatars);
      return;
    }
    
    setIsLoadingAvatars(true);
    try {
      console.log('[Avatars] Searching backend with filters:', {
        query: searchQuery,
        filters
      });
      
      const response = await avatarAPI.searchAvatars(searchQuery, filters);
      
      console.log('[Avatars] Backend response:', response);
      console.log('[Avatars] Response.success:', response.success);
      console.log('[Avatars] Response.data:', response.data);
      
      // Backend returns { success: true, data: { avatars: [...], count: N, ... } }
      if (response.success && response.data && response.data.avatars) {
        const searchResults = response.data.avatars;
        console.log('[Avatars] Search results array:', searchResults);
        console.log('[Avatars] Results type:', Array.isArray(searchResults) ? 'array' : typeof searchResults);
        
        if (Array.isArray(searchResults)) {
          setFilteredAvatars(searchResults);
          console.log('[Avatars] Backend search found:', searchResults.length, 'results');
        } else {
          console.warn('[Avatars] Search results is not an array:', searchResults);
          setFilteredAvatars([]);
        }
      } else {
        console.warn('[Avatars] No avatars returned - response:', { success: response.success, hasData: !!response.data });
        setFilteredAvatars([]);
      }
    } catch (error) {
      console.error('[Avatars] Error searching avatars:', error);
      console.error('[Avatars] Error details:', error.response?.data || error.message);
      // Fallback to showing all avatars if backend search fails
      setFilteredAvatars(avatars);
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  // Fallback: Filter avatars locally
  const filterAvatarsLocally = () => {
    if (!searchQuery.trim()) {
      setFilteredAvatars(avatars);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = avatars.filter(avatar => {
      // Search in all relevant fields
      const searchFields = [
        avatar.name,
        avatar.gender,
        avatar.eye_color,
        avatar.hair_color,
        avatar.ethnicity,
        avatar.body_type,
        avatar.age_range,
        ...(avatar.tags || []),
      ].filter(Boolean).map(field => String(field).toLowerCase());
      
      return searchFields.some(field => field.includes(query));
    });
    
    setFilteredAvatars(filtered);
    console.log('[Avatars] Local filter:', filtered.length, 'of', avatars.length);
  };

  // Generate compressed thumbnail URL (much smaller for grid)
  const getThumbnailUrl = (firebaseUrl) => {
    if (!firebaseUrl) return null;
    
    // Check cache first
    const cacheKey = firebaseUrl + '_thumb';
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }
    
    // Use Firebase Storage's built-in image transformation for consistency
    // This ensures preview and detail show the same image
    let thumbUrl;
    if (firebaseUrl.includes('firebasestorage.googleapis.com') || firebaseUrl.includes('storage.googleapis.com')) {
      // For Firebase Storage URLs, add size parameters
      thumbUrl = firebaseUrl;
      // Note: Firebase Storage doesn't support on-the-fly resizing without Cloud Functions
      // So we'll use the original URL to ensure consistency
    } else {
      // For non-Firebase URLs, use CDN
      thumbUrl = `https://images.weserv.nl/?url=${encodeURIComponent(firebaseUrl)}&w=400&h=600&fit=cover&output=webp&q=75`;
    }
    
    imageCache.set(cacheKey, thumbUrl);
    return thumbUrl;
  };

  // Load full quality image when viewing details
  const loadFullQualityImage = async (firebaseUrl) => {
    if (!firebaseUrl) return null;
    
    // Check cache first
    if (imageCache.has(firebaseUrl + '_full')) {
      setFullQualityImage(imageCache.get(firebaseUrl + '_full'));
      return;
    }
    
    setFullQualityImage(null); // Show loading state
    
    // Preload the full quality image
    const img = new Image();
    img.src = firebaseUrl;
    
    img.onload = () => {
      imageCache.set(firebaseUrl + '_full', firebaseUrl);
      setFullQualityImage(firebaseUrl);
    };
    
    img.onerror = () => {
      setFullQualityImage('error');
    };
  };

  // Open avatar detail modal
  const openAvatarDetail = (avatar) => {
    console.log('[Avatar Detail] Opening modal for:', avatar.name);
    console.log('[Avatar Detail] Avatar ID:', avatar.id);
    console.log('[Avatar Detail] Firebase URL:', avatar.firebase_url);
    console.log('[Avatar Detail] Image URL:', avatar.imageUrl);
    console.log('[Avatar Detail] Full avatar data:', avatar);
    setAvatarDetailModal(avatar);
    loadFullQualityImage(avatar.firebase_url || avatar.imageUrl);
  };

  // Close avatar detail modal
  const closeAvatarDetail = () => {
    setAvatarDetailModal(null);
    setFullQualityImage(null);
  };

  // Select avatar from detail modal
  const selectAvatarFromModal = () => {
    if (avatarDetailModal) {
      setSelectedAvatar(avatarDetailModal);
      setCurrentStep(3);
      closeAvatarDetail();
    }
  };

  // Handle image load for blur-up effect
  const handleImageLoad = (avatarId) => {
    setLoadedImages(prev => new Set([...prev, avatarId]));
  };

  // Load generated videos with optional model filter
  const loadGeneratedVideos = async (model = videoFilter) => {
    setIsLoadingVideos(true);
    try {
      console.log('[Videos] Loading generated videos with filter:', model);
      
      let allVideos = [];
      
      if (model === null) {
        // Fetch from all models and combine
        console.log('[Videos] Fetching from all models...');
        const [omniResult, klingResult, veoResult] = await Promise.allSettled([
          avatarAPI.getGeneratedVideos('omni', 50),
          avatarAPI.getGeneratedVideos('kling', 50),
          avatarAPI.getGeneratedVideos('veo', 50),
        ]);
        
        // Combine all successful results
        if (omniResult.status === 'fulfilled' && Array.isArray(omniResult.value)) {
          allVideos.push(...omniResult.value);
        }
        if (klingResult.status === 'fulfilled' && Array.isArray(klingResult.value)) {
          allVideos.push(...klingResult.value);
        }
        if (veoResult.status === 'fulfilled' && Array.isArray(veoResult.value)) {
          allVideos.push(...veoResult.value);
        }
        
        console.log('[Videos] Combined from all models:', allVideos.length, 'videos');
      } else {
        // Fetch from specific model
        const response = await avatarAPI.getGeneratedVideos(model, 50);
        console.log('[Videos] Raw response:', response);
        
        // Handle both direct array and wrapped response
        if (Array.isArray(response)) {
          allVideos = response;
        } else if (response?.data && Array.isArray(response.data)) {
          allVideos = response.data;
        } else if (response?.videos && Array.isArray(response.videos)) {
          allVideos = response.videos;
        }
      }
      
      console.log('[Videos] Final videos count:', allVideos.length);
      console.log('[Videos] First video:', allVideos[0]);
      setGeneratedVideos(allVideos);
    } catch (error) {
      console.error('[Videos] Error loading generated videos:', error);
      setGeneratedVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Load avatars on mount
  useEffect(() => {
    loadAvatars();
  }, []);

  // Search avatars when search query or filters change (with debounce)
  useEffect(() => {
    const hasActiveFilters = searchQuery.trim() || 
      filters.gender || filters.age || filters.situation || 
      filters.accessories || filters.emotions || filters.ethnicity || 
      filters.hairStyle || filters.hairColor;
    
    if (!hasActiveFilters) {
      setFilteredAvatars(avatars);
      return;
    }
    
    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      searchAvatars();
    }, 500); // Wait 500ms after user stops typing
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters]);

  // Update filtered avatars when avatars list changes (no filters active)
  useEffect(() => {
    const hasActiveFilters = searchQuery.trim() || 
      filters.gender || filters.age || filters.situation || 
      filters.accessories || filters.emotions || filters.ethnicity || 
      filters.hairStyle || filters.hairColor;
    
    if (!hasActiveFilters) {
      setFilteredAvatars(avatars);
    }
  }, [avatars]);

  // Load generated videos when filter changes
  useEffect(() => {
    loadGeneratedVideos(videoFilter);
  }, [videoFilter]);

  // Extract product images from product object (already fetched from API)
  const fetchProductImages = (product) => {
    if (!product) {
      console.error('[Product Images] Missing product');
      return;
    }
    
    setLoadingProductImages(true);
    console.log('[Product Images] Extracting images from product:', {
      productId: product.productId,
      productName: product.productName,
      hasImages: !!product.images,
      imageCount: product.images?.length
    });
    
    try {
      // Product already has images array from API response
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        console.log('[Product Images] Found', product.images.length, 'images in product');
        
        const images = product.images.map((imageUrl, idx) => ({
          id: idx.toString(),
          imageUrl: imageUrl,
          url: imageUrl
        }));
        
        setProductImages(images);
        
        // Auto-select if only one image
        if (images.length === 1) {
          setSelectedProductImage(images[0]);
        }
        
        console.log('[Product Images] ✅ Loaded', images.length, 'images');
      } else {
        console.log('[Product Images] No images in product, using fallback');
        // Fallback: use product's main thumbnail/imageUrl if available
        const fallbackUrl = product.thumbnail || product.imageUrl;
        if (fallbackUrl) {
          const fallbackImage = {
            id: 'main',
            imageUrl: fallbackUrl,
            url: fallbackUrl
          };
          setProductImages([fallbackImage]);
          setSelectedProductImage(fallbackImage);
        } else {
          setProductImages([]);
        }
      }
    } catch (error) {
      console.error('[Product Images] Error extracting images:', error);
      setProductImages([]);
    } finally {
      setLoadingProductImages(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedProductImage(null);
    setProductImages([]);
    fetchProductImages(product);
    // Don't advance step yet - wait for image selection
  };

  // Handle product image selection
  const handleProductImageSelect = (image) => {
    setSelectedProductImage(image);
    setCurrentStep(2); // Now advance to avatar selection
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setCurrentStep(3);
  };

  // Handle model selection
  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setScript(''); // Reset script when model changes
    setCurrentStep(4);
  };

  // Handle video generation
  const handleGenerateVideo = async () => {
    // Validate avatar (either selected or described)
    const hasAvatar = avatarMode === 'select' ? !!selectedAvatar : !!avatarDescription.trim();
    
    // Product and product image are now optional (avatar-only mode)
    if (!hasAvatar || !selectedModel || !script) {
      const missingFields = [];
      // Product is optional
      if (selectedProduct && !selectedProductImage) missingFields.push('product image'); // If product selected, image is required
      if (!hasAvatar) missingFields.push(avatarMode === 'select' ? 'avatar' : 'avatar description');
      if (!selectedModel) missingFields.push('model');
      if (!script) missingFields.push('script');
      
      alert(`Please complete all steps before generating.\n\nMissing: ${missingFields.join(', ')}`);
      return;
    }

    const selectedModelData = models.find(m => m.id === selectedModel);
    if (wordCount > selectedModelData.maxWords) {
      alert(`Script exceeds ${selectedModelData.maxWords} words limit for ${selectedModelData.name}`);
      return;
    }

    setIsGenerating(true);
    
    // Create task for avatar video generation
    const taskId = addTask({
      taskType: 'avatar_video',
      status: 'processing',
      progress: 0,
      title: `Avatar Video: ${selectedModel}`,
      description: avatarMode === 'select' 
        ? `Generating video with selected avatar` 
        : `Generating video with custom avatar: ${avatarDescription.substring(0, 50)}...`,
      metadata: {
        brandId: selectedBrand?.brandId,
        productId: selectedProduct?.productId,
        productName: selectedProduct?.productName || selectedProduct?.name,
        model: selectedModel,
        avatarMode,
        scriptLength: wordCount,
      },
    });
    console.log('[AvatarVideo] 📋 Task created:', taskId);
    
    try {
      // Build payload matching backend expectations
      const payload = {
        avatar_source: avatarMode === 'select' ? 'provided' : 'generated',
        script: script,
        video_provider: selectedModel, // omni_human, kling, or veo
        aspect_ratio: aspectRatio,
        add_ambient_sound: addAmbientSound,
        ambient_setting: ambientSetting,
        ambient_volume: ambientVolume,
        voiceStability: voiceStability, // Use slider value
        voiceSimilarity: voiceSimilarity, // Use slider value
        voiceStyle: voiceStyle, // NEW! Use slider value
      };

      // Add voice_id - use selected voice or default to Rachel if none selected
      const voiceToUse = selectedVoiceId || '21m00Tcm4TlvDq8ikWAM'; // Default: Rachel
      payload.voice_id = voiceToUse;
      
      if (selectedVoiceId) {
        console.log('[Generate] Using selected voice:', selectedVoiceId, selectedVoiceName);
      } else {
        console.log('[Generate] No voice selected, using default: Rachel (21m00Tcm4TlvDq8ikWAM)');
      }

      // Add product fields only if product is selected (optional)
      if (selectedProduct) {
        payload.product_image_url = selectedProductImage ? (selectedProductImage.imageUrl || selectedProductImage.url) : (selectedProduct.imageUrl || selectedProduct.image_url);
        payload.product_name = selectedProduct.productName || selectedProduct.name;
        console.log('[Generate] Product mode: Including product data in payload');
      } else {
        console.log('[Generate] Avatar-only mode: No product data');
      }

      // Add avatar-specific fields based on mode
      if (avatarMode === 'select') {
        payload.avatar_image_url = selectedAvatar.firebase_url || selectedAvatar.imageUrl || selectedAvatar.image_url;
      } else {
        payload.avatar_description = avatarDescription.trim();
      }

      console.log('[Generate] Generating avatar video with payload:', payload);
      
      // Call API to generate video (job-based)
      await avatarAPI.generateVideo(payload);
      
      // Update task (Note: Avatar videos are job-based, so task will be updated by polling)
      // For now, we keep it in processing state and TasksContext will poll for status
      console.log('[AvatarVideo] ✅ Video generation job submitted');
      
      // Show success message
      alert('🎬 Video generation started!\n\nYour video is being created. Come back in ~10 minutes to see the result.\n\nCheck the "Generated Videos" section below or the Tasks page for progress.');
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('[Generate] Error generating video:', error);
      
      // Update task to failed
      updateTask(taskId, {
        status: 'failed',
        progress: 0,
        metadata: {
          brandId: selectedBrand?.brandId,
          productId: selectedProduct?.productId,
          model: selectedModel,
          error: error.message || 'Video generation failed',
        },
      });
      console.log('[AvatarVideo] ❌ Task failed:', taskId);
      
      // Show friendly error message
      alert('⚠️ Video generation failed!\n\nThere was an error starting the video generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setSelectedProduct(null);
    setSelectedProductImage(null);
    setSelectedAvatar(null);
    setAvatarDescription('');
    setAvatarMode('select');
    setSelectedModel('');
    setScript('');
  };

  const getMaxWords = () => {
    const model = models.find(m => m.id === selectedModel);
    return model ? model.maxWords : 30;
  };

  const isScriptValid = () => {
    return wordCount > 0 && wordCount <= getMaxWords();
  };

  // Handle emotion enhancement
  const handleAddEmotions = async () => {
    if (!script || script.length < 10) {
      alert('⚠️ Please enter a script (at least 10 characters) to add emotions.');
      return;
    }

    setIsEnhancing(true);

    try {
      console.log('[AvatarVideo] Enhancing script with emotions:', { scriptType, emotionIntensity });
      
      const response = await scriptAPI.enhanceEmotions(script, scriptType, null, emotionIntensity);
      
      if (response.success && response.enhanced_script) {
        // Replace script with enhanced version
        setScript(response.enhanced_script);
        
        // Show success message
        alert(`✨ Added ${response.marker_count} emotion markers!\n\nMarkers: ${response.markers_added.join(', ')}\n\nYour script now sounds more natural and expressive!`);
      } else {
        throw new Error(response.message || 'Enhancement failed');
      }
    } catch (error) {
      console.error('[AvatarVideo] Error enhancing script:', error);
      alert(`⚠️ Failed to add emotions: ${error.message}\n\nPlease try again or adjust your script.`);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle find best voices (NEW!)
  const handleFindVoices = async () => {
    if (!script || script.length < 10) {
      alert('⚠️ Please enter a script to find matching voices.');
      return;
    }

    setIsFindingVoices(true);

    try {
      console.log('[AvatarVideo] Finding best voices for script...');
      
      // Get avatar info based on mode
      const avatarImageUrl = avatarMode === 'select' && selectedAvatar 
        ? (selectedAvatar.firebase_url || selectedAvatar.imageUrl)
        : null;
      
      const avatarDesc = avatarMode === 'describe' && avatarDescription
        ? avatarDescription
        : null;
      
      const response = await scriptAPI.recommendVoice(
        script,
        avatarImageUrl,
        avatarDesc,
        10 // Get top 10 voices
      );
      
      if (response.success && response.voices && response.voices.length > 0) {
        setRecommendedVoices(response.voices);
        
        // Auto-select the top recommendation
        setSelectedVoiceId(response.voices[0].voice_id);
        setSelectedVoiceName(response.voices[0].name);
        
        alert(`🎯 Found ${response.voices.length} matching voices!\n\nTop match: ${response.voices[0].name} (${response.voices[0].match_score}% match)\n\nPreview each voice below and select your favorite!`);
      } else {
        throw new Error('No matching voices found');
      }
    } catch (error) {
      console.error('[AvatarVideo] Error finding voices:', error);
      alert(`⚠️ Failed to find voices: ${error.message}\n\nPlease try again or continue with the default voice.`);
    } finally {
      setIsFindingVoices(false);
    }
  };

  // Handle voice preview (updated to accept voice_id)
  const handlePreviewVoice = async (voiceId = null, voiceName = null) => {
    if (!script || script.length < 5) {
      alert('⚠️ Please enter a script to preview.');
      return;
    }

    // Use provided voiceId or default
    const targetVoiceId = voiceId || selectedVoiceId || '21m00Tcm4TlvDq8ikWAM';
    const targetVoiceName = voiceName || selectedVoiceName || 'Rachel';

    // Stop any currently playing audio
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    setPreviewingVoiceId(targetVoiceId);
    setAudioUrl(null);

    try {
      console.log('[AvatarVideo] Generating voice preview:', { voiceId: targetVoiceId, voiceName: targetVoiceName });
      
      const response = await scriptAPI.previewVoice(
        script,
        targetVoiceId,
        voiceStability, // Use slider value
        voiceSimilarity, // Use slider value
        voiceStyle, // Use slider value
        'eleven_multilingual_v2' // model
      );
      
      console.log('[AvatarVideo] Full response:', response);
      
      if (response.success && response.audio_url) {
        setAudioUrl(response.audio_url);
        
        // Create audio player but DON'T auto-play (user controls it with HTML audio element)
        const audio = new Audio(response.audio_url);
        setAudioPlayer(audio);
        
        // Update button state when audio finishes
        audio.onended = () => {
          setPreviewingVoiceId(null);
        };
      } else {
        // Extract detailed error message from response
        const errorMsg = response.error || response.message || response.detail || 'Preview generation failed';
        console.error('[AvatarVideo] Backend error:', {
          success: response.success,
          error: response.error,
          message: response.message,
          detail: response.detail,
          fullResponse: response
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('[AvatarVideo] Error generating preview:', error);
      
      // More detailed error message
      let errorMsg = error.message;
      if (errorMsg.includes('ELEVENLABS_API_KEY')) {
        errorMsg = 'Voice service is not configured on the backend. Please contact support.';
      } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
        errorMsg = 'Voice service quota exceeded. Please try again later.';
      } else if (errorMsg.includes('timeout') || errorMsg.includes('ECONNABORTED')) {
        errorMsg = 'Voice service timed out. Please try again.';
      }
      
      alert(`⚠️ Voice Preview Failed\n\n${errorMsg}\n\nBackend Issue: The voice preview service is not working properly. Please check the backend logs or contact support.`);
      setPreviewingVoiceId(null);
    }
  };

  // Handle clear emotions
  const handleClearEmotions = () => {
    const cleaned = script.replace(/\[[\w\s]+\]\s*/g, '');
    setScript(cleaned);
    alert('✅ Emotion markers removed from script.');
  };

  // Check if script has emotion markers
  // Helper: Get emotion color
  const getEmotionColor = (marker) => {
    const emotion = marker.toLowerCase();
    if (emotion.includes('happy') || emotion.includes('excited') || emotion.includes('joyful') || emotion.includes('cheerful') || emotion.includes('laughing')) {
      return '#facc15'; // yellow
    }
    if (emotion.includes('sad') || emotion.includes('melancholy') || emotion.includes('sorrowful')) {
      return '#60a5fa'; // blue
    }
    if (emotion.includes('angry') || emotion.includes('frustrated') || emotion.includes('mad')) {
      return '#f87171'; // red
    }
    if (emotion.includes('calm') || emotion.includes('peaceful') || emotion.includes('thoughtful') || emotion.includes('reflective')) {
      return '#2dd4bf'; // teal
    }
    if (emotion.includes('surprised') || emotion.includes('shocked') || emotion.includes('amazed')) {
      return '#f472b6'; // pink
    }
    if (emotion.includes('warm') || emotion.includes('friendly') || emotion.includes('welcoming')) {
      return '#fb923c'; // orange
    }
    if (emotion.includes('confident') || emotion.includes('proud') || emotion.includes('bold')) {
      return '#818cf8'; // indigo
    }
    if (emotion.includes('grateful') || emotion.includes('thankful')) {
      return '#4ade80'; // green
    }
    if (emotion.includes('pause') || emotion.includes('quickly') || emotion.includes('slowly') || emotion.includes('whisper') || emotion.includes('emphasize')) {
      return '#9ca3af'; // gray
    }
    return '#c084fc'; // purple (default)
  };

  // Helper: Format script with styled emotion markers
  const formatScriptHTML = (text) => {
    if (!text) return '';
    
    return text
      .split(/(\[[\w\s]+\])/)
      .map((part) => {
        if (part.match(/^\[[\w\s]+\]$/)) {
          const color = getEmotionColor(part);
          return `<span style="color: ${color}; font-weight: 700; background-color: ${color}20; padding: 2px 8px; border-radius: 6px; border: 1px solid ${color}40; display: inline-block; margin: 0 2px;">${part}</span>`;
        }
        return part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      })
      .join('');
  };

  // Helper: Save and restore cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(scriptEditorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }
    return 0;
  };

  const restoreCursorPosition = (position) => {
    if (!scriptEditorRef.current) return;
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    let charCount = 0;
    let found = false;

    const traverseNodes = (node) => {
      if (found) return;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.length;
        if (position <= nextCharCount) {
          range.setStart(node, position - charCount);
          range.setEnd(node, position - charCount);
          found = true;
          return;
        }
        charCount = nextCharCount;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverseNodes(node.childNodes[i]);
          if (found) return;
        }
      }
    };

    traverseNodes(scriptEditorRef.current);
    
    if (found) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Update editor display when script changes externally or on mount
  useEffect(() => {
    if (scriptEditorRef.current && document.activeElement !== scriptEditorRef.current) {
      scriptEditorRef.current.innerHTML = formatScriptHTML(script) || '<span style="color: #6b7280;">Write your script here...</span>';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  // Initialize editor content on mount
  useEffect(() => {
    if (scriptEditorRef.current && !scriptEditorRef.current.innerHTML) {
      scriptEditorRef.current.innerHTML = script ? formatScriptHTML(script) : '<span style="color: #6b7280;">Write your script here...</span>';
    }
  }, []);

  const hasEmotionMarkers = () => {
    return script.includes('[') && /\[[\w\s]+\]/.test(script);
  };

  return (
    <DashboardLayout>
      <div className="p-2 xxs:p-4 sm:p-5 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full font-poppins">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h1 className="text-white text-2xl sm:text-3xl font-bold">
              Avatar Video Generation
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Create AI-powered avatar videos for your products
          </p>
        </div>

        {!selectedBrand ? (
          <div className="bg-[#1A1A1A] rounded-xl p-8 border border-[#262626] text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-white text-lg font-semibold mb-2">No Brand Selected</h3>
            <p className="text-gray-400">Please select a brand from the sidebar to create avatar videos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Generation Steps */}
            <div className="xl:col-span-2 space-y-6">
              {/* Progress Steps */}
              <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          currentStep >= step
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-[#0F0F0F] text-gray-500 border border-[#262626]'
                        }`}>
                          {step}
                        </div>
                        <p className={`text-xs mt-2 ${currentStep >= step ? 'text-white' : 'text-gray-500'}`}>
                          {step === 1 && 'Product'}
                          {step === 2 && 'Avatar'}
                          {step === 3 && 'Model'}
                          {step === 4 && 'Script'}
                        </p>
                      </div>
                      {step < 4 && (
                        <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                          currentStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-[#262626]'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step 1: Product Selection */}
              {currentStep >= 1 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">1</span>
                      Select Product <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                    </h2>
                    {!selectedProduct && (
                      <button
                        onClick={() => {
                          console.log('[AvatarVideo] Skipping product selection - Avatar only mode');
                          setCurrentStep(2);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Skip (Avatar Only)
                      </button>
                    )}
                  </div>
                  {selectedProduct ? (
                    <div className="space-y-4">
                      {/* Selected Product Info */}
                      <div className="p-4 bg-[#0F0F0F] rounded-lg border border-purple-500/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedProduct.imageUrl && (
                            <img src={selectedProduct.imageUrl} alt={selectedProduct.productName} className="w-16 h-16 rounded object-cover" />
                          )}
                          <div>
                            <p className="text-white font-semibold">{selectedProduct.productName}</p>
                            <p className="text-gray-400 text-sm">{selectedProduct.productDescription?.substring(0, 60)}...</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            setSelectedProductImage(null);
                            setProductImages([]);
                            setCurrentStep(1);
                          }}
                          className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Change
                        </button>
                      </div>

                      {/* Product Image Selection */}
                      <div className="border-t border-[#262626] pt-4">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Select Product Image</h3>
                        {loadingProductImages ? (
                          <div className="text-center py-8">
                            <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-400 text-sm">Loading images...</p>
                          </div>
                        ) : selectedProductImage ? (
                          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={selectedProductImage.imageUrl || selectedProductImage.url} 
                                alt="Selected" 
                                className="w-20 h-20 rounded object-cover"
                              />
                              <p className="text-white text-sm">Image selected</p>
                            </div>
                            <button
                              onClick={() => setSelectedProductImage(null)}
                              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                              Change
                            </button>
                          </div>
                        ) : productImages.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {productImages.map((image) => (
                              <div
                                key={image.id}
                                onClick={() => handleProductImageSelect(image)}
                                className="aspect-square rounded-lg overflow-hidden border-2 border-[#262626] hover:border-purple-500 cursor-pointer transition-all group"
                              >
                                <img 
                                  src={image.imageUrl || image.url} 
                                  alt="Product" 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-sm">
                            No images found for this product
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loadingProducts ? (
                        <div className="col-span-2 text-center py-8">
                          <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-gray-400">Loading products...</p>
                        </div>
                      ) : brandProducts && brandProducts.length > 0 ? (
                        brandProducts.map((product) => (
                          <div
                            key={product.productId}
                            onClick={() => handleProductSelect(product)}
                            className="p-4 bg-[#0F0F0F] rounded-lg border border-[#262626] hover:border-purple-500/50 cursor-pointer transition-all group"
                          >
                            <div className="flex gap-3">
                              {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.productName} className="w-16 h-16 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="text-white font-semibold group-hover:text-purple-400 transition-colors">{product.productName}</p>
                                <p className="text-gray-400 text-sm line-clamp-2">{product.productDescription}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-gray-400">
                          No products available. Please add products first.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Avatar Selection */}
              {currentStep >= 2 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">2</span>
                    Choose Avatar
                  </h2>

                  {/* Avatar Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        setAvatarMode('select');
                        setAvatarDescription('');
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        avatarMode === 'select'
                          ? 'bg-purple-500 text-white'
                          : 'bg-[#0F0F0F] text-gray-400 hover:text-white border border-[#262626]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Select from Gallery
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setAvatarMode('describe');
                        setSelectedAvatar(null);
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        avatarMode === 'describe'
                          ? 'bg-purple-500 text-white'
                          : 'bg-[#0F0F0F] text-gray-400 hover:text-white border border-[#262626]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Describe Character
                      </div>
                    </button>
                  </div>

                  {avatarMode === 'select' ? (
                    <>
                  {/* Avatar Filters */}
                  <div className="mb-4 space-y-4">
                    {/* Filter Title */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-400">Filter Avatars</h3>
                      {(filters.gender || filters.age || filters.situation || filters.accessories || filters.emotions || filters.ethnicity || filters.hairStyle || filters.hairColor || searchQuery) && (
                        <button
                          onClick={() => {
                            setFilters({
                              gender: '',
                              age: '',
                              situation: '',
                              accessories: '',
                              emotions: '',
                              ethnicity: '',
                              hairStyle: '',
                              hairColor: ''
                            });
                            setSearchQuery('');
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Filter Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Gender */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Gender</label>
                        <select
                          value={filters.gender}
                          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                      </div>

                      {/* Age Range */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Age Range</label>
                        <select
                          value={filters.age}
                          onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="18-24">18-24</option>
                          <option value="25-34">25-34</option>
                          <option value="35-44">35-44</option>
                          <option value="45-54">45-54</option>
                          <option value="55+">55+</option>
                        </select>
                      </div>

                      {/* Situation (Location/Job) */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Situation (Location/Work)</label>
                        <select
                          value={filters.situation}
                          onChange={(e) => setFilters({ ...filters, situation: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="AI Avatar">AI Avatar</option>
                          <option value="Airport">Airport</option>
                          <option value="ASMR">ASMR</option>
                          <option value="Balcony">Balcony</option>
                          <option value="Bathroom">Bathroom</option>
                          <option value="Beach">Beach</option>
                          <option value="Boat">Boat</option>
                          <option value="Car">Car</option>
                          <option value="Christmas">Christmas</option>
                          <option value="Coffee Shop">Coffee Shop</option>
                          <option value="Cooking">Cooking</option>
                          <option value="Drink">Drink</option>
                          <option value="Family">Family</option>
                          <option value="Firefighter">Firefighter</option>
                          <option value="Formal">Formal</option>
                          <option value="Gaming">Gaming</option>
                          <option value="Green Screen">Green Screen</option>
                          <option value="GRWM">GRWM</option>
                          <option value="Gym">Gym</option>
                          <option value="Hannukah">Hannukah</option>
                          <option value="Historical">Historical</option>
                          <option value="Home">Home</option>
                          <option value="Hook">Hook</option>
                          <option value="Interview">Interview</option>
                          <option value="Kitchen">Kitchen</option>
                          <option value="Mall">Mall</option>
                          <option value="Medical">Medical</option>
                          <option value="Movement">Movement</option>
                          <option value="Multi-Frame">Multi-Frame</option>
                          <option value="Nature">Nature</option>
                          <option value="News Anchor">News Anchor</option>
                          <option value="Night">Night</option>
                          <option value="Office">Office</option>
                          <option value="Outside">Outside</option>
                          <option value="Plane">Plane</option>
                          <option value="Podcast">Podcast</option>
                          <option value="Pointing">Pointing</option>
                          <option value="Pool">Pool</option>
                          <option value="Pregnant">Pregnant</option>
                          <option value="Reverse">Reverse</option>
                          <option value="Sitting">Sitting</option>
                          <option value="Skit">Skit</option>
                          <option value="Snow">Snow</option>
                          <option value="Store">Store</option>
                          <option value="Streaming">Streaming</option>
                          <option value="Street">Street</option>
                          <option value="Studio">Studio</option>
                          <option value="Talk">Talk</option>
                          <option value="Walking">Walking</option>
                          <option value="Yoga">Yoga</option>
                        </select>
                      </div>

                      {/* Accessories */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Accessories</label>
                        <select
                          value={filters.accessories}
                          onChange={(e) => setFilters({ ...filters, accessories: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="Bags">Bags</option>
                          <option value="Bathrobe">Bathrobe</option>
                          <option value="Book">Book</option>
                          <option value="Candle">Candle</option>
                          <option value="Cards">Cards</option>
                          <option value="Dishes">Dishes</option>
                          <option value="Drink">Drink</option>
                          <option value="Dumbbells">Dumbbells</option>
                          <option value="Food">Food</option>
                          <option value="Fridge">Fridge</option>
                          <option value="Fruit">Fruit</option>
                          <option value="Glasses">Glasses</option>
                          <option value="Guitare">Guitare</option>
                          <option value="Hat">Hat</option>
                          <option value="Headphone">Headphone</option>
                          <option value="Hijab">Hijab</option>
                          <option value="Jar">Jar</option>
                          <option value="Jewels">Jewels</option>
                          <option value="Knit">Knit</option>
                          <option value="Laptop">Laptop</option>
                          <option value="Mic">Mic</option>
                          <option value="Mirror">Mirror</option>
                          <option value="Mug">Mug</option>
                          <option value="Pet">Pet</option>
                          <option value="Phone">Phone</option>
                          <option value="Piano">Piano</option>
                          <option value="Plant">Plant</option>
                          <option value="Present">Present</option>
                          <option value="Scarf">Scarf</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Suit">Suit</option>
                          <option value="Tools">Tools</option>
                          <option value="Trash Can">Trash Can</option>
                          <option value="Tree">Tree</option>
                        </select>
                      </div>

                      {/* Emotions */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Emotions</label>
                        <select
                          value={filters.emotions}
                          onChange={(e) => setFilters({ ...filters, emotions: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="Calm">Calm</option>
                          <option value="Enthusiastic">Enthusiastic</option>
                          <option value="Excited">Excited</option>
                          <option value="Frustrated">Frustrated</option>
                          <option value="Happy">Happy</option>
                          <option value="Sad">Sad</option>
                          <option value="Serious">Serious</option>
                          <option value="Smiling">Smiling</option>
                        </select>
                      </div>

                      {/* Ethnicity */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ethnicity</label>
                        <select
                          value={filters.ethnicity}
                          onChange={(e) => setFilters({ ...filters, ethnicity: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="caucasian">Caucasian</option>
                          <option value="african">African</option>
                          <option value="asian">Asian</option>
                          <option value="hispanic">Hispanic</option>
                          <option value="middle eastern">Middle Eastern</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </div>

                      {/* Hair Type */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hair Type</label>
                        <select
                          value={filters.hairStyle}
                          onChange={(e) => setFilters({ ...filters, hairStyle: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="Short">Short</option>
                          <option value="Medium">Medium</option>
                          <option value="Long">Long</option>
                          <option value="Ponytail">Ponytail</option>
                          <option value="Bun">Bun</option>
                        </select>
                      </div>

                      {/* Hair Color */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hair Color</label>
                        <select
                          value={filters.hairColor}
                          onChange={(e) => setFilters({ ...filters, hairColor: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="">All</option>
                          <option value="black">Black</option>
                          <option value="brown">Brown</option>
                          <option value="blonde">Blonde</option>
                          <option value="red">Red</option>
                          <option value="grey">Grey</option>
                          <option value="white">White</option>
                        </select>
                      </div>
                    </div>

                    {/* Optional Text Search */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Additional Search (optional)</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g., smiling, professional, casual..."
                          className="w-full pl-9 pr-4 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Results Count */}
                    {(filters.gender || filters.age || filters.situation || filters.accessories || filters.emotions || filters.ethnicity || filters.hairStyle || filters.hairColor || searchQuery) && (
                      <p className="text-sm text-gray-400">
                        Found {filteredAvatars.length} avatar{filteredAvatars.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {selectedAvatar ? (
                    <div className="p-4 bg-[#0F0F0F] rounded-lg border border-purple-500/50 flex items-center justify-between animate-fade-in">
                      <div className="flex items-center gap-3">
                        <img 
                          src={selectedAvatar.firebase_url || selectedAvatar.imageUrl} 
                          alt={selectedAvatar.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl" style={{display: 'none'}}>
                          {selectedAvatar.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{selectedAvatar.name}</p>
                          <p className="text-gray-400 text-sm capitalize">
                            {selectedAvatar.gender} • {selectedAvatar.eye_color} eyes • {selectedAvatar.hair_color} hair
                          </p>
                          {selectedAvatar.age_range && (
                            <p className="text-gray-500 text-xs">Age: {selectedAvatar.age_range}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAvatar(null);
                          setCurrentStep(2);
                        }}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {isLoadingAvatars && avatars.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="ml-3 text-gray-400">Loading avatars...</span>
                        </div>
                      ) : filteredAvatars.length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="text-gray-400">No avatars found</p>
                          {(filters.gender || filters.age || filters.situation || filters.accessories || filters.emotions || filters.ethnicity || filters.hairStyle || filters.hairColor || searchQuery) && (
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredAvatars.map((avatar) => (
                              <div
                                key={avatar.id}
                                onClick={() => openAvatarDetail(avatar)}
                                className="bg-[#0F0F0F] rounded-lg border border-[#262626] hover:border-purple-500/50 cursor-pointer transition-all overflow-hidden group"
                              >
                                <div className="aspect-[3/4] relative overflow-hidden bg-gray-900">
                                  <img 
                                    src={getThumbnailUrl(avatar.firebase_url || avatar.imageUrl)}
                                    alt={avatar.name}
                                    loading="lazy"
                                    decoding="async"
                                    width="300"
                                    height="400"
                                    className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                                      loadedImages.has(avatar.id) ? 'blur-0' : 'blur-sm'
                                    }`}
                                    style={{ 
                                      contentVisibility: 'auto',
                                      imageRendering: 'auto'
                                    }}
                                    onLoad={() => handleImageLoad(avatar.id)}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl" style={{display: 'none'}}>
                                    {avatar.name?.charAt(0) || '?'}
                                  </div>
                                  {/* Hover overlay with "Click to view" hint */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3">
                                    <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <p className="text-white text-sm font-semibold">Click to view</p>
                                    <div className="text-white text-xs space-y-1 mt-3 text-center">
                                      <p className="font-semibold capitalize">{avatar.gender} • {avatar.age_range}</p>
                                      <p className="text-gray-300 capitalize">{avatar.ethnicity}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <p className="text-white font-semibold text-sm truncate group-hover:text-purple-400 transition-colors">{avatar.name}</p>
                                  <p className="text-gray-400 text-xs capitalize mt-1">
                                    {avatar.eye_color} eyes • {avatar.hair_color} hair
                                  </p>
                                  {avatar.tags && avatar.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {avatar.tags.slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Load More Button */}
                          {hasMoreAvatars && !searchQuery && !filters.gender && !filters.age && !filters.situation && !filters.accessories && !filters.emotions && !filters.ethnicity && !filters.hairStyle && !filters.hairColor && (
                            <div className="flex justify-center pt-4">
                              <button
                                onClick={() => loadAvatars(true)}
                                disabled={isLoadingAvatars}
                                className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {isLoadingAvatars ? (
                                  <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <span>Load More Avatars</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  </>
                  ) : (
                    /* Describe Mode */
                    <div className="space-y-4">
                      <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#262626]">
                        <p className="text-gray-300 text-sm mb-3">
                          Describe the character you want to generate. Be specific about appearance, age, gender, and style.
                        </p>
                        <textarea
                          value={avatarDescription}
                          onChange={(e) => setAvatarDescription(e.target.value)}
                          placeholder="Example: blonde hair, blue eyes, fair skin, 25 years old female, casual clothing, confident expression"
                          className="w-full h-32 px-4 py-3 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {avatarDescription.length} characters
                          </p>
                          {avatarDescription && (
                            <button
                              onClick={() => setAvatarDescription('')}
                              className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {avatarDescription && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-green-400 font-medium text-sm">Character Description Set</p>
                                <p className="text-green-300/70 text-xs mt-1">
                                  A custom avatar will be generated based on your description
                                </p >
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setCurrentStep(3)}
                            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span>Continue to Model Selection</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* Example descriptions */}
                      <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#262626]">
                        <p className="text-gray-300 text-sm font-medium mb-2">💡 Example Descriptions:</p>
                        <div className="space-y-2">
                          {[
                            "African American female, 30 years old, curly black hair, brown eyes, warm smile, business casual attire",
                            "Asian male, 25 years old, short black hair, glasses, casual t-shirt, friendly demeanor",
                            "Hispanic female, 28 years old, long brown hair, hazel eyes, elegant dress, confident posture"
                          ].map((example, idx) => (
                            <button
                              key={idx}
                              onClick={() => setAvatarDescription(example)}
                              className="w-full text-left px-3 py-2 bg-[#1A1A1A] hover:bg-[#262626] rounded text-gray-400 text-xs transition-colors"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Model Selection */}
              {currentStep >= 3 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">3</span>
                    Select Model
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedModel === model.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-[#262626] bg-[#0F0F0F] hover:border-purple-500/50'
                        }`}
                      >
                        <h3 className="text-white font-bold mb-1">{model.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{model.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                            Max {model.maxWords} words
                          </span>
                          {model.id === 'veo' && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                              8s max
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Script & Voice */}
              {currentStep >= 4 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">4</span>
                    Script & Voice Setup
                  </h2>
                  <div className="space-y-6">
                    {/* Step 4.1: Write Script */}
                    <div className="bg-[#0F0F0F] rounded-lg p-5 border border-[#262626]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                          Write Your Script
                        </h3>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                          isScriptValid() 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : wordCount > getMaxWords() 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {wordCount} / {getMaxWords()} words
                        </div>
                      </div>
                      
                      {/* Custom Script Editor with Live Emotion Highlighting */}
                      <div className="relative">
                        <div
                          ref={scriptEditorRef}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(e) => {
                            const cursorPos = saveCursorPosition();
                            const plainText = e.target.textContent || '';
                            setScript(plainText);
                            
                            // Update formatting
                            setTimeout(() => {
                              if (scriptEditorRef.current) {
                                scriptEditorRef.current.innerHTML = formatScriptHTML(plainText);
                                restoreCursorPosition(cursorPos);
                              }
                            }, 0);
                          }}
                          onFocus={(e) => {
                            // Remove placeholder on focus
                            if (!script && e.target.textContent === 'Write your script here...') {
                              e.target.textContent = '';
                            }
                          }}
                          onBlur={(e) => {
                            // Add placeholder back if empty
                            if (!script) {
                              e.target.innerHTML = '<span style="color: #6b7280;">Write your script here...</span>';
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const text = e.clipboardData.getData('text/plain');
                            const cursorPos = saveCursorPosition();
                            document.execCommand('insertText', false, text);
                            const newText = scriptEditorRef.current.textContent || '';
                            setScript(newText);
                            
                            setTimeout(() => {
                              if (scriptEditorRef.current) {
                                scriptEditorRef.current.innerHTML = formatScriptHTML(newText);
                                restoreCursorPosition(cursorPos + text.length);
                              }
                            }, 0);
                          }}
                          className="w-full min-h-[160px] max-h-[320px] overflow-y-auto px-4 py-3 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm leading-relaxed"
                          style={{
                            caretColor: '#a855f7',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        />
                        
                        {/* Emotion Markers Preview */}
                        {hasEmotionMarkers() && (
                          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <div className="flex items-start gap-2 mb-2">
                              <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-purple-300 text-xs font-semibold mb-2">Emotion Markers Detected:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {(() => {
                                    const markers = script.match(/\[(\w+)\]/g);
                                    const uniqueMarkers = [...new Set(markers)];
                                    
                                    const getEmotionColor = (marker) => {
                                      const emotion = marker.toLowerCase();
                                      // Positive emotions
                                      if (emotion.includes('happy') || emotion.includes('excited') || emotion.includes('joyful') || emotion.includes('cheerful')) {
                                        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
                                      }
                                      // Sad emotions
                                      if (emotion.includes('sad') || emotion.includes('melancholy') || emotion.includes('sorrowful')) {
                                        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                                      }
                                      // Angry emotions
                                      if (emotion.includes('angry') || emotion.includes('frustrated') || emotion.includes('mad')) {
                                        return 'bg-red-500/20 text-red-300 border-red-500/40';
                                      }
                                      // Calm/Thoughtful emotions
                                      if (emotion.includes('calm') || emotion.includes('peaceful') || emotion.includes('thoughtful') || emotion.includes('reflective')) {
                                        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
                                      }
                                      // Surprised emotions
                                      if (emotion.includes('surprised') || emotion.includes('shocked') || emotion.includes('amazed')) {
                                        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
                                      }
                                      // Warm/Friendly emotions
                                      if (emotion.includes('warm') || emotion.includes('friendly') || emotion.includes('welcoming')) {
                                        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
                                      }
                                      // Confident emotions
                                      if (emotion.includes('confident') || emotion.includes('proud') || emotion.includes('bold')) {
                                        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
                                      }
                                      // Pacing markers
                                      if (emotion.includes('pause') || emotion.includes('quickly') || emotion.includes('slowly')) {
                                        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
                                      }
                                      // Default purple
                                      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                                    };
                                    
                                    return uniqueMarkers?.map((marker, idx) => (
                                      <span
                                        key={idx}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getEmotionColor(marker)}`}
                                      >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                                        </svg>
                                        {marker}
                                      </span>
                                    ));
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {wordCount > getMaxWords() && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-red-400 text-sm">
                            Script exceeds {getMaxWords()} words limit. Please shorten it to continue.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Step 4.2: Enhance Script with Emotions */}
                    <div className="bg-[#0F0F0F] rounded-lg p-5 border border-[#262626]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                          Add Emotions (Optional)
                        </h3>
                        {hasEmotionMarkers() && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                            ✓ Emotions Added
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">
                        AI will automatically add emotion markers like [excited], [happy], [confident] to make your voice sound more natural and engaging.
                      </p>

                      <button
                        onClick={handleAddEmotions}
                        disabled={!script || script.length < 10 || isEnhancing || previewingVoiceId}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                      >
                        {isEnhancing ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Adding Emotions...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>Add Emotions to Script</span>
                          </>
                        )}
                      </button>

                      {hasEmotionMarkers() && (
                        <button
                          onClick={handleClearEmotions}
                          className="w-full mt-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove Emotions</span>
                        </button>
                      )}
                    </div>

                    {/* Step 4.3: Find Perfect Voice */}
                    <div className="bg-[#0F0F0F] rounded-lg p-5 border border-[#262626]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                          Select Voice
                        </h3>
                        {selectedVoiceName && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                            ✓ {selectedVoiceName}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">
                        AI will analyze your script and avatar to recommend the best matching voices. Preview and select your favorite!
                      </p>

                      <button
                        onClick={handleFindVoices}
                        disabled={!script || script.length < 10 || isFindingVoices || previewingVoiceId}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                      >
                        {isFindingVoices ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Finding Best Voices...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <span>Find Best Matching Voices</span>
                          </>
                        )}
                      </button>

                    </div>

                    {/* Voice Cards - Shown after finding voices */}
                    {recommendedVoices.length > 0 && (
                      <div className="bg-[#0F0F0F] rounded-lg p-5 border border-[#262626] animate-fade-in">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Best Matching Voices ({recommendedVoices.length})
                        </h4>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {recommendedVoices.map((voice, index) => (
                            <div
                              key={voice.voice_id}
                              className={`group p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                selectedVoiceId === voice.voice_id
                                  ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10'
                                  : 'border-[#262626] bg-[#1A1A1A] hover:border-green-500/50 hover:bg-green-500/5'
                              }`}
                              onClick={() => {
                                setSelectedVoiceId(voice.voice_id);
                                setSelectedVoiceName(voice.name);
                              }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                                    <h5 className="text-white font-semibold text-base">
                                      {voice.name}
                                    </h5>
                                    {selectedVoiceId === voice.voice_id && (
                                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
                                        ✓ Selected
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full font-medium border border-purple-500/30">
                                      {voice.match_score}% match
                                    </span>
                                    <span className="text-xs text-gray-400 capitalize">
                                      {voice.gender}
                                    </span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-400 capitalize">
                                      {voice.age}
                                    </span>
                                    {voice.accent && (
                                      <>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-400 capitalize">
                                          {voice.accent}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-gray-400 text-sm mb-3">
                                {voice.description}
                              </p>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewVoice(voice.voice_id, voice.name);
                                }}
                                disabled={previewingVoiceId !== null}
                                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                {previewingVoiceId === voice.voice_id ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generating Preview...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Listen to Preview</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio Player */}
                    {audioUrl && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg animate-fade-in">
                        <div className="flex items-start gap-3 mb-2">
                          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-green-400 font-medium text-sm">Preview Ready!</p>
                            <p className="text-green-300/70 text-xs mt-0.5">
                              Click play to hear how your script sounds
                            </p>
                          </div>
                        </div>
                        <audio 
                          ref={audioRef}
                          controls 
                          src={audioUrl} 
                          className="w-full mt-2"
                          style={{ height: '40px' }}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}

                    {/* Voice Quality Settings (Collapsible) */}
                    {(selectedVoiceId || recommendedVoices.length > 0) && (
                      <div className="bg-[#0F0F0F] rounded-lg border border-[#262626] overflow-hidden">
                        <button
                          onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                          className="w-full px-5 py-3 flex items-center justify-between hover:bg-[#1A1A1A] transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span className="text-sm font-medium text-white">Voice Quality Settings</span>
                            <span className="text-xs text-gray-500">(Optional)</span>
                          </div>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${showVoiceSettings ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showVoiceSettings && (
                          <div className="p-5 bg-[#0F0F0F] space-y-6 border-t border-[#262626] animate-fade-in">
                            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-blue-300 text-xs">
                                  <strong>Tip:</strong> Default values work great for most cases. {hasEmotionMarkers() && "Using ElevenLabs v3 model for emotion markers."}
                                </p>
                              </div>
                            </div>

                            {/* Voice Stability - Discrete or Continuous based on emotion markers */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-white">
                                  Voice Stability
                                  {hasEmotionMarkers() && (
                                    <span className="ml-2 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                                      v3 Mode
                                    </span>
                                  )}
                                </label>
                                <span className="text-sm font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30">
                                  {voiceStability.toFixed(1)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {hasEmotionMarkers() 
                                  ? "With emotion markers, stability uses ElevenLabs v3 model (3 fixed levels)"
                                  : "Consistency vs Variation • Low = expressive | High = consistent"}
                              </p>
                              
                              {hasEmotionMarkers() ? (
                                // Discrete options for v3 model (when emotion markers present)
                                <div className="grid grid-cols-3 gap-3">
                                  <button
                                    onClick={() => setVoiceStability(0.0)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                      voiceStability <= 0.24
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
                                    }`}
                                  >
                                    <div className="font-semibold text-white text-sm mb-1">0.0 - Creative</div>
                                    <div className="text-xs text-gray-400">More expressive, varied</div>
                                  </button>
                                  <button
                                    onClick={() => setVoiceStability(0.5)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                      voiceStability >= 0.25 && voiceStability <= 0.74
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
                                    }`}
                                  >
                                    <div className="font-semibold text-white text-sm mb-1">0.5 - Natural</div>
                                    <div className="text-xs text-gray-400">Recommended default</div>
                                  </button>
                                  <button
                                    onClick={() => setVoiceStability(1.0)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                      voiceStability >= 0.75
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50'
                                    }`}
                                  >
                                    <div className="font-semibold text-white text-sm mb-1">1.0 - Robust</div>
                                    <div className="text-xs text-gray-400">Very consistent</div>
                                  </button>
                                </div>
                              ) : (
                                // Continuous slider for normal mode (no emotion markers)
                                <>
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={voiceStability}
                                    onChange={(e) => setVoiceStability(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Varied</span>
                                    <span>Balanced</span>
                                    <span>Consistent</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Voice Similarity Slider */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-white">
                                  Voice Similarity
                                </label>
                                <span className="text-sm font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/30">
                                  {voiceSimilarity.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Closeness to original voice • Low = natural | High = accurate
                              </p>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={voiceSimilarity}
                                onChange={(e) => setVoiceSimilarity(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Natural</span>
                                <span>Balanced</span>
                                <span>Original</span>
                              </div>
                            </div>

                            {/* Voice Style Slider */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-white">
                                  Voice Style (Expressiveness)
                                </label>
                                <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30">
                                  {voiceStyle.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Energy level • Low = calm, neutral | High = expressive, animated
                              </p>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={voiceStyle}
                                onChange={(e) => setVoiceStyle(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Calm</span>
                                <span>Balanced</span>
                                <span>Expressive</span>
                              </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="pt-4 border-t border-[#262626]">
                              <p className="text-xs font-medium text-gray-400 mb-3">Quick Presets:</p>
                              <div className="grid grid-cols-4 gap-2">
                                <button
                                  onClick={() => {
                                    setVoiceStability(0.5);
                                    setVoiceSimilarity(0.75);
                                    setVoiceStyle(0.75);
                                  }}
                                  className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-purple-500/50 text-white text-xs rounded transition-all"
                                >
                                  Natural
                                </button>
                                <button
                                  onClick={() => {
                                    setVoiceStability(hasEmotionMarkers() ? 1.0 : 0.8);
                                    setVoiceSimilarity(0.8);
                                    setVoiceStyle(0.5);
                                  }}
                                  className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-blue-500/50 text-white text-xs rounded transition-all"
                                >
                                  Professional
                                </button>
                                <button
                                  onClick={() => {
                                    setVoiceStability(hasEmotionMarkers() ? 0.0 : 0.4);
                                    setVoiceSimilarity(0.7);
                                    setVoiceStyle(0.9);
                                  }}
                                  className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-pink-500/50 text-white text-xs rounded transition-all"
                                >
                                  Energetic
                                </button>
                                <button
                                  onClick={() => {
                                    setVoiceStability(hasEmotionMarkers() ? 1.0 : 0.9);
                                    setVoiceSimilarity(0.8);
                                    setVoiceStyle(0.3);
                                  }}
                                  className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-green-500/50 text-white text-xs rounded transition-all"
                                >
                                  Calm
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4.4: Generate Video - Final CTA */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-6 border-2 border-purple-500/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          4
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Ready to Generate!</h3>
                          <p className="text-sm text-gray-400">Your avatar video will be ready in ~10 minutes</p>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateVideo}
                        disabled={!isScriptValid() || isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] disabled:scale-100"
                      >
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating Your Video...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Generate Avatar Video</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </button>

                      {!isScriptValid() && (
                        <p className="text-center text-sm text-gray-400 mt-3">
                          Complete your script to enable video generation
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Generated Videos */}
            <div className="xl:col-span-1">
              <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] sticky top-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                  <span>Generated Videos</span>
                  <button
                    onClick={() => loadGeneratedVideos(videoFilter)}
                    disabled={isLoadingVideos}
                    className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <svg className={`w-5 h-5 text-gray-400 ${isLoadingVideos ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </h2>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <button
                    onClick={() => setVideoFilter(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      videoFilter === null
                        ? 'bg-purple-500 text-white'
                        : 'bg-[#0F0F0F] text-gray-400 hover:text-white border border-[#262626]'
                    }`}
                  >
                    All Videos
                  </button>
                  <button
                    onClick={() => setVideoFilter('omni')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      videoFilter === 'omni'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#0F0F0F] text-gray-400 hover:text-white border border-[#262626]'
                    }`}
                  >
                    Omni Human
                  </button>
                  <button
                    onClick={() => setVideoFilter('kling')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      videoFilter === 'kling'
                        ? 'bg-green-500 text-white'
                        : 'bg-[#0F0F0F] text-gray-400 hover:text-white border border-[#262626]'
                    }`}
                  >
                    Kling
                  </button>
                  <button
                    onClick={() => setVideoFilter('veo')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      videoFilter === 'veo'
                        ? 'bg-pink-500 text-white'
                        : 'bg-[#0F0F0F] text-gray-400 hover:text-white border border-[#262626]'
                    }`}
                  >
                    Veo
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {isLoadingVideos ? (
                    <div className="text-center py-12">
                      <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-400 text-sm">Loading videos...</p>
                    </div>
                  ) : generatedVideos.length > 0 ? (
                    generatedVideos.map((video, idx) => (
                      <div key={video.job_id || idx} className="p-3 bg-[#0F0F0F] rounded-lg border border-[#262626] hover:border-purple-500/50 transition-all">
                        <div className="aspect-video bg-gray-800 rounded mb-2 overflow-hidden">
                          {video.video_url ? (
                            <video src={video.video_url} controls className="w-full h-full rounded" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-white text-sm font-medium truncate">{video.product_name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              video.video_provider === 'omni' ? 'bg-blue-500/20 text-blue-300' :
                              video.video_provider === 'kling' ? 'bg-green-500/20 text-green-300' :
                              'bg-pink-500/20 text-pink-300'
                            }`}>
                              {video.video_provider === 'omni' ? 'Omni' : video.video_provider === 'kling' ? 'Kling' : 'Veo'}
                            </span>
                            <span className="text-gray-500 text-xs">{video.aspect_ratio}</span>
                          </div>
                          {video.script && (
                            <p className="text-gray-400 text-xs line-clamp-2 mt-2">{video.script}</p>
                          )}
                          
                          {/* Download Button */}
                          {video.video_url && (
                            <a
                              href={video.video_url}
                              download={`${video.product_name}_${video.video_provider}_${video.job_id || 'video'}.mp4`}
                              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download Video
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400 text-sm">No videos generated yet</p>
                      <p className="text-gray-500 text-xs mt-1">Start by creating your first avatar video</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Detail Modal */}
      {avatarDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={closeAvatarDetail}>
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#262626] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[90vh] overflow-y-auto">
              {/* Left: Full Quality Image */}
              <div className="relative">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 sticky top-0">
                  {fullQualityImage === null ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="animate-spin h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-3 text-gray-400">Loading full quality...</span>
                    </div>
                  ) : fullQualityImage === 'error' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                      <div className="text-center">
                        <div className="text-white font-bold text-6xl mb-3">
                          {avatarDetailModal.name?.charAt(0) || '?'}
                        </div>
                        <p className="text-white text-sm">Image failed to load</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={fullQualityImage} 
                      alt={avatarDetailModal.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Close button */}
                  <button
                    onClick={closeAvatarDetail}
                    className="absolute top-3 right-3 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right: Avatar Details */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{avatarDetailModal.name}</h2>
                  <p className="text-gray-400 text-sm">Avatar ID: {avatarDetailModal.id}</p>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="text-white font-medium capitalize">{avatarDetailModal.gender}</p>
                    </div>
                    <div className="p-3 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                      <p className="text-xs text-gray-500 mb-1">Age</p>
                      <p className="text-white font-medium">{avatarDetailModal.age_range || avatarDetailModal.age}</p>
                    </div>
                    <div className="p-3 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                      <p className="text-xs text-gray-500 mb-1">Ethnicity</p>
                      <p className="text-white font-medium capitalize">{avatarDetailModal.ethnicity}</p>
                    </div>
                    <div className="p-3 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                      <p className="text-xs text-gray-500 mb-1">Body Type</p>
                      <p className="text-white font-medium capitalize">{avatarDetailModal.body_type}</p>
                    </div>
                  </div>
                </div>

                {/* Physical Features */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Physical Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                      <span className="text-gray-400 text-sm">Eye Color</span>
                      <span className="text-white font-medium capitalize">{avatarDetailModal.eye_color}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                      <span className="text-gray-400 text-sm">Hair Color</span>
                      <span className="text-white font-medium capitalize">{avatarDetailModal.hair_color}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {avatarDetailModal.tags && avatarDetailModal.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {avatarDetailModal.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                {avatarDetailModal.created_at && (
                  <div className="pt-4 border-t border-[#262626]">
                    <p className="text-xs text-gray-500">
                      Created: {avatarDetailModal.created_at}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={selectAvatarFromModal}
                    disabled={fullQualityImage === null || fullQualityImage === 'error'}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Select Avatar</span>
                  </button>
                  <button
                    onClick={closeAvatarDetail}
                    className="px-6 py-3 bg-[#0F0F0F] hover:bg-[#262626] border border-[#262626] text-gray-400 hover:text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AvatarVideoGeneration;

