export interface AvatarFilter {
  gender: 'male' | 'female' | null;
  age: string[];
  type: string[];
  situation: string[];
  accessories: string[];
  skinTone: string | null;
  search: string;
}

export interface Avatar {
  id: string;
  name: string;
  image: string;
  gender: 'male' | 'female';
  tags: string[];
  skinTone: string;
  isOwned?: boolean; // Flag to indicate if user owns this avatar
}

export type TabType = 'marketplace' | 'your-avatars';

export const FILTER_OPTIONS = {
  age: ['Header', 'Navigation', 'Content', 'Pricing', 'CTA', 'Team'],
  type: ['Header', 'Navigation', 'Content', 'Pricing', 'CTA', 'Team'],
  situation: ['Header', 'Navigation', 'Content', 'Pricing', 'CTA', 'Team'],
  accessories: ['Header', 'Navigation', 'Content', 'Pricing', 'CTA', 'Team'],
  skinTones: [
    '#F5E6D3',
    '#E8B896',
    '#D49A6A',
    '#B87043',
    '#8B5A3C',
    '#4A312C',
  ],
};
