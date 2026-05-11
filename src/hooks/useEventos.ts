'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { saveToCache, getFromCache } from '@/lib/offline-utils';
import { buildCacheKey } from '@/hooks/utils';

/**
 * Shape of an evento row from Supabase.
 */
export interface Evento {
  id: string;
  titulo: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
  estado: 'pendiente' | 'en-curso' | 'finalizado';
  descripcion?: string;
  temporada_id?: string;
}

const SEASON_CACHE_KEY = 'active_season_name';
const DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for fetching eventos for the active season.
 *
 * Two-step fetch: (1) resolve active season, (2) fetch eventos filtered by season.
 * Both steps include offline-cache fallback via `offline-utils.ts`.
 *
 * Cache keys (namespaced via `icuadrilla_cache_` prefix from offline-utils):
 *   - Season name: `active_season_name`
 *   - Eventos: `eventos_{filterHash}` via `buildCacheKey` with `temporada_id` filter
 *
 * Cache-first strategy: serves cached data immediately while fetching fresh data.
 * On network failure, falls back to expired cache silently if available.
 *
 * @returns { eventos, loading, error, activeSeasonName, refetch }
 */
export function useEventos() {
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSeasonName, setActiveSeasonName] = useState('');

  const fetchData = useCallback(async () => {
    // Serve cached season name immediately while fetching
    const cachedSeasonName = getFromCache<string>(SEASON_CACHE_KEY);
    if (cachedSeasonName) setActiveSeasonName(cachedSeasonName);

    try {
      // Step 1 — Fetch active season
      const { data: activeSeason, error: seasonError } = await supabase
        .from('temporadas')
        .select('id, nombre')
        .eq('activa', true)
        .single();

      if (seasonError) throw seasonError;

      if (!activeSeason) {
        setEventos([]);
        setError(null);
        setLoading(false);
        return;
      }

      setActiveSeasonName(activeSeason.nombre);
      saveToCache(SEASON_CACHE_KEY, activeSeason.nombre);

      // Step 2 — Fetch eventos for the active season
      const cacheKey = buildCacheKey('eventos', { temporada_id: activeSeason.id });

      // Cache-first: show fresh cached data while network fetch is in-flight
      const cached = getFromCache<Evento[]>(cacheKey, DEFAULT_MAX_AGE);
      if (cached) {
        setEventos(cached);
        setLoading(false);
        setError(null);
      }

      try {
        const { data: eventosData, error: eventosError } = await supabase
          .from('eventos')
          .select('*')
          .eq('temporada_id', activeSeason.id)
          .order('fecha_inicio', { ascending: true });

        if (eventosError) throw eventosError;

        const result = (eventosData as Evento[]) ?? [];
        setEventos(result);
        saveToCache(cacheKey, result);
        setError(null);
      } catch (eventosErr: unknown) {
        // Network failed — try expired cache as silent fallback
        const fallback = getFromCache<Evento[]>(cacheKey);
        if (fallback) {
          setEventos(fallback);
          setError(null);
        } else {
          setEventos([]);
          setError(
            eventosErr instanceof Error ? eventosErr.message : 'No se pudo conectar'
          );
        }
      }
    } catch (err: unknown) {
      // Season fetch failed — no fallback path without the temporada_id
      setEventos([]);
      setError(err instanceof Error ? err.message : 'No se pudo conectar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { eventos, loading, error, activeSeasonName, refetch: fetchData };
}
