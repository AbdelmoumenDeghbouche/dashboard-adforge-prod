import React from 'react';
import { cn } from '@/utils/cn';

interface ChatmodeOption {
  id: string;
  label: string;
  icon: string;
}

const options: ChatmodeOption[] = [
  { id: 'chatmode', label: 'Chatmode', icon: '/icons/chatmode.svg' },
  { id: 'ai-avatars', label: 'AI Avatars', icon: '/icons/AI Avatars.svg' },
];

interface ChatmodeDropdownProps {
  selected: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatmodeDropdown: React.FC<ChatmodeDropdownProps> = ({ selected, onSelect, isOpen, onToggle }) => {
  const selectedOption = options.find(o => o.id === selected) || options[0];

  return (
    <div className="relative">
      {/* Trigger Button - Frame 276 */}
      <button
        onClick={onToggle}
        className="flex flex-row items-center p-[5px_10px_5px_8px] sm:p-[6px_12px_6px_10px] gap-1.5 sm:gap-2 w-auto sm:w-[135px] h-[30px] sm:h-[34px] bg-[#0A0A0A]/[0.04] rounded-[12px] sm:rounded-[14px] transition-all duration-200 hover:bg-[#0A0A0A]/[0.06]"
      >
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center shrink-0">
          <img src={selectedOption.icon} alt="" className="w-full h-full opacity-60" />
        </div>
        <span className="font-medium text-[12px] sm:text-[14px] leading-[18px] sm:leading-[22px] tracking-[-0.012em] text-[#0A0A0A]/70 truncate whitespace-nowrap">
          {selectedOption.label}
        </span>
        <div className="w-3 h-3 opacity-50 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform", isOpen && "rotate-180")}>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onToggle} />
          <div 
            className="absolute top-full left-0 mt-2 p-1 gap-1 w-[180px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0px_20px_50px_rgba(0,0,0,0.15)] rounded-[22px] z-[70] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                }}
                className={cn(
                  'flex items-center p-[8px_14px_8px_10px] gap-2.5 w-full h-[38px] rounded-xl transition-all group/item',
                  selected === option.id 
                    ? 'bg-[#0A0A0A]/[0.04] text-[#0A0A0A]' 
                    : 'text-[#0A0A0A]/50 hover:bg-[#0A0A0A]/[0.02] hover:text-[#0A0A0A]'
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <img 
                    src={option.icon} 
                    alt="" 
                    className={cn(
                      "w-full h-full transition-opacity",
                      selected === option.id ? "opacity-100" : "opacity-60 group-hover/item:opacity-100"
                    )} 
                  />
                </div>
                <span className="truncate font-medium text-[14px] leading-[22px] tracking-[-0.012em]">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatmodeDropdown;
