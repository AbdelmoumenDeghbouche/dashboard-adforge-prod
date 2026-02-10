import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';

const VideoCard = ({ id, title, thumbnail, status, created_at, brand_id, product_id, onClick }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'generating':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'queued':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed':
        return 'Complété';
      case 'generating':
        return 'Génération...';
      case 'queued':
        return 'En attente';
      case 'failed':
        return 'Échec';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div 
      className="bg-[#1A1A1A] rounded-xl p-3 sm:p-4 border border-gray-800/50 hover:border-gray-700 hover:scale-[1.02] transition-all duration-200 group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex-shrink-0 overflow-hidden relative">
          {thumbnail ? (
            <video src={`${thumbnail}#t=0.5`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          {status === 'completed' && thumbnail && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white text-sm sm:text-base font-medium group-hover:text-purple-400 transition-colors line-clamp-1">
              {title}
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium border whitespace-nowrap flex-shrink-0 ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDate(created_at)}</span>
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Vidéo IA</span>
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex-shrink-0 hidden sm:block">
          <button 
            className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors group-hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const RecentVideos = () => {
  const navigate = useNavigate();
  const { recentVideos, loading, totalVideos } = useDashboardData();

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h2 className="text-white text-lg sm:text-xl font-semibold mb-4">Vidéos Récentes</h2>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800/50 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-800 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recentVideos || recentVideos.length === 0) {
    return (
      <div className="max-w-4xl">
        <h2 className="text-white text-lg sm:text-xl font-semibold mb-4">Vidéos Récentes</h2>
        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-gray-800/50 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Aucune vidéo générée</h3>
          <p className="text-gray-400 text-sm mb-4">Commencez par créer votre première vidéo publicitaire avec l'IA</p>
          <button 
            onClick={() => navigate('/generation')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium"
          >
            Créer une vidéo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg sm:text-xl font-semibold">
          Vidéos Récentes 
          <span className="text-gray-500 text-sm ml-2">({totalVideos})</span>
        </h2>
        <button 
          onClick={() => navigate('/generation')}
          className="text-purple-500 hover:text-purple-400 text-sm font-medium transition-colors"
        >
          Voir tout →
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {recentVideos.slice(0, 3).map((video) => (
          <VideoCard 
            key={video.id} 
            {...video}
            onClick={() => navigate('/generation')}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentVideos;

