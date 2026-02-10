import React, { useState, useEffect, useRef } from 'react';
import { useBrand } from '../../contexts/BrandContext';
import { getFirebaseImageUrl } from '../../utils/storageHelpers';

const BrandSelector = ({ onManageBrands }) => {
  const { brands, selectedBrand, setSelectedBrand, loading } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setIsOpen(false);
  };

  const handleManageBrands = () => {
    setIsOpen(false);
    onManageBrands();
  };

  if (loading) {
    return (
      <div className="px-4 py-3 border-t border-[#262626]">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-[#262626]" ref={dropdownRef}>
      <div className="relative">
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] hover:border-gray-700 text-white rounded-xl transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Brand Logo or Icon */}
            {selectedBrand?.customLogoUrl || selectedBrand?.logoUrl ? (
              <img
                src={getFirebaseImageUrl(selectedBrand.customLogoUrl || selectedBrand.logoUrl)}
                alt={selectedBrand.brandName}
                className="w-6 h-6 rounded object-contain bg-white/5"
                onError={(e) => {
                  console.error('Failed to load brand logo:', selectedBrand.customLogoUrl || selectedBrand.logoUrl);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold">
                {selectedBrand ? selectedBrand.brandName.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            
            {/* Brand Name */}
            <span className="font-medium truncate">
              {selectedBrand ? selectedBrand.brandName : brands.length > 0 ? 'Select Brand' : 'No Brands'}
            </span>
          </div>

          {/* Dropdown Arrow */}
          <svg
            className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A1A] border border-[#262626] rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
            {/* Brand List */}
            <div className="max-h-64 overflow-y-auto">
              {brands.length > 0 ? (
                <>
                  {/* Individual Brands */}
                  {brands.map((brand) => (
                    <button
                      key={brand.brandId}
                      onClick={() => handleSelectBrand(brand)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        selectedBrand && selectedBrand.brandId === brand.brandId
                          ? 'bg-[#8B5CF6] text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {/* Brand Logo */}
                      {brand.customLogoUrl || brand.logoUrl ? (
                        <img
                          src={getFirebaseImageUrl(brand.customLogoUrl || brand.logoUrl)}
                          alt={brand.brandName}
                          className="w-6 h-6 rounded object-contain bg-white/5"
                          onError={(e) => {
                            console.error('Failed to load brand logo:', brand.customLogoUrl || brand.logoUrl);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold"
                          style={{ backgroundColor: brand.primaryColor || '#8B5CF6' }}
                        >
                          {brand.brandName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium truncate">{brand.brandName}</div>
                        <div className="text-xs opacity-60 truncate">
                          {brand.productCount || 0} {brand.productCount === 1 ? 'product' : 'products'}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="mb-1">No brands yet</p>
                  <p className="text-xs opacity-75">Scrape your first product to create a brand</p>
                </div>
              )}
            </div>

            {/* Manage Brands Button */}
            <div className="border-t border-[#262626]">
              <button
                onClick={handleManageBrands}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-purple-400 hover:bg-gray-800 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Brands
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandSelector;

