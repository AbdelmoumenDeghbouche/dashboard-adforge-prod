import React from 'react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { cn } from '@/utils/cn';

const SuggestionsList: React.FC = () => {
  const { suggestions, selectedId, selectSuggestion } = useSuggestions();

  return (
    <div className="flex flex-col gap-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => selectSuggestion(suggestion.id)}
          className={cn(
            'flex items-center justify-between gap-4 p-4 rounded-lg border transition-all text-left',
            selectedId === suggestion.id
              ? 'border-accent-primary bg-bg-selected'
              : 'border-border-light bg-white hover:border-border-medium hover:shadow-sm hover:-translate-y-0.5'
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src={suggestion.icon} alt="" className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm text-text-primary">{suggestion.text}</span>
          </div>
          
          <svg 
            className="w-5 h-5 text-text-tertiary flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default SuggestionsList;
