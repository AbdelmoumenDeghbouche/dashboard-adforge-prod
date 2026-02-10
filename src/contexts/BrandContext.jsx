import React, { createContext, useState, useEffect, useContext } from 'react';
import { brandsAPI, adsAPI } from '../services/apiService';
import { useAuth } from './AuthContext';

const BrandContext = createContext({});

// Custom hook to use brand context
export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

export const BrandProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Brand-specific data
  const [brandProducts, setBrandProducts] = useState(null); // Products for selected brand
  const [brandAds, setBrandAds] = useState(null); // Ads for selected brand
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  
  // Prevent duplicate fetches
  const isFetchingBrandsRef = React.useRef(false);
  const isFetchingBrandDataRef = React.useRef(false);

  // Wrapper for setSelectedBrand that persists to sessionStorage
  const setSelectedBrandWithPersistence = (brand) => {
    setSelectedBrand(brand);
    if (brand) {
      console.log('[BrandContext] Saving selected brand to session:', brand.brandId);
      sessionStorage.setItem('selectedBrandId', brand.brandId);
    } else {
      console.log('[BrandContext] Clearing selected brand from session');
      sessionStorage.removeItem('selectedBrandId');
    }
  };

  // Load brands when user is authenticated
  useEffect(() => {
    if (currentUser) {
      refreshBrands();
    } else {
      setBrands([]);
      setSelectedBrand(null);
      setBrandProducts(null);
      setBrandAds(null);
      setLoading(false);
    }
  }, [currentUser]);

  // Automatically fetch products and ads when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      console.log('[BrandContext] Brand selected, fetching products and ads:', selectedBrand.brandId);
      loadBrandData(selectedBrand.brandId);
    } else {
      console.log('[BrandContext] No brand selected, clearing products and ads');
      setBrandProducts(null);
      setBrandAds(null);
    }
  }, [selectedBrand]);

  // Refresh brands list from API
  const refreshBrands = async () => {
    // Prevent duplicate fetches
    if (isFetchingBrandsRef.current) {
      console.log('[BrandContext] Already fetching brands, skipping...');
      return;
    }
    
    isFetchingBrandsRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('[BrandContext] Fetching brands...');
      const response = await brandsAPI.getBrands();
      console.log('[BrandContext] Response received:', response);
      
      if (response.success && response.data) {
        // Backend returns { brands: [], count: number }
        const brandsArray = response.data.brands || response.data;
        console.log('[BrandContext] Brands array:', brandsArray);
        console.log('[BrandContext] Number of brands:', brandsArray.length);
        setBrands(brandsArray);
        
        // Try to restore previously selected brand from session storage
        const savedBrandId = sessionStorage.getItem('selectedBrandId');
        console.log('[BrandContext] Saved brand ID from session:', savedBrandId);
        
        if (savedBrandId) {
          // Try to find the saved brand in the list
          const savedBrand = brandsArray.find(b => b.brandId === savedBrandId);
          if (savedBrand) {
            console.log('[BrandContext] Restoring previously selected brand:', savedBrand.brandName);
            setSelectedBrand(savedBrand);
            return;
          } else {
            console.log('[BrandContext] Saved brand not found in list, clearing session');
            sessionStorage.removeItem('selectedBrandId');
          }
        }
        
        // If there's a previously selected brand (in state), try to maintain selection
        if (selectedBrand) {
          const stillExists = brandsArray.find(b => b.brandId === selectedBrand.brandId);
          if (!stillExists) {
            // Previously selected brand doesn't exist anymore
            // Auto-select first brand if available
            if (brandsArray.length > 0) {
              console.log('[BrandContext] Previously selected brand not found, auto-selecting first brand');
              setSelectedBrandWithPersistence(brandsArray[0]);
            } else {
              setSelectedBrandWithPersistence(null);
            }
          } else {
            setSelectedBrand(stillExists);
          }
        } else if (brandsArray.length > 0) {
          // No brand selected but brands exist - auto-select first one
          console.log('[BrandContext] No brand selected, auto-selecting first brand:', brandsArray[0].brandName);
          setSelectedBrandWithPersistence(brandsArray[0]);
        }
      } else {
        console.log('[BrandContext] Response not successful or no data:', response);
        setBrands([]);
      }
    } catch (err) {
      console.error('[BrandContext] Error fetching brands:', err);
      console.error('[BrandContext] Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setError(err.message || 'Failed to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new brand
  const createBrand = async (brandData, logoFile = null) => {
    try {
      const response = await brandsAPI.createBrand(brandData, logoFile);
      
      if (response.success && response.data) {
        await refreshBrands();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to create brand' };
      }
    } catch (err) {
      console.error('Error creating brand:', err);
      return { success: false, error: err.message || 'Failed to create brand' };
    }
  };

  // Update an existing brand
  const updateBrand = async (brandId, updates, logoFile = null) => {
    try {
      const response = await brandsAPI.updateBrand(brandId, updates, logoFile);
      
      if (response.success) {
        await refreshBrands();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to update brand' };
      }
    } catch (err) {
      console.error('Error updating brand:', err);
      return { success: false, error: err.message || 'Failed to update brand' };
    }
  };

  // Delete a brand
  const deleteBrand = async (brandId) => {
    try {
      const response = await brandsAPI.deleteBrand(brandId);
      
      if (response.success) {
        // If deleted brand was selected, clear selection
        if (selectedBrand && selectedBrand.brandId === brandId) {
          setSelectedBrandWithPersistence(null);
        }
        await refreshBrands();
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to delete brand' };
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
      return { success: false, error: err.message || 'Failed to delete brand' };
    }
  };

  // Load all data for a specific brand (products and ads)
  const loadBrandData = async (brandId) => {
    // Prevent duplicate fetches
    if (isFetchingBrandDataRef.current) {
      console.log('[BrandContext] Already fetching brand data, skipping...');
      return;
    }
    
    isFetchingBrandDataRef.current = true;
    console.log('[BrandContext] Loading data for brand:', brandId);
    
    // Fetch products and ads in parallel
    setLoadingProducts(true);
    setLoadingAds(true);
    
    try {
      const [productsResponse, adsResponse] = await Promise.all([
        brandsAPI.getBrandProducts(brandId).catch(err => {
          console.error('[BrandContext] Error fetching products:', err);
          return { success: false, error: err.message };
        }),
        adsAPI.getBrandAds(brandId).catch(err => {
          console.error('[BrandContext] Error fetching ads:', err);
          return { success: false, error: err.message };
        })
      ]);
      
      // Handle products
      if (productsResponse.success && productsResponse.data) {
        const productsArray = productsResponse.data.products || productsResponse.data;
        console.log('[BrandContext] Loaded products:', productsArray.length);
        setBrandProducts(productsArray);
      } else {
        console.log('[BrandContext] No products loaded');
        setBrandProducts([]);
      }
      
      // Handle ads
      if (adsResponse.success && adsResponse.data) {
        const adsArray = adsResponse.data.ads || adsResponse.data;
        console.log('[BrandContext] Loaded ads:', adsArray.length);
        setBrandAds(adsArray);
      } else {
        console.log('[BrandContext] No ads loaded');
        setBrandAds([]);
      }
    } catch (err) {
      console.error('[BrandContext] Error loading brand data:', err);
      setBrandProducts([]);
      setBrandAds([]);
    } finally {
      setLoadingProducts(false);
      setLoadingAds(false);
      isFetchingBrandDataRef.current = false;
    }
  };

  // Get ads for a specific product
  const getProductAds = async (brandId, productId) => {
    try {
      console.log('[BrandContext] Fetching ads for product:', productId);
      const response = await adsAPI.getProductAds(brandId, productId);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to load product ads' };
      }
    } catch (err) {
      console.error('[BrandContext] Error fetching product ads:', err);
      return { success: false, error: err.message || 'Failed to load product ads' };
    }
  };

  // Get products for a specific brand (legacy method, now uses brandProducts state)
  const getBrandProducts = async (brandId) => {
    try {
      const response = await brandsAPI.getBrandProducts(brandId);
      
      if (response.success && response.data) {
        // Backend returns { products: [], count: number }
        const productsArray = response.data.products || response.data;
        return { success: true, data: productsArray };
      } else {
        return { success: false, error: response.message || 'Failed to load products' };
      }
    } catch (err) {
      console.error('Error fetching brand products:', err);
      return { success: false, error: err.message || 'Failed to load products' };
    }
  };

  // Refresh brand data (products and ads) for currently selected brand
  const refreshBrandData = async () => {
    if (selectedBrand) {
      console.log('[BrandContext] Refreshing brand data for:', selectedBrand.brandId);
      await loadBrandData(selectedBrand.brandId);
    }
  };

  // Delete a product from a brand
  const deleteProduct = async (brandId, productId) => {
    try {
      const response = await brandsAPI.deleteProduct(brandId, productId);
      
      if (response.success) {
        await refreshBrands(); // Refresh to update product count
        // If deleted from currently selected brand, refresh its data
        if (selectedBrand && selectedBrand.brandId === brandId) {
          await refreshBrandData();
        }
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to delete product' };
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      return { success: false, error: err.message || 'Failed to delete product' };
    }
  };

  // Delete an ad from a brand
  const deleteAd = async (brandId, adId) => {
    try {
      const response = await adsAPI.deleteAd(brandId, adId);
      
      if (response.success) {
        await refreshBrands(); // Refresh to update ad count
        // If deleted from currently selected brand, refresh its data
        if (selectedBrand && selectedBrand.brandId === brandId) {
          await refreshBrandData();
        }
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to delete ad' };
      }
    } catch (err) {
      console.error('Error deleting ad:', err);
      return { success: false, error: err.message || 'Failed to delete ad' };
    }
  };

  const value = {
    // Brand list
    brands,
    selectedBrand,
    setSelectedBrand: setSelectedBrandWithPersistence, // Use wrapper that persists to session
    loading,
    error,
    
    // Brand-specific data
    brandProducts, // Products for selected brand (null if no brand selected)
    brandAds, // Ads for selected brand (null if no brand selected)
    loadingProducts,
    loadingAds,
    
    // Actions
    refreshBrands,
    refreshBrandData, // Refresh products and ads for selected brand
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandProducts, // Legacy method - prefer using brandProducts state
    getProductAds, // Get ads for a specific product
    deleteProduct,
    deleteAd,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

export default BrandContext;