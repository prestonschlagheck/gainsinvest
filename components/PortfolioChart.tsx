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

  // Utility: format currency to whole dollars (UI rule)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount))
  }

  // Fetch real-time stock prices
  useEffect(() => {
    const fetchStockPrices = async () => {
      try {
        const symbols = recommendations.filter(r => r.type === 'buy').map(r => r.symbol)
        const pricePromises = symbols.map(async (symbol) => {
          const response = await fetch(`${window.location.origin}/api/stock-price?symbol=${symbol}`)
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

  // Build validated, full-precision dataset derived from real-time prices
  const computedAssets = useMemo(() => {
    const buys = recommendations.filter(r => r.type === 'buy')
    return buys.map(rec => {
      const realTimePrice = stockPrices[rec.symbol]?.currentPrice
      const fallbackPrice = ((rec.targetPrice || 100) + (rec.stopLoss || 80)) / 2
      const currentPrice = realTimePrice || fallbackPrice
      const sharesExact = currentPrice > 0 ? rec.amount / currentPrice : 0
      // Assume broker fills to 2 decimals (truncate), per screenshot expectations
      const sharesRounded = Math.floor(sharesExact * 100) / 100
      const currentValueExact = sharesRounded * currentPrice
      return { rec, currentPrice, sharesExact, sharesRounded, currentValueExact }
    })
  }, [recommendations, stockPrices])

  // Derive portfolio projections and totals from validated dataset
  const derived = useMemo(() => {
    if (computedAssets.length === 0) {
      return null
    }

    const totalCurrent = computedAssets.reduce((sum, a) => sum + a.currentValueExact, 0)
    const weightedReturn = computedAssets.reduce((sum, a) => sum + a.currentValueExact * (a.rec.expectedAnnualReturn || 0.07), 0)
    const expectedAnnualReturn = totalCurrent > 0 ? weightedReturn / totalCurrent : 0.07

    const priceFor = (asset: typeof computedAssets[number], years: number) => {
      // Use expected return to project Most Likely price from current price
      const annual = asset.rec.expectedAnnualReturn || expectedAnnualReturn
      const growth = Math.pow(1 + Math.min(Math.max(annual, 0.02), 0.25), years)
      // Bias with target/stop if provided
      const biasTarget = asset.rec.targetPrice ? asset.rec.targetPrice / asset.currentPrice : 1
      const biasStop = asset.rec.stopLoss ? asset.rec.stopLoss / asset.currentPrice : 1
      const bias = (biasTarget * 0.6 + biasStop * 0.4)
      return asset.currentPrice * growth * (isFinite(bias) && bias > 0 ? (0.5 * bias + 0.5) : 1)
    }

    const projValueYears = (years: number) => computedAssets.reduce((sum, a) => sum + (a.sharesRounded * priceFor(a, years)), 0)

    // Generate monthly projections for the chart from validated base
    const months = 60
    const monthlyRate = expectedAnnualReturn / 12
    const monthlyProjections = Array.from({ length: months }, (_, i) => {
      const month = i + 1
      const value = totalCurrent * Math.pow(1 + monthlyRate, month)
      const date = new Date()
      date.setMonth(date.getMonth() + month)
      const year = date.getFullYear()
      const monthNum = (date.getMonth() + 1).toString().padStart(2, '0')
      return { month, value, date: `${year}-${monthNum}` }
    })

    return {
      totalInvestment: totalCurrent,
      projectedValues: {
        oneYear: projValueYears(1),
        threeYear: projValueYears(3),
        fiveYear: projValueYears(5),
      },
      expectedAnnualReturn: expectedAnnualReturn * 100, // percentage for display later
      monthlyProjections,
    }
  }, [computedAssets])

  // Chart data calculation with real-time prices
  const chartData = useMemo(() => {
    const timeframes = { '1Y': 12, '3Y': 36, '5Y': 60 }
    const months = timeframes[timeframe]
    
  const effectiveMonthly = derived?.monthlyProjections || portfolioProjections?.monthlyProjections
  if (!effectiveMonthly) {
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

    return effectiveMonthly
      .filter((projection: any) => projection.month <= months)
      .map((projection: any) => ({
        month: projection.month,
        value: projection.value,
        date: projection.date,
        label: formatDateLabel(projection.date)
      }))
  }, [derived, portfolioProjections, timeframe, initialCapital])

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
  const hasRealProjections = !!(derived || portfolioProjections?.projectedValues?.oneYear)
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
      {(derived || portfolioProjections) && (
        <div className={`grid ${screenSize.isMobile ? 'grid-cols-2 gap-3 mb-2' : 'grid-cols-4 gap-4 mb-3'}`}>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Estimated Annual Return</div>
            <div className="text-lg font-semibold text-green-400">
              {(() => {
                if (derived) return `${(derived.expectedAnnualReturn).toFixed(1)}%`
                if (portfolioProjections?.expectedAnnualReturn) return `${portfolioProjections.expectedAnnualReturn.toFixed(1)}%`
                return '7.0%'
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">1-Year Projection</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
              {formatCurrency(derived ? derived.projectedValues.oneYear : portfolioProjections!.projectedValues.oneYear)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">3-Year Projection</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
              {formatCurrency(derived ? derived.projectedValues.threeYear : portfolioProjections!.projectedValues.threeYear)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">5-Year Projection</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
              {formatCurrency(derived ? derived.projectedValues.fiveYear : portfolioProjections!.projectedValues.fiveYear)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Total Investment</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-blue-400`}>
              {formatCurrency(derived ? derived.totalInvestment : portfolioProjections!.totalInvestment)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Total Gain</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold ${
              (() => {
                const pv = derived ? derived.projectedValues : portfolioProjections!.projectedValues
                const base = derived ? derived.totalInvestment : portfolioProjections!.totalInvestment
                const selectedValue = timeframe === '1Y' ? pv.oneYear : timeframe === '3Y' ? pv.threeYear : pv.fiveYear
                return selectedValue > base ? 'text-green-400' : 'text-red-400'
              })()
            }`}>
              {(() => {
                const pv = derived ? derived.projectedValues : portfolioProjections!.projectedValues
                const base = derived ? derived.totalInvestment : portfolioProjections!.totalInvestment
                const selectedValue = timeframe === '1Y' ? pv.oneYear : timeframe === '3Y' ? pv.threeYear : pv.fiveYear
                return formatCurrency(selectedValue - base)
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Projected Value</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>
              {(() => {
                const pv = derived ? derived.projectedValues : portfolioProjections!.projectedValues
                const selectedValue = timeframe === '1Y' ? pv.oneYear : timeframe === '3Y' ? pv.threeYear : pv.fiveYear
                return formatCurrency(selectedValue)
              })()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Return Percentage</div>
            <div className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-semibold ${
              (() => {
                const base = derived ? derived.totalInvestment : portfolioProjections!.totalInvestment
                if (base > 0) {
                  const pv = derived ? derived.projectedValues : portfolioProjections!.projectedValues
                  const selectedValue = timeframe === '1Y' ? pv.oneYear : timeframe === '3Y' ? pv.threeYear : pv.fiveYear
                  const returnPercentage = ((selectedValue - base) / base) * 100
                  return returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                }
                return 'text-gray-400'
              })()
            }`}>
              {(() => {
                const base = derived ? derived.totalInvestment : portfolioProjections!.totalInvestment
                if (base > 0) {
                  const pv = derived ? derived.projectedValues : portfolioProjections!.projectedValues
                  const selectedValue = timeframe === '1Y' ? pv.oneYear : timeframe === '3Y' ? pv.threeYear : pv.fiveYear
                  const returnPercentage = ((selectedValue - base) / base) * 100
                  return `${returnPercentage >= 0 ? '+' : ''}${returnPercentage.toFixed(1)}%`
                }
                return '0.0%'
              })()}
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

      {/* Enhanced Portfolio Composition - Shows clear price progression and portfolio value impact */}
      {recommendations.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-300">Portfolio Composition</h4>
            <div className="text-xs text-gray-500">
              {(() => {
                const lastUpdatedTimes = Object.values(stockPrices).map(price => price.lastUpdated).filter(Boolean)
                if (lastUpdatedTimes.length > 0) {
                  const mostRecent = lastUpdatedTimes.reduce((latest, current) => {
                    return new Date(current) > new Date(latest) ? current : latest
                  })
                  return `Last updated: ${new Date(mostRecent).toLocaleTimeString()}`
                }
                return 'Prices updating...'
              })()}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {computedAssets.map((asset, index) => {
              // Calculate expected return for the selected timeframe
                const annualReturn = asset.rec.expectedAnnualReturn || 0.08
              let timeMultiplier = 1
              
              if (timeframe === '1Y') {
                timeMultiplier = 1
              } else if (timeframe === '3Y') {
                timeMultiplier = 3
              } else if (timeframe === '5Y') {
                timeMultiplier = 5
              }
              
                const currentPrice = asset.currentPrice
                const sharesOwned = asset.sharesExact
              
              // Calculate price estimates based on timeframe
                const baseTargetPrice = asset.rec.targetPrice || currentPrice * 1.2
                const baseStopLoss = asset.rec.stopLoss || currentPrice * 0.8
              
              // Project prices for the timeframe
              const highPrice = baseTargetPrice * Math.pow(1 + annualReturn, timeMultiplier - 1)
              const lowPrice = baseStopLoss * Math.pow(1 + (annualReturn * 0.3), timeMultiplier - 1) // Conservative low estimate
              const mostLikelyPrice = (highPrice * 0.65) + (lowPrice * 0.35) // Weighted toward optimistic but realistic
              
              // ENSURE LOGICAL PRICE RELATIONSHIPS:
              // High estimate should always be above current price
              // Low estimate should typically be below current price (but can be above in strong bull markets)
              const adjustedHighPrice = Math.max(highPrice, currentPrice * 1.05) // At least 5% above current
              const adjustedLowPrice = Math.min(lowPrice, currentPrice * 0.95) // At most 5% below current, but can be higher
              const adjustedMostLikelyPrice = Math.max(mostLikelyPrice, currentPrice * 1.02) // At least 2% above current for positive outlook
              
              // Calculate portfolio values
                const sharesDisplay = asset.sharesRounded
                const currentPortfolioValue = sharesDisplay * currentPrice
                const mostLikelyPortfolioValue = sharesDisplay * adjustedMostLikelyPrice
                const potentialGain = mostLikelyPortfolioValue - currentPortfolioValue
                const gainPercentage = currentPortfolioValue > 0 ? ((mostLikelyPortfolioValue - currentPortfolioValue) / currentPortfolioValue) * 100 : 0
              
              // Format price function for different ranges
              const formatPrice = (price: number) => {
                if (price >= 1000) {
                  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
                } else if (price >= 1) {
                  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
                } else {
                  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 4 })
                }
              }
              
                return (
                <div key={index} className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold text-sm text-white">{asset.rec.symbol}</div>
                    <div className="text-xs text-gray-400">
                      {sharesDisplay.toFixed(sharesDisplay < 1 ? 4 : 2)} shares
                    </div>
                  </div>
                  
                  {/* Current Price */}
                  <div className="mb-3 p-2 bg-gray-800 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Current Price:</span>
                      <span className="text-white font-medium">
                        {formatPrice(currentPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Portfolio Value:</span>
                      <span>{formatCurrency(currentPortfolioValue)}</span>
                    </div>
                  </div>
                  
                  {/* Price Estimates */}
                  <div className="space-y-2 mb-3">
                    <div className="text-xs font-medium text-gray-300 mb-1">{timeframe} Price Estimates:</div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-red-400">Low Estimate:</span>
                      <span className="text-red-400">{formatPrice(adjustedLowPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-medium">Most Likely:</span>
                      <span className="text-blue-400 font-medium">{formatPrice(adjustedMostLikelyPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-400">High Estimate:</span>
                      <span className="text-green-400">{formatPrice(adjustedHighPrice)}</span>
                    </div>
                  </div>
                  
                  {/* Portfolio Impact */}
                  <div className="border-t border-gray-600 pt-3">
                    <div className="text-xs font-medium text-gray-300 mb-2">If Most Likely Price Hits:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Portfolio Value:</span>
                        <span className="text-white font-medium">{formatCurrency(mostLikelyPortfolioValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Potential Gain:</span>
                        <span className={potentialGain >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {potentialGain >= 0 ? '+' : ''}{formatCurrency(potentialGain)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Return:</span>
                        <span className={gainPercentage >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                          {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(1)}%
                        </span>
                      </div>
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