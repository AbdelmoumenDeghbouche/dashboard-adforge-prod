import React from 'react';
import { Folder } from '../../types/folders';


interface FolderItemProps {
  folder: Folder;
  onToggle: (folderId: string) => void;
  onSelectChild: (childId: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, onToggle, onSelectChild }) => {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Parent Folder */}
      <button
        onClick={() => onToggle(folder.id)}
        className="flex items-center justify-between px-2 pr-3.5 py-2 gap-2 rounded-[14px] opacity-70 hover:opacity-100 hover:bg-[#0A0A0A]/[0.02] transition-all"
      >
        <div className="flex items-center gap-2">
          {/* Folder Icon */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 5C2 3.89543 2.89543 3 4 3H6.17157C6.70201 3 7.21071 3.21071 7.58579 3.58579L8.41421 4.41421C8.78929 4.78929 9.29799 5 9.82843 5H14C15.1046 5 16 5.89543 16 7V13C16 14.1046 15.1046 15 14 15H4C2.89543 15 2 14.1046 2 13V5Z"
                stroke="#0A0A0A"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <path
                d="M2 9H16"
                stroke="#0A0A0A"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Folder Name */}
          <span className="font-medium text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
            {folder.name}
          </span>
        </div>

        {/* Arrow Icon */}
        {folder.children && folder.children.length > 0 && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={`transition-transform ${folder.isExpanded ? 'rotate-0' : '-rotate-90'}`}
          >
            <path
              d="M2.5 3.5L5 6L7.5 3.5"
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </svg>
        )}
      </button>

      {/* Nested Children */}
      {folder.isExpanded && folder.children && folder.children.length > 0 && (
        <div className="flex flex-row items-start pl-2 gap-0">
          {/* Vertical Line */}
          <div className="flex items-center justify-center w-6 h-auto">
            <div className="w-px bg-[#0A0A0A]/[0.08] h-full" />
          </div>

          {/* Children List */}
          <div className="flex flex-col gap-0.5 flex-1">
            {folder.children.map((child) => (
              <button
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={`
                  px-4 py-2 rounded-[14px] transition-all text-left
                  ${child.isSelected 
                    ? 'bg-[#0A0A0A]/[0.04] opacity-100' 
                    : 'opacity-70 hover:opacity-100 hover:bg-[#0A0A0A]/[0.02]'
                  }
                `}
              >
                <span className="font-medium text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
                  {child.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderItem;
