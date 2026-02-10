import React from 'react';

const SelectionImpactBox: React.FC = () => {
  const points = [
    "Marketing angles will be tailored to this persona's pain points and traits",
    "Ad creatives will use appropriate pronouns and language",
    "Video avatars will match the persona's demographics",
    "Voice and tone will be consistent throughout all content"
  ];

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h4 className="text-[16px] font-medium leading-[24px] text-[#0A0A0A] -tracking-[0.007em]">
        How will this selection affect the generation?
      </h4>
      
      <div className="w-full bg-[rgba(6,232,220,0.06)] rounded-[28px] p-6 flex flex-col gap-1.5">
        {points.map((point, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
               <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                 <path d="M2 6L5 9L10 3" stroke="#06E8DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
            <span className="text-[14px] font-medium leading-[22px] text-[#0A0A0A] -tracking-[0.007em]">
              {point}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectionImpactBox;
