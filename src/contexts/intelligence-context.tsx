'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

export type UserTier = 'free' | 'pro' | 'institutional';

interface IntelligenceContextValue {
  // Demo mode
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;

  // User tier (affects feature gating)
  tier: UserTier;
  setTier: (tier: UserTier) => void;

  // Convenience helpers
  isProOrHigher: boolean;
  isInstitutional: boolean;

  // Feature checks
  hasRealtimeData: boolean;
  hasAdvancedMetrics: boolean;
  hasCorrelationMatrix: boolean;
  hasRiskContribution: boolean;
  hasAllScenarios: boolean;
  delayDays: number;
}

const IntelligenceContext = createContext<IntelligenceContextValue | undefined>(undefined);

interface IntelligenceProviderProps {
  children: ReactNode;
}

export function IntelligenceProvider({ children }: IntelligenceProviderProps) {
  const searchParams = useSearchParams();
  const [isDemoMode, setDemoMode] = useState(false);
  const [tier, setTier] = useState<UserTier>('free');

  // Check for demo mode from URL params on mount
  useEffect(() => {
    const demoParam = searchParams.get('demo');
    if (demoParam === 'true') {
      setDemoMode(true);
    }

    // Check environment variable
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setDemoMode(true);
    }
  }, [searchParams]);

  // Compute tier-based feature flags
  const isProOrHigher = tier === 'pro' || tier === 'institutional';
  const isInstitutional = tier === 'institutional';

  const value: IntelligenceContextValue = {
    isDemoMode,
    setDemoMode,
    tier,
    setTier,
    isProOrHigher,
    isInstitutional,

    // Feature flags based on tier
    hasRealtimeData: isProOrHigher,
    hasAdvancedMetrics: isProOrHigher,
    hasCorrelationMatrix: isProOrHigher,
    hasRiskContribution: isProOrHigher,
    hasAllScenarios: isProOrHigher,
    delayDays: isProOrHigher ? 0 : 7,
  };

  return (
    <IntelligenceContext.Provider value={value}>
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  const context = useContext(IntelligenceContext);
  if (context === undefined) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
}
