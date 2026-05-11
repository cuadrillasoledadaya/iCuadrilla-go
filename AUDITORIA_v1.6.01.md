# 🔴 AUDITORÍA TÉCNICA EXHAUSTIVA — iCuadrilla PWA v1.6.01

**Fecha:** 11 de Mayo de 2026  
**Versión Auditada:** 1.6.01  
**Auditor:** Senior Architect + AI Assistant  
**Build Status:** ✅ Compila correctamente (solo warnings CSS menores)

---

## 📋 RESUMEN EJECUTIVO — Top 5 Issues por Severidad

### CRÍTICO (Resolución Inmediata)

| # | Issue | Archivo | Línea | Descripción |
|---|-------|---------|-------|-------------|
| 1 | **RLS con email hardcoded en SQL** | `supabase/migrations/20260212_enable_rls.sql` | 25 | `'proyectoszipi@gmail.com'` hardcoded en función SQL — si cambia, queda inútil |
| 2 | **`any` en query builder genérico** | `src/hooks/useFetch.ts` | 84 | `let query: any = supabase.from(table).select('*')` — rompe type safety completo del hook |
| 3 | **Middleware logs en producción** | `src/middleware.ts` | 102 | `console.log('Middleware Check:', user.email, ...)` — expone emails en server logs |
| 4 | **API endpoint con API_SECRET_KEY trivial** | `src/app/api/costaleros/route.ts` | 23 | Token comparison es string equality simple, sin timing attack protection |

### ALTO (Esta Semana)

| # | Issue | Archivo | Línea | Descripción |
|---|-------|---------|-------|-------------|
| 1 | **63 console.log/error en producción** | Múltiples | — | Logging excesivo sin flag de desarrollo |
| 2 | **`es_email_autorizado` RPC expuesta** | `src/app/(auth)/registro/page.tsx` | 29 | Verifica autorización antes de registrar — permite enumeration |
| 3 | **Sin rate limiting en auth flows** | `src/app/(auth)/*/page.tsx` | — | Login, registro, recuperación sin protección contra brute force |
| 4 | **MASTER_EMAIL en .env.local.example** | `.env.local.example` | 9 | Variable definida como `MASTER_EMAIL=` (vacía) — inconsistente con la migración SQL |

### MEDIO (Este Mes)

| # | Issue | Archivo | Línea | Descripción |
|---|-------|---------|-------|-------------|
| 1 | **26 usages de `any` en TypeScript** | Múltiples | — | Compromete type safety en hooks, componentes y páginas |
| 2 | **Dashboard usa `any` en 8+ lugares** | `src/app/(dashboard)/dashboard/page.tsx` | 425, 476, 520, 545 | Arrays tipados como `any[]` — pérdida completa de type safety |
| 3 | **Sidebar find con `any`** | `src/components/sidebar.tsx` | 66 | `data.find((t: any) => t.activa)` — podría ser `Temporada` |
| 4 | **Sin validación Zod en registro** | `src/app/(auth)/registro/page.tsx` | 21 | No valida email/password con `registroSchema` — usa inputs directos |

### BAJO (Mejorar Cuando Sea Posible)

| # | Issue | Archivo | Línea | Descripción |
|---|-------|---------|-------|-------------|
| 1 | **eslint-disable en useFetch** | `src/hooks/useFetch.ts` | 83, 125 | 2 comments deshabilitando linting |
| 2 | **CSS class ambiguity warnings** | `tailwind.config.js` / CSS | — | `duration-[1500ms]` etc. son ambiguas — warnings en build |
| 3 | **Offline cache strategy** | `src/lib/offline-utils.ts` | 6 | `payload: any` en `SyncAction` — sin типизация |
| 4 | **No hay tests** | — | — | Cero cobertura de testing |

---

## 📊 TABLA DETALLADA POR CATEGORÍA

### 1. SEGURIDAD

