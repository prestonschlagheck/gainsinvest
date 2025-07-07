'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Heart, Globe, ArrowLeft } from 'lucide-react'

interface EthicalStepProps {
  onComplete: (data: { ethicalInvesting: number }) => void
  userProfile?: any
  onBack?: () => void
}

const EthicalStep: React.FC<EthicalStepProps> = ({ onComplete, userProfile, onBack }) => {
  const [ethicalLevel, setEthicalLevel] = useState(userProfile?.ethicalInvesting || 5)

  const getSelectedOption = () => {
    if (ethicalLevel <= 3) return 'low'
    if (ethicalLevel <= 7) return 'moderate'
    return 'high'
  }

  return (
    <div className="step-layout">
      <div className="step-header">
        <h2 className="text-2xl font-semibold text-white">Ethical Investing Preference</h2>
      </div>

      <div className="step-body">
        <div className="space-y-6">
        {/* ESG Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg border border-gray-700">
            <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Environmental
            </h4>
            <p className="text-gray-400">Clean energy, sustainability, carbon footprint</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-700">
            <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Social
            </h4>
            <p className="text-gray-400">Employee welfare, community impact, diversity</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-700">
            <h4 className="font-medium text-purple-400 mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Governance
            </h4>
            <p className="text-gray-400">Board diversity, executive compensation, ethics</p>
          </div>
        </div>

        {/* Priority Selection */}
        <div className="space-y-4">
          <p className="text-center text-gray-300 font-medium">ESG Priority Level:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEthicalLevel(2)}
              className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                getSelectedOption() === 'low'
                  ? 'bg-gray-800/40 border-gray-500 shadow-lg'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
              }`}
            >
              <h3 className={`text-lg font-medium ${getSelectedOption() === 'low' ? 'text-white' : 'text-gray-200'}`}>
                Low
              </h3>
              <p className={`text-sm ${getSelectedOption() === 'low' ? 'text-gray-300' : 'text-gray-400'}`}>
                Focus on financial returns first
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEthicalLevel(5)}
              className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                getSelectedOption() === 'moderate'
                  ? 'bg-gray-800/40 border-gray-500 shadow-lg'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
              }`}
            >
              <h3 className={`text-lg font-medium ${getSelectedOption() === 'moderate' ? 'text-white' : 'text-gray-200'}`}>
                Moderate
              </h3>
              <p className={`text-sm ${getSelectedOption() === 'moderate' ? 'text-gray-300' : 'text-gray-400'}`}>
                Balance ESG factors with returns
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEthicalLevel(9)}
              className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                getSelectedOption() === 'high'
                  ? 'bg-gray-800/40 border-gray-500 shadow-lg'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
              }`}
            >
              <h3 className={`text-lg font-medium ${getSelectedOption() === 'high' ? 'text-white' : 'text-gray-200'}`}>
                High
              </h3>
              <p className={`text-sm ${getSelectedOption() === 'high' ? 'text-gray-300' : 'text-gray-400'}`}>
                ESG factors are very important
              </p>
            </motion.button>
          </div>
        </div>
        </div>
      </div>

      <div className="step-footer">
        <div className="flex gap-4">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="flex-1 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-3 rounded-lg text-lg font-medium transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete({ ethicalInvesting: ethicalLevel })}
            className="flex-1 border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 rounded-lg text-lg font-medium transition-all duration-200"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default EthicalStep 