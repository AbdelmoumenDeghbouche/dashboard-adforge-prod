import React, { useMemo } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { PageType } from '@/App';

interface ChatsSectionProps {
  searchQuery?: string;
  onChatClick?: () => void;
  currentPage?: PageType;
}

const ChatsSection: React.FC<ChatsSectionProps> = ({ searchQuery = '', onChatClick, currentPage }) => {
  const { currentBrand, selectedChatId, selectChat } = useBrand();

  console.log('💬 ChatsSection - Brand:', currentBrand.name, 'Chat Histories:', currentBrand.chatHistories?.length || 0);

  // Get chat histories
  const chatSessions = useMemo(() => {
    const histories = currentBrand.chatHistories || [];
    
    console.log('💬 ChatsSection useMemo - Processing', histories.length, 'chat histories');
    
    const sessions = histories.map(history => ({
      id: history.id,
      title: history.title,
      timestamp: history.updatedAt
    }));

    // Always show at least one "New chat" option for empty state
    if (sessions.length === 0) {
      console.log('💬 ChatsSection - No sessions, returning new chat placeholder');
      return [{ id: 'new-chat', title: '+ Start new chat', timestamp: '' }];
    }
    
    console.log('💬 ChatsSection - Returning', sessions.length, 'sessions');
    return sessions;
  }, [currentBrand.chatHistories]);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery) {
      console.log('💬 ChatsSection - No search, showing all', chatSessions.length, 'chats');
      return chatSessions;
    }
    const query = searchQuery.toLowerCase();
    const filtered = chatSessions.filter(chat => 
      chat.title.toLowerCase().includes(query)
    );
    console.log('💬 ChatsSection - Search:', searchQuery, '- Found', filtered.length, 'chats');
    return filtered;
  }, [chatSessions, searchQuery]);

  return (
    <div className="flex flex-col items-start p-0 gap-[10px] w-full self-stretch">
      {/* Header - Chats */}
      <div className="flex flex-row items-center p-0 gap-1 h-[22px]">
        <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50 pr-1">
          Chats ({filteredChats.length})
        </span>
        <div className="w-3 h-3 flex items-center justify-center opacity-50">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-90">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      </div>

      {/* Chats List - Frame 11 */}
      <div className="flex flex-col items-start p-0 gap-0.5 w-full max-h-[400px] overflow-y-auto">
        {filteredChats.map((chat) => {
          console.log('💬 ChatsSection - Rendering chat:', chat.id, chat.title);
          const isNewChat = chat.id === 'new-chat';
          const isSelected = currentPage === 'home' && selectedChatId === chat.id;
          return (
          <button
            key={chat.id}
            onClick={() => {
              if (isNewChat) {
                selectChat(null);
              } else {
                selectChat(chat.id);
              }
              onChatClick?.();
            }}
            className={`flex flex-row items-center p-2 gap-2 w-full min-h-[38px] rounded-[14px] transition-all ${
              isSelected ? 'bg-[#0A0A0A]/[0.08] opacity-100' : 'opacity-70 hover:bg-[#0A0A0A]/[0.04] hover:opacity-100'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
               {/* Official chat icon from public/icons */}
               <img src="/icons/chat.svg" alt="" className="w-[18px] h-[18px]" />
            </div>
            <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] text-left">
              {chat.title}
            </span>
          </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatsSection;
