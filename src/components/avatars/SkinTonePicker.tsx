import React from 'react';
import { cn } from '@/utils/cn';

interface SkinTonePickerProps {
  tones: string[];
  selected: string | null;
  onSelect: (tone: string) => void;
}

const SkinTonePicker: React.FC<SkinTonePickerProps> = ({ tones, selected, onSelect }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {tones.map((tone) => (
        <button
          key={tone}
          onClick={() => onSelect(tone)}
          className={cn(
            'w-8 h-8 rounded-full border-2 transition-all',
            selected === tone 
              ? 'border-gray-900 scale-110' 
              : 'border-gray-200 hover:border-gray-400'
          )}
          style={{ backgroundColor: tone }}
          aria-label={`Select skin tone ${tone}`}
        />
      ))}
    </div>
  );
};

export default SkinTonePicker;
