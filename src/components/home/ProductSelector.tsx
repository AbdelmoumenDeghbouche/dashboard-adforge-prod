import React from 'react';
import { cn } from '@/utils/cn';

interface Product {
  id: string;
  name: string;
  image: string;
}

const fakeProducts: Product[] = [
  { id: '1', name: 'Sérum autobron...', image: '/icons/chat.svg' },
  { id: '2', name: 'Crème hydratante enrichie...', image: '/icons/chat.svg' },
  { id: '3', name: 'Masque facial purifiant au c...', image: '/icons/chat.svg' },
  { id: '4', name: 'Gel nettoyant doux pour pe...', image: '/icons/chat.svg' },
];

interface ProductSelectorProps {
  selected: string | null;
  onSelect: (productId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ selected, onSelect, isOpen, onToggle }) => {
  const selectedProduct = fakeProducts.find(p => p.id === selected);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex flex-row items-center p-[6px_10px_6px_10px] sm:p-[6px_12px_6px_12px] gap-1.5 sm:gap-2 w-auto h-[30px] sm:h-[34px] bg-[#0A0A0A]/[0.04] rounded-[12px] sm:rounded-[14px] transition-all duration-200 hover:bg-[#0A0A0A]/[0.06] border border-[#0A0A0A]/[0.02]"
      >
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 max-w-[100px] sm:max-w-[150px] overflow-hidden">
           {selectedProduct && (
             <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center p-0.5 sm:p-1 shrink-0">
               <img src={selectedProduct.image} alt="" className="w-full h-full object-contain" />
             </div>
           )}
           <span className="font-medium text-[12px] sm:text-[14px] leading-[18px] sm:leading-[22px] tracking-[-0.012em] text-[#0A0A0A] truncate">
             {selectedProduct ? selectedProduct.name : "Select a product"}
           </span>
        </div>
        <div className="w-3 h-3 opacity-50 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform", isOpen && "rotate-180")}>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onToggle} />
          <div className="absolute top-full left-0 mt-2 p-1 gap-1 w-[240px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0px_20px_50px_rgba(0,0,0,0.15)] rounded-[22px] z-[70] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col max-h-[280px] overflow-y-auto custom-scrollbar p-1 gap-1">
              {fakeProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelect(product.id);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#0A0A0A]/[0.03] transition-all text-left rounded-xl group/item',
                    selected === product.id && 'bg-[#0A0A0A]/[0.04]'
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-white border border-[#0A0A0A]/[0.04] flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                    <img src={product.image} alt="" className="w-full h-full object-contain opacity-60 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                  <span className={cn(
                    'text-[14px] leading-5 truncate font-medium tracking-[-0.012em]',
                    selected === product.id ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/60'
                  )}>
                    {product.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-1 mt-0.5 border-t border-[#0A0A0A]/[0.04]">
              <button 
                className="w-full flex items-center justify-center py-2.5 rounded-xl hover:bg-[#0A0A0A]/[0.02] transition-colors"
                onClick={() => {
                  console.log('View all products');
                  onToggle();
                }}
              >
                <span className="font-semibold text-[13px] leading-5 text-[#0A0A0A]/40 uppercase tracking-wider">
                  Voir tous les produits
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSelector;
