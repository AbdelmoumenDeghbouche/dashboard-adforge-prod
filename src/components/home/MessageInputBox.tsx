import React, { useState } from 'react';
import ProductSelector from './ProductSelector';
import MediaSwitch from './MediaSwitch';
import ChatmodeDropdown from './ChatmodeDropdown';
import type { MediaType } from '@/types';

const MessageInputBox: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaType>('video');

  const handleSend = () => {
    if (inputText.trim()) {
      console.log('Sending:', { inputText, selectedProduct, selectedMedia });
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-border-light rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Format Button */}
        <button
          style={{
            width: '148px',
            height: '34px',
            paddingTop: '6px',
            paddingRight: '12px',
            paddingBottom: '6px',
            paddingLeft: '6px',
            gap: '8px',
            borderRadius: '14px',
          }}
          className="flex items-center gap-2 border border-border-light hover:bg-bg-hover transition-all text-sm text-text-secondary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Select a format</span>
        </button>

        {/* Text Input Area */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your request..."
          rows={3}
          className="w-full outline-none text-sm text-text-primary placeholder:text-text-tertiary resize-none"
        />

        {/* Controls Row */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap border-t border-border-light pt-4">
          {/* Product Selector */}
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            <ProductSelector selected={selectedProduct} onSelect={setSelectedProduct} />
          </div>

          {/* Media Switch (Video/Image) + Chatmode */}
          <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
            <MediaSwitch
              selected={selectedMedia === 'image' ? 'image' : 'video'}
              onSelect={(value) => setSelectedMedia(value)}
            />
            <ChatmodeDropdown
              selected="chatmode"
              onSelect={(id) => console.log('Selected chatmode option:', id)}
            />
          </div>

          {/* Arrow Button */}
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md hover:bg-bg-hover transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInputBox;
