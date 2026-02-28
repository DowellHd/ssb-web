/**
 * Hook for persisting and reading "continue learning" state in localStorage.
 *
 * Stores the last-visited module, path, or glossary term so the Learn landing
 * page can show a "Continue where you left off" card.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ssb_learn_last_visited';

export type LearnItemType = 'module' | 'path' | 'term';
export type LearnTab = 'modules' | 'paths' | 'glossary';

export interface LastVisitedItem {
  type: LearnItemType;
  id: string;
  title: string;
  /** Which Learn tab to switch to when resuming */
  tab: LearnTab;
  /** ISO timestamp of last visit */
  visitedAt: string;
}

function readStorage(): LastVisitedItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastVisitedItem) : null;
  } catch {
    return null;
  }
}

function writeStorage(item: LastVisitedItem): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(item));
  } catch {
    // Ignore write errors (e.g. private browsing quota)
  }
}

/**
 * Hook used on module/path/term detail pages to record a visit.
 * Safe to call unconditionally (Rules of Hooks); skips write if title is empty.
 */
export function useRecordLearnVisit(
  type: LearnItemType,
  id: string,
  /** Pass empty string to skip recording (e.g. when item is not found). */
  title: string
): void {
  useEffect(() => {
    if (!title) return;
    const tab: LearnTab =
      type === 'module' ? 'modules' : type === 'path' ? 'paths' : 'glossary';
    writeStorage({ type, id, title, tab, visitedAt: new Date().toISOString() });
  // Record once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Hook used on the Learn landing page to read the last-visited item.
 */
export function useLastVisited(): LastVisitedItem | null {
  const [item, setItem] = useState<LastVisitedItem | null>(null);

  useEffect(() => {
    setItem(readStorage());
  }, []);

  return item;
}

/**
 * Returns a callback to clear the continue-learning state (e.g. after dismissal).
 */
export function useClearLastVisited(): () => void {
  return useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);
}
