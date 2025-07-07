'use client'

import { useEffect, useState } from 'react'
import { validateApiKeys } from '../lib/api'

interface ApiStatusProps {
  isDevelopment?: boolean
}

export default function ApiStatus({ isDevelopment = false }: ApiStatusProps) {
  const [apiStatus, setApiStatus] = useState<{ [key: string]: boolean }>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development and when explicitly enabled
    if (!isDevelopment) return

    const status = validateApiKeys()
    setApiStatus(status)
    
    // Show status for 5 seconds, then hide
    setIsVisible(true)
    const timer = setTimeout(() => setIsVisible(false), 5000)
    
    return () => clearTimeout(timer)
  }, [isDevelopment])

  if (!isDevelopment || !isVisible) return null

  const connectedApis = Object.entries(apiStatus).filter(([_, connected]) => connected)
  const totalApis = Object.keys(apiStatus).length

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-xs z-50 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${connectedApis.length > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-white font-medium">API Status</span>
      </div>
      
      <div className="text-gray-300 text-xs space-y-1">
        <div>Connected: {connectedApis.length}/{totalApis}</div>
        
        {connectedApis.length > 0 && (
          <div className="text-green-400">
            ✓ {connectedApis.map(([name]) => name).join(', ')}
          </div>
        )}
        
        {connectedApis.length < totalApis && (
          <div className="text-gray-500">
            Missing: {Object.entries(apiStatus)
              .filter(([_, connected]) => !connected)
              .map(([name]) => name)
              .join(', ')}
          </div>
        )}
      </div>
    </div>
  )
} 