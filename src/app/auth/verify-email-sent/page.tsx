'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { resendVerification } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';

export default function VerifyEmailSentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address not found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    try {
      await resendVerification(email);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      // Handle specific error codes from backend
      const status = error?.response?.status;
      const message = getErrorMessage(error);

      if (status === 503) {
        // SMTP not configured or email failed
        toast.error(message || 'Email service unavailable. Please try again later.');
      } else {
        toast.error(message || 'Failed to resend verification email.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="text-6xl">📧</div>
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to{' '}
            {email ? <strong>{email}</strong> : 'your email address'}. Please check
            your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or
          </p>
          <div className="flex flex-col gap-2">
            {email && (
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
