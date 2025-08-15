#!/usr/bin/env node

// Test script to verify job queue performance
// Run with: node test-job-queue.js

const { getJobQueue, ensureJobProcessorStarted } = require('./lib/jobQueue')

async function testJobQueue() {
  console.log('🧪 Testing Job Queue Performance...')
  
  try {
    // Ensure processor is running
    const processor = ensureJobProcessorStarted()
    console.log('✅ Job processor started')
    
    // Get job queue
    const queue = getJobQueue()
    console.log('✅ Job queue initialized')
    
    // Create a test job
    const testProfile = {
      riskTolerance: 7,
      capitalAvailable: 10000,
      timeHorizon: 'medium',
      growthType: 'balanced',
      sectors: ['technology', 'healthcare'],
      ethicalInvesting: 6
    }
    
    console.log('📝 Creating test job...')
    const startTime = Date.now()
    const jobId = await queue.addJob(testProfile)
    console.log(`✅ Test job created: ${jobId}`)
    
    // Process job immediately
    console.log('🚀 Triggering immediate processing...')
    await processor.processJobImmediately(jobId)
    
    // Monitor job status
    let attempts = 0
    const maxAttempts = 60 // 1 minute max
    const checkInterval = 1000 // Check every second
    
    console.log('📊 Monitoring job progress...')
    
    while (attempts < maxAttempts) {
      attempts++
      const job = await queue.getJob(jobId)
      
      if (!job) {
        console.log('❌ Job not found')
        break
      }
      
      const age = Math.round((Date.now() - startTime) / 1000)
      console.log(`⏱️  ${age}s: Status: ${job.status}`)
      
      if (job.status === 'completed') {
        console.log('🎉 Job completed successfully!')
        console.log(`⏱️  Total time: ${age} seconds`)
        break
      } else if (job.status === 'failed') {
        console.log('❌ Job failed:', job.error)
        break
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkInterval))
    }
    
    if (attempts >= maxAttempts) {
      console.log('⏰ Test timed out after 1 minute')
    }
    
    // Clean up
    try {
      await queue.deleteJob(jobId)
      console.log('🗑️ Test job cleaned up')
    } catch (error) {
      console.warn('⚠️ Failed to clean up test job:', error.message)
    }
    
    console.log('✅ Test completed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run test
testJobQueue()
