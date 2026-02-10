/**
 * Dashboard constants and configuration
 */

// Menu items configuration
export const MENU_ITEMS = [
  {
    id: 'accueil',
    label: 'Accueil',
    path: '/dashboard',
    icon: 'home'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard'
  }
];

// Creation & Generation menu items
export const CREATION_MENU_ITEMS = [
  {
    id: 'ingestion',
    label: 'Ingestion de produit',
    path: '/dashboard/product-ingestion',
    icon: 'box'
  },
  {
    id: 'generation',
    label: 'Generation de vidéo',
    path: '/dashboard/video-generation',
    icon: 'video'
  },
  {
    id: 'brand',
    label: 'Personnalisation & Brand Kit',
    path: '/dashboard/brand-kit',
    icon: 'palette'
  },
  {
    id: 'voiceover',
    label: 'Voix-off IA',
    path: '/dashboard/voiceover',
    icon: 'microphone'
  }
];

// Quick actions configuration
export const QUICK_ACTIONS = [
  {
    id: 'create-video',
    title: 'Créer une Vidéo',
    description: 'Générer une nouvelle publicité avec l\'IA',
    bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700',
    iconBg: 'bg-blue-500/30',
    action: 'create-video'
  },
  {
    id: 'import-products',
    title: 'Importer Produits',
    description: 'Synchroniser depuis Shopify/WooCommerce',
    bgColor: 'bg-gradient-to-br from-purple-600 to-purple-700',
    iconBg: 'bg-purple-500/30',
    action: 'import-products'
  },
  {
    id: 'analyze-trends',
    title: 'Analyser Tendances',
    description: 'Découvrir les contenus viraux du moment',
    bgColor: 'bg-gradient-to-br from-green-600 to-green-700',
    iconBg: 'bg-green-500/30',
    action: 'analyze-trends'
  },
  {
    id: 'target-audience',
    title: 'Cibler Audience',
    description: 'Optimiser votre ciblage avec l\'IA',
    bgColor: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
    iconBg: 'bg-yellow-500/30',
    action: 'target-audience'
  }
];

// Platform icons
export const PLATFORM_ICONS = {
  tiktok: '🎵',
  instagram: '📸',
  youtube: '▶️',
  facebook: '📘',
  default: '🎬'
};

// Status colors
export const STATUS_COLORS = {
  live: 'bg-green-500/20 text-green-500 border-green-500/50',
  paused: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  stopped: 'bg-red-500/20 text-red-500 border-red-500/50',
  draft: 'bg-gray-500/20 text-gray-500 border-gray-500/50'
};

// Notification types
export const NOTIFICATION_TYPES = {
  success: {
    color: 'bg-green-500/20 text-green-500',
    icon: 'check'
  },
  warning: {
    color: 'bg-yellow-500/20 text-yellow-500',
    icon: 'warning'
  },
  info: {
    color: 'bg-blue-500/20 text-blue-500',
    icon: 'info'
  },
  error: {
    color: 'bg-red-500/20 text-red-500',
    icon: 'error'
  }
};

// Date/time formats
export const DATE_FORMAT = {
  days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
};

// Theme colors
export const THEME_COLORS = {
  background: {
    primary: '#0A0A0A',
    secondary: '#0F0F0F',
    tertiary: '#1A1A1A'
  },
  border: {
    primary: '#1F1F1F',
    secondary: '#2A2A2A'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#6B7280'
  }
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
};

