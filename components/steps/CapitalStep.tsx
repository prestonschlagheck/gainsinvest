'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ArrowLeft } from 'lucide-react'
import { useScreenSize } from '@/lib/useScreenSize'

interface CapitalStepProps {
  onComplete: (data: { capitalAvailable: number }) => void
  userProfile?: any
  onBack?: () => void
}

const CapitalStep: React.FC<CapitalStepProps> = ({ onComplete, userProfile, onBack }) => {
  const screenSize = useScreenSize()
  const [capital, setCapital] = useState(userProfile?.capitalAvailable || 0)
  const [inputValue, setInputValue] = useState(userProfile?.capitalAvailable?.toString() || '')

  const quickAmounts = [5000, 25000, 100000]

  const handleInputChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')
    setInputValue(cleanValue)
    
    const numericValue = parseFloat(cleanValue) || 0
    setCapital(numericValue)
  }

  const selectQuickAmount = (amount: number) => {
    setCapital(amount)
    setInputValue(amount.toString())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="step-layout">
      <div className="step-header">
        <h2 className="text-2xl font-semibold text-white">Available Capital</h2>
      </div>

      <div className="step-body">
        {/* Input Field */}
        <div className="max-w-sm mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-2xl text-gray-400">$</span>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="0"
              className="input-field pl-12 pr-4 py-4 text-2xl text-center w-full"
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <p className="text-sm text-gray-400 text-center mb-4">Or select a quick amount:</p>
          <div className={`grid ${screenSize.isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 gap-3'}`}>
            {quickAmounts.map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectQuickAmount(amount)}
                className={`${screenSize.isMobile ? 'p-2' : 'p-3'} rounded-lg border-2 transition-all duration-200 ${
                  capital === amount
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800/20'
                }`}
              >
                <div className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                  {formatCurrency(amount)}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Investment Ranges - hidden on mobile */}
        {!screenSize.isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-4 rounded-lg border ${
              capital < 10000 ? 'bg-blue-900/20 border-blue-700' : 'border-gray-700'
            }`}>
              <h4 className="font-semibold text-blue-400 mb-2">Starting Out</h4>
              <p className="text-gray-400">Under $10,000 - Focus on low-cost ETFs and diversification</p>
            </div>
            <div className={`p-4 rounded-lg border ${
              capital >= 10000 && capital < 100000 ? 'bg-green-900/20 border-green-700' : 'border-gray-700'
            }`}>
              <h4 className="font-semibold text-green-400 mb-2">Building Wealth</h4>
              <p className="text-gray-400">$10,000 - $100,000 - Mix of ETFs and individual stocks</p>
            </div>
            <div className={`p-4 rounded-lg border ${
              capital >= 100000 ? 'bg-purple-900/20 border-purple-700' : 'border-gray-700'
            }`}>
              <h4 className="font-semibold text-purple-400 mb-2">Advanced Portfolio</h4>
              <p className="text-gray-400">$100,000+ - Advanced strategies and alternative investments</p>
            </div>
          </div>
        )}
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
            onClick={() => onComplete({ capitalAvailable: capital })}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
            disabled={capital <= 0}
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default CapitalStep 