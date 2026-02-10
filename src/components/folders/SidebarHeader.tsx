import React from 'react';

interface SidebarHeaderProps {
  companyName?: string;
  plan?: string;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  companyName = 'Pulsor Inc.', 
  plan = 'Pro plan' 
}) => {
  return (
    <div className="flex items-center justify-between px-2 py-2 pr-3.5 gap-3 rounded-[20px]">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-9 h-9 bg-[#0A0A0A] rounded-xl flex items-center justify-center">
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
            <path d="M9 0L0 9L9 16L18 9L9 0Z" fill="#FFFFFF" opacity="0.4"/>
            <path d="M0 9L9 0L9 16L0 9Z" fill="#FFFFFF"/>
          </svg>
        </div>

        {/* Company Info */}
        <div className="flex flex-col">
          <span className="font-medium text-sm leading-5 tracking-[-0.007em] text-[#0A0A0A]">
            {companyName}
          </span>
          <span className="font-normal text-xs leading-4 tracking-[-0.007em] text-[#0A0A0A]/50">
            {plan}
          </span>
        </div>
      </div>

      {/* Dropdown Arrow */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="#0A0A0A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default SidebarHeader;
