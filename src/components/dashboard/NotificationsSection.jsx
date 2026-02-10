import React from 'react';

const NotificationItem = ({ type, title, description, time, icon }) => {
  return (
    <div className="p-3 bg-white/10 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
      <div className="flex items-start gap-2.5">
        <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-xs font-semibold mb-1 group-hover:text-blue-300 transition-colors">{title}</h4>
          <p className="text-gray-400 text-[11px] leading-relaxed mb-1.5">{description}</p>
          <span className="text-[10px] text-gray-500">Il y a {time}</span>
        </div>
      </div>
    </div>
  );
};

const NotificationsSection = () => {
  const notifications = [
    {
      type: 'success',
      title: '🎯 Campagne TikTok performante',
      description: 'Votre vidéo "Summer Collection" dépasse les objectifs de +180%',
      time: '2h',
      icon: '🟢'
    },
    {
      type: 'info',
      title: '🔥 Nouveau trend détecté',
      description: 'Opportunité majeure dans la catégorie "Tech Gadgets" de +190%',
      time: '2h',
      icon: '🟠'
    },
    {
      type: 'warning',
      title: '⚠️ Budget presque épuisé',
      description: 'Campagne Instagram à 85% du budget quotidien. Ajoutez des crédits',
      time: '2h',
      icon: '🟡'
    }
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-[#262626]">
      {/* Top colored section - Blue gradient */}
      <div className="p-4 flex items-center gap-2" style={{ background: ' linear-gradient(to right, rgba(173, 70, 255, 0.2), rgba(43, 127, 255, 0.2))' }}>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <span className="text-xl">🔔</span>
        </div>
        <h3 className="text-white text-base font-semibold">Notifications</h3>
      </div>
      
      {/* Bottom dark section with items */}
      <div className="bg-[#1A1A1A] p-4 space-y-3">
        {notifications.map((notification, index) => (
          <NotificationItem key={index} {...notification} />
        ))}
      </div>
    </div>
  );
};

export default NotificationsSection;

