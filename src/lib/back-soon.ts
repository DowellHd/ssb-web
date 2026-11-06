/**
 * Back Soon switch. While true, the root layout replaces every route with the
 * Back Soon page and the app (and its API calls) is never rendered.
 * Set NEXT_PUBLIC_BACK_SOON=false at build time to restore the full app.
 */
export const BACK_SOON = process.env.NEXT_PUBLIC_BACK_SOON !== 'false';
