# Bulk Ad Generation Endpoints

## Overview

Generate multiple ad variations in bulk using dynamic templates and AI-powered content.

**Service:** `adsAPI` from `src/services/apiService.js`

## Endpoints

### 1. Generate Bulk Ads (Job-Based)

**Generate multiple ad images with variations**

```javascript
POST /api/v1/ads/generate-bulk-dynamic-job
```

**Request (FormData):**
```javascript
{
  brand_id: "brand_123",
  product_id: "prod_456",
  brand_name: "My Brand",
  product_name: "My Product",
  product_description: "Product description",
  product_image_url: "https://...",
  
  // Templates
  templates: JSON.stringify([
    { template_id: "template_1", name: "Bold Offer" },
    { template_id: "template_2", name: "Testimonial" }
  ]),
  
  // Variation settings
  variations_per_template: 3,    // Generate 3 variations per template
  background_style: "gradient",  // gradient | solid | image
  color_scheme: "brand",         // brand | complementary | triadic
  
  // Optional customization
  custom_headline: "Custom Headline",  // Optional override
  custom_cta: "Shop Now",              // Optional override
  logo_file: File                      // Optional logo upload
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_ads_xyz789",
    status: "queued",
    created_at: "2024-01-15T10:00:00Z"
  }
}
```

**Job Result (After Polling):**
```javascript
{
  success: true,
  ads_generated: 6,  // 2 templates × 3 variations
  ads: [
    {
      ad_id: "ad_001",
      template_id: "template_1",
      variation_number: 1,
      image_url: "https://storage.googleapis.com/...",
      headline: "Save 30% on Premium Product",
      subheadline: "Limited Time Offer",
      cta: "Shop Now",
      background_color: "#FF5733",
      created_at: "2024-01-15T10:05:00Z"
    },
    // ... more ads
  ]
}
```

**Frontend Usage:**
```javascript
import { adsAPI } from '../services/apiService';
import { pollJobStatus } from '../services/apiService';

async function generateBulkAds(formData) {
  // Step 1: Trigger job
  const response = await adsAPI.generateBulkAds(formData);
  const jobId = response.data.job_id;
  
  // Step 2: Poll for completion
  const result = await pollJobStatus(
    jobId,
    (progress) => {
      console.log(`${progress.percentage}%: ${progress.message}`);
    },
    6000,   // Poll every 6 seconds
    300     // Max 30 minutes (300 * 6s)
  );
  
  console.log(`Generated ${result.ads_generated} ads`);
  return result.ads;
}
```

---

### 2. Get Brand Ads

**Get all ads for a brand**

```javascript
GET /api/v1/brands/{brandId}/ads
```

**Query Params:**
```javascript
{
  limit: 100  // Optional, default: 100
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    ads: [
      {
        ad_id: "ad_123",
        brand_id: "brand_123",
        product_id: "prod_456",
        template_id: "template_1",
        image_url: "https://...",
        headline: "Amazing Product",
        subheadline: "Buy now and save",
        cta: "Shop Now",
        created_at: "2024-01-15T10:00:00Z"
      }
    ],
    count: 15
  }
}
```

**Frontend Usage:**
```javascript
const response = await adsAPI.getBrandAds(brandId);
const ads = response.data.ads;
```

---

### 3. Get Product Ads

**Get all ads for specific product**

```javascript
GET /api/v1/brands/{brandId}/products/{productId}/ads
```

**Query Params:**
```javascript
{
  limit: 100
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    ads: [...],
    count: 8,
    product: {
      productId: "prod_456",
      productName: "My Product"
    },
    brand: {
      brandId: "brand_123",
      brandName: "My Brand"
    }
  }
}
```

**Frontend Usage:**
```javascript
const response = await adsAPI.getProductAds(brandId, productId, 100);
const ads = response.data.ads;
```

---

### 4. Get All Ads (User)

**Get all ads across all brands for current user**

```javascript
GET /api/v1/ads
```

**Response:**
```javascript
{
  success: true,
  data: {
    ads: [...],
    count: 42
  }
}
```

**Frontend Usage:**
```javascript
const response = await adsAPI.getAllAds();
const allAds = response.data.ads;
```

---

### 5. Get Ads Grouped by Product

**Get brand ads organized by product**

```javascript
GET /api/v1/brands/{brandId}/ads/grouped-by-product
```

**Response:**
```javascript
{
  success: true,
  data: {
    products: [
      {
        productId: "prod_456",
        productName: "Product 1",
        productImage: "https://...",
        ads: [
          { ad_id: "ad_001", headline: "...", image_url: "..." },
          { ad_id: "ad_002", headline: "...", image_url: "..." }
        ],
        ad_count: 2
      },
      {
        productId: "prod_789",
        productName: "Product 2",
        ads: [...],
        ad_count: 5
      }
    ],
    totalAds: 7,
    brand: {
      brandId: "brand_123",
      brandName: "My Brand"
    }
  }
}
```

**Frontend Usage:**
```javascript
const response = await adsAPI.getBrandAdsGroupedByProduct(brandId);

response.data.products.forEach(product => {
  console.log(`${product.productName}: ${product.ad_count} ads`);
});
```

---

### 6. Delete Ad

**Delete specific ad**

```javascript
DELETE /api/v1/brands/{brandId}/ads/{adId}
```

**Response:**
```javascript
{
  success: true,
  message: "Ad deleted successfully"
}
```

**Frontend Usage:**
```javascript
await adsAPI.deleteAd(brandId, adId);
```

---

