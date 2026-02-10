import React from 'react';
import { createPortal } from 'react-dom';

interface FormatOption {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

const formatOptions: FormatOption[] = [
  {
    id: 'ugc-storytelling',
    name: 'UGC Storytelling + Product Cutaways (Hybrid Format)',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
  },
  {
    id: 'ugc-storytelling-2',
    name: 'UGC Storytelling+ Product Cutaways (Hybrid Format)',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
  },
  {
    id: 'ugc-storytelling-3',
    name: 'UGC Storytelling+ Product Cutaways (Hybrid Format)',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.',
  },
];

interface FormatSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const FormatSelectorModal: React.FC<FormatSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedId, 
  onSelect 
}) => {
  const [viewingExampleId, setViewingExampleId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const currentOption = viewingExampleId ? formatOptions.find(o => o.id === viewingExampleId) : null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div 
          className="bg-white rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[852px] flex flex-col pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 pb-3 sm:pb-4">
            {viewingExampleId ? (
              <button 
                onClick={() => setViewingExampleId(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0A0A0A]/[0.06] hover:bg-[#0A0A0A]/[0.02] transition-colors"
              >
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                  <path d="M5 9L1 5L5 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[13px] font-semibold text-[#0A0A0A]">Go back</span>
              </button>
            ) : (
              <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold text-[#0A0A0A]">Select a format</h2>
            )}
            
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 lg:p-8 pt-2 flex flex-col gap-3 sm:gap-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
            {viewingExampleId && currentOption ? (
              /* Example Detail View */
              <div className="flex gap-8 py-2 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Left: Preview Image */}
                <div className="w-[280px] aspect-[3/4] rounded-[24px] overflow-hidden bg-gray-100 shrink-0 shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=280&h=373&auto=format&fit=crop" 
                    alt="Format Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right: Info */}
                <div className="flex flex-col justify-center gap-5">
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-[22px] font-bold text-[#0A0A0A] leading-tight max-w-[320px]">
                      {currentOption.name}
                    </h3>
                    <p className="text-[14px] leading-[22px] text-[#0A0A0A]/50 font-medium max-w-[340px]">
                      {currentOption.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                        onSelect(currentOption.id);
                        onClose();
                    }}
                    className="flex flex-row justify-center items-center px-6 py-2 h-[38px] w-fit bg-white border border-[#0A0A0A]/[0.06] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-full font-bold text-[13px] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors"
                  >
                    Select this format
                  </button>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="flex flex-col gap-4">
                {formatOptions.map((option) => {
                  const isSelected = selectedId === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => onSelect(option.id)}
                      className={`group relative flex flex-col p-6 rounded-[20px] border transition-all text-left cursor-pointer ${
                        isSelected 
                          ? 'border-[#0A0A0A]/[0.08] bg-[#F9FAFB] shadow-sm' 
                          : 'border-[#0A0A0A]/[0.06] bg-white hover:border-[#0A0A0A]/[0.1] hover:bg-[#F9FAFB]/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Radio-style checkbox */}
                        <div className={`mt-1.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'bg-black border-black' : 'border-[#0A0A0A]/[0.08]'
                        }`}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-[15px] font-bold text-[#0A0A0A] leading-tight">
                              {option.name}
                            </h3>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingExampleId(option.id);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0A0A0A]/[0.06] bg-white hover:bg-[#0A0A0A]/[0.02] transition-colors shrink-0"
                            >
                              <div className="w-[18px] h-[18px] rounded-full overflow-hidden bg-gray-200">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[12px] font-semibold text-[#0A0A0A]">See an example</span>
                            </button>
                          </div>
                          
                          <p className="text-[13px] leading-[20px] text-[#0A0A0A]/50 font-medium pr-10">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-8 pt-0 mt-2">
            {/* Optional Footer Space if needed */}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default FormatSelectorModal;
