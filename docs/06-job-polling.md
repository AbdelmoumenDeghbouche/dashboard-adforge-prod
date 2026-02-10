# Job Polling Pattern

## Overview

Most Adforge operations are **async job-based** to handle long-running AI operations without timeouts.

## Job-Based Architecture

### Why Jobs?

- ✅ No HTTP timeouts (operations can take 30+ minutes)
- ✅ Better user experience (non-blocking)
- ✅ Progress tracking during execution
- ✅ Can be monitored/cancelled
- ✅ Persistent (survives page refreshes)

### Flow Diagram

```
1. User Action
   ↓
2. POST /api/v1/{endpoint}-job
   → Returns: { job_id, status: "queued" }
   ↓
3. Poll GET /api/v1/jobs/{job_id} every 2-10s
   → Returns: { status: "processing", progress: 45%, current_step: "..." }
   ↓
4. Job Completes
   → Returns: { status: "completed", result_data: {...} }
```

## Generic Job Polling Function

**Location:** `src/services/apiService.js`

```javascript
/**
 * Poll a job until completion
 * @param {string} jobId - The job ID to poll
 * @param {function} onProgress - Callback for progress updates (optional)
 * @param {number} pollInterval - Polling interval in ms (default: 2000)
 * @param {number} maxAttempts - Maximum polling attempts (default: 450)
 * @returns {Promise<any>} - The job result when completed
 */
export async function pollJobStatus(
  jobId, 
  onProgress = null, 
  pollInterval = 2000, 
  maxAttempts = 450
) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await api.get(`/api/v1/jobs/${job_id}`);
      const job = response.data || response;

      // Update progress callback
      if (onProgress && job.progress_data) {
        onProgress({
          percentage: job.progress_data.percentage || 0,
          message: job.progress_data.current_step || 'Processing...',
          status: job.status
        });
      }

      // Job completed
      if (job.status === 'completed') {
        return job.result_data || job.result || {};
      }

      // Job failed
      if (job.status === 'failed') {
        const errorMessage = job.error_data?.message || 'Job failed';
        throw new Error(errorMessage);
      }

      // Still processing - wait and retry
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

    } catch (error) {
      // Network errors - retry
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }
  }

  // Timeout
  throw new Error(`Job ${jobId} timeout - taking longer than expected`);
}
```

## Poll Intervals by Operation

| Operation | Poll Interval | Max Duration | Reason |
|-----------|---------------|--------------|--------|
| Ad generation | 6 seconds | 30 minutes | Image generation batch |
| Video generation | 10 seconds | 45 minutes | AI video generation |
| Research | 10 seconds | 50 minutes | Deep web scraping + AI |
| Strategic analysis | 10 seconds | 90 minutes | Multi-module AI pipeline |
| Scraping | 5 seconds | 10 minutes | Web scraping |
| Avatar video | 10 seconds | 30 minutes | Avatar + video generation |

## Job Response Format

### Job Status Response

```javascript
{
  job_id: "job_abc123",
  status: "processing",           // queued | processing | completed | failed | cancelled
  type: "video_generation",       // Job type
  created_at: "2024-01-15T10:00:00Z",
  completed_at: null,             // Set when job finishes
  
  // Progress tracking
  progress_data: {
    percentage: 45,               // 0-100
    current_step: "Generating scene 3 of 7",
    estimated_time_remaining: 120 // seconds (optional)
  },
  
  // On completion
  result_data: {
    // Job-specific results
  },
  
  // On failure
  error_data: {
    message: "Error description",
    details: {...}
  }
}
```

## Usage Examples

### Example 1: Basic Job Polling

```javascript
import { pollJobStatus } from '../services/apiService';

async function generateAds() {
  // Step 1: Trigger job
  const response = await adsAPI.generateBulkAds(formData);
  const jobId = response.data.job_id;
  
  console.log('Job created:', jobId);
  
  // Step 2: Poll for completion
  const result = await pollJobStatus(jobId);
  
  console.log('Job completed:', result);
  return result;
}
```

### Example 2: With Progress Tracking

```javascript
const [progress, setProgress] = useState(0);
const [progressMessage, setProgressMessage] = useState('');

async function generateVideo() {
  const response = await videoAPI.generateVideo(params);
  const jobId = response.data.job_id;
  
  // Poll with progress callback
  const result = await pollJobStatus(
    jobId,
    (progressData) => {
      setProgress(progressData.percentage);
      setProgressMessage(progressData.message);
    },
    10000,  // Poll every 10 seconds
    270     // Max 45 minutes (270 * 10s)
  );
  
  return result;
}
```

### Example 3: With UI Integration

