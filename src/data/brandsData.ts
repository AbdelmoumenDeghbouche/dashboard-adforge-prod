import { Brand } from '../types/brands';
import { ChatMessage, Audience, MarketingAngle, PsychologyConcept } from '../types/chat';
import { Product } from '../types/products';

// Mock audiences for chats
const mockAudiences: Audience[] = [
  {
    id: 'aud1',
    name: 'Women Perimenopause',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    label: 'Primary (35-45%)',
    labelColor: '#06E8DC',
    age: '45-65',
    gender: 'Female',
    location: 'United States',
    description: 'Women experiencing perimenopause seeking health solutions.',
    traits: ['health-conscious', 'researching', 'proactive'],
    painPoints: ['Hormonal changes', 'Energy fluctuations', 'Sleep issues'],
    features: []
  },
  {
    id: 'aud2',
    name: 'College Students',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    label: 'Secondary (20-30%)',
    labelColor: '#9CA3AF',
    age: '18-24',
    gender: 'Female',
    location: 'United States',
    description: 'Young students looking for affordable wellness solutions.',
    traits: ['digital-native', 'price-conscious', 'socially-active'],
    painPoints: ['Limited budget', 'Busy lifestyle', 'New health concerns'],
    features: []
  }
];

const mockAngles: MarketingAngle[] = [
  {
    id: 'angle1',
    title: 'Science-Backed Relief',
    description: 'Clinically proven probiotics for targeted wellness support',
    score: '9.2',
    metrics: { engagement: '8.5', conversion: '7.8', retention: '9.0' },
    reason: 'Appeals to evidence-seeking audience with credibility-focused messaging'
  },
  {
    id: 'angle2',
    title: 'Natural Daily Routine',
    description: 'Simple integration into your existing wellness habits',
    score: '8.7',
    metrics: { engagement: '9.1', conversion: '7.5', retention: '8.9' },
    reason: 'Reduces friction by positioning product as an easy lifestyle addition'
  }
];

const mockConcepts: PsychologyConcept[] = [
  {
    id: 'concept1',
    title: 'Social Proof',
    score: '9.4',
    description: 'Leveraging testimonials and user success stories',
    hook: 'Join thousands who transformed their health',
    badge: 'SCRIPT PREVIEW',
    scriptPreview: 'See how real users achieved results in just 30 days...',
    explanation: 'People trust what others recommend, especially for health products',
    metrics: {
      hook: '9.2',
      mechanism: '8.8',
      believability: '9.5',
      cta: '8.1'
    }
  },
  {
    id: 'concept2',
    title: 'Urgency',
    score: '8.7',
    description: 'Creating FOMO with time-sensitive offers',
    hook: 'Limited time: 30% off your first order',
    badge: 'HOOK',
    scriptPreview: 'Don\'t miss out - this exclusive offer ends in 48 hours...',
    explanation: 'Encourages immediate action through scarcity messaging',
    metrics: {
      hook: '9.1',
      mechanism: '8.5',
      believability: '7.8',
      cta: '9.3'
    }
  }
];

// Brand 1: Wellness Company
const brand1Products: Product[] = [
  {
    id: 'p1-1',
    title: 'Probiotic Balance+',
    description: 'Advanced probiotic formula for digestive and immune support',
    thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    primaryProblem: 'Digestive discomfort and immune system concerns',
    mainReason: 'Skeptical about supplement efficacy',
    moment: 'Morning routine or after meals',
    whyPreviousFailed: 'Generic probiotics without targeted strains',
    whatTheyWantToFeel: 'Confidence, energy, and digestive comfort',
    bestProof: 'Clinical studies and user testimonials'
  },
  {
    id: 'p1-2',
    title: 'Sleep Support Formula',
    description: 'Natural sleep aid with melatonin and calming herbs',
    thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop',
    primaryProblem: 'Difficulty falling asleep and poor sleep quality',
    mainReason: 'Concerns about dependency on sleep aids',
    moment: 'Before bedtime',
    whyPreviousFailed: 'Harsh medications with side effects',
    whatTheyWantToFeel: 'Restful, natural, refreshed',
    bestProof: 'Before/after sleep tracking data'
  }
];

const brand1Chats: ChatMessage[] = [
  {
    id: 'chat1-1',
    type: 'text',
    sender: 'user',
    content: 'Create a video ad campaign for our new probiotic targeting women over 40',
    timestamp: new Date('2024-02-05T10:30:00')
  },
  {
    id: 'chat1-2',
    type: 'text',
    sender: 'ai',
    content: 'I\'ll help you create a compelling video ad. Let me analyze your target audience and suggest the best approach.',
    timestamp: new Date('2024-02-05T10:30:15')
  },
  {
    id: 'chat1-3',
    type: 'audience_group',
    sender: 'ai',
    content: 'Based on your product and goals, here are the top persona segments:',
    data: { audiences: mockAudiences },
    timestamp: new Date('2024-02-05T10:30:30')
  },
  {
    id: 'chat1-4',
    type: 'selection_summary',
    sender: 'user',
    content: 'Women Perimenopause',
    timestamp: new Date('2024-02-05T10:31:00')
  },
  {
    id: 'chat1-5',
    type: 'marketing_angle',
    sender: 'ai',
    content: 'Perfect choice! Now select a marketing angle:',
    data: { angles: mockAngles },
    timestamp: new Date('2024-02-05T10:31:15')
  },
  {
    id: 'chat1-6',
    type: 'selection_summary',
    sender: 'user',
    content: 'Science-Backed Relief',
    timestamp: new Date('2024-02-05T10:32:00')
  },
  {
    id: 'chat1-7',
    type: 'psychology_selection',
    sender: 'ai',
    content: 'Choose a psychological principle to enhance your message:',
    data: { concepts: mockConcepts },
    timestamp: new Date('2024-02-05T10:32:15')
  }
];

