'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient, getErrorMessage } from '@/lib/api-client';

interface RegimeIndicators {
  trend_score: number;
  volatility_percentile: number;
  breadth_score: number;
  macro_alignment?: number;
  vix_level?: number;
  yield_curve_slope?: number;
}

interface Explanation {
  summary: string;
  key_factors: string[];
  model_info: {
    model_type: string;
    version: string;
    training_period?: string;
    assumptions: string[];
  };
  limitations: string[];
}

interface RegimeData {
  regime: string;
  regime_probabilities: Record<string, number>;
  confidence: number;
  analysis_date: string;
  data_as_of: string;
  delay_applied_days: number;
  indicators: RegimeIndicators;
  explanation: Explanation;
  tier: string;
}

export default function RegimePage() {
  const router = useRouter();
  const [data, setData] = useState<RegimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegimeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/intelligence/v2/regime', {
        params: { symbol: 'SPY', lookback_days: 200 },
      });
      setData(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = getErrorMessage(err);

      if (status === 401 || status === 403) {
        toast.error('Please sign in to continue');
        router.push('/auth/login');
        return;
      }

      setError(message || 'Failed to load regime data');
      toast.error(message || 'Failed to load regime data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegimeData();
  }, []);

  const getRegimeColor = (regime: string) => {
    const colors: Record<string, string> = {
      bull: 'bg-green-100 text-green-800 border-green-200',
      bear: 'bg-red-100 text-red-800 border-red-200',
      sideways: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high_volatility: 'bg-orange-100 text-orange-800 border-orange-200',
      low_volatility: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[regime] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTrendIcon = (score: number) => {
    if (score > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading regime analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to Load Data</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={fetchRegimeData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Regime Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Current market conditions and regime classification
          </p>
        </div>
        <Button
          onClick={fetchRegimeData}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Regime header card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border capitalize ${getRegimeColor(
                  data.regime
                )}`}
              >
                {data.regime.replace('_', ' ')} Market
              </span>
              {data.delay_applied_days > 0 && (
                <span className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                  {data.delay_applied_days}-day delay
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <span className="font-semibold">
                {(data.confidence * 100).toFixed(0)}%
              </span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${data.confidence * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              {data.explanation.summary}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Analysis as of:{' '}
              <span className="font-medium text-foreground">
                {new Date(data.analysis_date).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </span>
            </p>
            <p>
              Tier:{' '}
              <span className="font-medium text-foreground capitalize">
                {data.tier}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regime probabilities */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Regime Probabilities</h3>
          <div className="space-y-3">
            {Object.entries(data.regime_probabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([regime, probability]) => (
                <div key={regime} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{regime.replace('_', ' ')}</span>
                    <span className="font-medium">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        regime === data.regime ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                      style={{ width: `${probability * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Technical indicators */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Technical Indicators</h3>
          <div className="space-y-4">
            {/* Trend Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(data.indicators.trend_score)}
                <span className="text-sm text-muted-foreground">Trend Score</span>
              </div>
              <span className="text-sm font-medium">
                {data.indicators.trend_score > 0 ? '+' : ''}
                {data.indicators.trend_score.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  data.indicators.trend_score > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${((data.indicators.trend_score + 1) / 2) * 100}%`,
                }}
              />
            </div>

            {/* Volatility */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Volatility Percentile
              </span>
              <span className="text-sm font-medium">
                {data.indicators.volatility_percentile}th
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  data.indicators.volatility_percentile > 70
                    ? 'bg-red-500'
                    : data.indicators.volatility_percentile > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${data.indicators.volatility_percentile}%` }}
              />
            </div>

            {/* Market Breadth */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">Market Breadth</span>
              <span className="text-sm font-medium">
                {(data.indicators.breadth_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  data.indicators.breadth_score > 0.6
                    ? 'bg-green-500'
                    : data.indicators.breadth_score > 0.4
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${data.indicators.breadth_score * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Macro indicators */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Macro Indicators</h3>
          <div className="space-y-4">
            {data.indicators.vix_level !== undefined && (
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium">VIX Level</p>
                  <p className="text-xs text-muted-foreground">Volatility Index</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      data.indicators.vix_level > 30
                        ? 'text-red-600'
                        : data.indicators.vix_level > 20
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {data.indicators.vix_level.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.indicators.vix_level > 30
                      ? 'High Fear'
                      : data.indicators.vix_level > 20
                        ? 'Moderate'
                        : 'Low Fear'}
                  </p>
                </div>
              </div>
            )}

            {data.indicators.yield_curve_slope !== undefined && (
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Yield Curve (10Y-2Y)</p>
                  <p className="text-xs text-muted-foreground">Treasury Spread</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      data.indicators.yield_curve_slope < 0
                        ? 'text-red-600'
                        : data.indicators.yield_curve_slope < 0.5
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {data.indicators.yield_curve_slope > 0 ? '+' : ''}
                    {data.indicators.yield_curve_slope.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.indicators.yield_curve_slope < 0
                      ? 'Inverted'
                      : data.indicators.yield_curve_slope < 0.5
                        ? 'Flat'
                        : 'Normal'}
                  </p>
                </div>
              </div>
            )}

            {data.indicators.vix_level === undefined &&
              data.indicators.yield_curve_slope === undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Macro indicators not available</span>
                </div>
              )}
          </div>
        </div>

        {/* Key factors */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Key Factors</h3>
          <ul className="space-y-3">
            {data.explanation.key_factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <span className="text-sm">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Model info */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Model Information</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Model Type</p>
            <p className="font-medium">{data.explanation.model_info.model_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-medium">{data.explanation.model_info.version}</p>
          </div>
        </div>
        {data.explanation.limitations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Limitations:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {data.explanation.limitations.map((limitation, index) => (
                <li key={index}>• {limitation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
