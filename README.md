# G.AI.NS - AI Investment Advisor 🤖💰

A sophisticated AI-powered investment chatbot that helps inexperienced investors allocate their capital wisely through an intuitive conversational interface.

## ✨ Features

- **Interactive Chat Interface** - Mimics popular chatbot UIs with smooth animations
- **Smart Questionnaire Flow** - Progressive questions with dynamic button interactions
- **User Account System** - Option for recurring accounts or guest access
- **Comprehensive Profiling** - Captures risk tolerance, time horizon, growth preferences, and more
- **Real-time Market Integration** - Ready for Alpha Vantage or Finnhub API integration
- **Personalized Recommendations** - AI-generated buy/sell/hold recommendations
- **Modern Dark UI** - Sleek grayscale theme with sophisticated typography
- **Mobile Responsive** - Optimized for both desktop and mobile devices

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up API Keys**
   - Copy the information from `api-keys.txt`
   - Create a `.env.local` file in the root directory
   - Add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GROK_API_KEY=your_grok_api_key_here
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   NEXTAUTH_SECRET=your-secret-key-here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
G.AI.NS/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx           # Main landing page
│   └── globals.css        # Global styles and Tailwind
├── components/
│   ├── ChatInterface.tsx   # Main chat component
│   ├── AuthModal.tsx      # Authentication modal
│   ├── RecommendationsPage.tsx # Results display
│   └── steps/             # Individual questionnaire steps
│       ├── WelcomeStep.tsx
│       ├── RiskToleranceStep.tsx
│       ├── TimeHorizonStep.tsx
│       ├── GrowthTypeStep.tsx
│       ├── SectorsStep.tsx
│       ├── EthicalStep.tsx
│       ├── CapitalStep.tsx
│       └── PortfolioStep.tsx
├── types/
│   └── index.ts           # TypeScript type definitions
├── api-keys.txt           # API configuration guide
└── README.md
```

## 📋 User Journey

1. **Welcome** - Choose between recurring account or guest access
2. **Authentication** - Simple email/password for recurring users
3. **Risk Tolerance** - Interactive slider (1-10 scale)
4. **Time Horizon** - Short, medium, or long-term investing
5. **Growth Type** - Aggressive, balanced, or conservative approach
6. **Sector Preferences** - Select from 9 major sectors or "Any"
7. **Ethical Investing** - ESG factor importance level
8. **Available Capital** - Investment amount with quick selection buttons
9. **Existing Portfolio** - Current holdings input with validation
10. **AI Recommendations** - Personalized buy/sell/hold suggestions

## 🎨 Design Features

- **Dark Grayscale Theme** - Professional, modern appearance
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Grid Layout** - CSS Grid for consistent spacing
- **Interactive Elements** - Hover effects, button animations, progress indicators
- **Typography** - ChatGPT-inspired font stack for readability
- **Visual Feedback** - Loading states, validation, and success indicators

## 🔧 Technical Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React hooks
- **Authentication**: localStorage (demo) + NextAuth ready
- **Deployment**: Optimized for Vercel

## 🌐 API Integration

The application is designed to integrate with:

- **OpenAI API** - For intelligent investment advice generation
- **Grok API** - Alternative AI model for recommendations
- **Alpha Vantage** - Real-time market data (free tier: 500 calls/day)
- **Finnhub** - Alternative market data source (free tier: 60 calls/minute)

## 📱 Mobile Optimization

- Responsive breakpoints for all screen sizes
- Touch-friendly interface elements
- Optimized animations for mobile performance
- Progressive Web App capabilities

## 🔒 Security Features

- Input validation on all form fields
- Ticker symbol validation for portfolio entries
- Secure environment variable handling
- Client-side data sanitization

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## 📈 Future Enhancements

- Real-time portfolio tracking
- Advanced charting and analytics
- Social trading features
- News integration and sentiment analysis
- Machine learning model improvements
- Push notifications for market alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

G.AI.NS is for educational and informational purposes only. It does not constitute financial advice. Always consult with qualified financial advisors before making investment decisions.

---

**Built with ❤️ for smarter investing** 