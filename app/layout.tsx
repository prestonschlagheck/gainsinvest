import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'G.AI.NS Investment Advisor',
  description: 'Take control of your financial future with AI-powered investment guidance that adapts to your goals and helps you build wealth smarter, faster, and with confidence.',
  keywords: 'investment, AI, portfolio, stocks, crypto, ETF, financial advisor',
  authors: [{ name: 'G.AI.NS Team' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="min-h-screen bg-gray-950">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
} 