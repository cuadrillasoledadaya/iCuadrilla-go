import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'iCuadrilla - Gestión de Costaleros',
  description: 'App privada para la gestión de cuadrillas de costaleros',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/icons/icon-512x512.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: [{ url: '/apple-touch-icon.jpg', sizes: '180x180', type: 'image/jpeg' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'iCuadrilla',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    title: 'iCuadrilla - Gestión de Costaleros',
    description: 'La gestión de tu cuadrilla, en la palma de tu mano.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'iCuadrilla' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iCuadrilla - Gestión de Costaleros',
    description: 'La gestión de tu cuadrilla, en la palma de tu mano.',
    images: ['/og-image.jpg'],
  },
};

export const viewport = {
  themeColor: '#0a0a0a',
};

import { LayoutProvider } from '@/components/layout-context';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top';
import { OfflineBanner } from '@/components/offline-banner';
import { SyncProvider } from '@/components/sync-provider';
import { SessionTimeout } from '@/components/session-timeout';
import { ToastProvider } from '@/components/ui/toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <style>{`
          /* Critical splash prevention - execute before CSS loads */
          html, body { background: #0a0a0a !important; }
        `}</style>
      </head>
      <body className={inter.className}>
        <SessionTimeout />
        <OfflineBanner />
        <SyncProvider>
          <LayoutProvider>
            <ToastProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ToastProvider>
          </LayoutProvider>
        </SyncProvider>
        <ScrollToTopButton />
      </body>
    </html>
  );
}
