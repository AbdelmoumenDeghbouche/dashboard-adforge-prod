import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useBrand } from '../contexts/BrandContext';
import VideoChatModal from '../components/VideoChatModal';
import VideoProductDetailsModal from '../components/VideoProductDetailsModal';
import ProductCardSimple from '../components/dashboard/ProductCardSimple';

const VideoGeneration = () => {
  const navigate = useNavigate();
  const {
    brands,
    selectedBrand,
    setSelectedBrand,
    brandProducts,
    loadingProducts,
  } = useBrand();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVideoChatModalOpen, setIsVideoChatModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resumeConversation, setResumeConversation] = useState(null);

  // Filter products based on search query (only when brandProducts exists)
  const filteredProducts = React.useMemo(() => {
    if (!brandProducts || !Array.isArray(brandProducts)) {
      return [];
    }
    
    if (!searchQuery || searchQuery.trim() === '') {
      return brandProducts;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return brandProducts.filter((product) =>
      product.productName?.toLowerCase().includes(query) ||
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  }, [brandProducts, searchQuery]);

  const handleGenerateVideo = (product) => {
    console.log('[VideoGeneration] handleGenerateVideo called with product:', product);
    console.log('[VideoGeneration] Product ID:', product.productId);
    console.log('[VideoGeneration] Brand ID:', selectedBrand?.brandId);
    console.log('[VideoGeneration] Has selectedImageUrl:', !!product?.selectedImageUrl);
    
    // If image has already been selected (coming from details modal), proceed directly
    if (product?.selectedImageUrl) {
      console.log('[VideoGeneration] Image already selected - proceeding directly to video chat');
      setIsDetailsModalOpen(false);
      setSelectedProduct(product);
      setResumeConversation(null); // New conversation
      setIsVideoChatModalOpen(true);
      return;
    }
    
    // Check if product has multiple images
    const images = product?.images || [];
    const mainImage = product?.main_image_url || product?.imageUrl;
    const allImages = images.length > 0 ? images : (mainImage ? [mainImage] : []);
    
    console.log('[VideoGeneration] Product has', allImages.length, 'image(s)');
    
    // If multiple images, open details modal first to let user select
    if (allImages.length > 1) {
      console.log('[VideoGeneration] Multiple images detected - opening details modal for image selection');
      setSelectedProduct(product);
      setIsDetailsModalOpen(true);
      setIsVideoChatModalOpen(false);
      return;
    }
    
    // Single image or no images - proceed directly to chat
    console.log('[VideoGeneration] Single/no image - proceeding directly to video chat');
    setIsDetailsModalOpen(false);
    
    // Set product and conversation state
    setSelectedProduct(product);
    setResumeConversation(null); // New conversation
    
    // Open chat modal immediately
    setIsVideoChatModalOpen(true);
  };

  const handleViewDetails = (product) => {
    console.log('[VideoGeneration] handleViewDetails called with product:', product);
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleResumeConversation = (product, conversation) => {
    console.log('[VideoGeneration] handleResumeConversation called');
    console.log('[VideoGeneration] Product:', product);
    console.log('[VideoGeneration] Conversation:', conversation);
    
    // Close details modal if open
    setIsDetailsModalOpen(false);
    
    // Set product and conversation state
    setSelectedProduct(product);
    setResumeConversation(conversation);
    
    // Open chat modal immediately
    console.log('[VideoGeneration] Opening VideoChatModal with conversation:', conversation.conversation_id);
    setIsVideoChatModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-white text-3xl sm:text-4xl font-bold mb-4">Génération de vidéo</h1>
            <p className="text-gray-400 text-lg mb-6">
              Créez des vidéos publicitaires engageantes avec l&apos;IA
            </p>
          </div>

          {/* Brand Selector */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800/50 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold mb-1">Sélectionner une marque</h3>
                  <p className="text-gray-400 text-sm">Choisissez la marque pour laquelle générer des vidéos</p>
                </div>
              </div>

              <div className="flex-1 w-full sm:w-auto sm:min-w-[300px]">
                {brands.length > 0 ? (
                  <select
                    value={selectedBrand?.brandId || ''}
                    onChange={(e) => {
                      const brand = brands.find((b) => b.brandId === e.target.value);
                      setSelectedBrand(brand || null);
                      setSearchQuery(''); // Reset search when changing brand
                    }}
                    className="w-full px-4 py-3 bg-[#0F0F0F] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">Sélectionner une marque</option>
                    {brands.map((brand) => {
                      // Use productCount from Firestore (maintained by backend)
                      const productCount = brand.productCount || 0;
                      return (
                        <option key={brand.brandId} value={brand.brandId}>
                          {brand.brandName} ({productCount} produit{productCount !== 1 ? 's' : ''})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Aucune marque disponible. Créez-en une dans la section Brand Kit.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          {!selectedBrand ? (
            <div className="bg-[#1A1A1A] rounded-xl p-12 border border-gray-800/50 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Sélectionnez une marque</h3>
              <p className="text-gray-400">
                Choisissez une marque ci-dessus pour voir ses produits et générer des vidéos publicitaires
              </p>
            </div>
          ) : loadingProducts ? (
            <div className="bg-[#1A1A1A] rounded-xl p-12 border border-gray-800/50 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-white text-xl font-semibold mb-2">Chargement des produits...</h3>
              <p className="text-gray-400">Veuillez patienter</p>
            </div>
          ) : !brandProducts || brandProducts.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-xl p-12 border border-gray-800/50 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Aucun produit pour {selectedBrand.brandName}
              </h3>
              <p className="text-gray-400 mb-6">
                Ajoutez des produits à cette marque dans la section Ingestion de produit
              </p>
              <button
                onClick={() => {
                  window.location.href = '/ingestion?tab=manual';
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter des produits
              </button>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800/50 mb-6">
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full pl-12 pr-4 py-3 bg-[#0F0F0F] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 && searchQuery ? (
                <div className="bg-[#1A1A1A] rounded-xl p-12 border border-gray-800/50 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-400">Essayez avec une autre recherche</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-xl font-semibold">
                      {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
                    </h2>
                    <button
                      onClick={() => {
                        console.log('[VideoGeneration] Navigating to /ingestion with tab=manual');
                        navigate('/ingestion?tab=manual');
                      }}
                      className="px-4 py-2 bg-[#0F0F0F] hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter produit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCardSimple
                        key={product.productId}
                        product={product}
                        brandInfo={selectedBrand}
                        onCardClick={(prod) => {
                          console.log('[VideoGeneration] View details for product:', prod);
                          handleViewDetails(prod);
                        }}
                        onGenerateAds={(prod) => {
                          console.log('[VideoGeneration] Generate video for product:', prod);
                          handleGenerateVideo(prod);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* No Brands State */}
          {!selectedBrand && brands.length === 0 && (
            <div className="bg-[#1A1A1A] rounded-xl p-12 border border-gray-800/50 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Aucune marque disponible</h3>
              <p className="text-gray-400 mb-6">
                Créez une marque pour commencer à générer des vidéos publicitaires pour vos produits
              </p>
              <button
                onClick={() => (window.location.href = '/brand')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer une marque
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <>
          {isVideoChatModalOpen && (
            <VideoChatModal
              isOpen={isVideoChatModalOpen}
              onClose={() => {
                console.log('[VideoGeneration] Closing VideoChatModal');
                setIsVideoChatModalOpen(false);
                setSelectedProduct(null);
                setResumeConversation(null);
              }}
              product={selectedProduct}
              brandId={selectedBrand?.brandId}
              existingConversation={resumeConversation}
            />
          )}

          {isDetailsModalOpen && (
            <VideoProductDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={() => {
                console.log('[VideoGeneration] Closing VideoProductDetailsModal');
                setIsDetailsModalOpen(false);
                setSelectedProduct(null);
              }}
              product={selectedProduct}
              brandId={selectedBrand?.brandId}
              onStartVideoGeneration={handleGenerateVideo}
              onResumeConversation={handleResumeConversation}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default VideoGeneration;