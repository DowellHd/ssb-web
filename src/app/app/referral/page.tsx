'use client';

import { useEffect, useState } from 'react';
import { Copy, Gift, Linkedin, Lock, Star, Twitter, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getMyReferralCode, type ReferralStats } from '@/lib/api/referrals';

const BASE_URL = 'https://smartstrategiesbuilder.ai';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-5 text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReferralCode()
      .then(setStats)
      .catch(() => toast.error('Could not load referral data'))
      .finally(() => setLoading(false));
  }, []);

  const referralLink = stats?.referral_code
    ? `${BASE_URL}/?ref=${stats.referral_code}`
    : null;

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const shareTwitter = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(
      `I've been using Smart Strategies Builder for portfolio analysis and backtesting — check it out:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareLinkedIn = () => {
    if (!referralLink) return;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Gift className="h-7 w-7 text-violet-500" />
          Invite Friends to SSB
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Share your unique link and track how many friends you have invited.
        </p>
      </div>

      {/* Referral link card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Your Referral Link</h2>

        {loading ? (
          <div className="h-10 rounded-md bg-muted animate-pulse" />
        ) : referralLink ? (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono truncate">
                {referralLink}
              </code>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-muted-foreground">Share on:</span>
              <button
                onClick={shareTwitter}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                <Twitter className="h-3.5 w-3.5" />
                X / Twitter
              </button>
              <button
                onClick={shareLinkedIn}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Could not load your referral link.</p>
        )}
      </div>

      {/* Stats card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Your Impact
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-md bg-muted animate-pulse" />
            ))
          ) : stats ? (
            <>
              <StatCard label="Total Referred" value={stats.total_referrals} />
              <StatCard label="Signed Up" value={stats.converted} />
              <StatCard label="Pending" value={stats.pending} />
            </>
          ) : null}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold">How It Works</h2>
        <ol className="space-y-3">
          {[
            { step: '1', text: 'Copy your unique referral link above' },
            { step: '2', text: 'Share it with friends, colleagues, or on social media' },
            { step: '3', text: 'They sign up using your link and you both benefit' },
          ].map(({ step, text }) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {step}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </div>

      {/* Rewards section */}
      <div className="rounded-lg border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            Rewards &amp; Incentive Tiers
          </h2>
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
            Coming Soon
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          Refer more friends to unlock exclusive perks. The more you share, the more you earn.
        </p>

        <div className="space-y-2">
          {[
            {
              referrals: 1,
              label: 'First Referral',
              reward: '1-month Pro trial for you and your friend',
              color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
            },
            {
              referrals: 5,
              label: '5 Referrals',
              reward: '20% discount on your next billing cycle',
              color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
            },
            {
              referrals: 10,
              label: '10 Referrals',
              reward: '3 months free + early access to new features',
              color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            },
          ].map(({ referrals, label, reward, color }) => (
            <div
              key={referrals}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 opacity-60"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${color}`}>
                {referrals}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{reward}</p>
              </div>
              <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Reward details will be announced when the program launches.
        </p>
      </div>
    </div>
  );
}
