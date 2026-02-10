import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirebaseImageUrl } from '../../utils/storageHelpers';
import ResearchStatusBadge from './ResearchStatusBadge';

/**
 * Compact Product Card Component
 * Shows essential info, click to view full details on separate page
 */
const ProductCardSimple = ({ product, brandInfo, onGenerateAds, onDelete, onCardClick, hideGenerateButton = false }) => {
  const navigate = useNavigate();

  // Helper function to extract hex color from color object or string
  const getColorHex = (color) => {
    if (!color) return null;
    if (typeof color === 'string') return color;
    if (typeof color === 'object' && color.hex) return color.hex;
    return null;
  };

  const handleCardClick = () => {
    // Use custom onClick if provided, otherwise navigate to product details page
    if (onCardClick) {
      onCardClick(product);
    } else {
      navigate(`/product/${product.productId}`, {
        state: { product, brandInfo }
      });
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
      {/* Product Image */}
      <div className="relative bg-[#0F0F0F] aspect-square overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={getFirebaseImageUrl(product.images[0])}
              alt={product.productName}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=Image+not+available';
              }}
            />
            
            {/* Research Status Badge - Top Left */}
            {product.research && (
              <div className="absolute top-3 left-3 z-10">
                <ResearchStatusBadge status={product.research.status} />
              </div>
            )}
            
            {/* Image Counter */}
            {product.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-xs font-medium">
                {product.images.length} photos
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Details - Compact */}
      <div className="p-4">
        {/* Product Name & Price */}
        <h3 className="text-white text-base font-semibold mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors">
          {product.productName}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-xs">{brandInfo?.brandName || 'Sans marque'}</p>
          {product.price && (
            <p className="text-white text-sm font-bold">
              {product.price} {product.currency || 'USD'}
            </p>
          )}
        </div>

        {/* Mini Color Palette */}
        {(product.primaryColor || product.secondaryColor || product.accentColor) && (
          <div className="flex gap-1.5 mb-3">
            {product.primaryColor && getColorHex(product.primaryColor) && (
              <div
                className="w-6 h-6 rounded border border-[#262626]"
                style={{ backgroundColor: getColorHex(product.primaryColor) }}
                title={`Primaire: ${getColorHex(product.primaryColor)}`}
              />
            )}
            {product.secondaryColor && getColorHex(product.secondaryColor) && (
              <div
                className="w-6 h-6 rounded border border-[#262626]"
                style={{ backgroundColor: getColorHex(product.secondaryColor) }}
                title={`Secondaire: ${getColorHex(product.secondaryColor)}`}
              />
            )}
            {product.accentColor && getColorHex(product.accentColor) && (
              <div
                className="w-6 h-6 rounded border border-[#262626]"
                style={{ backgroundColor: getColorHex(product.accentColor) }}
                title={`Accent: ${getColorHex(product.accentColor)}`}
              />
            )}
          </div>
        )}

        {/* Quick Info */}
        <div className="text-gray-500 text-xs mb-3 pb-3 border-b border-[#262626]">
          {product.images?.length || 0} image{product.images?.length > 1 ? 's' : ''}
          {product.description && (
            <span className="mx-1">•</span>
          )}
          {product.description && (
            <span className="line-clamp-1">{product.description}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!hideGenerateButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onGenerateAds) onGenerateAds(product);
              }}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Générer
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Supprimer "${product.productName}" ?`)) {
                  onDelete(product);
                }
              }}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCardSimple;

