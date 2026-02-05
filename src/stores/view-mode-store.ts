/**
 * Zustand store for market view mode.
 *
 * Controls whether the user is viewing data through a short-term (day trading)
 * or long-term (months → years) lens. Same data, different framing.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'short_term' | 'long_term';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isLongTerm: boolean;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set, get) => ({
      viewMode: 'short_term',

      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

      toggleViewMode: () =>
        set((state) => ({
          viewMode: state.viewMode === 'short_term' ? 'long_term' : 'short_term',
        })),

      get isLongTerm() {
        return get().viewMode === 'long_term';
      },
    }),
    {
      name: 'ssb-view-mode',
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);

/**
 * Hook to check if long-term mode is active.
 */
export function useIsLongTerm(): boolean {
  return useViewModeStore((state) => state.viewMode === 'long_term');
}
