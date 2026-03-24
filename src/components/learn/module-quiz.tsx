'use client';

import { CheckCircle, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuiz, usePastAttempt } from '@/lib/learn/use-quiz';
import type { QuizQuestion } from '@/lib/learn/quiz-data';

interface ModuleQuizProps {
  moduleId: string;
  questions: QuizQuestion[];
}

export function ModuleQuiz({ moduleId, questions }: ModuleQuizProps) {
  const quiz = useQuiz(questions, moduleId);
  const pastAttempt = usePastAttempt(moduleId);

  if (quiz.submitted) {
    return <QuizResults quiz={quiz} onReset={quiz.reset} />;
  }

  const q = quiz.currentQuestion;
  const selected = quiz.selectedAnswers[quiz.currentIndex];
  const isLast = quiz.currentIndex === questions.length - 1;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Knowledge Check
        </h2>
        <div className="flex items-center gap-3">
          {pastAttempt && (
            <span className="text-xs text-muted-foreground">
              Best: {pastAttempt.score}/{pastAttempt.total}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {quiz.currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((quiz.answeredCount) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="font-medium text-sm leading-relaxed">{q.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => quiz.selectAnswer(i)}
            className={cn(
              'w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors',
              selected === i
                ? 'border-primary bg-primary/10 text-foreground font-medium'
                : 'border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="font-medium mr-2 text-primary">
              {String.fromCharCode(65 + i)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={quiz.goPrev}
          disabled={quiz.currentIndex === 0}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            size="sm"
            onClick={quiz.submit}
            disabled={!quiz.allAnswered}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={quiz.goNext}
            disabled={selected === null}
          >
            Next
          </Button>
        )}
      </div>

      {!quiz.allAnswered && isLast && (
        <p className="text-xs text-muted-foreground text-center">
          Answer all {questions.length} questions to submit.
        </p>
      )}
    </div>
  );
}

function QuizResults({
  quiz,
  onReset,
}: {
  quiz: ReturnType<typeof useQuiz>;
  onReset: () => void;
}) {
  const pct = Math.round((quiz.score / quiz.questions.length) * 100);
  const passed = pct >= 70;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Knowledge Check — Results
        </h2>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Retake
        </Button>
      </div>

      {/* Score summary */}
      <div className={cn(
        'rounded-lg px-5 py-4 flex items-center gap-4',
        passed
          ? 'bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800'
          : 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
      )}>
        <div className={cn(
          'text-4xl font-bold',
          passed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400',
        )}>
          {pct}%
        </div>
        <div>
          <p className={cn(
            'font-semibold',
            passed ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300',
          )}>
            {passed ? 'Great work!' : 'Keep studying'}
          </p>
          <p className={cn(
            'text-sm',
            passed ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400',
          )}>
            {quiz.score} of {quiz.questions.length} correct
          </p>
        </div>
      </div>

      {/* Answer review */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Review</h3>
        {quiz.questions.map((q, i) => {
          const userAnswer = quiz.selectedAnswers[i];
          const correct = userAnswer === q.correctIndex;
          return (
            <div key={q.id} className="space-y-2">
              <div className="flex items-start gap-2">
                {correct ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{q.question}</p>
              </div>

              {!correct && userAnswer !== null && (
                <p className="text-xs text-destructive ml-6">
                  Your answer: {q.options[userAnswer]}
                </p>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 ml-6">
                Correct: {q.options[q.correctIndex]}
              </p>
              <p className="text-xs text-muted-foreground ml-6 border-l-2 pl-3">
                {q.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
