/**
 * Custom Next.js image loader for CDN-served images.
 *
 * Activated when NEXT_PUBLIC_CDN_URL is set in the environment.
 * Falls back gracefully to the default Next.js image optimisation URL
 * if no CDN URL is configured.
 *
 * Usage: set NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com in production.
 */
export default function cdnLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

  if (!cdnUrl) {
    // Fallback: use Next.js built-in optimisation
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
  }

  const base = cdnUrl.replace(/\/$/, '');

  // If src is already absolute (e.g. https://...) pass it through as-is via CDN
  if (src.startsWith('http')) {
    return `${base}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
  }

  // Relative path — prefix with CDN base
  return `${base}${src}?w=${width}&q=${quality ?? 75}`;
}
