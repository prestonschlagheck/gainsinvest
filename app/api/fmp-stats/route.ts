import { NextRequest, NextResponse } from 'next/server'
import { getFMPCache } from '@/lib/fmpCache'

export async function GET(request: NextRequest) {
  try {
    const fmpCache = getFMPCache()
    const stats = fmpCache.getCacheStats()
    
    // Clean up expired cache entries
    fmpCache.cleanupCache()
    
    return NextResponse.json({
      success: true,
      stats: {
        cacheSize: stats.size,
        dailyApiCalls: stats.dailyCallCount,
        remainingCalls: stats.remainingCalls,
        usagePercentage: ((stats.dailyCallCount / 250) * 100).toFixed(1),
        status: stats.remainingCalls > 50 ? 'healthy' : stats.remainingCalls > 10 ? 'warning' : 'critical'
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
      }
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
