import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import FilterPanel from '@/components/avatars/FilterPanel';
import AvatarsGrid from '@/components/avatars/AvatarsGrid';
import { Avatar, AvatarFilter } from '@/types/avatars';
import { SAMPLE_AVATARS } from '@/data/avatars';

interface AvatarsMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: Avatar) => void;
}

const AvatarsMarketplaceModal: React.FC<AvatarsMarketplaceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect 
}) => {
  const [filters, setFilters] = useState<AvatarFilter>({
    gender: null,
    age: [],
    type: [],
    situation: [],
    accessories: [],
    skinTone: null,
    search: '',
  });

  if (!isOpen) return null;

  // Filter avatars based on current filters
  const filteredAvatars = SAMPLE_AVATARS.filter((avatar) => {
    if (filters.gender && avatar.gender !== filters.gender) return false;
    if (filters.search && !avatar.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
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

    if (filters.skinTone && avatar.skinTone !== filters.skinTone) return false;
    return true;
  });

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-[#0A0A0A]/40 backdrop-blur-md z-[200] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-[28px] shadow-2xl w-full max-w-[1152px] h-[85vh] flex flex-col pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-0 shrink-0">
            <h2 className="text-[20px] font-bold text-[#0A0A0A]">Select an Avatar</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <AvatarsGrid 
                avatars={filteredAvatars} 
                onAvatarSelect={(avatar) => {
                  onSelect(avatar);
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AvatarsMarketplaceModal;
