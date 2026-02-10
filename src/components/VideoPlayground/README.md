# Video Playground Components

## Overview

The Video Playground is a feature that allows users to generate UGC-style videos directly from a simple text prompt and reference image. The system uses Claude AI to enhance user prompts and either OpenAI Sora or KIE to generate professional video content.

## Components

### 1. ImageUpload

Handles image upload with drag & drop functionality.

**Features:**
- Drag and drop support
- File validation (max 10MB, PNG/JPG/WEBP only)
- Upload progress indicator
- Firebase Storage integration
- Real-time preview

**Props:**
- `imageUrl` (string): Current image URL
- `setImageUrl` (function): Callback to update image URL
- `disabled` (boolean): Disable upload controls

### 2. PromptInput

Text area component for video description with character validation.

**Features:**
- Character counter (10-2000 characters)
- Real-time validation
- Visual feedback (valid/invalid/warning states)
- Helpful tips for users

**Props:**
- `prompt` (string): Current prompt text
- `setPrompt` (function): Callback to update prompt
- `disabled` (boolean): Disable input

### 3. OptionsPanel

Video configuration panel with multiple settings.

**Features:**
- Aspect ratio selection (9:16, 16:9, 1:1)
- Platform selection (TikTok, Snapchat, Facebook, YouTube)
- Provider selection (OpenAI Sora, KIE)
- Duration slider (4-12s for OpenAI, 10-15s for KIE)
- Cost display (1000 credits per video)

**Props:**
- `options` (object): Current video options
  - `aspect_ratio` (string)
  - `platform` (string)
  - `duration` (number)
  - `provider` (string)
- `setOptions` (function): Callback to update options
- `disabled` (boolean): Disable all controls

### 4. ProgressTracker

Displays real-time generation progress with job status polling.

**Features:**
- Status indicators (queued, processing, completed, failed)
- Progress bar with percentage
- Current step display
- Estimated time remaining
- Contextual messages for each status

**Props:**
- `status` (string): Job status ('queued', 'processing', 'completed', 'failed')
- `progress` (number): Progress percentage (0-100)
- `currentStep` (string): Human-readable current step
- `estimatedTime` (number): Estimated time remaining in seconds

### 5. EnhancedPromptDisplay

Shows the AI-enhanced prompt with comparison to original.

**Features:**
- Original vs enhanced prompt comparison
- Expandable long prompts
- Copy to clipboard functionality
- Visual distinction with gradient styling

**Props:**
- `originalPrompt` (string): User's original prompt
- `enhancedPrompt` (string): Claude-enhanced prompt

### 6. VideoPlayer

Video player with download and sharing capabilities.

**Features:**
- Native HTML5 video player
- Video information display (duration, aspect ratio, platform, provider)
- Download functionality
- Share functionality (native share API or copy link)
- Copy video URL
- Generate another video button

**Props:**
- `videoUrl` (string): Firebase Storage video URL
- `videoData` (object): Video metadata
  - `duration` (number)
  - `aspect_ratio` (string)
  - `platform` (string)
  - `provider` (string)
- `onGenerateAnother` (function): Callback to reset and generate another video

## Parent Component: VideoPlayground

The main page component located at `/playground` that orchestrates all child components.

### State Management

**Form State:**
- `imageUrl`: Firebase Storage URL of uploaded image
- `prompt`: User's video description
- `options`: Video configuration object

**Generation State:**
- `generationState`: Current workflow state
  - `'idle'`: Ready for input
  - `'enhancing'`: Claude is enhancing the prompt
  - `'generating'`: Video generation in progress
  - `'completed'`: Video ready
  - `'failed'`: Generation failed
- `jobId`: Backend job ID for polling
- `enhancedPrompt`: Claude-enhanced prompt text
- `videoUrl`: Generated video URL
- `videoData`: Video metadata

**Job Status:**
- `jobStatus`: Full job status object from API
- `progress`: Current progress percentage
- `currentStep`: Current processing step

**Credits:**
- `credits`: User's available credits
- `showInsufficientCreditsModal`: Modal visibility state

### API Integration

**Endpoints Used:**

1. **Generate Video**
   - `POST /api/v1/video-playground/playground/generate-video`
   - Payload: `{ prompt, image_url, aspect_ratio, platform, duration, provider }`
   - Response: `{ job_id, enhanced_prompt, credits_remaining }`

2. **Poll Job Status**
   - `GET /api/v1/video-chat/video-jobs/{jobId}`
   - Response: `{ status, progress_percentage, current_step, result_data }`

3. **Get Credits**
   - `GET /api/v1/subscriptions/subscription`
   - Response: `{ credits }`

### Polling Strategy

- Poll every **5 seconds** after job submission
- Continue until status is `'completed'` or `'failed'`
- Clean up interval on component unmount
- Display real-time progress updates

### Credit System

- **Cost**: 1000 credits per video
- Check credits before submission
- Show InsufficientCreditsModal if credits < 1000
- Update credits after successful submission
- Refund credits on failure

## User Flow

1. **Upload Image** → User uploads or drags reference image
2. **Write Prompt** → User describes desired video (10-2000 chars)
3. **Configure Options** → Select aspect ratio, platform, duration, provider
4. **Generate** → Click generate button
5. **Claude Enhancement** → Loading state while prompt is enhanced
6. **Show Enhanced Prompt** → Display comparison of original vs enhanced
7. **Video Generation** → Progress tracker with real-time updates
8. **Video Ready** → Player with download and share options
9. **Generate Another** → Reset form and start over

## Error Handling

### Insufficient Credits
- Show modal with option to buy more credits
- Prevent form submission

### Network Errors
- Display error message
- Allow retry

### Generation Failures
- Show error in ProgressTracker
- Refund credits automatically
- Allow user to try again

### Validation Errors
- Image: Max 10MB, PNG/JPG/WEBP only
- Prompt: Min 10 chars, max 2000 chars
- All fields required

## Styling

Built with Tailwind CSS using the app's dark theme:
- Background: `#0F0F0F` (primary), `#1A1A1A` (secondary)
- Borders: `#262626`
- Accent: Purple gradient (`purple-600` to `pink-600`)
- Success: Green (`green-400`)
- Error: Red (`red-400`)
- Warning: Yellow (`yellow-400`)

## Dependencies

- React 19.1.1
- React Router v7.9.1
- Firebase 12.4.0 (Storage)
- Axios 1.12.2 (API calls)
- Tailwind CSS 4.1.13

## Testing Checklist

- [ ] Image upload (drag & drop, click, validation)
- [ ] Prompt validation (min/max length)
- [ ] Options selection (all combinations)
- [ ] Credits check (sufficient/insufficient)
- [ ] Form submission
- [ ] Progress polling
- [ ] Video playback
- [ ] Download functionality
- [ ] Share functionality
- [ ] Generate another
- [ ] Error states
- [ ] Mobile responsiveness
- [ ] Browser back button handling
- [ ] Component cleanup on unmount

## Future Enhancements

- WebSocket/SSE for real-time updates instead of polling
- Video history/library
- Advanced editing options
- Batch video generation
- Template library
- A/B testing features
- Analytics dashboard for generated videos

