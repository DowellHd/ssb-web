/**
 * Hosted demo switch. A *separate* deployment of this app (its own Vercel project and URL) is built
 * with NEXT_PUBLIC_HOSTED_DEMO=true alongside NEXT_PUBLIC_DEMO_MODE=true, so the whole app runs on
 * the browser-side mock API with no backend. Production builds still refuse demo mode unless this
 * flag is set (see next.config.js), so the real site can never ship mock data by accident.
 * See docs/HOSTED_DEMO.md.
 */
export const HOSTED_DEMO = process.env.NEXT_PUBLIC_HOSTED_DEMO === 'true';
