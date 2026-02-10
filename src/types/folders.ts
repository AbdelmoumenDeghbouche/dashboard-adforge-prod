export interface Folder {
  id: string;
  name: string;
  icon: string;
  isExpanded: boolean;
  children?: FolderChild[];
}

export interface FolderChild {
  id: string;
  name: string;
  parentId: string;
  isSelected: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  date: string;
  folderId: string;
  categoryColor?: string;
}

export interface ChatItem {
  id: string;
  title: string;
  thumbnail: string;
}

export interface NavigationItem {
  id: string;
  name: string;
  icon: string;
  route: string;
}
