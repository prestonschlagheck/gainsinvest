'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { UserProfile } from '@/types'
import { loadUserProfile, saveUserProfile, StoredUserProfile } from '@/lib/userStorage'
import RiskToleranceStep from './steps/RiskToleranceStep'
import TimeHorizonStep from './steps/TimeHorizonStep'
import GrowthTypeStep from './steps/GrowthTypeStep'
import SectorsStep from './steps/SectorsStep'
import EthicalStep from './steps/EthicalStep'
import CapitalStep from './steps/CapitalStep'
import PortfolioStep from './steps/PortfolioStep'
import RecommendationsPage from './RecommendationsPage'

interface ChatInterfaceProps {
  userType: 'guest' | 'user' | null
  onAccountChoice: (type: 'guest' | 'recurring') => void
  onCompleteRestart?: () => void
  hasStarted?: boolean
  onStepChange?: (step: number) => void
  showRecommendations?: boolean
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userType, onAccountChoice, onCompleteRestart, hasStarted = false, onStepChange, showRecommendations: forceShowRecommendations }) => {
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    isGuest: userType === 'guest',
    riskTolerance: 5,
    timeHorizon: 'medium',
    growthType: 'balanced',
    sectors: [],
    ethicalInvesting: 5,
    capitalAvailable: 0,
    existingPortfolio: []
  })
  const [showRecommendations, setShowRecommendations] = useState(false)

  const steps = [
    { id: 'risk', component: RiskToleranceStep },
    { id: 'time', component: TimeHorizonStep },
    { id: 'growth', component: GrowthTypeStep },
    { id: 'sectors', component: SectorsStep },
    { id: 'ethical', component: EthicalStep },
    { id: 'capital', component: CapitalStep },
    { id: 'portfolio', component: PortfolioStep }
  ]

  // Load stored profile when user type changes or session changes
  useEffect(() => {
    // If user is authenticated with Google, handle accordingly
    if (status === 'authenticated' && session?.user) {
      const storedProfile = loadUserProfile()
      if (storedProfile && storedProfile.hasCompletedQuestionnaire) {
        // User has completed questionnaire before, but don't auto-show recommendations
        // Let the parent component handle the flow via ReturningUserModal
        setUserProfile(storedProfile)
        // Don't set showRecommendations to true - let parent handle this
      } else if (storedProfile) {
        // User has partial data, use it but continue questionnaire
        setUserProfile(storedProfile)
        // Start from the beginning (risk tolerance)
        setCurrentStep(0)
      } else {
        // New Google user, create profile and start from risk tolerance
        const newProfile: UserProfile = {
          isGuest: false,
          riskTolerance: 5,
          timeHorizon: 'medium',
          growthType: 'balanced',
          sectors: [],
          ethicalInvesting: 5,
          capitalAvailable: 0,
          existingPortfolio: []
        }
        setUserProfile(newProfile)
        // Start from the beginning (risk tolerance)
        setCurrentStep(0)
      }
    } else if (userType) {
      const storedProfile = loadUserProfile()
      if (storedProfile && storedProfile.hasCompletedQuestionnaire) {
        // For guest users, always start fresh regardless of previous completion
        const newProfile: UserProfile = {
          isGuest: userType === 'guest',
          riskTolerance: 5,
          timeHorizon: 'medium',
          growthType: 'balanced',
          sectors: [],
          ethicalInvesting: 5,
          capitalAvailable: 0,
          existingPortfolio: []
        }
        setUserProfile(newProfile)
        setCurrentStep(0) // Always start from beginning for guests
      } else if (storedProfile) {
        // User has partial data, use it but continue questionnaire
        setUserProfile(storedProfile)
      } else {
        // New user, create profile
        const newProfile: UserProfile = {
          isGuest: userType === 'guest',
          riskTolerance: 5,
          timeHorizon: 'medium',
          growthType: 'balanced',
          sectors: [],
          ethicalInvesting: 5,
          capitalAvailable: 0,
          existingPortfolio: []
        }
        setUserProfile(newProfile)
      }
    }
  }, [userType, session, status])

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep)
    }
  }, [currentStep, onStepChange])

  const handleStepComplete = (data: any) => {
    // Update user profile with step data
    const updatedProfile = { ...userProfile, ...data }
    setUserProfile(updatedProfile)

    // Save to localStorage if user is logged in or authenticated
    if (userType === 'user' || (status === 'authenticated' && session?.user)) {
      const profileToSave: StoredUserProfile = {
        ...updatedProfile,
        googleUser: session?.user ? {
          name: session.user.name || '',
          image: session.user.image || ''
        } : undefined,
        hasCompletedQuestionnaire: currentStep === steps.length - 1
      }
      saveUserProfile(profileToSave)
    }

    // Move to next step
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 300)
    } else {
      // All steps completed - show recommendations
      setTimeout(() => {
        setShowRecommendations(true)
      }, 300)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleRestart = () => {
    // Reset all state to initial values
    setCurrentStep(0)
    setShowRecommendations(false)
    setUserProfile({
      isGuest: true,
      riskTolerance: 5,
      timeHorizon: 'medium',
      growthType: 'balanced',
      sectors: [],
      ethicalInvesting: 5,
      capitalAvailable: 0,
      existingPortfolio: []
    })
    // Trigger complete page reset
    if (onCompleteRestart) {
      onCompleteRestart()
    } else {
      onAccountChoice('guest')
    }
  }

  if (showRecommendations || forceShowRecommendations) {
    return <RecommendationsPage userProfile={userProfile} onRestart={handleRestart} />
  }

  // If user is authenticated with Google, skip the welcome step
  const shouldShowWelcome = !session?.user && (!userType || currentStep === 0)

  return (
    <div className="w-full">
      {/* Current Step Component */}
      {(hasStarted || userType) && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`step-container ${currentStep === 6 ? 'portfolio-container' : ''}`}
        >
          {(() => {
            const StepComponent = steps[currentStep].component
            return <StepComponent 
              onComplete={handleStepComplete} 
              userProfile={userProfile} 
              onBack={currentStep > 0 ? handleStepBack : undefined}
            />
          })()}
        </motion.div>
      )}
    </div>
  )
}

export default ChatInterface 