```javascript
import { useTasksContext } from '../contexts/TasksContext';
import { pollJobStatus } from '../services/apiService';

function MyComponent() {
  const { addTask, updateTask } = useTasksContext();
  
  async function handleGenerate() {
    // Trigger job
    const response = await api.post('/api/v1/some-endpoint-job', payload);
    const jobId = response.data.job_id;
    
    // Add to tasks UI
    const taskId = addTask({
      taskType: 'custom_operation',
      title: 'Processing...',
      status: 'processing',
      metadata: { jobId }
    });
    
    try {
      // Poll with progress updates
      const result = await pollJobStatus(
        jobId,
        (progress) => {
          updateTask(taskId, {
            progress: progress.percentage,
            description: progress.message
          });
        }
      );
      
      // Success
      updateTask(taskId, {
        status: 'completed',
        progress: 100
      });
      
      return result;
    } catch (error) {
      // Failed
      updateTask(taskId, {
        status: 'failed',
        description: error.message
      });
      throw error;
    }
  }
}
```

## Job-Based Endpoints

### List of Job Endpoints

All endpoints ending with `-job` return immediately with `job_id`:

```javascript
// Scraping
POST /api/v1/scraping/scrape-product-job
POST /api/v1/scraping/scrape-store-job

// Ads
POST /api/v1/ads/generate-bulk-dynamic-job
POST /api/v1/ads/image/template-job
POST /api/v1/ads/conversations/{conversationId}/remix

// Strategic Analysis
POST /api/v1/research/products/{brandId}/{productId}/research/{researchId}/summary (smart - returns cache or job)
POST /api/v1/strategic-analysis/products/{brandId}/{productId}/research/{researchId}/personas-job
POST /api/v1/strategic-analysis/products/{brandId}/{productId}/research/{researchId}/analyze-job
POST /api/v1/strategic-analysis/analysis/{brandId}/{productId}/{analysisId}/approve-angle-job

// Video
POST /api/v1/sora/generate/{brandId}/{productId}
POST /api/v1/avatars/product-video/generate
POST /api/v1/video-playground/playground/generate-video
```

## Centralized Job Status Endpoint

All jobs use the same status endpoint:

```
GET /api/v1/jobs/{job_id}
```

This returns consistent format regardless of job type.

## Job Management

### Get All Jobs

```javascript
import { adsAPI } from '../services/apiService';

const response = await adsAPI.getAllJobs('all', 50);
const jobs = response.data.jobs;

// Filter by status
const completedJobs = jobs.filter(j => j.status === 'completed');

// Filter by type
const videoJobs = jobs.filter(j => j.type === 'video_generation');
```

### Cancel Job

```javascript
import { adsAPI } from '../services/apiService';

await adsAPI.cancelJob(jobId);
console.log('Job cancelled');
```

## Polling Best Practices

1. ✅ **Choose appropriate poll interval**
   - Fast operations (scraping): 5s
   - Medium operations (ads): 6s
   - Slow operations (video/analysis): 10s

2. ✅ **Set realistic max attempts**
   - Calculate: `maxAttempts = (max_duration_seconds / poll_interval_seconds)`
   - Example: 45 min video = `(45 * 60) / 10 = 270 attempts`

3. ✅ **Handle timeouts gracefully**
   - Job may still be running after timeout
   - Show "Check Tasks page" message
   - Don't retry indefinitely

4. ✅ **Use progress callbacks**
   - Update UI in real-time
   - Show current step to user
   - Display percentage progress

5. ✅ **Error handling**
   - Distinguish network errors (retry) from job failures (stop)
   - Show user-friendly error messages
   - Log details for debugging

## Custom Polling Implementation

If you need custom polling logic:

```javascript
async function customPollJob(jobId) {
  const maxAttempts = 300;
  const pollInterval = 5000;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = await api.get(`/api/v1/jobs/${jobId}`);
    const job = response.data;
    
    // Custom logic here
    if (job.status === 'completed') {
      return job.result_data;
    }
    
    if (job.status === 'failed') {
      throw new Error(job.error_data?.message);
    }
    
    // Custom progress handling
    console.log(`Progress: ${job.progress_data?.percentage}%`);
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
  }
  
  throw new Error('Job timeout');
}
```

## Monitoring Jobs in UI

### Tasks Page
Shows all background jobs with real-time updates:
- Job type and title
- Current status
- Progress percentage
- Current step description
- Start/end times
- Cancel button for active jobs

### Implementation

```javascript
// Tasks.jsx
import { useTasksContext } from '../contexts/TasksContext';

function TasksPage() {
  const { tasks, refreshJobs } = useTasksContext();
  
  useEffect(() => {
    // Fetch jobs on mount
    refreshJobs();
    
    // Poll every 30s while on page
    const interval = setInterval(refreshJobs, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.taskId} task={task} />
      ))}
    </div>
  );
}
```
