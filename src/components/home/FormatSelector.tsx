import React, { useState } from 'react';

interface Format {
  id: string;
  name: string;
}

const fakeFormats: Format[] = [
  { id: 'desire', name: 'Desire' },
  { id: 'objection', name: 'Objection' },
  { id: 'problem-solution', name: 'Problem/Solution' },
];

interface FormatSelectorProps {
  selected: string | null;
  onSelect: (formatId: string) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedFormat = fakeFormats.find(f => f.id === selected);

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-border-light text-xs sm:text-sm text-text-primary hover:bg-bg-hover transition-all w-full sm:w-auto justify-between bg-white"
      >
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="text-text-tertiary">
            {selectedFormat ? selectedFormat.name : 'Select a format'}
          </span>
        </div>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white border border-border-light rounded-lg shadow-lg z-20">
            {fakeFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => {
                  onSelect(format.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 hover:bg-bg-hover transition-all text-left border-b border-border-light last:border-b-0 text-sm text-text-primary"
              >
                {format.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FormatSelector;