| Severidad | Issue | Archivo(s) | Línea(s) | Descripción | Recomendación |
|----------|-------|------------|----------|-------------|---------------|
| 🔴 CRÍTICO | Email maestro hardcoded en SQL | `supabase/migrations/20260212_enable_rls.sql` | 25 | `'proyectoszipi@gmail.com'` en función `get_user_role()` — si cambia el email real, la función deja de funcionar. Además, expone el email en el schema de BD | Usar variable de entorno en Supabase (no soportado nativamente) o mover la verificación a application layer con `MASTER_EMAIL` del env |
| 🔴 CRÍTICO | API_SECRET_KEY sin timing attack protection | `src/app/api/costaleros/route.ts` | 23 | `if (!secretKey \|\| token !== secretKey)` usa string equality — vulnerable a timing attacks | Usar `crypto.timingSafeEqual()` o implementar constant-time comparison |
| 🟡 ALTO | RPC `es_email_autorizado` permite enumeration | `src/app/(auth)/registro/page.tsx` | 29 | Verifica whitelist ANTES de registrar — atacante puede enumerar emails válidos | Devolver mensaje genérico "Email no autorizado o ya registrado" indistintamente |
| 🟡 ALTO | Sin rate limiting en auth flows | `src/app/(auth)/*/page.tsx` | — | Login, registro, recuperación no tienen rate limiting — vulnerable a brute force | Implementar rate limiting en middleware o a nivel de Supabase Auth |
| 🟡 ALTO | MASTER_EMAIL inconsistente entre .env y SQL | `.env.local.example` vs `migration` | — | `.env.local.example` define `MASTER_EMAIL=` (vacío), pero la migración SQL tiene email hardcoded. El middleware usa `process.env.MASTER_EMAIL` (línea 99) | Unificar: la verificación de master debería ser 100% via env var en application code, no en SQL |
| 🟢 BAJO | Middleware log expone email | `src/middleware.ts` | 102 | `console.log('Middleware Check:', user.email, 'Master?', isMaster)` — logs de servidor exponen emails | Remover o usar logger configurable con env flag |
| 🟢 BAJO | Auth callback logea code parcial | `src/app/auth/callback/route.ts` | 13 | `console.log('Code:', code.substring(0, 10) + '...')` — loguea prefix de auth code | Remover o sanitize |

### 2. FUNCIONALIDAD

| Severidad | Issue | Archivo(s) | Línea(s) | Descripción | Recomendación |
|----------|-------|------------|----------|-------------|---------------|
| 🟡 ALTO | `useFetch` usa `any` en query builder | `src/hooks/useFetch.ts` | 84 | `let query: any = supabase.from(table).select('*')` — el tipo `any` se propaga a todo el result set | Crear tipo genérico para la query o usar `ReturnType` de Supabase |
| 🟡 MEDIO | Dashboard con `any[]` sin tipado | `src/app/(dashboard)/dashboard/page.tsx` | 40, 41, 425, 476, 520, 545 | Arrays `proximosEventos`, `avisos` tipados como `any[]` — sin type safety en render | Definir interfaces `Evento`, `Aviso` y tipar correctamente |
| 🟡 MEDIO | Sidebar usa `any` en find | `src/components/sidebar.tsx` | 66 | `const active = data.find((t: any) => t.activa)` | `data.find((t: Temporada) => t.activa)` |
| 🟡 MEDIO | Registro no usa Zod | `src/app/(auth)/registro/page.tsx` | 21 | `handleRegistro` no pasa por `registroSchema` — inputs van directo a Supabase | Validar con `registroSchema.safeParse()` antes de llamar RPC |
| 🟢 BAJO | ESLint disables explícitos | `src/hooks/useFetch.ts` | 83, 125 | `eslint-disable-next-line @typescript-eslint/no-explicit-any` y `react-hooks/exhaustive-deps` | Justificar o refactorizar para no necesitar disable |
| 🟢 BAJO | offline-utils `payload: any` | `src/lib/offline-utils.ts` | 48 | `SyncAction.payload` es `any` — sin type safety en sync | Tipar correctamente según action type |

