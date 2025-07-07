# Quick API Setup Guide

## 🚨 Fixing the "API Connection Error"

If you're seeing an API connection error, follow these steps:

### Step 1: Create the Environment File
1. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

### Step 2: Get Your API Keys

#### Required Keys (Minimum Setup):

**1. OpenAI API Key** (Required for AI recommendations)
- Go to: https://platform.openai.com/api-keys
- Create an account and generate an API key
- Cost: ~$0.01-$0.05 per recommendation

**2. Financial Data API** (Choose ONE):

**Option A: Alpha Vantage (Recommended - Free)**
- Go to: https://www.alphavantage.co/support/#api-key
- Free tier: 500 requests/day
- Enter your email to get instant free key

**Option B: Finnhub (Alternative - Free)**
- Go to: https://finnhub.io/register
- Free tier: 60 calls/minute
- Create account for free key

### Step 3: Add Keys to .env.local
Open `.env.local` and replace the placeholder values:

```bash
# Required
OPENAI_API_KEY=sk-your-actual-openai-key-here
ALPHA_VANTAGE_API_KEY=your-actual-alpha-vantage-key-here

# Optional (for enhanced features)
FINNHUB_API_KEY=your-finnhub-key-here
NEWS_API_KEY=your-news-api-key-here
```

### Step 4: Restart the Development Server
```bash
npm run dev
```

## ✅ Verification
- Visit: `http://localhost:3000/api/validate-keys`
- This will show which keys are configured correctly

## 🔒 Security
- Never commit `.env.local` to git
- The `.env.local` file is already in `.gitignore`
- Keep your API keys secure and private

## 💰 Cost Estimate
- **OpenAI**: ~$1-5/month for typical usage
- **Alpha Vantage**: Free (500 requests/day)
- **Total**: ~$1-5/month for full functionality 