// Brand 2: Tech Company
const brand2Products: Product[] = [
  {
    id: 'p2-1',
    title: 'Insta360 Ace Pro',
    description: 'Professional 360-degree action camera',
    thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
    primaryProblem: 'Capturing immersive action footage',
    mainReason: 'Complex setup and editing required',
    moment: 'Adventure activities and travel',
    whyPreviousFailed: 'Heavy equipment and complicated software',
    whatTheyWantToFeel: 'Creative, professional, adventurous',
    bestProof: 'Sample footage and creator reviews'
  },
  {
    id: 'p2-2',
    title: 'Smart Gimbal Stabilizer',
    description: 'AI-powered smartphone stabilizer for smooth video',
    thumbnail: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=400&fit=crop',
    primaryProblem: 'Shaky smartphone videos',
    mainReason: 'Professional equipment too expensive',
    moment: 'Content creation and vlogging',
    whyPreviousFailed: 'Bulky and complicated gimbals',
    whatTheyWantToFeel: 'Professional, confident, creative',
    bestProof: 'Side-by-side comparisons'
  }
];

const brand2Chats: ChatMessage[] = [
  {
    id: 'chat2-1',
    type: 'text',
    sender: 'user',
    content: 'I need a TikTok ad for the new Insta360 camera targeting adventure creators',
    timestamp: new Date('2024-02-06T14:20:00')
  },
  {
    id: 'chat2-2',
    type: 'text',
    sender: 'ai',
    content: 'Great! Let\'s create an engaging TikTok ad. First, let me identify your ideal audience.',
    timestamp: new Date('2024-02-06T14:20:10')
  },
  {
    id: 'chat2-3',
    type: 'audience_group',
    sender: 'ai',
    content: 'Here are the best audience segments for your camera:',
    data: { 
      audiences: [
        {
          id: 'tech-aud1',
          name: 'Content Creators',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
          label: 'Primary (40-50%)',
          labelColor: '#06E8DC',
          age: '22-35',
          gender: 'All',
          location: 'Global',
          description: 'YouTubers and influencers seeking pro-level equipment',
          traits: ['tech-savvy', 'creative', 'quality-focused'],
          painPoints: ['Equipment costs', 'Complex setups', 'Portability'],
          features: []
        },
        {
          id: 'tech-aud2',
          name: 'Adventure Enthusiasts',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
          label: 'Secondary (25-35%)',
          labelColor: '#9CA3AF',
          age: '25-45',
          gender: 'All',
          location: 'United States, Europe',
          description: 'Outdoor adventurers wanting to capture experiences',
          traits: ['active', 'experience-seeking', 'share-oriented'],
          painPoints: ['Durability concerns', 'Ease of use outdoors', 'Battery life'],
          features: []
        }
      ]
    },
    timestamp: new Date('2024-02-06T14:20:25')
  },
  {
    id: 'chat2-4',
    type: 'text',
    sender: 'user',
    content: 'Generate image ads showing the camera in action sports scenarios',
    timestamp: new Date('2024-02-07T09:15:00')
  },
  {
    id: 'chat2-5',
    type: 'text',
    sender: 'ai',
    content: 'I\'ll create dynamic action sports imagery for your campaign.',
    timestamp: new Date('2024-02-07T09:15:10')
  }
];

export const brandsData: Brand[] = [
  {
    id: 'brand-1',
    name: 'Wellness Co.',
    logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop',
    context: {
      companyName: 'Wellness Co.',
      industry: 'Health & Wellness',
      targetAudience: 'Health-conscious adults 25-65, primarily women',
      brandVoice: 'Trustworthy, scientific, empowering',
      keyValues: ['Evidence-based', 'Transparency', 'Holistic wellness', 'Quality ingredients'],
      productCategories: ['Supplements', 'Probiotics', 'Sleep aids', 'Vitamins']
    },
    products: brand1Products,
    chatHistories: [
      {
        id: 'history-1-1',
        title: 'Probiotic Video Campaign',
        messages: brand1Chats,
        createdAt: '2024-02-05T10:30:00',
        updatedAt: '2024-02-05T10:32:15'
      }
    ],
    createdAt: '2024-01-15'
  },
  {
    id: 'brand-2',
    name: 'TechGear Pro',
    logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop',
    context: {
      companyName: 'TechGear Pro',
      industry: 'Consumer Electronics',
      targetAudience: 'Tech enthusiasts, content creators, 18-45',
      brandVoice: 'Innovative, energetic, inspiring',
      keyValues: ['Innovation', 'User-friendly', 'Professional quality', 'Portability'],
      productCategories: ['Cameras', 'Stabilizers', 'Accessories', 'Software']
    },
    products: brand2Products,
    chatHistories: [
      {
        id: 'history-2-1',
        title: 'Insta360 TikTok Ad',
        messages: brand2Chats,
        createdAt: '2024-02-06T14:20:00',
        updatedAt: '2024-02-07T09:15:10'
      }
    ],
    createdAt: '2024-01-20'
  }
];
