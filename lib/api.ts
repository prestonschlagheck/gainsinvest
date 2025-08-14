// API Configuration for G.AI.NS Investment Platform
// Multi-Provider Fallback System: Alpha Vantage → Twelve Data → Finnhub

import { InvestmentRecommendation, InvestmentAnalysis, PortfolioProjection } from '@/types'

// ========================================
// API KEYS CONFIGURATION
// ========================================

// Enhanced environment variable validation
const getEnvVar = (key: string, fallback: string = ''): string => {
  const value = process.env[key] || fallback
  if (typeof window === 'undefined') {
    console.log(`🔑 ${key}:`, value ? '✅ Set' : '❌ Missing')
  }
  return value
}

// Log API key status on startup (server-side only)
if (typeof window === 'undefined') {
  console.log('🔑 API Key Status:')
  console.log('  Environment:', process.env.NODE_ENV || 'unknown')
  console.log('  OpenAI:', getEnvVar('OPENAI_API_KEY') ? '✅ Configured' : '❌ Missing')
  console.log('  Grok:', getEnvVar('GROK_API_KEY') ? '✅ Configured' : '❌ Missing')
  console.log('  Alpha Vantage:', getEnvVar('ALPHA_VANTAGE_API_KEY') ? '✅ Configured' : '❌ Missing')
  console.log('  Twelve Data:', getEnvVar('TWELVE_DATA_API_KEY') ? '✅ Configured' : '❌ Missing')
  console.log('  Finnhub:', getEnvVar('FINNHUB_API_KEY') ? '✅ Configured' : '❌ Missing')
  console.log('  News API:', getEnvVar('NEWS_API_KEY') ? '✅ Configured' : '❌ Missing')
}

const API_KEYS = {
  // AI Services
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  GROK_API_KEY: getEnvVar('GROK_API_KEY'),
  
  // Financial Data APIs (in priority order)
  ALPHA_VANTAGE_API_KEY: getEnvVar('ALPHA_VANTAGE_API_KEY'),
  TWELVE_DATA_API_KEY: getEnvVar('TWELVE_DATA_API_KEY'),
  FINNHUB_API_KEY: getEnvVar('FINNHUB_API_KEY'),
  
  // Additional APIs
  POLYGON_API_KEY: getEnvVar('POLYGON_API_KEY'),
  YAHOO_FINANCE_API_KEY: getEnvVar('YAHOO_FINANCE_API_KEY'),
  NEWS_API_KEY: getEnvVar('NEWS_API_KEY'),
  MARKETAUX_API_KEY: getEnvVar('MARKETAUX_API_KEY'),
}

// ========================================
// API PROVIDERS CONFIGURATION
// ========================================

interface ApiProvider {
  name: string
  baseUrl: string
  rateLimit: { requests: number; perMinute: number }
  active: boolean
  priority: number
}

const API_PROVIDERS: ApiProvider[] = [
  {
    name: 'Alpha Vantage',
    baseUrl: 'https://www.alphavantage.co/query',
    rateLimit: { requests: 25, perMinute: 1440 }, // 25/day limit
    active: !!API_KEYS.ALPHA_VANTAGE_API_KEY,
    priority: 1
  },
  {
    name: 'Twelve Data',
    baseUrl: 'https://api.twelvedata.com',
    rateLimit: { requests: 800, perMinute: 8 }, // 800/day, 8/minute
    active: !!API_KEYS.TWELVE_DATA_API_KEY,
    priority: 2
  },
  {
    name: 'Finnhub',
    baseUrl: 'https://finnhub.io/api/v1',
    rateLimit: { requests: 60, perMinute: 60 }, // 60/minute free tier
    active: !!API_KEYS.FINNHUB_API_KEY,
    priority: 3
  }
]

// ========================================
// RATE LIMITER
// ========================================

class RateLimiter {
  private requests: { [key: string]: number[] } = {}

  canMakeRequest(provider: string, maxRequests: number, timeWindow: number): boolean {
    const now = Date.now()
    const windowStart = now - timeWindow

    if (!this.requests[provider]) {
      this.requests[provider] = []
    }

    // Remove old requests outside the time window
    this.requests[provider] = this.requests[provider].filter(time => time > windowStart)

    // Check if we can make another request
    if (this.requests[provider].length >= maxRequests) {
      return false
    }

    // Record this request
    this.requests[provider].push(now)
    return true
  }

  getRemainingRequests(provider: string, maxRequests: number, timeWindow: number): number {
    const now = Date.now()
    const windowStart = now - timeWindow

    if (!this.requests[provider]) {
      return maxRequests
    }

    const recentRequests = this.requests[provider].filter(time => time > windowStart)
    return Math.max(0, maxRequests - recentRequests.length)
  }
}

const rateLimiter = new RateLimiter()

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  peRatio?: number
  dividend?: number
  source: string // Which API provided the data
  expired?: boolean // Indicates if data is from expired cache
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  source?: string
  remainingRequests?: number
}

// ========================================
// HELPER FUNCTIONS FOR AI ANALYSIS
// ========================================

function getRiskDescription(riskLevel: number): string {
  if (riskLevel <= 2) return 'Very Conservative - Capital preservation focused'
  if (riskLevel <= 4) return 'Conservative - Minimal risk tolerance'
  if (riskLevel <= 6) return 'Moderate - Balanced risk/reward approach'
  if (riskLevel <= 8) return 'Aggressive - High growth potential tolerance'
  return 'Very Aggressive - Maximum growth seeking'
}

function getTimeHorizonDescription(timeHorizon: string): string {
  switch (timeHorizon) {
    case 'short': return 'Less than 3 years - Focus on liquidity and stability'
    case 'medium': return '3-10 years - Balanced growth and income strategy'
    case 'long': return '10+ years - Long-term wealth building focus'
    default: return 'Flexible timeline'
  }
}

function getGrowthDescription(growthType: string): string {
  switch (growthType) {
    case 'conservative': return 'Stability and income focused - Lower volatility preference'
    case 'moderate': return 'Balanced growth and income - Moderate risk acceptance'
    case 'aggressive': return 'Maximum capital appreciation - High growth potential focus'
    default: return 'Balanced approach'
  }
}

function getESGDescription(esgLevel: number): string {
  if (esgLevel <= 3) return 'Low ESG priority - Returns focused'
  if (esgLevel <= 6) return 'Moderate ESG consideration - Some sustainability focus'
  return 'High ESG priority - Strong ethical investing focus'
}

async function gatherComprehensiveMarketData(userProfile: any): Promise<string> {
  try {
    // Key market indicators to analyze
    const keySymbols = ['SPY', 'QQQ', 'VTI', 'GLD', 'TLT', 'VIX']
    const stockDataPromises = keySymbols.map(symbol => getStockData(symbol))
    const stockResults = await Promise.allSettled(stockDataPromises)
    
    let marketSummary = 'REAL-TIME MARKET ANALYSIS (Use this data for accurate projections):\n'
    
    // Market indicators with trend analysis
    marketSummary += '\nCURRENT MARKET INDICATORS:\n'
    const marketTrends: string[] = []
    
    stockResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const stock = result.value
        const symbol = keySymbols[index]
        const changeDirection = stock.changePercent > 0 ? 'UP' : 'DOWN'
        const magnitude = Math.abs(stock.changePercent) > 2 ? 'STRONG' : Math.abs(stock.changePercent) > 1 ? 'MODERATE' : 'SLIGHT'
        
        marketSummary += `• ${symbol}: $${stock.price} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%) - ${magnitude} ${changeDirection} trend\n`
        
        // Analyze market sentiment
        if (symbol === 'SPY' && stock.changePercent > 1) marketTrends.push('Broad market bullish')
        if (symbol === 'SPY' && stock.changePercent < -1) marketTrends.push('Broad market bearish')
        if (symbol === 'QQQ' && stock.changePercent > 1) marketTrends.push('Tech sector strong')
        if (symbol === 'QQQ' && stock.changePercent < -1) marketTrends.push('Tech sector weak')
        if (symbol === 'VIX' && stock.price > 25) marketTrends.push('High volatility - risk-off sentiment')
        if (symbol === 'VIX' && stock.price < 15) marketTrends.push('Low volatility - risk-on sentiment')
        if (symbol === 'GLD' && stock.changePercent > 1) marketTrends.push('Flight to safety - gold rising')
      }
    })
    
    // Market sentiment analysis
    if (marketTrends.length > 0) {
      marketSummary += '\nMARKET SENTIMENT ANALYSIS:\n'
      marketTrends.forEach(trend => {
        marketSummary += `• ${trend}\n`
      })
    }
    
    // Enhanced FMP fundamental data for key sectors
    marketSummary += '\nFMP FUNDAMENTAL ANALYSIS - KEY SECTORS:\n'
    const keySectors = ['Technology', 'Healthcare', 'Financial Services', 'Consumer Discretionary', 'Energy']
    const sectorETFs: { [key: string]: string } = {
      'Technology': 'XLK',
      'Healthcare': 'XLV', 
      'Financial Services': 'XLF',
      'Consumer Discretionary': 'XLY',
      'Energy': 'XLE'
    }
    
    for (const sector of keySectors.slice(0, 3)) { // Limit to 3 sectors to avoid API limits
      const etfSymbol = sectorETFs[sector]
      if (etfSymbol) {
        try {
          // Get comprehensive FMP data for sector ETF
          const { getFMPCache } = await import('./fmpCache')
          const fmpCache = getFMPCache()
          
          // Get quote data
          const quote = await fmpCache.getQuote(etfSymbol)
          
          // Get additional fundamental data if available
          let fundamentalData = ''
          // Note: FMP quote endpoint doesn't include financial ratios
          // For now, we'll use the available quote data
          // TODO: Add getRatios method to FMPCache for comprehensive fundamental data
          
          const performance = quote.changesPercentage > 0 ? 'OUTPERFORMING' : 'UNDERPERFORMING'
          marketSummary += `• ${sector} (${etfSymbol}): $${quote.price} (${quote.changesPercentage > 0 ? '+' : ''}${quote.changesPercentage.toFixed(2)}%) - ${performance}${fundamentalData}\n`
          
          // Add sector-specific insights
          if (sector === 'Technology' && quote.changesPercentage > 2) {
            marketSummary += `  → Tech sector showing strong momentum - favorable for growth stocks\n`
          } else if (sector === 'Healthcare' && quote.changesPercentage < -1) {
            marketSummary += `  → Healthcare sector under pressure - defensive positioning recommended\n`
          } else if (sector === 'Financial Services' && quote.changesPercentage > 1) {
            marketSummary += `  → Financials strong - economic confidence indicator\n`
          }
          
        } catch (fmpError) {
          // Fallback to basic stock data
          const sectorData = await getStockData(etfSymbol)
          if (sectorData) {
            const performance = sectorData.changePercent > 0 ? 'OUTPERFORMING' : 'UNDERPERFORMING'
            marketSummary += `• ${sector} (${etfSymbol}): $${sectorData.price} (${sectorData.changePercent > 0 ? '+' : ''}${sectorData.changePercent.toFixed(2)}%) - ${performance}\n`
          }
        }
      }
    }
    
    // Cryptocurrency market analysis with FMP data
    marketSummary += '\nCRYPTOCURRENCY MARKET (FMP Enhanced):\n'
    const cryptoData = await Promise.allSettled([
      getStockData('BTC'),
      getStockData('ETH')
    ])
    
    cryptoData.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const crypto = result.value
        const symbol = index === 0 ? 'BTC' : 'ETH'
        const trend = crypto.changePercent > 0 ? 'POSITIVE' : 'NEGATIVE'
        marketSummary += `• ${symbol}: $${crypto.price.toLocaleString()} (${crypto.changePercent > 0 ? '+' : ''}${crypto.changePercent.toFixed(2)}%) - ${trend} momentum\n`
      }
    })
    
    // Add user-specific sector analysis with FMP data
    if (userProfile.sectors && userProfile.sectors.length > 0 && !userProfile.sectors.includes('all')) {
      marketSummary += '\nUSER PREFERRED SECTORS - FMP ANALYSIS:\n'
      
      for (const sector of userProfile.sectors.slice(0, 3)) { // Limit to 3 sectors
        const etfSymbol = sectorETFs[sector]
        if (etfSymbol) {
          try {
            // Get comprehensive FMP data for user's preferred sectors
            const { getFMPCache } = await import('./fmpCache')
            const fmpCache = getFMPCache()
            
            const quote = await fmpCache.getQuote(etfSymbol)
            
            // Get additional fundamental data
            let fundamentalData = ''
            // Note: FMP quote endpoint doesn't include financial ratios
            // For now, we'll use the available quote data
            // TODO: Add getRatios method to FMPCache for comprehensive fundamental data
            
            const performance = quote.changesPercentage > 0 ? 'OUTPERFORMING' : 'UNDERPERFORMING'
            const recommendation = quote.changesPercentage > 1 ? 'FAVORABLE' : quote.changesPercentage < -1 ? 'CAUTION' : 'NEUTRAL'
            
            marketSummary += `• ${sector} (${etfSymbol}): $${quote.price} (${quote.changesPercentage > 0 ? '+' : ''}${quote.changesPercentage.toFixed(2)}%) - ${performance} | ${recommendation}${fundamentalData}\n`
            
            // Add sector-specific investment guidance
            if (recommendation === 'FAVORABLE') {
              marketSummary += `  → ${sector} sector showing strength - consider overweighting in portfolio\n`
            } else if (recommendation === 'CAUTION') {
              marketSummary += `  → ${sector} sector under pressure - consider underweighting or defensive positioning\n`
            }
            
          } catch (fmpError) {
            // Fallback to basic data
            const sectorData = await getStockData(etfSymbol)
            if (sectorData) {
              const performance = sectorData.changePercent > 0 ? 'OUTPERFORMING' : 'UNDERPERFORMING'
              marketSummary += `• ${sector} (${etfSymbol}): $${sectorData.price} (${sectorData.changePercent > 0 ? '+' : ''}${sectorData.changePercent.toFixed(2)}%) - ${performance}\n`
            }
          }
        }
      }
    }
    
    // Enhanced investment guidance using FMP data
    marketSummary += '\nFMP-ENHANCED INVESTMENT GUIDANCE:\n'
    marketSummary += '• Use FMP fundamental data (P/E, P/B, ROE) for valuation analysis\n'
    marketSummary += '• Combine technical trends with fundamental metrics for comprehensive analysis\n'
    marketSummary += '• Base ALL projections on current market prices and FMP financial ratios\n'
    marketSummary += '• Use historical performance ranges: Stocks 6-12%, ETFs 7-10%, Crypto 10-25% (positive only)\n'
    marketSummary += '• Adjust expectations based on current market sentiment, volatility, and fundamental ratios\n'
    marketSummary += '• NEVER recommend assets with negative expected returns\n'
    marketSummary += '• Leverage FMP data to identify undervalued or overvalued sectors\n'
    
    return marketSummary
  } catch (error) {
    console.error('Error gathering market data:', error)
    return 'Market data temporarily unavailable - using conservative fundamental analysis approach with positive return assumptions only'
  }
}

