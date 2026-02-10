import React from 'react';

interface FilterChipsProps {
  filters: string[];
  onRemove: (filter: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ filters, onRemove }) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-2 w-full">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onRemove(filter)}
          className="flex flex-row items-center p-[4px_10px] gap-2 bg-[#0A0A0A]/[0.04] rounded-[14px] hover:bg-[#0A0A0A]/[0.06] transition-colors group"
        >
          <span className="font-medium text-[12px] leading-[18px] tracking-[-0.007em] text-[#0A0A0A]">
            {filter}
          </span>
          <div className="w-3 h-3 flex items-center justify-center opacity-40 group-hover:opacity-60">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1L7 7M7 1L1 7" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
