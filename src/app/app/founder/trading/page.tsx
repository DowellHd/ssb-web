'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Trash2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import {
  getIBKRPolicy,
  getMyIntents,
  createIntent,
  approveIntent,
  getMarketPulse,
  getPortfolioSnapshot,
  getAIRecommendation,
  analyzeTradeIntent,
  type IBKRPolicy,
  type TradeIntent,
  type MarketPulse,
  type MarketSignal,
  type PortfolioSnapshot,
  type AIRecommendation,
  type TradeAnalysis,
  type ExecutionMode,
  type PricingPolicy,
  type TimeInForce,
  type TimeHorizon,
  type RiskTolerance,
} from '@/lib/api/ibkr';

// ============================================================================
// Design tokens
// ============================================================================
const GOLD = '#C9A84C';
const ROYAL = '#1A2478';

// ============================================================================
// Utility helpers
// ============================================================================

function fmt$(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(decimals) + '%';
}

function ageLabel(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

// ============================================================================
// Market hours helpers
// ============================================================================

interface MarketStatus {
  isOpen: boolean;
  reason: string;        // e.g. "After hours", "Weekend", "Pre-market"
  nextOpenLabel: string; // e.g. "Opens 9:30 AM ET Mon"
}

function getNYDate(): Date {
  // Parse current time in America/New_York to a plain Date whose local fields
  // reflect NY wall-clock values — reliable across all browser timezones.
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

function computeMarketStatus(): MarketStatus {
  const ny = getNYDate();
  const day = ny.getDay(); // 0=Sun … 6=Sat
  const mins = ny.getHours() * 60 + ny.getMinutes();
  const OPEN = 9 * 60 + 30;
  const CLOSE = 16 * 60;

  if (day === 6) return { isOpen: false, reason: 'Weekend (Saturday)', nextOpenLabel: 'Opens 6:30 AM PT Mon' };
  if (day === 0) return { isOpen: false, reason: 'Weekend (Sunday)',   nextOpenLabel: 'Opens 6:30 AM PT Mon' };
  if (mins < OPEN)  return { isOpen: false, reason: 'Pre-market',  nextOpenLabel: 'Opens 6:30 AM PT today' };
  if (mins >= CLOSE) return { isOpen: false, reason: 'After hours', nextOpenLabel: 'Opens 6:30 AM PT tomorrow' };
  return { isOpen: true, reason: 'Market open', nextOpenLabel: 'Closes 1:00 PM PT' };
}

function useMarketStatus(): MarketStatus {
  const [status, setStatus] = useState<MarketStatus>(computeMarketStatus);
  useEffect(() => {
    const tick = () => setStatus(computeMarketStatus());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/** Returns a warning string if the expiry date is problematic, null if fine. */
function validateExpiry(expiry: string): { error: string | null; warning: string | null } {
  if (!expiry) return { error: null, warning: null };
  const d = new Date(expiry + 'T12:00:00'); // noon to avoid timezone edge cases
  const now = new Date();
  if (d < new Date(now.toDateString())) return { error: 'Expiry date is in the past.', warning: null };
  const dow = d.getDay();
  if (dow === 6) return { error: 'Options cannot expire on Saturday — use the Friday before.', warning: null };
  if (dow === 0) return { error: 'Options cannot expire on Sunday — use the nearest Friday.', warning: null };
  // Same-day expiry while market is closed
  const nyNow = getNYDate();
  const isToday = d.toDateString() === new Date(nyNow.toDateString()).toDateString();
  if (isToday) {
    const mins = nyNow.getHours() * 60 + nyNow.getMinutes();
    if (mins >= 16 * 60) return { error: null, warning: 'Market is closed for today — this contract expires today and cannot fill.' };
    if (mins < 9 * 60 + 30) return { error: null, warning: 'Market not yet open — order will queue for 6:30 AM PT open.' };
  }
  return { error: null, warning: null };
}

// ============================================================================
// Regime & VIX styling
// ============================================================================

function regimeBg(label: string) {
  switch (label) {
    case 'BULL': return 'bg-emerald-900/40 border-emerald-700 text-emerald-300';
    case 'BEAR': return 'bg-red-900/40 border-red-700 text-red-300';
    case 'CRISIS': return 'bg-red-950/60 border-red-600 text-red-200';
    case 'SIDEWAYS': return 'bg-yellow-900/30 border-yellow-700 text-yellow-300';
    default: return 'bg-zinc-800/60 border-zinc-600 text-zinc-300';
  }
}

function vixColor(level: string) {
  switch (level) {
    case 'low': return 'text-emerald-400';
    case 'normal': return 'text-green-400';
    case 'elevated': return 'text-yellow-400';
    case 'high': return 'text-orange-400';
    case 'extreme': return 'text-red-400';
    default: return 'text-zinc-400';
  }
}

// ============================================================================
// Small reusable components
// ============================================================================

function Pill({ label, active, color }: { label: string; active: boolean; color?: string }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border';
  const activeClass = color
    ? `${base} border-transparent text-white`
    : `${base} bg-emerald-900/40 border-emerald-700 text-emerald-300`;
  const inactiveClass = `${base} bg-zinc-800/60 border-zinc-600 text-zinc-400`;
  return (
    <span className={active ? activeClass : inactiveClass} style={active && color ? { backgroundColor: color + '33', borderColor: color, color } : undefined}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
      {label}
    </span>
  );
}

function RecBadge({ rec, confidence }: { rec: string; confidence: number }) {
  const map: Record<string, string> = {
    BUY: 'bg-emerald-900/50 border-emerald-500 text-emerald-300',
    SELL: 'bg-red-900/50 border-red-500 text-red-300',
    HOLD: 'bg-yellow-900/50 border-yellow-600 text-yellow-300',
  };
  const cls = map[rec] ?? map.HOLD;
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${cls}`}>
      <span className="text-3xl font-black tracking-wider">{rec}</span>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-black/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-current opacity-70 transition-all"
            style={{ width: `${Math.round(confidence * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs opacity-70">{Math.round(confidence * 100)}% confidence</p>
      </div>
    </div>
  );
}

function IntentStatusBadge({ status }: { status: TradeIntent['status'] }) {
  const map: Record<string, string> = {
    draft: 'bg-yellow-900/40 border-yellow-700 text-yellow-300',
    approved: 'bg-blue-900/40 border-blue-700 text-blue-300',
    queued: 'bg-purple-900/40 border-purple-700 text-purple-300',
    executed: 'bg-emerald-900/40 border-emerald-700 text-emerald-300',
    failed: 'bg-red-900/40 border-red-700 text-red-300',
    rejected: 'bg-red-900/30 border-red-800 text-red-400',
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${map[status] ?? map.rejected}`}>
      {status}
    </span>
  );
}

function RiskScore({ score, label }: { score: number; label: string }) {
  const color = score <= 3 ? '#22c55e' : score <= 5 ? '#eab308' : score <= 7 ? '#f97316' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10">
        <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(score / 10) * 94.2} 94.2`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      <div>
        <p className="text-xs text-zinc-400">Risk</p>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

function AlignmentDot({ align }: { align: string }) {
  if (align === 'aligned') return <span className="text-emerald-400 text-xs font-semibold">✓ Aligned</span>;
  if (align === 'against') return <span className="text-red-400 text-xs font-semibold">✗ Against</span>;
  return <span className="text-yellow-400 text-xs font-semibold">~ Neutral</span>;
}

function Panel({ title, children, onRefresh, lastUpdated, className = '' }: {
  title: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  lastUpdated?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-zinc-700/50 bg-[#0D0D14] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/40 bg-zinc-900/30">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{title}</h2>
        <div className="flex items-center gap-2">
          {lastUpdated && <span className="text-xs text-zinc-600">{ageLabel(lastUpdated)}</span>}
          {onRefresh && (
            <button onClick={onRefresh} className="text-zinc-600 hover:text-zinc-300 transition-colors p-1">
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Leg form types
// ============================================================================

interface LegForm { right: 'call' | 'put'; strike: string; side: 'buy' | 'sell'; qty: number; }

interface FormState {
  symbol: string;
  strategy_type: string;
  expiry: string;
  legs: LegForm[];
  pricing_policy: PricingPolicy;
  max_debit_usd: string;
  max_loss_usd: string;
  time_in_force: TimeInForce;
  mode: ExecutionMode;
}

const DEFAULT_LEG: LegForm = { right: 'call', strike: '', side: 'buy', qty: 1 };
const DEFAULT_FORM: FormState = {
  symbol: '', strategy_type: '', expiry: '',
  legs: [{ ...DEFAULT_LEG }],
  pricing_policy: 'mid', max_debit_usd: '', max_loss_usd: '',
  time_in_force: 'DAY', mode: 'paper',
};

const STRATEGIES = ['long_call', 'long_put', 'bull_call_spread', 'bear_put_spread',
  'iron_condor', 'straddle', 'strangle', 'covered_call', 'cash_secured_put'];

// ============================================================================
// Market Pulse Panel
// ============================================================================

function MarketPulsePanel({
  pulse, loading, onRefresh, onSignalClick,
}: {
  pulse: MarketPulse | null;
  loading: boolean;
  onRefresh: () => void;
  onSignalClick: (ticker: string) => void;
}) {
  return (
    <Panel title="Market Pulse" onRefresh={onRefresh} lastUpdated={pulse?.last_updated} className="h-full">
      {loading && !pulse ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        </div>
      ) : pulse ? (
        <>
          {/* Regime */}
          <div className={`rounded-lg border p-3 ${regimeBg(pulse.regime_label)}`}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black tracking-wider">{pulse.regime_label}</span>
              <span className="text-sm font-semibold opacity-80">{Math.round(pulse.regime_confidence * 100)}%</span>
            </div>
            <p className="mt-1 text-xs opacity-70 leading-relaxed">{pulse.regime_description}</p>
            <p className="mt-2 text-xs opacity-90 leading-relaxed font-medium">{pulse.regime_strategy_hint}</p>
          </div>

          {/* VIX */}
          <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fear Index (VIX)</span>
              <span className={`text-xl font-black ${vixColor(pulse.vix_level)}`}>
                {pulse.vix_value != null ? pulse.vix_value.toFixed(1) : '—'}
              </span>
            </div>
            <p className={`mt-1 text-xs ${vixColor(pulse.vix_level)}`}>{pulse.vix_interpretation}</p>
          </div>

          {/* Top signals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Top Signals</span>
              <span className="text-xs text-zinc-600">{pulse.total_active_signals} active</span>
            </div>
            <div className="space-y-1">
              {pulse.top_signals.length === 0 ? (
                <p className="text-xs text-zinc-600 italic">No active signals</p>
              ) : pulse.top_signals.map((sig) => (
                <button
                  key={sig.ticker}
                  onClick={() => onSignalClick(sig.ticker)}
                  className="w-full flex items-center gap-2 rounded-lg border border-zinc-700/30 bg-zinc-900/40 px-3 py-2 text-left hover:border-zinc-500 hover:bg-zinc-800/50 transition-all group"
                >
                  <span className={`text-xs font-mono font-bold w-12 ${sig.trend_bias === 'bullish' ? 'text-emerald-400' : sig.trend_bias === 'bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {sig.ticker}
                  </span>
                  {sig.trend_bias === 'bullish' ? <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" /> :
                   sig.trend_bias === 'bearish' ? <TrendingDown className="h-3 w-3 text-red-400 shrink-0" /> :
                   <Minus className="h-3 w-3 text-yellow-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="h-1 rounded-full bg-zinc-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sig.trend_bias === 'bullish' ? 'bg-emerald-500' : sig.trend_bias === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.round(sig.confidence * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 shrink-0">{Math.round(sig.confidence * 100)}%</span>
                  <ChevronRight className="h-3 w-3 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Signal bias summary */}
          <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/20 px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Overall signal bias</span>
            <span className={`text-xs font-bold uppercase ${
              pulse.signal_bias === 'bullish' ? 'text-emerald-400' :
              pulse.signal_bias === 'bearish' ? 'text-red-400' : 'text-yellow-400'
            }`}>{pulse.signal_bias}</span>
          </div>
        </>
      ) : (
        <p className="text-xs text-zinc-600 italic">Market pulse unavailable</p>
      )}
    </Panel>
  );
}

// ============================================================================
// AI Cockpit Panel
// ============================================================================

function AICockpitPanel({
  policy,
  onIntentCreated,
  initialTicker = '',
}: {
  policy: IBKRPolicy | null;
  onIntentCreated: () => void;
  initialTicker?: string;
}) {
  const [ticker, setTicker] = useState(initialTicker);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('medium');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const formRef = useRef<HTMLDivElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM, legs: [{ ...DEFAULT_LEG }] });
  const [preTradeAnalysis, setPreTradeAnalysis] = useState<TradeAnalysis | null>(null);
  const [runningPreTrade, setRunningPreTrade] = useState(false);
  const [confirming, setConfirming] = useState<TradeIntent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const canSubmit = !policy?.kill_switch_active && policy?.ibkr_enabled;
  const marketStatus = useMarketStatus();
  const expiryValidation = validateExpiry(form.expiry);
  const hasExpiryError = !!expiryValidation.error;

  useEffect(() => {
    if (initialTicker) setTicker(initialTicker);
  }, [initialTicker]);

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;
    setAnalyzing(true);
    setRecommendation(null);
    setPreTradeAnalysis(null);
    try {
      const rec = await getAIRecommendation(ticker.trim().toUpperCase(), timeHorizon, riskTolerance);
      setRecommendation(rec);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const useRecommendation = () => {
    if (!recommendation) return;
    setForm(f => ({
      ...f,
      symbol: recommendation.ticker,
      strategy_type: recommendation.signal_type || 'long_call',
      max_loss_usd: recommendation.stop_loss
        ? String(Math.round((recommendation.entry_zone_high || 0) - recommendation.stop_loss))
        : '',
      max_debit_usd: recommendation.entry_zone_high
        ? String(Math.round(recommendation.entry_zone_high))
        : '',
      legs: [{
        right: recommendation.trend_bias === 'bearish' ? 'put' : 'call',
        strike: recommendation.entry_zone_high ? String(Math.round(recommendation.entry_zone_high)) : '',
        side: recommendation.recommendation === 'SELL' ? 'sell' : 'buy',
        qty: 1,
      }],
    }));
    toast.success(`${recommendation.ticker} numbers applied — review the form below`);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const updateLeg = (i: number, field: keyof LegForm, val: string | number) => {
    setForm(f => ({ ...f, legs: f.legs.map((l, idx) => idx === i ? { ...l, [field]: val } : l) }));
  };

  const runPreTrade = async () => {
    if (!form.symbol.trim() || form.legs.length === 0) { toast.error('Fill in symbol and legs'); return; }
    setRunningPreTrade(true);
    try {
      const action = form.legs[0]?.side === 'sell' ? 'SELL' : 'BUY';
      const qty = form.legs.reduce((s, l) => s + l.qty, 0);
      const price = form.max_debit_usd ? parseFloat(form.max_debit_usd) : undefined;
      const analysis = await analyzeTradeIntent(form.symbol.trim().toUpperCase(), action, qty, price);
      setPreTradeAnalysis(analysis);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRunningPreTrade(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol.trim()) { toast.error('Symbol required'); return; }
    if (!form.strategy_type.trim()) { toast.error('Strategy required'); return; }
    if (form.legs.some(l => !l.strike || parseFloat(l.strike) <= 0)) { toast.error('All legs need a strike price'); return; }
    setSubmitting(true);
    try {
      const intent = await createIntent({
        symbol: form.symbol.trim().toUpperCase(),
        strategy_type: form.strategy_type.trim(),
        expiry: form.expiry || null,
        legs: form.legs.map(l => ({ right: l.right, strike: l.strike, side: l.side, qty: l.qty })),
        pricing_policy: form.pricing_policy,
        max_debit_usd: parseFloat(form.max_debit_usd) || 0,
        max_loss_usd: parseFloat(form.max_loss_usd) || 0,
        time_in_force: form.time_in_force,
        mode: form.mode,
      });
      toast.success('Intent created — approve it below');
      setConfirming(intent);
      setForm({ ...DEFAULT_FORM, legs: [{ ...DEFAULT_LEG }] });
      setPreTradeAnalysis(null);
      onIntentCreated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await approveIntent(id);
      toast.success('Intent approved and queued for execution');
      setConfirming(null);
      onIntentCreated();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setApprovingId(null);
    }
  };

  const preTradeColor = !preTradeAnalysis ? '' :
    preTradeAnalysis.risk_score <= 4 ? 'border-emerald-700 bg-emerald-950/30' :
    preTradeAnalysis.risk_score <= 6 ? 'border-yellow-700 bg-yellow-950/30' :
    'border-red-700 bg-red-950/30';

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* AI analysis */}
      <div className="rounded-xl border border-zinc-700/50 bg-[#0D0D14] overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-700/40 bg-zinc-900/30">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">AI Intelligence</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ticker — e.g. AAPL"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono uppercase text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-600"
            />
            <Button onClick={handleAnalyze} disabled={analyzing || !ticker.trim()} size="sm"
              className="gap-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
              {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Analyze
            </Button>
          </div>
          <div className="flex gap-2">
            {(['short', 'medium', 'long'] as TimeHorizon[]).map(h => (
              <button key={h} onClick={() => setTimeHorizon(h)}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold capitalize transition-colors ${timeHorizon === h ? 'border-yellow-600 bg-yellow-950/40 text-yellow-300' : 'border-zinc-700 bg-zinc-900/40 text-zinc-500 hover:border-zinc-500'}`}>
                {h}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['conservative', 'moderate', 'aggressive'] as RiskTolerance[]).map(r => (
              <button key={r} onClick={() => setRiskTolerance(r)}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold capitalize transition-colors ${riskTolerance === r ? 'border-yellow-600 bg-yellow-950/40 text-yellow-300' : 'border-zinc-700 bg-zinc-900/40 text-zinc-500 hover:border-zinc-500'}`}>
                {r}
              </button>
            ))}
          </div>

          {recommendation && (
            <div className="space-y-3 pt-1">
              <RecBadge rec={recommendation.recommendation} confidence={recommendation.confidence} />

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/30 p-2 text-center">
                  <p className="text-zinc-500 mb-0.5">Entry Zone</p>
                  <p className="font-bold text-white">
                    {recommendation.entry_zone_low ? `${fmt$(recommendation.entry_zone_low, 0)}` : '—'}
                    {recommendation.entry_zone_high ? `–${fmt$(recommendation.entry_zone_high, 0)}` : ''}
                  </p>
                </div>
                <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-2 text-center">
                  <p className="text-red-500 mb-0.5">Stop Loss</p>
                  <p className="font-bold text-red-300">{fmt$(recommendation.stop_loss, 0)}</p>
                </div>
                <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-2 text-center">
                  <p className="text-emerald-500 mb-0.5">Target</p>
                  <p className="font-bold text-emerald-300">{fmt$(recommendation.take_profit, 0)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Position size</span>
                <span className="text-white font-bold">{recommendation.position_size_pct.toFixed(1)}% of portfolio</span>
              </div>
              {recommendation.risk_reward_ratio && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Risk/Reward</span>
                  <span className="text-white font-bold">1:{recommendation.risk_reward_ratio.toFixed(1)}</span>
                </div>
              )}

              <button
                onClick={() => setReasoningOpen(v => !v)}
                className="flex w-full items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span>Reasoning</span>
                {reasoningOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {reasoningOpen && (
                <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-3 text-xs text-zinc-400 leading-relaxed space-y-2">
                  <p>{recommendation.reasoning}</p>
                  {recommendation.key_risks.length > 0 && (
                    <ul className="space-y-1">
                      {recommendation.key_risks.map((r, i) => (
                        <li key={i} className="flex gap-1.5"><AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <Button onClick={useRecommendation} size="sm" variant="outline"
                className="w-full border-yellow-700 text-yellow-300 hover:bg-yellow-950/40 hover:border-yellow-500 text-xs">
                Use These Numbers →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pending approval card */}
      {confirming && (
        <div className="rounded-xl border border-blue-700 bg-blue-950/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-sm font-semibold text-blue-300">Intent Created — Approval Required</span>
          </div>
          <div className="text-xs text-zinc-400 space-y-1">
            <div className="flex justify-between"><span>Symbol</span><span className="text-white font-mono">{confirming.symbol}</span></div>
            <div className="flex justify-between"><span>Strategy</span><span className="text-white">{confirming.strategy_type}</span></div>
            <div className="flex justify-between"><span>Mode</span><span className="text-white capitalize">{confirming.mode}</span></div>
            <div className="flex justify-between"><span>Max Debit</span><span className="text-white">${confirming.max_debit_usd}</span></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setConfirming(null)} size="sm" variant="ghost" className="flex-1 text-zinc-400 text-xs">
              Dismiss
            </Button>
            <Button onClick={() => handleApprove(confirming.id)} size="sm" disabled={!!approvingId}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1">
              {approvingId ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Approve &amp; Queue
            </Button>
          </div>
        </div>
      )}

      {/* Trade form */}
      <div ref={formRef} className="rounded-xl border border-zinc-700/50 bg-[#0D0D14] overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-700/40 bg-zinc-900/30">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">New Trade Intent</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs text-zinc-500">Symbol</label>
              <input required type="text" placeholder="AAPL"
                value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono uppercase text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs text-zinc-500">Strategy</label>
              <input required list="strategy-list" type="text" placeholder="long_call"
                value={form.strategy_type} onChange={e => setForm(f => ({ ...f, strategy_type: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
              <datalist id="strategy-list">{STRATEGIES.map(s => <option key={s} value={s} />)}</datalist>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Expiry <span className="text-zinc-600">(required for options)</span></label>
            <input required type="date" value={form.expiry}
              onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
              className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-600 [color-scheme:dark] ${expiryValidation.error ? 'border-red-500/70' : 'border-zinc-700'}`} />
            {expiryValidation.error && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertTriangle className="h-3 w-3 shrink-0" />{expiryValidation.error}
              </p>
            )}
            {!expiryValidation.error && expiryValidation.warning && (
              <p className="flex items-center gap-1 text-xs text-amber-400">
                <AlertTriangle className="h-3 w-3 shrink-0" />{expiryValidation.warning}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Mode</label>
              <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value as ExecutionMode }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-600">
                <option value="paper">Paper</option>
                <option value="live" disabled={!policy?.live_trading_enabled}>Live</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Pricing</label>
              <select value={form.pricing_policy} onChange={e => setForm(f => ({ ...f, pricing_policy: e.target.value as PricingPolicy }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-600">
                <option value="mid">Mid</option><option value="mark">Mark</option><option value="manual">Manual</option><option value="market">Market Order</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">TIF</label>
              <select value={form.time_in_force} onChange={e => setForm(f => ({ ...f, time_in_force: e.target.value as TimeInForce }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-600">
                <option value="DAY">DAY</option><option value="GTC">GTC</option><option value="IOC">IOC</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500">Legs</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, legs: [...f.legs, { ...DEFAULT_LEG }] }))}
                className="flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-300 transition-colors">
                <Plus className="h-3 w-3" /> Add Leg
              </button>
            </div>
            {form.legs.map((leg, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-1.5 items-center">
                <select value={leg.right} onChange={e => updateLeg(i, 'right', e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-600">
                  <option value="call">Call</option><option value="put">Put</option>
                </select>
                <input required type="number" min={0.5} step={0.5} placeholder="Strike"
                  value={leg.strike} onChange={e => updateLeg(i, 'strike', e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
                <select value={leg.side} onChange={e => updateLeg(i, 'side', e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-600">
                  <option value="buy">Buy</option><option value="sell">Sell</option>
                </select>
                <input required type="number" min={1} step={1} value={leg.qty}
                  onChange={e => updateLeg(i, 'qty', parseInt(e.target.value) || 1)}
                  className="w-12 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-600" />
                <button type="button" onClick={() => setForm(f => ({ ...f, legs: f.legs.filter((_, idx) => idx !== i) }))}
                  disabled={form.legs.length === 1}
                  className="text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Max Debit USD</label>
              <input required type="number" min={0} step={0.01} placeholder="0.00"
                value={form.max_debit_usd} onChange={e => setForm(f => ({ ...f, max_debit_usd: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Max Loss USD</label>
              <input required type="number" min={0} step={0.01} placeholder="0.00"
                value={form.max_loss_usd} onChange={e => setForm(f => ({ ...f, max_loss_usd: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
            </div>
          </div>

          {/* Pre-trade analysis */}
          {preTradeAnalysis && (
            <div className={`rounded-lg border p-3 space-y-2 ${preTradeColor}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Pre-Trade Analysis</span>
                <RiskScore score={preTradeAnalysis.risk_score} label={preTradeAnalysis.risk_label} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500">Signal</span><AlignmentDot align={preTradeAnalysis.signal_alignment} /></div>
                <div className="flex justify-between"><span className="text-zinc-500">Regime</span><AlignmentDot align={preTradeAnalysis.regime_alignment} /></div>
                {preTradeAnalysis.position_size_pct != null && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-zinc-500">Position size</span>
                    <span className={preTradeAnalysis.concentration_warning ? 'text-orange-400 font-bold' : 'text-white'}>
                      {preTradeAnalysis.position_size_pct.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              {preTradeAnalysis.warnings.length > 0 && (
                <ul className="space-y-0.5">
                  {preTradeAnalysis.warnings.map((w, i) => (
                    <li key={i} className="flex gap-1.5 text-xs text-orange-300">
                      <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-orange-500" />{w}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-zinc-300 italic">{preTradeAnalysis.recommendation}</p>
            </div>
          )}

          {/* Market status banner */}
          {!marketStatus.isOpen && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Market closed — {marketStatus.reason}
              </div>
              <p className="text-xs text-amber-300/70">{marketStatus.nextOpenLabel}. Market orders will queue and fill at open; limit orders require data subscription to fill.</p>
            </div>
          )}
          {marketStatus.isOpen && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Market open · {marketStatus.nextOpenLabel}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={runPreTrade} disabled={runningPreTrade}
              className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800 text-xs gap-1">
              {runningPreTrade ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
              Analyze Risk
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !canSubmit || hasExpiryError}
              className="flex-1 text-xs font-bold gap-1" style={{ backgroundColor: GOLD, color: '#0A0A0F' }}>
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              Create Intent
            </Button>
          </div>
          {!canSubmit && (
            <p className="text-xs text-zinc-600 text-center">
              {policy?.kill_switch_active ? 'Kill switch active — execution blocked' : 'IBKR integration disabled'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Portfolio & Activity Panel
// ============================================================================

function PortfolioPanel({
  snapshot,
  intents,
  loadingSnapshot,
  loadingIntents,
  onRefreshSnapshot,
  onRefreshIntents,
  onApprove,
  approvingId,
}: {
  snapshot: PortfolioSnapshot | null;
  intents: TradeIntent[];
  loadingSnapshot: boolean;
  loadingIntents: boolean;
  onRefreshSnapshot: () => void;
  onRefreshIntents: () => void;
  onApprove: (id: string) => void;
  approvingId: string | null;
}) {
  const [intentsOpen, setIntentsOpen] = useState(true);
  const [expandedIntentId, setExpandedIntentId] = useState<string | null>(null);
  const [intentFilter, setIntentFilter] = useState<'all' | 'active' | 'executed' | 'failed'>('all');

  const filteredIntents = intents.filter(i => {
    if (intentFilter === 'active') return ['draft', 'approved', 'queued'].includes(i.status);
    if (intentFilter === 'executed') return i.status === 'executed';
    if (intentFilter === 'failed') return ['failed', 'cancelled', 'rejected'].includes(i.status);
    return true;
  });

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Portfolio snapshot */}
      <Panel title="Portfolio" onRefresh={onRefreshSnapshot} lastUpdated={snapshot?.last_updated} className="">
        {loadingSnapshot && !snapshot ? (
          <div className="flex items-center justify-center h-24"><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></div>
        ) : snapshot ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/30 p-3">
                <p className="text-xs text-zinc-500">Total Value</p>
                <p className="text-lg font-black text-white">{fmt$(snapshot.total_value, 0)}</p>
                <p className={`text-xs font-semibold ${snapshot.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmtPct(snapshot.total_pnl_pct)} all-time
                </p>
              </div>
              <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/30 p-3">
                <p className="text-xs text-zinc-500">Cash</p>
                <p className="text-lg font-black text-white">{fmt$(snapshot.cash, 0)}</p>
                <p className="text-xs text-zinc-600">{fmt$(snapshot.invested_value, 0)} invested</p>
              </div>
            </div>

            {snapshot.risk_alerts.length > 0 && (
              <div className="rounded-lg border border-orange-800 bg-orange-950/30 px-3 py-2 space-y-1">
                {snapshot.risk_alerts.map((a, i) => (
                  <p key={i} className="flex gap-1.5 text-xs text-orange-300">
                    <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-orange-500" />{a}
                  </p>
                ))}
              </div>
            )}

            {snapshot.holdings.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Holdings</p>
                <div className="space-y-1">
                  {snapshot.holdings.slice(0, 8).map(h => (
                    <div key={h.ticker} className="flex items-center gap-2 text-xs py-1 border-b border-zinc-700/20 last:border-0">
                      <span className="font-mono font-bold text-white w-16 shrink-0 truncate">{h.ticker}</span>
                      <div className="flex-1 min-w-0">
                        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full rounded-full bg-zinc-600" style={{ width: `${Math.min(h.weight_pct, 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-zinc-400 w-12 text-right shrink-0">{h.weight_pct.toFixed(0)}%</span>
                      <span className={`w-14 text-right shrink-0 font-semibold ${h.unrealized_pnl_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmtPct(h.unrealized_pnl_pct, 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {snapshot.holdings.length === 0 && (
              <p className="text-xs text-zinc-600 italic">No open positions</p>
            )}
          </>
        ) : (
          <p className="text-xs text-zinc-600 italic">Portfolio data unavailable</p>
        )}
      </Panel>

      {/* Intent history */}
      <div className="rounded-xl border border-zinc-700/50 bg-[#0D0D14] overflow-hidden">
        <button
          onClick={() => setIntentsOpen(v => !v)}
          className="flex w-full items-center justify-between px-4 py-3 border-b border-zinc-700/40 bg-zinc-900/30 hover:bg-zinc-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Intent History</span>
            {loadingIntents && <Loader2 className="h-3 w-3 animate-spin text-zinc-600" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">{filteredIntents.length}{intentFilter !== 'all' && `/${intents.length}`}</span>
            <button onClick={e => { e.stopPropagation(); onRefreshIntents(); }} className="text-zinc-600 hover:text-zinc-300 p-0.5">
              <RefreshCw className="h-3 w-3" />
            </button>
            {intentsOpen ? <ChevronUp className="h-3 w-3 text-zinc-500" /> : <ChevronDown className="h-3 w-3 text-zinc-500" />}
          </div>
        </button>

        {intentsOpen && (
          <div>
            <div className="flex gap-1 px-3 py-2 border-b border-zinc-700/30 bg-zinc-900/20">
              {(['all', 'active', 'executed', 'failed'] as const).map(f => (
                <button key={f} onClick={() => setIntentFilter(f)}
                  className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${intentFilter === f ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {f}
                </button>
              ))}
            </div>
          <div className="divide-y divide-zinc-700/20 max-h-80 overflow-y-auto">
            {filteredIntents.length === 0 ? (
              <p className="px-4 py-6 text-xs text-zinc-600 italic text-center">{intents.length === 0 ? 'No intents yet' : `No ${intentFilter} intents`}</p>
            ) : filteredIntents.map(intent => (
              <div key={intent.id} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-white">{intent.symbol}</span>
                  <span className="text-xs text-zinc-500">{intent.strategy_type}</span>
                  <IntentStatusBadge status={intent.status} />
                  <button onClick={() => setExpandedIntentId(id => id === intent.id ? null : intent.id)}
                    className="ml-auto text-zinc-600 hover:text-zinc-300 transition-colors">
                    {expandedIntentId === intent.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">{new Date(intent.created_at).toLocaleString()}</p>

                {expandedIntentId === intent.id && (
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 space-y-1">
                      <div className="flex justify-between"><span className="text-zinc-500">Mode</span><span className="text-white capitalize">{intent.mode}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Max Debit</span><span className="text-white">${intent.max_debit_usd}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Max Loss</span><span className="text-white">${intent.max_loss_usd}</span></div>
                      {intent.rejection_reason && (
                        <div className="text-red-400">Rejected: {intent.rejection_reason}</div>
                      )}
                    </div>
                    {intent.status === 'draft' && (
                      <Button size="sm" onClick={() => onApprove(intent.id)} disabled={!!approvingId}
                        className="w-full text-xs font-bold gap-1 bg-blue-600 hover:bg-blue-500 text-white">
                        {approvingId === intent.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                        Approve &amp; Queue
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main page
// ============================================================================

export default function FounderTradingPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<IBKRPolicy | null>(null);
  const [pulse, setPulse] = useState<MarketPulse | null>(null);
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
  const [intents, setIntents] = useState<TradeIntent[]>([]);
  const [loadingPulse, setLoadingPulse] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [loadingIntents, setLoadingIntents] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [tickerForAnalysis, setTickerForAnalysis] = useState('');

  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshPulse = useCallback(async () => {
    setLoadingPulse(true);
    try { setPulse(await getMarketPulse()); } catch { /* silent */ } finally { setLoadingPulse(false); }
  }, []);

  const refreshSnapshot = useCallback(async () => {
    setLoadingSnapshot(true);
    try { setSnapshot(await getPortfolioSnapshot()); } catch { /* silent */ } finally { setLoadingSnapshot(false); }
  }, []);

  const refreshIntents = useCallback(async () => {
    setLoadingIntents(true);
    try { setIntents(await getMyIntents()); } catch { /* silent */ } finally { setLoadingIntents(false); }
  }, []);

  // Token keep-alive — proactively refreshes the JWT before the 15-min expiry
  // so the data timers never hit a stale-token 401.
  useEffect(() => {
    if (!authorized) return;
    const tokenTimer = setInterval(() => {
      getCurrentUser().catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(tokenTimer);
  }, [authorized]);

  // Auto-refresh timers
  useEffect(() => {
    if (!authorized) return;
    pulseTimerRef.current = setInterval(refreshPulse, 60_000);
    snapshotTimerRef.current = setInterval(refreshSnapshot, 120_000);
    intentsTimerRef.current = setInterval(refreshIntents, 30_000);
    return () => {
      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
      if (snapshotTimerRef.current) clearInterval(snapshotTimerRef.current);
      if (intentsTimerRef.current) clearInterval(intentsTimerRef.current);
    };
  }, [authorized, refreshPulse, refreshSnapshot, refreshIntents]);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!user.is_founder) { router.replace('/app/dashboard'); return; }
        setAuthorized(true);
      } catch {
        router.replace('/auth/login');
        return;
      } finally {
        setLoading(false);
      }
      // Non-blocking parallel data load
      await Promise.allSettled([
        getIBKRPolicy().then(setPolicy).catch(() => {}),
        refreshPulse(),
        refreshSnapshot(),
        refreshIntents(),
      ]);
    })();
  }, [router, refreshPulse, refreshSnapshot, refreshIntents]);

  const handleApprove = useCallback(async (id: string) => {
    setApprovingId(id);
    try {
      await approveIntent(id);
      toast.success('Intent approved and queued');
      await refreshIntents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setApprovingId(null);
    }
  }, [refreshIntents]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-500 animate-pulse" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Loading console…</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  // High-confidence signal alert
  const hotSignal = pulse?.top_signals.find(s => s.confidence >= 0.80);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-zinc-700/50 bg-[#0A0A0F]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1600px] px-4 py-2.5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h1 className="text-sm font-black tracking-tight text-white">Trading Console</h1>
            <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ borderColor: GOLD, color: GOLD }}>Founder</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {policy ? (
              <>
                <Pill label={policy.kill_switch_active ? 'KILL SWITCH ON' : 'Kill switch off'} active={!policy.kill_switch_active} />
                <Pill label={`${policy.execution_mode} mode`} active={true} color={policy.execution_mode === 'live' ? '#f97316' : '#3b82f6'} />
                <Pill label={policy.ibkr_enabled ? 'IBKR on' : 'IBKR off'} active={policy.ibkr_enabled} />
              </>
            ) : (
              <span className="text-xs text-zinc-600">Loading policy…</span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-600 hidden sm:block">Personal use · Paper trading · Educational only</span>
            <button onClick={() => { refreshPulse(); refreshSnapshot(); refreshIntents(); }}
              className="text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 rounded-lg hover:bg-zinc-800">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* High-confidence signal alert */}
        {hotSignal && (
          <div className="border-t border-yellow-800/50 bg-yellow-950/40 px-4 py-1.5 flex items-center gap-2">
            <Zap className="h-3 w-3 text-yellow-400 shrink-0" />
            <span className="text-xs text-yellow-300 font-semibold">
              High-confidence signal: {hotSignal.ticker} {hotSignal.trend_bias === 'bullish' ? 'Bullish' : 'Bearish'} ({Math.round(hotSignal.confidence * 100)}%)
            </span>
            <button onClick={() => setTickerForAnalysis(hotSignal.ticker)}
              className="ml-auto text-xs text-yellow-400 hover:text-yellow-200 transition-colors underline">
              Analyze →
            </button>
          </div>
        )}
      </div>

      {/* 3-panel cockpit */}
      <div className="mx-auto max-w-[1600px] px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[28%_42%_30%] gap-4 min-h-[calc(100vh-120px)]">
          {/* Panel 1: Market Pulse */}
          <MarketPulsePanel
            pulse={pulse}
            loading={loadingPulse}
            onRefresh={refreshPulse}
            onSignalClick={setTickerForAnalysis}
          />

          {/* Panel 2: AI Cockpit */}
          <AICockpitPanel
            policy={policy}
            onIntentCreated={refreshIntents}
            initialTicker={tickerForAnalysis}
          />

          {/* Panel 3: Portfolio & Activity */}
          <PortfolioPanel
            snapshot={snapshot}
            intents={intents}
            loadingSnapshot={loadingSnapshot}
            loadingIntents={loadingIntents}
            onRefreshSnapshot={refreshSnapshot}
            onRefreshIntents={refreshIntents}
            onApprove={handleApprove}
            approvingId={approvingId}
          />
        </div>
      </div>
    </div>
  );
}
