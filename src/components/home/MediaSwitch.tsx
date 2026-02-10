import React from 'react';
import { cn } from '@/utils/cn';

interface MediaSwitchProps {
  selected: 'video' | 'image';
  onSelect: (value: 'video' | 'image') => void;
}

const MediaSwitch: React.FC<MediaSwitchProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-row items-center p-0.5 sm:p-1 gap-0.5 sm:gap-1 w-auto sm:w-[168px] h-[30px] sm:h-[34px] bg-[#0A0A0A]/[0.04] border border-[#0A0A0A]/[0.04] rounded-[12px] sm:rounded-[14px]">
      {/* Video Button */}
      <button
        onClick={() => onSelect('video')}
        className={cn(
          "flex flex-row items-center justify-center p-[4px_6px] sm:p-[6px_8px] gap-1 sm:gap-2 h-[22px] sm:h-[26px] rounded-[10px] sm:rounded-[12px] transition-all duration-200 whitespace-nowrap",
          selected === 'video'
            ? "bg-white shadow-[0px_24px_24px_-12px_rgba(6,86,134,0.02),0px_2px_4px_rgba(0,0,0,0.02),0px_1px_2px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(6,86,134,0.04)] text-[#0A0A0A]"
            : "text-[#0A0A0A]/70 hover:bg-white/40"
        )}
      >
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
          <img src="/icons/video.svg" alt="" className="w-full h-full opacity-60" />
        </div>
        <span className="font-medium text-[12px] sm:text-[14px] leading-[18px] sm:leading-[22px] tracking-[-0.012em]">
          Video
        </span>
      </button>

      {/* Image Button */}
      <button
        onClick={() => onSelect('image')}
        className={cn(
          "flex flex-row items-center justify-center p-[4px_6px] sm:p-[6px_8px] gap-1 sm:gap-2 h-[22px] sm:h-[26px] rounded-[10px] sm:rounded-[12px] transition-all duration-200 opacity-50 whitespace-nowrap",
          selected === 'image'
            ? "bg-white shadow-[0px_24px_24px_-12px_rgba(6,86,134,0.02),0px_2px_4px_rgba(0,0,0,0.02),0px_1px_2px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(6,86,134,0.04)] text-[#0A0A0A]"
            : "text-[#0A0A0A]/70 hover:bg-white/40"
        )}
      >
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
          <img src="/icons/image.svg" alt="" className="w-full h-full opacity-60" />
        </div>
        <span className="font-medium text-[12px] sm:text-[14px] leading-[18px] sm:leading-[22px] tracking-[-0.012em]">
          Image
        </span>
      </button>
    </div>
  );
};

export default MediaSwitch;
