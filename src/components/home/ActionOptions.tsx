import React from 'react';

interface ActionOption {
  id: string;
  label: string;
  icon: string;
}

const actionOptions: ActionOption[] = [
  { id: 'chatmode', label: 'Chatmode', icon: '/icons/chatmode.svg' },
  { id: 'ai-avatars', label: 'AI Avatars', icon: '/icons/AI Avatars.svg' },
  { id: 'recreate-ad', label: 'Recreate an Ad', icon: '/icons/recreate.svg' },
];

interface ActionOptionsProps {
  onSelect?: (id: string) => void;
}

const ActionOptions: React.FC<ActionOptionsProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      {actionOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect?.(option.id)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-light hover:bg-bg-hover hover:border-accent-primary transition-all text-left group"
        >
          <img src={option.icon} alt="" className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ActionOptions;
