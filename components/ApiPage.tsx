'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Database, Shield, Zap, TrendingUp, BarChart } from 'lucide-react'

interface ApiPageProps {
  onBack: () => void
}

export default function ApiPage({ onBack }: ApiPageProps) {
  const apis = [
    {
      icon: <Database className="w-6 h-6" />,
      name: "Financial Data API",
      provider: "Alpha Vantage / Yahoo Finance",
      description: "Real-time and historical stock prices, market data, and financial metrics for comprehensive investment analysis."
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      name: "Market Data API",
      provider: "TwelveData",
      description: "Professional-grade financial data including real-time quotes, historical data, and technical indicators for comprehensive market analysis."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      name: "Financial News API",
      provider: "FinnHub",
      description: "Real-time financial news, earnings data, and market sentiment analysis to inform investment decisions with current market conditions."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      name: "News & Sentiment API",
      provider: "NewsAPI / Polygon.io",
      description: "Financial news aggregation and sentiment analysis to factor market sentiment into investment decisions."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      name: "AI Processing API",
      provider: "OpenAI GPT-4",
      description: "Advanced language model for natural conversation, investment reasoning, and personalized financial advice generation."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      name: "Authentication API",
      provider: "NextAuth.js",
      description: "Secure user authentication and session management with Google OAuth integration for personalized experiences."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full opacity-20"
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
          <span>Back</span>
        </button>
        
        <h1 className="text-xl font-semibold text-white">Utilized APIs</h1>
        
        <div className="w-20"></div>
      </nav>

      {/* Main content - Scrollable layout */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col px-6 py-6">
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light text-white mb-2">
            Powered by APIs
          </h2>
          <p className="text-base text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Leveraging cutting-edge APIs and data sources for comprehensive investment advice.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto mb-4">
          {apis.map((api, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">
                  {api.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white mb-1 truncate">
                    {api.name}
                  </h3>
                  <p className="text-blue-400 text-xs font-medium mb-1">
                    {api.provider}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                {api.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gray-900/30 border border-gray-800 rounded-2xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h3 className="text-xl font-light text-white mb-2">
            Integration & Security
          </h3>
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed mb-3 text-xs">
            All APIs are integrated through secure, encrypted connections with proper rate limiting 
            and error handling. Your data privacy and security are our top priorities, with no personal 
            financial information stored on external servers.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            Start Using G.AI.NS
          </button>
        </motion.div>
      </div>
    </div>
  )
} 