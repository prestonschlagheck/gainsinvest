'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { UserProfile } from '@/types'
import { loadUserProfile, saveUserProfile, StoredUserProfile } from '@/lib/userStorage'
import WelcomeStep from './steps/WelcomeStep'
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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userType, onAccountChoice, onCompleteRestart, hasStarted = false, onStepChange }) => {
  const { data: session } = useSession()
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
    { id: 'welcome', component: WelcomeStep },
    { id: 'risk', component: RiskToleranceStep },
    { id: 'time', component: TimeHorizonStep },
    { id: 'growth', component: GrowthTypeStep },
    { id: 'sectors', component: SectorsStep },
    { id: 'ethical', component: EthicalStep },
    { id: 'capital', component: CapitalStep },
    { id: 'portfolio', component: PortfolioStep }
  ]

  // Load stored profile when user type changes
  useEffect(() => {
    if (userType === 'user') {
      const storedProfile = loadUserProfile()
      if (storedProfile && storedProfile.hasCompletedQuestionnaire) {
        // User has completed questionnaire before, show recommendations directly
        setUserProfile(storedProfile)
        setShowRecommendations(true)
      } else if (storedProfile) {
        // User has partial data, use it but continue questionnaire
        setUserProfile(storedProfile)
      } else {
        // New user, create profile with Google info if available
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
      }
    } else if (userType === 'guest') {
      setUserProfile(prev => ({ ...prev, isGuest: true }))
    }
  }, [userType, session])

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

    // Save to localStorage if user is logged in
    if (userType === 'user') {
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

  if (showRecommendations) {
    return <RecommendationsPage userProfile={userProfile} onRestart={handleRestart} />
  }

  return (
    <div className="w-full">
      {/* Current Step Component */}
      {(hasStarted || userType) && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`step-container ${currentStep === 7 ? 'portfolio-container' : ''}`}
        >
          {currentStep === 0 || !userType ? (
            <WelcomeStep 
              onComplete={(data) => {
                onAccountChoice(data.choice)
                if (data.choice === 'guest') {
                  handleStepComplete(data)
                }
              }} 
            />
          ) : (
            (() => {
              const StepComponent = steps[currentStep].component
              return <StepComponent onComplete={handleStepComplete} userProfile={userProfile} />
            })()
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ChatInterface 