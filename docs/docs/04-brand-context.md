# Brand Context

## Overview

BrandContext manages brand selection, products, and ads across the application. It provides centralized state management with automatic data loading and session persistence.

## Location
`src/contexts/BrandContext.jsx`

## Features

- ✅ Load all user brands on login
- ✅ Auto-select first brand
- ✅ Persist selected brand in sessionStorage
- ✅ Automatically fetch products & ads when brand selected
- ✅ Prevent duplicate API calls
- ✅ CRUD operations for brands and products

## Usage

### Hook

```javascript
import { useBrand } from '../contexts/BrandContext';

function MyComponent() {
  const {
    // Brand list
    brands,
    selectedBrand,
    setSelectedBrand,
    loading,
    
    // Brand-specific data
    brandProducts,
    brandAds,
    loadingProducts,
    loadingAds,
    
    // Actions
    refreshBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  } = useBrand();
  
  // ...
}
```

## State Structure

### Brand Object

```javascript
{
  brandId: "brand_123",
  brandName: "My Brand",
  domain: "mybrand.com",
  logoUrl: "https://...",
  primaryColor: "#FF0000",
  secondaryColor: "#00FF00",
  accentColor: "#0000FF",
  productCount: 5,
  adCount: 12,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z"
}
```

### Product Object

```javascript
{
  productId: "prod_456",
  brandId: "brand_123",
  productName: "My Product",
  description: "Product description",
  price: 99.99,
  imageUrl: "https://...",
  productUrl: "https://mybrand.com/product",
  category: "Electronics",
  research_status: "completed", // pending, processing, completed, failed
  research_id: "res_789",
  createdAt: "2024-01-15T10:00:00Z"
}
```

## Context API

### Brand Selection

```javascript
const { brands, selectedBrand, setSelectedBrand } = useBrand();

// List all brands
brands.forEach(brand => {
  console.log(brand.brandName);
});

// Select a brand
setSelectedBrand(brands[0]);

// Selected brand persists in sessionStorage
// Automatically restored on page refresh
```

### Auto-Loading

When brand is selected, products and ads load automatically:

```javascript
// In BrandContext
useEffect(() => {
  if (selectedBrand) {
    loadBrandData(selectedBrand.brandId);
  }
}, [selectedBrand]);

async function loadBrandData(brandId) {
  // Fetch products and ads in parallel
  const [productsResponse, adsResponse] = await Promise.all([
    brandsAPI.getBrandProducts(brandId),
    adsAPI.getBrandAds(brandId)
  ]);
  
  setBrandProducts(productsResponse.data.products);
  setBrandAds(adsResponse.data.ads);
}
```

### Accessing Brand Data

```javascript
const { selectedBrand, brandProducts, brandAds, loadingProducts, loadingAds } = useBrand();

if (loadingProducts) {
  return <LoadingSpinner />;
}

// Products for selected brand
brandProducts.forEach(product => {
  console.log(product.productName);
});

// Ads for selected brand
brandAds.forEach(ad => {
  console.log(ad.headline);
});
```

## CRUD Operations

### Create Brand

```javascript
const { createBrand } = useBrand();

async function handleCreateBrand() {
  const brandData = {
    brandName: "New Brand",
    domain: "newbrand.com",
    primaryColor: "#FF0000",
    secondaryColor: "#00FF00",
    accentColor: "#0000FF"
  };
  
  const logoFile = /* File object from input */;
  
  const result = await createBrand(brandData, logoFile);
  
  if (result.success) {
    console.log('Brand created:', result.data);
    // Brands list automatically refreshed
  } else {
    console.error('Error:', result.error);
  }
}
```

### Update Brand

```javascript
const { updateBrand } = useBrand();

async function handleUpdateBrand(brandId) {
  const updates = {
    brandName: "Updated Name",
    primaryColor: "#00FF00"
  };
  
  const newLogoFile = /* Optional new logo */;
  
  const result = await updateBrand(brandId, updates, newLogoFile);
  
  if (result.success) {
    console.log('Brand updated');
  }
}
```

### Delete Brand

```javascript
const { deleteBrand, selectedBrand } = useBrand();

async function handleDeleteBrand(brandId) {
  const result = await deleteBrand(brandId);
  
  if (result.success) {
    console.log('Brand deleted');
    // If deleted brand was selected, selection automatically cleared
  }
}
```

### Delete Product

