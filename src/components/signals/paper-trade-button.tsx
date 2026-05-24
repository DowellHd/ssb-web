'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createAccount, getAccount, placeOrder } from '@/lib/api/paper';
import { cn } from '@/lib/utils';

interface PaperTradeButtonProps {
  ticker: string;
  trendBias: 'bullish' | 'bearish' | string;
  className?: string;
  size?: 'sm' | 'default';
}

export function PaperTradeButton({ ticker, trendBias, className, size = 'sm' }: PaperTradeButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handlePaperTrade() {
    setState('loading');
    setErrorMsg('');
    try {
      // Ensure paper account exists
      try {
        await getAccount();
      } catch {
        await createAccount();
      }

      const side = trendBias === 'bearish' ? 'sell' : 'buy';
      await placeOrder({ symbol: ticker, side, quantity: 1, order_type: 'market' });
      setState('done');
      // Reset after 4 seconds
      setTimeout(() => setState('idle'), 4000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to place paper trade';
      setErrorMsg(msg);
      setState('error');
      setTimeout(() => setState('idle'), 4000);
    }
  }

  if (state === 'done') {
    return (
      <Button size={size} variant="outline" className={cn('gap-1.5 text-green-600 border-green-200 dark:border-green-800', className)} disabled>
        <CheckCircle className="h-3.5 w-3.5" />
        Paper trade placed!
      </Button>
    );
  }

  if (state === 'error') {
    return (
      <Button size={size} variant="outline" className={cn('gap-1.5 text-destructive border-destructive/30', className)} disabled>
        {errorMsg.length > 30 ? 'Trade failed' : errorMsg}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      className={cn('gap-1.5', className)}
      onClick={handlePaperTrade}
      disabled={state === 'loading'}
    >
      {state === 'loading' ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FlaskConical className="h-3.5 w-3.5" />
      )}
      {state === 'loading' ? 'Placing…' : 'Paper Trade'}
    </Button>
  );
}
