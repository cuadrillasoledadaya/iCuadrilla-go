'use client';

import Image from 'next/image';

export default function Loading() {
  return (
    <div data-testid="loading-splash" className="flex min-h-[100dvh] flex-col items-center justify-center bg-black transition-colors duration-300">
      <div className="relative w-32 h-32 opacity-80">
        <Image
          src="/escudo.png"
          alt="Escudo Hermandad"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}