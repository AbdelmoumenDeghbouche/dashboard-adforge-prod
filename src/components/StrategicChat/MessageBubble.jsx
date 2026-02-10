/**
 * Message Bubble Component
 * Simple text message display for agent/user messages
 */
export default function MessageBubble({ content, isAgent }) {
  return (
    <div 
      className={`
        px-5 py-3 rounded-2xl max-w-2xl
        ${isAgent 
          ? 'bg-[#1A1A1A] border border-[#262626] text-gray-200' 
          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        }
      `}
    >
      <div className="text-sm whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}

