# Code Review Report — iCuadrilla PWA

**Date:** 2026-05-31  
**Scope:** All source files under `src/` (hooks, lib, components, pages, API routes, middleware)

---

## 1. Code Duplication

### 1.1 Puesto Select Options (HIGH — duplication)

**Files:**

- `src/app/(dashboard)/costaleros/nuevo/page.tsx` (lines 87-138, inline `<select>` with 7 hardcoded options × 2 for puesto and puesto_secundario)
- `src/app/(dashboard)/cuadrilla/[id]/editar/page.tsx` (lines 193-262, same 7 options × 2)
- `src/components/ui/puesto-select.tsx` (already has `PUESTOS` constant and `PuestoSelect` component)

**Description:** The puesto options list (`Patero Izq`, `Patero Der`, `Fijador Izq`, `Fijador Der`, `Costero Izq`, `Costero Der`, `Corriente`) is hardcoded as `<option>` tags in both `nuevo/page.tsx` and `editar/page.tsx`. A `PuestoSelect` component with the `PUESTOS` constant already exists in `components/ui/puesto-select.tsx` but is **never imported or used**.

**Fix:** Replace all inline `<select>` blocks for puesto and puesto_secundario with the existing `PuestoSelect` component. Extend `PuestoSelect` to accept a `placeholder` prop so it can serve both primary ("Selecciona...") and secondary ("Sin puesto secundario") use cases.

---

### 1.2 Event Form UI Duplication (HIGH — duplication)

**Files:**

- `src/app/(dashboard)/eventos/nuevo/page.tsx` (full file, ~180 lines)
- `src/app/(dashboard)/eventos/[id]/editar/page.tsx` (full file, ~175 lines)

**Description:** The event creation and editing forms are nearly identical — same layout, same fields (titulo, descripcion, ubicacion, fecha, hora_inicio, hora_fin, tipo), same input styling. The only differences are: (1) create does an `insert`, edit does an `update`; (2) edit pre-fetches existing data and converts ISO dates to local date/time strings; (3) create hardcodes `tipo: 'Ensayo'` despite having the type buttons in UI (bug — see §6.1).

**Fix:** Extract a shared `EventoForm` component that accepts `initialValues?`, `onSubmit`, and `mode: 'create' | 'edit'`. Both pages render this component with different handlers.

---

### 1.3 Season Activation Logic (MEDIUM — duplication)

**Files:**

- `src/components/sidebar.tsx` lines 72-81 (`handleSwitchSeason`)
- `src/app/(dashboard)/temporadas/page.tsx` lines 56-60 (`handleActivar`)
- `src/app/(dashboard)/temporadas/page.tsx` lines 80-84 (`crearYClonar` step 2)

**Description:** The pattern of "deactivate all seasons, then activate one" is copy-pasted across 3 locations. The `neq('id', '00000000-...')` hack to update all rows is repeated each time.

**Fix:** Extract a `activateSeason(seasonId: string)` utility in `lib/supabase-queries.ts` that performs the deactivate-all + activate-one as a single atomic operation. The `neq` hack should also be documented or replaced with an RPC call.

---

### 1.4 `calculateStatus` Function (MEDIUM — duplication)

**Files:**

- `src/app/(dashboard)/eventos/page.tsx` lines 37-46
- `src/app/(dashboard)/eventos/[id]/page.tsx` lines 94-102 (inside component)

**Description:** Identical `calculateStatus` function duplicated — takes `inicio` and `fin` strings and returns `'pendiente' | 'en-curso' | 'finalizado'`. In the detail page it's defined inside the component, in the list page it's a module-level function.

**Fix:** Extract to `lib/event-utils.ts` and import in both files.

---

### 1.5 Status Style Helpers (MEDIUM — duplication)

**Files:**

- `src/app/(dashboard)/eventos/page.tsx` lines 48-87 (`getStatusStyle`, `getCardStyle`, `getStatusIcon`, `getStatusLabel`)
- `src/app/(dashboard)/eventos/[id]/page.tsx` lines 66-68 (inline ternary for status styling)

**Description:** Status-based styling (badge color, card background, icon, label) is implemented differently in each file. The detail page uses inline ternaries; the list page uses switch-based helper functions.

