# Research Endpoints (Module 1)

## Overview

Research endpoints handle deep product analysis - extracting pain points, benefits, proof elements, positioning, and target personas.

**Service:** `researchAPI` from `src/services/researchService.js`

**Auto-triggered** after product scraping completes.

## Endpoints

### 1. Get Research Details

**Get research record status and metadata**

```javascript
GET /api/v1/research/products/{brandId}/{productId}/research/{researchId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    research_id: "res_abc123",
    product_id: "prod_456",
    brand_id: "brand_123",
    product_name: "My Product",
    status: "completed",  // pending | processing | completed | failed
    created_at: "2024-01-15T10:00:00Z",
    completed_at: "2024-01-15T10:08:00Z",
    
    // Metadata
    sources_scraped: 12,
    ai_model_used: "claude-3-5-sonnet"
  }
}
```

**Frontend Usage:**
```javascript
import { researchAPI } from '../services/researchService';

const research = await researchAPI.getResearchDetails(
  brandId,
  productId,
  researchId
);

console.log('Status:', research.data.status);
```

---

### 2. Get Research Summary (Smart Endpoint)

**Get human-readable research summary**

**⚠️ SMART ENDPOINT:** Returns cached data OR creates job if not cached

```javascript
GET /api/v1/research/products/{brandId}/{productId}/research/{researchId}/summary?language={language}
```

**Query Params:**
```javascript
{
  language: "English"  // English | French | Spanish | German | ...
}
```

**Response (Cached):**
```javascript
{
  success: true,
  data: {
    research_id: "res_abc123",
    product_name: "My Product",
    summary: {
      // Core Research Data
      pain_points: [
        {
          pain: "Customers struggle with long shipping times",
          severity: "high",
          frequency: "very_common",
          proof: "Mentioned in 15 of 20 reviews"
        }
      ],
      
      benefits: [
        {
          benefit: "Free 2-day shipping",
          value_proposition: "Save time and get products faster",
          proof_type: "guarantee",
          proof_strength: "strong"
        }
      ],
      
      proof_elements: [
        {
          type: "social_proof",
          content: "10,000+ 5-star reviews",
          credibility: "high",
          source: "Trustpilot"
        },
        {
          type: "authority",
          content: "Featured in Forbes",
          credibility: "very_high"
        }
      ],
      
      positioning: {
        category: "Premium Home Decor",
        price_tier: "mid_to_high",
        unique_selling_points: [
          "Handcrafted in Italy",
          "Lifetime warranty"
        ],
        competitor_comparison: {
          strengths: ["Quality", "Design"],
          weaknesses: ["Price", "Availability"]
        }
      },
      
      target_audience: {
        demographics: {
          age_range: "25-45",
          income_level: "middle_to_high",
          gender: "primarily_female"
        },
        psychographics: {
          values: ["Quality", "Sustainability"],
          lifestyle: "Home-focused, design-conscious"
        }
      },
      
      // Content Analysis
      brand_voice: "Professional yet friendly",
      emotional_triggers: ["Trust", "Aspiration", "FOMO"],
      
      // Competitive Intelligence
      market_insights: "Growing demand for sustainable home goods",
      seasonal_trends: "Peak season: Q4 (holiday gifting)"
    }
  }
}
```

**Response (Job Created):**
```javascript
{
  success: true,
  job_id: "job_summary_xyz",
  status: "processing"
}
```

**Frontend Usage (Handles Both Cases):**
```javascript
import { researchAPI } from '../services/researchService';

async function loadResearchSummary(brandId, productId, researchId, language = 'English') {
  try {
    // Smart endpoint - returns immediately if cached, or polls job
    const summary = await researchAPI.getResearchSummary(
      brandId,
      productId,
      researchId,
      language
    );
    
    // summary.data.summary contains the research data
    console.log('Pain points:', summary.data.summary.pain_points);
    console.log('Benefits:', summary.data.summary.benefits);
    
    return summary;
  } catch (error) {
    console.error('Failed to load summary:', error);
    throw error;
  }
}
```

---

### 3. Trigger Research (Manual)

**Manually trigger research for a product**

Usually auto-triggered by scraping, but can be manually triggered if needed.

```javascript
POST /api/v1/research/products/{brandId}/{productId}/research/trigger
```

**Request:**
```javascript
{}  // Empty body
```

**Response:**
```javascript
{
  success: true,
  data: {
    research_id: "res_new_456",
    status: "queued",
    product_id: "prod_456",
    estimated_completion: "2024-01-15T10:08:00Z"
  }
}
```

