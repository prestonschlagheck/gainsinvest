import { NextRequest, NextResponse } from 'next/server'
import { getJobQueue } from '@/lib/jobQueue'

export async function GET(request: NextRequest) {
  try {
    const jobQueue = getJobQueue()
    
    // Get recent completed jobs
    const completedJobs = await jobQueue.getJobsByStatus('completed')
    
    if (completedJobs.length === 0) {
      return NextResponse.json({
        error: 'No completed jobs found'
      }, { status: 404 })
    }
    
    // Get the most recent job with results
    const latestJob = completedJobs[completedJobs.length - 1]
    
    if (!latestJob.result) {
      return NextResponse.json({
        error: 'Latest job has no results'
      }, { status: 404 })
    }
    
    // Return the results in the same format as the normal results endpoint
    return NextResponse.json({
      requestId: latestJob.id,
      status: 'completed',
      result: latestJob.result,
      createdAt: latestJob.createdAt,
      updatedAt: latestJob.updatedAt
    })
    
  } catch (error) {
    console.error('❌ Get latest results error:', error)
    
    return NextResponse.json({
      error: 'Failed to retrieve latest results',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
