import React from 'react';
import { cn } from '@/utils/cn';

interface NavItemProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-row items-center p-2 gap-2 w-full h-[38px] rounded-[14px] transition-all duration-200",
        active 
          ? "bg-[#0A0A0A]/[0.04] opacity-100" 
          : "opacity-70 hover:bg-[#0A0A0A]/[0.02]"
      )}
    >
      {/* Icon Frame - 24x24px */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0">
        <div className="w-[18px] h-[18px] flex items-center justify-center">
          <img src={icon} alt="" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Label */}
      <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
        {label}
      </span>
    </button>
  );
};

export default NavItem;
