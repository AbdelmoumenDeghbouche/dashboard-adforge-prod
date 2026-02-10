# Video Playground Endpoints

## Overview

Simple video generation from prompt + image without full strategic analysis pipeline.

**Service:** `videoPlaygroundAPI` from `src/services/apiService.js`

## Endpoints

### 1. Generate Video

**Generate video from simple prompt and image**

```javascript
POST /api/v1/video-playground/playground/generate-video
```

**Request:**
```javascript
{
  prompt: "Show this product being used in a modern kitchen",
  image_url: "https://product-image.jpg",
  aspect_ratio: "9:16",        // 9:16 | 16:9 | 1:1
  platform: "tiktok",          // tiktok | instagram | youtube
  duration: 10,                // Optional: 5 | 10 seconds
  provider: "openai"           // openai | kie | kie_story
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_playground_abc123"
  }
}
```

**Job Result:**
```javascript
{
  video_url: "https://storage.googleapis.com/playground_video.mp4",
  thumbnail_url: "https://storage.googleapis.com/thumb.jpg",
  duration: 10,
  prompt: "Show this product being used in a modern kitchen",
  enhanced_prompt: "High-quality cinematic shot of premium product being used...",
  provider: "openai",
  created_at: "2024-01-15T10:00:00Z"
}
```

**Frontend Usage:**
```javascript
import { videoPlaygroundAPI } from '../services/apiService';
import { pollJobStatus } from '../services/apiService';

async function generatePlaygroundVideo(prompt, imageUrl, settings) {
  try {
    // Trigger generation
    const response = await videoPlaygroundAPI.generateVideo(
      prompt,
      imageUrl,
      settings.aspectRatio || '9:16',
      settings.platform || 'tiktok',
      settings.duration || null,
      settings.provider || 'openai'
    );
    
    const jobId = response.data.job_id;
    console.log('Video job created:', jobId);
    
    // Poll for completion
    const result = await pollJobStatus(
      jobId,
      (progress) => {
        console.log(`${progress.percentage}%: ${progress.message}`);
      },
      10000,  // Poll every 10 seconds
      180     // Max 30 minutes
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

### 2. Get Job Status

**Check video generation progress**

```javascript
GET /api/v1/video-chat/video-jobs/{jobId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    job_id: "job_playground_abc",
    status: "processing",
    progress: 45,
    current_step: "Enhancing prompt with Claude...",
    created_at: "2024-01-15T10:00:00Z"
  }
}
```

**Frontend Usage:**
```javascript
const status = await videoPlaygroundAPI.getJobStatus(jobId);
console.log(`Status: ${status.data.status}`);
```

---

### 3. Get All Playground Videos

**Get all videos created in playground**

```javascript
GET /api/v1/video-playground/videos?limit={limit}&filter={filter}
```

**Query Params:**
```javascript
{
  limit: 100,              // Optional, default: 100
  filter: "all"            // all | completed | failed
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    videos: [
      {
        id: "video_001",
        video_url: "https://...",
        thumbnail_url: "https://...",
        prompt: "Show product in kitchen",
        duration: 10,
        aspect_ratio: "9:16",
        provider: "openai",
        status: "completed",
        created_at: "2024-01-15T10:00:00Z"
      }
      // ... more videos
    ],
    count: 25
  }
}
```

**Frontend Usage:**
```javascript
const response = await videoPlaygroundAPI.getAllVideos(100, 'all');
const videos = response.data.videos;

// Filter completed videos
const completedVideos = videos.filter(v => v.status === 'completed');
```

---

### 4. Get Videos from Jobs

**Get videos from completed jobs**

```javascript
GET /api/v1/jobs?status=completed&type=video_generation&limit={limit}
```

**Response:**
```javascript
{
  success: true,
  data: {
    jobs: [
      {
        job_id: "job_001",
        status: "completed",
        type: "video_generation",
        result_data: {
          video_url: "https://...",
          duration: 10
        },
        created_at: "2024-01-15T10:00:00Z",
        completed_at: "2024-01-15T10:05:00Z"
      }
    ]
  }
}
```

**Frontend Usage:**
```javascript
const response = await videoPlaygroundAPI.getVideosFromJobs(100);