**Fix:** Extract shared helpers (`getEventoStatusBadge`, `getEventoCardStyle`, etc.) to `lib/event-utils.ts`.

---

### 1.6 Attendance Update Logic (HIGH — duplication)

**Files:**

- `src/app/(dashboard)/eventos/[id]/trabajaderas/page.tsx` lines 90-132 (`updateStatus`)
- `src/app/(dashboard)/eventos/[id]/asistentes/page.tsx` lines 70-112 (`updateStatus`)
- `src/app/(dashboard)/eventos/[id]/pendientes/page.tsx` lines 60-80 (`updateStatus`)
- `src/app/(dashboard)/eventos/[id]/page.tsx` lines 153-175 (`handleConfirmAbsence`)

**Description:** The optimistic-update + sync-queue + Supabase upsert/delete pattern for attendance status changes is copy-pasted across 4 files. Each implements: (1) optimistic state update, (2) cache save, (3) offline queue fallback, (4) Supabase upsert/delete. Minor variations in "justificado" vs "justificada" normalization.

**Fix:** Extract a `useAttendanceUpdate(eventoId)` hook that encapsulates the optimistic update, cache persistence, sync queue, and Supabase mutation. All four pages should call this hook.

---

### 1.7 Data Fetch Pattern: Costaleros + Asistencias Join (MEDIUM — duplication)

**Files:**

- `src/app/(dashboard)/eventos/[id]/trabajaderas/page.tsx` lines 38-72
- `src/app/(dashboard)/eventos/[id]/asistentes/page.tsx` lines 30-65
- `src/app/(dashboard)/eventos/[id]/pendientes/page.tsx` lines 29-55
- `src/app/(dashboard)/eventos/[id]/estadisticas/page.tsx` lines 57-95
- `src/app/(dashboard)/eventos/[id]/page.tsx` lines 67-90

**Description:** All event sub-pages fetch costaleros + asistencias in parallel, then join them in JavaScript. The fetch + join logic is repeated 5 times with slight variations (different filtering, different sort).

**Fix:** Extract a `useEventAttendance(eventoId)` hook that returns `{ costaleros, asistencias, joined, loading }` where `joined` is the pre-merged list.

---

### 1.8 Header + Back Button (LOW — duplication)

**Files:** Virtually every dashboard page (20+ files) includes the same pattern:

```tsx
<header className="relative flex items-center justify-center min-h-[64px]">
  <button onClick={() => router.back()} className="absolute left-0 p-3 bg-white ...">
    <ChevronLeft size={24} />
  </button>
  <div className="text-center ...">
    <h1 className="text-2xl font-black ...">Title</h1>
    <p className="text-[10px] ...">Subtitle</p>
  </div>
</header>
```

**Fix:** Extract a `PageHeader` component: `<PageHeader title="..." subtitle="..." />`.

---

### 1.9 Loading Spinner (LOW — duplication)

**Files:** 15+ pages with identical:

```tsx
<div className="flex min-h-screen items-center justify-center bg-background">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
</div>
```

**Fix:** Extract a `<LoadingSpinner />` component.

---

### 1.10 Rate Limiting Logic in Auth Forms (MEDIUM — duplication)

**Files:**

- `src/app/(auth)/login/page.tsx` lines 33-43 (attemptCount + lockUntil state + increment logic)
- `src/app/(auth)/registro/page.tsx` lines 27-45 (identical pattern)
- `src/app/(auth)/recuperar/page.tsx` lines 10-12 (identical pattern)

**Description:** Client-side rate limiting (5 attempts → 60s lock) is reimplemented identically in all three auth forms, with the same state variables (`attemptCount`, `lockUntil`) and the same increment + lock logic.

**Fix:** Extract a `useRateLimit(maxAttempts, lockDurationMs)` hook returning `{ isLocked, lockRemaining, recordAttempt }`.

---

## 2. Missing Abstractions

### 2.1 No Shared `useEventAttendance` Hook (HIGH — architecture)

See §1.7. Five event sub-pages duplicate the same costaleros + asistencias fetch-join.

---

