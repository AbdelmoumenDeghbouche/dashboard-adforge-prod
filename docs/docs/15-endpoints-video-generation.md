# Video Generation Endpoints (Module 5)

## Overview

Video generation endpoints create final video ads using Sora/Kling AI video generation.

**Services:**
- `strategicAnalysisAPI` from `strategicAnalysisService.js` (triggers video)
- `videoChatAPI` from `apiService.js` (alternative video generation)

## Strategic Analysis Video Generation

### 1. Generate Video from Creative

**Generate video for approved creative (Module 5)**

```javascript
POST /api/v1/sora/generate/{brandId}/{productId}
```

**Request:**
```javascript
{
  creative_gen_id: "creative_gen_xyz",
  variation_id: "proof",              // proof | fear | desire
  video_style: "perfect_ugc_hybrid",  // perfect_ugc_hybrid | kling_only | sora_only
  ai_model: "claude"                  // Always use claude
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_video_abc123"
  }
}
```

**Job Result:**
```javascript
{
  video_url: "https://storage.googleapis.com/video.mp4",
  thumbnail_url: "https://storage.googleapis.com/thumb.jpg",
  duration: 40,
  format: "perfect_ugc_hybrid",
  scenes: [
    {
      scene_number: 1,
      duration: 5,
      dialogue: "Stop wasting 2 hours every morning",
      video_url: "https://...scene1.mp4",
      provider: "kling"
    }
    // ... more scenes
  ],
  metadata: {
    total_scenes: 7,
    kling_scenes: 7,
    sora_overlays: 1,
    generation_time_seconds: 245
  }
}
```

**Frontend Usage:**
```javascript
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';
import { pollJobStatus } from '../services/apiService';

async function generateVideo(brandId, productId, creativeGenId, variationId) {
  try {
    // Trigger video generation
    const response = await strategicAnalysisAPI.generateVideo(
      brandId,
      productId,
      creativeGenId,
      variationId,
      'perfect_ugc_hybrid'
    );
    
    const jobId = response.job_id;
    console.log('Video job created:', jobId);
    
    // Poll for completion with progress
    const result = await pollJobStatus(
      jobId,
      (progress) => {
        console.log(`Video: ${progress.percentage}% - ${progress.message}`);
      },
      10000,  // Poll every 10 seconds
      270     // Max 45 minutes (270 * 10s = 2700s)
    );
    
    console.log('Video ready:', result.video_url);
    return result;
    
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}
```

---

### 2. Get Video Job Status

**Check video generation progress**

```javascript
GET /api/v1/jobs/{jobId}
```

**Response:**
```javascript
{
  job_id: "job_video_abc",
  status: "processing",  // queued | processing | completed | failed
  type: "video_generation",
  progress_data: {
    percentage: 65,
    current_step: "Generating scene 5 of 7",
    scenes_completed: 4,
    scenes_total: 7
  },
  created_at: "2024-01-15T10:00:00Z"
}
```

**Frontend Usage:**
```javascript
const status = await strategicAnalysisAPI.getVideoJobStatus(jobId);
console.log(`Status: ${status.data.status}`);
```

---

## Video Chat Generation

Alternative video generation through conversational flow.

### 3. Create Video Conversation

**Start video generation conversation**

```javascript
POST /api/v1/video-chat/brands/{brandId}/video-conversations?product_id={productId}
```

**Request:**
```javascript
{
  reference_image_url: "https://product-image.jpg",
  duration: 10,              // Optional: 5 | 10 seconds
  provider: "kie_story",     // openai | kie | kie_story
  platform: "tiktok",        // tiktok | instagram | youtube
  aspect_ratio: "9:16",      // 9:16 | 16:9 | 1:1
  language: "en"             // en | fr | es | de
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    conversation_id: "conv_video_xyz",
    brand_id: "brand_123",
    product_id: "prod_456",
    created_at: "2024-01-15T10:00:00Z"
  }
}
```

**Frontend Usage:**
```javascript
import { videoChatAPI } from '../services/apiService';

const conversation = await videoChatAPI.createVideoConversation(
  brandId,
  productId,
  productImageUrl,
  10,           // duration
  'kie_story',  // provider
  'tiktok',     // platform
  '9:16',       // aspect ratio
  'en'          // language
);
```

---

### 4. Generate Sora Prompt

**Generate optimized Sora prompt from description**

```javascript
POST /api/v1/video-chat/generate-sora-prompt
```

**Request:**
```javascript
{
  video_description: "Show product being used in modern kitchen",
  brand_name: "My Brand",
  product_name: "My Product",
  product_category: "Kitchen Appliances",
  reference_image_url: "https://...",
  additional_image_urls: ["https://...", "https://..."]
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    prompt: "High-quality cinematic shot of modern kitchen...",
    duration: 24,
    analysis: "AI analysis of what will work best"
  }
}
```

**Frontend Usage:**
```javascript
const promptData = await videoChatAPI.generateSoraPrompt(
  "Product being used",
  brandName,
  productName,
  category,
  imageUrl
);

const optimizedPrompt = promptData.data.prompt;
```

---

### 5. Trigger Video Generation

**Generate video in conversation**

```javascript
POST /api/v1/video-chat/brands/{brandId}/products/{productId}/video-conversations/{conversationId}/generate-video
```

