# Brand & Product Endpoints

## Overview

Manage brands and their products through CRUD operations.

**Service:** `brandsAPI` from `src/services/apiService.js`

## Brand Endpoints

### 1. Get All Brands

**Get all brands for authenticated user**

```javascript
GET /api/v1/brands
```

**Headers:**
```
Authorization: Bearer {firebase_id_token}
```

**Response:**
```javascript
{
  success: true,
  data: {
    brands: [
      {
        brandId: "brand_123",
        brandName: "My Brand",
        domain: "mybrand.com",
        logoUrl: "https://storage.googleapis.com/...",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        accentColor: "#0000FF",
        productCount: 5,
        adCount: 12,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z"
      }
    ],
    count: 1
  }
}
```

**Frontend Usage:**
```javascript
import { brandsAPI } from '../services/apiService';

const response = await brandsAPI.getBrands();
const brands = response.data.brands;
```

---

### 2. Get Single Brand

**Get details for specific brand**

```javascript
GET /api/v1/brands/{brandId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    brandId: "brand_123",
    brandName: "My Brand",
    domain: "mybrand.com",
    logoUrl: "https://...",
    primaryColor: "#FF0000",
    secondaryColor: "#00FF00",
    accentColor: "#0000FF",
    productCount: 5,
    adCount: 12
  }
}
```

**Frontend Usage:**
```javascript
const response = await brandsAPI.getBrand(brandId);
const brand = response.data;
```

---

### 3. Create Brand

**Create new brand (2-step process)**

#### Step 1: Create Brand (JSON)

```javascript
POST /api/v1/brands
```

**Request:**
```javascript
{
  brandName: "New Brand",
  domain: "newbrand.com",
  primaryColor: "#FF0000",
  secondaryColor: "#00FF00",
  accentColor: "#0000FF"  // Optional
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    brandId: "brand_456",
    brandName: "New Brand",
    domain: "newbrand.com",
    primaryColor: "#FF0000",
    secondaryColor: "#00FF00",
    accentColor: "#0000FF"
  }
}
```

#### Step 2: Upload Logo (Optional)

```javascript
POST /api/v1/brands/{brandId}/upload-logo
```

**Request (FormData):**
```javascript
{
  logo_file: File  // Image file
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    brandId: "brand_456",
    logoUrl: "https://storage.googleapis.com/..."
  }
}
```

#### Frontend Usage (Combined):

```javascript
import { brandsAPI } from '../services/apiService';

async function createBrand(brandData, logoFile) {
  // Automatically handles both steps
  const result = await brandsAPI.createBrand(brandData, logoFile);
  
  if (result.success) {
    console.log('Brand created:', result.data);
  }
}

// Example
const brandData = {
  brandName: "My New Brand",
  domain: "mynewbrand.com",
  primaryColor: "#1E40AF",
  secondaryColor: "#FFFFFF"
};

const logoFile = document.getElementById('logo-input').files[0];

await createBrand(brandData, logoFile);
```

---

### 4. Update Brand

**Update existing brand (2-step process)**

#### Step 1: Update Fields

```javascript
PATCH /api/v1/brands/{brandId}
```

**Request:**
```javascript
{
  brandName: "Updated Brand Name",
  primaryColor: "#00FF00"
  // Only include fields to update
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    brandId: "brand_123",
    brandName: "Updated Brand Name",
    primaryColor: "#00FF00",
    // ... rest of brand data
  }
}
```

#### Step 2: Update Logo (Optional)

```javascript
POST /api/v1/brands/{brandId}/upload-logo
```

**Frontend Usage:**
```javascript
await brandsAPI.updateBrand(brandId, {
  brandName: "New Name",
  primaryColor: "#FF0000"
}, newLogoFile);
```

---

### 5. Delete Brand

**Permanently delete brand and all associated data**

```javascript
DELETE /api/v1/brands/{brandId}
```

**Response:**
```javascript
{
  success: true,
  message: "Brand deleted successfully"
}
```

**Frontend Usage:**
```javascript
await brandsAPI.deleteBrand(brandId);
```

**⚠️ Warning:** Deleting a brand also deletes:
- All products
- All ads
- All research data
- All strategic analysis
- All videos

---

## Product Endpoints

