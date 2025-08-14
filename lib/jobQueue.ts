// Background Job Queue System for G.AI.NS
// Supports multiple storage backends: File, Redis, Supabase, etc.

import fs from 'fs/promises'
import path from 'path'

export interface JobRequest {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  userProfile: any
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface JobQueue {
  addJob(userProfile: any): Promise<string>
  getJob(jobId: string): Promise<JobRequest | null>
  updateJob(jobId: string, updates: Partial<JobRequest>): Promise<void>
  getJobsByStatus(status: JobRequest['status']): Promise<JobRequest[]>
  deleteJob(jobId: string): Promise<void>
}

// File-based job queue implementation (development/fallback)
class FileJobQueue implements JobQueue {
  private queueDir: string

  constructor() {
    this.queueDir = path.join(process.cwd(), '.job-queue')
    this.ensureQueueDirectory()
  }

  private async ensureQueueDirectory() {
    try {
      await fs.access(this.queueDir)
    } catch {
      await fs.mkdir(this.queueDir, { recursive: true })
    }
  }

  private getJobFilePath(jobId: string): string {
    return path.join(this.queueDir, `${jobId}.json`)
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  async addJob(userProfile: any): Promise<string> {
    const jobId = this.generateJobId()
    const job: JobRequest = {
      id: jobId,
      status: 'pending',
      userProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const filePath = this.getJobFilePath(jobId)
    await fs.writeFile(filePath, JSON.stringify(job, null, 2))
    
    console.log(`📁 Job ${jobId} added to file queue`)
    return jobId
  }

  async getJob(jobId: string): Promise<JobRequest | null> {
    try {
      const filePath = this.getJobFilePath(jobId)
      const content = await fs.readFile(filePath, 'utf-8')
      const job = JSON.parse(content)
      
      // Convert date strings back to Date objects
      job.createdAt = new Date(job.createdAt)
      job.updatedAt = new Date(job.updatedAt)
      
      return job
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null // Job not found
      }
      throw error
    }
  }

  async updateJob(jobId: string, updates: Partial<JobRequest>): Promise<void> {
    const job = await this.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date()
    }

    const filePath = this.getJobFilePath(jobId)
    await fs.writeFile(filePath, JSON.stringify(updatedJob, null, 2))
    
    console.log(`📁 Job ${jobId} updated in file queue`)
  }

  async getJobsByStatus(status: JobRequest['status']): Promise<JobRequest[]> {
    try {
      const files = await fs.readdir(this.queueDir)
      const jobs: JobRequest[] = []

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(this.queueDir, file), 'utf-8')
            const job = JSON.parse(content)
            
            // Convert date strings back to Date objects
            job.createdAt = new Date(job.createdAt)
            job.updatedAt = new Date(job.updatedAt)
            
            if (job.status === status) {
              jobs.push(job)
            }
          } catch (error) {
            console.warn(`Failed to read job file ${file}:`, error)
          }
        }
      }

      return jobs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    } catch (error) {
      console.error('Error reading job queue directory:', error)
      return []
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      const filePath = this.getJobFilePath(jobId)
      await fs.unlink(filePath)
      console.log(`📁 Job ${jobId} deleted from file queue`)
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error
      }
      // File doesn't exist, consider it deleted
    }
  }
}

// Redis job queue implementation (production)
class RedisJobQueue implements JobQueue {
  // This would use Redis for production deployments
  // Implementation would depend on Redis client (ioredis, redis, etc.)
  
  async addJob(userProfile: any): Promise<string> {
    throw new Error('Redis job queue not implemented yet')
  }

  async getJob(jobId: string): Promise<JobRequest | null> {
    throw new Error('Redis job queue not implemented yet')
  }

  async updateJob(jobId: string, updates: Partial<JobRequest>): Promise<void> {
    throw new Error('Redis job queue not implemented yet')
  }

  async getJobsByStatus(status: JobRequest['status']): Promise<JobRequest[]> {
    throw new Error('Redis job queue not implemented yet')
  }

  async deleteJob(jobId: string): Promise<void> {
    throw new Error('Redis job queue not implemented yet')
  }
}

