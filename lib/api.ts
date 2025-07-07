// API Configuration for G.AI.NS Investment Platform
// Multi-Provider Fallback System: Alpha Vantage → Twelve Data → Finnhub

// ========================================
// API KEYS CONFIGURATION
// ========================================

const API_KEYS = {
  // AI Services
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  
  // Financial Data APIs (in priority order)
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || '',
  TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY || '',
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
  
  // Additional APIs
  POLYGON_API_KEY: process.env.POLYGON_API_KEY || '',
  YAHOO_FINANCE_API_KEY: process.env.YAHOO_FINANCE_API_KEY || '',
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  MARKETAUX_API_KEY: process.env.MARKETAUX_API_KEY || '',
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
  const marketData = []
  
  try {
    // Key market indicators to analyze
    const keySymbols = ['SPY', 'QQQ', 'VTI', 'GLD', 'TLT', 'VIX']
    const stockDataPromises = keySymbols.map(symbol => getStockData(symbol))
    const stockResults = await Promise.allSettled(stockDataPromises)
    
    let marketSummary = 'CURRENT MARKET INDICATORS:\n'
    stockResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const stock = result.value
        marketSummary += `• ${keySymbols[index]}: $${stock.price} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%) - ${stock.source}\n`
      }
    })
    
    // Add sector-specific data if user has preferences
    if (userProfile.sectors && userProfile.sectors.length > 0) {
      marketSummary += '\nSECTOR-SPECIFIC ANALYSIS:\n'
      const sectorETFs: { [key: string]: string } = {
        'Technology': 'XLK',
        'Healthcare': 'XLV', 
        'Financial Services': 'XLF',
        'Consumer Discretionary': 'XLY',
        'Energy': 'XLE',
        'Real Estate': 'XLRE',
        'Utilities': 'XLU',
        'Materials': 'XLB',
        'Industrials': 'XLI',
        'Consumer Staples': 'XLP',
        'Telecommunications': 'XLC'
      }
      
      for (const sector of userProfile.sectors.slice(0, 3)) { // Limit to 3 sectors to avoid API limits
        const etfSymbol = sectorETFs[sector]
        if (etfSymbol) {
          const sectorData = await getStockData(etfSymbol)
          if (sectorData) {
            marketSummary += `• ${sector} (${etfSymbol}): $${sectorData.price} (${sectorData.changePercent > 0 ? '+' : ''}${sectorData.changePercent.toFixed(2)}%)\n`
          }
        }
      }
    }
    
    return marketSummary
  } catch (error) {
    console.error('Error gathering market data:', error)
    return 'Market data temporarily unavailable - using fundamental analysis approach'
  }
}

