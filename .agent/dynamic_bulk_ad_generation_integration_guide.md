# 🚀 Dynamic Bulk Ad Generation - Complete Frontend-Backend Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend API Documentation](#backend-api-documentation)
4. [Frontend Implementation Strategy](#frontend-implementation-strategy)
5. [Complete Integration Workflow](#complete-integration-workflow)
6. [State Management](#state-management)
7. [UI/UX Considerations](#uiux-considerations)
8. [Error Handling & Recovery](#error-handling--recovery)
9. [Production-Ready Code Examples](#production-ready-code-examples)
10. [Testing Strategy](#testing-strategy)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

The **Dynamic Bulk Ad Generation** system uses an **async job-based architecture** to generate multiple ad images without timeout issues. This guide provides complete documentation for both backend API and frontend implementation.

### Key Features

- ✅ Generates 1-20 ads without timeouts (can take 5-30 minutes)
- ✅ Real-time progress tracking (0-100%)
- ✅ User can navigate away and come back
- ✅ Automatic retry on failures
- ✅ Firebase Storage URLs (not base64 - ultra-fast response)
- ✅ Job persistence across page refreshes
- ✅ Scalable architecture (SQS + ECS workers)

### Why Job-Based Architecture?

#### ❌ **Synchronous Endpoints** (`/generate-bulk`, `/generate-bulk-dynamic`)

- Block HTTP connection until all ads are generated
- Timeout after 120 seconds (AWS App Runner limit)
- Can only generate ~3-4 ads reliably
- Frontend must keep connection alive

#### ✅ **Job-Based Endpoint** (`/generate-bulk-dynamic-job`)

- Returns job_id **instantly** (< 1 second)
- Background worker generates ads (5-30 minutes)
- Frontend polls for status every 2-5 seconds
- **No timeout issues** - can generate 20+ ads
- Survives page refreshes and navigation

---

## System Architecture

### Backend Components

```
┌──────────────┐
│   Frontend   │
│  (React/Vue) │
└──────┬───────┘
       │ POST /generate-bulk-dynamic-job
       ▼
┌──────────────────┐
│  FastAPI Server  │  • Validates request
│  (App Runner)    │  • Uploads files to Firebase
└──────┬───────────┘  • Creates Firestore job
       │              • Sends message to SQS
       ▼
┌──────────────────┐
│   AWS SQS Queue  │  Message: { job_id, job_data }
│ (ad-generation)  │
└──────┬───────────┘
       │ Worker polls queue
       ▼
┌──────────────────┐
│  Python Worker   │  Processes job:
│   (ECS Fargate)  │  1. Gemini template selection
└──────────────────┘  2. LangChain prompt enhancement
       │              3. Gemini 2.5 Flash image gen
       │              4. Firebase Storage upload
       │              5. Firestore conversation creation
       ▼
┌──────────────────┐
│    Firestore     │  Updates job status:
│ (ad_videos_jobs) │  • progress (0-100%)
└──────────────────┘  • current_step
       │              • result.ads[]
       ▼
┌──────────────────┐
│   Frontend       │  Polls GET /jobs/{job_id}
│  (Status Check)  │  Displays progress bar
└──────────────────┘  Shows generated ads
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface Layer               │
│  • Ad Generation Form                           │
│  • Progress Bar & Status Display                │
│  • Generated Ads Gallery                        │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│           State Management Layer                │
│  • Job State (jobId, status, progress)          │
│  • Form State (brand, product, images)          │
│  • Generated Ads State                          │
│  • Error State                                  │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│          Service/API Layer                      │
│  • submitAdGenerationJob()                      │
│  • pollJobStatus()                              │
│  • getJobsList()                                │
│  • cancelJob()                                  │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│        Persistence Layer                        │
│  • localStorage (jobId, form data)              │
│  • sessionStorage (temp state)                  │
└─────────────────────────────────────────────────┘
```

---

## Backend API Documentation

### Authentication

**All endpoints require Firebase ID Token:**

```http
Authorization: Bearer <firebase_id_token>
```

**How to get token (Frontend):**

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const idToken = await user.getIdToken();
```

### API Endpoints

#### 1️⃣ **Submit Job** - Create Ad Generation Job

**Endpoint:** `POST /api/v1/ads/generate-bulk-dynamic-job`

**Description:** Submits ad generation request and returns job_id immediately.

**Request Type:** `multipart/form-data` (supports file uploads)

**Required Fields:**

| Field                   | Type        | Description                             |
| ----------------------- | ----------- | --------------------------------------- |
| `brand_name`          | `string`  | Brand name (e.g., "Nike")               |
| `product_full_name`   | `string`  | Product full name (e.g., "Air Max 90")  |
| `product_description` | `string`  | Product description/key features        |
| `primary_color_hex`   | `string`  | Primary brand color (e.g., "#FF0000")   |
| `secondary_color_hex` | `string`  | Secondary brand color (e.g., "#000000") |
| `count`               | `integer` | Number of ads to generate (1-20)        |

**Optional Fields:**

| Field                     | Type        | Description                                                      | Default           |
| ------------------------- | ----------- | ---------------------------------------------------------------- | ----------------- |
| `logo`                  | `file`    | Logo image file (PNG/JPG/SVG)                                    | `null`          |
| `logo_url`              | `string`  | Logo URL (Firebase Storage or external)                          | `null`          |
| `product_images`        | `file[]`  | Product image files (at least 1 required)                        | `null`          |
| `product_image_urls`    | `string`  | JSON array of product image URLs                                 | `null`          |
| `aspect_ratio`          | `string`  | Aspect ratio:`1:1`, `16:9`, `9:16`, `4:5`                | `"1:1"`         |
| `lang`                  | `string`  | Target language:`"english"`, `"arabic"`, `"french"`, etc.  | Original language |
| `enable_kie_refinement` | `boolean` | Enable GPT-4o prompt refinement (⚠️ changes product structure) | `false`         |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Ad generation job created successfully",
  "data": {
    "job_id": "job_abc123def456",
    "status": "queued",
    "created_at": "2025-11-26T12:00:00.000Z",
    "estimated_completion": "2025-11-26T12:15:00.000Z",
    "status_url": "/api/v1/jobs/job_abc123def456",
    "message": "Job is queued. Use the status_url to check progress."
  }
}
```

**cURL Example:**

```bash
curl -X POST "https://api.adforge.com/api/v1/ads/generate-bulk-dynamic-job" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -F "brand_name=Nike" \
  -F "product_full_name=Air Max 90" \
  -F "product_description=Classic sneaker with visible Air cushioning" \
  -F "primary_color_hex=#FF0000" \
  -F "secondary_color_hex=#000000" \
  -F "count=10" \
  -F "aspect_ratio=1:1" \
  -F "lang=english" \
  -F "logo=@/path/to/logo.png" \
  -F "product_images=@/path/to/product1.jpg" \
  -F "product_images=@/path/to/product2.jpg"
```

---

#### 2️⃣ **Check Job Status** - Poll for Progress

**Endpoint:** `GET /api/v1/jobs/{job_id}`

**Description:** Retrieves current job status, progress, and results (if completed).

**Path Parameters:**

| Parameter  | Type       | Description                          |
| ---------- | ---------- | ------------------------------------ |
| `job_id` | `string` | Job ID returned from submit endpoint |

**Response - QUEUED:**

```json
{
  "success": true,
  "message": "Job status: queued",
  "data": {
    "job_id": "job_abc123def456",
    "status": "queued",
    "type": "bulk-dynamic",
    "created_at": "2025-11-26T12:00:00.000Z",
    "updated_at": "2025-11-26T12:00:00.000Z",
    "estimated_completion": "2025-11-26T12:15:00.000Z",
    "progress": {
      "percentage": 0,
      "current_step": "Waiting in queue...",
      "total_ads": 10,
      "ads_generated": 0
    },
    "message": "Job is waiting in queue"
  }
}
```

**Response - PROCESSING:**

```json
{
  "success": true,
  "message": "Job status: processing",
  "data": {
    "job_id": "job_abc123def456",
    "status": "processing",
    "type": "bulk-dynamic",
    "created_at": "2025-11-26T12:00:00.000Z",
    "updated_at": "2025-11-26T12:05:30.000Z",
    "started_at": "2025-11-26T12:01:00.000Z",
    "progress": {
      "percentage": 50,
      "current_step": "Generating ad 5/10 (template: lifestyle)...",
      "total_ads": 10,
      "ads_generated": 5
    },
    "message": "Processing... Generating ad 5/10 (template: lifestyle)..."
  }
}
```

**Response - COMPLETED:**

```json
{
  "success": true,
  "message": "Job status: completed",
  "data": {
    "job_id": "job_abc123def456",
    "status": "completed",
    "type": "bulk-dynamic",
    "created_at": "2025-11-26T12:00:00.000Z",
    "updated_at": "2025-11-26T12:15:00.000Z",
    "completed_at": "2025-11-26T12:15:00.000Z",
    "progress": {
      "percentage": 100,
      "current_step": "All ads generated successfully",
      "total_ads": 10,
      "ads_generated": 10
    },
    "result": {
      "ads_generated": 10,
      "failed": 0,
      "ads": [
        {
          "firebase_url": "https://storage.googleapis.com/saas-adforge.firebasestorage.app/users/USER_ID/stores/BRAND_ID/products/PRODUCT_ID/conversations/CONV_ID/ad_lifestyle_1_20251126_120500.png",
          "storage_path": "users/USER_ID/stores/BRAND_ID/products/PRODUCT_ID/conversations/CONV_ID/ad_lifestyle_1_20251126_120500.png",
          "conversation_id": "conv_123abc",
          "aspect_ratio": "1:1",
          "prompt_used": "Lifestyle ad featuring Nike Air Max 90 in urban setting...",
          "template": "lifestyle",
          "variation": 1
        }
      ]
    },
    "message": "Job completed successfully"
  }
}
```

**Response - FAILED:**

```json
{
  "success": true,
  "message": "Job status: failed",
  "data": {
    "job_id": "job_abc123def456",
    "status": "failed",
    "type": "bulk-dynamic",
    "created_at": "2025-11-26T12:00:00.000Z",
    "updated_at": "2025-11-26T12:05:00.000Z",
    "failed_at": "2025-11-26T12:05:00.000Z",
    "progress": {
      "percentage": 30,
      "current_step": "Failed during template selection",
      "total_ads": 10,
      "ads_generated": 3
    },
    "error": {
      "message": "Gemini API rate limit exceeded",
      "code": "RATE_LIMIT_EXCEEDED",
      "timestamp": "2025-11-26T12:05:00.000Z"
    },
    "message": "Job failed"
  }
}
```

---

#### 3️⃣ **List User Jobs** (Optional)

**Endpoint:** `GET /api/v1/jobs`

**Description:** Lists all jobs for authenticated user.

**Query Parameters:**

| Parameter         | Type        | Description                                                                          | Default   |
| ----------------- | ----------- | ------------------------------------------------------------------------------------ | --------- |
| `status_filter` | `string`  | Filter:`all`, `queued`, `processing`, `completed`, `failed`, `cancelled` | `"all"` |
| `limit`         | `integer` | Max jobs to return (1-100)                                                           | `10`    |

**Response:**

```json
{
  "success": true,
  "message": "Retrieved 5 job(s)",
  "data": {
    "jobs": [
      {
        "job_id": "job_abc123",
        "status": "completed",
        "type": "bulk-dynamic",
        "created_at": "2025-11-26T12:00:00.000Z",
        "completed_at": "2025-11-26T12:15:00.000Z",
        "progress": 100,
        "total_ads": 10,
        "ads_generated": 10
      }
    ],
    "total": 5,
    "filter": "all",
    "limit": 10
  }
}
```

---

#### 4️⃣ **Cancel Job** (Optional)

**Endpoint:** `POST /api/v1/jobs/{job_id}/cancel`

**Description:** Cancels a queued or processing job.

**Response:**

```json
{
  "success": true,
  "message": "Job cancelled successfully",
  "data": {
    "job_id": "job_abc123",
    "status": "cancelled"
  }
}
```

---

## Frontend Implementation Strategy

### Core Implementation Phases

#### Phase 1: Form & Data Collection
- Build form to collect brand/product information
- Handle file uploads (logo, product images)
- Validate inputs before submission
- Preview uploaded images

#### Phase 2: Job Submission
- Create FormData with all fields
- Submit to `/generate-bulk-dynamic-job`
- Handle submission errors
- Store job_id in state and localStorage

#### Phase 3: Progress Tracking
- Poll `/api/v1/jobs/{job_id}` every 3-5 seconds
- Update UI with real-time progress
- Handle all job statuses (queued, processing, completed, failed)
- Support page refresh (restore from localStorage)

#### Phase 4: Results Display
- Display generated ads in gallery
- Allow download/share of individual ads
- Show ad metadata (template, prompt used)
- Handle partial results (some ads succeeded, some failed)

---

## Complete Integration Workflow

### Status Flow Diagram

```
┌─────────┐
│ Submit  │ POST /generate-bulk-dynamic-job
│  Job    │ ────────────────────────────────► job_id returned (< 1s)
└─────────┘

     │
     ▼
   
┌─────────┐
│ QUEUED  │ status: "queued", percentage: 0%
└─────────┘
     │ Worker picks up job from SQS
     ▼
   
┌────────────┐
│ PROCESSING │ status: "processing", percentage: 10-90%
│            │ current_step: "Generating ad 5/10..."
└────────────┘
     │
     ├──► ✅ Success
     │         ▼
     │    ┌───────────┐
     │    │ COMPLETED │ status: "completed", percentage: 100%
     │    │           │ result.ads = [10 Firebase URLs]
     │    └───────────┘
     │
     └──► ❌ Failure
              ▼
         ┌────────┐
         │ FAILED │ status: "failed"
         │        │ error.message = "Rate limit exceeded"
         └────────┘
```

### Job Status Values

| Status         | Description                    | Terminal? | Frontend Action                          |
| -------------- | ------------------------------ | --------- | ---------------------------------------- |
| `queued`     | Job waiting in queue           | ❌        | Show "waiting" message, keep polling     |
| `processing` | Worker actively generating ads | ❌        | Show progress bar, keep polling          |
| `completed`  | All ads generated successfully | ✅        | Display ads, stop polling                |
| `failed`     | Job failed with error          | ✅        | Show error message, stop polling         |
| `cancelled`  | Job cancelled by user          | ✅        | Show cancellation message, stop polling  |

---

## State Management

### Frontend State Structure

```typescript
interface AdGenerationState {
  // Job state
  jobId: string | null;
  status: 'idle' | 'submitting' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Progress state
  progress: {
    percentage: number;          // 0-100
    current_step: string;         // Human-readable step
    total_ads: number;
    ads_generated: number;
  };
  
  // Results state
  generatedAds: GeneratedAd[];
  
  // Error state
  error: {
    message: string;
    code?: string;
    timestamp?: string;
  } | null;
  
  // Form state
  formData: {
    brand_name: string;
    product_full_name: string;
    product_description: string;
    primary_color_hex: string;
    secondary_color_hex: string;
    count: number;
    aspect_ratio: '1:1' | '16:9' | '9:16' | '4:5';
    lang: string;
    logo?: File;
    product_images: File[];
  };
}

interface GeneratedAd {
  firebase_url: string;
  storage_path: string;
  conversation_id: string;
  aspect_ratio: string;
  prompt_used: string;
  template: string;
  variation: number;
}
```

### Local Storage Strategy

```typescript
// Store job_id for persistence across page refreshes
localStorage.setItem('currentAdJobId', jobId);

// Store form data for recovery
localStorage.setItem('adFormData', JSON.stringify(formData));

// Clear on completion or cancellation
localStorage.removeItem('currentAdJobId');
localStorage.removeItem('adFormData');
```

---

## UI/UX Considerations

### Progress Indicator Design

```tsx
<div className="ad-generation-progress">
  {/* Progress Bar */}
  <div className="progress-bar-container">
    <div 
      className="progress-bar-fill" 
      style={{ width: `${progress.percentage}%` }}
    />
    <span className="progress-percentage">{progress.percentage}%</span>
  </div>
  
  {/* Current Step */}
  <p className="current-step">{progress.current_step}</p>
  
  {/* Ads Counter */}
  <p className="ads-counter">
    {progress.ads_generated} / {progress.total_ads} ads generated
  </p>
  
  {/* Estimated Time */}
  {estimatedTimeRemaining && (
    <p className="estimated-time">
      Estimated time remaining: {estimatedTimeRemaining}
    </p>
  )}
</div>
```

### User Experience Best Practices

1. **Allow Navigation During Generation**
   - User can navigate to other pages
   - Show persistent notification/badge indicating job in progress
   - Restore progress view when returning

2. **Provide Feedback at Every Stage**
   - Immediate feedback on form submission
   - Real-time progress updates
   - Clear error messages with recovery options

3. **Handle Edge Cases**
   - Network disconnection (resume polling when reconnected)
   - Browser tab visibility (reduce polling when hidden)
   - Partial failures (show which ads succeeded/failed)

4. **Mobile Optimization**
   - Prevent screen sleep during generation
   - Reduce polling frequency on mobile to save battery
   - Optimize image loading for mobile networks

---

## Error Handling & Recovery

### Error Types and Handling

#### 1. Submission Errors (400, 401, 403)

```typescript
async function handleSubmissionError(error: any, formData: FormData) {
  if (error.status === 400) {
    // Validation error - show field-specific errors
    const errors = error.response.data.errors;
    return {
      type: 'validation',
      message: 'Please check your inputs',
      fieldErrors: errors
    };
  }
  
  if (error.status === 401) {
    // Auth error - re-authenticate user
    await refreshFirebaseToken();
    return {
      type: 'auth',
      message: 'Session expired. Please try again.',
      shouldRetry: true
    };
  }
  
  if (error.status === 403) {
    // Permission error
    return {
      type: 'permission',
      message: 'You do not have permission to generate ads',
      shouldRetry: false
    };
  }
}
```

#### 2. Polling Errors (Network, Rate Limiting)

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited - exponential backoff
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await sleep(delay);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error; // Last attempt failed
      }
      
      // Network error - linear backoff
      await sleep(2000);
    }
  }
}
```

#### 3. Job Failures

```typescript
function handleJobFailure(error: JobError, jobId: string) {
  const recoveryStrategies = {
    'RATE_LIMIT_EXCEEDED': {
      message: 'API rate limit exceeded. Job will auto-retry in 5 minutes.',
      canRetry: true,
      retryDelay: 300000 // 5 minutes
    },
    'INVALID_PRODUCT_DATA': {
      message: 'Product data is invalid. Please update and resubmit.',
      canRetry: true,
      requiresUserAction: true
    },
    'STORAGE_QUOTA_EXCEEDED': {
      message: 'Storage quota exceeded. Please delete old ads.',
      canRetry: false,
      requiresUserAction: true
    },
    'WORKER_TIMEOUT': {
      message: 'Generation took too long. Job will auto-retry.',
      canRetry: true,
      retryDelay: 60000 // 1 minute
    }
  };
  
  return recoveryStrategies[error.code] || {
    message: error.message,
    canRetry: false
  };
}
```

### Common Errors Reference

| Status Code | Error               | Cause                          | Solution                      |
| ----------- | ------------------- | ------------------------------ | ----------------------------- |
| `400`     | Invalid parameters  | Missing/invalid form fields    | Check required fields         |
| `401`     | Unauthorized        | Missing/invalid Firebase token | Re-authenticate user          |
| `404`     | Job not found       | Invalid job_id or wrong user   | Verify job_id                 |
| `429`     | Rate limit exceeded | Too many requests              | Implement exponential backoff |
| `503`     | Service unavailable | SQS queue not configured       | Contact support               |

---

## Production-Ready Code Examples

### Complete React Hook Implementation

```tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuth } from 'firebase/auth';

interface AdGenerationJob {
  jobId: string | null;
  status: 'idle' | 'submitting' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    percentage: number;
    current_step: string;
    total_ads: number;
    ads_generated: number;
  };
  ads: GeneratedAd[];
  error: string | null;
}

export function useAdGeneration() {
  const [job, setJob] = useState<AdGenerationJob>({
    jobId: null,
    status: 'idle',
    progress: { percentage: 0, current_step: '', total_ads: 0, ads_generated: 0 },
    ads: [],
    error: null
  });
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Submit ad generation job
  const submitJob = async (formData: FormData) => {
    try {
      setJob(prev => ({ ...prev, status: 'submitting', error: null }));
      
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/v1/ads/generate-bulk-dynamic-job', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
        body: formData,
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit job');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      const jobId = result.data.job_id;
      
      setJob(prev => ({
        ...prev,
        jobId,
        status: 'queued'
      }));
      
      // Persist to localStorage
      localStorage.setItem('currentAdJobId', jobId);
      
      return jobId;
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setJob(prev => ({ ...prev, status: 'idle', error: 'Job submission cancelled' }));
      } else {
        setJob(prev => ({ ...prev, status: 'failed', error: error.message }));
      }
      throw error;
    }
  };
  
  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      const { status, progress, result: jobResult, error: jobError } = result.data;
      
      setJob(prev => ({
        ...prev,
        status,
        progress,
        ads: status === 'completed' ? jobResult.ads : prev.ads,
        error: status === 'failed' ? jobError.message : null
      }));
      
      // Stop polling if terminal state
      if (['completed', 'failed', 'cancelled'].includes(status)) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        localStorage.removeItem('currentAdJobId');
      }
      
    } catch (error: any) {
      console.error('Polling error:', error);
      // Don't set error state for transient polling errors
      // Keep polling - network might recover
    }
  }, []);
  
  // Start polling when jobId is set
  useEffect(() => {
    if (!job.jobId || ['completed', 'failed', 'cancelled'].includes(job.status)) {
      return;
    }
    
    // Initial poll
    pollJobStatus(job.jobId);
    
    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollJobStatus(job.jobId!);
    }, 3000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [job.jobId, job.status, pollJobStatus]);
  
  // Resume job on mount (after page refresh)
  useEffect(() => {
    const savedJobId = localStorage.getItem('currentAdJobId');
    if (savedJobId && !job.jobId) {
      setJob(prev => ({
        ...prev,
        jobId: savedJobId,
        status: 'queued'
      }));
    }
  }, []);
  
  // Cancel job
  const cancelJob = async () => {
    if (!job.jobId) return;
    
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');
      
      await fetch(`/api/v1/jobs/${job.jobId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      setJob(prev => ({ ...prev, status: 'cancelled' }));
      localStorage.removeItem('currentAdJobId');
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
    } catch (error: any) {
      console.error('Cancel error:', error);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    job,
    submitJob,
    cancelJob,
    isGenerating: ['submitting', 'queued', 'processing'].includes(job.status)
  };
}
```

### Complete React Component Example

```tsx
import React, { useState } from 'react';
import { useAdGeneration } from './useAdGeneration';

export function AdGeneratorPage() {
  const { job, submitJob, cancelJob, isGenerating } = useAdGeneration();
  
  const [formData, setFormData] = useState({
    brand_name: '',
    product_full_name: '',
    product_description: '',
    primary_color_hex: '#000000',
    secondary_color_hex: '#FFFFFF',
    count: 10,
    aspect_ratio: '1:1' as const,
    lang: 'english'
  });
  
  const [logo, setLogo] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.brand_name || !formData.product_full_name) {
      alert('Please fill in required fields');
      return;
    }
    
    if (productImages.length === 0) {
      alert('Please upload at least one product image');
      return;
    }
    
    // Create FormData
    const data = new FormData();
    data.append('brand_name', formData.brand_name);
    data.append('product_full_name', formData.product_full_name);
    data.append('product_description', formData.product_description);
    data.append('primary_color_hex', formData.primary_color_hex);
    data.append('secondary_color_hex', formData.secondary_color_hex);
    data.append('count', formData.count.toString());
    data.append('aspect_ratio', formData.aspect_ratio);
    data.append('lang', formData.lang);
    
    if (logo) {
      data.append('logo', logo);
    }
    
    productImages.forEach(img => {
      data.append('product_images', img);
    });
    
    try {
      await submitJob(data);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };
  
  return (
    <div className="ad-generator-page">
      {/* Form Section */}
      <section className="form-section">
        <h1>Generate Dynamic Ads</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Brand Information */}
          <div className="form-group">
            <label>Brand Name *</label>
            <input
              type="text"
              value={formData.brand_name}
              onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
              disabled={isGenerating}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              value={formData.product_full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, product_full_name: e.target.value }))}
              disabled={isGenerating}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Product Description *</label>
            <textarea
              value={formData.product_description}
              onChange={(e) => setFormData(prev => ({ ...prev, product_description: e.target.value }))}
              disabled={isGenerating}
              required
              rows={4}
            />
          </div>
          
          {/* Colors */}
          <div className="form-row">
            <div className="form-group">
              <label>Primary Color</label>
              <input
                type="color"
                value={formData.primary_color_hex}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_color_hex: e.target.value }))}
                disabled={isGenerating}
              />
            </div>
            
            <div className="form-group">
              <label>Secondary Color</label>
              <input
                type="color"
                value={formData.secondary_color_hex}
                onChange={(e) => setFormData(prev => ({ ...prev, secondary_color_hex: e.target.value }))}
                disabled={isGenerating}
              />
            </div>
          </div>
          
          {/* Settings */}
          <div className="form-row">
            <div className="form-group">
              <label>Number of Ads</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.count}
                onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                disabled={isGenerating}
              />
            </div>
            
            <div className="form-group">
              <label>Aspect Ratio</label>
              <select
                value={formData.aspect_ratio}
                onChange={(e) => setFormData(prev => ({ ...prev, aspect_ratio: e.target.value as any }))}
                disabled={isGenerating}
              >
                <option value="1:1">1:1 (Square)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="4:5">4:5 (Instagram)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Language</label>
              <select
                value={formData.lang}
                onChange={(e) => setFormData(prev => ({ ...prev, lang: e.target.value }))}
                disabled={isGenerating}
              >
                <option value="english">English</option>
                <option value="arabic">Arabic</option>
                <option value="french">French</option>
                <option value="spanish">Spanish</option>
              </select>
            </div>
          </div>
          
          {/* File Uploads */}
          <div className="form-group">
            <label>Logo (Optional)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
              disabled={isGenerating}
            />
          </div>
          
          <div className="form-group">
            <label>Product Images * (At least 1)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={(e) => setProductImages(Array.from(e.target.files || []))}
              disabled={isGenerating}
              required
            />
            {productImages.length > 0 && (
              <p className="file-count">{productImages.length} image(s) selected</p>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="submit-button"
          >
            {isGenerating ? 'Generating...' : 'Generate Ads'}
          </button>
        </form>
      </section>
      
      {/* Progress Section */}
      {isGenerating && (
        <section className="progress-section">
          <h2>Generation Progress</h2>
          
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${job.progress.percentage}%` }}
            />
            <span className="progress-percentage">{job.progress.percentage}%</span>
          </div>
          
          <p className="current-step">{job.progress.current_step}</p>
          <p className="ads-counter">
            {job.progress.ads_generated} / {job.progress.total_ads} ads generated
          </p>
          
          <button onClick={cancelJob} className="cancel-button">
            Cancel Generation
          </button>
        </section>
      )}
      
      {/* Error Section */}
      {job.error && (
        <section className="error-section">
          <h2>Error</h2>
          <p className="error-message">{job.error}</p>
        </section>
      )}
      
      {/* Results Section */}
      {job.status === 'completed' && job.ads.length > 0 && (
        <section className="results-section">
          <h2>Generated Ads ({job.ads.length})</h2>
          
          <div className="ads-grid">
            {job.ads.map((ad, index) => (
              <div key={index} className="ad-card">
                <img src={ad.firebase_url} alt={`Ad ${index + 1}`} />
                <div className="ad-metadata">
                  <p className="template">Template: {ad.template}</p>
                  <p className="variation">Variation: {ad.variation}</p>
                  <a
                    href={ad.firebase_url}
                    download={`ad_${index + 1}.png`}
                    className="download-button"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdGeneration } from './useAdGeneration';

describe('useAdGeneration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('should submit job successfully', async () => {
    const { result } = renderHook(() => useAdGeneration());
    
    const formData = new FormData();
    formData.append('brand_name', 'Test Brand');
    formData.append('product_full_name', 'Test Product');
    formData.append('count', '10');
    
    await act(async () => {
      await result.current.submitJob(formData);
    });
    
    expect(result.current.job.status).toBe('queued');
    expect(result.current.job.jobId).toBeTruthy();
  });
  
  test('should poll for job status', async () => {
    const { result } = renderHook(() => useAdGeneration());
    
    // Submit job
    await act(async () => {
      await result.current.submitJob(createMockFormData());
    });
    
    // Wait for polling to update status
    await waitFor(() => {
      expect(result.current.job.status).toBe('processing');
    }, { timeout: 5000 });
  });
  
  test('should restore job from localStorage', () => {
    localStorage.setItem('currentAdJobId', 'job_test123');
    
    const { result } = renderHook(() => useAdGeneration());
    
    expect(result.current.job.jobId).toBe('job_test123');
    expect(result.current.job.status).toBe('queued');
  });
  
  test('should handle job completion', async () => {
    const { result } = renderHook(() => useAdGeneration());
    
    await act(async () => {
      await result.current.submitJob(createMockFormData());
    });
    
    await waitFor(() => {
      expect(result.current.job.status).toBe('completed');
      expect(result.current.job.ads.length).toBeGreaterThan(0);
    }, { timeout: 30000 });
  });
});
```

### Integration Tests

```typescript
describe('Ad Generation Flow', () => {
  test('complete workflow: submit -> poll -> display results', async () => {
    const { getByText, getByLabelText, findByText } = render(<AdGeneratorPage />);
    
    // Fill form
    await userEvent.type(getByLabelText('Brand Name'), 'Nike');
    await userEvent.type(getByLabelText('Product Name'), 'Air Max 90');
    await userEvent.type(getByLabelText('Product Description'), 'Classic sneaker');
    
    // Upload files
    const logoInput = getByLabelText('Logo');
    const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });
    await userEvent.upload(logoInput, logoFile);
    
    const productImagesInput = getByLabelText('Product Images');
    const productFile = new File(['product'], 'product.jpg', { type: 'image/jpeg' });
    await userEvent.upload(productImagesInput, productFile);
    
    // Submit form
    const submitButton = getByText('Generate Ads');
    await userEvent.click(submitButton);
    
    // Verify submission
    await findByText(/Generation Progress/i);
    
    // Wait for completion
    await findByText(/Generated Ads/i, {}, { timeout: 60000 });
    
    // Verify results displayed
    const adImages = screen.getAllByAltText(/Ad \d+/);
    expect(adImages.length).toBeGreaterThan(0);
  });
});
```

---

## Performance Optimization

### Polling Optimization

```typescript
// Adaptive polling interval based on tab visibility
function useAdaptivePolling(jobId: string, status: string) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Poll every 3s when visible, 10s when hidden
  const pollingInterval = isVisible ? 3000 : 10000;
  
  useEffect(() => {
    if (['completed', 'failed', 'cancelled'].includes(status)) {
      return;
    }
    
    const interval = setInterval(() => {
      pollJobStatus(jobId);
    }, pollingInterval);
    
    return () => clearInterval(interval);
  }, [jobId, status, pollingInterval]);
}
```

### Image Loading Optimization

```tsx
// Lazy load generated ad images
function AdGallery({ ads }: { ads: GeneratedAd[] }) {
  return (
    <div className="ads-grid">
      {ads.map((ad, index) => (
        <div key={index} className="ad-card">
          <img
            src={ad.firebase_url}
            alt={`Ad ${index + 1}`}
            loading="lazy" // Browser-native lazy loading
            decoding="async" // Offload decoding to separate thread
          />
        </div>
      ))}
    </div>
  );
}
```

### Request Deduplication

```typescript
// Prevent duplicate polling requests
const requestCache = new Map<string, Promise<any>>();

