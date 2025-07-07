import { NextResponse } from 'next/server'

export async function GET() {
  // Check if keys are configured with real values (not placeholders)
  const isRealKey = (key: string | undefined, placeholder: string) => {
    return key && key !== placeholder && key.trim() !== ''
  }

  const apiKeys = {
    openai: isRealKey(process.env.OPENAI_API_KEY, 'your_openai_api_key_here'),
    grok: isRealKey(process.env.GROK_API_KEY, 'your_grok_api_key_here'),
    alphaVantage: isRealKey(process.env.ALPHA_VANTAGE_API_KEY, 'your_alpha_vantage_key_here'),
    finnhub: isRealKey(process.env.FINNHUB_API_KEY, 'your_finnhub_key_here'),
    polygon: isRealKey(process.env.POLYGON_API_KEY, 'your_polygon_key_here'),
    newsApi: isRealKey(process.env.NEWS_API_KEY, 'your_news_api_key_here'),
  }

  const hasAIService = apiKeys.openai || apiKeys.grok
  const hasFinancialData = apiKeys.alphaVantage || apiKeys.finnhub || apiKeys.polygon
  
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
    recommendations: {
      required: hasAIService ? 
        (hasFinancialData ? 'All required keys configured!' : 'Add a financial data API key (Alpha Vantage recommended)') :
        'Add an AI service API key (OpenAI recommended)',
      optional: 'Consider adding News API for enhanced market insights'
    }
  }

  return NextResponse.json(summary)
} 