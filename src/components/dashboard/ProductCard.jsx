import React, { useState } from 'react';
import ProductDetailsModalEnhanced from './ProductDetailsModalEnhanced';
import { useBrand } from '../../contexts/BrandContext';

/**
 * Product Card Component
 * 
 * Displays a product card with basic info
 * Click to open ProductDetailsModal with ads
 * 
 * @param {Object} product - Product object
 * @param {Function} onGenerateAds - Callback for generating ads (optional)
 * @param {Function} onDelete - Callback for deleting product (optional)
 */
const ProductCard = ({ product, onGenerateAds, onDelete }) => {
  const { selectedBrand } = useBrand();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleCardClick = () => {
    setShowDetailsModal(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete(product);
    }
  };

  const handleGenerateAds = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onGenerateAds) {
      // Get brand colors
      const primaryColor = selectedBrand?.primaryColor || '#8B7355';
      const secondaryColor = selectedBrand?.secondaryColor || '#FFFFFF';
      
      // Transform backend product format to match ad generation flow format
      const transformedProduct = {
        id: Date.now(),
        productId: product.productId, // CRITICAL: Real Firestore product ID
        brandId: selectedBrand?.brandId, // CRITICAL: Real Firestore brand ID
        url: product.productUrl || '',
        title: product.productName,
        brand_name: selectedBrand?.brandName || '',
        description: product.description || '',
        images: product.images || [],
        imageCount: product.images?.length || 0,
        selectedImages: product.images?.map((_, idx) => idx) || [], // Select all images by default
        brand_logo: selectedBrand?.logoUrl || null,
        custom_logo: null,
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
      onGenerateAds(transformedProduct);
    }
  };

  return (
    <>
      <div
        className="bg-[#1A1A1A] rounded-lg overflow-hidden hover:border-purple-500/50 border border-[#262626] transition-all cursor-pointer group hover:shadow-lg hover:shadow-purple-500/10"
        onClick={handleCardClick}
      >
        {/* Product Image */}
        <div className="aspect-square relative bg-[#0F0F0F]">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
            <p className="text-white font-medium text-sm">Voir les détails et annonces</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 leading-tight">
            {product.productName}
          </h3>
          
          {product.description && (
            <p className="text-gray-500 text-xs mb-2 line-clamp-1">
              {product.description}
            </p>
          )}

          {product.price && (
            <p className="text-purple-400 font-bold text-sm mb-2">
              {product.currency || '$'}{product.price}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            {onGenerateAds && (
              <button
                onClick={handleGenerateAds}
                className="flex-1 px-2 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded text-xs font-medium transition-all flex items-center justify-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Générer
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-2 py-1.5 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded text-xs transition-all"
                title="Supprimer"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && selectedBrand && (
        <ProductDetailsModalEnhanced
          product={product}
          brand={selectedBrand}
          onClose={() => setShowDetailsModal(false)}
          onGenerateAds={onGenerateAds}
        />
      )}
    </>
  );
};

export default ProductCard;

