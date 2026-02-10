import React, { useState, useEffect } from 'react';
import { videoChatAPI } from '../services/apiService';

const VideoProductDetailsModal = ({ isOpen, onClose, product, brandId, onStartVideoGeneration, onResumeConversation }) => {
  const [videoConversations, setVideoConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingConversationId, setDeletingConversationId] = useState(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState([0]); // Array for multiple selection

  // Fetch ALL video conversations when modal opens (not just completed ones)
  useEffect(() => {
    if (isOpen && product && brandId) {
      console.log('[VideoProductDetailsModal] Modal opened with:', {
        productId: product.productId,
        productName: product.productName || product.name,
        brandId: brandId
      });
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
      console.log('[VideoProductDetailsModal] Fetching ALL video conversations for product:', product.productId);
      const response = await videoChatAPI.listVideoConversations(brandId, product.productId);
      
      console.log('[VideoProductDetailsModal] Full API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        const conversations = response.data.conversations || [];
        console.log('[VideoProductDetailsModal] Raw conversations data:', JSON.stringify(conversations, null, 2));
        
        // Log each conversation's video status and URL in detail
        conversations.forEach((conv, index) => {
          console.log(`[VideoProductDetailsModal] Conversation ${index + 1} detailed check:`, {
            id: conv.conversation_id,
            video_status: conv.video_status,
            video_status_type: typeof conv.video_status,
            video_url: conv.video_url,
            video_url_type: typeof conv.video_url,
            has_video_url: !!conv.video_url,
            video_url_length: conv.video_url ? conv.video_url.length : 0,
            message_count: conv.message_count,
            all_keys: Object.keys(conv)
          });
        });
        
        // Show ALL conversations (not filtered by status)
        setVideoConversations(conversations);
        console.log('[VideoProductDetailsModal] Loaded', conversations.length, 'total conversations');
      } else {
        console.log('[VideoProductDetailsModal] Response not successful or missing data');
        setVideoConversations([]);
      }
    } catch (err) {
      console.error('[VideoProductDetailsModal] Error loading video conversations:', err);
      setError('Erreur lors du chargement des conversations');
      setVideoConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadVideoConversations();
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation et sa vidéo ? Cette action est irréversible.')) {
      return;
    }

    console.log('[VideoProductDetailsModal] Deleting conversation:', conversationId);
    console.log('[VideoProductDetailsModal] Brand:', brandId, 'Product:', product.productId);
    
    setError(''); // Clear any existing errors
    setDeletingConversationId(conversationId); // Show loading state

    try {
      const response = await videoChatAPI.deleteVideoConversation(brandId, product.productId, conversationId);
      console.log('[VideoProductDetailsModal] Delete response:', response);
      
      if (response && response.success) {
        console.log('[VideoProductDetailsModal] Conversation deleted successfully');
        
        // Immediately remove from local state to prevent showing it
        setVideoConversations(prevConversations => 
          prevConversations.filter(conv => conv.conversation_id !== conversationId)
        );
        
        // Then refresh the list to ensure consistency with backend
        await loadVideoConversations();
      } else {
        throw new Error(response?.message || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('[VideoProductDetailsModal] Error deleting conversation:', err);
      console.error('[VideoProductDetailsModal] Error details:', err.response);
      setError('Erreur lors de la suppression: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingConversationId(null); // Clear loading state
    }
  };

  const handleStartNewVideo = () => {
    console.log('[VideoProductDetailsModal] Starting new video for product:', product);
    
    // Get all images
    const images = product?.images || [];
    const mainImage = product?.main_image_url || product?.imageUrl;
    const allImages = images.length > 0 ? images : (mainImage ? [mainImage] : []);
    
    // Ensure at least one image is selected
    if (selectedImageIndexes.length === 0) {
      setError('Veuillez sélectionner au moins une image pour votre vidéo');
      return;
    }
    
    // First selected image is the main reference image
    const mainReferenceImage = allImages[selectedImageIndexes[0]];
    
    // Rest are additional images
    const additionalSelectedImages = selectedImageIndexes.slice(1).map(idx => allImages[idx]);
    
    // Attach selected images to product
    const productWithSelectedImages = {
      ...product,
      selectedImageUrl: mainReferenceImage,
      selectedAdditionalImages: additionalSelectedImages
    };
    
    console.log('[VideoProductDetailsModal] Main reference image:', mainReferenceImage);
    console.log('[VideoProductDetailsModal] Additional selected images:', additionalSelectedImages);
    
    // Call parent handler - parent will handle closing this modal and opening chat modal
    if (onStartVideoGeneration) {
      onStartVideoGeneration(productWithSelectedImages);
    }
    // DON'T call onClose() here - parent will handle it
  };

  const handleResumeConversation = (conversation) => {
    console.log('[VideoProductDetailsModal] Resuming conversation:', conversation);
    
    // Attach selected images to product before resuming
    const images = product?.images || [];
    const mainImage = product?.main_image_url || product?.imageUrl;
    const allImages = images.length > 0 ? images : (mainImage ? [mainImage] : []);
    
    const mainReferenceImage = allImages[selectedImageIndexes[0]] || allImages[0] || mainImage;
    const additionalSelectedImages = selectedImageIndexes.slice(1).map(idx => allImages[idx]);
    
    const productWithSelectedImages = {
      ...product,
      selectedImageUrl: mainReferenceImage,
      selectedAdditionalImages: additionalSelectedImages
    };
    
    console.log('[VideoProductDetailsModal] Resuming with images:', {
      main: mainReferenceImage,
      additional: additionalSelectedImages
    });
    
    // Call parent handler - parent will handle closing this modal and opening chat modal
    if (onResumeConversation) {
      onResumeConversation(productWithSelectedImages, conversation);
    }
    // DON'T call onClose() here - parent will handle it
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'not_started': { 
        bg: 'rgba(107, 114, 128, 0.1)', 
        border: 'rgba(107, 114, 128, 0.3)', 
        text: '#9CA3AF', 
        label: 'Non démarrée', 
        icon: '○' 
      },
      'queued': { 
        bg: 'rgba(59, 130, 246, 0.1)', 
        border: 'rgba(59, 130, 246, 0.3)', 
        text: '#60A5FA', 
        label: 'En file', 
        icon: '⏳' 
      },
      'generating': { 
        bg: 'rgba(234, 179, 8, 0.1)', 
        border: 'rgba(234, 179, 8, 0.3)', 
        text: '#FACC15', 
        label: 'Génération...', 
        icon: '⚡' 
      },
      'completed': { 
        bg: 'rgba(34, 197, 94, 0.1)', 
        border: 'rgba(34, 197, 94, 0.3)', 
        text: '#4ADE80', 
        label: 'Terminée', 
        icon: '✓' 
      },
      'failed': { 
        bg: 'rgba(239, 68, 68, 0.1)', 
        border: 'rgba(239, 68, 68, 0.3)', 
        text: '#F87171', 
        label: 'Échec', 
        icon: '✗' 
      }
    };

    const config = statusConfig[status] || statusConfig['not_started'];

    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: config.bg,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: config.border,
          color: config.text
        }}
      >
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#262626] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-bold font-poppins">Vidéos publicitaires</h2>
              <p className="text-gray-400 text-sm">{product?.productName || product?.name || 'Produit'}</p>
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
            {/* Product Image(s) with Selection */}
            <div className="lg:col-span-1">
              <div className="bg-[#0F0F0F] rounded-xl border border-[#262626] p-4">
                {/* Main Image Display */}
                <div className="aspect-square flex items-center justify-center mb-4">
                  {(() => {
                    const images = product?.images || [];
                    const mainImage = product?.main_image_url || product?.imageUrl;
                    const allImages = images.length > 0 ? images : (mainImage ? [mainImage] : []);
                    
                    if (allImages.length > 0) {
                      return (
                        <img
                          src={allImages[selectedImageIndexes[0]]}
                          alt={product.productName || product.name}
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      );
                    }
                    
                    return (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Aucune image</p>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Image Thumbnails (if multiple images) */}
                {(() => {
                  const images = product?.images || [];
                  const mainImage = product?.main_image_url || product?.imageUrl;
                  const allImages = images.length > 0 ? images : (mainImage ? [mainImage] : []);
                  
                  const toggleImageSelection = (index) => {
                    setSelectedImageIndexes(prev => {
                      if (prev.includes(index)) {
                        // Deselect (but keep at least one selected)
                        if (prev.length === 1) return prev;
                        return prev.filter(i => i !== index);
                      } else {
                        // Select
                        return [...prev, index].sort((a, b) => a - b);
                      }
                    });
                  };
                  
                  if (allImages.length > 1) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs font-medium">Sélectionnez les images pour votre vidéo (première = principale)</p>
                        </div>
                        <p className="text-xs text-gray-400 px-1">
                          {selectedImageIndexes.length} image{selectedImageIndexes.length > 1 ? 's' : ''} sélectionnée{selectedImageIndexes.length > 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {allImages.map((img, index) => {
                            const isSelected = selectedImageIndexes.includes(index);
                            const selectionOrder = selectedImageIndexes.indexOf(index);
                            
                            return (
                              <button
                                key={index}
                                onClick={() => toggleImageSelection(index)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'border-purple-500 ring-2 ring-purple-500/50'
                                    : 'border-[#262626] hover:border-purple-500/50'
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`${product.productName || product.name} - ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {selectionOrder === 0 ? '★' : selectionOrder + 1}
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2">
              <div className="bg-[#0F0F0F] rounded-xl border border-[#262626] p-6 h-full">
                <h3 className="text-white text-2xl font-bold mb-4">{product?.productName || product?.name || 'Sans nom'}</h3>
                
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
                      <p className="text-purple-400 text-lg font-bold">{product.price} {product.currency || ''}</p>
                    </div>
                  )}

                  {product?.images?.length > 0 && (
                    <div>
                      <h4 className="text-gray-400 text-xs font-semibold mb-1">Images</h4>
                      <p className="text-white text-sm">{product.images.length} photo{product.images.length > 1 ? 's' : ''}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Video Button */}
          <div className="mb-6">
            <button
              onClick={handleStartNewVideo}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une nouvelle vidéo publicitaire
            </button>
          </div>

          {/* Conversations Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold font-poppins">Conversations et vidéos</h3>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">
                  {videoConversations.length} conversation{videoConversations.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-purple-500/50 text-gray-400 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Actualiser"
                >
                  <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
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
                <p className="text-gray-400 text-sm">Chargement des conversations...</p>
              </div>
            ) : videoConversations.length === 0 ? (
              <div className="bg-[#0F0F0F] rounded-xl border border-[#262626] p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h4 className="text-white text-lg font-semibold mb-2">Aucune conversation</h4>
                <p className="text-gray-400 text-sm">
                  Créez votre première vidéo publicitaire pour ce produit
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {videoConversations.map((conversation) => {
                  console.log('[VideoProductDetailsModal] Rendering conversation:', {
                    id: conversation.conversation_id,
                    video_url: conversation.video_url,
                    video_status: conversation.video_status,
                    has_video: !!conversation.video_url
                  });
                  
                  return (
                  <div
                    key={conversation.conversation_id}
                    className="bg-[#0F0F0F] rounded-xl border border-[#262626] overflow-hidden hover:border-purple-500/50 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      {/* Video Preview or Placeholder */}
                      <div className="md:w-64 flex-shrink-0">
                        {conversation.video_url ? (
                          <div 
                            className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => {
                              console.log('[VideoProductDetailsModal] Clicked video thumbnail, opening:', conversation.video_url);
                              setSelectedVideoUrl(conversation.video_url);
                            }}
                          >
                            <video
                              src={`${conversation.video_url}#t=0.5`}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                              playsInline
                              onLoadedMetadata={(e) => {
                                console.log('[VideoProductDetailsModal] Video metadata loaded for:', conversation.conversation_id);
                                e.target.currentTime = 0.5;
                              }}
                              onError={(e) => {
                                console.error('[VideoProductDetailsModal] Video load error:', conversation.video_url, e);
                              }}
                            >
                              Votre navigateur ne supporte pas la lecture de vidéos.
                            </video>
                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-200 flex items-center justify-center pointer-events-none">
                              <div className="w-16 h-16 bg-purple-600/80 group-hover:bg-purple-600 rounded-full flex items-center justify-center transition-all duration-200 transform group-hover:scale-110">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video bg-[#1A1A1A] rounded-lg flex items-center justify-center border border-[#262626]">
                            <div className="text-center">
                              <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <p className="text-xs text-gray-500">Aucune vidéo</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="text-white text-base font-semibold mb-1">
                              Conversation {conversation.conversation_id.slice(0, 8)}...
                            </h4>
                            <p className="text-gray-400 text-xs">
                              Créée le {new Date(conversation.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {getStatusBadge(conversation.video_status)}
                        </div>

                        <div className="text-gray-400 text-sm mb-3">
                          {conversation.message_count || 0} message{(conversation.message_count || 0) !== 1 ? 's' : ''}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-auto">
                          <button
                            onClick={() => handleResumeConversation(conversation)}
                            className="flex-1 min-w-[140px] px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Reprendre conversation
                          </button>

                          {conversation.video_url && (
                            <>
                              <button
                                onClick={() => setSelectedVideoUrl(conversation.video_url)}
                                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-purple-500/50 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                                title="Voir la vidéo"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              
                              <a
                                href={conversation.video_url}
                                download
                                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] hover:border-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                                title="Télécharger"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteConversation(conversation.conversation_id)}
                            disabled={deletingConversationId === conversation.conversation_id}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer"
                          >
                            {deletingConversationId === conversation.conversation_id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {selectedVideoUrl && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedVideoUrl(null)}
        >
          <div 
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedVideoUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-purple-400 transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video player */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                src={selectedVideoUrl}
                controls
                autoPlay
                className="w-full h-auto max-h-[85vh]"
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>

            {/* Download button */}
            <div className="mt-4 flex justify-center">
              <a
                href={selectedVideoUrl}
                download
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger la vidéo
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProductDetailsModal;

