import React, { lazy, Suspense } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import CreditsDisplay from '../components/dashboard/CreditsDisplay';
import { SkeletonKPICard, SkeletonActionCard, SkeletonVideoCard, SkeletonSideCard } from '../components/common/SkeletonCard';

const KPICards = lazy(() => import('../components/dashboard/KPICards'));
const QuickActions = lazy(() => import('../components/dashboard/QuickActions'));
const RecentVideos = lazy(() => import('../components/dashboard/RecentVideos'));
const TrendingSection = lazy(() => import('../components/dashboard/TrendingSection'));
const NotificationsSection = lazy(() => import('../components/dashboard/NotificationsSection'));
const AIRecommendations = lazy(() => import('../components/dashboard/AIRecommendations'));

const Accueil = () => {
  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-screen">
        <WelcomeSection />
        
        {/* KPI Cards with Real Data */}
        <Suspense fallback={
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 lg:mb-8">
            {[1, 2, 3, 4].map((i) => <SkeletonKPICard key={i} />)}
          </div>
        }>
          <KPICards />
        </Suspense>
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_540px] gap-6 lg:gap-8">
          {/* Main Content Column */}
          <div className="min-w-0 space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Suspense fallback={
              <div className="max-w-4xl">
                <div className="h-6 bg-gray-800 rounded w-32 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 lg:gap-8">
                  {[1, 2, 3, 4].map((i) => <SkeletonActionCard key={i} />)}
                </div>
              </div>
            }>
              <QuickActions />
            </Suspense>
            
            {/* Recent Videos with Real Data */}
            <Suspense fallback={
              <div className="max-w-4xl">
                <div className="h-6 bg-gray-800 rounded w-32 mb-4 animate-pulse"></div>
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => <SkeletonVideoCard key={i} />)}
                </div>
              </div>
            }>
              <RecentVideos />
            </Suspense>
          </div>
          
          {/* Sidebar Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Credits Display - New */}
            <CreditsDisplay />
            
            <Suspense fallback={<SkeletonSideCard />}>
              <TrendingSection />
            </Suspense>
            
            <Suspense fallback={<SkeletonSideCard />}>
              <NotificationsSection />
            </Suspense>
            
            <Suspense fallback={<SkeletonSideCard />}>
              <AIRecommendations />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Accueil;

