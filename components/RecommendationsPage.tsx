'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, TrendingUp, TrendingDown, Minus, ArrowRight, AlertCircle } from 'lucide-react'
import { UserProfile, InvestmentRecommendation } from '@/types'
import PortfolioChart from './PortfolioChart'

interface RecommendationsPageProps {
  userProfile: UserProfile
  onRestart: () => void
}

const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ userProfile, onRestart }) => {
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([])
  const [portfolioProjections, setPortfolioProjections] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null)
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState('Initializing...')

  // Generate recommendations using real APIs when available
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true)
      setLoadingProgress(0)
      setLoadingStage('Generating your investment recommendations...')
      
      try {
        // Start timing for accurate progress
        const startTime = Date.now()
        
        // More realistic progress animation - slower and more accurate
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            const elapsed = Date.now() - startTime
            // Typical API response time is 5-12 seconds, so let's use 8 seconds as expected
            const expectedDuration = 8000 // 8 seconds
            // Progress should reach 85% by expected time, leaving 15% for completion
            const progress = Math.min(85, (elapsed / expectedDuration) * 85)
            return Math.round(progress)
          })
        }, 200) // Update every 200ms for smoother progression

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
        
        if (analysis.error) {
          throw new Error(analysis.error)
        }

        // Complete the progress
        setLoadingProgress(100)
        setLoadingStage('Complete!')
        
        // Brief pause to show completion
        await new Promise(resolve => setTimeout(resolve, 500))

        setRecommendations(analysis.recommendations)
        setPortfolioProjections(analysis.portfolioProjections)
        setIsLoading(false)
        return
      } catch (error) {
        console.error('API Error:', error)
        
        // Check API key status for better error messaging
        try {
          const keyResponse = await fetch('/api/validate-keys')
          const keyStatus = await keyResponse.json()
          setApiKeyStatus(keyStatus)
        } catch (keyError) {
          console.error('Failed to check API keys:', keyError)
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
      case 'weak': return 'text-gray-400'
      case 'moderate': return 'text-yellow-400'
      case 'strong': return 'text-green-400'
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
      <div className="w-full max-w-2xl mx-auto text-center py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Creating Your Portfolio
            </h2>
          </div>
          
          {/* Simple Progress Bar */}
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-3">
              <span>{loadingStage}</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-400 mb-3">API Configuration Required</h2>
            <div className="text-gray-300 mb-6 max-w-lg mx-auto">
              <p className="mb-4">
                Your API keys need to be configured to generate personalized investment recommendations.
              </p>
              <div className="text-sm bg-gray-800 rounded-lg p-4 text-left">
                <div className="mb-2">
                  <strong className="text-yellow-400">Required:</strong> OpenAI API key
                </div>
                <div className="mb-2">
                  <strong className="text-yellow-400">Required:</strong> Financial data API key (Alpha Vantage or Finnhub)
                </div>
                <div className="text-xs text-gray-400 mt-3">
                  Edit your <code className="bg-gray-700 px-1 rounded">.env.local</code> file and replace placeholder values with real API keys.
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Portfolio Projections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Expected Annual Return</div>
              <div className="text-lg font-semibold text-green-400">
                {(portfolioProjections.expectedAnnualReturn * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Risk Level</div>
              <div className={`text-lg font-semibold capitalize ${
                portfolioProjections.riskLevel === 'low' ? 'text-green-400' :
                portfolioProjections.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {portfolioProjections.riskLevel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Diversification Score</div>
              <div className="text-lg font-semibold text-blue-400">
                {portfolioProjections.diversificationScore}/100
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">1-Year Projection</div>
              <div className="text-lg font-semibold text-white">
                {formatCurrency(portfolioProjections.projectedValues.oneYear)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">3-Year Projection</div>
              <div className="text-lg font-semibold text-white">
                {formatCurrency(portfolioProjections.projectedValues.threeYear)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">5-Year Projection</div>
              <div className="text-lg font-semibold text-white">
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
      case 'weak': return 'text-gray-400'
      case 'moderate': return 'text-yellow-400'
      case 'strong': return 'text-green-400'
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
            {recommendation.strength} {recommendation.type}
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