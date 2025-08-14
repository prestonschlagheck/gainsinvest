#!/usr/bin/env tsx

// Background Worker for G.AI.NS Recommendation Processing
// This script runs independently and processes jobs from the queue

const { getJobQueue, JobProcessor } = require('../lib/jobQueue')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

async function startBackgroundWorker() {
  console.log('🚀 Starting G.AI.NS Background Worker')
  console.log('Environment:', process.env.NODE_ENV || 'development')
  console.log('Time:', new Date().toISOString())
  
  // Check environment variables
  const hasGrok = !!process.env.GROK_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasFinancialAPI = !!(
    process.env.ALPHA_VANTAGE_API_KEY || 
    process.env.TWELVE_DATA_API_KEY || 
    process.env.FINNHUB_API_KEY
  )
  
  console.log('🔧 Environment Check:', {
    hasGrok,
    hasOpenAI, 
    hasFinancialAPI,
    queueType: process.env.JOB_QUEUE_TYPE || 'file'
  })
  
  if (!hasGrok && !hasOpenAI) {
    console.error('❌ No AI service configured. Please set GROK_API_KEY or OPENAI_API_KEY.')
    process.exit(1)
  }
  
  try {
    // Get job queue instance
    const jobQueue = getJobQueue()
    
    // Create and start job processor
    const processor = new JobProcessor(jobQueue)
    
    // Start processing jobs every 3 seconds for responsiveness
    processor.start(3000)
    
    console.log('✅ Background worker started successfully')
    console.log('🔄 Processing jobs every 3 seconds...')
    console.log('📁 Queue storage:', process.env.JOB_QUEUE_TYPE || 'file')
    
    // Log memory usage periodically
    setInterval(() => {
      const memUsage = process.memoryUsage()
      console.log('💾 Memory usage:', {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
      })
    }, 300000) // Every 5 minutes
    
    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`)
      processor.stop()
      
      setTimeout(() => {
        console.log('✅ Background worker stopped')
        process.exit(0)
      }, 1000)
    }
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    
    // Error handling
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error)
      processor.stop()
      process.exit(1)
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
      // Don't exit on unhandled rejection, just log it
    })
    
  } catch (error) {
    console.error('❌ Failed to start background worker:', error)
    process.exit(1)
  }
}

// Start the worker if this file is run directly
if (require.main === module) {
  startBackgroundWorker().catch(error => {
    console.error('❌ Failed to start worker:', error)
    process.exit(1)
  })
}

export { startBackgroundWorker } 