'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, ArrowLeft } from 'lucide-react'
import { PortfolioItem } from '@/types'
import { useScreenSize } from '@/lib/useScreenSize'

interface PortfolioStepProps {
  onComplete: (data: { portfolio: any[] }) => void
  userProfile?: any
  onBack?: () => void
}

const PortfolioStep: React.FC<PortfolioStepProps> = ({ onComplete, userProfile, onBack }) => {
  const screenSize = useScreenSize()
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(
    userProfile?.portfolio || [{ type: 'stock', symbol: '', amount: 0 }]
  )

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: any) => {
    const newPortfolio = [...portfolio]
    newPortfolio[index] = { ...newPortfolio[index], [field]: value }
    setPortfolio(newPortfolio)
  }

  const addPortfolioItem = () => {
    setPortfolio([...portfolio, { type: 'stock', symbol: '', amount: 0 }])
  }

  const removePortfolioItem = (index: number) => {
    if (portfolio.length > 1) {
      setPortfolio(portfolio.filter((_, i) => i !== index))
    }
  }

  const handleComplete = () => {
    // Filter out empty items
    const validPortfolio = portfolio.filter(item => item.symbol.trim() !== '' && item.amount > 0)
    onComplete({ portfolio: validPortfolio })
  }

  const handleSkip = () => {
    onComplete({ portfolio: [] })
  }

  const assetTypes = [
    { value: 'stock', label: 'Stock' },
    { value: 'etf', label: 'ETF' },
    { value: 'bond', label: 'Bond' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <div className="step-layout">
      <div className="step-header">
        <h2 className="text-2xl font-semibold text-white">Existing Portfolio</h2>
        {!screenSize.isMobile && (
          <p className="text-gray-400 mt-2">Help us understand your current investments</p>
        )}
      </div>

      <div className="step-body">
        <div className="space-y-4">
        {/* Portfolio Items */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {portfolio.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Asset Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => updatePortfolioItem(index, 'type', e.target.value)}
                    className="input-field w-full"
                  >
                    {assetTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol/Name
                  </label>
                  <input
                    type="text"
                    value={item.symbol}
                    onChange={(e) => updatePortfolioItem(index, 'symbol', e.target.value)}
                    placeholder="AAPL, SPY, etc."
                    className="input-field w-full"
                  />
                </div>

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

        {/* Skip option */}
        <div className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSkip}
            className="w-full hover:bg-gray-800/30 text-gray-300 py-3 rounded-lg text-lg font-medium transition-all duration-200 border border-gray-600 hover:border-gray-500"
          >
            I do not have any existing investments
          </motion.button>
        </div>
      </div>

      <div className="step-footer">
        <div className="flex gap-3 w-full">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="flex-[1] border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
          >
            Get My Recommendations
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default PortfolioStep 