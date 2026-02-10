import React from 'react';

interface ReasoningBoxProps {
  reasoning: string[];
}

const ReasoningBox: React.FC<ReasoningBoxProps> = ({ reasoning }) => {
  return (
    <div className="w-full bg-[rgba(6,232,220,0.06)] rounded-[28px] p-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-col gap-1.5">
        {reasoning.map((text, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
               <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                 <path d="M2 6L5 9L10 3" stroke="#06E8DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
            <p className="text-[14px] font-medium leading-[22px] text-[#0A0A0A] -tracking-[0.007em]">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReasoningBox;