async function analyzeExistingPortfolio(existingPortfolio: any[]): Promise<string> {
  if (!existingPortfolio || existingPortfolio.length === 0) {
    return ''
  }
  
  try {
    let analysis = 'EXISTING PORTFOLIO ANALYSIS:\n'
    const totalValue = existingPortfolio.reduce((sum, holding) => sum + (holding.amount || 0), 0)
    
    analysis += `Total Portfolio Value: $${totalValue.toLocaleString()}\n`
    analysis += 'Current Holdings:\n'
    
    for (const holding of existingPortfolio.slice(0, 5)) { // Limit to avoid API limits
      if (holding.symbol) {
        const currentData = await getStockData(holding.symbol)
        if (currentData) {
          const allocation = ((holding.amount || 0) / totalValue * 100).toFixed(1)
          analysis += `• ${holding.symbol}: $${holding.amount?.toLocaleString()} (${allocation}%) - Current: $${currentData.price} (${currentData.changePercent > 0 ? '+' : ''}${currentData.changePercent.toFixed(2)}%)\n`
        }
      }
    }
    
    return analysis
  } catch (error) {
    console.error('Error analyzing existing portfolio:', error)
    return 'Existing portfolio data available - manual analysis recommended'
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

// Main function with fallback logic
export async function getStockData(symbol: string): Promise<StockData | null> {
  console.log(`🔍 Fetching stock data for ${symbol}...`)
  
  // Get active providers sorted by priority
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

export interface InvestmentAnalysis {
  recommendations: InvestmentRecommendation[]
  reasoning: string
  riskAssessment: string
  marketOutlook: string
  portfolioProjections?: PortfolioProjection
}

export interface PortfolioProjection {
  totalInvestment: number
  monthlyProjections: { month: number; value: number; date: string }[]
  projectedValues: {
    oneYear: number
    threeYear: number
    fiveYear: number
  }
  expectedAnnualReturn: number
  riskLevel: 'low' | 'medium' | 'high'
  diversificationScore: number
  sectorBreakdown: { [sector: string]: number }
}

export interface InvestmentRecommendation {
  symbol: string
  name: string
  type: 'buy' | 'sell' | 'hold'
  amount: number
  confidence: number
  reasoning: string
  sector: string
  targetPrice?: number
  stopLoss?: number
}

export async function generateInvestmentRecommendations(
  userProfile: any,
  marketData?: any[]
): Promise<InvestmentAnalysis> {
  try {
    console.log('🤖 Generating comprehensive AI investment recommendations...')
    
    if (!API_KEYS.OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API key not found, using fallback recommendations')
      return generateFallbackRecommendations(userProfile)
    }

    // Step 1: Gather comprehensive market data
    console.log('📊 Gathering real-time market data...')
    const marketContext = await gatherComprehensiveMarketData(userProfile)
    
    // Step 2: Get current financial news
    console.log('📰 Fetching current financial news...')
    const newsContext = await getFinancialNews()
    
    // Step 3: Analyze existing portfolio if any
    let portfolioAnalysis = ''
    if (userProfile.existingPortfolio && userProfile.existingPortfolio.length > 0) {
      portfolioAnalysis = await analyzeExistingPortfolio(userProfile.existingPortfolio)
    }

    // Step 4: Create comprehensive prompt for OpenAI
    const systemPrompt = `You are an elite investment advisor AI for G.AI.NS platform with access to real-time market data and comprehensive financial analysis capabilities. You must provide the most sophisticated and current investment recommendations possible.

    USER PROFILE ANALYSIS:
    - Risk Tolerance: ${userProfile.riskTolerance}/10 (${getRiskDescription(userProfile.riskTolerance)})
    - Investment Horizon: ${userProfile.timeHorizon} (${getTimeHorizonDescription(userProfile.timeHorizon)})
    - Growth Strategy: ${userProfile.growthType} (${getGrowthDescription(userProfile.growthType)})
    - Sector Preferences: ${userProfile.sectors?.join(', ') || 'No specific preferences - open to all sectors'}
    - ESG Priority: ${userProfile.ethicalInvesting}/10 (${getESGDescription(userProfile.ethicalInvesting)})
    - Available Capital: $${(userProfile.capitalAvailable || userProfile.capital || 0).toLocaleString()}
    - Current Holdings: ${userProfile.existingPortfolio?.length > 0 ? JSON.stringify(userProfile.existingPortfolio) : 'No existing investments'}

    REAL-TIME MARKET CONTEXT:
    ${marketContext}

    CURRENT FINANCIAL NEWS & SENTIMENT:
    ${newsContext.slice(0, 5).map(news => `• ${news.title} (${news.source}) - ${news.sentiment || 'neutral'} sentiment`).join('\n')}

    ${portfolioAnalysis ? `EXISTING PORTFOLIO ANALYSIS:\n${portfolioAnalysis}` : ''}

    COMPREHENSIVE ANALYSIS REQUIREMENTS:
    1. Factor in ALL current market conditions, economic indicators, and sector performance
    2. Consider geopolitical events, interest rates, inflation, and market volatility
    3. Analyze the user's complete financial profile and risk capacity
    4. Provide specific stock recommendations with real current prices and target prices
    5. Include diversification across sectors based on user preferences
    6. Factor in ESG criteria if important to the user
    7. Consider the user's existing portfolio for optimal allocation
    8. Provide realistic timelines for achieving investment goals

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
          "stopLoss": 180
        }
      ],
      "reasoning": "Comprehensive explanation of the overall investment strategy, how it aligns with user goals, current market conditions, and expected outcomes",
      "riskAssessment": "Detailed risk analysis including portfolio volatility, potential downside scenarios, risk mitigation strategies, and how this aligns with user's risk tolerance",
      "marketOutlook": "Current market analysis, economic trends, sector outlook, potential catalysts and risks, and how they impact these recommendations"
    }

    CRITICAL REQUIREMENTS:
    - ALL "amount" values MUST be integers (whole numbers), never strings
    - Total recommended investment should not exceed available capital
    - Use REAL current stock symbols and realistic prices
    - Provide specific, actionable recommendations based on comprehensive analysis
    - Include 5-8 diversified recommendations unless capital is very limited
    - Each recommendation should include detailed reasoning based on current data`

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
        temperature: 0.3, // Lower temperature for more consistent, analytical responses
        max_tokens: 4000, // Increased for comprehensive analysis
      }),
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    try {
      const analysis: InvestmentAnalysis = JSON.parse(content)
      
      // Validate and clean recommendation data
      analysis.recommendations = analysis.recommendations.map((rec: any) => {
        // Ensure amount is a valid number
        const cleanAmount = typeof rec.amount === 'string' 
          ? parseFloat(rec.amount.replace(/[^0-9.-]/g, '')) || 0
          : (typeof rec.amount === 'number' ? rec.amount : 0)
        
        return {
          ...rec,
          amount: Math.round(cleanAmount), // Ensure it's an integer
          confidence: typeof rec.confidence === 'number' ? rec.confidence : 75,
          targetPrice: typeof rec.targetPrice === 'number' ? rec.targetPrice : undefined,
          stopLoss: typeof rec.stopLoss === 'number' ? rec.stopLoss : undefined
        }
      }).filter((rec: any) => rec.amount > 0) // Remove any recommendations with invalid amounts
      
      // Add portfolio projections
      analysis.portfolioProjections = calculatePortfolioProjections(analysis.recommendations, userProfile)
      
      console.log('✅ Comprehensive AI recommendations generated successfully')
      console.log('Validated recommendations:', analysis.recommendations.map(r => ({ symbol: r.symbol, amount: r.amount, type: typeof r.amount })))
      return analysis
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.log('Raw AI response:', content)
      return generateFallbackRecommendations(userProfile)
    }

  } catch (error) {
    console.error('Error generating investment recommendations:', error)
    return generateFallbackRecommendations(userProfile)
  }
}

function calculatePortfolioProjections(recommendations: InvestmentRecommendation[], userProfile: any): PortfolioProjection {
  const totalInvestment = userProfile.capitalAvailable || userProfile.capital || 0
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
  
  // Calculate expected return based on user profile
  let baseReturn = 0.07 // 7% base return
  if (userProfile.growthType === 'aggressive') baseReturn = 0.12
  if (userProfile.growthType === 'conservative') baseReturn = 0.05
  
  const expectedAnnualReturn = baseReturn + (riskMultiplier * 0.03)
  
  // Generate monthly projections for 5 years
  const monthlyProjections = []
  const monthlyReturn = expectedAnnualReturn / 12
  let currentValue = totalInvestment
  
  for (let month = 1; month <= 60; month++) {
    currentValue *= (1 + monthlyReturn)
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
    expectedAnnualReturn: Math.round(expectedAnnualReturn * 100 * 10) / 10, // Round to 1 decimal
    riskLevel: (userProfile.riskTolerance || 5) <= 3 ? 'low' : (userProfile.riskTolerance || 5) <= 7 ? 'medium' : 'high',
    diversificationScore: Math.min(Object.keys(sectorBreakdown).length * 20, 100),
    sectorBreakdown
  }
}

function generateFallbackRecommendations(userProfile: any): InvestmentAnalysis {
  console.log('🔄 Generating fallback recommendations...')
  
  const recommendations: InvestmentRecommendation[] = []
  const totalAmount = userProfile.capitalAvailable || userProfile.capital || 10000
  
  // Conservative recommendations based on user profile
  if (userProfile.riskTolerance <= 3) {
    recommendations.push(
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'buy', amount: totalAmount * 0.4, confidence: 90, reasoning: 'Broad market exposure with low risk', sector: 'Diversified' },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'buy', amount: totalAmount * 0.4, confidence: 85, reasoning: 'Stable bond exposure', sector: 'Fixed Income' },
      { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', type: 'buy', amount: totalAmount * 0.2, confidence: 80, reasoning: 'Dividend income focus', sector: 'Dividend' }
    )
  } else if (userProfile.riskTolerance <= 7) {
    recommendations.push(
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'buy', amount: totalAmount * 0.5, confidence: 90, reasoning: 'Strong large-cap exposure', sector: 'Large Cap' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'buy', amount: totalAmount * 0.3, confidence: 85, reasoning: 'Broad market diversification', sector: 'Diversified' },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', type: 'buy', amount: totalAmount * 0.2, confidence: 80, reasoning: 'International diversification', sector: 'International' }
    )
  } else {
    recommendations.push(
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'buy', amount: totalAmount * 0.4, confidence: 85, reasoning: 'High-growth tech exposure', sector: 'Technology' },
      { symbol: 'VUG', name: 'Vanguard Growth ETF', type: 'buy', amount: totalAmount * 0.3, confidence: 80, reasoning: 'Growth-focused investing', sector: 'Growth' },
      { symbol: 'VB', name: 'Vanguard Small-Cap ETF', type: 'buy', amount: totalAmount * 0.3, confidence: 75, reasoning: 'Small-cap growth potential', sector: 'Small Cap' }
    )
  }
  
  return {
    recommendations,
    reasoning: `Portfolio designed for ${userProfile.riskTolerance <= 3 ? 'conservative' : userProfile.riskTolerance <= 7 ? 'moderate' : 'aggressive'} risk tolerance with ${userProfile.timeHorizon} time horizon.`,
    riskAssessment: `Risk level: ${userProfile.riskTolerance}/10. Diversified approach to match your risk profile.`,
    marketOutlook: 'Current market conditions suggest a balanced approach with focus on diversification.',
    portfolioProjections: calculatePortfolioProjections(recommendations, userProfile)
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