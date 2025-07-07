import { NextRequest, NextResponse } from 'next/server'
import { generateInvestmentRecommendations } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const userProfile = await request.json()
    console.log('Received user profile:', JSON.stringify(userProfile, null, 2))
    
    // Generate recommendations using server-side API
    const analysis = await generateInvestmentRecommendations(userProfile)
    console.log('Generated analysis:', JSON.stringify(analysis, null, 2))
    
    return NextResponse.json(analysis)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    console.error('API Route Error Details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 