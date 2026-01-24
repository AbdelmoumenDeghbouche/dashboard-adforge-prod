import React, { useState } from 'react';
import { Avatar, TabType } from '@/types/avatars';
import AvatarCard from './AvatarCard';
import CreateAvatarCard from './CreateAvatarCard';
import TabSwitch from './TabSwitch';

interface AvatarsGridProps {
  avatars: Avatar[];
}

const AvatarsGrid: React.FC<AvatarsGridProps> = ({ avatars }) => {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');

  // Filter avatars based on active tab
  const displayedAvatars = activeTab === 'marketplace' 
    ? avatars 
    : avatars.filter(avatar => avatar.isOwned);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Tabs Switcher */}
      <div className="border-b border-border-light px-6 py-4">
        <TabSwitch activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Grid */}
      <div 
        style={{
          gap: 'min(32px, 2.22vw)',
          padding: 'min(44px, 3.06vw)',
          opacity: 1,
        }}
        className="flex-1 overflow-y-auto w-full md:w-[min(799px,55.5vw)] md:max-w-[799px] md:h-auto"
      >
        <div 
          style={{
            gap: 'min(20px, 1.39vw)',
            opacity: 1,
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full md:w-[min(711px,49.4vw)] md:h-auto"
        >
          <CreateAvatarCard />
          {displayedAvatars.map((avatar) => (
            <AvatarCard key={avatar.id} avatar={avatar} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarsGrid;