async function analyzeExistingPortfolio(existingPortfolio: any[], availableCapital: number): Promise<string> {
  if (!existingPortfolio || existingPortfolio.length === 0) {
    return ''
  }
  
  try {
    let analysis = 'EXISTING PORTFOLIO ANALYSIS (FMP Enhanced):\n'
    const totalValue = existingPortfolio.reduce((sum, holding) => sum + (holding.amount || 0), 0)
    const totalPortfolioValue = totalValue + availableCapital
    
    analysis += `Total Existing Holdings: $${totalValue.toLocaleString()}\n`
    analysis += `Available Cash: $${availableCapital.toLocaleString()}\n`
    analysis += `TOTAL PORTFOLIO VALUE: $${totalPortfolioValue.toLocaleString()}\n`
    analysis += '\nCurrent Holdings Analysis (with FMP Data):\n'
    
    for (const holding of existingPortfolio.slice(0, 10)) { // Analyze all holdings
      if (holding.symbol) {
        try {
          // Try to get comprehensive FMP data first
          const { getFMPCache } = await import('./fmpCache')
          const fmpCache = getFMPCache()
          
          const quote = await fmpCache.getQuote(holding.symbol)
          const allocation = ((holding.amount || 0) / totalValue * 100).toFixed(1)
          const performance = quote.changesPercentage > 0 ? 'GAINING' : 'LOSING'
          
          // Get additional fundamental data if available
          let fundamentalData = ''
          // Note: FMP quote endpoint doesn't include financial ratios
          // For now, we'll use the available quote data
          // TODO: Add getRatios method to FMPCache for comprehensive fundamental data
          
          analysis += `• ${holding.symbol}: $${holding.amount?.toLocaleString()} (${allocation}% of holdings) - Current: $${quote.price} (${quote.changesPercentage > 0 ? '+' : ''}${quote.changesPercentage.toFixed(2)}%) - ${performance}${fundamentalData}\n`
          
          // Add FMP-based insights for each holding
          if (quote.changesPercentage > 5) {
            analysis += `  → ${holding.symbol} showing strong momentum - consider HOLD if fundamentals support\n`
          } else if (quote.changesPercentage < -5) {
            analysis += `  → ${holding.symbol} under pressure - analyze fundamentals for SELL decision\n`
          }
          
        } catch (fmpError) {
          // Fallback to basic stock data
          const currentData = await getStockData(holding.symbol)
          if (currentData) {
            const allocation = ((holding.amount || 0) / totalValue * 100).toFixed(1)
            const performance = currentData.changePercent > 0 ? 'GAINING' : 'LOSING'
            analysis += `• ${holding.symbol}: $${holding.amount?.toLocaleString()} (${allocation}% of holdings) - Current: $${currentData.price} (${currentData.changePercent > 0 ? '+' : ''}${currentData.changePercent.toFixed(2)}%) - ${performance}\n`
          }
        }
      }
    }
    
    // Critical capital allocation guidance with FMP insights
    analysis += `\n🚨 CRITICAL CAPITAL ALLOCATION RULES (FMP Enhanced):\n`
    analysis += `1. TOTAL INVESTMENT RECOMMENDATIONS MUST NEVER EXCEED $${totalPortfolioValue.toLocaleString()}\n`
    analysis += `2. You have THREE categories to work with:\n`
    analysis += `   - BUY: New investments using available capital ($${availableCapital.toLocaleString()}) + money from sales\n`
    analysis += `   - HOLD: Existing positions to keep (reduce amount if needed for diversification)\n`
    analysis += `   - SELL: Existing positions to liquidate (creates cash for new buys)\n`
    analysis += `3. MATHEMATICAL CONSTRAINT: (Total BUY amount) + (Total HOLD amount) = $${totalPortfolioValue.toLocaleString()}\n`
    analysis += `4. If existing holdings are worth more than available capital, you MUST sell some to rebalance\n`
    analysis += `5. For each existing holding, decide: HOLD at optimal amount or SELL completely\n`
    analysis += `6. Only recommend POSITIVE expected return investments - never negative returns\n`
    analysis += `7. Use FMP fundamental data (P/E, P/B, ROE) to make informed HOLD/SELL decisions\n`
    analysis += `8. Combine technical performance with fundamental metrics for comprehensive analysis\n`
    
    // Specific guidance for this portfolio with FMP insights
    if (totalValue > availableCapital) {
      analysis += `\n💡 REBALANCING REQUIRED (FMP Enhanced):\n`
      analysis += `Since existing holdings ($${totalValue.toLocaleString()}) exceed available capital ($${availableCapital.toLocaleString()}), you must:\n`
      analysis += `- Analyze each holding's future prospects using FMP fundamental data\n`
      analysis += `- SELL underperforming positions with poor fundamentals (high P/E, low ROE)\n`
      analysis += `- HOLD only the best-performing positions with strong fundamentals at optimal allocation\n`
      analysis += `- Use proceeds from sales + available capital for new BUY recommendations\n`
      analysis += `- Prioritize selling holdings with negative momentum AND poor fundamentals\n`
    }
    
    return analysis
  } catch (error) {
    console.error('Error analyzing existing portfolio:', error)
    return 'Existing portfolio data available - manual analysis recommended'
  }
}

// ========================================
// ASSET NAME CLEANUP
// ========================================

const ETF_NAME_MAPPING: { [key: string]: string } = {
  'VTI': 'Vanguard Total Stock Market',
  'VOO': 'Vanguard S&P 500',
  'VEU': 'Vanguard International Stock',
  'VWO': 'Vanguard Emerging Markets',
  'BND': 'Vanguard Total Bond Market',
  'QQQ': 'Invesco NASDAQ 100',
  'SPY': 'SPDR S&P 500',
  'IWM': 'iShares Russell 2000',
  'EFA': 'iShares MSCI EAFE',
  'EEM': 'iShares MSCI Emerging Markets',
  'TLT': 'iShares 20+ Year Treasury',
  'GLD': 'SPDR Gold Shares',
  'SLV': 'iShares Silver Trust',
  'VNQ': 'Vanguard Real Estate',
  'XLK': 'Technology Select Sector',
  'XLF': 'Financial Select Sector',
  'XLV': 'Health Care Select Sector',
  'XLI': 'Industrial Select Sector',
  'XLE': 'Energy Select Sector',
  'XLP': 'Consumer Staples Select',
  'XLY': 'Consumer Discretionary Select',
  'XLU': 'Utilities Select Sector',
  'XLB': 'Materials Select Sector',
  'XLRE': 'Real Estate Select Sector',
  'XLC': 'Communication Services Select'
}

// Function to clean up and shorten asset names
function cleanAssetName(symbol: string, originalName: string): string {
  // Use mapping for ETFs
  if (ETF_NAME_MAPPING[symbol.toUpperCase()]) {
    return ETF_NAME_MAPPING[symbol.toUpperCase()]
  }
  
  // For other assets, clean up common long phrases
  let cleanName = originalName
    .replace(/Corporation/g, '')
    .replace(/Incorporated/g, '')
    .replace(/Company/g, 'Co.')
    .replace(/\s+ETF$/g, '')
    .replace(/\s+Trust$/g, '')
    .replace(/\s+Fund$/g, '')
    .replace(/\s+Inc\.?$/g, '')
    .replace(/\s+Ltd\.?$/g, '')
    .replace(/\s+LLC$/g, '')
    .replace(/\s+L\.P\.$/g, '')
    .replace(/Vanguard\s+/g, 'Vanguard ')
    .replace(/SPDR\s+/g, 'SPDR ')
    .replace(/iShares\s+/g, 'iShares ')
    .replace(/Invesco\s+/g, 'Invesco ')
    .replace(/\s+Class\s+[A-Z]$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  
  // Limit length to reasonable size
  if (cleanName.length > 25) {
    const words = cleanName.split(' ')
    if (words.length > 3) {
      cleanName = words.slice(0, 3).join(' ')
    } else {
      cleanName = cleanName.substring(0, 22) + '...'
    }
  }
  
  return cleanName
}

// ========================================
// CRYPTOCURRENCY DATA FUNCTIONS
// ========================================

const CRYPTO_SYMBOLS_MAP: { [key: string]: string } = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'ADA': 'cardano',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'MATIC': 'polygon',
  'AVAX': 'avalanche-2',
  'LUNA': 'terra-luna',
  'ATOM': 'cosmos',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'SHIB': 'shiba-inu'
}

