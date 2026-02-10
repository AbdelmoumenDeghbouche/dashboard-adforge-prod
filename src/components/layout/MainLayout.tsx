import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { PageType } from '@/App';
import { SettingsTab } from '@/components/sidebar/SettingsSidebarContent';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  activeSettingsTab: SettingsTab;
  onSettingsTabChange: (tab: SettingsTab) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate,
  activeSettingsTab,
  onSettingsTabChange
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isAiAvatarsPage = currentPage === 'ai-avatars';
  const isAuthPage = ['login', 'signup', 'forgot-password'].includes(currentPage);
  const isCustomHeaderPage = ['folder-listing', 'products', 'ai-avatars', 'home', 'settings', 'product-edit'].includes(currentPage) || isAuthPage;

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      {!isAuthPage && (
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          activeSettingsTab={activeSettingsTab}
          onSettingsTabChange={onSettingsTabChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col w-full ${!isAuthPage ? 'lg:ml-[280px]' : ''}`}>
        {/* Mobile Header */}
        {!isAuthPage && (
          <div className="lg:hidden flex items-center h-14 px-4 bg-white/80 backdrop-blur-md border-b border-[#0A0A0A]/[0.06] sticky top-0 z-[80]">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-[#0A0A0A]/[0.04] rounded-xl transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="ml-2 font-bold text-sm text-[#0A0A0A]">Pulsor Inc.</span>
          </div>
        )}

        {!isCustomHeaderPage && <TopBar />}
        <main className={isAiAvatarsPage || isCustomHeaderPage ? "flex-1" : "flex-1 p-4 sm:p-6 lg:p-8"}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
