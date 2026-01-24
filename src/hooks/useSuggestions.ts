import { useState } from 'react';
import type { Suggestion } from '@/types';

const initialSuggestions: Suggestion[] = [
  {
    id: '1',
    text: 'Draft a complaint for excessive child labor',
    icon: '/icons/create a new.svg',
  },
  {
    id: '2',
    text: 'Create a new Instagram post to announce my burnout',
    icon: '/icons/create a new.svg',
  },
  {
    id: '3',
    text: 'Create a new Instagram post to announce my career change to chef',
    icon: '/icons/create a new.svg',
  },
];

export const useSuggestions = () => {
  const [suggestions] = useState<Suggestion[]>(initialSuggestions);
  const [selectedId, setSelectedId] = useState<string | null>('2'); // Second one selected by default

  const selectSuggestion = (id: string) => {
    setSelectedId(id);
    // Here you could also populate the input field
    console.log('Selected suggestion:', suggestions.find((s) => s.id === id)?.text);
  };

  return { suggestions, selectedId, selectSuggestion };
};
