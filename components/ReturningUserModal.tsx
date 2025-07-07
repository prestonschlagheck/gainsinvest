'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { StoredUserProfile } from '@/lib/userStorage'

interface ReturningUserModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: StoredUserProfile
  onUsePrevious: () => void
  onStartFresh: () => void
  onEditResponses?: () => void
}

export default function ReturningUserModal({ 
  isOpen, 
  onClose, 
  userProfile, 
  onUsePrevious, 
  onStartFresh,
  onEditResponses
}: ReturningUserModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Welcome back!</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {userProfile.googleUser && (
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src={userProfile.googleUser.image} 
                  alt={userProfile.googleUser.name}
                  className="w-12 h-12 rounded-full border border-gray-600"
                />
                <div>
                  <h3 className="text-white font-medium">{userProfile.googleUser.name}</h3>
                  <p className="text-gray-400 text-sm">We found your previous investment profile</p>
                </div>
              </div>
            )}

            <p className="text-gray-300 mb-6 leading-relaxed">
              Would you like to use your previous answers, edit specific responses, or start fresh with a new questionnaire?
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUsePrevious}
                className="w-full border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
              >
                Skip to My Previous Recommendations
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onEditResponses) {
                    onEditResponses()
                  } else {
                    onClose()
                  }
                }}
                className="w-full border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
              >
                Edit My Previous Responses
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartFresh}
                className="w-full border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
              >
                Start Fresh
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 