/**
 * Quiz state management using localStorage.
 * Tracks answers, score, and completion per module.
 */
'use client';

import { useCallback, useState } from 'react';
import type { QuizQuestion } from './quiz-data';

export interface QuizAttempt {
  moduleId: string;
  score: number;
  total: number;
  completedAt: string;
}

const STORAGE_KEY = 'ssb:quiz-attempts';

function loadAttempts(): Record<string, QuizAttempt> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, QuizAttempt>) : {};
  } catch {
    return {};
  }
}

function saveAttempt(attempt: QuizAttempt): void {
  if (typeof window === 'undefined') return;
  try {
    const attempts = loadAttempts();
    attempts[attempt.moduleId] = attempt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // Ignore storage errors
  }
}

export function usePastAttempt(moduleId: string): QuizAttempt | undefined {
  const attempts = loadAttempts();
  return attempts[moduleId];
}

export interface QuizState {
  currentIndex: number;
  selectedAnswers: (number | null)[];
  submitted: boolean;
  score: number;
}

export function useQuiz(questions: QuizQuestion[], moduleId: string) {
  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    selectedAnswers: Array(questions.length).fill(null),
    submitted: false,
    score: 0,
  });

  const selectAnswer = useCallback((answerIndex: number) => {
    if (state.submitted) return;
    setState((prev) => {
      const updated = [...prev.selectedAnswers];
      updated[prev.currentIndex] = answerIndex;
      return { ...prev, selectedAnswers: updated };
    });
  }, [state.submitted]);

  const goNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, questions.length - 1),
    }));
  }, [questions.length]);

  const goPrev = useCallback(() => {
    setState((prev) => ({ ...prev, currentIndex: Math.max(prev.currentIndex - 1, 0) }));
  }, []);

  const submit = useCallback(() => {
    const score = state.selectedAnswers.reduce<number>((acc, answer, i) => {
      return answer === questions[i].correctIndex ? acc + 1 : acc;
    }, 0);

    setState((prev) => ({ ...prev, submitted: true, score }));

    saveAttempt({
      moduleId,
      score,
      total: questions.length,
      completedAt: new Date().toISOString(),
    });
  }, [state.selectedAnswers, questions, moduleId]);

  const reset = useCallback(() => {
    setState({
      currentIndex: 0,
      selectedAnswers: Array(questions.length).fill(null),
      submitted: false,
      score: 0,
    });
  }, [questions.length]);

  const answeredCount = state.selectedAnswers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  return {
    ...state,
    questions,
    currentQuestion: questions[state.currentIndex],
    answeredCount,
    allAnswered,
    selectAnswer,
    goNext,
    goPrev,
    submit,
    reset,
  };
}
