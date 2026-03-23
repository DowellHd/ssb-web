'use client';

import { useState } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  screenStocks,
  type ScreenerCriterion,
  type ScreenerResult,
  type ScreeningResponse,
} from '@/lib/api/analytics';
import { cn } from '@/lib/utils';

// ============================================================================
// Preset criteria
// ============================================================================

const PRESET_SCREENS = [
  {
    label: 'Value Stocks',
    criteria: [
      { field: 'pe_ratio', operator: 'lt' as const, value: 15 },
      { field: 'pb_ratio', operator: 'lt' as const, value: 1.5 },
    ],
  },
  {
    label: 'Growth Stocks',
    criteria: [
      { field: 'revenue_growth_yoy', operator: 'gt' as const, value: 0.20 },
      { field: 'earnings_growth_yoy', operator: 'gt' as const, value: 0.15 },
    ],
  },
  {
    label: 'Quality / Profitability',
    criteria: [
      { field: 'roe', operator: 'gt' as const, value: 0.15 },
      { field: 'net_margin', operator: 'gt' as const, value: 0.10 },
      { field: 'debt_to_equity', operator: 'lt' as const, value: 1.0 },
    ],
  },
  {
    label: 'High Dividend',
    criteria: [
      { field: 'dividend_yield', operator: 'gt' as const, value: 0.03 },
      { field: 'pe_ratio', operator: 'lt' as const, value: 25 },
    ],
  },
];

// ============================================================================
// Field catalog (subset — matches backend SUPPORTED_FIELDS)
// ============================================================================

const FIELD_OPTIONS = [
  { value: 'pe_ratio',             label: 'P/E Ratio' },
  { value: 'forward_pe',           label: 'Forward P/E' },
  { value: 'pb_ratio',             label: 'P/B Ratio' },
  { value: 'ps_ratio',             label: 'P/S Ratio' },
  { value: 'ev_ebitda',            label: 'EV/EBITDA' },
  { value: 'dividend_yield',       label: 'Dividend Yield' },
  { value: 'roe',                  label: 'Return on Equity' },
  { value: 'roa',                  label: 'Return on Assets' },
  { value: 'net_margin',           label: 'Net Margin' },
  { value: 'operating_margin',     label: 'Operating Margin' },
  { value: 'revenue_growth_yoy',   label: 'Revenue Growth YoY' },
  { value: 'earnings_growth_yoy',  label: 'Earnings Growth YoY' },
  { value: 'debt_to_equity',       label: 'Debt / Equity' },
  { value: 'market_cap',           label: 'Market Cap ($B)' },
  { value: 'beta',                 label: 'Beta' },
  { value: 'eps',                  label: 'EPS' },
];

const OPERATOR_OPTIONS = [
  { value: 'lt',      label: '<' },
  { value: 'lte',     label: '≤' },
  { value: 'gt',      label: '>' },
  { value: 'gte',     label: '≥' },
  { value: 'eq',      label: '=' },
  { value: 'between', label: 'between' },
];

// ============================================================================
// Criterion row
// ============================================================================

interface CriterionRowProps {
  criterion: ScreenerCriterion;
  onChange: (c: ScreenerCriterion) => void;
  onRemove: () => void;
}

