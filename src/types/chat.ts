export type ChatMessageType = 
  | 'text' 
  | 'audience_group' 
  | 'marketing_angle' 
  | 'reasoning' 
  | 'status_update' 
  | 'format_selection'
  | 'psychology_selection'
  | 'video_result'
  | 'selection_summary'
  | 'static_ad_result';

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  sender: 'ai' | 'user';
  timestamp: Date;
  content?: string;
  data?: {
    audiences?: Audience[];
    angles?: MarketingAngle[];
    concepts?: PsychologyConcept[];
    reasoning?: string[];
    label?: string;
    status?: 'pending' | 'loading' | 'completed';
    estimatedTime?: string;
    steps?: { label: string; status: 'pending' | 'loading' | 'completed'; estimatedTime?: string }[];
    extraInfo?: string;
    isSelection?: boolean;
    value?: string;
    conceptName?: string;
    productName?: string;
    images?: string[];
    avatarImage?: string;
  };
}

export interface Audience {
  id: string;
  name: string;
  avatar: string;
  label?: string; // e.g. "Secondary (15-20%)"
  labelColor?: string; // e.g. "#00D1FF"
  age: string;
  gender: string;
  location: string;
  description: string;
  traits: string[];
  painPoints: string[];
  features: string[];
}

export interface MarketingAngle {
  id: string;
  title: string;
  description: string;
  score: string;
  metrics: {
    emotion: string;
    proof: string;
    differentiation: string;
  };
  reason: string;
  tags?: string[];
  isNew?: boolean;
}

export interface PsychologyConcept {
  id: string;
  title: string;
  score: string;
  description: string;
  hook: string;
  metrics: {
    hook: string;
    mechanism: string;
    believability: string;
    cta: string;
  };
}

export interface StatusStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed';
}
