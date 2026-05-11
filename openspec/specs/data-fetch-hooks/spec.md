# Data Fetch Hooks Specification

## Purpose

Define reusable per-entity data-fetching hooks for the iCuadrilla dashboard. Each hook encapsulates Supabase reads, loading/error states, and offline cache fallback, replacing duplicated `useEffect` + fetch patterns across 12+ pages.

## Requirements

### Requirement: Hook Contract

Each entity hook MUST expose a consistent return shape: `{ data: T[], loading: boolean, error: Error | null }`. The hook name MUST follow the convention `use<EntityPlural>` (e.g., `useCostaleros`, `useAnuncios`).

| Hook | Data Type | Source Table |
|------|-----------|-------------|
| `useCostaleros` | `Costalero[]` | `costaleros` |
| `useAnuncios` | `Anuncio[]` | `anuncios` |
| `useTemporadas` | `Temporada[]` | `temporadas` |
| `useEventos` | `Evento[]` | `eventos` |

#### Scenario: Hook returns data on successful fetch

- GIVEN the user is authenticated and online
- WHEN the hook is mounted in a component
- THEN `loading` is `true` initially, then `false`
- AND `data` contains the entity records from Supabase
- AND `error` is `null`

#### Scenario: Hook returns error on failed fetch

- GIVEN the Supabase query fails (network error or permission denied)
- WHEN the hook completes its fetch cycle
- THEN `loading` is `false`
- AND `error` is a non-null `Error` with a descriptive message
- AND `data` is an empty array

#### Scenario: Hook returns empty array when no records exist

- GIVEN the entity table has zero records for the user's cuadrilla
- WHEN the hook completes its fetch cycle
- THEN `loading` is `false`
- AND `data` is an empty array `[]`
- AND `error` is `null`

### Requirement: Offline Cache Fallback

Each hook MUST attempt to read from `localStorage` offline cache when Supabase fetch fails due to network unavailability. Cache keys MUST be namespaced with the entity prefix (e.g., `costaleros:list`, `anuncios:list`).

#### Scenario: Online fetch succeeds, cache is updated

- GIVEN the user is online and fetch succeeds
- WHEN the hook receives data from Supabase
- THEN the data is written to `localStorage` under the entity's cache key

#### Scenario: Offline fallback returns cached data

- GIVEN cached data exists in `localStorage` for the entity
- AND the Supabase fetch fails due to network error
- WHEN the hook handles the error
- THEN `loading` is `false`
- AND `data` is populated from `localStorage` cache
- AND `error` is `null` (cache served as fallback)

#### Scenario: No cache and offline returns empty with error

- GIVEN no cached data exists for the entity
- AND the Supabase fetch fails
- WHEN the hook handles the error
- THEN `loading` is `false`
- AND `data` is an empty array
- AND `error` is non-null

### Requirement: Role Loading Guard

Hooks that depend on user role (e.g., `costaleros` filtered by cuadrilla) MUST NOT fire the Supabase query until the user role is resolved. The hook SHOULD accept an optional `roleReady` boolean parameter, defaulting to `true` for hooks that do not need role context.

#### Scenario: Hook waits for role resolution

- GIVEN `roleReady` is `false`
- WHEN the hook is mounted
- THEN `loading` is `true`
- AND no Supabase query is executed

#### Scenario: Hook fires after role is ready

- GIVEN `roleReady` transitions from `false` to `true`
- WHEN the effect re-runs
- THEN the Supabase query executes with the resolved role context

### Requirement: Page Migration

Each affected page MUST replace its inline `useEffect` + fetch + `setState` pattern with the corresponding entity hook. Sorting, filtering, and UI-specific logic MUST remain in the page component — the hook only provides raw data.

Affected pages:
| Page | Hook |
|------|------|
| `cuadrilla/page.tsx` | `useCostaleros` |
| `relevos/page.tsx` | `useCostaleros` |
| `anuncios/page.tsx` | `useAnuncios` |
| `temporadas/page.tsx` | `useTemporadas` |
| `eventos/page.tsx` | `useEventos` |

#### Scenario: Page uses hook instead of inline fetch

- GIVEN a page previously had a `useEffect` that fetched entities
- WHEN the migration is complete
- THEN the page calls the entity hook at the top of the component
- AND the `useEffect` + fetch + `setState` block is removed
- AND the rendered output is functionally identical

