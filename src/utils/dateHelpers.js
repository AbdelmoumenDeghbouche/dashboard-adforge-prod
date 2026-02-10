/**
 * Date Utility Helper Functions
 * 
 * Backend returns all dates as ISO format strings (e.g., "2025-11-02T15:30:00.000Z")
 * These utilities help format and display dates consistently throughout the app
 */

/**
 * Format ISO date string to human-readable format
 * @param {string} isoString - ISO format date string
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @returns {string} - Formatted date string
 */
export const formatDate = (isoString, format = 'short') => {
  if (!isoString) return 'N/A';
  
  try {
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    switch (format) {
      case 'short':
        // "Nov 2, 2025"
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      
      case 'long':
        // "November 2, 2025 at 3:30 PM"
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      
      case 'relative':
        // "2 hours ago", "3 days ago", etc.
        return formatRelativeTime(date);
      
      case 'time':
        // "3:30 PM"
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
      
      case 'full':
        // "Saturday, November 2, 2025 at 3:30:45 PM"
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        });
      
      default:
        return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param {Date} date - Date object
 * @returns {string} - Relative time string
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

/**
 * Parse ISO string to Date object
 * @param {string} isoString - ISO format date string
 * @returns {Date|null} - Date object or null if invalid
 */
export const parseISODate = (isoString) => {
  if (!isoString) return null;
  
  try {
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing ISO date:', error);
    return null;
  }
};

/**
 * Check if date is today
 * @param {string} isoString - ISO format date string
 * @returns {boolean} - True if date is today
 */
export const isToday = (isoString) => {
  const date = parseISODate(isoString);
  if (!date) return false;
  
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if date is within last N days
 * @param {string} isoString - ISO format date string
 * @param {number} days - Number of days
 * @returns {boolean} - True if within last N days
 */
export const isWithinDays = (isoString, days) => {
  const date = parseISODate(isoString);
  if (!date) return false;
  
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  return diffInDays <= days;
};

/**
 * Sort array by date field
 * @param {Array} array - Array of objects
 * @param {string} dateField - Name of date field
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} - Sorted array
 */
export const sortByDate = (array, dateField = 'createdAt', order = 'desc') => {
  if (!array || !Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const dateA = parseISODate(a[dateField]);
    const dateB = parseISODate(b[dateField]);
    
    if (!dateA || !dateB) return 0;
    
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Format brand/product stats with dates
 * @param {Object} item - Brand or product object
 * @returns {Object} - Formatted stats
 */
export const formatItemStats = (item) => {
  if (!item) return null;
  
  return {
    created: formatDate(item.createdAt, 'short'),
    updated: formatDate(item.updatedAt, 'relative'),
    scraped: item.scrapedAt ? formatDate(item.scrapedAt, 'relative') : null,
  };
};

/**
 * Get time ago text for display
 * @param {string} isoString - ISO format date string
 * @returns {string} - Time ago text (e.g., "Created 2 hours ago")
 */
export const getTimeAgoText = (isoString, prefix = 'Created') => {
  if (!isoString) return 'Unknown';
  
  const relativeTime = formatDate(isoString, 'relative');
  return `${prefix} ${relativeTime}`;
};

/**
 * Group items by date (today, yesterday, this week, etc.)
 * @param {Array} items - Array of items with date fields
 * @param {string} dateField - Name of date field to group by
 * @returns {Object} - Grouped items
 */
export const groupByDate = (items, dateField = 'createdAt') => {
  if (!items || !Array.isArray(items)) return {};
  
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  items.forEach(item => {
    const date = parseISODate(item[dateField]);
    if (!date) {
      groups.older.push(item);
      return;
    }
    
    if (date >= today) {
      groups.today.push(item);
    } else if (date >= yesterday) {
      groups.yesterday.push(item);
    } else if (date >= weekAgo) {
      groups.thisWeek.push(item);
    } else if (date >= monthAgo) {
      groups.thisMonth.push(item);
    } else {
      groups.older.push(item);
    }
  });
  
  return groups;
};

export default {
  formatDate,
  parseISODate,
  isToday,
  isWithinDays,
  sortByDate,
  formatItemStats,
  getTimeAgoText,
  groupByDate,
};
