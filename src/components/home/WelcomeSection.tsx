import React from 'react';

const WelcomeSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full px-4 sm:px-0">
      {/* Frame 519 - Badge */}
      <div className="box-border flex flex-row items-center p-[6px_12px_6px_6px] gap-[6px] sm:gap-[10px] h-[28px] sm:h-[32px] border border-[#0A0A0A]/[0.04] rounded-[105px]">
        {/* New Tag - Frame 1707484076 */}
        <div className="flex flex-row justify-center items-center px-1.5 sm:px-2 w-[36px] sm:w-[42px] h-[18px] sm:h-[20px] bg-[#06E8DC] rounded-[113px] self-stretch">
          <span className="font-semibold text-[10px] sm:text-[12px] leading-[14px] sm:leading-[16px] text-center tracking-[-0.007em] text-white">
            New
          </span>
        </div>
        
        <span className="font-medium text-[12px] sm:text-[14px] leading-[18px] sm:leading-[22px] text-center tracking-[-0.007em] text-[#0A0A0A] whitespace-nowrap">
          Create faster with Chat Mode
        </span>
        
        <div className="hidden sm:flex flex-row items-center gap-1 h-[16px] ml-1">
          <span className="font-medium text-[12px] leading-[16px] text-center tracking-[-0.007em] text-[#0A0A0A]/50 cursor-pointer hover:underline whitespace-nowrap">
            Try it now
          </span>
          <div className="w-2 h-2 flex items-center justify-center opacity-50">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 7L7 1M7 1H3M7 1V5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Heading - Using text for perfect emoji rendering and scaling */}
      <h1 className="font-bold text-[24px] sm:text-[28px] lg:text-[32px] leading-[28px] sm:leading-[32px] lg:leading-[36px] tracking-[-0.03em] text-[#0A0A0A] text-center px-4 sm:px-0">
        Let&apos;s create AI creatives, Wassim 👋
      </h1>
    </div>
  );
};

export default WelcomeSection;
