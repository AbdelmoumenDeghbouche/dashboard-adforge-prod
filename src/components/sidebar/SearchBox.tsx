import React, { useState } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="flex flex-col items-start p-0 gap-2 w-full self-stretch">
      {/* Frame 276 */}
      <div className={`box-border flex flex-row justify-between items-center px-2 py-2 gap-2 w-full h-[38px] border rounded-[14px] transition-colors ${
        isFocused ? 'border-[#0A0A0A]/[0.12]' : 'border-[#0A0A0A]/[0.06]'
      }`}>
        {/* Search Input */}
        <div className="flex flex-row items-center p-0 gap-[6px] flex-1 min-w-0">
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            {/* Custom Search Icon from Specs */}
            <img src="/icons/search.svg" alt="Search" className="w-[14px] h-[14px]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search chat"
            className="flex-1 min-w-0 bg-transparent border-none outline-none font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] placeholder:text-[#0A0A0A] placeholder:opacity-70"
          />
          {query && (
            <button
              onClick={handleClear}
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.06] transition-colors shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Shortcut Chip - Frame 6 */}
        {!isFocused && !query && (
          <div className="flex flex-row justify-center items-center px-1 gap-0.5 h-[18px] bg-[#0A0A0A]/[0.04] rounded-[6px] shrink-0">
            {/* Command Symbol + K */}
            <span className="font-medium text-[9px] leading-[12px] text-[#797878]/70">
              ⌘
            </span>
            <span className="font-medium text-[9px] leading-[12px] text-[#797878]/70">
              K
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
