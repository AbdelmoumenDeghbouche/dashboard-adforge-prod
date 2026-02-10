# Strategic Analysis - Complete Flow (Modules 1-5)

## Overview

The Strategic Analysis pipeline is the **core AI-powered workflow** that transforms product research into ready-to-use video ads.

**5-Module Pipeline:**
1. **Research** - Deep product analysis
2. **Angle Intelligence** - AI-generated marketing angles
3. **Offer Diagnostic** - Positioning analysis
4. **Creative Generation** - Hook + Script + CTA variations
5. **Video Generation** - Sora/Kling video creation

## Complete Flow Diagram

```
Product Scraped
   ↓
Module 1: Research (Auto-triggered)
   ↓ Extract: pain points, benefits, proof, positioning
Research Summary
   ↓
[Optional] Select Persona
   ↓
Module 2: Angle Intelligence + Offer Diagnostic
   ↓ Generate: 7 marketing angles ranked by effectiveness
Angle Selection UI
   ↓
User Selects Angle
   ↓
[Optional] Select Platform & Ad Length
   ↓
Modules 3-4: Creative Generation
   ↓ Generate: Hooks, Scripts, CTAs for 3 variations (proof, fear, desire)
Creative Variations UI
   ↓
User Selects Creative
   ↓
Module 5: Video Generation
   ↓ Generate: Kling scenes + Sora overlay
Video Ready!
```

## State Management

### StrategicChatContext

**Location:** `src/contexts/StrategicChatContext.jsx`

Manages the entire workflow:

```javascript
import { useStrategicChat, CHAT_STEPS, MESSAGE_TYPES } from '../contexts/StrategicChatContext';

const {
  // Workflow
  currentStep,
  setCurrentStep,
  
  // Product context
  brandId,
  productId,
  researchId,
  
  // IDs from pipeline
  analysisId,
  creativeGenId,
  videoJobId,
  
  // Selected items
  selectedAngle,
  selectedCreative,
  selectedPersona,
  selectedLanguage,
  
  // Data
  researchSummary,
  personas,
  analysisResult,
  creativeVariations,
  
  // Chat
  messages,
  addMessage,
  
  // Actions
  initializeChat,
  reset
} = useStrategicChat();
```

### Workflow Steps

```javascript
export const CHAT_STEPS = {
  WAITING_FOR_RESEARCH: 'waiting_for_research',
  SHOWING_SUMMARY: 'showing_summary',
  SELECTING_PERSONA: 'selecting_persona',
  ANALYZING_ANGLES: 'analyzing_angles',
  SHOWING_ANGLES: 'showing_angles',
  GENERATING_CREATIVES: 'generating_creatives',
  SHOWING_CREATIVES: 'showing_creatives',
  GENERATING_VIDEO: 'generating_video',
  VIDEO_READY: 'video_ready',
};
```

## Services

Three specialized services handle different modules:

1. **researchService.js** - Module 1 (Research)
2. **strategicAnalysisService.js** - Modules 2-4 (Analysis + Creatives)
3. **apiService.js** - Module 5 (Video Generation)

## Implementation Guide

### Step 1: Initialize Chat

```javascript
import { useStrategicChat } from '../contexts/StrategicChatContext';

function StrategicAnalysisPage() {
  const { initializeChat } = useStrategicChat();
  const { selectedBrand } = useBrand();
  
  useEffect(() => {
    if (selectedBrand && product && product.research_id) {
      // Initialize chat with product context
      initializeChat(
        selectedBrand.brandId,
        product.productId,
        product.research_id
      );
    }
  }, [selectedBrand, product]);
}
```

### Step 2: Load Research Summary

```javascript
import { researchAPI } from '../services/researchService';
import { useStrategicChat, CHAT_STEPS, MESSAGE_TYPES } from '../contexts/StrategicChatContext';

async function loadResearchSummary() {
  const {
    brandId,
    productId,
    researchId,
    selectedLanguage,
    setResearchSummary,
    setCurrentStep,
    addMessage
  } = useStrategicChat();
  
  try {
    // Fetch summary (smart endpoint - returns cache or creates job)
    const summary = await researchAPI.getResearchSummary(
      brandId,
      productId,
      researchId,
      selectedLanguage
    );
    
    setResearchSummary(summary);
    
    // Show summary in chat
    addMessage({
      type: MESSAGE_TYPES.RESEARCH_SUMMARY,
      sender: 'agent',
      content: 'Here\'s what I found about your product:',
      data: summary
    });
    
    setCurrentStep(CHAT_STEPS.SHOWING_SUMMARY);
    
  } catch (error) {
    console.error('Failed to load research:', error);
  }
}
```

### Step 3: Load Personas (Optional)

```javascript
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';

async function loadPersonas() {
  const { brandId, productId, researchId, selectedLanguage } = useStrategicChat();
  
  const personasData = await strategicAnalysisAPI.getPersonasJob(
    brandId,
    productId,
    researchId,
    selectedLanguage
  );
  
  setPersonas(personasData.personas);
  
  // Show persona selector
  addMessage({
    type: MESSAGE_TYPES.PERSONA_SELECTOR,
    sender: 'agent',
    content: 'Who is your target audience?',
    data: { personas: personasData.personas }
  });
  
  setCurrentStep(CHAT_STEPS.SELECTING_PERSONA);
}
```

### Step 4: Trigger Strategic Analysis

