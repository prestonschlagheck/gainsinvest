'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, BarChart3, TrendingUp, ArrowLeft } from 'lucide-react'

interface GrowthTypeStepProps {
  onComplete: (data: { growthType: 'aggressive' | 'balanced' | 'conservative' }) => void
  userProfile?: any
  onBack?: () => void
}

const GrowthTypeStep: React.FC<GrowthTypeStepProps> = ({ onComplete, userProfile, onBack }) => {
  const [selectedType, setSelectedType] = useState<'aggressive' | 'balanced' | 'conservative'>(
    userProfile?.growthType || 'balanced'
  )

  // Add class to body to prevent scrolling
  React.useEffect(() => {
    document.body.classList.add('questionnaire-active')
    document.documentElement.classList.add('questionnaire-active')
    
    return () => {
      document.body.classList.remove('questionnaire-active')
      document.documentElement.classList.remove('questionnaire-active')
    }
  }, [])

  const types = [
    {
      id: 'aggressive' as const,
      title: 'Aggressive',
      subtitle: 'High Growth',
      description: 'Maximum growth potential with higher volatility',
      icon: Activity
    },
    {
      id: 'balanced' as const,
      title: 'Balanced',
      subtitle: 'Moderate Growth',
      description: 'Balanced approach between growth and stability',
      icon: BarChart3
    },
    {
      id: 'conservative' as const,
      title: 'Conservative',
      subtitle: 'Steady Growth',
      description: 'Steady returns with lower risk and volatility',
      icon: TrendingUp
    }
  ]

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center p-6 overflow-hidden questionnaire-page" style={{ overflow: 'hidden' }}>
      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center gap-6 max-w-4xl w-full">
        {/* Title - Above content */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Growth Type Preference</h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {types.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.id
          
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType(type.id)}
              className={`group relative p-6 rounded-xl text-left transition-all duration-300 border-2 ${
                isSelected 
                  ? 'bg-gray-800/40 border-gray-500 shadow-lg' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
              }`}
            >
              <div className="flex items-center mb-4">
                <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {type.title}
                  </h3>
                  <p className={`text-sm ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                    {type.subtitle}
                  </p>
                </div>
              </div>
              
              <p className={`text-sm ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                {type.description}
              </p>
            </motion.button>
          )
        })}
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
            onClick={() => onComplete({ growthType: selectedType })}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default GrowthTypeStep 