### 2.2 No Shared `useAttendanceUpdate` Hook (HIGH — architecture)

See §1.6. Four files duplicate the optimistic-update + sync-queue pattern.

---

### 2.3 No Shared `useSeasonActivator` Utility (MEDIUM — architecture)

See §1.3. Season activation is a critical business operation duplicated 3 times.

---

### 2.4 `PuestoSelect` Component Exists But Is Unused (HIGH — architecture)

**File:** `src/components/ui/puesto-select.tsx`  
**Importers:** None  
**Description:** A proper `PuestoSelect` component with typed `PUESTOS` constant exists but is never imported. Both the create and edit costalero pages inline the same options manually.

**Fix:** Use the existing component, or if it needs enhancement (e.g., `placeholder` prop), enhance and use it.

---

### 2.5 No `EventoForm` Shared Component (MEDIUM — architecture)

See §1.2. The create and edit event pages are near-identical.

---

### 2.6 No `PageHeader` Shared Component (LOW — architecture)

See §1.8. Every page duplicates the header + back button pattern.

---

### 2.7 No `LoadingSpinner` Shared Component (LOW — architecture)

See §1.9. 15+ pages duplicate the same spinner JSX.

---

### 2.8 No Shared Auth Form Wrapper (LOW — architecture)

**Files:** `login/page.tsx`, `registro/page.tsx`, `recuperar/page.tsx`  
**Description:** All three auth pages share the same visual layout (dark background, centered card, logo, form, footer links) with only the form fields differing.

**Fix:** Extract an `AuthPageLayout` component wrapping the chrome, accepting form content as children.

---

## 3. Architectural Issues

### 3.1 Business Logic in Components (HIGH — architecture)

**Files:** Multiple page components contain complex business logic that should live in hooks or lib functions:

| File                            | Lines                    | Logic                                                                        |
| ------------------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `dashboard/page.tsx`            | 70-195                   | Anniversary notification creation, parallel data fetching, stats computation |
| `eventos/[id]/page.tsx`         | 67-175                   | Attendance fetching, absence notification creation, status calculation       |
| `eventos/[id]/relevos/page.tsx` | entire file (~400 lines) | Full relevo CRUD, swap logic, muda management                                |
| `notificaciones/page.tsx`       | 30-100                   | Dual-recipient query, mark-read, justify/confirm absence                     |
| `sidebar.tsx`                   | 72-81                    | Season switching (DB mutation)                                               |

**Fix:** Move data fetching and mutation logic into hooks and server actions. Components should only render and delegate.

---

### 3.2 Inconsistent `justificado` vs `justificada` Status (HIGH — architecture)

**Files:**

- `eventos/[id]/trabajaderas/page.tsx` line 92: normalizes `'justificado' → 'justificada'`
- `eventos/[id]/asistentes/page.tsx` line 73: normalizes `'justificado' → 'justificada'`
- `eventos/[id]/estadisticas/page.tsx` line 82: checks both `'justificado' || 'justificada'`
- `eventos/[id]/page.tsx` line 78: checks both `'justificado' || 'justificada'`
- `notificaciones/page.tsx` line 147: uses `'justificada'` directly
- `offline-utils.ts` `SyncAction.payload`: no normalization
- `SyncProvider` (`sync-provider.tsx` line 21): sends raw `payload.estado`

**Description:** The database uses both `'justificado'` and `'justificada'` for the same concept. Multiple files check for both values because they're unsure which one the DB has. This creates a class of subtle bugs where filtering or upserting may miss records.

**Fix:** Standardize on a single value (recommend `'justificado'` for masculine agreement with the column name `estado`). Add a database migration to update existing rows. Remove all `|| 'justificada'` fallbacks.

---

### 3.3 `window.confirm()` / `alert()` Used for Critical Operations (MEDIUM — architecture)

**Files:** 12+ files use `alert()` and `window.confirm()` for:

- Delete confirmations (`anuncios/page.tsx`, `eventos/[id]/page.tsx`, `cuadrilla/[id]/editar/page.tsx`)
- Success/error messages (`cuadrilla/[id]/baja/page.tsx`, `temporadas/page.tsx`, `costaleros/nuevo/page.tsx`)
- Validation errors (`eventos/[id]/editar/page.tsx`)

