'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowUp } from 'lucide-react'
import { Session } from 'next-auth'
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
  onStartFresh
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const screenSize = useScreenSize()

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
    onStartChat()
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
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
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <span className="text-white text-xl font-light tracking-tight">G.AI.NS</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
          <button onClick={onNavigateToHowToUse} className="hover:text-white transition-colors">HOW TO USE</button>
          <button onClick={onNavigateToHowItWorks} className="hover:text-white transition-colors">HOW IT WORKS</button>
          <button onClick={onNavigateToApis} className="hover:text-white transition-colors">UTILIZED APIS</button>
          <button onClick={onNavigateToContact} className="hover:text-white transition-colors">CONTACT</button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Profile picture - show on both desktop and mobile */}
          {session?.user && session.user.image ? (
            // Logged in user profile picture
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600">
              <Image
                src={session.user.image}
                alt={session.user.name || 'Profile'}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            // Guest profile picture - clickable to login
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-8 h-8 rounded-full overflow-hidden border border-gray-600 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center"
              title="Login to access your profile"
            >
              <svg 
                className="w-4 h-4 text-gray-300" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleTryGains}
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            TRY G.AI.NS
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
        {/* Main heading - moved up by 16 pixels (20-4) */}
        <motion.div
          className="mb-3 -mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-[120px] md:text-[180px] lg:text-[240px] font-light text-white leading-none tracking-tight">
            G.AI.NS
          </h1>
        </motion.div>

        {/* Search input - positioned to overlap the title with frosted glass effect */}
        <motion.div
          className="w-full max-w-4xl mb-8 -mt-12 relative"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transform: screenSize.isMobile ? 'translateY(27px)' : 'translateY(15px)' }}
        >
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              placeholder="Try it for yourself"
              className="w-full border border-gray-700 rounded-2xl px-6 py-4 text-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors cursor-pointer backdrop-blur-sm"
              style={{
                background: 'rgba(31, 41, 55, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
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
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ transform: 'translateY(15px)' }}
        >
          <p className={`${screenSize.isMobile ? 'text-sm' : 'text-base'} text-gray-300 ${screenSize.isMobile ? 'max-w-xs' : 'max-w-2xl'} mx-auto leading-relaxed`}>
            {screenSize.isMobile 
              ? "AI-powered investment guidance that adapts to your goals and builds wealth smarter."
              : "Take control of your financial future with AI-powered investment guidance that adapts to your goals and helps you build wealth smarter, faster, and with confidence."
            }
          </p>
        </motion.div>
      </div>

      {/* Mobile menu toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-20">
        <button
          onClick={handleTryGains}
          className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>

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