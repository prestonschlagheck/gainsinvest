'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, Activity } from 'lucide-react'

interface GrowthTypeStepProps {
  onComplete: (data: { growthType: 'aggressive' | 'balanced' | 'conservative' }) => void
  userProfile?: any
}

const GrowthTypeStep: React.FC<GrowthTypeStepProps> = ({ onComplete, userProfile }) => {
  const [selectedType, setSelectedType] = useState<'aggressive' | 'balanced' | 'conservative'>(
    userProfile?.growthType || 'balanced'
  )

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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-8">Growth Type Preference</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  ? 'bg-gray-700 border-gray-500 shadow-lg' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
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

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onComplete({ growthType: selectedType })}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-lg font-medium transition-colors"
      >
        Continue
      </motion.button>
    </div>
  )
}

export default GrowthTypeStep 