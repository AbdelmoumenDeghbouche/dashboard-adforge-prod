import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import VideoPlayground from './VideoPlayground';
import PlaygroundVideos from './PlaygroundVideos';
import ProductVideos from './ProductVideos';

const Videos = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'playground');

  return (
    <DashboardLayout>
      <div className="p-2 xxs:p-4 sm:p-5 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full font-poppins">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-xl xxs:text-2xl sm:text-3xl font-bold mb-1">
            Video Generation
          </h1>
          <p className="text-gray-400 text-xs xxs:text-sm sm:text-base">
            Create AI-powered videos and manage your video library
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-[#262626]">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative rounded-t-lg ${
                activeTab === 'playground'
                  ? 'text-white bg-[#1A1A1A] border-t border-x border-[#262626]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Video Playground</span>
              </div>
              {activeTab === 'playground' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative rounded-t-lg ${
                activeTab === 'library'
                  ? 'text-white bg-[#1A1A1A] border-t border-x border-[#262626]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Playground Library</span>
              </div>
              {activeTab === 'library' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative rounded-t-lg ${
                activeTab === 'products'
                  ? 'text-white bg-[#1A1A1A] border-t border-x border-[#262626]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Product Videos</span>
              </div>
              {activeTab === 'products' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'playground' && <VideoPlayground />}
          {activeTab === 'library' && <PlaygroundVideos />}
          {activeTab === 'products' && <ProductVideos />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Videos;

