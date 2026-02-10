# Strategic Analysis Chat Interface - Testing Guide

## 🧪 Phase 13: Integration Testing Checklist

This guide will help you manually test all features of the Strategic Analysis Chat Interface.

---

## Prerequisites

### 1. **Start Backend Server**
```bash
cd adforge-server-api
python -m uvicorn main:app --reload
```
Ensure all endpoints are accessible at `http://localhost:8000`

### 2. **Start Frontend Development Server**
```bash
cd Client-Dashboard
npm run dev
```
Access at `http://localhost:5173`

### 3. **Test Data Requirements**
- At least 3 products in database
- At least 1 product with `research.status = 'completed'`
- At least 1 product with `research.status = 'processing'`
- Valid brand with products

---

## Test Cases

### ✅ Test 1: Product Selection with Research Status Badges

**Steps:**
1. Navigate to `/strategic-analysis`
2. Observe product grid

**Expected Results:**
- [ ] Products display with research status badges
- [ ] Badge colors:
  - Gray (🟡) = `not_started`
  - Blue (🔵) = `processing`
  - Green (🟢) = `completed`
  - Red (🔴) = `failed`
- [ ] Badge is in top-left corner of product image
- [ ] Hover effects work on product cards

**Screenshot Location:** `tests/screenshots/test-1-product-grid.png`

---

### ✅ Test 2: Research Polling Animation

**Steps:**
1. Select a product with `research.status = 'processing'`
2. Wait for chat to open
3. Observe loading animation

**Expected Results:**
- [ ] Agent avatar (🤖) with pulsing rings
- [ ] 5 rotating steps (every 3 seconds):
  - 📊 Analyzing market trends
  - 💔 Extracting customer pain points
  - 🔍 Identifying competitor gaps
  - 👥 Building customer personas
  - 💡 Generating strategic insights
- [ ] Progress bar animates smoothly
- [ ] Progress dots at bottom highlight current step
- [ ] Blue info box with helpful tip displays

**Duration:** 3-5 minutes (watch for at least 2 step rotations)

---

### ✅ Test 3: Research Summary Display

**Steps:**
1. Select a product with `research.status = 'completed'`
2. Wait for summary to load
3. Expand each collapsible section

**Expected Results:**
- [ ] Summary card displays with 📊 icon
- [ ] 4 collapsible sections:
  - 💔 Key Pain Points (red theme)
  - ✨ Top Desires (purple theme)
  - 📊 Market Insights (blue theme)
  - 🎯 Competitive Gaps (green theme)
- [ ] Each section shows item count badge
- [ ] Customer Profile (blue box) always visible with:
  - Age range
  - Primary motivation
  - Core frustration
- [ ] Offer Highlights (purple box) displays:
  - Unique mechanism
  - Key differentiator
  - Pricing position
- [ ] "Analyze Marketing Angles" button is visible and clickable

**Screenshot Location:** `tests/screenshots/test-3-research-summary.png`

---

### ✅ Test 4: Strategic Analysis Trigger + Polling

**Steps:**
1. From research summary, click "Analyze Marketing Angles"
2. Observe polling progress
3. Wait for analysis to complete

**Expected Results:**
- [ ] User message displays: "Let's analyze the marketing angles"
- [ ] Agent message: "Analyzing marketing angles... This will take 2-3 minutes."
- [ ] Status bar shows "Analyzing marketing angles..." with animated purple dot
- [ ] Polling occurs every 5 seconds (check Network tab)
- [ ] Chat auto-scrolls as messages appear

**Duration:** 2-3 minutes

**Network Tab Check:**
- [ ] Requests to `/api/v1/analysis/status/{analysisId}` every 5 seconds
- [ ] Status codes: 200 OK
- [ ] Response includes: `{ status: 'processing', progress: {...} }`

---

### ✅ Test 5: Angle Display (5-7 Cards)

**Steps:**
1. After analysis completes, observe angle cards
2. Expand rationale section on at least 2 cards
3. Check all score displays

**Expected Results:**
- [ ] 5-7 AngleCards display in vertical list
- [ ] Each card shows:
  - Rank badge (e.g., "Angle #1")
  - Awareness level tag (blue)
  - Overall score badge (purple with star icon)
  - Angle name and description
  - 3 colored score boxes:
    - Urgency (orange)
    - Believability (green)
    - Differentiation (purple)
  - Collapsible rationale section
  - "Select This Angle" button (purple gradient)
