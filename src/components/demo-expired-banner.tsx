'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function DemoExpiredContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const expired = searchParams.get('demo_expired') === 'true';

  if (!expired) return null;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8 text-center">
      <p className="text-sm font-medium text-yellow-400">Your demo session expired</p>
      <p className="text-xs text-muted-foreground mt-1">
        Sign up free to access SSB anytime with your own account.
      </p>
      <button
        className="mt-3 inline-flex items-center px-4 py-2 rounded-md bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition-colors"
        onClick={() => router.push('/auth/signup')}
      >
        Create free account
      </button>
    </div>
  );
}

export function DemoExpiredBanner() {
  return (
    <Suspense fallback={null}>
      <DemoExpiredContent />
    </Suspense>
  );
}
