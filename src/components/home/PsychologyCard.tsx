import React, { useState } from 'react';
import type { PsychologyConcept } from '@/types/chat';
import ScriptDetailsModal from './ScriptDetailsModal';

interface PsychologyCardProps {
  concept: PsychologyConcept;
  onGenerateScript: (id: string) => void;
  onGenerateVideo: (id: string) => void;
}

const PsychologyCard: React.FC<PsychologyCardProps> = ({ concept, onGenerateVideo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <div className="flex flex-col p-5 md:p-6 bg-white border border-[#0A0A0A]/[0.08] rounded-[36px] gap-6 md:gap-8 w-full animate-in fade-in zoom-in duration-300">
      {/* Content Section */}
      <div className="flex flex-col gap-5">
        {/* Title + Score */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[16px] font-medium leading-[24px] text-[#0A0A0A] -tracking-[0.007em] flex-1">
            {concept.title}
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[rgba(6,232,220,0.06)] rounded-[10px] shrink-0">
             <div className="w-4 h-4 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0.5L9.854 5.646L15 7.5L9.854 9.354L8 14.5L6.146 9.354L1 7.5L6.146 5.646L8 0.5Z" fill="#06E8DC" fillOpacity="0.4"/>
                  <path d="M8 3L8.927 6.073L12 7L8.927 7.927L8 11L7.073 7.927L4 7L7.073 6.073L8 3Z" fill="#06E8DC"/>
                  <circle cx="13" cy="2.5" r="1.5" fill="#06E8DC"/>
                </svg>
             </div>
             <span className="text-[14px] font-medium leading-[22px] text-[#06E8DC] -tracking-[0.007em]">
               {concept.score}
             </span>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="flex flex-col md:flex-row items-start gap-5 md:gap-7">
          <div className="flex flex-col gap-2.5 flex-1 w-full">
            <span className="text-[12px] font-semibold leading-[16px] text-[#0A0A0A]/50 uppercase -tracking-[0.007em]">
              SCRIPT PREVIEW
            </span>
            <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em]">
              {concept.description}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 flex-1 w-full">
            <span className="text-[12px] font-semibold leading-[16px] text-[#0A0A0A]/50 uppercase -tracking-[0.007em]">
              HOOK
            </span>
            <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A]/[0.73] -tracking-[0.007em]">
              {concept.hook}
            </p>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="flex flex-wrap gap-2">
          {concept.metrics && Object.entries(concept.metrics).map(([key, value]) => (
            <div 
              key={key} 
              className="px-2 py-0.5 bg-[#0A0A0A]/[0.04] rounded-[10px] text-[14px] font-medium leading-[22px] -tracking-[0.007em] flex gap-1 items-center"
            >
              <span className="text-[#0A0A0A]/[0.73] capitalize">
                {key === 'cta' ? 'CTA' : key.charAt(0).toUpperCase() + key.slice(1)}:
              </span>
              <span className="text-[#0A0A0A]/[0.73]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 h-[34px] bg-white border border-[#EBEBEB] text-[#0A0A0A] rounded-[14px] font-medium text-[14px] leading-[22px] -tracking-[0.007em] hover:bg-[#F9FAFB] transition-all active:scale-[0.98] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] whitespace-nowrap"
        >
          See script details
        </button>
        <button 
          onClick={() => onGenerateVideo(concept.id)}
          className="flex-1 h-[34px] px-3.5 bg-[#0A0A0A] text-white rounded-[14px] font-medium text-[14px] leading-[22px] -tracking-[0.007em] hover:bg-[#0A0A0A]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] whitespace-nowrap"
        >
          <span className="truncate">Generate video</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-[-90deg] shrink-0">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Script Details Modal */}
      <ScriptDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scriptData={{
          title: concept.title,
          fullScript: concept.description,
          callToAction: concept.hook,
          hook: concept.hook,
          story: concept.description,
          metrics: {
            hook: parseFloat(concept.metrics.hook),
            mechanism: parseFloat(concept.metrics.mechanism),
            believability: parseFloat(concept.metrics.believability),
            cta: parseFloat(concept.metrics.cta)
          }
        }}
        onGenerateVideo={() => onGenerateVideo(concept.id)}
      />
    </div>
    </>
  );
};

export default PsychologyCard;
