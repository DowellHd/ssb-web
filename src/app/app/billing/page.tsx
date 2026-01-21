'use client';

import { CreditCard, Clock } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <div className="relative">
        <div className="p-4 rounded-full bg-blue-100">
          <CreditCard className="h-12 w-12 text-blue-600" />
        </div>
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-100">
          <Clock className="h-5 w-5 text-amber-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground max-w-md">
          Manage your subscription plan, view invoices, and update payment methods.
          Upgrade to unlock advanced analytics features.
        </p>
      </div>
      <div className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
        Coming Soon
      </div>
    </div>
  );
}