```javascript
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';

async function analyzeAngles() {
  const {
    brandId,
    productId,
    researchId,
    selectedPersona,
    selectedLanguage,
    setAnalysisId,
    setAnalysisResult,
    setCurrentStep
  } = useStrategicChat();
  
  try {
    setCurrentStep(CHAT_STEPS.ANALYZING_ANGLES);
    
    // Trigger analysis (Modules 1 + 2)
    const analysis = await strategicAnalysisAPI.triggerStrategicAnalysis(
      brandId,
      productId,
      researchId,
      selectedPersona?.persona_id || null,  // Optional persona targeting
      selectedLanguage,
      (progress) => {
        console.log(`Analysis: ${progress.percentage}%`);
      }
    );
    
    setAnalysisId(analysis.data.analysis_id);
    setAnalysisResult(analysis.data);
    
    // Show angles
    addMessage({
      type: MESSAGE_TYPES.ANGLES,
      sender: 'agent',
      content: 'I\'ve identified the best marketing angles for your product:',
      data: {
        angles: analysis.data.angle_intelligence.angles
      }
    });
    
    setCurrentStep(CHAT_STEPS.SHOWING_ANGLES);
    
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}
```

### Step 5: Generate Creatives

```javascript
async function generateCreatives(angleRank, adLength = 40) {
  const {
    brandId,
    productId,
    analysisId,
    selectedLanguage,
    setCreativeGenId,
    setCreativeVariations,
    setCurrentStep
  } = useStrategicChat();
  
  try {
    setCurrentStep(CHAT_STEPS.GENERATING_CREATIVES);
    
    // Approve angle and generate creatives (Modules 3-4)
    const creatives = await strategicAnalysisAPI.approveAngleAndGenerateCreatives(
      brandId,
      productId,
      analysisId,
      angleRank,       // 1-7
      adLength,        // 15, 30, 40, 60 seconds
      'perfect_ugc_hybrid',  // video_style
      selectedLanguage,
      (progress) => {
        console.log(`Creatives: ${progress.percentage}%`);
      }
    );
    
    setCreativeGenId(creatives.creative_gen_id);
    setCreativeVariations(creatives.creatives);
    
    // Show creatives
    addMessage({
      type: MESSAGE_TYPES.CREATIVES,
      sender: 'agent',
      content: 'Here are 3 creative variations:',
      data: {
        variations: creatives.creatives
      }
    });
    
    setCurrentStep(CHAT_STEPS.SHOWING_CREATIVES);
    
  } catch (error) {
    console.error('Creative generation failed:', error);
  }
}
```

### Step 6: Generate Video

```javascript
async function generateVideo(creativeGenId, variationId) {
  const {
    brandId,
    productId,
    setVideoJobId,
    setCurrentStep
  } = useStrategicChat();
  
  try {
    setCurrentStep(CHAT_STEPS.GENERATING_VIDEO);
    
    // Trigger video generation (Module 5)
    const response = await strategicAnalysisAPI.generateVideo(
      brandId,
      productId,
      creativeGenId,
      variationId,  // 'proof' | 'fear' | 'desire'
      'perfect_ugc_hybrid'
    );
    
    const jobId = response.job_id;
    setVideoJobId(jobId);
    
    // Poll for video completion
    const result = await pollJobStatus(
      jobId,
      (progress) => {
        console.log(`Video: ${progress.percentage}% - ${progress.message}`);
      },
      10000,  // Poll every 10 seconds
      270     // Max 45 minutes (270 * 10s)
    );
    
    // Video ready!
    addMessage({
      type: MESSAGE_TYPES.VIDEO,
      sender: 'agent',
      content: 'Your video is ready!',
      data: {
        video_url: result.video_url,
        thumbnail_url: result.thumbnail_url
      }
    });
    
    setCurrentStep(CHAT_STEPS.VIDEO_READY);
    
  } catch (error) {
    console.error('Video generation failed:', error);
  }
}
```

## Chat UI Pattern

### Message Rendering

```javascript
function ChatMessages({ messages }) {
  return (
    <div className="chat-container">
      {messages.map(message => {
        switch (message.type) {
          case MESSAGE_TYPES.RESEARCH_SUMMARY:
            return <ResearchSummaryCard key={message.id} data={message.data} />;
          
          case MESSAGE_TYPES.PERSONA_SELECTOR:
            return <PersonaSelector key={message.id} personas={message.data.personas} />;
          
          case MESSAGE_TYPES.ANGLES:
            return <AngleCards key={message.id} angles={message.data.angles} />;
          
          case MESSAGE_TYPES.CREATIVES:
            return <CreativeCards key={message.id} variations={message.data.variations} />;
          
          case MESSAGE_TYPES.VIDEO:
            return <VideoPlayer key={message.id} videoUrl={message.data.video_url} />;
          
          default:
            return <TextMessage key={message.id} content={message.content} />;
        }
      })}
    </div>
  );
}
```

## Time Estimates

| Stage | Duration | Notes |
|-------|----------|-------|
| Research | 3-8 minutes | Auto-triggered on scraping |
| Personas extraction | 2-5 minutes | Optional, job-based |
| Angle Analysis | 5-15 minutes | AI analysis |
| Creative Generation | 10-20 minutes | 3 variations |
| Video Generation | 5-45 minutes | Depends on format |

**Total:** 25-90 minutes for complete pipeline

## Progress Tracking

All stages provide real-time progress:

```javascript
{
  percentage: 45,
  current_step: "Analyzing competitor positioning...",
  estimated_time_remaining: 180  // seconds
}
```

## Language Support

Entire pipeline supports multi-language:

```javascript
selectedLanguage: 'English' | 'French' | 'Spanish' | 'German' | ...
```

All AI-generated content (angles, scripts, CTAs) translated to target language.

## See Also

- [13-endpoints-research.md](./13-endpoints-research.md) - Module 1
- [14-endpoints-strategic-analysis.md](./14-endpoints-strategic-analysis.md) - Modules 2-4
- [15-endpoints-video-generation.md](./15-endpoints-video-generation.md) - Module 5
