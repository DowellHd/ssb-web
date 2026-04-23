'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import { usePlaceOrder } from '@/hooks/use-paper-trading';
import type { Position } from '@/lib/api/paper';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  defaultSide?: 'buy' | 'sell';
  currentCash: number;
  positions: Position[];
}

export function NewOrderModal({
  isOpen,
  onClose,
  defaultSymbol,
  defaultSide = 'buy',
  currentCash,
  positions,
}: NewOrderModalProps) {
  const [symbol, setSymbol] = useState(defaultSymbol || '');
  const [side, setSide] = useState<'buy' | 'sell'>(defaultSide);
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');

  const placeMutation = usePlaceOrder();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSymbol(defaultSymbol || '');
      setSide(defaultSide);
      setQuantity('');
      setOrderType('market');
      setLimitPrice('');
    }
  }, [isOpen, defaultSymbol, defaultSide]);

  // Get position for sell validation
  const position = positions.find((p) => p.symbol === symbol.toUpperCase());
  const maxSellQuantity = position?.quantity || 0;

  // Estimate order value
  const estimatedPrice = position?.current_price || 100; // Fallback for new symbols
  const qty = parseFloat(quantity) || 0;
  const estimatedValue = qty * (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : estimatedPrice);

  const canSubmit =
    symbol.trim() &&
    qty > 0 &&
    (orderType === 'market' || (orderType === 'limit' && parseFloat(limitPrice) > 0)) &&
    (side === 'buy' ? estimatedValue <= currentCash : qty <= maxSellQuantity);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    await placeMutation.mutateAsync({
      symbol: symbol.toUpperCase().trim(),
      side,
      quantity: qty,
      order_type: orderType,
      limit_price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">New Order</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g. MSFT, AAPL, TSLA"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={!!defaultSymbol}
              className="uppercase"
            />
          </div>

          {/* Side Toggle */}
          <div className="space-y-2">
            <Label>Side</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={side === 'buy' ? 'default' : 'outline'}
                onClick={() => setSide('buy')}
                className={cn(side === 'buy' && 'bg-green-600 hover:bg-green-700')}
              >
                Buy
              </Button>
              <Button
                type="button"
                variant={side === 'sell' ? 'default' : 'outline'}
                onClick={() => setSide('sell')}
                className={cn(side === 'sell' && 'bg-red-600 hover:bg-red-700')}
              >
                Sell
              </Button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="quantity">Quantity</Label>
              {side === 'sell' && position && (
                <span className="text-xs text-muted-foreground">
                  Max: {maxSellQuantity}
                </span>
              )}
            </div>
            <Input
              id="quantity"
              type="number"
              min="0.000001"
              step="any"
              max={side === 'sell' ? maxSellQuantity : undefined}
              placeholder="e.g. 1, 5, 0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label>Order Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={orderType === 'market' ? 'default' : 'outline'}
                onClick={() => setOrderType('market')}
              >
                Market
              </Button>
              <Button
                type="button"
                variant={orderType === 'limit' ? 'default' : 'outline'}
                onClick={() => setOrderType('limit')}
              >
                Limit
              </Button>
            </div>
          </div>

          {/* Limit Price (conditional) */}
          {orderType === 'limit' && (
            <div className="space-y-2">
              <Label htmlFor="limitPrice">Limit Price</Label>
              <Input
                id="limitPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="150.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Value</span>
              <span className="font-medium">{formatCurrency(estimatedValue)}</span>
            </div>
            {side === 'buy' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Cash</span>
                <span>{formatCurrency(currentCash)}</span>
              </div>
            )}
            {side === 'buy' && estimatedValue > currentCash && (
              <p className="text-xs text-red-500">Insufficient funds</p>
            )}
            {side === 'sell' && qty > maxSellQuantity && (
              <p className="text-xs text-red-500">Insufficient shares</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={cn(
              'flex-1',
              side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            )}
            disabled={!canSubmit || placeMutation.isPending}
            onClick={handleSubmit}
          >
            {placeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol.toUpperCase() || 'Stock'}`
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
