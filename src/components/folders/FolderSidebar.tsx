import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SearchBar from './SearchBar';
import NavigationItem from './NavigationItem';
import FolderItem from './FolderItem';
import ChatItem from './ChatItem';
import { navigationItems, folders as initialFolders, chatItems } from '../../data/foldersData';
import { Folder } from '../../types/folders';

const FolderSidebar: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);

  const handleToggleFolder = (folderId: string) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  const handleSelectChild = (childId: string) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) => ({
        ...folder,
        children: folder.children?.map((child) => ({
          ...child,
          isSelected: child.id === childId,
        })),
      }))
    );
  };

  return (
    <div className="w-[280px] h-screen flex flex-col px-[18px] py-2 gap-6">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <SidebarHeader />
        <SearchBar />
      </div>

      {/*  Main Content */}
      <div className="flex flex-col gap-10 flex-1">
        {/* Navigation Section */}
        <div className="flex flex-col gap-0.5">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.id}
              icon={item.icon as any}
              label={item.name}
            />
          ))}
        </div>

        {/* Folders Section */}
        <div className="flex flex-col gap-2.5">
          {/* Folders Header */}
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50">
              Folders
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="#0A0A0A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Folders List */}
          <div className="flex flex-col gap-0.5">
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                onToggle={handleToggleFolder}
                onSelectChild={handleSelectChild}
              />
            ))}
          </div>
        </div>

        {/* Chats Section */}
        <div className="flex flex-col gap-2.5">
          {/* Chats Header */}
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50">
              Chats
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="#0A0A0A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Chats List */}
          <div className="flex flex-col gap-0.5">
            {chatItems.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderSidebar;
