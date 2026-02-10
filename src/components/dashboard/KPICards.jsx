import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';

const KPICard = ({ title, value, subtitle, icon, iconColor, progressColor, loading }) => {
  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl p-5 sm:p-6 border border-gray-800/50 animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gray-800 rounded"></div>
          <div className="h-3 bg-gray-800 rounded w-24"></div>
        </div>
        <div className="h-8 bg-gray-800 rounded w-20 mb-3"></div>
        <div className="h-3 bg-gray-800 rounded w-32 mb-3"></div>
        <div className="h-1.5 bg-gray-800 rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-5 sm:p-6 border border-gray-800/50 hover:border-gray-700 hover:scale-105 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 cursor-pointer group animate-fade-in">
      <div className="flex items-center space-x-2 mb-4">
        <span className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{icon}</span>
        <span className="text-gray-400 text-xs font-normal group-hover:text-gray-300 transition-colors">{title}</span>
      </div>
      
      <div className="mb-3">
        <h3 className={`text-3xl font-semibold ${iconColor} group-hover:scale-105 transition-transform inline-block`}>
          {value}
        </h3>
      </div>
      
      <div className="flex items-center space-x-1 mb-3">
        <span className="text-xs font-normal text-gray-400">
          {subtitle}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: '75%', backgroundColor: progressColor }}
        ></div>
      </div>
    </div>
  );
};

const KPICards = () => {
  const { totalBrands, totalProducts, totalAds, totalVideos, availableCredits, loading } = useDashboardData();
  
  const kpiData = [
    {
      title: 'Marques Actives',
      value: totalBrands,
      subtitle: totalBrands === 1 ? 'marque créée' : 'marques créées',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#23DC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      iconColor: 'text-[#23DC00]',
      progressColor: '#23DC00'
    },
    {
      title: 'Produits',
      value: totalProducts,
      subtitle: totalProducts === 1 ? 'produit importé' : 'produits importés',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.29 7 12 12 20.71 7"/>
          <line x1="12" y1="22" x2="12" y2="12"/>
        </svg>
      ),
      iconColor: 'text-[#51A2FF]',
      progressColor: '#51A2FF'
    },
    {
      title: 'Images Générées',
      value: totalAds,
      subtitle: totalAds === 1 ? 'publicité créée' : 'publicités créées',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
      iconColor: 'text-[#8B5CF6]',
      progressColor: '#8B5CF6'
    },
    {
      title: 'Vidéos Générées',
      value: totalVideos,
      subtitle: totalVideos === 1 ? 'vidéo créée' : 'vidéos créées',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFDD00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      ),
      iconColor: 'text-[#FFDD00]',
      progressColor: '#FFDD00'
    }
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 lg:mb-8">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} loading={loading} />
      ))}
    </div>
  );
};

export default KPICards;

