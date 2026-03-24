'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Shield,
  TrendingUp,
  Wallet,
  RefreshCcw,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// Questionnaire data
// ============================================================================

interface Question {
  id: string;
  text: string;
  options: { label: string; description: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'time_horizon',
    text: 'When do you expect to need the majority of money you plan to invest?',
    options: [
      { label: 'Less than 2 years', description: 'Short-term — capital preservation is critical', score: 1 },
      { label: '2–5 years', description: 'Medium-term — moderate stability needed', score: 2 },
      { label: '5–10 years', description: 'Long-term — can weather some volatility', score: 3 },
      { label: 'More than 10 years', description: 'Very long-term — time to ride out market cycles', score: 4 },
    ],
  },
  {
    id: 'loss_reaction',
    text: 'If your portfolio dropped 20% in a single month, what would you most likely do?',
    options: [
      { label: 'Sell everything immediately', description: 'Protecting capital is the top priority', score: 1 },
      { label: 'Sell some to reduce exposure', description: 'Reduce risk but stay partially invested', score: 2 },
      { label: 'Hold and wait for recovery', description: 'Stay the course — downturns are temporary', score: 3 },
      { label: 'Buy more at lower prices', description: 'View declines as buying opportunities', score: 4 },
    ],
  },
  {
    id: 'volatility_comfort',
    text: 'Which statement best describes your comfort with investment volatility?',
    options: [
      { label: 'I dislike any fluctuations in my portfolio value', description: 'Stability matters most', score: 1 },
      { label: 'I can accept small fluctuations for modest growth', description: 'Low-to-moderate volatility', score: 2 },
      { label: 'I can accept significant swings for higher potential returns', description: 'Moderate-to-high volatility', score: 3 },
      { label: 'I embrace volatility as part of long-term wealth building', description: 'High volatility is acceptable', score: 4 },
    ],
  },
  {
    id: 'primary_goal',
    text: 'What is your primary investment goal?',
    options: [
      { label: 'Capital preservation', description: 'Protect what I have above all else', score: 1 },
      { label: 'Steady income', description: 'Regular dividends or interest payments', score: 2 },
      { label: 'Balanced growth and income', description: 'Mix of appreciation and income', score: 3 },
      { label: 'Maximum long-term growth', description: 'Maximize total return over time', score: 4 },
    ],
  },
  {
    id: 'income_stability',
    text: 'How stable is your current income or financial situation?',
    options: [
      { label: 'Very unstable — income varies significantly', description: 'Irregular or uncertain income', score: 1 },
      { label: 'Somewhat stable — minor fluctuations', description: 'Mostly stable with some variability', score: 2 },
      { label: 'Stable — predictable income', description: 'Consistent income sources', score: 3 },
      { label: 'Very stable — strong emergency fund too', description: 'Solid income and financial buffer', score: 4 },
    ],
  },
  {
    id: 'experience',
    text: 'How would you describe your investment experience?',
    options: [
      { label: 'No experience — just getting started', description: 'New to investing', score: 1 },
      { label: 'Some experience — mostly savings accounts/CDs', description: 'Limited market exposure', score: 2 },
      { label: 'Moderate — own stocks, ETFs, or mutual funds', description: 'Comfortable with basic instruments', score: 3 },
      { label: 'Extensive — actively managed for 5+ years', description: 'Experienced with diverse strategies', score: 4 },
    ],
  },
  {
    id: 'return_expectation',
    text: 'Which annual return scenario is most aligned with your expectations?',
    options: [
      { label: '2–4% — like a high-yield savings account', description: 'Very conservative expectations', score: 1 },
      { label: '4–6% — modest market participation', description: 'Conservative return target', score: 2 },
      { label: '6–9% — broad market-like returns', description: 'Moderate growth expectations', score: 3 },
      { label: '10%+ — willing to accept higher risk for higher returns', description: 'Aggressive growth target', score: 4 },
    ],
  },
  {
    id: 'liquidity',
    text: 'How important is it to be able to access your invested money quickly?',
    options: [
      { label: 'Critical — I may need it within weeks', description: 'High liquidity required', score: 1 },
      { label: 'Important — within 3–6 months', description: 'Moderate liquidity needed', score: 2 },
      { label: 'Somewhat — within 1–2 years is fine', description: 'Lower liquidity acceptable', score: 3 },
      { label: 'Not important — can stay invested for many years', description: 'Long lock-up acceptable', score: 4 },
    ],
  },
  {
    id: 'monitoring',
    text: 'How actively do you plan to monitor and manage your investments?',
    options: [
      { label: 'Rarely — set it and forget it', description: 'Minimal involvement preferred', score: 2 },
      { label: 'Occasionally — quarterly reviews', description: 'Periodic check-ins', score: 2 },
      { label: 'Regularly — monthly portfolio reviews', description: 'Active monitoring', score: 3 },
      { label: 'Frequently — tracking daily or weekly', description: 'Highly engaged investor', score: 4 },
    ],
  },
  {
    id: 'market_crash',
    text: 'Markets crash 40% (like 2008). Your long-term goal is still 15 years away. What do you do?',
    options: [
      { label: 'Move all assets to cash/bonds immediately', description: 'Full defensive pivot', score: 1 },
      { label: 'Reduce equity exposure significantly', description: 'Defensive repositioning', score: 2 },
      { label: 'Maintain current allocation and rebalance as needed', description: 'Stay the course', score: 3 },
      { label: 'Increase equity allocation — prices are on sale', description: 'Buy the dip aggressively', score: 4 },
    ],
  },
];

