'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        const message = getErrorMessage(error);
        if (message.toLowerCase().includes('expired')) {
          setErrorMessage('This verification link has expired. Please request a new one from your dashboard.');
        } else if (message.toLowerCase().includes('invalid')) {
          setErrorMessage('This verification link is invalid. It may have already been used.');
        } else {
          setErrorMessage(message || 'Failed to verify email. Please try again.');
        }
      }
    };

    verify();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight">Email Verified!</h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified. You can now access all features of your account.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/app">Go to Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'no-token') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight">Invalid Link</h1>
            <p className="text-muted-foreground">
              This verification link is missing required information. Please use the link from your verification email.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/app">Go to Dashboard</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              You can request a new verification email from your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Verification Failed</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/app">Go to Dashboard</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            You can request a new verification email from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
