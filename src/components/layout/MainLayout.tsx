import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { PageType } from '@/App';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const isAiAvatarsPage = currentPage === 'ai-avatars';

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:ml-[260px]">
        <TopBar />
        <main className={isAiAvatarsPage ? "flex-1" : "flex-1 p-4 sm:p-6 lg:p-8"}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
