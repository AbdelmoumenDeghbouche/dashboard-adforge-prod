import React from 'react';
import { cn } from '@/utils/cn';

interface MediaSwitchProps {
  selected: 'video' | 'image';
  onSelect: (value: 'video' | 'image') => void;
}

const MediaSwitch: React.FC<MediaSwitchProps> = ({ selected, onSelect }) => {
  return (
    <div 
      style={{
        width: '168px',
        height: '34px',
        gap: '4px',
        borderRadius: '14px',
        padding: '4px',
      }}
      className="flex items-center bg-gray-100 border border-border-light"
    >
      <button
        onClick={() => onSelect('video')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 h-full rounded-[10px] text-xs font-medium transition-all',
          selected === 'video'
            ? 'bg-white text-text-primary shadow-sm'
            : 'bg-transparent text-text-secondary hover:text-text-primary'
        )}
      >
        <img src="/icons/video.svg" alt="" className="w-4 h-4" />
        <span>Video</span>
      </button>
      
      <button
        onClick={() => onSelect('image')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 h-full rounded-[10px] text-xs font-medium transition-all',
          selected === 'image'
            ? 'bg-white text-text-primary shadow-sm'
            : 'bg-transparent text-text-secondary hover:text-text-primary'
        )}
      >
        <img src="/icons/image.svg" alt="" className="w-4 h-4" />
        <span>Image</span>
      </button>
    </div>
  );
};

export default MediaSwitch;
