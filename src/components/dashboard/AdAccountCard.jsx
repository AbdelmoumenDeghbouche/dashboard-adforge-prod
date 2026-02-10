import React from 'react';

/**
 * AdAccountCard Component
 * Displays an advertising account with platform badge and status
 */
const AdAccountCard = ({ account }) => {
  const { platform, accountName, accountTitle, avatarUrl, status } = account;

  // Platform colors and labels
  const platformConfig = {
    meta: {
      label: 'Meta',
      bgColor: 'bg-[#1877F2]',
      textColor: 'text-white',
    },
    tiktok: {
      label: 'TikTok',
      bgColor: 'bg-black',
      textColor: 'text-[#00F2EA]',
      borderColor: 'border-[#00F2EA]',
    },
  };

  // Status colors
  const statusConfig = {
    active: {
      label: 'Actif',
      bgColor: 'bg-[#23DC00]/10',
      textColor: 'text-[#23DC00]',
      dotColor: 'bg-[#23DC00]',
    },
    inactive: {
      label: 'Inactif',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-400',
      dotColor: 'bg-gray-400',
    },
    error: {
      label: 'Erreur',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      dotColor: 'bg-red-400',
    },
  };

  const currentPlatform = platformConfig[platform] || platformConfig.meta;
  const currentStatus = statusConfig[status] || statusConfig.active;

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-5 sm:p-6 border border-[#262626] hover:border-gray-700/50 transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={accountName}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#262626]"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Account Name */}
          <h3 className="text-white text-lg font-semibold mb-1 truncate">
            {accountName}
          </h3>

          {/* Account Title */}
          <p className="text-gray-400 text-sm mb-3 truncate">
            {accountTitle}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Platform Badge */}
            <span
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                ${currentPlatform.bgColor} ${currentPlatform.textColor}
                ${platform === 'tiktok' ? 'border border-[#00F2EA]' : ''}
              `}
            >
              {currentPlatform.label}
            </span>

            {/* Status Badge */}
            <span
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                ${currentStatus.bgColor} ${currentStatus.textColor}
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotColor}`}></span>
              {currentStatus.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdAccountCard;
