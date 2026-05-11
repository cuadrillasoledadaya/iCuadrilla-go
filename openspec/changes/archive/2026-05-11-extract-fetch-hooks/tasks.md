# Tasks: Extract Fetch Hooks

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350-450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation → PR 2: useCuadrilla → PR 3: useEventos |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Generic useFetch + utils + temporadas migration | PR 1 | Base branch; proves hook pattern |
| 2 | useCuadrilla + cuadrilla migration | PR 2 | Depends on PR 1; adds role guard |
| 3 | useEventos + eventos migration | PR 3 | Depends on PR 1; cache + status sync |

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Create `src/hooks/utils.ts` with `buildCacheKey(entity, filters?)` helper
- [x] 1.2 Create `src/hooks/useFetch.ts` with generic `useFetch<T>(table, options)` hook: cache-first via `getFromCache`/`saveToCache`, loading/error states, `refetch()`
- [x] 1.3 Define `FetchOptions` and `UseFetchResult<T>` interfaces in `useFetch.ts` (no `any` types)

## Phase 2: Entity Hooks

- [x] 2.1 Create `src/hooks/useTemporadas.ts` — `useFetch<Temporada>('temporadas')` with order `created_at desc`
- [x] 2.2 Create `src/hooks/useCuadrilla.ts` — `useFetch<Costalero>('costaleros')` with filters `rol='costalero'`, `estado='activo'`, order `trabajadera asc, apellidos asc`, `roleReady` guard
- [ ] 2.3 Create `src/hooks/useEventos.ts` — `useFetch<Evento>('eventos')` with season filter, custom sort, cache for season name, `activeSeasonName` return

## Phase 3: Page Migrations

- [x] 3.1 Migrate `src/app/(dashboard)/temporadas/page.tsx` — replace `useEffect`+`fetchTemporadas` with `useTemporadas()`, preserve mutation logic
- [x] 3.2 Migrate `src/app/(dashboard)/cuadrilla/page.tsx` — replace `useEffect`+`fetchCuadrilla` with `useCuadrilla()`, preserve search/filter UI
- [ ] 3.3 Migrate `src/app/(dashboard)/eventos/page.tsx` — replace `useEffect`+`fetchEventos` with `useEventos()`, preserve status sync interval and expand/collapse

## Phase 4: Verification

- [ ] 4.1 Run `npm run build` — zero TypeScript errors
- [ ] 4.2 Verify temporadas page render parity pre/post migration
- [ ] 4.3 Verify cuadrilla page render parity pre/post migration
- [ ] 4.4 Verify eventos page render parity pre/post migration
- [ ] 4.5 Confirm no inline `supabase.from().select()` fetch patterns remain in migrated pages
- [ ] 4.6 Confirm cache keys use `icuadrilla_cache_` prefix via `offline-utils.ts`
