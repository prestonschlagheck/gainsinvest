# Background Processing System for G.AI.NS

This document explains the new background processing architecture that avoids Vercel's 30-second timeout limits by offloading AI recommendation generation to a separate background job system.

## Architecture Overview

The system consists of:

1. **Job Queue** (`lib/jobQueue.ts`) - Manages job storage and retrieval
2. **API Endpoints**:
   - `POST /api/recommendations` - Queues jobs and returns immediately with `202 Accepted`
   - `GET /api/results/[requestId]` - Fetches job results or status
3. **Background Worker** (`scripts/background-worker.ts`) - Processes jobs independently
4. **Frontend Polling** - Automatically polls for results every 2 seconds

## Quick Start

### 1. Development Setup

Start the Next.js development server:
```bash
npm run dev
```

In a separate terminal, start the background worker:
```bash
npm run worker:dev
```

### 2. Production Setup

#### Option A: Same Server
```bash
# Build the application
npm run build

# Start the Next.js server
npm start &

# Start the background worker
npm run worker &
```

#### Option B: Separate Services
Deploy the background worker on a separate service (Render, Railway, etc.):

```bash
# On the worker service
git clone <your-repo>
cd G.AI.NS
npm install
npm run worker
```

The worker will automatically process jobs from the shared queue.

## Job Queue Storage Options

### File-based (Default)
Good for development and single-server deployments:
```bash
# No configuration needed - uses `.job-queue/` directory
npm run worker
```

### Redis (Recommended for Production)
```bash
# Set environment variable
export JOB_QUEUE_TYPE=redis
export REDIS_URL=redis://localhost:6379

npm run worker
```

### Supabase (Cloud)
```bash
# Set environment variables
export JOB_QUEUE_TYPE=supabase
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key

npm run worker
```

## API Flow

### 1. Submit Recommendation Request
```typescript
POST /api/recommendations
Content-Type: application/json

{
  "riskTolerance": 7,
  "capitalAvailable": 10000,
  "timeHorizon": "medium",
  "sectors": ["Technology", "Healthcare"]
}
```

**Response** (202 Accepted):
```json
{
  "requestId": "job_1234567890_abcdef",
  "status": "pending",
  "message": "Recommendation generation started. Use /api/results/{requestId} to check progress.",
  "estimatedTime": "30-60 seconds"
}
```

### 2. Poll for Results
```typescript
GET /api/results/job_1234567890_abcdef
```

**Response** (while processing):
```json
{
  "requestId": "job_1234567890_abcdef",
  "status": "processing",
  "message": "Recommendation generation in progress...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:15.000Z"
}
```

**Response** (completed):
```json
{
  "requestId": "job_1234567890_abcdef",
  "status": "completed",
  "result": {
    "recommendations": [...],
    "reasoning": "...",
    "portfolioProjections": {...}
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:31:45.000Z"
}
```

## Frontend Integration

The frontend automatically handles the new flow:

```typescript
// 1. Submit job
const response = await fetch('/api/recommendations', {
  method: 'POST',
  body: JSON.stringify(userProfile)
})
const { requestId } = await response.json()

// 2. Poll for results
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`/api/results/${requestId}`)
  const statusData = await statusResponse.json()
  
  if (statusData.status === 'completed') {
    clearInterval(pollInterval)
    // Handle results
    setRecommendations(statusData.result.recommendations)
  } else if (statusData.status === 'failed') {
    clearInterval(pollInterval)
    // Handle error
    setError(statusData.error)
  }
}, 2000)
```

## Deployment Strategies

### Vercel + Render (Recommended)
- **Frontend**: Deploy on Vercel (handles web requests instantly)
- **Background Worker**: Deploy on Render (processes long-running jobs)
- **Queue**: Use Redis Cloud or Supabase for shared storage

### Single Server
- Run both Next.js and background worker on the same server
- Use PM2 or similar process manager to keep both running
- File-based queue works fine for moderate load

