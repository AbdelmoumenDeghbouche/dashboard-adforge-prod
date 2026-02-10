import React, { useState, useEffect } from 'react';
import { adsAPI } from '../../services/apiService';
import { getFirebaseImageUrl, downloadFirebaseImage } from '../../utils/storageHelpers';
import { formatDate } from '../../utils/dateHelpers';

/**
 * Product Details Modal
 * 
 * Shows product information and all generated ads for that product
 * 
 * @param {Object} product - Product object
 * @param {Object} brand - Brand object
 * @param {Function} onClose - Close modal callback
 * @param {Function} onGenerateAds - Generate ads callback (optional)
 */
const ProductDetailsModal = ({ product, brand, onClose, onGenerateAds }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (product && brand) {
      fetchProductAds();
    }
  }, [product?.productId, brand?.brandId]);

  const fetchProductAds = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[ProductDetailsModal] Fetching ads for product:', product.productId);
      const result = await adsAPI.getProductAds(brand.brandId, product.productId);

      if (result.success) {
        console.log('[ProductDetailsModal] Loaded ads:', result.data.ads.length);
        setAds(result.data.ads || []);
      } else {
        setError(result.message || 'Failed to load ads');
      }
    } catch (err) {
      console.error('[ProductDetailsModal] Error fetching ads:', err);
      setError('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (ad) => {
    setDownloading(ad.conversationId);
    try {
      const filename = `${brand.brandName}_${product.productName}_${ad.metadata?.template_id || 'ad'}.png`.replace(/[^a-zA-Z0-9_.-]/g, '_');
      await downloadFirebaseImage(ad.currentImageUrl, filename);
    } catch (error) {
      console.error('Error downloading ad:', error);
      alert('Failed to download image');
    } finally {
      setDownloading(null);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!product || !brand) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1A1A1A] rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{product.productName}</h2>
            <p className="text-gray-400 text-sm">
              {brand.brandName} • {product.productId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Images */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Product Images</h4>
                <div className="grid grid-cols-2 gap-3">
                  {product.images && product.images.length > 0 ? (
                    product.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={img}
                          alt={`${product.productName} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No images</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Information</h4>
                <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
                  {product.description && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-300">{product.description}</p>
                    </div>
                  )}
                  {product.price && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <p className="text-sm text-white font-semibold">
                        {product.currency || '$'}{product.price}
                      </p>
                    </div>
                  )}
                  {product.productUrl && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Product URL</p>
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300 break-all"
                      >
                        {product.productUrl}
                      </a>
                    </div>
                  )}
                  {product.scrapedAt && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Scraped</p>
                      <p className="text-sm text-gray-300">
                        {formatDate ? formatDate(product.scrapedAt) : new Date(product.scrapedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Ads Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Generated Ads {ads.length > 0 && `(${ads.length})`}
              </h3>
              {onGenerateAds && (
                <button
                  onClick={() => onGenerateAds(product)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Generate More Ads
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchProductAds}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-800">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 mb-2">No ads generated for this product yet</p>
                <p className="text-gray-500 text-sm">Generate ads to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ads.map((ad) => (
                  <div
                    key={ad.conversationId}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer group"
                    onClick={() => setSelectedAd(ad)}
                  >
                    {/* Ad Image */}
                    <div className="aspect-square relative bg-gray-900">
                      <img
                        src={getFirebaseImageUrl(ad.currentImageUrl)}
                        alt={`Ad ${ad.conversationId}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />

                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="px-4 py-2 bg-white text-black rounded-lg font-medium">
                          View Details
                        </button>
                      </div>

                      {/* Template Badge */}
                      {ad.metadata?.template_id && (
                        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
                          {ad.metadata.template_id.replace('_', ' ')}
                          {ad.metadata.variation && ` - ${ad.metadata.variation}`}
                        </div>
                      )}

                      {/* AI Selected Badge */}
                      {ad.metadata?.selected_by_ai && (
                        <div className="absolute top-2 left-2 bg-green-600/90 px-2 py-1 rounded text-xs text-white backdrop-blur-sm flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          AI Pick
                        </div>
                      )}
                    </div>

                    {/* Ad Info */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">
                          {formatDate ? formatDate(ad.createdAt) : new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                        {ad.metadata?.aspect_ratio && (
                          <span className="text-xs text-purple-400 font-medium">
                            {ad.metadata.aspect_ratio}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(ad);
                          }}
                          disabled={downloading === ad.conversationId}
                          className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded text-sm transition-colors flex items-center justify-center"
                        >
                          {downloading === ad.conversationId ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ad Detail View Modal (nested) */}
      {selectedAd && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-[#1A1A1A] rounded-2xl max-w-4xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ad Details</h3>
                <p className="text-gray-400 text-sm">{selectedAd.conversationId}</p>
              </div>
              <button
                onClick={() => setSelectedAd(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={getFirebaseImageUrl(selectedAd.currentImageUrl)}
                  alt="Ad"
                  className="w-full h-auto"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Template</p>
                  <p className="text-white">
                    {selectedAd.metadata?.template_id?.replace('_', ' ') || 'N/A'}
                    {selectedAd.metadata?.variation && ` - Variation ${selectedAd.metadata.variation}`}
                  </p>
                </div>

                {selectedAd.metadata?.aspect_ratio && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Aspect Ratio</p>
                    <p className="text-white">{selectedAd.metadata.aspect_ratio}</p>
                  </div>
                )}

                {selectedAd.metadata?.generation_type && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Generation Type</p>
                    <p className="text-white">{selectedAd.metadata.generation_type}</p>
                  </div>
                )}

                {selectedAd.metadata?.selected_by_ai && (
                  <div className="flex items-center text-green-400">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>AI Selected</span>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-white">
                    {formatDate ? formatDate(selectedAd.createdAt) : new Date(selectedAd.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleDownload(selectedAd)}
                    disabled={downloading === selectedAd.conversationId}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {downloading === selectedAd.conversationId ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Full Resolution
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsModal;



