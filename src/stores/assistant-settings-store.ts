/**
 * Zustand store for SSB Assistant UI settings.
 *
 * Persists user preferences for:
 * - Text scaling (accessibility)
 * - Panel sizing (width/height)
 * - Bubble size
 * - Density and appearance options
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type TextScale = 'sm' | 'default' | 'lg' | 'xl';
export type PanelWidth = 'sm' | 'md' | 'lg';
export type PanelHeight = 'short' | 'default' | 'tall';
export type MobileMode = 'sheet' | 'fullscreen';
export type BubbleSize = 'sm' | 'default' | 'lg';
export type Density = 'compact' | 'comfortable';
export type CornerStyle = 'rounded' | 'extra-rounded';

export interface AssistantSettings {
  // Text accessibility
  textScale: TextScale;

  // Panel sizing (desktop)
  panelWidth: PanelWidth;
  panelHeight: PanelHeight;

  // Mobile mode
  mobileMode: MobileMode;

  // Bubble (floating button)
  bubbleSize: BubbleSize;

  // Appearance
  density: Density;
  reducedMotion: boolean;
  cornerStyle: CornerStyle;
}

interface AssistantSettingsState extends AssistantSettings {
  // Settings modal state
  isSettingsOpen: boolean;

  // Actions
  openSettings: () => void;
  closeSettings: () => void;
  setTextScale: (scale: TextScale) => void;
  setPanelWidth: (width: PanelWidth) => void;
  setPanelHeight: (height: PanelHeight) => void;
  setMobileMode: (mode: MobileMode) => void;
  setBubbleSize: (size: BubbleSize) => void;
  setDensity: (density: Density) => void;
  setReducedMotion: (reduced: boolean) => void;
  setCornerStyle: (style: CornerStyle) => void;
  resetToDefaults: () => void;
}

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_SETTINGS: AssistantSettings = {
  textScale: 'default',
  panelWidth: 'md',
  panelHeight: 'default',
  mobileMode: 'sheet',
  bubbleSize: 'default',
  density: 'comfortable',
  reducedMotion: false,
  cornerStyle: 'rounded',
};

// ============================================================================
// Display labels for settings UI
// ============================================================================

export const TEXT_SCALE_OPTIONS: { value: TextScale; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

export const PANEL_WIDTH_OPTIONS: { value: PanelWidth; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export const PANEL_HEIGHT_OPTIONS: { value: PanelHeight; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'default', label: 'Default' },
  { value: 'tall', label: 'Tall' },
];

export const MOBILE_MODE_OPTIONS: { value: MobileMode; label: string }[] = [
  { value: 'sheet', label: 'Bottom Sheet' },
  { value: 'fullscreen', label: 'Full Screen' },
];

export const BUBBLE_SIZE_OPTIONS: { value: BubbleSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'lg', label: 'Large' },
];

export const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
];

export const CORNER_STYLE_OPTIONS: { value: CornerStyle; label: string }[] = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
];

// ============================================================================
// Store
// ============================================================================

export const useAssistantSettingsStore = create<AssistantSettingsState>()(
  persist(
    (set) => ({
      // Initial state from defaults
      ...DEFAULT_SETTINGS,
      isSettingsOpen: false,

      // Modal actions
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      // Setting actions
      setTextScale: (textScale) => set({ textScale }),
      setPanelWidth: (panelWidth) => set({ panelWidth }),
      setPanelHeight: (panelHeight) => set({ panelHeight }),
      setMobileMode: (mobileMode) => set({ mobileMode }),
      setBubbleSize: (bubbleSize) => set({ bubbleSize }),
      setDensity: (density) => set({ density }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setCornerStyle: (cornerStyle) => set({ cornerStyle }),

      // Reset all settings
      resetToDefaults: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'ssb_assistant_settings_v1',
      partialize: (state) => ({
        // Only persist the actual settings, not modal state
        textScale: state.textScale,
        panelWidth: state.panelWidth,
        panelHeight: state.panelHeight,
        mobileMode: state.mobileMode,
        bubbleSize: state.bubbleSize,
        density: state.density,
        reducedMotion: state.reducedMotion,
        cornerStyle: state.cornerStyle,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to load assistant settings:', error);
        }
      },
    }
  )
);

// ============================================================================
// Utility hook for getting CSS class mappings
// ============================================================================

/**
 * Returns the current settings as data attributes for CSS styling.
 */
export function useAssistantSettingsAttributes() {
  const {
    textScale,
    panelWidth,
    panelHeight,
    mobileMode,
    density,
    reducedMotion,
    cornerStyle,
  } = useAssistantSettingsStore();

  return {
    'data-text-scale': textScale,
    'data-panel-width': panelWidth,
    'data-panel-height': panelHeight,
    'data-mobile-mode': mobileMode,
    'data-density': density,
    'data-reduced-motion': reducedMotion ? 'true' : 'false',
    'data-corner-style': cornerStyle,
  };
}