**Fix:** Replace with toast notifications (e.g., `sonner` — common with shadcn) and custom confirmation modals.

---

### 3.4 `window.location.reload()` Used for State Synchronization (MEDIUM — architecture)

**Files:**

- `sidebar.tsx` line 80: `window.location.reload()` after season switch
- `sidebar.tsx` line 119: `window.location.href = '/'` after sign out
- `login/page.tsx` line 63: `window.location.href = '/dashboard'` after login
- `notificaciones/page.tsx` line 88: `router.refresh()` after mark-read

**Description:** Full page reloads are used to synchronize state that should be handled by React's state management and Supabase's real-time subscriptions.

**Fix:** Use Supabase real-time subscriptions for cross-component state sync. Use `router.push` + `router.refresh` instead of `window.location` for auth flows.

---

### 3.5 Session Timeout Creates New Supabase Client Per Instance (MEDIUM — architecture)

**File:** `src/components/session-timeout.tsx` line 13: `const supabase = createClient()` inside the component

**Description:** The `SessionTimeout` component calls `createClient()` on every render, creating a new Supabase client each time. The rest of the app uses the singleton `supabase` from `lib/supabase.ts`.

**Fix:** Import `supabase` from `@/lib/supabase` instead.

---

### 3.6 Rate Limiter Is In-Memory Only, Not Per-User (LOW — architecture)

**File:** `src/lib/rate-limit.ts`  
**Description:** The rate limiter uses an in-memory `Map` which: (1) resets on every serverless cold start, (2) is shared across all users in the same process, (3) grows unbounded. The API route uses IP-based rate limiting, which is fine, but the `rate-limit.ts` module should document these limitations.

---

### 3.7 Middleware Duplicates Role Check Logic (MEDIUM — architecture)

**Files:**

- `src/middleware.ts` lines 60-95: Role check against DB
- `src/hooks/useUserRole.ts` lines 35-80: Same role resolution logic
- `src/app/actions.ts`: `checkIsMaster` server action

**Description:** The middleware queries `costaleros` to check role and checks `MASTER_EMAIL` env var. `useUserRole` does the same client-side. The master email check logic is duplicated in middleware and the server action.

**Fix:** Extract a shared `resolveUserRole(userId)` server action or RPC that both middleware and `useUserRole` can call. The middleware should use the server action instead of direct DB queries.

---

## 4. Type Safety

### 4.1 Widespread `any` Usage (HIGH — type-safety)

**25 instances of `: any` across 14 files** — see grep results in analysis.

Key worst offenders:
| File | Line | Usage |
|------|------|-------|
| `offline-utils.ts` | 6 | `saveToCache = (key: string, data: any)` |
| `offline-utils.ts` | 48 | `payload: any` in `SyncAction` |
| `sidebar.tsx` | 37-38 | `useState<any[]>`, `useState<any \| null>` |
| `dashboard/page.tsx` | 40-41 | `useState<any[]>` for `proximosEventos` and `avisos` |
| `perfil/page.tsx` | 12 | `useState<any>(null)` for profile |
| `estadisticas/page.tsx` | 12 | `useState<any[]>([])` |
| `cuadrilla/[id]/baja/page.tsx` | 13 | `useState<any>(null)` for costalero |
| `pendientes/page.tsx` | 22 | `useState<any>(null)` for evento |
| `eventos/[id]/editar/page.tsx` | 103 | `catch (err: any)` |
| `cuadrilla/[id]/editar/page.tsx` | 365 | **Reimplemented local `cn` function using `any[]`** |

**Fix:** Define proper interfaces for all data shapes. Many already exist (e.g., `Evento`, `Costalero`, `Temporada`) but aren't used consistently. Replace `any` with `unknown` in catch blocks and narrow types.

---

### 4.2 Local `cn` Function Override (MEDIUM — type-safety)

**File:** `src/app/(dashboard)/cuadrilla/[id]/editar/page.tsx` line 365  
**Description:** This file defines its own `function cn(...inputs: any[])` at the bottom, shadowing the properly-typed `cn` from `@/lib/utils`. It does the same thing (filter + join) but without `clsx`/`twMerge`.

