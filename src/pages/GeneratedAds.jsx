import React, { useState, useEffect } from 'react';
import { useBrand } from '../contexts/BrandContext';
import { adsAPI } from '../services/apiService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ChatModal from '../components/ChatModal';
import { getFirebaseImageUrl } from '../utils/storageHelpers';
import { formatDate } from '../utils/dateHelpers';

const GeneratedAds = () => {
  const { selectedBrand } = useBrand();
  const [productsWithAds, setProductsWithAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedAdForChat, setSelectedAdForChat] = useState(null);

  // Helper function to categorize ads by time
  const categorizeAdsByTime = (ads) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const categories = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    ads.forEach(ad => {
      const adDate = ad.createdAt?.toDate ? ad.createdAt.toDate() : new Date(ad.createdAt);
      
      if (adDate >= today) {
        categories.today.push(ad);
      } else if (adDate >= yesterday) {
        categories.yesterday.push(ad);
      } else if (adDate >= thisWeek) {
        categories.thisWeek.push(ad);
      } else if (adDate >= thisMonth) {
        categories.thisMonth.push(ad);
      } else {
        categories.older.push(ad);
      }
    });

    return categories;
  };

  // Group remixed ads by their source conversation
  const groupRemixedAds = (ads) => {
    const remixGroups = {};
    const regularAds = [];

    ads.forEach(ad => {
      if (ad.generation_type === 'remix' && ad.remix_source_conversation_id) {
        const sourceId = ad.remix_source_conversation_id;
        if (!remixGroups[sourceId]) {
          remixGroups[sourceId] = [];
        }
        remixGroups[sourceId].push(ad);
      } else {
        regularAds.push(ad);
      }
    });

    // Sort each remix group by remix_index
    Object.keys(remixGroups).forEach(sourceId => {
      remixGroups[sourceId].sort((a, b) => (a.remix_index || 0) - (b.remix_index || 0));
    });

    return { remixGroups, regularAds };
  };

  useEffect(() => {
    if (selectedBrand) {
      loadAds();
    } else {
      setProductsWithAds([]);
      setLoading(false);
    }
  }, [selectedBrand]);

  const loadAds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adsAPI.getBrandAdsGroupedByProduct(selectedBrand.brandId);
      
      if (response.success) {
        setProductsWithAds(response.data.products || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Failed to load ads:', err);
      setError('Failed to load ads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAd = async (ad) => {
    setDownloading(ad.conversationId);
    try {
      const { downloadFirebaseImage } = await import('../utils/storageHelpers');
      const filename = `${selectedBrand.brandName}_${ad.metadata?.product_full_name || 'ad'}_${ad.metadata?.template_id || 'template'}.png`.replace(/[^a-zA-Z0-9_.-]/g, '_');
      await downloadFirebaseImage(ad.currentImageUrl, filename);
    } catch (error) {
      console.error('Error downloading ad:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenChat = (ad, productId) => {
    console.log('[GeneratedAds] Opening chat for ad:', ad);
    
    // Transform the ad object to match ChatModal's expected format
    const transformedAd = {
      brand_id: ad.brandId || ad.brand_id || selectedBrand?.brandId,
      product_id: ad.productId || ad.product_id || productId,
      conversation_id: ad.conversationId || ad.conversation_id || ad.conversationID,
      firebase_url: ad.currentImageUrl || ad.firebase_url || ad.firebaseUrl || ad.imageUrl,
      brand_name: ad.brand_name || ad.metadata?.brand_name || selectedBrand?.brandName,
      product_full_name: ad.product_full_name || ad.metadata?.product_full_name,
      product_name: ad.product_name || ad.metadata?.product_name,
      // Include all other ad fields for reference
      ...ad
    };
    
    console.log('[GeneratedAds] Transformed ad data:', transformedAd);
    
    setSelectedAdForChat(transformedAd);
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
    setSelectedAdForChat(null);
    // Reload ads to show updated images
    loadAds();
  };

  if (!selectedBrand) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-12">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Veuillez sélectionner une marque dans la barre latérale pour voir les annonces générées.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-400">Chargement des annonces...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadAds}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-[#0F0F0F] min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Annonces Générées
          </h1>
          <p className="text-gray-400">
            Visualisation des annonces pour <span className="text-purple-400">{selectedBrand.brandName}</span>
          </p>
        </div>

        {productsWithAds.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-xl border border-gray-800">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-4">Aucune annonce générée pour cette marque</p>
            <button 
              onClick={() => window.location.href = '/ingestion'}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium transition-all"
            >
              Générer vos premières annonces
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {productsWithAds.map((product) => (
              <div key={product.productId} className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      {product.productName}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {product.adCount} annonce{product.adCount !== 1 ? 's' : ''} générée{product.adCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.href = `/ingestion?product=${product.productId}`}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Générer plus
                  </button>
                </div>

                {(() => {
                  const { remixGroups, regularAds } = groupRemixedAds(product.ads);
                  const categorizedRegularAds = categorizeAdsByTime(regularAds);
                  const timeLabels = {
                    today: "Aujourd'hui",
                    yesterday: "Hier",
                    thisWeek: "Cette Semaine",
                    thisMonth: "Ce Mois-ci",
                    older: "Plus Ancien"
                  };

                   // Render an individual ad card
                  const renderAdCard = (ad) => (
                    <div 
                      key={ad.conversationId}
                      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
                      onClick={() => handleOpenChat(ad, product.productId)}
                    >
                      <div className="aspect-square relative">
                        <img 
                          src={getFirebaseImageUrl(ad.currentImageUrl)}
                          alt={`Ad ${ad.conversationId}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18"%3EImage indisponible%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenChat(ad, product.productId); }}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                            title="Modifier et Remixer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier/Remix
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadAd(ad); }}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                            title="Télécharger"
                            disabled={downloading === ad.conversationId}
                          >
                            {downloading === ad.conversationId ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Télécharger</span>
                              </>
                            )}
                          </button>
                          <p className="text-white text-[10px] text-center mt-1">Cliquez pour ouvrir l&apos;éditeur AI</p>
                        </div>
                        
                        {ad.metadata?.template_id && (
                          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
                            {ad.metadata.template_id.replace('_', ' ')}
                          </div>
                        )}

                        {ad.generation_type === 'remix' && (
                          <div className="absolute top-2 left-2 bg-purple-600/90 px-2 py-1 rounded text-xs text-white flex items-center gap-1 backdrop-blur-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Remix #{ad.remix_index || '?'}
                          </div>
                        )}

                        {ad.metadata?.selected_by_ai && (
                          <div className="absolute bottom-2 left-2 bg-green-600/70 px-2 py-1 rounded text-xs text-white flex items-center gap-1 backdrop-blur-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            AI
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatDate(ad.createdAt)}
                          </span>
                          {ad.concept_name && (
                            <span className="text-xs text-purple-400 font-medium line-clamp-1" title={ad.concept_name}>
                              {ad.concept_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div className="space-y-8">
                      {/* Remix Groups Section */}
                      {Object.keys(remixGroups).length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              <h3 className="text-lg font-bold text-white">✨ Variations Remixées</h3>
                            </div>
                            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-medium">
                              {Object.keys(remixGroups).length} groupe{Object.keys(remixGroups).length > 1 ? 's' : ''}
                            </span>
                          </div>

                          {Object.entries(remixGroups).map(([sourceId, remixAds]) => {
                            // Get the most recent ad's creation date for the group
                            const mostRecentAd = remixAds.reduce((latest, current) => {
                              const currentDate = current.createdAt?.toDate ? current.createdAt.toDate() : new Date(current.createdAt);
                              const latestDate = latest.createdAt?.toDate ? latest.createdAt.toDate() : new Date(latest.createdAt);
                              return currentDate > latestDate ? current : latest;
                            }, remixAds[0]);

                            return (
                              <div key={sourceId} className="bg-[#0F0F0F] rounded-lg border border-purple-500/30 p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm font-medium">Batch de variations</span>
                                    <span className="text-gray-600 text-xs">•</span>
                                    <span className="text-gray-500 text-xs">{formatDate(mostRecentAd.createdAt)}</span>
                                  </div>
                                  <span className="text-purple-400 text-sm font-semibold">
                                    {remixAds.length} variation{remixAds.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                  {remixAds.map(renderAdCard)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Time-categorized Regular Ads */}
                      {Object.entries(timeLabels).map(([timeKey, timeLabel]) => {
                        const adsInCategory = categorizedRegularAds[timeKey];
                        if (adsInCategory.length === 0) return null;

                        return (
                          <div key={timeKey} className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-white">{timeLabel}</h3>
                              <span className="px-3 py-1 bg-gray-800 rounded-full text-gray-400 text-xs font-medium">
                                {adsInCategory.length} annonce{adsInCategory.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                              {adsInCategory.map(renderAdCard)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Chat Modal for Image Modification and Remix */}
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={handleCloseChat}
          imageData={selectedAdForChat}
        />
      </div>
    </DashboardLayout>
  );
};

export default GeneratedAds;



