import { NextRequest, NextResponse } from 'next/server'
import { getJobQueue } from '@/lib/jobQueue'

export async function GET(request: NextRequest) {
  try {
    const jobQueue = await getJobQueue()
    
    // Get recent completed jobs
    const completedJobs = await jobQueue.getJobsByStatus('completed')
    
    if (completedJobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No completed jobs found'
      })
    }
    
    // Get the most recent job
    const latestJob = completedJobs[completedJobs.length - 1]
    
    return NextResponse.json({
      success: true,
      latestJob: {
        id: latestJob.id,
        status: latestJob.status,
        createdAt: latestJob.createdAt,
        completedAt: latestJob.updatedAt,
        hasResult: !!latestJob.result,
        recommendationCount: latestJob.result?.recommendations?.length || 0,
        resultPreview: latestJob.result ? {
          reasoning: latestJob.result.reasoning?.substring(0, 200) + '...',
          riskAssessment: latestJob.result.riskAssessment?.substring(0, 100) + '...'
        } : null
      },
      queueInfo: {
        queueType: process.env.JOB_QUEUE_TYPE || 'file',
        totalCompleted: completedJobs.length
      }
    })
    
  } catch (error) {
    console.error('❌ Latest job debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
