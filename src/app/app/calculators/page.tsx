'use client';

import { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  RefreshCcw,
  DollarSign,
  Target,
  AlertTriangle,
  Repeat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

// ============================================================================
// Shared helpers
// ============================================================================

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center rounded-md border bg-background overflow-hidden">
        {prefix && (
          <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
        />
        {suffix && (
          <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-l">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      'flex justify-between items-center py-2 border-b last:border-0',
      highlight && 'font-semibold',
    )}>
      <span className={cn('text-sm', highlight ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
      <span className={cn('text-sm', highlight && 'text-primary text-base')}>{value}</span>
    </div>
  );
}

// ============================================================================
// Retirement Calculator
// ============================================================================

function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(25000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const years = Math.max(0, retireAge - currentAge);
  const r = annualReturn / 100 / 12;
  const n = years * 12;

  // Future value of lump sum
  const fvLumpSum = currentSavings * Math.pow(1 + r, n);

  // Future value of monthly contributions (annuity)
  const fvContributions = r === 0
    ? monthlyContribution * n
    : monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);

  const totalBalance = fvLumpSum + fvContributions;
  const annualIncome = totalBalance * (withdrawalRate / 100);
  const monthlyIncome = annualIncome / 12;
  const totalContributed = currentSavings + monthlyContribution * n;
  const investmentGrowth = totalBalance - totalContributed;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Retirement Calculator</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Estimate your retirement nest egg based on your savings rate and investment growth.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={80} hint="Your age today" />
        <NumberInput label="Retirement Age" value={retireAge} onChange={setRetireAge} min={currentAge + 1} max={90} hint="When you plan to retire" />
        <NumberInput label="Current Savings" value={currentSavings} onChange={setCurrentSavings} min={0} step={1000} prefix="$" hint="Total invested so far" />
        <NumberInput label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} min={0} step={50} prefix="$" hint="Added each month" />
        <NumberInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={20} step={0.5} suffix="%" hint="Historical avg: 7–10% for equities" />
        <NumberInput label="Withdrawal Rate" value={withdrawalRate} onChange={setWithdrawalRate} min={1} max={10} step={0.5} suffix="%" hint="4% is the common 'safe' rule" />
      </div>

      <div className="rounded-lg bg-muted/40 p-4 space-y-0">
        <h3 className="text-sm font-semibold mb-3">Projected Results at Age {retireAge}</h3>
        <ResultRow label="Years to Retirement" value={`${years} years`} />
        <ResultRow label="Total Contributions" value={formatCurrency(totalContributed)} />
        <ResultRow label="Investment Growth" value={formatCurrency(investmentGrowth)} />
        <ResultRow label="Projected Balance" value={formatCurrency(totalBalance)} highlight />
        <ResultRow label={`Annual Withdrawal (${withdrawalRate}%)`} value={formatCurrency(annualIncome)} />
        <ResultRow label="Monthly Income" value={formatCurrency(monthlyIncome)} highlight />
      </div>

      <p className="text-xs text-muted-foreground border rounded px-3 py-2 flex gap-2 items-start">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
        This is a simplified projection for educational purposes. Actual results depend on market
        performance, inflation, taxes, and other factors. Consult a financial advisor for personalized
        planning.
      </p>
    </div>
  );
}

// ============================================================================
// DCA Calculator
// ============================================================================

