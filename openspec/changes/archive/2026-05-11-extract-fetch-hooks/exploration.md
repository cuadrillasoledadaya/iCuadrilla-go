# Exploration: extract-fetch-hooks

## Topic
Refactor repeated `useEffect` → Supabase fetch → `localStorage.setItem` → `setState` pattern into shared hooks.

---

## Current State

### Offline Infrastructure (already exists)

**`src/lib/offline-utils.ts`** — Generic cache layer:
- `saveToCache(key, data)` → localStorage key `icuadrilla_cache_{key}` with timestamp
- `getFromCache<T>(key, maxAgeMs?)` → returns cached data if not expired
- `addToSyncQueue(action)` / `getSyncQueue()` / `removeFromSyncQueue(id)` — sync queue for offline mutations

**`src/components/sync-provider.tsx`** — Processes queue on reconnect:
- Only handles `type: 'attendance_update'` (hardcoded)
- 30-second interval + `online` event trigger
- Generic Supabase upsert/delete with `onConflict: 'costalero_id,evento_id'`

### Pattern Distribution (33 dashboard pages analyzed)

| Page | Cache Pattern | Offline Sync | Complexity |
|------|-------------|--------------|------------|
| `dashboard/page.tsx` | ✅ Full | ❌ | HIGH — parallel Promise.all, carousel refs, anniversary check |
| `eventos/page.tsx` | ✅ Full | ❌ | MED — sorting/filtering in-component |
| `eventos/[id]/asistentes/page.tsx` | ✅ Full | ✅ attendance_update | MED — combines cache + sync queue |
| `cuadrilla/page.tsx` | ❌ None | ❌ | LOW — pure fetch → setState |
| `relevos/page.tsx` | ❌ None | ❌ | LOW — pure fetch → setState |
| `temporadas/page.tsx` | ❌ None | ❌ | MED — clone logic embedded |
| `anuncios/page.tsx` | ❌ None | ❌ | LOW — pure fetch + CRUD |
| `estadisticas/page.tsx` | ❌ None | ❌ | LOW — pure fetch → CSV/PDF export |
| `perfil/page.tsx` | ❌ None | ❌ | LOW — userId-driven fetch |
| `notificaciones/page.tsx` | ❌ None | ❌ | MED — dual role queries |
| `eventos/[id]/page.tsx` | ❌ None | ❌ | HIGH — stats calc, absence modal, notifications |
| `asistencia/scanner/page.tsx` | ❌ None | ❌ | LOW — QR camera logic |
| `asistencia/ausencia/page.tsx` | ❌ None | ❌ | LOW — form submission |
| `costaleros/nuevo/page.tsx` | ❌ None | ❌ | LOW — form submission |
| `datos-palio/page.tsx` | ❌ None | ❌ | MED — SVG chart state, blur autosave |

**Summary**: 3 pages use cache, 12 pages use pure fetch pattern, complexity varies.

---

## Affected Areas

- `src/lib/offline-utils.ts` — Core cache API (generic, page-agnostic)
- `src/components/sync-provider.tsx` — **Hardcoded to `attendance_update` only** — blocks generic offline sync without modification
- `src/hooks/useUserRole.ts` — Existing shared hook; many pages depend on `roleLoading`
- `src/app/(dashboard)/**/page.tsx` — 33 candidate pages

---

## Approaches

### 1. **Generic `useCachedSupabase<T>(table, queryFn, cacheKey, options)` hook**

Extracts the fetch → cache → setState pattern into a reusable hook.

```typescript
// Strawman signature
function useCachedSupabase<T>(
  table: string,
  queryFn: () => Promise<SupabaseResult<T>>,
  cacheKey: string,
  options?: { maxAgeMs?: number, dependencies?: any[] }
): { data: T[], loading: boolean, refetch: () => void }
```

**Pros**:
- Centralizes `getFromCache` → `queryFn` → `saveToCache` → `setState`
- Single source of truth for cache key naming convention
- Enables cache invalidation strategies

**Cons**:
- Doesn't address offline mutations (only reads)
- Complex queryFn signatures vary per page
- Dashboard's parallel fetches don't map cleanly

**Effort**: Medium

---

### 2. **Per-entity hooks (`useEventos`, `useCostaleros`, `useAnuncios`, etc.)**

Each hook encapsulates one Supabase table's fetch logic.

```typescript
// Strawman
function useEventos(activeSeasonId?: string): { eventos: Evento[], loading: boolean }
function useCostaleros(): { costaleros: Costalero[], loading: boolean }
```

**Pros**:
- Matches how `useUserRole` is structured
- Each entity has consistent fetch logic across pages
- Easier to add caching later
- Separates data fetching from presentation

**Cons**:
- Doesn't automatically solve cache key management
- Offline sync still needs per-entity strategy
- 12+ hooks to create initially

**Effort**: Medium-High (many hooks)

---

### 3. **Hybrid: Per-entity hooks + Extended SyncProvider**

Build on Approach 2 and extend `SyncProvider` to handle multiple action types.

```typescript
// Extended SyncAction interface
type SyncAction = 
  | { type: 'attendance_update'; payload: AttendancePayload }
  | { type: 'event_update'; payload: EventPayload }
  | { type: 'anuncio_create'; payload: AnuncioPayload }
```

**Pros**:
- Complete solution with offline support
- Consistent pattern across all entities
- Future-proof for new features

**Cons**:
- Requires Supabase schema awareness per entity
- Sync conflict resolution gets complex
- Larger refactor surface

**Effort**: High

---

## Recommendation

**Approach 2 (Per-entity hooks) as default**, with **Approach 1 (generic cached hook) as optional optimization for simple cases**.

Defer Approach 3 (extending SyncProvider) unless offline write support is explicitly required for non-attendance entities.

### Rationale
- The codebase already has `useUserRole` as a model for per-domain hooks
- Most pages are **read-heavy with simple fetch → render** patterns
- Dashboard's complexity (parallel fetches, anniversary checks) may warrant staying as-is or being its own special hook
- `SyncProvider` coupling to `attendance_update` is a **hard constraint** — can't generically extend without modifying it

---

## Risks

1. **SyncProvider is attendance-specific**: The `SyncAction` type only supports `attendance_update`. Extracting other entities' writes to hooks requires extending the sync system (Approach 3) or those entities won't work offline.

2. **Cache key collision**: `saveToCache('eventos_list', ...)` and `saveToCache('eventos_list', ...)` on different pages overwrite each other. Extracted hooks need unique namespaced keys like `saveToCache('eventos:list', ...)`.

3. **Dependency on `useUserRole` loading state**: Many pages guard fetch with `if (roleLoading) return`. Hooks would need to either handle this internally or expose their own loading state.

4. **Dashboard's parallel fetches**: The dashboard's `Promise.all([eventosRes, proximosRes, anunciosRes, ...notifPromises])` is tightly integrated with carousel state and anniversary checks. Extracting just the fetch part is possible but leaves most of the component intact.

5. **Sort/filter logic embedded in components**: `eventos/page.tsx` does custom sorting after fetch. This logic either stays in the component or the hook needs to accept filter parameters.

---

## Ready for Proposal

**Yes** — with the following inputs needed from user:

1. Which entities are highest priority for extraction?
2. Is offline write support needed for non-attendance entities (eventos, anuncios, temporadas)?
3. Should Dashboard be included in the extraction or treated as a special case?
4. Should `SyncProvider` be extended to support generic action types?

**Suggested scope for v1**: Extract `useCostaleros`, `useAnuncios`, `useTemporadas` as lowest-risk starting points. Leave Dashboard, eventos (complex), and anything needing offline writes for later iterations.
