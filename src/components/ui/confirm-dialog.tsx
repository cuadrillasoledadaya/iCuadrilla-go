'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-desc' : undefined}
        className="relative w-full max-w-sm bg-white rounded-3xl border border-black/5 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3">
          {variant === 'danger' && (
            <div className="shrink-0 p-2.5 rounded-2xl bg-red-50 text-red-500 border border-red-100">
              <AlertTriangle size={22} strokeWidth={1.75} />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h2
              id="confirm-dialog-title"
              className="text-base font-black text-neutral-900 leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id="confirm-dialog-desc"
                className="text-xs text-neutral-500 leading-snug"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-2xl bg-neutral-100 text-neutral-700 text-xs font-black uppercase tracking-widest hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 h-11 rounded-2xl text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50',
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-neutral-900 hover:bg-neutral-800'
            )}
          >
            {loading ? 'Cargando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
