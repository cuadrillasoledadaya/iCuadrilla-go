import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'pendiente'
  | 'en-curso'
  | 'finalizado'
  | 'presente'
  | 'ausente'
  | 'justificado'
  | 'anunciado'
  | 'neutral'
  | 'primary';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
  {
    variants: {
      variant: {
        pendiente:
          'bg-amber-50 text-amber-700 border-amber-200/60',
        'en-curso':
          'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        finalizado:
          'bg-red-50 text-red-700 border-red-200/60',
        presente:
          'bg-emerald-100 text-emerald-800 border-emerald-200',
        ausente:
          'bg-red-100 text-red-800 border-red-200',
        justificado:
          'bg-blue-50 text-blue-700 border-blue-200/60',
        anunciado:
          'bg-primary/5 text-primary border-primary/20',
        neutral:
          'bg-neutral-100 text-neutral-700 border-neutral-200',
        primary:
          'bg-primary text-primary-foreground border-primary',
      },
      size: {
        sm: 'text-[9px] px-2 py-0.5',
        md: 'text-[10px] px-2.5 py-0.5',
        lg: 'text-xs px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-testid="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
