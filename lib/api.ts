// API Configuration for G.AI.NS Investment Platform
// This file contains all API integrations for real investment data and AI analysis

// ========================================
// API KEYS CONFIGURATION
// ========================================

// Environment variables for API keys
const API_KEYS = {
  // OpenAI for investment analysis and recommendations
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Grok API for alternative AI analysis
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  
  // Financial Data APIs
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || '',
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
  POLYGON_API_KEY: process.env.POLYGON_API_KEY || '',
  
  // Additional Financial APIs
  YAHOO_FINANCE_API_KEY: process.env.YAHOO_FINANCE_API_KEY || '',
  TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY || '',
  
  // News and Sentiment APIs
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  MARKETAUX_API_KEY: process.env.MARKETAUX_API_KEY || '',
}

// ========================================
// API ENDPOINTS
// ========================================

const API_ENDPOINTS = {
  // OpenAI
  OPENAI_CHAT: 'https://api.openai.com/v1/chat/completions',
  
  // Grok
  GROK_CHAT: 'https://api.x.ai/v1/chat/completions',
  
  // Alpha Vantage
  ALPHA_VANTAGE_BASE: 'https://www.alphavantage.co/query',
  
  // Finnhub
  FINNHUB_BASE: 'https://finnhub.io/api/v1',
  
  // Polygon
  POLYGON_BASE: 'https://api.polygon.io/v2',
  
  // Yahoo Finance (via RapidAPI)
  YAHOO_FINANCE_BASE: 'https://yahoo-finance15.p.rapidapi.com/api/yahoo',
  
  // Twelve Data
  TWELVE_DATA_BASE: 'https://api.twelvedata.com',
  
  // News API
  NEWS_API_BASE: 'https://newsapi.org/v2',
  
  // MarketAux
  MARKETAUX_BASE: 'https://api.marketaux.com/v1',
}

// ========================================
// STOCK DATA FUNCTIONS
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
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Get real-time stock data
export async function getStockData(symbol: string): Promise<StockData | null> {
  try {
    // Primary: Alpha Vantage
    const response = await fetch(
      `${API_ENDPOINTS.ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error('Alpha Vantage API failed')
    }
    
    const data = await response.json()
    const quote = data['Global Quote']
    
    if (!quote) {
      throw new Error('No quote data available')
    }
    
    return {
      symbol: quote['01. symbol'],
      name: symbol, // Would need company name lookup
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume'])
    }
  } catch (error) {
    console.error('Error fetching stock data:', error)
    
    // Fallback: Try Finnhub
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FINNHUB_BASE}/quote?symbol=${symbol}&token=${API_KEYS.FINNHUB_API_KEY}`
      )
      
      const data = await response.json()
      
      return {
        symbol,
        name: symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: 0 // Finnhub doesn't provide volume in quote endpoint
      }
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError)
      return null
    }
  }
}

