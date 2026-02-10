/**
 * Get KPI data
 * @returns {Array} Array of KPI objects
 */
export const getKPIData = () => {
  return [
    {
      title: 'Revenus Aujourd\'hui',
      value: '2,847',
      change: 18.2,
      prefix: '€',
      icon: '💰',
      iconColor: 'text-green-500'
    },
    {
      title: 'Vues Totales',
      value: '124.5K',
      change: 11.2,
      icon: '👁️',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Taux d\'Engagement',
      value: '18.7',
      change: 2.0,
      suffix: '%',
      icon: '💜',
      iconColor: 'text-purple-500'
    },
    {
      title: 'ROI Moyen',
      value: '+245',
      change: 18.2,
      suffix: '%',
      icon: '💰',
      iconColor: 'text-yellow-500'
    }
  ];
};

/**
 * Get trending items data
 * @returns {Array} Array of trending items
 */
export const getTrendingData = () => {
  return [
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
};

/**
 * Get recent videos data
 * @returns {Array} Array of video objects
 */
export const getRecentVideos = () => {
  return [
    {
      title: 'Sneakers Nike Air Jordan 1',
      thumbnail: null,
      views: '12.4K',
      engagement: '18.5',
      platform: 'TikTok',
      roi: '245',
      status: 'Live'
    },
    {
      title: 'Sneakers Nike Air Jordan 1',
      thumbnail: null,
      views: '12.4K',
      engagement: '18.5',
      platform: 'Instagram',
      roi: '245',
      status: 'Live'
    },
    {
      title: 'Sneakers Nike Air Jordan 1',
      thumbnail: null,
      views: '12.4K',
      engagement: '18.5',
      platform: 'Youtube',
      roi: '245',
      status: 'Pausé'
    }
  ];
};

/**
 * Get notifications data
 * @returns {Array} Array of notification objects
 */
export const getNotifications = () => {
  return [
    {
      type: 'success',
      title: 'Campagne TikTok performante',
      description: 'Votre vidéo "Summer Collection" dépasse ses objectifs de +180%',
      time: '2h'
    },
    {
      type: 'info',
      title: 'Nouveau trend détecté',
      description: 'Opportunité majeure dans la catégorie "Tech Gadgets" de +190%',
      time: '5h'
    },
    {
      type: 'warning',
      title: 'Budget presque épuisé',
      description: 'Campagne "Spring Ads" à 93% du budget quotidien. Ajoutez maintenant.',
      time: '1j'
    }
  ];
};

/**
 * Get AI recommendations data
 * @returns {Array} Array of recommendation objects
 */
export const getAIRecommendations = () => {
  return [
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
};

/**
 * Format number with K/M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = '€') => {
  return `${currency}${amount.toLocaleString()}`;
};

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

