import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { Providers } from './providers';
import { SWRegister } from '@/components/sw-register';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const siteUrl = 'https://www.smartstrategiesbuilder.ai';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Smart Strategies Builder (SSB) | AI Finance Platform',
    template: '%s | SSB',
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
    title: 'Smart Strategies Builder (SSB) | AI Finance Platform',
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
    title: 'Smart Strategies Builder (SSB) | AI Finance Platform',
    description: 'SSB finance platform — paper trade, backtest strategies, and analyze your portfolio with AI market insights.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon-v2.png', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SSB',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#060d1b',
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
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
        <SWRegister />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
