'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SECTORS } from '@/types'

interface SectorsStepProps {
  onComplete: (data: { sectors: string[] }) => void
  userProfile?: any
}

const SectorsStep: React.FC<SectorsStepProps> = ({ onComplete, userProfile }) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    userProfile?.sectors || []
  )

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

      <div className="step-body">
        <div className="sectors-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTORS.map((sector) => {
          const isSelected = selectedSectors.includes(sector.id)
          
          return (
            <motion.button
              key={sector.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleSector(sector.id)}
              className={`group relative p-4 rounded-xl text-left transition-all duration-300 border-2 min-h-[120px] w-full ${
                isSelected 
                  ? 'bg-gray-800/40 border-gray-500 shadow-lg' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 leading-tight ${
                    isSelected ? 'text-white' : 'text-gray-200'
                  }`}>
                    {sector.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    isSelected ? 'text-gray-300' : 'text-gray-400'
                  }`}>
                    {sector.examples}
                  </p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {selectedSectors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-4 border border-gray-700"
        >
          {selectedSectors.length > 0 && (
            <div className="space-y-3">
              {selectedSectors.filter(id => id !== 'any').length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Focus:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSectors.filter(id => id !== 'any').map(sectorId => {
                      const sector = SECTORS.find(s => s.id === sectorId)
                      return (
                        <span
                          key={sectorId}
                          className="px-3 py-1 bg-gray-600/60 text-white text-sm rounded-full border border-gray-600"
                        >
                          {sector?.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
              {selectedSectors.includes('any') && (
                <div>
                  <h4 className="text-white font-medium mb-2">Open to:</h4>
                  <span className="px-3 py-1 bg-gray-600/60 text-white text-sm rounded-full border border-gray-600">
                    All Sectors
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
      </div>

      <div className="step-footer">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete({ sectors: selectedSectors })}
          className="w-full border border-gray-600 hover:border-gray-500 hover:bg-gray-800/30 text-white py-3 rounded-lg text-lg font-medium transition-all duration-200"
          disabled={selectedSectors.length === 0}
        >
          Continue
        </motion.button>
      </div>
    </div>
  )
}

export default SectorsStep 