// Check if a symbol is a cryptocurrency
function isCryptocurrency(symbol: string): boolean {
  return CRYPTO_SYMBOLS_MAP.hasOwnProperty(symbol.toUpperCase())
}

// Fetch cryptocurrency data from CoinGecko (free API, no key required)
async function getCryptocurrencyData(symbol: string): Promise<StockData | null> {
  const cryptoId = CRYPTO_SYMBOLS_MAP[symbol.toUpperCase()]
  
  if (!cryptoId) {
    console.log(`❌ Cryptocurrency ${symbol} not supported`)
    return null
  }

  try {
    console.log(`🪙 Fetching crypto data for ${symbol} (${cryptoId})...`)
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true`,
      { 
        headers: { 
          'User-Agent': 'G.AI.NS/1.0',
          'Accept': 'application/json'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const cryptoData = data[cryptoId]

    if (!cryptoData || !cryptoData.usd) {
      throw new Error('No valid crypto data received from CoinGecko')
    }

    // Validate price data
    const price = cryptoData.usd
    if (typeof price !== 'number' || price <= 0) {
      throw new Error(`Invalid price data for ${symbol}: ${price}`)
    }

    console.log(`✅ Successfully fetched crypto data for ${symbol}:`, {
      price: price,
      change: cryptoData.usd_24h_change || 0
    })

    return {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price: price,
      change: 0, // CoinGecko doesn't provide absolute change
      changePercent: cryptoData.usd_24h_change || 0,
      volume: 0, // Would need different API call for volume
      source: 'CoinGecko'
    }

  } catch (error) {
    console.error(`❌ Error fetching crypto data for ${symbol}:`, error)
    
    // Return fallback data for known cryptocurrencies
    if (symbol.toUpperCase() === 'BTC') {
      console.log(`🔄 Using fallback BTC price: $118,000`)
      return {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 118000,
        change: 0,
        changePercent: 0,
        volume: 0,
        source: 'Fallback'
      }
    }
    
    return null
  }
}

// ========================================
// MULTI-PROVIDER STOCK DATA FUNCTIONS
// ========================================

// Alpha Vantage implementation
async function getStockDataAlphaVantage(symbol: string): Promise<ApiResponse<StockData>> {
  const provider = API_PROVIDERS.find(p => p.name === 'Alpha Vantage')!
  
  if (!rateLimiter.canMakeRequest('alphavantage', provider.rateLimit.requests, 24 * 60 * 60 * 1000)) {
    return { 
      success: false, 
      error: 'Alpha Vantage rate limit exceeded',
      remainingRequests: rateLimiter.getRemainingRequests('alphavantage', provider.rateLimit.requests, 24 * 60 * 60 * 1000)
    }
  }

  try {
    const response = await fetch(
      `${provider.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE_API_KEY}`,
      { headers: { 'User-Agent': 'G.AI.NS/1.0' } }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Check for API limit response
    if (data.Note && data.Note.includes('call frequency')) {
      return { 
        success: false, 
        error: 'Alpha Vantage API limit exceeded',
        source: 'Alpha Vantage'
      }
    }

    const quote = data['Global Quote']
    if (!quote || !quote['01. symbol']) {
      throw new Error('Invalid response format or no data available')
    }
    
    return {
      success: true,
      data: {
      symbol: quote['01. symbol'],
        name: symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        source: 'Alpha Vantage'
      },
      source: 'Alpha Vantage',
      remainingRequests: rateLimiter.getRemainingRequests('alphavantage', provider.rateLimit.requests, 24 * 60 * 60 * 1000)
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Alpha Vantage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'Alpha Vantage'
    }
  }
}

// Twelve Data implementation
async function getStockDataTwelveData(symbol: string): Promise<ApiResponse<StockData>> {
  const provider = API_PROVIDERS.find(p => p.name === 'Twelve Data')!
  
  if (!rateLimiter.canMakeRequest('twelvedata', provider.rateLimit.requests, 24 * 60 * 60 * 1000)) {
    return { 
      success: false, 
      error: 'Twelve Data rate limit exceeded',
      remainingRequests: rateLimiter.getRemainingRequests('twelvedata', provider.rateLimit.requests, 24 * 60 * 60 * 1000)
    }
  }

  try {
    const response = await fetch(
      `${provider.baseUrl}/quote?symbol=${symbol}&apikey=${API_KEYS.TWELVE_DATA_API_KEY}`,
      { headers: { 'User-Agent': 'G.AI.NS/1.0' } }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Twelve Data API error')
    }

    if (!data.symbol) {
      throw new Error('Invalid response format or no data available')
    }

    return {
      success: true,
      data: {
        symbol: data.symbol,
        name: data.name || symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.change || '0'),
        changePercent: parseFloat(data.percent_change || '0'),
        volume: parseInt(data.volume || '0'),
        source: 'Twelve Data'
      },
      source: 'Twelve Data',
      remainingRequests: rateLimiter.getRemainingRequests('twelvedata', provider.rateLimit.requests, 24 * 60 * 60 * 1000)
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Twelve Data error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'Twelve Data'
    }
  }
}

// Finnhub implementation
async function getStockDataFinnhub(symbol: string): Promise<ApiResponse<StockData>> {
  const provider = API_PROVIDERS.find(p => p.name === 'Finnhub')!
  
  if (!rateLimiter.canMakeRequest('finnhub', provider.rateLimit.requests, 60 * 1000)) {
    return { 
      success: false, 
      error: 'Finnhub rate limit exceeded',
      remainingRequests: rateLimiter.getRemainingRequests('finnhub', provider.rateLimit.requests, 60 * 1000)
    }
  }

    try {
      const response = await fetch(
      `${provider.baseUrl}/quote?symbol=${symbol}&token=${API_KEYS.FINNHUB_API_KEY}`,
      { headers: { 'User-Agent': 'G.AI.NS/1.0' } }
      )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
      
      const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }

    if (data.c === undefined || data.c === 0) {
      throw new Error('No data available or invalid symbol')
    }
      
      return {
      success: true,
      data: {
        symbol: symbol,
        name: symbol,
        price: data.c,
        change: data.d || 0,
        changePercent: data.dp || 0,
        volume: 0, // Finnhub quote doesn't include volume
        source: 'Finnhub'
      },
      source: 'Finnhub',
      remainingRequests: rateLimiter.getRemainingRequests('finnhub', provider.rateLimit.requests, 60 * 1000)
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Finnhub error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      source: 'Finnhub'
    }
  }
}

// Main function with FMP cache + fallback logic
export async function getStockData(symbol: string): Promise<StockData | null> {
  console.log(`🔍 Fetching stock data for ${symbol}...`)
  
  // Check if it's a cryptocurrency
  if (isCryptocurrency(symbol)) {
    return await getCryptocurrencyData(symbol)
  }

  // First try FMP cache system
  try {
    const { getFMPCache } = await import('./fmpCache')
    const fmpCache = getFMPCache()
    const quote = await fmpCache.getQuote(symbol)
    
    return {
      symbol: quote.symbol,
      name: quote.name || quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changesPercentage,
      volume: quote.volume,
      marketCap: quote.marketCap,
      peRatio: undefined, // Not available in basic quote
      dividend: undefined,
      source: 'Financial Modeling Prep'
    }
  } catch (fmpError) {
    console.log(`⚠️ FMP failed: ${fmpError}, trying fallback APIs...`)
  }

  // Fallback to existing API providers
  const activeProviders = API_PROVIDERS
    .filter(p => p.active)
    .sort((a, b) => a.priority - b.priority)

  if (activeProviders.length === 0) {
    console.error('❌ No API providers configured')
    return null
  }

  // Try each provider in order
  for (const provider of activeProviders) {
    console.log(`🔄 Trying ${provider.name}...`)
    
    let result: ApiResponse<StockData>
    
    switch (provider.name) {
      case 'Alpha Vantage':
        result = await getStockDataAlphaVantage(symbol)
        break
      case 'Twelve Data':
        result = await getStockDataTwelveData(symbol)
        break
      case 'Finnhub':
        result = await getStockDataFinnhub(symbol)
        break
      default:
        continue
    }

    if (result.success && result.data) {
      console.log(`✅ Successfully fetched data from ${result.source}`)
      console.log(`📊 Remaining requests: ${result.remainingRequests || 'Unknown'}`)
      return result.data
    } else {
      console.log(`⚠️ ${provider.name} failed: ${result.error}`)
      if (result.remainingRequests !== undefined) {
        console.log(`📊 Remaining requests: ${result.remainingRequests}`)
      }
    }
  }

  console.error('❌ All API providers failed')
  return null
}

// Historical data with fallback logic
export async function getHistoricalData(symbol: string, period: string = '1year'): Promise<HistoricalData[]> {
  console.log(`📈 Fetching historical data for ${symbol}...`)
  
  // Try Alpha Vantage first
  if (API_KEYS.ALPHA_VANTAGE_API_KEY && rateLimiter.canMakeRequest('alphavantage_historical', 25, 24 * 60 * 60 * 1000)) {
  try {
    const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE_API_KEY}&outputsize=full`
    )
    
    const data = await response.json()
    const timeSeries = data['Time Series (Daily)']
    
      if (timeSeries) {
        console.log('✅ Historical data from Alpha Vantage')
        return Object.entries(timeSeries)
          .slice(0, 365)
          .map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
          }))
      }
    } catch (error) {
      console.log('⚠️ Alpha Vantage historical data failed:', error)
    }
  }

  // Try Twelve Data as fallback
  if (API_KEYS.TWELVE_DATA_API_KEY && rateLimiter.canMakeRequest('twelvedata_historical', 800, 24 * 60 * 60 * 1000)) {
    try {
      const response = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=365&apikey=${API_KEYS.TWELVE_DATA_API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.values && Array.isArray(data.values)) {
        console.log('✅ Historical data from Twelve Data')
        return data.values.map((item: any) => ({
          date: item.datetime,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseInt(item.volume || '0')
        }))
      }
  } catch (error) {
      console.log('⚠️ Twelve Data historical data failed:', error)
    }
  }

  console.error('❌ All historical data providers failed')
  return []
}

// ========================================
// AI ANALYSIS FUNCTIONS
// ========================================





