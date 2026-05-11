# Master Email Resolution

## Requirements

### Requirement: Environment Variable Enforcement

The system MUST require `MASTER_EMAIL` to be set via environment variable. If unset, master resolution MUST fail closed (`isMaster = false`). No hardcoded fallback email SHALL exist anywhere in `src/`.

#### Scenario: MASTER_EMAIL is set

- GIVEN `MASTER_EMAIL` environment variable is set to a valid email
- WHEN `checkIsMaster()` is called with that email
- THEN it returns `true`

#### Scenario: MASTER_EMAIL is unset

- GIVEN `MASTER_EMAIL` environment variable is NOT set
- WHEN `checkIsMaster()` is called with any email
- THEN it returns `false`

#### Scenario: MASTER_EMAIL is empty string

- GIVEN `MASTER_EMAIL` environment variable is set to `""`
- WHEN `checkIsMaster()` is called with any email
- THEN it returns `false`

### Requirement: Client-Side Master Resolution

The client-side `useUserRole` hook MUST trust the server action `checkIsMaster()` result unconditionally. It SHALL NOT perform any email comparison against hardcoded values.

#### Scenario: Server returns true

- GIVEN user email matches `MASTER_EMAIL`
- WHEN `useUserRole` calls `checkIsMaster(user.email)`
- THEN `isMaster` state is set to `true`
- AND no client-side email comparison is performed

#### Scenario: Server returns false

- GIVEN user email does NOT match `MASTER_EMAIL`
- WHEN `useUserRole` calls `checkIsMaster(user.email)`
- THEN `isMaster` state is set to `false`
- AND no fallback logic overrides the result

#### Scenario: Server action throws

- GIVEN `checkIsMaster()` throws an error
- WHEN `useUserRole` catches the error
- THEN `isMaster` state is set to `false`

### Requirement: Middleware Role Check

The middleware MUST resolve master status using `MASTER_EMAIL` from environment only. It SHALL NOT use a hardcoded fallback.

#### Scenario: User accesses admin route as master

- GIVEN `MASTER_EMAIL` matches the authenticated user's email
- WHEN user navigates to `/ajustes/roles`
- THEN access is granted

#### Scenario: User accesses admin route as non-master

- GIVEN `MASTER_EMAIL` does NOT match the authenticated user's email
- AND user role in `costaleros` table is `costalero`
- WHEN user navigates to `/ajustes/roles`
- THEN user is redirected to `/dashboard`

#### Scenario: MASTER_EMAIL unset during middleware check

- GIVEN `MASTER_EMAIL` is not set
- WHEN any user navigates to an admin-only route
- THEN master check evaluates to `false` and role is determined solely by `costaleros.rol`

### Requirement: Server-Driven Master Exclusion

The roles page SHALL NOT hardcode the master email in database queries. Exclusion of the master account from the roles list MUST be driven by server-side logic or the resolved `MASTER_EMAIL` value.

#### Scenario: Roles page loads

- GIVEN user has `canManageRoles = true`
- WHEN roles page fetches costaleros
- THEN the master account is excluded from results
- AND no hardcoded email string appears in the query

#### Scenario: MASTER_EMAIL changes

- GIVEN `MASTER_EMAIL` is updated to a new email
- WHEN roles page fetches costaleros
- THEN the new master account is excluded (previous master is included if still in DB)