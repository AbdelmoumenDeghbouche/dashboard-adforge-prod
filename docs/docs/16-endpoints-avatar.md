# Avatar Video Endpoints

## Overview

Generate talking avatar videos with product integration using AI avatars and voice synthesis.

**Service:** `avatarAPI` from `src/services/apiService.js`

## Endpoints

### 1. Generate Product Avatar Video

**Generate video with AI avatar presenting product**

```javascript
POST /api/v1/avatars/product-video/generate
```

**Request:**
```javascript
{
  // Avatar source
  avatar_source: "provided",           // provided | generated
  avatar_image_url: "https://...",     // If avatar_source = provided
  avatar_description: "Young woman...", // If avatar_source = generated
  
  // Script
  script: "Hi! Let me show you this amazing product...",
  
  // Video settings
  video_provider: "omni",              // omni | heygen | d-id
  aspect_ratio: "9:16",                // 9:16 | 16:9 | 1:1
  
  // Audio settings
  add_ambient_sound: true,
  ambient_setting: "studio",           // studio | cafe | office | outdoor
  ambient_volume: 0.25,                // 0.0 - 1.0
  
  // Voice settings
  voice_id: "21m00Tcm4TlvDq8ikWAM",   // ElevenLabs voice ID
  voice_stability: 0.5,                // 0.0 - 1.0
  voice_similarity: 0.75,              // 0.0 - 1.0
  
  // Product (optional)
  product_image_url: "https://...",
  product_name: "My Product"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    job_id: "job_avatar_abc123",
    estimated_duration: "3-5 minutes"
  }
}
```

**Job Result:**
```javascript
{
  video_url: "https://storage.googleapis.com/avatar_video.mp4",
  thumbnail_url: "https://storage.googleapis.com/thumb.jpg",
  duration: 45,
  avatar_info: {
    source: "provided",
    provider: "omni"
  },
  audio_info: {
    voice_id: "21m00Tcm4TlvDq8ikWAM",
    has_ambient_sound: true,
    ambient_setting: "studio"
  }
}
```

**Frontend Usage:**
```javascript
import { avatarAPI } from '../services/apiService';

async function generateAvatarVideo(params) {
  try {
    // Trigger generation
    const response = await avatarAPI.generateVideo({
      avatarSource: 'provided',
      avatarImageUrl: avatarImage,
      script: script,
      videoProvider: 'omni',
      aspectRatio: '9:16',
      addAmbientSound: true,
      ambientSetting: 'studio',
      ambientVolume: 0.25,
      voiceId: selectedVoiceId,
      voiceStability: 0.5,
      voiceSimilarity: 0.75,
      productImageUrl: productImage,
      productName: productName
    });
    
    const jobId = response.job_id;
    
    // Poll for completion
    const result = await pollJobStatus(
      jobId,
      (progress) => {
        console.log(`${progress.percentage}%: ${progress.message}`);
      },
      10000,
      180  // Max 30 minutes
    );
    
    console.log('Avatar video ready:', result.video_url);
    return result;
    
  } catch (error) {
    console.error('Avatar video generation failed:', error);
    throw error;
  }
}
```

---

### 2. Get Generated Videos

**Get list of generated avatar videos**

```javascript
GET /api/v1/avatars/videos?model={model}&limit={limit}
```

**Query Params:**
```javascript
{
  model: "omni",  // Optional: omni | heygen | d-id | all
  limit: 50       // Optional: default 50
}
```

**Response:**
```javascript
{
  success: true,
  data: [
    {
      video_id: "video_123",
      video_url: "https://...",
      thumbnail_url: "https://...",
      duration: 45,
      script: "Video script...",
      avatar_source: "provided",
      provider: "omni",
      created_at: "2024-01-15T10:00:00Z"
    }
    // ... more videos
  ]
}
```

**Frontend Usage:**
```javascript
const videos = await avatarAPI.getGeneratedVideos('omni', 50);

videos.forEach(video => {
  console.log(`Video: ${video.video_id}, Duration: ${video.duration}s`);
});
```

---

### 3. Get Video Job Status

**Check avatar video generation progress**

```javascript
GET /api/v1/avatars/job/{jobId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    job_id: "job_avatar_abc",
    status: "processing",
    progress: 60,
    current_step: "Generating avatar lip-sync...",
    created_at: "2024-01-15T10:00:00Z"
  }
}
```

**Frontend Usage:**
```javascript
const status = await avatarAPI.getJobStatus(jobId);
console.log(`Status: ${status.data.status}`);
```

---

### 4. Get Avatars List

**Get available avatars from library**

```javascript
GET /api/v1/avatars/list?limit={limit}&last_doc_id={lastDocId}
```

**Query Params:**
```javascript
{
  limit: 50,              // Optional
  last_doc_id: "doc_xyz"  // For pagination
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    avatars: [
      {
        avatar_id: "avatar_001",
        name: "Professional Woman",
        image_url: "https://...",
        description: "Young professional woman in business attire",
        demographics: {
          gender: "female",
          age: "25-35",
          ethnicity: "caucasian"
        },
        tags: ["professional", "business", "corporate"]
      }
      // ... more avatars
    ],
    count: 50,
    has_more: true,
    last_doc_id: "doc_abc"  // Use for next page
  }
}
```

