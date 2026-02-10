import React from 'react';

interface ToolbarProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onFiltersClick?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  searchPlaceholder = 'Search...', 
  onSearchChange,
  onFiltersClick 
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 w-full">
      {/* Search Box */}
      <div className="flex-1 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1.5 sm:py-2 border border-[#0A0A0A]/[0.06] rounded-[12px] sm:rounded-[14px] opacity-70 min-w-0">
        {/* Search Icon */}
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="sm:w-4 sm:h-4">
            <circle
              cx="6.5"
              cy="6.5"
              r="4.5"
              stroke="#0A0A0A"
              strokeWidth="1.5"
            />
            <path
              d="M10 10L14 14"
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-normal text-[12px] sm:text-[13px] md:text-sm leading-[18px] sm:leading-[20px] md:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] placeholder:text-[#0A0A0A] min-w-0"
        />
      </div>

      {/* Filters Button */}
      <button
        onClick={onFiltersClick}
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 pr-2 sm:pr-3.5 py-1.5 sm:py-2 bg-[#0A0A0A]/[0.04] rounded-[12px] sm:rounded-[14px] hover:bg-[#0A0A0A]/[0.06] transition-colors shrink-0"
      >
        {/* Filter Icon */}
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
          <img src="/icons/Filters.svg" alt="" className="w-full h-full opacity-60" />
        </div>

        {/* Label */}
        <span className="hidden sm:inline font-medium text-[12px] sm:text-[13px] md:text-sm leading-[18px] sm:leading-[20px] md:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
          Filters
        </span>
      </button>
    </div>
  );
};

export default Toolbar;
