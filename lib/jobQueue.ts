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

// In-memory job queue implementation (development/fallback for read-only filesystems)
class MemoryJobQueue implements JobQueue {
  private jobs: Map<string, JobRequest> = new Map()

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

    this.jobs.set(jobId, job)
    console.log(`💾 Job ${jobId} added to memory queue`)
    return jobId
  }

  async getJob(jobId: string): Promise<JobRequest | null> {
    const job = this.jobs.get(jobId)
    return job || null
  }

  async updateJob(jobId: string, updates: Partial<JobRequest>): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date()
    }

    this.jobs.set(jobId, updatedJob)
    console.log(`💾 Job ${jobId} updated in memory queue`)
  }

  async getJobsByStatus(status: JobRequest['status']): Promise<JobRequest[]> {
    const jobs = Array.from(this.jobs.values())
      .filter(job => job.status === status)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    
    return jobs
  }

  async deleteJob(jobId: string): Promise<void> {
    this.jobs.delete(jobId)
    console.log(`💾 Job ${jobId} deleted from memory queue`)
  }
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
    case 'memory':
      console.log('🧠 Using in-memory job queue (development mode)')
      return new MemoryJobQueue()
      
    case 'redis':
      if (process.env.REDIS_URL) {
        return new RedisJobQueue()
      }
      console.warn('Redis queue requested but REDIS_URL not set, falling back to memory queue')
      return new MemoryJobQueue()
      
    case 'supabase':
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        return new SupabaseJobQueue()
      }
      console.warn('Supabase queue requested but credentials not set, falling back to memory queue')
      return new MemoryJobQueue()
      
    case 'file':
      try {
        return new FileJobQueue()
      } catch (error) {
        console.warn('File queue failed (likely read-only filesystem), falling back to memory queue:', error)
        return new MemoryJobQueue()
      }
      
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
  public isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null
  private queue: JobQueue
  public processingJobs: Set<string> = new Set() // Track currently processing jobs (made public for monitoring)
  public lastActivity: Date = new Date() // Track last activity (made public for monitoring)
  public processedJobsCount: number = 0 // Track total processed jobs (made public for monitoring)

  constructor(queue: JobQueue) {
    this.queue = queue
  }

  start(intervalMs: number = 1000) { // Reduced from 5000ms to 1000ms for responsiveness
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

  // New method: Process a job immediately when added
  async processJobImmediately(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId)
    if (!job || job.status !== 'pending') {
      return
    }

    // Don't process if already being processed
    if (this.processingJobs.has(jobId)) {
      return
    }

    console.log(`🚀 Processing job ${jobId} immediately`)
    await this.processJob(job)
  }

  private async processPendingJobs() {
    try {
      const pendingJobs = await this.queue.getJobsByStatus('pending')
      
      if (pendingJobs.length === 0) {
        return
      }

      console.log(`📋 Found ${pendingJobs.length} pending jobs`)

      // Check for stuck jobs (older than 2 minutes)
      const now = Date.now()
      const stuckJobs = pendingJobs.filter(job => {
        const age = now - job.createdAt.getTime()
        return age > 120000 // 2 minutes
      })
      
      if (stuckJobs.length > 0) {
        console.warn(`⚠️ Found ${stuckJobs.length} stuck pending jobs, prioritizing them`)
      }

      // Process more jobs concurrently and prioritize newer jobs
      // Prioritize stuck jobs first, then newer jobs
      const jobsToProcess = [
        ...stuckJobs.slice(0, 2), // Process up to 2 stuck jobs first
        ...pendingJobs
          .filter(job => !stuckJobs.includes(job) && !this.processingJobs.has(job.id))
          .slice(0, 3) // Then process up to 3 regular jobs
      ].filter(job => !this.processingJobs.has(job.id)) // Don't process already processing jobs

      for (const job of jobsToProcess) {
        // Process jobs asynchronously to avoid blocking
        this.processJob(job).catch(error => {
          console.error(`❌ Failed to process job ${job.id}:`, error)
        })
      }
    } catch (error) {
      console.error('❌ Error in job processor:', error)
    }
  }

  private async processJob(job: JobRequest) {
    // Prevent duplicate processing
    if (this.processingJobs.has(job.id)) {
      return
    }

    this.processingJobs.add(job.id)
    this.lastActivity = new Date()
    console.log(`🔄 Processing job ${job.id}`)
    
    try {
      // Mark job as processing
      await this.queue.updateJob(job.id, { status: 'processing' })

      // Import the AI analysis function
      const { generateInvestmentRecommendations } = await import('./api')
      
      // Generate recommendations with reduced timeout for better user experience
      const result = await Promise.race([
        generateInvestmentRecommendations(job.userProfile),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Job processing timeout after 2 minutes')), 120000)
        )
      ])
      
      // Mark job as completed with results
      await this.queue.updateJob(job.id, {
        status: 'completed',
        result
      })
      
      this.processedJobsCount++
      this.lastActivity = new Date()
      console.log(`✅ Job ${job.id} completed successfully (total processed: ${this.processedJobsCount})`)
      
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error)
      await this.queue.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      this.lastActivity = new Date()
    } finally {
      // Always remove from processing set
      this.processingJobs.delete(job.id)
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
  console.log('🔍 ensureJobProcessorStarted called')
  console.log('🔍 Global state:', {
    __jobProcessorStarted: global.__jobProcessorStarted,
    __jobProcessorInstance: !!global.__jobProcessorInstance,
    instanceType: global.__jobProcessorInstance ? typeof global.__jobProcessorInstance : 'undefined'
  })
  
  if (global.__jobProcessorStarted) {
    console.log('🔍 Returning existing processor instance')
    const processor = global.__jobProcessorInstance
    console.log('🔍 Existing processor methods:', processor ? Object.getOwnPropertyNames(Object.getPrototypeOf(processor)) : [])
    return processor
  }
  
  console.log('🔍 Creating new processor instance')
  const queue = getJobQueue()
  const processor = new JobProcessor(queue)
  console.log('🔍 New processor methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(processor)))
  processor.start(1000) // Reduced from 2000ms to 1000ms for better responsiveness
  global.__jobProcessorStarted = true
  global.__jobProcessorInstance = processor
  console.log('✅ ensureJobProcessorStarted: processor is running with 1s polling')
  return processor
}

// Add method to restart processor if needed
export function restartJobProcessor() {
  if (global.__jobProcessorInstance) {
    console.log('🔄 Restarting job processor...')
    global.__jobProcessorInstance.stop()
    global.__jobProcessorInstance = undefined
    global.__jobProcessorStarted = false
  }
  return ensureJobProcessorStarted()
}

// Add method to check processor health
export function isJobProcessorHealthy(): boolean {
  return global.__jobProcessorStarted === true && global.__jobProcessorInstance !== undefined
}

// Add method to get detailed processor status
export function getJobProcessorStatus() {
  if (!global.__jobProcessorInstance) {
    return {
      isRunning: false,
      status: 'stopped',
      message: 'Job processor not started'
    }
  }

  try {
    const processor = global.__jobProcessorInstance
    const now = new Date()
    
    // Safely handle lastActivity
    let lastActivityAge = 0
    let lastActivitySeconds = 0
    
    if (processor.lastActivity && processor.lastActivity instanceof Date) {
      lastActivityAge = now.getTime() - processor.lastActivity.getTime()
      lastActivitySeconds = Math.round(lastActivityAge / 1000)
    } else {
      console.warn('⚠️ Processor lastActivity is not a valid Date:', processor.lastActivity)
      // Set a default lastActivity if it's missing
      processor.lastActivity = new Date()
    }

    return {
      isRunning: processor.isProcessing,
      status: processor.isProcessing ? 'running' : 'stopped',
      lastActivity: processor.lastActivity,
      lastActivityAgeSeconds: lastActivitySeconds,
      processedJobsCount: processor.processedJobsCount || 0,
      currentlyProcessing: processor.processingJobs ? processor.processingJobs.size : 0,
      isHealthy: lastActivityAge < 300000, // Consider healthy if activity in last 5 minutes
      message: processor.isProcessing 
        ? `Processor running, last activity ${lastActivitySeconds}s ago, processed ${processor.processedJobsCount || 0} jobs`
        : 'Processor stopped'
    }
  } catch (error) {
    console.error('❌ Error getting processor status:', error)
    return {
      isRunning: false,
      status: 'error',
      message: `Error getting status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastActivity: new Date(),
      lastActivityAgeSeconds: 0,
      processedJobsCount: 0,
      currentlyProcessing: 0,
      isHealthy: false
    }
  }
} 