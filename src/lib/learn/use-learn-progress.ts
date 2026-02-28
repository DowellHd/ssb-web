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

// ============================================================================
// Module completion tracking
// ============================================================================

const COMPLETION_KEY = 'ssb_learn_completed';

/** Map of moduleId → true for every completed module. */
type CompletionMap = Record<string, true>;

function readCompletionMap(): CompletionMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(COMPLETION_KEY);
    return raw ? (JSON.parse(raw) as CompletionMap) : {};
  } catch {
    return {};
  }
}

function writeCompletionMap(map: CompletionMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(map));
  } catch {
    // Ignore write errors
  }
}

export interface ModuleCompletionResult {
  /** Whether a given module ID is marked complete. */
  isComplete: (moduleId: string) => boolean;
  /** Toggle a module between complete/incomplete. */
  toggle: (moduleId: string) => void;
  /** Mark a module explicitly as complete. */
  markComplete: (moduleId: string) => void;
  /** Set of completed module IDs (snapshot). */
  completedIds: Set<string>;
}

/**
 * Hook for reading and writing per-module completion state.
 * Safe to call unconditionally anywhere in a component tree.
 */
export function useModuleCompletion(): ModuleCompletionResult {
  const [map, setMap] = useState<CompletionMap>({});

  useEffect(() => {
    setMap(readCompletionMap());
  }, []);

  const completedIds = new Set(Object.keys(map));

  const isComplete = useCallback(
    (moduleId: string) => moduleId in map,
    [map]
  );

  const toggle = useCallback((moduleId: string) => {
    setMap((prev) => {
      const next = { ...prev };
      if (moduleId in next) {
        delete next[moduleId];
      } else {
        next[moduleId] = true;
      }
      writeCompletionMap(next);
      return next;
    });
  }, []);

  const markComplete = useCallback((moduleId: string) => {
    setMap((prev) => {
      if (moduleId in prev) return prev;
      const next = { ...prev, [moduleId]: true as const };
      writeCompletionMap(next);
      return next;
    });
  }, []);

  return { isComplete, toggle, markComplete, completedIds };
}

/**
 * Calculate progress for a learning path.
 * Returns a value 0–100 representing completion percentage.
 */
export function getPathProgress(
  moduleIds: string[],
  completedIds: Set<string>
): number {
  if (moduleIds.length === 0) return 0;
  const done = moduleIds.filter((id) => completedIds.has(id)).length;
  return Math.round((done / moduleIds.length) * 100);
}
