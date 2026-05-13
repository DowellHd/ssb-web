'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Suspense, useState } from 'react';
import { PostHogProvider } from '@/components/posthog-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <Suspense>
          <PostHogProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </PostHogProvider>
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
