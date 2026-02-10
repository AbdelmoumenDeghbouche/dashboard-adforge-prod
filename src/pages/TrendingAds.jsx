import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { adsAPI } from '../services/apiService';
import { useBrand } from '../contexts/BrandContext';

const TrendingAds = () => {
  const { selectedBrand, brandProducts, loadingProducts } = useBrand();
  
  // Helper function to safely get running duration in days
  const getRunningDurationDays = (duration) => {
    if (!duration) return 'N/A';
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'object' && duration.days !== undefined) return duration.days;
    return 'N/A';
  };

  // Helper function to handle image load errors
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent && !parent.querySelector('.placeholder-fallback')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder-fallback w-full h-full flex items-center justify-center bg-[#1A1A1A]';
      placeholder.innerHTML = `
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 text-sm">Image unavailable</p>
        </div>
      `;
      parent.appendChild(placeholder);
    }
  };
  
  // State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [minRunningDays, setMinRunningDays] = useState('');
  const [maxRunningDays, setMaxRunningDays] = useState('');
  const [language, setLanguage] = useState('English');
  const [order, setOrder] = useState('longest_running');
  const [limit, setLimit] = useState(20);
  const [nicheAds, setNicheAds] = useState([]);
  const [microNicheAds, setMicroNicheAds] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [nicheMetadata, setNicheMetadata] = useState(null);
  const [microNicheMetadata, setMicroNicheMetadata] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculate estimated CTR and ROI for individual ads based on available data
  const calculateAdMetrics = (ad) => {
    if (!ad) return { ctr: 0, roi: 0 };
    
    // Get running days as number (used for both CTR and ROI)
    const runningDays = getRunningDurationDays(ad.running_duration);
    let daysAsNumber = 0;
    
    if (typeof runningDays === 'number') {
      daysAsNumber = runningDays;
    } else if (runningDays !== 'N/A') {
      const parsed = parseInt(runningDays);
      daysAsNumber = isNaN(parsed) ? 0 : parsed;
    }
    
    // Fallback to default values if we still don't have valid days
    if (daysAsNumber === 0 || isNaN(daysAsNumber)) {
      // Use a default moderate value if we can't determine running days
      daysAsNumber = 15;
    }
    
    // CTR Calculation (range: 0.5% - 7.5%)
    let baseCTR = 1.2;
    
    // Running duration factor (longer = proven success, logarithmic scale)
    baseCTR += Math.log10(daysAsNumber + 1) * 0.7;
    
    // Format boost (VIDEO performs better)
    if (ad.display_format === 'VIDEO') baseCTR += 1.5;
    else if (ad.display_format === 'CAROUSEL') baseCTR += 0.8;
    else if (ad.display_format === 'IMAGE') baseCTR += 0.4;
    
    // Live status boost
    if (ad.live) baseCTR += 0.9;
    
    // Headline quality (length-based heuristic)
    if (ad.headline) {
      const headlineLength = ad.headline.length;
      if (headlineLength > 30 && headlineLength < 100) {
        baseCTR += 0.6;
      } else if (headlineLength >= 100) {
        baseCTR += 0.3; // Too long headlines perform worse
      }
    }
    
    // Platform diversity (more platforms = broader reach)
    if (ad.publisher_platform && ad.publisher_platform.length > 2) {
      baseCTR += 0.7;
    } else if (ad.publisher_platform && ad.publisher_platform.length > 1) {
      baseCTR += 0.4;
    }
    
    // CTA presence
    if (ad.cta_text || ad.cta_type) baseCTR += 0.5;
    
    // Add variance based on ad ID for realistic spread
    // Create a simple hash from the ad ID to generate consistent variance
    let ctrVariance = 0;
    if (ad.id) {
      const idString = ad.id.toString();
      let hash = 0;
      for (let i = 0; i < idString.length; i++) {
        hash = ((hash << 5) - hash) + idString.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      ctrVariance = (Math.abs(hash) % 150) / 100 - 0.75; // Range: -0.75 to +0.75
    }
    baseCTR += ctrVariance;
    
    const estimatedCTR = Math.max(0.5, Math.min(7.5, baseCTR));
    
    // ROI Calculation (range: 80% - 450%)
    // Based on industry benchmarks: Avg 200%, Good 350%, Excellent 400%+
    // Running duration is THE KEY indicator of ad success
    // Short duration = ad failed and was stopped (bad ROI)
    // Long duration = ad is profitable and keeps running (good ROI)
    let baseROI = 100; // Default for unknown/invalid duration
    
    // Use daysAsNumber already calculated above
    if (!isNaN(daysAsNumber) && daysAsNumber > 0) {
      if (daysAsNumber >= 90) {
        baseROI = 380; // 90+ days = exceptional performer (only winners run this long)
      } else if (daysAsNumber >= 60) {
        baseROI = 320; // 60-89 days = excellent ROI (proven success)
      } else if (daysAsNumber >= 45) {
        baseROI = 270; // 45-59 days = very good ROI
      } else if (daysAsNumber >= 30) {
        baseROI = 220; // 30-44 days = good ROI (industry avg+)
      } else if (daysAsNumber >= 20) {
        baseROI = 180; // 20-29 days = decent ROI (around industry avg)
      } else if (daysAsNumber >= 14) {
        baseROI = 150; // 14-19 days = okay ROI (breaking even or slight profit)
      } else if (daysAsNumber >= 7) {
        baseROI = 120; // 7-13 days = marginal ROI (testing phase)
      } else if (daysAsNumber >= 3) {
        baseROI = 95; // 3-6 days = poor ROI (likely to be stopped soon)
      } else {
        baseROI = 75; // 1-2 days = bad ROI (probably failing)
      }
    }
    
    // Additional factors (minor boosts/penalties)
    
    // Live status (still running = confident in ROI)
    if (ad.live) baseROI += 25;
    
    // Format (VIDEO typically performs better)
    if (ad.display_format === 'VIDEO') baseROI += 15;
    else if (ad.display_format === 'CAROUSEL') baseROI += 8;
    
    // Description quality (detailed ads convert better)
    if (ad.description && ad.description.length > 100) {
      baseROI += 12;
    } else if (ad.description && ad.description.length > 50) {
      baseROI += 6;
    }
    
    // Multiple platforms indicate successful scaling
    if (ad.publisher_platform && ad.publisher_platform.length >= 3) {
      baseROI += 18;
    } else if (ad.publisher_platform && ad.publisher_platform.length === 2) {
      baseROI += 8;
    }
    
    // CTA quality
    if (ad.cta_text || ad.cta_type) baseROI += 7;
    
    // Add realistic variance based on ad ID (consistent hash-based approach)
    let roiVariance = 0;
    if (ad.id) {
      const idString = ad.id.toString();
      let hash = 0;
      for (let i = 0; i < idString.length; i++) {
        hash = ((hash << 5) - hash) + idString.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      roiVariance = (Math.abs(hash) % 20) - 10; // Range: -10 to +10
    }
    baseROI += roiVariance;
    
    const estimatedROI = Math.max(80, Math.min(450, baseROI));
    
    return {
      ctr: estimatedCTR.toFixed(2),
      roi: estimatedROI.toFixed(0)
    };
  };

  // Reset data when brand changes
  useEffect(() => {
    console.log('[TrendingAds] Brand changed, resetting data...');
    setSelectedProduct(null);
    setNicheAds([]);
    setMicroNicheAds([]);
    setNicheMetadata(null);
    setMicroNicheMetadata(null);
    setSelectedAd(null);
    setIsModalOpen(false);
    setError('');
  }, [selectedBrand?.brandId]);

  // Handler for fetching trending ads
  const handleGetTrendingAds = async () => {
    if (!selectedBrand) {
      setError('Please select a brand from the sidebar');
      return;
    }
    
    if (!selectedProduct) {
      setError('Please select a product to analyze trending ads');
      return;
    }
    
    if (!selectedBrand.brandNiche) {
      setError('Brand niche not configured. Please update brand settings.');
      return;
    }
    
    setIsFetching(true);
    setError('');
    setNicheAds([]);
    setMicroNicheAds([]);
    setNicheMetadata(null);
    setMicroNicheMetadata(null);
    
    const minDays = minRunningDays ? parseInt(minRunningDays) : null;
    const maxDays = maxRunningDays ? parseInt(maxRunningDays) : null;
    
    try {
      const promises = [];
      
      // Fetch ads for product (Gemini generates 5 query variations from product data + image)
      console.log('[Trending Ads] Fetching ads for product:', selectedProduct.productName, 'ID:', selectedProduct.productId || selectedProduct.id);
      promises.push(
        adsAPI.getSimilarTrendingAds(
          null, // query - Backend will generate 5 variations
          language,
          minDays,
          maxDays,
          order,
          20, // limit per query (5 queries x 20 = up to 100 ads)
          'video',
          selectedProduct.productId || selectedProduct.id, // Product ID
          selectedBrand.brandId || selectedBrand.id // Brand ID
        ).then(response => ({ type: 'niche', response }))
      );
      
      // Fetch ads for brand niche (Gemini generates 5 query variations from brand data)
      console.log('[Trending Ads] Fetching ads for brand niche:', selectedBrand.brandName, 'ID:', selectedBrand.brandId || selectedBrand.id);
      promises.push(
        adsAPI.getSimilarTrendingAds(
          null, // query - Backend will generate 5 variations
          language,
          minDays,
          maxDays,
          order,
          20, // limit per query (5 queries x 20 = up to 100 ads)
          'video',
          null, // No product ID (use brand niche instead)
          selectedBrand.brandId || selectedBrand.id // Brand ID
        ).then(response => ({ type: 'microNiche', response }))
      );
      
      if (promises.length === 0) {
        setError('No niche or micro niche configured for this brand');
        setIsFetching(false);
        return;
      }
      
      // Wait for all promises to resolve
      const results = await Promise.allSettled(promises);
      
      console.log('[Trending Ads] API Responses:', results);
      
      let hasData = false;
      
      // Process results
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { type, response } = result.value;
          
          if (response && (response.data || response.metadata?.success)) {
            hasData = true;
            
            if (type === 'niche') {
              setNicheAds(response.data || []);
              setNicheMetadata({
                success_criteria: response.success_criteria,
                metadata: response.metadata,
                credits_used: response.credits_used,
                credits_remaining: response.credits_remaining,
              });
            } else if (type === 'microNiche') {
              setMicroNicheAds(response.data || []);
              setMicroNicheMetadata({
                success_criteria: response.success_criteria,
                metadata: response.metadata,
                credits_used: response.credits_used,
                credits_remaining: response.credits_remaining,
              });
            }
          }
        } else {
          console.error('[Trending Ads] Promise rejected:', result.reason);
        }
      });
      
      if (!hasData) {
        setError('No trending ads found for your search criteria');
      }
    } catch (error) {
      console.error('[Trending Ads] Error:', error);
      setError(error.message || 'An error occurred while fetching trending ads');
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-fetch when brand changes (initial load only)
  useEffect(() => {
    if (selectedBrand && (selectedBrand.brandNiche || selectedBrand.brandMicroNiche)) {
      // Only fetch if we don't have any results yet
      if (nicheAds.length === 0 && microNicheAds.length === 0) {
        handleGetTrendingAds();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand?.brandId]);

  // Handler for opening ad details modal
  const handleAdClick = (ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  // Handler for closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  return (
    <DashboardLayout>
      <div className="p-2 xxs:p-4 sm:p-5 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full font-poppins">
        {/* Header Section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h1 className="text-white text-2xl sm:text-3xl font-bold">
              Trending Ads
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Discover trending ads by brand or niche to inspire your campaigns
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 xxs:p-8 sm:p-10 border border-[#262626] animate-fade-in">
          {/* Current Brand Display */}
          {selectedBrand && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                {selectedBrand.logoUrl && (
                  <img src={selectedBrand.logoUrl} alt={selectedBrand.brandName} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">{selectedBrand.brandName}</h3>
                  <div className="space-y-0.5">
                    {selectedBrand.brandNiche ? (
                      <p className="text-xs text-blue-300">
                        Niche: <span className="font-semibold">{selectedBrand.brandNiche}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-yellow-400">⚠️ Brand niche not configured</p>
                    )}
                    {selectedBrand.brandMicroNiche && (
                      <p className="text-xs text-cyan-300">
                        Micro Niche: <span className="font-semibold">{selectedBrand.brandMicroNiche}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedBrand && (
            <div className="mb-6 p-8 bg-gray-800/30 border border-gray-700/50 rounded-lg text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-white text-lg font-semibold mb-2">No Brand Selected</h3>
              <p className="text-gray-400">Please select a brand from the sidebar to view trending ads</p>
            </div>
          )}

          {/* Product Selection */}
          {selectedBrand && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Product</label>
              {loadingProducts ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg">
                  <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-400">Loading products...</span>
                </div>
              ) : brandProducts.length === 0 ? (
                <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                  No products found. Please add products to this brand first.
                </div>
              ) : (
                <select
                  value={selectedProduct?.productId || ''}
                  onChange={(e) => {
                    const product = brandProducts.find(p => p.productId === e.target.value);
                    setSelectedProduct(product);
                  }}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">Choose a product...</option>
                  {brandProducts.map(product => (
                    <option key={product.productId} value={product.productId}>
                      {product.productName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Language Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Portuguese">Portuguese</option>
            </select>
          </div>

          {/* Order Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="longest_running">Longest Running</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Running Days Filters (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Running Days (Optional)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Min Days</label>
                <input
                  type="number"
                  value={minRunningDays}
                  onChange={(e) => setMinRunningDays(e.target.value)}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Max Days</label>
                <input
                  type="number"
                  value={maxRunningDays}
                  onChange={(e) => setMaxRunningDays(e.target.value)}
                  placeholder="e.g., 90"
                  className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Leave empty to use backend defaults</p>
          </div>

          {/* Results Limit */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Results Limit</label>
            <input
              type="number"
              min="10"
              max="250"
              value={limit}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 10 && value <= 250) {
                  setLimit(value);
                } else if (e.target.value === '') {
                  setLimit(20);
                }
              }}
              placeholder="20"
              className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">Number of ads to fetch per niche (10-250, default: 20)</p>
          </div>

          {/* Fetch Button */}
          <button
            onClick={handleGetTrendingAds}
            disabled={isFetching || !selectedBrand || !selectedProduct || !selectedBrand.brandNiche}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
          >
            {isFetching ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-center">
                  <span className="block">Analyzing & Fetching Ads...</span>
                  <span className="text-xs text-cyan-200 mt-1 block">This may take up to 2-3 minutes</span>
                </div>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Fetch Trending Ads</span>
              </>
            )}
          </button>

          {/* Loading Status Message */}
          {isFetching && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="animate-pulse w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-blue-400 text-sm font-semibold mb-1">Processing Your Request</p>
                  <p className="text-blue-300/80 text-xs">
                    🤖 AI is generating optimal search queries for your product and brand niche...
                  </p>
                  <p className="text-blue-300/60 text-xs mt-2">
                    ⏱️ This process involves: Analyzing product data → Generating 5 query variations → Fetching trending ads for each query → Combining and deduplicating results
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}


          {/* Product Results Section */}
          {nicheAds.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedProduct?.productName} <span className="text-gray-400 text-lg font-normal">(Product Ads)</span>
                </h2>
              </div>

              {/* Metadata */}
              {nicheMetadata && (
                <div className="mb-6 p-6 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Search Criteria</p>
                      <p className="text-white font-semibold">{selectedProduct?.productName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Sample Count</p>
                      <p className="text-white font-semibold">{nicheMetadata.success_criteria?.sample_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Avg Running Duration</p>
                      <p className="text-white font-semibold">{nicheMetadata.success_criteria?.avg_running_duration_days?.toFixed(1) || 0} days</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#262626] flex justify-between items-center text-sm">
                    <p className="text-gray-400">Credits Used: <span className="text-cyan-400 font-semibold">{nicheMetadata.credits_used || 0}</span></p>
                    <p className="text-gray-400">Credits Remaining: <span className="text-green-400 font-semibold">{nicheMetadata.credits_remaining || 0}</span></p>
                  </div>
                </div>
              )}

              {/* Recommended Parameters for Best Reach */}
              {nicheMetadata?.success_criteria && (
                <div className="mb-8 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Recommended Parameters for Best Reach</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Formats */}
                    {nicheMetadata.success_criteria.most_common_format && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-300 mb-3">📱 Best Ad Format</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                            {nicheMetadata.success_criteria.most_common_format}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Top CTAs */}
                    {nicheMetadata.success_criteria.top_cta_types && nicheMetadata.success_criteria.top_cta_types.length > 0 && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-300 mb-3">🎯 Top Call-to-Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {nicheMetadata.success_criteria.top_cta_types.slice(0, 3).map((cta, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                              {cta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Emotional Drivers */}
                    {nicheMetadata.success_criteria.top_emotional_drivers && nicheMetadata.success_criteria.top_emotional_drivers.length > 0 && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-pink-300 mb-3">💫 Top Emotional Drivers</h4>
                        <div className="flex flex-wrap gap-2">
                          {nicheMetadata.success_criteria.top_emotional_drivers.slice(0, 5).map((driver, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-pink-500/20 text-pink-300 rounded-full text-xs font-medium capitalize">
                              {driver}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Market Target */}
                    {nicheMetadata.success_criteria.market_target_distribution && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-300 mb-3">🎪 Market Target</h4>
                        <div className="space-y-2">
                          {Object.entries(nicheMetadata.success_criteria.market_target_distribution).map(([target, count]) => (
                            <div key={target} className="flex items-center justify-between">
                              <span className="text-gray-300 text-sm uppercase">{target}</span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold">
                                {count} ads
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Successful Headlines */}
                  {nicheMetadata.success_criteria.successful_headlines && nicheMetadata.success_criteria.successful_headlines.length > 0 && (
                    <div className="mt-6 bg-black/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-cyan-300 mb-3">✨ Successful Headlines (Top {nicheMetadata.success_criteria.successful_headlines.length})</h4>
                      <div className="space-y-2">
                        {nicheMetadata.success_criteria.successful_headlines.slice(0, 5).map((headline, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-cyan-400 font-bold mt-0.5">{idx + 1}.</span>
                            <p className="text-gray-300 flex-1">{headline}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Successful Descriptions */}
                  {nicheMetadata.success_criteria.successful_descriptions && nicheMetadata.success_criteria.successful_descriptions.length > 0 && (
                    <div className="mt-4 bg-black/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-yellow-300 mb-3">📝 Successful Descriptions (Top {nicheMetadata.success_criteria.successful_descriptions.length})</h4>
                      <div className="space-y-2">
                        {nicheMetadata.success_criteria.successful_descriptions.slice(0, 5).map((desc, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-yellow-400 font-bold mt-0.5">{idx + 1}.</span>
                            <p className="text-gray-300 flex-1">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Running Duration Insight */}
                  <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-indigo-300 mb-1">💡 Running Duration Insight</h4>
                        <p className="text-sm text-gray-300">
                          Ads in this niche typically run for <span className="text-white font-semibold">{nicheMetadata.success_criteria.min_running_duration} - {nicheMetadata.success_criteria.max_running_duration} days</span>, with an average of <span className="text-white font-semibold">{nicheMetadata.success_criteria.avg_running_duration_days?.toFixed(0)} days</span>. Consider running your campaign for a similar duration for optimal results.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ads Grid */}
              <h3 className="text-xl font-bold text-white mb-6">Results ({nicheAds.length})</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {nicheAds.map((ad) => (
                  <div 
                    key={ad.id} 
                    onClick={() => handleAdClick(ad)}
                    className="bg-[#0F0F0F] rounded-lg border border-[#262626] overflow-hidden hover:border-blue-500/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] group"
                  >
                    {/* Ad Thumbnail */}
                    <div className="relative aspect-square overflow-hidden bg-[#1A1A1A]">
                      {(ad.thumbnail || ad.avatar || ad.image) ? (
                        <>
                          {ad.display_format === 'VIDEO' || ad.video ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={ad.thumbnail || ad.avatar || ad.image} 
                                alt={ad.headline || ad.description || 'Ad thumbnail'}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={ad.thumbnail || ad.avatar || ad.image} 
                              alt={ad.headline || ad.description || 'Ad thumbnail'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={handleImageError}
                              loading="lazy"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-sm">No image available</p>
                          </div>
                        </div>
                      )}
                      {/* Facebook View Button */}
                      {ad.publisher_platform && ad.publisher_platform.some(p => p.toLowerCase().includes('facebook')) && ad.ad_id && (
                        <a
                          href={`https://www.facebook.com/ads/library/?id=${ad.ad_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center gap-1 transition-colors backdrop-blur-sm z-10"
                          title="View in Facebook Ads Library"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          View
                        </a>
                      )}
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        ad.live ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
                      }`}>
                        {ad.live ? '🟢 Live' : '🔴 Not Live'}
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Ad Header */}
                      <div className="mb-3">
                        <h4 className="text-white font-semibold text-base mb-1 line-clamp-1">
                          {ad.brand_name || ad.name || 'Unknown Brand'}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {ad.headline || ad.description?.substring(0, 100) || 'No description'}
                        </p>
                      </div>

                      {/* Quick Info */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="capitalize">{ad.display_format}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{getRunningDurationDays(ad.running_duration)} days</span>
                        </div>
                      </div>

                      {/* Platforms */}
                      {ad.publisher_platform && ad.publisher_platform.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ad.publisher_platform.slice(0, 3).map((platform) => (
                            <span key={platform} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium capitalize">
                              {platform}
                            </span>
                          ))}
                          {ad.publisher_platform.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                              +{ad.publisher_platform.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                          <p className="text-[10px] text-cyan-400/80 mb-0.5">Est. CTR</p>
                          <p className="text-lg font-bold text-cyan-400">{calculateAdMetrics(ad).ctr}%</p>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                          <p className="text-[10px] text-green-400/80 mb-0.5">Est. ROI</p>
                          <p className="text-lg font-bold text-green-400">{calculateAdMetrics(ad).roi}%</p>
                        </div>
                      </div>

                      {/* Click to view hint */}
                      <div className="pt-3 border-t border-[#262626] text-center">
                        <p className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                          Click to view full details →
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Niche Results Section */}
          {microNicheAds.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedBrand?.brandNiche} <span className="text-gray-400 text-lg font-normal">(Brand Niche)</span>
                </h2>
              </div>

              {/* Metadata */}
              {microNicheMetadata && (
                <div className="mb-6 p-6 bg-[#0F0F0F] rounded-lg border border-[#262626]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Search Criteria</p>
                      <p className="text-white font-semibold">{selectedBrand?.brandMicroNiche || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Sample Count</p>
                      <p className="text-white font-semibold">{microNicheMetadata.success_criteria?.sample_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Avg Running Duration</p>
                      <p className="text-white font-semibold">{microNicheMetadata.success_criteria?.avg_running_duration_days?.toFixed(1) || 0} days</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#262626] flex justify-between items-center text-sm">
                    <p className="text-gray-400">Credits Used: <span className="text-cyan-400 font-semibold">{microNicheMetadata.credits_used || 0}</span></p>
                    <p className="text-gray-400">Credits Remaining: <span className="text-green-400 font-semibold">{microNicheMetadata.credits_remaining || 0}</span></p>
                  </div>
                </div>
              )}

              {/* Recommended Parameters for Best Reach */}
              {microNicheMetadata?.success_criteria && (
                <div className="mb-8 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Recommended Parameters for Best Reach</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Formats */}
                    {microNicheMetadata.success_criteria.most_common_format && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-300 mb-3">📱 Best Ad Format</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                            {microNicheMetadata.success_criteria.most_common_format}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Top CTAs */}
                    {microNicheMetadata.success_criteria.top_cta_types && microNicheMetadata.success_criteria.top_cta_types.length > 0 && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-300 mb-3">🎯 Top Call-to-Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {microNicheMetadata.success_criteria.top_cta_types.slice(0, 3).map((cta, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                              {cta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Emotional Drivers */}
                    {microNicheMetadata.success_criteria.top_emotional_drivers && microNicheMetadata.success_criteria.top_emotional_drivers.length > 0 && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-pink-300 mb-3">💫 Top Emotional Drivers</h4>
                        <div className="flex flex-wrap gap-2">
                          {microNicheMetadata.success_criteria.top_emotional_drivers.slice(0, 5).map((driver, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-pink-500/20 text-pink-300 rounded-full text-xs font-medium capitalize">
                              {driver}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Market Target */}
                    {microNicheMetadata.success_criteria.market_target_distribution && (
                      <div className="bg-black/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-300 mb-3">🎪 Market Target</h4>
                        <div className="space-y-2">
                          {Object.entries(microNicheMetadata.success_criteria.market_target_distribution).map(([target, count]) => (
                            <div key={target} className="flex items-center justify-between">
                              <span className="text-gray-300 text-sm uppercase">{target}</span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold">
                                {count} ads
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Successful Headlines */}
                  {microNicheMetadata.success_criteria.successful_headlines && microNicheMetadata.success_criteria.successful_headlines.length > 0 && (
                    <div className="mt-6 bg-black/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-cyan-300 mb-3">✨ Successful Headlines (Top {microNicheMetadata.success_criteria.successful_headlines.length})</h4>
                      <div className="space-y-2">
                        {microNicheMetadata.success_criteria.successful_headlines.slice(0, 5).map((headline, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-cyan-400 font-bold mt-0.5">{idx + 1}.</span>
                            <p className="text-gray-300 flex-1">{headline}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Successful Descriptions */}
                  {microNicheMetadata.success_criteria.successful_descriptions && microNicheMetadata.success_criteria.successful_descriptions.length > 0 && (
                    <div className="mt-4 bg-black/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-yellow-300 mb-3">📝 Successful Descriptions (Top {microNicheMetadata.success_criteria.successful_descriptions.length})</h4>
                      <div className="space-y-2">
                        {microNicheMetadata.success_criteria.successful_descriptions.slice(0, 5).map((desc, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-yellow-400 font-bold mt-0.5">{idx + 1}.</span>
                            <p className="text-gray-300 flex-1">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Running Duration Insight */}
                  <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-indigo-300 mb-1">💡 Running Duration Insight</h4>
                        <p className="text-sm text-gray-300">
                          Ads in this micro niche typically run for <span className="text-white font-semibold">{microNicheMetadata.success_criteria.min_running_duration} - {microNicheMetadata.success_criteria.max_running_duration} days</span>, with an average of <span className="text-white font-semibold">{microNicheMetadata.success_criteria.avg_running_duration_days?.toFixed(0)} days</span>. Consider running your campaign for a similar duration for optimal results.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ads Grid */}
              <h3 className="text-xl font-bold text-white mb-6">Results ({microNicheAds.length})</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {microNicheAds.map((ad) => (
                  <div 
                    key={ad.id} 
                    onClick={() => handleAdClick(ad)}
                    className="bg-[#0F0F0F] rounded-lg border border-[#262626] overflow-hidden hover:border-purple-500/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] group"
                  >
                    {/* Ad Thumbnail */}
                    <div className="relative aspect-square overflow-hidden bg-[#1A1A1A]">
                      {(ad.thumbnail || ad.avatar || ad.image) ? (
                        <>
                          {ad.display_format === 'VIDEO' || ad.video ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={ad.thumbnail || ad.avatar || ad.image} 
                                alt={ad.headline || ad.description || 'Ad thumbnail'}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={ad.thumbnail || ad.avatar || ad.image} 
                              alt={ad.headline || ad.description || 'Ad thumbnail'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={handleImageError}
                              loading="lazy"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-500 text-sm">No image available</p>
                          </div>
                        </div>
                      )}
                      {/* Facebook View Button */}
                      {ad.publisher_platform && ad.publisher_platform.some(p => p.toLowerCase().includes('facebook')) && ad.ad_id && (
                        <a
                          href={`https://www.facebook.com/ads/library/?id=${ad.ad_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center gap-1 transition-colors backdrop-blur-sm z-10"
                          title="View in Facebook Ads Library"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          View
                        </a>
                      )}
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        ad.live ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
                      }`}>
                        {ad.live ? '🟢 Live' : '🔴 Not Live'}
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Ad Header */}
                      <div className="mb-3">
                        <h4 className="text-white font-semibold text-base mb-1 line-clamp-1">
                          {ad.brand_name || ad.name || 'Unknown Brand'}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {ad.headline || ad.description?.substring(0, 100) || 'No description'}
                        </p>
                      </div>

                      {/* Quick Info */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="capitalize">{ad.display_format}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{getRunningDurationDays(ad.running_duration)} days</span>
                        </div>
                      </div>

                      {/* Platforms */}
                      {ad.publisher_platform && ad.publisher_platform.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ad.publisher_platform.slice(0, 3).map((platform) => (
                            <span key={platform} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium capitalize">
                              {platform}
                            </span>
                          ))}
                          {ad.publisher_platform.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                              +{ad.publisher_platform.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                          <p className="text-[10px] text-cyan-400/80 mb-0.5">Est. CTR</p>
                          <p className="text-lg font-bold text-cyan-400">{calculateAdMetrics(ad).ctr}%</p>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                          <p className="text-[10px] text-green-400/80 mb-0.5">Est. ROI</p>
                          <p className="text-lg font-bold text-green-400">{calculateAdMetrics(ad).roi}%</p>
                        </div>
                      </div>

                      {/* Click to view hint */}
                      <div className="pt-3 border-t border-[#262626] text-center">
                        <p className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors">
                          Click to view full details →
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ad Details Modal */}
      {isModalOpen && selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={handleCloseModal}>
          <div 
            className="bg-[#1A1A1A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#262626]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#262626] p-6 flex items-center justify-between z-10">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedAd.brand_name || selectedAd.name || 'Unknown Brand'}</h2>
                {(selectedAd.headline || selectedAd.description) && (
                  <p className="text-gray-400 line-clamp-2">{selectedAd.headline || selectedAd.description?.substring(0, 150)}</p>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-4 flex-shrink-0"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Not Live Warning Banner */}
            {!selectedAd.live && (
              <div className="bg-red-500/10 border-l-4 border-red-500 px-6 py-4 mx-6 mt-4 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-400 font-semibold text-sm">This ad is not currently live</p>
                    <p className="text-red-400/70 text-xs mt-1">This ad has ended and is no longer running on the advertising platform. However, it can still provide valuable insights for your campaign strategy.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6">
              {/* Media Section */}
              <div className="mb-6 bg-[#1A1A1A] rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                {(selectedAd.display_format === 'VIDEO' && selectedAd.video) ? (
                  <video
                    src={selectedAd.video}
                    controls
                    autoPlay
                    className="w-full rounded-lg max-h-[500px]"
                    poster={selectedAd.thumbnail || selectedAd.avatar || selectedAd.image}
                    onError={() => {
                      console.error('Video failed to load:', selectedAd.video);
                    }}
                  >
                    <source src={selectedAd.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (selectedAd.thumbnail || selectedAd.avatar || selectedAd.image) ? (
                  <img
                    src={selectedAd.thumbnail || selectedAd.avatar || selectedAd.image}
                    alt={selectedAd.headline || selectedAd.description || 'Ad image'}
                    className="w-full rounded-lg"
                    onError={handleImageError}
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center p-12">
                    <svg className="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400">No media available for this ad</p>
                  </div>
                )}
              </div>

              {/* Facebook Ads Library Button */}
              {selectedAd.publisher_platform && selectedAd.publisher_platform.some(p => p.toLowerCase().includes('facebook')) && selectedAd.ad_id && (
                <div className="mb-6">
                  <a
                    href={`https://www.facebook.com/ads/library/?id=${selectedAd.ad_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>View in Facebook Ads Library</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Ad Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Format</p>
                  <p className="text-white font-semibold capitalize">{selectedAd.display_format}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Status</p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAd.live ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedAd.live ? '🟢 Live' : '🔴 Not Live'}
                  </div>
                  {!selectedAd.live && (
                    <p className="text-red-400/80 text-xs mt-2 italic">
                      ⚠️ This ad is no longer running
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Running Duration</p>
                  <p className="text-white font-semibold">{getRunningDurationDays(selectedAd.running_duration)} days</p>
                </div>
                {(selectedAd.cta_text || selectedAd.cta_type) && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Call to Action</p>
                    <p className="text-white font-semibold">{selectedAd.cta_text || selectedAd.cta_type}</p>
                  </div>
                )}
                {selectedAd.video_duration && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Video Duration</p>
                    <p className="text-white font-semibold">{selectedAd.video_duration.toFixed(1)}s</p>
                  </div>
                )}
                {selectedAd.product_category && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Product Category</p>
                    <p className="text-white font-semibold">{selectedAd.product_category}</p>
                  </div>
                )}
              </div>

              {/* Link URL */}
              {selectedAd.link_url && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Landing Page</p>
                  <a
                    href={selectedAd.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                  >
                    {selectedAd.link_url}
                  </a>
                </div>
              )}

              {/* Description */}
              {selectedAd.description && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Description</p>
                  <p className="text-white">{selectedAd.description}</p>
                </div>
              )}

              {/* Platforms */}
              {selectedAd.publisher_platform && selectedAd.publisher_platform.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAd.publisher_platform.map((platform) => (
                      <span key={platform} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium capitalize">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reach Estimate */}
              {selectedAd.reach_estimate && (
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Expected Reach</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedAd.reach_estimate.confidence_level === 'high' 
                        ? 'bg-green-500/20 text-green-400' 
                        : selectedAd.reach_estimate.confidence_level === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedAd.reach_estimate.confidence_level} confidence
                    </span>
                  </div>
                  <div className="flex justify-around items-center mb-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">Min Reach</p>
                      <p className="text-white font-bold text-2xl">{(selectedAd.reach_estimate.estimated_reach_min / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="text-gray-600 text-2xl">—</div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">Max Reach</p>
                      <p className="text-white font-bold text-2xl">{(selectedAd.reach_estimate.estimated_reach_max / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  
                  {/* Factors */}
                  {selectedAd.reach_estimate.factors && (
                    <div className="pt-4 border-t border-purple-500/20">
                      <p className="text-gray-400 text-sm mb-3">Contributing Factors</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between p-2 bg-black/30 rounded">
                          <span className="text-gray-400">Running Days:</span>
                          <span className="text-white font-medium">{getRunningDurationDays(selectedAd.reach_estimate.factors.running_days)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-black/30 rounded">
                          <span className="text-gray-400">Format:</span>
                          <span className="text-white font-medium capitalize">{selectedAd.reach_estimate.factors.format}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-black/30 rounded">
                          <span className="text-gray-400">Is Live:</span>
                          <span className="text-white font-medium">{selectedAd.reach_estimate.factors.is_live ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-black/30 rounded">
                          <span className="text-gray-400">Emotional Drivers:</span>
                          <span className="text-white font-medium">{selectedAd.reach_estimate.factors.emotional_drivers_count}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TrendingAds;

