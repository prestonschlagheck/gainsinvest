import { NextRequest, NextResponse } from 'next/server'
import { getFMPCache } from '@/lib/fmpCache'

export async function GET(request: NextRequest) {
  try {
    const fmpCache = getFMPCache()
    const stats = fmpCache.getCacheStats()
    
    // Clean up expired cache entries
    fmpCache.cleanupCache()
    
    // Get real API usage data
    const dailyApiCalls = stats.dailyCallCount
    const remainingCalls = Math.max(0, 250 - dailyApiCalls)
    const usagePercentage = ((dailyApiCalls / 250) * 100).toFixed(1)
    
    // Determine status based on remaining calls
    let status = 'healthy'
    if (remainingCalls <= 10) {
      status = 'critical'
    } else if (remainingCalls <= 50) {
      status = 'warning'
    }
    
    return NextResponse.json({
      success: true,
      stats: {
        cacheSize: stats.size,
        dailyApiCalls: dailyApiCalls,
        remainingCalls: remainingCalls,
        usagePercentage: usagePercentage,
        status: status
      },
      limits: {
        dailyLimit: 250,
        priceCache: '5 minutes',
        newsCache: '24 hours',
        historicalCache: '24 hours'
      },
      recommendations: {
        cacheHits: 'Tracked per request',
        batchingActive: true,
        failoverEnabled: true
      },
      note: 'Real-time API usage tracking'
    })
  } catch (error) {
    console.error('FMP Stats Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stats: {
        status: 'error'
      }
    }, { status: 500 })
  }
}