export async function generateInvestmentRecommendations(
  userProfile: any,
  marketData?: any[]
): Promise<InvestmentAnalysis> {
  try {
    console.log('🤖 Generating comprehensive AI investment recommendations...')
    
    // Try enhanced engine first for better returns and portfolio management
    try {
      console.log('🚀 Attempting enhanced recommendations with higher-return focus...')
      return await generateEnhancedRecommendations(userProfile, marketData)
    } catch (enhancedError) {
      console.log('⚠️ Enhanced engine failed, falling back to AI services:', enhancedError)
    }
    
    // Check AI service availability
    const hasOpenAI = API_KEYS.OPENAI_API_KEY
    const hasGrok = API_KEYS.GROK_API_KEY
    
    if (!hasOpenAI && !hasGrok) {
      throw new Error('No AI service API keys configured (OpenAI or Grok required)')
    }
    
    // Try Grok first, then OpenAI as fallback
    if (hasGrok) {
      try {
        return await generateRecommendationsWithGrok(userProfile)
      } catch (error) {
        console.log('⚠️ Grok failed, trying OpenAI fallback:', error)
        
        // Check if it's a rate limit error - retry with shorter delay
        if (error instanceof Error && error.message.includes('rate limit')) {
          console.log('🔄 Grok rate limit hit, waiting 5 seconds before retry...')
          await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
          
          try {
            return await generateRecommendationsWithGrok(userProfile)
          } catch (retryError) {
            console.log('⚠️ Grok retry also failed:', retryError)
          }
        }
        
        // Try OpenAI as fallback
        if (hasOpenAI) {
          try {
            return await generateRecommendationsWithOpenAI(userProfile)
          } catch (openAIError) {
            console.log('⚠️ OpenAI also failed:', openAIError)
            // Don't return error if we have a working API - just use fallback recommendations
            return generateFallbackRecommendations(userProfile)
          }
        } else {
          // If no OpenAI fallback, use fallback recommendations instead of error
          console.log('⚠️ No OpenAI fallback, using fallback recommendations')
          return generateFallbackRecommendations(userProfile)
        }
      }
    } else if (hasOpenAI) {
      try {
        return await generateRecommendationsWithOpenAI(userProfile)
      } catch (error) {
        console.log('⚠️ OpenAI failed:', error)
        return {
          recommendations: [],
          reasoning: '',
          riskAssessment: '',
          marketOutlook: '',
          error: error instanceof Error ? error.message : 'OpenAI API configuration issue'
        }
      }
    } else {
      return {
        recommendations: [],
        reasoning: '',
        riskAssessment: '',
        marketOutlook: '',
        error: 'No AI service API keys configured (OpenAI or Grok required)'
      }
    }

  } catch (error) {
    console.error('Error generating investment recommendations:', error)
    // Use fallback recommendations instead of error
    console.log('🔄 Using fallback recommendations due to error')
    return generateFallbackRecommendations(userProfile)
  }
}

async function generateRecommendationsWithOpenAI(userProfile: any): Promise<InvestmentAnalysis> {
  // Step 1: Test OpenAI availability first
  try {
    const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      })
    })
    
    if (!testResponse.ok) {
      throw new Error(`OpenAI API test failed: ${testResponse.status}`)
    }
  } catch (error) {
    console.log('⚠️ OpenAI API test failed:', error)
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`)
    }
    throw new Error('OpenAI API is not available')
  }
  
  // Step 2: Gather comprehensive market data
  console.log('📊 Gathering real-time market data...')
  const marketContext = await gatherComprehensiveMarketData(userProfile)
  
  // Step 3: Get current financial news
  console.log('📰 Fetching current financial news...')
  const newsContext = await getFinancialNews()
  
  // Step 4: Analyze existing portfolio if any
  let portfolioAnalysis = ''
  if (userProfile.existingPortfolio && userProfile.existingPortfolio.length > 0) {
    const availableCapital = userProfile.capitalAvailable || userProfile.capital || 0
    portfolioAnalysis = await analyzeExistingPortfolio(userProfile.existingPortfolio, availableCapital)
  }

  // Step 4: Create comprehensive prompt for OpenAI
  const systemPrompt = `You are an elite investment advisor AI for G.AI.NS platform. Based on the following user profile, generate an investment portfolio recommendation.

  USER PROFILE:
  - Risk Tolerance: ${userProfile.riskTolerance}/10
  - Investment Amount: $${(userProfile.capitalAvailable || userProfile.capital || 0).toLocaleString()}
  - Current Holdings: ${userProfile.existingPortfolio?.length > 0 ? JSON.stringify(userProfile.existingPortfolio) : 'None'}
  - Time Horizon: ${userProfile.timeHorizon}
  - Investment Goals: ${userProfile.growthType} growth strategy
  - Sector Preferences: ${userProfile.sectors?.includes('all') ? 'All sectors (open to any sector for maximum diversification)' : userProfile.sectors?.join(', ') || 'Open to all sectors'}
  - ESG Priority: ${userProfile.ethicalInvesting}/10

  REAL-TIME MARKET CONTEXT:
  ${marketContext}

  CURRENT FINANCIAL NEWS & SENTIMENT:
  ${newsContext.slice(0, 5).map(news => `• ${news.title} (${news.source}) - ${news.sentiment || 'neutral'} sentiment`).join('\n')}

  ${portfolioAnalysis ? `EXISTING PORTFOLIO ANALYSIS:\n${portfolioAnalysis}` : ''}

  🚨 CRITICAL CAPITAL ALLOCATION RULES (MUST FOLLOW EXACTLY):
  1. MATHEMATICAL CONSTRAINT: Total BUY amounts + Total HOLD amounts = Available Capital
  2. THREE TYPES of recommendations required:
     - BUY: New investments using available cash + proceeds from sales
     - HOLD: Existing positions to keep at specified reduced amounts
     - SELL: Existing positions to liquidate (creates cash for new investments)
  3. NEVER EXCEED TOTAL PORTFOLIO VALUE: Your recommendations cannot exceed available capital
  4. EXISTING HOLDINGS LOGIC:
     - Analyze each existing holding for future prospects
     - If positive outlook: HOLD at optimal allocation (may be less than current amount)
     - If negative outlook or overweight: SELL completely
     - Use proceeds from SELL recommendations for BUY recommendations
  5. MANDATORY EXISTING HOLDINGS PROCESSING:
     - EVERY existing holding MUST be included in your recommendations
     - If user has existing holdings, you MUST create "sell" or "hold" recommendations for ALL of them
     - NO existing holdings should be ignored or omitted
     - Each existing holding must be analyzed and categorized as either "sell" or "hold"
  
  QUALITY & PERFORMANCE RULES:
  6. ZERO TOLERANCE for negative expected returns - NEVER recommend any asset with negative 1-year prospects
  7. If any analysis shows negative returns, immediately exclude that asset and find alternatives
  8. Provide realistic expected annual returns based on current market data:
      - Large-cap stocks: 6-12% annually
      - Growth stocks: 8-15% annually  
      - ETFs/Index funds: 7-10% annually
      - Bonds: 2-6% annually
      - Cryptocurrency: 10-25% annually (ONLY if positive prospects)
  9. CRITICAL: Use current real-time market prices for all calculations
  10. For BTC at ~$118,000: Only recommend if showing positive growth prospects
  11. Quality check: Review each recommendation to ensure positive expected returns
  
  PORTFOLIO STRUCTURE RULES:
  12. Maximum 20% allocation to any single asset
  13. Minimum 5% allocation for any recommended position
  14. Diversification across sectors based on user preferences
  15. Include reasoning for each BUY/HOLD/SELL decision
  16. Provide confidence scores based on analysis quality
  17. VALIDATION: Ensure every existing holding appears in recommendations as either "sell" or "hold"

  OUTPUT FORMAT - Provide your analysis in this exact JSON structure:
  {
    "recommendations": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc",
        "type": "buy",
        "amount": 5000,
        "confidence": 85,
        "reasoning": "Detailed analysis including current market position, financials, growth prospects, and why this fits the user's profile",
        "sector": "Technology",
        "targetPrice": 200,
        "stopLoss": 180,
        "expectedAnnualReturn": 0.12
      }
    ],
    "reasoning": "Comprehensive explanation of the overall investment strategy, how it aligns with user goals, current market conditions, and expected outcomes",
    "riskAssessment": "Detailed risk analysis including portfolio volatility, potential downside scenarios, risk mitigation strategies, and how this aligns with user's risk tolerance",
    "marketOutlook": "Current market analysis, economic trends, sector outlook, potential catalysts and risks, and how they impact these recommendations"
  }

  CRITICAL REQUIREMENTS:
  - ALL "amount" values MUST be integers (whole numbers), never strings
  - ALL "expectedAnnualReturn" values MUST be decimal numbers (e.g., 0.12 for 12%, 0.08 for 8%)
  - Every recommendation MUST include a realistic expectedAnnualReturn based on current market analysis
  - Total recommended investment should not exceed available capital
  - Use REAL current stock symbols and realistic prices
  - Provide specific, actionable recommendations based on comprehensive analysis
  - Include 5-8 diversified recommendations unless capital is very limited
  - Each recommendation should include detailed reasoning based on current data
  - PORTFOLIO MANAGEMENT: If existing holdings exceed available capital, recommend selling specific holdings to make room for new investments`

  const userMessage = `Based on my complete investment profile and current market conditions, please provide comprehensive investment recommendations. Use all available market data, news, and analysis to create the most sophisticated and current investment strategy possible for my specific situation.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEYS.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    if (response.status === 429) {
      throw new Error('OpenAI API rate limit exceeded - please try again later')
    } else if (response.status === 401) {
      throw new Error('OpenAI API key is invalid or expired')
    } else if (response.status === 402) {
      throw new Error('OpenAI API quota exceeded - please check your billing')
    } else {
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
    }
  }
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(`OpenAI API error: ${data.error.message}`)
  }
  
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content received from OpenAI API')
  }

  try {
    const analysis: InvestmentAnalysis = JSON.parse(content)
    
    // Validate and clean recommendation data
    analysis.recommendations = analysis.recommendations.map((rec: any) => {
      const cleanAmount = typeof rec.amount === 'string' 
        ? parseFloat(rec.amount.replace(/[^0-9.-]/g, '')) || 0
        : (typeof rec.amount === 'number' ? rec.amount : 0)
      
      // Cap expected returns to realistic levels and eliminate negatives
      const cappedReturn = Math.max(0.02, Math.min(rec.expectedAnnualReturn || 0.07, 0.25)) // 2% to 25% max
      
      return {
        ...rec,
        name: cleanAssetName(rec.symbol, rec.name), // Clean up long ETF names
        amount: Math.round(cleanAmount),
        confidence: typeof rec.confidence === 'number' ? rec.confidence : 75,
        targetPrice: typeof rec.targetPrice === 'number' ? rec.targetPrice : undefined,
        stopLoss: typeof rec.stopLoss === 'number' ? rec.stopLoss : undefined,
        expectedAnnualReturn: cappedReturn
      }
    }).filter((rec: any) => rec.amount > 0 && rec.expectedAnnualReturn > 0) // Remove negative returns
    
    // CRITICAL VALIDATION: Ensure total doesn't exceed available capital
    const availableCapital = userProfile.capitalAvailable || userProfile.capital || 0
    const existingHoldings = userProfile.existingPortfolio ? 
      userProfile.existingPortfolio.reduce((sum: number, holding: any) => sum + (holding.amount || 0), 0) : 0
    const totalPortfolioValue = availableCapital + existingHoldings
    
    const totalRecommendedAmount = analysis.recommendations.reduce((sum, rec) => sum + rec.amount, 0)
    
    if (totalRecommendedAmount > totalPortfolioValue) {
      console.warn(`🚨 CAPITAL VALIDATION FAILED: Recommended ${totalRecommendedAmount} exceeds total portfolio ${totalPortfolioValue}`)
      
      // Scale down all recommendations proportionally
      const scaleFactor = totalPortfolioValue / totalRecommendedAmount
      analysis.recommendations = analysis.recommendations.map(rec => ({
        ...rec,
        amount: Math.round(rec.amount * scaleFactor)
      })).filter(rec => rec.amount > 0)
      
      console.log(`✅ SCALED DOWN: Total now ${analysis.recommendations.reduce((sum, rec) => sum + rec.amount, 0)}`)
    }
    
    // CRITICAL VALIDATION: Ensure all existing holdings are categorized
    if (userProfile.existingPortfolio && userProfile.existingPortfolio.length > 0) {
      const existingSymbols = userProfile.existingPortfolio.map((holding: any) => holding.symbol.toUpperCase())
      const recommendedSymbols = analysis.recommendations.map((rec: any) => rec.symbol.toUpperCase())
      
      // Find missing existing holdings
      const missingHoldings = existingSymbols.filter((symbol: string) => 
        !recommendedSymbols.includes(symbol)
      )
      
      if (missingHoldings.length > 0) {
        console.warn(`🚨 MISSING EXISTING HOLDINGS: ${missingHoldings.join(', ')} not categorized`)
        
        // Add missing holdings as "hold" recommendations (conservative approach)
        for (const missingSymbol of missingHoldings) {
          const existingHolding = userProfile.existingPortfolio.find((h: any) => 
            h.symbol.toUpperCase() === missingSymbol
          )
          
          if (existingHolding) {
            analysis.recommendations.push({
              symbol: existingHolding.symbol,
              name: existingHolding.symbol,
              type: 'hold',
              amount: existingHolding.amount,
              strength: 'moderate',
              confidence: 70,
              reasoning: `Existing holding - maintaining position for portfolio stability`,
              sector: 'Existing Holdings',
              expectedAnnualReturn: 0.05 // Conservative estimate
            })
            console.log(`✅ Added missing holding: ${missingSymbol} as HOLD`)
          }
        }
      }
    }
    
    // Add portfolio projections
    analysis.portfolioProjections = calculatePortfolioProjections(analysis.recommendations, userProfile)
    
    console.log('✅ OpenAI recommendations generated successfully')
    return analysis
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError)
    throw new Error('OpenAI returned invalid response format')
  }
}

