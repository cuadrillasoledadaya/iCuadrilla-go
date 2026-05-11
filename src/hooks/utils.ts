'use client';

/**
 * Simple string hash for generating URL-safe cache key segments.
 * Not cryptographic — used only for key deduplication.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Build a namespaced cache key for an entity with optional filters.
 *
 * Key format: `{entity}_{filterHash}`
 * offline-utils.ts prepends `icuadrilla_cache_` automatically.
 * Filter hash is URL-safe (base-36 integer).
 */
export function buildCacheKey(entity: string, filters?: Record<string, unknown>): string {
  const filterStr = filters
    ? Object.entries(filters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : '';
  const filterHash = hashString(filterStr);
  return `${entity}_${filterHash}`;
}
