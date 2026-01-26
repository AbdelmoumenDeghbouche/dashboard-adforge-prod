import React from 'react';
import { cn } from '@/utils/cn';
import { TabType } from '@/types/avatars';

interface TabSwitchProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { 
    id: 'marketplace' as const, 
    label: 'Marketplace',
    icon: (
      <img src="/icons/marketplace.svg" alt="Marketplace" className="w-4 h-4" />
    )
  },
  { 
    id: 'your-avatars' as const, 
    label: 'Your avatars',
    icon: (
      <img src="/icons/your avatars.svg" alt="Your avatars" className="w-4 h-4" />
    )
  },
];

const TabSwitch: React.FC<TabSwitchProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        padding: '4px',
        gap: '4px',
        borderRadius: '14px',
      }}
      className="inline-flex bg-gray-100"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-[10px]',
            activeTab === tab.id
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSwitch;
