'use client';

export function RetryButton({ className }: { className?: string }) {
  return (
    <button onClick={() => window.location.reload()} className={className}>
      Try again
    </button>
  );
}