// Transform to video format
const videos = response.data.videos;
```

---

## Complete Playground Flow

```javascript
import { useState } from 'react';
import { videoPlaygroundAPI } from '../services/apiService';
import { pollJobStatus } from '../services/apiService';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

function VideoPlayground() {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  
  // Settings
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [platform, setPlatform] = useState('tiktok');
  const [duration, setDuration] = useState(10);
  const [provider, setProvider] = useState('openai');
  
  async function handleImageUpload(file) {
    setImageFile(file);
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `users/${currentUser.uid}/playground_images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    setImageUrl(url);
  }
  
  async function handleGenerate() {
    if (!prompt || !imageUrl) {
      alert('Please provide both prompt and image');
      return;
    }
    
    setGenerating(true);
    setProgress(0);
    setVideoUrl(null);
    
    try {
      // Trigger generation
      const response = await videoPlaygroundAPI.generateVideo(
        prompt,
        imageUrl,
        aspectRatio,
        platform,
        duration,
        provider
      );
      
      const jobId = response.data.job_id;
      console.log('Video job created:', jobId);
      
      // Poll for completion
      const result = await pollJobStatus(
        jobId,
        (progressData) => {
          setProgress(progressData.percentage);
          setProgressMessage(progressData.message);
        },
        10000,
        180
      );
      
      setVideoUrl(result.video_url);
      alert('Video ready!');
      
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }
  
  return (
    <div className="video-playground">
      <h2>Video Playground</h2>
      
      {/* Image Upload */}
      <div className="image-upload">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        {imageUrl && <img src={imageUrl} alt="Preview" style={{maxWidth: '200px'}} />}
      </div>
      
      {/* Prompt Input */}
      <div className="prompt-input">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video you want to create..."
          rows={4}
        />
      </div>
      
      {/* Settings */}
      <div className="settings">
        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
          <option value="9:16">9:16 (Vertical)</option>
          <option value="16:9">16:9 (Horizontal)</option>
          <option value="1:1">1:1 (Square)</option>
        </select>
        
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
        </select>
        
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          <option value={5}>5 seconds</option>
          <option value={10}>10 seconds</option>
        </select>
        
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="openai">OpenAI Sora</option>
          <option value="kie">Kling</option>
          <option value="kie_story">Kling Story</option>
        </select>
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || !prompt || !imageUrl}
      >
        {generating ? `Generating... ${progress}%` : 'Generate Video'}
      </button>
      
      {/* Progress */}
      {generating && (
        <div className="progress">
          <progress value={progress} max={100} />
          <p>{progressMessage}</p>
        </div>
      )}
      
      {/* Result */}
      {videoUrl && (
        <div className="result">
          <h3>Video Ready!</h3>
          <video src={videoUrl} controls style={{maxWidth: '100%'}} />
          <a href={videoUrl} download>Download Video</a>
        </div>
      )}
    </div>
  );
}

export default VideoPlayground;
```

## Playground vs Strategic Analysis

| Feature | Playground | Strategic Analysis |
|---------|-----------|-------------------|
| Input | Prompt + Image | Full product research |
| AI Analysis | Simple prompt enhancement | Deep angle intelligence |
| Script | None | AI-generated script |
| Creatives | Single | 3 variations (proof/fear/desire) |
| Duration | 5-10 seconds | 15-60 seconds |
| Scenes | 1 scene | 5-10 scenes |
| Speed | 3-8 minutes | 30-60 minutes |
| Use Case | Quick test | Full ad campaign |

## Video Providers

### openai (Sora)
- High quality cinematic
- Slower (5-8 minutes)
- Best for product showcases

### kie (Kling)
- Fast generation (2-4 minutes)
- Good for quick tests
- Natural motion

### kie_story
- Story-focused
- Medium speed (3-5 minutes)
- Best for narrative

## Aspect Ratios

- **9:16**: TikTok, Instagram Reels, YouTube Shorts
- **16:9**: YouTube, Facebook
- **1:1**: Instagram Feed, Facebook

## Best Practices

1. ✅ Use high-quality product images (at least 1024x1024)
2. ✅ Write detailed, specific prompts
3. ✅ Test with 5-second videos first (faster)
4. ✅ Use appropriate aspect ratio for platform
5. ✅ Start with OpenAI for best quality
6. ✅ Save videos for later reuse
7. ✅ Provide loading feedback (3-8 minutes)
8. ✅ Handle timeout errors gracefully
