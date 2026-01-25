'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?verified=1');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        const message = getErrorMessage(error);
        if (message.toLowerCase().includes('expired')) {
          setErrorMessage('This verification link has expired. Please request a new one.');
        } else if (message.toLowerCase().includes('invalid')) {
          setErrorMessage('This verification link is invalid or has already been used.');
        } else {
          setErrorMessage(message || 'Failed to verify email. Please try again.');
        }
      }
    };

    verify();
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Email verified!</h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign in to your account</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Redirecting automatically...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verification failed</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
        <div className="mt-6 space-y-3">
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signup">Sign up again</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg text-center">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
