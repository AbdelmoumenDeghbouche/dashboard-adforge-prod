import React from 'react';
import FilterSection from './FilterSection';
import SkinTonePicker from './SkinTonePicker';
import { AvatarFilter, FILTER_OPTIONS } from '@/types/avatars';

interface FilterPanelProps {
  filters: AvatarFilter;
  onFilterChange: (filters: AvatarFilter) => void;
}

const Separator = () => <div className="border-t border-dashed border-[#0A0A0A]/20 w-full max-w-[249px] my-3 sm:my-4" />;

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
    <div className="hidden lg:flex w-full lg:w-[353px] h-full bg-white border-r border-[#0A0A0A]/[0.06] overflow-y-auto flex-col pt-6 sm:pt-[44px] px-4 sm:px-[52px] pb-[44px] gap-[10px] shrink-0">
      <div className="w-full flex flex-col gap-[28px]">
        {/* Search Header - Frame 276 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2 py-2 border border-[#0A0A0A]/[0.06] rounded-[14px] w-full max-w-[249px] h-[34px] sm:h-[38px]">
            <div className="w-6 h-6 flex items-center justify-center opacity-70">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#0A0A0A" strokeWidth="1.5"/>
                <path d="M10 10L14 14" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={handleSearchChange}
              className="flex-1 bg-transparent border-none outline-none font-normal text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A] placeholder:text-[#0A0A0A] opacity-70"
            />
          </div>

          {/* Active Filters - Frame 1707484104 */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 w-full max-w-[249px]">
              {activeFilters.map((filter, index) => (
                <div key={index} className="flex items-center justify-center px-2 py-1 bg-[#0A0A0A]/[0.04] rounded-lg gap-1.5">
                  <span className="text-[12px] leading-4 tracking-[-0.007em] text-[#0A0A0A]">{filter.value}</span>
                  <button onClick={() => removeFilter(filter.category, filter.value)} className="opacity-50">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2.5 7.5L7.5 2.5M2.5 2.5L7.5 7.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Gender Filter */}
        <FilterSection title="Gender">
          <div className="flex gap-2">
            <button
              onClick={() => handleGenderChange('male')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
                filters.gender === 'male'
                  ? 'bg-[#0A0A0A]/[0.04] text-[#0A0A0A] border-transparent'
                  : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/[0.06] hover:bg-gray-50'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => handleGenderChange('female')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
                filters.gender === 'female'
                  ? 'bg-[#0A0A0A]/[0.04] text-[#0A0A0A] border-transparent'
                  : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/[0.06] hover:bg-gray-50'
              }`}
            >
              Female
            </button>
          </div>
        </FilterSection>

        <Separator />

        {/* Age Filter */}
        <FilterSection title="Age">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.age.map((option) => (
              <button
                key={option}
                onClick={() => toggleArrayFilter('age', option)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
                  filters.age.includes(option)
                    ? 'bg-[#0A0A0A]/[0.04] text-[#0A0A0A] border-transparent'
                    : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/[0.06] hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Type Filter */}
        <FilterSection title="Type">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.type.map((option) => (
              <button
                key={option}
                onClick={() => toggleArrayFilter('type', option)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
                  filters.type.includes(option)
                    ? 'bg-[#0A0A0A]/[0.04] text-[#0A0A0A] border-transparent'
                    : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/[0.06] hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Situation Filter */}
        <FilterSection title="Situation">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.situation.map((option) => (
              <button
                key={option}
                onClick={() => toggleArrayFilter('situation', option)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
                  filters.situation.includes(option)
                    ? 'bg-[#0A0A0A]/[0.04] text-[#0A0A0A] border-transparent'
                    : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/[0.06] hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Accessories Filter */}
        <FilterSection title="Accessories">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.accessories.map((option) => (
              <button
                key={option}
                onClick={() => toggleArrayFilter('accessories', option)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
                  filters.accessories.includes(option)
                    ? 'bg-[#0A0A0A]/[0.04] text-[#0A0A0A] border-transparent'
                    : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/[0.06] hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Skin Tones Filter */}
        <FilterSection title="Skin Tones">
          <SkinTonePicker
            tones={FILTER_OPTIONS.skinTones}
            selected={filters.skinTone}
            onSelect={(tone) => onFilterChange({ ...filters, skinTone: tone })}
          />
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterPanel;
