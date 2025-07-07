'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Calendar, AlertTriangle } from 'lucide-react'

interface PortfolioChartProps {
  recommendations: any[]
  initialCapital: number
  portfolioProjections?: any
}

interface DataPoint {
  month: number
  value: number
  date: string
  label: string
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ recommendations, initialCapital, portfolioProjections }) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)
  const [timeframe, setTimeframe] = useState<'1Y' | '3Y' | '5Y'>('3Y')

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString + '-01')
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Use AI-generated monthly projections or create fallback data
  const chartData = useMemo(() => {
    const timeframes = { '1Y': 12, '3Y': 36, '5Y': 60 }
    const months = timeframes[timeframe]
    
    // Use AI projections if available and they have sufficient data
    if (portfolioProjections?.monthlyProjections && portfolioProjections.monthlyProjections.length > months) {
      return portfolioProjections.monthlyProjections
        .slice(0, months + 1)
        .map((point: any) => ({
          month: point.month,
          value: point.value,
          date: point.date,
          label: formatDateLabel(point.date)
        }))
    }
    
    // Create accurate projection data using portfolio projections
    const data: DataPoint[] = []
    const baseValue = Math.max(initialCapital, portfolioProjections?.totalInvestment || initialCapital)
    
    // Use actual projection targets as anchor points
    const targets = {
      0: baseValue,
      12: portfolioProjections?.projectedValues?.oneYear || baseValue * 1.08,
      36: portfolioProjections?.projectedValues?.threeYear || baseValue * Math.pow(1.08, 3),
      60: portfolioProjections?.projectedValues?.fiveYear || baseValue * Math.pow(1.08, 5)
    }
    
    // Generate monthly data points with accurate interpolation
    for (let i = 0; i <= months; i++) {
      const currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth() + i)
      
      let value: number
      
      // Use exact target values at anchor points
      if (targets[i as keyof typeof targets]) {
        value = targets[i as keyof typeof targets]
      } else {
        // Interpolate between anchor points
        let lowerAnchor = 0
        let upperAnchor = 12
        
        // Find the appropriate anchor points for interpolation
        if (i <= 12) {
          lowerAnchor = 0
          upperAnchor = 12
        } else if (i <= 36) {
          lowerAnchor = 12
          upperAnchor = 36
        } else {
          lowerAnchor = 36
          upperAnchor = 60
        }
        
        // Linear interpolation with market volatility
        const progress = (i - lowerAnchor) / (upperAnchor - lowerAnchor)
        const baseInterpolation = targets[lowerAnchor as keyof typeof targets] + 
          (targets[upperAnchor as keyof typeof targets] - targets[lowerAnchor as keyof typeof targets]) * progress
        
        // Add realistic market volatility (smaller fluctuations around the trend)
        const volatilityFactor = Math.sin(i * 0.5) * 0.02 + // Short-term fluctuations
                                Math.sin(i * 0.2) * 0.015 + // Medium-term cycles
                                (Math.random() - 0.5) * 0.01 // Random noise
        
        value = baseInterpolation * (1 + volatilityFactor)
        
        // Ensure we don't deviate too far from the target trajectory
        const expectedValue = baseValue * Math.pow(1 + (portfolioProjections?.expectedAnnualReturn || 0.08), i / 12)
        value = Math.max(value, expectedValue * 0.9) // Don't go below 90% of expected
        value = Math.min(value, expectedValue * 1.1) // Don't go above 110% of expected
      }
      
      data.push({
        month: i,
        value: Math.round(value),
        date: currentDate.toISOString().substr(0, 7),
        label: formatDateLabel(currentDate.toISOString().substr(0, 7))
      })
    }
    
    return data
  }, [portfolioProjections, initialCapital, timeframe])

  const maxValue = Math.max(...chartData.map((d: DataPoint) => d.value))
  const minValue = Math.min(...chartData.map((d: DataPoint) => d.value))
  const valueRange = maxValue - minValue
  const finalValue = chartData[chartData.length - 1]?.value || initialCapital
  const totalGain = finalValue - initialCapital
  const percentageGain = ((totalGain / initialCapital) * 100)
  const hasAIProjections = portfolioProjections?.monthlyProjections && portfolioProjections.monthlyProjections.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
            Portfolio Projection
            {!hasAIProjections && (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            )}
          </h3>
          <p className="text-gray-400 text-sm">
            {hasAIProjections ? (
              'Based on AI-generated monthly projections'
            ) : (
              <span className="text-yellow-400">Using fallback projections - enhance with AI data</span>
            )}
          </p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          {(['1Y', '3Y', '5Y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === period
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Projected Value</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {formatCurrency(finalValue)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Total Gain</span>
          </div>
          <div className={`text-lg font-semibold ${
            totalGain >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatCurrency(totalGain)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Return</span>
          </div>
          <div className={`text-lg font-semibold ${
            percentageGain >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {percentageGain >= 0 ? '+' : ''}{percentageGain.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Realistic Chart */}
      <div className="relative">
        <svg
          width="100%"
          height="250"
          viewBox="0 0 800 250"
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="80" height="50" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="800" height="250" fill="url(#grid)" />
          
          {/* Chart area background */}
          <rect x="50" y="30" width="700" height="180" fill="#1F2937" fillOpacity="0.3" rx="4"/>
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = 30 + (1 - ratio) * 180
            const value = minValue + (maxValue - minValue) * ratio
            return (
              <g key={ratio}>
                <line x1="45" y1={y} x2="750" y2={y} stroke="#374151" strokeWidth="0.5" opacity="0.2"/>
                <text x="40" y={y + 4} textAnchor="end" className="text-xs fill-gray-400">
                  {formatCurrency(value).replace('$', '').replace(',', 'K').replace('000', '')}
                </text>
              </g>
            )
          })}
          
                     {/* X-axis labels */}
           {chartData.filter((_: DataPoint, i: number) => i % Math.ceil(chartData.length / 8) === 0).map((point: DataPoint) => {
            const x = 50 + (point.month / (chartData.length - 1)) * 700
            return (
              <g key={point.month}>
                <line x1={x} y1="30" x2={x} y2="210" stroke="#374151" strokeWidth="0.5" opacity="0.2"/>
                <text x={x} y="225" textAnchor="middle" className="text-xs fill-gray-400">
                  {point.label}
                </text>
              </g>
            )
          })}
          
                     {/* Main chart line */}
           <path
             d={`M ${chartData.map((point: DataPoint, index: number) => {
               const x = 50 + (index / (chartData.length - 1)) * 700
               const y = 30 + (1 - (point.value - minValue) / valueRange) * 180
               return `${x},${y}`
             }).join(' L ')}`}
            fill="none"
            stroke={hasAIProjections ? "#3B82F6" : "#F59E0B"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
                     {/* Data points */}
           {chartData.map((point: DataPoint, index: number) => {
            const x = 50 + (index / (chartData.length - 1)) * 700
            const y = 30 + (1 - (point.value - minValue) / valueRange) * 180
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={hasAIProjections ? "#3B82F6" : "#F59E0B"}
                stroke="#1F2937"
                strokeWidth="2"
                className="cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            )
          })}
        </svg>
        
        {/* Enhanced Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-gray-900 border border-gray-600 rounded-lg p-4 text-sm shadow-lg z-10 min-w-[200px]"
          >
            <div className="text-white font-semibold mb-1">{hoveredPoint.label}</div>
            <div className={`text-lg font-bold mb-1 ${hasAIProjections ? "text-blue-400" : "text-yellow-400"}`}>
              {formatCurrency(hoveredPoint.value)}
            </div>
            <div className="text-gray-400 text-xs">
              {hoveredPoint.month === 0 ? 'Initial Investment' : `Month ${hoveredPoint.month}`}
            </div>
            <div className="text-gray-400 text-xs">
              {hoveredPoint.value > initialCapital ? 'Gain' : 'Loss'}: {formatCurrency(hoveredPoint.value - initialCapital)}
            </div>
          </motion.div>
        )}
      </div>

      {/* Portfolio Composition */}
      {recommendations.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Portfolio Composition</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {recommendations.filter(r => r.type === 'buy').map((rec, index) => (
              <div key={index} className="p-2 bg-gray-700 border border-gray-600 rounded text-gray-300">
                <div className="font-medium">{rec.symbol}</div>
                <div>{formatCurrency(rec.amount)}</div>
                <div className="text-xs opacity-75">
                  {((rec.expectedAnnualReturn || 0.08) * 100).toFixed(1)}% expected return
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        * {hasAIProjections ? 'AI-generated projections' : 'Basic projections'} based on historical data and market analysis. 
        Actual results may vary significantly.
      </div>
    </motion.div>
  )
}

export default PortfolioChart 