**Fix:** Remove the local `cn` and import from `@/lib/utils` (already imported at top of file but unused due to shadowing).

---

### 4.3 Missing `Costalero` Type in Multiple Pages (MEDIUM — type-safety)

**Files:** `trabajaderas/page.tsx`, `asistentes/page.tsx`, `pendientes/page.tsx`, `eventos/[id]/page.tsx` all define their own local `Costalero` interface with varying fields.

**Fix:** Use the `Costalero` type from `@/hooks/useCuadrilla.ts` or define a canonical one in `lib/types.ts`.

---

### 4.4 `CostaleroValues` Schema Type Mismatch with Form (MEDIUM — type-safety)

**Files:**

- `src/lib/validations/forms.ts`: `costaleroSchema` uses `z.number()` for `trabajadera`, `altura`, `suplemento`, `ano_ingreso`
- `src/app/(dashboard)/costaleros/nuevo/page.tsx`: Defines its own local `formSchema` using `z.string()` for these fields (to handle form input), then manually parses to numbers
- `src/app/(dashboard)/cuadrilla/[id]/editar/page.tsx`: Same — own schema with strings

**Description:** The shared `costaleroSchema` in `lib/validations/forms.ts` is **never imported** by either form page. Both define their own local schema. The shared schema uses `number` types directly while forms need `string` (for `<input type="number">` and `<select>`).

**Fix:** Either (1) make the shared schema accept string inputs with `z.coerce.number()`, or (2) create a form-specific schema that derives from the shared one. Remove the duplicated local schemas.

---

## 5. Performance

### 5.1 Everything Is a Client Component (HIGH — performance)

**Files:** All 30+ page files start with `'use client'`

**Description:** Every single page is a client component, including static or data-heavy pages like `estadisticas/page.tsx`, `datos-palio/page.tsx`, `exportar/page.tsx`, and `repertorio/page.tsx`. These could be server components that fetch data on the server and pass it down, reducing the JS bundle shipped to the client.

The only server component is `src/app/page.tsx` (the landing page), which already demonstrates the correct pattern.

**Fix:** Refactor data-fetching pages to server components where possible. Use the `supabase` server client (as already done in `page.tsx` and `middleware.ts`) for server-side data fetching. Keep only interactive portions as client components.

---

### 5.2 Dashboard Fetches Excessive Data on Mount (MEDIUM — performance)

**File:** `src/app/(dashboard)/dashboard/page.tsx` lines 70-195  
**Description:** The dashboard makes 6+ sequential/parallel Supabase queries on mount:

1. `supabase.auth.getUser()`
2. Active season query
3. Count costaleros
4. Anniversary notifications (queries + inserts for each anniversary)
5. Parallel: notificaciones count, eventos, proximos eventos, anuncios
6. Last finished evento + its asistencias

The anniversary check also **writes** to the DB (creates notifications) on every dashboard load — a side effect in a read path.

**Fix:** Move anniversary notification creation to a server-side cron job or Edge Function. Reduce dashboard queries by combining into an RPC call.

---

### 5.3 Eventos List Polls Every 60 Seconds (MEDIUM — performance)

**File:** `src/app/(dashboard)/eventos/page.tsx` lines 140-160  
**Description:** The events list page runs `setInterval(syncStatuses, 60000)` which iterates all events, recalculates status, and makes individual `supabase.update()` calls for changed events — every 60 seconds, for every user with the page open.

**Fix:** Use Supabase real-time subscriptions for status updates, or move status calculation to a server-side process.

---

### 5.4 Estadísticas Auto-Refresh Every 30s (LOW — performance)

**File:** `src/app/(dashboard)/eventos/[id]/estadisticas/page.tsx` line 88  
**Description:** Polls the full dataset (costaleros + asistencias) every 30 seconds.

**Fix:** Use Supabase real-time subscriptions.

---

### 5.5 `createClient()` Called Per-Render in SessionTimeout (LOW — performance)

See §3.5.

---

### 5.6 Dynamic Imports Only Used for Scanner (LOW — performance)

