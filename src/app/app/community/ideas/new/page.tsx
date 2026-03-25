'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTradeIdea } from '@/lib/api/community';

const TIME_HORIZONS = [
  { value: 'day', label: 'Day Trade' },
  { value: 'swing', label: 'Swing (days–weeks)' },
  { value: 'position', label: 'Position (weeks–months)' },
  { value: 'long_term', label: 'Long Term (months+)' },
];

export default function NewTradeIdeaPage() {
  const router = useRouter();
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [thesis, setThesis] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('swing');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const idea = await createTradeIdea({
        symbol: symbol.trim().toUpperCase(),
        direction,
        thesis: thesis.trim(),
        target_price: targetPrice ? parseFloat(targetPrice) : null,
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        entry_price: entryPrice ? parseFloat(entryPrice) : null,
        time_horizon: timeHorizon,
        tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
      });
      router.push(`/app/community/ideas/${idea.id}`);
    } catch {
      setError('Failed to publish trade idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/app/community"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Share a Trade Idea</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share your analysis with the community. Not investment advice.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Symbol & Direction */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ticker Symbol</label>
            <input
              type="text"
              required
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              maxLength={20}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Direction</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDirection('long')}
                className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                  direction === 'long'
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setDirection('short')}
                className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                  direction === 'short'
                    ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Short
              </button>
            </div>
          </div>
        </div>

        {/* Thesis */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Thesis</label>
          <textarea
            required
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Explain your reasoning — what's the catalyst, setup, or analysis behind this idea?"
            rows={5}
            minLength={10}
            maxLength={5000}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{thesis.length}/5000</p>
        </div>

        {/* Price levels */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Entry Price', value: entryPrice, setter: setEntryPrice },
            { label: 'Target Price', value: targetPrice, setter: setTargetPrice },
            { label: 'Stop Loss', value: stopLoss, setter: setStopLoss },
          ].map(({ label, value, setter }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-sm font-medium">{label} <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>

        {/* Time horizon */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Time Horizon</label>
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {TIME_HORIZONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tags <span className="text-muted-foreground font-normal">(optional, comma-separated)</span></label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="earnings, breakout, technical"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish Trade Idea
          </Button>
          <Link href="/app/community">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
