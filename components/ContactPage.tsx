'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Globe, User, Linkedin, Instagram } from 'lucide-react'

interface ContactPageProps {
  onBack: () => void
}

export default function ContactPage({ onBack }: ContactPageProps) {
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
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
        
        <h1 className="text-xl font-semibold text-white">Contact</h1>
        
        <div className="w-20"></div>
      </nav>

      {/* Main content - Scrollable layout */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-6">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Questions about G.AI.NS? Want to learn more? Feel free to reach out.
          </p>
        </motion.div>

        <div className="max-w-2xl w-full">
          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">Preston Schlagheck</h3>
                <p className="text-gray-400">Founder & Developer</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Email and Website */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <a 
                    href="mailto:prestonschlagheck@gmail.com" 
                    className="hover:text-white transition-colors"
                  >
                    prestonschlagheck@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <a 
                    href="https://prestonsch.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    prestonsch.com
                  </a>
                </div>
              </div>

              {/* Right column - LinkedIn and Instagram */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Linkedin className="w-5 h-5 text-blue-400" />
                  <a 
                    href="https://www.linkedin.com/in/preston-schlagheck/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    preston-schlagheck
                  </a>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <Instagram className="w-5 h-5 text-blue-400" />
                  <a 
                    href="https://www.instagram.com/prestonschlagheck/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    @prestonschlagheck
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-gray-400 mb-6">
              Interested in collaborating or have feedback about G.AI.NS? 
              I'd love to hear from you.
            </p>
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