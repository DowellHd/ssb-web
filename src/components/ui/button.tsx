import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          'disabled:opacity-50 disabled:pointer-events-none',
          'select-none',
          {
            // Default — white on dark with subtle shadow and hover lift
            'bg-primary text-primary-foreground shadow-sm hover:brightness-110 active:brightness-95 active:scale-[0.98]':
              variant === 'default',
            // Destructive
            'bg-destructive text-destructive-foreground shadow-sm hover:brightness-110 active:brightness-90':
              variant === 'destructive',
            // Outline — visible border, subtle hover fill
            'border border-border bg-transparent text-foreground hover:bg-accent hover:border-border/80 active:bg-accent/80':
              variant === 'outline',
            // Ghost — invisible until hover
            'hover:bg-accent hover:text-accent-foreground active:bg-accent/70':
              variant === 'ghost',
          },
          {
            'h-10 px-4 py-2 gap-2':        size === 'default',
            'h-8 px-3 py-1.5 text-xs gap-1.5': size === 'sm',
            'h-11 px-6 text-base gap-2':   size === 'lg',
            'h-9 w-9':                     size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
