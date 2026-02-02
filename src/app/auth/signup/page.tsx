'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signup } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined,
      });

      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push(`/auth/verify-email-sent?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      // Handle specific error codes
      const status = error?.response?.status;
      const message = getErrorMessage(error);

      if (status === 503) {
        // Email service unavailable
        toast.error(message || 'Email service unavailable. Please contact support.');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start analyzing with Smart Strategies Builder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="full_name">Full Name (optional)</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>

          {/* Legal acknowledgment */}
          <p className="text-center text-[11px] text-muted-foreground pt-4 leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
            , and acknowledge the{' '}
            <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Trading Disclaimer</a>.
          </p>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <div className="mt-6 rounded-lg bg-amber-900/50 border border-amber-700 p-4 text-sm text-amber-100">
        <strong>Important:</strong> This platform does not execute trades or provide buy/sell recommendations. All analytics are for educational and informational purposes only.{' '}
        <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Read full disclaimer</a>.
      </div>
    </div>
  );
}