### 7. Remix Ad (Create Variations)

**Create new variations of existing ad conversation**

```javascript
POST /api/v1/ads/conversations/{conversationId}/remix
```

**Request (FormData):**
```javascript
{
  brand_id: "brand_123",
  product_id: "prod_456",
  brand_name: "My Brand",
  product_name: "My Product",
  remix_mode: "similar",      // similar | different | experimental
  variations_count: 5         // Number of variations to create
}
```

**Response (Job-Based):**
```javascript
{
  success: true,
  data: {
    job_id: "job_remix_abc",
    status: "queued"
  }
}
```

**Job Result:**
```javascript
{
  success: true,
  variations: [
    {
      ad_id: "ad_remix_001",
      image_url: "https://...",
      headline: "New Variation 1",
      // ... ad data
    }
    // ... more variations
  ],
  count: 5
}
```

**Frontend Usage:**
```javascript
async function remixAd(conversationId, brandId, productId) {
  // Trigger remix job
  const response = await adsAPI.remixAd(
    conversationId,
    brandId,
    productId,
    brandName,
    productName,
    'similar',  // remix mode
    5           // variations count
  );
  
  const jobId = response.data.job_id;
  
  // Poll for completion
  const result = await pollJobStatus(jobId);
  
  console.log(`Created ${result.count} remixed ads`);
  return result.variations;
}
```

---

## Template-Based Image Ads

### 8. Get Template Ads by Brand

**Get all template-based ad images for a brand**

```javascript
GET /api/v1/ads/image/template/brand/{brandId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    ads: [
      {
        ad_id: "template_ad_001",
        template_name: "Bold CTA",
        image_url: "https://...",
        created_at: "2024-01-15T10:00:00Z"
      }
    ],
    count: 10
  }
}
```

**Frontend Usage:**
```javascript
const response = await adsAPI.getTemplateAdsByBrand(brandId);
const templateAds = response.data.ads;
```

---

### 9. Generate Template Images (Job-Based)

**Generate ad images from templates**

```javascript
POST /api/v1/ads/image/template-job
```

**Request (FormData):**
```javascript
{
  brand_id: "brand_123",
  product_id: "prod_456",
  templates: ["template_1", "template_2"],
  // ... template-specific params
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    job_id: "job_template_abc"
  }
}
```

**Frontend Usage:**
```javascript
async function generateTemplateImages(formData) {
  const result = await adsAPI.generateTemplateImages(
    formData,
    (progress) => {
      console.log(`${progress.percentage}%`);
    }
  );
  
  return result;
}
```

---

## Complete Bulk Ad Generation Example

```javascript
import { useState } from 'react';
import { adsAPI } from '../services/apiService';
import { pollJobStatus } from '../services/apiService';
import { useBrand } from '../contexts/BrandContext';
import { useTasksContext } from '../contexts/TasksContext';

function BulkAdGenerator() {
  const { selectedBrand } = useBrand();
  const { addTask, updateTask } = useTasksContext();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [variationsCount, setVariationsCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  
  async function handleGenerate() {
    if (!selectedProduct || selectedTemplates.length === 0) return;
    
    setGenerating(true);
    
    try {
      // Build FormData
      const formData = new FormData();
      formData.append('brand_id', selectedBrand.brandId);
      formData.append('product_id', selectedProduct.productId);
      formData.append('brand_name', selectedBrand.brandName);
      formData.append('product_name', selectedProduct.productName);
      formData.append('product_description', selectedProduct.description);
      formData.append('product_image_url', selectedProduct.imageUrl);
      formData.append('templates', JSON.stringify(selectedTemplates));
      formData.append('variations_per_template', variationsCount);
      
      // Trigger job
      const response = await adsAPI.generateBulkAds(formData);
      const jobId = response.data.job_id;
      
      // Track in UI
      const taskId = addTask({
        taskType: 'ad_generation',
        title: `Generating ${selectedTemplates.length * variationsCount} ads...`,
        status: 'processing',
        metadata: { jobId }
      });
      
      // Poll with progress
      const result = await pollJobStatus(
        jobId,
        (progress) => {
          updateTask(taskId, {
            progress: progress.percentage,
            description: progress.message
          });
        },
        6000,
        300
      );
      
      // Success
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        description: `${result.ads_generated} ads generated`
      });
      
      alert(`Successfully generated ${result.ads_generated} ads!`);
      
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }
  
  return (
    <div>
      <h2>Bulk Ad Generator</h2>
      {/* UI for template selection, product selection, etc. */}
      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Ads'}
      </button>
    </div>
  );
}
```

## Job Status Polling

### Check Job Status

```javascript
GET /api/v1/jobs/{jobId}
```

**Response:**
```javascript
{
  job_id: "job_ads_xyz",
  status: "processing",
  type: "ad_generation",
  progress_data: {
    percentage: 60,
    current_step: "Generating variation 3 of 5",
    completed_ads: 3,
    total_ads: 5
  }
}
```

**Frontend Usage:**
```javascript
const status = await adsAPI.getAdJobStatus(jobId);
console.log(`Status: ${status.data.status}`);
```

## Best Practices

1. ✅ Use FormData for file uploads (logo, product images)
2. ✅ Validate all required fields before submitting
3. ✅ Show progress during generation (can take 5-15 minutes)
4. ✅ Limit variations_per_template to reasonable number (1-5)
5. ✅ Handle job failures gracefully
6. ✅ Refresh brand/product ads after completion
7. ✅ Use optimistic UI updates for better UX
