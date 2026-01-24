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
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    id: 'your-avatars' as const, 
    label: 'Your avatars',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
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
