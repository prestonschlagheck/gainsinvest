import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'G.AI.NS Investment Advisor',
  description: 'Smart investment advice powered by AI to help you allocate your capital wisely',
  keywords: 'investment, AI, portfolio, stocks, crypto, ETF, financial advisor',
  authors: [{ name: 'G.AI.NS Team' }],
  icons: {
    icon: '/2.png',
    shortcut: '/2.png',
    apple: '/2.png',
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