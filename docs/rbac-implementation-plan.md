# RBAC Security Implementation Plan - apps/core

## Overview

Implement Role-Based Access Control (RBAC) to restrict access to the management application (`/app/*` routes) to users with the `super_admin` or `system_admin` roles.

## 🏗️ Architecture Analysis

- **Authentication**: Powered by `better-auth`.
- **Authorization**: Custom roles and permissions stored in `user_roles` and `roles` tables within the `packages/data-ops` layer.
- **Routing**: TanStack Router (Start/Framework).
- **Enforcement**: Server-side checks via `beforeLoad` and server functions.

## 📋 Implementation Steps

### 1. Data Foundation (packages/data-ops)

- [ ] Add `getUserSystemRolesByAuthUserId` to `packages/data-ops/src/queries/school-admin/users.ts`.
- [ ] Export the new utility from the package index if necessary.

### 2. Backend Security (apps/core)

- [ ] Create `src/core/functions/get-auth-status.ts` server function.
  - Fetches the current session.
  - Queries system-scope roles for the authenticated user.
  - Returns boolean flags (e.g., `isSuperAdmin`) and role slugs.

### 3. Routing & UI Protection (apps/core)

- [ ] Update `src/routes/__root.tsx` context type.
  - Include `auth` status in `createRootRouteWithContext`.
- [ ] Update `src/routes/_auth/route.tsx` with `beforeLoad`.
  - Execute `getAuthStatus`.
  - Throw a `redirect` to `/unauthorized` if the user is authenticated but lacks the required roles for `/app` paths.
- [ ] Create `src/routes/unauthorized.tsx`.
  - Implement a premium-styled 403 Access Denied page in French.

### 4. Validation & Quality

- [ ] Verify SSR compatibility (ensuring roles are fetched before page render).
- [ ] Test redirection loops.
- [ ] Verify that unauthenticated users are still redirected to login (handled by component layer).

## 🛡️ Security Guardrails (Reference: security-audit.md)

- Ensure no database mutations occur without `schoolId` scoping (where applicable).
- Validate all server function inputs with Zod.
- Never expose sensitive role details to the client-side beyond what's needed for UI toggling.
