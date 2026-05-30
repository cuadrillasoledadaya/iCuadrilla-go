'use client';

import { useFetch } from '@/hooks/useFetch';

/**
 * Shape of a costalero row from Supabase.
 */
export interface Costalero {
  id: string;
  nombre: string;
  apellidos: string;
  apodo?: string;
  trabajadera: number;
  puesto: string;
  puesto_secundario?: string;
}

export interface UseCuadrillaOptions {
  /**
   * When false, the hook returns loading=true until role resolution completes.
   * Defaults to true so the hook works out-of-the-box for pages that don't
   * need to defer fetching behind role resolution.
   */
  roleReady?: boolean;
}

/**
 * Hook for fetching the active costaleros list (cuadrilla).
 *
 * Filters: rol='costalero', estado='activo'
 * Orders: trabajadera ASC, then apellidos ASC
 * Cache key: auto-generated from table + filters via buildCacheKey
 * Cache max age: 5 minutes (default from useFetch)
 *
 * @param options.roleReady — defer query until role is resolved (default: true)
 * @returns { costaleros, loading, error, refetch }
 */
export function useCuadrilla(options: UseCuadrillaOptions = {}) {
  const { roleReady = true } = options;

  const {
    data: costaleros,
    loading,
    error,
    refetch,
  } = useFetch<Costalero>('costaleros', {
    filters: { rol: 'costalero', estado: 'activo' },
    orders: [
      { column: 'trabajadera', ascending: true },
      { column: 'apellidos', ascending: true },
    ],
  });

  // When role is not ready, surface loading state to the caller
  const effectiveLoading = !roleReady || loading;

  return { costaleros, loading: effectiveLoading, error, refetch };
}
