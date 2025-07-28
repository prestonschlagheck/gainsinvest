import { NextRequest, NextResponse } from 'next/server'
import { getStockData } from '@/lib/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 })
  }

  try {
    const stockData = await getStockData(symbol)
    
    if (!stockData) {
      return NextResponse.json({ error: 'Unable to fetch stock data' }, { status: 404 })
    }

    return NextResponse.json({
      symbol: stockData.symbol,
      price: stockData.price,
      change: stockData.change,
      changePercent: stockData.changePercent,
      lastUpdated: new Date().toISOString(),
      source: stockData.source
    })
  } catch (error) {
    console.error('Error fetching stock price:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
} 