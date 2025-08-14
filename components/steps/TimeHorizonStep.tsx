'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, Calendar, ArrowLeft } from 'lucide-react'
import { useScreenSize } from '@/lib/useScreenSize'

interface TimeHorizonStepProps {
  onComplete: (data: { timeHorizon: 'short' | 'medium' | 'long' }) => void
  userProfile?: any
  onBack?: () => void
}

const TimeHorizonStep: React.FC<TimeHorizonStepProps> = ({ onComplete, userProfile, onBack }) => {
  const screenSize = useScreenSize()
  const [selectedHorizon, setSelectedHorizon] = useState<'short' | 'medium' | 'long'>(
    userProfile?.timeHorizon || 'medium'
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

  const horizons = [
    {
      id: 'short' as const,
      title: 'Short Term',
      subtitle: '0-3 years',
      description: 'Quick returns, higher liquidity needs',
      icon: Zap
    },
    {
      id: 'medium' as const,
      title: 'Medium Term',
      subtitle: '3-10 years',
      description: 'Balanced growth and stability',
      icon: Calendar
    },
    {
      id: 'long' as const,
      title: 'Long Term',
      subtitle: '10+ years',
      description: 'Maximum growth potential, compound returns',
      icon: Clock
    }
  ]

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center p-6 overflow-hidden questionnaire-page" style={{ overflow: 'hidden' }}>
      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center gap-6 max-w-4xl w-full">
        {/* Title - Above content */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Investment Time Horizon</h2>
        </div>

        {/* Content */}
        <div className={`grid ${screenSize.isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-4'} w-full`}>
        {horizons.map((horizon) => {
          const Icon = horizon.icon
          const isSelected = selectedHorizon === horizon.id
          
          return (
            <motion.button
              key={horizon.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedHorizon(horizon.id)}
              className={`group relative ${screenSize.isMobile ? 'p-3' : 'p-6'} rounded-xl text-left transition-all duration-300 border-2 ${
                isSelected 
                  ? 'bg-gray-800/40 border-gray-500 shadow-lg' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
              }`}
            >
              <div className={`flex items-center ${screenSize.isMobile ? 'mb-2' : 'mb-4'}`}>
                <Icon className={`${screenSize.isMobile ? 'w-6 h-6' : 'w-8 h-8'} ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                <div className={`${screenSize.isMobile ? 'ml-2' : 'ml-3'}`}>
                  <h3 className={`${screenSize.isMobile ? 'text-base' : 'text-lg'} font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {horizon.title}
                  </h3>
                  <p className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                    {horizon.subtitle}
                  </p>
                </div>
              </div>
              <p className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                {horizon.description}
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
            onClick={() => onComplete({ timeHorizon: selectedHorizon })}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default TimeHorizonStep 