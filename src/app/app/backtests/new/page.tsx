'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LineChart, Calendar, DollarSign, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewBacktestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbols: '',
    startDate: '',
    endDate: '',
    initialCapital: '100000',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Please enter a backtest name');
      setLoading(false);
      return;
    }

    if (!formData.symbols.trim()) {
      toast.error('Please enter at least one symbol');
      setLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      setLoading(false);
      return;
    }

    // TODO: Implement actual backtest creation API call
    toast.info('Backtest creation coming soon!');
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/app/backtests"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Backtests
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <LineChart className="h-7 w-7 text-purple-600" />
          Create New Backtest
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure and run a deterministic backtest on historical data.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          {/* Backtest Name */}
          <div>
            <Label htmlFor="name">Backtest Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Strategy Backtest"
              className="mt-1"
            />
          </div>

          {/* Symbols */}
          <div>
            <Label htmlFor="symbols">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Symbols (comma-separated)
              </div>
            </Label>
            <Input
              id="symbols"
              value={formData.symbols}
              onChange={(e) => setFormData({ ...formData, symbols: e.target.value })}
              placeholder="SPY, QQQ, IWM"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter stock symbols separated by commas. Equal-weight allocation will be applied.
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </div>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </div>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Initial Capital */}
          <div>
            <Label htmlFor="initialCapital">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Initial Capital (USD)
              </div>
            </Label>
            <Input
              id="initialCapital"
              type="number"
              min="1000"
              max="10000000"
              value={formData.initialCapital}
              onChange={(e) => setFormData({ ...formData, initialCapital: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Strategy Info */}
        <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 text-sm text-slate-800">
          <strong>Strategy:</strong> Buy and Hold (equal-weight allocation at start, hold until end).
          More strategies coming soon.
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Backtest'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/app/backtests')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
