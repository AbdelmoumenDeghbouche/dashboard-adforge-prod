import React from 'react';
import FilterSection from './FilterSection';
import FilterChip from './FilterChip';
import SkinTonePicker from './SkinTonePicker';
import { AvatarFilter, FILTER_OPTIONS } from '@/types/avatars';

interface FilterPanelProps {
  filters: AvatarFilter;
  onFilterChange: (filters: AvatarFilter) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    onFilterChange({ ...filters, gender: filters.gender === gender ? null : gender });
  };

  const toggleArrayFilter = (category: keyof AvatarFilter, value: string) => {
    const current = filters[category] as string[];
    const newArray = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [category]: newArray });
  };

  const removeFilter = (category: keyof AvatarFilter, value?: string) => {
    if (category === 'gender' || category === 'skinTone') {
      onFilterChange({ ...filters, [category]: null });
    } else if (value) {
      const current = filters[category] as string[];
      onFilterChange({ ...filters, [category]: current.filter((v) => v !== value) });
    }
  };

  const activeFilters = [
    ...(filters.gender ? [{ category: 'gender' as const, value: filters.gender }] : []),
    ...filters.age.map((v) => ({ category: 'age' as const, value: v })),
    ...filters.type.map((v) => ({ category: 'type' as const, value: v })),
    ...filters.situation.map((v) => ({ category: 'situation' as const, value: v })),
    ...filters.accessories.map((v) => ({ category: 'accessories' as const, value: v })),
  ];

  return (
    <div 
      style={{
        paddingTop: 'min(44px, 3.06vw)',
        paddingRight: 'min(52px, 3.61vw)',
        paddingLeft: 'min(52px, 3.61vw)',
        gap: 'min(10px, 0.69vw)',
        opacity: 1,
      }}
      className="w-full md:w-[min(353px,24.5vw)] md:max-w-[353px] h-full md:h-auto bg-white border-r border-border-light overflow-y-auto flex flex-col"
    >
      {/* Search Box */}
      <div className="mb-4">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <FilterChip
              key={`${filter.category}-${filter.value}-${index}`}
              label={filter.value}
              onRemove={() => removeFilter(filter.category, filter.value)}
            />
          ))}
        </div>
      )}

      {/* Gender Filter */}
      <FilterSection title="Gender">
        <div className="flex gap-2">
          <button
            onClick={() => handleGenderChange('male')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
              filters.gender === 'male'
                ? 'bg-gray-200 text-text-primary border-gray-300'
                : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50'
            }`}
          >
            Male
          </button>
          <button
            onClick={() => handleGenderChange('female')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
              filters.gender === 'female'
                ? 'bg-gray-200 text-text-primary border-gray-300'
                : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50'
            }`}
          >
            Female
          </button>
        </div>
      </FilterSection>

      {/* Age Filter */}
      <FilterSection title="Age">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.age.map((option) => (
            <button
              key={option}
              onClick={() => toggleArrayFilter('age', option)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                filters.age.includes(option)
                  ? 'bg-gray-200 text-text-primary font-medium border-gray-300'
                  : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Type Filter */}
      <FilterSection title="Type">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.type.map((option) => (
            <button
              key={option}
              onClick={() => toggleArrayFilter('type', option)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                filters.type.includes(option)
                  ? 'bg-gray-200 text-text-primary font-medium border-gray-300'
                  : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Situation Filter */}
      <FilterSection title="Situation">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.situation.map((option) => (
            <button
              key={option}
              onClick={() => toggleArrayFilter('situation', option)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                filters.situation.includes(option)
                  ? 'bg-gray-200 text-text-primary font-medium border-gray-300'
                  : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Accessories Filter */}
      <FilterSection title="Accessories">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.accessories.map((option) => (
            <button
              key={option}
              onClick={() => toggleArrayFilter('accessories', option)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                filters.accessories.includes(option)
                  ? 'bg-gray-200 text-text-primary font-medium border-gray-300'
                  : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Skin Tones Filter */}
      <FilterSection title="Skin Tones">
        <SkinTonePicker
          tones={FILTER_OPTIONS.skinTones}
          selected={filters.skinTone}
          onSelect={(tone) => onFilterChange({ ...filters, skinTone: tone })}
        />
      </FilterSection>
    </div>
  );
};

export default FilterPanel;
