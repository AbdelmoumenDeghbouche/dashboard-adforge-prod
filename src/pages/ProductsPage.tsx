import React, { useState } from 'react';
import ProductBreadcrumb from '../components/products/ProductBreadcrumb';
import ProductsHeader from '../components/products/ProductsHeader';
import ProductCard from '../components/products/ProductCard';

import { Product } from '../types/products';

interface ProductsPageProps {
  onEditProduct: (product: Product) => void;
  products: Product[];
}

const ProductsPage: React.FC<ProductsPageProps> = ({ onEditProduct, products }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateProduct = () => {
    // Pass null to show empty form with default placeholder image
    onEditProduct(null as any);
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-4 h-full bg-bg-sidebar pt-4 pr-1 sm:pr-2 pb-2 pl-0">
      {/* Breadcrumb - Gap 16px below it based on Figma */}
      <div className="px-2 sm:px-[10px]">
        <ProductBreadcrumb paths={['Pulsor Inc.', 'Products']} />
      </div>

      {/* Main Content Container - 1152px width on 1440px screen */}
      <div className="flex-1 bg-white border border-[#0A0A0A]/[0.06] rounded-2xl pt-6 sm:pt-[44px] px-4 sm:px-[52px] pb-[44px] overflow-y-auto">
        <div className="max-w-[980px] mx-auto flex flex-col gap-8 sm:gap-[48px]">
          {/* Header (Title + Toolbar) */}
          <ProductsHeader 
            onCreateClick={handleCreateProduct}
            onSearchChange={setSearchQuery}
          />

          {/* Products Grid - Responsive with proper breakpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onEditProduct(product)}
                  onEditClick={() => onEditProduct(product)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-[#0A0A0A]/50">
                No products found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
