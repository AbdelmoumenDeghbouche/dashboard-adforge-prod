import React from 'react';
import TrendingSection from './TrendingSection';
import NotificationsSection from './NotificationsSection';
import AIRecommendations from './AIRecommendations';

const RightSidebar = () => {
  return (
    <aside className="w-80 bg-[#0A0A0A] h-screen flex flex-col flex-shrink-0">
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
        <TrendingSection />
        <NotificationsSection />
        <AIRecommendations />
      </div>
    </aside>
  );
};

export default RightSidebar;

