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
      
      // Realistic loading progress based on actual API call timing
      const progressInterval = setInterval(() => {
        setLoadingPercentage(prev => {
          // More realistic progress that matches the actual API call duration
          if (prev < 90) {
            return Math.min(prev + 0.5, 90) // Slower progress, max 90%
          }
          return prev
        })
      }, 200) // Update every 200ms for smoother progress
      
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
          
          // Always show error instead of fallback recommendations
          setApiError(true)
          setIsLoading(false)
          return
        }

        // Complete the loading to 100%
        setLoadingPercentage(100)
        
        // Brief pause to show 100% completion
        await new Promise(resolve => setTimeout(resolve, 300))

        // Check if we have valid recommendations
        if (!analysis.recommendations || analysis.recommendations.length === 0) {
          setErrorDetails({
            message: 'No recommendations generated. Please check your API configuration.',
            apiStatus: null,
            timestamp: new Date().toISOString()
          })
          setApiError(true)
          setIsLoading(false)
          return
        }

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
      <div className="step-layout">
        <div className="step-header">
          <h2 className="text-2xl font-semibold text-white">Creating Your Portfolio</h2>
        </div>

        <div className="step-body">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 w-full max-w-md mx-auto"
          >
            {/* AI Process Steps */}
            {[
              { name: "Testing Grok AI", delay: 0, duration: 2000 },
              { name: "Gathering Market Data", delay: 2000, duration: 3000 },
              { name: "Fetching Financial News", delay: 5000, duration: 2000 },
              { name: "Analyzing Portfolio", delay: 7000, duration: 2500 },
              { name: "Generating Recommendations", delay: 9500, duration: 3000 }
            ].map((step, index) => (
              <motion.div
                key={step.name}
                className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay / 1000 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <motion.div
                      className="w-4 h-4 bg-gray-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        backgroundColor: [
                          "#6b7280", // gray-500
                          "#10b981", // green-500
                          "#10b981"  // green-500
                        ]
                      }}
                      transition={{
                        duration: step.duration / 1000,
                        delay: step.delay / 1000,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <span className="text-gray-300 text-sm">{step.name}</span>
                </div>
                
                {/* Check mark that appears when step completes */}
                <motion.div
                  className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1 
                  }}
                  transition={{ 
                    delay: (step.delay + step.duration) / 1000,
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="step-footer">
          <div className="w-full max-w-md mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${loadingPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (apiError) {
    const getErrorTitle = () => {
      if (errorDetails?.message?.includes('Usage limit has been reached for gains this month')) {
        return 'Monthly Usage Limit Reached'
      } else if (errorDetails?.message?.includes('rate limit exceeded')) {
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
      if (errorDetails?.message?.includes('Usage limit has been reached for gains this month')) {
        return 'We\'ve reached our monthly limit for AI-powered investment recommendations. Please check back next month for personalized insights.'
      } else if (errorDetails?.message?.includes('rate limit exceeded')) {
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
          <div className={`${errorDetails?.message?.includes('Usage limit has been reached for gains this month') 
            ? 'bg-blue-900/20 border border-blue-700' 
            : 'bg-red-900/20 border border-red-700'} rounded-lg p-8`}>
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${errorDetails?.message?.includes('Usage limit has been reached for gains this month') 
              ? 'text-blue-400' : 'text-red-400'}`} />
            <h2 className={`text-2xl font-semibold mb-3 ${errorDetails?.message?.includes('Usage limit has been reached for gains this month') 
              ? 'text-blue-400' : 'text-red-400'}`}>{getErrorTitle()}</h2>
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
        className={`text-center ${screenSize.isMobile ? 'mb-4 px-2' : 'mb-6'}`}
      >
        <h1 className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-2`}>
          Your ideal portfolio for{' '}
          <span className="text-gray-300">{getProfileSummary()}</span> approach
        </h1>
        <p className={`text-gray-400 ${screenSize.isMobile ? 'text-xs' : 'text-sm'}`}>
          Risk tolerance: {userProfile.riskTolerance}/10 • Available Capital: {formatCurrency(userProfile.capitalAvailable)}
        </p>
        {allocationBreakdown.existingPortfolioValue > 0 && (
          <p className={`text-gray-400 ${screenSize.isMobile ? 'text-xs' : 'text-xs'} mt-1`}>
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
      <div className={`${screenSize.isMobile ? 'flex justify-center' : ''}`}>
        <PortfolioChart 
          recommendations={recommendations}
          initialCapital={userProfile.capitalAvailable}
          portfolioProjections={portfolioProjections}
        />
      </div>

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

  const getReturnColor = (returnRate: number) => {
    if (returnRate >= 0.12) return 'text-green-400'
    if (returnRate >= 0.08) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatReturn = (returnRate: number) => {
    return `${(returnRate * 100).toFixed(1)}%`
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
      className={`rounded-xl p-3 border ${
        isPlaceholder 
          ? 'bg-red-900/10 border-red-700/50' 
          : getTypeColor(recommendation.type) + ' bg-gray-800/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
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
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Amount:</span>
          <span className={`font-semibold ${isPlaceholder ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(recommendation.amount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Est. Return/Year:</span>
          <span className={`font-semibold ${
            isPlaceholder ? 'text-red-400' : getReturnColor(recommendation.expectedAnnualReturn)
          }`}>
            {formatReturn(recommendation.expectedAnnualReturn)}
          </span>
        </div>
      </div>

      {/* Info Panel */}
      {isInfoOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`mt-2 p-2 rounded-lg border ${
            isPlaceholder 
              ? 'bg-red-900/20 border-red-700/50' 
              : 'bg-gray-900/50 border-gray-600'
          }`}
        >
          <p className={`text-sm ${isPlaceholder ? 'text-red-300' : 'text-gray-300'}`}>
            {recommendation.reasoning}
          </p>
          <div className={`mt-1 text-xs ${isPlaceholder ? 'text-red-400' : 'text-gray-500'}`}>
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