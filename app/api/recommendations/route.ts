import { NextRequest, NextResponse } from 'next/server'
import { generateInvestmentRecommendations } from '@/lib/api'

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
    
    // DIRECT API CALL - No job queue to avoid filesystem issues on Vercel
    console.log('🎯 Making direct API call - no job queue (Vercel-optimized)')
    
    const result = await generateInvestmentRecommendations(userProfile)
    
    console.log('✅ Direct recommendation generation successful!')
    
    // Return recommendations immediately
    return NextResponse.json({
      success: true,
      recommendations: result.recommendations,
      reasoning: result.reasoning,
      riskAssessment: result.riskAssessment,
      marketOutlook: result.marketOutlook,
      portfolioProjections: result.portfolioProjections,
      timestamp: new Date().toISOString()
    }, { status: 200 })
    
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
        error: 'Failed to generate recommendations',
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