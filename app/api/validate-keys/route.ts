import { NextResponse } from 'next/server'

export async function GET() {
  // Simplified API key validation - focus on functionality rather than configuration
  const apiKeys = {
    openai: !!process.env.OPENAI_API_KEY,
    grok: !!process.env.GROK_API_KEY,
    alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
    twelveData: !!process.env.TWELVE_DATA_API_KEY,
    finnhub: !!process.env.FINNHUB_API_KEY,
    polygon: !!process.env.POLYGON_API_KEY,
    newsApi: !!process.env.NEWS_API_KEY,
  }

  const hasAIService = apiKeys.openai || apiKeys.grok
  const hasFinancialData = apiKeys.alphaVantage || apiKeys.twelveData || apiKeys.finnhub || apiKeys.polygon
  
  const summary = {
    hasRequiredKeys: hasAIService && hasFinancialData,
    hasAIService,
    hasFinancialData,
    configuredKeys: Object.entries(apiKeys)
      .filter(([_, value]) => value)
      .map(([key, _]) => key),
    missingKeys: Object.entries(apiKeys)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key),
    details: apiKeys,
    fallbackChains: {
      ai: ['OpenAI', 'Grok'],
      financialData: ['Alpha Vantage', 'Twelve Data', 'Finnhub', 'Polygon']
    },
    recommendations: {
      required: hasAIService ? 
        (hasFinancialData ? 'All required keys configured!' : 'Add a financial data API key (Alpha Vantage recommended)') :
        'Add an AI service API key (OpenAI recommended)',
      optional: 'Consider adding News API for enhanced market insights',
      fallbackInfo: 'APIs will automatically fallback in order if primary services fail or exceed limits'
    }
  }

  return NextResponse.json(summary)
} 