import React, { useState } from 'react';
import type { Folder } from '@/types';

interface FolderSectionProps {
  folders: Folder[];
  onToggle: (id: string) => void;
}

const FolderSection: React.FC<FolderSectionProps> = ({ folders, onToggle }) => {
  const [sectionExpanded, setSectionExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-2">
      {/* Section Header */}
      <button
        onClick={() => setSectionExpanded(!sectionExpanded)}
        className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <span>Folders</span>
        <svg
          className={`w-4 h-4 transition-transform ${sectionExpanded ? 'rotate-0' : '-rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Folders List */}
      {sectionExpanded && (
        <div className="flex flex-col gap-1">
          {folders.map((folder) => (
            <div key={folder.id} className="flex flex-col">
              {/* Folder Item */}
              <button
                onClick={() => onToggle(folder.id)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-bg-hover transition-all"
              >
                <img src={folder.icon} alt="" className="w-4 h-4" />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${folder.expanded ? 'rotate-0' : '-rotate-90'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Nested Chats */}
              {folder.expanded && folder.chats.length > 0 && (
                <div className="ml-6 mt-1 flex flex-col gap-1">
                  {folder.chats.map((chat) => (
                    <button
                      key={chat.id}
                      className="text-left px-3 py-1.5 text-sm text-text-tertiary hover:text-text-secondary hover:bg-bg-hover rounded-md transition-all"
                    >
                      {chat.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderSection;
