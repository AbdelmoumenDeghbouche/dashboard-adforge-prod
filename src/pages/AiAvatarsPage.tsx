import React, { useState } from 'react';
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
    <div 
      style={{
        maxWidth: 'min(1152px, 80vw)',
        borderRadius: 'min(16px, 1.11vw)',
        borderWidth: '1px',
        opacity: 1,
        height: 'min(964px, 94vh)',
      }}
      className="flex flex-col md:flex-row w-full bg-bg-primary border border-border-light overflow-hidden mx-auto"
    >
      <FilterPanel filters={filters} onFilterChange={setFilters} />
      <AvatarsGrid avatars={filteredAvatars} />
    </div>
  );
};

export default AiAvatarsPage;