**File:** `src/app/(dashboard)/asistencia/scanner/page.tsx`  
**Description:** Only the scanner page uses `dynamic()` for code splitting. The large `exportar/page.tsx` (dynamically imports `xlsx`, `jspdf`, `jspdf-autotable`, `qrcode`) ships all that code in the main bundle.

**Fix:** Use `dynamic()` for the export page or for individual export functions.

---

### 5.7 No Memoization on Expensive Renders (LOW — performance)

**Files:**

- `eventos/[id]/relevos/page.tsx`: Complex grid with per-position calculations
- `eventos/[id]/estadisticas/page.tsx`: Per-trabajadera bar rendering

**Fix:** Wrap list item renders in `React.memo`.

---

## 6. Supabase Patterns

### 6.1 Inconsistent Client Usage (MEDIUM — supabase)

**Files:**

- `src/lib/supabase.ts`: Exports both `createClient` (factory) and `supabase` (singleton)
- `src/components/session-timeout.tsx`: Uses `createClient()` (new instance per render)
- `src/app/api/costaleros/route.ts`: Uses `createClient` from `@supabase/supabase-js` (creates a completely separate client, not using the SSR helper)
- `src/middleware.ts`: Creates its own server-side client inline
- `src/app/auth/callback/route.ts`: Creates its own server-side client inline
- All other client files: Use the `supabase` singleton

**Fix:** Standardize: (1) client components import `supabase` singleton from `lib/supabase.ts`; (2) server contexts use a shared `createServerSupabaseClient()` helper; (3) the API route should use the SSR server client for proper cookie handling.

---

### 6.2 API Route Uses Wrong Supabase Client (HIGH — supabase)

**File:** `src/app/api/costaleros/route.ts` line 34  
**Description:** The API route creates a `createClient` from `@supabase/supabase-js` directly (not `@supabase/ssr`). This means it doesn't use the SSR cookie handling and won't respect RLS policies tied to the authenticated session. It only uses the anon key, so all queries will use anon-level RLS.

**Fix:** Use the `@supabase/ssr` server client pattern (as in `middleware.ts` and `auth/callback/route.ts`) to properly handle cookies and auth context.

---

### 6.3 No RLS-Aware Queries in Client Code (MEDIUM — supabase)

**Description:** All client-side queries use `supabase.from('...').select('*')` with the anon key. There are no `.rpc()` calls for complex operations, no `.eq('user_id', userId)` filters on sensitive tables (like `notificaciones`), and no evidence that RLS policies are being relied upon for data isolation.

The `notificaciones/page.tsx` fetches both admin and personal notifications client-side and manually filters — this means any user could query all admin notifications if RLS isn't configured properly.

**Fix:** Add RLS policies to ensure users can only read their own notifications. Consider using server actions or RPC for authorization-sensitive queries.

---

### 6.4 `select('*')` Used Everywhere (LOW — supabase)

**Files:** All client-side queries use `.select('*')`  
**Description:** No column selection is used — all queries fetch every column from every row.

**Fix:** Select only needed columns to reduce payload size and improve performance.

---

### 6.5 No Error Handling on Several Mutations (MEDIUM — supabase)

**Files:**

- `sidebar.tsx` lines 72-78: Season switch — `await supabase...update()` with no error check
- `temporadas/page.tsx` lines 56-60: Season activation — no error check on either update
- `eventos/[id]/trabajaderas/page.tsx` lines 121-129: Attendance update errors go to sync queue silently

**Fix:** Always check for errors on Supabase mutations and surface them to the user.

---

## 7. Form Handling

### 7.1 `react-hook-form` + `zod` Used Inconsistently (MEDIUM — forms)

**Files using `useForm` + `zodResolver`:**

- `costaleros/nuevo/page.tsx` (local schema)
- `cuadrilla/[id]/editar/page.tsx` (local schema)

**Files using manual `useState` + `setForm`:**

- `eventos/nuevo/page.tsx`
- `eventos/[id]/editar/page.tsx`
- `anuncios/page.tsx`
- `anuncios/[id]/editar/page.tsx`
- `login/page.tsx` (uses `loginSchema.safeParse` manually)
- `registro/page.tsx` (uses `registroSchema.safeParse` manually)
- `ajustes/page.tsx`
- `recuperar/page.tsx`
- `asistencia/ausencia/page.tsx`
- `datos-palio/page.tsx`

