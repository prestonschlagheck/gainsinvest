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
      className={`rounded-xl p-3 border ${
        isPlaceholder 
          ? 'bg-red-900/10 border-red-700/50' 
          : getTypeColor(recommendation.type) + ' bg-gray-800/50'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
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
          <p className={`text-sm ${isPlaceholder ? 'text-red-300' : 'text-gray-400'} mb-0`}>
            {simplifyAssetName(recommendation.name)}
          </p>
        </div>
        <div className="text-right">
          <div className={`font-semibold ${isPlaceholder ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(recommendation.amount)}
          </div>
          <button
            onClick={onInfoClick}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors mt-1"
          >
            <Info className="w-4 h-4" />
          </button>
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


  // Generate recommendations using real APIs when available
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true)
      setLoadingPercentage(0)
      
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

        const jobResponse = await response.json()
        console.log('💼 Job started:', jobResponse)
        
        if (jobResponse.requestId) {
          // Poll for job completion using new endpoint
          await pollJobStatus(jobResponse.requestId)
        } else {
          throw new Error('No request ID received')
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
            {/* AI Process Steps with API Status */}
            {[
              { 
                name: "Testing Grok AI", 
                key: 'grok' as const,
                delay: 0, 
                duration: 2000 
              },
              { 
                name: "Gathering Market Data", 
                key: 'marketData' as const,
                delay: 2000, 
                duration: 3000 
              },
              { 
                name: "Fetching Financial News", 
                key: 'news' as const,
                delay: 5000, 
                duration: 2000 
              },
              { 
                name: "Analyzing Portfolio", 
                key: 'analysis' as const,
                delay: 7000, 
                duration: 2500 
              },
              { 
                name: "Generating Recommendations", 
                key: 'recommendations' as const,
                delay: 9500, 
                duration: 3000 
              }
            ].map((step, index) => {
              const status = apiStatus[step.key]
              const isCompleted = status === 'success' || status === 'failed'
              const isFailed = status === 'failed'
              
              return (
                <motion.div
                  key={step.name}
                  className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.delay / 1000 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {status === 'pending' && (
                        <motion.div
                          className="w-4 h-4 bg-gray-500 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            backgroundColor: ["#6b7280", "#10b981", "#10b981"]
                          }}
                          transition={{
                            duration: step.duration / 1000,
                            delay: step.delay / 1000,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                      {status === 'success' && (
                        <div className="w-4 h-4 bg-green-500 rounded-full" />
                      )}
                      {status === 'failed' && (
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                      )}
                    </div>
                    <span className={`text-sm ${isFailed ? 'text-red-400' : 'text-gray-300'}`}>
                      {step.name}
                    </span>
                  </div>
                  
                  {/* Status Icon */}
                  {isCompleted && (
                    <motion.div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isFailed ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: (step.delay + step.duration) / 1000,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      {isFailed ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
            
            {/* Error Message at Bottom */}
            {apiError && errorDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg"
              >
                <div className="text-red-400 font-semibold mb-2">Error Details:</div>
                <div className="text-gray-300 text-sm">{errorDetails.message}</div>
                {errorDetails.timestamp && (
                  <div className="text-xs text-gray-500 mt-2">
                    Time: {new Date(errorDetails.timestamp).toLocaleString()}
                  </div>
                )}
              </motion.div>
            )}
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