### 3. LIMPIEZA DE CÓDIGO

| Severidad | Issue | Archivo(s) | Línea(s) | Descripción | Recomendación |
|----------|-------|------------|----------|-------------|---------------|
| 🔴 CRÍTICO | **63 console.log/error en producción** | Múltiples | — | Archivos con console.log, console.error, console.warn sin flag de desarrollo — polución de logs y potencial exposure en producción | Crear logger utilitario con env flag `NEXT_PUBLIC_DEBUG` o similar; o usar `debug` package |
| 🟡 ALTO | Hook `useUserRole` con `any` | `src/hooks/useUserRole.ts` | 24 | `checkRole = async (sessionUser?: any)` — input sin tipado | Tipar como `User` de Supabase |
| 🟡 ALTO | Múltiples catch con `e: any` | Múltiples | — | `catch (e: any)` o `catch (error: any)` — sin type safety en errores | Usar `unknown` y type guards |
| 🟡 MEDIO | Código duplicado en formateo de fechas | Múltiples | — | `new Date(x.fecha_inicio).toLocaleDateString('es-ES', {...})` repetido | Crear `lib/date-utils.ts` con helpers |
| 🟢 BAJO | Component `cn` duplicado | `src/app/(dashboard)/cuadrilla/[id]/editar/page.tsx` | 320 | `function cn(...inputs: any[])` redefinido localmente — ya existe en `lib/utils.ts` | Importar desde `lib/utils.ts` |
| 🟢 BAJO | Comentarios obsoletos | Varios | — | Algunos comments referencian código que ya no existe | Limpiar en refactors |

### 4. PERFORMANCE

| Severidad | Issue | Archivo(s) | Línea(s) | Descripción | Recomendación |
|----------|-------|------------|----------|-------------|---------------|
| 🟡 ALTO | **Scanner page bundle 266kB** | `src/app/(dashboard)/asistencia/scanner/page.tsx` | — | 266kB first load JS — heaviest page after exportar (399kB) | Lazy load `Html5Qrcode` con `next/dynamic` y `ssr: false` |
| 🟡 ALTO | **Exportar page 399kB** | `src/app/(dashboard)/exportar/page.tsx` | — | 399kB first load JS — heaviest page | Split `xlsx` y `jspdf` en chunks lazy-loaded |
| 🟡 MEDIO | Multiple auth state subscriptions | `src/hooks/useUserRole.ts` + componentes | 118-126 | Cada `useUserRole` crea su propia `onAuthStateChange` subscription — múltiples listeners | Considerar context provider para auth state global |
| 🟡 MEDIO | Re-renders en dashboard | `src/app/(dashboard)/dashboard/page.tsx` | — | useEffect con múltiples fetchs paralelos pero sin abort controller — posible race condition | Implementar cleanup con AbortController |
| 🟢 BAJO | CSS class ambiguity warnings | Build output | — | `duration-[1500ms]` ambiguo — warnings en cada build | Usar `duration-[&lsqb;1500ms&rsqb;]` o ajustar config |

---

## 📈 CONTEO POR SEVERIDAD

| Severidad | Cantidad | Definición |
|-----------|----------|------------|
| 🔴 CRÍTICO | **4** | Vulnerabilidades que comprometen seguridad o type safety crítico |
| 🟡 ALTO | **8** | Issues que deben resolverse esta semana |
| 🟡 MEDIO | **8** | Mejoras importantes pero no urgentes |
| 🟢 BAJO | **7** | Limpieza técnica y mejoras incrementales |
| **TOTAL** | **27** | |

---

## 🔧 PRIORIDAD DE FIXES RECOMENDADOS

### 🔴 FASE 1 — CRÍTICO (Hoy/Mañana)

