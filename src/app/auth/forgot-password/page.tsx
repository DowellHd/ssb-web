'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">📧</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground">
              If an account exists for {email}, we&apos;ve sent a password reset link to that
              address.
            </p>
          </div>

          <Button variant="outline" asChild className="w-full mt-6">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Remember your password?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
