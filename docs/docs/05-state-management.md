# State Management

## Overview

Adforge uses React Context API for global state management. Five main contexts handle different aspects of the application.

## Context Hierarchy

```
<AuthProvider>
  <BrandProvider>
    <TasksProvider>
      <JobNotificationProvider>
        <StrategicChatProvider>
          {/* App content */}
        </StrategicChatProvider>
      </JobNotificationProvider>
    </TasksProvider>
  </BrandProvider>
</AuthProvider>
```

**Order matters** - inner contexts depend on outer contexts.

## 1. AuthContext

**Location:** `src/contexts/AuthContext.jsx`

**Purpose:** Manages user authentication state and Firebase auth

**State:**
```javascript
{
  currentUser: FirebaseUser | null,
  loading: boolean,
  isAuthenticated: boolean,
  error: string | null,
  setError: (error) => void,
  setPersistenceType: (rememberMe: boolean) => Promise<void>,
  logout: () => Promise<{success: boolean}>,
  refreshAuthToken: () => Promise<{success: boolean}>
}
```

**Usage:**
```javascript
import { useAuth } from '../contexts/AuthContext';

const { currentUser, isAuthenticated, logout } = useAuth();
```

**See:** [02-authentication.md](./02-authentication.md)

---

## 2. BrandContext

**Location:** `src/contexts/BrandContext.jsx`

**Purpose:** Manages brand selection and brand-specific data (products, ads)

**State:**
```javascript
{
  // Brand list
  brands: Brand[],
  selectedBrand: Brand | null,
  setSelectedBrand: (brand: Brand) => void,
  loading: boolean,
  error: string | null,
  
  // Brand-specific data (auto-loaded on selection)
  brandProducts: Product[] | null,
  brandAds: Ad[] | null,
  loadingProducts: boolean,
  loadingAds: boolean,
  
  // Actions
  refreshBrands: () => Promise<void>,
  refreshBrandData: () => Promise<void>,
  createBrand: (data, logoFile) => Promise<Result>,
  updateBrand: (brandId, updates, logoFile) => Promise<Result>,
  deleteBrand: (brandId) => Promise<Result>,
  getBrandProducts: (brandId) => Promise<Result>,
  getProductAds: (brandId, productId) => Promise<Result>,
  deleteProduct: (brandId, productId) => Promise<Result>,
  deleteAd: (brandId, adId) => Promise<Result>
}
```

**Usage:**
```javascript
import { useBrand } from '../contexts/BrandContext';

const { selectedBrand, brandProducts, createBrand } = useBrand();
```

**See:** [04-brand-context.md](./04-brand-context.md)

---

## 3. TasksContext

**Location:** `src/contexts/TasksContext.jsx`

**Purpose:** Tracks background jobs (ad generation, video generation, scraping)

**State:**
```javascript
{
  tasks: Task[],
  loading: boolean,
  
  // Actions
  addTask: (taskData) => taskId,
  updateTask: (taskId, updates) => void,
  removeTask: (taskId) => Promise<void>,
  clearCompletedTasks: () => void,
  clearAllTasks: () => void,
  getFilteredTasks: () => Task[],
  getTaskCounts: () => {total, pending, processing, completed, failed},
  
  // Filters
  filterType: string,
  setFilterType: (type) => void,
  filterStatus: string,
  setFilterStatus: (status) => void,
  
  refreshJobs: () => Promise<void>
}
```

**Task Types:**
- `ad_generation` - Bulk ad generation
- `video_generation` - Sora/Kling video generation
- `scraping` - Product/store scraping
- `avatar_video` - Avatar video generation
- `remix` - Ad remix/variations

**Task Statuses:**
- `queued` - Waiting to start
- `processing` - Currently running
- `completed` - Finished successfully
- `failed` - Error occurred
- `cancelled` - User cancelled

**Usage:**
```javascript
import { useTasksContext } from '../contexts/TasksContext';

const { tasks, addTask, updateTask, refreshJobs } = useTasksContext();

// Add task (backend creates job automatically)
const taskId = addTask({
  taskType: 'video_generation',
  title: 'Generating video...',
  metadata: { jobId: 'job_123' }
});

// Update task progress
updateTask(taskId, {
  status: 'completed',
  progress: 100
});

// Manually refresh jobs
await refreshJobs();
```

**See:** [06-job-polling.md](./06-job-polling.md)

---

## 4. StrategicChatContext

**Location:** `src/contexts/StrategicChatContext.jsx`

**Purpose:** Manages strategic analysis chat workflow (Module 1-5 pipeline)

**Workflow Steps:**
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

**Message Types:**
```javascript
export const MESSAGE_TYPES = {
  TEXT: 'text',
  RESEARCH_SUMMARY: 'research_summary',
  PERSONA_SELECTOR: 'persona_selector',
  ANGLES: 'angles',
  PLATFORM_AD_LENGTH_SELECTOR: 'platform_ad_length_selector',
  CREATIVES: 'creatives',
  VIDEO: 'video',
};
```

