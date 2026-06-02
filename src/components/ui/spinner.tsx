import * as React from 'react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'primary' | 'accent' | 'white';

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-t-2',
  xl: 'h-14 w-14 border-t-2',
};

const colorMap: Record<SpinnerColor, string> = {
  primary: 'border-primary',
  accent: 'border-accent',
  white: 'border-white',
};

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', label, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label ?? 'Cargando'}
        className={cn('inline-block', className)}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full border-r-transparent border-b-transparent',
            colorMap[color],
            sizeMap[size]
          )}
        />
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';
