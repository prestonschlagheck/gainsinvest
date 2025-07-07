export interface UserProfile {
  id?: string
  email?: string
  isGuest: boolean
  riskTolerance: number
  timeHorizon: 'short' | 'medium' | 'long'
  growthType: 'aggressive' | 'balanced' | 'conservative'
  sectors: string[]
  ethicalInvesting: number
  capitalAvailable: number
  existingPortfolio: PortfolioItem[]
}

export interface PortfolioItem {
  symbol: string
  amount: number
  type: 'stock' | 'crypto' | 'etf' | 'other'
}

export interface ChatMessage {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  component?: React.ReactNode
}

export interface QuestionStep {
  id: string
  type: 'welcome' | 'risk-tolerance' | 'time-horizon' | 'growth-type' | 'sectors' | 'ethical' | 'capital' | 'portfolio'
  question: string
  component: React.ComponentType<any>
  isCompleted: boolean
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
  expectedAnnualReturn: number
  volatility?: number
  targetPrice?: number
}

export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
}

export const SECTORS = [
  { 
    id: 'technology', 
    name: 'Technology', 
    examples: 'Apple, Microsoft, Google (Alphabet)' 
  },
  { 
    id: 'healthcare', 
    name: 'Healthcare', 
    examples: 'Johnson & Johnson, Pfizer, CVS' 
  },
  { 
    id: 'financials', 
    name: 'Financials', 
    examples: 'JPMorgan Chase, Bank of America, Visa' 
  },
  { 
    id: 'consumer-discretionary', 
    name: 'Consumer Discretionary', 
    examples: 'Amazon, Tesla, Nike' 
  },
  { 
    id: 'consumer-staples', 
    name: 'Consumer Staples', 
    examples: 'Coca-Cola, Walmart, Pepsi' 
  },
  { 
    id: 'energy', 
    name: 'Energy', 
    examples: 'ExxonMobil, Chevron, Shell' 
  },
  { 
    id: 'industrials', 
    name: 'Industrials', 
    examples: 'Boeing, FedEx, Caterpillar' 
  },
  { 
    id: 'utilities', 
    name: 'Utilities', 
    examples: 'Duke Energy, PG&E, NextEra Energy' 
  },
  { 
    id: 'real-estate', 
    name: 'Real Estate', 
    examples: 'Zillow, Simon Property Group, Realty Income' 
  },
  { 
    id: 'materials', 
    name: 'Materials', 
    examples: 'Dow Chemical, DuPont, Linde' 
  },
  { 
    id: 'telecommunications', 
    name: 'Telecommunications', 
    examples: 'Verizon, AT&T, T-Mobile' 
  },
  { 
    id: 'any', 
    name: 'Any / No Preference', 
    examples: 'Open to all sectors' 
  }
] 