# Voice & Script Enhancement Endpoints

## Overview

Voice recommendation, script enhancement, and voice transformation using AI.

**Services:**
- `voiceAPI` from `apiService.js`
- `scriptAPI` from `apiService.js`

## Voice Endpoints

### 1. Get Voice Recommendations

**Get AI-recommended voices for avatar/script**

```javascript
POST /api/v1/voice/recommend
```

**Request:**
```javascript
{
  avatar_description: "Professional woman in her 30s",
  avatar_image_url: "https://...",  // Optional
  script: "Your product script...",
  limit: 20  // Number of recommendations
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    recommendations: [
      {
        voice_id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        gender: "female",
        age: "young_adult",
        accent: "american",
        description: "Warm, friendly, professional",
        preview_url: "https://elevenlabs.io/preview/...",
        match_score: 0.95,
        reasoning: "Professional tone matches avatar and script style",
        sample_categories: ["narration", "conversational", "sales"]
      }
      // ... more recommendations
    ],
    count: 20
  }
}
```

**Frontend Usage:**
```javascript
import { voiceAPI } from '../services/apiService';

async function getVoiceRecommendations(avatarDescription, script) {
  const response = await voiceAPI.getVoiceRecommendations({
    avatarDescription: avatarDescription,
    script: script,
    limit: 10
  });
  
  const voices = response.data.recommendations;
  
  // Sort by match score
  voices.sort((a, b) => b.match_score - a.match_score);
  
  return voices;
}
```

---

### 2. Change Voice (Speech-to-Speech)

**Transform voice in existing video**

```javascript
POST /api/v1/voice/generate
```

**Request:**
```javascript
{
  video_url: "https://original-video.mp4",
  voice_id: "21m00Tcm4TlvDq8ikWAM",  // Target voice
  stability: 0.55,                    // 0.0 - 1.0
  similarity_boost: 0.60,             // 0.0 - 1.0
  style: 0.15                         // 0.0 - 1.0
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    video_url: "https://new-voice-video.mp4",
    original_video_url: "https://original-video.mp4",
    voice_id: "21m00Tcm4TlvDq8ikWAM",
    processing_time_seconds: 45
  }
}
```

**Frontend Usage:**
```javascript
async function changeVideoVoice(videoUrl, voiceId) {
  const response = await voiceAPI.changeVoice({
    videoUrl: videoUrl,
    voiceId: voiceId,
    stability: 0.55,
    similarityBoost: 0.60,
    style: 0.15
  });
  
  return response.data.video_url;
}
```

---

## Script Enhancement Endpoints

### 3. Enhance Script with Emotions

**Add ElevenLabs emotion markers to script**

```javascript
POST /api/v1/scripts/enhance-emotions
```

**Request:**
```javascript
{
  script: "This product is amazing. It will change your life.",
  script_type: "product_demo",  // product_demo | testimonial | tutorial | sales_pitch
  tone_preference: "enthusiastic", // Optional: calm | enthusiastic | serious | friendly
  intensity: "balanced"           // subtle | balanced | dramatic
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    enhanced_script: "*excited* This product is amazing! *pause* It will change your life. *emphasized*",
    original_script: "This product is amazing. It will change your life.",
    emotions_added: [
      { emotion: "excited", position: 0 },
      { emotion: "pause", position: 35 },
      { emotion: "emphasized", position: 60 }
    ],
    reasoning: "Added excitement at product mention and emphasis on life-changing benefit"
  }
}
```

**Frontend Usage:**
```javascript
import { scriptAPI } from '../services/apiService';

async function enhanceScript(script) {
  const response = await scriptAPI.enhanceEmotions(
    script,
    'product_demo',
    'enthusiastic',
    'balanced'
  );
  
  return response.data.enhanced_script;
}
```

---

### 4. Recommend Voice for Script

**Get voice recommendations based on script analysis**

```javascript
POST /api/v1/scripts/recommend-voice
```

**Request:**
```javascript
{
  script: "Your product script...",
  avatar_image_url: "https://...",  // Optional
  avatar_description: "Professional woman",  // Optional
  limit: 10
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    recommendations: [
      {
        voice_id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        match_score: 0.92,
        reasoning: "Matches professional tone of script"
      }
    ]
  }
}
```

**Frontend Usage:**
```javascript
const response = await scriptAPI.recommendVoice(
  script,
  avatarImageUrl,
  avatarDescription,
  10
);

const topVoice = response.data.recommendations[0];
```

---

### 5. Preview Voice with Script

**Generate audio preview of voice with script**

```javascript
POST /api/v1/scripts/preview-voice
```

**Request:**
```javascript
{
  script: "This is a preview of how the voice will sound.",
  voice_id: "21m00Tcm4TlvDq8ikWAM",
  voice_stability: 0.50,
  voice_similarity: 0.60,
  voice_style: 0.75,
  model_id: "eleven_multilingual_v2"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    audio_url: "https://storage.googleapis.com/preview.mp3",
    duration: 8.5,
    voice_id: "21m00Tcm4TlvDq8ikWAM",
    text: "This is a preview..."
  }
}
```

