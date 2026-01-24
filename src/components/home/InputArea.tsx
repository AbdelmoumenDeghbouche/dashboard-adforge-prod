import React, { useState } from 'react';
import MediaSelector from './MediaSelector';
import type { MediaType } from '@/types';

const InputArea: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaType>('video');

  const handleSend = () => {
    if (!inputText.trim()) return;
    console.log('Sending:', inputText, selectedMedia);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-border-light p-4 sm:p-6 shadow-md flex flex-col w-full max-w-[852px] mx-auto rounded-2xl sm:rounded-[28px] gap-4 sm:gap-6 min-h-[140px] sm:h-[184px]">
      {/* Top Section: Plus Button + Input */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md hover:bg-bg-hover transition-all flex-shrink-0">
          <img src="/icons/plus.svg" alt="Add" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your request..."
          className="flex-1 outline-none text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary min-w-0"
        />
      </div>

      {/* Bottom Section: Media Selector + Send Button */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <MediaSelector selected={selectedMedia} onSelect={setSelectedMedia} />
        
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md hover:bg-bg-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <img src="/icons/send 1.svg" alt="Send" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default InputArea;
