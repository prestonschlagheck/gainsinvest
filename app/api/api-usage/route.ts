import { NextRequest, NextResponse } from 'next/server'
import { getFMPCache } from '@/lib/fmpCache'

export async function GET(request: NextRequest) {
  try {
    // Get real FMP API usage data
    const fmpCache = getFMPCache()
    const fmpStats = fmpCache.getCacheStats()
    
    console.log(`🔍 API Usage GET - FMP Stats:`, fmpStats)
    
    // FMP starts with 250 calls per day
    const dailyLimit = 250
    const dailyCalls = fmpStats.dailyCallCount
    const remainingCalls = Math.max(0, dailyLimit - dailyCalls)
    const usagePercentage = ((dailyCalls / dailyLimit) * 100).toFixed(1)
    
    let status = 'healthy'
    if (remainingCalls <= 10) {
      status = 'critical'
    } else if (remainingCalls <= 50) {
      status = 'warning'
    }
    
    const response = {
      success: true,
      stats: {
        dailyApiCalls: dailyCalls,
        remainingCalls: remainingCalls,
        usagePercentage: usagePercentage,
        status: status,
        totalCalls: fmpStats.dailyCallCount
      },
      limits: {
        dailyLimit: dailyLimit,
        resetTime: 'Daily at midnight UTC',
        provider: 'Financial Modeling Prep (FMP)',
        note: 'Real-time FMP API usage tracking'
      }
    }
    
    console.log(`📊 API Usage Response:`, response)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('API Usage Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch API usage stats'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { increment = 1 } = await request.json()
    
    // Get current FMP stats
    const fmpCache = getFMPCache()
    const fmpStats = fmpCache.getCacheStats()
    
    console.log(`📊 FMP API usage: Daily ${fmpStats.dailyCallCount}/250, Remaining: ${fmpStats.remainingCalls}`)
    
    return NextResponse.json({
      success: true,
      message: 'FMP API usage tracked successfully',
      currentUsage: {
        dailyCalls: fmpStats.dailyCallCount,
        remainingCalls: fmpStats.remainingCalls
      }
    })
  } catch (error) {
    console.error('API Usage Update Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update API usage'
    }, { status: 500 })
  }
}
