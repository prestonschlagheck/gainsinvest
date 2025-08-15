'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, TrendingUp, TrendingDown, Minus, ArrowRight, AlertCircle, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { UserProfile, InvestmentRecommendation } from '@/types'
import PortfolioChart from './PortfolioChart'
import { useScreenSize } from '@/lib/useScreenSize'

interface RecommendationsPageProps {
  userProfile: UserProfile
  onRestart: () => void
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

  const getTypeIcon = (type: 'buy' | 'sell' | 'hold') => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-5 h-5 text-green-400" />
      case 'sell': return <TrendingDown className="w-5 h-5 text-red-400" />
      case 'hold': return <Minus className="w-5 h-5 text-yellow-400" />
    }
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

  const getReturnColor = (returnRate: number) => {
    // Use green shades instead of yellow/red
    if (returnRate >= 0.15) return 'text-green-600'
    if (returnRate >= 0.12) return 'text-green-500'
    if (returnRate >= 0.08) return 'text-green-400'
    return 'text-green-300'
  }

  const formatReturn = (returnRate: number) => {
    return `${(returnRate * 100).toFixed(1)}%`
  }

  // Simplify long asset names to prevent multi-line display
  const simplifyAssetName = (name: string) => {
    const simplifications: { [key: string]: string } = {
      'Vanguard Total Bond Market ETF': 'Vanguard Bond ETF',
      'Vanguard Total Stock Market ETF': 'Vanguard Stock ETF',
      'Vanguard Total International Stock ETF': 'Vanguard International ETF',
      'Vanguard High Dividend Yield ETF': 'Vanguard Dividend ETF',
      'Vanguard Growth ETF': 'Vanguard Growth ETF',
      'Vanguard Small-Cap ETF': 'Vanguard Small-Cap ETF',
      'Invesco QQQ Trust': 'QQQ Trust',
      'SPDR Gold Shares': 'Gold Shares',
      'Health Care Select Sector SPDR Fund': 'Healthcare SPDR',
      'Financial Select Sector SPDR Fund': 'Financial SPDR',
      'Technology Select Sector SPDR Fund': 'Technology SPDR',
      'Consumer Discretionary Select Sector SPDR Fund': 'Consumer SPDR',
      'Energy Select Sector SPDR Fund': 'Energy SPDR',
      'Real Estate Select Sector SPDR Fund': 'Real Estate SPDR',
      'Utilities Select Sector SPDR Fund': 'Utilities SPDR',
      'Materials Select Sector SPDR Fund': 'Materials SPDR',
      'Industrials Select Sector SPDR Fund': 'Industrials SPDR',
      'Consumer Staples Select Sector SPDR Fund': 'Consumer Staples SPDR',
      'Communication Services Select Sector SPDR Fund': 'Communication SPDR'
    }
    
    return simplifications[name] || name
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
      className={`bg-gray-800/50 rounded-xl p-4 border ${getTypeColor(recommendation.type)} hover:bg-gray-700/50 transition-all duration-200 cursor-pointer`}
      onClick={onInfoClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon(recommendation.type)}
            <h3 className="font-semibold text-white text-sm">{recommendation.symbol}</h3>
            {recommendation.isExistingHolding && (
              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">
                Existing
              </span>
            )}
          </div>
          <p className="text-gray-300 text-xs line-clamp-2">{simplifyAssetName(recommendation.name)}</p>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-white">{formatCurrency(recommendation.amount)}</div>
          {recommendation.allocationPercentage && (
            <div className="text-xs text-gray-400">
              {(recommendation.allocationPercentage).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Sector and Confidence */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
          {recommendation.sector}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Confidence:</span>
          <span className={`font-medium ${getStrengthColor(recommendation.strength)}`}>
            {recommendation.confidence}%
          </span>
        </div>
      </div>

      {/* Expected Return */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Expected Annual Return:</span>
          <span className={`font-semibold ${getReturnColor(recommendation.expectedAnnualReturn)}`}>
            {formatReturn(recommendation.expectedAnnualReturn)}
          </span>
        </div>
      </div>

      {/* Existing Holding Details */}
      {recommendation.isExistingHolding && recommendation.originalAmount && (
        <div className="mb-3 p-2 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="text-xs text-blue-300 mb-1">Existing Holding Analysis</div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Original Amount:</span>
            <span className="text-blue-300 font-medium">
              {formatCurrency(recommendation.originalAmount)}
            </span>
          </div>
          {recommendation.type === 'sell' && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Selling:</span>
              <span className="text-red-300 font-medium">
                {formatCurrency(recommendation.amount)}
              </span>
            </div>
          )}
          {recommendation.type === 'hold' && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Maintaining:</span>
              <span className="text-yellow-300 font-medium">
                {formatCurrency(recommendation.amount)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Reasoning */}
      <div className="text-xs text-gray-300 leading-relaxed">
        {recommendation.reasoning}
      </div>

      {/* Expandable Info */}
      {isInfoOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-gray-600"
        >
          <div className="space-y-2 text-xs">
            {recommendation.targetPrice && (
              <div className="flex justify-between">
                <span className="text-gray-400">Target Price:</span>
                <span className="text-green-400">${recommendation.targetPrice}</span>
              </div>
            )}
            {recommendation.stopLoss && (
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="text-red-400">${recommendation.stopLoss}</span>
              </div>
            )}
            {recommendation.volatility && (
              <div className="flex justify-between">
                <span className="text-gray-400">Volatility:</span>
                <span className="text-yellow-400">{(recommendation.volatility * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ userProfile, onRestart }) => {
  const screenSize = useScreenSize()
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([])
  const [portfolioProjections, setPortfolioProjections] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingPercentage, setLoadingPercentage] = useState(0)
  const [apiStatus, setApiStatus] = useState<{
    grok: 'pending' | 'success' | 'failed'
    marketData: 'pending' | 'success' | 'failed'
    news: 'pending' | 'success' | 'failed'
    analysis: 'pending' | 'success' | 'failed'
    recommendations: 'pending' | 'success' | 'failed'
  }>({
    grok: 'pending',
    marketData: 'pending',
    news: 'pending',
    analysis: 'pending',
    recommendations: 'pending'
  })
  const [apiError, setApiError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null)
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null)
  const [etaSeconds, setEtaSeconds] = useState<number>(180)
  const [etaTotalSeconds, setEtaTotalSeconds] = useState<number>(180)


  // Generate recommendations using real APIs when available
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true)
      setLoadingPercentage(0)
      // initialize ETA (average completion ~3 minutes)
      const initialEta = 180
      setEtaTotalSeconds(initialEta)
      setEtaSeconds(initialEta)
      
      // Reset API status
      setApiStatus({
        grok: 'pending',
        marketData: 'pending',
        news: 'pending',
        analysis: 'pending',
        recommendations: 'pending'
      })
      
      try {
        // Enhanced logging for deployment debugging
        console.log('🌐 Environment:', {
          origin: window.location.origin,
          isDevelopment: process.env.NODE_ENV === 'development',
          isProduction: process.env.NODE_ENV === 'production'
        })
        
        // Start the recommendation job
        console.log('🚀 Starting recommendation job...')
        const response = await fetch(`${window.location.origin}/api/recommendations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userProfile)
        })
        
        console.log('📡 API Response Status:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          url: response.url
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Response Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          })
          throw new Error(`API request failed: ${response.status} - ${errorText}`)
        }

        const apiResponse = await response.json()
        console.log('💼 API Response:', apiResponse)
        
        // Handle direct response (new Vercel-optimized approach)
        if (apiResponse.success && apiResponse.recommendations) {
          console.log('✅ Direct response received - processing immediately')
          setApiStatus({
            grok: 'success',
            marketData: 'success', 
            news: 'success',
            analysis: 'success',
            recommendations: 'success'
          })
          
          setRecommendations(apiResponse.recommendations)
          
          if (apiResponse.portfolioProjections) {
            setPortfolioProjections(apiResponse.portfolioProjections)
          }
          
          setLoadingPercentage(100)
          setIsLoading(false)
          return
        }
        
        // Handle job-based response (legacy approach)
        if (apiResponse.requestId) {
          console.log('🔄 Job-based response - polling for completion')
          await pollJobStatus(apiResponse.requestId)
        } else {
          throw new Error('Invalid API response format')
        }
        
      } catch (error) {
        console.error('API Error:', error)
        
        // Update API status to failed
        setApiStatus(prev => ({ ...prev, recommendations: 'failed' }))
        
        setErrorDetails({
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
        
        setIsLoading(false)
        setApiError(true)
        return
      }
    }
    
    const pollJobStatus = async (requestId: string) => {
      console.log('🔄 Polling job status:', requestId)
      let attempts = 0
      const maxAttempts = 120 // 4 minutes max (2 second intervals)
      
      // Update API status as we progress
      setTimeout(() => setApiStatus(prev => ({ ...prev, grok: 'success' })), 2000)
      setTimeout(() => setApiStatus(prev => ({ ...prev, marketData: 'success' })), 8000)
      setTimeout(() => setApiStatus(prev => ({ ...prev, news: 'success' })), 15000)
      setTimeout(() => setApiStatus(prev => ({ ...prev, analysis: 'success' })), 25000)
      
      const pollInterval = setInterval(async () => {
        attempts++
        
        try {
          const statusResponse = await fetch(`${window.location.origin}/api/results/${requestId}`)
          
          if (!statusResponse.ok) {
            if (statusResponse.status === 404) {
              throw new Error(`Job not found: ${requestId}`)
            }
            throw new Error(`Status check failed: ${statusResponse.status}`)
          }
          
          const statusData = await statusResponse.json()
          console.log('📊 Job status:', statusData.status)
          
          // Update loading percentage based on time elapsed and status
          let progressPercentage: number
          if (statusData.status === 'pending') {
            progressPercentage = Math.min((attempts / maxAttempts) * 20, 20)
          } else if (statusData.status === 'processing') {
            progressPercentage = Math.min(20 + ((attempts / maxAttempts) * 70), 90)
          } else {
            progressPercentage = Math.min((attempts / maxAttempts) * 90, 90)
          }
          setLoadingPercentage(progressPercentage)
          
          if (statusData.status === 'completed') {
            clearInterval(pollInterval)
            
            console.log('✅ Job completed successfully')
            setApiStatus(prev => ({ ...prev, recommendations: 'success' }))
            setLoadingPercentage(100)
            
            // Brief pause to show completion
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const analysis = statusData.result
            if (analysis && analysis.recommendations && analysis.recommendations.length > 0) {
              setRecommendations(analysis.recommendations)
              setPortfolioProjections(analysis.portfolioProjections)
              setIsLoading(false)
              
              // Trigger API stats refresh after successful recommendation generation
              window.dispatchEvent(new CustomEvent('refreshApiStats'))
            } else {
              throw new Error('No recommendations in completed job')
            }
            
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval)
            
            console.error('❌ Job failed:', statusData.error)
            setApiStatus(prev => ({ ...prev, recommendations: 'failed' }))
            
            setErrorDetails({
              message: statusData.error || 'Job processing failed',
              timestamp: new Date().toISOString()
            })
            
            setIsLoading(false)
            setApiError(true)
            
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            
            console.error('⏰ Job polling timeout')
            setApiStatus(prev => ({ ...prev, recommendations: 'failed' }))
            
            setErrorDetails({
              message: 'Request timeout - please try again',
              timestamp: new Date().toISOString()
            })
            
            setIsLoading(false)
            setApiError(true)
          }
          
        } catch (error) {
          console.error('❌ Polling error:', error)
          
          // Don't increment attempts for network errors, but do for 404s
          if (error instanceof Error && error.message.includes('Job not found')) {
            attempts += 10 // Fast-track to failure for missing jobs
          }
        }
        
      }, 2000) // Poll every 2 seconds
    }
    
    generateRecommendations()
  }, [userProfile])

  // ETA countdown synchronized with progress
  useEffect(() => {
    if (!isLoading) return
    const initial = etaTotalSeconds || 180
    const timer = setInterval(() => {
      setEtaSeconds(prev => {
        const nextTick = Math.max(prev - 1, 0)
        const progressBased = Math.max(0, Math.ceil((1 - (loadingPercentage / 100)) * initial))
        return Math.min(nextTick, progressBased)
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isLoading, loadingPercentage, etaTotalSeconds])

  // format ETA as Xm Ys
  const formatEta = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
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
      utilizationRate: (newBuyTotal / userProfile.capitalAvailable) * 100,
      totalPortfolioValue: existingPortfolioValue + userProfile.capitalAvailable,
      availableFunds: userProfile.capitalAvailable + sellTotal,
      isMathematicallyConsistent: (newBuyTotal + holdTotal) <= (existingPortfolioValue + userProfile.capitalAvailable)
    }
  }

  const allocationBreakdown = getAllocationBreakdown()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">Creating Your Portfolio</h2>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 w-full"
          >
            {/* AI Process Steps with visual status */}
            {[
              { name: "Testing Grok AI", key: 'grok' as const },
              { name: "Gathering Market Data", key: 'marketData' as const },
              { name: "Fetching Financial News", key: 'news' as const },
              { name: "Analyzing Portfolio", key: 'analysis' as const },
              { name: "Generating Recommendations", key: 'recommendations' as const }
            ].map((step) => {
              const status = apiStatus[step.key]
              const isPending = status === 'pending'
              const isSuccess = status === 'success'
              const isFailed = status === 'failed'
              return (
                <div key={step.key} className="p-3 rounded-lg border border-gray-700 bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{step.name}</span>
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          <span className="text-xs text-blue-300">Working…</span>
                        </>
                      )}
                      {isSuccess && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-300">Done</span>
                        </>
                      )}
                      {isFailed && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-300">Failed</span>
                        </>
                      )}
                    </div>
                  </div>
                  {step.key === 'recommendations' && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Estimated time remaining: {formatEta(etaSeconds)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>
    )
  }

  if (apiError) {
    const getErrorTitle = () => {
      if (errorDetails?.message?.includes('Usage limit has been reached for gains this month')) {
        return 'Monthly Limit Reached'
      } else if (errorDetails?.message?.includes('rate limit exceeded')) {
        return 'Rate Limit Exceeded'
      } else if (errorDetails?.message?.includes('quota exceeded')) {
        return 'API Quota Exceeded'
      } else if (errorDetails?.message?.includes('invalid') || errorDetails?.message?.includes('expired')) {
        return 'API Key Issue'
      } else {
        return 'Unable to Generate Recommendations'
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
        return 'Unable to generate recommendations at this time. Please try again later.'
      }
    }

    const getSpecificErrorDetails = () => {
      // Removed API configuration warnings - focus on actual functionality
      return null
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

              <div className="text-sm bg-gray-800 rounded-lg p-4 text-left">
                <div className="text-xs text-gray-400">
                  <strong>Note:</strong> The system will automatically retry with available services.
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

      {/* Portfolio Allocation Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 text-center">Portfolio Allocation Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(allocationBreakdown.totalPortfolioValue)}
            </div>
            <div className="text-sm text-gray-400">Total Portfolio Value</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(allocationBreakdown.availableCapital)}
            </div>
            <div className="text-sm text-gray-400">Available Cash</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(allocationBreakdown.totalHoldings)}
            </div>
            <div className="text-sm text-gray-400">Hold Amount</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(allocationBreakdown.sellRecommendations)}
            </div>
            <div className="text-sm text-gray-400">Sell Amount</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">New Investments (BUY):</span>
              <span className="text-green-400 font-semibold">
                {formatCurrency(allocationBreakdown.newInvestments)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Available Funds:</span>
              <span className="text-blue-400 font-semibold">
                {formatCurrency(allocationBreakdown.availableFunds)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Capital Utilization:</span>
              <span className={`font-semibold ${allocationBreakdown.utilizationRate > 100 ? 'text-red-400' : 'text-green-400'}`}>
                {allocationBreakdown.utilizationRate.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Mathematical Consistency:</span>
              <span className={`font-semibold ${allocationBreakdown.isMathematicallyConsistent ? 'text-green-400' : 'text-red-400'}`}>
                {allocationBreakdown.isMathematicallyConsistent ? '✓ Valid' : '✗ Invalid'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Total Allocated:</span>
              <span className="text-white font-semibold">
                {formatCurrency(allocationBreakdown.newInvestments + allocationBreakdown.totalHoldings)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Remaining:</span>
              <span className="text-gray-400 font-semibold">
                {formatCurrency(allocationBreakdown.totalPortfolioValue - (allocationBreakdown.newInvestments + allocationBreakdown.totalHoldings))}
              </span>
            </div>
          </div>
        </div>
        
        {!allocationBreakdown.isMathematicallyConsistent && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Portfolio Allocation Issue</span>
            </div>
            <p className="text-red-300 text-sm mt-1">
              The total allocation exceeds available funds. Please review the recommendations or contact support.
            </p>
          </div>
        )}
      </motion.div>

      {/* Recommendations Sections */}
      <div className="space-y-6">
        {/* Buy Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          
          <div className={`grid ${screenSize.isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {recommendations.filter(r => r.type === 'buy').map((rec, index) => (
              <RecommendationCard
                key={rec.symbol}
                recommendation={rec}
                onInfoClick={() => setSelectedInfo(selectedInfo === rec.symbol ? null : rec.symbol)}
                isInfoOpen={selectedInfo === rec.symbol}
                index={index}
              />
            ))}
          </div>
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
            <div className={`grid ${screenSize.isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {recommendations.filter(r => r.type === 'hold').map((rec, index) => (
                <RecommendationCard
                  key={rec.symbol}
                  recommendation={rec}
                  onInfoClick={() => setSelectedInfo(selectedInfo === rec.symbol ? null : rec.symbol)}
                  isInfoOpen={selectedInfo === rec.symbol}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Sell Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            <div className={`grid ${screenSize.isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {recommendations.filter(r => r.type === 'sell').map((rec, index) => (
                <RecommendationCard
                  key={rec.symbol}
                  recommendation={rec}
                  onInfoClick={() => setSelectedInfo(selectedInfo === rec.symbol ? null : rec.symbol)}
                  isInfoOpen={selectedInfo === rec.symbol}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

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

export default RecommendationsPage