'use client'

import { useState, useEffect } from 'react'

interface ScreenSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      })
    }

    // Initial measurement
    updateScreenSize()

    // Listen for resize events
    window.addEventListener('resize', updateScreenSize)
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      // Small delay to allow orientation change to complete
      setTimeout(updateScreenSize, 100)
    })

    return () => {
      window.removeEventListener('resize', updateScreenSize)
      window.removeEventListener('orientationchange', updateScreenSize)
    }
  }, [])

  return screenSize
} 