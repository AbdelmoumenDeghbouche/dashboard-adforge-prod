import React from 'react';

interface CreditsCardProps {
  total?: number;
  remaining?: number;
}

const CreditsCard: React.FC<CreditsCardProps> = ({ total = 200, remaining = 150 }) => {
  const percentage = (remaining / total) * 100;

  return (
    <div 
      className="flex flex-col items-start p-3 sm:p-4 gap-3 sm:gap-4 bg-white rounded-[18px] sm:rounded-[23px] shadow-[0px_1px_2px_rgba(0,0,0,0.02),0px_4px_12px_rgba(0,0,0,0.03)] border border-[#0A0A0A]/[0.02] w-full"
      style={{
        minHeight: '120px',
        height: 'auto'
      }}
    >
      <div className="flex flex-col items-start p-0 gap-1 w-full">
        <h3 className="font-bold text-[14px] sm:text-[16px] leading-[20px] sm:leading-[22px] tracking-[-0.015em] text-[#0A0A0A]">
          Available credits
        </h3>
      </div>

      <div className="flex flex-col items-start p-0 gap-4 w-full">
        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex flex-row justify-between items-center w-full">
            <span className="font-medium text-[13px] leading-[18px] text-[#0A0A0A]/40">
              Total
            </span>
            <span className="font-bold text-[13px] leading-[18px] text-[#0A0A0A]">
              {total}
            </span>
          </div>
          
          <div className="flex flex-row justify-between items-center w-full">
            <span className="font-medium text-[13px] leading-[18px] text-[#0A0A0A]/40">
              Remaining credit
            </span>
            <span className="font-bold text-[13px] leading-[18px] text-[#0A0A0A]">
              {remaining}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-[#06E8DC1F] rounded-[6px] overflow-hidden">
          <div 
            className="h-full bg-[#06E8DC] rounded-[6px] transition-all duration-1000 ease-out shadow-[0px_0px_8px_rgba(6,232,220,0.3)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreditsCard;
