import React from 'react';
import type { MarketingAngle } from '@/types/chat';

interface MarketingAngleCardProps {
  angle: MarketingAngle;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: (id: string) => void;
}

const MarketingAngleCard: React.FC<MarketingAngleCardProps> = ({ angle, isExpanded, onToggleExpand, onSelect }) => {
  const handleToggleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleExpand();
  };

  return (
    <div className={`flex flex-col justify-between p-6 rounded-[36px] gap-6 w-full transition-all duration-300 ${isExpanded ? 'bg-[#0A0A0A]/[0.04]' : 'bg-white border border-[#0A0A0A]/[0.08] h-[380px]'}`}>
      {/* Content Section */}
      <div className="flex flex-col gap-5">
        {/* Title + Score */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[16px] font-medium leading-[24px] text-[#0A0A0A] -tracking-[0.007em] flex-1">
            {angle.title}
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[rgba(6,232,220,0.06)] rounded-[10px] shrink-0">
             <div className="w-4 h-4 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0.5L9.854 5.646L15 7.5L9.854 9.354L8 14.5L6.146 9.354L1 7.5L6.146 5.646L8 0.5Z" fill="#06E8DC" fillOpacity="0.4"/>
                  <path d="M8 3L8.927 6.073L12 7L8.927 7.927L8 11L7.073 7.927L4 7L7.073 6.073L8 3Z" fill="#06E8DC"/>
                  <circle cx="13" cy="2.5" r="1.5" fill="#06E8DC"/>
                </svg>
             </div>
             <span className="text-[14px] font-medium leading-[22px] text-[#06E8DC] -tracking-[0.007em]">
               {angle.score}
             </span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em]">
          {angle.description}
        </p>

        {/* Metrics Row */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(angle.metrics).map(([key, value]) => (
            <div 
              key={key} 
              className="px-2 py-0.5 bg-[#0A0A0A]/[0.04] rounded-[10px] text-[14px] font-medium leading-[22px] -tracking-[0.007em] flex gap-1 items-center"
            >
              <span className="text-[#0A0A0A]/[0.73] capitalize">{key}:</span>
              <span className="text-[#0A0A0A]/[0.73]">{value}</span>
            </div>
          ))}
        </div>

        {/* Expand/Collapse Toggle */}
        <button 
          type="button"
          onClick={handleToggleExpand}
          className="flex items-center gap-2 text-[14px] font-medium leading-[22px] text-[#0A0A0A] hover:text-[#0A0A0A]/70 transition-colors w-fit -tracking-[0.007em]"
        >
          Why this angle works
          <svg 
            width="12" height="12" viewBox="0 0 12 12" fill="none" 
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {isExpanded && (
          <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em] animate-in fade-in slide-in-from-top-2 duration-300">
            {angle.reason}
          </p>
        )}
      </div>

      {/* Continue Button */}
      <button 
        onClick={() => onSelect(angle.id)}
        className="w-full h-[34px] px-3.5 bg-[#0A0A0A] text-white rounded-[14px] font-medium text-[14px] leading-[22px] -tracking-[0.007em] hover:bg-[#0A0A0A]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 whitespace-nowrap"
      >
        <span className="truncate">Continue with this angle</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-[-90deg] shrink-0">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default MarketingAngleCard;
