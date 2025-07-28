'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface XaiUsageProps {
  className?: string
}

interface UsageData {
  message?: string
  suggestion?: string
  dashboard?: string
  currentUsage?: number
  limit?: number
  resetDate?: string
}

export default function XaiUsage({ className = '' }: XaiUsageProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/xai-usage')
        const data = await response.json()

        if (data.success && data.usage) {
          setUsageData(data.usage)
        } else {
          setError(data.message || 'Unable to fetch usage data')
          setUsageData(data.usage || null)
        }
      } catch (err) {
        setError('Failed to fetch XAI usage information')
        setUsageData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  if (loading) {
    return (
      <div className={`bg-gray-900/50 border border-gray-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">XAI Usage</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900/50 border border-gray-700 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">XAI Usage & Billing</h3>
      </div>

      {error ? (
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-yellow-400 mb-1">Usage Information Unavailable</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      ) : usageData ? (
        <div className="space-y-3">
          {usageData.message && (
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p>{usageData.message}</p>
                {usageData.suggestion && (
                  <p className="text-gray-400 mt-1">{usageData.suggestion}</p>
                )}
              </div>
            </div>
          )}

          {usageData.currentUsage !== undefined && usageData.limit !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Current Usage</span>
                <span className="text-white font-medium">
                  {usageData.currentUsage.toLocaleString()} / {usageData.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(usageData.currentUsage / usageData.limit) * 100}%` }}
                />
              </div>
              {usageData.resetDate && (
                <p className="text-xs text-gray-400">
                  Resets on: {new Date(usageData.resetDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-300">
          <p>No usage data available</p>
        </div>
      )}

      {/* Dashboard Link */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <a
          href="https://console.x.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
        >
          <span>View XAI Dashboard</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  )
} 