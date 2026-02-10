import React from 'react';
import { PageType } from '@/App';
import { useAuth } from '../../contexts/AuthContext';

export type SettingsTab = 'profile' | 'workspace' | 'members' | 'billing';

interface SettingsSidebarContentProps {
  onNavigate: (page: PageType) => void;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const SettingsSidebarContent: React.FC<SettingsSidebarContentProps> = ({ onNavigate, activeTab, onTabChange }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col items-start p-0 gap-6 w-full" style={{ minHeight: '372px' }}>
      {/* Back to the app */}
      <button 
        onClick={() => onNavigate('products')}
        className="flex flex-row items-center p-2 gap-2 w-full h-[38px] rounded-[14px] transition-all duration-200 hover:bg-[#0A0A0A]/[0.04] opacity-70 group"
      >
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 9L4.5 6L7.5 3" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
          Back to the app
        </span>
      </button>

      {/* Sections Wrapper */}
      <div className="flex flex-col items-start p-0 gap-7 w-full">
        {/* Account Section */}
        <div className="flex flex-col items-start p-0 gap-2.5 w-full">
          <div className="flex flex-row items-center p-0 gap-1 w-full h-[22px]">
            <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50">
              Account
            </span>
          </div>
          
          <button 
            onClick={() => onTabChange('profile')}
            className={`flex flex-row items-center p-2 gap-2 w-full h-[38px] rounded-[14px] transition-all duration-200 ${activeTab === 'profile' ? 'bg-[#0A0A0A]/[0.04] opacity-100' : 'hover:bg-[#0A0A0A]/[0.02] opacity-70'}`}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
               <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z" fill="#0A0A0A" fillOpacity={activeTab === 'profile' ? "1" : "0.4"}/>
                <path d="M15 15C15 12.2386 12.3137 10 9 10C5.68629 10 3 12.2386 3 15" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
              Profile
            </span>
          </button>
        </div>

        {/* Administration Section */}
        <div className="flex flex-col items-start p-0 gap-2.5 w-full">
          <div className="flex flex-row items-center p-0 gap-1 w-full h-[22px]">
            <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]/50">
              Administration
            </span>
          </div>

          <div className="flex flex-col items-start p-0 gap-0.5 w-full">
             {/* Workspace */}
            <button 
              onClick={() => onTabChange('workspace')}
              className={`flex flex-row items-center p-2 gap-2 w-full h-[38px] rounded-[14px] transition-all duration-200 ${activeTab === 'workspace' ? 'bg-[#0A0A0A]/[0.04] opacity-100' : 'hover:bg-[#0A0A0A]/[0.02] opacity-70'}`}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 15.5H16" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3 15.5V4C3 3.44772 3.44772 3 4 3H9V15.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 8H15V15.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity={activeTab === 'workspace' ? "1" : "0.4"}/>
                  <rect x="5" y="6" width="2" height="2" rx="0.5" fill="#0A0A0A" fillOpacity={activeTab === 'workspace' ? "1" : "0.4"}/>
                  <rect x="5" y="10" width="2" height="2" rx="0.5" fill="#0A0A0A" fillOpacity={activeTab === 'workspace' ? "1" : "0.4"}/>
                </svg>
              </div>
              <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
                Workspace
              </span>
            </button>

            {/* Members */}
            <button 
              onClick={() => onTabChange('members')}
              className={`flex flex-row items-center p-2 gap-2 w-full h-[38px] rounded-[14px] transition-all duration-200 ${activeTab === 'members' ? 'bg-[#0A0A0A]/[0.04] opacity-100' : 'hover:bg-[#0A0A0A]/[0.02] opacity-70'}`}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8Z" fill="#0A0A0A" fillOpacity={activeTab === 'members' ? "1" : "0.4"}/>
                  <path d="M6 7C7.10457 7 8 6.10457 8 5C8 3.89543 7.10457 3 6 3C4.89543 3 4 3.89543 4 5C4 6.10457 4.89543 7 6 7Z" fill="#0A0A0A"/>
                  <path d="M2 15C2 12.2386 4.23858 10 7 10" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M10 15C10 13.3431 11.3431 12 13 12H16" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeOpacity={activeTab === 'members' ? "1" : "0.4"}/>
                </svg>
              </div>
              <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
                Members
              </span>
            </button>

            {/* Billing & Subscription */}
            <button 
              onClick={() => onTabChange('billing')}
              className={`flex flex-row items-center p-2 gap-2 w-full h-[38px] rounded-[14px] transition-all duration-200 ${activeTab === 'billing' ? 'bg-[#0A0A0A]/[0.04] opacity-100' : 'hover:bg-[#0A0A0A]/[0.02] opacity-70'}`}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="14" height="10" rx="2" stroke="#0A0A0A" strokeWidth="1.5" strokeOpacity={activeTab === 'billing' ? "1" : "0.4"}/>
                  <path d="M2 7.5H16" stroke="#0A0A0A" strokeWidth="1.5"/>
                  <rect x="5" y="10.5" width="2" height="1" rx="0.5" fill="#0A0A0A"/>
                  <rect x="11" y="10.5" width="2" height="1" rx="0.5" fill="#0A0A0A"/>
                </svg>
              </div>
              <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.007em] text-[#0A0A0A]">
                Billing & Subscription
              </span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="flex flex-row items-center px-2.5 py-2 gap-2 w-full h-[38px] rounded-[14px] transition-all duration-200 hover:bg-[#FB3748]/[0.04]"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V3C10 2.44772 9.55228 2 9 2H4C3.44772 2 3 2.44772 3 3V15C3 15.5523 3.44772 16 4 16H9C9.55228 16 10 15.5523 10 15V14" stroke="#FB3748" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
              <path d="M7 9H15" stroke="#FB3748" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 6L16 9L13 12" stroke="#FB3748" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-medium text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[22px] tracking-[-0.012em] text-[#FB3748]">
            Log out
          </span>
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebarContent;