async function pollJobStatus(jobId: string) {
  const cacheKey = `job_${jobId}`;
  
  // Return existing request if in flight
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }
  
  const request = fetch(`/api/v1/jobs/${jobId}`, {
    headers: { 'Authorization': `Bearer ${idToken}` }
  }).then(res => res.json());
  
  requestCache.set(cacheKey, request);
  
  try {
    const result = await request;
    return result;
  } finally {
    // Clear cache after request completes
    requestCache.delete(cacheKey);
  }
}
```

---

## Troubleshooting Guide

### Job Stuck in "queued"

**Symptoms:**
- Job status remains "queued" for > 5 minutes
- Progress percentage stays at 0%

**Possible Causes:**
1. Worker offline (ECS task not running)
2. SQS queue has no messages
3. Worker crashed during startup

**Solutions:**
```bash
# Check queue stats
GET /api/v1/jobs/queue/stats

# Check ECS worker status
aws ecs list-tasks --cluster adforge-cluster --service-name adforge-worker

# View worker logs
aws logs tail /ecs/adforge-worker --follow --region eu-west-3
```

### Job Failed with "Rate limit exceeded"

**Symptoms:**
- Job fails after generating 3-5 ads
- Error code: `RATE_LIMIT_EXCEEDED`

**Cause:** Gemini API rate limit (60 requests/minute)

**Solution:**
- Job will auto-retry 3 times with exponential backoff
- If still failing, wait 5 minutes and resubmit
- Consider reducing ad count or spacing out requests

### Images Not Displaying

**Symptoms:**
- Generated ads array is populated but images don't load
- Console shows CORS errors

**Possible Causes:**
1. CORS issue with Firebase Storage
2. Invalid URL format
3. Network blocking Firebase domain

**Solutions:**
```typescript
// 1. Verify Firebase Storage CORS rules
// 2. Check URL format
console.log('Ad URL:', ad.firebase_url);
// Should be: https://storage.googleapis.com/saas-adforge.firebasestorage.app/...

