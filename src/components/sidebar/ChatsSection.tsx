import React, { useState } from 'react';

const chats = [
  { id: '1', title: 'New chat...' },
  { id: '2', title: 'New chat...' },
  { id: '3', title: 'New chat...' },
  { id: '4', title: 'New chat...' },
];

const ChatsSection: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-2">
      {/* Section Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <span>Chats</span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-0' : '-rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Chats List */}
      {expanded && (
        <div className="flex flex-col gap-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-bg-hover transition-all text-left"
            >
              <img src="/icons/chat.svg" alt="" className="w-4 h-4" />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatsSection;