function DCACalculator() {
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [periodicAmount, setPeriodicAmount] = useState(200);
  const [periods, setPeriods] = useState(24);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [annualReturn, setAnnualReturn] = useState(8);

  const periodsPerYear: Record<typeof frequency, number> = {
    weekly: 52,
    monthly: 12,
    quarterly: 4,
  };

  const ppy = periodsPerYear[frequency];
  const r = annualReturn / 100 / ppy;
  const n = periods;

  const fvInitial = initialInvestment * Math.pow(1 + r, n);
  const fvPeriodic = r === 0
    ? periodicAmount * n
    : periodicAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

  const totalValue = fvInitial + fvPeriodic;
  const totalInvested = initialInvestment + periodicAmount * n;
  const totalGain = totalValue - totalInvested;
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const frequencyLabel = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly' }[frequency];

  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Repeat className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Dollar-Cost Averaging (DCA)</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        See how regular, consistent investing builds wealth over time regardless of market timing.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput label="Initial Investment" value={initialInvestment} onChange={setInitialInvestment} min={0} step={100} prefix="$" />
        <NumberInput label="Recurring Amount" value={periodicAmount} onChange={setPeriodicAmount} min={0} step={50} prefix="$" hint="Per investment period" />
        <div className="space-y-1">
          <label className="text-sm font-medium">Frequency</label>
          <div className="flex gap-2">
            {(['weekly', 'monthly', 'quarterly'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={cn(
                  'flex-1 rounded-md border py-2 text-xs font-medium capitalize transition-colors',
                  frequency === f
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <NumberInput label="Number of Periods" value={periods} onChange={setPeriods} min={1} max={600} hint={`= ${Math.round(periods / ppy * 10) / 10} years`} />
        <NumberInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} min={0} max={30} step={0.5} suffix="%" />
      </div>

      <div className="rounded-lg bg-muted/40 p-4 space-y-0">
        <h3 className="text-sm font-semibold mb-3">After {periods} {frequencyLabel} Periods</h3>
        <ResultRow label="Total Invested" value={formatCurrency(totalInvested)} />
        <ResultRow label="Investment Gains" value={formatCurrency(totalGain)} />
        <ResultRow label="Return on Investment" value={`${gainPct.toFixed(1)}%`} />
        <ResultRow label="Total Portfolio Value" value={formatCurrency(totalValue)} highlight />
      </div>

      <p className="text-xs text-muted-foreground border rounded px-3 py-2 flex gap-2 items-start">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
        DCA assumes a constant average return. Real markets fluctuate — DCA helps reduce the impact of
        timing risk but does not guarantee profits. Educational illustration only.
      </p>
    </div>
  );
}

// ============================================================================
// Emergency Fund Calculator
// ============================================================================

function EmergencyFundCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(4000);
  const [targetMonths, setTargetMonths] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(5000);
  const [monthlySavingsRate, setMonthlySavingsRate] = useState(300);

  const targetAmount = monthlyExpenses * targetMonths;
  const shortfall = Math.max(0, targetAmount - currentSavings);
  const alreadyFunded = Math.min(currentSavings / targetAmount, 1) * 100;
  const monthsToGoal = monthlySavingsRate > 0 && shortfall > 0
    ? Math.ceil(shortfall / monthlySavingsRate)
    : shortfall === 0 ? 0 : Infinity;

  const isFullyFunded = currentSavings >= targetAmount;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Emergency Fund Calculator</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Financial advisors recommend 3–6 months of expenses in liquid savings as a buffer against
        unexpected events.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput label="Monthly Expenses" value={monthlyExpenses} onChange={setMonthlyExpenses} min={0} step={100} prefix="$" hint="Total essential monthly spending" />
        <div className="space-y-1">
          <label className="text-sm font-medium">Target Months of Coverage</label>
          <div className="flex gap-2">
            {[3, 4, 6, 9, 12].map((m) => (
              <button
                key={m}
                onClick={() => setTargetMonths(m)}
                className={cn(
                  'flex-1 rounded-md border py-2 text-xs font-medium transition-colors',
                  targetMonths === m
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted',
                )}
              >
                {m}mo
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">3 months minimum; 6+ recommended</p>
        </div>
        <NumberInput label="Current Emergency Savings" value={currentSavings} onChange={setCurrentSavings} min={0} step={500} prefix="$" hint="Money in liquid accounts" />
        <NumberInput label="Monthly Savings Toward Goal" value={monthlySavingsRate} onChange={setMonthlySavingsRate} min={0} step={50} prefix="$" hint="Additional savings per month" />
      </div>

      <div className="rounded-lg bg-muted/40 p-4 space-y-3">
        <h3 className="text-sm font-semibold">Progress</h3>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(currentSavings)} saved</span>
            <span>Goal: {formatCurrency(targetAmount)}</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isFullyFunded ? 'bg-green-500' : 'bg-primary',
              )}
              style={{ width: `${Math.min(alreadyFunded, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{alreadyFunded.toFixed(0)}% funded</p>
        </div>

        <div className="space-y-0">
          <ResultRow label="Target Fund Size" value={formatCurrency(targetAmount)} />
          <ResultRow label="Current Progress" value={formatCurrency(Math.min(currentSavings, targetAmount))} />
          <ResultRow
            label="Remaining Shortfall"
            value={isFullyFunded ? 'Fully funded!' : formatCurrency(shortfall)}
            highlight
          />
          {!isFullyFunded && (
            <ResultRow
              label="Months to Goal"
              value={monthlySavingsRate === 0 ? '—' : monthsToGoal === Infinity ? '∞' : `${monthsToGoal} months`}
            />
          )}
        </div>
      </div>

      {isFullyFunded && (
        <div className="rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800 px-4 py-3 flex gap-2 items-center">
          <Target className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">
            Your emergency fund is fully funded. Consider investing surplus savings for long-term growth.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground border rounded px-3 py-2 flex gap-2 items-start">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
        Keep your emergency fund in liquid, low-risk accounts (HYSA, money market). Do not invest
        emergency funds in stocks or other volatile assets. This calculator is for educational purposes.
      </p>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

type CalcTab = 'retirement' | 'dca' | 'emergency';

const TABS: { id: CalcTab; label: string; icon: React.ElementType }[] = [
  { id: 'retirement', label: 'Retirement', icon: TrendingUp },
  { id: 'dca', label: 'DCA', icon: Repeat },
  { id: 'emergency', label: 'Emergency Fund', icon: Target },
];

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<CalcTab>('retirement');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Financial Calculators
        </h1>
        <p className="text-muted-foreground">
          Planning tools to help you model your financial goals. All calculations are educational
          estimates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              activeTab === id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:bg-muted text-muted-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Calculator content */}
      {activeTab === 'retirement' && <RetirementCalculator />}
      {activeTab === 'dca' && <DCACalculator />}
      {activeTab === 'emergency' && <EmergencyFundCalculator />}

      {/* Cross-links */}
      <div className="rounded-lg border bg-muted/30 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <p className="font-medium text-sm">Not sure where to start?</p>
          <p className="text-xs text-muted-foreground">Take our investment style questionnaire to get a personalized model portfolio.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a href="/app/onboarding">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Take the Quiz
          </a>
        </Button>
      </div>
    </div>
  );
}
