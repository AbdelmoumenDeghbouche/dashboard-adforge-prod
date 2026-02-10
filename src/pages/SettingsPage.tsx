import React from 'react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import WorkspaceSettings from '@/components/settings/WorkspaceSettings';
import BillingSettings from '@/components/settings/BillingSettings';
import MembersSettings from '@/components/settings/MembersSettings';
import { SettingsTab } from '@/components/sidebar/SettingsSidebarContent';

interface SettingsPageProps {
  activeTab: SettingsTab;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ activeTab }) => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-bg-sidebar">
      {/* Top Bar - Specified in image (Now matches Sidebar gray) */}
      <div className="w-full flex flex-row items-center px-6 py-4 bg-bg-sidebar border-b border-[#0A0A0A]/[0.06]">
        <div className="flex flex-row items-center gap-2">
          {/* Logo Icon (Pulsor) */}
          <div className="w-6 h-6 bg-[#0A0A0A] rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" fill="white"/>
            </svg>
          </div>
          <span className="text-[14px] font-medium text-[#0A0A0A]">Pulsor Inc.</span>
          <span className="text-[14px] text-[#0A0A0A]/40 mx-1">/</span>
          <span className="text-[14px] text-[#0A0A0A]/40">Settings</span>
        </div>
      </div>

      {/* Main Content Area - White Sheet Layout */}
      <div className="flex-1 bg-white rounded-t-[32px] overflow-hidden flex flex-col items-center">
        <div 
          className="w-[calc(100%-48px)] max-w-[1152px] min-h-[calc(100vh-100px)] lg:h-[964px] mx-auto relative bg-white rounded-[16px] mt-4 mb-8 flex flex-col items-center pt-8 lg:pt-0 overflow-y-auto"
        >
          <div className="w-full flex justify-center px-4 lg:px-0 lg:block">
            {activeTab === 'profile' && (
               <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-[32px] w-full max-w-[800px]">
                 <ProfileSettings />
               </div>
            )}
            {activeTab === 'workspace' && (
               <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-[32px] w-full max-w-[800px]">
                 <WorkspaceSettings />
               </div>
            )}
            {activeTab === 'members' && (
              <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-[32px] w-full max-w-[1000px]">
                <MembersSettings />
              </div>
            )}
            {activeTab === 'billing' && (
               <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-[32px] w-full max-w-[693px]">
                 <BillingSettings />
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
