import { NextRequest, NextResponse } from 'next/server'
import { getFMPCache } from '@/lib/fmpCache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')
    const type = searchParams.get('type') || 'quote'
    
    if (!symbols) {
      return NextResponse.json(
        { error: 'symbols parameter is required' },
        { status: 400 }
      )
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase())
    const fmpCache = getFMPCache()

    let data: any
    let responseType: string

    switch (type) {
      case 'quote':
        data = await fmpCache.getQuotes(symbolList)
        responseType = 'quotes'
        break
        
      case 'news':
        const limit = parseInt(searchParams.get('limit') || '10')
        data = await fmpCache.getNews(symbolList, limit)
        responseType = 'news'
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported: quote, news' },
          { status: 400 }
        )
    }

    // Get cache stats for monitoring
    const stats = fmpCache.getCacheStats()

    return NextResponse.json({
      success: true,
      type: responseType,
      symbols: symbolList,
      count: Array.isArray(data) ? data.length : 0,
      data,
      meta: {
        cached: true, // This endpoint always uses cache
        apiCallsToday: stats.dailyCallCount,
        remainingCalls: stats.remainingCalls,
        cacheSize: stats.size
      }
    })

  } catch (error) {
    console.error('FMP Batch API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbols, type = 'quote', ...options } = body
    
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'symbols array is required in request body' },
        { status: 400 }
      )
    }

    const symbolList = symbols.map((s: string) => s.trim().toUpperCase())
    const fmpCache = getFMPCache()

    let data: any
    let responseType: string

    switch (type) {
      case 'quote':
        data = await fmpCache.getQuotes(symbolList)
        responseType = 'quotes'
        break
        
      case 'news':
        const limit = options.limit || 10
        data = await fmpCache.getNews(symbolList, limit)
        responseType = 'news'
        break
        
      case 'historical':
        // For historical, we need to handle each symbol individually
        // but we can batch the cache lookups
        const historicalPromises = symbolList.map(symbol => 
          fmpCache.getHistoricalData(symbol, options.days || 30)
        )
        const historicalResults = await Promise.all(historicalPromises)
        
        data = symbolList.reduce((acc, symbol, index) => {
          acc[symbol] = historicalResults[index]
          return acc
        }, {} as Record<string, any[]>)
        responseType = 'historical'
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported: quote, news, historical' },
          { status: 400 }
        )
    }

    // Get cache stats for monitoring
    const stats = fmpCache.getCacheStats()

    return NextResponse.json({
      success: true,
      type: responseType,
      symbols: symbolList,
      count: Array.isArray(data) ? data.length : Object.keys(data).length,
      data,
      meta: {
        cached: true,
        apiCallsToday: stats.dailyCallCount,
        remainingCalls: stats.remainingCalls,
        cacheSize: stats.size,
        requestedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('FMP Batch POST Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
