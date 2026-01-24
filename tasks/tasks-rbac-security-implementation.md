# TASKS - RBAC Security Implementation

## Relevant Files

- `packages/data-ops/src/queries/school-admin/users.ts` - Implementation of the database query to fetch user system roles.
- `apps/core/src/core/functions/get-auth-status.ts` - Server function to consolidate auth session and role status.
- `apps/core/src/routes/__root.tsx` - Root route file to define global context for auth and roles.
- `apps/core/src/routes/_auth/route.tsx` - Layout route for protected paths where `beforeLoad` guards will be implemented.
- `apps/core/src/routes/unauthorized.tsx` - The "Access Denied" page for authenticated users without sufficient permissions.

### Notes

- Use Functional patterns and early returns in TypeScript as per project standards.
- All UI text must be in French (i18n).
- Ensure `beforeLoad` checks are performant since they block route transitions.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for RBAC implementation: `git checkout -b feat/rbac-security`
- [x] 1.0 Data Foundation (packages/data-ops)
  - [x] 1.1 Add `getUserSystemRolesByAuthUserId` to `packages/data-ops/src/queries/school-admin/users.ts`.
  - [x] 1.2 Ensure the query returns a list of role slugs (e.g., `["super_admin"]`).
  - [x] 1.3 Export the new utility from the package index if required for cross-package usage.
- [x] 2.0 Backend Security Functions (apps/core)
  - [x] 2.1 Create the server function `src/core/functions/get-auth-status.ts`.
  - [x] 2.2 Implement session fetching using `better-auth`.
  - [x] 2.3 Call `getUserSystemRolesByAuthUserId` and return a structured object (e.g., `{ isAuthenticated: true, roles: [...], isSuperAdmin: true }`).
- [x] 3.0 Global Router Context & State Integration
  - [x] 3.1 Update the context definition in `src/routes/__root.tsx` to include authorization metadata.
  - [x] 3.2 Ensure the router context is populated during the initial load/SSR phase.
- [x] 4.0 Route Protection & Authorization Guards
  - [x] 4.1 Locate the parent route for protected management pages (likely `src/routes/_auth/route.tsx` or `/app`).
  - [x] 4.2 Implement `beforeLoad` to check if the user has the `super_admin` role.
  - [x] 4.3 Implement the redirect logic to `/unauthorized` if the role check fails.
- [x] 5.0 Unauthorized Access UI & Localization
  - [x] 5.1 Create the route file `src/routes/unauthorized.tsx`.
  - [x] 5.2 Build a premium "Access Denied" UI with the required French message: "En attendant l'attribution de votre rôle par l'administrateur, ou contactez-le pour plus d'informations."
  - [x] 5.3 Apply modern styling (gradients, premium typography) to the page.
- [ ] 6.0 Quality Assurance & Security Validation
  - [ ] 6.1 Manually verify that a `super_admin` user can still access `/app/*` routes.
  - [ ] 6.2 Verify that a logged-in user without the role is redirected to `/unauthorized`.
  - [ ] 6.3 Verify that unauthenticated users are redirected to the login page (not `/unauthorized`).
  - [ ] 6.4 Ensure no sensitive role info is exposed unnecessarily in the client-side console or state.
