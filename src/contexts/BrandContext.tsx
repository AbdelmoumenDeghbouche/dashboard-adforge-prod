import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Brand, ChatHistory } from '../types/brands';
import { brandsData } from '../data/brandsData';

interface BrandContextType {
  currentBrand: Brand;
  brands: Brand[];
  switchBrand: (brandId: string) => void;
  selectedChatId: string | null;
  selectChat: (chatId: string | null) => void;
  getCurrentChatHistory: () => ChatHistory | null;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

interface BrandProviderProps {
  children: ReactNode;
}

export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>(brandsData);
  const [currentBrandId, setCurrentBrandId] = useState<string>(brandsData[0].id);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const currentBrand = brands.find(b => b.id === currentBrandId) || brands[0];

  const switchBrand = (brandId: string) => {
    console.log('🔀 Switching brand from', currentBrandId, 'to', brandId);
    const newBrand = brands.find(b => b.id === brandId);
    console.log('🔀 New brand:', newBrand?.name, 'chat histories:', newBrand?.chatHistories?.length || 0);
    setCurrentBrandId(brandId);
    setSelectedChatId(null); // Reset selected chat when switching brands
  };

  const selectChat = (chatId: string | null) => {
    console.log('💬 Selecting chat:', chatId);
    setSelectedChatId(chatId);
  };

  const getCurrentChatHistory = () => {
    if (!selectedChatId) return null;
    return currentBrand.chatHistories.find(ch => ch.id === selectedChatId) || null;
  };

  return (
    <BrandContext.Provider value={{ 
      currentBrand, 
      brands, 
      switchBrand, 
      selectedChatId, 
      selectChat,
      getCurrentChatHistory
    }}>
      {children}
    </BrandContext.Provider>
  );
};
