'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, TrendingUp, TrendingDown, Minus, ArrowRight, AlertCircle } from 'lucide-react'
import { UserProfile, InvestmentRecommendation } from '@/types'
import PortfolioChart from './PortfolioChart'
import { useScreenSize } from '@/lib/useScreenSize'

interface RecommendationsPageProps {
  userProfile: UserProfile
  onRestart: () => void
}

const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ userProfile, onRestart }) => {
  const screenSize = useScreenSize()
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([])
  const [portfolioProjections, setPortfolioProjections] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null)
  const [loadingPercentage, setLoadingPercentage] = useState(0)



  // Generate recommendations using real APIs when available
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true)
      setLoadingPercentage(0)
      
      // Steady loading progress during API call
      const progressInterval = setInterval(() => {
        setLoadingPercentage(prev => {
          if (prev < 95) {
            return Math.min(prev + 1, 95) // Steady 1% increment, max 95%
          }
          return prev
        })
      }, 150) // Slower, steady pace
      
      try {
        // Call the API route
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userProfile)
        })
        
        clearInterval(progressInterval)
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }

        const analysis = await response.json()
        
        if (analysis.error || analysis.apiError) {
          // Set detailed error information
          setErrorDetails(analysis.errorDetails || {
            message: analysis.error || analysis.details || 'Unknown error',
            apiStatus: null,
            timestamp: new Date().toISOString()
          })
          
          // If we have recommendations despite the error, show them (fallback mode)
          if (analysis.recommendations && analysis.recommendations.length > 0) {
            setLoadingPercentage(100)
            await new Promise(resolve => setTimeout(resolve, 300))
            setRecommendations(analysis.recommendations)
            setPortfolioProjections(analysis.portfolioProjections)
            setIsLoading(false)
            return
          }
          
          throw new Error(analysis.error || analysis.details || 'API configuration error')
        }

        // Complete the loading to 100%
        setLoadingPercentage(100)
        
        // Brief pause to show 100% completion
        await new Promise(resolve => setTimeout(resolve, 300))

        setRecommendations(analysis.recommendations)
        setPortfolioProjections(analysis.portfolioProjections)
        setIsLoading(false)
        return
      } catch (error) {
        console.error('API Error:', error)
        
        clearInterval(progressInterval)
        
        // Check API key status for better error messaging if we don't already have it
        if (!errorDetails) {
          try {
            const keyResponse = await fetch('/api/validate-keys')
            const keyStatus = await keyResponse.json()
            setApiKeyStatus(keyStatus)
          } catch (keyError) {
            console.error('Failed to check API keys:', keyError)
          }
        }
        
        setIsLoading(false)
        setApiError(true)
        return
      }
    }
    
    generateRecommendations()
  }, [userProfile])

  const getTypeIcon = (type: 'buy' | 'sell' | 'hold') => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-5 h-5 text-green-400" />
      case 'sell': return <TrendingDown className="w-5 h-5 text-red-400" />
      case 'hold': return <Minus className="w-5 h-5 text-yellow-400" />
    }
  }

  const getTypeColor = (type: 'buy' | 'sell' | 'hold') => {
    switch (type) {
      case 'buy': return 'text-green-400 bg-green-900/20 border-green-700'
      case 'sell': return 'text-red-400 bg-red-900/20 border-red-700'
      case 'hold': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
    }
  }

  const getStrengthColor = (strength: 'weak' | 'moderate' | 'strong') => {
    switch (strength) {
      case 'weak': return 'text-red-400'
      case 'moderate': return 'text-yellow-400'
      case 'strong': return 'text-green-400'
      default: return 'text-yellow-400'
    }
  }

  const getStrengthDisplay = (strength: 'weak' | 'moderate' | 'strong') => {
    switch (strength) {
      case 'weak': return 'Weak'
      case 'moderate': return 'Strong' 
      case 'strong': return 'Very Strong'
      default: return 'Moderate'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProfileSummary = () => {
    const parts = []
    parts.push(userProfile.timeHorizon)
    parts.push('term')
    parts.push(userProfile.growthType)
    return parts.join(' ')
  }

  // Calculate totals for each recommendation type
  const calculateTotal = (type: 'buy' | 'sell' | 'hold') => {
    return recommendations
      .filter(r => r.type === type)
      .reduce((sum, r) => sum + r.amount, 0)
  }

  // Calculate allocation breakdown
  const getAllocationBreakdown = () => {
    const existingPortfolioValue = userProfile.existingPortfolio.reduce((sum: number, item: any) => sum + item.amount, 0)
    const newBuyTotal = calculateTotal('buy')
    const holdTotal = calculateTotal('hold')
    const sellTotal = calculateTotal('sell')
    
    return {
      existingPortfolioValue,
      newInvestments: newBuyTotal,
      totalHoldings: holdTotal,
      sellRecommendations: sellTotal,
      availableCapital: userProfile.capitalAvailable,
      utilizationRate: (newBuyTotal / userProfile.capitalAvailable) * 100
    }
  }

  const allocationBreakdown = getAllocationBreakdown()

  if (isLoading) {
    return (
      <div className={`w-full max-w-lg mx-auto text-center ${screenSize.isMobile ? 'py-8 px-4' : 'py-20'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">
              Creating Your Portfolio
            </h2>
          </div>
          
          {/* Continuously Scrolling Graph */}
          <div className="relative h-32 bg-gray-900/50 rounded-lg p-4 border border-gray-700 overflow-hidden">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 400 80" 
              className="overflow-hidden"
            >
              {/* Simple grid background */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgb(75 85 99)" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Realistic zigzag growth line */}
              <motion.path
                d="M 0 65 L 30 58 L 50 62 L 80 55 L 100 48 L 120 52 L 150 45 L 180 38 L 200 42 L 230 35 L 260 28 L 290 32 L 320 25 L 350 18 L 380 22 L 400 15"
                fill="none"
                stroke="url(#growthGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: loadingPercentage / 100 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeOut"
                }}
              />
              
              {/* Data points that align with key zigzag points */}
              {[
                { x: 80, y: 55 }, { x: 150, y: 45 }, { x: 230, y: 35 }, 
                { x: 290, y: 32 }, { x: 350, y: 18 }, { x: 400, y: 15 }
              ].map((point, index) => {
                const shouldShow = loadingPercentage > (index + 1) * 16
                return (
                  <motion.circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="#10b981"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: shouldShow ? 1 : 0,
                      opacity: shouldShow ? 1 : 0
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                  />
                )
              })}
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Animated percentage counter in top right */}
            <div className="absolute top-2 right-2">
              <motion.div
                className="text-lg font-bold text-green-400 font-mono bg-gray-900/80 px-2 py-1 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.floor(loadingPercentage)}%
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (apiError) {
    const getErrorTitle = () => {
      if (errorDetails?.message?.includes('rate limit exceeded')) {
        return 'API Rate Limit Exceeded'
      } else if (errorDetails?.message?.includes('quota exceeded')) {
        return 'API Quota Exceeded'
      } else if (errorDetails?.message?.includes('invalid') || errorDetails?.message?.includes('expired')) {
        return 'Invalid API Key'
      } else if (errorDetails?.message?.includes('No AI service')) {
        return 'AI Service Not Configured'
      } else {
        return 'API Configuration Required'
      }
    }

    const getErrorMessage = () => {
      if (errorDetails?.message?.includes('rate limit exceeded')) {
        return 'One of your API services has exceeded its rate limit. Please wait before trying again.'
      } else if (errorDetails?.message?.includes('quota exceeded')) {
        return 'One of your API services has exceeded its quota. Please check your billing or upgrade your plan.'
      } else if (errorDetails?.message?.includes('invalid') || errorDetails?.message?.includes('expired')) {
        return 'One of your API keys is invalid or has expired. Please check your configuration.'
      } else {
        return 'Your API keys need to be configured to generate personalized investment recommendations.'
      }
    }

    const getSpecificErrorDetails = () => {
      if (!errorDetails?.apiStatus) return null
      
      const status = errorDetails.apiStatus
      const issues = []
      
      if (!status.aiServices?.configured) {
        if (!status.aiServices?.openai && !status.aiServices?.grok) {
          issues.push('❌ No AI service configured (OpenAI or Grok required)')
        } else if (!status.aiServices?.openai) {
          issues.push('⚠️ OpenAI not configured (using Grok fallback)')
        } else if (!status.aiServices?.grok) {
          issues.push('⚠️ Grok not configured (using OpenAI)')
        }
      }
      
      if (!status.financialDataAPIs?.configured) {
        const missing = []
        if (!status.financialDataAPIs?.alphaVantage) missing.push('Alpha Vantage')
        if (!status.financialDataAPIs?.twelveData) missing.push('Twelve Data')
        if (!status.financialDataAPIs?.finnhub) missing.push('Finnhub')
        issues.push(`❌ No financial data API configured (${missing.join(', ')} not available)`)
      } else {
        // Show which financial APIs are working
        const working = []
        if (status.financialDataAPIs?.alphaVantage) working.push('Alpha Vantage')
        if (status.financialDataAPIs?.twelveData) working.push('Twelve Data')
        if (status.financialDataAPIs?.finnhub) working.push('Finnhub')
        if (working.length > 0) {
          issues.push(`✅ Financial data APIs: ${working.join(', ')}`)
        }
      }
      
      return issues
    }

    return (
      <div className={`w-full max-w-4xl mx-auto text-center ${screenSize.isMobile ? 'py-8 px-4' : 'py-16'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`space-y-${screenSize.isMobile ? '4' : '6'}`}
        >
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-400 mb-3">{getErrorTitle()}</h2>
            <div className="text-gray-300 mb-6 max-w-lg mx-auto">
              <p className="mb-4">
                {getErrorMessage()}
              </p>
              
              {errorDetails?.message && (
                <div className="text-sm bg-gray-800 rounded-lg p-4 text-left mb-4">
                  <div className="font-semibold text-yellow-400 mb-2">Error Details:</div>
                  <div className="text-gray-300">{errorDetails.message}</div>
                  {errorDetails.timestamp && (
                    <div className="text-xs text-gray-500 mt-2">
                      Time: {new Date(errorDetails.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {getSpecificErrorDetails() && (
                <div className="text-sm bg-gray-800 rounded-lg p-4 text-left mb-4">
                  <div className="font-semibold text-yellow-400 mb-2">API Status:</div>
                  {getSpecificErrorDetails()?.map((issue, index) => (
                    <div key={index} className="text-gray-300 mb-1">{issue}</div>
                  ))}
                </div>
              )}

              <div className="text-sm bg-gray-800 rounded-lg p-4 text-left">
                <div className="mb-2">
                  <strong className="text-yellow-400">Required:</strong> AI Service (OpenAI or Grok)
                </div>
                <div className="mb-2">
                  <strong className="text-yellow-400">Required:</strong> Financial Data API
                </div>
                <div className="text-xs text-gray-400 mt-3">
                  <strong>Fallback Order:</strong><br/>
                  • AI: OpenAI → Grok<br/>
                  • Financial: Alpha Vantage → Twelve Data → Finnhub<br/>
                  Edit your <code className="bg-gray-700 px-1 rounded">.env.local</code> file with real API keys.
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onRestart}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Go Back
              </button>
              <button
                onClick={() => window.open('/api/validate-keys', '_blank')}
                className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Check API Status
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-${screenSize.isMobile ? '4' : '6'} ${screenSize.isMobile ? 'pb-8 pt-2 px-4' : 'pb-16 pt-4'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center ${screenSize.isMobile ? 'mb-4' : 'mb-6'}`}
      >
        <h1 className="text-xl font-semibold text-white mb-2">
          Your ideal portfolio for{' '}
          <span className="text-gray-300">{getProfileSummary()}</span> approach
        </h1>
        <p className="text-gray-400 text-sm">
          Risk tolerance: {userProfile.riskTolerance}/10 • Available Capital: {formatCurrency(userProfile.capitalAvailable)}
        </p>
        {allocationBreakdown.existingPortfolioValue > 0 && (
          <p className="text-gray-400 text-xs mt-1">
            Existing Portfolio Value: {formatCurrency(allocationBreakdown.existingPortfolioValue)} • 
            Capital Utilization: {allocationBreakdown.utilizationRate.toFixed(1)}%
          </p>
        )}
      </motion.div>

      {/* Recommendations Sections */}
      <div className={`grid grid-cols-1 ${screenSize.isMobile ? 'gap-4' : screenSize.isTablet ? 'md:grid-cols-2 gap-5' : 'lg:grid-cols-3 gap-6'}`}>
        {/* Buy Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-green-400">BUY</h2>
            </div>
            <div className="text-sm text-green-300 bg-green-900/20 border border-green-700/50 rounded-lg px-3 py-2">
              Total: {formatCurrency(calculateTotal('buy'))}
            </div>
          </div>
          
          {recommendations.filter(r => r.type === 'buy').map((rec, index) => (
            <RecommendationCard
              key={rec.symbol}
              recommendation={rec}
              onInfoClick={() => setSelectedInfo(selectedInfo === rec.symbol ? null : rec.symbol)}
              isInfoOpen={selectedInfo === rec.symbol}
              index={index}
            />
          ))}
        </motion.div>

        {/* Hold Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-yellow-400">HOLD</h2>
            </div>
            <div className="text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-3 py-2">
              Total: {formatCurrency(calculateTotal('hold'))}
            </div>
          </div>
          
          {recommendations.filter(r => r.type === 'hold').length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
              <p className="text-gray-400">No hold recommendations at this time</p>
            </div>
          ) : (
            recommendations.filter(r => r.type === 'hold').map((rec, index) => (
              <RecommendationCard
                key={rec.symbol}
                recommendation={rec}
                onInfoClick={() => setSelectedInfo(selectedInfo === rec.symbol ? null : rec.symbol)}
                isInfoOpen={selectedInfo === rec.symbol}
                index={index}
              />
            ))
          )}
        </motion.div>

        {/* Sell Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-red-400">SELL</h2>
            </div>
            <div className="text-sm text-red-300 bg-red-900/20 border border-red-700/50 rounded-lg px-3 py-2">
              Total: {formatCurrency(calculateTotal('sell'))}
            </div>
          </div>
          
          {recommendations.filter(r => r.type === 'sell').length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
              <p className="text-gray-400">No sell recommendations at this time</p>
            </div>
          ) : (
            recommendations.filter(r => r.type === 'sell').map((rec, index) => (
              <RecommendationCard
                key={rec.symbol}
                recommendation={rec}
                onInfoClick={() => setSelectedInfo(selectedInfo === rec.symbol ? null : rec.symbol)}
                isInfoOpen={selectedInfo === rec.symbol}
                index={index}
              />
            ))
          )}
        </motion.div>
      </div>

      {/* Portfolio Projections Summary */}
      {portfolioProjections && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`bg-gray-800 rounded-xl ${screenSize.isMobile ? 'p-4' : 'p-6'} border border-gray-700 ${screenSize.isMobile ? 'mb-4' : 'mb-6'}`}
        >
          <h3 className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white ${screenSize.isMobile ? 'mb-3' : 'mb-4'}`}>Portfolio Projections</h3>
          <div className={`grid ${screenSize.isMobile ? 'grid-cols-2 gap-2 mb-3' : 'grid-cols-1 md:grid-cols-3 gap-4 mb-4'}`}>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Expected Annual Return</div>
              <div className="text-lg font-semibold text-green-400">
                {(() => {
                  // Calculate average annual return over 5 years from portfolio projections
                  if (portfolioProjections?.projectedValues?.fiveYear && userProfile.capitalAvailable > 0) {
                    const initialValue = userProfile.capitalAvailable
                    const finalValue = portfolioProjections.projectedValues.fiveYear
                    const annualReturn = Math.pow(finalValue / initialValue, 1/5) - 1
                    return `${(annualReturn * 100).toFixed(1)}%`
                  }
                  
                  // Fallback: Calculate weighted average return based on actual recommendations
                  const buyRecommendations = recommendations.filter(r => r.type === 'buy')
                  if (buyRecommendations.length > 0) {
                    const totalAmount = buyRecommendations.reduce((sum, r) => sum + r.amount, 0)
                    const weightedReturn = buyRecommendations.reduce((sum, r) => {
                      const expectedReturn = r.expectedAnnualReturn || 0.08 // fallback to 8%
                      const weight = r.amount / totalAmount
                      return sum + (expectedReturn * weight)
                    }, 0)
                    return `${(weightedReturn * 100).toFixed(1)}%`
                  }
                  
                  // Final fallback
                  return portfolioProjections?.expectedAnnualReturn 
                    ? `${portfolioProjections.expectedAnnualReturn.toFixed(1)}%`
                    : '7.0%'
                })()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Risk Level</div>
              <div className={`text-lg font-semibold capitalize ${
                userProfile.riskTolerance <= 3 ? 'text-green-400' :
                userProfile.riskTolerance <= 7 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {userProfile.riskTolerance <= 3 ? 'low' : userProfile.riskTolerance <= 7 ? 'medium' : 'high'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Diversification Score</div>
              <div className="text-lg font-semibold text-blue-400">
                {Math.min(100, Math.max(40, (recommendations.filter(r => r.type === 'buy').length * 15) + (userProfile.sectors.length * 8)))}
              </div>
            </div>
          </div>
          <div className={`grid ${screenSize.isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">1-Year Projection</div>
              <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
                {formatCurrency(portfolioProjections.projectedValues.oneYear)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">3-Year Projection</div>
              <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
                {formatCurrency(portfolioProjections.projectedValues.threeYear)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">5-Year Projection</div>
              <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
                {formatCurrency(portfolioProjections.projectedValues.fiveYear)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portfolio Performance Chart */}
      <PortfolioChart 
        recommendations={recommendations}
        initialCapital={userProfile.capitalAvailable}
        portfolioProjections={portfolioProjections}
      />

      {/* Restart Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-8 pb-8"
      >
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
        >
          Restart with new information
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: InvestmentRecommendation
  onInfoClick: () => void
  isInfoOpen: boolean
  index: number
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onInfoClick,
  isInfoOpen,
  index
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeColor = (type: 'buy' | 'sell' | 'hold') => {
    switch (type) {
      case 'buy': return 'bg-green-900/20 border-green-700'
      case 'sell': return 'bg-red-900/20 border-red-700'
      case 'hold': return 'bg-yellow-900/20 border-yellow-700'
    }
  }

  const getStrengthColor = (strength: 'weak' | 'moderate' | 'strong') => {
    switch (strength) {
      case 'weak': return 'text-red-400'
      case 'moderate': return 'text-yellow-400' 
      case 'strong': return 'text-green-400'
      default: return 'text-yellow-400'
    }
  }

  const getStrengthDisplay = (strength: 'weak' | 'moderate' | 'strong') => {
    switch (strength) {
      case 'weak': return 'Weak'
      case 'moderate': return 'Strong' 
      case 'strong': return 'Very Strong'
      default: return 'Moderate'
    }
  }

  // Check if this is placeholder data
  const isPlaceholder = (['VTI', 'BND', 'VEA'].includes(recommendation.symbol) && 
                        (recommendation.reasoning.includes('broad market exposure') ||
                         recommendation.reasoning.includes('provides stability') ||
                         recommendation.reasoning.includes('international diversification') ||
                         recommendation.reasoning.includes('Broad market exposure') ||
                         recommendation.reasoning.includes('Provides stability') ||
                         recommendation.reasoning.includes('International diversification'))) ||
                       (recommendation.reasoning.includes('Unable to provide specific investment recommendations') ||
                        recommendation.reasoning.includes('Consider consulting with a financial advisor'))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-xl p-4 border ${
        isPlaceholder 
          ? 'bg-red-900/10 border-red-700/50' 
          : getTypeColor(recommendation.type) + ' bg-gray-800/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${
            isPlaceholder ? 'text-red-400' : 'text-white'
          }`}>
            {recommendation.symbol}
            {isPlaceholder && (
              <span className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded border border-red-700/50">
                PLACEHOLDER
              </span>
            )}
          </h3>
          <p className={`text-sm ${isPlaceholder ? 'text-red-300' : 'text-gray-400'}`}>
            {recommendation.name}
          </p>
        </div>
        <button
          onClick={onInfoClick}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Amount:</span>
          <span className={`font-semibold ${isPlaceholder ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(recommendation.amount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Strength:</span>
          <span className={`font-semibold capitalize ${
            isPlaceholder ? 'text-red-400' : getStrengthColor(recommendation.strength)
          }`}>
            {getStrengthDisplay(recommendation.strength)}
          </span>
        </div>
      </div>

      {/* Info Panel */}
      {isInfoOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`mt-3 p-3 rounded-lg border ${
            isPlaceholder 
              ? 'bg-red-900/20 border-red-700/50' 
              : 'bg-gray-900/50 border-gray-600'
          }`}
        >
          <p className={`text-sm ${isPlaceholder ? 'text-red-300' : 'text-gray-300'}`}>
            {recommendation.reasoning}
          </p>
          <div className={`mt-2 text-xs ${isPlaceholder ? 'text-red-400' : 'text-gray-500'}`}>
            Sector: {recommendation.sector}
            {isPlaceholder && (
              <span className="ml-2 text-red-400">
                • Configure API keys for personalized recommendations
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default RecommendationsPage 