# G.AI.NS API Setup Guide

This guide will help you set up all the necessary APIs to power the G.AI.NS investment advisor platform with real data and AI analysis.

## Quick Start

1. Copy `env.example` to `.env.local`
2. Fill in your API keys (start with the required ones)
3. Restart your development server

## Required APIs (Start Here)

### 1. OpenAI API (REQUIRED)
**Purpose**: AI-powered investment analysis and recommendations
**Cost**: Pay-per-use, ~$0.002 per 1K tokens
**Sign up**: https://platform.openai.com/api-keys

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### 2. Alpha Vantage (REQUIRED)
**Purpose**: Real-time stock prices and market data
**Cost**: Free tier available (25 requests/day), Premium $50/month
**Sign up**: https://www.alphavantage.co/support/#api-key

```bash
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key-here
```

## Optional APIs (Enhanced Features)

### 3. Finnhub (Backup Stock Data)
**Purpose**: Alternative stock data source, company profiles
**Cost**: Free tier available (60 calls/minute)
**Sign up**: https://finnhub.io/register

```bash
FINNHUB_API_KEY=your-finnhub-key-here
```

### 4. News API (Market News)
**Purpose**: Financial news and market sentiment
**Cost**: Free tier available (1000 requests/month)
**Sign up**: https://newsapi.org/

```bash
NEWS_API_KEY=your-news-api-key-here
```

### 5. Grok API (Alternative AI)
**Purpose**: Backup AI analysis service
**Cost**: TBD (currently in beta)
**Sign up**: https://x.ai/

```bash
GROK_API_KEY=your-grok-key-here
```

## Premium APIs (Professional Features)

### 6. Polygon.io
**Purpose**: Professional-grade market data, real-time quotes
**Cost**: $99/month for real-time data
**Sign up**: https://polygon.io/

```bash
POLYGON_API_KEY=your-polygon-key-here
```

### 7. Twelve Data
**Purpose**: Alternative financial data with global coverage
**Cost**: Free tier available, Premium $8/month
**Sign up**: https://twelvedata.com/

```bash
TWELVE_DATA_API_KEY=your-twelve-data-key-here
```

### 8. Yahoo Finance (via RapidAPI)
**Purpose**: Additional market data and historical prices
**Cost**: Free tier available, Premium plans vary
**Sign up**: https://rapidapi.com/apidojo/api/yahoo-finance1

```bash
YAHOO_FINANCE_API_KEY=your-yahoo-finance-key-here
```

## Setup Instructions

### Step 1: Create Environment File
```bash
cp env.example .env.local
```

### Step 2: Add Your API Keys
Edit `.env.local` and replace the placeholder values with your actual API keys.

### Step 3: Test API Integration
The application includes built-in API validation. Check the browser console for any API connection issues.

### Step 4: Restart Development Server
```bash
npm run dev
```

## API Usage and Rate Limits

| Service | Free Tier | Rate Limits | Recommended Plan |
|---------|-----------|-------------|------------------|
| OpenAI | $5 credit | 3 RPM (free), 3500 RPM (paid) | $20/month |
| Alpha Vantage | 25 requests/day | 25/day (free), 75/min (premium) | $50/month |
| Finnhub | 60 calls/minute | 60/min (free), 300/min (paid) | Free tier OK |
| News API | 1000 requests/month | 1000/month (free) | Free tier OK |
| Polygon | No free tier | 5 calls/min (basic) | $99/month |

## Cost Estimation

**Minimal Setup (Required APIs only)**:
- OpenAI: ~$10-20/month
- Alpha Vantage: Free tier initially, $50/month for production
- **Total**: $10-70/month

**Full Setup (All APIs)**:
- All services combined: ~$200-300/month
- Recommended for production applications

## Testing Without APIs

The application includes fallback functionality:
- Mock data for testing without API keys
- Graceful degradation when APIs are unavailable
- Console warnings for missing API keys

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables only**
3. **Rotate keys regularly**
4. **Monitor API usage and costs**
5. **Set up billing alerts**

## Troubleshooting

### Common Issues

**"API key not found" errors**:
- Ensure `.env.local` exists and contains your keys
- Restart the development server after adding keys
- Check for typos in environment variable names

**Rate limit exceeded**:
- Monitor your API usage in each service's dashboard
- Implement caching to reduce API calls
- Consider upgrading to higher-tier plans

**CORS errors**:
- All API calls are made server-side to avoid CORS issues
- If you see CORS errors, check your API key configuration

### Getting Help

1. Check the browser console for detailed error messages
2. Verify API keys are correctly set in `.env.local`
3. Test individual APIs using their documentation
4. Check service status pages for outages

## Next Steps

Once your APIs are configured:

1. **Test the application** with real data
2. **Monitor API usage** and costs
3. **Implement caching** to optimize performance
4. **Set up production environment** variables
5. **Configure monitoring** and alerting

## API Integration Status

You can check which APIs are properly configured by looking at the browser console when the application loads. Missing APIs will show warnings but won't break the application.

---

**Need help?** Check the individual API documentation links above or refer to the main README.md for general application setup. 