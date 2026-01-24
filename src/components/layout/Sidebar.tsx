import React, { useState } from 'react';
import SidebarHeader from '../sidebar/SidebarHeader';
import SearchBox from '../sidebar/SearchBox';
import NavItem from '../sidebar/NavItem';
import FolderSection from '../sidebar/FolderSection';
import ChatsSection from '../sidebar/ChatsSection';
import type { NavItem as NavItemType, Folder } from '@/types';
import { PageType } from '@/App';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      name: 'Hybrid Format',
      icon: '/icons/folder.svg',
      expanded: true,
      chats: [
        { id: 'c1', title: 'Desire' },
        { id: 'c2', title: 'Objection' },
        { id: 'c3', title: 'Problem/Solution' },
      ],
    },
    {
      id: '2',
      name: 'UGC Storytelling Format',
      icon: '/icons/folder.svg',
      expanded: false,
      chats: [],
    },
    {
      id: '3',
      name: 'Cinematic Format',
      icon: '/icons/folder.svg',
      expanded: false,
      chats: [],
    },
  ]);

  const toggleFolder = (id: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, expanded: !folder.expanded } : folder
      )
    );
  };

  const handleNavItemClick = (label: string) => {
    if (label === 'AI Avatars') {
      onNavigate('ai-avatars');
    } else if (label === 'New chat' || label === 'Products') {
      onNavigate('home');
    }
  };

  const navItems: NavItemType[] = [
    { id: '1', label: 'New chat', icon: '/icons/new chat.svg', active: currentPage === 'home' },
    { id: '2', label: 'Products', icon: '/icons/products.svg' },
    { id: '3', label: 'AI Avatars', icon: '/icons/AI Avatars.svg', active: currentPage === 'ai-avatars' },
  ];

  return (
    <aside 
      style={{ width: '280px' }}
      className="hidden lg:fixed lg:block left-0 top-0 h-screen bg-bg-sidebar overflow-y-auto scrollbar-hide z-40"
    >
      <div 
        style={{
          width: '244px',
          minHeight: '792px',
          marginTop: '8px',
          marginLeft: '18px',
        }}
        className="flex flex-col gap-6"
      >
        <SidebarHeader />
        <SearchBox />

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.id} 
              {...item} 
              onClick={() => handleNavItemClick(item.label)}
            />
          ))}
        </nav>

        <FolderSection folders={folders} onToggle={toggleFolder} />
        <ChatsSection />
      </div>
    </aside>
  );
};

export default Sidebar;
