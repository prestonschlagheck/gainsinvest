'use client'

import { motion } from 'framer-motion'
import { User, UserCheck } from 'lucide-react'

interface WelcomeStepProps {
  onComplete: (data: { choice: 'guest' | 'recurring' }) => void
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  return (
    <div className="step-content">
      <div className="text-center">
        <h2 className="text-xl font-medium text-white mb-6">How would you like to continue?</h2>
      </div>

      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onComplete({ choice: 'recurring' })}
          className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-700 transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="text-base font-medium text-white">Create Account</h3>
              <p className="text-sm text-gray-400">Save preferences for future use</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onComplete({ choice: 'guest' })}
          className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-700 transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="text-base font-medium text-white">Continue as Guest</h3>
              <p className="text-sm text-gray-400">No account needed</p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

export default WelcomeStep 