```javascript
const { deleteProduct, refreshBrandData } = useBrand();

async function handleDeleteProduct(brandId, productId) {
  const result = await deleteProduct(brandId, productId);
  
  if (result.success) {
    console.log('Product deleted');
    // Brand data automatically refreshed
  }
}
```

### Refresh Brand Data

```javascript
const { refreshBrandData } = useBrand();

async function handleRefresh() {
  // Refreshes products and ads for currently selected brand
  await refreshBrandData();
}
```

## Session Persistence

### How It Works

```javascript
// When brand is selected
setSelectedBrand(brand);
sessionStorage.setItem('selectedBrandId', brand.brandId);

// On page load
const savedBrandId = sessionStorage.getItem('selectedBrandId');
if (savedBrandId) {
  const savedBrand = brands.find(b => b.brandId === savedBrandId);
  if (savedBrand) {
    setSelectedBrand(savedBrand); // Restore selection
  }
}
```

### Benefits
- ✅ Brand selection survives page refresh
- ✅ Cleared on logout (sessionStorage clears)
- ✅ Doesn't persist across browser sessions

## Duplicate Fetch Prevention

Uses refs to prevent duplicate API calls:

```javascript
const isFetchingBrandsRef = useRef(false);

async function refreshBrands() {
  if (isFetchingBrandsRef.current) {
    console.log('Already fetching brands, skipping...');
    return;
  }
  
  isFetchingBrandsRef.current = true;
  try {
    // Fetch brands...
  } finally {
    isFetchingBrandsRef.current = false;
  }
}
```

## Integration with Other Contexts

### With AuthContext

```javascript
// In BrandContext
import { useAuth } from './AuthContext';

const { currentUser } = useAuth();

// Load brands when user logs in
useEffect(() => {
  if (currentUser) {
    refreshBrands();
  } else {
    // Clear all data on logout
    setBrands([]);
    setSelectedBrand(null);
  }
}, [currentUser]);
```

### Provider Nesting

```javascript
// In main.jsx or App.jsx
import { AuthProvider } from './contexts/AuthContext';
import { BrandProvider } from './contexts/BrandContext';

<AuthProvider>
  <BrandProvider>
    {/* Rest of app */}
  </BrandProvider>
</AuthProvider>
```

**Order matters:** AuthProvider must wrap BrandProvider since BrandContext depends on currentUser.

## Common Patterns

### Wait for Brand Selection

```javascript
const { selectedBrand, loading } = useBrand();

if (loading) {
  return <LoadingSpinner />;
}

if (!selectedBrand) {
  return <div>Please select a brand</div>;
}

// Safe to use selectedBrand
const brandId = selectedBrand.brandId;
```

### Get Product Ads

```javascript
const { getProductAds } = useBrand();

async function loadAdsForProduct(brandId, productId) {
  const result = await getProductAds(brandId, productId);
  
  if (result.success) {
    const ads = result.data.ads;
    console.log(`Found ${ads.length} ads for product`);
  }
}
```

### Refresh After Changes

```javascript
const { refreshBrands, refreshBrandData } = useBrand();

async function afterProductUpdate() {
  // Option 1: Refresh only current brand's data
  await refreshBrandData();
  
  // Option 2: Refresh entire brand list (includes counts)
  await refreshBrands();
}
```

## API Calls Made by BrandContext

### On User Login
```
GET /api/v1/brands
```

### On Brand Selection
```
GET /api/v1/brands/{brandId}/products
GET /api/v1/brands/{brandId}/ads
```

### On Create/Update/Delete
- Automatically refreshes brand list after mutations

## Performance Optimizations

1. **Parallel Loading**: Products and ads fetched simultaneously
2. **Duplicate Prevention**: Refs prevent concurrent duplicate requests
3. **Lazy Loading**: Brand data only loaded when brand selected
4. **Session Persistence**: Avoids re-selecting brand on refresh
5. **Error Graceful**: Returns empty arrays on 404 instead of crashing

## Best Practices

1. ✅ Always wrap app in `<BrandProvider>` (inside `<AuthProvider>`)
2. ✅ Check `loading` before accessing data
3. ✅ Check `selectedBrand` exists before using it
4. ✅ Use `refreshBrandData()` after creating products/ads
5. ✅ Handle `error` state for failed brand loading
6. ✅ Don't call `refreshBrands()` too frequently (it's expensive)
