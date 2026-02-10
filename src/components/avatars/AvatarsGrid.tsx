import React, { useState } from 'react';
import { Avatar, TabType } from '@/types/avatars';
import AvatarCard from './AvatarCard';
import CreateAvatarCard from './CreateAvatarCard';
import TabSwitch from './TabSwitch';

interface AvatarsGridProps {
  avatars: Avatar[];
  onAvatarSelect?: (avatar: Avatar) => void;
}

const AvatarsGrid: React.FC<AvatarsGridProps> = ({ avatars, onAvatarSelect }) => {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');

  // Filter avatars based on active tab
  const displayedAvatars = activeTab === 'marketplace' 
    ? avatars 
    : avatars.filter(avatar => avatar.isOwned);

  return (
    <div className="flex-1 h-full flex flex-col bg-white overflow-y-auto pt-4 sm:pt-6 lg:pt-[44px] px-3 sm:px-4 lg:px-[44px] pb-8 sm:pb-10 gap-5 sm:gap-[32px] w-full">
      {/* Tabs Switcher */}
      <div className="w-fit">
        <TabSwitch activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Grid - Responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-[20px] w-full">
        <CreateAvatarCard />
        {displayedAvatars.map((avatar) => (
          <AvatarCard 
            key={avatar.id} 
            avatar={avatar} 
            onSelect={onAvatarSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default AvatarsGrid;
