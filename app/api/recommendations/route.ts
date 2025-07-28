import { NextRequest, NextResponse } from 'next/server'
import { generateInvestmentRecommendations, generateFallbackRecommendations } from '@/lib/api'

// In-memory job storage (in production, use Redis or database)
const jobs = new Map<string, {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
}>()

// Generate unique job ID
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export async function POST(request: NextRequest) {
  console.log('🚀 API Route Called:', {
    url: request.url,
    method: request.method,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })

  try {
    const userProfile = await request.json()
    console.log('📥 Received user profile:', JSON.stringify(userProfile, null, 2))
    
    // Validate environment variables
    const hasGrok = !!process.env.GROK_API_KEY
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasFinancialAPI = !!(process.env.ALPHA_VANTAGE_API_KEY || process.env.TWELVE_DATA_API_KEY || process.env.FINNHUB_API_KEY)
    
    console.log('🔧 Environment Check:', {
      hasGrok,
      hasOpenAI,
      hasFinancialAPI,
      hasAnyAI: hasGrok || hasOpenAI
    })
    
    if (!hasGrok && !hasOpenAI) {
      console.error('❌ No AI service configured')
      return NextResponse.json({
        error: 'No AI service configured. Please set GROK_API_KEY or OPENAI_API_KEY.',
        apiError: true,
        errorDetails: {
          message: 'Missing AI service configuration',
          hasGrok,
          hasOpenAI,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }
    
    // Create job entry
    const jobId = generateJobId()
    const job = {
      id: jobId,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    jobs.set(jobId, job)
    console.log('💼 Created job:', jobId)
    
    // Start background processing (don't await)
    processRecommendationJob(jobId, userProfile).catch(error => {
      console.error('❌ Background job failed:', error)
      const failedJob = jobs.get(jobId)
      if (failedJob) {
        failedJob.status = 'failed'
        failedJob.error = error.message
        failedJob.updatedAt = new Date()
        jobs.set(jobId, failedJob)
      }
    })
    
    // Return immediately with job ID
    return NextResponse.json({
      jobId,
      status: 'pending',
      message: 'Recommendation generation started. Use /api/recommendations/status to check progress.',
      estimatedTime: '30-60 seconds'
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    console.error('API Route Error Details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    })

    return NextResponse.json(
      { 
        error: 'Failed to start recommendation generation',
        details: errorMessage,
        apiError: true,
        errorDetails: {
          message: errorMessage,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

// Background processing function
async function processRecommendationJob(jobId: string, userProfile: any) {
  console.log('🔄 Starting background processing for job:', jobId)
  
  const job = jobs.get(jobId)
  if (!job) {
    throw new Error('Job not found')
  }
  
  // Update job status
  job.status = 'processing'
  job.updatedAt = new Date()
  jobs.set(jobId, job)
  
  try {
    // This can take as long as needed - no timeout limits
    console.log('🤖 Generating AI recommendations...')
    const analysis = await generateInvestmentRecommendations(userProfile)
    
    console.log('✅ AI generation completed for job:', jobId)
    
    // Update job with results
    job.status = 'completed'
    job.result = analysis
    job.updatedAt = new Date()
    jobs.set(jobId, job)
    
    console.log('💾 Job completed and saved:', jobId)
    
  } catch (error) {
    console.error('❌ Job processing failed:', error)
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : 'Unknown error'
    job.updatedAt = new Date()
    jobs.set(jobId, job)
    throw error
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
  }
  
  const job = jobs.get(jobId)
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
  
  // Clean response based on status
  const response: any = {
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  }
  
  if (job.status === 'completed' && job.result) {
    response.result = job.result
    // Clean up completed job after retrieval
    jobs.delete(jobId)
  } else if (job.status === 'failed' && job.error) {
    response.error = job.error
    // Clean up failed job after retrieval
    jobs.delete(jobId)
  }
  
  return NextResponse.json(response)
} 