import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/privacy', '/terms', '/disclaimer'],
        disallow: [
          '/app/',
          '/auth/',
          '/dashboard/',
          '/intelligence/',
          '/verify-email',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.smartstrategiesbuilder.ai/sitemap.xml',
  }
}
