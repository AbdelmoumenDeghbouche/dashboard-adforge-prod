import React from 'react';

interface ProductsHeaderProps {
  onSearchChange?: (value: string) => void;
  onCreateClick?: () => void;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({ onSearchChange, onCreateClick }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
      {/* Page Title */}
      <h1 className="font-semibold text-xl sm:text-2xl leading-[24px] sm:leading-[27px] tracking-[-0.025em] text-[#0A0A0A]">
        Products
      </h1>

      {/* Toolbar: Search + Create */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Search Box */}
        <div className="flex items-center gap-2 px-2 py-2 border border-[#0A0A0A]/[0.06] rounded-[14px] w-full sm:w-[200px] lg:w-[249px] h-[34px] sm:h-[38px]">
          <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center opacity-70 shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="sm:w-4 sm:h-4">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#0A0A0A" strokeWidth="1.5"/>
              <path d="M10 10L14 14" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none font-normal text-xs sm:text-sm leading-[20px] sm:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] placeholder:text-[#0A0A0A] opacity-70 min-w-0"
          />
        </div>

        {/* Create Button */}
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 bg-[#0A0A0A] rounded-[14px] h-[34px] sm:h-[38px] hover:bg-[#0A0A0A]/90 transition-colors shrink-0"
        >
          <span className="font-medium text-xs sm:text-sm leading-[20px] sm:leading-[22px] tracking-[-0.007em] text-white whitespace-nowrap">
            <span className="hidden sm:inline">Create a new product</span>
            <span className="sm:hidden">+ Create</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductsHeader;
