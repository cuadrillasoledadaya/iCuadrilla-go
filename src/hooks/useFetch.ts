'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { saveToCache, getFromCache } from '@/lib/offline-utils';
import { buildCacheKey } from '@/hooks/utils';

/**
 * Options for configuring the useFetch hook behavior.
 */
export interface FetchOptions<T = unknown> {
  /** Column-value pairs applied as `.eq()` filters on the query */
  filters?: Record<string, unknown>;
  /** Single order clause: column name and direction */
  order?: { column: string; ascending?: boolean };
  /** Multiple order clauses applied sequentially. Takes precedence over `order`. */
  orders?: { column: string; ascending?: boolean }[];
  /** Custom cache key (overrides auto-generated key) */
  cacheKey?: string;
  /** Cache expiration in milliseconds (default: 5 minutes) */
  maxAgeMs?: number;
  /** Additional dependency array for manual refetch triggers */
  dependencies?: unknown[];
}

/**
 * Return shape of the useFetch hook.
 */
export interface UseFetchResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5 minutes

/**
 * Generic data-fetching hook with offline-cache fallback.
 *
 * Cache-first: checks localStorage before hitting Supabase.
 * On network failure, serves expired cache if available.
 *
 * @example
 * const { data: temporadas, loading } = useFetch<Temporada>('temporadas', {
 *   order: { column: 'created_at', ascending: false }
 * });
 */
export function useFetch<T = unknown>(
  table: string,
  options: FetchOptions<T> = {}
): UseFetchResult<T> {
  const {
    filters,
    order,
    orders,
    cacheKey: customCacheKey,
    maxAgeMs = DEFAULT_MAX_AGE,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate cache key from table + filters when no custom key provided
  const cacheKey = customCacheKey ?? buildCacheKey(table, filters);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // 1. Check cache (within maxAge)
    const cached = getFromCache<T[]>(cacheKey, maxAgeMs);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      // 2. Build Supabase query
      let query = supabase.from(table).select('*');

      if (filters) {
        for (const [col, val] of Object.entries(filters)) {
          query = query.eq(col, val);
        }
      }

      if (orders && orders.length > 0) {
        for (const o of orders) {
          query = query.order(o.column, { ascending: o.ascending ?? true });
        }
      } else if (order) {
        query = query.order(order.column, {
          ascending: order.ascending ?? true,
        });
      }

      const { data: freshData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const result = (freshData as T[]) ?? [];
      setData(result);
      saveToCache(cacheKey, result);
      setError(null);
    } catch (err: unknown) {
      // 3. On network failure, try expired cache as fallback
      const fallback = getFromCache<T[]>(cacheKey);
      if (fallback) {
        setData(fallback);
        setError(null); // cache served — no error exposed to user
      } else {
        setData([]);
        setError(err instanceof Error ? err.message : 'No se pudo conectar');
      }
    } finally {
      setLoading(false);
    }
    // Intentionally serialized deps: JSON.stringify produces stable references
    // across renders when filter/order objects are semantically equal, avoiding
    // unnecessary re-creations without deep comparison overhead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, cacheKey, maxAgeMs, JSON.stringify(filters), JSON.stringify(orders), JSON.stringify(order)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}
