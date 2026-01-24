import React from 'react';

const TopBar: React.FC = () => {
  return (
    <header className="h-16 border-b border-border-light bg-bg-sidebar flex items-center justify-between px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/icons/Pulsor Inc.svg" alt="Pulsor Inc" className="w-6 h-6" />
        <span className="font-semibold text-text-primary">Pulsor Inc.</span>
      </div>
    </header>
  );
};

export default TopBar;
