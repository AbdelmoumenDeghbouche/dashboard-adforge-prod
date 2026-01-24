import React from 'react';
import { Avatar } from '@/types/avatars';

interface AvatarCardProps {
  avatar: Avatar;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar }) => {
  return (
    <div className="group cursor-pointer w-full">
      <div 
        style={{
          maxWidth: 'min(162.75px, 11.3vw)',
          aspectRatio: '162.75 / 324.86',
          gap: 'min(12px, 0.83vw)',
          opacity: 1,
        }}
        className="relative w-full mx-auto rounded-xl overflow-hidden bg-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
      >
        <img
          src={avatar.image}
          alt={avatar.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-text-primary">{avatar.name}</h3>
      </div>
    </div>
  );
};

export default AvatarCard;
