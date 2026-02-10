import React, { useState } from 'react';
import ChangePlanModal from './ChangePlanModal';

const BillingSettings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div 
      className="flex flex-col items-start p-0 gap-5 sm:gap-6 w-full max-w-full sm:max-w-[693px] px-3 sm:px-0"
    >
      <h1 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.025em] text-[#0A0A0A] leading-[24px] sm:leading-[27px]" style={{ fontFamily: 'Geist, sans-serif' }}>
        Billing & Subscription
      </h1>

      <div 
        className="box-border flex flex-col items-start p-4 sm:p-5 md:p-6 gap-5 sm:gap-6 w-full bg-white border border-[#0A0A0A]/[0.06] rounded-[24px] sm:rounded-[28px] md:rounded-[32px]"
      >
        {/* Frame 1 - Plan Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start w-full gap-3 sm:gap-4">
          <div className="flex flex-col items-start p-0 gap-[2px]">
            <span className="font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Pro Plan
            </span>
            <span className="font-normal text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]/50" style={{ fontFamily: 'Inter, sans-serif' }}>
              Billed Monthly
            </span>
          </div>
          <span className="font-medium text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            $420 /month
          </span>
        </div>

        {/* Frame 2 - Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-0 gap-2 sm:gap-3 w-full lg:w-auto">
            <button className="flex flex-row justify-center items-center p-[6px_14px] gap-[8px] w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] h-[34px] sm:h-[36px] md:h-[34px] bg-white border border-[#0A0A0A]/[0.06] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[14px] font-medium text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              Change my billing information
            </button>
            <button className="flex flex-row justify-center items-center p-[6px_14px] gap-[8px] w-full sm:w-auto sm:min-w-[130px] md:min-w-[141px] h-[34px] sm:h-[36px] md:h-[34px] bg-white border border-[#0A0A0A]/[0.06] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[14px] font-medium text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-colors whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              View my invoices
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-row justify-center items-center p-[6px_14px] gap-[8px] w-full lg:w-auto lg:min-w-[117px] h-[34px] sm:h-[36px] md:h-[34px] bg-[#0A0A0A] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[14px] font-medium text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.012em] text-white hover:bg-[#0A0A0A]/90 transition-colors whitespace-nowrap" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Upgrade now
          </button>
        </div>
      </div>

      {/* Usage Card */}
      <div 
        className="box-border flex flex-col items-start p-4 sm:p-5 md:p-6 gap-5 sm:gap-6 w-full bg-white border border-[#0A0A0A]/[0.06] rounded-[24px] sm:rounded-[28px] md:rounded-[32px]"
      >
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center w-full gap-2 xs:gap-0">
          <span className="font-medium text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Current usage
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5">
             <span className="font-bold text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
               25% used
             </span>
             <span className="font-normal text-[13px] sm:text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A]/50" style={{ fontFamily: 'Inter, sans-serif' }}>
               /current month
             </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
          <div className="flex flex-row justify-between items-center w-full">
            <span className="font-bold text-[12px] sm:text-[13px] leading-[18px] text-[#0A0A0A]">
              50
            </span>
            <span className="font-normal text-[12px] sm:text-[13px] leading-[18px] text-[#0A0A0A]/40">
              200
            </span>
          </div>
          
          <div className="w-full h-2 sm:h-2.5 bg-[#06E8DC1F] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#06E8DC] rounded-full transition-all duration-1000 ease-out shadow-[0px_0px_8px_rgba(6,232,220,0.3)]"
              style={{ width: '25%' }}
            />
          </div>
        </div>
      </div>

      <ChangePlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default BillingSettings;
