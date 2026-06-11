'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    const dismissedFlag = localStorage.getItem('pwa-install-dismissed');
    if (dismissedFlag) {
      const dismissedAt = Number(dismissedFlag);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < sevenDays) {
        setDismissed(true);
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setInstallEvent(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setInstallEvent(null);
      }
    } catch (error) {
      console.error('Error al instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
  };

  if (!showPrompt || dismissed || !installEvent) return null;

  return (
    <div
      data-testid="pwa-install-prompt"
      role="dialog"
      aria-labelledby="pwa-install-title"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500"
    >
      <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="shrink-0 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Download size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="pwa-install-title"
              className="text-sm font-black text-white uppercase tracking-wide italic"
            >
              Instalar iCuadrilla
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Instalá la app en tu dispositivo para acceso rápido y uso sin conexión.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-colors active:scale-95"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                aria-label="Cerrar"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-widest py-2.5 px-4 rounded-xl transition-colors active:scale-95"
              >
                Más tarde
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Cerrar"
            className="shrink-0 text-neutral-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