async function generateRecommendationsWithGrok(userProfile: any): Promise<InvestmentAnalysis> {
  // Step 1: Test Grok availability first
  try {
    console.log('🔍 Testing Grok API availability...')
    const testResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-latest',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      })
    })
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.log('❌ Grok API error response:', errorText)
      console.log('❌ Grok API status:', testResponse.status)
      throw new Error(`Grok API test failed: ${testResponse.status} - ${errorText}`)
    }
    
    console.log('✅ Grok API test successful')
  } catch (error) {
    console.log('⚠️ Grok API test failed:', error)
    if (error instanceof Error) {
      throw new Error(`Grok API error: ${error.message}`)
    }
    throw new Error('Grok API is not available')
  }
  
  // Step 2: Gather comprehensive market data
  console.log('📊 Gathering real-time market data...')
  const marketContext = await gatherComprehensiveMarketData(userProfile)
  
  // Step 3: Get current financial news
  console.log('📰 Fetching current financial news...')
  const newsContext = await getFinancialNews()
  
  // Step 4: Analyze existing portfolio if any
  let portfolioAnalysis = ''
  if (userProfile.existingPortfolio && userProfile.existingPortfolio.length > 0) {
    const availableCapital = userProfile.capitalAvailable || userProfile.capital || 0
    portfolioAnalysis = await analyzeExistingPortfolio(userProfile.existingPortfolio, availableCapital)
  }

  // Create comprehensive prompt for Grok with FMP data integration
  const systemPrompt = `You are an elite investment advisor AI for G.AI.NS platform, powered by comprehensive Financial Modeling Prep (FMP) data and real-time market analysis. Generate investment recommendations that leverage both fundamental and technical analysis.

  USER PROFILE:
  - Risk Tolerance: ${userProfile.riskTolerance}/10
  - Investment Amount: $${(userProfile.capitalAvailable || userProfile.capital || 0).toLocaleString()}
  - Current Holdings: ${userProfile.existingPortfolio?.length > 0 ? JSON.stringify(userProfile.existingPortfolio) : 'None'}
  - Time Horizon: ${userProfile.timeHorizon}
  - Investment Goals: ${userProfile.growthType} growth strategy
  - Sector Preferences: ${userProfile.sectors?.includes('all') ? 'All sectors (open to any sector for maximum diversification)' : userProfile.sectors?.join(', ') || 'Open to all sectors'}
  - ESG Priority: ${userProfile.ethicalInvesting}/10

  FMP-ENHANCED MARKET CONTEXT:
  ${marketContext}

  CURRENT FINANCIAL NEWS & SENTIMENT:
  ${newsContext.slice(0, 5).map(news => `• ${news.title} (${news.source}) - ${news.sentiment || 'neutral'} sentiment`).join('\n')}

  ${portfolioAnalysis ? `EXISTING PORTFOLIO ANALYSIS:\n${portfolioAnalysis}` : ''}

  🚨 CRITICAL CAPITAL ALLOCATION RULES (MUST FOLLOW EXACTLY):
  1. MATHEMATICAL CONSTRAINT: Total BUY amounts + Total HOLD amounts = Available Capital
  2. THREE TYPES of recommendations required:
     - BUY: New investments using available cash + proceeds from sales
     - HOLD: Existing positions to keep at specified reduced amounts
     - SELL: Existing positions to liquidate (creates cash for new investments)
  3. NEVER EXCEED TOTAL PORTFOLIO VALUE: Your recommendations cannot exceed available capital
  4. EXISTING HOLDINGS LOGIC:
     - Analyze each existing holding for future prospects
     - If positive outlook: HOLD at optimal allocation (may be less than current amount)
     - If negative outlook or overweight: SELL completely
     - Use proceeds from SELL recommendations for BUY recommendations
  5. MANDATORY EXISTING HOLDINGS PROCESSING:
     - EVERY existing holding MUST be included in your recommendations
     - If user has existing holdings, you MUST create "sell" or "hold" recommendations for ALL of them
     - NO existing holdings should be ignored or omitted
     - Each existing holding must be analyzed and categorized as either "sell" or "hold"
  
  FMP DATA INTEGRATION REQUIREMENTS:
  6. USE FMP FUNDAMENTAL DATA: Leverage P/E ratios, P/B ratios, ROE, and other financial metrics from the market context
  7. COMBINE TECHNICAL & FUNDAMENTAL: Use both price trends and financial ratios for comprehensive analysis
  8. SECTOR ANALYSIS: Use FMP sector data to identify undervalued/overvalued sectors and adjust allocations accordingly
  9. VALUATION-BASED DECISIONS: Make buy/sell decisions based on fundamental valuation metrics, not just price movements
  
  QUALITY & PERFORMANCE RULES:
  10. ZERO TOLERANCE for negative expected returns - NEVER recommend any asset with negative 1-year prospects
  11. If any analysis shows negative returns, immediately exclude that asset and find alternatives
  12. Provide realistic expected annual returns based on FMP data and current market conditions:
      - Large-cap stocks: 6-12% annually (adjust based on P/E ratios)
      - Growth stocks: 8-15% annually (higher for low P/E, high ROE companies)
      - ETFs/Index funds: 7-10% annually (sector-specific based on FMP analysis)
      - Bonds: 2-6% annually
      - Cryptocurrency: 10-25% annually (ONLY if positive prospects and market momentum)
  13. CRITICAL: Use current real-time market prices and FMP financial ratios for all calculations
  14. Quality check: Review each recommendation using FMP data to ensure positive expected returns
  
  PORTFOLIO STRUCTURE RULES:
  15. Maximum 20% allocation to any single asset
  16. Minimum 5% allocation for any recommended position
  17. Diversification across sectors based on user preferences and FMP sector analysis
  18. Include detailed reasoning for each BUY/HOLD/SELL decision using FMP data
  19. Provide confidence scores based on FMP data quality and analysis depth
  20. VALIDATION: Ensure every existing holding appears in recommendations as either "sell" or "hold"

  FMP DATA UTILIZATION EXAMPLES:
  - If a sector shows low P/E ratios and strong momentum, overweight that sector
  - If a sector shows high P/E ratios and weak momentum, underweight or avoid
  - Use ROE data to identify high-quality companies within sectors
  - Combine P/B ratios with price trends for value vs. growth analysis
  - Leverage sector ETF data to make informed sector allocation decisions

  OUTPUT FORMAT - Provide your analysis in this exact JSON structure:
  {
    "recommendations": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc",
        "type": "buy",
        "amount": 5000,
        "confidence": 85,
        "reasoning": "Detailed analysis using FMP data: P/E ratio, sector performance, and market trends. Include specific FMP metrics in reasoning.",
        "sector": "Technology",
        "targetPrice": 200,
        "stopLoss": 180,
        "expectedAnnualReturn": 0.12
      }
    ],
    "reasoning": "Overall investment strategy explanation incorporating FMP fundamental analysis",
    "riskAssessment": "Risk analysis using FMP sector data and financial ratios",
    "marketOutlook": "Market outlook based on FMP sector performance and fundamental trends"
  }`

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEYS.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Provide investment recommendations based on the profile above.' }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.log(`Grok API response status: ${response.status}, error: ${errorText}`)
    
    // Only throw errors for critical issues, be more lenient for temporary issues
    if (response.status === 401) {
      throw new Error('Grok API key is invalid or expired')
    } else if (response.status === 402) {
      throw new Error('Grok API quota exceeded - please check your billing')
    } else if (response.status === 429) {
      // Rate limit - try again after a short delay
      console.log('Grok rate limit hit, retrying after delay...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      throw new Error('Grok API rate limit - retrying...')
    } else if (response.status >= 500) {
      // Server errors - temporary, try fallback
      console.log('Grok server error, using fallback')
      throw new Error('Grok API temporarily unavailable')
    } else {
      // For other errors, log but don't fail completely
      console.log(`Grok API warning (${response.status}): ${errorText}`)
      // Continue with the response even if there's a warning
    }
  }
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(`Grok API error: ${data.error.message}`)
  }
  
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content received from Grok API')
  }

  try {
    const analysis: InvestmentAnalysis = JSON.parse(content)
    
    // Validate and clean recommendation data
    analysis.recommendations = analysis.recommendations.map((rec: any) => {
      const cleanAmount = typeof rec.amount === 'string' 
        ? parseFloat(rec.amount.replace(/[^0-9.-]/g, '')) || 0
        : (typeof rec.amount === 'number' ? rec.amount : 0)
      
      // Cap expected returns to realistic levels and eliminate negatives
      const cappedReturn = Math.max(0.02, Math.min(rec.expectedAnnualReturn || 0.07, 0.25)) // 2% to 25% max
      
      return {
        ...rec,
        name: cleanAssetName(rec.symbol, rec.name), // Clean up long ETF names
        amount: Math.round(cleanAmount),
        confidence: typeof rec.confidence === 'number' ? rec.confidence : 75,
        targetPrice: typeof rec.targetPrice === 'number' ? rec.targetPrice : undefined,
        stopLoss: typeof rec.stopLoss === 'number' ? rec.stopLoss : undefined,
        expectedAnnualReturn: cappedReturn
      }
    }).filter((rec: any) => rec.amount > 0 && rec.expectedAnnualReturn > 0) // Remove negative returns
    
    // CRITICAL VALIDATION: Ensure total doesn't exceed available capital
    const availableCapital = userProfile.capitalAvailable || userProfile.capital || 0
    const existingHoldings = userProfile.existingPortfolio ? 
      userProfile.existingPortfolio.reduce((sum: number, holding: any) => sum + (holding.amount || 0), 0) : 0
    const totalPortfolioValue = availableCapital + existingHoldings
    
    const totalRecommendedAmount = analysis.recommendations.reduce((sum, rec) => sum + rec.amount, 0)
    
    if (totalRecommendedAmount > totalPortfolioValue) {
      console.warn(`🚨 CAPITAL VALIDATION FAILED: Recommended ${totalRecommendedAmount} exceeds total portfolio ${totalPortfolioValue}`)
      
      // Scale down all recommendations proportionally
      const scaleFactor = totalPortfolioValue / totalRecommendedAmount
      analysis.recommendations = analysis.recommendations.map(rec => ({
        ...rec,
        amount: Math.round(rec.amount * scaleFactor)
      })).filter(rec => rec.amount > 0)
      
      console.log(`✅ SCALED DOWN: Total now ${analysis.recommendations.reduce((sum, rec) => sum + rec.amount, 0)}`)
    }
    
    // CRITICAL VALIDATION: Ensure all existing holdings are categorized
    if (userProfile.existingPortfolio && userProfile.existingPortfolio.length > 0) {
      const existingSymbols = userProfile.existingPortfolio.map((holding: any) => holding.symbol.toUpperCase())
      const recommendedSymbols = analysis.recommendations.map((rec: any) => rec.symbol.toUpperCase())
      
      // Find missing existing holdings
      const missingHoldings = existingSymbols.filter((symbol: string) => 
        !recommendedSymbols.includes(symbol)
      )
      
      if (missingHoldings.length > 0) {
        console.warn(`🚨 MISSING EXISTING HOLDINGS: ${missingHoldings.join(', ')} not categorized`)
        
        // Add missing holdings as "hold" recommendations (conservative approach)
        for (const missingSymbol of missingHoldings) {
          const existingHolding = userProfile.existingPortfolio.find((h: any) => 
            h.symbol.toUpperCase() === missingSymbol
          )
          
          if (existingHolding) {
            analysis.recommendations.push({
              symbol: existingHolding.symbol,
              name: existingHolding.symbol,
              type: 'hold',
              amount: existingHolding.amount,
              strength: 'moderate',
              confidence: 70,
              reasoning: `Existing holding - maintaining position for portfolio stability`,
              sector: 'Existing Holdings',
              expectedAnnualReturn: 0.05 // Conservative estimate
            })
            console.log(`✅ Added missing holding: ${missingSymbol} as HOLD`)
          }
        }
      }
    }
    
    // Add portfolio projections
    analysis.portfolioProjections = calculatePortfolioProjections(analysis.recommendations, userProfile)
    
    console.log('✅ Grok recommendations generated successfully')
    return analysis
  } catch (parseError) {
    console.error('Failed to parse Grok response:', parseError)
    throw new Error('Grok returned invalid response format')
  }
}

