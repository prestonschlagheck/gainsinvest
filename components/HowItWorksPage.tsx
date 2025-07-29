'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Database, Shield, Zap, TrendingUp, Target } from 'lucide-react'

interface HowItWorksPageProps {
  onBack: () => void
}

export default function HowItWorksPage({ onBack }: HowItWorksPageProps) {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Advanced AI Analysis",
      description: "Sophisticated AI models analyze market trends and your financial profile for tailored recommendations."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Real-Time Market Data",
      description: "Live market data and economic indicators ensure recommendations are current and relevant."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Strategy",
      description: "Customized recommendations based on your risk tolerance, timeline, and financial goals."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Risk Management",
      description: "Built-in risk assessment and diversification strategies protect and grow investments safely."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Insights",
      description: "Immediate answers with detailed explanations and reasoning behind each recommendation."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Continuous Learning",
      description: "AI continuously learns from market performance to improve recommendation accuracy."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden fixed inset-0" style={{ minHeight: '100vh', height: '100vh' }}>
      {/* Background glow effect */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 right-1/3 w-[700px] h-[700px] rounded-full opacity-20"
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
        
        <h1 className="text-xl font-semibold text-white text-center flex-1">How G.AI.NS Works</h1>
        
        <div className="w-20"></div>
      </nav>

      {/* Main content - Updated layout to allow scrolling */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 py-6 pb-8 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="w-full max-w-6xl">
          <motion.div
            className="text-center mb-6 flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">
              Powered by AI
            </h2>
            <p className="text-base text-gray-300 max-w-3xl mx-auto leading-relaxed">
              AI-powered investment guidance combining market data with personalized recommendations.
            </p>
          </motion.div>

          <div className="flex flex-col">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Process Flow - Updated to match grid width */}
            <motion.div
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="text-center">
                <h3 className="text-xl font-light text-white mb-3">
                  Our AI Process
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { step: "01", title: "Data Collection" },
                    { step: "02", title: "AI Analysis" },
                    { step: "03", title: "Strategy Formation" },
                    { step: "04", title: "Recommendations" }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3 hover:border-gray-700 transition-colors">
                          <span className="text-blue-400 font-semibold text-sm">{item.step}</span>
                        </div>
                        {index < 3 && (
                          <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-gray-700 to-transparent transform translate-x-2"></div>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-300">{item.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 