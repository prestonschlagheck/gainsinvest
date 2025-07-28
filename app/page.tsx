'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useScreenSize } from '@/lib/useScreenSize'
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
import RecommendationsPage from '@/components/RecommendationsPage'
import { 
  loadUserProfile, 
  saveUserProfile, 
  hasCompletedQuestionnaire,
  StoredUserProfile 
} from '@/lib/userStorage'

type AppView = 'landing' | 'how-to-use' | 'how-it-works' | 'apis' | 'contact' | 'chat' | 'edit-responses' | 'recommendations'

export default function Home() {
  const { data: session, status } = useSession()
  const screenSize = useScreenSize()
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showReturningUserModal, setShowReturningUserModal] = useState(false)
  const [userType, setUserType] = useState<'guest' | 'user' | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [showWelcomeTitle, setShowWelcomeTitle] = useState(false)
  const [showContinueBox, setShowContinueBox] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const [storedProfile, setStoredProfile] = useState<StoredUserProfile | null>(null)
  const [showRecommendationsInChat, setShowRecommendationsInChat] = useState(false)
  
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
      setStoredProfile(profileToSave)
      setUserType('user')
      setShowAuthModal(false) // Close auth modal if open
      
      // If user has completed questionnaire, show returning user modal
      if (existingProfile && existingProfile.hasCompletedQuestionnaire) {
        console.log('Returning user detected, showing modal')
        setShowReturningUserModal(true)
      } else {
        console.log('New user detected, starting fresh questionnaire')
        // New user - start with questionnaire
        setCurrentView('chat')
        setHasStarted(true)
      }
    }
  }, [session, status])

  const handleStartChat = () => {
    setCurrentView('chat')
    setShowWelcomeTitle(true)
    setHasStarted(true)
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
    setShowRecommendationsInChat(false)
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
    setShowRecommendationsInChat(false) // Ensure questionnaire starts
    // Clear any existing profile for guest users to ensure fresh start
    const guestProfile: StoredUserProfile = {
      isGuest: true,
      riskTolerance: 5,
      timeHorizon: 'medium',
      growthType: 'balanced',
      sectors: [],
      ethicalInvesting: 5,
      capitalAvailable: 0,
      existingPortfolio: [],
      hasCompletedQuestionnaire: false
    }
    saveUserProfile(guestProfile)
    setStoredProfile(guestProfile)
  }

  const handleUsePreviousAnswers = () => {
    if (storedProfile) {
      setShowReturningUserModal(false)
      setUserType('user')
      setCurrentView('chat')
      setHasStarted(true)  // Ensure interface is active
      setShowRecommendationsInChat(true)  // Show recommendations in chat interface
    }
  }

  const handleStartFresh = () => {
    setShowReturningUserModal(false)
    setUserType('user')
    setCurrentView('chat')
    setHasStarted(true)  // Ensure questionnaire starts
    setShowRecommendationsInChat(false) // Ensure questionnaire starts
    // Clear previous profile data but keep Google user info
    if (session?.user) {
      const freshProfile: StoredUserProfile = {
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
      saveUserProfile(freshProfile)
      setStoredProfile(freshProfile)
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

  if (currentView === 'recommendations') {
    return (
      <RecommendationsPage 
        userProfile={storedProfile!}
        onRestart={handleCompleteRestart}
      />
    )
  }

     if (currentView === 'landing') {
     return (
       <LandingPage 
         session={session}
         storedProfile={storedProfile}
         onStartChat={handleStartChat}
         onNavigateToHowToUse={() => setCurrentView('how-to-use')}
         onNavigateToHowItWorks={() => setCurrentView('how-it-works')}
         onNavigateToApis={() => setCurrentView('apis')}
         onNavigateToContact={() => setCurrentView('contact')}
         onUsePreviousAnswers={handleUsePreviousAnswers}
         onStartFresh={handleStartFresh}
         onGuestContinue={handleGuestContinue}
         onEditResponses={handleEditResponses}
         onViewRecommendations={handleUsePreviousAnswers}
       />
     )
   }

  // Chat interface view (existing functionality)
  return (
    <main 
      className={`chat-container min-h-screen bg-gray-950 ${isPortfolioStep ? 'portfolio-layout' : ''}`}
      style={{
        '--screen-width': `${screenSize.width}px`,
        '--screen-height': `${screenSize.height}px`,
        '--is-mobile': screenSize.isMobile ? '1' : '0'
      } as React.CSSProperties}
    >
      
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
            className={`fixed ${screenSize.isMobile ? 'top-2 left-3' : 'top-4 left-6'} z-50 cursor-pointer`}
            onClick={handleCompleteRestart}
          >
            <div className="flex items-center space-x-2">
              <span className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} font-light tracking-tight text-white`}>
                G.AI.NS
              </span>
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
              className="text-center px-4"
            >
              <div className={`${screenSize.isMobile ? 'text-4xl' : 'text-6xl'} font-light ${screenSize.isMobile ? 'mb-4' : 'mb-8'} tracking-tight text-white`}>
                G.AI.NS
              </div>
              <h1 className={`${screenSize.isMobile ? 'text-2xl' : 'text-4xl md:text-6xl'} font-light text-white mb-4`}>
                Welcome to G.AI.NS
              </h1>
              <p className={`${screenSize.isMobile ? 'text-lg' : 'text-xl'} text-gray-400 max-w-2xl mx-auto`}>
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
                 showRecommendations={showRecommendationsInChat}
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


    </main>
  )
} 