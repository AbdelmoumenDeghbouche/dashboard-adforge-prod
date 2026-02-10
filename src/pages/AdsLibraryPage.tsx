import React from 'react';
import PageHeader from '@/components/folders/PageHeader';
import SearchBar from '@/components/folders/SearchBar';
import Toolbar from '@/components/folders/Toolbar';

const AdsLibraryPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full bg-bg-primary overflow-y-auto">
      <div className="flex flex-col p-8 gap-8 max-w-[1200px] mx-auto w-full">
        {/* Header - Reuse folder components for consistency */}
        <PageHeader 
          title="Ads Library" 
          description="Discover and analyze top-performing creatives across platforms"
        />

        {/* Search & Filter - Reuse existing components */}
        <div className="flex flex-col gap-4">
          <SearchBar placeholder="Search for ads, brands, or keywords..." />
          <Toolbar />
        </div>

        {/* Placeholder for Ads Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group relative flex flex-col bg-white border border-[#0A0A0A]/[0.06] rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
              <div className="aspect-[4/3] bg-[#0A0A0A]/[0.02] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-[#0A0A0A]/10 font-bold text-4xl">
                   AD {i}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[#0A0A0A]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-3 bg-white rounded-full hover:scale-110 transition-transform">
                    <img src="/icons/plus.svg" alt="Add" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-semibold text-[#0A0A0A]/40 uppercase tracking-wider">Social Ads</span>
                  <div className="flex -space-x-1">
                    <img src="/icons/Social networks.svg" alt="" className="w-5 h-5 rounded-full border-2 border-white bg-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-[16px] text-[#0A0A0A]">Winning Hook Strategy V{i}</h3>
                <p className="text-[14px] text-[#0A0A0A]/60 line-clamp-2">A breakdown of the successful retention strategy used for this acquisition campaign.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdsLibraryPage;
