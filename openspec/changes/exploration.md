# Exploration: iCuadrilla Codebase Health & Architecture

## Current State

**iCuadrilla** is a mature Next.js 14.2 PWA for managing a brotherhood's "cuadrilla" (Brotherhood costalero group). Version 1.5.04 with extensive changelog history (~896 entries).

**Stack**: Next.js 14.2.35 (App Router), React 18.3.1, TypeScript 5.9.3, Tailwind CSS 3.4.1, Supabase SSR+JS, PWA (@ducanh2912/next-pwa)

**Architecture**:

- Group routes: `(auth)` and `(dashboard)` for separation
- Route groups with dynamic segments: `eventos/[id]/asistentes`, `cuadrilla/[id]/editar`
- Auth: Supabase SSR cookies, middleware-based RBAC
- Data: Supabase client direct from components (no abstraction layer), localStorage cache for offline
- Validation: Zod schemas in `lib/validations/`
- UI: Radix UI primitives + Tailwind, custom components in `components/ui/`

**Project Size**: ~60 TypeScript files in src/

## Affected Areas

| File/Directory                     | Issue                                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/app/(dashboard)**/page.tsx`   | All client page components contain massive `useEffect` fetchData blocks with repeated cache-then-fetch patterns |
| `src/lib/supabase.ts`              | Direct browser client instantiation, no server-side abstraction                                                 |
| `src/middleware.ts`                | Auth + RBAC middleware with master email check in every protected request                                       |
| `src/hooks/useUserRole.ts`         | Role resolution with client-side hardcoded master email fallback (line 60-63)                                   |
| `src/lib/offline-utils.ts`         | localStorage cache without expiration, sync queue with no retry logic                                           |
| `src/components/sync-provider.tsx` | Background sync coordinator                                                                                     |
| `src/components/sidebar.tsx`       | Season switching via `window.location.reload()`                                                                 |

## Key Findings

### 1. Security: Client-Side Master Fallback

```typescript
// useUserRole.ts line 60-63
if (!isMasterEmail && user.email?.trim().toLowerCase() === 'proyectoszipi@gmail.com') {
  isMasterEmail = true;
}
```

This client-side fallback undermines the server-side security check in `actions.ts`.

### 2. No Formatter Configured

- ESLint exists (`npm run lint`) but no Prettier/formatter
- 60 TypeScript files will have inconsistent style
- Adding formatter now would cause massive diffs

### 3. Zero Test Coverage

- No test files found (searched `*.test.ts`, `*.spec.ts`, `e2e/**`)
- `openspec/config.yaml` confirms `strict_tdd: false`
- No test runner configured

### 4. Repeated Fetch-Cache Patterns

Every page repeats:

```typescript
// 1. Load from cache
// 2. Show cached data immediately
// 3. Fetch fresh data
// 4. Update cache
```

No shared abstraction.

### 5. Middleware DB Hit on Every Request

Role verification queries `costaleros` table on every protected route access.

### 6. Force Reload for Season Switch

```typescript
// sidebar.tsx line 84
window.location.reload();
```

No state management update, just brute force reload.

### 7. Zod v4 Syntax

Using Zod v4 (`z.string().min()`, `z.number().int().min()`) — latest version with changed API.

## Approaches

### 1. Security Hardening (Low Effort, High Impact)

- Remove client-side master fallback in `useUserRole.ts`
- Rely solely on server action + environment variable
- **Pros**: Fixes real security issue, bounded change
- **Cons**: None significant
- **Effort**: Low

### 2. Code Quality: Add Formatter (Medium Effort, Medium Impact)

- Add Prettier with existing ESLint
- Format files incrementally
- **Pros**: Consistent style, easier future contributions
- **Cons**: Massive diff if done all at once
- **Effort**: Medium

### 3. Extract Shared Data Hook (Medium Effort, Medium Impact)

- Create `useSupabaseQuery` or similar hook
- Standardize cache-then-fetch pattern
- **Pros**: Reduces duplication, centralized cache logic
- **Cons**: Must preserve offline behavior exactly
- **Effort**: Medium

### 4. Testing Infrastructure (Medium Effort, Long-term Impact)

- Add Vitest + React Testing Library
- Test Zod validations, utility functions
- **Pros**: Enables confidence for future changes
- **Cons**: No visible short-term output, `strict_tdd: false`
- **Effort**: Medium

### 5. Full Data Layer Refactor (High Effort, High Risk)

- Extract Supabase calls to repository/service layer
- **Pros**: Testability, single source of truth
- **Cons**: Massive risk, no clear ROI given current velocity
- **Effort**: High

## Recommendation

**Start with Security Hardening + Formatter Setup** (incremental approach):

1. **Immediate**: Remove client-side master fallback
2. **Short-term**: Add Prettier, format validation schemas and utilities
3. **Medium-term**: Extract shared fetch/cache hook, add basic unit tests for validations

This addresses the most impactful issues (security + code quality) without massive refactor risk.

## Risks

- Adding formatter without CI means style drift returns
- Shared hooks must preserve exact offline behavior — requires offline-first tests
- No TypeScript strictness issues found (project already uses `strict: true`)

## Ready for Proposal

**Yes**. The exploration identifies actionable, bounded improvements across security and code quality dimensions. Two proposal tracks recommended:

1. **Security Hardening SDD**: Remove client fallback, audit RBAC
2. **Code Quality SDD**: Add formatter, extract shared patterns, testing infra