### Serverless Functions (Advanced)
- Use Vercel Edge Functions or Supabase Edge Functions for background processing
- Trigger functions via HTTP webhooks or queue events
- Requires additional webhook setup

## Configuration

### Environment Variables
```bash
# AI Services (at least one required)
GROK_API_KEY=your_grok_key
OPENAI_API_KEY=your_openai_key

# Financial Data APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
TWELVE_DATA_API_KEY=your_twelve_data_key
FINNHUB_API_KEY=your_finnhub_key

# Queue Configuration
JOB_QUEUE_TYPE=file|redis|supabase
REDIS_URL=redis://localhost:6379  # if using Redis
SUPABASE_URL=https://your-project.supabase.co  # if using Supabase
SUPABASE_ANON_KEY=your_anon_key  # if using Supabase
```

### Performance Tuning
```typescript
// Adjust polling frequency (scripts/background-worker.ts)
processor.start(3000) // Poll every 3 seconds

// Adjust concurrent job processing
for (const job of pendingJobs.slice(0, 3)) { // Max 3 concurrent
```

## Monitoring and Debugging

### Background Worker Logs
```bash
npm run worker
# Shows real-time processing logs:
# 🚀 Starting G.AI.NS Background Worker
# 📋 Found 2 pending jobs
# 🔄 Processing job job_1234567890_abcdef
# ✅ Job job_1234567890_abcdef completed successfully
```

### Job Queue Inspection
```typescript
// Access job queue programmatically
import { getJobQueue } from './lib/jobQueue'

const queue = getJobQueue()
const pendingJobs = await queue.getJobsByStatus('pending')
const processingJobs = await queue.getJobsByStatus('processing')
```

### Health Checks
```bash
# Check if worker is running
curl http://localhost:3000/api/results/health

# Monitor memory usage (logged every 5 minutes)
# 💾 Memory usage: { rss: 145MB, heapUsed: 89MB, external: 12MB }
```

## Troubleshooting

### Common Issues

1. **Jobs stuck in pending status**
   - Check if background worker is running
   - Verify environment variables are set
   - Check worker logs for errors

2. **"Job not found" errors**
   - Job may have been cleaned up (auto-deleted after 1 minute)
   - Check if requestId is correct
   - Verify queue storage is accessible

3. **Background worker crashes**
   - Check AI API keys are valid
   - Verify financial data API limits
   - Monitor memory usage

### Recovery
```bash
# Restart background worker
pkill -f background-worker
npm run worker

# Clear stuck jobs (file-based queue)
rm -rf .job-queue/*.json

# Reset Redis queue
redis-cli FLUSHDB
```

## Extending the System

### Adding New Queue Backends
Implement the `JobQueue` interface in `lib/jobQueue.ts`:

```typescript
class CustomJobQueue implements JobQueue {
  async addJob(userProfile: any): Promise<string> { /* ... */ }
  async getJob(jobId: string): Promise<JobRequest | null> { /* ... */ }
  async updateJob(jobId: string, updates: Partial<JobRequest>): Promise<void> { /* ... */ }
  async getJobsByStatus(status: JobRequest['status']): Promise<JobRequest[]> { /* ... */ }
  async deleteJob(jobId: string): Promise<void> { /* ... */ }
}
```

### Custom Job Processing
Modify `JobProcessor.processJob()` to add custom logic:

```typescript
private async processJob(job: JobRequest) {
  // Add custom preprocessing
  const enhancedProfile = await preprocessUserProfile(job.userProfile)
  
  // Generate recommendations
  const result = await generateInvestmentRecommendations(enhancedProfile)
  
  // Add custom postprocessing
  const finalResult = await postprocessRecommendations(result)
  
  await this.queue.updateJob(job.id, { status: 'completed', result: finalResult })
}
```

This architecture ensures your recommendation system can handle heavy AI processing without timeout constraints while providing a responsive user experience. 