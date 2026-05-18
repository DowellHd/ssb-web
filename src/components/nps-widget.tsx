'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { getNpsStatus, submitNps } from '@/lib/api/nps';

const NPS_DISMISSED_KEY = 'nps-dismissed';

function scoreColor(score: number): string {
  if (score <= 6) return 'bg-red-500 hover:bg-red-600 text-white';
  if (score <= 8) return 'bg-yellow-500 hover:bg-yellow-600 text-white';
  return 'bg-green-500 hover:bg-green-600 text-white';
}

function scoreSelectedColor(score: number): string {
  if (score <= 6) return 'ring-2 ring-red-400 bg-red-500 text-white';
  if (score <= 8) return 'ring-2 ring-yellow-400 bg-yellow-500 text-white';
  return 'ring-2 ring-green-400 bg-green-500 text-white';
}

function scoreIdleColor(score: number): string {
  if (score <= 6) return 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/40 dark:hover:bg-red-800/60 dark:text-red-300';
  if (score <= 8) return 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:hover:bg-yellow-800/60 dark:text-yellow-300';
  return 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/40 dark:hover:bg-green-800/60 dark:text-green-300';
}

export function NpsWidget() {
  const [visible, setVisible] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Skip if already dismissed
    if (typeof window !== 'undefined' && localStorage.getItem(NPS_DISMISSED_KEY)) {
      return;
    }

    getNpsStatus()
      .then((status) => {
        if (status.should_show) {
          setVisible(true);
        }
      })
      .catch(() => {
        // Silently ignore — NPS is non-critical
      });
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(NPS_DISMISSED_KEY, '1');
    setVisible(false);
  };

  const handleSubmit = async () => {
    if (selectedScore === null) return;
    setSubmitting(true);
    try {
      await submitNps(selectedScore, comment.trim() || undefined);
      setSubmitted(true);
      toast.success('Thanks for your feedback!');
      setTimeout(() => setVisible(false), 1500);
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border bg-card shadow-lg"
      role="dialog"
      aria-label="Feedback survey"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <p className="text-sm font-semibold leading-snug">
          How likely are you to recommend SSB?
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss survey"
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {submitted ? (
        <div className="px-4 pb-4 text-sm text-muted-foreground">
          Your response has been recorded. Thank you!
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {/* Score buttons */}
          <div className="flex gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setSelectedScore(i)}
                aria-label={`Score ${i}`}
                className={[
                  'flex-1 rounded text-xs font-medium py-1.5 transition-all',
                  selectedScore === i
                    ? scoreSelectedColor(i)
                    : scoreIdleColor(i),
                ].join(' ')}
              >
                {i}
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-[11px] text-muted-foreground px-0.5">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>

          {/* Comment textarea — shown after selecting a score */}
          {selectedScore !== null && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could we improve? (optional)"
              rows={2}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={selectedScore === null || submitting}
              className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
