import React from 'react';

interface SearchBarProps {
  placeholder?: string;
  showShortcut?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Search chat', 
  showShortcut = true 
}) => {
  return (
    <div className="flex items-center justify-between px-2 py-2 gap-2 border border-[#0A0A0A]/[0.06] rounded-[14px]">
      <div className="flex items-center gap-1.5 opacity-70">
        {/* Search Icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="#0A0A0A"
              strokeWidth="1.5"
            />
            <path
              d="M11 11L16 16"
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Placeholder Text */}
        <span className="font-medium text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
          {placeholder}
        </span>
      </div>

      {/* Keyboard Shortcut */}
      {showShortcut && (
        <div className="flex items-center gap-0.5 px-1.5 py-1 bg-[#0A0A0A]/[0.04] rounded-md">
          {/* Command Icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect
              x="1.5"
              y="1.5"
              width="3"
              height="3"
              rx="1"
              stroke="#797878"
              strokeWidth="1.5"
            />
            <rect
              x="7.5"
              y="1.5"
              width="3"
              height="3"
              rx="1"
              stroke="#797878"
              strokeWidth="1.5"
            />
            <rect
              x="1.5"
              y="7.5"
              width="3"
              height="3"
              rx="1"
              stroke="#797878"
              strokeWidth="1.5"
            />
            <rect
              x="7.5"
              y="7.5"
              width="3"
              height="3"
              rx="1"
              stroke="#797878"
              strokeWidth="1.5"
            />
          </svg>
          <span className="font-medium text-[10px] leading-3 tracking-[-0.007em] text-[#797878]">
            +
          </span>
          <span className="font-medium text-[10px] leading-3 tracking-[-0.007em] text-[#797878]">
            K
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
