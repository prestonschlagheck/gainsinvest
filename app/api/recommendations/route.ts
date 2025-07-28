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
    
    // Generate recommendations using server-side API
    const analysis = await generateInvestmentRecommendations(userProfile)
    console.log('📊 Generated analysis:', JSON.stringify(analysis, null, 2))
    console.log('🔍 Analysis has error:', !!analysis.error)
    console.log('📈 Analysis has recommendations:', analysis.recommendations?.length || 0)
    
    // If the analysis includes an error field, it means there was an API issue
    if (analysis.error) {
      console.log('❌ Error detected in analysis, returning error response')
      // Get API status information for detailed error reporting
      const apiStatus = await getDetailedApiStatus()
      
      const errorResponse = {
        ...analysis,
        apiError: true,
        errorDetails: {
          message: analysis.error,
          apiStatus,
          timestamp: new Date().toISOString()
        }
      }
      console.log('Returning error response:', JSON.stringify(errorResponse, null, 2))
      return NextResponse.json(errorResponse)
    }
    
    // If we have valid recommendations, return them without any error flags
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      console.log('✅ Valid recommendations found, returning success response')
      console.log('Success response structure:', {
        hasRecommendations: !!analysis.recommendations,
        recommendationsLength: analysis.recommendations.length,
        hasPortfolioProjections: !!analysis.portfolioProjections,
        hasReasoning: !!analysis.reasoning,
        hasRiskAssessment: !!analysis.riskAssessment,
        hasMarketOutlook: !!analysis.marketOutlook
      })
      return NextResponse.json(analysis)
    }
    
    console.log('⚠️ No recommendations found, returning analysis as-is')
    return NextResponse.json(analysis)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    console.error('API Route Error Details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    })

    // Get API status information for detailed error reporting
    const apiStatus = await getDetailedApiStatus()
    
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: errorMessage,
        apiError: true,
        errorDetails: {
          message: errorMessage,
          apiStatus,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

async function getDetailedApiStatus() {
  try {
    // Simplified API status check - focus on functionality rather than configuration
    const apiKeys = {
      openai: !!process.env.OPENAI_API_KEY,
      grok: !!process.env.GROK_API_KEY,
      alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
      twelveData: !!process.env.TWELVE_DATA_API_KEY,
      finnhub: !!process.env.FINNHUB_API_KEY,
    }

    const hasAIService = apiKeys.openai || apiKeys.grok
    const hasFinancialData = apiKeys.alphaVantage || apiKeys.twelveData || apiKeys.finnhub
    
    return {
      hasRequiredKeys: hasAIService && hasFinancialData,
      aiServices: {
        openai: apiKeys.openai,
        grok: apiKeys.grok,
        configured: hasAIService
      },
      financialDataAPIs: {
        alphaVantage: apiKeys.alphaVantage,
        twelveData: apiKeys.twelveData,
        finnhub: apiKeys.finnhub,
        configured: hasFinancialData
      }
    }
  } catch (error) {
    console.error('Failed to get API status:', error)
    return {
      hasRequiredKeys: false,
      error: 'Unable to check API status'
    }
  }
} 