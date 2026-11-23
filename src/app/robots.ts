import { MetadataRoute } from 'next'
import { HOSTED_DEMO } from '@/lib/hosted-demo'

export default function robots(): MetadataRoute.Robots {
  // The hosted demo is a separate URL with simulated data: keep it out of search engines so it never
  // competes with, or is mistaken for, the real site.
  if (HOSTED_DEMO) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

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
