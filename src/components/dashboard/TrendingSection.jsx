import React from 'react';

const TrendingItem = ({ title, change, rating, trend }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);
  const isPositive = change >= 0;

  return (
    <div className="p-4 bg-white/10 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-base font-semibold mb-2 truncate group-hover:text-green-300 transition-colors">{title}</h4>
          <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        </div>
        <div className="ml-3 flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            {stars.map((filled, i) => (
              <span key={i} className="text-base">
                {filled ? '🔥' : '⚪'}
              </span>
            ))}
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            trend === 'up' ? 'bg-green-600/20' : 'bg-red-600/20'
          }`}>
            {trend === 'up' ? (
              <span className="text-green-500 text-lg">📈</span>
            ) : (
              <span className="text-red-500 text-lg">📉</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendingSection = () => {
  const trendingItems = [
    {
      title: 'Summer Fashion',
      change: 245,
      rating: 5,
      trend: 'up'
    },
    {
      title: 'AI Tools',
      change: 189,
      rating: 4,
      trend: 'up'
    },
    {
      title: 'Sustainable Living',
      change: 156,
      rating: 4,
      trend: 'up'
    },
    {
      title: 'Home Workouts',
      change: -23,
      rating: 2,
      trend: 'down'
    }
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-[#262626]">
      {/* Top colored section - Green gradient */}
      <div className="p-4 flex items-center gap-2" style={{ background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3), transparent), linear-gradient(to right, rgba(0, 188, 125, 0.3), rgba(0, 188, 125, 0.2))' }}>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <span className="text-xl">📈</span>
        </div>
        <h3 className="text-white text-base font-semibold">Tendances du Jour</h3>
      </div>
      
      {/* Bottom dark section with items */}
      <div className="bg-[#1A1A1A] p-4 space-y-3">
        {trendingItems.map((item, index) => (
          <TrendingItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;

