// Navigation Item Type
export interface NavItem {
  id: string;
  label: string;
  icon: string; // SVG path from /icons/
  active?: boolean;
  onClick?: () => void;
}

// Folder Type
export interface Folder {
  id: string;
  name: string;
  icon: string;
  expanded: boolean;
  chats: Chat[];
}

// Chat Type
export interface Chat {
  id: string;
  title: string;
}

// Media Type
export type MediaType = 'video' | 'image' | 'avatars' | 'chatmode';

// Filter Chip Type
export interface FilterChip {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

// Suggestion Type
export interface Suggestion {
  id: string;
  text: string;
  icon: string;
}
