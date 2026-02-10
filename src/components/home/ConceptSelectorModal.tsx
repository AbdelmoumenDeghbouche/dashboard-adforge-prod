import React from 'react';
import { createPortal } from 'react-dom';

interface Concept {
  id: string;
  title: string;
  description: string;
  painPoints: string[];
}

const concepts: Concept[] = [
  {
    id: 'antibiotic-yo-yo',
    title: 'Antibiotic Yo-Yo',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet',
    painPoints: [
      'Dryness and pH changes from menopause',
      'Skeptical after trying multiple failed solutions',
      'Concerned about side effects and ingredient safety'
    ]
  },
  {
    id: 'tried-everything',
    title: 'Tried Everything',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet',
    painPoints: [
      'Dryness and pH changes from menopause',
      'Skeptical after trying multiple failed solutions',
      'Concerned about side effects and ingredient safety'
    ]
  },
  {
    id: 'mental-load',
    title: 'Mental Load',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet',
    painPoints: [
      'Dryness and pH changes from menopause',
      'Skeptical after trying multiple failed solutions',
      'Concerned about side effects and ingredient safety'
    ]
  },
  {
    id: 'daily-confidence',
    title: 'Daily Confidence',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet',
    painPoints: [
      'Dryness and pH changes from menopause',
      'Skeptical after trying multiple failed solutions',
      'Concerned about side effects and ingredient safety'
    ]
  }
];

interface ConceptSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (concept: Concept) => void;
}

const ConceptSelectorModal: React.FC<ConceptSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

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
            <h2 className="text-[20px] font-bold text-[#0A0A0A]">Select a concept</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Grid Area */}
          <div className="p-8 pt-2 overflow-y-auto max-h-[80vh] scrollbar-hide">
            <div className="grid grid-cols-2 gap-4">
              {concepts.map((concept) => (
                <div 
                  key={concept.id}
                  className="flex flex-col p-6 gap-5 bg-white border border-[#0A0A0A]/[0.06] rounded-[24px] hover:border-[#0A0A0A]/[0.1] transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[17px] font-bold text-[#0A0A0A]">{concept.title}</h3>
                    <p className="text-[14px] leading-[22px] text-[#0A0A0A]/40 font-medium">
                      {concept.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[12px] font-bold text-[#0A0A0A]/40 tracking-wider uppercase">
                      Pain points
                    </span>
                    <div className="flex flex-col gap-2.5">
                      {concept.painPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-[18px] h-[18px] rounded-full bg-[#0A0A0A]/[0.04] flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M5 2V8M2 5H8" stroke="#0A0A0A" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <span className="text-[13px] font-medium text-[#0A0A0A]/70">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelect(concept);
                      onClose();
                    }}
                    className="mt-2 flex flex-row justify-center items-center px-6 py-2 h-[38px] w-full bg-[#0A0A0A] rounded-full font-bold text-[13px] text-white hover:bg-black/90 transition-all active:scale-[0.98] gap-1.5"
                  >
                    Continue with this concept
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="translate-x-0.5">
                      <path d="M1 9L5 5L1 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4" />
        </div>
      </div>
    </>,
    document.body
  );
};

export default ConceptSelectorModal;
