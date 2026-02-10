import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface Message {
  id: string;
  imageUrl: string;
}

const mockMessages: Message[] = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}`,
  imageUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=280&h=373&auto=format&fit=crop` // Using a placeholder for now
}));

interface MessageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

const MessageSelectionModal: React.FC<MessageSelectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    onClose();
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-[28px] shadow-2xl w-full max-w-[852px] flex flex-col pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-4">
            <h2 className="text-[20px] font-bold text-[#0A0A0A]">
              Select 5 messages <span className="text-[#0A0A0A]/30 font-medium">({selectedIds.length}/5)</span>
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-8 pb-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A0A0A]/30">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input 
                type="text"
                placeholder="Search for messages by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[46px] pl-11 pr-4 bg-[#0A0A0A]/[0.02] border border-[#0A0A0A]/[0.06] rounded-[16px] text-[14px] font-medium outline-none placeholder:text-[#0A0A0A]/20 focus:border-[#0A0A0A]/10 transition-colors"
              />
            </div>
          </div>

          {/* Grid Area */}
          <div className="px-8 pb-8 overflow-y-auto max-h-[60vh] scrollbar-hide">
            <div className="grid grid-cols-4 gap-4">
              {mockMessages.map((msg) => {
                const isSelected = selectedIds.includes(msg.id);
                return (
                  <div 
                    key={msg.id}
                    onClick={() => toggleSelection(msg.id)}
                    className="relative aspect-square rounded-[20px] overflow-hidden cursor-pointer group"
                  >
                    <img 
                      src={msg.imageUrl} 
                      alt="" 
                      className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'scale-110 blur-[2px]' : 'group-hover:scale-105'}`}
                    />
                    
                    {/* Overlay for selection state */}
                    <div className={`absolute inset-0 transition-opacity ${isSelected ? 'bg-black/10' : 'bg-transparent group-hover:bg-black/5'}`} />

                    {/* Select Badge */}
                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${isSelected ? 'bg-white text-black' : 'bg-white/90 text-black/40 group-hover:bg-white'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'bg-black border-black' : 'border-black/10'}`}>
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-[12px] font-bold">Select</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-[#0A0A0A]/[0.06] flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-[48px] bg-white border border-[#0A0A0A]/[0.06] rounded-[16px] font-bold text-[14px] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="flex-[2] h-[48px] bg-[#0A0A0A] rounded-[16px] font-bold text-[14px] text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              Confirm selection
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default MessageSelectionModal;
