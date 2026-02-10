import React, { useState } from 'react';
import Toolbar from '../components/folders/Toolbar';
import ContentCard from '../components/folders/ContentCard';
import { contentItems } from '../data/foldersData';
import Breadcrumb from '../components/folders/Breadcrumb';
import PageHeader from '../components/folders/PageHeader';
import FilterChips from '../components/folders/FilterChips';

const FolderListingPage: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(contentItems[1]?.id || null);
  const [activeFilters, setActiveFilters] = useState<string[]>(['Female', 'Header']);

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 h-full bg-bg-sidebar pt-3 sm:pt-4 pr-1 sm:pr-2 pb-2 pl-0">
      {/* Breadcrumb - Consistency with Products Page */}
      <div className="px-2 sm:px-[10px]">
        <Breadcrumb paths={['Pulsor Inc.', 'Hybrid Format', 'Desire']} />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 bg-white border border-[#0A0A0A]/[0.06] rounded-xl sm:rounded-2xl pt-4 sm:pt-6 md:pt-[44px] px-3 sm:px-4 md:px-[52px] pb-6 sm:pb-8 md:pb-[44px] overflow-y-auto">
        <div className="max-w-[874px] mx-auto flex flex-col gap-5 sm:gap-6 md:gap-8 lg:gap-[48px]">
          {/* Page Header (Title + Badge) */}
          <PageHeader title="Hybrid Format" badge="Desire" />

          {/* Toolbar + Chips (Search + Filters) */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[95vw] sm:max-w-[480px] mx-auto">
            <Toolbar />
            <FilterChips filters={activeFilters} onRemove={removeFilter} />
          </div>

          {/* Content Cards */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {contentItems.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onClick={() => setSelectedItemId(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderListingPage;
