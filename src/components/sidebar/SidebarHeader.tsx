import React from 'react';

const SidebarHeader: React.FC = () => {
  return (
    <div 
      style={{
        width: '244px',
        height: '52px',
        paddingTop: '8px',
        paddingRight: '14px',
        paddingBottom: '8px',
        paddingLeft: '8px',
        borderRadius: '20px',
      }}
      className="flex items-center justify-between"
    >
      {/* Logo and Plan */}
      <div className="flex items-center gap-2">
        <img src="/icons/Pulsor Inc.svg" alt="Pulsor Inc" className="w-6 h-6" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-text-primary">Pulsor Inc.</span>
          <span className="text-xs text-text-tertiary">Pro plan</span>
        </div>
      </div>

      {/* Dropdown Icon */}
      <button className="w-6 h-6 flex items-center justify-center hover:bg-bg-hover rounded transition-all">
        <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default SidebarHeader;
