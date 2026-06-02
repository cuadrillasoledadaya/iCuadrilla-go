import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

const ScannerContent = dynamic(() => import('./scanner-content'), { ssr: false });

export default function AsistenciaScanner() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Spinner size="lg" />
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}
