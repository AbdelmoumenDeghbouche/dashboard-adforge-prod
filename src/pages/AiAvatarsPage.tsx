import React, { useState } from 'react';
import Breadcrumb from '@/components/folders/Breadcrumb';
import FilterPanel from '@/components/avatars/FilterPanel';
import AvatarsGrid from '@/components/avatars/AvatarsGrid';
import { AvatarFilter } from '@/types/avatars';
import { SAMPLE_AVATARS } from '@/data/avatars';

const AiAvatarsPage: React.FC = () => {
  const [filters, setFilters] = useState<AvatarFilter>({
    gender: null,
    age: [],
    type: [],
    situation: [],
    accessories: [],
    skinTone: null,
    search: '',
  });

  // Filter avatars based on current filters
  const filteredAvatars = SAMPLE_AVATARS.filter((avatar) => {
    // Gender filter
    if (filters.gender && avatar.gender !== filters.gender) {
      return false;
    }

    // Search filter
    if (filters.search && !avatar.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Tag filters (age, type, situation, accessories)
    const allTagFilters = [
      ...filters.age,
      ...filters.type,
      ...filters.situation,
      ...filters.accessories,
    ];
    if (allTagFilters.length > 0) {
      const hasMatchingTag = allTagFilters.some((tag) => avatar.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Skin tone filter
    if (filters.skinTone && avatar.skinTone !== filters.skinTone) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-4 h-full bg-bg-sidebar pt-4 pr-1 sm:pr-2 pb-2 pl-0 overflow-hidden">
      {/* Breadcrumb - Frame 1707484073 */}
      <div className="px-[10px]">
        <Breadcrumb paths={['Pulsor Inc.', 'AI Avatars']} />
      </div>

      {/* Main Content Wrapper - Frame 1707484068 */}
      <div className="flex-1 bg-white border border-[#0A0A0A]/[0.06] rounded-2xl overflow-hidden flex flex-col lg:flex-row">
        <FilterPanel filters={filters} onFilterChange={setFilters} />
        <AvatarsGrid avatars={filteredAvatars} />
      </div>
    </div>
  );
};

export default AiAvatarsPage;
