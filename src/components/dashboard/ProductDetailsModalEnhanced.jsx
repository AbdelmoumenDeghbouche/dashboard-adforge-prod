import React, { useState, useEffect } from 'react';
import { adsAPI } from '../../services/apiService';
import { getFirebaseImageUrl, downloadFirebaseImage } from '../../utils/storageHelpers';
import { formatDate } from '../../utils/dateHelpers';

/**
 * Enhanced Product Details Modal
 * 
 * Shows product information with generation controls and all generated ads
 * 
 * @param {Object} product - Product object
 * @param {Object} brand - Brand object
 * @param {Function} onClose - Close modal callback
 * @param {Function} onGenerateAds - Generate ads callback
 */
const ProductDetailsModalEnhanced = ({ product, brand, onClose, onGenerateAds }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [activeTab, setActiveTab] = useState('ads'); // 'ads' or 'generate'
  
  // Generation controls
  const [selectedImages, setSelectedImages] = useState([]);
  const [customLogo, setCustomLogo] = useState(null);
  
  // Ensure colors are always strings
  const getColorString = (color, defaultColor) => {
    if (typeof color === 'string' && color.startsWith('#')) return color;
    return defaultColor;
  };
  
  const [primaryColor, setPrimaryColor] = useState(getColorString(brand?.primaryColor, '#8B7355'));
  const [secondaryColor, setSecondaryColor] = useState(getColorString(brand?.secondaryColor, '#FFFFFF'));
  const [primaryColorInput, setPrimaryColorInput] = useState(getColorString(brand?.primaryColor, '#8B7355'));
  const [secondaryColorInput, setSecondaryColorInput] = useState(getColorString(brand?.secondaryColor, '#FFFFFF'));

  useEffect(() => {
    if (product && brand) {
      fetchProductAds();
      // Select all images by default
      if (product.images && product.images.length > 0) {
        setSelectedImages(product.images.map((_, idx) => idx));
      }
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
      const errorMessage = err.message || 'Failed to load ads';
      // Provide helpful message for common backend errors
      if (errorMessage.includes('CollectionReference')) {
        setError('Erreur du serveur: Le backend a besoin d\'une mise à jour. Les annonces seront disponibles après le déploiement du backend.');
      } else {
        setError(errorMessage);
      }
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

  const handleToggleImage = (idx) => {
    setSelectedImages(prev => 
      prev.includes(idx) 
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  const handleSelectAllImages = () => {
    setSelectedImages(product.images.map((_, idx) => idx));
  };

  const handleDeselectAllImages = () => {
    setSelectedImages([]);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomLogo(file);
    }
  };

  const handlePrimaryColorChange = (e) => {
    const value = e.target.value;
    setPrimaryColorInput(value);
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setPrimaryColor(value);
    }
  };

  const handleSecondaryColorChange = (e) => {
    const value = e.target.value;
    setSecondaryColorInput(value);
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setSecondaryColor(value);
    }
  };

  const handlePrimaryColorPicker = (e) => {
    const value = e.target.value;
    setPrimaryColor(value);
    setPrimaryColorInput(value);
  };

  const handleSecondaryColorPicker = (e) => {
    const value = e.target.value;
    setSecondaryColor(value);
    setSecondaryColorInput(value);
  };

  const handleGenerateClick = () => {
    if (selectedImages.length === 0) {
      alert('Veuillez sélectionner au moins une image');
      return;
    }

    // Validate colors
    if (!/^#[0-9A-F]{6}$/i.test(primaryColor)) {
      alert('Couleur primaire invalide. Utilisez un code hexadécimal valide (ex: #8B7355)');
      return;
    }
    if (!/^#[0-9A-F]{6}$/i.test(secondaryColor)) {
      alert('Couleur secondaire invalide. Utilisez un code hexadécimal valide (ex: #FFFFFF)');
      return;
    }

    // Transform product to match ad generation format
    const transformedProduct = {
      id: Date.now(),
      productId: product.productId, // CRITICAL: Real Firestore product ID
      brandId: brand.brandId, // CRITICAL: Real Firestore brand ID
      url: product.productUrl || '',
      title: product.productName,
      brand_name: brand.brandName,
      description: product.description || '',
      images: product.images || [],
      imageCount: product.images?.length || 0,
      selectedImages: selectedImages,
      brand_logo: brand.logoUrl || null,
      custom_logo: customLogo,
      brand_colors: {
        colors: [primaryColor, secondaryColor],
        color_scheme: 'custom'
      },
      website_dominant_color: { hex: primaryColor, rgb: [] },
      website_palette: [primaryColor, secondaryColor],
      primary_color_index: 0,
      secondary_color_index: 1,
      accent_color_index: 2,
      // Store the actual color values for easy access
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      accentColor: null,
      method: 'backend',
      extraction_method: 'backend',
      status: 'pending'
    };

    console.log('[ProductDetailsModal] Generating with colors:', { primaryColor, secondaryColor });

    if (onGenerateAds) {
      onGenerateAds(transformedProduct);
      onClose(); // Close modal after starting generation
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

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-6">
          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'ads' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Annonces générées ({ads.length})
            {activeTab === 'ads' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'generate' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Générer nouvelles annonces
            </div>
            {activeTab === 'generate' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'ads' ? (
            // Generated Ads Tab
            <div>
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
                    Réessayer
                  </button>
                </div>
              ) : ads.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-800">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 mb-2">Aucune annonce générée pour ce produit</p>
                  <p className="text-gray-500 text-sm mb-4">Cliquez sur l'onglet "Générer" ci-dessus pour créer des annonces</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Générer des annonces
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ads.map((ad) => (
                    <div
                      key={ad.conversationId}
                      className="bg-[#1A1A1A] border border-[#262626] rounded-lg overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group"
                      onClick={() => setSelectedAd(ad)}
                    >
                      {/* Ad Image */}
                      <div className="aspect-square relative bg-[#0F0F0F]">
                        <img
                          src={getFirebaseImageUrl(ad.currentImageUrl)}
                          alt={`Ad ${ad.conversationId}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                          }}
                        />

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
                            IA
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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(ad);
                          }}
                          disabled={downloading === ad.conversationId}
                          className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          {downloading === ad.conversationId ? (
                            <>
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Téléchargement...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Télécharger
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Generate New Ads Tab
            <div className="space-y-6">
              {/* Product Info Summary */}
              <div className="bg-[#262626] rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{product.productName}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                  </div>
                </div>
              </div>

              {/* Image Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Sélectionner les images ({selectedImages.length}/{product.images?.length || 0})</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllImages}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      onClick={handleDeselectAllImages}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {product.images && product.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedImages.includes(idx)
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#1A1A1A]'
                          : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.productName} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImages.includes(idx) && (
                        <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                        Image {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Logo Upload */}
              <div>
                <h3 className="text-white font-semibold mb-3">Logo personnalisé (optionnel)</h3>
                <div className="bg-[#262626] rounded-lg p-4 border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors">
                  <label className="flex flex-col items-center cursor-pointer">
                    <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {customLogo ? (
                      <p className="text-white text-sm">{customLogo.name}</p>
                    ) : (
                      <p className="text-gray-400 text-sm">Cliquez pour uploader un logo</p>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <h3 className="text-white font-semibold mb-3">Couleurs de la marque</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div className="bg-[#262626] rounded-lg p-4">
                    <label className="block text-gray-400 text-sm mb-3">Couleur primaire</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={primaryColorInput}
                          onChange={handlePrimaryColorChange}
                          placeholder="#8B7355"
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-700 rounded text-white text-sm font-mono focus:border-purple-500 focus:outline-none"
                        />
                        {!/^#[0-9A-F]{6}$/i.test(primaryColorInput) && primaryColorInput !== '' && (
                          <p className="text-red-400 text-xs mt-1">Format invalide (ex: #8B7355)</p>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={handlePrimaryColorPicker}
                          className="w-12 h-12 rounded border-2 border-gray-700 cursor-pointer"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <div 
                          className="absolute inset-0 rounded pointer-events-none border-2 border-gray-700"
                          style={{ backgroundColor: primaryColor }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div 
                        className="w-full h-8 rounded border border-gray-700"
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                      <span className="text-gray-400 text-xs font-mono whitespace-nowrap">
                        {typeof primaryColor === 'string' ? primaryColor.toUpperCase() : '#8B7355'}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="bg-[#262626] rounded-lg p-4">
                    <label className="block text-gray-400 text-sm mb-3">Couleur secondaire</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={secondaryColorInput}
                          onChange={handleSecondaryColorChange}
                          placeholder="#FFFFFF"
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-700 rounded text-white text-sm font-mono focus:border-purple-500 focus:outline-none"
                        />
                        {!/^#[0-9A-F]{6}$/i.test(secondaryColorInput) && secondaryColorInput !== '' && (
                          <p className="text-red-400 text-xs mt-1">Format invalide (ex: #FFFFFF)</p>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={handleSecondaryColorPicker}
                          className="w-12 h-12 rounded border-2 border-gray-700 cursor-pointer"
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <div 
                          className="absolute inset-0 rounded pointer-events-none border-2 border-gray-700"
                          style={{ backgroundColor: secondaryColor }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div 
                        className="w-full h-8 rounded border border-gray-700"
                        style={{ backgroundColor: secondaryColor }}
                      ></div>
                      <span className="text-gray-400 text-xs font-mono whitespace-nowrap">
                        {typeof secondaryColor === 'string' ? secondaryColor.toUpperCase() : '#FFFFFF'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-4 bg-[#262626] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-3">Aperçu des couleurs</p>
                  <div className="flex gap-3">
                    <div className="flex-1 h-20 rounded-lg border-2 border-gray-700 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                      <span className="text-white font-semibold text-sm drop-shadow-lg">Primaire</span>
                    </div>
                    <div className="flex-1 h-20 rounded-lg border-2 border-gray-700 flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                      <span className="font-semibold text-sm drop-shadow-lg" style={{ color: primaryColor }}>Secondaire</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateClick}
                  disabled={selectedImages.length === 0}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Générer les annonces ({selectedImages.length} image{selectedImages.length > 1 ? 's' : ''})
                </button>
              </div>

              {selectedImages.length === 0 && (
                <p className="text-yellow-500 text-sm text-center">
                  ⚠️ Veuillez sélectionner au moins une image pour générer des annonces
                </p>
              )}
            </div>
          )}
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
                <h3 className="text-xl font-bold text-white mb-1">Détails de l'annonce</h3>
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
              <div className="bg-[#0F0F0F] rounded-lg overflow-hidden">
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
                    <p className="text-xs text-gray-500 mb-1">Format</p>
                    <p className="text-white">{selectedAd.metadata.aspect_ratio}</p>
                  </div>
                )}

                {selectedAd.metadata?.selected_by_ai && (
                  <div className="flex items-center text-green-400">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Sélectionné par l'IA</span>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Créé le</p>
                  <p className="text-white">
                    {formatDate ? formatDate(selectedAd.createdAt) : new Date(selectedAd.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleDownload(selectedAd)}
                    disabled={downloading === selectedAd.conversationId}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {downloading === selectedAd.conversationId ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger en haute résolution
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

export default ProductDetailsModalEnhanced;

