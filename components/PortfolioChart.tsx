'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { useScreenSize } from '../lib/useScreenSize'

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

interface StockPriceData {
  [symbol: string]: {
    currentPrice: number
    lastUpdated: string
  }
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ recommendations, initialCapital, portfolioProjections }) => {
  const screenSize = useScreenSize()
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)
  const [timeframe, setTimeframe] = useState<'1Y' | '3Y' | '5Y'>('3Y')
  const [stockPrices, setStockPrices] = useState<StockPriceData>({})

  // Fetch real-time stock prices
  useEffect(() => {
    const fetchStockPrices = async () => {
      try {
        const symbols = recommendations.filter(r => r.type === 'buy').map(r => r.symbol)
        const pricePromises = symbols.map(async (symbol) => {
          const response = await fetch(`/api/stock-price?symbol=${symbol}`)
          if (response.ok) {
            const data = await response.json()
            return { symbol, ...data }
          }
          return null
        })
        
        const results = await Promise.all(pricePromises)
        const priceData: StockPriceData = {}
        results.forEach(result => {
          if (result) {
            priceData[result.symbol] = {
              currentPrice: result.price,
              lastUpdated: result.lastUpdated
            }
          }
        })
        setStockPrices(priceData)
      } catch (error) {
        console.error('Error fetching stock prices:', error)
      }
    }

    if (recommendations.length > 0) {
      fetchStockPrices()
    }
  }, [recommendations])

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

  // Chart data calculation with real-time prices
  const chartData = useMemo(() => {
    const timeframes = { '1Y': 12, '3Y': 36, '5Y': 60 }
    const months = timeframes[timeframe]
    
    if (!portfolioProjections?.monthlyProjections) {
      // Fallback data if no projections available
      const fallbackData: DataPoint[] = []
      for (let i = 0; i <= months; i++) {
        const projectedValue = initialCapital * (1 + 0.08) ** (i / 12)
        fallbackData.push({
          month: i,
          value: projectedValue,
          date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
          label: formatDateLabel(new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7))
        })
      }
      return fallbackData
    }

    return portfolioProjections.monthlyProjections
      .filter((projection: any) => projection.month <= months)
      .map((projection: any) => ({
        month: projection.month,
        value: projection.value,
        date: projection.date,
        label: formatDateLabel(projection.date)
      }))
  }, [portfolioProjections, timeframe, initialCapital])

  // Calculate expected return based on selected timeframe
  const getExpectedReturnForTimeframe = () => {
    if (!portfolioProjections?.projectedValues) return 0
    
    const finalValue = chartData[chartData.length - 1]?.value || initialCapital
    const totalReturn = ((finalValue - initialCapital) / initialCapital) * 100
    
    return totalReturn
  }

  const maxValue = Math.max(...chartData.map((d: DataPoint) => d.value))
  const minValue = Math.min(...chartData.map((d: DataPoint) => d.value))
  const valueRange = maxValue - minValue
  const finalValue = chartData[chartData.length - 1]?.value || initialCapital
  const totalGain = finalValue - initialCapital
  const percentageGain = ((totalGain / initialCapital) * 100)
  const hasRealProjections = portfolioProjections?.projectedValues?.oneYear
  const expectedReturn = getExpectedReturnForTimeframe()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className={`bg-gray-800 rounded-xl ${screenSize.isMobile ? 'p-4' : 'p-6'} border border-gray-700`}
    >
      <div className={`${screenSize.isMobile ? 'mb-4' : 'flex items-start justify-between mb-6'}`}>
        <div className={screenSize.isMobile ? 'mb-2' : ''}>
          <h3 className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-1 flex items-center gap-2`}>
            {screenSize.isMobile ? 'Portfolio Dashboard' : 'Portfolio Dashboard'}
            {!hasRealProjections && (
              <AlertTriangle className={`${screenSize.isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400`} />
            )}
          </h3>
          {!screenSize.isMobile && (
            <p className="text-gray-400 text-sm">
              {hasRealProjections ? (
                'Portfolio projections and growth timeline'
              ) : (
                <span className="text-yellow-400">Estimated projections based on market analysis</span>
              )}
            </p>
          )}
        </div>
        
        {/* Timeframe Selector - Desktop only, mobile moved below */}
        {!screenSize.isMobile && (
          <div className="flex bg-gray-700 rounded-lg p-1 mt-0">
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

      {/* Portfolio Projections Dashboard */}
      {portfolioProjections && (
        <div className={`grid ${screenSize.isMobile ? 'grid-cols-2 gap-3 mb-2' : 'grid-cols-4 gap-4 mb-3'}`}>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Estimated Annual Return</div>
            <div className="text-lg font-semibold text-green-400">
              {(() => {
                if (portfolioProjections?.expectedAnnualReturn) {
                  return `${portfolioProjections.expectedAnnualReturn.toFixed(1)}%`
                }
                return '7.0%'
              })()}
            </div>
          </div>
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
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Total Investment</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-blue-400`}>
              {formatCurrency(portfolioProjections.totalInvestment)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Total Gain</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold ${
              portfolioProjections.projectedValues.fiveYear > portfolioProjections.totalInvestment ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(portfolioProjections.projectedValues.fiveYear - portfolioProjections.totalInvestment)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Projected Value</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
              {formatCurrency(portfolioProjections.projectedValues.fiveYear)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Return Percentage</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold ${
              portfolioProjections.totalInvestment > 0 ? 
                `${(((portfolioProjections.projectedValues.fiveYear - portfolioProjections.totalInvestment) / portfolioProjections.totalInvestment) * 100).toFixed(1)}%` :
                '0.0%'
              }`}>
              {portfolioProjections.totalInvestment > 0 ? 
                `${(((portfolioProjections.projectedValues.fiveYear - portfolioProjections.totalInvestment) / portfolioProjections.totalInvestment) * 100).toFixed(1)}%` :
                '0.0%'
              }
            </div>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className={`grid grid-cols-3 ${screenSize.isMobile ? 'gap-2 mb-2' : 'gap-4 mb-6'}`}>
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
            className="absolute bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm shadow-lg z-10 min-w-[180px] pointer-events-none"
            style={{
              left: `${50 + (chartData.findIndex((d: DataPoint) => d.month === hoveredPoint.month) / (chartData.length - 1)) * 700}px`,
              top: `${30 + (1 - (hoveredPoint.value - minValue) / valueRange) * 180 - 60}px`,
              transform: 'translateX(-50%)'
            }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {recommendations.filter(r => r.type === 'buy').map((rec, index) => {
              // Calculate expected return for the selected timeframe
              const annualReturn = rec.expectedAnnualReturn || 0.08
              let timeframeReturn = 0
              
              if (timeframe === '1Y') {
                timeframeReturn = annualReturn * 100
              } else if (timeframe === '3Y') {
                timeframeReturn = (Math.pow(1 + annualReturn, 3) - 1) * 100
              } else if (timeframe === '5Y') {
                timeframeReturn = (Math.pow(1 + annualReturn, 5) - 1) * 100
              }
              
              // Use real-time current price or fallback to estimated
              const realTimePrice = stockPrices[rec.symbol]?.currentPrice
              const currentPrice = realTimePrice || (rec.targetPrice + rec.stopLoss) / 2
              const sharesOwned = rec.amount / currentPrice
              
              // Calculate target and stop loss prices
              const targetPrice = rec.targetPrice || 120
              const stopLoss = rec.stopLoss || 100
              
              // Calculate most likely price (weighted average of target and stop loss)
              const mostLikelyPrice = (targetPrice * 0.6) + (stopLoss * 0.4)
              
              let highPrice = targetPrice
              let lowPrice = stopLoss
              let mostLikelyValue = sharesOwned * mostLikelyPrice
              
              if (timeframe === '3Y') {
                highPrice = targetPrice * Math.pow(1 + annualReturn, 2)
                lowPrice = stopLoss * Math.pow(1 + annualReturn * 0.5, 2)
                mostLikelyValue = sharesOwned * (mostLikelyPrice * Math.pow(1 + annualReturn, 2))
              } else if (timeframe === '5Y') {
                highPrice = targetPrice * Math.pow(1 + annualReturn, 4)
                lowPrice = stopLoss * Math.pow(1 + annualReturn * 0.5, 4)
                mostLikelyValue = sharesOwned * (mostLikelyPrice * Math.pow(1 + annualReturn, 4))
              }
              
              const highValue = sharesOwned * highPrice
              const lowValue = sharesOwned * lowPrice
              
              return (
                <div key={index} className="p-3 bg-gray-700 border border-gray-600 rounded text-gray-300">
                  <div className="font-semibold text-sm mb-2">{rec.symbol}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Price:</span>
                      <span className="text-white">
                        ${currentPrice.toFixed(2)}
                        {realTimePrice && <span className="text-green-400 ml-1">●</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">High ({timeframe}):</span>
                      <span className="text-green-400">{formatCurrency(highValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Low ({timeframe}):</span>
                      <span className="text-red-400">{formatCurrency(lowValue)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-1 mt-1">
                      <span className="text-blue-400 font-medium">Most Likely:</span>
                      <span className="text-blue-400 font-medium">{formatCurrency(mostLikelyValue)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
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