function CriterionRow({ criterion, onChange, onRemove }: CriterionRowProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Field selector */}
      <div className="relative">
        <select
          value={criterion.field}
          onChange={(e) => onChange({ ...criterion, field: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {FIELD_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Operator selector */}
      <div className="relative">
        <select
          value={criterion.operator}
          onChange={(e) => onChange({ ...criterion, operator: e.target.value as ScreenerCriterion['operator'] })}
          className="h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {OPERATOR_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Value inputs */}
      {criterion.operator === 'between' ? (
        <>
          <Input
            type="number"
            placeholder="Min"
            value={criterion.min_value ?? ''}
            onChange={(e) => onChange({ ...criterion, min_value: Number(e.target.value) })}
            className="w-24 h-9"
          />
          <span className="text-sm text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={criterion.max_value ?? ''}
            onChange={(e) => onChange({ ...criterion, max_value: Number(e.target.value) })}
            className="w-24 h-9"
          />
        </>
      ) : (
        <Input
          type="number"
          placeholder="Value"
          value={criterion.value ?? ''}
          onChange={(e) => onChange({ ...criterion, value: Number(e.target.value) })}
          className="w-28 h-9"
        />
      )}

      <Button variant="ghost" size="icon" onClick={onRemove} className="h-9 w-9 shrink-0">
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

// ============================================================================
// Results table
// ============================================================================

function ResultsTable({ results, totalCount }: { results: ScreenerResult[]; totalCount: number }) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 py-8 text-center text-sm text-muted-foreground">
        No stocks matched your criteria. Try relaxing the filters.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {results.length} of {totalCount} matches shown
      </p>
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Symbol</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Sector</th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Criteria Met</th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Market Cap</th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">P/E</th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Net Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {results.map((r) => {
              const fd = r.fundamental_data as Record<string, number | string | undefined>;
              return (
                <tr key={r.symbol} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5 font-semibold">{r.symbol}</td>
                  <td className="px-3 py-2.5 text-muted-foreground max-w-[180px] truncate">
                    {r.name || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.sector || '—'}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded font-medium',
                      r.matching_criteria_count === r.total_criteria_count
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    )}>
                      {r.matching_criteria_count}/{r.total_criteria_count}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {fd.market_cap != null ? `$${Number(fd.market_cap).toFixed(1)}B` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {fd.pe_ratio != null ? Number(fd.pe_ratio).toFixed(1) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    {fd.net_margin != null ? `${(Number(fd.net_margin) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Screening page
// ============================================================================

export default function ScreeningPage() {
  const [criteria, setCriteria] = useState<ScreenerCriterion[]>([
    { field: 'pe_ratio', operator: 'lt', value: 25 },
    { field: 'roe', operator: 'gt', value: 0.15 },
  ]);
  const [sortBy, setSortBy] = useState('market_cap');
  const [maxResults, setMaxResults] = useState(50);

  const [result, setResult] = useState<ScreeningResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCriterion = () => {
    setCriteria((prev) => [...prev, { field: 'pe_ratio', operator: 'lt', value: 25 }]);
  };

  const updateCriterion = (index: number, c: ScreenerCriterion) => {
    setCriteria((prev) => prev.map((p, i) => (i === index ? c : p)));
  };

  const removeCriterion = (index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: typeof PRESET_SCREENS[number]) => {
    setCriteria(preset.criteria);
  };

  const runScreen = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await screenStocks(criteria, {
        sortBy,
        sortDescending: true,
        maxResults,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Screening failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Search className="h-7 w-7 text-purple-600" />
          Stock Screener
        </h1>
        <p className="text-muted-foreground mt-1">
          Filter stocks by fundamental, technical, and quality criteria.
        </p>
      </div>

      {/* Filters card */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        {/* Preset buttons */}
        <div>
          <Label className="mb-2 block">Quick Screens</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCREENS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Criteria list */}
        <div className="space-y-3">
          <Label>Criteria</Label>
          {criteria.length === 0 && (
            <p className="text-sm text-muted-foreground">No criteria — all stocks will be returned.</p>
          )}
          {criteria.map((c, i) => (
            <CriterionRow
              key={i}
              criterion={c}
              onChange={(updated) => updateCriterion(i, updated)}
              onRemove={() => removeCriterion(i)}
            />
          ))}
          <Button variant="outline" size="sm" onClick={addCriterion}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Criterion
          </Button>
        </div>

        {/* Sort + limit + run */}
        <div className="flex flex-wrap items-end gap-4 border-t pt-4">
          <div>
            <Label htmlFor="sort-by">Sort By</Label>
            <div className="relative mt-1">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {FIELD_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="max-results">Max Results</Label>
            <Input
              id="max-results"
              type="number"
              min={1}
              max={200}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="mt-1 w-24 h-9"
            />
          </div>

          <Button onClick={runScreen} disabled={loading} className="ml-auto">
            {loading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Screening...</>
            ) : (
              <><Search className="h-4 w-4 mr-2" />Run Screen</>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {result.data_source === 'sample' && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-400">
              <span className="font-medium">Sample data</span>
              <span className="text-amber-700 dark:text-amber-500">— Representative values for illustration. Add an <code className="font-mono text-xs">ALPHA_VANTAGE_API_KEY</code> to Render for live fundamentals.</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Screened {result.universe_size} stocks · {result.matched_count} matched
            </span>
            <span>{new Date(result.screened_at).toLocaleString()}</span>
          </div>
          <ResultsTable results={result.results} totalCount={result.matched_count} />
        </div>
      )}

      {!result && !loading && !error && (
        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Screen the Market</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Add criteria above and click &quot;Run Screen&quot; to filter stocks by
            fundamental and quality metrics.
          </p>
        </div>
      )}
    </div>
  );
}
