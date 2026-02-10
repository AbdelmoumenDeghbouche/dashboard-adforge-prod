/**
 * Shopify Integration Page
 * 
 * Complete flow for connecting Shopify stores:
 * 1. User enters store domain and clicks "Connect Store"
 * 2. Redirects to Shopify OAuth
 * 3. Shopify redirects back to: /shopify?shop=xxx.myshopify.com&success=true
 * 4. Shows brand setup modal (logo + colors)
 * 5. Syncs all products from Shopify
 * 6. Products appear in product list with same structure as scraped products
 * 
 * Backend Environment Variables Required:
 * - SHOPIFY_API_KEY
 * - SHOPIFY_API_SECRET
 * - SHOPIFY_REDIRECT_URI (e.g., http://localhost:8000/api/v1/shopify/callback)
 * - SHOPIFY_FRONTEND_SUCCESS_URL (e.g., http://localhost:5173/shopify)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import BrandSetupModal from '../components/shopify/BrandSetupModal';
import { shopifyAPI } from '../services/apiService';
import AlertModal from '../components/common/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';

const ShopifyIntegration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBrandSetup, setShowBrandSetup] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [syncing, setSyncing] = useState(null);
  
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'warning' });

  useEffect(() => {
    loadStores();
    
    // Check if redirected from OAuth callback
    const shop = searchParams.get('shop');
    const success = searchParams.get('success');
    
    if (shop && success === 'true') {
      // OAuth successful, check if brand setup is needed
      handleOAuthReturn(shop);
    }
  }, [searchParams]);

  const loadStores = async () => {
    try {
      const response = await shopifyAPI.getStores();
      if (response.data.success) {
        setStores(response.data.data.stores);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthReturn = async (shop) => {
    try {
      const response = await shopifyAPI.getSyncStatus(shop);
      if (response.data.success) {
        const status = response.data.data;
        
        if (!status.brand_setup_completed) {
          // Show brand setup modal
          setSelectedShop(shop);
          setShowBrandSetup(true);
        } else if (!status.last_product_sync) {
          // Brand setup done, prompt to sync products
          setSelectedShop(shop);
          setConfirmModal({
            isOpen: true,
            title: 'Sync Products',
            message: 'Brand setup complete! Would you like to import all your products now?',
            type: 'info',
            onConfirm: async () => {
              await handleSyncProducts(shop);
            }
          });
        } else {
          // Everything done
          setAlertModal({
            isOpen: true,
            title: 'Store Connected',
            message: `Successfully connected ${shop}!`,
            type: 'success'
          });
          loadStores();
        }
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  const handleConnectStore = async () => {
    // Simple prompt for shop domain (Shopify requires this for OAuth)
    const shop = prompt('Enter your Shopify store domain (e.g., mystore):');
    
    if (!shop || !shop.trim()) {
      return;
    }

    try {
      // Get current user token
      const { auth } = await import('../config/firebase');
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      
      // Redirect directly to backend OAuth endpoint - it will redirect to Shopify
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      window.location.href = `${backendUrl}/api/v1/shopify/oauth/start?shop=${encodeURIComponent(shop.trim())}&token=${token}`;
    } catch (error) {
      console.error('Error getting token:', error);
      // Fallback without token
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      window.location.href = `${backendUrl}/api/v1/shopify/oauth/start?shop=${encodeURIComponent(shop.trim())}`;
    }
  };

  const handleBrandSetup = async (setupData) => {
    try {
      const response = await shopifyAPI.setupBrand(
        setupData.shop,
        setupData.brandName,
        setupData.primaryColor,
        setupData.secondaryColor,
        setupData.logoFile
      );

      if (response.data.success) {
        setShowBrandSetup(false);
        
        // Prompt to sync products
        setConfirmModal({
          isOpen: true,
          title: 'Brand Setup Complete',
          message: 'Your brand is ready! Would you like to import all your products now?',
          type: 'success',
          onConfirm: async () => {
            await handleSyncProducts(setupData.shop);
          }
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSyncProducts = async (shop) => {
    setSyncing(shop);

    try {
      const response = await shopifyAPI.syncProducts(shop);
      
      if (response.data.success) {
        const result = response.data.data;
        
        setAlertModal({
          isOpen: true,
          title: 'Products Synced',
          message: `Successfully imported ${result.imported} out of ${result.total} products!`,
          type: 'success'
        });
        
        loadStores();
        
        // Redirect to products page
        setTimeout(() => {
          navigate('/ingestion');
        }, 2000);
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      setAlertModal({
        isOpen: true,
        title: 'Sync Failed',
        message: error.response?.data?.message || 'Failed to sync products. Please try again.',
        type: 'error'
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleManualSync = (shop) => {
    setConfirmModal({
      isOpen: true,
      title: 'Sync Products',
      message: 'This will import all products from your Shopify store. This may take a few minutes for large stores. Continue?',
      type: 'warning',
      onConfirm: async () => {
        await handleSyncProducts(shop);
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-[#0F0F0F] min-h-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Shopify Integration</h1>
          <p className="text-gray-400">Connect your Shopify stores and import products</p>
        </div>

        {/* Connect New Store */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Connect Shopify Store</h2>
              <p className="text-sm text-gray-400">
                Connect your Shopify store to import products and start creating ads
              </p>
            </div>
            <button
              onClick={handleConnectStore}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Connect Store
            </button>
          </div>
        </div>

        {/* Connected Stores */}
        {loading ? (
          <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-12 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No stores connected</h3>
            <p className="text-gray-400">Connect your first Shopify store to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Connected Stores</h2>
            
            {stores.map((store) => (
              <div
                key={store.shop}
                className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{store.shop_name || store.shop}</h3>
                        <p className="text-sm text-gray-400">{store.shop}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Brand Setup</p>
                        <p className="text-sm text-white">
                          {store.brand_setup_completed ? (
                            <span className="inline-flex items-center gap-1 text-green-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Complete
                            </span>
                          ) : (
                            <span className="text-orange-400">Pending</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Products</p>
                        <p className="text-sm text-white">
                          {store.total_products || 0} imported
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Last Sync</p>
                        <p className="text-sm text-white">
                          {formatDate(store.last_product_sync)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!store.brand_setup_completed && (
                      <button
                        onClick={() => {
                          setSelectedShop(store.shop);
                          setShowBrandSetup(true);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Setup Brand
                      </button>
                    )}
                    
                    {store.brand_setup_completed && (
                      <button
                        onClick={() => handleManualSync(store.shop)}
                        disabled={syncing === store.shop}
                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {syncing === store.shop ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Syncing...
                          </span>
                        ) : (
                          'Sync Products'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Brand Setup Modal */}
        <BrandSetupModal
          isOpen={showBrandSetup}
          shop={selectedShop}
          onClose={() => {
            setShowBrandSetup(false);
            setSelectedShop(null);
          }}
          onComplete={handleBrandSetup}
        />

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal({ ...confirmModal, isOpen: false });
          }}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />
      </div>
    </DashboardLayout>
  );
};

export default ShopifyIntegration;

