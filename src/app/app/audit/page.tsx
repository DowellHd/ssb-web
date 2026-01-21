'use client';

import { ClipboardList, Clock } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <div className="relative">
        <div className="p-4 rounded-full bg-slate-100">
          <ClipboardList className="h-12 w-12 text-slate-600" />
        </div>
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-100">
          <Clock className="h-5 w-5 text-amber-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground max-w-md">
          Complete activity history with security events, login attempts, and
          account changes. Full transparency and compliance support.
        </p>
      </div>
      <div className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
        Coming Soon
      </div>
    </div>
  );
}