**Description:** Only 2 out of 10+ form pages use `react-hook-form` with `zodResolver`. The rest use manual `useState` + manual validation or `safeParse`. The shared schemas in `lib/validations/forms.ts` and `lib/validations/auth.ts` exist but are only partially used.

**Fix:** Standardize on `react-hook-form` + `zodResolver` + shared schemas for all forms. This also enables proper `Controller` binding for custom select components.

---

### 7.2 Shared Validation Schemas Not Used (MEDIUM — forms)

**File:** `src/lib/validations/forms.ts`  
**Description:** `eventoSchema` and `costaleroSchema` are defined but neither is imported by any page. Both the event and costalero form pages define their own local schemas.

**Fix:** Import and use the shared schemas, or delete them if they'll be replaced.

---

### 7.3 No Validation on Multiple Forms (MEDIUM — forms)

**Files:**

- `eventos/nuevo/page.tsx`: No zod validation, only `required` HTML attributes
- `eventos/[id]/editar/page.tsx`: No zod validation
- `anuncios/page.tsx`: No validation at all
- `anuncios/[id]/editar/page.tsx`: No validation
- `datos-palio/page.tsx`: Only `parseFloat` with no bounds checking
- `asistencia/ausencia/page.tsx`: Only `required` on textarea

**Fix:** Add zod validation to all forms.

---

## 8. Naming and Organization

### 8.1 Dead Code: `estadisticas/page.tsx` Is a Legacy Export Page (HIGH — dead-code)

**File:** `src/app/(dashboard)/estadisticas/page.tsx`  
**Description:** This page appears to be an older version of the export functionality. It:

- Uses `any[]` everywhere
- Imports `jsPDF` eagerly (not dynamic)
- Uses `data:text/csv` URI hack for CSV export (unlike the proper BOM approach in `exportar/page.tsx`)
- Uses `doc.save()` directly (unlike the share-aware `handleExport` in `exportar/page.tsx`)
- Has a dark-themed UI completely different from the rest of the app
- Filters by `puesto === 'Patero'` (wrong — the real puesto values are `Patero Izq`, `Patero Der`)

**Fix:** This page appears to be superseded by `exportar/page.tsx`. If confirmed, delete it. If it serves a different purpose, document it and fix the broken Patero filter.

---

### 8.2 Duplicate `relevos/page.tsx` at Dashboard Level (MEDIUM — dead-code)

**Files:**

- `src/app/(dashboard)/relevos/page.tsx` — Standalone "Gestión de Relevos" using `posicion_trabajadera` field on `costaleros` table
- `src/app/(dashboard)/eventos/[id]/relevos/page.tsx` — Event-specific relevo management using a `relevos` table

