'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowUp } from 'lucide-react'
import AuthModal from './AuthModal'

interface LandingPageProps {
  onStartChat: () => void
  onNavigateToHowToUse: () => void
  onNavigateToHowItWorks: () => void
  onNavigateToApis: () => void
  onNavigateToContact: () => void
}

export default function LandingPage({ 
  onStartChat, 
  onNavigateToHowToUse, 
  onNavigateToHowItWorks,
  onNavigateToApis,
  onNavigateToContact
}: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleTryGains = () => {
    setShowAuthModal(true)
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

        <button
          onClick={handleTryGains}
          className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          TRY G.AI.NS
        </button>
      </nav>

      {/* Main content container */}
      <div className="relative z-10 h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6">
        
        {/* Water horizon line - positioned in the center */}
        <div className="absolute left-0 right-0 z-10" style={{ top: '50%' }}>
          {/* Main horizon line */}
          <div className="relative w-full h-1">
            <motion.div
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-80"
              animate={{
                scaleX: [1, 1.01, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Water surface below horizon with horizontal ripples */}
          <div className="relative w-full mt-1" style={{ height: '50vh' }}>
            {/* Multiple horizontal ripple lines moving across the water */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray-600/20 to-transparent"
                style={{ 
                  top: `${(i + 1) * 8}%`,
                  transformOrigin: 'center'
                }}
                animate={{
                  scaleX: [0.7, 1.3, 0.7],
                  opacity: [0.1, 0.3, 0.1],
                  x: ['-10%', '10%', '-10%']
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}

            {/* G.AI.NS text positioned slightly below water line */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{ top: '15%' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-[120px] md:text-[180px] lg:text-[240px] font-light text-white leading-none tracking-tight">
                G.AI.NS
              </h1>
            </motion.div>

            {/* Reflected G.AI.NS with realistic water distortion */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 scale-y-[-1] opacity-30"
              style={{ top: '80%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.h1 
                className="text-[120px] md:text-[180px] lg:text-[240px] font-light text-gray-400 leading-none tracking-tight"
                animate={{
                  scaleX: [1, 1.02, 0.98, 1],
                  skewX: [0, 0.5, -0.5, 0],
                  filter: ['blur(0px)', 'blur(1px)', 'blur(0.5px)', 'blur(0px)']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                G.AI.NS
              </motion.h1>
            </motion.div>

            {/* Water surface distortion overlay */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="w-full h-full bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/60"
                animate={{
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Crossing ripple patterns for more realistic water movement */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`cross-${i}`}
                  className="absolute bg-gradient-to-r from-transparent via-gray-600/15 to-transparent"
                  style={{ 
                    width: '120%',
                    height: '1px',
                    top: `${20 + i * 12}%`,
                    left: '-10%',
                    transform: 'rotate(0.5deg)'
                  }}
                  animate={{
                    x: ['-5%', '5%', '-5%'],
                    opacity: [0.1, 0.25, 0.1],
                    scaleX: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 5 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom text - positioned below the water effect */}
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center space-y-4 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Take control of your financial future with AI-powered investment guidance that adapts to your goals and helps you build wealth smarter, faster, and with confidence.
          </p>
        </motion.div>
      </div>

      {/* Mobile CTA button */}
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