import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PerformanceChart from '../components/dashboard/charts/PerformanceChart';
import PlatformDistribution from '../components/dashboard/charts/PlatformDistribution';
import CreditsDisplay from '../components/dashboard/CreditsDisplay';
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('impressions');
  const { totalBrands, totalProducts, totalAds, totalVideos, recentVideos, loading } = useDashboardData();

  const kpiData = [
    {
      title: 'Marques',
      value: loading ? '...' : totalBrands,
      subtitle: 'marques actives',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      color: '#23DC00'
    },
    {
      title: 'Produits',
      value: loading ? '...' : totalProducts,
      subtitle: 'produits importés',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.29 7 12 12 20.71 7"/>
          <line x1="12" y1="22" x2="12" y2="12"/>
        </svg>
      ),
      color: '#51A2FF'
    },
    {
      title: 'Images Générées',
      value: loading ? '...' : totalAds,
      subtitle: 'publicités créées',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
      color: '#8B5CF6'
    },
    {
      title: 'Vidéos Générées',
      value: loading ? '...' : totalVideos,
      subtitle: 'vidéos créées',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      ),
      color: '#FFDD00'
    },
    {
      title: 'Total Contenus',
      value: loading ? '...' : (totalAds + totalVideos),
      subtitle: 'contenus générés',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
      ),
      color: '#EC4899'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-2 xxs:p-4 sm:p-5 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full font-poppins">
        <div className="mb-4 xxs:mb-5 sm:mb-6 lg:mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 xxs:gap-4 mb-4 xxs:mb-5 sm:mb-6">
            <div>
              <h1 className="text-white text-xl xxs:text-2xl sm:text-3xl font-bold mb-1 xxs:mb-2">Dashboard</h1>
              <p className="text-gray-400 text-xs xxs:text-sm sm:text-base">Vue d'ensemble de vos performances publicitaires</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button className="px-3 sm:px-4 py-2 bg-[#1A1A1A] hover:bg-[#222] hover:scale-105 border border-gray-800 text-white text-sm rounded-lg transition-all duration-200 flex items-center gap-2 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                7 derniers jours
              </button>
              
              <button className="px-3 sm:px-4 py-2 bg-[#1A1A1A] hover:bg-[#222] hover:scale-105 border border-gray-800 text-white text-sm rounded-lg transition-all duration-200 flex items-center gap-2 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtres
              </button>
              
              <button className="px-3 sm:px-4 py-2 bg-[#1A1A1A] hover:bg-[#222] hover:scale-105 border border-gray-800 text-white text-sm rounded-lg transition-all duration-200 flex items-center gap-2 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporter
              </button>
              
              <button className="px-3 sm:px-4 py-2 bg-[#23DC00] hover:bg-[#1FC700] hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle campagne
              </button>
            </div>
          </div>

              <div className="grid grid-cols-1 xxs:grid-cols-2 lg:grid-cols-5 gap-3 xxs:gap-4 sm:gap-5 lg:gap-2 xl:gap-8">
            {kpiData.map((kpi, index) => (
              <div 
                key={index} 
                className="bg-[#1A1A1A] rounded-2xl p-4 xxs:p-5 sm:px-3 border border-[#262626] hover:border-gray-700/50 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4 xxs:mb-6 sm:mb-8 lg:mb-4">
                  <h3 className="text-white text-[10px] xxs:text-xs sm:text-sm lg:text-xs font-normal leading-tight">{kpi.title}</h3>
                  <div className="text-gray-500 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" style={{ color: kpi.color }}>
                    {kpi.icon}
                  </div>
                </div>
                
                <p className="text-white text-xl xxs:text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold mb-2 xxs:mb-3 sm:mb-4 lg:mb-2 group-hover:text-purple-400 transition-colors duration-300">{kpi.value}</p>
                
                <div className="flex items-center gap-1 xxs:gap-1.5">
                  <span className="text-gray-400 text-[10px] xxs:text-xs truncate">{kpi.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4 xxs:gap-5 sm:gap-6 mb-4 xxs:mb-5 sm:mb-6">
          <div className="bg-[#1A1A1A] rounded-xl p-4 xxs:p-5 sm:p-6 border border-[#262626] hover:border-gray-700/50 transition-all duration-300 animate-fade-in">
            <div className="mb-4 xxs:mb-5 sm:mb-6">
              <h2 className="text-white text-base xxs:text-lg font-semibold mb-1">Performance des 7 derniers jours</h2>
              <p className="text-gray-400 text-xs xxs:text-sm">Évolution des impressions, clics et conversions</p>
            </div>
            
            <div className="flex gap-3 xxs:gap-4 mb-4 xxs:mb-5 sm:mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('impressions')}
                className={`pb-2 xxs:pb-3 px-1 xxs:px-2 text-xs xxs:text-sm font-medium transition-all duration-200 relative ${
                  activeTab === 'impressions'
                    ? 'text-purple-500'
                    : 'text-gray-400 hover:text-white hover:scale-105'
                }`}
              >
                Impressions
                {activeTab === 'impressions' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 animate-slide-in-right"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('clics')}
                className={`pb-2 xxs:pb-3 px-1 xxs:px-2 text-xs xxs:text-sm font-medium transition-all duration-200 relative ${
                  activeTab === 'clics'
                    ? 'text-purple-500'
                    : 'text-gray-400 hover:text-white hover:scale-105'
                }`}
              >
                Clics
                {activeTab === 'clics' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 animate-slide-in-right"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('conversions')}
                className={`pb-2 xxs:pb-3 px-1 xxs:px-2 text-xs xxs:text-sm font-medium transition-all duration-200 relative ${
                  activeTab === 'conversions'
                    ? 'text-purple-500'
                    : 'text-gray-400 hover:text-white hover:scale-105'
                }`}
              >
                Conversions
                {activeTab === 'conversions' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 animate-slide-in-right"></div>
                )}
              </button>
            </div>
            
            <PerformanceChart activeTab={activeTab} />
          </div>

          <div className="space-y-4 xxs:space-y-5 sm:space-y-6">
            {/* Credits Display */}
            <CreditsDisplay />
            
            {/* Platform Distribution */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 xxs:p-5 sm:p-6 border border-[#262626] hover:border-gray-700/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="mb-4 xxs:mb-5 sm:mb-6">
                <h2 className="text-white text-base xxs:text-lg font-semibold mb-1">Répartition par plateforme</h2>
                <p className="text-gray-400 text-xs xxs:text-sm">Distribution du trafic par canal</p>
              </div>
              
              <PlatformDistribution />
            </div>
          </div>
        </div>
        
        {/* Recent Videos Section with Real Data */}
        <div className="bg-[#1A1A1A] rounded-xl p-3 xxs:p-4 sm:p-5 md:p-6 border border-[#262626] hover:border-gray-700/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4 xxs:mb-5 sm:mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-white text-base xxs:text-lg font-semibold mb-1">
                Vidéos récentes
                {!loading && recentVideos && recentVideos.length > 0 && (
                  <span className="text-gray-500 text-sm ml-2">({recentVideos.length})</span>
                )}
              </h2>
              <p className="text-gray-400 text-xs xxs:text-sm truncate">Vos dernières créations publicitaires</p>
            </div>
            <button 
              onClick={() => navigate('/generation')}
              className="text-purple-500 hover:text-purple-400 hover:scale-105 text-xs xxs:text-sm font-medium transition-all duration-200 flex-shrink-0 ml-2"
            >
              Voir tout →
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-2 xxs:space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-[#0F0F0F] rounded-xl border border-[#262626] animate-pulse">
                  <div className="w-24 h-16 bg-gray-800 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentVideos && recentVideos.length > 0 ? (
            <div className="space-y-2 xxs:space-y-3">
              {recentVideos.slice(0, 3).map((video, index) => (
                <div 
                  key={video.id} 
                  onClick={() => navigate('/generation')}
                  className="flex items-center gap-2 xxs:gap-3 sm:gap-4 p-3 xxs:p-4 bg-[#0F0F0F] rounded-xl border border-[#262626] hover:border-gray-700 hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="w-14 h-10 xxs:w-16 xxs:h-12 sm:w-20 sm:h-14 md:w-24 md:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:from-purple-700 group-hover:to-pink-700 transition-colors overflow-hidden">
                    {video.thumbnail ? (
                      <video src={`${video.thumbnail}#t=0.5`} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 xxs:w-7 xxs:h-7 sm:w-8 sm:h-8 text-white/80 group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm xxs:text-base font-medium mb-1 truncate group-hover:text-purple-400 transition-colors">{video.title}</h3>
                    <div className="flex items-center gap-1.5 xxs:gap-2 sm:gap-3 flex-wrap">
                      <span className={`px-1.5 xxs:px-2 py-0.5 rounded text-[10px] xxs:text-xs font-medium flex-shrink-0 ${
                        video.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : video.status === 'generating'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {video.status === 'completed' ? 'Complété' : video.status === 'generating' ? 'En cours' : video.status}
                      </span>
                      <span className="text-gray-400 text-[10px] xxs:text-xs sm:text-sm truncate">Vidéo IA</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
                    <button className="p-2 hover:bg-gray-800 hover:scale-110 rounded-lg transition-all duration-200 active:scale-95">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-300">
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-sm mb-4">Aucune vidéo générée</p>
              <button 
                onClick={() => navigate('/generation')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium text-sm"
              >
                Créer une vidéo
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