#### Scenario: Sorting/filtering remains in page component

- GIVEN `eventos/page.tsx` has custom date sorting and status filtering
- WHEN the migration to `useEventos` is complete
- THEN the hook returns unsorted/unfiltered events
- AND the page component applies sorting/filtering to `data` before rendering

### Requirement: No Regression in Rendered Output

After migration, each page MUST render the same data as before. The hook is a pure extraction — no business logic, filtering, or transformation changes are permitted within this scope.

#### Scenario: Cuadrilla page renders same costaleros list

- GIVEN the migration of `cuadrilla/page.tsx` to `useCostaleros`
- WHEN the page loads with the same Supabase data
- THEN the rendered list of costaleros matches the pre-migration output exactly

#### Scenario: Anuncios page renders same announcements

- GIVEN the migration of `anuncios/page.tsx` to `useAnuncios`
- WHEN the page loads
- THEN the announcement cards match the pre-migration output

### Requirement: TypeScript Compliance

All hooks MUST be fully typed. The return type MUST be an explicit interface or type alias. No `any` types are permitted.

#### Scenario: Hook types are exported and consumable

- GIVEN a hook file `src/hooks/useCostaleros.ts`
- WHEN the file is imported by a page component
- THEN TypeScript resolves all types without errors
- AND the component can destructure `{ data, loading, error }` with correct inference

## Acceptance Criteria

1. All 4 hooks exist in `src/hooks/` with explicit return types `{ data: T[], loading: boolean, error: Error | null }`
2. All 5 affected pages use their corresponding hook; zero inline `useEffect` + fetch patterns remain in those pages
3. Cache keys use entity-prefixed namespace format (`{entity}:list`)
4. Offline fallback reads from `localStorage` when Supabase is unreachable
5. Hooks with role dependency accept `roleReady` parameter and defer query until `true`
6. `npm run build` completes with zero TypeScript errors
7. No business logic (sorting, filtering, transformation) moved into hooks — pages retain UI-specific logic
8. Rendered output on all 5 pages is functionally identical pre/post migration

---

## Delivery Status (extract-fetch-hooks change)

This section documents deviations from the original spec and tracks what was actually delivered.

### Delivered (2026-05-11)

| Artifact | Status | Notes |
|----------|--------|-------|
| `useFetch<T>(table, options)` | DELIVERED | Generic hook composing cache-first + offline fallback |
| `useTemporadas()` | DELIVERED | Wraps `useFetch` with order `created_at desc` |
| `useCuadrilla({ roleReady })` | DELIVERED | Wraps `useFetch` with filters `rol='costalero'`, `estado='activo'`, orders `trajadera asc, apellidos asc` |
| `useEventos(activeSeasonId?)` | DELIVERED | Own cache-first implementation (does NOT compose `useFetch`) |
| `tempordas/page.tsx` migration | DELIVERED | Uses `useTemporadas()` hook |
| `cuadrilla/page.tsx` migration | DELIVERED | Uses `useCuadrilla()` hook |
| `eventos/page.tsx` migration | DELIVERED | Uses `useEventos()` hook |

### Pending (follow-up change needed)

| Artifact | Status | Notes |
|----------|--------|-------|
| `useAnuncios()` | NOT DELIVERED | Hook for anuncios entity — requires new SDD change |
| `relevos/page.tsx` migration | NOT DELIVERED | Would use `useCuadrilla()` — requires new SDD change |
| `anuncios/page.tsx` migration | NOT DELIVERED | Would use `useAnuncios()` — requires new SDD change |

### Naming Deviations

| Spec Name | Implemented Name | Rationale |
|-----------|-----------------|-----------|
| `useCostaleros` | `useCuadrilla` | Domain-appropriate name; filters by `rol='costalero'` but returns the "cuadrilla" (team) view |

### Technical Debt

- **useEventos bypasses useFetch**: `useEventos.ts` implements its own cache-first logic inline instead of composing the generic `useFetch<T>`. This is justified by its two-step fetch pattern (active season + filtered events) but creates a parallel cache pattern. If more multi-step hooks emerge, consider extracting a `useFetchWithDeps` or composable pattern.
- **temporadas/page.tsx still imports supabase directly**: The import is for mutations (create/activate), which is out of scope for data-fetching hooks. Consider adding a comment clarifying it's mutation-only.