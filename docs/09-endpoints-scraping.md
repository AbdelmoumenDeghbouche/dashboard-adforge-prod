# Scraping Endpoints

## Overview

Scraping endpoints extract product data from URLs (Shopify, WooCommerce, etc.) and automatically trigger research pipeline.

**Service:** `scrapingAPI` from `src/services/apiService.js`

**All endpoints are JOB-BASED** - return immediately with `job_id`

## Endpoints

### 1. Scrape Product

**Scrape single product from URL**

```javascript
POST /api/v1/scraping/scrape-product-job
```

**Request:**
```javascript
{
  url: "https://mybrand.com/products/my-product",
  brand_id: "brand_123"  // Optional - creates brand if null
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_scrape_abc123",
    status: "queued",
    created_at: "2024-01-15T10:00:00Z",
    estimated_completion: "2024-01-15T10:05:00Z",
    status_url: "/api/v1/jobs/job_scrape_abc123"
  }
}
```

**Job Result (After Polling):**
```javascript
{
  product_id: "prod_789",
  brand_id: "brand_123",
  product_name: "Extracted Product Name",
  description: "Extracted description...",
  price: 99.99,
  image_url: "https://...",
  product_url: "https://...",
  
  // Research auto-triggered
  research_id: "res_456",
  research_status: "processing"
}
```

**Frontend Usage:**
```javascript
import { scrapingAPI } from '../services/apiService';
import { pollJobStatus } from '../services/apiService';

async function scrapeProduct(url, brandId) {
  // Step 1: Trigger scraping job
  const response = await scrapingAPI.scrapeProduct(url, brandId);
  const jobId = response.data.job_id;
  
  console.log('Scraping job created:', jobId);
  
  // Step 2: Poll for completion
  const result = await pollJobStatus(
    jobId,
    null,     // onProgress callback
    5000,     // Poll every 5 seconds
    120       // Max 10 minutes (120 * 5s)
  );
  
  console.log('Product scraped:', result);
  return result;
}
```

---

### 2. Scrape Store

**Scrape entire store (all products)**

```javascript
POST /api/v1/scraping/scrape-store-job
```

**Request:**
```javascript
{
  url: "https://mybrand.com",
  brand_id: "brand_123"  // Optional - creates brand if null
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_store_xyz789",
    status: "queued",
    created_at: "2024-01-15T10:00:00Z",
    estimated_completion: "2024-01-15T10:30:00Z",  // Longer for stores
    status_url: "/api/v1/jobs/job_store_xyz789"
  }
}
```

**Job Result:**
```javascript
{
  brand_id: "brand_123",
  products_scraped: 15,
  products: [
    {
      product_id: "prod_001",
      product_name: "Product 1",
      // ... product data
    }
    // ... more products
  ],
  
  // Research auto-triggered for all products
  research_jobs: [
    { product_id: "prod_001", research_id: "res_001" },
    { product_id: "prod_002", research_id: "res_002" },
    // ...
  ]
}
```

**Frontend Usage:**
```javascript
async function scrapeStore(url, brandId) {
  // Trigger store scraping
  const response = await scrapingAPI.scrapeStore(url, brandId);
  const jobId = response.data.job_id;
  
  // Poll with longer timeout (stores can have many products)
  const result = await pollJobStatus(
    jobId,
    (progress) => {
      console.log(`Progress: ${progress.percentage}%`);
      console.log(`Step: ${progress.message}`);
    },
    10000,    // Poll every 10 seconds
    180       // Max 30 minutes (180 * 10s)
  );
  
  console.log(`Scraped ${result.products_scraped} products`);
  return result;
}
```

---

### 3. Health Check

**Check scraping service health**

```javascript
GET /api/v1/scraping/health
```

**Response:**
```javascript
{
  success: true,
  status: "healthy",
  version: "1.0.0"
}
```

**Frontend Usage:**
```javascript
const health = await scrapingAPI.healthCheck();
```

---

## Complete Scraping Flow

### With Progress Tracking

