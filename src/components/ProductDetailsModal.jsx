import React, { useState, useEffect } from 'react';
import { videoChatAPI } from '../services/apiService';

const ProductDetailsModal = ({ isOpen, onClose, product, brandId }) => {
  const [videoConversations, setVideoConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch video conversations when modal opens
  useEffect(() => {
    if (isOpen && product && brandId) {
      loadVideoConversations();
    }
  }, [isOpen, product, brandId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setVideoConversations([]);
      setError('');
    }
  }, [isOpen]);

  const loadVideoConversations = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('[ProductDetailsModal] Fetching video conversations for product:', product.productId);
      const response = await videoChatAPI.listVideoConversations(brandId, product.productId);
      
      if (response.success && response.data) {
        const conversations = response.data.conversations || [];
        // Filter to only show conversations with completed videos
        const completedVideos = conversations.filter(conv => 
          conv.video_status === 'completed' && conv.video_url
        );
        setVideoConversations(completedVideos);
        console.log('[ProductDetailsModal] Loaded', completedVideos.length, 'completed videos');
      } else {
        setVideoConversations([]);
      }
    } catch (err) {
      console.error('[ProductDetailsModal] Error loading video conversations:', err);
      setError('Erreur lors du chargement des vidéos');
      setVideoConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadVideoConversations();
  };

  const handleDeleteVideo = async (conversationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      return;
    }

    try {
      await videoChatAPI.deleteVideoConversation(brandId, product.productId, conversationId);
      // Refresh the list
      loadVideoConversations();
    } catch (err) {
      console.error('[ProductDetailsModal] Error deleting video:', err);
      setError('Erreur lors de la suppression de la vidéo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#262626] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-bold font-poppins">Détails du produit</h2>
              <p className="text-gray-400 text-sm">{product?.name || 'Produit'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#262626] rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Actualiser"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#262626] rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Product Image */}
            <div className="lg:col-span-1">
              <div className="bg-[#0F0F0F] rounded-xl border border-[#262626] p-4 aspect-square flex items-center justify-center">
                {product?.main_image_url || product?.imageUrl ? (
                  <img
                    src={product.main_image_url || product.imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Aucune image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2">
              <div className="bg-[#0F0F0F] rounded-xl border border-[#262626] p-6 h-full">
                <h3 className="text-white text-2xl font-bold mb-4">{product?.name || 'Sans nom'}</h3>
                
                {product?.description && (
                  <div className="mb-4">
                    <h4 className="text-gray-400 text-sm font-semibold mb-2">Description</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {product?.price && (
                    <div>
                      <h4 className="text-gray-400 text-xs font-semibold mb-1">Prix</h4>
                      <p className="text-purple-400 text-lg font-bold">{product.price}</p>
                    </div>
                  )}

                  {product?.category && (
                    <div>
                      <h4 className="text-gray-400 text-xs font-semibold mb-1">Catégorie</h4>
                      <p className="text-white text-sm">{product.category}</p>
                    </div>
                  )}

                  {product?.brand_name && (
                    <div>
                      <h4 className="text-gray-400 text-xs font-semibold mb-1">Marque</h4>
                      <p className="text-white text-sm">{product.brand_name}</p>
                    </div>
                  )}

                  {product?.product_url && (
                    <div>
                      <h4 className="text-gray-400 text-xs font-semibold mb-1">URL</h4>
                      <a 
                        href={product.product_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline truncate block"
                      >
                        Voir le produit
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Videos Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold font-poppins">Vidéos publicitaires générées</h3>
              <span className="text-gray-400 text-sm">
                {videoConversations.length} vidéo{videoConversations.length !== 1 ? 's' : ''}
              </span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">Chargement des vidéos...</p>
              </div>
            ) : videoConversations.length === 0 ? (
              <div className="bg-[#0F0F0F] rounded-xl border border-[#262626] p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-white text-lg font-semibold mb-2">Aucune vidéo générée</h4>
                <p className="text-gray-400 text-sm">
                  Cliquez sur "Générer vidéo" depuis la liste des produits pour créer votre première vidéo publicitaire
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoConversations.map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className="bg-[#0F0F0F] rounded-xl border border-[#262626] overflow-hidden hover:border-purple-500/50 transition-all duration-200"
                  >
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black">
                      <video
                        src={conversation.video_url}
                        controls
                        className="w-full h-full"
                        preload="metadata"
                      >
                        Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold mb-1">
                            Vidéo publicitaire
                          </p>
                          <p className="text-gray-400 text-xs">
                            Créée le {new Date(conversation.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={conversation.video_url}
                            download
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#262626] rounded-lg transition-all duration-200"
                            title="Télécharger"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                          <button
                            onClick={() => handleDeleteVideo(conversation.conversation_id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Terminée
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;

