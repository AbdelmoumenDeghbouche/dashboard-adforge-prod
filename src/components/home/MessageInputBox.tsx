import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import ProductSelector from './ProductSelector';
import MediaSwitch from './MediaSwitch';
import ChatmodeDropdown from './ChatmodeDropdown';
import FormatSelectorModal from './FormatSelectorModal';
import ConceptSelectorModal from './ConceptSelectorModal';
import AvatarsMarketplaceModal from './AvatarsMarketplaceModal';
import MessageSelectionModal from './MessageSelectionModal';
import type { MediaType } from '@/types';
import type { Avatar } from '@/types/avatars';

import QuantitySelector from './QuantitySelector';

interface MessageInputBoxProps {
  onSend?: (text: string) => void;
  onMediaChange?: (type: MediaType) => void;
  selectedMedia?: MediaType;
  selectedFormat?: string | null;
  onFormatChange?: (format: string | null) => void;
  selectedConcept?: string | null;
  onConceptChange?: (concept: string | null) => void;
  selectedProduct?: string;
  onProductChange?: (product: string) => void;
  isScriptReview?: boolean;
  scriptText?: string;
  selectedChatmode?: string;
  onChatmodeChange?: (id: string) => void;
  selectedAvatar?: Avatar | null;
  onAvatarChange?: (avatar: Avatar | null) => void;
  simpleMode?: boolean; // When true, shows only input and send button
}

