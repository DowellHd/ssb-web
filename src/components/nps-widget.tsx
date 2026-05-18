'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import posthog from 'posthog-js';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

type NPSStage = 'score' | 'feedback' | 'thankyou' | 'hidden';

const FOLLOW_UP_PROMPTS: Record<string, string> = {
  promoter: "We're glad you love SSB! What's your favorite feature?",
  passive: "Thanks! What could we improve to make SSB a 10 for you?",
  detractor: "We're sorry to hear that. What's not working for you?",
};

function getCategory(score: number): string {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

export function NpsWidget() {
  const [stage, setStage] = useState<NPSStage>('hidden');
  const [score, setScore] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const checkEligibility = useCallback(async () => {
    try {
      const res = await apiClient.get('/feedback/nps/eligibility');
      if (res.data?.eligible) {
        setTimeout(() => setStage('score'), 8000);
      }
    } catch {
      // NPS must never break the app
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('nps_dismissed_session')) {
      return;
    }
    checkEligibility();
  }, [checkEligibility]);

  const handleScore = (s: number) => {
    setScore(s);
    setCategory(getCategory(s));
    setStage('feedback');
  };

  const handleSubmit = async () => {
    if (score === null) return;
    setSubmitting(true);
    try {
      await apiClient.post('/feedback/nps', {
        score,
        feedback: feedback.trim() || undefined,
        dismissed: false,
      });

      posthog.capture('nps_submitted', {
        score,
        category,
        has_feedback: feedback.trim().length > 0,
        feedback_length: feedback.trim().length,
      });

      setStage('thankyou');
      setTimeout(() => setStage('hidden'), 3000);
    } catch {
      // Show thankyou anyway — don't punish the user for a network error
      setStage('thankyou');
      setTimeout(() => setStage('hidden'), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nps_dismissed_session', 'true');
    }
    setStage('hidden');

    posthog.capture('nps_dismissed', {
      at_stage: stage,
      score_given: score,
    });

    try {
      await apiClient.post('/feedback/nps', { score: 0, dismissed: true });
    } catch {
      // Silently ignore
    }
  };

  if (stage === 'hidden') return null;

  return (
    <div
      role="dialog"
      aria-label="Quick feedback survey"
      className={cn(
        'fixed bottom-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]',
        'rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/40',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#1A2478]">
            <span className="text-[9px] font-bold text-[#C9A84C]">S</span>
          </div>
          <span className="text-xs font-semibold text-foreground">Quick feedback</span>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stage: score */}
      {stage === 'score' && (
        <div className="p-4">
          <p className="mb-0.5 text-sm font-medium text-foreground">
            How likely are you to recommend SSB to a friend?
          </p>
          <p className="mb-4 text-xs text-muted-foreground">0 = Not at all · 10 = Definitely</p>

          <div className="mb-3 flex gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleScore(i)}
                onMouseEnter={() => setHoveredScore(i)}
                onMouseLeave={() => setHoveredScore(null)}
                aria-label={`Score ${i}`}
                className={cn(
                  'h-8 flex-1 rounded-md border text-xs font-semibold transition-all',
                  hoveredScore !== null && i <= hoveredScore
                    ? i >= 9
                      ? 'border-green-500/50 bg-green-500/20 text-green-400'
                      : i >= 7
                        ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-400'
                        : 'border-red-500/50 bg-red-500/20 text-red-400'
                    : 'border-border/50 bg-muted/50 text-muted-foreground hover:border-border',
                )}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </div>
      )}

      {/* Stage: feedback */}
      {stage === 'feedback' && (
        <div className="p-4">
          <div className="mb-3 flex items-start gap-2">
            <div
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                score !== null && score >= 9
                  ? 'bg-green-500/20 text-green-400'
                  : score !== null && score >= 7
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400',
              )}
            >
              {score}
            </div>
            <p className="text-sm text-foreground leading-snug">
              {category && FOLLOW_UP_PROMPTS[category]}
            </p>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts… (optional)"
            rows={3}
            maxLength={2000}
            className={cn(
              'mb-3 w-full resize-none rounded-md border bg-background',
              'px-3 py-2 text-xs placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
            )}
          />

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-1 text-xs text-muted-foreground"
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 text-xs font-semibold"
            >
              {submitting ? (
                'Sending…'
              ) : (
                <>
                  Submit <ChevronRight className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Stage: thank you */}
      {stage === 'thankyou' && (
        <div className="p-6 text-center">
          <div className="mb-2 text-2xl">🙏</div>
          <p className="mb-1 text-sm font-semibold text-foreground">Thank you for your feedback!</p>
          <p className="text-xs text-muted-foreground">It helps us build a better SSB.</p>
        </div>
      )}
    </div>
  );
}
