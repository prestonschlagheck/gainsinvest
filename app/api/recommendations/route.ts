import { NextRequest, NextResponse } from 'next/server'
import { getJobQueue, ensureJobProcessorStarted } from '@/lib/jobQueue'

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
    const hasClaude = !!process.env.CLAUDE_API_KEY
    const hasGrok = !!process.env.GROK_API_KEY
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasFinancialAPI = !!(process.env.FMP_API_KEY || process.env.ALPHA_VANTAGE_API_KEY || process.env.TWELVE_DATA_API_KEY || process.env.FINNHUB_API_KEY)
    
    console.log('🔧 Environment Check:', {
      hasClaude,
      hasGrok,
      hasOpenAI,
      hasFinancialAPI,
      hasAnyAI: hasClaude || hasGrok || hasOpenAI
    })
    
    if (!hasClaude && !hasGrok && !hasOpenAI) {
      console.error('❌ No AI service configured')
      return NextResponse.json({
        error: 'No AI service configured. Please set CLAUDE_API_KEY, GROK_API_KEY, or OPENAI_API_KEY.',
        apiError: true,
        errorDetails: {
          message: 'Missing AI service configuration',
          hasClaude,
          hasGrok,
          hasOpenAI,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }
    
    // JOB QUEUE WITH MEMORY MODE - Vercel-optimized (no filesystem writes)
    console.log('🎯 Using job queue with memory mode - unlimited processing time')
    
    // Force memory mode for Vercel (no filesystem writes)
    process.env.JOB_QUEUE_TYPE = 'memory'
    
    // Ensure the background processor is running (dev/prod safe)
    const processor = ensureJobProcessorStarted()
    console.log('🔧 Processor instance:', {
      hasProcessor: !!processor,
      processorType: processor ? typeof processor : 'undefined',
      hasProcessJobImmediately: processor && typeof processor.processJobImmediately === 'function',
      processorMethods: processor ? Object.getOwnPropertyNames(Object.getPrototypeOf(processor)) : []
    })
    
    // Get job queue instance
    const jobQueue = getJobQueue()
    
    // Add job to queue and get job ID
    const requestId = await jobQueue.addJob(userProfile)
    console.log('💼 Created job with requestId:', requestId)
    
    // Process job immediately for better responsiveness
    if (processor && typeof processor.processJobImmediately === 'function') {
      console.log('🚀 Triggering immediate job processing for:', requestId)
      // Don't await this - let it process in background
      processor.processJobImmediately(requestId).catch(error => {
        console.warn('⚠️ Immediate processing failed, job will be picked up by polling:', error)
      })
    } else {
      console.warn('⚠️ Processor not available or missing processJobImmediately method, job will be processed by polling')
    }
    
    // Ensure job will be processed by polling even if immediate processing fails
    console.log('📋 Job added to queue, will be processed by background processor')
    
    // Return 202 Accepted immediately with requestId
    return NextResponse.json({
      requestId,
      status: 'pending',
      message: 'Recommendation generation started. Use /api/results/{requestId} to check progress.',
      estimatedTime: '15-45 seconds' // Reduced from 30-60 seconds
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