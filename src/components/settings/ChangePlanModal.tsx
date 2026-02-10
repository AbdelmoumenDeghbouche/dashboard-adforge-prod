import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ isOpen, onClose }) => {
  const [isYearly, setIsYearly] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Starter',
      description: 'Launch your first AI ads and test both generation modes.',
      price: isYearly ? 112 : 140,
      buttonText: 'Downgrade',
      buttonClass: 'bg-white border border-[#0A0A0A]/[0.06] text-[#0A0A0A]',
      features: [
        '100 credits',
        'Access to 500+ natural AI actors',
        'Automatic format, angle & message selection',
        'Performance-driven hook & script generation',
        'Deep product & audience analysis included',
        'Realistic, conversion-focused creatives',
        'Built for fast testing & iteration',
        'Buyer psychology & persona intelligence'
      ]
    },
    {
      name: 'Pro',
      description: 'Scale ad production with more credits and faster output.',
      price: isYearly ? 336 : 420,
      buttonText: 'Current Plan',
      buttonClass: 'bg-[#F2F2F2] text-[#0A0A0A]/20 cursor-default',
      isPopular: true,
      features: [
        '300 credits',
        'Access to 500+ natural AI actors',
        'Automatic format, angle & message selection',
        'Performance-driven hook & script generation',
        'Deep product & audience analysis included',
        'Realistic, conversion-focused creatives',
        'Built for fast testing & iteration',
        'Buyer psychology & persona intelligence'
      ]
    },
    {
      name: 'Business',
      description: 'Maximize volume and speed for teams and agencies.',
      price: isYearly ? 784 : 980,
      buttonText: 'Upgrade',
      buttonClass: 'bg-[#0A0A0A] text-white',
      features: [
        '700 credits',
        'Access to 500+ natural AI actors',
        'Automatic format, angle & message selection',
        'Performance-driven hook & script generation',
        'Deep product & audience analysis included',
        'Realistic, conversion-focused creatives',
        'Built for fast testing & iteration',
        'Buyer psychology & persona intelligence'
      ]
    }
  ];

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div 
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-[1100px] flex flex-col pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 px-8 border-b border-[#0A0A0A]/[0.02]">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 group transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center rounded-lg group-hover:bg-[#0A0A0A]/[0.04] transition-all">
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                  <path d="M5 9L1 5L5 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-[#0A0A0A]">Back</span>
            </button>
            <h2 className="text-[18px] font-bold tracking-tight text-[#0A0A0A]">Change plan</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-6">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`flex-1 relative flex flex-col p-8 rounded-[28px] bg-[#F9FAFB] border border-[#0A0A0A]/[0.04] ${plan.isPopular ? 'pt-14' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-[48px] bg-[#0A0A0A] rounded-t-[28px] overflow-hidden flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" />
                    </svg>
                    <span className="text-white text-[13px] font-bold">Most popular</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[20px] font-bold text-[#0A0A0A] tracking-tight">{plan.name}</h3>
                  <p className="text-[13px] leading-[20px] text-[#0A0A0A]/60 font-medium">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mt-6">
                  <span className="text-[36px] font-bold text-[#0A0A0A] tracking-tight">${plan.price}</span>
                  <span className="text-[14px] text-[#0A0A0A]/40 font-medium">/month</span>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center gap-3 mt-4">
                  <button 
                    onClick={() => setIsYearly(!isYearly)}
                    className={`w-[36px] h-[20px] rounded-full transition-colors relative ${isYearly ? 'bg-[#00D1FF]' : 'bg-[#D1D1D1]/60'}`}
                  >
                    <div className={`absolute top-0.5 w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-all ${isYearly ? 'left-[18px]' : 'left-0.5'}`}></div>
                  </button>
                  <span className="text-[13px] font-semibold text-[#0A0A0A]">Billed yearly</span>
                  <div className="px-2 py-0.5 bg-[#E1F9FF] rounded-md">
                    <span className="text-[#00D1FF] text-[10px] font-bold">-20% on yearly</span>
                  </div>
                </div>

                <button 
                  className={`w-full h-[54px] rounded-[16px] font-bold text-[15px] mt-8 transition-all hover:opacity-90 active:scale-[0.98] ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </button>

                {/* Features List */}
                <div className="flex flex-col gap-4 mt-10">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-[13px] font-medium text-[#0A0A0A]/70 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ChangePlanModal;