**Request:**
```javascript
{
  sora_prompt: {
    prompt: "Optimized Sora prompt",
    duration: 24
  },
  sora_analysis: "AI analysis",
  reference_image_url: "https://...",
  provider: "kie_story"  // openai | kie | kie_story
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    job_id: "job_video_chat_abc"
  }
}
```

**Frontend Usage:**
```javascript
const response = await videoChatAPI.triggerVideoGeneration(
  brandId,
  productId,
  conversationId,
  soraPrompt,
  soraAnalysis,
  referenceImageUrl,
  'kie_story'
);

const jobId = response.data.job_id;

// Poll for completion
const result = await pollJobStatus(jobId);
```

---

### 6. Get Conversation Videos

**Get all videos from a conversation**

```javascript
GET /api/v1/video-chat/brands/{brandId}/products/{productId}/video-conversations/{conversationId}/videos
```

**Response:**
```javascript
{
  success: true,
  data: {
    videos: [
      {
        video_id: "video_001",
        video_url: "https://...",
        thumbnail_url: "https://...",
        duration: 10,
        status: "completed",
        created_at: "2024-01-15T10:00:00Z"
      }
    ],
    count: 3
  }
}
```

**Frontend Usage:**
```javascript
const response = await videoChatAPI.getConversationVideos(
  brandId,
  productId,
  conversationId
);

const videos = response.data.videos;
```

---

## Video Formats

### perfect_ugc_hybrid (Recommended)
- **Kling**: 7 scenes (5s or 10s each)
- **Sora**: 1 overlay scene (brand/product showcase)
- **Total**: ~40 seconds
- **Best for**: Full narrative ads

### kling_only
- **Kling**: All scenes
- **No Sora overlay**
- **Best for**: Faster generation

### sora_only
- **Sora**: All scenes
- **No Kling**
- **Best for**: High-quality cinematic

## Progress Stages

Video generation has multiple stages:

```javascript
{
  percentage: 10,
  current_step: "Analyzing script..."
}

{
  percentage: 25,
  current_step: "Breaking down into scenes..."
}

{
  percentage: 40,
  current_step: "Generating scene 1 of 7 with Kling..."
}

{
  percentage: 85,
  current_step: "Generating Sora overlay..."
}

{
  percentage: 95,
  current_step: "Stitching scenes together..."
}

{
  percentage: 100,
  current_step: "Video ready!"
}
```

## Complete Video Generation Flow

```javascript
import { useState } from 'react';
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';
import { pollJobStatus } from '../services/apiService';
import { useStrategicChat, CHAT_STEPS, MESSAGE_TYPES } from '../contexts/StrategicChatContext';

function VideoGenerator({ brandId, productId, creativeGenId }) {
  const {
    setVideoJobId,
    setCurrentStep,
    addMessage
  } = useStrategicChat();
  
  const [selectedVariation, setSelectedVariation] = useState('proof');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  
  async function handleGenerate() {
    setGenerating(true);
    setCurrentStep(CHAT_STEPS.GENERATING_VIDEO);
    
    try {
      // Trigger video generation
      const response = await strategicAnalysisAPI.generateVideo(
        brandId,
        productId,
        creativeGenId,
        selectedVariation,
        'perfect_ugc_hybrid'
      );
      
      const jobId = response.job_id;
      setVideoJobId(jobId);
      
      addMessage({
        type: MESSAGE_TYPES.TEXT,
        sender: 'agent',
        content: 'Generating your video... This may take 5-45 minutes.'
      });
      
      // Poll with progress tracking
      const result = await pollJobStatus(
        jobId,
        (progressData) => {
          setProgress(progressData.percentage);
          setProgressMessage(progressData.message);
        },
        10000,
        270
      );
      
      // Video ready!
      addMessage({
        type: MESSAGE_TYPES.VIDEO,
        sender: 'agent',
        content: 'Your video is ready!',
        data: {
          video_url: result.video_url,
          thumbnail_url: result.thumbnail_url,
          duration: result.duration
        }
      });
      
      setCurrentStep(CHAT_STEPS.VIDEO_READY);
      
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }
  
  return (
    <div>
      <h3>Generate Video</h3>
      
      {/* Variation Selector */}
      <select value={selectedVariation} onChange={(e) => setSelectedVariation(e.target.value)}>
        <option value="proof">Proof Variation</option>
        <option value="fear">Fear Variation</option>
        <option value="desire">Desire Variation</option>
      </select>
      
      {/* Generate Button */}
      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Video'}
      </button>
      
      {/* Progress */}
      {generating && (
        <div>
          <progress value={progress} max={100} />
          <p>{progress}%</p>
          <p>{progressMessage}</p>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

### Common Errors

```javascript
// Script too long
{
  status: "failed",
  error_data: {
    message: "Script too long for Kling format",
    details: "Need shorter script or more scenes"
  }
}

// AI generation failed
{
  status: "failed",
  error_data: {
    message: "Kling generation failed for scene 3",
    details: "Content policy violation or technical error"
  }
}

// Timeout
{
  status: "failed",
  error_data: {
    message: "Video generation timeout",
    details: "Operation took longer than 45 minutes"
  }
}
```

## Best Practices

1. ✅ Use `perfect_ugc_hybrid` for best results
2. ✅ Poll every 10 seconds (video generation is slow)
3. ✅ Set max timeout to 45 minutes
4. ✅ Show real-time progress to user
5. ✅ Allow canceling long-running jobs
6. ✅ Store video URLs for later access
7. ✅ Handle timeouts gracefully
8. ✅ Test with different script lengths
