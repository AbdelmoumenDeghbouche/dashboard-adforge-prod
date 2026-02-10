import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useBrand } from './contexts/BrandContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AiAvatarsPage from './pages/AiAvatarsPage';
import FolderListingPage from './pages/FolderListingPage';
import ProductsPage from './pages/ProductsPage';
import AdsLibraryPage from './pages/AdsLibraryPage';
import SettingsPage from './pages/SettingsPage';
import { SettingsTab } from './components/sidebar/SettingsSidebarContent';
import ProductEditPage from './pages/ProductEditPage';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import { Product } from './types/products';
import ProductBreadcrumb from './components/products/ProductBreadcrumb';

export type PageType =
  | 'home'
  | 'ai-avatars'
  | 'folder-listing'
  | 'products'
  | 'ads-library'
  | 'settings'
  | 'product-edit'
  | 'login'
  | 'signup'
  | 'forgot-password';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const { currentBrand } = useBrand();
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  
  // Hooks for other states must be top-level (unconditional)
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('profile');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(currentBrand.products);

  // Update products when brand changes
  useEffect(() => {
    setProducts(currentBrand.products);
  }, [currentBrand]);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // If logged in and on a public auth page, redirect to home
        if (['login', 'signup', 'forgot-password'].includes(currentPage)) {
          setCurrentPage('home');
        }
      } else {
        // If not logged in and not on a public auth page, redirect to login
        if (!['login', 'signup', 'forgot-password'].includes(currentPage)) {
          setCurrentPage('login');
        }
      }
    }
  }, [isAuthenticated, loading, currentPage]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-edit');
  };

  const handleSaveProduct = (product: Product) => {
    setProducts(prevProducts => {
      const existingIndex = prevProducts.findIndex(p => p.id === product.id);
      if (existingIndex >= 0) {
        // Update existing product
        const updated = [...prevProducts];
        updated[existingIndex] = product;
        return updated;
      } else {
        // Add new product
        return [...prevProducts, product];
      }
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <ProductsPage onEditProduct={handleEditProduct} products={products} />;
      case 'product-edit':
        return (
          <div className="flex flex-col gap-4 h-full bg-bg-sidebar pt-4 pr-2 pb-2 pl-0">
            <div className="px-[10px]">
              <ProductBreadcrumb
                paths={['Pulsor Inc.', 'Products', selectedProduct?.title || 'Insta360 Ace Pro']}
              />
            </div>
            {/* The main content area will be the ProductEditPage */}
            <div className="flex-1 bg-white border border-[#0A0A0A]/[0.06] rounded-2xl pt-[44px] px-[52px] pb-[44px] overflow-y-auto">
              <div className="max-w-[980px] mx-auto">
                <ProductEditPage
                  product={selectedProduct}
                  onBack={() => setCurrentPage('products')}
                  onSave={handleSaveProduct}
                />
              </div>
            </div>
          </div>
        );
      case 'folder-listing':
        return <FolderListingPage />;
      case 'ai-avatars':
        return <AiAvatarsPage />;
      case 'ads-library':
        return <AdsLibraryPage />;
      case 'settings':
        return <SettingsPage activeTab={activeSettingsTab} />;
      case 'login':
        return <AuthPage defaultIsLogin={true} onNavigate={setCurrentPage} />;
      case 'signup':
        return <AuthPage defaultIsLogin={false} onNavigate={setCurrentPage} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      activeSettingsTab={activeSettingsTab}
      onSettingsTabChange={setActiveSettingsTab}
    >
      {renderPage()}
    </MainLayout>
  );
}

export default App;
