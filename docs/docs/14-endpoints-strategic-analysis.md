# Strategic Analysis Endpoints (Modules 2-4)

## Overview

Strategic Analysis endpoints handle angle intelligence, offer diagnostic, and creative generation (Modules 2-4 of the pipeline).

**Service:** `strategicAnalysisAPI` from `src/services/strategicAnalysisService.js`

**All endpoints are JOB-BASED**

## Endpoints

### 1. Get Personas (Job-Based)

**Extract target personas from research**

```javascript
POST /api/v1/strategic-analysis/products/{brandId}/{productId}/research/{researchId}/personas-job
```

**Request:**
```javascript
{
  language: "English"  // Target language
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_personas_abc"
  }
}
```

**Job Result:**
```javascript
{
  research_id: "res_123",
  product_name: "My Product",
  personas: [
    {
      persona_id: "persona_1",
      name: "Busy Professional",
      demographics: {
        age_range: "30-45",
        gender: "any",
        income_level: "high",
        location: "Urban"
      },
      psychographics: {
        values: ["Efficiency", "Quality", "Status"],
        lifestyle: "Fast-paced, career-focused",
        pain_points: ["Limited time", "Need convenience"],
        goals: ["Career advancement", "Work-life balance"]
      },
      buying_behavior: {
        decision_factors: ["Time savings", "Quality", "Brand reputation"],
        price_sensitivity: "low",
        preferred_channels: ["Online", "Mobile"]
      },
      marketing_insights: {
        messaging_angle: "Save time without compromising quality",
        emotional_triggers: ["Achievement", "Relief", "Confidence"],
        proof_types: ["Social proof", "Authority", "Guarantees"]
      }
    }
    // ... more personas
  ]
}
```

**Frontend Usage:**
```javascript
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';

async function loadPersonas(brandId, productId, researchId, language = 'English') {
  const result = await strategicAnalysisAPI.getPersonasJob(
    brandId,
    productId,
    researchId,
    language
  );
  
  return result.personas;
}
```

---

### 2. Trigger Strategic Analysis (Job-Based)

**Run angle intelligence + offer diagnostic (Modules 2-3)**

```javascript
POST /api/v1/strategic-analysis/products/{brandId}/{productId}/research/{researchId}/analyze-job
```

**Request:**
```javascript
{
  language: "English",
  target_persona_id: "persona_1"  // Optional - targets specific persona
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_analysis_xyz"
  }
}
```

**Job Result:**
```javascript
{
  analysis_id: "analysis_abc123",
  angle_intelligence: {
    angles: [
      {
        rank: 1,
        angle_name: "Time-Saving Efficiency",
        hook: "Stop wasting 2 hours every morning on your routine",
        target_audience: "Busy professionals aged 30-45",
        emotional_appeal: "Relief and empowerment",
        pain_points_addressed: [
          "Morning rush stress",
          "Limited time for self-care"
        ],
        benefits_highlighted: [
          "5-minute routine",
          "Professional results"
        ],
        proof_elements: [
          "10,000+ 5-star reviews",
          "Featured in Forbes"
        ],
        positioning: "Premium time-saving solution",
        effectiveness_score: 9.2,
        reasoning: "Directly addresses primary pain point with strong proof"
      },
      // ... 6 more angles (ranked 2-7)
    ]
  },
  offer_diagnostic: {
    current_positioning: "Premium efficiency product",
    strengths: ["Strong social proof", "Clear value proposition"],
    weaknesses: ["Higher price point", "Limited awareness"],
    opportunities: ["Expand to new markets", "Add subscription model"],
    threats: ["Increasing competition", "Economic downturn"],
    recommended_strategy: "Focus on time-savings ROI for busy professionals"
  }
}
```

**Frontend Usage:**
```javascript
async function analyzeProduct(brandId, productId, researchId, personaId = null, language = 'English') {
  // Trigger analysis with progress tracking
  const analysis = await strategicAnalysisAPI.triggerStrategicAnalysis(
    brandId,
    productId,
    researchId,
    personaId,
    language,
    (progress) => {
      console.log(`${progress.percentage}%: ${progress.message}`);
    }
  );
  
  const angles = analysis.data.angle_intelligence.angles;
  console.log(`Generated ${angles.length} marketing angles`);
  
  return analysis;
}
```

---

### 3. Get Strategic Analysis

**Retrieve existing analysis**

```javascript
GET /api/v1/strategic-analysis/analysis/{brandId}/{productId}/{analysisId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    analysis_id: "analysis_abc123",
    status: "completed",
    angle_intelligence: {...},
    offer_diagnostic: {...},
    created_at: "2024-01-15T10:00:00Z"
  }
}
```

