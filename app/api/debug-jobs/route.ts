import { NextRequest, NextResponse } from 'next/server'
import { getJobQueue, isJobProcessorHealthy, restartJobProcessor, ensureJobProcessorStarted, getJobProcessorStatus } from '@/lib/jobQueue'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const jobId = searchParams.get('jobId')
    
    // Handle restart action
    if (action === 'restart') {
      console.log('🔄 Restarting job processor via API request')
      const processor = await restartJobProcessor()
      return NextResponse.json({
        message: 'Job processor restarted',
        timestamp: new Date().toISOString(),
        processorStatus: 'running'
      })
    }
    
    // Handle force process action
    if (action === 'forceProcess' && jobId) {
      console.log(`🚀 Force processing job ${jobId} via API request`)
      const processor = await ensureJobProcessorStarted()
      if (processor) {
        processor.processJobImmediately(jobId).catch(error => {
          console.warn(`⚠️ Force processing failed for job ${jobId}:`, error)
        })
        return NextResponse.json({
          message: `Job ${jobId} force processing initiated`,
          timestamp: new Date().toISOString(),
          jobId
        })
      } else {
        return NextResponse.json({
          error: 'Job processor not available',
          timestamp: new Date().toISOString()
        }, { status: 500 })
      }
    }
    
    // Get job queue instance
    const jobQueue = await getJobQueue()
    
    // Get all jobs by status
    const pendingJobs = await jobQueue.getJobsByStatus('pending')
    const processingJobs = await jobQueue.getJobsByStatus('processing')
    const completedJobs = await jobQueue.getJobsByStatus('completed')
    const failedJobs = await jobQueue.getJobsByStatus('failed')
    
    // Check processor health
    const processorHealthy = isJobProcessorHealthy()
    const processorStatus = getJobProcessorStatus()
    
    // Calculate job ages for monitoring
    const now = new Date()
    const calculateJobAge = (job: any) => {
      try {
        if (!job || !job.createdAt) {
          console.warn('⚠️ Job missing createdAt:', job)
          return 0
        }
        const createdAt = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt)
        const age = now.getTime() - createdAt.getTime()
        return Math.round(age / 1000)
      } catch (error) {
        console.warn('⚠️ Error calculating job age:', error)
        return 0
      }
    }
    
    // Safely get processor status with fallbacks
    const safeProcessorStatus = {
      status: processorStatus?.status || 'unknown',
      isRunning: processorStatus?.isRunning || false,
      lastActivity: processorStatus?.lastActivity || new Date(),
      lastActivityAgeSeconds: processorStatus?.lastActivityAgeSeconds || 0,
      processedJobsCount: processorStatus?.processedJobsCount || 0,
      currentlyProcessing: processorStatus?.currentlyProcessing || 0,
      message: processorStatus?.message || 'Status unavailable'
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      processorHealth: {
        isHealthy: processorHealthy,
        status: safeProcessorStatus.status,
        isRunning: safeProcessorStatus.isRunning,
        lastActivity: safeProcessorStatus.lastActivity,
        lastActivityAgeSeconds: safeProcessorStatus.lastActivityAgeSeconds,
        processedJobsCount: safeProcessorStatus.processedJobsCount,
        currentlyProcessing: safeProcessorStatus.currentlyProcessing,
        message: safeProcessorStatus.message
      },
      jobQueue: {
        pending: {
          count: pendingJobs.length,
          jobs: pendingJobs.map(job => ({
            id: job.id,
            ageSeconds: calculateJobAge(job),
            userProfile: {
              riskTolerance: job.userProfile.riskTolerance,
              capitalAvailable: job.userProfile.capitalAvailable,
              timeHorizon: job.userProfile.timeHorizon
            }
          }))
        },
        processing: {
          count: processingJobs.length,
          jobs: processingJobs.map(job => ({
            id: job.id,
            ageSeconds: calculateJobAge(job),
            userProfile: {
              riskTolerance: job.userProfile.riskTolerance,
              capitalAvailable: job.userProfile.capitalAvailable,
              timeHorizon: job.userProfile.timeHorizon
            }
          }))
        },
        completed: {
          count: completedJobs.length,
          recentJobs: completedJobs.slice(-5).map(job => ({
            id: job.id,
            completedAt: job.updatedAt,
            ageSeconds: calculateJobAge(job)
          }))
        },
        failed: {
          count: failedJobs.length,
          recentJobs: failedJobs.slice(-5).map(job => ({
            id: job.id,
            failedAt: job.updatedAt,
            error: job.error,
            ageSeconds: calculateJobAge(job)
          }))
        }
      },
      actions: {
        restart: '/api/debug-jobs?action=restart',
        forceProcess: '/api/debug-jobs?action=forceProcess&jobId=JOB_ID_HERE'
      },
      warnings: [] as string[]
    }
    
    // Add warnings for stuck jobs
    const stuckThreshold = 120 // 2 minutes
    const stuckPending = pendingJobs.filter(job => calculateJobAge(job) > stuckThreshold)
    const stuckProcessing = processingJobs.filter(job => calculateJobAge(job) > stuckThreshold)
    
    if (stuckPending.length > 0) {
      response.warnings.push(`Found ${stuckPending.length} stuck pending jobs (older than 2 minutes)`)
    }
    
    if (stuckProcessing.length > 0) {
      response.warnings.push(`Found ${stuckProcessing.length} stuck processing jobs (older than 2 minutes)`)
    }
    
    if (!processorHealthy) {
      response.warnings.push('Job processor is not running - this may cause delays')
    }
    
    if (safeProcessorStatus.lastActivityAgeSeconds && safeProcessorStatus.lastActivityAgeSeconds > 300) { // 5 minutes
      response.warnings.push(`Job processor has been inactive for ${safeProcessorStatus.lastActivityAgeSeconds} seconds - may be stuck`)
    }
    
    if (safeProcessorStatus.currentlyProcessing && safeProcessorStatus.currentlyProcessing > 5) {
      response.warnings.push(`High number of concurrently processing jobs (${safeProcessorStatus.currentlyProcessing}) - may cause delays`)
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error('❌ Error in debug-jobs endpoint:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Failed to get job queue status',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
