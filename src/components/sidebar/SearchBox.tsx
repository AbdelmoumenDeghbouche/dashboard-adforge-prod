import React from 'react';

const SearchBox: React.FC = () => {
  return (
    <div className="relative" style={{ width: '244px' }}>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4">
        <img src="/icons/search.svg" alt="" className="w-full h-full opacity-50" />
      </div>
      <input
        type="text"
        placeholder="Search chat"
        style={{
          width: '244px',
          height: '38px',
          borderRadius: '14px',
          borderWidth: '1px',
          padding: '8px',
          paddingLeft: '32px',
        }}
        className="bg-white border border-border-light text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary font-medium">
        ⌘+K
      </div>
    </div>
  );
};

export default SearchBox;