- [ ] Hover effects work on cards (border turns purple)
- [ ] Rationale expands/collapses on click
- [ ] Scores use color coding:
  - ≥8 = green
  - 6-7.9 = yellow
  - <6 = orange

**Screenshot Location:** `tests/screenshots/test-5-angle-cards.png`

---

### ✅ Test 6: Angle Selection → Creative Generation

**Steps:**
1. Click "Select This Angle" on any angle card
2. Observe transition to creatives

**Expected Results:**
- [ ] User message: "I'll go with Angle #X: [angle_name]"
- [ ] Agent message: "Generating creative variations for this angle..."
- [ ] Status bar shows "Generating creative variations..."
- [ ] Creative cards appear quickly (should be immediate, <2 seconds)
- [ ] API call to `/api/v1/analysis/approve-angle` completes successfully

**Network Tab Check:**
- [ ] POST request with payload: `{ angle_rank, ad_length: 40 }`
- [ ] Response includes: `{ creative_gen_id, creatives: {...} }`

---

### ✅ Test 7: Creative Cards (Proof, Fear, Desire)

**Steps:**
1. Observe 3 creative cards in grid layout
2. Read content of each variation
3. Compare scores

**Expected Results:**
- [ ] 3 cards in responsive grid (1 col mobile, 3 cols desktop)
- [ ] Each card shows:
  - **Proof Variation** (📊 Social Proof, blue gradient):
    - Hook text (2 lines max)
    - Script preview (4 lines max)
    - CTA in gray box
    - Visual direction (purple box)
    - 4 scores: Hook, Mechanism, Believability, CTA
    - "Generate Video" button (blue gradient)
  - **Fear Variation** (⚠️ Loss Aversion, orange gradient):
    - Same structure as Proof
    - "Generate Video" button (orange-red gradient)
  - **Desire Variation** (✨ Aspiration, purple gradient):
    - Same structure as Proof
    - "Generate Video" button (purple-pink gradient)
- [ ] All scores display with color coding
- [ ] Cards have equal height
- [ ] Hover effects work

**Screenshot Location:** `tests/screenshots/test-7-creative-cards.png`

---

### ✅ Test 8: Video Generation + Polling (5-10 min)

**Steps:**
1. Click "Generate Video" on any creative card
2. Monitor polling progress
3. Wait for video to complete

**Expected Results:**
- [ ] User message: "Generate video with [variation] variation"
- [ ] Agent message: "Generating your video... This will take 5-10 minutes. I'll show you the progress."
- [ ] Status bar shows:
  - "Generating your video..." with animated dot
  - Progress percentage updates (0% → 100%)
  - Current step message updates (e.g., "Analyzing script...", "Generating video...")
- [ ] Polling occurs every 10 seconds (check Network tab)
- [ ] No UI freezing or performance issues

**Duration:** 5-10 minutes

**Network Tab Check:**
- [ ] POST `/api/v1/video/generate` with:
  - `creative_gen_id`
  - `variation_id`
  - `video_style: "perfect_ugc_hybrid"` ⚠️
  - `ai_model: "claude"` ⚠️
- [ ] GET `/api/v1/video/status/{jobId}` every 10 seconds
- [ ] Response includes: `{ status, progress: { percentage, current_step } }`

**Console Check:**
- [ ] No errors related to video generation
- [ ] Progress updates logged correctly

---

### ✅ Test 9: Video Preview + Download

**Steps:**
1. After video generation completes, observe video preview
2. Play video
3. Test download button
4. Test share button

**Expected Results:**
- [ ] Video preview card displays with:
  - 🎬 icon with bounce animation
  - "Your Video is Ready!" title with sparkles
  - Video metadata (style, duration, scenes)
  - HTML5 video player with controls
  - 3 info boxes (Style, Duration, Scenes)
  - "Download Video" button (purple gradient)
  - "Share" button (gray)
  - "Generate Another Video" link
  - Green success message box
- [ ] Video plays in player
- [ ] Video controls work (play, pause, seek, volume)
- [ ] Download button triggers file download
- [ ] Share button copies link to clipboard (or shows native share)

