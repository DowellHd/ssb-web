import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://www.smartstrategiesbuilder.ai';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Smart Strategies Builder (SSB) — Paper Trading, Portfolio Analytics & AI Market Analysis',
    template: '%s | Smart Strategies Builder',
  },
  description: 'Smart Strategies Builder (SSB) — paper trade, analyze your portfolio, backtest strategies, and get AI market insights. Free to start, no credit card required.',
  keywords: [
    'SSB finance',
    'SSB trading platform',
    'SSB portfolio analytics',
    'Smart Strategies Builder',
    'paper trading',
    'portfolio analytics',
    'market regime detection',
    'backtesting',
    'options education',
    'financial education',
    'investing tools',
    'risk analytics',
    'stock analysis',
    'AI market analysis',
    'strategy backtesting',
  ],
  authors: [{ name: 'Smart Strategies Builder' }],
  creator: 'Smart Strategies Builder',
  publisher: 'Smart Strategies Builder',
  verification: {
    google: '1CweN4cqibeyiCgG7B91q5O7y9YV-TRo1NTY8AVCBb0',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Smart Strategies Builder',
    title: 'Smart Strategies Builder (SSB) — Paper Trading, Portfolio Analytics & AI Market Analysis',
    description: 'Smart Strategies Builder (SSB) — paper trade, analyze your portfolio, backtest strategies, and get AI market insights. Free to start, no credit card required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Smart Strategies Builder — Financial Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Strategies Builder (SSB) — Paper Trading & Portfolio Analytics',
    description: 'SSB finance platform — paper trade, backtest strategies, and analyze your portfolio with AI market insights.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
    shortcut: '/icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Smart Strategies Builder',
  alternateName: 'SSB',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: siteUrl,
  description: 'AI-powered financial intelligence platform for risk analysis, regime detection, portfolio analytics, and strategy backtesting.',
  offers: [
    { '@type': 'Offer', name: 'Free Plan', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Starter Plan', price: '9.00', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro Plan', price: '79.00', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Institutional Plan', price: '299.00', priceCurrency: 'USD' },
  ],
  creator: {
    '@type': 'Organization',
    name: 'Smart Strategies Builder',
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