**Frontend Usage:**
```javascript
async function previewVoice(script, voiceId) {
  const response = await scriptAPI.previewVoice(
    script,
    voiceId,
    0.50,  // stability
    0.60,  // similarity
    0.75   // style
  );
  
  const audioUrl = response.data.audio_url;
  
  // Play audio
  const audio = new Audio(audioUrl);
  audio.play();
  
  return audioUrl;
}
```

---

### 6. Get Available Emotions

**Get list of supported emotion markers**

```javascript
GET /api/v1/scripts/available-emotions
```

**Response:**
```javascript
{
  success: true,
  data: {
    emotions: [
      {
        name: "excited",
        syntax: "*excited*",
        description: "Shows excitement and enthusiasm",
        example: "*excited* This is amazing!"
      },
      {
        name: "pause",
        syntax: "*pause*",
        description: "Adds a natural pause",
        example: "Let me explain. *pause* Here's how it works."
      },
      {
        name: "emphasized",
        syntax: "*emphasized*",
        description: "Emphasizes the following words",
        example: "This is *emphasized* really important"
      }
      // ... more emotions
    ]
  }
}
```

**Frontend Usage:**
```javascript
const response = await scriptAPI.getAvailableEmotions();
const emotions = response.data.emotions;

// Display emotion picker UI
emotions.forEach(emotion => {
  console.log(`${emotion.name}: ${emotion.description}`);
});
```

---

### 7. Validate Emotion Markers

**Check if emotion markers in script are valid**

```javascript
POST /api/v1/scripts/validate-emotions
```

**Request:**
```javascript
{
  script: "*excited* This is *invalid_emotion* amazing!"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    is_valid: false,
    errors: [
      {
        position: 25,
        marker: "*invalid_emotion*",
        message: "Unknown emotion marker"
      }
    ],
    valid_markers: ["*excited*"],
    invalid_markers: ["*invalid_emotion*"]
  }
}
```

**Frontend Usage:**
```javascript
const response = await scriptAPI.validateEmotions(script);

if (!response.data.is_valid) {
  response.data.errors.forEach(error => {
    console.error(`Error at position ${error.position}: ${error.message}`);
  });
}
```

---

## Complete Voice Selection Flow

```javascript
import { useState, useEffect } from 'react';
import { voiceAPI, scriptAPI } from '../services/apiService';

function VoiceSelector({ script, avatarImage, onVoiceSelected }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  
  // Load voice recommendations
  useEffect(() => {
    loadVoiceRecommendations();
  }, [script]);
  
  async function loadVoiceRecommendations() {
    const response = await voiceAPI.getVoiceRecommendations({
      script: script,
      avatarImageUrl: avatarImage,
      limit: 10
    });
    
    setVoices(response.data.recommendations);
  }
  
  async function previewVoice(voice) {
    // Stop previous preview
    if (audioElement) {
      audioElement.pause();
    }
    
    setPreviewingVoice(voice.voice_id);
    
    try {
      // Generate preview
      const response = await scriptAPI.previewVoice(
        script.substring(0, 200), // First 200 chars
        voice.voice_id
      );
      
      // Play audio
      const audio = new Audio(response.data.audio_url);
      audio.play();
      
      audio.onended = () => {
        setPreviewingVoice(null);
      };
      
      setAudioElement(audio);
      
    } catch (error) {
      console.error('Preview failed:', error);
      setPreviewingVoice(null);
    }
  }
  
  function selectVoice(voice) {
    setSelectedVoice(voice);
    onVoiceSelected(voice);
  }
  
  return (
    <div>
      <h3>Select Voice</h3>
      
      {voices.map(voice => (
        <div
          key={voice.voice_id}
          className={selectedVoice?.voice_id === voice.voice_id ? 'selected' : ''}
        >
          <h4>{voice.name}</h4>
          <p>{voice.description}</p>
          <p>Match Score: {Math.round(voice.match_score * 100)}%</p>
          <p>{voice.reasoning}</p>
          
          <button onClick={() => previewVoice(voice)}>
            {previewingVoice === voice.voice_id ? 'Playing...' : 'Preview'}
          </button>
          
          <button onClick={() => selectVoice(voice)}>
            Select
          </button>
        </div>
      ))}
    </div>
  );
}
```

## ElevenLabs Voice Settings

### Stability
- **Low (0.0-0.3)**: More variable, expressive
- **Medium (0.4-0.6)**: Balanced
- **High (0.7-1.0)**: Consistent, predictable

### Similarity Boost
- **Low (0.0-0.3)**: More creative interpretation
- **Medium (0.4-0.6)**: Balanced
- **High (0.7-1.0)**: Closer to original voice

### Style
- Controls how much style transfer to apply
- Higher values = more stylistic interpretation

## Best Practices

1. ✅ Use voice recommendations for better matching
2. ✅ Always provide preview before final generation
3. ✅ Test emotion markers with validation endpoint
4. ✅ Keep scripts under 5000 characters for TTS
5. ✅ Use appropriate script types for better enhancement
6. ✅ Allow users to adjust voice settings
7. ✅ Cache voice previews to avoid regeneration
8. ✅ Provide fallback voices if recommendation fails
