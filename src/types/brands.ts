import { Product } from './products';
import { ChatMessage } from './chat';

export interface BrandContext {
  companyName: string;
  industry: string;
  targetAudience: string;
  brandVoice: string;
  keyValues: string[];
  productCategories: string[];
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  context: BrandContext;
  products: Product[];
  chatHistories: ChatHistory[];
  createdAt: string;
}
