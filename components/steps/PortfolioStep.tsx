'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, ArrowLeft } from 'lucide-react'
import { PortfolioItem } from '@/types'
import { useScreenSize } from '@/lib/useScreenSize'

interface PortfolioStepProps {
  onComplete: (data: { portfolio: any[] }) => void
  userProfile?: any
  onBack?: () => void
}

// Asset type detection function
const detectAssetType = (symbol: string): 'stock' | 'etf' | 'bond' | 'crypto' | 'other' => {
  const upperSymbol = symbol.toUpperCase().trim()
  
  // Common ETF symbols
  const etfSymbols = [
    'SPY', 'QQQ', 'VTI', 'VOO', 'VEA', 'VWO', 'BND', 'TLT', 'GLD', 'SLV', 'VNQ',
    'XLK', 'XLF', 'XLV', 'XLI', 'XLE', 'XLP', 'XLY', 'XLU', 'XLB', 'XLRE', 'XLC',
    'EFA', 'EEM', 'IWM', 'AGG', 'LQD', 'HYG', 'TIP', 'SHY', 'IEF', 'IEI', 'SHV',
    'VEU', 'VWO', 'VEA', 'VSS', 'VXUS', 'VT', 'VGT', 'VUG', 'VTV', 'VBR', 'VBK',
    'VYM', 'VIG', 'VHT', 'VFH', 'VDE', 'VCR', 'VDC', 'VRE', 'VNQ', 'VGSH', 'VGIT',
    'VGLT', 'VCIT', 'VCSH', 'VCLT', 'VWOB', 'VEMB', 'VWIGX', 'VWILX', 'VWNDX',
    'ARKK', 'ARKW', 'ARKF', 'ARKG', 'ARKQ', 'ARKX', 'ARKV', 'ARKT', 'ARKU', 'ARKD'
  ]
  
  // Common cryptocurrency symbols
  const cryptoSymbols = [
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'DOGE',
    'AVAX', 'MATIC', 'LINK', 'UNI', 'LTC', 'BCH', 'XLM', 'ATOM', 'ETC', 'FIL',
    'TRX', 'NEAR', 'ALGO', 'VET', 'ICP', 'FTM', 'THETA', 'XMR', 'HBAR', 'MANA',
    'SAND', 'AXS', 'GALA', 'ENJ', 'CHZ', 'HOT', 'BAT', 'ZIL', 'VET', 'ONE'
  ]
  
  // Common bond symbols
  const bondSymbols = [
    'BND', 'TLT', 'IEF', 'SHY', 'TIP', 'LQD', 'HYG', 'AGG', 'VCIT', 'VCSH',
    'VGLT', 'VGIT', 'VGSH', 'VCLT', 'VWOB', 'VEMB', 'BNDX', 'VTEB', 'MUB',
    'TFI', 'PZA', 'PICB', 'PFIG', 'PCY', 'EMB', 'JNK', 'HYD', 'HYEM', 'HYMB'
  ]
  
  // Check if it's an ETF
  if (etfSymbols.includes(upperSymbol)) {
    return 'etf'
  }
  
  // Check if it's a cryptocurrency
  if (cryptoSymbols.includes(upperSymbol)) {
    return 'crypto'
  }
  
  // Check if it's a bond
  if (bondSymbols.includes(upperSymbol)) {
    return 'bond'
  }
  
  // Check for common patterns
  if (upperSymbol.endsWith('X') || upperSymbol.endsWith('XX')) {
    // Many ETFs end with X
    return 'etf'
  }
  
  if (upperSymbol.length <= 4 && /^[A-Z]+$/.test(upperSymbol)) {
    // Short uppercase symbols are usually stocks
    return 'stock'
  }
  
  // Default to stock for unknown symbols
  return 'stock'
}

const PortfolioStep: React.FC<PortfolioStepProps> = ({ onComplete, userProfile, onBack }) => {
  const screenSize = useScreenSize()
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(
    userProfile?.portfolio || []
  )
  const [newAsset, setNewAsset] = useState<PortfolioItem>({ type: 'stock', symbol: '', amount: 0 })

  // Add class to body to prevent scrolling
  React.useEffect(() => {
    document.body.classList.add('questionnaire-active')
    document.documentElement.classList.add('questionnaire-active')
    
    return () => {
      document.body.classList.remove('questionnaire-active')
      document.documentElement.classList.remove('questionnaire-active')
    }
  }, [])

  const updateNewAsset = (field: keyof PortfolioItem, value: any) => {
    setNewAsset({ ...newAsset, [field]: value })
  }

  const handleSymbolChange = (symbol: string) => {
    // Auto-detect asset type if symbol is not empty
    let detectedType = newAsset.type // Keep current type as default
    if (symbol.trim()) {
      detectedType = detectAssetType(symbol)
    }
    
    // Update both symbol and type in a single state update
    setNewAsset({ 
      ...newAsset, 
      symbol: symbol,
      type: detectedType
    })
  }

  const addPortfolioItem = () => {
    // Only add if both symbol and amount are provided
    if (newAsset.symbol.trim() && newAsset.amount > 0) {
      setPortfolio([...portfolio, { ...newAsset }])
      // Reset the form
      setNewAsset({ type: 'stock', symbol: '', amount: 0 })
    }
  }

  const removePortfolioItem = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index))
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
    <div className="fixed inset-0 flex flex-col justify-center items-center p-6 overflow-hidden questionnaire-page" style={{ overflow: 'hidden' }}>
      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center gap-8 max-w-4xl w-full h-full">
        {/* Title - Lower position */}
        <div className="text-center flex-shrink-0 mt-8">
          <h2 className="text-2xl font-semibold text-white">Existing Portfolio</h2>
        </div>

        {/* Scrollable Asset List - Shows all assets */}
        <div className="space-y-3 w-full flex-1 overflow-y-auto pr-2 min-h-0 flex flex-col-reverse mb-6">
          {portfolio.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No assets added yet. Use the form below to add your holdings.
            </div>
          ) : (
            portfolio.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-gray-800/20 rounded-lg border border-gray-700 relative flex items-center justify-between"
              >
                {/* Asset Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 uppercase font-medium">
                      {item.type}
                    </span>
                    <span className="text-white font-medium">
                      {item.symbol}
                    </span>
                  </div>
                  <span className="text-green-400 font-medium">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>

                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removePortfolioItem(index)}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>

        {/* Fixed Input Area - At bottom */}
        <div className="w-full flex-shrink-0 mb-8">
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 relative">
            <div className="grid grid-cols-4 gap-4 items-end">
              {/* Asset Type */}
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newAsset.type}
                  onChange={(e) => updateNewAsset('type', e.target.value)}
                  className="input-field w-full h-10 text-sm"
                >
                  {assetTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Symbol */}
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Symbol/Name
                </label>
                <input
                  type="text"
                  value={newAsset.symbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  placeholder="AAPL, SPY, BTC, etc."
                  className="w-full h-10 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Value */}
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Value ($)
                </label>
                <input
                  type="number"
                  value={newAsset.amount || ''}
                  onChange={(e) => updateNewAsset('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="input-field w-full h-10 text-sm"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Add Button */}
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Add
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addPortfolioItem}
                  className="w-full h-10 bg-gray-800 border border-gray-700 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Skip option */}
        <div className="w-full flex-shrink-0 mb-24">
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

      {/* Footer - Fixed at bottom */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex gap-4 w-full max-w-2xl mx-auto">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="flex-[1] border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default PortfolioStep 