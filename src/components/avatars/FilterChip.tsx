import React from 'react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-sm text-text-primary">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-gray-200 rounded-sm p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default FilterChip;
