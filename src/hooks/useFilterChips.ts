import { useState } from 'react';
import type { FilterChip } from '@/types';

const initialChips: FilterChip[] = [
  { id: '1', label: 'Suggested', icon: '/icons/suggested.svg', active: true },
  { id: '2', label: 'Acquisition', icon: '/icons/Acquisition.svg', active: false },
  {
    id: '3',
    label: 'Social networks',
    icon: '/icons/Social networks.svg',
    active: false,
  },
  { id: '4', label: 'Marketing', icon: '/icons/marketing.svg', active: false },
  { id: '5', label: 'Emailing', icon: '/icons/emailing.svg', active: false },
  { id: '6', label: 'Advertising', icon: '/icons/Advertising.svg', active: false },
];

export const useFilterChips = () => {
  const [chips, setChips] = useState<FilterChip[]>(initialChips);

  const toggleChip = (id: string) => {
    setChips((prev) =>
      prev.map((chip) =>
        chip.id === id ? { ...chip, active: true } : { ...chip, active: false }
      )
    );
  };

  return { chips, toggleChip };
};
