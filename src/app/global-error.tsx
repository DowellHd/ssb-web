'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#2563eb', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#a1a1aa', marginBottom: '2rem', lineHeight: 1.6 }}>
              We ran into an unexpected error. Try refreshing the page — if the problem persists, contact support.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => reset()}
                style={{
                  background: '#2563eb', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <a
                href="/auth/login"
                style={{
                  background: 'transparent', color: '#a1a1aa', border: '1px solid #27272a',
                  borderRadius: 8, padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Back to login
              </a>
            </div>
            {process.env.NODE_ENV === 'development' && error?.message && (
              <pre style={{
                marginTop: '2rem', padding: '1rem', background: '#18181b',
                borderRadius: 8, fontSize: '0.75rem', color: '#ef4444',
                textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {error.message}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
