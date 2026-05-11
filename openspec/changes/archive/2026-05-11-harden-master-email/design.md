# Design: Harden Master Email Fallback

## Technical Approach

Remove all hardcoded `proyectoszipi@gmail.com` fallbacks so `MASTER_EMAIL` env var is the sole authority. Server actions and middleware fail closed (return `false`) when env var is unset. Client hook trusts server result unconditionally.

## Architecture Decisions

### Decision: Fail-closed when MASTER_EMAIL unset

**Choice**: When `MASTER_EMAIL` is unset or empty, `checkIsMaster()` returns `false`, blocking master access.
**Alternatives**: Silently fall back to hardcoded email (current — insecure), or throw error (breaks UX).
**Rationale**: Security hardening requires explicit denial when config is missing. No silent bypass.

### Decision: Server-only master resolution

**Choice**: Client `useUserRole` hook calls `checkIsMaster()` server action and trusts result. No client-side email comparison.
**Alternatives**: Client-side email comparison (current — insecure, bypassable).
**Rationale**: Single source of truth prevents client-side spoofing. RLS policies on Supabase remain as secondary defense.

### Decision: Middleware env-only check

**Choice**: Middleware reads `MASTER_EMAIL` directly; no server action call.
**Alternatives**: Call `checkIsMaster` server action from middleware (adds latency, not needed for route-level check).
**Rationale**: Middleware needs fast role check. Comparing email strings directly is sufficient since env var is server-controlled.

### Decision: Roles page filter via server action result

**Choice**: Pass `isMaster` from `useUserRole` to filter the master from the roles list client-side.
**Alternatives**: Call Supabase RPC or create a new server action to return filtered list.
**Rationale**: Minimizes changes — leverage existing `isMaster` state to filter array before rendering.

## Data Flow

```
User login
    ↓
useUserRole hook
    → checkIsMaster(user.email) [server action]
    → MASTER_EMAIL env var comparison
    → returns true/false
    ↓
isMaster state set (no client fallback)
    ↓
canManageRoles = isMaster
    ↓
RolesPage: filter costaleros by isMaster
```

```
Request to /ajustes/roles
    ↓
Middleware
    → getUser() from Supabase
    → read MASTER_EMAIL env var
    → compare user.email === MASTER_EMAIL
    → redirect if unauthorized
```

## File Changes

| File                                         | Action | Description                                                                                        |
| -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `src/hooks/useUserRole.ts`                   | Modify | Remove lines 59-63 client fallback. Trust server action only.                                      |
| `src/app/actions.ts`                         | Modify | Remove `\|\| 'proyectoszipi@gmail.com'`. Fail closed on unset.                                     |
| `src/middleware.ts`                          | Modify | Remove `\|\| 'proyectoszipi@gmail.com'` on line 96. Fail closed on unset.                          |
| `src/app/(dashboard)/ajustes/roles/page.tsx` | Modify | Replace `.neq("email", "proyectoszipi@gmail.com")` with client-side filter using `isMaster` state. |

## Detailed Changes

### `src/app/actions.ts`

```typescript
// BEFORE
const masterEmail = (process.env.MASTER_EMAIL || 'proyectoszipi@gmail.com').trim().toLowerCase();

// AFTER
const masterEmail = (process.env.MASTER_EMAIL || '').trim().toLowerCase();
if (!masterEmail) return false;
```

### `src/middleware.ts`

```typescript
// BEFORE (line 96)
const masterEmail = (process.env.MASTER_EMAIL || 'proyectoszipi@gmail.com').trim().toLowerCase();

// AFTER
const masterEmail = (process.env.MASTER_EMAIL || '').trim().toLowerCase();
if (!masterEmail) isMaster = false;
```

### `src/hooks/useUserRole.ts`

```typescript
// REMOVE lines 59-63:
// if (!isMasterEmail && user.email?.trim().toLowerCase() === 'proyectoszipi@gmail.com') {
//     console.log("--> CLIENT FALLBACK: ...");
//     isMasterEmail = true;
// }
```

### `src/app/(dashboard)/ajustes/roles/page.tsx`

```typescript
// BEFORE (line 48)
.neq("email", "proyectoszipi@gmail.com")

// AFTER: Remove .neq() filter entirely, then filter client-side after fetch
// In fetchCostaleros: remove the .neq() call
const { data } = await supabase
    .from("costaleros")
    .select("id, nombre, apellidos, rol, puesto, email")
    .order("apellidos", { ascending: true });

// In component: filter using isMaster
const filteredCostaleros = costaleros
    .filter(c => !(isMaster && c.email === user.email)) // exclude self if master
    .filter(c => `${c.nombre} ${c.apellidos}`...)
```

## Interfaces / Contracts

### checkIsMaster (server action)

```typescript
checkIsMaster(email: string | undefined | null): Promise<boolean>
// Returns false if email is falsy
// Returns false if MASTER_EMAIL env var is unset or empty
// Returns true only if normalized emails match
```

## Deployment Considerations

1. **Set `MASTER_EMAIL` before deploy** — if unset in production, no user gets master access (fail closed).
2. **Document the env var** — add `MASTER_EMAIL` to `.env.local.example` or deployment docs.
3. **Verify value pre-deploy** — confirm env var matches intended master email.
4. **No migration needed** — this is a security hardening with no schema/data changes.

## Testing Strategy

| Layer       | What                                               | Approach                                       |
| ----------- | -------------------------------------------------- | ---------------------------------------------- |
| Unit        | `checkIsMaster` with unset/empty/set env var       | Direct function call with mocked `process.env` |
| Integration | Middleware redirect with/without MASTER_EMAIL      | Mock env and hit protected routes              |
| E2E         | Master user sees roles page; non-master redirected | Playwright as each role                        |

## Open Questions

None.

## Rollback

Revert modified files to previous commits. If locked out, temporarily set `MASTER_EMAIL` env var or restore fallback in `actions.ts` only — never in client hook.
