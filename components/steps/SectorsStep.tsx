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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-8">Sectors of Interest</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTORS.map((sector) => {
          const isSelected = selectedSectors.includes(sector.id)
          
          return (
            <motion.button
              key={sector.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleSector(sector.id)}
              className={`group relative p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                isSelected 
                  ? 'bg-gray-700 border-gray-500 shadow-lg' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${
                    isSelected ? 'text-white' : 'text-gray-200'
                  }`}>
                    {sector.name}
                  </h3>
                  <p className={`text-sm ${
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
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
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
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full"
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
                  <span className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full">
                    All Sectors
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onComplete({ sectors: selectedSectors })}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-lg font-medium transition-colors"
        disabled={selectedSectors.length === 0}
      >
        Continue
      </motion.button>
    </div>
  )
}

export default SectorsStep 