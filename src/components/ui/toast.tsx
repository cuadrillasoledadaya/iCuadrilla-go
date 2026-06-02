'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastInput {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastInput, 'title' | 'description'>> {
  id: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  success: (description: string, title?: string) => string;
  error: (description: string, title?: string) => string;
  info: (description: string, title?: string) => string;
  warning: (description: string, title?: string) => string;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

const iconMap: Record<ToastVariant, React.ComponentType<{ size?: number }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styleMap: Record<ToastVariant, string> = {
  success: 'border-emerald-200/60 bg-white text-neutral-900',
  error: 'border-red-200/60 bg-white text-neutral-900',
  info: 'border-blue-200/60 bg-white text-neutral-900',
  warning: 'border-amber-200/60 bg-white text-neutral-900',
};

const iconColorMap: Record<ToastVariant, string> = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-amber-600',
};

const defaultTitleMap: Record<ToastVariant, string> = {
  success: 'Éxito',
  error: 'Error',
  info: 'Información',
  warning: 'Atención',
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = makeId();
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'info',
        duration: input.duration ?? 4000,
      };
      setItems((prev) => [...prev, item]);
      if (item.duration > 0) {
        const timer = setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const helpers = React.useMemo<ToastContextValue>(
    () => ({
      toast,
      dismiss,
      success: (description, title) => toast({ description, title, variant: 'success' }),
      error: (description, title) => toast({ description, title, variant: 'error' }),
      info: (description, title) => toast({ description, title, variant: 'info' }),
      warning: (description, title) => toast({ description, title, variant: 'warning' }),
    }),
    [toast, dismiss]
  );

  React.useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach((timer) => clearTimeout(timer));
      t.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={helpers}>
      <Dialog.Root open={items.length > 0}>
        <Dialog.Portal>
          {items.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
          ))}
        </Dialog.Portal>
      </Dialog.Root>
      {children}
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon = iconMap[item.variant];
  return (
    <Dialog.Content
      data-testid="toast"
      data-variant={item.variant}
      onEscapeKeyDown={onDismiss}
      className={cn(
        'fixed bottom-6 right-6 z-[200] w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300',
        styleMap[item.variant]
      )}
    >
      <div className={cn('shrink-0 mt-0.5', iconColorMap[item.variant])}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <Dialog.Title
          className={cn(
            'text-sm font-bold leading-tight',
            !item.title && 'sr-only'
          )}
        >
          {item.title ?? defaultTitleMap[item.variant]}
        </Dialog.Title>
        {item.description && (
          <Dialog.Description className="text-xs text-neutral-600 leading-snug">
            {item.description}
          </Dialog.Description>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar"
        className="shrink-0 text-neutral-400 hover:text-neutral-900 transition-colors"
      >
        <X size={16} />
      </button>
    </Dialog.Content>
  );
}
