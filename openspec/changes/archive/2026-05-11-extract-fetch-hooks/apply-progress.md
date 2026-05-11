# Apply Progress: extract-fetch-hooks — SLICE 2/3

**Date**: 2026-05-11
**Mode**: Standard (strict_tdd: false, no test runner)
**Resolution**: auto-chain via stacked-to-main — PR 2 of 3

## Completed Tasks (PR 1 + PR 2)

### Phase 1: Foundation
- [x] 1.1 `src/hooks/utils.ts` — `buildCacheKey(entity, filters?)` with `hashString` for URL-safe keys. Format: `{entity}_{filterHash}`; offline-utils.ts prepends `icuadrilla_cache_`.
- [x] 1.2 `src/hooks/useFetch.ts` — generic `useFetch<T>(table, options)` with cache-first strategy, loading/error states, `refetch()`. Cache fallback on network error serves expired cache silently. Serialized filter/order strings ensure stable `useCallback` identity.
- [x] 1.3 `FetchOptions<T>` and `UseFetchResult<T>` defined in `useFetch.ts` — no `any` types, explicit `string | null` for error per design.

### Phase 2: Entity Hooks
- [x] 2.1 `src/hooks/useTemporadas.ts` — wraps `useFetch<Temporada>('temporadas')` with `order: created_at desc`. Exports `Temporada` interface. Returns `{ temporadas, loading, error, refetch }`.
- [x] 2.2 `src/hooks/useCuadrilla.ts` — wraps `useFetch<Costalero>('costaleros')` with filters `rol='costalero', estado='activo'`, orders `trabajadera ASC, apellidos ASC`. Exports `Costalero` interface and `UseCuadrillaOptions`. Accepts optional `roleReady` param (default: `true`). Role guard surfaces `loading=true` until role resolves.

### Phase 3: Page Migrations
- [x] 3.1 `src/app/(dashboard)/temporadas/page.tsx` — replaced `useEffect`+`fetchTemporadas` with `useTemporadas()`. Removed inline `supabase.from('temporadas')` fetch. Replaced `fetchTemporadas()` calls with `refetch()`. Null-guard `(temporadas ?? []).map(...)` for type safety. Mutation logic preserved.
- [x] 3.2 `src/app/(dashboard)/cuadrilla/page.tsx` — replaced `useEffect`+`fetchCuadrilla` with `useCuadrilla()`. Removed `supabase` import and local `Costalero` interface (now imported from hook). Added `(costaleros ?? [])` null guard. Search/filter UI, admin buttons, modal, and trabaja­dera grouping all preserved.

## Dependency: useFetch `orders` extension

`useFetch.ts` was extended to support `orders?: { column: string; ascending?: boolean }[]` in `FetchOptions`. When provided, `orders` takes precedence over `order` (single). This backward-compatible change enables the double-sort needed by cuadrilla (`trabajadera ASC, apellidos ASC`). `JSON.stringify(orders)` was added to useCallback deps for stable identity.

## Verification
- ✅ `npx tsc --noEmit` — zero TypeScript errors
- ✅ `npm run build` — successful, `/cuadrilla` page builds at 31.6 kB, `/temporadas` at 6.72 kB
- ✅ No inline `supabase.from().select()` in migrated cuadrilla page

## Remaining Tasks (PR 3)
- [ ] 2.3 `useEventos.ts` — PR 3
- [ ] 3.3 eventos page migration — PR 3
- [ ] 4.x Verification tasks (full)

## Files Changed
| File | Action | Description |
|------|--------|-------------|
| `src/hooks/utils.ts` | Created | `buildCacheKey` + `hashString` helpers |
| `src/hooks/useFetch.ts` | Created (PR1) + Extended (PR2) | Generic `useFetch<T>` with cache/error/refetch; added `orders` array support |
| `src/hooks/useTemporadas.ts` | Created | Entity hook for temporadas |
| `src/hooks/useCuadrilla.ts` | Created | Entity hook for cuadrilla with role guard |
| `src/app/(dashboard)/temporadas/page.tsx` | Modified | Migrated to `useTemporadas()` |
| `src/app/(dashboard)/cuadrilla/page.tsx` | Modified | Migrated to `useCuadrilla()` |

## Deviations from Design
- **useFetch `orders` extension**: Design documented single `order`; added `orders: []` array to support multi-column sorts. Backward-compatible — existing single-order usage unaffected. Documented in `FetchOptions`.
- **`roleReady` default**: Design says role guard is a parameter. Implemented as optional with default `true` so the hook works out-of-the-box without breaking pages that don't need role-based deferral.

## Issues Found
None.
