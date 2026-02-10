import React from 'react';

const RecommendationCard = ({ title, subtitle, badge, badgeColor, onAction }) => {
  return (
    <div className="p-4 bg-white/10 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-[1.02] group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-white text-sm font-semibold">{title}</h4>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${badgeColor}`}>
              {badge}
            </span>
          </div>
          <p className="text-gray-400 text-xs">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onAction}
        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-95"
      >
        Démarrer maintenant
      </button>
    </div>
  );
};

const AIRecommendations = () => {
  const recommendations = [
    {
      title: 'Créer des variantes iphone',
      subtitle: 'Est estimée +300%',
      badge: '94%',
      badgeColor: 'bg-red-500/20 text-red-400'
    },
    {
      title: 'Optimiser pour TikTok',
      subtitle: 'Est estimée +420%',
      badge: '94%',
      badgeColor: 'bg-green-500/20 text-green-400'
    }
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-[#262626]">
      {/* Top colored section - Purple gradient */}
      <div className="p-4 flex items-center gap-2" style={{ background: ' linear-gradient(to right, rgba(173, 70, 255, 0.2), rgba(246, 51, 154, 0.2))' }}>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <h3 className="text-white text-base font-semibold">Recommandations IA</h3>
      </div>
      
      {/* Bottom dark section with items */}
      <div className="bg-[#1A1A1A] p-4 space-y-3">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard 
            key={index} 
            {...recommendation}
            onAction={() => console.log(`Action for: ${recommendation.title}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;