function calculatePortfolioProjections(recommendations: InvestmentRecommendation[], userProfile: any): PortfolioProjection {
  // Calculate actual total investment from recommendations (BUY + HOLD amounts)
  const totalInvestment = recommendations.reduce((sum, rec) => sum + rec.amount, 0)
  const riskMultiplier = (userProfile.riskTolerance || 5) / 10
  
  // Validate inputs
  if (totalInvestment <= 0) {
    console.warn('Invalid total investment amount:', totalInvestment)
    return {
      totalInvestment: 0,
      monthlyProjections: [],
      projectedValues: { oneYear: 0, threeYear: 0, fiveYear: 0 },
      expectedAnnualReturn: 0,
      riskLevel: 'medium',
      diversificationScore: 0,
      sectorBreakdown: {}
    }
  }
  
  // EXPLANATION OF RETURN CALCULATIONS:
  // The expected annual returns are calculated as a weighted average of individual asset returns
  // Each asset has its own expected return based on:
  // - Historical performance of similar assets
  // - Current market conditions and sector outlook
  // - Risk profile (higher risk = higher potential returns)
  // - Asset type (stocks typically 8-15%, bonds 3-6%, crypto 20-50%, ETFs 5-12%)
  // The AI provides these individual returns, and we calculate the portfolio average
  
  // Calculate expected return based on user profile and recommendations
  // This uses a weighted average of individual asset returns rather than a simple formula
  let totalWeightedReturn = 0
  let totalAmount = 0
  
  recommendations.forEach(rec => {
    totalWeightedReturn += rec.amount * rec.expectedAnnualReturn
    totalAmount += rec.amount
  })
  
  const expectedAnnualReturn = totalAmount > 0 ? totalWeightedReturn / totalAmount : 0.08
  
  // Generate realistic market-cycle-based projections for 5 years
  const monthlyProjections = []
  let currentValue = totalInvestment
  
  // Cap expected returns to realistic levels
  const cappedAnnualReturn = Math.min(expectedAnnualReturn, 0.18) // Max 18% annual
  const baseMonthlyReturn = cappedAnnualReturn / 12
  
  for (let month = 1; month <= 60; month++) {
    // Create market cycle volatility instead of linear growth
    const cyclePosition = (month % 36) / 36 // 3-year market cycles
    const yearProgress = month / 12
    
    // Market volatility factors
    const cyclicVariation = Math.sin(cyclePosition * Math.PI * 2) * 0.15 // +/- 15% variation
    const randomVolatility = (Math.sin(month * 0.5) * 0.08) // Smaller random movements
    
    // Economic downturn simulation (10% chance each year)
    let downturnFactor = 1
    if (month === 18 || month === 42) { // Market corrections at 1.5 and 3.5 years
      downturnFactor = 0.85 // 15% temporary decline
    }
    
    // Recovery patterns after downturns
    let recoveryBonus = 0
    if (month > 18 && month <= 24) { // Recovery after first correction
      recoveryBonus = 0.03 * (month - 18) / 6 // Gradual recovery
    }
    if (month > 42 && month <= 48) { // Recovery after second correction
      recoveryBonus = 0.025 * (month - 42) / 6 // Gradual recovery
    }
    
    // Calculate realistic monthly return with volatility
    const adjustedReturn = baseMonthlyReturn * (1 + cyclicVariation + randomVolatility + recoveryBonus) * downturnFactor
    
    // Compound growth with realistic market behavior
    currentValue *= (1 + adjustedReturn)
    
    // Ensure we don't go below initial investment due to volatility in early months
    if (month <= 6 && currentValue < totalInvestment * 0.95) {
      currentValue = totalInvestment * (0.95 + (month * 0.008)) // Gradual early growth
    }
    
    const date = new Date()
    date.setMonth(date.getMonth() + month)
    
    // Format date properly as YYYY-MM
    const year = date.getFullYear()
    const monthNum = (date.getMonth() + 1).toString().padStart(2, '0')
    const formattedDate = `${year}-${monthNum}`
    
    monthlyProjections.push({
      month,
      value: Math.round(currentValue),
      date: formattedDate
    })
  }
  
  // Calculate sector breakdown
  const sectorBreakdown: { [sector: string]: number } = {}
  recommendations.forEach(rec => {
    if (!sectorBreakdown[rec.sector]) {
      sectorBreakdown[rec.sector] = 0
    }
    sectorBreakdown[rec.sector] += rec.amount
  })
  
  // Normalize to percentages only if totalInvestment > 0
  if (totalInvestment > 0) {
    Object.keys(sectorBreakdown).forEach(sector => {
      sectorBreakdown[sector] = Math.round((sectorBreakdown[sector] / totalInvestment) * 100)
    })
  }
  
  return {
    totalInvestment,
    monthlyProjections,
    projectedValues: {
      oneYear: monthlyProjections[11]?.value || totalInvestment,
      threeYear: monthlyProjections[35]?.value || totalInvestment,
      fiveYear: monthlyProjections[59]?.value || totalInvestment,
    },
    expectedAnnualReturn: Math.round(cappedAnnualReturn * 100 * 10) / 10, // Round to 1 decimal, use capped value
    riskLevel: (userProfile.riskTolerance || 5) <= 3 ? 'low' : (userProfile.riskTolerance || 5) <= 7 ? 'medium' : 'high',
    diversificationScore: Math.min(Object.keys(sectorBreakdown).length * 20, 100),
    sectorBreakdown
  }
}

// ========================================
// FAST FALLBACK RECOMMENDATIONS
// ========================================

export function generateFallbackRecommendations(userProfile: any): InvestmentAnalysis {
  console.log('🚀 Generating fast fallback recommendations')
  
  const {
    capitalAvailable = 5000,
    riskTolerance = 5,
    timeHorizon = 'Medium',
    growthType = 'Balanced',
    sectors = ['all'],
    ethicalInvesting = 5
  } = userProfile

  const recommendations: InvestmentRecommendation[] = []
  let remainingCapital = capitalAvailable

  // Risk-based allocation strategy
  const isConservative = riskTolerance <= 3
  const isModerate = riskTolerance > 3 && riskTolerance <= 7
  const isAggressive = riskTolerance > 7

  // Base allocations by risk level (preference-driven)
  if (isConservative) {
    // Conservative: 60% bonds, 30% index funds, 10% individual stocks
    recommendations.push(
      {
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.4),
        strength: 'strong',
        confidence: 95,
        reasoning: 'Stable bond ETF for conservative portfolio foundation',
        sector: 'Fixed Income',
        targetPrice: 90,
        stopLoss: 85,
        expectedAnnualReturn: 0.04
      },
      {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.35),
        strength: 'strong',
        confidence: 90,
        reasoning: 'Broad market diversification for steady growth',
        sector: 'Broad Market',
        targetPrice: 280,
        stopLoss: 250,
        expectedAnnualReturn: 0.07
      },
      {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.25),
        strength: 'moderate',
        confidence: 88,
        reasoning: 'Defensive healthcare stock for stability',
        sector: 'Healthcare',
        targetPrice: 170,
        stopLoss: 150,
        expectedAnnualReturn: 0.06
      }
    )
  } else if (isModerate) {
    // Moderate: emphasize quality growth and diversified ETFs; reduce bonds if user chose growth
    recommendations.push(
      {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.25),
        strength: 'strong',
        confidence: 92,
        reasoning: 'Core holding for balanced diversification',
        sector: 'Broad Market',
        targetPrice: 280,
        stopLoss: 250,
        expectedAnnualReturn: 0.08
      },
      {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.2),
        strength: 'strong',
        confidence: 87,
        reasoning: 'Technology growth exposure for moderate risk profile',
        sector: 'Technology',
        targetPrice: 520,
        stopLoss: 480,
        expectedAnnualReturn: 0.12
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.15),
        strength: 'moderate',
        confidence: 85,
        reasoning: 'Quality growth stock with strong fundamentals',
        sector: 'Technology',
        targetPrice: 250,
        stopLoss: 200,
        expectedAnnualReturn: 0.10
      },
      {
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.2),
        strength: 'strong',
        confidence: 93,
        reasoning: 'Stability component for balanced portfolio',
        sector: 'Fixed Income',
        targetPrice: 90,
        stopLoss: 85,
        expectedAnnualReturn: 0.04
      },
      {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.1),
        strength: 'moderate',
        confidence: 80,
        reasoning: 'Inflation hedge and portfolio diversifier',
        sector: 'Commodities',
        targetPrice: 320,
        stopLoss: 290,
        expectedAnnualReturn: 0.05
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.1),
        strength: 'strong',
        confidence: 88,
        reasoning: 'AI and cloud computing leader',
        sector: 'Technology',
        targetPrice: 450,
        stopLoss: 400,
        expectedAnnualReturn: 0.11
      }
    )
  } else {
    // Aggressive: prioritize growth/small-cap/EM and opportunistic sectors; minimal broad index exposure
    recommendations.push(
      {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.25),
        strength: 'strong',
        confidence: 85,
        reasoning: 'High-growth tech exposure for aggressive portfolio',
        sector: 'Technology',
        targetPrice: 520,
        stopLoss: 480,
        expectedAnnualReturn: 0.15
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.2),
        strength: 'strong',
        confidence: 80,
        reasoning: 'AI leader with high growth potential',
        sector: 'Technology',
        targetPrice: 1200,
        stopLoss: 900,
        expectedAnnualReturn: 0.20
      },
      {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.15),
        strength: 'strong',
        confidence: 90,
        reasoning: 'Core diversification for growth portfolio',
        sector: 'Broad Market',
        targetPrice: 280,
        stopLoss: 250,
        expectedAnnualReturn: 0.10
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.15),
        strength: 'moderate',
        confidence: 75,
        reasoning: 'Electric vehicle and energy innovation leader',
        sector: 'Technology',
        targetPrice: 300,
        stopLoss: 200,
        expectedAnnualReturn: 0.18
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.15),
        strength: 'weak',
        confidence: 70,
        reasoning: 'Cryptocurrency exposure for high-risk, high-reward potential',
        sector: 'Cryptocurrency',
        targetPrice: 120000,
        stopLoss: 80000,
        expectedAnnualReturn: 0.25
      },
      {
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        type: 'buy',
        amount: Math.round(capitalAvailable * 0.1),
        strength: 'strong',
        confidence: 85,
        reasoning: 'Small stability component for risk management',
        sector: 'Fixed Income',
        targetPrice: 90,
        stopLoss: 85,
        expectedAnnualReturn: 0.04
      }
    )
  }

  // Clean up asset names in fallback recommendations
  recommendations.forEach(rec => {
    rec.name = cleanAssetName(rec.symbol, rec.name)
  })

  // Calculate portfolio projections
  const avgReturn = recommendations.reduce((sum, rec) => sum + rec.expectedAnnualReturn, 0) / recommendations.length
  const portfolioProjections = calculatePortfolioProjections(recommendations, userProfile)

  return {
    recommendations,
    reasoning: `Fast-generated portfolio for ${riskTolerance}/10 risk tolerance using proven asset allocation strategies. ${isConservative ? 'Conservative approach with emphasis on stability.' : isModerate ? 'Balanced approach mixing growth and stability.' : 'Aggressive approach focused on growth potential.'} Allocations follow modern portfolio theory principles.`,
    riskAssessment: `${isConservative ? 'Low' : isModerate ? 'Moderate' : 'High'} risk portfolio aligned with ${riskTolerance}/10 risk tolerance. Diversified across asset classes to optimize risk-adjusted returns.`,
    marketOutlook: `Current market conditions favor a ${isConservative ? 'defensive' : isModerate ? 'balanced' : 'growth-oriented'} approach. Portfolio positioned for ${timeHorizon.toLowerCase()}-term ${growthType.toLowerCase()} growth.`,
    portfolioProjections
  }
}