// 3. Test URL directly
const testImage = (url: string) => {
  const img = new Image();
  img.onload = () => console.log('Image loaded successfully');
  img.onerror = () => console.error('Image failed to load');
  img.src = url;
};
```

### Polling Stops Unexpectedly

**Symptoms:**
- Progress updates stop before completion
- Job still shows "processing" in Firestore

**Possible Causes:**
1. JavaScript error in polling function
2. Network connectivity issue
3. Browser throttling due to tab inactivity

**Solutions:**
```typescript
// Add error boundary around polling logic
try {
  await pollJobStatus(jobId);
} catch (error) {
  console.error('Polling error:', error);
  // Don't stop polling - retry next interval
}

// Detect connectivity issues
window.addEventListener('online', () => {
  console.log('Network reconnected - resuming polling');
  resumePolling();
});

window.addEventListener('offline', () => {
  console.log('Network disconnected - pausing polling');
  pausePolling();
});
```

---

## Data Structures Reference

### TypeScript Interfaces

```typescript
// Job submission response
interface JobSubmitResponse {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    status: 'queued';
    created_at: string;
    estimated_completion: string;
    status_url: string;
    message: string;
  };
}

// Job status response
interface JobStatusResponse {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    type: 'bulk-dynamic';
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
    failed_at?: string;
    estimated_completion?: string;
    progress: {
      percentage: number;
      current_step: string;
      total_ads: number;
      ads_generated: number;
    };
    result?: {
      ads_generated: number;
      failed: number;
      ads: GeneratedAd[];
    };
    error?: {
      message: string;
      code: string;
      timestamp: string;
      details?: any;
    };
    message: string;
  };
}

