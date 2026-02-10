# 📋 Comprehensive Integration Report: Asset Management & API Architecture

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Brand Context Management](#brand-context-management)
3. [API Service Architecture](#api-service-architecture)
4. [Asset Storage Structure](#asset-storage-structure)
5. [Product Data Management](#product-data-management)
6. [Ad Generation & Storage](#ad-generation--storage)
7. [Video Asset Management](#video-asset-management)
8. [Image Conversation Storage](#image-conversation-storage)
9. [Integration Flow](#integration-flow)
10. [Frontend Agent Implementation Guide](#frontend-agent-implementation-guide)

---

## Executive Summary

This document provides a comprehensive technical report on how the **Adforge SaaS Platform** integrates its components, with detailed information about:

- **Brand Context**: How brands are stored, managed, and accessed across the platform
- **API Services**: Complete API architecture for all operations
- **Asset Storage**: File storage structure for products, ads, videos, and images in Firebase Storage
- **Data Flow**: How data flows from scraping to generation to storage

**Key Technologies:**
- **Backend**: FastAPI (Python) - App Runner
- **Authentication**: Firebase Auth
- **Database**: Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Image Generation**: Gemini 2.5 Flash, GPT-4o
- **Video Generation**: KIE Story, OpenAI Sora
- **Job Queue**: AWS SQS + ECS Fargate Workers

---

## Brand Context Management

### 🎨 Brand Structure

Brands are the top-level organizational unit in the platform. Each brand contains:

**Firestore Path:**
```
users/{userId}/stores/{brandId}
```

**Brand Document Structure:**
```json
{
  "brandId": "nike_abc123",
  "brandName": "Nike",
  "domain": "nike.com",
  "ownerId": "firebase_user_id",
  "logo": "users/USER_ID/stores/nike_abc123/logo.png",
  "logoUrl": "https://storage.googleapis.com/.../logo.png",
  
  "primaryColor": "#FF0000",
  "secondaryColor": "#000000", 
  "accentColor": "#FFFFFF",
  
  "productCount": 15,
  "adsCount": 127,
  "createdAt": "2025-11-26T10:00:00.000Z",
  "updatedAt": "2025-11-26T12:00:00.000Z"
}
```

### Brand Context API

#### Create Brand
```bash
POST /api/v1/brands
Authorization: Bearer {idToken}
Content-Type: application/json

{
  "brandName": "Nike",
  "domain": "nike.com",
  "primaryColor": "#FF0000",
  "secondaryColor": "#000000",
  "accentColor": "#FFFFFF"
}
```

#### Upload Brand Logo
```bash
POST /api/v1/brands/{brandId}/upload-logo
Authorization: Bearer {idToken}
Content-Type: multipart/form-data

logo_file: <file>
```

#### Get All Brands
```bash
GET /api/v1/brands
Authorization: Bearer {idToken}

Response:
{
  "success": true,
  "data": {
    "brands": [...],
    "count": 5
  }
}
```

### Brand Context Usage

**Frontend Context Provider:**
```javascript
// src/contexts/BrandContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { brandsAPI } from '../services/apiService';

export const BrandContext = createContext();

export const useBrand = () => useContext(BrandContext);

export const BrandProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandProducts, setBrandProducts] = useState(null);
  const [brandAds, setBrandAds] = useState(null);
  
  // Load brands on mount
  useEffect(() => {
    refreshBrands();
  }, []);
  
  // Auto-load brand data when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      loadBrandData(selectedBrand.brandId);
    }
  }, [selectedBrand]);
  
  const loadBrandData = async (brandId) => {
    const [productsRes, adsRes] = await Promise.all([
      brandsAPI.getBrandProducts(brandId),
      adsAPI.getBrandAds(brandId)
    ]);
    setBrandProducts(productsRes.data.products);
    setBrandAds(adsRes.data.ads);
  };
  
  return (
    <BrandContext.Provider value={{
      brands,
      selectedBrand,
      brandProducts,
      brandAds,
      setSelectedBrand
    }}>
      {children}
    </BrandContext.Provider>
  );
};
```

**Color Extraction Process:**
1. Logo uploaded → Gemini Vision extracts color palette
2. Website scraped → Playwright extracts section colors (navbar, body, footer)
3. Product images → ColorThief extracts 2 dominant colors
4. Priority: Product colors → Logo colors → Website colors

---

## API Service Architecture

### 🏗️ Complete API Endpoints

#### Authentication (`/api/v1/auth`)
```javascript
// src/services/apiService.js
export const authAPI = {
  signup: (email, password, displayName) => POST('/auth/signup'),
  verifyToken: (idToken) => POST('/auth/verify-token'),
  getCurrentUser: () => GET('/auth/me'),
  updateProfile: (data) => PATCH('/auth/me'),
  deleteAccount: () => DELETE('/auth/me'),
  logout: () => POST('/auth/logout')
};
```

#### Scraping (`/api/v1/scraping`)
```javascript
export const scrapingAPI = {
  // Job-based scraping
  scrapeProduct: (url, brandId) => POST('/scraping/scrape-product-job', {
    url,
    brand_id: brandId
  }),
  
  // Poll for scraping job status
  getScrapingJobStatus: (jobId) => GET(`/jobs/${jobId}`)
};
```

**Scraping Flow:**
1. Submit URL → Returns `job_id` immediately
2. Backend worker processes:
   - Extracts product data (Gemini AI)
   - Downloads product images → Firebase Storage
   - Extracts brand logo → Firebase Storage
   - Extracts colors (ColorThief + Gemini Vision)
   - Creates/updates brand in Firestore
   - Creates product in Firestore
3. Frontend polls job status → Shows product when complete

#### Ad Generation (`/api/v1/ads`)
```javascript
export const adsAPI = {
  // Job-based bulk ad generation
  generateBulkAds: (formData) => 
    POST('/ads/generate-bulk-dynamic-job', formData),
  
  // Poll for ad generation job status
  getAdJobStatus: (jobId) => GET(`/jobs/${jobId}`),
  
  // Get ads
  getBrandAds: (brandId) => GET(`/brands/${brandId}/ads`),
  getProductAds: (brandId, productId) => 
    GET(`/brands/${brandId}/products/${productId}/ads`),
  
  // Delete ad
  deleteAd: (brandId, adId) => DELETE(`/brands/${brandId}/ads/${adId}`),
  
  // Remix ad (create variations)
  remixAd: (conversationId, brandId, productId, settings) =>
    POST(`/ads/conversations/${conversationId}/remix`, settings)
};
```

#### Image Chat (`/api/v1/chat`)
```javascript
export const chatAPI = {
  // Create conversation with initial image
  createConversation: (brandId, productId, imageFile) => {
    const formData = new FormData();
    formData.append('brand_id', brandId);
    formData.append('product_id', productId);
    formData.append('initial_image', imageFile);
    return POST('/chat/conversations', formData);
  },
  
  // Send modification request
  sendMessage: (conversationId, text, backend = 'openai') =>
    POST(`/chat/conversations/${conversationId}/messages`, {
      text,
      backend // 'openai' or 'kie'
    }),
  
  // Get conversation history
  getConversation: (brandId, productId, conversationId) =>
    GET(`/chat/brands/${brandId}/products/${productId}/conversations/${conversationId}`)
};
```

#### Video Generation (`/api/v1/video-chat`)
```javascript
export const videoChatAPI = {
  // Create video conversation
  createVideoConversation: (brandId, productId, referenceImageUrl, options) =>
    POST(`/video-chat/brands/${brandId}/products/${productId}/video-conversations`, {
      reference_image_url: referenceImageUrl,
      duration: options.duration,
      provider: options.provider, // 'kie_story', 'openai'
      platform: options.platform, // 'tiktok', 'instagram'
      aspect_ratio: options.aspectRatio, // '9:16', '1:1'
      language: options.language // 'en', 'ar', 'fr'
    }),
  
  // Generate video from prompt
  triggerVideoGeneration: (brandId, productId, conversationId, soraPrompt) =>
    POST(`/video-chat/brands/${brandId}/products/${productId}/video-conversations/${conversationId}/generate-video`, {
      sora_prompt: soraPrompt,
      reference_image_url: imageUrl,
      provider: 'kie_story'
    }),
  
  // Get video job status
  getVideoJobStatus: (jobId) => GET(`/video-chat/video-jobs/${jobId}`)
};
```

#### Brand & Product Management
```javascript
export const brandsAPI = {
  createBrand: (brandData, logoFile) => POST('/brands', brandData),
  getBrands: () => GET('/brands'),
  getBrand: (brandId) => GET(`/brands/${brandId}`),
  updateBrand: (brandId, updates) => PATCH(`/brands/${brandId}`, updates),
  deleteBrand: (brandId) => DELETE(`/brands/${brandId}`),
  
  getBrandProducts: (brandId) => GET(`/brands/${brandId}/products`),
  deleteProduct: (brandId, productId) => 
    DELETE(`/brands/${brandId}/products/${productId}`)
};
```

---

## Asset Storage Structure

### 📁 Firebase Storage Hierarchy

All assets are stored in **Firebase Storage** with the following structure:

```
firebase-storage-bucket/
├── users/
│   └── {userId}/
│       ├── stores/
│       │   └── {brandId}/
│       │       ├── logo.png                    # Brand logo
│       │       ├── products/
│       │       │   └── {productId}/
│       │       │       ├── images/
│       │       │       │   ├── product_1.jpg   # Original product images
│       │       │       │   ├── product_2.jpg
│       │       │       │   └── product_3.jpg
│       │       │       ├── conversations/      # Ad images & edits
│       │       │       │   └── {conversationId}/
│       │       │       │       ├── ad_lifestyle_1_20251126_120500.png
│       │       │       │       ├── ad_hero_2_20251126_120530.png
│       │       │       │       ├── edit_msg_001_20251126_130000.png
│       │       │       │       └── edit_msg_002_20251126_130045.png
│       │       │       └── video_conversations/  # Video assets
│       │       │           └── {videoConvId}/
│       │       │               ├── reference_image.png
│       │       │               ├── video_draft_1.mp4
│       │       │               └── video_final.mp4
│       │       └── scraped_data/
│       │           └── {scrapingJobId}/
│       │               ├── logo_original.svg
│       │               ├── logo_converted.png
│       │               └── screenshot.png
│       └── temp/                               # Temporary uploads
│           └── {jobId}/
│               ├── uploaded_logo.png
│               └── uploaded_product_*.jpg
```

### Storage Path Patterns

| Asset Type | Storage Path | Access URL |
|------------|-------------|------------|
| **Brand Logo** | `users/{userId}/stores/{brandId}/logo.png` | `https://storage.googleapis.com/.../o/users%2F{userId}%2Fstores%2F{brandId}%2Flogo.png?alt=media` |
| **Product Images** | `users/{userId}/stores/{brandId}/products/{productId}/images/product_{n}.jpg` | Public URL with token |
| **Generated Ads** | `users/{userId}/stores/{brandId}/products/{productId}/conversations/{convId}/ad_{template}_{n}_{timestamp}.png` | Public URL |
| **Edited Images** | `users/{userId}/stores/{brandId}/products/{productId}/conversations/{convId}/edit_msg_{n}_{timestamp}.png` | Public URL |
| **Videos** | `users/{userId}/stores/{brandId}/products/{productId}/video_conversations/{convId}/video_draft_{n}.mp4` | Public URL |

### Frontend Storage Helpers

```javascript
// src/utils/storageHelpers.js
const FIREBASE_BUCKET = 'adforge-476017.appspot.com';

/**
 * Convert Firebase Storage path to public URL
 */
export const getFirebaseImageUrl = (storagePath) => {
  if (!storagePath) return '';
  
  // If already a full URL, return it
  if (storagePath.startsWith('http')) {
    return storagePath;
  }
  
  // Convert path to public URL
  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodedPath}?alt=media`;
};

/**
 * Download image from Firebase Storage
 */
export const downloadFirebaseImage = async (storagePath, filename) => {
  const url = getFirebaseImageUrl(storagePath);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

---

## Product Data Management

### 🛍️ Product Storage

**Firestore Path:**
```
users/{userId}/stores/{brandId}/products/{productId}
```

**Product Document Structure:**
```json
{
  "productId": "uuid-abc-123",
  "productName": "Air Max 90",
  "productFullName": "Nike Air Max 90 Classic Sneaker",
  "description": "Classic sneaker featuring visible Air cushioning...",
  
  "images": [
    "users/USER_ID/stores/BRAND_ID/products/PRODUCT_ID/images/product_1.jpg",
    "users/USER_ID/stores/BRAND_ID/products/PRODUCT_ID/images/product_2.jpg"
  ],
  "imageUrls": [
    "https://storage.googleapis.com/.../product_1.jpg",
    "https://storage.googleapis.com/.../product_2.jpg"
  ],
  
  "dominantColors": ["#FF0000", "#000000"],
  
  "brandId": "nike_abc123",
  "brandName": "Nike",
  "source": "scraped",
  "sourceUrl": "https://nike.com/air-max-90",
  "conversationCount": 15,
  "category": "Footwear",
  "createdAt": "2025-11-26T10:00:00.000Z",
  "updatedAt": "2025-11-26T12:00:00.000Z"
}
```

---

## Ad Generation & Storage

### 🎨 Ad Generation Process

**Job-Based Architecture** (Avoids timeouts for bulk generation)

### Ad Storage Structure

**Firestore Path:**
```
users/{userId}/stores/{brandId}/products/{productId}/conversations/{conversationId}
```

**Conversation Document:**
```json
{
  "conversationId": "conv_abc123",
  "type": "ad_generation",
  "brandId": "nike_abc123",
  "productId": "uuid-product-123",
  "userId": "firebase_user_id",
  
  "template": "lifestyle",
  "variation": 1,
  "aspectRatio": "1:1",
  "promptUsed": "Urban lifestyle ad featuring Nike Air Max 90...",
  
  "imageUrls": [
    "https://storage.googleapis.com/.../ad_lifestyle_1_20251126_120500.png"
  ],
  "storagePaths": [
    "users/USER_ID/stores/BRAND_ID/products/PRODUCT_ID/conversations/CONV_ID/ad_lifestyle_1_20251126_120500.png"
  ],
  
  "createdAt": "2025-11-26T12:05:00.000Z",
  "updatedAt": "2025-11-26T12:05:00.000Z",
  "messageCount": 0,
  "jobId": "job_abc123"
}
```

### Ad Generation API Usage

```javascript
// 1. Prepare FormData
const formData = new FormData();
formData.append('brand_name', 'Nike');
formData.append('product_full_name', 'Air Max 90');
formData.append('product_description', 'Classic sneaker with visible Air...');
formData.append('primary_color_hex', '#FF0000');
formData.append('secondary_color_hex', '#000000');
formData.append('count', '10');
formData.append('aspect_ratio', '1:1');
formData.append('logo', logoFile);
formData.append('product_images', productImage1);
formData.append('product_images', productImage2);

// 2. Submit job
const response = await adsAPI.generateBulkAds(formData);
const jobId = response.data.job_id;

// 3. Poll for progress
const pollInterval = setInterval(async () => {
  const status = await adsAPI.getAdJobStatus(jobId);
  
  console.log(`Progress: ${status.data.progress.percentage}%`);
  console.log(`Status: ${status.data.progress.current_step}`);
  
  if (status.data.status === 'completed') {
    clearInterval(pollInterval);
    
    const ads = status.data.result.ads;
    ads.forEach(ad => {
      console.log(`✅ ${ad.template} - ${ad.firebase_url}`);
    });
  }
}, 3000);
```

### Templates Available

1. **lifestyle** - Urban/aspirational lifestyle scenes
2. **product_hero** - Clean minimal product focus
3. **transformation** - Before/after dramatic change
4. **eco_friendly** - Sustainable/natural products
5. **multi_feature** - Feature showcase
6. **limited_offer** - Urgency/FOMO
7. **ugc_authentic** - User-generated content style
8. **comparison_chart** - Side-by-side comparison
9. **unboxing_reveal** - Unboxing experience
10. **problem_solution** - Problem → Solution narrative

---

## Video Asset Management

### 🎥 Video Generation & Storage

**Firestore Path:**
```
users/{userId}/stores/{brandId}/products/{productId}/video_conversations/{videoConvId}
```

**Video Conversation Document:**
```json
{
  "videoConversationId": "video_conv_abc123",
  "brandId": "nike_abc123",
  "productId": "uuid-product-123",
  "userId": "firebase_user_id",
  
  "referenceImageUrl": "https://storage.googleapis.com/.../reference_image.png",
  "referenceImagePath": "users/.../video_conversations/.../reference_image.png",
  
  "provider": "kie_story",
  "platform": "tiktok",
  "aspectRatio": "9:16",
  "duration": 15,
  "language": "en",
  
  "videos": [
    {
      "videoUrl": "https://storage.googleapis.com/.../video_draft_1.mp4",
      "storagePath": "users/.../video_conversations/.../video_draft_1.mp4",
      "prompt": "Dynamic product showcase with upbeat music...",
      "status": "completed",
      "duration": 15,
      "generatedAt": "2025-11-26T14:00:00.000Z"
    }
  ],
  
  "messages": [
    {
      "role": "user",
      "content": "Create a dynamic TikTok video",
      "timestamp": "2025-11-26T13:55:00.000Z"
    }
  ],
  
  "createdAt": "2025-11-26T13:50:00.000Z",
  "updatedAt": "2025-11-26T14:00:00.000Z"
}
```

---

## Image Conversation Storage

### 💬 Chat-Based Image Editing

**Storage Pattern:**
```
users/{userId}/stores/{brandId}/products/{productId}/conversations/{convId}/
  ├── ad_lifestyle_1_20251126_120500.png      # Original
  ├── edit_msg_001_20251126_130000.png        # 1st edit
  ├── edit_msg_002_20251126_130045.png        # 2nd edit
  └── edit_msg_003_20251126_130130.png        # 3rd edit
```

---

## Integration Flow

### Authentication Flow

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config/firebase';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

const idToken = await user.getIdToken();

// All API requests automatically include token
api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Frontend Agent Implementation Guide

### 🤖 Integration Prompts for Frontend Agent

#### Prompt 1: Setting Up Brand Context

```markdown
I need to implement brand context management. Here's what you need:

**Brand API Endpoints:**
- GET /api/v1/brands - List all brands
- POST /api/v1/brands - Create brand
- PATCH /api/v1/brands/{brandId} - Update brand

**Brand Structure:**
{
  brandId, brandName, domain, logo, logoUrl,
  primaryColor, secondaryColor, accentColor,
  productCount, adsCount
}

**Requirements:**
1. BrandContext provider that:
   - Loads brands on mount
   - Stores selected brand in sessionStorage
   - Auto-loads products and ads when brand selected
2. Use existing apiService.js
3. Follow pattern in BrandContext.jsx
```

---

## Quick Reference Tables

### API Endpoint Summary

| Feature | Method | Endpoint | Returns |
|---------|--------|----------|---------|
| Login | POST | `/auth/verify-token` | User data |
| Scrape product | POST | `/scraping/scrape-product-job` | `job_id` |
| List brands | GET | `/brands` | `{ brands: [] }` |
| Generate ads | POST | `/ads/generate-bulk-dynamic-job` | `job_id` |
| Create chat | POST | `/chat/conversations` | Conversation |
| Generate video | POST | `/video-chat/.../generate-video` | `job_id` |

### Storage Path Quick Reference

| Asset | Path |
|-------|------|
| Brand Logo | `users/{userId}/stores/{brandId}/logo.png` |
| Product Image | `users/{userId}/stores/{brandId}/products/{productId}/images/product_{n}.jpg` |
| Generated Ad | `users/{userId}/stores/{brandId}/products/{productId}/conversations/{convId}/ad_{template}_{n}_{timestamp}.png` |
| Video | `users/{userId}/stores/{brandId}/products/{productId}/video_conversations/{convId}/video_draft_{n}.mp4` |