// ============================================================================
// Risk profiles
// ============================================================================

interface RiskProfile {
  id: string;
  label: string;
  tagline: string;
  description: string;
  equity: number;
  bonds: number;
  alternatives: number;
  cash: number;
  examplePortfolio: { label: string; pct: number; color: string }[];
  learnPaths: string[];
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

const RISK_PROFILES: RiskProfile[] = [
  {
    id: 'conservative',
    label: 'Conservative',
    tagline: 'Protect first, grow slowly',
    description:
      'You prioritize capital preservation over growth. A conservative portfolio focuses on stability with a mix of high-quality bonds and a small equity allocation for modest long-term appreciation.',
    equity: 20,
    bonds: 65,
    alternatives: 5,
    cash: 10,
    examplePortfolio: [
      { label: 'Bonds / Fixed Income', pct: 65, color: 'bg-blue-500' },
      { label: 'US Equities', pct: 15, color: 'bg-green-500' },
      { label: 'Intl Equities', pct: 5, color: 'bg-emerald-400' },
      { label: 'Alternatives', pct: 5, color: 'bg-purple-400' },
      { label: 'Cash', pct: 10, color: 'bg-slate-400' },
    ],
    learnPaths: ['path-001'],
    icon: Shield,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    tagline: 'Balance growth with stability',
    description:
      'You want meaningful growth while keeping volatility in check. A balanced portfolio blends domestic and international equities with bonds to smooth out market swings.',
    equity: 55,
    bonds: 35,
    alternatives: 5,
    cash: 5,
    examplePortfolio: [
      { label: 'US Equities', pct: 35, color: 'bg-green-500' },
      { label: 'Intl Equities', pct: 20, color: 'bg-emerald-400' },
      { label: 'Bonds / Fixed Income', pct: 35, color: 'bg-blue-500' },
      { label: 'Alternatives', pct: 5, color: 'bg-purple-400' },
      { label: 'Cash', pct: 5, color: 'bg-slate-400' },
    ],
    learnPaths: ['path-001', 'path-003'],
    icon: BarChart3,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
  },
  {
    id: 'growth',
    label: 'Growth',
    tagline: 'Maximize long-term returns',
    description:
      'You have a long time horizon and can stomach significant volatility. An equity-heavy portfolio with broad diversification across market caps, sectors, and geographies.',
    equity: 80,
    bonds: 15,
    alternatives: 5,
    cash: 0,
    examplePortfolio: [
      { label: 'US Equities', pct: 50, color: 'bg-green-500' },
      { label: 'Intl Equities', pct: 30, color: 'bg-emerald-400' },
      { label: 'Bonds / Fixed Income', pct: 15, color: 'bg-blue-500' },
      { label: 'Alternatives', pct: 5, color: 'bg-purple-400' },
    ],
    learnPaths: ['path-001', 'path-003', 'path-004'],
    icon: TrendingUp,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
  },
  {
    id: 'income',
    label: 'Income',
    tagline: 'Regular cash flow from investments',
    description:
      'You want consistent income distributions more than capital appreciation. Focus on dividend-paying stocks, REITs, and investment-grade bonds that generate regular cash flow.',
    equity: 45,
    bonds: 45,
    alternatives: 10,
    cash: 0,
    examplePortfolio: [
      { label: 'Dividend Equities', pct: 30, color: 'bg-amber-500' },
      { label: 'REITs', pct: 15, color: 'bg-orange-400' },
      { label: 'Corporate Bonds', pct: 25, color: 'bg-blue-500' },
      { label: 'Gov\'t Bonds', pct: 20, color: 'bg-sky-400' },
      { label: 'Alternatives', pct: 10, color: 'bg-purple-400' },
    ],
    learnPaths: ['path-001'],
    icon: Wallet,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
  },
];

function scoreToProfile(totalScore: number, answers: Record<string, number>): RiskProfile {
  // Special case: if primary goal is income, lean that direction
  const goalScore = answers['primary_goal'];
  if (goalScore === 2 && totalScore <= 22) return RISK_PROFILES[3]; // income

  // Scoring bands out of 40 (10 questions × 4 max)
  if (totalScore <= 16) return RISK_PROFILES[0]; // conservative
  if (totalScore <= 24) return RISK_PROFILES[1]; // moderate
  if (totalScore <= 32) return RISK_PROFILES[2]; // growth
  return RISK_PROFILES[2]; // growth (max)
}

// ============================================================================
// Component
// ============================================================================

export default function OnboardingPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<RiskProfile | null>(null);
  const [saved, setSaved] = useState(false);

