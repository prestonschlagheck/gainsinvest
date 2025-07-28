#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 G.AI.NS Environment Setup')
console.log('============================')

const envExamplePath = path.join(__dirname, 'env.example')
const envLocalPath = path.join(__dirname, '.env.local')

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists!')
  console.log('   If you want to start fresh, delete .env.local and run this script again.')
  console.log('   Otherwise, edit your existing .env.local file with your API keys.')
  process.exit(0)
}

// Check if env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.log('❌ env.example not found!')
  console.log('   Please make sure you\'re running this script from the project root.')
  process.exit(1)
}

try {
  // Copy env.example to .env.local
  fs.copyFileSync(envExamplePath, envLocalPath)
  console.log('✅ Successfully created .env.local')
  console.log('')
  console.log('📝 Next steps:')
  console.log('   1. Edit .env.local and add your API keys')
  console.log('   2. Start with these required APIs:')
  console.log('      - OpenAI API (https://platform.openai.com/api-keys)')
  console.log('      - Alpha Vantage (https://www.alphavantage.co/support/#api-key)')
  console.log('      - Finnhub (https://finnhub.io/register)')
  console.log('      - News API (https://newsapi.org/)')
  console.log('   3. Restart your development server: npm run dev')
  console.log('')
  console.log('🔗 Quick setup links:')
  console.log('   - OpenAI: https://platform.openai.com/api-keys')
  console.log('   - Alpha Vantage: https://www.alphavantage.co/support/#api-key')
  console.log('   - Finnhub: https://finnhub.io/register')
  console.log('   - News API: https://newsapi.org/')
  console.log('')
  console.log('📖 For detailed setup instructions, see: API_SETUP_GUIDE.md')
} catch (error) {
  console.log('❌ Error creating .env.local:', error.message)
  process.exit(1)
} 