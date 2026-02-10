import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../types/products';

import EditProductModal from './EditProductModal';

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onClick?: () => void;
  onMenuClick?: () => void;
  onEditClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isSelected = false, 
  onClick,
  onMenuClick,
  onEditClick
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div
      onClick={onClick}
      className={`
        flex justify-between items-start p-2 sm:p-3 rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] border border-[#0A0A0A]/[0.06] cursor-pointer transition-all relative
        shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full max-w-[480px] min-h-[80px] sm:min-h-[88px] lg:min-h-[96px]
        ${isSelected ? 'bg-[#0A0A0A]/[0.02]' : 'bg-white hover:bg-[#0A0A0A]/[0.01]'}
      `}
    >
      {/* Left Content Area - Thumbnail + Info */}
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-[18px] flex-1 min-w-0">
        {/* Thumbnail - Responsive */}
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-16 h-14 sm:w-[72px] sm:h-16 lg:w-20 lg:h-[72px] rounded-[14px] sm:rounded-[16px] lg:rounded-[18px] object-cover flex-shrink-0"
        />

        {/* Info Area - Flexible width */}
        <div className="flex flex-col gap-[3px] flex-1 min-w-0">
          <h3 className="font-medium text-xs sm:text-sm leading-[20px] sm:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] truncate">
            {product.title}
          </h3>
          <p className="font-normal text-xs sm:text-sm leading-[18px] sm:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Right Side - Menu Button Trigger */}
      <div className="relative ml-2" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
            onMenuClick?.();
          }}
          className="flex items-center justify-center w-7 h-7 sm:w-[30px] sm:h-[30px] bg-white border border-[#0A0A0A]/[0.06] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-lg sm:rounded-xl hover:bg-[#0A0A0A]/[0.02] transition-colors flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="2" r="1" fill="#020308"/>
            <circle cx="6" cy="6" r="1" fill="#020308"/>
            <circle cx="6" cy="10" r="1" fill="#020308"/>
          </svg>
        </button>

        {/* Actions Dropdown */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 p-1 gap-1 w-[120px] bg-white border border-[#0A0A0A]/[0.06] shadow-xl rounded-[18px] z-50 flex flex-col">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onEditClick) {
                  onEditClick();
                } else {
                  setIsEditModalOpen(true);
                }
                setShowDropdown(false);
              }}
              className="flex items-center px-3 py-2 w-full h-[34px] rounded-[14px] hover:bg-[#0A0A0A]/[0.02] transition-all text-left"
            >
              <span className="font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]">
                Edit
              </span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Delete requested for:', product.id);
                setShowDropdown(false);
              }}
              className="flex items-center px-3 py-2 w-full h-[34px] rounded-[14px] hover:bg-[#FF4D4D]/[0.04] transition-all text-left"
            >
              <span className="font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#FF4D4D]">
                Delete
              </span>
            </button>
          </div>
        )}
      </div>

      <EditProductModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={product}
      />
    </div>
  );
};

export default ProductCard;
