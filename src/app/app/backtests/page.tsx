'use client';

import { LineChart, Clock } from 'lucide-react';

export default function BacktestsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <div className="relative">
        <div className="p-4 rounded-full bg-purple-100">
          <LineChart className="h-12 w-12 text-purple-600" />
        </div>
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-100">
          <Clock className="h-5 w-5 text-amber-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Strategy Backtesting</h1>
        <p className="text-muted-foreground max-w-md">
          Historical strategy simulation with performance metrics and equity curves.
          Build and test your strategies with confidence.
        </p>
      </div>
      <div className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
        Coming Soon
      </div>
    </div>
  );
}
