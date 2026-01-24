import React from 'react';
import { cn } from '@/utils/cn';

interface MediaToggleProps {
  value: 'video' | 'image' | 'chatmode';
  active?: boolean;
  onClick?: () => void;
  hasDropdown?: boolean;
}

const MediaToggle: React.FC<MediaToggleProps> = ({ value, active = false, onClick, hasDropdown = false }) => {
  const labels = {
    video: 'Video',
    image: 'Image',
    chatmode: 'Chatmode',
  };

  const icons = {
    video: '/icons/video.svg',
    image: '/icons/image.svg',
    chatmode: '/icons/chatmode.svg',
  };

  // Different dimensions for chatmode vs other buttons
  const getButtonStyle = () => {
    if (value === 'chatmode') {
      return {
        width: '135px',
        height: '34px',
        paddingTop: '6px',
        paddingRight: '12px',
        paddingBottom: '6px',
        paddingLeft: '10px',
        gap: '8px',
        borderRadius: '14px',
      };
    }
    return {
      width: '77px',
      height: '26px',
      paddingTop: '6px',
      paddingRight: '8px',
      paddingBottom: '6px',
      paddingLeft: '6px',
      gap: '8px',
      borderRadius: '12px',
    };
  };

  return (
    <button
      onClick={onClick}
      style={getButtonStyle()}
      className={cn(
        'flex items-center text-xs font-medium transition-all whitespace-nowrap',
        active
          ? 'bg-white/80 text-text-primary border border-border-light'
          : 'bg-transparent text-text-secondary hover:bg-bg-hover'
      )}
    >
      {active && (
        <span className="w-2 h-2 rounded-full bg-gray-900"></span>
      )}
      <img src={icons[value]} alt="" className={cn('w-4 h-4')} />
      <span>{labels[value]}</span>
      {hasDropdown && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
};

export default MediaToggle;
