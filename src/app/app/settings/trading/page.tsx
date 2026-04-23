'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getTradingPreferences,
  updateTradingPreferences,
  type TradingPreferences,
} from '@/lib/api/signals';

const BROKERS = [
  { value: '', label: 'Not set' },
  { value: 'robinhood', label: 'Robinhood' },
  { value: 'webull', label: 'Webull' },
  { value: 'alpaca', label: 'Alpaca' },
  { value: 'td_ameritrade', label: 'TD Ameritrade' },
  { value: 'fidelity', label: 'Fidelity' },
  { value: 'ibkr', label: 'Interactive Brokers' },
  { value: 'other', label: 'Other' },
];

const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservative', desc: 'Smaller position sizes, higher confidence threshold' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced approach — default' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Larger positions, lower confidence threshold' },
];

export default function TradingPreferencesPage() {
  const [prefs, setPrefs] = useState<TradingPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local form state
  const [broker, setBroker] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [maxPositionPct, setMaxPositionPct] = useState(5);
  const [minConfidence, setMinConfidence] = useState(65);
  const [alertEmail, setAlertEmail] = useState(false);
  const [alertPush, setAlertPush] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTradingPreferences();
        setPrefs(data);
        setBroker(data.preferred_broker ?? '');
        setRiskTolerance(data.risk_tolerance);
        setMaxPositionPct(data.max_position_pct);
        setMinConfidence(Math.round(data.min_confidence_threshold * 100));
        setAlertEmail(data.alert_email);
        setAlertPush(data.alert_push);
        // Mirror broker to localStorage for deep-link use in signal detail page
        localStorage.setItem('ssb_preferred_broker', data.preferred_broker ?? '');
      } catch {
        // Use defaults if no prefs saved yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateTradingPreferences({
        preferred_broker: broker || null,
        risk_tolerance: riskTolerance,
        max_position_pct: maxPositionPct,
        min_confidence_threshold: minConfidence / 100,
        alert_email: alertEmail,
        alert_push: alertPush,
      });
      localStorage.setItem('ssb_preferred_broker', broker);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trading Preferences</h1>
            <p className="text-sm text-muted-foreground">
              Personalise how SSB surfaces signals for you
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-xs text-amber-900 dark:text-amber-200">
              SSB signals are for informational and educational purposes only. These preferences
              personalise your experience — they do not constitute or constitute financial advice.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Preferred broker */}
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">Preferred Broker</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Used to generate a quick deep-link from signal pages. SSB never connects to your broker account.
            </p>
            <select
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              aria-label="Preferred broker"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto sm:min-w-[200px]"
            >
              {BROKERS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </section>

          {/* Risk tolerance */}
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">Risk Tolerance Profile</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Used to calibrate position-sizing suggestions shown alongside signals.
            </p>
            <div className="space-y-2">
              {RISK_PROFILES.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    riskTolerance === r.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="risk-tolerance"
                    value={r.value}
                    checked={riskTolerance === r.value}
                    onChange={() => setRiskTolerance(r.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Position size cap */}
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">Max Position Size</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Hard cap for position-sizing suggestions (% of portfolio). SSB will never suggest
              exceeding this threshold.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={maxPositionPct}
                onChange={(e) => setMaxPositionPct(Number(e.target.value))}
                aria-label="Maximum position size percentage"
                className="h-9 w-24 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">% of portfolio</span>
            </div>
          </section>

          {/* Signal confidence threshold */}
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">Minimum Signal Confidence</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Hide signals below this confidence threshold. Default: 65%.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                aria-label="Minimum confidence threshold"
                className="flex-1"
              />
              <span className="w-12 text-sm font-medium text-right tabular-nums">{minConfidence}%</span>
            </div>
          </section>

          {/* Alert preferences */}
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">Signal Alerts</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Receive notifications when a new signal exceeds your confidence threshold for a
              watchlisted asset.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Email alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertPush}
                  onChange={(e) => setAlertPush(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Push notifications</span>
              </label>
            </div>
          </section>

          {/* Save */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
              {saving ? 'Saving…' : 'Save Preferences'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
