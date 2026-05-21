'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /** When true, renders as an icon-only button (for collapsed sidebar). */
  iconOnly?: boolean;
  className?: string;
}

export function ThemeToggle({ iconOnly = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={cn('h-9 w-9', className)}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors duration-150',
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
