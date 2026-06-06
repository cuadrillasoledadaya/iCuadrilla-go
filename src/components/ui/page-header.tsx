'use client';

import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PageHeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  back?: boolean | { href?: string; onClick?: () => void; label?: string };
  primaryAction?: PageHeaderAction;
  secondaryAction?: PageHeaderAction;
  rightSlot?: React.ReactNode;
  variant?: 'centered' | 'sticky' | 'left';
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  back = false,
  primaryAction,
  secondaryAction,
  rightSlot,
  variant = 'centered',
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof back === 'object') {
      if (back.onClick) {
        back.onClick();
        return;
      }
      if (back.href) {
        router.push(back.href);
        return;
      }
    }
    router.back();
  };

  const showBack = Boolean(back);
  const hasActions = Boolean(primaryAction || secondaryAction || rightSlot);

  if (variant === 'sticky') {
    return (
      <header
        data-testid="page-header"
        className={cn(
          'sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/5 py-3',
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {showBack ? <BackButton onClick={handleBack} /> : <span className="w-10" />}
          <div className="flex-1 min-w-0 text-center">
            {eyebrow && (
              <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                {eyebrow}
              </div>
            )}
            <h1 className="text-base font-black uppercase tracking-tight text-neutral-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest truncate">
                {subtitle}
              </div>
            )}
          </div>
          <HeaderActions primary={primaryAction} secondary={secondaryAction} />
        </div>
      </header>
    );
  }

  if (variant === 'left') {
    return (
      <header
        data-testid="page-header"
        className={cn('flex items-center gap-3 min-h-[64px]', className)}
      >
        {showBack && <BackButton onClick={handleBack} />}
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">
              {eyebrow}
            </div>
          )}
          <h1 className="text-2xl font-black tracking-tight uppercase text-neutral-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest truncate">
              {subtitle}
            </div>
          )}
        </div>
        <HeaderActions primary={primaryAction} secondary={secondaryAction} />
      </header>
    );
  }

  return (
    <header
      data-testid="page-header"
      className={cn('relative flex items-center justify-center min-h-[64px]', className)}
    >
      {showBack && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton onClick={handleBack} />
        </div>
      )}
      <div className={cn('text-center space-y-0.5 min-w-0', hasActions ? 'px-12 pr-20' : 'px-12')}>
        {eyebrow && (
          <div className="text-[10px] font-black text-primary uppercase tracking-widest">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-black tracking-tighter uppercase text-neutral-900 italic line-clamp-1">
          {title}
        </h1>
        {subtitle && (
          <div className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">
            {subtitle}
          </div>
        )}
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {rightSlot ?? <HeaderActions primary={primaryAction} secondary={secondaryAction} />}
      </div>
    </header>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Volver"
      className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-colors"
    >
      <ChevronLeft size={24} />
    </button>
  );
}

function HeaderActions({
  primary,
  secondary,
}: {
  primary?: PageHeaderAction;
  secondary?: PageHeaderAction;
}) {
  if (!primary && !secondary) return <span className="w-10" aria-hidden="true" />;
  return (
    <>
      {secondary && <ActionButton action={secondary} />}
      {primary && <ActionButton action={primary} />}
    </>
  );
}

function ActionButton({ action }: { action: PageHeaderAction }) {
  const variant = action.variant ?? 'default';
  const className = cn(
    'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all',
    variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
    variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    variant === 'outline' && 'border border-black/5 bg-white text-neutral-900 hover:bg-neutral-50',
    variant === 'ghost' && 'text-neutral-600 hover:bg-neutral-100',
    variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  );
  const content = (
    <>
      {action.icon}
      <span>{action.label}</span>
    </>
  );
  if (action.href) {
    return (
      <a href={action.href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Button type="button" onClick={action.onClick} className={className} variant="ghost">
      {content}
    </Button>
  );
}
