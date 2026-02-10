import React from 'react';

interface StepItem {
  label: string;
  status: 'pending' | 'loading' | 'completed';
  estimatedTime?: string;
}

interface StatusStepProps {
  label?: string; // Original single label
  status?: 'pending' | 'loading' | 'completed'; // Original single status
  estimatedTime?: string;
  steps?: StepItem[]; // New: multiple steps
}

const StatusStep: React.FC<StatusStepProps> = ({ label, status, estimatedTime, steps }) => {
  const renderStep = (itemLabel: string, itemStatus: string, itemTime?: string, isFirst?: boolean) => {
    const isCompleted = itemStatus === 'completed';

    return (
      <div className={`flex flex-col gap-3 w-full animate-in fade-in slide-in-from-left-4 duration-300 ${!isFirst ? 'mt-4' : ''}`}>
        {!isCompleted && (
          <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A] -tracking-[0.007em]">{itemLabel}</p>
        )}
        
        <div className={`w-full max-w-[790px] bg-[#0A0A0A]/[0.04] rounded-[16px] p-3 flex flex-col gap-3 ${isCompleted ? '' : ''}`}>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#06E8DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <span className={`text-[14px] font-medium leading-[22px] -tracking-[0.007em] ${isCompleted ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]'}`}>
              {isCompleted ? itemLabel : itemTime ? `Estimated time: ${itemTime}` : ''}
            </span>
          </div>
          
          <div className="w-full h-1 bg-[rgba(6,232,220,0.12)] rounded-full overflow-hidden">
            <div className={`h-full bg-[#06E8DC] transition-all duration-1000 rounded-full ${isCompleted ? 'w-full' : 'animate-status-progress w-[40%]'}`} />
          </div>
        </div>
      </div>
    );
  };

  if (steps && steps.length > 0) {
    return (
      <div className="flex flex-col w-full max-w-[790px]">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {renderStep(step.label, step.status, step.estimatedTime, idx === 0)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return label && status ? renderStep(label, status, estimatedTime, true) : null;
};

export default StatusStep;
