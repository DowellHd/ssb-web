'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Loader2 } from 'lucide-react';
import { startDemoSession } from '@/lib/demo-auth';

export function DemoCTA() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      await startDemoSession();
      router.push('/app/page');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo unavailable. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleTryDemo}
        disabled={loading}
        className="group inline-flex items-center gap-2 px-8 py-3 rounded-md border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
        )}
        {loading ? 'Loading demo…' : 'Try It Free — No Signup'}
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Full platform · 30 min session · No credit card
      </p>
    </div>
  );
}
