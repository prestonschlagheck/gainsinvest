'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Globe, User, Linkedin, Instagram } from 'lucide-react'

interface ContactPageProps {
  onBack: () => void
}

export default function ContactPage({ onBack }: ContactPageProps) {
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden fixed inset-0" style={{ minHeight: '100vh', height: '100vh' }}>
      {/* Background glow effect */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(29, 78, 216, 0.1) 100%)',
            filter: 'blur(120px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden md:inline">Back</span>
        </button>
        
        <h1 className="text-xl font-semibold text-white text-center flex-1">Contact</h1>
        
        <div className="w-20"></div>
      </nav>

      {/* Main content - Updated layout to allow scrolling */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 py-6 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="w-full max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
              Get in Touch
            </h2>
            <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about G.AI.NS? We're here to help you get started with AI-powered investment guidance.
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-1">Preston Schlagheck</h3>
              <p className="text-gray-400 text-sm mb-6">Founder & Developer</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a
                  href="https://prestonsch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                >
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 text-sm">Website</span>
                </a>
                <a
                  href="mailto:prestonschlagheck@gmail.com"
                  className="flex items-center justify-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 text-sm">Email</span>
                </a>
                <a
                  href="https://linkedin.com/in/preston-schlagheck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 text-sm">LinkedIn</span>
                </a>
                <a
                  href="https://github.com/prestonschlagheck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-gray-300 text-sm">GitHub</span>
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button
              onClick={onBack}
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Try G.AI.NS Now
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 