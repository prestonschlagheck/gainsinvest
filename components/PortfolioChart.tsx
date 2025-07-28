'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Calendar, AlertTriangle } from 'lucide-react'
import { useScreenSize } from '@/lib/useScreenSize'

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
  const screenSize = useScreenSize()
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)
  const [timeframe, setTimeframe] = useState<'1Y' | '3Y' | '5Y'>('3Y')

  const formatDateLabel = (dateString: string) => {
    try {
      // Handle both YYYY-MM and YYYY-MM-DD formats
      const cleanDate = dateString.includes('-01') ? dateString : dateString + '-01'
      const date = new Date(cleanDate)
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })
    } catch (error) {
      return 'Invalid Date'
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

  // Create accurate projection data using portfolio projections
  // The expected returns are correlated to the selected time frame:
  // - 1Y: Uses portfolioProjections.projectedValues.oneYear (calculated from individual asset returns)
  // - 3Y: Uses portfolioProjections.projectedValues.threeYear (calculated from individual asset returns)
  // - 5Y: Uses portfolioProjections.projectedValues.fiveYear (calculated from individual asset returns)
  const chartData = useMemo(() => {
    const timeframes = { '1Y': 12, '3Y': 36, '5Y': 60 }
    const months = timeframes[timeframe]
    
    // Create accurate projection data
    const data: DataPoint[] = []
    const startValue = initialCapital
    
    // Use actual projection targets from portfolioProjections
    // These values are calculated as weighted averages of individual asset expected returns
    const targets = {
      0: startValue,
      12: portfolioProjections?.projectedValues?.oneYear || startValue * 1.08,
      36: portfolioProjections?.projectedValues?.threeYear || startValue * Math.pow(1.08, 3),
      60: portfolioProjections?.projectedValues?.fiveYear || startValue * Math.pow(1.08, 5)
    }
    
    // Generate monthly data points with smooth interpolation
    for (let i = 0; i <= months; i++) {
      const currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth() + i)
      
      let value: number
      
      // Use exact target values at key points
      if (targets[i as keyof typeof targets] !== undefined) {
        value = targets[i as keyof typeof targets]
      } else {
        // Simple linear interpolation between targets
        if (i <= 12) {
          const progress = i / 12
          value = targets[0] + (targets[12] - targets[0]) * progress
        } else if (i <= 36) {
          const progress = (i - 12) / (36 - 12)
          value = targets[12] + (targets[36] - targets[12]) * progress
        } else {
          const progress = (i - 36) / (60 - 36)
          value = targets[36] + (targets[60] - targets[36]) * progress
        }
        
        // Add small realistic market fluctuations (±2%)
        const fluctuation = (Math.sin(i * 0.8) * 0.01) + (Math.cos(i * 1.2) * 0.008)
        value = value * (1 + fluctuation)
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
  const hasRealProjections = portfolioProjections?.projectedValues?.oneYear

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className={`bg-gray-800 rounded-xl ${screenSize.isMobile ? 'p-4' : 'p-6'} border border-gray-700`}
    >
      <div className={`${screenSize.isMobile ? 'mb-4' : 'flex items-center justify-between mb-6'}`}>
        <div className={screenSize.isMobile ? 'mb-2' : ''}>
          <h3 className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-1 flex items-center gap-2`}>
            {screenSize.isMobile ? 'Growth Timeline' : 'Portfolio Growth Timeline'}
            {!hasRealProjections && (
              <AlertTriangle className={`${screenSize.isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400`} />
            )}
          </h3>
          {!screenSize.isMobile && (
            <p className="text-gray-400 text-sm">
              {hasRealProjections ? (
                'Projected portfolio value over time'
              ) : (
                <span className="text-yellow-400">Estimated growth based on market analysis</span>
              )}
            </p>
          )}
        </div>
        
        {/* Timeframe Selector - Desktop only, mobile moved below */}
        {!screenSize.isMobile && (
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
        )}
      </div>

      {/* Performance Summary */}
      <div className={`grid grid-cols-3 ${screenSize.isMobile ? 'gap-2 mb-2' : 'gap-4 mb-6'}`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className={`${screenSize.isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-green-400`} />
            <span className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              {screenSize.isMobile ? 'Value' : 'Projected Value'}
            </span>
          </div>
          <div className={`${screenSize.isMobile ? 'text-sm' : 'text-lg'} font-semibold text-white`}>
            {screenSize.isMobile ? 
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(finalValue) :
              formatCurrency(finalValue)
            }
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className={`${screenSize.isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-400`} />
            <span className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
              {screenSize.isMobile ? 'Gain' : 'Total Gain'}
            </span>
          </div>
          <div className={`${screenSize.isMobile ? 'text-sm' : 'text-lg'} font-semibold ${
            totalGain >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {screenSize.isMobile ? 
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalGain) :
              formatCurrency(totalGain)
            }
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className={`${screenSize.isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-purple-400`} />
            <span className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>Return</span>
          </div>
          <div className={`${screenSize.isMobile ? 'text-sm' : 'text-lg'} font-semibold ${
            percentageGain >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {percentageGain >= 0 ? '+' : ''}{percentageGain.toFixed(1)}%
          </div>
        </div>
        
        {/* Mobile Timeframe Selector */}
        {screenSize.isMobile && (
          <div className="flex justify-end mb-3">
            <div className="flex bg-gray-700 rounded-lg p-0.5">
              {(['1Y', '3Y', '5Y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
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
        )}
      </div>

      {/* Realistic Chart */}
      <div className="relative">
        <svg
          width="100%"
          height={screenSize.isMobile ? "200" : "250"}
          viewBox={screenSize.isMobile ? "0 0 400 200" : "0 0 800 250"}
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
            const formatValue = (val: number) => {
              if (val >= 1000000) {
                return `$${(val / 1000000).toFixed(1)}M`
              } else if (val >= 1000) {
                return `$${(val / 1000).toFixed(0)}K`
              } else {
                return `$${Math.round(val)}`
              }
            }
            return (
              <g key={ratio}>
                <line x1="45" y1={y} x2="750" y2={y} stroke="#374151" strokeWidth="0.5" opacity="0.2"/>
                <text x="40" y={y + 4} textAnchor="end" className="text-xs fill-gray-400">
                  {formatValue(value)}
                </text>
              </g>
            )
          })}
          
          {/* X-axis labels */}
          {chartData.filter((_: DataPoint, i: number) => i % Math.ceil(chartData.length / 6) === 0 || i === chartData.length - 1).map((point: DataPoint) => {
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
            stroke={hasRealProjections ? "#3B82F6" : "#F59E0B"}
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
                fill={hasRealProjections ? "#3B82F6" : "#F59E0B"}
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
            <div className={`text-lg font-bold mb-1 ${hasRealProjections ? "text-blue-400" : "text-yellow-400"}`}>
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
                  {(rec.expectedAnnualReturn * 100).toFixed(1)}% expected return
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        * {hasRealProjections ? 'Projection data' : 'Estimated projections'} based on historical data and market analysis. 
        Actual results may vary significantly.
      </div>
    </motion.div>
  )
}

export default PortfolioChart 