**Frontend Usage:**
```javascript
const response = await avatarAPI.getAvatars(50);
const avatars = response.data.avatars;

// Load more (pagination)
if (response.data.has_more) {
  const nextPage = await avatarAPI.getAvatars(50, response.data.last_doc_id);
}
```

---

### 5. Search Avatars

**Search avatars with filters**

```javascript
GET /api/v1/avatars/search
```

**Query Params:**
```javascript
{
  query: "professional woman",     // Search text
  gender: "female",                // male | female | any
  age: "25-35",                    // 18-25 | 25-35 | 35-50 | 50+
  ethnicity: "caucasian",          // caucasian | asian | african | hispanic | ...
  situation: "office",             // office | casual | outdoor | ...
  accessories: "glasses",          // glasses | hat | jewelry | ...
  emotions: "smiling",             // smiling | serious | confident | ...
  hair_style: "long",              // long | short | medium | ...
  hair_color: "blonde",            // blonde | brown | black | red | ...
  limit: 20                        // Optional
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    avatars: [
      {
        avatar_id: "avatar_123",
        name: "Professional Woman with Glasses",
        image_url: "https://...",
        match_score: 0.95,
        demographics: {...},
        tags: [...]
      }
    ],
    count: 12,
    search_query: "professional woman"
  }
}
```

**Frontend Usage:**
```javascript
const response = await avatarAPI.searchAvatars(
  "professional woman",
  {
    gender: "female",
    age: "25-35",
    situation: "office",
    accessories: "glasses"
  },
  20
);

const matchingAvatars = response.data.avatars;
```

---

## Avatar Sources

### Provided Avatar
Use existing avatar image:
```javascript
{
  avatar_source: "provided",
  avatar_image_url: "https://your-avatar.jpg"
}
```

### Generated Avatar
AI generates avatar from description:
```javascript
{
  avatar_source: "generated",
  avatar_description: "Young professional woman with glasses, smiling, in modern office"
}
```

## Video Providers

### omni (Recommended)
- Fast generation (2-3 minutes)
- Good lip-sync quality
- Cost-effective

### heygen
- High-quality lip-sync
- Supports multiple languages
- Slower (5-8 minutes)

### d-id
- Natural expressions
- Good for short videos
- Medium speed (3-5 minutes)

## Voice Settings

### Voice ID
ElevenLabs voice ID. Common voices:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (friendly female)
- `EXAVITQu4vr4xnSDxMaL` - Bella (young female)
- `ErXwobaYiN019PkySvjV` - Antoni (male)

### Voice Stability (0.0 - 1.0)
- Low (0.0-0.3): More expressive, variable
- Medium (0.4-0.6): Balanced
- High (0.7-1.0): Consistent, predictable

### Voice Similarity (0.0 - 1.0)
- Low: More creative interpretation
- High: Closer to original voice sample

## Complete Avatar Video Flow

```javascript
import { useState, useEffect } from 'react';
import { avatarAPI } from '../services/apiService';
import { pollJobStatus } from '../services/apiService';

function AvatarVideoGenerator() {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [script, setScript] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Load available avatars
  useEffect(() => {
    loadAvatars();
  }, []);
  
  async function loadAvatars() {
    const response = await avatarAPI.getAvatars(50);
    setAvatars(response.data.avatars);
  }
  
  async function handleGenerate() {
    if (!selectedAvatar || !script) return;
    
    setGenerating(true);
    
    try {
      const response = await avatarAPI.generateVideo({
        avatarSource: 'provided',
        avatarImageUrl: selectedAvatar.image_url,
        script: script,
        videoProvider: 'omni',
        aspectRatio: '9:16',
        addAmbientSound: true,
        ambientSetting: 'studio',
        ambientVolume: 0.25,
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        voiceStability: 0.5,
        voiceSimilarity: 0.75
      });
      
      const jobId = response.job_id;
      
      // Poll for completion
      const result = await pollJobStatus(
        jobId,
        (progressData) => {
          setProgress(progressData.percentage);
        },
        10000,
        180
      );
      
      alert('Video ready!');
      window.open(result.video_url, '_blank');
      
    } catch (error) {
      alert('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }
  
  return (
    <div>
      <h2>Avatar Video Generator</h2>
      
      {/* Avatar Selector */}
      <div className="avatars-grid">
        {avatars.map(avatar => (
          <div
            key={avatar.avatar_id}
            onClick={() => setSelectedAvatar(avatar)}
            className={selectedAvatar?.avatar_id === avatar.avatar_id ? 'selected' : ''}
          >
            <img src={avatar.image_url} alt={avatar.name} />
            <p>{avatar.name}</p>
          </div>
        ))}
      </div>
      
      {/* Script Input */}
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Enter your script here..."
        rows={10}
      />
      
      {/* Generate Button */}
      <button onClick={handleGenerate} disabled={generating || !selectedAvatar || !script}>
        {generating ? `Generating... ${progress}%` : 'Generate Video'}
      </button>
    </div>
  );
}
```

## Best Practices

1. ✅ Use high-quality avatar images (at least 512x512px)
2. ✅ Keep scripts under 500 words for best results
3. ✅ Test different voices to find best match
4. ✅ Use appropriate ambient settings for context
5. ✅ Add product images for product-focused videos
6. ✅ Handle long generation times (3-10 minutes)
7. ✅ Provide real-time progress feedback
8. ✅ Allow previewing avatar before generation