**State:**
```javascript
{
  // Messages
  messages: Message[],
  addMessage: (message) => void,
  addMessages: (messages) => void,
  clearMessages: () => void,
  
  // Workflow
  currentStep: string,
  setCurrentStep: (step) => void,
  
  // Product context
  brandId: string | null,
  productId: string | null,
  researchId: string | null,
  
  // Analysis IDs
  analysisId: string | null,
  creativeGenId: string | null,
  videoJobId: string | null,
  
  // Selected items
  selectedAngle: Angle | null,
  selectedCreative: Creative | null,
  selectedPersona: Persona | null,
  selectedLanguage: string,
  
  // Data
  researchSummary: Object | null,
  personas: Persona[],
  analysisResult: Object | null,
  creativeVariations: Object | null,
  videoData: Object | null,
  
  // Actions
  initializeChat: (brandId, productId, researchId) => void,
  reset: () => void
}
```

**Usage:**
```javascript
import { useStrategicChat, CHAT_STEPS, MESSAGE_TYPES } from '../contexts/StrategicChatContext';

const {
  messages,
  currentStep,
  selectedAngle,
  addMessage,
  setCurrentStep,
  initializeChat
} = useStrategicChat();

// Initialize chat
initializeChat(brandId, productId, researchId);

// Add message
addMessage({
  sender: 'agent',
  type: MESSAGE_TYPES.TEXT,
  content: 'Analyzing your product...'
});

// Move to next step
setCurrentStep(CHAT_STEPS.SHOWING_ANGLES);
```

**See:** [12-strategic-analysis-flow.md](./12-strategic-analysis-flow.md)

---

## 5. JobNotificationContext

**Location:** `src/contexts/JobNotificationContext.jsx`

**Purpose:** Real-time job completion notifications

**Features:**
- Listens to Firestore for job updates
- Shows toast notifications when jobs complete
- Automatic cleanup of old notifications

**State:**
```javascript
{
  notifications: Notification[],
  addNotification: (notification) => void,
  removeNotification: (id) => void,
  clearAllNotifications: () => void
}
```

**Notification Object:**
```javascript
{
  id: string,
  type: 'success' | 'error' | 'info',
  title: string,
  message: string,
  timestamp: Date,
  jobId?: string,
  autoClose?: boolean,
  duration?: number // ms
}
```

**Usage:**
```javascript
import { useJobNotifications } from '../contexts/JobNotificationContext';

const { notifications, addNotification, removeNotification } = useJobNotifications();

// Add notification
addNotification({
  type: 'success',
  title: 'Video Ready!',
  message: 'Your video has been generated successfully',
  autoClose: true,
  duration: 5000
});

// Display notifications
notifications.map(notif => (
  <Toast
    key={notif.id}
    type={notif.type}
    title={notif.title}
    message={notif.message}
    onClose={() => removeNotification(notif.id)}
  />
));
```

---

## Combined Context Usage

### Typical Component Pattern

```javascript
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useTasksContext } from '../contexts/TasksContext';
import { useStrategicChat } from '../contexts/StrategicChatContext';

function Dashboard() {
  // Auth
  const { currentUser, isAuthenticated } = useAuth();
  
  // Brand
  const { selectedBrand, brandProducts, loading } = useBrand();
  
  // Tasks
  const { tasks, getTaskCounts } = useTasksContext();
  
  // Strategic chat (if needed)
  const { currentStep, messages } = useStrategicChat();
  
  // Wait for auth
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Wait for brand loading
  if (loading) return <LoadingSpinner />;
  
  // Render dashboard
  return (
    <div>
      <h1>Welcome, {currentUser.email}</h1>
      <BrandSelector />
      {selectedBrand && (
        <ProductList products={brandProducts} />
      )}
    </div>
  );
}
```

## State Flow Example

### Product Scraping Flow

```javascript
// 1. User submits product URL
const { selectedBrand } = useBrand();
const { addTask } = useTasksContext();

// 2. Trigger scraping job
const response = await scrapingAPI.scrapeProduct(url, selectedBrand.brandId);
const jobId = response.data.job_id;

// 3. Track in TasksContext
const taskId = addTask({
  taskType: 'scraping',
  title: 'Scraping product...',
  metadata: { jobId }
});

// 4. Poll job status
const result = await pollJobStatus(jobId);

// 5. Update task
updateTask(taskId, { status: 'completed', progress: 100 });

// 6. Refresh brand data to show new product
await refreshBrandData();
```

## Best Practices

1. ✅ Use contexts for truly global state only
2. ✅ Keep component-specific state in useState
3. ✅ Use refs to prevent duplicate fetches
4. ✅ Clear context state on logout
5. ✅ Handle loading states properly
6. ✅ Provide sensible defaults for optional data
7. ✅ Use TypeScript/JSDoc for better developer experience
8. ✅ Test context providers in isolation

## Performance Tips

1. **Memoize callbacks** with useCallback to prevent re-renders
2. **Batch updates** - use Promise.all for parallel fetches
3. **Prevent duplicate calls** - use refs to track in-flight requests
4. **Clear unused data** - reset context on logout
5. **Debounce frequent operations** - like search filters
