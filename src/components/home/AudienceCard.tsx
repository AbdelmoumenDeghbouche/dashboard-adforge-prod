import React from 'react';
import type { Audience } from '@/types/chat';

interface AudienceCardProps {
  audience: Audience;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onContinue: (id: string) => void;
}

const AudienceCard: React.FC<AudienceCardProps> = ({ 
  audience,
  isExpanded,
  onToggleExpand,
  onContinue
}) => {
  const handleToggleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleExpand();
  };

  return (
    <div className={`flex flex-col justify-between p-4 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[32px] md:rounded-[36px] gap-4 sm:gap-5 md:gap-6 w-full transition-all duration-300 ${isExpanded ? 'bg-[#0A0A0A]/[0.04]' : 'bg-white border border-[#0A0A0A]/[0.08] min-h-[340px] sm:min-h-[360px] md:h-[380px]'}`}>
      {/* Top Section */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 flex-1">
        {/* Avatar + Info */}
        <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
          <div className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] md:w-[94px] md:h-[94px] rounded-[20px] sm:rounded-[24px] md:rounded-[28px] overflow-hidden bg-gray-100 shrink-0">
            <img src={audience.avatar} alt={audience.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="text-[16px] font-medium leading-[24px] text-[#0A0A0A] -tracking-[0.007em]">
              {audience.name}
            </h3>
            
            <div className="flex flex-col gap-2">
              {audience.label && (
                <span 
                  className="text-[14px] font-medium leading-[22px] px-2 py-0.5 rounded-[10px] w-fit -tracking-[0.007em]"
                  style={{ 
                    color: audience.labelColor || '#06E8DC', 
                    backgroundColor: audience.labelColor ? `${audience.labelColor}0F` : 'rgba(6, 232, 220, 0.06)' 
                  }}
                >
                  {audience.label}
                </span>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-medium leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em]">
                  Age: {audience.age}
                </span>
                <span className="text-[14px] font-medium leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em]">
                  Gender: {audience.gender}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em]">
          {audience.description}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex flex-col gap-7 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Key Traits */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] font-semibold leading-[16px] text-[#0A0A0A]/50 uppercase -tracking-[0.007em]">
              KEY TRAITS
            </span>
            <div className="flex flex-wrap gap-2">
              {audience.traits.map((trait, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 bg-[#0A0A0A]/[0.04] rounded-[10px] text-[14px] font-medium leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Pain Points */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] font-semibold leading-[16px] text-[#0A0A0A]/50 uppercase -tracking-[0.007em]">
              PAIN POINTS
            </span>
            <div className="flex flex-col gap-0">
              {audience.painPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-[7px] w-[18px] h-[18px] rounded-full bg-[#0A0A0A]/[0.05] flex items-center justify-center shrink-0 opacity-50">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#0A0A0A]/40" />
                  </div>
                  <span className="text-[14px] font-medium leading-[22px] text-[#0A0A0A] -tracking-[0.007em] py-[7px]">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expand/Collapse Toggle */}
      <button 
        type="button"
        onClick={handleToggleExpand}
        className="flex items-center gap-2 text-[14px] font-medium leading-[22px] text-[#0A0A0A] hover:text-[#0A0A0A]/70 transition-colors w-fit -tracking-[0.007em]"
      >
        <svg 
          width="12" height="12" viewBox="0 0 12 12" fill="none" 
          className={`transition-transform duration-300 opacity-50 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isExpanded ? 'See less details' : 'See more details'}
      </button>

      {/* Continue Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onContinue(audience.id);
        }}
        className="w-full h-[34px] px-3.5 bg-[#0A0A0A] text-white rounded-[14px] font-medium text-[14px] leading-[22px] -tracking-[0.007em] hover:bg-[#0A0A0A]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 whitespace-nowrap"
      >
        <span className="truncate">Continue with this persona</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-[-90deg] shrink-0">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default AudienceCard;
