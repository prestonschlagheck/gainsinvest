'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, Calendar, ArrowLeft } from 'lucide-react'

interface TimeHorizonStepProps {
  onComplete: (data: { timeHorizon: 'short' | 'medium' | 'long' }) => void
  userProfile?: any
  onBack?: () => void
}

const TimeHorizonStep: React.FC<TimeHorizonStepProps> = ({ onComplete, userProfile, onBack }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'short' | 'medium' | 'long'>(
    userProfile?.timeHorizon || 'medium'
  )

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
    <div className="step-layout">
      <div className="step-header">
        <h2 className="text-2xl font-semibold text-white">Investment Time Horizon</h2>
      </div>

      <div className="step-body">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {horizons.map((horizon) => {
          const Icon = horizon.icon
          const isSelected = selectedHorizon === horizon.id
          
          return (
            <motion.button
              key={horizon.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedHorizon(horizon.id)}
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
                    {horizon.title}
                  </h3>
                  <p className={`text-sm ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                    {horizon.subtitle}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                {horizon.description}
              </p>
            </motion.button>
          )
        })}
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
            onClick={() => onComplete({ timeHorizon: selectedHorizon })}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default TimeHorizonStep 