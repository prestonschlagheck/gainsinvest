'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, UserCheck } from 'lucide-react'
import { useScreenSize } from '@/lib/useScreenSize'

interface WelcomeStepProps {
  onComplete: (data: { choice: 'guest' | 'recurring' }) => void
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  const screenSize = useScreenSize()
  // Add class to body to prevent scrolling
  React.useEffect(() => {
    document.body.classList.add('questionnaire-active')
    document.documentElement.classList.add('questionnaire-active')
    
    return () => {
      document.body.classList.remove('questionnaire-active')
      document.documentElement.classList.remove('questionnaire-active')
    }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center p-6 overflow-hidden questionnaire-page" style={{ overflow: 'hidden' }}>
      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center gap-6 max-w-2xl w-full">
        {/* Title - Above content */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">How would you like to continue?</h2>
        </div>

        {/* Content */}
        <div className={`${screenSize.isMobile ? 'space-y-3' : 'space-y-4'} w-full max-w-md`}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onComplete({ choice: 'recurring' })}
            className={`w-full text-left ${screenSize.isMobile ? 'p-3' : 'p-4'} rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 transition-all duration-200`}
          >
            <div className={`flex items-center ${screenSize.isMobile ? 'space-x-2' : 'space-x-3'}`}>
              <UserCheck className={`${screenSize.isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
              <div>
                <h3 className={`${screenSize.isMobile ? 'text-base' : 'text-base'} font-medium text-white`}>Create Account</h3>
                <p className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>Save preferences for future use</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onComplete({ choice: 'guest' })}
            className={`w-full text-left ${screenSize.isMobile ? 'p-3' : 'p-4'} rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 transition-all duration-200`}
          >
            <div className={`flex items-center ${screenSize.isMobile ? 'space-x-2' : 'space-x-3'}`}>
              <User className={`${screenSize.isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
              <div>
                <h3 className={`${screenSize.isMobile ? 'text-base' : 'text-base'} font-medium text-white`}>Continue as Guest</h3>
                <p className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>No account needed</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex gap-4 w-full max-w-2xl mx-auto">
          {/* Empty footer to maintain consistent spacing */}
        </div>
      </div>
    </div>
  )
}

export default WelcomeStep 