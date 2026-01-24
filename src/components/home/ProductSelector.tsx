import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface Product {
  id: string;
  name: string;
  image: string;
}

const fakeProducts: Product[] = [
  { id: '1', name: 'Sérum autobronzant progre...', image: '/icons/chat.svg' },
  { id: '2', name: 'Crème hydratante enrichie...', image: '/icons/chat.svg' },
  { id: '3', name: 'Masque facial purifiant au c...', image: '/icons/chat.svg' },
  { id: '4', name: 'Gel nettoyant doux pour pe...', image: '/icons/chat.svg' },
  { id: '5', name: 'Gel nettoyant doux pour pe...', image: '/icons/chat.svg' },
];

interface ProductSelectorProps {
  selected: string | null;
  onSelect: (productId: string) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedProduct = fakeProducts.find(p => p.id === selected);

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '154px',
          height: '34px',
          paddingTop: '6px',
          paddingRight: '12px',
          paddingBottom: '6px',
          paddingLeft: '14px',
          gap: '8px',
          borderRadius: '14px',
        }}
        className="flex items-center text-xs sm:text-sm text-text-primary hover:bg-bg-hover transition-all justify-between bg-white border border-border-light"
      >
        <span className="flex items-center gap-2 flex-1 overflow-hidden">
          {selectedProduct ? (
            <>
              <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={selectedProduct.image} alt="" className="w-4 h-4 object-contain" />
              </div>
              <span className="truncate text-text-primary text-xs">{selectedProduct.name}</span>
            </>
          ) : (
            <span className="text-text-tertiary truncate text-xs">Select a product</span>
          )}
        </span>
        <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div 
            style={{
              width: '250px',
              height: '242px',
              borderRadius: '18px',
              padding: '4px',
            }}
            className="absolute top-full left-0 mt-2 bg-white border border-border-light shadow-lg z-20 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto flex flex-col gap-[10px]">
              {fakeProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelect(product.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-hover transition-all text-left rounded-xl',
                    selected === product.id && 'bg-gray-100'
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={product.image} alt="" className="w-5 h-5 object-contain" />
                  </div>
                  <span className={cn(
                    'text-sm truncate',
                    selected === product.id ? 'text-text-primary font-medium' : 'text-text-secondary'
                  )}>
                    {product.name}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Divider */}
            <div className="border-t border-border-light mx-2 my-1" />
            
            {/* View All Button */}
            <button className="w-full px-3 py-2 text-sm text-text-primary hover:bg-bg-hover transition-all text-center font-medium rounded-xl">
              Voir tous les produits
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSelector;