**Screenshot Location:** `tests/screenshots/test-9-video-ready.png`

---

### ✅ Test 10: Error Scenarios

#### A. Research Failed
**Steps:**
1. Simulate research failure (backend returns `status: 'failed'`)
2. Observe error display

**Expected Results:**
- [ ] Red error message box displays
- [ ] Message: "Research failed to complete..."
- [ ] "Retry" button is visible
- [ ] Clicking retry reloads the page

#### B. Analysis Failed
**Steps:**
1. Simulate analysis failure during polling
2. Observe error display

**Expected Results:**
- [ ] Agent message with red error box
- [ ] Message: "Failed to analyze marketing angles..."
- [ ] "Retry" button triggers new analysis
- [ ] Chat stays functional

#### C. Video Generation Failed
**Steps:**
1. Simulate video generation failure
2. Observe error display

**Expected Results:**
- [ ] Agent message with red error box
- [ ] Message: "Video generation failed..."
- [ ] "Retry" button navigates back to creative selection
- [ ] User can select different creative

---

### ✅ Test 11: Mobile Responsive Layout

**Steps:**
1. Open DevTools and switch to mobile view (375px width)
2. Test all screens at different breakpoints:
   - 375px (small phone)
   - 640px (tablet)
   - 1024px (laptop)
   - 1920px (desktop)

**Expected Results:**
- [ ] Product grid adjusts:
  - 1 column at 375px
  - 2 columns at 640px
  - 3 columns at 1024px
  - 4 columns at 1280px
- [ ] Chat container is full-width on mobile
- [ ] Angle cards stack vertically on mobile
- [ ] Creative cards:
  - 1 column on mobile
  - 3 columns on desktop
- [ ] All text is readable
- [ ] Buttons are tap-friendly (min 44px)
- [ ] No horizontal scrolling

**Screenshot Location:** `tests/screenshots/test-11-mobile-*.png`

---

### ✅ Test 12: Multiple Products and Brands

**Steps:**
1. Test with 3 different products
2. Test with 2 different brands
3. Test back navigation

**Expected Results:**
- [ ] Can select different products without issues
- [ ] Research status persists correctly
- [ ] Brand selector works
- [ ] Back button returns to product list
- [ ] Chat state resets when selecting new product
- [ ] No memory leaks (check Performance tab)

---

## Performance Checklist

### Browser Performance:
- [ ] No console errors
- [ ] No console warnings (or only expected warnings)
- [ ] Memory usage stable (no leaks)
- [ ] Smooth animations (60fps)
- [ ] Fast initial load (<3 seconds)

### Network Performance:
- [ ] Polling doesn't overwhelm network
- [ ] API responses are cached where appropriate
- [ ] Images load efficiently
- [ ] Video streaming works smoothly

---

## Accessibility Checklist

- [ ] All buttons have accessible labels
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader friendly (test with NVDA/JAWS)

---

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Bug Report Template

If you find issues, use this format:

```markdown
## Bug: [Short Description]

**Test Case:** #X - [Test Name]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshot/Video:**


**Console Errors:**
```


**Environment:**
- Browser: 
- OS: 
- Screen Size: 
```

---

## Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Product Selection | ⬜ | |
| 2 | Research Polling | ⬜ | |
| 3 | Research Summary | ⬜ | |
| 4 | Analysis Trigger | ⬜ | |
| 5 | Angle Display | ⬜ | |
| 6 | Angle Selection | ⬜ | |
| 7 | Creative Cards | ⬜ | |
| 8 | Video Generation | ⬜ | |
| 9 | Video Preview | ⬜ | |
| 10 | Error Handling | ⬜ | |
| 11 | Mobile Responsive | ⬜ | |
| 12 | Multiple Products | ⬜ | |

Legend: ✅ Pass | ❌ Fail | ⬜ Not Tested

---

## 🎯 Success Criteria

All tests pass when:
- ✅ No blocking bugs
- ✅ No console errors
- ✅ All workflows complete successfully
- ✅ Mobile responsive
- ✅ Performance is acceptable
- ✅ Error handling works

---

## 📝 Notes

Record any observations or issues here:

---

*Happy Testing! 🚀*

