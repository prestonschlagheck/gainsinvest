'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface RiskToleranceStepProps {
  onComplete: (data: { riskTolerance: number }) => void
  userProfile?: any
  onBack?: () => void
}

const RiskToleranceStep: React.FC<RiskToleranceStepProps> = ({ onComplete, userProfile, onBack }) => {
  const [riskLevel, setRiskLevel] = useState(userProfile?.riskTolerance || 5)

  return (
    <div className="step-layout">
      <div className="step-header">
        <h2 className="text-2xl font-semibold text-white">Risk Tolerance</h2>
      </div>

      <div className="step-body">
        {/* Risk Level Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-6">{riskLevel}/10</div>
        </div>

        {/* Slider */}
        <div className="px-8">
          <div 
            className="w-full h-3 bg-gray-700 rounded-lg relative mb-4"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
            }}
          >
            <input
              type="range"
              min="1"
              max="10"
              value={riskLevel}
              onChange={(e) => setRiskLevel(parseInt(e.target.value))}
              className="w-full h-3 absolute top-0 left-0 bg-transparent cursor-pointer focus:outline-none"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 px-2">
            <span>Conservative</span>
            <span>Moderate</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Risk Level Examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className={`p-4 rounded-lg border ${riskLevel <= 3 ? 'bg-green-900/20 border-green-700' : 'border-gray-700'}`}>
            <h4 className="font-medium text-green-400 mb-2">Conservative (1-3)</h4>
            <p className="text-gray-400">Bonds, CDs, dividend stocks</p>
          </div>
          <div className={`p-4 rounded-lg border ${riskLevel >= 4 && riskLevel <= 7 ? 'bg-yellow-900/20 border-yellow-700' : 'border-gray-700'}`}>
            <h4 className="font-medium text-yellow-400 mb-2">Moderate (4-7)</h4>
            <p className="text-gray-400">Mixed portfolio, ETFs, blue chips</p>
          </div>
          <div className={`p-4 rounded-lg border ${riskLevel >= 8 ? 'bg-red-900/20 border-red-700' : 'border-gray-700'}`}>
            <h4 className="font-medium text-red-400 mb-2">Aggressive (8-10)</h4>
            <p className="text-gray-400">Growth stocks, crypto, options</p>
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
              className="flex-1 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-3 rounded-lg text-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete({ riskTolerance: riskLevel })}
            className="flex-1 border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 rounded-lg text-lg font-medium transition-all duration-200"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default RiskToleranceStep 