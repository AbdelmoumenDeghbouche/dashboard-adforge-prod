import React from 'react';

export const SkeletonKPICard = () => (
  <div className="bg-[#1A1A1A] rounded-xl p-5 sm:p-6 border border-gray-800/50 animate-pulse">
    <div className="flex items-center space-x-2 mb-4">
      <div className="w-5 h-5 bg-gray-800 rounded"></div>
      <div className="h-3 bg-gray-800 rounded w-24"></div>
    </div>
    <div className="h-8 bg-gray-800 rounded w-20 mb-3"></div>
    <div className="h-3 bg-gray-800 rounded w-16 mb-3"></div>
    <div className="h-1.5 bg-gray-800 rounded-full"></div>
  </div>
);

export const SkeletonActionCard = () => (
  <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800/50 animate-pulse">
    <div className="h-24 bg-gray-800"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
    </div>
  </div>
);

export const SkeletonVideoCard = () => (
  <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800/50 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-24 h-16 bg-gray-800 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export const SkeletonSideCard = () => (
  <div className="rounded-2xl overflow-hidden border border-[#262626] animate-pulse">
    <div className="h-16 bg-gray-800"></div>
    <div className="bg-[#1A1A1A] p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-800/50 rounded-xl"></div>
      ))}
    </div>
  </div>
);

