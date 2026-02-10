import React from 'react';
import { cn } from '@/utils/cn';
import { TabType } from '@/types/avatars';

interface TabSwitchProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabSwitch: React.FC<TabSwitchProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-row items-center p-1 gap-1 w-auto sm:w-[260px] h-[34px] sm:h-[38px] bg-[#0A0A0A]/[0.04] rounded-[14px]">
      <button
        onClick={() => onTabChange('marketplace')}
        className={cn(
          "flex flex-row items-center justify-center p-1 gap-1.5 sm:gap-2 w-auto sm:w-[124px] h-[26px] sm:h-[30px] rounded-[12px] transition-all duration-200",
          activeTab === 'marketplace'
            ? "bg-white shadow-[0px_24px_24px_-12px_rgba(6,86,134,0.02),0px_2px_4px_rgba(0,0,0,0.02),0px_1px_2px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(6,86,134,0.04)] opacity-100"
            : "opacity-50 hover:bg-white/40"
        )}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          <img src="/icons/marketplace.svg" alt="Marketplace" className="w-full h-full opacity-60" />
        </div>
        <span className="hidden sm:inline font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A] whitespace-nowrap pr-1">
          Marketplace
        </span>
      </button>

      <button
        onClick={() => onTabChange('your-avatars')}
        className={cn(
          "flex flex-row items-center justify-center p-1 gap-1.5 sm:gap-2 w-auto sm:w-[124px] h-[26px] sm:h-[30px] rounded-[12px] transition-all duration-200",
          activeTab === 'your-avatars'
            ? "bg-white shadow-[0px_24px_24px_-12px_rgba(6,86,134,0.02),0px_2px_4px_rgba(0,0,0,0.02),0px_1px_2px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(6,86,134,0.04)] opacity-100"
            : "opacity-50 hover:bg-white/40"
        )}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          <img src="/icons/your avatars.svg" alt="Your Avatars" className="w-full h-full opacity-60" />
        </div>
        <span className="hidden sm:inline font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A] whitespace-nowrap pr-1">
          Your avatars
        </span>
      </button>
    </div>
  );
};

export default TabSwitch;
