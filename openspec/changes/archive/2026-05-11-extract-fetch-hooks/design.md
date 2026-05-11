# Design: extract-fetch-hooks

## Technical Approach

Extraer la lógica de fetching en hooks reutilizables por entidad, unificando cache + offline + estados de carga/error. Cada hook sigue el patrón: `use<Entity>` en `src/hooks/` con cache strategy via `offline-utils.ts`.

## Architecture Decisions

### Decision: Cache key strategy

**Choice**: Namespace `icuadrilla_cache_{entity}_{filters_hash}`
**Alternatives considered**: Separate prefix per hook, UUID-based keys
**Rationale**: Coincide con prefijo existente en `offline-utils.ts` (`icuadrilla_cache_`). Filtros hasheados evitan colisiones sin perder legibilidad para debug.

### Decision: Hook composition

**Choice**: Un hook genérico `useFetch<T>(table, options)` + hooks específicos por entidad
**Alternatives considered**: Solo hooks específicos, solo un hook genérico con factories
**Rationale**: `useFetch` cubre 80% de los casos (listados). Hooks específicos (`useTemporadas`, `useCuadrilla`) encapsulan lógica de negocio (filtros, órdenes, relaciones) que el genérico no conocería.

### Decision: Cache expiration default

**Choice**: 5 minutos para listados, 15 minutos para entidades individuales
**Alternatives considered**: Sin expiración, expiración corta (1 min)
**Rationale**: Balance entre offline resilience y datos frescos. Eventos/page.tsx ya usa cache sin expiración, pero queremos frescura para datos que cambian (estado de eventos).

## Data Flow

```
Component ──→ useFetch<T>(table, options)
                    │
                    ├── check cache ──→ setData (cache hit, no fetch)
                    │
                    └── supabase.from(table).select() ──→ setData + saveToCache
                                                       ──→ setError (on failure)

offline-utils.ts
  saveToCache(key, data)     ──→ localStorage[`icuadrilla_cache_${key}`]
  getFromCache<T>(key, maxAge?) ──→ localStorage[`icuadrilla_cache_${key}`] | null
```

## Hooks API

### useFetch<T>(table, options?)

```typescript
interface FetchOptions {
  filters?: Record<string, any>   // supabase .eq() mappings
  order?: { column: string; ascending?: boolean }
  cacheKey?: string              // custom key, default: table+filters
  maxAgeMs?: number              // cache expiration, default: 5min
  dependencies?: any[]           // refetch trigger array
}

interface UseFetchResult<T> {
  data: T[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Usage
const { data: temporadas, loading } = useFetch<Temporada>('temporadas', {
  order: { column: 'created_at', ascending: false },
  maxAgeMs: 5 * 60 * 1000
})
```

### useTemporadas()

```typescript
// Returns: { temporadas, loading, refetch }
```

### useCuadrilla()

```typescript
// Filters: rol='costalero', estado='activo'
// Order: trabajadera ASC, apellidos ASC
```

### useEventos(activeSeasonId?)

```typescript
// Returns: { eventos, loading, activeSeasonName }
```

### useEntity<T>(table, id)

```typescript
// Single entity fetch with 15min cache
// Returns: { entity, loading, error }
```

## Cache Key Strategy

```typescript
// src/hooks/utils.ts
const CACHE_PREFIX = 'icuadrilla_cache_'

function buildCacheKey(entity: string, filters?: Record<string, any>): string {
  const filterStr = filters 
    ? Object.entries(filters).sort().map(([k,v]) => `${k}=${v}`).join('&')
    : ''
  return `${entity}_${hashString(filterStr)}` // hash = simple string hash for URL-safe keys
}
```

Key format: `icuadrilla_cache_{entity}_{filterHash}`

## Interacción con offline-utils.ts

Los hooks usan directamente las funciones existentes de `offline-utils.ts`:

```typescript
// In hooks
import { saveToCache, getFromCache } from '@/lib/offline-utils'

const cached = getFromCache<T[]>(cacheKey, maxAgeMs)
if (cached) return { data: cached, loading: false, error: null }
```

No se modifica `offline-utils.ts`. Los hooks encapsulan el prefijo y la lógica de cache.

## Manejo de Errores

| Scenario | Behavior |
|----------|----------|
| Cache hit + network fail | Return cached data, no error shown |
| Cache miss + network fail | `error: 'No se pudo conectar'`, data=null |
| No cache + network fail | `error: 'No se pudo conectar'`, data=null |

Error state se setea solo si no hay cache o el cache falla. El usuario nunca ve pantalla de error si tiene datos frescos.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useFetch.ts` | Create | Generic fetch hook with cache |
| `src/hooks/useTemporadas.ts` | Create | Temporadas list hook |
| `src/hooks/useCuadrilla.ts` | Create | Costaleros list hook |
| `src/hooks/useEventos.ts` | Create | Eventos list hook |
| `src/hooks/useEntity.ts` | Create | Single entity fetch |
| `src/hooks/utils.ts` | Create | Cache key builder helper |
| `src/app/(dashboard)/temporadas/page.tsx` | Modify | Use useTemporadas |
| `src/app/(dashboard)/cuadrilla/page.tsx` | Modify | Use useCuadrilla |
| `src/app/(dashboard)/eventos/page.tsx` | Modify | Use useEventos |

## Migration Order

**Phase 1** (no cache, simplest):
- `temporadas/page.tsx` — sin cache aún, solo extrae fetch
- `cuadrilla/page.tsx` — sin cache aún, solo extrae fetch

**Phase 2** (existing cache):
- `eventos/page.tsx` — YA usa cache, refactoriza a useEventos

**Phase 3** (remaining pages):
- remaining 27 pages con useEffect patterns

## Rollback Plan

1. Cada página guarda backup del archivo original antes de modificar
2. Si hook falla, revert individual page: importar logic directamente como antes
3. Hooks viven en paralelo — ningún page depende exclusively de un hook hasta que se migren TODAS las páginas que lo usan
4. Si rollback global necesario: `git checkout` de las páginas migradas, eliminar archivos de hooks

## Open Questions

- [ ] ¿Usar SWR o React Query para cache+revalidation en lugar de localStorage manual?
- [ ] ¿Soportar paginación en useFetch o solo listados completos?
- [ ] ¿Invalidar cache on mutations (create/update/delete) o confiar en maxAge?