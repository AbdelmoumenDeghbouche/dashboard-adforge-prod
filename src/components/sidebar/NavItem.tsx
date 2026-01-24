import React from 'react';
import { cn } from '@/utils/cn';
import type { NavItem as NavItemType } from '@/types';

const NavItem: React.FC<NavItemType> = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
        active
          ? 'bg-gray-200 text-text-primary'
          : 'text-text-secondary hover:bg-bg-hover hover:translate-x-0.5'
      )}
    >
      <img src={icon} alt="" className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

export default NavItem;
