'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import ChatInterface from '@/components/ChatInterface'
import AuthModal from '@/components/AuthModal'
import ApiStatus from '@/components/ApiStatus'
import ReturningUserModal from '@/components/ReturningUserModal'
import UserProfile from '@/components/UserProfile'
import LandingPage from '@/components/LandingPage'
import HowToUsePage from '@/components/HowToUsePage'
import HowItWorksPage from '@/components/HowItWorksPage'
import ApiPage from '@/components/ApiPage'
import ContactPage from '@/components/ContactPage'
import EditResponsesPage from '@/components/EditResponsesPage'
import { 
  loadUserProfile, 
  saveUserProfile, 
  hasCompletedQuestionnaire,
  StoredUserProfile 
} from '@/lib/userStorage'

type AppView = 'landing' | 'how-to-use' | 'how-it-works' | 'apis' | 'contact' | 'chat' | 'edit-responses'

export default function Home() {
  const { data: session, status } = useSession()
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReturningUserModal, setShowReturningUserModal] = useState(false)
  const [userType, setUserType] = useState<'guest' | 'user' | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [showWelcomeTitle, setShowWelcomeTitle] = useState(false)
  const [showContinueBox, setShowContinueBox] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const [storedProfile, setStoredProfile] = useState<StoredUserProfile | null>(null)
  
  // Debug logging
  useEffect(() => {
    console.log('Home component mounted')
    console.log('Environment:', process.env.NODE_ENV)
  }, [])

  // Handle authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', { status, hasUser: !!session?.user, currentView })
    
    if (status === 'authenticated' && session?.user) {
      // User is authenticated with Google
      const existingProfile = loadUserProfile()
      console.log('User authenticated, checking profile:', { hasProfile: !!existingProfile, hasCompleted: existingProfile?.hasCompletedQuestionnaire })
      
      if (existingProfile && existingProfile.hasCompletedQuestionnaire) {
        // User has a previous profile - show returning user modal on chat view
        console.log('Returning user detected, showing modal')
        const updatedProfile = {
          ...existingProfile,
          googleUser: {
            name: session.user.name || '',
            image: session.user.image || ''
          }
        }
        setStoredProfile(updatedProfile)
        setShowReturningUserModal(true)
        setCurrentView('chat') // Always go to chat view for authenticated users
        setUserType('user')
        setHasStarted(true) // Enable the chat interface
        setShowAuthModal(false) // Close auth modal if open
      } else {
        // New user or no previous profile - go directly to questionnaire
        console.log('New user detected, starting questionnaire')
        setUserType('user')
        setHasStarted(true)
        setShowContinueBox(true)
        setShowAuthModal(false) // Close auth modal if open
        setCurrentView('chat') // Switch to chat view
        
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

  const handleStartChat = () => {
    setCurrentView('chat')
    setShowWelcomeTitle(true)
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

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
    // Complete reset - go back to landing
    setUserType(null)
    setHasStarted(false)
    setShowContinueBox(false)
    setShowWelcomeTitle(false)
    setCurrentStep(0)
    setShowReturningUserModal(false)
    setStoredProfile(null)
    setCurrentView('landing')
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setUserType('user')
    setCurrentView('chat')
    setHasStarted(true)
  }

  const handleGuestContinue = () => {
    setShowAuthModal(false)
    setUserType('guest')
    setCurrentView('chat')
    setHasStarted(true)
  }

  const handleUsePreviousAnswers = () => {
    if (storedProfile) {
      setShowReturningUserModal(false)
      setUserType('user')
      setCurrentView('chat')
      // The profile is already saved, ChatInterface will handle it
    }
  }

  const handleStartFresh = () => {
    setShowReturningUserModal(false)
    setUserType('user')
    setCurrentView('chat')
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

  const handleEditResponses = () => {
    setShowReturningUserModal(false)
    setCurrentView('edit-responses')
    // The stored profile will be passed to EditResponsesPage
  }

  const isAccountSelected = userType !== null || status === 'authenticated'
  const isPortfolioStep = currentStep === 7

  // Render different views based on currentView state
  if (currentView === 'how-to-use') {
    return <HowToUsePage onBack={handleBackToLanding} />
  }

  if (currentView === 'how-it-works') {
    return <HowItWorksPage onBack={handleBackToLanding} />
  }

  if (currentView === 'apis') {
    return <ApiPage onBack={handleBackToLanding} />
  }

  if (currentView === 'contact') {
    return <ContactPage onBack={handleBackToLanding} />
  }

  if (currentView === 'edit-responses') {
    return (
      <EditResponsesPage 
        userProfile={storedProfile!}
        onBack={() => setShowReturningUserModal(true)}
        onComplete={() => {
          setCurrentView('chat')
          setUserType('user')
          setHasStarted(true)
        }}
      />
    )
  }

     if (currentView === 'landing') {
     return (
       <LandingPage 
         onStartChat={handleStartChat}
         onNavigateToHowToUse={() => setCurrentView('how-to-use')}
         onNavigateToHowItWorks={() => setCurrentView('how-it-works')}
         onNavigateToApis={() => setCurrentView('apis')}
         onNavigateToContact={() => setCurrentView('contact')}
       />
     )
   }

  // Chat interface view (existing functionality)
  return (
    <main className={`chat-container min-h-screen bg-gray-950 ${isPortfolioStep ? 'portfolio-layout' : ''}`}>
      
      {/* User Profile - Top Right Corner */}
      <UserProfile 
        userType={userType} 
        onStartFresh={handleStartFresh}
        onEditResponses={handleEditResponses}
        onViewRecommendations={handleUsePreviousAnswers}
      />

      {/* Top Left Logo - Only shown after account selection */}
      <AnimatePresence>
        {isAccountSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="fixed top-4 left-6 z-50 cursor-pointer"
            onClick={handleCompleteRestart}
          >
            <div className="flex items-center space-x-2">
              <span className="text-white text-xl font-light tracking-tight">G.AI.NS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`main-content ${isAccountSelected ? 'with-top-logo' : ''}`}>
        
        {/* Welcome Title Animation */}
        <AnimatePresence>
          {!hasStarted && !showContinueBox && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: showWelcomeTitle ? 0 : 1, scale: showWelcomeTitle ? 0.5 : 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-6xl font-light text-white mb-8 tracking-tight">G.AI.NS</div>
              <h1 className="text-4xl md:text-6xl font-light text-white mb-4">
                Welcome to G.AI.NS
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Your AI-powered investment advisor
              </p>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Chat Interface */}
        <AnimatePresence>
          {isAccountSelected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
                             <ChatInterface
                 userType={userType}
                 onAccountChoice={handleAccountChoice}
                 onStepChange={handleStepChange}
                 onCompleteRestart={handleCompleteRestart}
                 hasStarted={hasStarted}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
            onGuestContinue={handleGuestContinue}
            showGuestOption={true}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
                 {showReturningUserModal && storedProfile && (
           <ReturningUserModal
             isOpen={showReturningUserModal}
             onClose={() => setShowReturningUserModal(false)}
             userProfile={storedProfile}
             onUsePrevious={handleUsePreviousAnswers}
             onStartFresh={handleStartFresh}
             onEditResponses={handleEditResponses}
           />
         )}
      </AnimatePresence>

      {/* API Status - Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-40">
        <ApiStatus />
      </div>
    </main>
  )
} 