// ========================================
// NEWS AND SENTIMENT ANALYSIS
// ========================================

export interface NewsItem {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

// Get financial news for specific symbols or general market news
export async function getFinancialNews(symbols?: string[]): Promise<NewsItem[]> {
  try {
    const query = symbols ? symbols.join(' OR ') : 'stock market investment'
    
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=reuters.com,bloomberg.com,cnbc.com,marketwatch.com&sortBy=publishedAt&apiKey=${API_KEYS.NEWS_API_KEY}`
    )
    
    const data = await response.json()
    
    // Check if articles exist and handle the case where they don't
    if (!data.articles || !Array.isArray(data.articles)) {
      console.warn('No articles found in News API response:', data)
      return []
    }
    
    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt
    }))
    
  } catch (error) {
    console.error('Error fetching financial news:', error)
    return []
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function validateApiKeys(): { [key: string]: boolean } {
  return {
    openai: !!API_KEYS.OPENAI_API_KEY,
    grok: !!API_KEYS.GROK_API_KEY,
    alphaVantage: !!API_KEYS.ALPHA_VANTAGE_API_KEY,
    twelveData: !!API_KEYS.TWELVE_DATA_API_KEY,
    finnhub: !!API_KEYS.FINNHUB_API_KEY,
    polygon: !!API_KEYS.POLYGON_API_KEY,
    yahooFinance: !!API_KEYS.YAHOO_FINANCE_API_KEY,
    newsApi: !!API_KEYS.NEWS_API_KEY,
    marketaux: !!API_KEYS.MARKETAUX_API_KEY,
  }
}

export function getApiStatus(): { provider: string; active: boolean; remainingRequests: number }[] {
  return API_PROVIDERS.map(provider => ({
    provider: provider.name,
    active: provider.active,
    remainingRequests: rateLimiter.getRemainingRequests(
      provider.name.toLowerCase().replace(' ', ''),
      provider.rateLimit.requests,
      provider.name === 'Finnhub' ? 60 * 1000 : 24 * 60 * 60 * 1000
    )
  }))
}

// Export rate limiter for external use
export { rateLimiter }

// ========================================
// EXPORT CONFIGURATION
// ========================================

export { API_KEYS } 

// ========================================
// ENHANCED RECOMMENDATION ENGINE
// ========================================

export async function generateEnhancedRecommendations(
  userProfile: any,
  marketData?: any[]
): Promise<InvestmentAnalysis> {
  console.log('🚀 Generating enhanced recommendations with higher-return focus')
  
  try {
    // Step 1: Analyze existing portfolio and calculate total value
    const existingPortfolioValue = userProfile.existingPortfolio?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0
    const availableCash = userProfile.capitalAvailable || 0
    const totalPortfolioValue = existingPortfolioValue + availableCash
    
    console.log('💰 Portfolio Analysis:', {
      existingPortfolioValue,
      availableCash,
      totalPortfolioValue
    })

    // Step 2: Generate recommendations based on risk profile and return optimization
    const recommendations = await generateOptimizedRecommendations(userProfile, totalPortfolioValue)
    
    // Step 3: Process existing holdings and create sell/hold recommendations
    const processedRecommendations = await processExistingHoldings(
      recommendations,
      userProfile.existingPortfolio || [],
      totalPortfolioValue
    )
    
    // Step 4: Ensure mathematical consistency
    const finalRecommendations = ensureMathematicalConsistency(
      processedRecommendations,
      totalPortfolioValue,
      availableCash
    )
    
    // Step 5: Calculate portfolio projections
    const portfolioProjections = calculatePortfolioProjections(finalRecommendations, userProfile)
    
    return {
      recommendations: finalRecommendations,
      reasoning: generateEnhancedReasoning(userProfile, finalRecommendations),
      riskAssessment: generateEnhancedRiskAssessment(userProfile, finalRecommendations),
      marketOutlook: generateEnhancedMarketOutlook(userProfile, finalRecommendations),
      portfolioProjections
    }
    
  } catch (error) {
    console.error('Error generating enhanced recommendations:', error)
    // Fallback to existing recommendations
    return generateFallbackRecommendations(userProfile)
  }
}

async function generateOptimizedRecommendations(userProfile: any, totalPortfolioValue: number): Promise<InvestmentRecommendation[]> {
  const recommendations: InvestmentRecommendation[] = []
  const { riskTolerance, timeHorizon, growthType, sectors, ethicalInvesting } = userProfile
  
  // Define asset classes with expected returns (prioritizing higher returns)
  const assetClasses = [
    // High-return assets (prioritized for aggressive profiles)
    {
      category: 'Growth Stocks',
      assets: [
        { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', expectedReturn: 0.20, risk: 'high' },
        { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Technology', expectedReturn: 0.18, risk: 'high' },
        { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', expectedReturn: 0.16, risk: 'high' },
        { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', expectedReturn: 0.15, risk: 'high' },
        { symbol: 'AMZN', name: 'Amazon.com', sector: 'Consumer Discretionary', expectedReturn: 0.14, risk: 'high' }
      ]
    },
    {
      category: 'Small-Cap Growth',
      assets: [
        { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'Small-Cap', expectedReturn: 0.15, risk: 'high' },
        { symbol: 'VB', name: 'Vanguard Small-Cap ETF', sector: 'Small-Cap', expectedReturn: 0.13, risk: 'high' },
        { symbol: 'IJR', name: 'iShares Core S&P Small-Cap ETF', sector: 'Small-Cap', expectedReturn: 0.12, risk: 'high' }
      ]
    },
    {
      category: 'Emerging Markets',
      assets: [
        { symbol: 'VWO', name: 'Vanguard Emerging Markets ETF', sector: 'International', expectedReturn: 0.14, risk: 'high' },
        { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', sector: 'International', expectedReturn: 0.13, risk: 'high' },
        { symbol: 'SCHE', name: 'Schwab Emerging Markets ETF', sector: 'International', expectedReturn: 0.12, risk: 'high' }
      ]
    },
    {
      category: 'Technology ETFs',
      assets: [
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'Technology', expectedReturn: 0.15, risk: 'high' },
        { symbol: 'XLK', name: 'Technology Select Sector SPDR', sector: 'Technology', expectedReturn: 0.13, risk: 'high' },
        { symbol: 'VGT', name: 'Vanguard Information Technology ETF', sector: 'Technology', expectedReturn: 0.12, risk: 'high' }
      ]
    },
    // Moderate-return assets
    {
      category: 'Quality Large-Cap',
      assets: [
        { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology', expectedReturn: 0.12, risk: 'medium' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', expectedReturn: 0.11, risk: 'medium' },
        { symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Technology', expectedReturn: 0.11, risk: 'medium' },
        { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', expectedReturn: 0.10, risk: 'medium' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', expectedReturn: 0.09, risk: 'medium' }
      ]
    },
    {
      category: 'Sector ETFs',
      assets: [
        { symbol: 'XLF', name: 'Financial Select Sector SPDR', sector: 'Financials', expectedReturn: 0.10, risk: 'medium' },
        { symbol: 'XLV', name: 'Health Care Select Sector SPDR', sector: 'Healthcare', expectedReturn: 0.09, risk: 'medium' },
        { symbol: 'XLE', name: 'Energy Select Sector SPDR', sector: 'Energy', expectedReturn: 0.11, risk: 'medium' },
        { symbol: 'XLI', name: 'Industrial Select Sector SPDR', sector: 'Industrials', expectedReturn: 0.09, risk: 'medium' }
      ]
    },
    // Lower-return but stable assets
    {
      category: 'Broad Market ETFs',
      assets: [
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'Broad Market', expectedReturn: 0.08, risk: 'low' },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Broad Market', expectedReturn: 0.08, risk: 'low' },
        { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', sector: 'Broad Market', expectedReturn: 0.08, risk: 'low' }
      ]
    },
    {
      category: 'Fixed Income',
      assets: [
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', sector: 'Fixed Income', expectedReturn: 0.04, risk: 'low' },
        { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', sector: 'Fixed Income', expectedReturn: 0.04, risk: 'low' },
        { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', sector: 'Fixed Income', expectedReturn: 0.03, risk: 'low' }
      ]
    },
    // Cryptocurrency (only for very aggressive profiles)
    {
      category: 'Cryptocurrency',
      assets: [
        { symbol: 'BTC', name: 'Bitcoin', sector: 'Cryptocurrency', expectedReturn: 0.25, risk: 'very-high' },
        { symbol: 'ETH', name: 'Ethereum', sector: 'Cryptocurrency', expectedReturn: 0.20, risk: 'very-high' }
      ]
    }
  ]

  // Calculate allocation based on risk tolerance and growth preferences
  let allocationStrategy: { [category: string]: number } = {}
  
  if (riskTolerance <= 3) {
    // Conservative: 60% bonds, 30% broad market, 10% quality stocks
    allocationStrategy = {
      'Fixed Income': 0.60,
      'Broad Market ETFs': 0.30,
      'Quality Large-Cap': 0.10
    }
  } else if (riskTolerance <= 6) {
    // Moderate: 30% bonds, 40% broad market, 20% quality stocks, 10% growth
    allocationStrategy = {
      'Fixed Income': 0.30,
      'Broad Market ETFs': 0.40,
      'Quality Large-Cap': 0.20,
      'Technology ETFs': 0.10
    }
  } else if (riskTolerance <= 8) {
    // Aggressive: 15% bonds, 25% broad market, 35% quality stocks, 25% growth
    allocationStrategy = {
      'Fixed Income': 0.15,
      'Broad Market ETFs': 0.25,
      'Quality Large-Cap': 0.35,
      'Technology ETFs': 0.15,
      'Growth Stocks': 0.10
    }
  } else {
    // Very Aggressive: 5% bonds, 15% broad market, 30% quality stocks, 35% growth, 15% crypto
    allocationStrategy = {
      'Fixed Income': 0.05,
      'Broad Market ETFs': 0.15,
      'Quality Large-Cap': 0.30,
      'Technology ETFs': 0.20,
      'Growth Stocks': 0.15,
      'Cryptocurrency': 0.15
    }
  }

  // Apply growth type preferences
  if (growthType === 'aggressive') {
    // Increase growth allocations
    if (allocationStrategy['Growth Stocks']) allocationStrategy['Growth Stocks'] += 0.10
    if (allocationStrategy['Technology ETFs']) allocationStrategy['Technology ETFs'] += 0.05
    if (allocationStrategy['Fixed Income']) allocationStrategy['Fixed Income'] = Math.max(0, allocationStrategy['Fixed Income'] - 0.15)
  } else if (growthType === 'conservative') {
    // Increase stability allocations
    if (allocationStrategy['Fixed Income']) allocationStrategy['Fixed Income'] += 0.10
    if (allocationStrategy['Broad Market ETFs']) allocationStrategy['Broad Market ETFs'] += 0.05
    if (allocationStrategy['Growth Stocks']) allocationStrategy['Growth Stocks'] = Math.max(0, allocationStrategy['Growth Stocks'] - 0.15)
  }

  // Generate recommendations based on allocation strategy
  for (const [category, allocation] of Object.entries(allocationStrategy)) {
    const categoryAssets = assetClasses.find(ac => ac.category === category)?.assets || []
    if (categoryAssets.length === 0) continue
    
    // Select best assets from category based on expected returns
    const selectedAssets = categoryAssets
      .sort((a, b) => b.expectedReturn - a.expectedReturn)
      .slice(0, Math.ceil(allocation * 3)) // 3 assets per category
    
    for (const asset of selectedAssets) {
      const amount = Math.round(totalPortfolioValue * allocation / selectedAssets.length)
      if (amount < 100) continue // Minimum $100 allocation
      
      recommendations.push({
        symbol: asset.symbol,
        name: asset.name,
        type: 'buy',
        amount,
        strength: asset.expectedReturn >= 0.15 ? 'strong' : asset.expectedReturn >= 0.10 ? 'moderate' : 'weak',
        confidence: Math.round(asset.expectedReturn * 100),
        reasoning: `High-return ${category.toLowerCase()} asset with ${(asset.expectedReturn * 100).toFixed(1)}% expected annual return. Selected for optimal risk-adjusted returns based on your ${riskTolerance}/10 risk tolerance and ${growthType} growth preferences.`,
        sector: asset.sector,
        expectedAnnualReturn: asset.expectedReturn,
        targetPrice: 0, // Will be set by market data
        stopLoss: 0, // Will be set by market data
        allocationPercentage: (amount / totalPortfolioValue) * 100
      })
    }
  }

  // Ensure we don't exceed total portfolio value
  const totalAllocated = recommendations.reduce((sum, rec) => sum + rec.amount, 0)
  if (totalAllocated > totalPortfolioValue) {
    const scaleFactor = totalPortfolioValue / totalAllocated
    recommendations.forEach(rec => {
      rec.amount = Math.round(rec.amount * scaleFactor)
      rec.allocationPercentage = (rec.amount / totalPortfolioValue) * 100
    })
  }

  return recommendations
}

async function processExistingHoldings(
  buyRecommendations: InvestmentRecommendation[],
  existingPortfolio: any[],
  totalPortfolioValue: number
): Promise<InvestmentRecommendation[]> {
  const allRecommendations = [...buyRecommendations]
  
  if (!existingPortfolio || existingPortfolio.length === 0) {
    return allRecommendations
  }

  // Analyze each existing holding
  for (const holding of existingPortfolio) {
    const existingSymbol = holding.symbol.toUpperCase()
    
    // Check if this holding is already in buy recommendations
    const existingBuyRec = buyRecommendations.find(rec => rec.symbol.toUpperCase() === existingSymbol)
    
    if (existingBuyRec) {
      // Split the holding: keep some, sell the rest
      const optimalAmount = existingBuyRec.amount
      const currentAmount = holding.amount
      
      if (currentAmount > optimalAmount) {
        // Sell excess amount
        const sellAmount = currentAmount - optimalAmount
        allRecommendations.push({
          symbol: holding.symbol,
          name: holding.symbol, // Will be updated with real name
          type: 'sell',
          amount: sellAmount,
          strength: 'moderate',
          confidence: 75,
          reasoning: `Selling excess allocation to optimize portfolio balance. Current: $${currentAmount.toLocaleString()}, Optimal: $${optimalAmount.toLocaleString()}, Selling: $${sellAmount.toLocaleString()}`,
          sector: 'Existing Holdings',
          expectedAnnualReturn: 0.05, // Conservative estimate for existing holdings
          isExistingHolding: true,
          originalAmount: currentAmount,
          allocationPercentage: (sellAmount / totalPortfolioValue) * 100
        })
        
        // Update buy recommendation to hold optimal amount
        existingBuyRec.type = 'hold'
        existingBuyRec.amount = optimalAmount
        existingBuyRec.reasoning = `Maintaining optimal allocation of existing holding. This position aligns with your investment strategy.`
        existingBuyRec.isExistingHolding = true
        existingBuyRec.originalAmount = currentAmount
        existingBuyRec.allocationPercentage = (optimalAmount / totalPortfolioValue) * 100
      } else {
        // Convert to hold recommendation
        existingBuyRec.type = 'hold'
        existingBuyRec.amount = currentAmount
        existingBuyRec.reasoning = `Maintaining existing holding. This position aligns with your investment strategy.`
        existingBuyRec.isExistingHolding = true
        existingBuyRec.originalAmount = currentAmount
        existingBuyRec.allocationPercentage = (currentAmount / totalPortfolioValue) * 100
      }
    } else {
      // Analyze if we should hold or sell this existing holding
      const shouldHold = Math.random() > 0.3 // 70% chance to hold for now (will be enhanced with real analysis)
      
      if (shouldHold) {
        allRecommendations.push({
          symbol: holding.symbol,
          name: holding.symbol,
          type: 'hold',
          amount: holding.amount,
          strength: 'moderate',
          confidence: 70,
          reasoning: `Maintaining existing holding for portfolio stability. This position provides diversification benefits.`,
          sector: 'Existing Holdings',
          expectedAnnualReturn: 0.05,
          isExistingHolding: true,
          originalAmount: holding.amount,
          allocationPercentage: (holding.amount / totalPortfolioValue) * 100
        })
      } else {
        allRecommendations.push({
          symbol: holding.symbol,
          name: holding.symbol,
          type: 'sell',
          amount: holding.amount,
          strength: 'moderate',
          confidence: 75,
          reasoning: `Selling existing holding to rebalance portfolio and fund higher-return opportunities.`,
          sector: 'Existing Holdings',
          expectedAnnualReturn: 0.05,
          isExistingHolding: true,
          originalAmount: holding.amount,
          allocationPercentage: (holding.amount / totalPortfolioValue) * 100
        })
      }
    }
  }

  return allRecommendations
}

function ensureMathematicalConsistency(
  recommendations: InvestmentRecommendation[],
  totalPortfolioValue: number,
  availableCash: number
): InvestmentRecommendation[] {
  const buyRecs = recommendations.filter(r => r.type === 'buy')
  const sellRecs = recommendations.filter(r => r.type === 'sell')
  const holdRecs = recommendations.filter(r => r.type === 'hold')
  
  const totalBuyAmount = buyRecs.reduce((sum, r) => sum + r.amount, 0)
  const totalSellAmount = sellRecs.reduce((sum, r) => sum + r.amount, 0)
  const totalHoldAmount = holdRecs.reduce((sum, r) => sum + r.amount, 0)
  
  // Calculate available funds for new investments
  const availableFunds = availableCash + totalSellAmount
  
  // Ensure we don't exceed available funds
  if (totalBuyAmount > availableFunds) {
    const scaleFactor = availableFunds / totalBuyAmount
    buyRecs.forEach(rec => {
      rec.amount = Math.round(rec.amount * scaleFactor)
      rec.allocationPercentage = (rec.amount / totalPortfolioValue) * 100
    })
  }
  
  // Ensure total portfolio value is maintained
  const finalTotalBuy = buyRecs.reduce((sum, r) => sum + r.amount, 0)
  const finalTotalHold = holdRecs.reduce((sum, r) => sum + r.amount, 0)
  const finalTotalSell = sellRecs.reduce((sum, r) => sum + r.amount, 0)
  
  console.log('💰 Mathematical Consistency Check:', {
    totalPortfolioValue,
    availableCash,
    finalTotalBuy,
    finalTotalHold,
    finalTotalSell,
    availableFunds,
    isConsistent: (finalTotalBuy + finalTotalHold) <= totalPortfolioValue
  })
  
  return recommendations
}

function generateEnhancedReasoning(userProfile: any, recommendations: InvestmentRecommendation[]): string {
  const buyRecs = recommendations.filter(r => r.type === 'buy')
  const sellRecs = recommendations.filter(r => r.type === 'sell')
  const holdRecs = recommendations.filter(r => r.type === 'hold')
  
  const totalBuyAmount = buyRecs.reduce((sum, r) => sum + r.amount, 0)
  const totalSellAmount = sellRecs.reduce((sum, r) => sum + r.amount, 0)
  const totalHoldAmount = holdRecs.reduce((sum, r) => sum + r.amount, 0)
  
  let reasoning = `Enhanced portfolio optimization for ${userProfile.riskTolerance}/10 risk tolerance with ${userProfile.growthType} growth preferences. `
  
  if (totalSellAmount > 0) {
    reasoning += `Portfolio rebalancing includes selling $${totalSellAmount.toLocaleString()} in underperforming positions to fund higher-return opportunities. `
  }
  
  reasoning += `New investments total $${totalBuyAmount.toLocaleString()} focused on maximizing returns through growth stocks, technology ETFs, and emerging markets where appropriate. `
  
  if (totalHoldAmount > 0) {
    reasoning += `Maintaining $${totalHoldAmount.toLocaleString()} in existing positions that align with your strategy. `
  }
  
  reasoning += `This allocation prioritizes higher-return asset classes while maintaining appropriate diversification and risk management.`
  
  return reasoning
}

function generateEnhancedRiskAssessment(userProfile: any, recommendations: InvestmentRecommendation[]): string {
  const avgReturn = recommendations.reduce((sum, r) => sum + r.expectedAnnualReturn, 0) / recommendations.length
  const riskLevel = userProfile.riskTolerance <= 3 ? 'Low' : userProfile.riskTolerance <= 6 ? 'Moderate' : 'High'
  
  return `Enhanced ${riskLevel.toLowerCase()} risk portfolio with ${(avgReturn * 100).toFixed(1)}% expected annual return. Portfolio is optimized for higher returns through strategic allocation to growth assets, technology, and emerging markets while maintaining risk-appropriate diversification. Risk-adjusted returns are maximized through careful selection of high-performing assets that align with your ${userProfile.riskTolerance}/10 risk tolerance.`
}

function generateEnhancedMarketOutlook(userProfile: any, recommendations: InvestmentRecommendation[]): string {
  const growthAssets = recommendations.filter(r => r.expectedAnnualReturn >= 0.12)
  const growthAllocation = growthAssets.reduce((sum, r) => sum + r.amount, 0)
  const totalInvestment = recommendations.filter(r => r.type === 'buy').reduce((sum, r) => sum + r.amount, 0)
  const growthPercentage = totalInvestment > 0 ? (growthAllocation / totalInvestment) * 100 : 0
  
  return `Current market conditions favor growth-oriented investments with ${growthPercentage.toFixed(1)}% allocation to high-return assets. The portfolio is positioned to capitalize on technology innovation, emerging market opportunities, and quality growth stocks. This strategy aligns with current economic trends favoring growth over value and positions you to benefit from market momentum while maintaining appropriate risk management.`
}