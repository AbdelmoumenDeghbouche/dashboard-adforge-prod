import React from 'react';
import { cn } from '@/utils/cn';

interface Chat {
  id: string;
  title: string;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  expanded: boolean;
  chats: Chat[];
}

interface FolderSectionProps {
  folders: Folder[];
  onToggle: (id: string) => void;
  onChatClick: (chatId: string) => void;
}

const FolderSection: React.FC<FolderSectionProps> = ({ folders, onToggle, onChatClick }) => {
  return (
    <div className="flex flex-col items-start p-0 gap-[10px] w-full self-stretch">
      {/* Header - Folders */}
      <div className="flex flex-row items-center p-0 gap-1 h-[22px]">
        <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50 pr-1">
          Folders
        </span>
        <div className="w-3 h-3 flex items-center justify-center opacity-50">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-90">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      </div>

      <div className="flex flex-col items-start p-0 gap-0.5 w-full">
        {folders.map((folder) => (
          <div key={folder.id} className="w-full flex flex-col gap-0.5">
            {/* Folder Item - Frame 276 */}
            <button
              onClick={() => onToggle(folder.id)}
              className="flex flex-row justify-between items-center p-[8px_14px_8px_8px] gap-2 w-full h-[38px] rounded-[14px] opacity-70 hover:bg-[#0A0A0A]/[0.02]"
            >
              <div className="flex flex-row items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <div className="w-[18px] h-[18px] flex items-center justify-center">
                     <img src="/icons/folder.svg" alt="" className="w-full h-full" />
                  </div>
                </div>
                <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] whitespace-nowrap truncate">
                  {folder.name}
                </span>
              </div>
              {/* Expand Arrow - Frame */}
              <div className="w-3 h-3 flex items-center justify-center opacity-50">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform", folder.expanded && "rotate-180")}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>

            {/* Chats Listing - Frame 1707484070 */}
            {folder.expanded && folder.chats.length > 0 && (
              <div className="flex flex-row items-start pl-2 w-full">
                {/* Vertical Divider - Rectangle 3085 */}
                <div className="w-6 self-stretch flex justify-center">
                   <div className="w-[1px] bg-[#0A0A0A]/[0.08]" />
                </div>
                {/* Inner Chats Group - Frame 1707484072 */}
                <div className="flex flex-col gap-0.5 flex-1">
                  {folder.chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onChatClick(chat.id)}
                      className="flex flex-row items-center p-[8px_16px] gap-2 w-full h-[38px] rounded-[14px] opacity-70 hover:bg-[#0A0A0A]/[0.04]"
                    >
                      <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] truncate">
                        {chat.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderSection;