**Description:** There are two completely different "relevos" pages. The dashboard-level one swaps `trabajadera`/`posicion_trabajadera` directly on the `costaleros` table (modifying the costalero's permanent position). The event-level one uses a proper `relevos` join table. The sidebar links to the dashboard-level one, which permanently modifies costalero positions.

**Fix:** Clarify which is the canonical implementation. The event-level one is better architected. Consider removing the dashboard-level one or converting it to redirect to the event-level implementation.

---

### 8.3 Inconsistent File Naming (LOW — naming)

**Observations:**

- Auth pages use kebab-case: `nueva-contrasena`, but the component is `NuevaContrasenaPage`
- Some pages use `[id]` dynamic segments, others use query params (`?evento=`)
- The scanner page uses `scanner-content.tsx` as a sibling file, but other complex pages inline everything

---

### 8.4 `@ts-ignore` in SessionTimeout (LOW — naming)

**File:** `src/components/session-timeout.tsx` line 101: `// @ts-ignore` on the `timeout` variable

**Fix:** Properly type the variable as `ReturnType<typeof setTimeout>` or use `NodeJS.Timeout`.

---

### 8.5 Inconsistent Background Styles (LOW — naming)

**Files:**

- `cuadrilla/[id]/page.tsx`: `bg-neutral-950` (dark theme)
- `cuadrilla/[id]/baja/page.tsx`: `bg-[#f8fafc]` (custom light)
- `cuadrilla/movimientos/page.tsx`: `bg-[#f8fafc]`
- `estadisticas/page.tsx`: Dark theme
- All other pages: `bg-background`

**Fix:** Standardize on `bg-background` and use Tailwind theme tokens.

---

## 8.6 Unused Imports (LOW — dead-code)

**Files:**

- `eventos/page.tsx`: Imports `Clock` but doesn't use the named import directly
- `navbar.tsx`: Imports `QrCode`, `Repeat`, `Bell`, `BarChart`, `Calendar` — only 4 of 7 used in `navItems`

---

## Summary — Prioritized Action Items

| Priority  | Category     | Finding                                                                | Effort |
| --------- | ------------ | ---------------------------------------------------------------------- | ------ |
| 🔴 HIGH   | Duplication  | Attendance update logic (4 files) → extract `useAttendanceUpdate` hook | M      |
| 🔴 HIGH   | Duplication  | Puesto select duplication → use existing `PuestoSelect`                | S      |
| 🔴 HIGH   | Type Safety  | 25 `any` usages → replace with proper types                            | M      |
| 🔴 HIGH   | Architecture | `justificado`/`justificada` inconsistency → standardize                | M      |
| 🔴 HIGH   | Performance  | All pages are client components → convert where possible               | L      |
| 🔴 HIGH   | Dead Code    | `estadisticas/page.tsx` — legacy superseded page                       | S      |
| 🔴 HIGH   | Supabase     | API route uses wrong client (no SSR, no RLS)                           | S      |
| 🟡 MEDIUM | Duplication  | Event form duplication → `EventoForm` component                        | M      |
| 🟡 MEDIUM | Duplication  | Season activation (3 files) → shared utility                           | S      |
| 🟡 MEDIUM | Duplication  | Rate limiting logic (3 auth forms) → `useRateLimit` hook               | S      |
| 🟡 MEDIUM | Duplication  | `calculateStatus` + status style helpers → `event-utils.ts`            | S      |
| 🟡 MEDIUM | Architecture | Business logic in components → hooks/server actions                    | L      |
| 🟡 MEDIUM | Architecture | `alert()`/`confirm()` → toast/modals                                   | M      |
| 🟡 MEDIUM | Architecture | `window.location.reload()` → React state management                    | M      |
| 🟡 MEDIUM | Architecture | Middleware duplicates role logic                                       | M      |
| 🟡 MEDIUM | Supabase     | Inconsistent client creation patterns                                  | M      |
| 🟡 MEDIUM | Supabase     | Missing error handling on mutations                                    | S      |
| 🟡 MEDIUM | Forms        | Inconsistent form validation (RHF+zod vs manual)                       | M      |
| 🟡 MEDIUM | Forms        | Shared schemas unused, local duplicates                                | S      |
| 🟡 MEDIUM | Dead Code    | Duplicate `relevos/page.tsx` at dashboard level                        | S      |
| 🟡 MEDIUM | Type Safety  | Local `cn` override in `editar/page.tsx`                               | S      |
| 🟡 MEDIUM | Type Safety  | `costaleroSchema` never imported by form pages                         | S      |
| 🟢 LOW    | Duplication  | Header + back button → `PageHeader` component                          | S      |
| 🟢 LOW    | Duplication  | Loading spinner → `LoadingSpinner` component                           | S      |
| 🟢 LOW    | Architecture | Auth form layout wrapper                                               | M      |
| 🟢 LOW    | Performance  | Dynamic imports for heavy libraries                                    | S      |
| 🟢 LOW    | Performance  | Memoization on list items                                              | S      |
| 🟢 LOW    | Supabase     | `select('*')` everywhere → column selection                            | M      |
| 🟢 LOW    | Naming       | Inconsistent background styles                                         | S      |
| 🟢 LOW    | Naming       | `@ts-ignore` in SessionTimeout                                         | S      |
| 🟢 LOW    | Dead Code    | Unused imports                                                         | S      |
