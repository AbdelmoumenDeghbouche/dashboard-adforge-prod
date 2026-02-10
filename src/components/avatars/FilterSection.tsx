import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-[26px]"
      >
        <span className="font-medium text-16px leading-[26px] tracking-[-0.007em] text-[#0A0A0A]">
          {title}
        </span>
        <div className={cn("w-3 h-3 flex items-center justify-center transition-transform", !isOpen && "-rotate-90")}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="#0A0A0A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
};

export default FilterSection;
