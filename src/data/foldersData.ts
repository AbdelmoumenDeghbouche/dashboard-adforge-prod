import { Folder, ContentItem, ChatItem, NavigationItem } from '../types/folders';

export const navigationItems: NavigationItem[] = [
  { id: 'new-chat', name: 'New chat', icon: 'new-chat', route: '/new-chat' },
  { id: 'products', name: 'Products', icon: 'products', route: '/products' },
  { id: 'ai-avatars', name: 'AI Avatars', icon: 'ai-avatars', route: '/ai-avatars' },
];

export const folders: Folder[] = [
  {
    id: 'hybrid-format',
    name: 'Hybrid Format',
    icon: 'folder',
    isExpanded: true,
    children: [
      { id: 'desire', name: 'Desire', parentId: 'hybrid-format', isSelected: true },
      { id: 'objection', name: 'Objection', parentId: 'hybrid-format', isSelected: false },
      { id: 'problem-solution', name: 'Problem/Solution', parentId: 'hybrid-format', isSelected: false },
    ],
  },
  {
    id: 'ugc-format',
    name: 'UGC Storytelling Format',
    icon: 'folder',
    isExpanded: false,
    children: [],
  },
  {
    id: 'cinematic-format',
    name: 'Cinematic Format',
    icon: 'folder',
    isExpanded: false,
    children: [],
  },
];

export const contentItems: ContentItem[] = [
  {
    id: '1',
    title: 'UGC Storytelling Serum Bronzant',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    category: 'Desire',
    date: '22 Jan 2025',
    folderId: 'desire',
    categoryColor: '#06E8DC',
  },
  {
    id: '2',
    title: 'UGC Storytelling Serum Bronzant',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    category: 'Desire',
    date: '22 Jan 2025',
    folderId: 'desire',
    categoryColor: '#06E8DC',
  },
  {
    id: '3',
    title: 'UGC Storytelling Serum Bronzant',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    category: 'Desire',
    date: '22 Jan 2025',
    folderId: 'desire',
    categoryColor: '#06E8DC',
  },
  {
    id: '4',
    title: 'UGC Storytelling Serum Bronzant',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    category: 'Desire',
    date: '22 Jan 2025',
    folderId: 'desire',
    categoryColor: '#06E8DC',
  },
];

export const chatItems: ChatItem[] = [
  {
    id: 'chat-1',
    title: 'New chat...',
    thumbnail: 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=50&h=50&fit=crop',
  },
  {
    id: 'chat-2',
    title: 'New chat...',
    thumbnail: 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=50&h=50&fit=crop',
  },
  {
    id: 'chat-3',
    title: 'New chat...',
    thumbnail: 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=50&h=50&fit=crop',
  },
  {
    id: 'chat-4',
    title: 'New chat...',
    thumbnail: 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=50&h=50&fit=crop',
  },
];
