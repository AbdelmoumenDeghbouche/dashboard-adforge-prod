import React from 'react';

interface NavigationItemProps {
  icon: 'new-chat' | 'products' | 'ai-avatars' | 'search';
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  icon, 
  label, 
  isActive = false,
  onClick 
}) => {
  // SVG Icons based on type
  const getIcon = () => {
    switch (icon) {
      case 'new-chat':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="13" cy="13" r="4" fill="#0A0A0A"/>
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        );
      case 'products':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4"/>
            <path d="M5 8H13" stroke="#0A0A0A" strokeWidth="1.5"/>
            <circle cx="9" cy="12" r="1" fill="#0A0A0A"/>
          </svg>
        );
      case 'ai-avatars':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="5" cy="5" r="3" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4"/>
            <circle cx="13" cy="13" r="4" fill="#0A0A0A"/>
            <path d="M6 12L12 6" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        );
      case 'search':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="5" height="5" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4"/>
            <rect x="11" y="2" width="5" height="5" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4"/>
            <rect x="2" y="11" width="5" height="5" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.4"/>
            <circle cx="13.5" cy="13.5" r="2.5" fill="#0A0A0A"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-2 py-2 rounded-[14px] transition-all
        ${isActive ? 'bg-[#0A0A0A]/[0.04] opacity-100' : 'opacity-70 hover:opacity-100 hover:bg-[#0A0A0A]/[0.02]'}
      `}
    >
      {/* Icon Container */}
      <div className="w-6 h-6 flex items-center justify-center">
        {getIcon()}
      </div>

      {/* Label */}
      <span className="font-medium text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
        {label}
      </span>
    </button>
  );
};

export default NavigationItem;
