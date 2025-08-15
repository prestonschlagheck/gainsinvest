import { NextRequest, NextResponse } from 'next/server'
import { getJobQueue, ensureJobProcessorStarted } from '@/lib/jobQueue'

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' }, 
        { status: 400 }
      )
    }

    console.log('🔍 Fetching job status for requestId:', requestId)

    // Ensure job processor is running
    ensureJobProcessorStarted()

    // Get job queue instance
    const jobQueue = getJobQueue()
    
    // Fetch job from queue
    const job = await jobQueue.getJob(requestId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' }, 
        { status: 404 }
      )
    }

    // Calculate how long the job has been running
    const now = new Date()
    const jobAge = now.getTime() - job.createdAt.getTime()
    const jobAgeSeconds = Math.round(jobAge / 1000)
    const jobAgeMinutes = Math.round(jobAge / 60000)

    // Prepare response based on job status
    const response: any = {
      requestId: job.id,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      jobAge: {
        seconds: jobAgeSeconds,
        minutes: jobAgeMinutes,
        humanReadable: jobAgeMinutes > 0 ? `${jobAgeMinutes}m ${jobAgeSeconds % 60}s` : `${jobAgeSeconds}s`
      }
    }

    if (job.status === 'completed' && job.result) {
      response.result = job.result
      console.log('✅ Job completed, returning result for:', requestId)
      
      // Clean up completed job after retrieval (optional)
      // Note: You might want to keep completed jobs for a while for audit purposes
      setTimeout(async () => {
        try {
          await jobQueue.deleteJob(requestId)
          console.log('🗑️ Cleaned up completed job:', requestId)
        } catch (error) {
          console.warn('⚠️ Failed to clean up job:', requestId, error)
        }
      }, 60000) // Delete after 1 minute
      
    } else if (job.status === 'failed' && job.error) {
      response.error = job.error
      console.log('❌ Job failed, returning error for:', requestId)
      
      // Clean up failed job after retrieval
      setTimeout(async () => {
        try {
          await jobQueue.deleteJob(requestId)
          console.log('🗑️ Cleaned up failed job:', requestId)
        } catch (error) {
          console.warn('⚠️ Failed to clean up job:', requestId, error)
        }
      }, 60000) // Delete after 1 minute
      
    } else if (job.status === 'processing') {
      response.message = 'Recommendation generation in progress...'
      console.log(`🔄 Job processing for: ${requestId} (age: ${jobAgeMinutes}m ${jobAgeSeconds % 60}s)`)
      
      // If job has been processing for too long, provide more detailed info
      if (jobAgeMinutes > 3) {
        response.warning = `Job has been processing for ${jobAgeMinutes} minutes. This may indicate a system issue.`
        console.warn(`⚠️ Job ${requestId} has been processing for ${jobAgeMinutes} minutes`)
      }
      
    } else if (job.status === 'pending') {
      response.message = 'Recommendation generation queued, waiting to start...'
      console.log(`⏳ Job pending for: ${requestId} (age: ${jobAgeMinutes}m ${jobAgeSeconds % 60}s)`)
      
      // If job has been pending for too long, provide more detailed info
      if (jobAgeMinutes > 2) {
        response.warning = `Job has been pending for ${jobAgeMinutes} minutes. This may indicate a system issue.`
        console.warn(`⚠️ Job ${requestId} has been pending for ${jobAgeMinutes} minutes`)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error('❌ Error fetching job result:', {
      requestId: params?.requestId,
      error: errorMessage
    })

    return NextResponse.json(
      { 
        error: 'Failed to fetch job result',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
} 