'use client';

import { Award, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND_NAME } from '@/components/ui/brand-name';

interface CompletionCertificateProps {
  pathTitle: string;
  moduleCount: number;
  completedAt: string; // ISO date string
  userName: string;
}

export function CompletionCertificate({
  pathTitle,
  moduleCount,
  completedAt,
  userName,
}: CompletionCertificateProps) {
  const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Certificate card — printable */}
      <div
        id="ssb-certificate"
        className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-8 text-center space-y-5 print:border-2 print:border-primary print:shadow-none print:bg-white"
      >
        {/* Seal */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
            <Award className="h-8 w-8" />
          </div>
        </div>

        {/* Issuer */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {BRAND_NAME} Learning Hub
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Certificate of Completion</p>
        </div>

        {/* Recipient */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">This certifies that</p>
          <p className="text-xl font-bold text-foreground">{userName}</p>
          <p className="text-sm text-muted-foreground">has successfully completed</p>
        </div>

        {/* Path title */}
        <div className="rounded-lg border border-primary/20 bg-background/60 px-6 py-3">
          <p className="text-lg font-semibold text-primary">{pathTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {moduleCount} module{moduleCount !== 1 ? 's' : ''} completed
          </p>
        </div>

        {/* Date + disclaimer */}
        <div className="space-y-1">
          <p className="text-sm font-medium">{formattedDate}</p>
          <p className="text-[10px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            This certificate is awarded for educational completion only. It does not constitute a
            professional qualification or financial advisory license.
          </p>
        </div>
      </div>

      {/* Print button */}
      <div className="flex justify-center print:hidden">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>
    </div>
  );
}
