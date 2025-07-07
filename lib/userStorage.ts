import { UserProfile } from '@/types'

const STORAGE_KEY = 'gains_user_profile'

export interface StoredUserProfile extends UserProfile {
  googleUser?: {
    name: string
    image: string
  }
  hasCompletedQuestionnaire?: boolean
  lastUpdated?: string
}

export const saveUserProfile = (profile: StoredUserProfile): void => {
  try {
    const profileWithTimestamp = {
      ...profile,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileWithTimestamp))
  } catch (error) {
    console.error('Error saving user profile:', error)
  }
}

export const loadUserProfile = (): StoredUserProfile | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading user profile:', error)
    return null
  }
}

export const hasCompletedQuestionnaire = (): boolean => {
  const profile = loadUserProfile()
  return profile?.hasCompletedQuestionnaire === true
}

export const clearUserProfile = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing user profile:', error)
  }
} 