**Frontend Usage:**
```javascript
const response = await researchAPI.triggerResearch(brandId, productId);
const researchId = response.data.research_id;

// Poll for completion...
```

---

### 4. Get Products with Research Status

**Get all products with their research status**

```javascript
GET /api/v1/brands/{brandId}/products?include_research_status=true
```

**Response:**
```javascript
{
  success: true,
  data: {
    products: [
      {
        productId: "prod_456",
        productName: "Product 1",
        imageUrl: "https://...",
        
        // Research status
        research_status: "completed",  // pending | processing | completed | failed | null
        research_id: "res_abc123",
        research_completed_at: "2024-01-15T10:08:00Z"
      },
      {
        productId: "prod_789",
        productName: "Product 2",
        research_status: "processing",
        research_id: "res_def456",
        research_completed_at: null
      }
    ],
    count: 2
  }
}
```

**Frontend Usage:**
```javascript
import { researchAPI } from '../services/researchService';

const response = await researchAPI.getProductsWithResearch(brandId);

// Filter only products with completed research
const readyProducts = response.data.products.filter(
  p => p.research_status === 'completed'
);
```

---

## Research Summary Structure

### Pain Points
```javascript
{
  pain: "Customer complaint or problem",
  severity: "low" | "medium" | "high" | "critical",
  frequency: "rare" | "uncommon" | "common" | "very_common",
  proof: "Evidence from reviews/research"
}
```

### Benefits
```javascript
{
  benefit: "Product benefit",
  value_proposition: "How it delivers value",
  proof_type: "guarantee" | "testimonial" | "data" | "demonstration",
  proof_strength: "weak" | "moderate" | "strong" | "very_strong"
}
```

### Proof Elements
```javascript
{
  type: "social_proof" | "authority" | "scarcity" | "guarantee" | "data",
  content: "Specific proof statement",
  credibility: "low" | "medium" | "high" | "very_high",
  source: "Where proof came from"
}
```

## Complete Research Integration

```javascript
import { useState, useEffect } from 'react';
import { researchAPI } from '../services/researchService';
import { useBrand } from '../contexts/BrandContext';

function ProductResearchDashboard({ product }) {
  const { selectedBrand } = useBrand();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (product.research_id) {
      loadResearch();
    }
  }, [product]);
  
  async function loadResearch() {
    setLoading(true);
    try {
      const summary = await researchAPI.getResearchSummary(
        selectedBrand.brandId,
        product.productId,
        product.research_id,
        'English'
      );
      
      setResearch(summary.data.summary);
    } catch (error) {
      console.error('Failed to load research:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) return <LoadingSpinner />;
  if (!research) return <div>No research available</div>;
  
  return (
    <div>
      <h2>Research Summary: {product.productName}</h2>
      
      {/* Pain Points */}
      <section>
        <h3>Pain Points</h3>
        {research.pain_points.map((pain, i) => (
          <div key={i}>
            <strong>{pain.pain}</strong>
            <span>Severity: {pain.severity}</span>
            <span>Frequency: {pain.frequency}</span>
            <p>{pain.proof}</p>
          </div>
        ))}
      </section>
      
      {/* Benefits */}
      <section>
        <h3>Benefits</h3>
        {research.benefits.map((benefit, i) => (
          <div key={i}>
            <strong>{benefit.benefit}</strong>
            <p>{benefit.value_proposition}</p>
            <span>Proof: {benefit.proof_type} ({benefit.proof_strength})</span>
          </div>
        ))}
      </section>
      
      {/* Proof Elements */}
      <section>
        <h3>Proof Elements</h3>
        {research.proof_elements.map((proof, i) => (
          <div key={i}>
            <span>{proof.type}</span>
            <strong>{proof.content}</strong>
            <span>Credibility: {proof.credibility}</span>
            {proof.source && <span>Source: {proof.source}</span>}
          </div>
        ))}
      </section>
      
      {/* Positioning */}
      <section>
        <h3>Positioning</h3>
        <p>Category: {research.positioning.category}</p>
        <p>Price Tier: {research.positioning.price_tier}</p>
        <ul>
          {research.positioning.unique_selling_points.map((usp, i) => (
            <li key={i}>{usp}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

## Best Practices

1. ✅ Always check `research_status === 'completed'` before using research
2. ✅ Handle job polling for summary generation (first request)
3. ✅ Cache summary data in state to avoid re-fetching
4. ✅ Support multiple languages via `language` parameter
5. ✅ Show research status badges on product cards
6. ✅ Allow manual research trigger if auto-trigger failed
7. ✅ Display research data in user-friendly format
8. ✅ Use research data to inform strategic analysis decisions
