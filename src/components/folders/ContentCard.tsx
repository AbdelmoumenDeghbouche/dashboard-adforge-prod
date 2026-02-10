import React, { useState, useRef, useEffect } from 'react';
import { ContentItem } from '../../types/folders';

interface ContentCardProps {
  item: ContentItem;
  isSelected?: boolean;
  onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, isSelected = false, onClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col gap-3 sm:gap-5 p-2 sm:p-3 pr-3 sm:pr-5 pl-2 sm:pl-3 border border-[#0A0A0A]/[0.06] rounded-[20px] sm:rounded-[24px] md:rounded-[28px] cursor-pointer transition-all relative
        ${isSelected ? 'bg-[#0A0A0A]/[0.02]' : 'bg-white hover:bg-[#0A0A0A]/[0.01]'}
      `}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        {/* Left: Thumbnail + Info */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-[18px] flex-1 min-w-0">
          {/* Thumbnail */}
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-[72px] rounded-[12px] sm:rounded-[14px] md:rounded-[18px] object-cover shrink-0"
          />

          {/* Info */}
          <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-medium text-[12px] sm:text-[13px] md:text-sm leading-[18px] sm:leading-[20px] md:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] truncate">
              {item.title}
            </h3>

            {/* Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Category Badge */}
              <div className="flex items-center justify-center px-1.5 sm:px-2 md:px-2.5 py-0.5 bg-[#06E8DC]/[0.06] rounded-[8px] sm:rounded-[10px] md:rounded-xl">
                <span className="font-normal text-[11px] sm:text-[12px] md:text-sm leading-[18px] sm:leading-[20px] md:leading-[22px] tracking-[-0.007em] text-[#06E8DC]">
                  {item.category}
                </span>
              </div>

              {/* Date Badge */}
              <div className="flex items-center justify-center px-1.5 sm:px-2 md:px-2.5 py-0.5 border border-[#0A0A0A]/[0.04] rounded-[8px] sm:rounded-[10px] md:rounded-xl">
                <span className="font-normal text-[11px] sm:text-[12px] md:text-sm leading-[18px] sm:leading-[20px] md:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50">
                  {item.date}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
          {/* See More Button */}
          <button className="hidden sm:flex items-center justify-center px-2 sm:px-2.5 md:px-3 py-1 bg-white border border-[#0A0A0A]/[0.06] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[8px] sm:rounded-[10px] md:rounded-xl hover:bg-[#0A0A0A]/[0.02] transition-colors">
            <span className="font-normal text-[12px] sm:text-[13px] md:text-sm leading-[18px] sm:leading-[20px] md:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] whitespace-nowrap">
              See more
            </span>
          </button>

          {/* Menu Button Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="flex items-center justify-center w-7 h-7 sm:w-[28px] sm:h-[28px] md:w-[30px] md:h-[30px] p-1.5 sm:p-2 md:p-2.5 bg-white border border-[#0A0A0A]/[0.06] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[8px] sm:rounded-[10px] md:rounded-xl hover:bg-[#0A0A0A]/[0.02] transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="sm:w-3 sm:h-3">
                <circle cx="6" cy="2" r="1" fill="#020308"/>
                <circle cx="6" cy="6" r="1" fill="#020308"/>
                <circle cx="6" cy="10" r="1" fill="#020308"/>
              </svg>
            </button>

            {/* Actions Dropdown */}
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 p-1 gap-1 w-[120px] bg-white border border-[#0A0A0A]/[0.06] shadow-xl rounded-[18px] z-50 flex flex-col">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Rename requested for:', item.id);
                    setShowDropdown(false);
                  }}
                  className="flex items-center px-3 py-2 w-full h-[34px] rounded-[14px] hover:bg-[#0A0A0A]/[0.02] transition-all text-left group"
                >
                  <span className="font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]">
                    Rename
                  </span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Delete requested for:', item.id);
                    setShowDropdown(false);
                  }}
                  className="flex items-center px-3 py-2 w-full h-[34px] rounded-[14px] hover:bg-[#FF4D4D]/[0.04] transition-all text-left group"
                >
                  <span className="font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#FF4D4D]">
                    Delete
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
