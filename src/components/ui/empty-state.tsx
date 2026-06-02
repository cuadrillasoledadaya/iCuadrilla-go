import * as React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'muted' | 'card';

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  variant?: EmptyStateVariant;
  className?: string;
}

const variantStyles: Record<EmptyStateVariant, string> = {
  default: 'bg-white p-10 rounded-3xl border border-black/5 shadow-sm',
  muted: 'bg-white/50 p-8 rounded-3xl border border-black/5 shadow-sm',
  card: 'p-10 rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/50',
};

const iconWrapperStyles: Record<EmptyStateVariant, string> = {
  default: 'p-4 rounded-2xl bg-neutral-50 text-neutral-300',
  muted: 'p-4 rounded-full bg-primary/5 text-primary/20',
  card: 'p-4 rounded-2xl bg-white text-neutral-400 border border-neutral-200',
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className={cn(
        'flex flex-col items-center justify-center text-center space-y-4 min-h-[140px]',
        variantStyles[variant],
        className
      )}
    >
      <div className={cn('inline-flex', iconWrapperStyles[variant])}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-sm text-neutral-900">{title}</p>
        {description && <p className="text-xs text-neutral-500 max-w-xs">{description}</p>}
      </div>
      {action && <EmptyStateActionButton action={action} />}
    </div>
  );
}

function EmptyStateActionButton({ action }: { action: EmptyStateAction }) {
  const className =
    'inline-flex items-center justify-center h-10 px-4 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all';
  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}
