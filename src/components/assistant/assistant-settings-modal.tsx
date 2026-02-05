'use client';

import { X, RotateCcw, Type, Maximize2, Circle, Layout, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useAssistantSettingsStore,
  DEFAULT_SETTINGS,
  TEXT_SCALE_OPTIONS,
  PANEL_WIDTH_OPTIONS,
  PANEL_HEIGHT_OPTIONS,
  MOBILE_MODE_OPTIONS,
  BUBBLE_SIZE_OPTIONS,
  DENSITY_OPTIONS,
  CORNER_STYLE_OPTIONS,
  type TextScale,
  type PanelWidth,
  type PanelHeight,
  type MobileMode,
  type BubbleSize,
  type Density,
  type CornerStyle,
} from '@/stores/assistant-settings-store';

export function AssistantSettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    textScale,
    setTextScale,
    panelWidth,
    setPanelWidth,
    panelHeight,
    setPanelHeight,
    mobileMode,
    setMobileMode,
    bubbleSize,
    setBubbleSize,
    density,
    setDensity,
    reducedMotion,
    setReducedMotion,
    cornerStyle,
    setCornerStyle,
    resetToDefaults,
  } = useAssistantSettingsStore();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSettings();
      }
    };

    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  // Check if any setting differs from default
  const hasChanges =
    textScale !== DEFAULT_SETTINGS.textScale ||
    panelWidth !== DEFAULT_SETTINGS.panelWidth ||
    panelHeight !== DEFAULT_SETTINGS.panelHeight ||
    mobileMode !== DEFAULT_SETTINGS.mobileMode ||
    bubbleSize !== DEFAULT_SETTINGS.bubbleSize ||
    density !== DEFAULT_SETTINGS.density ||
    reducedMotion !== DEFAULT_SETTINGS.reducedMotion ||
    cornerStyle !== DEFAULT_SETTINGS.cornerStyle;

  if (!isSettingsOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50"
        onClick={closeSettings}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="SSB Assistant Settings"
        className={cn(
          'fixed z-[70] bg-card border shadow-2xl',
          'flex flex-col',
          'max-h-[90vh] overflow-hidden',
          // Desktop: centered
          'lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2',
          'lg:w-[480px] lg:max-w-[90vw] lg:rounded-lg',
          // Mobile: bottom sheet
          'max-lg:inset-x-0 max-lg:bottom-0 max-lg:rounded-t-xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-lg">Assistant Settings</h2>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={closeSettings}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Text Size */}
          <SettingSection
            icon={Type}
            title="Text Size"
            description="Adjust text size for better readability"
          >
            <OptionButtonGroup
              options={TEXT_SCALE_OPTIONS}
              value={textScale}
              onChange={(v) => setTextScale(v as TextScale)}
            />
          </SettingSection>

          {/* Panel Size (Desktop) */}
          <SettingSection
            icon={Maximize2}
            title="Panel Size"
            description="Customize chat panel dimensions (desktop)"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Width</label>
                <OptionButtonGroup
                  options={PANEL_WIDTH_OPTIONS}
                  value={panelWidth}
                  onChange={(v) => setPanelWidth(v as PanelWidth)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Height</label>
                <OptionButtonGroup
                  options={PANEL_HEIGHT_OPTIONS}
                  value={panelHeight}
                  onChange={(v) => setPanelHeight(v as PanelHeight)}
                />
              </div>
            </div>
          </SettingSection>

          {/* Mobile Mode */}
          <SettingSection
            icon={Layout}
            title="Mobile Layout"
            description="Choose how the chat appears on mobile"
          >
            <OptionButtonGroup
              options={MOBILE_MODE_OPTIONS}
              value={mobileMode}
              onChange={(v) => setMobileMode(v as MobileMode)}
            />
          </SettingSection>

          {/* Bubble Size */}
          <SettingSection
            icon={Circle}
            title="Button Size"
            description="Size of the floating chat button"
          >
            <OptionButtonGroup
              options={BUBBLE_SIZE_OPTIONS}
              value={bubbleSize}
              onChange={(v) => setBubbleSize(v as BubbleSize)}
            />
          </SettingSection>

          {/* Appearance */}
          <SettingSection
            icon={Sparkles}
            title="Appearance"
            description="Customize spacing and styling"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Density</label>
                <OptionButtonGroup
                  options={DENSITY_OPTIONS}
                  value={density}
                  onChange={(v) => setDensity(v as Density)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Corner Style</label>
                <OptionButtonGroup
                  options={CORNER_STYLE_OPTIONS}
                  value={cornerStyle}
                  onChange={(v) => setCornerStyle(v as CornerStyle)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Reduced Motion</p>
                  <p className="text-xs text-muted-foreground">Disable animations</p>
                </div>
                <button
                  role="switch"
                  aria-checked={reducedMotion}
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    reducedMotion ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      reducedMotion && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            </div>
          </SettingSection>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            disabled={!hasChanges}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={closeSettings}>
            Done
          </Button>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface SettingSectionProps {
  icon: typeof Type;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingSection({ icon: Icon, title, description, children }: SettingSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

interface OptionButtonGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function OptionButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: OptionButtonGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md border transition-colors',
            value === option.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted border-border'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
