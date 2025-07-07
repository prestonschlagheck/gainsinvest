'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, Check, X } from 'lucide-react'
import { StoredUserProfile, saveUserProfile } from '@/lib/userStorage'

interface EditResponsesPageProps {
  userProfile: StoredUserProfile
  onBack: () => void
  onComplete: () => void
}

const SECTORS = [
  { id: 'technology', name: 'Technology' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'finance', name: 'Financial Services' },
  { id: 'consumer', name: 'Consumer Goods' },
  { id: 'energy', name: 'Energy' },
  { id: 'industrials', name: 'Industrials' },
  { id: 'materials', name: 'Materials' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'realestate', name: 'Real Estate' },
  { id: 'telecommunications', name: 'Telecommunications' },
  { id: 'retail', name: 'Retail' },
  { id: 'transportation', name: 'Transportation' }
]

export default function EditResponsesPage({ userProfile, onBack, onComplete }: EditResponsesPageProps) {
  const [profile, setProfile] = useState(userProfile)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<any>({})

  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field)
    setTempValues({ [field]: currentValue })
  }

  const confirmEdit = (field: string) => {
    const newProfile = { ...profile, [field]: tempValues[field] }
    setProfile(newProfile)
    saveUserProfile(newProfile)
    setEditingField(null)
    setTempValues({})
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValues({})
  }

  const formatCapital = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskToleranceLabel = (level: number) => {
    if (level <= 3) return 'Conservative'
    if (level <= 7) return 'Moderate'
    return 'Aggressive'
  }

  const getEthicalLevel = (level: number) => {
    if (level <= 3) return 'Low Priority'
    if (level <= 7) return 'Moderate Priority'
    return 'High Priority'
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-xl font-semibold text-white">Edit Your Responses</h1>
          
          <button
            onClick={onComplete}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          
          {/* Risk Tolerance */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Risk Tolerance</h3>
              {editingField !== 'riskTolerance' ? (
                <button
                  onClick={() => startEdit('riskTolerance', profile.riskTolerance)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmEdit('riskTolerance')}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {editingField === 'riskTolerance' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-4">{tempValues.riskTolerance}/10</div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={tempValues.riskTolerance}
                  onChange={(e) => setTempValues({ ...tempValues, riskTolerance: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gray-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-300">
                <span className="text-2xl font-bold text-white">{profile.riskTolerance}/10</span>
                <span className="ml-3 text-gray-400">({getRiskToleranceLabel(profile.riskTolerance)})</span>
              </div>
            )}
          </div>

          {/* Time Horizon */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Investment Time Horizon</h3>
              {editingField !== 'timeHorizon' ? (
                <button
                  onClick={() => startEdit('timeHorizon', profile.timeHorizon)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmEdit('timeHorizon')}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {editingField === 'timeHorizon' ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'short', label: 'Short Term', subtitle: '0-3 years' },
                  { value: 'medium', label: 'Medium Term', subtitle: '3-10 years' },
                  { value: 'long', label: 'Long Term', subtitle: '10+ years' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTempValues({ ...tempValues, timeHorizon: option.value })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      tempValues.timeHorizon === option.value
                        ? 'bg-gray-800/40 border-gray-500'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.subtitle}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-300 capitalize">
                <span className="text-white font-medium">{profile.timeHorizon} Term</span>
                <span className="ml-3 text-gray-400">
                  ({profile.timeHorizon === 'short' ? '0-3 years' : 
                    profile.timeHorizon === 'medium' ? '3-10 years' : '10+ years'})
                </span>
              </div>
            )}
          </div>

          {/* Growth Type */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Growth Type Preference</h3>
              {editingField !== 'growthType' ? (
                <button
                  onClick={() => startEdit('growthType', profile.growthType)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmEdit('growthType')}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {editingField === 'growthType' ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'conservative', label: 'Conservative', subtitle: 'Steady Growth' },
                  { value: 'balanced', label: 'Balanced', subtitle: 'Moderate Growth' },
                  { value: 'aggressive', label: 'Aggressive', subtitle: 'High Growth' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTempValues({ ...tempValues, growthType: option.value })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      tempValues.growthType === option.value
                        ? 'bg-gray-800/40 border-gray-500'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.subtitle}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-300 capitalize">
                <span className="text-white font-medium">{profile.growthType}</span>
                <span className="ml-3 text-gray-400">
                  ({profile.growthType === 'conservative' ? 'Steady Growth' : 
                    profile.growthType === 'balanced' ? 'Moderate Growth' : 'High Growth'})
                </span>
              </div>
            )}
          </div>

          {/* Sectors */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sectors of Interest</h3>
              {editingField !== 'sectors' ? (
                <button
                  onClick={() => startEdit('sectors', profile.sectors)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmEdit('sectors')}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {editingField === 'sectors' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SECTORS.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => {
                      const currentSectors = tempValues.sectors || []
                      const newSectors = currentSectors.includes(sector.id)
                        ? currentSectors.filter((s: string) => s !== sector.id)
                        : [...currentSectors, sector.id]
                      setTempValues({ ...tempValues, sectors: newSectors })
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      (tempValues.sectors || []).includes(sector.id)
                        ? 'bg-gray-800/40 border-gray-500'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">{sector.name}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.sectors.length > 0 ? (
                  profile.sectors.map((sectorId) => {
                    const sector = SECTORS.find(s => s.id === sectorId)
                    return (
                      <span
                        key={sectorId}
                        className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full border border-gray-600"
                      >
                        {sector?.name || sectorId}
                      </span>
                    )
                  })
                ) : (
                  <span className="text-gray-400">No sectors selected</span>
                )}
              </div>
            )}
          </div>

          {/* Ethical Investing */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Ethical Investing Priority</h3>
              {editingField !== 'ethicalInvesting' ? (
                <button
                  onClick={() => startEdit('ethicalInvesting', profile.ethicalInvesting)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmEdit('ethicalInvesting')}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {editingField === 'ethicalInvesting' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-4">{tempValues.ethicalInvesting}/10</div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={tempValues.ethicalInvesting}
                  onChange={(e) => setTempValues({ ...tempValues, ethicalInvesting: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gray-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Low Priority</span>
                  <span>Moderate</span>
                  <span>High Priority</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-300">
                <span className="text-2xl font-bold text-white">{profile.ethicalInvesting}/10</span>
                <span className="ml-3 text-gray-400">({getEthicalLevel(profile.ethicalInvesting)})</span>
              </div>
            )}
          </div>

          {/* Capital Available */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Available Capital</h3>
              {editingField !== 'capitalAvailable' ? (
                <button
                  onClick={() => startEdit('capitalAvailable', profile.capitalAvailable)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmEdit('capitalAvailable')}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {editingField === 'capitalAvailable' ? (
              <div className="max-w-sm">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-xl text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    value={tempValues.capitalAvailable || ''}
                    onChange={(e) => setTempValues({ ...tempValues, capitalAvailable: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-12 pr-4 py-3 text-xl w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-300">
                <span className="text-2xl font-bold text-white">{formatCapital(profile.capitalAvailable)}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
