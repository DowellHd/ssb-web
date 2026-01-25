'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Branded header */}
      <header className="w-full py-6 px-4">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Smart Strategies Builder
          </span>
        </Link>
      </header>

      {/* Auth content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 text-center text-sm text-muted-foreground">
        <p>
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
