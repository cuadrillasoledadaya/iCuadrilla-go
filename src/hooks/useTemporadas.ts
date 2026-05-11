'use client';

import { useFetch } from '@/hooks/useFetch';

/**
 * Shape of a temporada row from Supabase.
 */
export interface Temporada {
  id: string;
  nombre: string;
  activa: boolean;
  created_at: string;
}

/**
 * Hook for fetching all temporadas ordered by creation date (newest first).
 *
 * Cache key: `temporadas_0` (auto-generated from table + no-filters).
 * Cache max age: 5 minutes (default from useFetch).
 *
 * @returns { temporadas, loading, error, refetch }
 */
export function useTemporadas() {
  const { data: temporadas, loading, error, refetch } = useFetch<Temporada>('temporadas', {
    order: { column: 'created_at', ascending: false },
  });

  return { temporadas, loading, error, refetch };
}
