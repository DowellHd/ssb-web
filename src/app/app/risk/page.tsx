'use client';

import { Shield, Clock } from 'lucide-react';

export default function RiskPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <div className="relative">
        <div className="p-4 rounded-full bg-green-100">
          <Shield className="h-12 w-12 text-green-600" />
        </div>
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-100">
          <Clock className="h-5 w-5 text-amber-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Risk Analytics</h1>
        <p className="text-muted-foreground max-w-md">
          Portfolio risk metrics, VaR analysis, and risk attribution are coming soon.
          Stay tuned for powerful risk management tools.
        </p>
      </div>
      <div className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
        Coming Soon
      </div>
    </div>
  );
}
