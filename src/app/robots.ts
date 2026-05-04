import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/app/',
          '/api/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: 'https://www.smartstrategiesbuilder.ai/sitemap.xml',
  }
}
