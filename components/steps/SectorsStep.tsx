'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useScreenSize } from '@/lib/useScreenSize'

interface SectorsStepProps {
  onComplete: (data: { sectors: string[] }) => void
  userProfile?: any
  onBack?: () => void
}

const SECTORS = [
  { id: 'technology', name: 'Technology', examples: 'Apple, Microsoft, Google, Meta' },
  { id: 'healthcare', name: 'Healthcare', examples: 'Johnson & Johnson, Pfizer, UnitedHealth' },
  { id: 'finance', name: 'Financial Services', examples: 'JPMorgan Chase, Bank of America, Visa' },
  { id: 'consumer', name: 'Consumer Goods', examples: 'Coca-Cola, Procter & Gamble, Nike' },
  { id: 'energy', name: 'Energy', examples: 'ExxonMobil, Chevron, NextEra Energy' },
  { id: 'industrials', name: 'Industrials', examples: 'Boeing, Caterpillar, General Electric' },
  { id: 'materials', name: 'Materials', examples: 'Dow, DuPont, Freeport-McMoRan' },
  { id: 'utilities', name: 'Utilities', examples: 'NextEra Energy, Duke Energy, Southern Company' },
  { id: 'realestate', name: 'Real Estate', examples: 'American Tower, Prologis, Crown Castle' },
  { id: 'telecommunications', name: 'Telecommunications', examples: 'Verizon, AT&T, T-Mobile' },
  { id: 'retail', name: 'Retail', examples: 'Amazon, Walmart, Home Depot, Target' },
  { id: 'transportation', name: 'Transportation', examples: 'UPS, FedEx, Union Pacific, Delta' }
]

const SectorsStep: React.FC<SectorsStepProps> = ({ onComplete, userProfile, onBack }) => {
  const screenSize = useScreenSize()
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    userProfile?.sectors || []
  )

  // Dynamic grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize.width < 480) return 'grid-cols-1'
    if (screenSize.width < 768) return 'grid-cols-2'
    if (screenSize.width < 1024) return 'grid-cols-3'
    return 'grid-cols-4'
  }

  const toggleSector = (sectorId: string) => {
    setSelectedSectors(prev => {
      if (prev.includes(sectorId)) {
        // Remove the sector if it's already selected
        return prev.filter(id => id !== sectorId)
      } else {
        // Add the sector
        return [...prev, sectorId]
      }
    })
  }

  return (
    <div className="step-layout">
      <div className="step-header">
        <h2 className="text-2xl font-semibold text-white">Sectors of Interest</h2>
      </div>

      <div className={`step-body ${screenSize.isMobile ? 'overflow-y-auto max-h-[calc(100vh-280px)]' : ''}`}>
        <div className={`grid ${getGridColumns()} gap-3`}>
        {SECTORS.map((sector) => {
          const isSelected = selectedSectors.includes(sector.id)
          
          return (
            <motion.button
              key={sector.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleSector(sector.id)}
              className={`group relative px-3 py-4 rounded-xl text-center transition-all duration-300 border-2 ${screenSize.isMobile ? 'h-auto min-h-[100px]' : 'h-[90px]'} w-full ${
                isSelected 
                  ? 'bg-gray-800/40 border-gray-500 shadow-lg' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
              }`}
            >
              <div className="flex flex-col h-full justify-center">
                <h3 className={`${screenSize.isMobile ? 'text-sm' : 'text-base'} font-semibold mb-1 leading-tight ${screenSize.isMobile ? 'whitespace-normal' : 'whitespace-nowrap overflow-hidden text-ellipsis'} px-2 ${
                  isSelected ? 'text-white' : 'text-gray-200'
                }`}>
                  {sector.name}
                </h3>
                <p className={`${screenSize.isMobile ? 'text-xs' : 'text-xs'} leading-relaxed ${screenSize.isMobile ? 'line-clamp-3' : 'line-clamp-2'} px-1 ${
                  isSelected ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {sector.examples}
                </p>
              </div>
            </motion.button>
          )
        })}
        </div>
      </div>

      <div className="step-footer">
        <div className="flex gap-3 w-full">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="flex-[1] border border-gray-700 hover:border-gray-600 hover:bg-gray-800/30 text-gray-300 py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete({ sectors: selectedSectors })}
            className="flex-[2] border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200"
            disabled={selectedSectors.length === 0}
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default SectorsStep 