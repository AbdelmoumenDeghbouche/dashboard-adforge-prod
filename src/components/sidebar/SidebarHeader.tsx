import React, { useState, useRef, useEffect } from 'react';
import { useBrand } from '@/contexts/BrandContext';

const SidebarHeader: React.FC = () => {
  const { currentBrand, brands, switchBrand } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-start p-0 gap-5 w-full self-stretch relative" ref={dropdownRef}>
      {/* Frame 275 - Organization Selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row justify-between items-center p-2 pr-3.5 gap-3 w-full h-[52px] rounded-[20px] transition-colors hover:bg-[#0A0A0A]/[0.02] cursor-pointer group"
      >
        <div className="flex flex-row items-center p-0 gap-3 flex-1 min-w-0">
          {/* Logo Box - Frame 13 */}
          <div className="flex flex-row justify-center items-center w-9 h-9 bg-[#0A0A0A] rounded-[12px] shrink-0">
            {currentBrand.logo ? (
              <img src={currentBrand.logo} alt={currentBrand.name} className="w-full h-full object-cover rounded-[12px]" />
            ) : (
              <img src="/icons/Pulsor Inc.svg" alt="Logo" className="w-[18.25px] h-[16px] invert" />
            )}
          </div>

          {/* Company Text Content - Frame 1707484029 */}
          <div className="flex flex-col justify-center items-start p-0 flex-1 min-w-0">
            <span className="w-full font-medium text-[13px] sm:text-[14px] leading-[18px] sm:leading-[20px] tracking-[-0.012em] text-[#0A0A0A] truncate">
              {currentBrand.name}
            </span>
            <span className="w-full font-normal text-[11px] sm:text-[12px] leading-[14px] sm:leading-[16px] tracking-[-0.012em] text-[#0A0A0A]/50 truncate">
              {currentBrand.context.industry}
            </span>
          </div>
        </div>

        {/* Dropdown Arrow - Clean Chevron */}
        <div className={`w-4 h-4 flex items-center justify-center shrink-0 text-[#0A0A0A]/30 group-hover:text-[#0A0A0A]/50 transition-all ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[60px] left-0 w-full bg-white border border-[#0A0A0A]/[0.06] rounded-[14px] shadow-lg overflow-hidden z-50">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => {
                switchBrand(brand.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-[#F5F5F5] transition-colors ${
                currentBrand.id === brand.id ? 'bg-[#0A0A0A]/[0.04]' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-[10px] overflow-hidden bg-gray-100 shrink-0">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#0A0A0A] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{brand.name[0]}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-medium text-[13px] leading-[18px] text-[#0A0A0A] truncate w-full">
                  {brand.name}
                </span>
                <span className="text-[11px] leading-[14px] text-[#0A0A0A]/50 truncate w-full">
                  {brand.context.industry}
                </span>
              </div>
              {currentBrand.id === brand.id && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M3 8L6.5 11.5L13 5" stroke="#06E8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
