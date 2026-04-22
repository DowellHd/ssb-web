'use client';

import { useEffect, useState } from 'react';
import { Shield, RefreshCw, AlertCircle, TrendingDown, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyzePortfolioRisk, getIntelligenceEntitlements, type RiskReport, type EntitlementsInfo } from '@/lib/api/intelligence';
import { ViewModeToggle, ViewModeBadge } from '@/components/ui/view-mode-toggle';
import { useIsLongTerm } from '@/stores/view-mode-store';
import { LongTermRiskFraming } from '@/components/regime/long-term-insights';

export default function RiskPage() {
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbols, setSymbols] = useState('SPY,QQQ,IWM');
  const isLongTerm = useIsLongTerm();

  useEffect(() => {
    getIntelligenceEntitlements()
      .then(setEntitlements)
      .catch(() => {});
  }, []);

  const analyzeRisk = async () => {
    setLoading(true);
    setError(null);
    setRiskReport(null);
    try {
      const symbolList = symbols
        .split(',')
        .map(s => s.trim().toUpperCase().replace(/[^A-Z0-9.]/g, ''))
        .filter(s => s.length > 0 && s.length <= 10);

      if (symbolList.length === 0) {
        setError('Please enter at least one valid symbol');
        setLoading(false);
        return;
      }

      if (symbolList.length > 50) {
        setError('Maximum 50 symbols allowed');
        setLoading(false);
        return;
      }

      const weight = 1 / symbolList.length;
      const holdings = symbolList.map(symbol => ({
        symbol,
        weight,
        asset_class: 'us_equities',
      }));

      const report = await analyzePortfolioRisk(holdings);

      // Validate response has required fields
      if (!report || typeof report !== 'object') {
        setError('Invalid response from server');
        return;
      }

      setRiskReport(report);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to analyze portfolio risk';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string | undefined | null) => {
    if (!level) return 'text-slate-600 bg-slate-100';
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'extreme': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-slate-800">
        <strong>Disclaimer:</strong> Risk metrics are model estimates for informational purposes only.
        They do not constitute investment advice or recommendations. Always do your own research.
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="h-7 w-7 text-green-600" />
              Risk Analytics
            </h1>
            <ViewModeBadge />
          </div>
          <p className="text-muted-foreground mt-1">
            Analyze portfolio risk metrics including VaR, volatility, and risk attribution.
          </p>
        </div>
        <ViewModeToggle />
      </div>

      {/* Long-term risk framing (only in long-term mode) */}
      {isLongTerm && <LongTermRiskFraming />}

      {/* Input form */}
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="symbols">Portfolio Symbols (comma-separated)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="symbols"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
                placeholder="SPY, QQQ, IWM"
                className="flex-1"
              />
              <Button onClick={analyzeRisk} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Risk
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Equal-weighted portfolio will be analyzed. Analytics level: {entitlements?.risk_analytics_level || 'basic'}
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {riskReport && (
        <div className="space-y-6">
          {/* Risk Level Banner */}
          <div className={`rounded-lg p-6 ${getRiskLevelColor(riskReport.risk_level)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Overall Risk Level</p>
                <p className="text-3xl font-bold capitalize">{riskReport.risk_level || 'Unknown'}</p>
              </div>
              <Shield className="h-12 w-12 opacity-50" />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Annual Volatility</p>
              </div>
              <p className="text-2xl font-bold">
                {riskReport.risk_metrics?.volatility_annual != null
                  ? `${(riskReport.risk_metrics.volatility_annual * 100).toFixed(1)}%`
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">VaR (95%, 1-day)</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {riskReport.risk_metrics?.var_95_1day_pct != null
                  ? `${(riskReport.risk_metrics.var_95_1day_pct * 100).toFixed(2)}%`
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Max Drawdown</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {riskReport.risk_metrics?.max_drawdown_historical != null
                  ? `${(riskReport.risk_metrics.max_drawdown_historical * 100).toFixed(1)}%`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Advanced Metrics (Pro+) */}
          {riskReport.risk_metrics && (riskReport.risk_metrics.sharpe_ratio != null ||
            riskReport.risk_metrics.sortino_ratio != null) && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Risk-Adjusted Returns</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {riskReport.risk_metrics.sharpe_ratio != null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                    <p className="text-xl font-bold">
                      {riskReport.risk_metrics.sharpe_ratio.toFixed(2)}
                    </p>
                  </div>
                )}
                {riskReport.risk_metrics.sortino_ratio != null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sortino Ratio</p>
                    <p className="text-xl font-bold">
                      {riskReport.risk_metrics.sortino_ratio.toFixed(2)}
                    </p>
                  </div>
                )}
                {riskReport.risk_metrics.beta_to_benchmark != null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Beta to SPY</p>
                    <p className="text-xl font-bold">
                      {riskReport.risk_metrics.beta_to_benchmark.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Explanation */}
          {riskReport.explanation && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-3">Analysis Summary</h3>
              <p className="text-muted-foreground mb-4">{riskReport.explanation.summary}</p>

              {riskReport.explanation.key_factors && riskReport.explanation.key_factors.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Key Factors:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {riskReport.explanation.key_factors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {riskReport.explanation.limitations && riskReport.explanation.limitations.length > 0 && (
                <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
                  <p className="font-medium mb-1">Limitations:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {riskReport.explanation.limitations.map((limitation, i) => (
                      <li key={i}>{limitation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
            <span>Analysis Date: {new Date(riskReport.analysis_date).toLocaleString()}</span>
            <span>Holdings: {riskReport.holdings_count}</span>
            <span>Tier: {riskReport.tier}</span>
            <span>Analytics: {riskReport.analytics_level}</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !riskReport && (
        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Analyze Your Portfolio</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Enter stock symbols above and click &quot;Analyze Risk&quot; to calculate
            portfolio risk metrics including VaR, volatility, and drawdown analysis.
          </p>
        </div>
      )}
    </div>
  );
}
