import React from 'react';

interface ScriptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData?: {
    title: string;
    fullScript: string;
    callToAction: string;
    hook: string;
    story: string;
    metrics: {
      hook: number;
      mechanism: number;
      believability: number;
      cta: number;
    };
  };
  onGenerateVideo?: () => void;
}

const ScriptDetailsModal: React.FC<ScriptDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  scriptData,
  onGenerateVideo 
}) => {
  if (!isOpen) return null;

  // Default data if not provided
  const data = scriptData || {
    title: "Loss Aversion",
    fullScript: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue.\n\nVestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, et maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut ante condimentum, vel cursus ante placerat. In iaculis arcu eros, eget tempus orci facilisis id.\n\nUt et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus.",
    callToAction: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur.",
    hook: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur.",
    story: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, et maximus ante fermentum sit amet.",
    metrics: {
      hook: 9.0,
      mechanism: 8.5,
      believability: 6.5,
      cta: 7.5
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-3">
        <div 
          className="bg-white rounded-[20px] sm:rounded-[24px] shadow-[0px_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[560px] h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[#0A0A0A]/[0.06]">
            <h2 className="font-semibold text-[18px] sm:text-[19px] leading-[26px] tracking-[-0.012em] text-[#0A0A0A]">
              Script "{data.title}"
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M13 1L1 13M1 1L13 13" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="flex flex-col gap-6">
              {/* Full Script */}
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-[15px] sm:text-[16px] leading-[22px] tracking-[-0.01em] text-[#0A0A0A]">
                  Full Script
                </h3>
                <div className="font-normal text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.006em] text-[#0A0A0A]/[0.75] space-y-4">
                  {data.fullScript.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Call to Action & Hook */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="flex flex-col gap-2.5 bg-[#F7F7F7] rounded-[12px] p-4">
                  <h3 className="font-semibold text-[14px] sm:text-[15px] leading-[20px] tracking-[-0.01em] text-[#0A0A0A]">
                    Call to Action
                  </h3>
                  <p className="font-normal text-[13px] sm:text-[14px] leading-[21px] tracking-[-0.006em] text-[#0A0A0A]/[0.75]">
                    {data.callToAction}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 bg-[#F7F7F7] rounded-[12px] p-4">
                  <h3 className="font-semibold text-[14px] sm:text-[15px] leading-[20px] tracking-[-0.01em] text-[#0A0A0A]">
                    Hook
                  </h3>
                  <p className="font-normal text-[13px] sm:text-[14px] leading-[21px] tracking-[-0.006em] text-[#0A0A0A]/[0.75]">
                    {data.hook}
                  </p>
                </div>
              </div>

              {/* Visual Direction */}
              <div className="flex flex-col gap-3 bg-[#E6FFFD] rounded-[12px] p-4">
                <h3 className="font-semibold text-[15px] sm:text-[16px] leading-[22px] tracking-[-0.01em] text-[#06E8DC]">
                  Visual Direction
                </h3>
                <p className="font-normal text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.006em] text-[#0A0A0A]/[0.75]">
                  {data.story}
                </p>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-2">
                <div className="flex items-center gap-2 bg-[#F5F5F5] px-3 py-1.5 rounded-lg">
                  <span className="font-medium text-[13px] sm:text-[14px] leading-[18px] text-[#0A0A0A]/[0.55]">Hook:</span>
                  <span className="font-bold text-[14px] sm:text-[15px] leading-[20px] text-[#0A0A0A]">
                    {typeof data.metrics.hook === 'number' ? data.metrics.hook.toFixed(1) : data.metrics.hook}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#F5F5F5] px-3 py-1.5 rounded-lg">
                  <span className="font-medium text-[13px] sm:text-[14px] leading-[18px] text-[#0A0A0A]/[0.55]">Mechanism:</span>
                  <span className="font-bold text-[14px] sm:text-[15px] leading-[20px] text-[#0A0A0A]">
                    {typeof data.metrics.mechanism === 'number' ? data.metrics.mechanism.toFixed(1) : data.metrics.mechanism}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#F5F5F5] px-3 py-1.5 rounded-lg">
                  <span className="font-medium text-[13px] sm:text-[14px] leading-[18px] text-[#0A0A0A]/[0.55]">Believability:</span>
                  <span className="font-bold text-[14px] sm:text-[15px] leading-[20px] text-[#0A0A0A]">
                    {typeof data.metrics.believability === 'number' ? data.metrics.believability.toFixed(1) : data.metrics.believability}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#F5F5F5] px-3 py-1.5 rounded-lg">
                  <span className="font-medium text-[13px] sm:text-[14px] leading-[18px] text-[#0A0A0A]/[0.55]">CTA:</span>
                  <span className="font-bold text-[14px] sm:text-[15px] leading-[20px] text-[#0A0A0A]">
                    {typeof data.metrics.cta === 'number' ? data.metrics.cta.toFixed(1) : data.metrics.cta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-[#0A0A0A]/[0.06]">
            <button
              onClick={onClose}
              className="px-5 sm:px-6 py-2 h-[38px] sm:h-[40px] bg-white border border-[#E5E5E5] text-[#0A0A0A] rounded-[12px] sm:rounded-[14px] font-medium text-[13px] sm:text-[14px] leading-[20px] tracking-[-0.006em] hover:bg-[#F9FAFB] transition-all active:scale-[0.98] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
            >
              Return
            </button>
            <button
              onClick={() => {
                onGenerateVideo?.();
                onClose();
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2 h-[38px] sm:h-[40px] bg-[#0A0A0A] text-white rounded-[12px] sm:rounded-[14px] font-medium text-[13px] sm:text-[14px] leading-[20px] tracking-[-0.006em] hover:bg-black/90 transition-all active:scale-[0.98] shadow-[0px_2px_8px_rgba(0,0,0,0.12)]"
            >
              <span>Generate video</span>
              <svg width="5" height="9" viewBox="0 0 6 10" fill="none" className="translate-x-0.5">
                <path d="M1 9L5 5L1 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScriptDetailsModal;
