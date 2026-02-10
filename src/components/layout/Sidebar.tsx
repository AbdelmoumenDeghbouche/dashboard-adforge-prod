import React from 'react';
import { cn } from '@/utils/cn';
import SidebarHeader from '@/components/sidebar/SidebarHeader';
import SearchBox from '@/components/sidebar/SearchBox';
import NavItem from '@/components/sidebar/NavItem';
import FolderSection from '@/components/sidebar/FolderSection';
import ChatsSection from '@/components/sidebar/ChatsSection';
import CreditsCard from '@/components/sidebar/CreditsCard';
import SettingsSidebarContent, { SettingsTab } from '@/components/sidebar/SettingsSidebarContent';
import type { NavItem as NavItemType, Folder } from '@/types';
import { PageType } from '@/App';
import { useBrand } from '@/contexts/BrandContext';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  activeSettingsTab: SettingsTab;
  onSettingsTabChange: (tab: SettingsTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  activeSettingsTab, 
  onSettingsTabChange,
  isOpen = false,
  onClose
}) => {
  const { selectedChatId } = useBrand();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [folders, setFolders] = React.useState<Folder[]>([
    {
      id: '1',
      name: 'Hybrid Format',
      icon: '/icons/folder.svg',
      expanded: false,
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

  const navigateTo = (page: PageType) => {
    onNavigate(page);
    if (onClose) onClose();
  };

  const handleNavItemClick = (label: string) => {
    if (label === 'AI Avatars') {
      navigateTo('ai-avatars');
    } else if (label === 'Products') {
      navigateTo('products');
    } else if (label === 'New chat') {
      navigateTo('home');
    } else if (label === 'Settings') {
      navigateTo('settings');
    }
  };

  const handleChatClick = () => {
    onNavigate('folder-listing');
  };

  const navItems: NavItemType[] = [
    { id: '1', label: 'New chat', icon: '/icons/new chat.svg', active: currentPage === 'home' && !selectedChatId },
    { id: '2', label: 'Products', icon: '/icons/products.svg', active: currentPage === 'products' },
    { id: '3', label: 'AI Avatars', icon: '/icons/AI Avatars.svg', active: currentPage === 'ai-avatars' },
    { id: '5', label: 'Settings', icon: '/icons/plus.svg', active: currentPage === 'settings' },
  ];

  const isSettingsPage = currentPage === 'settings';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "fixed lg:fixed left-0 top-0 h-screen bg-bg-sidebar overflow-y-auto scrollbar-hide z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0",
          "w-[280px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full px-2 py-2 gap-6 pb-10">
          {isSettingsPage ? (
            <SettingsSidebarContent 
              onNavigate={navigateTo} 
              activeTab={activeSettingsTab}
              onTabChange={onSettingsTabChange}
            />
          ) : (
            <>
              <SidebarHeader />
              
              <div className="flex flex-col gap-5 w-full">
                 <SearchBox onSearch={setSearchQuery} />
                 <nav className="flex flex-col gap-0.5">
                   {navItems.map((item) => (
                     <NavItem 
                       key={item.id} 
                       {...item} 
                       onClick={() => handleNavItemClick(item.label)}
                     />
                   ))}
                 </nav>
              </div>

              <FolderSection folders={folders} onToggle={toggleFolder} onChatClick={handleChatClick} />
              <ChatsSection searchQuery={searchQuery} onChatClick={() => navigateTo('home')} currentPage={currentPage} />
              <div className="mt-auto w-full pt-4">
                <CreditsCard total={200} remaining={150} />
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
