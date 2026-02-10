import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { scrapingAPI, adsAPI, brandsAPI } from '../services/apiService';
import ChatModal from '../components/ChatModal';
import { useBrand } from '../contexts/BrandContext';
import { useJobNotificationContext } from '../contexts/JobNotificationContext';
import { useTasksContext } from '../contexts/TasksContext';
import ProductCardSimple from '../components/dashboard/ProductCardSimple';

const ProductIngestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Brand Context
  const { 
    selectedBrand, 
    setSelectedBrand,
    brandProducts, 
    loadingProducts, 
    refreshBrandData,
    deleteProduct 
  } = useBrand();

  // Job Notification Context
  const { trackJob } = useJobNotificationContext();
  
  // Tasks Context (for centralized task tracking)
  const { addTask, updateTask } = useTasksContext();

  const [activeTab, setActiveTab] = useState('manual');
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [error, setError] = useState('');
  const [scrapingJobId, setScrapingJobId] = useState(null); // Track current scraping job
  const [scrapingStatus, setScrapingStatus] = useState(null); // 'processing', 'completed', 'failed'
  const [lastScrapedUrl, setLastScrapedUrl] = useState(''); // For retry functionality
  
  // Fake progress bar state (animates over 45 min, completes instantly on API response)
  const [scrapingProgress, setScrapingProgress] = useState(0); // 0-100
  const [scrapedProductData, setScrapedProductData] = useState(null); // Store scraped product
  const [showResearchNotification, setShowResearchNotification] = useState(false); // Show research notification
  const [currentTaskId, setCurrentTaskId] = useState(null); // Track current scraping task
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [editingDescriptionId, setEditingDescriptionId] = useState(null);
  const [editingBrandNameId, setEditingBrandNameId] = useState(null);
  const [adGenerationStep, setAdGenerationStep] = useState(1); // 1: params, 2: quantity, 3: results
  const [imageQuantity, setImageQuantity] = useState(5);
  const [useCustomLanguage, setUseCustomLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState([]);
  const [adGenerationJobId, setAdGenerationJobId] = useState(null); // Track current ad gen job
  const [adGenerationStatus, setAdGenerationStatus] = useState(null); // 'processing', 'completed', 'failed'
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedAdForChat, setSelectedAdForChat] = useState(null);
  
  // Track if we're starting ad generation to prevent brand change reset
  // Set this IMMEDIATELY when detecting navigation state, before any effects run
  const isStartingAdGeneration = React.useRef(location.state?.startAdGeneration || false);
  
  /**
   * Fake Progress Bar Animation
   * Animates from 0-100% over 45 minutes, but completes instantly when API responds
   */
  useEffect(() => {
    if (scrapingStatus === 'processing' && isLoading) {
      console.log('[Scraping] 📊 Starting fake progress bar animation (45 min)');
      console.log('[Scraping] Current task ID:', currentTaskId);
      
      const totalDuration = 45 * 60 * 1000; // 45 minutes in ms
      const updateInterval = 500; // Update every 500ms for smooth animation
      const incrementPerUpdate = (100 / (totalDuration / updateInterval)); // ~0.037% per update
      
      const interval = setInterval(() => {
        setScrapingProgress(prev => {
          const newProgress = prev + incrementPerUpdate;
          // Cap at 95% - never show 100% until API actually completes
          const cappedProgress = newProgress >= 95 ? 95 : newProgress;
          
          // Update task progress in TasksContext
          if (currentTaskId && updateTask) {
            updateTask(currentTaskId, { progress: Math.round(cappedProgress) });
          }
          
          return cappedProgress;
        });
      }, updateInterval);
      
      return () => {
        console.log('[Scraping] 🛑 Stopping progress bar animation');
        clearInterval(interval);
      };
    } else if (scrapingStatus === 'completed') {
      // Instantly jump to 100% when completed
      console.log('[Scraping] ✅ Jumping progress to 100%');
      console.log('[Scraping] Updating task to completed:', currentTaskId);
      setScrapingProgress(100);
      
      // Update task to completed in TasksContext
      if (currentTaskId && updateTask) {
        updateTask(currentTaskId, { 
          status: 'completed', 
          progress: 100 
        });
        console.log('[Scraping] ✅ Task updated to completed in useEffect');
      }
      
      // Show research notification after 1 second
      setTimeout(() => {
        setShowResearchNotification(true);
      }, 1000);
    } else if (scrapingStatus === 'failed') {
      // Reset progress on failure
      console.log('[Scraping] ❌ Resetting progress on failure');
      setScrapingProgress(0);
      
      // Update task to failed in TasksContext
      if (currentTaskId && updateTask) {
        updateTask(currentTaskId, { 
          status: 'failed', 
          progress: 0 
        });
      }
    }
  }, [scrapingStatus, isLoading, currentTaskId, updateTask]);

  // Handle navigation from other pages to set tab (from URL query param or state)
  useEffect(() => {
    // Check URL query parameter first
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam) {
      console.log('[ProductIngestion] Setting tab from URL param:', tabParam);
      setActiveTab(tabParam);
      // Clear query parameter from URL
      window.history.replaceState({}, document.title, location.pathname);
    } else if (location.state?.tab) {
      console.log('[ProductIngestion] Setting tab from state:', location.state.tab);
      setActiveTab(location.state.tab);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }

    // Check if returning from ad generation with brand context
    if (location.state?.returnToBrand) {
      console.log('[ProductIngestion] Returning with brand context:', location.state.returnToBrand);
      // Don't change the brand - it's already set in the context
    }
  }, [location.search, location.state]);

  // Reset interface when brand changes
  useEffect(() => {
    // Skip reset if we're starting ad generation from product details
    if (isStartingAdGeneration.current) {
      console.log('[ProductIngestion] ⏭️ Skipping brand reset - ad generation flag is TRUE');
      console.log('[ProductIngestion] 🎯 Allowing ad generation flow to proceed');
      // DON'T reset the flag here - it will be reset after ad generation setup completes
      return;
    }
    
    if (selectedBrand) {
      console.log('[ProductIngestion] ✋ Brand changed to:', selectedBrand.brandId, '- Running normal reset');
      // Reset scraping state
      setProductUrl('');
      setError('');
      setFetchedProducts([]);
      setExpandedProductId(null);
      setEditingDescriptionId(null);
      setEditingBrandNameId(null);
      // Reset ad generation state completely
      setAdGenerationStep(1);
      setGeneratedAds([]);
      setIsGenerating(false);
      setImageQuantity(5);
      setUseCustomLanguage(false);
      setSelectedLanguage('en');
      // Clear ad generation product from localStorage
      localStorage.removeItem('adGenerationProduct');
      console.log('[ProductIngestion] Ad generation interface reset on brand switch');
      
      // ALWAYS redirect to imported products tab when brand changes (no exceptions)
      setActiveTab('imported');
      console.log('[ProductIngestion] Redirected to imported products tab');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand?.brandId]);

  // Refetch brand data (including logoUrl) when entering ad generation phase
  useEffect(() => {
    const refetchBrandLogo = async () => {
      if (selectedBrand && activeTab === 'ad-generation') {
        console.log('[ProductIngestion] 🔄 Refetching brand data for updated logoUrl (PNG from Firestore)');
        console.log('[ProductIngestion] Current logoUrl BEFORE refetch:', selectedBrand.logoUrl);
        try {
          const response = await brandsAPI.getBrand(selectedBrand.brandId);
          if (response.success && response.data) {
            console.log('[ProductIngestion] ✅ Brand data refetched successfully');
            console.log('[ProductIngestion] NEW logoUrl AFTER refetch:', response.data.logoUrl);
            console.log('[ProductIngestion] Full brand data:', response.data);
            // Update the selected brand with fresh data, especially the logoUrl
            setSelectedBrand(response.data);
          } else {
            console.warn('[ProductIngestion] ⚠️ Failed to refetch brand data:', response);
          }
        } catch (error) {
          console.error('[ProductIngestion] ❌ Error refetching brand data:', error);
          // Continue with existing brand data if refetch fails
        }
      }
    };

    refetchBrandLogo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedBrand?.brandId]);

  // Check if user has been waiting too long, redirect to generated ads on page load/refresh
  React.useEffect(() => {
    const generationStartTime = localStorage.getItem('adGenerationStartTime');
    
    if (generationStartTime) {
      const elapsedMinutes = (Date.now() - parseInt(generationStartTime)) / 1000 / 60;
      
      console.log('[ProductIngestion] 🕐 Checking generation time: started', elapsedMinutes.toFixed(1), 'minutes ago');
      
      if (elapsedMinutes > 3) {
        console.log('[ProductIngestion] ⏰ Over 3 minutes elapsed, redirecting to generated ads page...');
        localStorage.removeItem('adGenerationStartTime');
        navigate('/generated-ads');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Reset ad generation state on page refresh
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear ad generation state when page is refreshed
      localStorage.removeItem('adGenerationProduct');
      // Don't clear adGenerationStartTime here - we need it to check on refresh
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Handle navigation from product details to start ad generation
  useEffect(() => {
    if (location.state?.startAdGeneration) {
      // Flag is already set during initialization
      console.log('[ProductIngestion] ✅ Ad generation flag is set, proceeding with setup');
      
      const storedProduct = localStorage.getItem('adGenerationProduct');
      if (storedProduct) {
        console.log('[ProductIngestion] Starting ad generation flow from product details');
        const productData = JSON.parse(storedProduct);
        
        // Build color palette from product data, extracting hex values from color objects
        const colorPalette = [];
        
        // Extract primary color (can be string or {hex, rgb} object)
        const primaryHex = getColorHex(productData.primaryColor);
        if (primaryHex) colorPalette.push(primaryHex);
        
        // Extract secondary color
        const secondaryHex = getColorHex(productData.secondaryColor);
        if (secondaryHex) colorPalette.push(secondaryHex);
        
        // Extract accent color
        const accentHex = getColorHex(productData.accentColor);
        if (accentHex) colorPalette.push(accentHex);
        
        // Add any additional palette colors
        if (productData.website_palette && Array.isArray(productData.website_palette)) {
          productData.website_palette.forEach(color => {
            const hexColor = getColorHex(color);
            if (hexColor && !colorPalette.includes(hexColor)) {
              colorPalette.push(hexColor);
            }
          });
        }
        
        console.log('[ProductIngestion] Original product data colors:', {
          primary: productData.primaryColor,
          secondary: productData.secondaryColor,
          accent: productData.accentColor
        });
        console.log('[ProductIngestion] Extracted color palette (before dedup):', colorPalette);
        
        // Remove duplicates from the palette
        const uniqueColorPalette = deduplicateColors(colorPalette.length > 0 ? colorPalette : ['#8B7355', '#FFFFFF', '#000000']);
        console.log('[ProductIngestion] Extracted color palette (after dedup):', uniqueColorPalette);
        
        // Update the product data with proper palette and add to fetchedProducts
        let updatedProduct = {
          ...productData,
          id: productData.id || Date.now(),
          website_palette: uniqueColorPalette,
          primary_color_index: 0,
          secondary_color_index: 1,
          accent_color_index: 2,
          selectedImages: []
        };
        
        // Apply deduplication with index recalculation
        updatedProduct = deduplicateProductPalette(updatedProduct);
        
        console.log('[ProductIngestion] Updated product with palette:', updatedProduct.website_palette);
        console.log('[ProductIngestion] Product title:', updatedProduct.title);
        console.log('[ProductIngestion] Product description:', updatedProduct.description);
        console.log('[ProductIngestion] Full updated product:', updatedProduct);
        
        // Save to localStorage for ad generation
        localStorage.setItem('adGenerationProduct', JSON.stringify(updatedProduct));
        
        // Match EXACT behavior of clicking "Générer" from product card in imported products
        // The step 0 handler will then load this into fetchedProducts and redirect to 'manual' tab
        setActiveTab('ad-generation');
        setAdGenerationStep(0); // This will auto-redirect to 'manual' tab for image/color selection
        setGeneratedAds([]); // Clear any previous ads
        
        // Clear the navigation state
        window.history.replaceState({}, document.title);
        
        // Reset the flag after setup is complete (using setTimeout to ensure state updates finish)
        setTimeout(() => {
          console.log('[ProductIngestion] 🏁 Ad generation setup complete, resetting flag');
          isStartingAdGeneration.current = false;
        }, 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Handle opening chat modal for an ad
  const handleOpenChat = (ad) => {
    setSelectedAdForChat(ad);
    setIsChatModalOpen(true);
  };

  // Handle closing chat modal
  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedAdForChat(null);
  };

  // Helper function to safely get hex color value
  const getColorHex = (color) => {
    if (!color) return '#000000';
    if (typeof color === 'string') return color;
    if (typeof color === 'object' && color.hex) return color.hex;
    return '#000000';
  };

  // Helper function to remove duplicate colors from palette
  const deduplicateColors = (colors) => {
    const seen = new Set();
    return colors.filter(color => {
      const normalized = color.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  };

  // Helper function to deduplicate a product's palette and recalculate indices
  const deduplicateProductPalette = (product) => {
    if (!product || !product.website_palette || product.website_palette.length === 0) {
      return product;
    }
    
    const originalPalette = product.website_palette;
    const deduplicatedPalette = deduplicateColors(originalPalette);
    
    // If no duplicates were removed, return as-is
    if (originalPalette.length === deduplicatedPalette.length) {
      return product;
    }
    
    console.log(`[ProductIngestion] 🔧 Deduplicating product palette: ${originalPalette.length} → ${deduplicatedPalette.length}`);
    
    // Get the actual colors that the current indices point to
    const primaryColor = originalPalette[product.primary_color_index]?.toLowerCase();
    const secondaryColor = originalPalette[product.secondary_color_index]?.toLowerCase();
    const accentColor = originalPalette[product.accent_color_index]?.toLowerCase();
    
    // Find the new indices in the deduplicated palette
    let newPrimaryIndex = deduplicatedPalette.findIndex(c => c.toLowerCase() === primaryColor);
    let newSecondaryIndex = deduplicatedPalette.findIndex(c => c.toLowerCase() === secondaryColor);
    let newAccentIndex = deduplicatedPalette.findIndex(c => c.toLowerCase() === accentColor);
    
    // Fallback to safe defaults
    if (newPrimaryIndex === -1) newPrimaryIndex = 0;
    if (newSecondaryIndex === -1) newSecondaryIndex = Math.min(1, deduplicatedPalette.length - 1);
    if (newAccentIndex === -1) newAccentIndex = Math.min(2, deduplicatedPalette.length - 1);
    
    return {
      ...product,
      website_palette: deduplicatedPalette,
      primary_color_index: newPrimaryIndex,
      secondary_color_index: newSecondaryIndex,
      accent_color_index: newAccentIndex
    };
  };

  /**
   * Handler for fetching product from URL (SYNC - waits 60-90s for completion)
   * ⚠️ MIGRATION: Switched from job-based to sync scraping
   * 
   * - Waits 60-90 seconds for product data
   * - Returns full product immediately (no polling)
   * - Backend auto-triggers research in background
   */
  const handleFetchProduct = async (e, retryUrl = null) => {
    if (e) e.preventDefault();
    
    const urlToScrape = retryUrl || productUrl.trim();
    if (!urlToScrape) return;

    // Brand will be created automatically from scraped data if none exists
    // No need to check for selectedBrand here

    setIsLoading(true);
    setError('');
    setScrapingStatus('processing'); // Show "Scraping in progress"
    setScrapingJobId(null); // Not used anymore
    setLastScrapedUrl(urlToScrape);
    setScrapingProgress(0); // Reset progress bar
    setScrapedProductData(null); // Clear previous product data
    setShowResearchNotification(false); // Hide notification
    
    // Add task to TasksContext for centralized tracking
    const taskId = addTask({
      taskType: 'scraping',
      status: 'processing',
      progress: 0,
      title: `Scraping: ${new URL(urlToScrape).hostname}`,
      description: urlToScrape,
      metadata: {
        url: urlToScrape,
        brandId: selectedBrand?.brandId || null,
      },
    });
    setCurrentTaskId(taskId);
    console.log('[Scraping] 📋 Task created with ID:', taskId);
    
    try {
      console.log('[Scraping] 🔍 Starting JOB-BASED product scraping:', urlToScrape);
      console.log('[Scraping] ⏱️ Creating scraping job (returns immediately)...');
      
      // JOB-BASED REQUEST - returns job ID immediately
      // Brand will be created automatically from scraped data if brandId is null
      const response = await scrapingAPI.scrapeProduct(urlToScrape, selectedBrand?.brandId || null);
      
      if (response.success && response.data?.job_id) {
        const jobId = response.data.job_id;
        console.log('[Scraping] ✅ Job created:', jobId);
        console.log('[Scraping] 📊 Polling for job status...');
        
        // Poll for job completion
        let jobStatus = 'queued';
        let attempts = 0;
        const maxAttempts = 180; // 3 minutes max (180 * 1s polling)
        
        while (attempts < maxAttempts && jobStatus !== 'completed' && jobStatus !== 'failed') {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          
          try {
            const statusResponse = await jobAPI.getJobStatus(jobId);
            
            if (statusResponse.success && statusResponse.data) {
              const jobData = statusResponse.data;
              jobStatus = jobData.status;
              
              // Update progress based on job status
              const progress = jobData.progress?.percentage || 0;
              const currentStep = jobData.progress?.current_step || 'Processing...';
              
              console.log(`[Scraping] Job status: ${jobStatus} (${progress}%) - ${currentStep}`);
              
              setScrapingProgress(progress);
              setScrapingStatus(jobStatus === 'processing' ? 'scraping' : jobStatus);
              
              // If completed, extract product data
              if (jobStatus === 'completed' && jobData.result) {
                const productData = jobData.result;
                console.log('[Scraping] ✅ Product scraped successfully:', productData);
                
                // Store product data for notification
                setScrapedProductData(productData);
                
                // Update task to completed in TasksContext
                console.log('[Scraping] 📋 Updating task to completed:', taskId);
                updateTask(taskId, {
                  status: 'completed',
                  progress: 100,
                  metadata: {
                    url: urlToScrape,
                    brandId: productData.brand_id,
                    productId: productData.product_id,
                    productName: productData.product_name,
                    result: productData,
                  },
                });
                console.log('[Scraping] ✅ Task updated successfully!');
                
                // Update brand selector if new brand was created
                if (productData.brand_id && (!selectedBrand || selectedBrand.brandId !== productData.brand_id)) {
                  console.log('[Scraping] New brand created:', productData.brand_name);
                  await refreshBrandData();
                } else if (selectedBrand) {
                  console.log('[Scraping] Refreshing brand data after scrape');
                  await refreshBrandData();
                }
                
                // Clear input and show success
                setProductUrl('');
                setScrapingStatus('completed');
                setIsLoading(false);
                
                console.log('[Scraping] 🎉 Product added successfully!');
                console.log('[Scraping] 🔬 Research pipeline is running in background...');
                break;
              }
              
              // If failed, throw error
              if (jobStatus === 'failed') {
                throw new Error(jobData.error || 'Job failed');
              }
            }
          } catch (pollError) {
            console.error('[Scraping] Error polling job status:', pollError);
            // Continue polling unless max attempts reached
          }
          
          attempts++;
        }
        
        // Check if we timed out
        if (attempts >= maxAttempts && jobStatus !== 'completed') {
          throw new Error('Job polling timed out. Check job status manually.');
        }
        
      } else {
        throw new Error(response.data?.message || 'Failed to create scraping job');
      }
    } catch (err) {
      console.error('[Scraping] ❌ Error scraping product:', err);
      
      // Handle specific error types
      let errorMessage = 'Une erreur est survenue lors du scraping.';
      
      if (err.message?.includes('timeout')) {
        errorMessage = 'Le scraping a pris trop de temps. Veuillez réessayer.';
      } else if (err.message?.includes('Insufficient credits')) {
        errorMessage = 'Crédits insuffisants pour effectuer le scraping.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Update task to failed in TasksContext
      // Note: taskId is not available here in catch block, use currentTaskId from state
      if (currentTaskId) {
        console.log('[Scraping] 📋 Updating task to failed:', currentTaskId);
        updateTask(currentTaskId, {
          status: 'failed',
          progress: 0,
          metadata: {
            url: urlToScrape,
            error: errorMessage,
          },
        });
      }
      
      setError(errorMessage);
      setScrapingStatus('failed');
      setIsLoading(false);
      setScrapingProgress(0); // Reset progress bar on error
      setShowResearchNotification(false); // Hide notification on error
    }
  };

  // Retry scraping with the last URL
  const handleRetryScraping = () => {
    if (lastScrapedUrl) {
      handleFetchProduct(null, lastScrapedUrl);
    }
  };

  // Process scraped product data
  const _processScrapedProduct = async (productData) => {
    try {
      if (productData) {
        
      console.log('[ProductIngestion] Product scraped successfully:', productData);
      
      // Product was saved to backend automatically
      // Refresh brand data to show the new product
      if (selectedBrand) {
        console.log('[ProductIngestion] Refreshing brand data after scrape');
        await refreshBrandData();
      }
      
      // Backend now returns colors in a clean structure
      const scrapedColors = productData.colors || {};
      const brandData = productData.brand || {};
        
        console.log('[ProductIngestion] Scraped colors from backend:', scrapedColors);
        console.log('[ProductIngestion] Brand data:', brandData);
        
        // Create array of colors for UI display (compatible with old structure)
        const colorArray = [];
        if (scrapedColors.primary) colorArray.push(scrapedColors.primary);
        if (scrapedColors.secondary) colorArray.push(scrapedColors.secondary);
        if (scrapedColors.accent) colorArray.push(scrapedColors.accent);
        
        let newProduct = {
          id: Date.now(), // Temporary ID for local state
          productId: productData.product?.productId || null, // Real Firestore product ID
          brandId: brandData.brandId || selectedBrand?.brandId || null, // Real Firestore brand ID
          url: productData.source_url || productUrl,
          title: productData.product_name || 'Produit sans nom',
          brand_name: productData.brand_name || brandData.brandName || '',
          description: productData.description || 'Aucune description disponible',
          images: productData.images || [],
          imageCount: productData.image_count || 0,
          brand_logo: productData.brand_logo || brandData.logoUrl || null,
          custom_logo: null, // User-uploaded logo
          // Use the new colors structure from backend
          brand_colors: colorArray.length > 0 ? { colors: colorArray } : null,
          website_palette: colorArray, // For backward compatibility with color selector UI
          // For color swapping - store the current order
          primary_color_index: 0, // Index in palette for primary
          secondary_color_index: 1, // Index in palette for secondary
          accent_color_index: 2, // Index in palette for accent (optional)
          method: productData.method || 'scraper',
          extraction_method: 'backend',
          status: 'pending'
        };
        
        setFetchedProducts([newProduct, ...fetchedProducts]);
        setProductUrl('');
        
        // Show success message - backend already saved colors, no need to PATCH
        if (brandData && productData.product) {
          console.log('[ProductIngestion] Product saved to brand:', brandData.brandName);
          console.log('[ProductIngestion] ✅ Brand colors already saved by backend:', {
            primary: brandData.primaryColor,
            secondary: brandData.secondaryColor,
            accent: brandData.accentColor
          });
          
          // Update the selected brand with colors from backend (for UI state only)
          if (selectedBrand && selectedBrand.brandId === brandData.brandId) {
            setSelectedBrand({
              ...selectedBrand,
              primaryColor: brandData.primaryColor,
              secondaryColor: brandData.secondaryColor,
              accentColor: brandData.accentColor
            });
          }
          
          // Refresh and navigate to product details page after successful scraping
          const productId = productData.product.productId;
          if (productId) {
            console.log('[ProductIngestion] 🚀 Redirecting to product details page:', productId);
            // Use window.location to force a complete page refresh
            setTimeout(() => {
              window.location.href = `/product/${productId}`;
            }, 800); // Small delay to ensure backend processes are complete
          }
        }
      }
    } catch (err) {
      console.error('[ProductIngestion] Error processing scraped product:', err);
      throw err;
    }
  };

  const handleRemoveProduct = (productId) => {
    setFetchedProducts(fetchedProducts.filter(p => p.id !== productId));
  };

  // Handler for swapping primary and secondary colors
  const handleSwapColors = (productId) => {
    setFetchedProducts(fetchedProducts.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          primary_color_index: product.secondary_color_index,
          secondary_color_index: product.primary_color_index
        };
      }
      return product;
    }));
  };

  // Handler for selecting a specific color as primary or secondary
  const handleSelectColor = (productId, colorIndex, type) => {
    setFetchedProducts(fetchedProducts.map(product => {
      if (product.id === productId) {
        const originalPalette = product.website_palette || [];
        
        // Get the actual colors that the current indices point to BEFORE deduplication
        const currentPrimaryColor = originalPalette[product.primary_color_index]?.toLowerCase();
        const currentSecondaryColor = originalPalette[product.secondary_color_index]?.toLowerCase();
        const currentAccentColor = originalPalette[product.accent_color_index]?.toLowerCase();
        
        // Deduplicate the palette
        const deduplicatedPalette = deduplicateColors(originalPalette);
        
        console.log(`[ProductIngestion] 🔄 Deduplication: ${originalPalette.length} → ${deduplicatedPalette.length} colors`);
        
        // Find the new indices for the existing colors in the deduplicated palette
        let newPrimaryIndex = deduplicatedPalette.findIndex(c => c.toLowerCase() === currentPrimaryColor);
        let newSecondaryIndex = deduplicatedPalette.findIndex(c => c.toLowerCase() === currentSecondaryColor);
        let newAccentIndex = deduplicatedPalette.findIndex(c => c.toLowerCase() === currentAccentColor);
        
        // Fallback to 0 if not found
        if (newPrimaryIndex === -1) newPrimaryIndex = 0;
        if (newSecondaryIndex === -1) newSecondaryIndex = Math.min(1, deduplicatedPalette.length - 1);
        if (newAccentIndex === -1) newAccentIndex = Math.min(2, deduplicatedPalette.length - 1);
        
        let updatedProduct = { 
          ...product, 
          website_palette: deduplicatedPalette,
          primary_color_index: newPrimaryIndex,
          secondary_color_index: newSecondaryIndex,
          accent_color_index: newAccentIndex
        };
        
        // Now update the specific type requested
        if (type === 'primary') {
          updatedProduct.primary_color_index = colorIndex;
          console.log(`[ProductIngestion] 🎯 Setting primary color to index ${colorIndex}: ${deduplicatedPalette[colorIndex]}`);
        } else if (type === 'secondary') {
          updatedProduct.secondary_color_index = colorIndex;
          console.log(`[ProductIngestion] 🎯 Setting secondary color to index ${colorIndex}: ${deduplicatedPalette[colorIndex]}`);
        } else if (type === 'accent') {
          updatedProduct.accent_color_index = colorIndex;
          console.log(`[ProductIngestion] 🎯 Setting accent color to index ${colorIndex}: ${deduplicatedPalette[colorIndex]}`);
        }
        
        console.log('[ProductIngestion] 📝 Final indices:', {
          primary: updatedProduct.primary_color_index,
          secondary: updatedProduct.secondary_color_index,
          accent: updatedProduct.accent_color_index
        });
        
        // Also update localStorage if this is the ad generation product
        const storedProduct = localStorage.getItem('adGenerationProduct');
        if (storedProduct) {
          const parsed = JSON.parse(storedProduct);
          if (parsed.id === productId) {
            localStorage.setItem('adGenerationProduct', JSON.stringify(updatedProduct));
          }
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  // Handler for custom color picker
  const handleCustomColorPick = (productId, color, type) => {
    console.log(`[ProductIngestion] 🎨 Custom color pick - Type: ${type}, Color: ${color}`);
    
    setFetchedProducts(fetchedProducts.map(product => {
      if (product.id === productId) {
        // Start with a deduplicated version of the current palette
        const currentPalette = deduplicateColors([...(product.website_palette || [])]);
        console.log('[ProductIngestion] 📋 Current palette (deduplicated):', currentPalette);
        
        // Normalize the new color
        const normalizedNewColor = color.toLowerCase();
        
        // Check if color already exists in the palette (case-insensitive)
        const existingIndex = currentPalette.findIndex(c => c.toLowerCase() === normalizedNewColor);
        
        let finalPalette;
        let targetIndex;
        
        if (existingIndex !== -1) {
          // Color already exists, use its index
          finalPalette = currentPalette;
          targetIndex = existingIndex;
          console.log(`[ProductIngestion] ✓ Color already exists at index: ${existingIndex}`);
        } else {
          // Add new color to palette and deduplicate again
          finalPalette = deduplicateColors([...currentPalette, color]);
          targetIndex = finalPalette.findIndex(c => c.toLowerCase() === normalizedNewColor);
          console.log(`[ProductIngestion] ➕ Added new color at index: ${targetIndex}`);
        }
        
        console.log('[ProductIngestion] 📊 Final palette:', finalPalette);
        console.log(`[ProductIngestion] 🎯 Setting ${type} color to index: ${targetIndex} (${finalPalette[targetIndex]})`);
        
        let updatedProduct = { ...product, website_palette: finalPalette };
        
        // Only update the specific type requested
        if (type === 'primary') {
          updatedProduct.primary_color_index = targetIndex;
        } else if (type === 'secondary') {
          updatedProduct.secondary_color_index = targetIndex;
        } else if (type === 'accent') {
          updatedProduct.accent_color_index = targetIndex;
        }
        
        console.log('[ProductIngestion] 📝 Updated indices:', {
          primary: updatedProduct.primary_color_index,
          secondary: updatedProduct.secondary_color_index,
          accent: updatedProduct.accent_color_index
        });
        
        // Also update localStorage if this is the ad generation product
        const storedProduct = localStorage.getItem('adGenerationProduct');
        if (storedProduct) {
          const parsed = JSON.parse(storedProduct);
          if (parsed.id === productId) {
            localStorage.setItem('adGenerationProduct', JSON.stringify(updatedProduct));
          }
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  // Handler for toggling expanded view
  const toggleExpanded = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  // Handler for updating description
  const handleUpdateDescription = (productId, newDescription) => {
    setFetchedProducts(fetchedProducts.map(product => {
      if (product.id === productId) {
        return { ...product, description: newDescription };
      }
      return product;
    }));
    setEditingDescriptionId(null);
  };

  // Handler for updating brand name
  const handleUpdateBrandName = (productId, newBrandName) => {
    setFetchedProducts(fetchedProducts.map(product => {
      if (product.id === productId) {
        return { ...product, brand_name: newBrandName };
      }
      return product;
    }));
    setEditingBrandNameId(null);
  };

  // Handler for uploading custom logo
  const handleLogoUpload = (productId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFetchedProducts(fetchedProducts.map(product => {
          if (product.id === productId) {
            // Store as base64 data URL (can be serialized to localStorage)
            return { ...product, custom_logo: reader.result };
          }
          return product;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for toggling image selection
  const handleToggleImageSelection = (productId, imageIndex) => {
    setFetchedProducts(fetchedProducts.map(product => {
      if (product.id === productId) {
        const selectedImages = product.selectedImages || [];
        const isSelected = selectedImages.includes(imageIndex);
        
        const updatedProduct = {
          ...product,
          selectedImages: isSelected
            ? selectedImages.filter(i => i !== imageIndex)
            : [...selectedImages, imageIndex]
        };
        
        // Also update localStorage if this is the ad generation product
        const storedProduct = localStorage.getItem('adGenerationProduct');
        if (storedProduct) {
          const parsed = JSON.parse(storedProduct);
          if (parsed.id === productId) {
            localStorage.setItem('adGenerationProduct', JSON.stringify(updatedProduct));
          }
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  // Handler for proceeding to ad generation
  const handleProceedToAdGeneration = (productId) => {
    const product = fetchedProducts.find(p => p.id === productId);
    if (!product) return;

    // Store product data for ad generation flow
    localStorage.setItem('adGenerationProduct', JSON.stringify({
      ...product,
      selectedImages: product.selectedImages || [],
      primaryColor: product.website_palette[product.primary_color_index],
      secondaryColor: product.website_palette[product.secondary_color_index],
      accentColor: product.website_palette[product.accent_color_index] || null
    }));

    // Reset generation flow and navigate
    setAdGenerationStep(1);
    setImageQuantity(5);
    setUseCustomLanguage(false);
    setSelectedLanguage('en');
    setGeneratedAds([]);
    setActiveTab('ad-generation');
  };

  // Handler for saving colors to brand
  const handleSaveColorsToBrand = async (productId) => {
    const product = fetchedProducts.find(p => p.id === productId);
    if (!product || !product.brandId) {
      setError('Impossible de sauvegarder les couleurs. Marque non trouvée.');
      return;
    }

    try {
      console.log('[ProductIngestion] Saving colors to brand:', product.brandId);
      
      const colors = {
        primaryColor: product.website_palette[product.primary_color_index],
        secondaryColor: product.website_palette[product.secondary_color_index],
        accentColor: product.website_palette[product.accent_color_index] || null
      };
      
      console.log('[ProductIngestion] Colors to save:', colors);

      const response = await brandsAPI.updateBrand(product.brandId, colors);

      if (response.success) {
        console.log('[ProductIngestion] ✅ Colors saved successfully');
        // Update the selected brand with new colors
        if (selectedBrand && selectedBrand.brandId === product.brandId) {
          setSelectedBrand({
            ...selectedBrand,
            ...colors
          });
        }
        // Show success message
        alert('✅ Couleurs sauvegardées avec succès!');
      } else {
        throw new Error(response.message || 'Échec de la sauvegarde');
      }
    } catch (err) {
      console.error('[ProductIngestion] ❌ Error saving colors:', err);
      setError(`Erreur lors de la sauvegarde des couleurs: ${err.message}`);
      alert('❌ Erreur lors de la sauvegarde des couleurs');
    }
  };

  // Handler for generating ads
  const handleGenerateAds = async () => {
    const product = getAdGenerationProduct();
    if (!product) return;

    // Validate required IDs
    if (!product.brandId || !product.productId) {
      setError('Missing brand or product ID. Please scrape the product again.');
      console.error('[Ad Generation] Missing required IDs:', { brandId: product.brandId, productId: product.productId });
      return;
    }

    // Immediately move to step 3 and show loading placeholders
    setAdGenerationStep(3);
    setIsGenerating(true);
    setGeneratedAds([]); // Clear previous ads
    setError('');
    
    // Save generation start time for refresh check
    localStorage.setItem('adGenerationStartTime', Date.now().toString());
    
    try {
      console.log('[Ad Generation] Starting generation for product:', product.title);
      console.log('[Ad Generation] Brand ID:', product.brandId, 'Product ID:', product.productId);
      
      // Prepare form data
      const formData = new FormData();
      
      // CRITICAL: Required IDs for Firestore restructure
      formData.append('brand_id', product.brandId);
      formData.append('product_id', product.productId);
      
      // Required fields
      formData.append('brand_name', product.brand_name || 'Unknown Brand');
      formData.append('product_full_name', product.title);
      formData.append('product_description', product.description);
      formData.append('primary_color_hex', getColorHex(product.primaryColor));
      formData.append('secondary_color_hex', getColorHex(product.secondaryColor));
      if (product.accentColor) {
        formData.append('accent_color_hex', getColorHex(product.accentColor));
      }
      formData.append('count', imageQuantity.toString());
      formData.append('aspect_ratio', '1:1'); // Always send 1:1 aspect ratio
      if (useCustomLanguage && selectedLanguage) {
        formData.append('lang', selectedLanguage);
      }
      
      console.log('[Ad Generation] Form data fields:', {
        brand_id: product.brandId,
        product_id: product.productId,
        brand_name: product.brand_name || 'Unknown Brand',
        product_full_name: product.title,
        primary_color_hex: getColorHex(product.primaryColor),
        secondary_color_hex: getColorHex(product.secondaryColor),
        accent_color_hex: getColorHex(product.accentColor),
        count: imageQuantity,
        aspect_ratio: '1:1',
        lang: useCustomLanguage ? selectedLanguage : 'default'
      });
      
      // Logo handling - prioritize custom_logo (base64) over brand_logo (URL)
      let logoAdded = false;
      
      // Try custom logo first (user uploaded as base64)
      if (product.custom_logo) {
        console.log('[Ad Generation] Converting custom logo from base64');
        try {
          // Convert base64 data URL to blob
          const logoResponse = await fetch(product.custom_logo);
          const logoBlob = await logoResponse.blob();
          
          // Determine file type from data URL or default to PNG
          const mimeType = product.custom_logo.split(';')[0].split(':')[1] || 'image/png';
          const extension = mimeType.split('/')[1] || 'png';
          
          // Create a proper File object from the blob
          const logoFile = new File([logoBlob], `logo.${extension}`, { type: mimeType });
          console.log('[Ad Generation] Logo file created:', logoFile.name, logoFile.size, logoFile.type);
          formData.append('logo', logoFile, logoFile.name);
          logoAdded = true;
        } catch (logoError) {
          console.error('[Ad Generation] Error converting custom logo:', logoError);
          // Don't throw error, try brand logo URL instead
        }
      }
      
      // If no custom logo, send brand logo URL (let backend fetch it to avoid CORS)
      if (!logoAdded && product.brand_logo) {
        console.log('[Ad Generation] 📦 Using product.brand_logo:', product.brand_logo);
        console.log('[Ad Generation] 🔍 product.brand_logo type - ends with .svg?', product.brand_logo.endsWith('.svg'));
        console.log('[Ad Generation] 🔍 product.brand_logo type - ends with .png?', product.brand_logo.endsWith('.png'));
        formData.append('logo_url', product.brand_logo);
        logoAdded = true;
      }
      
      // If still no logo, try to get it from the brand context
      if (!logoAdded && selectedBrand?.logoUrl) {
        console.log('[Ad Generation] 🎨 Using brand logo URL from context:', selectedBrand.logoUrl);
        console.log('[Ad Generation] 🔍 Logo URL type check - ends with .svg?', selectedBrand.logoUrl.endsWith('.svg'));
        console.log('[Ad Generation] 🔍 Logo URL type check - ends with .png?', selectedBrand.logoUrl.endsWith('.png'));
        formData.append('logo_url', selectedBrand.logoUrl);
          logoAdded = true;
      }
      
      if (!logoAdded) {
        console.warn('[Ad Generation] No logo available, proceeding without logo');
        // Don't throw error - backend can generate ads without logo
      }
      
      // Product images - send URLs to backend (avoid CORS issues)
      const selectedImages = product.selectedImages || [];
      console.log('[Ad Generation] Selected images count:', selectedImages.length);
      
      if (selectedImages.length === 0) {
        throw new Error('Veuillez sélectionner au moins une image de produit');
      }
      
      // Get up to 3 product image URLs
      const productImageUrls = [];
      for (let i = 0; i < Math.min(selectedImages.length, 3); i++) {
        const imageIndex = selectedImages[i];
        const imageUrl = product.images[imageIndex];
        
        if (imageUrl) {
          productImageUrls.push(imageUrl);
          console.log(`[Ad Generation] Adding product image URL ${i + 1}:`, imageUrl);
        }
      }
      
      if (productImageUrls.length === 0) {
        throw new Error('Aucune URL d\'image de produit valide trouvée');
      }
      
      // Send image URLs to backend as JSON string (backend expects json.loads())
      formData.append('product_image_urls', JSON.stringify(productImageUrls));
      
      console.log(`[Ad Generation] Sending ${productImageUrls.length} product image URLs to backend:`, productImageUrls);
      
      console.log('[Ad Generation] Sending request to API (job-based)...');
      
      // Call API (returns job ID immediately)
      const response = await adsAPI.generateBulkAds(formData);
      
      console.log('[Ad Generation] Full API response:', response);
      
      // Job-based: Backend returns job_id immediately
      if (response.success && response.data?.job_id) {
        const jobId = response.data.job_id;
        console.log('[Ad Generation] Job submitted:', jobId);
        
        // Set job state for UI
        setAdGenerationJobId(jobId);
        setAdGenerationStatus('processing');
        setError(''); // Clear any previous errors
        
        // Track job for notifications - JobNotificationContext will handle polling
        trackJob(jobId, 'ad_generation', {
          brandId: product.brandId,
          productId: product.productId,
          productName: product.title,
          quantity: imageQuantity,
        });
        
        // Add task for Tasks page tracking
        addTask({
          taskType: 'ad_generation',
          status: 'processing',
          progress: 0,
          title: `Ad Generation: ${product.title}`,
          description: `Generating ${imageQuantity} ad images`,
          metadata: {
            brandId: product.brandId,
            productId: product.productId,
            productName: product.title,
            quantity: imageQuantity,
            jobId,
          },
        });
        console.log('[Ad Generation] 📋 Task created for tracking');
        
        console.log('[Ad Generation] ✅ Job is processing in the background. User will be notified.');
        
        // Keep the UI in the processing state - user will be notified when done
        // JobNotificationContext handles all polling and notifications
        
      } else {
        // Job submission failed
        const errorMsg = response.message || response.data?.message || 'Échec de la soumission du job de génération';
        console.error('[Ad Generation] Error:', errorMsg);
        setError(errorMsg);
        setAdGenerationStatus('failed');
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('[Ad Generation] Error submitting job:', err);
      console.error('[Ad Generation] Error details:', {
        message: err.message,
        code: err.code,
        response: err.response
      });
      
      setError(err.message || 'Une erreur est survenue lors de la soumission de la génération d\'annonces.');
      setAdGenerationStatus('failed');
      setIsGenerating(false);
    }
  };

  // Get stored product for ad generation
  const getAdGenerationProduct = () => {
    const stored = localStorage.getItem('adGenerationProduct');
    return stored ? JSON.parse(stored) : null;
  };

  return (
    <DashboardLayout>
      <div className="p-2 xxs:p-4 sm:p-5 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full font-poppins">
        {/* Header Section */}
        <div className="mb-4 xxs:mb-5 sm:mb-6 lg:mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 xxs:gap-4 mb-4 xxs:mb-5 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-white text-xl xxs:text-2xl sm:text-3xl font-bold mb-1 xxs:mb-2">
                Ingestion de produit
              </h1>
              <p className="text-gray-400 text-xs xxs:text-sm sm:text-base">
                Importez vos produits et générez des annonces publicitaires
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-800 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-3 px-3 xxs:px-4 sm:px-6 text-xs xxs:text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                activeTab === 'manual'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:scale-105'
              }`}
            >
              Import Produit
              {activeTab === 'manual' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white animate-slide-in-right"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('imported')}
              className={`pb-3 px-3 xxs:px-4 sm:px-6 text-xs xxs:text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                activeTab === 'imported'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:scale-105'
              }`}
            >
              Produits importés
              {activeTab === 'imported' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white animate-slide-in-right"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ad-generation')}
              className={`pb-3 px-3 xxs:px-4 sm:px-6 text-xs xxs:text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                activeTab === 'ad-generation'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Génération d&apos;annonces</span>
              </div>
              {activeTab === 'ad-generation' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 animate-slide-in-right"></div>
              )}
            </button>
          </div>
        </div>


        {/* Tab Content - Imported Products */}
        {activeTab === 'imported' && (
          <div className="animate-fade-in">
            {!selectedBrand ? (
              <div className="bg-[#1A1A1A] rounded-xl p-6 xxs:p-8 sm:p-10 border border-[#262626] flex flex-col items-center justify-center text-center min-h-[400px]">
            <svg className="w-16 h-16 xxs:w-20 xxs:h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            <h3 className="text-white text-lg xxs:text-xl font-semibold mb-2">
                  Sélectionnez une marque
                      </h3>
            <p className="text-gray-400 text-sm xxs:text-base max-w-md">
                  Choisissez une marque dans le menu de gauche pour voir ses produits importés
                      </p>
                    </div>
            ) : loadingProducts ? (
              <div className="bg-[#1A1A1A] rounded-xl p-6 xxs:p-8 sm:p-10 border border-[#262626] flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 xxs:h-16 xxs:w-16 border-b-2 border-purple-500 mb-4"></div>
                <h3 className="text-white text-lg xxs:text-xl font-semibold mb-2">
                  Chargement des produits...
              </h3>
                <p className="text-gray-400 text-sm xxs:text-base">
                  Veuillez patienter
              </p>
                  </div>
            ) : !brandProducts || brandProducts.length === 0 ? (
              <div className="bg-[#1A1A1A] rounded-xl p-6 xxs:p-8 sm:p-10 border border-[#262626] flex flex-col items-center justify-center text-center min-h-[400px]">
            <svg className="w-16 h-16 xxs:w-20 xxs:h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            <h3 className="text-white text-lg xxs:text-xl font-semibold mb-2">
                  Aucun produit pour {selectedBrand.brandName}
            </h3>
                <p className="text-gray-400 text-sm xxs:text-base max-w-md mb-4">
                  Commencez par importer un produit dans l'onglet "Import Produit"
                </p>
                <button
                  onClick={() => setActiveTab('manual')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aller à l'import produit
                </button>
                </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-white text-xl xxs:text-2xl font-bold">
                      {selectedBrand.brandName}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {brandProducts.length} produit{brandProducts.length > 1 ? 's' : ''} importé{brandProducts.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={refreshBrandData}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualiser
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {brandProducts.map(product => (
                    <ProductCardSimple
                      key={product.productId}
                      product={product}
                      brandInfo={selectedBrand}
                      onGenerateAds={async (prod) => {
                        // ⚠️ CRITICAL: Refetch brand data FIRST to get the latest PNG logoUrl from Firestore
                        let freshBrand = selectedBrand;
                        try {
                          console.log('[ProductIngestion] 🔄 Refetching brand data BEFORE transforming product...');
                          const response = await brandsAPI.getBrand(selectedBrand.brandId);
                          if (response.success && response.data) {
                            freshBrand = response.data;
                            setSelectedBrand(freshBrand);
                            console.log('[ProductIngestion] ✅ Got fresh brand data with logoUrl:', freshBrand.logoUrl);
                          }
                        } catch (error) {
                          console.error('[ProductIngestion] ❌ Error refetching brand:', error);
                        }
                        
                        // Helper to extract hex from color (can be string or {hex, rgb} object)
                        const getColorHex = (color) => {
                          if (!color) return null;
                          if (typeof color === 'string') return color;
                          if (typeof color === 'object' && color.hex) return color.hex;
                          return null;
                        };
                        
                        // Build color palette from product and brand colors
                        const colorPalette = [];
                        
                        // Add product colors first
                        const prodPrimary = getColorHex(prod.primaryColor);
                        const prodSecondary = getColorHex(prod.secondaryColor);
                        const prodAccent = getColorHex(prod.accentColor);
                        
                        if (prodPrimary) colorPalette.push(prodPrimary);
                        if (prodSecondary) colorPalette.push(prodSecondary);
                        if (prodAccent) colorPalette.push(prodAccent);
                        
                        // If no product colors, use brand colors (using fresh brand data)
                        if (colorPalette.length === 0) {
                          const brandPrimary = getColorHex(freshBrand?.primaryColor);
                          const brandSecondary = getColorHex(freshBrand?.secondaryColor);
                          const brandAccent = getColorHex(freshBrand?.accentColor);
                          
                          if (brandPrimary) colorPalette.push(brandPrimary);
                          if (brandSecondary) colorPalette.push(brandSecondary);
                          if (brandAccent) colorPalette.push(brandAccent);
                        }
                        
                        // Add product palette colors if available
                        if (prod.palette && Array.isArray(prod.palette)) {
                          prod.palette.forEach(color => {
                            const hexColor = getColorHex(color);
                            if (hexColor && !colorPalette.includes(hexColor)) {
                              colorPalette.push(hexColor);
                            }
                          });
                        }
                        
                        // Ensure we have at least 3 colors
                        if (colorPalette.length === 0) {
                          colorPalette.push('#8B7355', '#FFFFFF', '#000000');
                        }
                        
                        // Remove duplicate colors (case-insensitive)
                        const uniqueColorPalette = deduplicateColors(colorPalette);
                        console.log('[ProductIngestion] Color palette before dedup:', colorPalette);
                        console.log('[ProductIngestion] Color palette after dedup:', uniqueColorPalette);
                        
                        // Transform product for ad generation - USE FRESH BRAND DATA
                        const transformedProduct = {
                          id: Date.now(),
                          productId: prod.productId,
                          brandId: freshBrand?.brandId,
                          url: prod.productUrl || '',
                          title: prod.productName,
                          brand_name: freshBrand?.brandName || '',
                          description: prod.description || '',
                          images: prod.images || [],
                          imageCount: prod.images?.length || 0,
                          selectedImages: [], // Start with no images selected - user must choose
                          brand_logo: freshBrand?.logoUrl || null, // 🎨 Use fresh PNG logoUrl from Firestore
                          custom_logo: null,
                          primaryColor: uniqueColorPalette[0],
                          secondaryColor: uniqueColorPalette[1] || uniqueColorPalette[0],
                          accentColor: uniqueColorPalette[2] || null,
                          website_palette: uniqueColorPalette,
                          primary_color_index: 0,
                          secondary_color_index: 1,
                          accent_color_index: 2,
                          status: 'ready'
                        };
                        
                        console.log('[ProductIngestion] Transformed product for ad generation:', transformedProduct);
                        console.log('[ProductIngestion] Product title:', transformedProduct.title);
                        console.log('[ProductIngestion] Product description:', transformedProduct.description);
                        console.log('[ProductIngestion] Product description length:', transformedProduct.description?.length);
                        console.log('[ProductIngestion] 🎨 Logo URL being saved to product:', transformedProduct.brand_logo);
                        localStorage.setItem('adGenerationProduct', JSON.stringify(transformedProduct));
                        setActiveTab('ad-generation');
                        setAdGenerationStep(0); // Start at image/color selection
                        setGeneratedAds([]);
                      }}
                      onDelete={async (prod) => {
                        const result = await deleteProduct(selectedBrand.brandId, prod.productId);
                        if (!result.success) {
                          alert(`Erreur: ${result.error}`);
                        }
                      }}
                    />
                  ))}
            </div>
          </div>
        )}
          </div>
        )}

        {/* Tab Content - Manual Import */}
        {activeTab === 'manual' && (
          <div className="space-y-4 xxs:space-y-5 sm:space-y-6 animate-fade-in">
            {/* URL Input Section - Only show if no fetched products */}
            {fetchedProducts.length === 0 && (
            <div className="bg-[#1A1A1A] rounded-xl p-4 xxs:p-5 sm:p-6 border border-[#262626] hover:border-gray-700/50 transition-all duration-300">
              <div className="mb-4 xxs:mb-5">
                <h3 className="text-white text-base xxs:text-lg font-semibold mb-1">
                  Importer un produit par URL
                </h3>
                <p className="text-gray-400 text-xs xxs:text-sm">
                  Collez l'URL d'un produit pour récupérer automatiquement ses informations
                </p>
            </div>
            
              <form onSubmit={handleFetchProduct} className="space-y-3 xxs:space-y-4">
                <div className="flex flex-col xxs:flex-row gap-2 xxs:gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="https://example.com/product/..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F0F] border border-[#262626] group-hover:border-gray-700 focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none placeholder:text-gray-600"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !productUrl.trim() || scrapingStatus === 'processing'}
                    className="px-5 xxs:px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed hover:scale-105 disabled:scale-100 hover:shadow-lg hover:shadow-purple-500/30 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Soumission...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Récupérer</span>
                      </>
                    )}
                  </button>
            </div>
            
                {/* Scraping Status Messages */}
                {scrapingStatus === 'processing' && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-blue-400 font-semibold text-sm mb-2">
                          🔍 Scraping en cours...
                        </h4>
                        <p className="text-gray-300 text-xs mb-3">
                          L'analyse du produit prend généralement <strong>60-90 secondes</strong>. Le produit apparaîtra automatiquement une fois terminé.
                        </p>
                        
                        {/* Fake Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                              style={{ width: `${scrapingProgress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              Progression: {Math.round(scrapingProgress)}%
                            </span>
                            <span className="text-gray-500">
                              ⏱️ Timeout: 45 min max
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-xs mt-3">
                          💡 La recherche stratégique démarrera automatiquement en arrière-plan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Research Notification - Shows after scraping completes */}
                {showResearchNotification && scrapedProductData && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-lg p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-purple-300 font-semibold text-sm mb-1 flex items-center gap-2">
                          ✅ Produit ajouté avec succès!
                          <span className="text-xs font-normal text-gray-400">
                            ({scrapedProductData.product_name})
                          </span>
                        </h4>
                        <p className="text-gray-300 text-xs mb-3">
                          🔬 <strong className="text-purple-300">L'opération de recherche de marché approfondie</strong> a démarré automatiquement en arrière-plan.
                        </p>
                        <button
                          onClick={() => {
                            // Navigate to strategic analysis with brand context
                            const brandId = scrapedProductData.brand_id || selectedBrand?.brandId;
                            const productId = scrapedProductData.product_id;
                            
                            if (brandId && productId) {
                              console.log('[Scraping] 🚀 Navigating to strategic analysis:', { brandId, productId });
                              navigate(`/strategic-analysis?brand=${brandId}&product=${productId}`, {
                                state: { 
                                  preserveBrand: brandId,
                                  fromScraping: true 
                                }
                              });
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Voir l'analyse stratégique
                        </button>
                        <button
                          onClick={() => setShowResearchNotification(false)}
                          className="ml-2 px-3 py-2 text-gray-400 hover:text-gray-300 text-xs transition-colors"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {scrapingStatus === 'failed' && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-red-400 font-semibold text-sm mb-1">
                          Échec du scraping
                        </h4>
                        <p className="text-gray-300 text-xs mb-3">
                          {error || 'Une erreur est survenue lors de la soumission du job de scraping.'}
                        </p>
                        <button
                          onClick={handleRetryScraping}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Réessayer avec la même URL
                        </button>
                        {lastScrapedUrl && (
                          <p className="text-gray-500 text-xs mt-2 truncate">
                            URL: {lastScrapedUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading Progress Message */}
                {isLoading && (
                  <div className="flex items-start gap-3 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 animate-fade-in">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <p className="font-semibold mb-1">⏱️ Scraping du produit...</p>
                      <p className="text-gray-400">
                        Cette opération prend généralement 60-90 secondes (timeout: 45 min max).
                      </p>
                    </div>
                  </div>
                )}

                {/* Helper text */}
                {!isLoading && !scrapingStatus && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                      <span>Supports les URLs de produits depuis Shopify, WooCommerce, et autres plateformes e-commerce</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-400/60">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Temps moyen d&apos;extraction: 5-10 secondes</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
            )}

            {/* Fetched Products List */}
            {fetchedProducts.length > 0 && (
              <div className="space-y-6">
                 {fetchedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden animate-fade-in"
                  >
                    <div className="flex flex-col xl:flex-row min-h-0">
                      {/* Main Product Content - Left Side */}
                      <div className="flex-1 p-4 xxs:p-5 sm:p-6 flex flex-col min-h-0">
                        {/* Header with Close Button */}
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <h2 className="text-white text-lg xxs:text-xl sm:text-2xl md:text-3xl font-bold flex-1 pr-2 sm:pr-4 leading-tight">
                            {product.title || 'Produit sans titre'}
                          </h2>
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="text-gray-400 hover:text-white p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 flex-shrink-0"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Description Section */}
                        <div className="mb-4 sm:mb-6">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <div className="text-purple-500 flex-shrink-0">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                              </svg>
                            </div>
                            <h3 className="text-white font-semibold text-xs xxs:text-sm sm:text-base">
                              Description du produit
                            </h3>
                            <button
                              onClick={() => setEditingDescriptionId(editingDescriptionId === product.id ? null : product.id)}
                              className="ml-auto text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 hover:bg-purple-500/10 px-2 py-1 rounded transition-all duration-200"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>{editingDescriptionId === product.id ? 'Annuler' : 'Modifier'}</span>
                            </button>
                          </div>
                          {editingDescriptionId === product.id ? (
                            <div className="space-y-2">
                              <textarea
                                defaultValue={product.description}
                                id={`desc-${product.id}`}
                                rows="4"
                                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-xs xxs:text-sm leading-relaxed rounded-lg transition-all duration-200 outline-none resize-none"
                              />
                              <button
                                onClick={() => {
                                  const newDesc = document.getElementById(`desc-${product.id}`).value;
                                  handleUpdateDescription(product.id, newDesc);
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-all duration-200"
                              >
                                Enregistrer
                              </button>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-xs xxs:text-sm leading-relaxed">
                              {product.description || 'Aucune description disponible'}
                            </p>
                          )}
                        </div>

                        {/* Images Section */}
                        <div className="mb-4 sm:mb-6">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <div className="text-purple-500 flex-shrink-0">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 className="text-white font-semibold text-xs xxs:text-sm sm:text-base">
                              Images du produit
                            </h3>
                            {product.imageCount > 0 && (
                              <span className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 shadow-lg">
                                {product.imageCount} {product.imageCount > 1 ? 'images' : 'image'}
                              </span>
                            )}
                          </div>
                          
                          {product.images.length > 0 ? (
                            <>
                              <div className="mb-3">
                                <p className="text-gray-400 text-xs mb-2">
                                  {(product.selectedImages || []).length > 0 && 
                                    `${(product.selectedImages || []).length} image(s) sélectionnée(s) • `
                                  }
                                  Cliquez pour sélectionner les images pour la génération d&apos;annonce
                                </p>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xxs:gap-3 sm:gap-4">
                                {product.images.slice(0, expandedProductId === product.id ? product.images.length : 8).map((image, idx) => {
                                  const isSelected = (product.selectedImages || []).includes(idx);
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => handleToggleImageSelection(product.id, idx)}
                                      className={`aspect-[4/3] bg-white rounded-lg overflow-hidden border-2 group hover:scale-105 hover:shadow-lg transition-all duration-300 relative cursor-pointer ${
                                        isSelected 
                                          ? 'border-purple-500 shadow-lg shadow-purple-500/50' 
                                          : 'border-[#262626] hover:border-purple-400'
                                      }`}
                                    >
                                      <img
                                        src={image}
                                        alt={`Product ${idx + 1}`}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                                        }}
                                      />
                                      <div className={`absolute top-1 right-1 text-white text-xs px-2 py-0.5 rounded ${
                                        isSelected ? 'bg-purple-600' : 'bg-black/60'
                                      }`}>
                                        {idx + 1}
                                      </div>
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                          <div className="bg-purple-600 rounded-full p-2">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {product.imageCount > 8 && expandedProductId !== product.id && (
                                <button
                                  onClick={() => toggleExpanded(product.id)}
                                  className="text-purple-400 hover:text-purple-300 text-xs mt-3 flex items-center gap-1 hover:gap-2 transition-all duration-200"
                                >
                                  <span>Voir toutes les {product.imageCount} images</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                              {expandedProductId === product.id && (
                                <button
                                  onClick={() => toggleExpanded(product.id)}
                                  className="text-gray-400 hover:text-gray-300 text-xs mt-3 flex items-center gap-1 hover:gap-2 transition-all duration-200"
                                >
                                  <span>Réduire</span>
                                  <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-500 text-xs sm:text-sm bg-gray-800/30 rounded-lg p-4 text-center">
                              Aucune image disponible
                            </div>
                          )}
                        </div>

                        {/* Source URL */}
                        <div className="mt-auto pt-4 sm:pt-6 border-t border-[#262626]">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="truncate">{product.url}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 xxs:gap-3">
                            <button 
                              onClick={() => handleProceedToAdGeneration(product.id)}
                              disabled={!(product.selectedImages || []).length}
                              className="w-full px-4 sm:px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed hover:scale-105 disabled:scale-100 hover:shadow-lg hover:shadow-purple-500/30 text-white text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>Générer des annonces</span>
                            </button>
                            {!(product.selectedImages || []).length && (
                              <p className="text-yellow-400 text-xs text-center">
                                Sélectionnez au moins une image pour continuer
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
            
                      {/* Brand Information Sidebar - Right Side */}
                      <div className="w-full xl:w-[420px] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] border-t xl:border-t-0 xl:border-l border-[#262626] p-4 xxs:p-5 sm:p-6 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-5 sm:mb-6">
                          <div className="text-purple-500 flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <h3 className="text-white font-bold text-sm xxs:text-base sm:text-lg">
                            Informations de marque
                          </h3>
                        </div>
            
                        {/* Brand Name */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-gray-200 text-xs font-semibold uppercase tracking-wide">
                              Nom de la marque
                            </h4>
                            <button
                              onClick={() => setEditingBrandNameId(editingBrandNameId === product.id ? null : product.id)}
                              className="ml-auto text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 hover:bg-purple-500/10 px-2 py-1 rounded transition-all duration-200"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>{editingBrandNameId === product.id ? 'Annuler' : 'Modifier'}</span>
                            </button>
                          </div>
                          {editingBrandNameId === product.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                defaultValue={product.brand_name}
                                id={`brand-${product.id}`}
                                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] focus:border-purple-500 text-white text-sm rounded-lg transition-all duration-200 outline-none"
                                placeholder="Nom de la marque"
                              />
                              <button
                                onClick={() => {
                                  const newName = document.getElementById(`brand-${product.id}`).value;
                                  handleUpdateBrandName(product.id, newName);
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-all duration-200"
                              >
                                Enregistrer
                              </button>
                            </div>
                          ) : (
                            <p className="text-white text-lg font-bold">
                              {product.brand_name || 'Non spécifié'}
                            </p>
                          )}
                        </div>

                        {/* Brand Logo */}
                        <div className="mb-5 sm:mb-6">
                          {(product.custom_logo || product.brand_logo) ? (
                            <div className="bg-white rounded-xl p-5 xxs:p-6 flex items-center justify-center min-h-[140px] xxs:min-h-[160px] border-2 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 relative">
                              <img
                                src={product.custom_logo || product.brand_logo}
                                alt="Brand Logo"
                                className="max-w-full max-h-28 xxs:max-h-32 sm:max-h-36 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="text-gray-400 text-sm">Logo non disponible</div>';
                                }}
                              />
                              {product.custom_logo && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  Personnalisé
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 xxs:p-6 flex items-center justify-center min-h-[140px] xxs:min-h-[160px] border-2 border-dashed border-purple-500/20">
                              <div className="text-center">
                                <svg className="w-12 h-12 xxs:w-14 xxs:h-14 mx-auto text-purple-500/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500 text-sm">Logo non disponible</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Upload Logo Button */}
                          <div className="mt-3">
                            <label htmlFor={`logo-upload-${product.id}`} className="block">
                              <input
                                type="file"
                                id={`logo-upload-${product.id}`}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleLogoUpload(product.id, e.target.files[0]);
                                  }
                                }}
                              />
                              <div className="w-full px-4 py-2 bg-[#0F0F0F] hover:bg-black border border-[#262626] hover:border-purple-500 text-white text-xs text-center rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span>{product.custom_logo ? 'Changer le logo' : 'Télécharger un logo personnalisé'}</span>
                              </div>
                            </label>
                            {product.custom_logo && (
                              <button
                                onClick={() => {
                                  setFetchedProducts(fetchedProducts.map(p => 
                                    p.id === product.id ? { ...p, custom_logo: null } : p
                                  ));
                                }}
                                className="w-full mt-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs text-center rounded-lg transition-all duration-200"
                              >
                                Utiliser le logo d&apos;origine
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Brand Colors Section */}
                        {product.brand_colors && product.brand_colors.colors && product.brand_colors.colors.length > 0 && (
                          <div className="mb-5 sm:mb-6 bg-[#1A1A1A] rounded-xl p-4 border border-[#262626]">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                              </svg>
                              <h4 className="text-gray-200 text-xs font-semibold uppercase tracking-wide">
                                Couleurs de la marque
                              </h4>
                            </div>
                            
                            {product.brand_colors.color_scheme && (
                              <p className="text-gray-400 text-xs mb-3 italic">
                                {product.brand_colors.color_scheme}
                              </p>
                            )}
                            
                            <div className="flex gap-2 flex-wrap">
                              {product.brand_colors.colors.map((color, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-[#0F0F0F] rounded-lg px-3 py-2 border border-[#262626]">
                                  <div 
                                    className="w-6 h-6 rounded border-2 border-gray-700 shadow-md"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-white font-mono text-xs font-semibold">
                                    {color.toUpperCase()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Website Colors Section */}
                        {product.website_palette && product.website_palette.length > 0 && (
                          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626]">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                                </svg>
                                <h4 className="text-gray-200 text-xs font-semibold uppercase tracking-wide">
                                  Couleurs du site web
                                </h4>
                              </div>
                            </div>

                            {/* Dominant Color Display */}
                            {product.website_dominant_color && (
                              <div className="mb-4 bg-[#0F0F0F] rounded-lg p-3 border border-[#262626]">
                                <p className="text-gray-400 text-xs mb-2">Couleur dominante</p>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-12 h-12 rounded-lg border-2 border-gray-700 shadow-lg"
                                    style={{ backgroundColor: product.website_dominant_color.hex }}
                                  />
                                  <div>
                                    <p className="text-white font-mono text-sm font-bold">
                                      {product.website_dominant_color.hex.toUpperCase()}
                                    </p>
                                    <p className="text-gray-500 text-xs font-mono">
                                      RGB({product.website_dominant_color.rgb.join(', ')})
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Primary & Secondary Colors with Picker */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-400 text-xs font-medium">Couleurs principales</p>
                                <button
                                  onClick={() => handleSwapColors(product.id)}
                                  className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 hover:bg-purple-500/10 px-2 py-1 rounded transition-all duration-200"
                                  title="Échanger primaire et secondaire"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  <span>Échanger</span>
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                {/* Primary Color */}
                                {product.website_palette[product.primary_color_index] && (
                                  <div>
                                    <div className="flex items-center gap-3 bg-[#0F0F0F] rounded-lg p-2.5 border border-purple-500/30 mb-2">
                                      <div 
                                        className="w-10 h-10 rounded-lg border-2 border-purple-500/50 shadow-md flex-shrink-0"
                                        style={{ backgroundColor: product.website_palette[product.primary_color_index] }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-purple-400 text-xs font-semibold mb-0.5">Primaire</p>
                                        <p className="text-white font-mono text-xs font-bold">
                                          {product.website_palette[product.primary_color_index].toUpperCase()}
                                        </p>
                                      </div>
                                      <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        1
                                      </div>
                                      {/* Custom Color Picker for Primary */}
                                      <label htmlFor={`color-picker-primary-${product.id}`} className="cursor-pointer flex-shrink-0 relative">
                                        <input
                                          type="color"
                                          id={`color-picker-primary-${product.id}`}
                                          className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                          onChange={(e) => handleCustomColorPick(product.id, e.target.value, 'primary')}
                                        />
                                        <div className="w-8 h-8 rounded border-2 border-dashed border-purple-500 hover:border-purple-400 hover:scale-110 transition-all duration-200 flex items-center justify-center bg-purple-500/10">
                                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                    </div>
                                      </label>
                                    </div>
                                    <div className="flex gap-1.5 pl-2 flex-wrap">
                                      {/* Black */}
                                      <button
                                        onClick={() => handleCustomColorPick(product.id, '#000000', 'primary')}
                                        className="w-8 h-8 rounded border-2 border-gray-700 hover:border-purple-400 transition-all duration-200 hover:scale-110"
                                        style={{ backgroundColor: '#000000' }}
                                        title="Noir"
                                      />
                                      {/* White */}
                                      <button
                                        onClick={() => handleCustomColorPick(product.id, '#FFFFFF', 'primary')}
                                        className="w-8 h-8 rounded border-2 border-gray-700 hover:border-purple-400 transition-all duration-200 hover:scale-110"
                                        style={{ backgroundColor: '#FFFFFF' }}
                                        title="Blanc"
                                      />
                                      {/* Palette Colors */}
                                      {(() => {
                                        const dedupedPalette = deduplicateColors(product.website_palette);
                                        // Filter out black and white since they have dedicated buttons
                                        const filteredPalette = dedupedPalette.filter(c => 
                                          c.toLowerCase() !== '#000000' && c.toLowerCase() !== '#ffffff'
                                        );
                                        return filteredPalette.slice(0, 5).map((color) => {
                                          const isSelected = product.website_palette[product.primary_color_index]?.toLowerCase() === color.toLowerCase();
                                          // Find actual index in the full deduplicated palette
                                          const actualIdx = dedupedPalette.findIndex(c => c.toLowerCase() === color.toLowerCase());
                                          return (
                                            <button
                                              key={actualIdx}
                                              onClick={() => handleSelectColor(product.id, actualIdx, 'primary')}
                                              className={`w-8 h-8 rounded border-2 transition-all duration-200 hover:scale-110 ${
                                                isSelected
                                                  ? 'border-purple-500 shadow-lg shadow-purple-500/50 scale-110'
                                                  : 'border-gray-700 hover:border-purple-400'
                                              }`}
                                              style={{ backgroundColor: color }}
                                              title={`Définir ${color} comme primaire`}
                                            />
                                          );
                                        });
                                      })()}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Secondary Color */}
                                {product.website_palette[product.secondary_color_index] && (
                                  <div>
                                    <div className="flex items-center gap-3 bg-[#0F0F0F] rounded-lg p-2.5 border border-pink-500/30 mb-2">
                                      <div 
                                        className="w-10 h-10 rounded-lg border-2 border-pink-500/50 shadow-md flex-shrink-0"
                                        style={{ backgroundColor: product.website_palette[product.secondary_color_index] }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-pink-400 text-xs font-semibold mb-0.5">Secondaire</p>
                                        <p className="text-white font-mono text-xs font-bold">
                                          {product.website_palette[product.secondary_color_index].toUpperCase()}
                                        </p>
                                      </div>
                                      <div className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        2
                                      </div>
                                      {/* Custom Color Picker for Secondary */}
                                      <label htmlFor={`color-picker-secondary-${product.id}`} className="cursor-pointer flex-shrink-0 relative">
                                        <input
                                          type="color"
                                          id={`color-picker-secondary-${product.id}`}
                                          className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                          onChange={(e) => handleCustomColorPick(product.id, e.target.value, 'secondary')}
                                        />
                                        <div className="w-8 h-8 rounded border-2 border-dashed border-pink-500 hover:border-pink-400 hover:scale-110 transition-all duration-200 flex items-center justify-center bg-pink-500/10">
                                          <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                    </div>
                                      </label>
                                    </div>
                                    <div className="flex gap-1.5 pl-2 flex-wrap">
                                      {/* Black */}
                                      <button
                                        onClick={() => handleCustomColorPick(product.id, '#000000', 'secondary')}
                                        className="w-8 h-8 rounded border-2 border-gray-700 hover:border-pink-400 transition-all duration-200 hover:scale-110"
                                        style={{ backgroundColor: '#000000' }}
                                        title="Noir"
                                      />
                                      {/* White */}
                                      <button
                                        onClick={() => handleCustomColorPick(product.id, '#FFFFFF', 'secondary')}
                                        className="w-8 h-8 rounded border-2 border-gray-700 hover:border-pink-400 transition-all duration-200 hover:scale-110"
                                        style={{ backgroundColor: '#FFFFFF' }}
                                        title="Blanc"
                                      />
                                      {/* Palette Colors */}
                                      {(() => {
                                        const dedupedPalette = deduplicateColors(product.website_palette);
                                        // Filter out black and white since they have dedicated buttons
                                        const filteredPalette = dedupedPalette.filter(c => 
                                          c.toLowerCase() !== '#000000' && c.toLowerCase() !== '#ffffff'
                                        );
                                        return filteredPalette.slice(0, 5).map((color) => {
                                          const isSelected = product.website_palette[product.secondary_color_index]?.toLowerCase() === color.toLowerCase();
                                          // Find actual index in the full deduplicated palette
                                          const actualIdx = dedupedPalette.findIndex(c => c.toLowerCase() === color.toLowerCase());
                                          return (
                                            <button
                                              key={actualIdx}
                                              onClick={() => handleSelectColor(product.id, actualIdx, 'secondary')}
                                              className={`w-8 h-8 rounded border-2 transition-all duration-200 hover:scale-110 ${
                                                isSelected
                                                  ? 'border-pink-500 shadow-lg shadow-pink-500/50 scale-110'
                                                  : 'border-gray-700 hover:border-pink-400'
                                              }`}
                                              style={{ backgroundColor: color }}
                                              title={`Définir ${color} comme secondaire`}
                                            />
                                          );
                                        });
                                      })()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* All Palette Colors */}
                            {product.website_palette.length > 0 && (
                              <div className="pt-3 border-t border-[#262626]">
                                <p className="text-gray-400 text-xs font-medium mb-2">Palette complète</p>
                                <div className="flex gap-2 flex-wrap">
                                  {(() => {
                                    const dedupedPalette = deduplicateColors(product.website_palette);
                                    // Filter out black and white since they have dedicated buttons
                                    const filteredPalette = dedupedPalette.filter(c => 
                                      c.toLowerCase() !== '#000000' && c.toLowerCase() !== '#ffffff'
                                    );
                                    return filteredPalette.slice(0, 5).map((color, idx) => (
                                      <div key={idx} className="group relative">
                                        <div 
                                          className="w-12 h-12 rounded-lg border-2 border-gray-700 shadow-md"
                                          style={{ backgroundColor: color }}
                                        />
                                        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20 font-mono font-semibold">
                                          {color.toUpperCase()}
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Save Colors to Brand Button */}
                            {product.brandId && (
                              <div className="mt-4 pt-4 border-t border-[#262626]">
                                <button
                                  onClick={() => handleSaveColorsToBrand(product.id)}
                                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                  <span>Sauvegarder les couleurs dans la marque</span>
                                </button>
                                <p className="text-gray-500 text-[10px] text-center mt-2">
                                  Enregistre les couleurs primaire, secondaire et accent dans {product.brand_name || 'la marque'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[#262626]">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs font-medium">Statut</span>
                            <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-yellow-500/30">
                              <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              En attente
                            </span>
                          </div>
                        </div>
          </div>
        </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State - Only show when no products fetched */}
            {fetchedProducts.length === 0 && !isLoading && (
              <div className="bg-[#1A1A1A] rounded-xl p-6 xxs:p-8 sm:p-10 border border-[#262626] flex flex-col items-center justify-center text-center min-h-[300px] animate-fade-in">
                <div className="w-16 h-16 xxs:w-20 xxs:h-20 bg-[#0F0F0F] rounded-xl flex items-center justify-center mb-4 xxs:mb-5 animate-pulse-glow">
                  <svg className="w-8 h-8 xxs:w-10 xxs:h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-white text-lg xxs:text-xl font-semibold mb-2">
                  Aucun produit récupéré
                </h3>
                <p className="text-gray-400 text-sm xxs:text-base max-w-md">
                  Collez une URL de produit ci-dessus pour commencer à importer vos produits
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Ad Generation Flow */}
        {activeTab === 'ad-generation' && (() => {
          const product = getAdGenerationProduct();
          
          if (!product) {
            return (
              <div className="bg-[#1A1A1A] rounded-xl p-10 border border-[#262626] flex flex-col items-center justify-center text-center min-h-[400px] animate-fade-in">
                <svg className="w-20 h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-white text-xl font-semibold mb-2">
                  Aucun produit sélectionné
                </h3>
                <p className="text-gray-400 text-base max-w-md mb-6">
                  Importez un produit depuis l&apos;onglet &quot;Import Produit&quot; ou sélectionnez un produit existant depuis &quot;Produits importés&quot;
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('manual')}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    Import Produit
                  </button>
                  <button
                    onClick={() => setActiveTab('imported')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    Produits importés
                  </button>
                </div>
              </div>
            );
          }
          
          // Step 0 should be in Import Produit tab, not here
          // Automatically redirect to Import Produit tab
          if (adGenerationStep === 0) {
            setFetchedProducts([product]);
            setExpandedProductId(product.id);
            setActiveTab('manual');
            return null;
          }

          return (
            <div className="space-y-6 animate-fade-in">
              {/* Progress Steps */}
              <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#262626]">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  {[
                    { num: 0, label: 'Sélection', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { num: 1, label: 'Vérification', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { num: 2, label: 'Quantité', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
                    { num: 3, label: 'Résultats', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
                  ].map((step, idx) => (
                    <React.Fragment key={step.num}>
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                          adGenerationStep === step.num
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-110 shadow-lg shadow-purple-500/50'
                            : adGenerationStep > step.num
                            ? 'bg-green-600'
                            : 'bg-gray-700'
                        }`}>
                          {adGenerationStep > step.num ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${
                          adGenerationStep === step.num ? 'text-white' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < 3 && (
                        <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                          adGenerationStep > step.num ? 'bg-green-600' : 'bg-gray-700'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step 0 is now in Import Produit tab - removed from here */}

              {/* Step 1: Parameters Review */}
              {adGenerationStep === 1 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                  <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
                    <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Vérification des paramètres
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Product Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-gray-400 text-sm mb-2">Produit</h3>
                        <p className="text-white font-semibold text-lg">{product.title}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-gray-400 text-sm mb-2">Description</h3>
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{product.description}</p>
                      </div>

                      <div>
                        <h3 className="text-gray-400 text-sm mb-2">Images sélectionnées</h3>
                        <div className="flex gap-2 flex-wrap">
                          {product.selectedImages.map((idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={product.images[idx]}
                                alt={`Selected ${idx + 1}`}
                                className="w-16 h-16 rounded border-2 border-purple-500 object-cover"
                              />
                              <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-purple-400 text-sm mt-2">
                          {product.selectedImages.length} image(s) sélectionnée(s)
                        </p>
                      </div>
                    </div>

                    {/* Brand & Colors */}
                    <div className="space-y-4">
                      {/* Brand Information */}
                      <div>
                        <h3 className="text-gray-400 text-sm mb-3">Informations de marque</h3>
                        <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#262626]">
                          {/* Brand Name */}
                          <div className="mb-3">
                            <p className="text-gray-400 text-xs mb-1">Nom de la marque</p>
                            <p className="text-white font-bold text-lg">{product.brand_name || 'Non spécifié'}</p>
                          </div>
                          
                          {/* Brand Logo */}
                          {(product.custom_logo || product.brand_logo) && (
                            <div className="bg-white rounded-lg p-3 flex items-center justify-center min-h-[80px] relative">
                              <img
                                src={product.custom_logo || product.brand_logo}
                                alt="Brand Logo"
                                className="max-h-16 object-contain"
                              />
                              {product.custom_logo && (
                                <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  Personnalisé
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Colors */}
                      <div>
                        <h3 className="text-gray-400 text-sm mb-3">Couleurs sélectionnées</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-[#0F0F0F] rounded-lg p-3 border border-purple-500/30">
                            <div 
                              className="w-12 h-12 rounded-lg border-2 border-purple-500 shadow-md"
                              style={{ backgroundColor: getColorHex(product.primaryColor) }}
                            />
                            <div>
                              <p className="text-purple-400 text-xs font-semibold">Couleur primaire</p>
                              <p className="text-white font-mono text-sm font-bold">{getColorHex(product.primaryColor)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-[#0F0F0F] rounded-lg p-3 border border-pink-500/30">
                            <div 
                              className="w-12 h-12 rounded-lg border-2 border-pink-500 shadow-md"
                              style={{ backgroundColor: getColorHex(product.secondaryColor) }}
                            />
                            <div>
                              <p className="text-pink-400 text-xs font-semibold">Couleur secondaire</p>
                              <p className="text-white font-mono text-sm font-bold">{getColorHex(product.secondaryColor)}</p>
                            </div>
                          </div>
                          
                          {product.accentColor && (
                            <div className="flex items-center gap-3 bg-[#0F0F0F] rounded-lg p-3 border border-amber-500/30">
                              <div 
                                className="w-12 h-12 rounded-lg border-2 border-amber-500 shadow-md"
                                style={{ backgroundColor: getColorHex(product.accentColor) }}
                              />
                              <div>
                                <p className="text-amber-400 text-xs font-semibold">Couleur d&apos;accent (optionnel)</p>
                                <p className="text-white font-mono text-sm font-bold">{getColorHex(product.accentColor)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="mt-6 p-4 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="use-custom-language"
                        checked={useCustomLanguage}
                        onChange={(e) => setUseCustomLanguage(e.target.checked)}
                        className="w-4 h-4 accent-purple-600 cursor-pointer"
                      />
                      <label htmlFor="use-custom-language" className="text-white text-sm font-medium cursor-pointer flex-1">
                        Générer les annonces dans une langue spécifique
                      </label>
                      {useCustomLanguage && (
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="px-3 py-2 bg-[#1A1A1A] border border-[#262626] text-white text-sm rounded-lg focus:border-purple-500 outline-none"
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                          <option value="it">Italiano</option>
                          <option value="pt">Português</option>
                          <option value="nl">Nederlands</option>
                          <option value="pl">Polski</option>
                          <option value="ja">日本語</option>
                          <option value="zh">中文</option>
                          <option value="ar">العربية</option>
                        </select>
                      )}
                    </div>
                    {useCustomLanguage && (
                      <p className="text-gray-400 text-xs mt-2 ml-7">
                        Les textes des annonces seront générés dans la langue sélectionnée
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-8 pt-6 border-t border-[#262626]">
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-6 py-3 bg-[#0F0F0F] hover:bg-black border border-[#262626] text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Retour
                    </button>
                    <button
                      onClick={() => setAdGenerationStep(2)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <span>Continuer</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Image Quantity Selection */}
              {adGenerationStep === 2 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                  <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
                    <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Nombre d&apos;annonces à générer
                  </h2>

                  <div className="max-w-2xl mx-auto">
                    <p className="text-gray-400 text-center mb-8">
                      Choisissez combien d&apos;annonces publicitaires vous souhaitez générer (minimum 1, maximum 10)
                    </p>

                    {/* Quantity Selector */}
                    <div className="bg-[#0F0F0F] rounded-xl p-8 border border-[#262626] mb-6">
                      <div className="flex items-center justify-center gap-6 mb-6">
                        <button
                          onClick={() => setImageQuantity(Math.max(1, imageQuantity - 1))}
                          className="w-12 h-12 bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <div className="text-center">
                          <div className="text-6xl font-bold text-white mb-2">{imageQuantity}</div>
                          <div className="text-gray-400 text-sm">annonce{imageQuantity > 1 ? 's' : ''}</div>
                        </div>
                        
                        <button
                          onClick={() => setImageQuantity(Math.min(10, imageQuantity + 1))}
                          className="w-12 h-12 bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={imageQuantity}
                        onChange={(e) => setImageQuantity(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                      <p className="text-purple-400 text-sm">
                        <strong>Estimation:</strong> La génération de {imageQuantity} annonce{imageQuantity > 1 ? 's' : ''} en format carré (1:1) prendra environ {Math.ceil(imageQuantity * 6)}-{Math.ceil(imageQuantity * 10)} secondes
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5 mb-6">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 flex-shrink-0 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-blue-300 text-base font-semibold mb-2">⏱️ Temps de génération : 3 à 10 minutes</p>
                          <p className="text-blue-200 text-sm leading-relaxed">
                            La génération d'annonces peut prendre du temps. N'hésitez pas à revenir plus tard pour les retrouver dans la section <strong>"Annonces Générées"</strong>, ou patientez jusqu'à ce que le traitement soit terminé.
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-[#262626]">
                    <button
                      onClick={() => setAdGenerationStep(1)}
                      className="px-6 py-3 bg-[#0F0F0F] hover:bg-black border border-[#262626] text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleGenerateAds}
                      disabled={isGenerating}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Génération en cours...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Générer {imageQuantity} annonce{imageQuantity > 1 ? 's' : ''}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Results */}
              {adGenerationStep === 3 && (
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                  <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-purple-500"></div>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Annonces générées
                      </>
                    )}
                  </h2>

                  {isGenerating ? (
                    <div>
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6 animate-fadeIn">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <svg className="w-12 h-12 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-300 text-sm mb-3">
                              La génération de {imageQuantity} annonce{imageQuantity > 1 ? 's' : ''} est en cours de traitement. 
                              Ce processus peut prendre de 2 à 10 minutes selon la complexité.
                            </p>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                              <p className="text-blue-200 text-sm font-medium mb-1">
                                🔔 Vous serez notifié automatiquement
                              </p>
                              <p className="text-gray-400 text-xs">
                                Une notification apparaîtra en haut à droite lorsque vos annonces seront prêtes. 
                                Vous pouvez continuer à utiliser l&apos;application ou revenir plus tard.
                              </p>
                            </div>
                            <p className="text-gray-500 text-xs">
                              💡 <strong>Astuce:</strong> Même si vous fermez cette page ou rafraîchissez votre navigateur, 
                              la génération continue en arrière-plan et vous recevrez toujours la notification.
                            </p>
                            {adGenerationJobId && (
                              <p className="text-gray-600 text-xs mt-2">
                                Job ID: {adGenerationJobId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : generatedAds.length > 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        Génération terminée !
                      </h3>
                      <p className="text-gray-400 mb-8">
                        {generatedAds.length} annonce{generatedAds.length > 1 ? 's ont' : ' a'} été générée{generatedAds.length > 1 ? 's' : ''} avec succès
                      </p>
                      
                      {/* Generated ads display - already filtered, no need to filter again */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedAds.map((ad, idx) => (
                          <div key={ad.conversation_id || idx} className="bg-[#0F0F0F] rounded-lg p-4 border border-[#262626] hover:border-purple-500/50 transition-all duration-300 group">
                            <div className="relative mb-3 overflow-hidden rounded-lg cursor-pointer" onClick={() => handleOpenChat(ad)}>
                              <img
                                src={ad.firebase_url}
                                alt={`Generated Ad ${idx + 1}`}
                                className="w-full h-auto object-contain bg-white"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenChat(ad);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <span>Modifier</span>
                                  </button>
                                <a
                                  href={ad.firebase_url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  <span>Télécharger</span>
                                </a>
                                </div>
                                <p className="text-white text-xs px-4 text-center">Cliquez pour modifier avec l&apos;IA</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-white text-sm font-semibold mb-1">
                                {ad.template_id || 'Template'} - Variation {ad.variation || 'A'}
                              </p>
                              <p className="text-gray-400 text-xs line-clamp-2">{ad.prompt_used}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : error && adGenerationStatus === 'failed' ? (
                    <div className="text-center py-12 bg-red-900/20 rounded-xl border border-red-500/20 animate-fadeIn">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-red-400 text-xl font-semibold mb-2">
                        Échec de la génération
                      </h3>
                      <p className="text-red-300 text-sm max-w-md mx-auto mb-4">
                        {error}
                      </p>
                      <button
                        onClick={() => handleGenerateAds()}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Réessayer
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-4">
                        <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        Aucune annonce générée
                      </h3>
                      <p className="text-gray-400">
                        Un problème est survenu lors de la génération
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 border-t border-[#262626]">
                    <button
                      onClick={() => {
                        setAdGenerationStep(1);
                        localStorage.removeItem('adGenerationProduct');
                        setActiveTab('manual');
                      }}
                      className="flex-1 px-6 py-3 bg-[#0F0F0F] hover:bg-black border border-[#262626] text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Générer d&apos;autres annonces
                    </button>
                    <button
                      onClick={() => {
                        // Download all ads functionality
                        alert('Téléchargement de toutes les annonces...');
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Tout télécharger</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Chat Modal for Image Modification */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChat}
        imageData={selectedAdForChat}
      />
    </DashboardLayout>
  );
};

export default ProductIngestion;