**Frontend Usage:**
```javascript
const analysis = await strategicAnalysisAPI.getStrategicAnalysis(
  brandId,
  productId,
  analysisId
);
```

---

### 4. Approve Angle & Generate Creatives (Job-Based)

**Select angle and generate creative variations (Modules 3-4)**

```javascript
POST /api/v1/strategic-analysis/analysis/{brandId}/{productId}/{analysisId}/approve-angle-job
```

**Request:**
```javascript
{
  angle_rank: 1,                    // 1-7 (which angle to use)
  ad_length: 40,                    // 15 | 30 | 40 | 60 seconds
  video_style: "perfect_ugc_hybrid", // perfect_ugc_hybrid | kling_only | sora_only
  awareness_level: "solution_aware", // problem_aware | solution_aware | product_aware
  campaign_objective: "conversion",  // awareness | consideration | conversion
  language: "English"
}
```

**Response (Immediate):**
```javascript
{
  success: true,
  data: {
    job_id: "job_creatives_def"
  }
}
```

**Job Result:**
```javascript
{
  creative_gen_id: "creative_gen_xyz789",
  selected_angle: {
    rank: 1,
    angle_name: "Time-Saving Efficiency",
    hook: "Stop wasting 2 hours...",
    // ... full angle data
  },
  creatives: {
    proof: {
      variation_id: "proof",
      hook: "10,000+ busy professionals already save 2 hours daily",
      script: "You know that morning rush? The stress of getting ready while the clock's ticking? We've solved it. Our 5-minute routine gives you salon-quality results in less time than your coffee brews. Over 10,000 professionals have transformed their mornings. Featured in Forbes, Vogue, and Elle. Join them.",
      cta: "Transform Your Morning Routine",
      cta_type: "action",
      emotional_driver: "Trust through social proof",
      key_message: "Proven solution used by thousands",
      target_objection: "Does it really work?",
      word_count: 54
    },
    fear: {
      variation_id: "fear",
      hook: "Still wasting 2 hours every morning?",
      script: "Every morning, the same struggle. Rush. Stress. Compromise. While others have already transformed their routine and reclaimed their time. The difference? They found a solution that actually works. Don't let another morning slip away.",
      cta: "Stop Wasting Time Today",
      cta_type: "urgency",
      emotional_driver: "FOMO and regret avoidance",
      key_message: "Missing out on better solution",
      target_objection: "I can manage with current routine",
      word_count: 48
    },
    desire: {
      variation_id: "desire",
      hook: "Imagine having 2 extra hours every morning",
      script: "Picture this: You wake up relaxed. No rush. No stress. Your routine takes 5 minutes, not 2 hours. You look professional, polished, confident. And you still have time for that coffee, that workout, that moment of peace. This isn't a dream. This is what 10,000+ professionals experience every day.",
      cta: "Start Living Better Mornings",
      cta_type: "aspiration",
      emotional_driver: "Aspiration and desire",
      key_message: "Better lifestyle awaits",
      target_objection: "I don't believe it's possible",
      word_count: 62
    }
  }
}
```

**Frontend Usage:**
```javascript
async function generateCreatives(
  brandId,
  productId,
  analysisId,
  angleRank,
  adLength = 40,
  language = 'English'
) {
  const result = await strategicAnalysisAPI.approveAngleAndGenerateCreatives(
    brandId,
    productId,
    analysisId,
    angleRank,
    adLength,
    'perfect_ugc_hybrid',
    language,
    (progress) => {
      console.log(`${progress.percentage}%: ${progress.message}`);
    }
  );
  
  const { proof, fear, desire } = result.creatives;
  
  console.log('3 creative variations generated:');
  console.log('Proof:', proof.hook);
  console.log('Fear:', fear.hook);
  console.log('Desire:', desire.hook);
  
  return result;
}
```

---

### 5. Get Creative Generation

**Retrieve existing creative generation**

```javascript
GET /api/v1/strategic-analysis/creatives/{brandId}/{productId}/{creativeGenId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    creative_gen_id: "creative_gen_xyz",
    creatives: {
      proof: {...},
      fear: {...},
      desire: {...}
    },
    selected_angle: {...}
  }
}
```

**Frontend Usage:**
```javascript
const creativeGen = await strategicAnalysisAPI.getCreativeGeneration(
  brandId,
  productId,
  creativeGenId
);

const variations = creativeGen.data.creatives;
```

---

