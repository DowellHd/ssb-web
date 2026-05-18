'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createManualPosition,
  updateManualPosition,
  type ManualPosition,
  type ManualPositionCreate,
} from '@/lib/api/portfolio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (position: ManualPosition) => void;
  editing?: ManualPosition;
}

const ASSET_TYPES = [
  { value: 'stock', label: 'Stock' },
  { value: 'etf', label: 'ETF' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Other' },
] as const;

export function ManualPositionForm({ isOpen, onClose, onSaved, editing }: Props) {
  const [symbol, setSymbol] = useState(editing?.symbol ?? '');
  const [quantity, setQuantity] = useState(editing ? String(editing.quantity) : '');
  const [avgCost, setAvgCost] = useState(editing ? String(editing.avg_cost) : '');
  const [assetType, setAssetType] = useState<ManualPositionCreate['asset_type']>(
    editing?.asset_type ?? 'stock'
  );
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const qty = parseFloat(quantity);
    const cost = parseFloat(avgCost);
    if (!symbol.trim() || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) {
      setError('Symbol, quantity, and average cost are required and must be positive.');
      return;
    }
    setLoading(true);
    try {
      let saved: ManualPosition;
      if (editing) {
        saved = await updateManualPosition(editing.id, {
          quantity: qty,
          avg_cost: cost,
          asset_type: assetType,
          notes: notes.trim() || undefined,
        });
      } else {
        saved = await createManualPosition({
          symbol: symbol.trim().toUpperCase(),
          quantity: qty,
          avg_cost: cost,
          asset_type: assetType,
          notes: notes.trim() || undefined,
        });
      }
      onSaved(saved);
      onClose();
    } catch {
      setError('Failed to save position. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="mb-5 text-lg font-semibold text-white">
          {editing ? 'Edit Position' : 'Add Position'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mp-symbol">Symbol</Label>
            <Input
              id="mp-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="AAPL"
              disabled={!!editing}
              className="uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mp-qty">Quantity</Label>
              <Input
                id="mp-qty"
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mp-cost">Avg Cost ($)</Label>
              <Input
                id="mp-cost"
                type="number"
                min="0"
                step="any"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="150.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Asset Type</Label>
            <div className="flex gap-2">
              {ASSET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setAssetType(t.value)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-sm transition-colors ${
                    assetType === t.value
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mp-notes">Notes (optional)</Label>
            <Input
              id="mp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Roth IRA, long-term hold"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 size={15} className="animate-spin" /> : editing ? 'Save' : 'Add Position'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
