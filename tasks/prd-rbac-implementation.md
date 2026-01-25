# PRD - RBAC Security Implementation

## 1. Introduction/Overview

This feature implements Role-Based Access Control (RBAC) for the `apps/core` management application. It ensures that only authorized personnel (initially limited to `SUPER_ADMIN`) can access the management dashboards and functionalities located under the `/app/*` route. Unauthorized authenticated users will be gracefully redirected to a premium "Access Denied" page explaining their status.

The goal is to provide a secure, performant, and extensible authorization layer that integrates with the existing `better-auth` and `TanStack Router` setup.

## 2. Goals

1. **Security**: Secure all `/app/*` routes from unauthorized authenticated users.
2. **Performance**: Provide a performant authorization check (checked once at the root/layout level).
3. **UX**: Display a clear, localized (French) explanation for users awaiting role assignment.
4. **Extensibility**: Establish a framework where new roles (e.g., `SYSTEM_ADMIN`, `SCHOOL_ADMIN`) can be added to the authorized list easily.

## 3. User Stories

1. **As a Super Admin**, I want to access `/app/dashboard` seamlessly so that I can perform system management tasks.
2. **As an Authenticated User without a role**, if I try to access `/app/*`, I want to be redirected to a page that explains I am "En attendant d'attribution de votre rôle" so I understand why I can't proceed.
3. **As a Developer**, I want the authorization check to happen server-side during the routing phase to prevent flickering or leaking data to the client.

## 4. Functional Requirements

1. **Data Layer Integration**:
   - Implement `getUserSystemRolesByAuthUserId` in `packages/data-ops` to retrieve user roles from the database.
2. **Server-Side Authorization**:
   - Create a server function `getAuthStatus` to verify the session and fetch roles in a single request.
3. **Route Protection (TanStack Router)**:
   - Implement a `beforeLoad` guard on the `/app` parent route (or root) to enforce the role check.
   - For now, only users with the `super_admin` role slug are allowed access to `/app/*`.
4. **Router Context**:
   - Store the authorization status (e.g., `isAdmin: boolean`, `roles: string[]`) in the router context to avoid redundant database calls on child route transitions.
5. **Redirection Logic**:
   - Authenticated users without the required role must be redirected to `/unauthorized`.
   - Unauthenticated users should be redirected to the login flow (handled by existing auth logic).
6. **Unauthorized Page (`/unauthorized`)**:
   - Create a premium-styled 403 Access Denied page.
   - **Message**: "En attendant l'attribution de votre rôle par l'administrateur, ou contactez-le pour plus d'informations."
   - **Styling**: Must be premium, using modern CSS, transitions, and French localization.

## 5. Non-Goals (Out of Scope)

- Granular component-level permission checks (e.g., hiding a specific button inside a page) for this initial phase.
- An automated "Request Access" workflow or dashboard.
- Protection for routes outside the `/app` scope (e.g., marketing or public landing pages).

## 6. Design Considerations

- **Aesthetics**: The `/unauthorized` page should not look like a generic error. Use soft gradients, glassmorphism, or subtle animations to maintain a premium feel.
- **Localization**: All text elements must use French.
- **SSR**: Ensure that the redirection happens on the server to prevent any sensitive UI from being rendered before the check completes.

## 7. Technical Considerations

- **Stack**: TypeScript, TanStack Router (Start), better-auth, Drizzle ORM (via `packages/data-ops`).
- **Performance**: Role checks should be cached or stored in the router's context to minimize database round-trips (Rule 2B).
- **Scalability**: Use a list of "allowed roles" for the `/app` path to allow easy future expansion.

## 8. Success Metrics

- **Zero Leaks**: 100% of `/app/*` sub-routes are inaccessible to users without the `super_admin` role.
- **Redirection**: Validation that unauthorized users reach the `/unauthorized` page correctly.
- **Performance**: No perceptible delay in page loading due to role fetching (< 50ms overhead).

## 9. Open Questions

- Should we provide a logout button on the `/unauthorized` page in case the user wants to switch accounts immediately? (Requirement 1D was minimalist, but a logout option might be practical).
