import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check all relevant environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasClaudeKey: !!process.env.CLAUDE_API_KEY,
      hasGrokKey: !!process.env.GROK_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasFMPKey: !!process.env.FMP_API_KEY,
      hasAlphaVantageKey: !!process.env.ALPHA_VANTAGE_API_KEY,
      hasTwelveDataKey: !!process.env.TWELVE_DATA_API_KEY,
      hasFinnhubKey: !!process.env.FINNHUB_API_KEY,
      timestamp: new Date().toISOString()
    }
    
    // Count available services
    const aiServices = [envCheck.hasClaudeKey, envCheck.hasGrokKey, envCheck.hasOpenAIKey].filter(Boolean).length
    const dataServices = [envCheck.hasFMPKey, envCheck.hasAlphaVantageKey, envCheck.hasTwelveDataKey, envCheck.hasFinnhubKey].filter(Boolean).length
    
    const summary = {
      environment: envCheck.NODE_ENV,
      aiServicesAvailable: aiServices,
      dataServicesAvailable: dataServices,
      isConfigured: aiServices > 0 && dataServices > 0,
      details: envCheck
    }
    
    console.log('🔍 Environment Debug:', summary)
    
    return NextResponse.json({
      success: true,
      summary,
      message: summary.isConfigured 
        ? 'Environment is properly configured' 
        : 'Missing required API keys'
    })
    
  } catch (error) {
    console.error('❌ Environment debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
