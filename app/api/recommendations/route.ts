import { NextRequest, NextResponse } from 'next/server'
import { getJobQueue } from '@/lib/jobQueue'

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
    
    // Get job queue instance
    const jobQueue = getJobQueue()
    
    // Add job to queue and get job ID
    const requestId = await jobQueue.addJob(userProfile)
    console.log('💼 Created job with requestId:', requestId)
    
    // Return 202 Accepted immediately with requestId
    return NextResponse.json({
      requestId,
      status: 'pending',
      message: 'Recommendation generation started. Use /api/results/{requestId} to check progress.',
      estimatedTime: '30-60 seconds'
    }, { status: 202 })
    
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