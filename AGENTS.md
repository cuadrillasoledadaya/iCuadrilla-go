# iCuadrilla PWA — Agent Conventions

Guía compacta para agentes de IA que trabajan en este proyecto. Cada sección responde una pregunta: *¿qué hago cuando me encuentro con X?*

---

## Identidad del proyecto

| Atributo | Valor |
|----------|-------|
| Nombre | iCuadrilla PWA |
| Stack | Next.js 14.2.35, React 18.3.1, TypeScript, Tailwind CSS, Supabase, Radix UI |
| Versión | `MAJOR.MINOR.PATCH` (actual `1.6.14`) |
| Package manager | **npm** (no yarn, no pnpm) |

---

## Antes de tocar código

```bash
npx tsc --noEmit   # Cero errores de tipo
npm test            # Todos los tests pasan
npm run build       # Build production exitoso
```

Estos tres comandos se ejecutan **antes de cada commit**. Si alguno falla, no commitees.

---

## Convenciones de código

### `'use client'` — cuándo y por qué

**Requerido** en cualquier componente que use hooks (`useState`, `useEffect`, `useRouter`, etc.).

Todas las páginas del dashboard son `'use client'` por legado. Meta: migración gradual a Server Components.

### UI primitives — en `src/components/ui/`

- Prefieren `React.memo` donde el beneficio sea medible.
- Todos los componentes nuevos llevan tests con `data-testid`.
- Nombres en inglés, igual que los identificadores y comentarios.

### Tests

- Framework: **Jest** con **React Testing Library**.
- Todo test nuevo sigue el patrón de los existentes.
- `data-testid` es el mecanismo de selección preferido.

### Commits — estilo conventional commits

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
perf:     Optimización de rendimiento
chore:    Tareas de mantenimiento
refactor: Cambio que no agrega feature ni corrige bug
```

**Sin atribución de IA.** Ni `Co-Authored-By` ni menciones a modelos en el mensaje.

---

## Arquitectura del layout

```
┌─────────────────────────────────────────────┐
│  Sidebar (drawer mobile / rail desktop)     │
├─────────────────────────────────────────────┤
│  Bottom navbar (solo mobile)                │
├─────────────────────────────────────────────┤
│  Main content                               │
└─────────────────────────────────────────────┘
```

- `LayoutContext` expone `isSidebarOpen` / `setSidebarOpen`.
- `ToastProvider` en el root layout; usar `useToast()` para feedback.
- `ErrorState` para errores de fetch, `ConfirmDialog` para confirmaciones.

---

## Patrones de rendimiento

| Situación | Qué hacer |
|-----------|-----------|
| Value de `LayoutContext` | Envolver con `useMemo` |
| Listas > 20 items | Extraer item como componente con nombre + `React.memo` |
| Event handlers en padre de lista | Envolver con `useCallback` |
| Funciones helper sin hooks/state | Definir a nivel de módulo (no dentro del componente) |
| Intervalos / fetch closures | `useRef` para mantener la referencia fresca |
| Handlers simples inline | Aceptable: `onClick={() => setState(x)}` |

---

## PWA y offline

- Service worker: `@ducanh2912/next-pwa` (Workbox).
- Runtime caching: Supabase storage → **CacheFirst**, API → **NetworkFirst**.
- Offline: `localStorage` cache + cola de sincronización para attendance.
- Procesador de cola: `src/components/sync-provider.tsx`.

### Archivos clave del sistema offline

| Archivo | Rol |
|---------|-----|
| `src/lib/offline-utils.ts` | Cache offline + sync queue |
| `src/hooks/useFetch.ts` | Data fetching cache-first |
| `src/hooks/useEventos.ts` | Eventos con soporte offline |
| `src/components/sync-provider.tsx` | Procesador de cola offline |
| `next.config.js` | Config PWA + runtime caching |

---

## Lenguaje

| Ámbito | Idioma |
|--------|--------|
| Código, UI, identificadores, comentarios | **Inglés** (salvo que se esté extendiendo código existente en español) |
| Respuestas al usuario en chat | **Rioplatense Spanish** (voseo natural, sin sobrecargar de slang) |

---

## Checklist pre-commit

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] Commit sigue conventional commits (`feat:`, `fix:`, `perf:`, `chore:`, `refactor:`)
- [ ] Sin atribución de IA en el mensaje
- [ ] Sin emojis generados por IA
- [ ] Componentes nuevos tienen `data-testid` y tests
- [ ] `'use client'` presente si usa hooks