  const question = QUESTIONS[currentQ];
  const selected = answers[question.id];
  const isLast = currentQ === QUESTIONS.length - 1;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (score: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: score }));
  };

  const handleNext = () => {
    if (isLast) {
      const total = Object.values(answers).reduce((a, b) => a + b, 0);
      setResult(scoreToProfile(total, answers));
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  const handleSave = () => {
    if (result) {
      try {
        localStorage.setItem('ssb:risk-profile', result.id);
        setSaved(true);
      } catch {
        // ignore
      }
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setSaved(false);
  };

  if (result) {
    return <ResultsScreen profile={result} onReset={handleReset} onSave={handleSave} saved={saved} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Investment Style Questionnaire</h1>
        <p className="text-muted-foreground">
          10 questions to identify your risk tolerance and recommended investment approach.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-lg border bg-card p-6 space-y-5">
        <p className="font-semibold text-base">{question.text}</p>
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(option.score)}
              className={cn(
                'w-full text-left rounded-lg border px-4 py-3 transition-colors',
                selected === option.score
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <p className={cn(
                'font-medium text-sm',
                selected === option.score ? 'text-foreground' : 'text-foreground',
              )}>
                {option.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={selected === undefined}
          className="gap-2"
        >
          {isLast ? 'See My Profile' : 'Next'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Educational only. This questionnaire does not constitute personalized investment advice.
      </p>
    </div>
  );
}

// ============================================================================
// Results screen
// ============================================================================

function ResultsScreen({
  profile,
  onReset,
  onSave,
  saved,
}: {
  profile: RiskProfile;
  onReset: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const Icon = profile.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Investment Profile</h1>
        <p className="text-muted-foreground">Based on your responses</p>
      </div>

      {/* Profile result */}
      <div className={cn('rounded-lg border p-6 space-y-4', profile.bgClass)}>
        <div className="flex items-center gap-3">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-black/20')}>
            <Icon className={cn('h-6 w-6', profile.colorClass)} />
          </div>
          <div>
            <h2 className={cn('text-xl font-bold', profile.colorClass)}>{profile.label} Investor</h2>
            <p className="text-sm text-muted-foreground">{profile.tagline}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{profile.description}</p>
      </div>

      {/* Model allocation */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Suggested Asset Allocation</h3>
        <p className="text-xs text-muted-foreground">
          This is a general model portfolio for educational illustration only — not personalized advice.
        </p>
        <div className="space-y-3">
          {profile.examplePortfolio.map((slice) => (
            <div key={slice.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{slice.label}</span>
                <span className="font-medium">{slice.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full', slice.color)}
                  style={{ width: `${slice.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!saved ? (
          <Button onClick={onSave} className="gap-2 flex-1">
            <CheckCircle className="h-4 w-4" />
            Save My Profile
          </Button>
        ) : (
          <Button variant="outline" disabled className="gap-2 flex-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Profile Saved
          </Button>
        )}
        <Button variant="outline" asChild className="flex-1">
          <Link href="/app/learn">
            Explore Learn Modules
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/app/calculators">
            Goal Calculators
          </Link>
        </Button>
        <Button variant="ghost" onClick={onReset} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Retake
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        This questionnaire is for educational purposes only and does not constitute personalized
        financial advice. Consult a licensed financial advisor for guidance specific to your situation.
      </p>
    </div>
  );
}
