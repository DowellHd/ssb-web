'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntitlementsInfo } from '@/lib/api/intelligence';

export type UserTier = 'free' | 'pro' | 'institutional' | 'founder';

interface IntelligenceContextValue {
  // Demo mode
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;

  // User tier (affects feature gating)
  tier: UserTier;
  setTier: (tier: UserTier) => void;

  // Entitlements from API
  entitlements: EntitlementsInfo | null;
  setEntitlements: (entitlements: EntitlementsInfo | null) => void;

  // Convenience helpers
  isProOrHigher: boolean;
  isInstitutional: boolean;
  isFounder: boolean;

  // Feature checks (derived from entitlements or tier)
  hasRealtimeData: boolean;
  hasAdvancedMetrics: boolean;
  hasCorrelationMatrix: boolean;
  hasRiskContribution: boolean;
  hasAllScenarios: boolean;
  hasStressTesting: boolean;
  delayDays: number;
  isUnlimited: boolean;
}

const IntelligenceContext = createContext<IntelligenceContextValue | undefined>(undefined);

interface IntelligenceProviderProps {
  children: ReactNode;
}

export function IntelligenceProvider({ children }: IntelligenceProviderProps) {
  const searchParams = useSearchParams();
  const [isDemoMode, setDemoMode] = useState(false);
  const [tier, setTier] = useState<UserTier>('free');
  const [entitlements, setEntitlements] = useState<EntitlementsInfo | null>(null);

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

  // Sync tier from entitlements
  useEffect(() => {
    if (entitlements) {
      const planName = entitlements.plan_name.toLowerCase();
      if (planName === 'founder' || entitlements.is_founder) {
        setTier('founder');
      } else if (planName === 'institutional') {
        setTier('institutional');
      } else if (planName === 'pro') {
        setTier('pro');
      } else {
        setTier('free');
      }
    }
  }, [entitlements]);

  // Compute tier-based feature flags
  const isFounder = tier === 'founder' || (entitlements?.is_founder ?? false);
  const isProOrHigher = isFounder || tier === 'pro' || tier === 'institutional';
  const isInstitutional = isFounder || tier === 'institutional';

  // Derive feature flags from entitlements when available, otherwise use tier-based defaults
  const hasRealtimeData = entitlements
    ? entitlements.regime_insights_delay_days === 0 || isFounder
    : isProOrHigher;

  const hasAdvancedMetrics = entitlements
    ? entitlements.risk_analytics_level !== 'basic' || isFounder
    : isProOrHigher;

  const hasCorrelationMatrix = isProOrHigher;
  const hasRiskContribution = isProOrHigher;
  const hasAllScenarios = isProOrHigher;

  const hasStressTesting = entitlements
    ? entitlements.stress_test_enabled || isFounder
    : isProOrHigher;

  const delayDays = entitlements
    ? (isFounder ? 0 : entitlements.regime_insights_delay_days)
    : (isProOrHigher ? 0 : 7);

  const isUnlimited = entitlements
    ? entitlements.simulation_limit === -1 || isFounder
    : isFounder;

  const value: IntelligenceContextValue = {
    isDemoMode,
    setDemoMode,
    tier,
    setTier,
    entitlements,
    setEntitlements,
    isProOrHigher,
    isInstitutional,
    isFounder,

    // Feature flags based on entitlements/tier
    hasRealtimeData,
    hasAdvancedMetrics,
    hasCorrelationMatrix,
    hasRiskContribution,
    hasAllScenarios,
    hasStressTesting,
    delayDays,
    isUnlimited,
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
