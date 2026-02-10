import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useBrand } from '../contexts/BrandContext';
import { getFirebaseImageUrl } from '../utils/storageHelpers';
import { brandsAPI, adsAPI } from '../services/apiService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ChatModal from '../components/ChatModal';

/**
 * Product Details Page
 * Full view of product information, images, colors, and generated ads
 */
const ProductDetails = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedBrand } = useBrand();
  
  const [product, setProduct] = useState(location.state?.product || null);
  const [brandInfo, setBrandInfo] = useState(location.state?.brandInfo || null);
  
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

  // Helper function to extract hex color from color object or string
  const getColorHex = (color) => {
    if (!color) return null;
    if (typeof color === 'string') return color;
    if (typeof color === 'object' && color.hex) return color.hex;
    return null;
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(!product);
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedAdForChat, setSelectedAdForChat] = useState(null);

  // Handle opening chat modal for an ad
  const handleOpenChat = (ad) => {
    console.log('[ProductDetails] Opening chat for ad:', ad);
    
    // Transform the ad object to match ChatModal's expected format
    const transformedAd = {
      brand_id: ad.brandId || ad.brand_id || selectedBrand,
      product_id: ad.productId || ad.product_id || productId,
      conversation_id: ad.conversationId || ad.conversation_id || ad.conversationID,
      firebase_url: ad.currentImageUrl || ad.firebase_url || ad.firebaseUrl || ad.imageUrl,
      // Include all other ad fields for reference
      ...ad
    };
    
    console.log('[ProductDetails] Transformed ad data:', transformedAd);
    
    // Validate required fields
    if (!transformedAd.brand_id || !transformedAd.product_id || !transformedAd.conversation_id) {
      console.error('[ProductDetails] Missing required fields:', {
        brand_id: transformedAd.brand_id,
        product_id: transformedAd.product_id,
        conversation_id: transformedAd.conversation_id
      });
    }
    
    setSelectedAdForChat(transformedAd);
    setIsChatModalOpen(true);
  };

  // Handle closing chat modal
  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedAdForChat(null);
  };

  // Redirect to imported products when brand changes
  useEffect(() => {
    // If the selected brand changes and it's different from the product's brand,
    // redirect to the ingestion page (imported products tab)
    if (selectedBrand && product && selectedBrand.brandId !== product.brandId) {
      console.log('[ProductDetails] Brand changed, redirecting to imported products');
      navigate('/ingestion');
    }
  }, [selectedBrand, product, navigate]);

  // Fetch product if not passed via state
  useEffect(() => {
    const fetchProduct = async () => {
      if (!product && productId && selectedBrand) {
        try {
          setLoading(true);
          const response = await brandsAPI.getBrandProducts(selectedBrand.brandId);
          if (response.success && response.data?.products) {
            // Find the specific product by ID
            const foundProduct = response.data.products.find(p => p.productId === productId);
            if (foundProduct) {
              setProduct(foundProduct);
              setBrandInfo(selectedBrand);
            }
          }
        } catch (error) {
          console.error('[ProductDetails] Error fetching product:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProduct();
  }, [product, productId, selectedBrand]);

  // Fetch ads for this product
  useEffect(() => {
    const fetchAds = async () => {
      if (product && selectedBrand) {
        try {
          setLoadingAds(true);
          const response = await adsAPI.getProductAds(selectedBrand.brandId, product.productId);
          console.log('[ProductDetails] Ads response:', response);
          if (response.success) {
            const adsData = response.data.ads || [];
            console.log('[ProductDetails] Ads data:', adsData);
            console.log('[ProductDetails] First ad:', adsData[0]);
            setAds(adsData);
          }
        } catch (error) {
          console.error('[ProductDetails] Error fetching ads:', error);
        } finally {
          setLoadingAds(false);
        }
      }
    };

    fetchAds();
  }, [product, selectedBrand]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <svg className="w-20 h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-white text-xl font-semibold mb-2">Produit introuvable</h3>
          <p className="text-gray-400 mb-6">Ce produit n'existe pas ou a été supprimé</p>
          <button
            onClick={() => navigate('/ingestion')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            Retour aux produits
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/ingestion')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour aux produits</span>
          </button>

          <button
            onClick={async () => {
              // ⚠️ CRITICAL: Refetch brand data FIRST to get the latest PNG logoUrl from Firestore
              let freshBrand = selectedBrand || brandInfo;
              const brandIdToFetch = selectedBrand?.brandId || product.brandId;
              
              if (brandIdToFetch) {
                try {
                  console.log('[ProductDetails] 🔄 Refetching brand data BEFORE transforming product...');
                  const { brandsAPI } = await import('../services/apiService');
                  const response = await brandsAPI.getBrand(brandIdToFetch);
                  if (response.success && response.data) {
                    freshBrand = response.data;
                    console.log('[ProductDetails] ✅ Got fresh brand data with logoUrl:', freshBrand.logoUrl);
                  }
                } catch (error) {
                  console.error('[ProductDetails] ❌ Error refetching brand:', error);
                }
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
              const prodPrimary = getColorHex(product.primaryColor);
              const prodSecondary = getColorHex(product.secondaryColor);
              const prodAccent = getColorHex(product.accentColor);
              
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
              if (product.palette && Array.isArray(product.palette)) {
                product.palette.forEach(color => {
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
              console.log('[ProductDetails] Color palette before dedup:', colorPalette);
              console.log('[ProductDetails] Color palette after dedup:', uniqueColorPalette);
              
              // Transform and store product for ad generation - USE FRESH BRAND DATA
              const transformedProduct = {
                id: Date.now(),
                productId: product.productId,
                brandId: freshBrand?.brandId || product.brandId,
                url: product.productUrl || '',
                title: product.productName,
                brand_name: freshBrand?.brandName || '',
                description: product.description || '',
                images: product.images || [],
                imageCount: product.images?.length || 0,
                selectedImages: [], // User must select images
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
              
              console.log('[ProductDetails] Transformed product:', transformedProduct);
              console.log('[ProductDetails] 🎨 Logo URL being saved to product:', transformedProduct.brand_logo);
              localStorage.setItem('adGenerationProduct', JSON.stringify(transformedProduct));
              // Save brand ID to maintain context after ad generation
              localStorage.setItem('adGenerationBrandId', selectedBrand?.brandId);
              localStorage.setItem('adGenerationProductId', product.productId);
              navigate('/ingestion', { state: { startAdGeneration: true, returnToBrand: selectedBrand?.brandId } });
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Générer des annonces
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden">
              <div className="relative bg-[#0F0F0F] aspect-square flex items-center justify-center p-8">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getFirebaseImageUrl(product.images[selectedImageIndex])}
                    alt={product.productName}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x600?text=Image+not+available';
                    }}
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <svg className="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Aucune image disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`bg-[#1A1A1A] rounded-lg border-2 overflow-hidden aspect-square transition-all duration-200 ${
                      idx === selectedImageIndex
                        ? 'border-purple-500 scale-105'
                        : 'border-[#262626] hover:border-purple-500/50'
                    }`}
                  >
                    <img
                      src={getFirebaseImageUrl(image)}
                      alt={`${product.productName} ${idx + 1}`}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150x150?text=N/A';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
              <div className="mb-4">
                {brandInfo?.brandName && (
                  <p className="text-purple-400 text-sm font-medium mb-2">{brandInfo.brandName}</p>
                )}
                <h1 className="text-white text-3xl font-bold mb-3">{product.productName}</h1>
                {product.price && (
                  <p className="text-white text-2xl font-bold">
                    {product.price} {product.currency || 'USD'}
                  </p>
                )}
              </div>

              {product.description && (
                <div className="pt-4 border-t border-[#262626]">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Brand Logo */}
            {brandInfo?.logoUrl && (
              <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Logo de la marque</h3>
                <div className="flex items-center gap-4 bg-[#0F0F0F] rounded-lg p-4">
                  <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg p-2 border border-[#262626]">
                    <img
                      src={getFirebaseImageUrl(brandInfo.logoUrl)}
                      alt={brandInfo.brandName}
                      className="w-full h-full object-contain"
                      onLoad={() => console.log('[ProductDetails] Logo loaded:', brandInfo.logoUrl)}
                      onError={(e) => {
                        console.error('[ProductDetails] Logo failed to load:', brandInfo.logoUrl);
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-white text-base font-medium">{brandInfo.brandName}</p>
                    <p className="text-gray-500 text-sm">Logo original de la marque</p>
                  </div>
                </div>
              </div>
            )}

            {/* Colors */}
            {(product.primaryColor || product.secondaryColor || product.accentColor) && (
              <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Couleurs principales</h3>
                <div className="grid grid-cols-3 gap-4">
                  {product.primaryColor && getColorHex(product.primaryColor) && (
                    <div className="text-center">
                      <div
                        className="w-full aspect-square rounded-lg border-2 border-[#262626] mb-2"
                        style={{ backgroundColor: getColorHex(product.primaryColor) }}
                      />
                      <p className="text-white text-xs font-mono mb-1">{getColorHex(product.primaryColor).toUpperCase()}</p>
                      <p className="text-gray-500 text-[10px]">Primaire</p>
                    </div>
                  )}
                  {product.secondaryColor && getColorHex(product.secondaryColor) && (
                    <div className="text-center">
                      <div
                        className="w-full aspect-square rounded-lg border-2 border-[#262626] mb-2"
                        style={{ backgroundColor: getColorHex(product.secondaryColor) }}
                      />
                      <p className="text-white text-xs font-mono mb-1">{getColorHex(product.secondaryColor).toUpperCase()}</p>
                      <p className="text-gray-500 text-[10px]">Secondaire</p>
                    </div>
                  )}
                  {product.accentColor && getColorHex(product.accentColor) && (
                    <div className="text-center">
                      <div
                        className="w-full aspect-square rounded-lg border-2 border-[#262626] mb-2"
                        style={{ backgroundColor: getColorHex(product.accentColor) }}
                      />
                      <p className="text-white text-xs font-mono mb-1">{getColorHex(product.accentColor).toUpperCase()}</p>
                      <p className="text-gray-500 text-[10px]">Accent</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Color Palette */}
            {product.palette && product.palette.length > 0 && (
              <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Palette de couleurs</h3>
                <div className="flex flex-wrap gap-2">
                  {product.palette.map((color, idx) => {
                    const hexColor = getColorHex(color);
                    if (!hexColor) return null;
                    return (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-lg border border-[#262626] hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: hexColor }}
                        title={hexColor}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Ads Section */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white text-xl font-bold mb-1">Annonces générées</h2>
              <p className="text-gray-400 text-sm">
                {ads.length} annonce{ads.length !== 1 ? 's' : ''} pour ce produit
              </p>
            </div>
            <button
              onClick={() => {
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
                const prodPrimary = getColorHex(product.primaryColor);
                const prodSecondary = getColorHex(product.secondaryColor);
                const prodAccent = getColorHex(product.accentColor);
                
                if (prodPrimary) colorPalette.push(prodPrimary);
                if (prodSecondary) colorPalette.push(prodSecondary);
                if (prodAccent) colorPalette.push(prodAccent);
                
                // If no product colors, use brand colors
                if (colorPalette.length === 0) {
                  const brandPrimary = getColorHex(selectedBrand?.primaryColor || brandInfo?.primaryColor);
                  const brandSecondary = getColorHex(selectedBrand?.secondaryColor || brandInfo?.secondaryColor);
                  const brandAccent = getColorHex(selectedBrand?.accentColor || brandInfo?.accentColor);
                  
                  if (brandPrimary) colorPalette.push(brandPrimary);
                  if (brandSecondary) colorPalette.push(brandSecondary);
                  if (brandAccent) colorPalette.push(brandAccent);
                }
                
                // Add product palette colors if available
                if (product.palette && Array.isArray(product.palette)) {
                  product.palette.forEach(color => {
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
                
                // Transform and store product for ad generation
                const transformedProduct = {
                  id: Date.now(),
                  productId: product.productId,
                  brandId: selectedBrand?.brandId || product.brandId,
                  url: product.productUrl || '',
                  title: product.productName,
                  brand_name: brandInfo?.brandName || selectedBrand?.brandName || '',
                  description: product.description || '',
                  images: product.images || [],
                  imageCount: product.images?.length || 0,
                  selectedImages: [], // User must select images
                  brand_logo: brandInfo?.logoUrl || selectedBrand?.logoUrl || null,
                  custom_logo: null,
                  primaryColor: colorPalette[0],
                  secondaryColor: colorPalette[1] || colorPalette[0],
                  accentColor: colorPalette[2] || null,
                  website_palette: colorPalette,
                  primary_color_index: 0,
                  secondary_color_index: 1,
                  accent_color_index: 2,
                  status: 'ready'
                };
                
                console.log('[ProductDetails] Transformed product (more ads):', transformedProduct);
                localStorage.setItem('adGenerationProduct', JSON.stringify(transformedProduct));
                // Save brand ID to maintain context after ad generation
                localStorage.setItem('adGenerationBrandId', selectedBrand?.brandId);
                localStorage.setItem('adGenerationProductId', product.productId);
                navigate('/ingestion', { state: { startAdGeneration: true, returnToBrand: selectedBrand?.brandId } });
              }}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 border border-purple-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Générer plus d'annonces
            </button>
          </div>

          {loadingAds ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-sm">Aucune annonce générée pour ce produit</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ads.map((ad, idx) => {
                // Backend returns 'currentImageUrl' field (same as GeneratedAds page)
                const imageUrl = ad.currentImageUrl || ad.firebase_url || ad.firebaseUrl || ad.imageUrl;
                console.log(`[ProductDetails] Ad ${idx}:`, ad);
                console.log(`[ProductDetails] Ad ${idx} imageUrl:`, imageUrl);
                
                return (
                  <div
                    key={ad.adId || ad.id || idx}
                    className="bg-[#0F0F0F] rounded-lg border border-[#262626] overflow-hidden hover:border-purple-500/50 transition-all duration-200 group"
                  >
                    <div className="relative aspect-square cursor-pointer" onClick={() => handleOpenChat(ad)}>
                      {imageUrl ? (
                        <>
                          <img
                            src={getFirebaseImageUrl(imageUrl)}
                            alt={`Ad ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`[ProductDetails] Image load error for ad ${idx}:`, imageUrl);
                              e.target.src = 'https://via.placeholder.com/400x400?text=Ad+Image+Error';
                            }}
                          />
                          {/* Hover Overlay */}
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
                                href={getFirebaseImageUrl(imageUrl)}
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
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs">No image URL</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-gray-400 text-xs">
                        Style: <span className="text-white">{ad.style || ad.ad_style || ad.adStyle || 'Lifestyle'}</span>
                      </p>
                      {ad.createdAt && (
                        <p className="text-gray-500 text-[10px] mt-1">
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

export default ProductDetails;