// Generated ad object
interface GeneratedAd {
  firebase_url: string;         // Full public Firebase Storage URL
  storage_path: string;         // Firebase Storage path (for deletion)
  conversation_id: string;      // Firestore conversation ID
  aspect_ratio: '1:1' | '16:9' | '9:16' | '4:5';
  prompt_used: string;          // Truncated prompt (first 200 chars)
  template: TemplateType;       // Template used
  variation: number;            // Variation number (1, 2, 3...)
}

// Available templates
type TemplateType =
  | 'transformation'
  | 'eco_friendly'
  | 'multi_feature'
  | 'limited_offer'
  | 'lifestyle'
  | 'ugc_authentic'
  | 'product_hero'
  | 'comparison_chart'
  | 'unboxing_reveal'
  | 'problem_solution';
```

---

## Best Practices Checklist

### ✅ DO:

1. **Poll every 3-5 seconds** (not faster - avoid rate limits)
2. **Store job_id in localStorage** (allow page refresh)
3. **Show progress bar** with percentage and current step
4. **Handle all terminal states** (completed, failed, cancelled)
5. **Display error messages** from `error.message` field
6. **Use Firebase Storage URLs directly** in `<img>` tags (no download needed)
7. **Implement exponential backoff** for 429 errors
8. **Allow users to navigate away** (poll in background)
9. **Provide cancel functionality** for long-running jobs
10. **Show estimated time remaining** based on progress

### ❌ DON'T:

1. ❌ Poll faster than every 2 seconds (causes rate limiting)
2. ❌ Use synchronous endpoints for count > 5 (will timeout)
3. ❌ Store base64 images (we return Firebase URLs)
4. ❌ Download images from Firebase Storage (URLs are public CDN)
5. ❌ Keep polling after terminal state (completed/failed/cancelled)
6. ❌ Block UI during generation (allow navigation)
7. ❌ Ignore error states (always show error messages)
8. ❌ Assume job completes in fixed time (variable based on count/complexity)

---

## Quick Reference

### Minimal Working Example

```javascript
// 1. Submit job
const formData = new FormData();
formData.append('brand_name', 'Nike');
formData.append('product_full_name', 'Air Max 90');
formData.append('product_description', 'Classic sneaker with Air cushioning');
formData.append('primary_color_hex', '#FF0000');
formData.append('secondary_color_hex', '#000000');
formData.append('count', '10');
formData.append('logo', logoFile);
formData.append('product_images', productImageFile1);
formData.append('product_images', productImageFile2);

