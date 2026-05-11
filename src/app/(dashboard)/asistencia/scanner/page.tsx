import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ScannerContent = dynamic(() => import('./scanner-content'), { ssr: false });

export default function AsistenciaScanner() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}
