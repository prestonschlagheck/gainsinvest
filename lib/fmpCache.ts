// FMP API Caching System
// Optimized for Financial Modeling Prep API with batching and intelligent caching

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  expired?: boolean
}

interface FMPQuoteResponse {
  symbol: string
  name: string
  price: number
  changesPercentage: number
  change: number
  dayLow: number
  dayHigh: number
  yearHigh: number
  yearLow: number
  marketCap: number
  priceAvg50: number
  priceAvg200: number
  volume: number
  avgVolume: number
  exchange: string
  open: number
  previousClose: number
  timestamp: number
}

interface FMPNewsItem {
  title: string
  content: string
  tickers: string[]
  image: string
  link: string
  author: string
  site: string
  publishedDate: string
}

class FMPCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private pendingRequests: Map<string, Promise<any>> = new Map()
  private apiKey: string
  private baseUrl = 'https://financialmodelingprep.com/api/v3'
  private dailyCallCount = 0
  private lastResetDate = new Date().toDateString()
  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.resetDailyCountIfNeeded()
  }

  private resetDailyCountIfNeeded() {
    const today = new Date().toDateString()
    if (this.lastResetDate !== today) {
      this.dailyCallCount = 0
      this.lastResetDate = today
      console.log('🔄 FMP daily call count reset')
    }
  }

  private generateCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = params[key]
        return sorted
      }, {} as Record<string, any>)
    
    return `${endpoint}_${JSON.stringify(sortedParams)}`
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private getCachedData<T>(key: string): { data: T; expired: boolean } | null {
    const item = this.cache.get(key)
    if (!item) return null

    const expired = this.isExpired(item)
    return { data: item.data, expired }
  }

  private setCachedData<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  private async makeApiCall(url: string): Promise<any> {
    this.resetDailyCountIfNeeded()
    
    if (this.dailyCallCount >= 250) {
      throw new Error('Daily API limit reached (250 calls)')
    }

    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}apikey=${this.apiKey}`
    
    console.log(`📞 FMP API Call #${this.dailyCallCount + 1}: ${url}`)
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'G.AI.NS/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`)
    }

    this.dailyCallCount++
    console.log(`✅ FMP API call successful. Daily count: ${this.dailyCallCount}/250`)

    return response.json()
  }

  // Batch quote fetching with smart caching
  async getQuotes(symbols: string[]): Promise<FMPQuoteResponse[]> {
    if (symbols.length === 0) return []

    // Sort symbols for consistent cache keys
    const sortedSymbols = [...symbols].sort()
    const batchKey = this.generateCacheKey('quote', { symbols: sortedSymbols.join(',') })
    
    // Check if request is already in progress
    if (this.pendingRequests.has(batchKey)) {
      console.log(`⏳ FMP quote request already in progress for: ${sortedSymbols.join(', ')}`)
      return this.pendingRequests.get(batchKey)!
    }

    // Check cache first
    const cached = this.getCachedData<FMPQuoteResponse[]>(batchKey)
    if (cached && !cached.expired) {
      console.log(`🎯 FMP cache hit for quotes: ${sortedSymbols.join(', ')}`)
      return cached.data
    }

    // Make API call
    const requestPromise = this.fetchQuotesBatch(sortedSymbols, batchKey, cached?.data)
    this.pendingRequests.set(batchKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.pendingRequests.delete(batchKey)
    }
  }

  private async fetchQuotesBatch(
    symbols: string[], 
    cacheKey: string, 
    fallbackData?: FMPQuoteResponse[]
  ): Promise<FMPQuoteResponse[]> {
    try {
      const symbolsParam = symbols.join(',')
      const url = `${this.baseUrl}/quote/${symbolsParam}`
      
      const data = await this.makeApiCall(url)
      
      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`⚠️ FMP returned no data for: ${symbols.join(', ')}`)
        
        if (fallbackData) {
          console.log(`🔄 Using expired cache data as fallback`)
          return fallbackData.map(item => ({ ...item, expired: true }))
        }
        
        throw new Error('No quote data received from FMP')
      }

      // Cache for 5 minutes (300,000 ms)
      this.setCachedData(cacheKey, data, 300000)
      
      console.log(`💾 FMP quotes cached for 5 minutes: ${symbols.join(', ')}`)
      return data

    } catch (error) {
      console.error(`❌ FMP quote fetch failed: ${error}`)
      
      // Return expired cache data if available
      if (fallbackData) {
        console.log(`🔄 Using expired cache data due to API error`)
        return fallbackData.map(item => ({ ...item, expired: true }))
      }
      
      throw error
    }
  }

  // Single quote for backward compatibility
  async getQuote(symbol: string): Promise<FMPQuoteResponse> {
    const quotes = await this.getQuotes([symbol])
    const quote = quotes.find(q => q.symbol === symbol.toUpperCase())
    
    if (!quote) {
      throw new Error(`No quote data found for ${symbol}`)
    }
    
    return quote
  }

  // News fetching with 24-hour cache
  async getNews(symbols?: string[], limit: number = 10): Promise<FMPNewsItem[]> {
    const cacheKey = this.generateCacheKey('news', { 
      symbols: symbols?.sort().join(',') || 'general',
      limit 
    })

    // Check if request is already in progress
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ FMP news request already in progress`)
      return this.pendingRequests.get(cacheKey)!
    }

    // Check cache first (24-hour TTL)
    const cached = this.getCachedData<FMPNewsItem[]>(cacheKey)
    if (cached && !cached.expired) {
      console.log(`🎯 FMP news cache hit`)
      return cached.data
    }

    // Make API call
    const requestPromise = this.fetchNews(symbols, limit, cacheKey, cached?.data)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  private async fetchNews(
    symbols?: string[], 
    limit: number = 10,
    cacheKey?: string,
    fallbackData?: FMPNewsItem[]
  ): Promise<FMPNewsItem[]> {
    try {
      let url = `${this.baseUrl}/stock_news?limit=${limit}`
      
      if (symbols && symbols.length > 0) {
        url += `&tickers=${symbols.join(',')}`
      }

      const data = await this.makeApiCall(url)
      
      if (!Array.isArray(data)) {
        console.warn(`⚠️ FMP returned invalid news data`)
        
        if (fallbackData) {
          console.log(`🔄 Using expired news cache as fallback`)
          return fallbackData
        }
        
        return []
      }

      // Cache for 24 hours (86,400,000 ms)
      if (cacheKey) {
        this.setCachedData(cacheKey, data, 86400000)
        console.log(`💾 FMP news cached for 24 hours`)
      }
      
      return data

    } catch (error) {
      console.error(`❌ FMP news fetch failed: ${error}`)
      
      // Return expired cache data if available
      if (fallbackData) {
        console.log(`🔄 Using expired news cache due to API error`)
        return fallbackData
      }
      
      return []
    }
  }

  // Historical data with caching
  async getHistoricalData(symbol: string, days: number = 30): Promise<any[]> {
    const cacheKey = this.generateCacheKey('historical', { symbol, days })

    // Check cache first (24-hour TTL for historical data)
    const cached = this.getCachedData<any[]>(cacheKey)
    if (cached && !cached.expired) {
      console.log(`🎯 FMP historical cache hit for ${symbol}`)
      return cached.data
    }

    try {
      const url = `${this.baseUrl}/historical-price-full/${symbol}?timeseries=${days}`
      const response = await this.makeApiCall(url)
      
      const data = response.historical || []
      
      // Cache for 24 hours
      this.setCachedData(cacheKey, data, 86400000)
      console.log(`💾 FMP historical data cached for ${symbol}`)
      
      return data

    } catch (error) {
      console.error(`❌ FMP historical fetch failed for ${symbol}: ${error}`)
      
      // Return expired cache if available
      if (cached) {
        console.log(`🔄 Using expired historical cache for ${symbol}`)
        return cached.data
      }
      
      return []
    }
  }

  // Cache stats for monitoring
  getCacheStats(): {
    size: number
    dailyCallCount: number
    remainingCalls: number
    hitRate: number
  } {
    return {
      size: this.cache.size,
      dailyCallCount: this.dailyCallCount,
      remainingCalls: 250 - this.dailyCallCount,
      hitRate: 0 // Would need hit/miss counters to implement
    }
  }

  // Clear expired cache entries
  cleanupCache(): void {
    const now = Date.now()
    let removed = 0
    
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        removed++
      }
    }
    
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired cache entries`)
    }
  }
}

// Singleton instance
let fmpCacheInstance: FMPCache | null = null

export function getFMPCache(): FMPCache {
  if (!fmpCacheInstance) {
    const apiKey = process.env.FMP_API_KEY
    if (!apiKey) {
      throw new Error('FMP_API_KEY environment variable is required')
    }
    fmpCacheInstance = new FMPCache(apiKey)
  }
  return fmpCacheInstance
}

export { FMPCache, type FMPQuoteResponse, type FMPNewsItem }