const MessageInputBox: React.FC<MessageInputBoxProps> = ({ 
  onSend, 
  onMediaChange,
  selectedMedia: externalMedia = 'video',
  selectedFormat: externalFormat = null,
  onFormatChange,
  selectedConcept: externalConcept = null,
  onConceptChange,
  selectedProduct: externalProduct = '1',
  onProductChange,
  isScriptReview = false,
  scriptText = '',
  selectedChatmode = 'chatmode',
  onChatmodeChange,
  selectedAvatar: _externalAvatar = null,
  onAvatarChange,
  simpleMode = false
}) => {
  const [inputText, setInputText] = useState(scriptText);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'product' | 'chatmode' | null>(null);

  const handleMediaChange = (type: 'video' | 'image') => {
    onMediaChange?.(type);
  };

  const handleSend = () => {
    if (isImageMode && externalConcept) {
      setIsMessageModalOpen(true);
      return;
    }

    if (inputText.trim() || externalFormat || externalConcept) {
      if (onSend) onSend(inputText);
      setInputText('');
    }
  };

  const isImageMode = externalMedia === 'image';

  return (
    <div 
      className="flex flex-col justify-between items-start p-0 w-full max-w-[2215px] min-h-[120px] sm:min-h-[140px] bg-white rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] relative transition-all"
      style={{
        boxShadow: `
          0px 0px 0px 1px rgba(6, 86, 134, 0.04),
          0px 1px 1px -0.5px rgba(1, 34, 54, 0.04),
          0px 3px 3px -1.5px rgba(1, 34, 54, 0.06),
          0px 6px 8px -3px rgba(1, 34, 54, 0.01),
          0px 6px 12px -6px rgba(6, 86, 134, 0.02),
          0px 24px 24px -12px rgba(6, 86, 134, 0.04)
        `
      }}
    >
      {/* Top Selector Area - Only shown if NO format/concept is selected AND not in script review AND not in simple mode */}
      {!simpleMode && !isScriptReview && ((!isImageMode && !externalFormat) || (isImageMode && !externalConcept)) ? (
        <div className="flex flex-row items-center p-3 sm:p-4 lg:p-5 pb-0 gap-2 sm:gap-3 w-full self-stretch">
          <button 
            onClick={() => isImageMode ? setIsConceptModalOpen(true) : setIsFormatModalOpen(true)}
            className="flex flex-row items-center p-[5px_10px_5px_6px] sm:p-[6px_12px_6px_8px] gap-1.5 sm:gap-2 h-[30px] sm:h-[34px] border border-[#0A0A0A]/[0.06] rounded-[12px] sm:rounded-[14px] hover:bg-[#0A0A0A]/[0.02] transition-colors shrink-0 bg-[#F9FAFB]/50"
          >
            <div className="flex flex-row justify-center items-center w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] border border-[#0A0A0A]/[0.04] rounded-lg bg-white shadow-sm">
              <div className="w-3 sm:w-4 h-3 sm:h-4 flex items-center justify-center">
                 <img src="/icons/plus.svg" alt="" className="w-full h-full opacity-50" />
              </div>
            </div>
            <span className="font-medium text-[12px] sm:text-[14px] leading-[18px] sm:leading-[22px] tracking-[-0.012em] text-[#0A0A0A] whitespace-nowrap">
              {isImageMode 
                ? 'Select a concept to start' 
                : 'Select a format to start'}
            </span>
          </button>
        </div>
      ) : null}

      {/* Input Area */}
      <div className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 flex-1 flex flex-col gap-2 sm:gap-3">
        {/* Internal Badge - Shown if format/concept IS selected AND not in script review AND not in simple mode */}
        {!simpleMode && !isScriptReview && ((!isImageMode && externalFormat) || (isImageMode && externalConcept)) && (
          <div className="flex">
            <button 
              onClick={() => isImageMode ? setIsConceptModalOpen(true) : setIsFormatModalOpen(true)}
              className="flex flex-row items-center p-[7px_14px_7px_7px] gap-[9px] h-[39px] bg-[#0A0A0A]/[0.04] rounded-[16px] hover:bg-[#0A0A0A]/[0.06] transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.02)]"
            >
              <svg className="w-[18px] h-[18px] opacity-40" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="21" height="21" rx="7.5" stroke="#0A0A0A" strokeOpacity="0.04"/>
                <g opacity="0.5">
                  <path d="M11 6.52783V15.4723" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.52783 11H15.4723" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
              <span className="font-medium text-[12px] sm:text-[13px] md:text-[14px] leading-[18px] sm:leading-[19px] md:leading-[20px] tracking-[-0.012em] text-[#0A0A0A] whitespace-nowrap uppercase">
                {isImageMode ? externalConcept : (externalFormat ? externalFormat.split('(')[0].trim() : '')}
              </span>
            </button>
          </div>
        )}
        
        {(selectedChatmode === 'chatmode' || isScriptReview || simpleMode) && (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={simpleMode ? "Continue the conversation..." : (isScriptReview ? "Edit the script or add your notes..." : "Write your request...")}
            className={cn(
              "w-full bg-transparent border-none outline-none font-medium tracking-[-0.012em] text-[#0A0A0A] placeholder:text-[#0A0A0A]/[0.18] resize-none",
              isScriptReview 
                ? "h-[120px] text-[14px] sm:text-[15px] leading-[20px] sm:leading-[22px] text-[#0A0A0A]/70" 
                : "h-[50px] sm:h-[60px] text-[15px] sm:text-[16px] md:text-[18px] leading-[22px] sm:leading-[24px] md:leading-[26px]"
            )}
          />
        )}
      </div>

      {/* Lower Controls Area */}
      <div className="flex flex-row justify-between items-center p-2 sm:p-3 lg:p-5 sm:pt-0 w-full self-stretch mt-auto gap-2 sm:gap-3 lg:gap-4">
        {!simpleMode && (
          <div className="flex flex-wrap items-center p-0 gap-2 sm:gap-3 flex-1">
               <ProductSelector 
                 selected={externalProduct} 
                 isOpen={activeMenu === 'product'}
                 onToggle={() => setActiveMenu(activeMenu === 'product' ? null : 'product')}
                 onSelect={(id) => {
                   onProductChange?.(id);
                   setActiveMenu(null);
                 }} 
               />

               <MediaSwitch 
                 selected={externalMedia === 'avatars' ? 'video' : (externalMedia as 'video' | 'image')} 
                 onSelect={(type) => {
                   handleMediaChange(type as 'video' | 'image');
                   setActiveMenu(null);
                 }} 
               />

               {isImageMode && <QuantitySelector />}

               {!isImageMode && (
                 <ChatmodeDropdown 
                    selected={selectedChatmode}
                    isOpen={activeMenu === 'chatmode'}
                    onToggle={() => setActiveMenu(activeMenu === 'chatmode' ? null : 'chatmode')}
                    onSelect={(id: string) => {
                      console.log('Selected:', id);
                      onChatmodeChange?.(id);
                      setActiveMenu(null);
                    }}
                 />
               )}
               
               {isScriptReview && selectedChatmode === 'ai-avatars' && (
                 <button 
                   onClick={() => setIsAvatarModalOpen(true)}
                   className="flex flex-row items-center p-[5px_10px_5px_6px] sm:p-[6px_12px_6px_8px] gap-1.5 sm:gap-2 h-[30px] sm:h-[34px] border border-[#0A0A0A]/[0.06] rounded-[12px] sm:rounded-[14px] hover:bg-[#0A0A0A]/[0.02] transition-colors shrink-0 bg-white"
                 >
                   <div className="flex flex-row justify-center items-center w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] border border-[#0A0A0A]/[0.04] rounded-lg bg-white shadow-sm">
                     <div className="w-3 sm:w-4 h-3 sm:h-4 flex items-center justify-center">
                       <img src="/icons/plus.svg" alt="" className="w-full h-full opacity-50" />
                     </div>
                   </div>
                   <span className="font-medium text-[12px] sm:text-[14px] leading-[18px] sm:leading-[22px] tracking-[-0.012em] text-[#0A0A0A] whitespace-nowrap">
                     Avatar
                   </span>
                 </button>
               )}
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleSend}
          className={cn(
            "flex items-center justify-center transition-all active:scale-[0.98] shrink-0",
            simpleMode || isScriptReview || (isImageMode && externalConcept) || (!isImageMode && externalFormat)
              ? "w-10 h-10 bg-[#0A0A0A] rounded-full" 
              : "w-10 h-10 bg-[#F9FAFB] border border-[#0A0A0A]/[0.04] rounded-full hover:bg-[#0A0A0A]/[0.04]",
            simpleMode && "ml-auto"
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
             <path 
               d="M5 12H19M19 12L13 6M19 12L13 18" 
               stroke={simpleMode || isScriptReview || (isImageMode && externalConcept) || (!isImageMode && externalFormat) ? "#FFFFFF" : "#0A0A0A"} 
               strokeWidth="2" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               className={cn(!(simpleMode || isScriptReview || (isImageMode && externalConcept) || (!isImageMode && externalFormat)) && "opacity-40")} 
             />
          </svg>
        </button>
      </div>

      {/* Modals */}
      <FormatSelectorModal 
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        selectedId={externalFormat}
        onSelect={(id) => {
          onFormatChange?.(id);
          setIsFormatModalOpen(false);
        }}
      />

      <ConceptSelectorModal 
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        onSelect={(concept) => {
          onConceptChange?.(concept.title);
          setIsConceptModalOpen(false);
        }}
      />

      <AvatarsMarketplaceModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={(avatar) => {
          onAvatarChange?.(avatar);
          setIsAvatarModalOpen(false);
        }}
      />

      <MessageSelectionModal 
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        onConfirm={(ids) => {
          console.log('Selected Messages:', ids);
          if (onSend) onSend(`Selected ${ids.length} messages for concept ${externalConcept}`);
          setIsMessageModalOpen(false);
        }}
      />
    </div>
  );
};

export default MessageInputBox;
