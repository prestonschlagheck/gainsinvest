#!/usr/bin/env node

// Load environment variables manually
const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const env = {}
    
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (value && !key.startsWith('#')) {
          env[key.trim()] = value
        }
      }
    })
    
    return env
  } catch (error) {
    console.log('Could not load .env.local file')
    return {}
  }
}

const env = loadEnvFile('.env.local')

const API_KEYS = {
  OPENAI_API_KEY: env.OPENAI_API_KEY,
  GROK_API_KEY: env.GROK_API_KEY,
  ALPHA_VANTAGE_API_KEY: env.ALPHA_VANTAGE_API_KEY,
  FINNHUB_API_KEY: env.FINNHUB_API_KEY,
  NEWS_API_KEY: env.NEWS_API_KEY,
}

console.log('🔧 API Key Test Script')
console.log('=====================')
console.log('')

// Test OpenAI
async function testOpenAI() {
  console.log('🤖 Testing OpenAI API...')
  if (!API_KEYS.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not found')
    return false
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    })
    
    if (response.ok) {
      console.log('✅ OpenAI API working')
      return true
    } else {
      const errorText = await response.text()
      console.log(`❌ OpenAI API error: ${response.status} - ${errorText}`)
      return false
    }
  } catch (error) {
    console.log(`❌ OpenAI API error: ${error.message}`)
    return false
  }
}

// Test Grok
async function testGrok() {
  console.log('🤖 Testing Grok API...')
  if (!API_KEYS.GROK_API_KEY) {
    console.log('❌ Grok API key not found')
    return false
  }
  
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-latest',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    })
    
    if (response.ok) {
      console.log('✅ Grok API working')
      return true
    } else {
      const errorText = await response.text()
      console.log(`❌ Grok API error: ${response.status} - ${errorText}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Grok API error: ${error.message}`)
    return false
  }
}

// Test Alpha Vantage
async function testAlphaVantage() {
  console.log('📊 Testing Alpha Vantage API...')
  if (!API_KEYS.ALPHA_VANTAGE_API_KEY) {
    console.log('❌ Alpha Vantage API key not found')
    return false
  }
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${API_KEYS.ALPHA_VANTAGE_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data['Global Quote']) {
      console.log('✅ Alpha Vantage API working')
      return true
    } else {
      console.log(`❌ Alpha Vantage API error: ${JSON.stringify(data)}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Alpha Vantage API error: ${error.message}`)
    return false
  }
}

// Test Finnhub
async function testFinnhub() {
  console.log('📊 Testing Finnhub API...')
  if (!API_KEYS.FINNHUB_API_KEY) {
    console.log('❌ Finnhub API key not found')
    return false
  }
  
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${API_KEYS.FINNHUB_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.c) {
      console.log('✅ Finnhub API working')
      return true
    } else {
      console.log(`❌ Finnhub API error: ${JSON.stringify(data)}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Finnhub API error: ${error.message}`)
    return false
  }
}

// Test News API
async function testNewsAPI() {
  console.log('📰 Testing News API...')
  if (!API_KEYS.NEWS_API_KEY || API_KEYS.NEWS_API_KEY === 'your_news_api_key_here') {
    console.log('❌ News API key not found or still placeholder')
    return false
  }
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=stock&apiKey=${API_KEYS.NEWS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.articles) {
      console.log('✅ News API working')
      return true
    } else {
      console.log(`❌ News API error: ${JSON.stringify(data)}`)
      return false
    }
  } catch (error) {
    console.log(`❌ News API error: ${error.message}`)
    return false
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...\n')
  
  const results = {
    openai: await testOpenAI(),
    grok: await testGrok(),
    alphaVantage: await testAlphaVantage(),
    finnhub: await testFinnhub(),
    newsAPI: await testNewsAPI(),
  }
  
  console.log('\n📊 Test Results:')
  console.log('================')
  console.log(`OpenAI: ${results.openai ? '✅' : '❌'}`)
  console.log(`Grok: ${results.grok ? '✅' : '❌'}`)
  console.log(`Alpha Vantage: ${results.alphaVantage ? '✅' : '❌'}`)
  console.log(`Finnhub: ${results.finnhub ? '✅' : '❌'}`)
  console.log(`News API: ${results.newsAPI ? '✅' : '❌'}`)
  
  const workingApis = Object.values(results).filter(Boolean).length
  const totalApis = Object.keys(results).length
  
  console.log(`\nWorking APIs: ${workingApis}/${totalApis}`)
  
  if (workingApis === 0) {
    console.log('\n❌ No APIs are working. Please check your API keys.')
  } else if (workingApis < totalApis) {
    console.log('\n⚠️  Some APIs are not working. The app will use fallbacks.')
  } else {
    console.log('\n✅ All APIs are working!')
  }
}

runTests().catch(console.error) 