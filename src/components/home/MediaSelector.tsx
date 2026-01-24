import React from 'react';
import { cn } from '@/utils/cn';
import type { MediaType } from '@/types';

interface MediaSelectorProps {
  selected: MediaType;
  onSelect: (type: MediaType) => void;
}

const mediaTypes = [
  { id: 'video' as MediaType, label: 'Video', icon: '/icons/video.svg' },
  { id: 'image' as MediaType, label: 'Image', icon: '/icons/image.svg' },
  { id: 'avatars' as MediaType, label: 'AI Avatars', icon: '/icons/AI Avatars.svg' },
  { id: 'chatmode' as MediaType, label: 'Chatmode', icon: '/icons/chatmode.svg' },
];

const MediaSelector: React.FC<MediaSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap overflow-x-auto scrollbar-hide">
      {mediaTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={cn(
            'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
            selected === type.id
              ? 'bg-bg-selected border-accent-primary text-accent-primary'
              : 'border-border-light text-text-secondary hover:bg-bg-hover'
          )}
        >
          <img src={type.icon} alt="" className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline sm:inline">{type.label}</span>
        </button>
      ))}

      {/* More Options Dropdown */}
      <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-border-light hover:bg-bg-hover transition-all flex-shrink-0">
        <img src="/icons/plus.svg" alt="More" className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

export default MediaSelector;
