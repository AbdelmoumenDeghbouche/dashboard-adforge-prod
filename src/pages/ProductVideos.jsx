import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { videoPlaygroundAPI } from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductVideos = () => {
  // 🔥 FORCE RELOAD CHECK - If you see old timestamp, browser cache issue!
  console.log('🔥🔥🔥 ProductVideos.jsx loaded at:', new Date().toISOString());
  console.log('🔥 Code version: VIDEO_PREVIEW_v6 - Using video element for thumbnails');
  
  const { currentUser } = useAuth();
  const { brands, selectedBrand, setSelectedBrand, brandProducts } = useBrand();

  // State
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [view, setView] = useState('products'); // 'products' or 'videos'

  // Use direct Firebase Storage URLs (they're publicly accessible)
  const getProxyVideoUrl = (videoUrl) => {
    if (!videoUrl) return '';
    // Firebase Storage URLs are public, use them directly
    return videoUrl;
  };

  // Extract brand_id from video URL path (workaround for incorrect DB brand_id)
  const extractBrandFromUrl = (videoUrl) => {
    if (!videoUrl) return null;
    // URL format: .../stores/{brand_id}/products/...
    const match = videoUrl.match(/stores\/([^\/]+)\//);
    if (!match) return null;
    // Decode URL encoding (e.g., lockt%C3%A5ng -> locktång)
    try {
      return decodeURIComponent(match[1]);
    } catch (e) {
      return match[1];
    }
  };

  // Extract product_id from video URL path
  const extractProductFromUrl = (videoUrl) => {
    if (!videoUrl) return null;
    // URL format: .../products/{product_id}/videos/...
    const match = videoUrl.match(/products\/([^\/]+)\//);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetchVideos();
  }, [currentUser, selectedBrand]);

  const fetchVideos = async () => {
    if (!currentUser || !selectedBrand) {
      setLoading(false);
      setVideos([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch from both sources and merge
      const [playgroundResponse, jobsResponse] = await Promise.all([
        videoPlaygroundAPI.getAllVideos(100, 'all'),
        videoPlaygroundAPI.getVideosFromJobs(100)
      ]);

      // Combine videos from both sources
      const playgroundVideos = playgroundResponse.success ? (playgroundResponse.data.videos || []) : [];
      const jobVideos = jobsResponse.success ? (jobsResponse.data.videos || []) : [];
      
      // Merge and deduplicate by video_url
      const videoMap = new Map();
      [...playgroundVideos, ...jobVideos].forEach(v => {
        if (v.video_url && !videoMap.has(v.video_url)) {
          videoMap.set(v.video_url, v);
        }
      });
      
      const allVideos = Array.from(videoMap.values());
      const brandId = selectedBrand?.brandId || selectedBrand?.id;
      
      console.log('[ProductVideos] 📊 Video sources:', {
        playground: playgroundVideos.length,
        jobs: jobVideos.length,
        total: allVideos.length,
        selectedBrand: brandId
      });
      
      // Debug: Log all video URLs to see the actual structure
      console.log('[ProductVideos] 🔍 All video URLs:');
      allVideos.forEach((v, idx) => {
        console.log(`  ${idx + 1}. ${v.video_url}`);
        console.log(`     Extracted brand: ${extractBrandFromUrl(v.video_url)}`);
        console.log(`     Extracted product: ${extractProductFromUrl(v.video_url)}`);
        console.log(`     DB brand_id: ${v.brand_id}`);
        console.log(`     DB product_id: ${v.product_id}`);
      });
      
      // Filter videos for current selected brand using URL parsing (workaround for DB issue)
      const brandVideos = allVideos.filter(v => {
        if (!v.video_url) return false;
        
        // Extract brand from URL path
        const urlBrandId = extractBrandFromUrl(v.video_url);
        const urlProductId = extractProductFromUrl(v.video_url);
        
        console.log('[ProductVideos] 🔎 Checking video:', {
          url: v.video_url,
          urlBrandId,
          urlProductId,
          selectedBrandId: brandId,
          matches: urlBrandId === brandId && urlProductId
        });
        
        return urlBrandId === brandId && urlProductId;
      });
      
      console.log('[ProductVideos] 🔍 Total videos fetched:', allVideos.length);
      console.log('[ProductVideos] 🎯 Selected brand ID:', brandId);
      console.log('[ProductVideos] ✅ Videos for this brand (from URL):', brandVideos.length);
      if (brandVideos.length > 0) {
        console.log('[ProductVideos] 📹 First video:', {
          url: brandVideos[0].video_url,
          extracted_brand: extractBrandFromUrl(brandVideos[0].video_url),
          extracted_product: extractProductFromUrl(brandVideos[0].video_url),
          db_brand_id: brandVideos[0].brand_id,
          db_product_id: brandVideos[0].product_id
        });
      }
      
      setVideos(brandVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Get videos for selected product (using URL-based matching)
  const getProductVideos = () => {
    if (!selectedProduct) return [];
    const productId = selectedProduct.productId;
    
    return videos.filter(v => {
      const urlProductId = extractProductFromUrl(v.video_url);
      return urlProductId === productId;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // Get video count for a product (using URL-based matching)
  const getProductVideoCount = (productId) => {
    const matchingVideos = videos.filter(v => {
      const urlProductId = extractProductFromUrl(v.video_url);
      return urlProductId === productId;
    });
    
    if (matchingVideos.length > 0) {
      console.log('[ProductVideos] 📊 Product:', productId, '→', matchingVideos.length, 'videos');
    }
    
    return matchingVideos.length;
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setView('videos');
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setView('products');
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleDownload = async (videoUrl, videoId) => {
    try {
      const token = await currentUser?.getIdToken();
      if (!token) throw new Error('Authentication required');
      
      const proxyUrl = getProxyVideoUrl(videoUrl);
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_${videoId}_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download video: ${error.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {view === 'products' ? 'Product Videos' : `${selectedProduct?.productName || 'Product'} Videos`}
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {view === 'products' 
                  ? `${videos.length} total video${videos.length !== 1 ? 's' : ''} across all products`
                  : `${getProductVideos().length} video${getProductVideos().length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
          
          {view === 'videos' && (
            <button
              onClick={handleBackToProducts}
              className="px-4 py-2 bg-[#0F0F0F] border border-[#262626] hover:border-blue-500 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </button>
          )}
        </div>

        {/* Brand Selector */}
        {selectedBrand && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg border border-[#262626]">
            {selectedBrand.logoUrl && (
              <img src={selectedBrand.logoUrl} alt={selectedBrand.brandName} className="w-10 h-10 rounded-lg object-cover" />
            )}
            <div>
              <p className="text-white font-semibold">{selectedBrand.brandName}</p>
              <p className="text-gray-400 text-xs">Current Brand</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {!selectedBrand ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Brand Selected</h3>
          <p className="text-gray-400">
            Please select a brand from the sidebar to view product videos
          </p>
        </div>
      ) : view === 'products' ? (
        /* Products Grid */
        brandProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
            <p className="text-gray-400 mb-4">
              This brand doesn't have any products yet. Add products to start generating videos.
            </p>
            {videos.length > 0 && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-md mx-auto">
                <p className="text-blue-400 text-sm flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>You have videos in other brands. Try selecting a different brand from the sidebar.</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brandProducts.map((product) => {
              const videoCount = getProductVideoCount(product.productId);
              console.log('[ProductVideos] 🖼️ Product data:', {
                id: product.productId,
                name: product.productName,
                imageUrl: product.imageUrl,
                imageUrls: product.imageUrls,
                images: product.images,
                main_image_url: product.main_image_url,
                allKeys: Object.keys(product)
              });
              
              // Try multiple possible image field names
              const productImage = product.imageUrl || product.main_image_url || product.images?.[0] || product.imageUrls?.[0];
              
              return (
                <div
                  key={product.productId}
                  onClick={() => handleProductClick(product)}
                  className="bg-[#1A1A1A] border border-[#262626] rounded-xl overflow-hidden hover:border-blue-500 transition-all cursor-pointer group hover:scale-[1.02]"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-[#0F0F0F] relative overflow-hidden">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Video Count Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white text-sm font-semibold">{videoCount}</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">{product.productName}</h3>
                    {product.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{product.description}</p>
                    )}
                    {product.price && (
                      <p className="text-blue-400 font-bold text-lg">${product.price}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Videos Grid */
        getProductVideos().length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Videos Yet</h3>
            <p className="text-gray-400">
              No videos have been generated for this product. Start generating videos using Strategic Analysis!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getProductVideos().map((video) => {
              console.log('[ProductVideos] 🎬 Video data:', {
                id: video.job_id || video.id,
                thumbnail_url: video.thumbnail_url,
                video_url: video.video_url,
                allKeys: Object.keys(video)
              });
              
              return (
                <div
                  key={video.job_id || video.id}
                  className="bg-[#1A1A1A] border border-[#262626] rounded-xl overflow-hidden hover:border-blue-500 transition-all group"
                >
                {/* Video Thumbnail */}
                <div 
                  className="aspect-square bg-[#0F0F0F] relative cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : video.video_url ? (
                    <video
                      src={getProxyVideoUrl(video.video_url)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-green-400">
                    ✓ Generated
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {video.original_prompt || 'AI Generated Video'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(video.video_url, video.job_id || video.id);
                      }}
                      className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors"
                      title="Download video"
                    >
                      <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="bg-[#1A1A1A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#262626]">
              <h3 className="text-xl font-bold text-white">Video Preview</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="p-6">
              <video
                src={getProxyVideoUrl(selectedVideo.video_url)}
                controls
                autoPlay
                className="w-full rounded-lg"
                style={{ maxHeight: '70vh' }}
              />
              
              {selectedVideo.original_prompt && (
                <div className="mt-4 p-4 bg-[#0F0F0F] rounded-lg">
                  <p className="text-sm text-gray-400">Prompt:</p>
                  <p className="text-white mt-1">{selectedVideo.original_prompt}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVideos;

