'use client'

import React, { useState } from 'react'
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

  const quickAmounts = [5000, 10000, 25000, 50000, 75000, 100000]

  // Add class to body to prevent scrolling
  React.useEffect(() => {
    document.body.classList.add('questionnaire-active')
    document.documentElement.classList.add('questionnaire-active')
    
    return () => {
      document.body.classList.remove('questionnaire-active')
      document.documentElement.classList.remove('questionnaire-active')
    }
  }, [])

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
    <div className="fixed inset-0 flex flex-col justify-center items-center p-6 overflow-hidden questionnaire-page" style={{ overflow: 'hidden' }}>
      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center gap-6 max-w-2xl w-full">
        {/* Title - Above input field */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Available Capital</h2>
        </div>

        {/* Input Field */}
        <div className="w-full text-center">
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
        <div className="w-full">
          <p className="text-sm text-gray-400 text-center mb-4">Or select a quick amount:</p>
          <div className={`grid ${screenSize.isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-3 gap-4'}`}>
            {quickAmounts.map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectQuickAmount(amount)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  capital === amount
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800/20'
                }`}
              >
                <div className="text-base font-medium">
                  {formatCurrency(amount)}
                </div>
              </motion.button>
            ))}
          </div>
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
            onClick={() => onComplete({ capitalAvailable: capital })}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200"
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