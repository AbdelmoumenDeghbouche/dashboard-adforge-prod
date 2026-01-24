import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import type { FilterChip } from '@/types';

const initialFilters: FilterChip[] = [
  { id: '1', label: 'Suggested', icon: '/icons/suggested.svg', active: true },
  { id: '2', label: 'Acquisition', icon: '/icons/acquisition.svg', active: false },
  { id: '3', label: 'Social networks', icon: '/icons/social.svg', active: false },
  { id: '4', label: 'Marketing', icon: '/icons/marketing.svg', active: false },
  { id: '5', label: 'Emailing', icon: '/icons/email.svg', active: false },
  { id: '6', label: 'Advertising', icon: '/icons/advertising.svg', active: false },
];

const FilterChips: React.FC = () => {
  const [filters, setFilters] = useState<FilterChip[]>(initialFilters);

  const toggleFilter = (id: string) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, active: !filter.active } : filter
      )
    );
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => toggleFilter(filter.id)}
          className={cn(
            'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
            filter.active
              ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
              : 'border-border-light text-text-secondary hover:bg-bg-hover'
          )}
        >
          <img src={filter.icon} alt="" className="w-4 h-4" />
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
