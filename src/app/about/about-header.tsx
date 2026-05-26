'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, LayoutDashboard } from 'lucide-react';

export function AboutHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'));
  }, []);

  return (
    <header
      className="w-full py-6 px-4 border-b border-border/30"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top, 0px))' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">SSB</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          {isLoggedIn ? (
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to App
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