1. **Refactorizar `useFetch.ts` línea 84** — eliminar `any` del query builder
2. **Remover hardcoded email de `20260212_enable_rls.sql` línea 25** — mover verificación a application layer
3. **Implementar constant-time comparison en API route** (`src/app/api/costaleros/route.ts` línea 23)
4. **Remover o conditional-ize todos los `console.log`** — mínimo en middleware y callback

### 🟡 FASE 2 — ALTO (Esta Semana)

5. **Tipar correctamente `useUserRole`** y eliminar `any` residual
6. **Implementar rate limiting** en auth flows
7. **Lazy-load de scanner** y componentes pesados (xlsx, jspdf, Html5Qrcode)
8. **Usar `registroSchema` en registro/page.tsx**

### 🟡 FASE 3 — MEDIO (Este Mes)

9. **Tipar todos los `any[]` en dashboard**
10. **Centralizar date formatting** en `lib/date-utils.ts`
11. **Crear logger utilitario** con env flag
12. **Unificar estrategia MASTER_EMAIL** entre env y SQL migration

### ⚪ FASE 4 — MEJORES PRÁCTICAS

13. Añadir tests (coverage mínimo 60%)
14. Resolver CSS class ambiguity warnings
15. Eliminar eslint-disable comments o documentar justificaciones

---

## 📁 ARCHIVOS ANALIZADOS

```
src/
├── app/
│   ├── actions.ts                        ← checkIsMaster server-side
│   ├── auth/callback/route.ts            ← OAuth callback
│   ├── (auth)/login/page.tsx             ← Login con Zod
│   ├── (auth)/registro/page.tsx          ← Registro (sin Zod)
│   ├── (auth)/recuperar/page.tsx         ← Password recovery
│   ├── (auth)/nueva-contrasena/page.tsx  ← Reset password
│   ├── (dashboard)/dashboard/page.tsx    ← Dashboard principal
│   ├── (dashboard)/asistencia/scanner/   ← QR scanner
│   └── api/costaleros/route.ts           ← API con Bearer token
├── components/
│   ├── sync-provider.tsx                 ← Offline sync
│   ├── session-timeout.tsx                ← Inactivity logout
│   ├── offline-banner.tsx                ← Connectivity banner
│   └── sidebar.tsx                        ← Navigation
├── hooks/
│   ├── useFetch.ts                       ← Generic fetch c/ cache
│   ├── useCuadrilla.ts                   ← Costaleros hook
│   ├── useEventos.ts                     ← Eventos hook
│   ├── useTemporadas.ts                  ← Temporadas hook
│   └── useUserRole.ts                    ← RBAC hook
└── lib/
    ├── supabase.ts                        ← Browser client
    ├── offline-utils.ts                   ← Cache + sync queue
    ├── utils.ts                           ← Utilities
    └── validations/auth.ts                ← Zod schemas
```

---

## ✅ BUILD ANALYSIS

```
✓ Compiled successfully
○ 29/29 pages generated
○ No TypeScript errors
○ No ESLint errors blocking build
⚠ CSS class ambiguity warnings (non-blocking)
⚠ webpack cache warning for big strings (131kiB) — investigate
```

**Ruta más pesada:** `/exportar` (399kB), `/asistencia/scanner` (266kB)

---

## 📌 HALLAZGOS POSITIVOS ✅

- Build exitoso sin errores
- RLS ya está habilitado (migration aplicada)
- Auth con Zod en login ✅ (pero NO en registro ⚠️)
- Middleware con RBAC funcional
- Offline-first strategy bien implementada (SyncProvider, cache, offline banner)
- API route usa Bearer token auth (patrón correcto)
- Service Worker configurado con caching strategies apropiadas
- No se detectaron SQL injection vulnerabilities
- No hay secrets hardcoded en código fuente (solo en la migración SQL)

---

_Reporte generado: 11 Mayo 2026 — iCuadrilla v1.6.01_
