import React from 'react';
import { cn } from '@/utils/cn';

const suggestions = [
  { id: '1', text: 'Draft a complaint for excessive child labor', opacity: 0.5 },
  { id: '2', text: 'Create a new Instagram post to announce my burnout', isActive: true },
  { id: '3', text: 'Create a new Instagram post to announce my career change to chef', opacity: 0.5 },
];

const SuggestionsList: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-0 gap-2 w-full">
      {suggestions.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex flex-row items-center p-[12px_16px] gap-[10px] w-full h-[46px] rounded-[16px] border border-transparent transition-all duration-200",
            item.isActive 
              ? "bg-[#0A0A0A]/[0.04] opacity-100 cursor-pointer hover:bg-[#0A0A0A]/[0.06]" 
              : "opacity-35 cursor-default"
          )}
        >
          <div className="flex flex-row items-center gap-2 w-full">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <img src="/icons/suggested.svg" alt="" className="w-full h-full opacity-40" />
            </div>
            <span className="font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A] flex-1 text-left">
              {item.text}
            </span>
            {item.isActive && (
              <div className="w-4 h-4 opacity-50 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 5L9 5M9 5L5 1M9 5L5 9" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default SuggestionsList;
