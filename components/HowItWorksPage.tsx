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
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
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
          <span>Back</span>
        </button>
        
        <h1 className="text-xl font-semibold text-white">How G.AI.NS Works</h1>
        
        <div className="w-20"></div>
      </nav>

      {/* Main content - Updated layout to prevent scrolling */}
      <div className="relative z-10 h-[calc(100vh-80px)] flex flex-col px-6 py-6 pb-8 overflow-hidden">
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

        <div className="flex-1 flex flex-col">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto mb-6 flex-1">
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

          {/* Process Flow - Updated spacing */}
          <motion.div
            className="bg-gray-900/30 border border-gray-800 rounded-2xl p-4 text-center flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <h3 className="text-xl font-light text-white mb-3">
              Our AI Process
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { step: "01", title: "Data Collection" },
                { step: "02", title: "AI Analysis" },
                { step: "03", title: "Strategy Formation" },
                { step: "04", title: "Recommendations" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs mx-auto mb-2">
                    {item.step}
                  </div>
                  <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 