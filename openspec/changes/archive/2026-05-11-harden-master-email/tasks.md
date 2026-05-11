# Tasks: Harden Master Email Fallback

## Review Workload Forecast

| Field                   | Value       |
| ----------------------- | ----------- |
| Estimated changed lines | ~60-80      |
| 400-line budget risk    | Low         |
| Chained PRs recommended | No          |
| Suggested split         | Single PR   |
| Delivery strategy       | ask-on-risk |
| Chain strategy          | pending     |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                                 | Likely PR     | Notes                                                   |
| ---- | ------------------------------------ | ------------- | ------------------------------------------------------- |
| 1    | Remove hardcoded fallbacks + env doc | PR 1 (single) | All files touched; tests included; well under 400 lines |

## Phase 1: Foundation — Remove Hardcoded Fallbacks

- [x] 1.1 Modify `src/app/actions.ts` line 11: remove `|| 'proyectoszipi@gmail.com'` fallback so `masterEmail` is `process.env.MASTER_EMAIL?.trim().toLowerCase()` only; return `false` if unset/empty (fail-closed per spec: Env Var Enforcement)
- [x] 1.2 Modify `src/middleware.ts` line 96: remove `|| 'proyectoszipi@gmail.com'` fallback so `masterEmail` is `process.env.MASTER_EMAIL?.trim().toLowerCase()` only; `isMaster` evaluates `false` when env var is unset (per spec: Middleware Role Check)
- [x] 1.3 Modify `src/hooks/useUserRole.ts` lines 59-63: delete the entire client-side fallback block (`if (!isMasterEmail && user.email?.trim().toLowerCase() === 'proyectoszipi@gmail.com')`) so the hook trusts `checkIsMaster()` result unconditionally (per spec: Client-Side Master Resolution)

## Phase 2: Roles Page — Remove Hardcoded Query Filter

- [x] 2.1 Modify `src/app/(dashboard)/ajustes/roles/page.tsx` line 48: remove `.neq("email", "proyectoszipi@gmail.com")` from the Supabase query in `fetchCostaleros`
- [x] 2.2 Add client-side filter in `fetchCostaleros` or `filteredCostaleros` that excludes the master account using the `isMaster` state from `useUserRole` (filter by comparing each costalero's email to the resolved master, or filter out when `isMaster` is true and email matches known master from server)
- [x] 2.3 Verify no other hardcoded `proyectoszipi@gmail.com` strings remain in `src/` via grep search

## Phase 3: Environment Documentation

- [x] 3.1 Create `.env.local.example` with `MASTER_EMAIL=` placeholder and a comment explaining it is required for master resolution (fails closed if unset)
- [x] 3.2 Verify current `.env.local` has `MASTER_EMAIL` set; if not, flag as deployment blocker

## Phase 4: Testing

- [ ] 4.1 Write unit test for `checkIsMaster()`: assert `true` when email matches `MASTER_EMAIL` env var
- [ ] 4.2 Write unit test for `checkIsMaster()`: assert `false` when `MASTER_EMAIL` is unset
- [ ] 4.3 Write unit test for `checkIsMaster()`: assert `false` when `MASTER_EMAIL` is empty string
- [ ] 4.4 Write unit test for `checkIsMaster()`: assert `false` when email is null/undefined
- [ ] 4.5 Write integration test for middleware: assert redirect to `/dashboard` when non-master accesses `/ajustes/roles`
- [ ] 4.6 Write integration test for middleware: assert access granted when master (matching `MASTER_EMAIL`) accesses `/ajustes/roles`
- [ ] 4.7 Write integration test for middleware: assert redirect when `MASTER_EMAIL` is unset and user accesses admin route
- [ ] 4.8 Write test for `useUserRole`: assert `isMaster` is `false` when `checkIsMaster()` throws an error
- [ ] 4.9 Verify no client-side email comparison against hardcoded values exists in `useUserRole` (regression check)

## Phase 5: Verification

- [x] 5.1 Run `grep -r "proyectoszipi@gmail.com" src/` — must return zero results
- [ ] 5.2 Manually test: set `MASTER_EMAIL` to test email, verify master access works
- [ ] 5.3 Manually test: unset `MASTER_EMAIL`, verify all master checks return `false` and admin routes redirect
