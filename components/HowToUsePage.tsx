'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, User, BarChart3, TrendingUp } from 'lucide-react'

interface HowToUsePageProps {
  onBack: () => void
}

export default function HowToUsePage({ onBack }: HowToUsePageProps) {
  const steps = [
    {
      icon: <User className="w-6 h-6" />,
      title: "Sign Up or Continue as Guest",
      description: "Create an account for personalized recommendations or continue as a guest to explore our AI advisor."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Tell Us About Your Goals",
      description: "Answer a few quick questions about your investment goals, risk tolerance, and preferences."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Get AI-Powered Recommendations",
      description: "Our advanced AI analyzes your profile and provides personalized investment recommendations."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Start Building Your Portfolio",
      description: "Review recommendations, ask questions, and start building a diversified investment portfolio."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden fixed inset-0" style={{ minHeight: '100vh', height: '100vh' }}>
      {/* Background glow effect */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(29, 78, 216, 0.1) 100%)',
            filter: 'blur(120px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
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
        
        <h1 className="text-xl font-semibold text-white text-center flex-1">How to Use G.AI.NS</h1>
        
        <div className="w-20"></div>
      </nav>

      {/* Main content - Scrollable layout */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 py-6 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="w-full max-w-6xl">
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-2">
              Getting Started
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Follow these simple steps to start your investment journey with G.AI.NS
            </p>
          </motion.div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-start space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg font-bold text-blue-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className="text-base font-semibold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-gray-300 mb-3">
              Ready to start your investment journey?
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 