import React from 'react';
import { Avatar } from '@/types/avatars';

interface AvatarCardProps {
  avatar: Avatar;
  onSelect?: (avatar: Avatar) => void;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect?.(avatar)}
      className="group cursor-pointer flex flex-col gap-3 w-full"
    >
      <div className="w-full aspect-[162.75/290.86] rounded-xl sm:rounded-2xl overflow-hidden bg-[#0A0A0A]/[0.04] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
        <img
          src={avatar.image}
          alt={avatar.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-1.5 sm:px-2 md:px-2.5">
        <h3 className="font-medium text-[11px] sm:text-xs md:text-sm leading-[16px] sm:leading-[18px] md:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">{avatar.name}</h3>
      </div>
    </div>
  );
};

export default AvatarCard;
