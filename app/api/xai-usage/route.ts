import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const grokApiKey = process.env.GROK_API_KEY
    
    if (!grokApiKey) {
      return NextResponse.json({
        error: 'XAI API key not configured',
        usage: null
      })
    }

    // Try to get usage information from XAI API
    // Note: XAI may not provide usage endpoints, so this is a placeholder
    try {
      const response = await fetch('https://api.x.ai/v1/usage', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const usageData = await response.json()
        return NextResponse.json({
          success: true,
          usage: usageData
        })
      } else {
        // If XAI doesn't provide usage endpoint, return a message
        return NextResponse.json({
          success: false,
          message: 'XAI usage endpoint not available',
          usage: {
            message: 'Usage information not available from XAI API',
            suggestion: 'Check your XAI dashboard at https://console.x.ai/ for usage details'
          }
        })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Unable to fetch XAI usage',
        usage: {
          message: 'Please check your XAI dashboard at https://console.x.ai/ for usage and billing information',
          dashboard: 'https://console.x.ai/'
        }
      })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check XAI usage',
      usage: null
    }, { status: 500 })
  }
} 