## Complete Strategic Analysis Flow

```javascript
import { useState } from 'react';
import { strategicAnalysisAPI } from '../services/strategicAnalysisService';
import { researchAPI } from '../services/researchService';
import { useBrand } from '../contexts/BrandContext';
import { useStrategicChat, CHAT_STEPS } from '../contexts/StrategicChatContext';

function StrategicAnalysisWorkflow({ product }) {
  const { selectedBrand } = useBrand();
  const {
    setResearchSummary,
    setPersonas,
    setAnalysisId,
    setAnalysisResult,
    setCreativeGenId,
    setCreativeVariations,
    setCurrentStep,
    selectedPersona,
    selectedLanguage
  } = useStrategicChat();
  
  // Step 1: Load Research Summary
  async function loadResearch() {
    const summary = await researchAPI.getResearchSummary(
      selectedBrand.brandId,
      product.productId,
      product.research_id,
      selectedLanguage
    );
    
    setResearchSummary(summary.data.summary);
    setCurrentStep(CHAT_STEPS.SHOWING_SUMMARY);
  }
  
  // Step 2: Load Personas (Optional)
  async function loadPersonas() {
    const result = await strategicAnalysisAPI.getPersonasJob(
      selectedBrand.brandId,
      product.productId,
      product.research_id,
      selectedLanguage
    );
    
    setPersonas(result.personas);
    setCurrentStep(CHAT_STEPS.SELECTING_PERSONA);
  }
  
  // Step 3: Analyze Angles
  async function analyzeAngles() {
    setCurrentStep(CHAT_STEPS.ANALYZING_ANGLES);
    
    const analysis = await strategicAnalysisAPI.triggerStrategicAnalysis(
      selectedBrand.brandId,
      product.productId,
      product.research_id,
      selectedPersona?.persona_id,
      selectedLanguage,
      (progress) => {
        console.log(`Analyzing: ${progress.percentage}%`);
      }
    );
    
    setAnalysisId(analysis.data.analysis_id);
    setAnalysisResult(analysis.data);
    setCurrentStep(CHAT_STEPS.SHOWING_ANGLES);
  }
  
  // Step 4: Generate Creatives
  async function generateCreatives(angleRank) {
    setCurrentStep(CHAT_STEPS.GENERATING_CREATIVES);
    
    const result = await strategicAnalysisAPI.approveAngleAndGenerateCreatives(
      selectedBrand.brandId,
      product.productId,
      analysisId,
      angleRank,
      40,  // ad length
      'perfect_ugc_hybrid',
      selectedLanguage,
      (progress) => {
        console.log(`Generating creatives: ${progress.percentage}%`);
      }
    );
    
    setCreativeGenId(result.creative_gen_id);
    setCreativeVariations(result.creatives);
    setCurrentStep(CHAT_STEPS.SHOWING_CREATIVES);
  }
  
  return (
    <div>
      <button onClick={loadResearch}>1. Load Research</button>
      <button onClick={loadPersonas}>2. Load Personas (Optional)</button>
      <button onClick={analyzeAngles}>3. Analyze Angles</button>
      <button onClick={() => generateCreatives(1)}>4. Generate Creatives</button>
    </div>
  );
}
```

## Data Structures

### Angle Object
```javascript
{
  rank: 1,
  angle_name: "Time-Saving Efficiency",
  hook: "Stop wasting 2 hours every morning",
  target_audience: "Busy professionals aged 30-45",
  emotional_appeal: "Relief and empowerment",
  pain_points_addressed: ["Morning rush stress"],
  benefits_highlighted: ["5-minute routine"],
  proof_elements: ["10,000+ reviews"],
  positioning: "Premium time-saving solution",
  effectiveness_score: 9.2,
  reasoning: "Why this angle works"
}
```

### Creative Variation Object
```javascript
{
  variation_id: "proof",
  hook: "Opening hook",
  script: "Full ad script",
  cta: "Call to action",
  cta_type: "action" | "urgency" | "aspiration",
  emotional_driver: "Primary emotion",
  key_message: "Core message",
  target_objection: "What objection this addresses",
  word_count: 54
}
```

## Best Practices

1. ✅ Always complete research before analysis
2. ✅ Use personas for better targeting (optional but recommended)
3. ✅ Track progress with callbacks for long operations
4. ✅ Let users select angle (don't auto-select)
5. ✅ Generate all 3 variations (proof, fear, desire)
6. ✅ Support multiple languages
7. ✅ Store analysisId and creativeGenId for video generation
8. ✅ Handle job failures gracefully
