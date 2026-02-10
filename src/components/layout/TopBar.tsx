import React from 'react';

const TopBar: React.FC = () => {
  return (
    <header className="h-14 sm:h-16 border-b border-border-light bg-bg-sidebar flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/icons/Pulsor Inc.svg" alt="Pulsor Inc" className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-semibold text-sm sm:text-base text-text-primary">Pulsor Inc.</span>
      </div>
    </header>
  );
};

export default TopBar;