// Get historical stock data
export async function getHistoricalData(symbol: string, period: string = '1year'): Promise<HistoricalData[]> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE_API_KEY}`
    )
    
    const data = await response.json()
    const timeSeries = data['Time Series (Daily)']
    
    if (!timeSeries) {
      throw new Error('No historical data available')
    }
    
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).slice(0, 365) // Last year of data
    
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
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
  strength: 'weak' | 'moderate' | 'strong'
  confidence: number
  reasoning: string
  sector: string
  targetPrice?: number
  stopLoss?: number
}

// Generate AI-powered investment recommendations
export async function generateInvestmentRecommendations(
  userProfile: any,
  marketData?: any[]
): Promise<InvestmentAnalysis> {
  try {
    const existingHoldings = userProfile.existingPortfolio.map((item: any) => 
      `${item.symbol} (${item.type}): $${item.amount.toLocaleString()}`
    ).join(', ') || 'None'
    
    const prompt = `
    As an expert investment advisor, analyze the following user profile and provide personalized investment recommendations:
    
    User Profile:
    - Risk Tolerance: ${userProfile.riskTolerance}/10
    - Time Horizon: ${userProfile.timeHorizon}
    - Growth Type: ${userProfile.growthType}
    - Sectors of Interest: ${userProfile.sectors.join(', ') || 'Any'}
    - Ethical Investing Priority: ${userProfile.ethicalInvesting}/10
    - Available Capital for NEW investments: $${userProfile.capitalAvailable.toLocaleString()}
    - Existing Portfolio: ${existingHoldings}
    
    CRITICAL ALLOCATION REQUIREMENTS:
    1. EXISTING HOLDINGS: For each existing portfolio item, recommend BUY (add more), HOLD (keep current), or SELL (reduce/exit)
    2. NEW INVESTMENTS: Use the available capital ($${userProfile.capitalAvailable.toLocaleString()}) for NEW buy recommendations
    3. CAPITAL CONSTRAINT: Total NEW buy recommendations must NOT exceed $${userProfile.capitalAvailable.toLocaleString()}
    4. AMOUNT LOGIC:
       - BUY (existing): Amount = additional investment suggested
       - BUY (new): Amount = initial investment from available capital
       - HOLD: Amount = current holding value (no change)
       - SELL: Amount = portion to sell from current holding
    5. ALL EXISTING HOLDINGS must appear in recommendations (as BUY, HOLD, or SELL)
    6. DIVERSIFICATION REQUIREMENTS:
       - Conservative/Balanced: Provide 4-6 NEW buy recommendations for proper diversification
       - Aggressive: Provide 3-5 NEW buy recommendations with focus on growth
       - Ensure no single investment exceeds 40% of available capital
       - Include mix of individual stocks, ETFs, and bonds based on risk tolerance
       - Spread investments across multiple sectors when possible
    
    VALIDATION: Ensure sum of NEW buy recommendations ≤ $${userProfile.capitalAvailable.toLocaleString()}
    
    PORTFOLIO PROJECTIONS: Generate detailed monthly projections for the next 60 months (5 years) considering:
    - Market volatility and realistic fluctuations
    - Economic cycles and seasonal patterns
    - Sector-specific performance trends
    - Risk-adjusted returns for each recommendation
    
    Return ONLY valid JSON matching this exact structure:
    {
      "recommendations": [
        {
          "symbol": "AAPL",
          "name": "Apple Inc.",
          "type": "buy|sell|hold",
          "amount": 5000,
          "strength": "weak|moderate|strong",
          "confidence": 85,
          "reasoning": "Detailed explanation for this specific recommendation...",
          "sector": "Technology",
          "expectedAnnualReturn": 0.12,
          "volatility": 0.18,
          "targetPrice": 185.50
        }
      ],
      "reasoning": "Overall portfolio strategy explanation",
      "riskAssessment": "Risk analysis based on user's profile",
      "marketOutlook": "Current market outlook and implications",
      "portfolioProjections": {
        "totalInvestment": 15000,
        "monthlyProjections": [
          {
            "month": 0,
            "value": 15000,
            "date": "2024-01"
          },
          {
            "month": 1,
            "value": 15120,
            "date": "2024-02"
          }
        ],
        "projectedValues": {
          "oneYear": 16200,
          "threeYear": 19440,
          "fiveYear": 24300
        },
        "expectedAnnualReturn": 0.08,
        "riskLevel": "medium",
        "diversificationScore": 85,
        "sectorBreakdown": {
          "Technology": 40,
          "Financials": 30,
          "Healthcare": 20,
          "ETF": 10
        }
      }
    }
    
    IMPORTANT: For each recommendation, provide:
    - expectedAnnualReturn: Realistic annual return expectation (0.05-0.15 range)
    - volatility: Expected price volatility (0.10-0.35 range)  
    - targetPrice: 12-month price target (optional)
    
    For portfolioProjections, calculate:
    - totalInvestment: Sum of all new investments
    - monthlyProjections: Array of 61 monthly values (0-60 months) with realistic market fluctuations
    - projectedValues: Compound growth projections for 1, 3, and 5 years
    - expectedAnnualReturn: Weighted average of all recommendations
    - riskLevel: Overall portfolio risk (low/medium/high)
    - diversificationScore: 0-100 based on sector spread
    - sectorBreakdown: Percentage allocation by sector
    
    MONTHLY PROJECTIONS MUST:
    - Include month 0 as starting value
    - Show realistic market volatility (not smooth curves)
    - Account for economic cycles and corrections
    - Reflect seasonal market patterns
    - Include proper date formatting (YYYY-MM)
    `
    
    // Primary: OpenAI
    const response = await fetch(API_ENDPOINTS.OPENAI_CHAT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional investment advisor with expertise in portfolio management, risk assessment, and market analysis. You must respond with ONLY valid JSON - no additional text, explanations, or formatting. Return only the JSON object as specified in the user prompt.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }
    
    const data = await response.json()
    const aiResponse = data.choices[0].message.content
    
    console.log('AI Response:', aiResponse) // Debug log
    
    // Extract JSON from the AI response (it might contain additional text)
    let jsonResponse
    try {
      // First try to parse the response directly
      jsonResponse = JSON.parse(aiResponse)
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the response
      console.log('Direct JSON parse failed, attempting to extract JSON...')
      
      // Look for JSON content between curly braces
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          jsonResponse = JSON.parse(jsonMatch[0])
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', extractError)
          throw new Error('AI returned invalid JSON format')
        }
      } else {
        console.error('No JSON found in AI response:', aiResponse)
        throw new Error('AI response does not contain valid JSON')
      }
    }
    
    // Validate the response structure
    if (!jsonResponse.recommendations || !Array.isArray(jsonResponse.recommendations)) {
      console.error('Invalid response structure:', jsonResponse)
      throw new Error('AI response missing recommendations array')
    }
    
    // Calculate portfolio projections if not provided by AI
    if (!jsonResponse.portfolioProjections) {
      jsonResponse.portfolioProjections = calculatePortfolioProjections(jsonResponse.recommendations, userProfile)
    }
    
    return jsonResponse
    
  } catch (error) {
    console.error('Error generating AI recommendations:', error)
    
    // Fallback: Return mock data or try Grok API
    return generateFallbackRecommendations(userProfile)
  }
}

// Calculate portfolio projections based on recommendations
function calculatePortfolioProjections(recommendations: InvestmentRecommendation[], userProfile: any): PortfolioProjection {
  const buyRecommendations = recommendations.filter(r => r.type === 'buy')
  const totalInvestment = buyRecommendations.reduce((sum, r) => sum + r.amount, 0)
  
  if (totalInvestment === 0) {
    return {
      totalInvestment: 0,
      monthlyProjections: [],
      projectedValues: { oneYear: 0, threeYear: 0, fiveYear: 0 },
      expectedAnnualReturn: 0,
      riskLevel: 'low',
      diversificationScore: 0,
      sectorBreakdown: {}
    }
  }
  
  // Calculate weighted average expected return
  let weightedReturn = 0
  let totalVolatility = 0
  const sectorBreakdown: { [sector: string]: number } = {}
  
  buyRecommendations.forEach(rec => {
    const weight = rec.amount / totalInvestment
    
    // Use AI-provided values or calculate defaults
    const expectedReturn = (rec as any).expectedAnnualReturn || getSectorExpectedReturn(rec.sector)
    const volatility = (rec as any).volatility || getSectorVolatility(rec.sector)
    
    weightedReturn += expectedReturn * weight
    totalVolatility += volatility * weight
    
    // Track sector allocation
    const sector = rec.sector || 'Other'
    sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + (weight * 100)
  })
  
  // Calculate projections using compound growth
  const oneYear = totalInvestment * Math.pow(1 + weightedReturn, 1)
  const threeYear = totalInvestment * Math.pow(1 + weightedReturn, 3)
  const fiveYear = totalInvestment * Math.pow(1 + weightedReturn, 5)
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'medium'
  if (totalVolatility < 0.15) riskLevel = 'low'
  else if (totalVolatility > 0.25) riskLevel = 'high'
  
  // Calculate diversification score (higher is better)
  const numSectors = Object.keys(sectorBreakdown).length
  const maxSectorAllocation = Math.max(...Object.values(sectorBreakdown))
  const diversificationScore = Math.min(100, (numSectors * 20) + (100 - maxSectorAllocation))
  
  // Generate monthly projections
  const monthlyProjections: { month: number; value: number; date: string }[] = []
  let currentValue = totalInvestment
  for (let month = 0; month <= 60; month++) {
    const monthlyReturn = weightedReturn / 12
    const monthlyVolatility = totalVolatility / Math.sqrt(12)
    const monthlyChange = currentValue * monthlyReturn + currentValue * monthlyVolatility * (Math.random() - 0.5) * 0.02
    currentValue += monthlyChange
    monthlyProjections.push({
      month,
      value: Math.round(currentValue),
      date: new Date(new Date().getFullYear(), new Date().getMonth() + month, 1).toISOString().substr(0, 7)
    })
  }
  
  return {
    totalInvestment,
    monthlyProjections,
    projectedValues: {
      oneYear: Math.round(oneYear),
      threeYear: Math.round(threeYear),
      fiveYear: Math.round(fiveYear)
    },
    expectedAnnualReturn: Math.round(weightedReturn * 10000) / 10000, // Round to 4 decimal places
    riskLevel,
    diversificationScore: Math.round(diversificationScore),
    sectorBreakdown: Object.fromEntries(
      Object.entries(sectorBreakdown).map(([sector, pct]) => [sector, Math.round(pct)])
    )
  }
}

// Helper functions for sector-based defaults
function getSectorExpectedReturn(sector: string): number {
  const sectorReturns: { [key: string]: number } = {
    'Technology': 0.12,
    'Healthcare': 0.10,
    'Financials': 0.09,
    'Energy': 0.11,
    'Utilities': 0.06,
    'Consumer': 0.08,
    'ETF': 0.08,
    'Bonds': 0.04,
    'International': 0.07,
    'Cryptocurrency': 0.15
  }
  
  return sectorReturns[sector] || 0.08
}

function getSectorVolatility(sector: string): number {
  const sectorVolatility: { [key: string]: number } = {
    'Technology': 0.25,
    'Healthcare': 0.18,
    'Financials': 0.20,
    'Energy': 0.30,
    'Utilities': 0.12,
    'Consumer': 0.16,
    'ETF': 0.15,
    'Bonds': 0.08,
    'International': 0.18,
    'Cryptocurrency': 0.40
  }
  
  return sectorVolatility[sector] || 0.15
}

// Fallback recommendations when AI APIs fail
function generateFallbackRecommendations(userProfile: any): InvestmentAnalysis {
  const recommendations: InvestmentRecommendation[] = []
  
  // Check if we have any API keys configured
  const hasOpenAI = API_KEYS.OPENAI_API_KEY && API_KEYS.OPENAI_API_KEY !== 'your_openai_api_key_here'
  const hasGrok = API_KEYS.GROK_API_KEY && API_KEYS.GROK_API_KEY !== 'your_grok_api_key_here'
  const hasFinancialAPI = (API_KEYS.ALPHA_VANTAGE_API_KEY && API_KEYS.ALPHA_VANTAGE_API_KEY !== 'your_alpha_vantage_key_here') || 
                         (API_KEYS.FINNHUB_API_KEY && API_KEYS.FINNHUB_API_KEY !== 'your_finnhub_key_here')
  
  if (!hasOpenAI && !hasGrok) {
    return {
      recommendations: [],
      reasoning: 'API configuration required. Please add your OpenAI or Grok API key to generate personalized investment recommendations.',
      riskAssessment: 'Unable to assess risk without AI analysis. Please configure API keys.',
      marketOutlook: 'Market analysis unavailable. Please configure API keys.'
    }
  }
  
  // If we have existing portfolio, provide guidance on those holdings
  if (userProfile.existingPortfolio && userProfile.existingPortfolio.length > 0) {
    userProfile.existingPortfolio.forEach((holding: any) => {
      if (holding.symbol && holding.amount > 0) {
        recommendations.push({
          symbol: holding.symbol,
          name: `${holding.symbol} Holdings`,
          type: 'hold',
          amount: holding.amount,
          strength: 'moderate',
          confidence: 60,
          reasoning: `Maintain your current ${holding.symbol} position. API configuration required for detailed analysis.`,
          sector: holding.type === 'stock' ? 'Equity' : holding.type === 'crypto' ? 'Cryptocurrency' : holding.type === 'etf' ? 'ETF' : 'Other'
        })
      }
    })
  }
  
  return {
    recommendations,
    reasoning: 'API configuration required for comprehensive investment analysis. Please add your OpenAI or Grok API key.',
    riskAssessment: 'Risk assessment requires AI analysis. Please configure API keys.',
    marketOutlook: 'Market analysis unavailable. Please configure API keys.'
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
      `${API_ENDPOINTS.NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&domains=reuters.com,bloomberg.com,cnbc.com,marketwatch.com&sortBy=publishedAt&apiKey=${API_KEYS.NEWS_API_KEY}`
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

// Validate API keys
export function validateApiKeys(): { [key: string]: boolean } {
  return {
    openai: !!API_KEYS.OPENAI_API_KEY,
    grok: !!API_KEYS.GROK_API_KEY,
    alphaVantage: !!API_KEYS.ALPHA_VANTAGE_API_KEY,
    finnhub: !!API_KEYS.FINNHUB_API_KEY,
    polygon: !!API_KEYS.POLYGON_API_KEY,
    newsApi: !!API_KEYS.NEWS_API_KEY
  }
}

// Rate limiting helper
export class RateLimiter {
  private requests: { [key: string]: number[] } = {}
  
  canMakeRequest(apiName: string, maxRequests: number, timeWindow: number): boolean {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    if (!this.requests[apiName]) {
      this.requests[apiName] = []
    }
    
    // Remove old requests outside the time window
    this.requests[apiName] = this.requests[apiName].filter(time => time > windowStart)
    
    // Check if we can make another request
    if (this.requests[apiName].length < maxRequests) {
      this.requests[apiName].push(now)
      return true
    }
    
    return false
  }
}

export const rateLimiter = new RateLimiter()

// ========================================
// EXPORT CONFIGURATION
// ========================================

export { API_KEYS, API_ENDPOINTS } 