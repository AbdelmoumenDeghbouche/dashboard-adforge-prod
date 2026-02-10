import React, { useState } from 'react';

interface QuantitySelectorProps {
  initialValue?: number;
  onChange?: (value: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ initialValue = 1, onChange }) => {
  const [value, setValue] = useState(initialValue);

  const handleIncrement = () => {
    const newValue = value + 1;
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleDecrement = () => {
    if (value > 1) {
      const newValue = value - 1;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div className="flex flex-row items-center p-1 gap-3 w-fit h-[34px] bg-[#0A0A0A]/[0.04] border border-[#0A0A0A]/[0.04] rounded-[14px]">
      <button
        onClick={handleDecrement}
        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#0A0A0A]/[0.04] transition-colors text-[#0A0A0A]/40"
      >
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
          <path d="M1 1H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      
      <span className="font-bold text-[14px] leading-[22px] tracking-[-0.012em] text-[#0A0A0A] min-w-[12px] text-center">
        {value}
      </span>

      <button
        onClick={handleIncrement}
        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#0A0A0A]/[0.04] transition-colors text-[#0A0A0A]/40"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

export default QuantitySelector;
