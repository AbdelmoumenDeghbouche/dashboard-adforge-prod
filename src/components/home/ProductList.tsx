import React from 'react';

interface Product {
  id: string;
  name: string;
  checked: boolean;
}

const fakeProducts: Product[] = [
  { id: '1', name: 'Sérum autobronzant progre...', checked: true },
  { id: '2', name: 'Crème hydratante enrichie...', checked: false },
  { id: '3', name: 'Masque facial purifiant au c...', checked: false },
  { id: '4', name: 'Gel nettoyant doux pour pa...', checked: false },
  { id: '5', name: 'Gel nettoyant doux pour pa...', checked: false },
];

interface ProductListProps {
  products?: Product[];
  onToggle?: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products = fakeProducts, onToggle }) => {
  const [localProducts, setLocalProducts] = React.useState(products);

  const handleToggle = (id: string) => {
    setLocalProducts(prev => 
      prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p)
    );
    onToggle?.(id);
  };

  return (
    <div className="flex flex-col gap-3">
      {localProducts.map((product) => (
        <label
          key={product.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-hover transition-all cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={product.checked}
            onChange={() => handleToggle(product.id)}
            className="w-4 h-4 rounded border-border-medium text-accent-primary focus:ring-accent-primary flex-shrink-0"
          />
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            {product.name}
          </span>
        </label>
      ))}
      
      <button className="mt-2 text-sm text-accent-primary hover:text-accent-hover font-medium text-left px-3">
        Voir tous les produits
      </button>
    </div>
  );
};

export default ProductList;
