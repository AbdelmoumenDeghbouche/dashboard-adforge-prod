import React from 'react';

interface AboutProductBoxProps {
  productIcon?: string;
  productName?: string;
  painPoints: string[];
  keyDesires: string[];
}

const AboutProductBox: React.FC<AboutProductBoxProps> = ({ 
  productIcon = "/icons/chat.svg", 
  productName = "About your product",
  painPoints,
  keyDesires
}) => {
  return (
    <div className="flex flex-col p-6 sm:p-8 gap-6 sm:gap-8 w-full bg-white border border-[#0A0A0A]/[0.06] rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-row items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0A0A0A]/[0.04] flex items-center justify-center p-2">
          <img src={productIcon} alt="" className="w-full h-full object-contain" />
        </div>
        <h3 className="text-[17px] font-bold text-[#0A0A0A]">
          {productName}
        </h3>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {/* Pain Points */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[12px] font-bold text-[#0A0A0A]/40 tracking-wider uppercase">
            Main Pain Points
          </h4>
          <div className="flex flex-col gap-4">
            {painPoints.map((point, idx) => (
              <p key={idx} className="text-[14px] leading-[22px] font-medium text-[#0A0A0A]/70">
                {point}
              </p>
            ))}
          </div>
        </div>

        {/* Key Desires */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[12px] font-bold text-[#0A0A0A]/40 tracking-wider uppercase">
            Key Desires
          </h4>
          <div className="flex flex-col gap-4">
            {keyDesires.map((desire, idx) => (
              <p key={idx} className="text-[14px] leading-[22px] font-medium text-[#0A0A0A]/70">
                {desire}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutProductBox;
