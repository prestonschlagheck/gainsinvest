'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit3, Check, X } from 'lucide-react'
import { StoredUserProfile } from '@/lib/userStorage'

interface EditResponsesPageProps {
  userProfile: StoredUserProfile
  onSave: (updatedProfile: StoredUserProfile) => void
  onBack: () => void
}

interface EditableField {
  key: string
  title: string
  currentValue: any
  renderValue: (value: any) => string
  renderEditor: (value: any, onChange: (value: any) => void) => React.ReactNode
}

export default function EditResponsesPage({ userProfile, onSave, onBack }: EditResponsesPageProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<Record<string, any>>({})

  const handleStartEdit = (fieldKey: string, currentValue: any) => {
    setEditingField(fieldKey)
    setTempValues({ ...tempValues, [fieldKey]: currentValue })
  }

  const handleConfirmEdit = (fieldKey: string) => {
    const updatedProfile = { ...userProfile, [fieldKey]: tempValues[fieldKey] }
    onSave(updatedProfile)
    setEditingField(null)
  }

  const handleCancelEdit = () => {
    setEditingField(null)
  }

  const getRiskLevelText = (level: number) => {
    if (level <= 3) return `Conservative (${level}/10)`
    if (level <= 7) return `Moderate (${level}/10)`
    return `Aggressive (${level}/10)`
  }

  const getTimeHorizonText = (horizon: string) => {
    switch (horizon) {
      case 'short': return 'Short Term (0-3 years)'
      case 'medium': return 'Medium Term (3-10 years)'
      case 'long': return 'Long Term (10+ years)'
      default: return horizon
    }
  }

  const getGrowthTypeText = (type: string) => {
    switch (type) {
      case 'aggressive': return 'Aggressive Growth'
      case 'balanced': return 'Balanced Growth'
      case 'conservative': return 'Conservative Growth'
      default: return type
    }
  }

  const getEthicalLevelText = (level: number) => {
    if (level <= 3) return 'Low Priority'
    if (level <= 7) return 'Moderate Priority'
    return 'High Priority'
  }

  const editableFields: EditableField[] = [
    {
      key: 'riskTolerance',
      title: 'Risk Tolerance',
      currentValue: userProfile.riskTolerance,
      renderValue: (value) => getRiskLevelText(value),
      renderEditor: (value, onChange) => (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">{value}/10</div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Conservative</span>
            <span>Moderate</span>
            <span>Aggressive</span>
          </div>
        </div>
      )
    },
    {
      key: 'timeHorizon',
      title: 'Investment Time Horizon',
      currentValue: userProfile.timeHorizon,
      renderValue: (value) => getTimeHorizonText(value),
      renderEditor: (value, onChange) => (
        <div className="space-y-3">
          {[
            { id: 'short', label: 'Short Term (0-3 years)' },
            { id: 'medium', label: 'Medium Term (3-10 years)' },
            { id: 'long', label: 'Long Term (10+ years)' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                value === option.id
                  ? 'border-gray-500 bg-gray-800/40'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className={value === option.id ? 'text-white' : 'text-gray-300'}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )
    },
    {
      key: 'growthType',
      title: 'Growth Type Preference',
      currentValue: userProfile.growthType,
      renderValue: (value) => getGrowthTypeText(value),
      renderEditor: (value, onChange) => (
        <div className="space-y-3">
          {[
            { id: 'conservative', label: 'Conservative Growth' },
            { id: 'balanced', label: 'Balanced Growth' },
            { id: 'aggressive', label: 'Aggressive Growth' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                value === option.id
                  ? 'border-gray-500 bg-gray-800/40'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className={value === option.id ? 'text-white' : 'text-gray-300'}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )
    },
    {
      key: 'sectors',
      title: 'Sectors of Interest',
      currentValue: userProfile.sectors,
      renderValue: (value) => value.length > 0 ? `${value.length} sectors selected` : 'No sectors selected',
      renderEditor: (value, onChange) => {
        const SECTORS = [
          'Technology', 'Healthcare', 'Financial Services', 'Consumer Goods',
          'Energy', 'Industrials', 'Materials', 'Utilities',
          'Real Estate', 'Telecommunications', 'Retail', 'Transportation'
        ]
        
        const toggleSector = (sector: string) => {
          const updated = value.includes(sector)
            ? value.filter((s: string) => s !== sector)
            : [...value, sector]
          onChange(updated)
        }

        return (
          <div className="grid grid-cols-2 gap-2">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`p-2 text-sm rounded-lg border transition-all ${
                  value.includes(sector)
                    ? 'border-gray-500 bg-gray-800/40 text-white'
                    : 'border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        )
      }
    },
    {
      key: 'ethicalInvesting',
      title: 'Ethical Investing Preference',
      currentValue: userProfile.ethicalInvesting,
      renderValue: (value) => getEthicalLevelText(value),
      renderEditor: (value, onChange) => (
        <div className="space-y-3">
          {[
            { level: 2, label: 'Low Priority', desc: 'Focus on financial returns first' },
            { level: 5, label: 'Moderate Priority', desc: 'Balance ESG factors with returns' },
            { level: 9, label: 'High Priority', desc: 'ESG factors are very important' }
          ].map((option) => (
            <button
              key={option.level}
              onClick={() => onChange(option.level)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                (value <= 3 && option.level === 2) ||
                (value >= 4 && value <= 7 && option.level === 5) ||
                (value >= 8 && option.level === 9)
                  ? 'border-gray-500 bg-gray-800/40'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className={`font-medium ${
                (value <= 3 && option.level === 2) ||
                (value >= 4 && value <= 7 && option.level === 5) ||
                (value >= 8 && option.level === 9)
                  ? 'text-white' : 'text-gray-300'
              }`}>
                {option.label}
              </div>
              <div className="text-xs text-gray-400">{option.desc}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      key: 'capitalAvailable',
      title: 'Available Capital',
      currentValue: userProfile.capitalAvailable,
      renderValue: (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value),
      renderEditor: (value, onChange) => (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">$</span>
            </div>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[5000, 25000, 100000].map((amount) => (
              <button
                key={amount}
                onClick={() => onChange(amount)}
                className={`p-2 text-sm rounded-lg border transition-all ${
                  value === amount
                    ? 'border-gray-500 bg-gray-800/40 text-white'
                    : 'border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      )
    }
  ]

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
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {editableFields.map((field) => (
            <motion.div
              key={field.key}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{field.title}</h3>
                {editingField === field.key ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirmEdit(field.key)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(field.key, field.currentValue)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {editingField === field.key ? (
                <div className="space-y-4">
                  {field.renderEditor(
                    tempValues[field.key] ?? field.currentValue,
                    (value) => setTempValues({ ...tempValues, [field.key]: value })
                  )}
                </div>
              ) : (
                <p className="text-gray-300">{field.renderValue(field.currentValue)}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 