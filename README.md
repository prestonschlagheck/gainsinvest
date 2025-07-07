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
   - Create a `.env.local` file in the root directory
   - Configure the multi-provider system (add at least one financial API for basic functionality):
   ```env
   # AI Services (Required for recommendations)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Financial Data APIs (Configure at least one, preferably all three)
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here     # 25/day free
   TWELVE_DATA_API_KEY=your_twelve_data_key_here         # 800/day free
   FINNHUB_API_KEY=your_finnhub_key_here                 # 60/minute free
   
   # Authentication (Required for user accounts)
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
   
   **🔑 Quick API Setup:**
   - [Alpha Vantage](https://www.alphavantage.co/support/#api-key) - Free, instant
   - [Twelve Data](https://twelvedata.com/) - Free account, 800 calls/day  
   - [Finnhub](https://finnhub.io/register) - Free account, 60 calls/minute
   - [OpenAI](https://platform.openai.com/api-keys) - Pay-as-you-go, ~$0.01 per recommendation

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
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js authentication
│   │   ├── recommendations/ # AI investment recommendations
│   │   └── validate-keys/ # API key validation
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx           # Main landing page
│   ├── providers.tsx      # Authentication providers
│   └── globals.css        # Global styles and Tailwind
├── components/
│   ├── ChatInterface.tsx   # Main chat component
│   ├── AuthModal.tsx      # Authentication modal
│   ├── GoogleAuthModal.tsx # Google OAuth modal
│   ├── ReturningUserModal.tsx # Returning user modal
│   ├── RecommendationsPage.tsx # Results display
│   ├── PortfolioChart.tsx  # Portfolio visualization
│   └── steps/             # Individual questionnaire steps
│       ├── WelcomeStep.tsx
│       ├── RiskToleranceStep.tsx
│       ├── TimeHorizonStep.tsx
│       ├── GrowthTypeStep.tsx
│       ├── SectorsStep.tsx
│       ├── EthicalStep.tsx
│       ├── CapitalStep.tsx
│       └── PortfolioStep.tsx
├── lib/
│   ├── api.ts             # API utilities
│   └── userStorage.ts     # User data management
├── types/
│   └── index.ts           # TypeScript type definitions
├── env.example            # Environment variables template
├── vercel.json           # Vercel deployment configuration
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

## 🌐 Multi-Provider API System

The application uses a **smart fallback system** that ensures your app never runs out of API requests:

### 🔄 **Automatic Fallback Hierarchy:**
1. **Alpha Vantage** (Primary) - 25 requests/day free
2. **Twelve Data** (Secondary) - 800 requests/day free  
3. **Finnhub** (Tertiary) - 60 requests/minute free

### 🤖 **AI Integration:**
- **OpenAI API** - For intelligent investment advice generation
- **Grok API** - Alternative AI model for recommendations

### 📊 **Total API Capacity:**
With all three providers configured, you get **1000+ requests per day** completely free! The system automatically switches providers when one hits its limit, ensuring uninterrupted service.

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

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect it's a Next.js project

2. **Environment Variables**
   - Add all required environment variables from `env.example`
   - Set `NEXTAUTH_URL` to your production domain
   - Add Google OAuth credentials for production

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-project.vercel.app`

### Local Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

- `NEXTAUTH_URL` should be your production domain
- Google OAuth redirect URIs must include your production domain
- All API keys should be production-ready values

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