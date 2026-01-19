'use client';

import { AlertTriangle } from 'lucide-react';
import { useIntelligence } from '@/contexts/intelligence-context';

export function DemoBanner() {
  const { isDemoMode } = useIntelligence();

  if (!isDemoMode) return null;

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">DEMO MODE</span>
        <span className="text-yellow-600 dark:text-yellow-500">
          — Viewing simulated data for demonstration purposes only
        </span>
      </div>
    </div>
  );
}