// Supabase job queue implementation (cloud)
class SupabaseJobQueue implements JobQueue {
  // This would use Supabase for cloud deployments
  // Implementation would use Supabase client
  
  async addJob(userProfile: any): Promise<string> {
    throw new Error('Supabase job queue not implemented yet')
  }

  async getJob(jobId: string): Promise<JobRequest | null> {
    throw new Error('Supabase job queue not implemented yet')
  }

  async updateJob(jobId: string, updates: Partial<JobRequest>): Promise<void> {
    throw new Error('Supabase job queue not implemented yet')
  }

  async getJobsByStatus(status: JobRequest['status']): Promise<JobRequest[]> {
    throw new Error('Supabase job queue not implemented yet')
  }

  async deleteJob(jobId: string): Promise<void> {
    throw new Error('Supabase job queue not implemented yet')
  }
}

// Job queue factory
export function createJobQueue(): JobQueue {
  const queueType = process.env.JOB_QUEUE_TYPE || 'file'
  
  switch (queueType) {
    case 'redis':
      if (process.env.REDIS_URL) {
        return new RedisJobQueue()
      }
      console.warn('Redis queue requested but REDIS_URL not set, falling back to file queue')
      return new FileJobQueue()
      
    case 'supabase':
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        return new SupabaseJobQueue()
      }
      console.warn('Supabase queue requested but credentials not set, falling back to file queue')
      return new FileJobQueue()
      
    case 'file':
    default:
      return new FileJobQueue()
  }
}

// Singleton job queue instance
let jobQueueInstance: JobQueue | null = null

export function getJobQueue(): JobQueue {
  if (!jobQueueInstance) {
    jobQueueInstance = createJobQueue()
  }
  return jobQueueInstance
}

// Background job processor
export class JobProcessor {
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null
  private queue: JobQueue

  constructor(queue: JobQueue) {
    this.queue = queue
  }

  start(intervalMs: number = 5000) {
    if (this.isProcessing) {
      console.log('⚠️ Job processor already running')
      return
    }

    console.log('🚀 Starting background job processor')
    this.isProcessing = true
    
    this.processingInterval = setInterval(async () => {
      await this.processPendingJobs()
    }, intervalMs)
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    this.isProcessing = false
    console.log('⏹️ Background job processor stopped')
  }

  private async processPendingJobs() {
    try {
      const pendingJobs = await this.queue.getJobsByStatus('pending')
      
      if (pendingJobs.length === 0) {
        return
      }

      console.log(`📋 Found ${pendingJobs.length} pending jobs`)

      // Process jobs one at a time to avoid overwhelming the system
      for (const job of pendingJobs.slice(0, 3)) { // Max 3 concurrent jobs
        try {
          await this.processJob(job)
        } catch (error) {
          console.error(`❌ Failed to process job ${job.id}:`, error)
          await this.queue.updateJob(job.id, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    } catch (error) {
      console.error('❌ Error in job processor:', error)
    }
  }

  private async processJob(job: JobRequest) {
    console.log(`🔄 Processing job ${job.id}`)
    
    // Mark job as processing
    await this.queue.updateJob(job.id, { status: 'processing' })

    try {
      // Import the AI analysis function
      const { generateInvestmentRecommendations } = await import('./api')
      
      // Generate recommendations (this can take as long as needed)
      const result = await generateInvestmentRecommendations(job.userProfile)
      
      // Mark job as completed with results
      await this.queue.updateJob(job.id, {
        status: 'completed',
        result
      })
      
      console.log(`✅ Job ${job.id} completed successfully`)
      
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error)
      await this.queue.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

// Global-safe processor starter so API routes can ensure processing without separate worker
declare global {
  // eslint-disable-next-line no-var
  var __jobProcessorStarted: boolean | undefined
  // eslint-disable-next-line no-var
  var __jobProcessorInstance: JobProcessor | undefined
}

export function ensureJobProcessorStarted() {
  if (global.__jobProcessorStarted) {
    return
  }
  const queue = getJobQueue()
  const processor = new JobProcessor(queue)
  processor.start(2000) // poll every 2s for responsiveness
  global.__jobProcessorStarted = true
  global.__jobProcessorInstance = processor
  console.log('✅ ensureJobProcessorStarted: processor is running')
} 