```javascript
import { useState } from 'react';
import { scrapingAPI } from '../services/apiService';
import { pollJobStatus } from '../services/apiService';
import { useTasksContext } from '../contexts/TasksContext';
import { useBrand } from '../contexts/BrandContext';

function ProductScraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  
  const { selectedBrand, refreshBrandData } = useBrand();
  const { addTask, updateTask } = useTasksContext();
  
  async function handleScrape() {
    if (!url || !selectedBrand) return;
    
    setLoading(true);
    
    try {
      // Step 1: Trigger scraping job
      const response = await scrapingAPI.scrapeProduct(
        url, 
        selectedBrand.brandId
      );
      
      const jobId = response.data.job_id;
      
      // Step 2: Add to tasks UI
      const taskId = addTask({
        taskType: 'scraping',
        title: 'Scraping product...',
        status: 'processing',
        metadata: { jobId }
      });
      
      // Step 3: Poll with progress tracking
      const result = await pollJobStatus(
        jobId,
        (progressData) => {
          // Update UI progress
          setProgress(progressData.percentage);
          setProgressMessage(progressData.message);
          
          // Update task in tasks list
          updateTask(taskId, {
            progress: progressData.percentage,
            description: progressData.message
          });
        },
        5000,   // Poll every 5 seconds
        120     // Max 10 minutes
      );
      
      // Step 4: Success
      console.log('Product scraped:', result.product_name);
      
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        description: 'Product scraped successfully'
      });
      
      // Step 5: Refresh brand data to show new product
      await refreshBrandData();
      
      alert(`Product "${result.product_name}" added successfully!`);
      
    } catch (error) {
      console.error('Scraping failed:', error);
      alert('Scraping failed: ' + error.message);
      
      updateTask(taskId, {
        status: 'failed',
        description: error.message
      });
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  }
  
  return (
    <div>
      <input 
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://store.com/products/..."
      />
      
      <button 
        onClick={handleScrape}
        disabled={loading || !url || !selectedBrand}
      >
        {loading ? 'Scraping...' : 'Scrape Product'}
      </button>
      
      {loading && (
        <div>
          <p>{progressMessage}</p>
          <progress value={progress} max={100} />
        </div>
      )}
    </div>
  );
}
```

## Auto-Triggered Research

### Important Behavior

When scraping completes, backend **automatically triggers research pipeline**:

1. Product scraped
2. Research job auto-created
3. Research extracts: pain points, benefits, proof, positioning, etc.
4. Product ready for strategic analysis

**No frontend action needed** - research happens in background.

### Checking Research Status

```javascript
import { researchAPI } from '../services/researchService';

// Get products with research status
const response = await researchAPI.getProductsWithResearch(brandId);

response.data.products.forEach(product => {
  console.log(`${product.productName}: ${product.research_status}`);
  
  if (product.research_status === 'completed') {
    // Product ready for strategic analysis
    console.log('Research ID:', product.research_id);
  }
});
```

## Supported Platforms

- ✅ Shopify
- ✅ WooCommerce
- ✅ Custom e-commerce sites
- ✅ Direct product pages

## Validation Rules

### Product URL
- Must be valid HTTP/HTTPS URL
- Must be accessible (not require login)
- Should point to product page (not homepage)

### Store URL
- Must be valid HTTP/HTTPS URL
- Should be store homepage or products page
- Must be accessible publicly

## Error Handling

### Common Errors

```javascript
try {
  await scrapingAPI.scrapeProduct(url, brandId);
} catch (error) {
  // Handle specific errors
  if (error.response?.status === 400) {
    // Invalid URL
    alert('Invalid product URL');
  } else if (error.response?.status === 404) {
    // Product not found
    alert('Product not found at this URL');
  } else if (error.response?.status === 422) {
    // Validation error
    alert('Validation error: ' + error.message);
  } else {
    // Generic error
    alert('Scraping failed: ' + error.message);
  }
}
```

### Job Failures

If job fails during polling:

```javascript
// Job status returned as 'failed'
{
  status: "failed",
  error_data: {
    message: "Could not extract product data",
    details: {
      reason: "Product page blocked by CAPTCHA"
    }
  }
}
```

## Best Practices

1. ✅ Validate URL format before submitting
2. ✅ Show progress during scraping (can take 1-5 minutes)
3. ✅ Add to tasks UI for background tracking
4. ✅ Refresh brand data after successful scraping
5. ✅ Handle "brand not selected" case
6. ✅ Provide clear error messages
7. ✅ Don't spam scraping requests (rate-limited)
8. ✅ Use longer timeouts for store scraping (many products)
