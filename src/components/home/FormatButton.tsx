import React from 'react';

interface FormatButtonProps {
  onClick?: () => void;
}

const FormatButton: React.FC<FormatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-[14px] border border-border-light hover:bg-bg-hover transition-all text-sm text-text-secondary"
      style={{
        width: '148px',
        height: '34px',
        paddingTop: '6px',
        paddingRight: '12px',
        paddingBottom: '6px',
        paddingLeft: '6px',
        gap: '8px',
        borderRadius: '14px',
      }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Select a format</span>
    </button>
  );
};

export default FormatButton;
