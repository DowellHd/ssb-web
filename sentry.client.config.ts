import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Replays add significant bundle weight — enable post-launch if needed
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  // Never report from a demo build, even with a DSN set.
  enabled: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true',
});