const idToken = await firebase.auth().currentUser.getIdToken();

const submitResponse = await fetch('/api/v1/ads/generate-bulk-dynamic-job', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${idToken}` },
  body: formData
});

const { data } = await submitResponse.json();
const jobId = data.job_id;

// 2. Poll for status every 3 seconds
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`/api/v1/jobs/${jobId}`, {
    headers: { 'Authorization': `Bearer ${idToken}` }
  });
  
  const { data } = await statusResponse.json();
  
  console.log(`${data.status}: ${data.progress.percentage}% - ${data.progress.current_step}`);
  
  if (data.status === 'completed') {
    clearInterval(pollInterval);
    console.log('Generated ads:', data.result.ads);
    // Display ads: data.result.ads.forEach(ad => <img src={ad.firebase_url} />)
  }
  
  if (data.status === 'failed') {
    clearInterval(pollInterval);
    console.error('Job failed:', data.error.message);
  }
}, 3000);
```

### API Endpoints Summary

| Endpoint                                  | Method | Purpose       | Response Time |
| ----------------------------------------- | ------ | ------------- | ------------- |
| `/api/v1/ads/generate-bulk-dynamic-job` | POST   | Submit job    | < 1s          |
| `/api/v1/jobs/{job_id}`                 | GET    | Check status  | < 200ms       |
| `/api/v1/jobs`                          | GET    | List all jobs | < 500ms       |
| `/api/v1/jobs/{job_id}/cancel`          | POST   | Cancel job    | < 200ms       |

### Estimated Generation Times

| Ad Count  | Est. Time | Recommended Polling |
| --------- | --------- | ------------------- |
| 1-3 ads   | 3-5 min   | Every 3s            |
| 4-7 ads   | 5-10 min  | Every 3s            |
| 8-12 ads  | 10-20 min | Every 5s            |
| 13-20 ads | 20-30 min | Every 5s            |

### Available Templates (10 total)

| Template             | Description                   | Best For                          |
| -------------------- | ----------------------------- | --------------------------------- |
| `transformation`   | Before/After dramatic change  | Beauty, fitness, home improvement |
| `eco_friendly`     | Sustainable/natural products  | Organic, eco-conscious brands     |
| `multi_feature`    | Feature showcase              | Tech, multi-benefit products      |
| `limited_offer`    | Urgency/FOMO                  | Sales, promotions, launches       |
| `lifestyle`        | Aspirational lifestyle        | Fashion, travel, luxury           |
| `ugc_authentic`    | User-generated content style  | Authentic, relatable brands       |
| `product_hero`     | Clean minimal product focus   | Premium, minimalist brands        |
| `comparison_chart` | Side-by-side comparison       | Tech specs, competitive products  |
| `unboxing_reveal`  | Product reveal/packaging      | New products, luxury goods        |
| `problem_solution` | Problem → Solution narrative | Pain-point driven products        |

---

## Summary

This guide provides everything needed to integrate the Dynamic Bulk Ad Generation system:

### Backend API
- Job-based async architecture
- 4 main endpoints (submit, status, list, cancel)
- Support for 1-20 ads without timeouts
- Real-time progress tracking

### Frontend Implementation
- React hooks for state management
- Polling strategy with error handling
- localStorage persistence across refreshes
- Adaptive polling based on tab visibility

### Production Considerations
- Error handling and recovery strategies
- Performance optimizations
- Testing approaches
- Troubleshooting common issues

### Key Takeaways

1. ✅ Use `/generate-bulk-dynamic-job` for 5+ ads (prevents timeouts)
2. ✅ Poll `/api/v1/jobs/{job_id}` every 3-5 seconds
3. ✅ Handle all 5 status states (queued, processing, completed, failed, cancelled)
4. ✅ Show progress bar with `progress.percentage` and `progress.current_step`
5. ✅ Use `result.ads[].firebase_url` directly in `<img>` tags
6. ✅ Store `job_id` in localStorage for page refresh persistence
7. ✅ Implement retry logic for network errors and rate limits

---

**Questions? Issues?**

- Check Firestore `ad_videos_jobs` collection for job details
- Check CloudWatch logs (`/ecs/adforge-worker`) for worker errors
- Verify SQS queue has messages (`/api/v1/jobs/queue/stats`)
