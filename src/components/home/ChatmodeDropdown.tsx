import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface ChatmodeOption {
  id: string;
  label: string;
  icon: string;
}

const options: ChatmodeOption[] = [
  { id: 'chatmode', label: 'Chatmode', icon: '/icons/chatmode.svg' },
  { id: 'ai-avatars', label: 'AI Avatars', icon: '/icons/AI Avatars.svg' },
  { id: 'recreate-ad', label: 'Recreate an Ad', icon: '/icons/Recreat an Ad.svg' },
];

interface ChatmodeDropdownProps {
  selected: string;
  onSelect: (id: string) => void;
}

const ChatmodeDropdown: React.FC<ChatmodeDropdownProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(o => o.id === selected) || options[0];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '135px',
          height: '34px',
          paddingTop: '6px',
          paddingRight: '12px',
          paddingBottom: '6px',
          paddingLeft: '10px',
          gap: '8px',
          borderRadius: '14px',
        }}
        className="flex items-center text-xs font-medium transition-all whitespace-nowrap bg-transparent text-text-secondary hover:bg-bg-hover"
      >
        <img src={selectedOption.icon} alt="" className="w-4 h-4" />
        <span>{selectedOption.label}</span>
        <svg className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div 
            style={{
              width: '160px',
              height: '118px',
              gap: '4px',
              borderRadius: '18px',
              padding: '4px',
              opacity: 1,
            }}
            className="absolute top-full left-0 mt-2 bg-white border border-border-light shadow-lg z-20 flex flex-col"
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '152px',
                  height: '34px',
                  paddingTop: '6px',
                  paddingRight: '14px',
                  paddingBottom: '6px',
                  paddingLeft: '10px',
                  gap: '8px',
                  borderRadius: '14px',
                }}
                className={cn(
                  'flex items-center text-sm transition-all text-left',
                  selected === option.id 
                    ? 'bg-gray-100 text-text-primary font-medium' 
                    : 'text-text-secondary hover:bg-bg-hover'
                )}
              >
                <img 
                  src={option.icon} 
                  alt="" 
                  style={{
                    width: '22px',
                    height: '22px',
                    opacity: 1,
                  }}
                />
                <span 
                  className="truncate overflow-hidden text-ellipsis"
                  style={{
                    width: '100px',
                    height: '22px',
                    opacity: 1,
                  }}
                >
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
