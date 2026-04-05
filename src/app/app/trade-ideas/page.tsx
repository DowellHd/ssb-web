'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  Layers,
  Lightbulb,
  Loader2,
  RefreshCw,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  generateTradeIdeas,
  listTradeIdeas,
  updateIdeaStatus,
  deleteTradeIdea,
  type TradeIdea,
} from '@/lib/api/portfolio';

const IDEA_TYPE_LABELS: Record<string, string> = {
  momentum:        'Momentum',
  mean_reversion:  'Mean Reversion',
  options:         'Options Strategy',
  earnings:        'Earnings Play',
  sector_rotation: 'Sector Rotation',
};

const DIRECTION_COLORS: Record<string, string> = {
  long:    'text-green-600 bg-green-50 dark:bg-green-900/20',
  short:   'text-red-600 bg-red-50 dark:bg-red-900/20',
  neutral: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
};

const STRENGTH_COLORS: Record<string, string> = {
  strong:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  weak:     'bg-muted text-muted-foreground',
};

const IDEA_TYPE_ICONS: Record<string, React.ElementType> = {
  momentum:        TrendingUp,
  mean_reversion:  RefreshCw,
  options:         Layers,
  earnings:        Calendar,
  sector_rotation: ArrowRight,
};

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];
const DEFAULT_TYPES = ['momentum', 'mean_reversion', 'options', 'earnings', 'sector_rotation'];

export default function TradeIdeasPage() {
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [symbolInput, setSymbolInput] = useState(DEFAULT_SYMBOLS.join(', '));
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(DEFAULT_TYPES));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    setLoadingIdeas(true);
    try {
      const data = await listTradeIdeas();
      setIdeas(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load ideas');
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function handleGenerate() {
    const symbols = symbolInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (!symbols.length) return;
    setGenerating(true);
    setError(null);
    try {
      const newIdeas = await generateTradeIdeas({ symbols, idea_types: Array.from(selectedTypes) });
      setIdeas(prev => [...newIdeas, ...prev]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDismiss(id: string) {
    await updateIdeaStatus(id, 'dismissed');
    setIdeas(prev => prev.filter(i => i.id !== id));
  }

  async function handleExecuted(id: string) {
    await updateIdeaStatus(id, 'executed');
    setIdeas(prev => prev.filter(i => i.id !== id));
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Trade Ideas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Signal-based trade idea generation across momentum, mean-reversion, options strategies, earnings plays, and sector rotation.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
        <strong>Important:</strong> Trade ideas are analytical signals for research purposes only.
        Not investment advice. Past signal patterns do not predict future results. Always conduct your own due diligence.
      </div>

      {/* Generator */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Generate Ideas</h2>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Symbols (comma-separated)</label>
          <input
            value={symbolInput}
            onChange={e => setSymbolInput(e.target.value)}
            placeholder="AAPL, MSFT, NVDA..."
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Idea Types</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TYPES.map(type => {
              const Icon = IDEA_TYPE_ICONS[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                    selectedTypes.has(type)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {IDEA_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={generating || selectedTypes.size === 0}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
          Generate Ideas
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Ideas list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Active Ideas ({ideas.length})
          </h2>
          <Button variant="ghost" size="sm" onClick={loadIdeas}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {loadingIdeas ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="rounded-xl border bg-muted/20 py-12 text-center">
            <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No active ideas. Generate some above.</p>
          </div>
        ) : (
          ideas.map(idea => {
            const Icon = IDEA_TYPE_ICONS[idea.idea_type] || TrendingUp;
            const isExpanded = expandedId === idea.id;
            return (
              <div key={idea.id} className="rounded-xl border bg-card overflow-hidden">
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">{idea.symbol}</span>
                      <span className="text-xs text-muted-foreground">{IDEA_TYPE_LABELS[idea.idea_type]}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', DIRECTION_COLORS[idea.direction])}>
                        {idea.direction}
                      </span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', STRENGTH_COLORS[idea.signal_strength])}>
                        {idea.signal_strength}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{idea.thesis}</p>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3">
                    <p className="text-sm">{idea.thesis}</p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Entry Criteria</p>
                        {Object.entries(idea.entry_criteria).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs py-0.5">
                            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                            <span className="font-medium">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Risk Parameters</p>
                        {Object.entries(idea.risk_parameters).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs py-0.5">
                            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                            <span className="font-medium">{typeof v === 'number' ? (k.includes('pct') ? `${(v * 100).toFixed(0)}%` : String(v)) : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => handleExecuted(idea.id)}>
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Executed
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => handleDismiss(idea.id)}>
                        <X className="h-3.5 w-3.5" /> Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