### 6. Get Brand Products

**Get all products for a brand**

```javascript
GET /api/v1/brands/{brandId}/products
```

**Query Params:**
```javascript
{
  include_research_status: true  // Include research status for each product
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    products: [
      {
        productId: "prod_789",
        brandId: "brand_123",
        productName: "Product Name",
        description: "Product description",
        price: 99.99,
        imageUrl: "https://...",
        productUrl: "https://mybrand.com/product",
        category: "Electronics",
        
        // If include_research_status=true
        research_status: "completed",  // pending | processing | completed | failed | null
        research_id: "res_abc",
        research_completed_at: "2024-01-15T10:00:00Z",
        
        createdAt: "2024-01-10T08:00:00Z"
      }
    ],
    count: 5
  }
}
```

**Frontend Usage:**
```javascript
// Simple
const response = await brandsAPI.getBrandProducts(brandId);
const products = response.data.products;

// With research status (from researchAPI)
import { researchAPI } from '../services/researchService';
const response = await researchAPI.getProductsWithResearch(brandId);
const products = response.data.products;
```

---

### 7. Delete Product

**Delete a product and all associated data**

```javascript
DELETE /api/v1/brands/{brandId}/products/{productId}
```

**Response:**
```javascript
{
  success: true,
  message: "Product deleted successfully"
}
```

**Frontend Usage:**
```javascript
await brandsAPI.deleteProduct(brandId, productId);
```

**⚠️ Warning:** Deleting a product also deletes:
- All product ads
- Research data
- Strategic analysis
- Videos

---

## Complete Integration Example

### Dashboard with Brands & Products

```javascript
import { useBrand } from '../contexts/BrandContext';
import { useState } from 'react';

function Dashboard() {
  const {
    brands,
    selectedBrand,
    setSelectedBrand,
    brandProducts,
    loading,
    loadingProducts,
    createBrand,
    deleteProduct
  } = useBrand();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create brand
  async function handleCreateBrand(formData, logoFile) {
    const result = await createBrand(formData, logoFile);
    
    if (result.success) {
      alert('Brand created successfully!');
      setShowCreateModal(false);
      // Brand list automatically refreshed
      // New brand automatically selected
    } else {
      alert('Error: ' + result.error);
    }
  }
  
  // Delete product
  async function handleDeleteProduct(productId) {
    if (!confirm('Delete this product?')) return;
    
    const result = await deleteProduct(selectedBrand.brandId, productId);
    
    if (result.success) {
      alert('Product deleted');
      // Brand data automatically refreshed
    } else {
      alert('Error: ' + result.error);
    }
  }
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      {/* Brand Selector */}
      <select 
        value={selectedBrand?.brandId || ''} 
        onChange={(e) => {
          const brand = brands.find(b => b.brandId === e.target.value);
          setSelectedBrand(brand);
        }}
      >
        <option value="">Select a brand</option>
        {brands.map(brand => (
          <option key={brand.brandId} value={brand.brandId}>
            {brand.brandName}
          </option>
        ))}
      </select>
      
      <button onClick={() => setShowCreateModal(true)}>
        Create New Brand
      </button>
      
      {/* Products */}
      {selectedBrand && (
        <div>
          <h2>{selectedBrand.brandName} Products</h2>
          
          {loadingProducts ? (
            <LoadingSpinner />
          ) : (
            <div>
              {brandProducts?.map(product => (
                <div key={product.productId}>
                  <h3>{product.productName}</h3>
                  <p>{product.description}</p>
                  <button onClick={() => handleDeleteProduct(product.productId)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Create Brand Modal */}
      {showCreateModal && (
        <CreateBrandModal 
          onSubmit={handleCreateBrand}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
```

## Best Practices

1. ✅ Use BrandContext instead of calling API directly
2. ✅ Always check `selectedBrand` exists before using
3. ✅ Handle loading states (`loading`, `loadingProducts`, `loadingAds`)
4. ✅ Validate colors are valid hex codes before submitting
5. ✅ Validate logo file size/type before upload (< 5MB, jpg/png)
6. ✅ Use `refreshBrandData()` after creating products/ads
7. ✅ Confirm before deleting (destructive operation)
8. ✅ Handle errors gracefully with user-friendly messages
