import React from 'react';

interface AIResponseHeaderProps {
  product?: string;
  format?: string;
  concept?: string;
  extraInfo?: string;
}

const AIResponseHeader: React.FC<AIResponseHeaderProps> = ({ product, format, concept, extraInfo }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-2 pl-14">
        <span className="text-[12px] font-medium leading-[16px] text-[#0A0A0A]/50 -tracking-[0.007em]">
          Ad Forges AI
        </span>
        {extraInfo && (
          <span className="text-[12px] font-medium leading-[16px] text-[#0A0A0A]/50 -tracking-[0.007em]">
            {extraInfo}
          </span>
        )}
      </div>
      
      {(product || format || concept) && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 shadow-sm border border-[#0A0A0A]/[0.04] shrink-0 -mt-1">
            <svg className="w-7 h-7" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.9454 15.9505L18.8253 19.76C18.659 20.08 18.2295 20.08 18.0632 19.76L14.9187 14.1074L10.8448 6.75894C10.6785 6.43894 10.249 6.43894 10.0827 6.75894L9.67768 7.49579L14.0128 15.3358C14.0842 15.4832 14.0842 15.6558 14.0128 15.8032L11.8927 19.6126C11.7264 19.9326 11.2968 19.9326 11.1305 19.6126L7.43821 12.9516C7.27191 12.6316 6.84238 12.6316 6.67608 12.9516L2.9358 19.6863C2.76949 20.0063 2.33997 20.0063 2.17367 19.6863L0.0535636 15.8768C-0.0178545 15.7295 -0.0178545 15.5568 0.0535636 15.4095L4.43659 7.49579L7.05664 2.75263L7.86672 1.3021L8.46256 0.22105C8.53398 0.0736817 8.70028 0 8.84413 0H12.1079C12.2742 0 12.4181 0.0978922 12.4895 0.22105L13.0853 1.3021L17.5398 9.36316L20.9464 15.5074C21.0179 15.6547 21.0179 15.8274 20.9464 15.9747V15.9505H20.9454Z" fill="currentColor" className="text-[#0A0A0A]"/>
            </svg>
          </div>
          {product && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A]/[0.04] rounded-[14px]">
               <div className="w-[18px] h-[18px] rounded-md overflow-hidden bg-gray-200 border border-[#0A0A0A]/[0.08]">
                  <img src="https://ui-avatars.com/api/?name=P&background=eee&color=000" alt="" className="w-full h-full object-cover" />
               </div>
               <span className="text-[14px] font-medium leading-[22px] text-[#0A0A0A] -tracking-[0.007em]">{product}</span>
             </div>
          )}
          {format && (
             <div className="px-3 py-1.5 bg-[#0A0A0A]/[0.04] rounded-[14px]">
               <span className="text-[14px] font-medium leading-[22px] text-[#0A0A0A] -tracking-[0.007em]">{format}</span>
             </div>
          )}
          {concept && (
             <div className="px-3 py-1.5 bg-[#0A0A0A]/[0.04] rounded-[14px]">
               <span className="text-[14px] font-medium leading-[22px] text-[#0A0A0A] -tracking-[0.007em]">{concept}</span>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIResponseHeader;
