import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function ErrorState({
  title = 'No se pudo cargar la información',
  description = 'Revisa tu conexión e inténtalo de nuevo.',
  onRetry,
  retryLabel = 'Reintentar',
  className,
  icon,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      data-testid="error-state"
      className={cn(
        'flex flex-col items-center justify-center text-center space-y-4 p-8 rounded-3xl border border-red-100 bg-red-50/60 min-h-[140px]',
        className
      )}
    >
      <div className="inline-flex p-3 rounded-2xl bg-white text-red-500 border border-red-100 shadow-sm">
        {icon ?? <AlertCircle size={26} strokeWidth={1.75} />}
      </div>
      <div className="space-y-1">
        <p className="font-bold text-sm text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500 max-w-xs">{description}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center h-10 px-4 rounded-2xl bg-neutral-900 text-white text-xs font-black uppercase tracking-widest hover:bg-neutral-800 active:scale-95 transition-all"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
