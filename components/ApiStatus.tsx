'use client'

import { useState, useEffect } from 'react'

interface ApiStatusProps {
  className?: string
}

export default function ApiStatus({ className = '' }: ApiStatusProps) {
  const [apiKeys, setApiKeys] = useState<{ [key: string]: boolean }>({})
  const [apiStatus, setApiStatus] = useState<{ provider: string; active: boolean; remainingRequests: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Use server-side validation endpoint
        const response = await fetch('/api/validate-keys')
        const data = await response.json()
        
        // Convert the server response to the expected format
        const keys = {
          openai: data.details.openai,
          grok: data.details.grok,
          alphaVantage: data.details.alphaVantage,
          twelveData: data.details.twelveData,
          finnhub: data.details.finnhub,
          polygon: data.details.polygon,
          newsApi: data.details.newsApi,
        }
        
        setApiKeys(keys)
        setApiStatus([]) // We'll handle status separately if needed
      } catch (error) {
        console.error('Error checking API status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkApiStatus()
  }, [])

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-3">🔧 API Status</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const requiredApis = [
    { key: 'openai', name: 'OpenAI', description: 'AI Analysis' },
    { key: 'alphaVantage', name: 'Alpha Vantage', description: 'Stock Data' },
    { key: 'finnhub', name: 'Finnhub', description: 'Backup Data' },
    { key: 'newsApi', name: 'News API', description: 'Market News' }
  ]

  const optionalApis = [
    { key: 'grok', name: 'Grok', description: 'Alternative AI' },
    { key: 'twelveData', name: 'Twelve Data', description: 'Additional Data' },
    { key: 'polygon', name: 'Polygon', description: 'Professional Data' }
  ]

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">🔧 API Configuration Status</h3>
      
      {/* Required APIs */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Required APIs</h4>
        <div className="space-y-2">
          {requiredApis.map((api) => (
            <div key={api.key} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{api.name}</span>
                <span className="text-xs text-gray-500 ml-2">({api.description})</span>
              </div>
              <div className="flex items-center">
                {apiKeys[api.key] ? (
                  <span className="text-green-600 text-sm">✅ Configured</span>
                ) : (
                  <span className="text-red-600 text-sm">❌ Missing</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional APIs */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Optional APIs</h4>
        <div className="space-y-2">
          {optionalApis.map((api) => (
            <div key={api.key} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{api.name}</span>
                <span className="text-xs text-gray-500 ml-2">({api.description})</span>
              </div>
              <div className="flex items-center">
                {apiKeys[api.key] ? (
                  <span className="text-green-600 text-sm">✅ Configured</span>
                ) : (
                  <span className="text-gray-400 text-sm">⚪ Not configured</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Setup Instructions</h4>
        <ol className="text-xs text-blue-700 space-y-1">
          <li>1. Copy <code className="bg-blue-100 px-1 rounded">env.example</code> to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
          <li>2. Add your API keys to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
          <li>3. Restart your development server</li>
          <li>4. Check the console for API status logs</li>
        </ol>
      </div>

      {/* Quick Links */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">🔗 Quick API Setup Links</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 underline">OpenAI API Keys</a>
          <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 underline">Alpha Vantage</a>
          <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 underline">Finnhub</a>
          <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 underline">News API</a>
        </div>
      </div>
    </div>
  )
} 