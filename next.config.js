/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Required for Docker production builds

  // ── Image optimisation ───────────────────────────────────────────────────
  images: {
    // Serve images in modern formats when the browser supports them
    formats: ['image/avif', 'image/webp'],

    // Allowed external image hostnames (add CDN / avatar hosts here)
    remotePatterns: [
      // Gravatar avatars
      { protocol: 'https', hostname: 'www.gravatar.com' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
      // Generic CDN placeholder — replace with your actual CDN domain
      ...(process.env.NEXT_PUBLIC_CDN_HOSTNAME
        ? [{ protocol: 'https', hostname: process.env.NEXT_PUBLIC_CDN_HOSTNAME }]
        : []),
    ],

    // Serve optimised images from CDN when NEXT_PUBLIC_CDN_URL is set.
    // In development this stays empty so Next.js serves images locally.
    ...(process.env.NEXT_PUBLIC_CDN_URL
      ? { loader: 'custom', loaderFile: './src/lib/cdn-loader.ts' }
      : {}),

    // Cache optimised images for up to 60 days on the CDN / browser
    minimumCacheTTL: 60 * 60 * 24 * 60, // 60 days in seconds
  },

  // ── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect legacy /auth/verify-email to canonical /verify-email
      {
        source: '/auth/verify-email',
        destination: '/verify-email',
        permanent: true,
      },
      // Handle /reset-password without /auth prefix
      {
        source: '/reset-password',
        destination: '/auth/reset-password',
        permanent: true,
      },
    ];
  },

  // ── HTTP response headers ─────────────────────────────────────────────────
  async headers() {
    return [
      // ── Security headers on all routes ─────────────────────────────────
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // HSTS — only set in production to avoid breaking localhost HTTPS
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },

      // ── Long-lived browser caching for Next.js static assets ───────────
      // Next.js hashes _next/static filenames so they can be cached forever.
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // ── Medium-lived caching for public static files ────────────────────
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },

      // ── Fonts: cache for 1 year ─────────────────────────────────────────
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // ── Icons, favicons ─────────────────────────────────────────────────
      {
        source: '/:file(favicon\\.ico|robots\\.txt|sitemap\\.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },

      // ── API pages: no caching ───────────────────────────────────────────
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  // ── Environment variables exposed to the browser ──────────────────────────
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || '',
  },
};

module.exports = nextConfig;
