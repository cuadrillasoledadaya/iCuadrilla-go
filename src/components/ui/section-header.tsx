import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SectionHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: SectionHeaderAction;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      data-testid="section-header"
      className={cn('flex items-center justify-between gap-4', className)}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-neutral-400 shrink-0">{icon}</span>}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              'font-black uppercase truncate',
              eyebrow
                ? 'text-base tracking-tight text-neutral-900'
                : 'text-sm tracking-widest text-neutral-400'
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-xs text-neutral-500 truncate">{description}</p>
          )}
        </div>
      </div>
      {action && <SectionHeaderActionButton action={action} />}
    </div>
  );
}

function SectionHeaderActionButton({ action }: { action: SectionHeaderAction }) {
  const className =
    'shrink-0 text-[10px] font-black uppercase tracking-widest text-primary hover:underline';
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
