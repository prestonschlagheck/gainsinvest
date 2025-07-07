'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import ChatInterface from '@/components/ChatInterface'
import AuthModal from '@/components/AuthModal'
import ApiStatus from '@/components/ApiStatus'
import ReturningUserModal from '@/components/ReturningUserModal'
import { 
  loadUserProfile, 
  saveUserProfile, 
  hasCompletedQuestionnaire,
  StoredUserProfile 
} from '@/lib/userStorage'

export default function Home() {
  const { data: session, status } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReturningUserModal, setShowReturningUserModal] = useState(false)
  const [userType, setUserType] = useState<'guest' | 'user' | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [showWelcomeTitle, setShowWelcomeTitle] = useState(false)
  const [showContinueBox, setShowContinueBox] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [storedProfile, setStoredProfile] = useState<StoredUserProfile | null>(null)
  
  // Debug logging
  useEffect(() => {
    console.log('Home component mounted')
    console.log('Environment:', process.env.NODE_ENV)
  }, [])

  // Handle authentication state changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // User is authenticated with Google
      const existingProfile = loadUserProfile()
      
      if (existingProfile && existingProfile.hasCompletedQuestionnaire) {
        // User has a previous profile - show returning user modal
        const updatedProfile = {
          ...existingProfile,
          googleUser: {
            name: session.user.name || '',
            image: session.user.image || ''
          }
        }
        setStoredProfile(updatedProfile)
        setShowReturningUserModal(true)
      } else {
        // New user or no previous profile - go directly to questionnaire
        setUserType('user')
        setHasStarted(true)
        setShowContinueBox(true)
        setShowAuthModal(false) // Close auth modal if open
        
        // Create or update profile with Google user info
        const profileToSave: StoredUserProfile = existingProfile ? {
          ...existingProfile,
          googleUser: {
            name: session.user.name || '',
            image: session.user.image || ''
          }
        } : {
          isGuest: false,
          googleUser: {
            name: session.user.name || '',
            image: session.user.image || ''
          },
          riskTolerance: 5,
          timeHorizon: 'medium',
          growthType: 'balanced',
          sectors: [],
          ethicalInvesting: 5,
          capitalAvailable: 0,
          existingPortfolio: [],
          hasCompletedQuestionnaire: false
        }
        
        saveUserProfile(profileToSave)
      }
    }
  }, [session, status])

  // Smooth animation sequence on page load
  useEffect(() => {
    // Only show the initial animation if user is not already authenticated
    if (status === 'authenticated') {
      // User is authenticated, show content immediately
      setShowContinueBox(true)
      setHasStarted(true)
    } else if (status === 'unauthenticated') {
      const timer1 = setTimeout(() => {
        // First fade out the logo
        setShowWelcomeTitle(false)
      }, 2000) // Show logo for 2 seconds, then fade out

      const timer2 = setTimeout(() => {
        // Then show the continue box
        setShowContinueBox(true)
        setHasStarted(true)
      }, 2800) // Show continue box after logo fades out

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
    // For 'loading' status, do nothing and wait
  }, [status])

  const handleAccountChoice = (type: 'guest' | 'recurring') => {
    if (type === 'recurring') {
      setShowAuthModal(true)
    } else {
      setUserType('guest')
    }
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleCompleteRestart = () => {
    // Complete reset - go back to initial state
    setUserType(null)
    setHasStarted(false)
    setShowContinueBox(false)
    setShowWelcomeTitle(false)
    setCurrentStep(0)
    setShowReturningUserModal(false)
    setStoredProfile(null)
    
    // Restart the animation sequence
    setTimeout(() => {
      const timer1 = setTimeout(() => {
        setShowWelcomeTitle(false)
      }, 2000)

      const timer2 = setTimeout(() => {
        setShowContinueBox(true)
        setHasStarted(true)
      }, 2800)
    }, 100)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Don't set userType here - let the useEffect handle it based on session
  }

  const handleUsePreviousAnswers = () => {
    if (storedProfile) {
      setShowReturningUserModal(false)
      setUserType('user')
      // The profile is already saved, ChatInterface will handle it
    }
  }

  const handleStartFresh = () => {
    setShowReturningUserModal(false)
    setUserType('user')
    // Clear previous profile data but keep Google user info
    if (storedProfile && storedProfile.googleUser) {
      const freshProfile: StoredUserProfile = {
        isGuest: false,
        googleUser: storedProfile.googleUser,
        riskTolerance: 5,
        timeHorizon: 'medium',
        growthType: 'balanced',
        sectors: [],
        ethicalInvesting: 5,
        capitalAvailable: 0,
        existingPortfolio: [],
        hasCompletedQuestionnaire: false
      }
      saveUserProfile(freshProfile)
    }
  }

  const isAccountSelected = userType !== null || status === 'authenticated'
  const isPortfolioStep = currentStep === 7

  return (
    <main className={`chat-container min-h-screen bg-gray-950 ${isPortfolioStep ? 'portfolio-layout' : ''}`}>

      {/* Top Left Logo - Only shown after account selection */}
      <AnimatePresence>
        {isAccountSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-5 z-50"
          >
            <button
              onClick={handleCompleteRestart}
              className="hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg"
              title="Click to restart G.AI.NS"
            >
              {imageError ? (
                <div className="w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white text-xs transition-colors">
                  Logo
                </div>
              ) : (
                <Image
                  src="/logo-small.png"
                  alt="G.AI.NS Logo - Click to restart"
                  width={60}
                  height={60}
                  priority
                  onError={() => setImageError(true)}
                  className="hover:opacity-80 transition-opacity"
                />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`main-content ${isAccountSelected ? 'with-top-logo' : ''}`}>
        {/* Main Logo - Only shown before account selection and when not authenticated */}
        {!isAccountSelected && !showContinueBox && status === 'unauthenticated' && (
          <div className="text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              {imageError ? (
                <div className="w-56 h-56 bg-gray-700 rounded-lg flex items-center justify-center text-white text-xl mx-auto">
                  G.AI.NS
                </div>
              ) : (
                <Image
                  src="/logo-main.png"
                  alt="G.AI.NS Logo"
                  width={220}
                  height={220}
                  className="mx-auto"
                  priority
                  onError={() => setImageError(true)}
                />
              )}
            </motion.div>
          </div>
        )}

        {/* Chat Interface - Only show continue box after logo fades */}
        <AnimatePresence>
          {showContinueBox && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ChatInterface 
                userType={userType}
                onAccountChoice={handleAccountChoice}
                onCompleteRestart={handleCompleteRestart}
                hasStarted={hasStarted}
                onStepChange={handleStepChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        )}

        {/* Returning User Modal */}
        {showReturningUserModal && storedProfile && (
          <ReturningUserModal
            isOpen={showReturningUserModal}
            onClose={() => setShowReturningUserModal(false)}
            userProfile={storedProfile}
            onUsePrevious={handleUsePreviousAnswers}
            onStartFresh={handleStartFresh}
          />
        )}
      </div>

      {/* API Status - Development Only - Temporarily disabled */}
      {/* <ApiStatus isDevelopment={process.env.NODE_ENV === 'development'} /> */}
    </main>
  )
} 