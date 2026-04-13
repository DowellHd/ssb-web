import type { AdvisorClient } from '@/lib/api/enterprise';

export function calcLeadScore(c: AdvisorClient): number {
  let score = 40;
  if (c.segment === 'uhnw')      score += 40;
  else if (c.segment === 'hnw')  score += 25;
  else if (c.segment === 'affluent') score += 12;
  const aum = c.aum_usd ? parseFloat(c.aum_usd as string) : 0;
  if (aum >= 10_000_000) score += 30;
  else if (aum >= 1_000_000) score += 20;
  else if (aum >= 500_000)   score += 12;
  else if (aum >= 100_000)   score += 6;
  if (c.kyc_status === 'approved') score += 15;
  else if (c.kyc_status === 'rejected') score -= 20;
  if (c.status === 'active')      score += 15;
  else if (c.status === 'inactive')    score -= 10;
  else if (c.status === 'terminated')  score -= 30;
  return Math.max(0, Math.min(100, score));
}

export function scoreLabel(s: number): { label: string; color: string } {
  if (s >= 80) return { label: 'Hot',  color: 'text-red-400' };
  if (s >= 60) return { label: 'Warm', color: 'text-orange-400' };
  if (s >= 40) return { label: 'Cool', color: 'text-blue-400' };
  return         { label: 'Cold', color: 'text-muted-foreground' };
}
