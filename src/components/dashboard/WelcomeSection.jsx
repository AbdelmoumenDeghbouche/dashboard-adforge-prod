import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const WelcomeSection = () => {
  const { currentUser } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${dayName} ${day} ${month} ${year} • ${hours}:${minutes}:${seconds}`;
  };

  const getUserName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    return currentUser?.email?.split('@')[0] || 'User';
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 lg:mb-8 animate-fade-in border border-gray-800/50 hover:border-gray-700/50 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 w-full sm:w-auto min-w-0">
          <h1 className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
            Bon retour, {getUserName()}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-4">
            {formatDateTime(currentDateTime)}
          </p>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Voici un aperçu de vos performances exceptionnelles aujourd'hui. Vos campagnes surperforment !
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 flex-shrink-0 w-full sm:w-auto justify-end">
          {/* Notification Bell */}
          <button 
            className="w-9 h-9 xs:w-10 xs:h-10 md:w-11 md:h-11 bg-[#2A2A2A] hover:bg-[#333] hover:scale-110 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95"
            aria-label="Notifications"
          >
            <svg className="w-4 h-4 xs:w-5 xs:h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          {/* Settings */}
          <button 
            className="w-9 h-9 xs:w-10 xs:h-10 md:w-11 md:h-11 bg-[#2A2A2A] hover:bg-[#333] hover:scale-110 hover:rotate-90 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95"
            aria-label="Paramètres"
          >
            <svg className="w-4 h-4 xs:w-5 xs:h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Nouvelle campagne button */}
          <button className="h-9 xs:h-10 md:h-11 px-3 xs:px-4 md:px-5 bg-[#3B82F6] hover:bg-[#2563EB] hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 text-white text-xs xs:text-sm font-medium rounded-lg sm:rounded-xl flex items-center gap-1.5 xs:gap-2 transition-all duration-300 active:scale-95 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline sm:hidden">Nouveau</span>
            <span className="hidden sm:inline">Nouvelle campagne</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;

