# Proposal: Harden Master Email Fallback

## Intent

Eliminate all client-side hardcoded master email fallbacks so the server is the **sole authority** for role resolution. Currently, `src/hooks/useUserRole.ts` contains a client-side bypass (line 60-63) that allows any user knowing the master email to spoof the superadmin role. This completely defeats server-side RBAC.

## Scope

### In Scope

- Remove client-side master email fallback in `src/hooks/useUserRole.ts`
- Harden `src/app/actions.ts` to use env var only (remove hardcoded default)
- Harden `src/middleware.ts` env var default (remove hardcoded fallback)
- Remove hardcoded email from `src/app/(dashboard)/ajustes/roles/page.tsx` query
- Ensure `MASTER_EMAIL` is documented/required in environment setup

### Out of Scope

- Full RBAC refactor or role schema changes
- Adding new roles or permissions
- Data layer abstraction (deferred to future change)

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- None

> This is a security hardening fix. No user-facing spec-level behavior changes.

## Approach

1. **Server-only role resolution**: `useUserRole.ts` must trust `checkIsMaster()` server action result unconditionally. Remove lines 60-63.
2. **Env-only master config**: `actions.ts` and `middleware.ts` must read `MASTER_EMAIL` from environment. If unset, fail closed (`isMaster = false`). Remove hardcoded `'proyectoszipi@gmail.com'` defaults.
3. **Clean client queries**: Replace hardcoded email exclusion in roles page with a server-driven filter or a `checkIsMaster`-based exclusion.

## Affected Areas

| Area                                         | Impact   | Description                                      |
| -------------------------------------------- | -------- | ------------------------------------------------ |
| `src/hooks/useUserRole.ts`                   | Modified | Remove client fallback; trust server action only |
| `src/app/actions.ts`                         | Modified | Remove hardcoded default; env-only master check  |
| `src/middleware.ts`                          | Modified | Remove hardcoded default; env-only master check  |
| `src/app/(dashboard)/ajustes/roles/page.tsx` | Modified | Remove hardcoded email from `.neq()` query       |

## Risks

| Risk                                            | Likelihood | Mitigation                                                                            |
| ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `MASTER_EMAIL` not set in production            | Low        | Verify env var before deploy; fail closed (no master access)                          |
| Legitimate master locked out after deploy       | Low        | Confirm env var value matches intended master email pre-deploy                        |
| Roles page query breaks without hardcoded email | Low        | Use server-side filter or query all and filter client-side via `checkIsMaster` result |

## Rollback Plan

Revert the four modified files to their previous commits. If master is locked out, temporarily set `MASTER_EMAIL` env var or restore the fallback in `actions.ts` only (never in client hook).

## Dependencies

- `MASTER_EMAIL` environment variable must be set in all deployment targets (Vercel, local `.env.local`).

## Success Criteria

- [ ] No hardcoded email strings remain in `src/` outside of config/env usage
- [ ] `useUserRole.ts` has zero client-side master email comparison logic
- [ ] Server action `checkIsMaster` returns `false` when `MASTER_EMAIL` is unset
- [ ] Manual test: logging in as non-master user does not grant master permissions
- [ ] Manual test: logging in as master user (via env config) retains full access
