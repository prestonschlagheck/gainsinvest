import { NextRequest, NextResponse } from 'next/server'
import { getJobQueue } from '@/lib/jobQueue'

export async function GET(request: NextRequest) {
  try {
    const jobQueue = getJobQueue()
    
    // Get all jobs by status
    const pendingJobs = await jobQueue.getJobsByStatus('pending')
    const processingJobs = await jobQueue.getJobsByStatus('processing')
    const completedJobs = await jobQueue.getJobsByStatus('completed')
    const failedJobs = await jobQueue.getJobsByStatus('failed')
    
    // Calculate job ages
    const now = new Date()
    const calculateAge = (job: any) => {
      const createdAt = new Date(job.createdAt)
      return Math.round((now.getTime() - createdAt.getTime()) / 1000) // seconds
    }
    
    const jobSummary = {
      totalJobs: pendingJobs.length + processingJobs.length + completedJobs.length + failedJobs.length,
      pending: pendingJobs.map(job => ({
        id: job.id,
        ageSeconds: calculateAge(job),
        ageMinutes: Math.round(calculateAge(job) / 60)
      })),
      processing: processingJobs.map(job => ({
        id: job.id,
        ageSeconds: calculateAge(job),
        ageMinutes: Math.round(calculateAge(job) / 60)
      })),
      completed: completedJobs.length,
      failed: failedJobs.length,
      queueType: process.env.JOB_QUEUE_TYPE || 'file',
      timestamp: new Date().toISOString()
    }
    
    // Identify stuck jobs (older than 5 minutes)
    const stuckJobs = [
      ...pendingJobs.filter(job => calculateAge(job) > 300),
      ...processingJobs.filter(job => calculateAge(job) > 300)
    ]
    
    return NextResponse.json({
      success: true,
      summary: jobSummary,
      stuckJobs: stuckJobs.map(job => ({
        id: job.id,
        status: job.status,
        ageMinutes: Math.round(calculateAge(job) / 60),
        userProfile: {
          riskTolerance: job.userProfile?.riskTolerance,
          capitalAvailable: job.userProfile?.capitalAvailable,
          existingPortfolio: job.userProfile?.existingPortfolio?.length || 0
        }
      })),
      recommendations: stuckJobs.length > 0 ? 
        'Consider restarting the application or checking API connectivity' : 
        'No stuck jobs detected'
    })
    
  } catch (error) {
    console.error('❌ Job debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
