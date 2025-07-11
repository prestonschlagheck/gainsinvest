'use client'

import { useState } from 'react'
import { useSession, signOut, signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, UserPlus, RefreshCw, Edit, Eye } from 'lucide-react'
import Image from 'next/image'
import { loadUserProfile } from '@/lib/userStorage'
import { useScreenSize } from '@/lib/useScreenSize'

interface UserProfileProps {
  userType?: 'guest' | 'user' | null
  onStartFresh?: () => void
  onEditResponses?: () => void
  onViewRecommendations?: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  userType, 
  onStartFresh, 
  onEditResponses, 
  onViewRecommendations 
}) => {
  const { data: session } = useSession()
  const screenSize = useScreenSize()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Check if user has completed questionnaire
  const storedProfile = loadUserProfile()
  const hasCompletedQuestionnaire = storedProfile?.hasCompletedQuestionnaire || false

  // Show nothing if no user type is set
  if (!userType && !session?.user) {
    return null
  }

  const isGuest = userType === 'guest' && !session?.user

  const handleSignOut = () => {
    signOut({ callbackUrl: window.location.origin })
  }

  const handleUpgradeAccount = async () => {
    setIsUpgrading(true)
    try {
      await signIn('google', { callbackUrl: window.location.origin })
    } catch (error) {
      console.error('Upgrade sign-in error:', error)
      setIsUpgrading(false)
    }
  }

  const handleMenuAction = (action: () => void) => {
    setShowDropdown(false)
    action()
  }

  return (
    <div className={`fixed ${screenSize.isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-50`}>
      <div className="relative">
        {/* Profile Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center ${screenSize.isMobile ? 'gap-2' : 'gap-3'} transition-all duration-200 hover:opacity-80`}
        >
          {/* User Name */}
          {!screenSize.isMobile && (
            <span className="text-white text-sm font-medium whitespace-nowrap">
              {isGuest ? 'Guest' : (session?.user?.name || 'User')}
            </span>
          )}
          
          {/* Profile Image */}
          {!isGuest && session?.user?.image ? (
            <Image
              src={session.user!.image!}
              alt={session.user!.name || 'User'}
              width={screenSize.isMobile ? 28 : 32}
              height={screenSize.isMobile ? 28 : 32}
              className="rounded-full border-2 border-gray-400 hover:border-gray-300 transition-colors"
            />
          ) : (
            <div className={`${screenSize.isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full flex items-center justify-center border-2 transition-colors ${
              isGuest 
                ? 'bg-gray-700 border-gray-500 hover:border-gray-400' 
                : 'bg-gray-600 border-gray-400 hover:border-gray-300'
            }`}>
              <User className={`${screenSize.isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
            </div>
          )}
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-transparent"
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={`absolute right-0 mt-2 ${screenSize.isMobile ? 'w-72' : 'min-w-max'} bg-gray-800 rounded-lg border border-gray-600 shadow-lg overflow-hidden`}
              >
                {/* User Info */}
                <div className={`${screenSize.isMobile ? 'p-3' : 'p-4'} border-b border-gray-600`}>
                  <div className={`flex items-center ${screenSize.isMobile ? 'gap-2' : 'gap-3'}`}>
                    {!isGuest && session?.user?.image ? (
                      <Image
                        src={session.user!.image!}
                        alt={session.user!.name || 'User'}
                        width={screenSize.isMobile ? 32 : 40}
                        height={screenSize.isMobile ? 32 : 40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className={`${screenSize.isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center ${
                        isGuest ? 'bg-gray-700' : 'bg-gray-600'
                      }`}>
                        <User className={`${screenSize.isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {isGuest ? 'Guest User' : (session?.user?.name || 'User')}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {isGuest ? 'Temporary session' : session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className={`${screenSize.isMobile ? 'py-1' : 'py-2'}`}>
                  {/* Start Fresh - Always available */}
                  <button
                    onClick={() => onStartFresh && handleMenuAction(onStartFresh)}
                    disabled={!onStartFresh}
                    className={`w-full ${screenSize.isMobile ? 'p-2.5 text-sm' : 'p-3'} text-left transition-colors flex items-center gap-2 ${
                      onStartFresh 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start Fresh
                  </button>

                  {/* Edit My Responses - Only available if questionnaire completed */}
                  <button
                    onClick={() => onEditResponses && hasCompletedQuestionnaire && handleMenuAction(onEditResponses)}
                    disabled={!onEditResponses || !hasCompletedQuestionnaire}
                    className={`w-full ${screenSize.isMobile ? 'p-2.5 text-sm' : 'p-3'} text-left transition-colors flex items-center gap-2 ${
                      onEditResponses && hasCompletedQuestionnaire
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    Edit My Responses
                  </button>

                  {/* View My Most Recent Recommendations - Only available if questionnaire completed */}
                  <button
                    onClick={() => onViewRecommendations && hasCompletedQuestionnaire && handleMenuAction(onViewRecommendations)}
                    disabled={!onViewRecommendations || !hasCompletedQuestionnaire}
                    className={`w-full ${screenSize.isMobile ? 'p-2.5 text-sm' : 'p-3'} text-left transition-colors flex items-center gap-2 ${
                      onViewRecommendations && hasCompletedQuestionnaire
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    View My Previous Recommendations
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-600 my-2"></div>

                  {/* Account Actions */}
                  {isGuest ? (
                    <button
                      onClick={handleUpgradeAccount}
                      disabled={isUpgrading}
                      className={`w-full ${screenSize.isMobile ? 'p-2.5 text-sm' : 'p-3'} text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50`}
                    >
                      {isUpgrading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Create Account to Save Progress
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleSignOut}
                      className={`w-full ${screenSize.isMobile ? 'p-2.5 text-sm' : 'p-3'} text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-2`}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default UserProfile 