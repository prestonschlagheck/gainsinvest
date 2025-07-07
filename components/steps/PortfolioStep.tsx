'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, TrendingUp } from 'lucide-react'
import { PortfolioItem } from '@/types'

interface PortfolioStepProps {
  onComplete: (data: { existingPortfolio: PortfolioItem[] }) => void
  userProfile?: any
}

const PortfolioStep: React.FC<PortfolioStepProps> = ({ onComplete, userProfile }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(
    userProfile?.existingPortfolio || [{ symbol: '', amount: 0, type: 'stock' }]
  )

  const addPortfolioItem = () => {
    setPortfolio([...portfolio, { symbol: '', amount: 0, type: 'stock' }])
  }

  const removePortfolioItem = (index: number) => {
    if (portfolio.length > 1) {
      setPortfolio(portfolio.filter((_, i) => i !== index))
    }
  }

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: any) => {
    const updated = portfolio.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setPortfolio(updated)
  }

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'stock': return 'text-blue-400'
      case 'crypto': return 'text-orange-400'
      case 'etf': return 'text-green-400'
      case 'other': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getTotalValue = () => {
    return portfolio.reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleComplete = () => {
    // Filter out empty entries
    const validPortfolio = portfolio.filter(item => 
      item.symbol.trim() !== '' && item.amount > 0
    )
    onComplete({ existingPortfolio: validPortfolio })
  }

  const handleSkip = () => {
    onComplete({ existingPortfolio: [] })
  }

  return (
    <div className="step-content portfolio-step w-full">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-8">Existing Portfolio</h2>
      </div>

      <div className="space-y-6 w-full">
        {/* Total Portfolio Value */}
        {getTotalValue() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Total Portfolio Value</h3>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(getTotalValue())}
            </div>
          </motion.div>
        )}

        {/* Portfolio Items */}
        <div className="space-y-4 w-full">
          {portfolio.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end w-full">
                {/* Asset Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol/Ticker
                  </label>
                  <input
                    type="text"
                    value={item.symbol}
                    onChange={(e) => updatePortfolioItem(index, 'symbol', e.target.value.toUpperCase())}
                    placeholder="e.g., AAPL, BTC"
                    className="input-field w-full"
                  />
                </div>

                {/* Asset Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Asset Type
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => updatePortfolioItem(index, 'type', e.target.value)}
                    className={`input-field w-full ${getAssetTypeColor(item.type)}`}
                  >
                    <option value="stock">Stock</option>
                    <option value="etf">ETF</option>
                    <option value="crypto">Crypto</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value ($)
                  </label>
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => updatePortfolioItem(index, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="input-field w-full"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Remove Button */}
                <div className="flex justify-end">
                  {portfolio.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removePortfolioItem(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Item Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={addPortfolioItem}
          className="w-full border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-4 text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Asset
        </motion.button>
      </div>

      {/* Buttons - Skip button first, then Get Recommendations */}
      <div className="space-y-3 w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSkip}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg text-lg font-medium transition-colors border border-gray-600"
        >
          I do not have any existing investments
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleComplete}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-lg font-medium transition-colors"
        >
          Get My Recommendations
        </motion.button>
      </div>
    </div>
  )
}

export default PortfolioStep 