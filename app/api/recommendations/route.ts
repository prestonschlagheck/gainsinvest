import { NextRequest, NextResponse } from 'next/server'
import { generateInvestmentRecommendations } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const userProfile = await request.json()
    console.log('Received user profile:', JSON.stringify(userProfile, null, 2))
    
    // Generate recommendations using server-side API
    const analysis = await generateInvestmentRecommendations(userProfile)
    console.log('Generated analysis:', JSON.stringify(analysis, null, 2))
    
    // If the analysis includes an error field, it means we fell back to static recommendations
    if (analysis.error) {
      // Get API status information for detailed error reporting
      const apiStatus = await getDetailedApiStatus()
      
      return NextResponse.json({
        ...analysis,
        apiError: true,
        errorDetails: {
          message: analysis.error,
          apiStatus,
          timestamp: new Date().toISOString()
        }
      })
    }
    
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
    // Check which APIs are configured and their status
    const isRealKey = (key: string | undefined, placeholder: string) => {
      return key && key !== placeholder && key.trim() !== ''
    }

    const apiKeys = {
      openai: isRealKey(process.env.OPENAI_API_KEY, 'your_openai_api_key_here'),
      grok: isRealKey(process.env.GROK_API_KEY, 'your_grok_api_key_here'),
      alphaVantage: isRealKey(process.env.ALPHA_VANTAGE_API_KEY, 'your_alpha_vantage_key_here'),
      twelveData: isRealKey(process.env.TWELVE_DATA_API_KEY, 'your_twelve_data_key_here'),
      finnhub: isRealKey(process.env.FINNHUB_API_KEY, 'your_finnhub_key_here'),
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
      },
      missingServices: [
        ...(!apiKeys.openai && !apiKeys.grok ? ['AI Service (OpenAI or Grok)'] : []),
        ...(!hasFinancialData ? ['Financial Data API (Alpha Vantage, Twelve Data, or Finnhub)'] : [])
      ]
    }
  } catch (error) {
    console.error('Failed to get API status:', error)
    return {
      hasRequiredKeys: false,
      error: 'Unable to check API status'
    }
  }
} 