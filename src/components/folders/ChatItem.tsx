import React from 'react';
import { ChatItem as ChatItemType } from '../../types/folders';

interface ChatItemProps {
  chat: ChatItemType;
  onClick?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-[14px] opacity-70 hover:opacity-100 hover:bg-[#0A0A0A]/[0.02] transition-all"
    >
      {/* Thumbnail */}
      <div className="w-6 h-6 flex items-center justify-center">
        <img
          src={chat.thumbnail}
          alt={chat.title}
          className="w-[18px] h-[18px] rounded-md border border-[#0A0A0A]/[0.08] object-cover"
        />
      </div>

      {/* Chat Title */}
      <span className="font-medium text-sm leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
        {chat.title}
      </span>
    </button>
  );
};

export default ChatItem;
