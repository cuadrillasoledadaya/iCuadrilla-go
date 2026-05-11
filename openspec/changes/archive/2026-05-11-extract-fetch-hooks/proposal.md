# Proposal: extract-fetch-hooks

## Intent

Eliminar la duplicación del patrón `useEffect` → Supabase fetch → `setState` que aparece en 12+ páginas del dashboard. Extraer la lógica de fetching a hooks por entidad mejora la testabilidad, reduce el código repetitivo y unifica el manejo de estados de carga.

## Scope

### In Scope
- Crear hooks por entidad: `useCostaleros`, `useAnuncios`, `useTemporadas`, `useEventos`.
- Migrar páginas de baja/media complejidad que usan fetch puro: `cuadrilla`, `relevos`, `anuncios`, `temporadas`, `eventos`.
- Reutilizar `useUserRole` como modelo de estructura (loading + data + error).

### Out of Scope
- Dashboard (`dashboard/page.tsx`): contiene `Promise.all` paralelo, refs de carousel y lógica de aniversarios; requiere diseño propio.
- Páginas de formularios/escritura pura (`costaleros/nuevo`, `asistencia/scanner`, etc.) que no hacen fetch de listado.
- Extender `SyncProvider` para soportar mutaciones offline de otras entidades; `attendance_update` sigue siendo el único tipo soportado.
- Incluir lógica de ordenamiento/filtrado custom (ej: `eventos/page.tsx`) dentro del hook; eso permanece en el componente.

## Capabilities

### New Capabilities
- `data-fetch-hooks`: Hooks reutilizables por entidad para leer datos de Supabase en componentes cliente del dashboard.

### Modified Capabilities
- None (cambio puro de refactor; no altera requisitos funcionales existentes).

## Approach

**Per-entity hooks (Approach 2)**.

Cada entidad expone un hook que encapsula el `useEffect`, la llamada a Supabase y el estado local (`data`, `loading`, `error`). La firma sigue la convención de `useUserRole`:

```typescript
function useCostaleros(): { costaleros: Costalero[], loading: boolean, error: Error | null }
```

**Justificación**: El codebase ya usa `useUserRole` como hook de dominio, por lo que el patrón es familiar. Un hook genérico (Approach 1) obligaría a pasar `queryFn` complejas que varían por tabla y relaciones, generando más abstracción que valor. El híbrido con SyncProvider (Approach 3) es excesivo porque no hay requerimiento de offline writes para estas entidades.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/hooks/` | New | Nuevos hooks: `useCostaleros`, `useAnuncios`, `useTemporadas`, `useEventos` |
| `src/app/(dashboard)/cuadrilla/page.tsx` | Modified | Reemplaza inline fetch por `useCostaleros` |
| `src/app/(dashboard)/relevos/page.tsx` | Modified | Reemplaza inline fetch por `useCostaleros` |
| `src/app/(dashboard)/anuncios/page.tsx` | Modified | Reemplaza inline fetch por `useAnuncios` |
| `src/app/(dashboard)/temporadas/page.tsx` | Modified | Reemplaza inline fetch por `useTemporadas` |
| `src/app/(dashboard)/eventos/page.tsx` | Modified | Reemplaza inline fetch por `useEventos`; sorting/filter queda en página |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cache key collision si se agrega caching posteriormente | Low | Usar prefijo de entidad en keys (`costaleros:list`) desde el inicio |
| Dependencia en `roleLoading` que rompe fetching en algunas páginas | Med | Validar que el nuevo hook espere el role o lo reciba como parámetro si es necesario |
| Scope creep hacia Dashboard o SyncProvider | Med | Documentar explícitamente en Out of Scope y no mergear expansiones sin nueva propuesta |

## Rollback Plan

1. Revertir los commits que introducen los hooks y migran las páginas.
2. Restaurar el código inline de `useEffect` + `fetch` + `setState` en cada página afectada.
3. Verificar que `npm run build` pase sin errores.

## Dependencies

- Ninguna externa; usa React y Supabase client ya existentes.

## Success Criteria

- [ ] Los 4 hooks existen en `src/hooks/` y exponen `{ data, loading, error }`.
- [ ] Las 5 páginas listadas usan su hook correspondiente en lugar de fetch inline.
- [ ] `npm run build` completa sin errores de tipo ni de compilación.
- [ ] No hay regresiones funcionales en las páginas migradas (mismos datos renderizados).
