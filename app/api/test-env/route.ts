import { NextResponse } from 'next/server'

export async function GET() {
  // Test environment variables (without exposing actual keys)
  const envTest = {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGrok: !!process.env.GROK_API_KEY,
    hasAlphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
    hasTwelveData: !!process.env.TWELVE_DATA_API_KEY,
    hasFinnhub: !!process.env.FINNHUB_API_KEY,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(envTest)
} 