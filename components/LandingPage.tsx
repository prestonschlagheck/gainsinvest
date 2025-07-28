'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowUp } from 'lucide-react'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useScreenSize } from '@/lib/useScreenSize'
import { StoredUserProfile } from '@/lib/userStorage'
import AuthModal from './AuthModal'

interface LandingPageProps {
  session: Session | null
  storedProfile: StoredUserProfile | null
  onStartChat: () => void
  onNavigateToHowToUse: () => void
  onNavigateToHowItWorks: () => void
  onNavigateToApis: () => void
  onNavigateToContact: () => void
  onUsePreviousAnswers: () => void
  onStartFresh: () => void
  onGuestContinue: () => void
  onEditResponses?: () => void
  onViewRecommendations?: () => void
}

export default function LandingPage({ 
  session,
  storedProfile,
  onStartChat, 
  onNavigateToHowToUse, 
  onNavigateToHowItWorks,
  onNavigateToApis,
  onNavigateToContact,
  onUsePreviousAnswers,
  onStartFresh,
  onGuestContinue,
  onEditResponses,
  onViewRecommendations
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const screenSize = useScreenSize()

  const fullText = "Try it for yourself"

  // Typewriter effect
  useEffect(() => {
    const typeText = async () => {
      // Wait 1 second before starting typing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      for (let i = 0; i <= fullText.length; i++) {
        setTypedText(fullText.slice(0, i))
        await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay between characters
      }
    }
    
    typeText()
  }, [fullText])

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530) // Blink every 530ms
    
    return () => clearInterval(cursorInterval)
  }, [])

  const handleInputClick = () => {
    setShowAuthModal(true)
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.blur() // Remove focus to prevent keyboard
    setShowAuthModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowAuthModal(true)
  }

  const handleTryGains = () => {
    if (session?.user) {
      // User is already logged in
      if (storedProfile && storedProfile.hasCompletedQuestionnaire) {
        // User has completed questionnaire, go directly to chat with previous answers
        onUsePreviousAnswers()
      } else {
        // User hasn't completed questionnaire or is new, start fresh
        onStartFresh()
      }
    } else {
      // User not logged in, show auth modal
      setShowAuthModal(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    onStartChat()
  }

  const handleGuestContinue = () => {
    setShowAuthModal(false)
    onGuestContinue()
  }

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  return (
    <div className="h-screen bg-gray-950 relative overflow-hidden fixed inset-0" style={{ height: '100vh', minHeight: '100vh' }}>
      {/* Animated background glow coming from the right */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(29, 78, 216, 0.1) 100%)',
            filter: 'blur(120px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.2) 70%, transparent 100%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`relative z-20 flex items-center ${screenSize.isMobile ? 'px-4' : 'px-6'} py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm`}>
        {/* Left section - Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-xl font-light tracking-tight">G.AI.NS</span>
        </div>
        
        {/* Center section - Navigation menu */}
        <div className="hidden md:flex items-center justify-center flex-1 space-x-8 text-sm font-medium text-gray-300">
          <button onClick={onNavigateToHowToUse} className="hover:text-white transition-colors">HOW TO USE</button>
          <button onClick={onNavigateToHowItWorks} className="hover:text-white transition-colors">HOW IT WORKS</button>
          <button onClick={onNavigateToApis} className="hover:text-white transition-colors">UTILIZED APIS</button>
          <button onClick={onNavigateToContact} className="hover:text-white transition-colors">CONTACT</button>
        </div>

        {/* Right section - Profile/Login */}
        <div className="flex items-center space-x-3">
          {/* Profile component for logged-in users, guest button for others */}
          {session?.user ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 transition-all duration-200 hover:opacity-80"
              >
                {/* User Name - matches navigation styling */}
                <span className="text-gray-300 text-sm font-medium whitespace-nowrap hover:text-white transition-colors">
                  {session.user.name || 'User'}
                </span>
                
                {/* Profile Image */}
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-gray-400 hover:border-gray-300 transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-400 hover:border-gray-300 transition-colors bg-gray-600">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileDropdown && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    
                    {/* Dropdown Content */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 min-w-max bg-gray-800 rounded-lg border border-gray-600 shadow-lg overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-600">
                        <div className="flex items-center gap-3">
                          {session.user.image ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || 'User'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {session.user.name || 'User'}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            onStartFresh()
                          }}
                          className="w-full p-3 text-left transition-colors flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Start Fresh
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            onEditResponses?.()
                          }}
                          className="w-full p-3 text-left transition-colors flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit My Responses
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            onViewRecommendations?.()
                          }}
                          className="w-full p-3 text-left transition-colors flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View My Previous Recommendations
                        </button>

                        <div className="border-t border-gray-600 my-2"></div>

                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            // Sign out the user
                            signOut({ callbackUrl: window.location.origin })
                          }}
                          className="w-full p-3 text-left transition-colors flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Guest profile picture - clickable to login
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-10 h-10 rounded-full overflow-hidden border border-gray-600 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center"
              title="Login to access your profile"
            >
              <svg 
                className="w-5 h-5 text-gray-300" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          {/* Only show TRY G.AI.NS button for non-logged-in users */}
          {!session?.user && (
            <button
              onClick={handleTryGains}
              className={`bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors ${screenSize.isMobile ? 'hidden' : ''}`}
            >
              TRY G.AI.NS
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
        {/* Main heading - moved up by 16 pixels (20-4) */}
        <motion.div
          className={`mb-3 -mt-3 ${screenSize.isMobile ? 'flex justify-center' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`${screenSize.isMobile ? 'text-[108px]' : 'text-[120px]'} md:text-[180px] lg:text-[240px] font-light text-white leading-none tracking-tight ${screenSize.isMobile ? 'text-center' : ''}`}>
            G.<motion.div
              className="inline-block relative"
              animate={{
                backgroundImage: [
                  'linear-gradient(23deg, rgba(59, 130, 246, 1.0) 0%, rgba(147, 51, 234, 0.9) 40%, rgba(168, 85, 247, 0.8) 100%)',
                  'linear-gradient(95deg, rgba(147, 51, 234, 0.9) 0%, rgba(168, 85, 247, 1.0) 35%, rgba(139, 92, 246, 0.8) 100%)',
                  'linear-gradient(167deg, rgba(168, 85, 247, 1.0) 0%, rgba(139, 92, 246, 0.9) 30%, rgba(99, 102, 241, 0.8) 100%)',
                  'linear-gradient(239deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 1.0) 45%, rgba(79, 70, 229, 0.8) 100%)',
                  'linear-gradient(311deg, rgba(99, 102, 241, 1.0) 0%, rgba(79, 70, 229, 0.9) 50%, rgba(59, 130, 246, 0.8) 100%)',
                  'linear-gradient(23deg, rgba(59, 130, 246, 1.0) 0%, rgba(147, 51, 234, 0.9) 40%, rgba(168, 85, 247, 0.8) 100%)'
                ]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              style={{
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent'
              }}
            >AI</motion.div>.NS
          </h1>
        </motion.div>

        {/* Search input - positioned below title with frosted glass effect */}
        <motion.div
          className={`w-full mb-8 relative ${screenSize.isMobile ? '-mt-8 flex justify-center' : '-mt-12'}`}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ 
            transform: screenSize.isMobile ? 'translateY(0px)' : 'translateY(35px)',
            maxWidth: screenSize.isMobile ? 'calc(100vw - 6px)' : '64rem'
          }}
        >
          <form onSubmit={handleSubmit} className={`relative ${screenSize.isMobile ? 'w-full' : ''}`} style={{ maxWidth: screenSize.isMobile ? 'calc(100% - 6px)' : '100%' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              placeholder={`${typedText}${showCursor ? '|' : ''}`}
              className={`w-full border border-gray-700 rounded-2xl px-6 py-4 text-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors cursor-pointer ${screenSize.isMobile ? 'text-left' : ''}`}
              style={{
                background: 'rgba(31, 41, 55, 0.2)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              readOnly
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </button>
          </form>
        </motion.div>

        {/* Bottom text - simplified and smaller */}
        <motion.div
          className={`text-center space-y-4 ${screenSize.isMobile ? 'flex justify-center' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ transform: screenSize.isMobile ? 'translateY(0px)' : 'translateY(35px)' }}
        >
          <p className={`${screenSize.isMobile ? 'text-xs' : 'text-sm'} text-gray-300 max-w-2xl mx-auto leading-relaxed ${screenSize.isMobile ? 'text-center' : ''}`}>
            Take control of your financial future with AI-powered investment guidance that adapts to your goals and helps you build wealth smarter, faster, and with confidence.
          </p>
        </motion.div>
      </div>

      {/* Mobile menu toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-20">
        <button
          onClick={handleMobileMenuToggle}
          className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => {
              setShowMobileMenu(false)
              // If we're not already on landing page, this will effectively refresh/reset to landing
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center items-center mb-6">
                <h2 className="text-xl font-semibold text-white uppercase tracking-wide">Explore</h2>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowMobileMenu(false)
                    onNavigateToHowToUse()
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 hover:text-white transition-all duration-200"
                >
                  How to Use
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowMobileMenu(false)
                    onNavigateToHowItWorks()
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 hover:text-white transition-all duration-200"
                >
                  How it Works
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowMobileMenu(false)
                    onNavigateToApis()
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 hover:text-white transition-all duration-200"
                >
                  Utilized APIs
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowMobileMenu(false)
                    onNavigateToContact()
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 hover:text-white transition-all duration-200"
                >
                  Contact
                </motion.button>

                {/* Only show TRY G.AI.NS button for non-logged-in users */}
                {!session?.user && (
                  <div className="pt-3 border-t border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowMobileMenu(false)
                        handleTryGains()
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white transition-all duration-200 font-medium"
                    >
                      TRY G.AI.NS
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
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
    </div>
  )
} 