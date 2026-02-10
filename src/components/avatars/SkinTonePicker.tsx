import React from 'react';
import { cn } from '@/utils/cn';

interface SkinTonePickerProps {
  tones: string[];
  selected: string | null;
  onSelect: (tone: string) => void;
}

const SkinTonePicker: React.FC<SkinTonePickerProps> = ({ tones, selected, onSelect }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-2 w-full max-w-[249px] h-[32px] sm:h-[36px]">
      {tones.map((tone) => {
        const isSelected = selected === tone;
        return (
          <div 
            key={tone} 
            className={cn(
              "flex items-center justify-center rounded-full transition-all duration-200",
              isSelected ? "w-8 h-8 sm:w-9 sm:h-9 border border-[#0A0A0A]/12 p-0.5 sm:p-1" : "w-6 h-6 sm:w-7 sm:h-7"
            )}
          >
            <button
              onClick={() => onSelect(tone)}
              style={{ backgroundColor: tone }}
              className={cn(
                "w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-transform",
                "shadow-[0px_0px_0px_1px_rgba(6,86,134,0.04),0px_1px_1px_-0.5px_rgba(1,34,54,0.04),0px_3px_3px_-1.5px_rgba(1,34,54,0.06),0px_6px_8px_-3px_rgba(1,34,54,0.01),0px_6px_12px_-6px_rgba(6,86,134,0.02),0px_24px_24px_-12px_rgba(6,86,134,0.04),inset_0px_0px_0px_2px_#FFFFFF]",
                isSelected ? "scale-100" : "hover:scale-110"
              )}
              aria-label={`Select skin tone ${tone}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SkinTonePicker;
