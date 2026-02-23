# School Sidebar Revamp

## Relevant Files

- `apps/school/src/components/layout/sidebar.tsx` - Contains the main sidebar component to be refactored into a flat structure.
- `apps/school/src/routes/_auth.tsx` - Contains the main layout that wraps the sidebar.
- `apps/school/src/routes/_auth/accounting/index.tsx` - Requires refactoring to act as a layout shell with Tabs or redirect to the default Aperçu tab.
- `apps/school/src/routes/_auth/grades/index.tsx` - Requires refactoring to act as a layout shell with Tabs or redirect to the default Bulletins tab.
- `apps/school/src/routes/_auth/settings/index.tsx` - New centralized configurations hub requiring a Tabbed layout.
- `apps/school/src/routes/_auth/users/index.tsx` - Existing personnel/users route needing tabbed views and data table updates.
- `packages/ui/src/Tabs.tsx` - The shared Tabs component to be used for secondary navigation across complex modules.

### Notes

- Ensure all new navigation labels and Tab names are correctly localized in French (i18n).
- Maintain responsive design so that horizontal tabs overflow gracefully on smaller screens.
- Use `npx vitest` to run tests for UI components after making changes.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/school-sidebar-revamp`)
- [x] 1.0 Refactor Sidebar UI and Flat Navigation Structure
  - [x] 1.1 Remove the existing "Raccourcis" (Shortcuts) section entirely from `sidebar.tsx`.
  - [x] 1.2 Remove all collapsible sub-menus/accordions and flatten the navigation items.
  - [x] 1.3 Group navigation items into three explicit sections: Essentiel, Opérations, and Système.
  - [x] 1.4 Update icons and labels (in French) for the new flat structure (e.g., Comptabilité, Configurations).
- [x] 2.0 Implement Flat Routing Architecture and Default Redirects
  - [x] 2.1 Update top-level routes to map to the new Flat Sidebar items.
  - [x] 2.2 Configure default redirects for complex modules (e.g., clicking "Comptabilité" redirects to `/accounting/dashboard` or nearest default tab).
  - [x] 2.3 Ensure "Configurations" routes correctly map to the new centralized settings hub.
- [x] 3.0 Develop Secondary Horizontal Tab Navigation Layouts
  - [x] 3.1 Adopt the `Tabs` component from `packages/ui` as the standard for secondary navigation.
  - [x] 3.2 Create a shared layout template (`TabbedLayout` wrapper) that displays horizontal tabs and renders an `<Outlet />` below.
- [x] 4.0 Refactor Complex Modules to use Tabs
  - [x] 4.1 Update **Notes et moyennes** (Grades) to use Tabs: Bulletins, Saisie, Validations, Statistiques.
  - [x] 4.2 Update **Comptabilité** (Accounting) to use Tabs: Aperçu, Transactions, Frais & Échéanciers, Catalogue Tarifaire.
  - [x] 4.3 Update **Personnel** (Users) to implement a unified list with role filters and dynamic columns.
  - [x] 4.4 Update **Assiduité & Conduite** (Conducts) to use Tabs: Élèves, Professeurs.
  - [x] 4.5 Migrate scattered settings into the new **Configurations** centralized hub (Tabs: Profil, Années, Pédagogie, Comptabilité, etc.).
- [x] 5.0 Integrate Role-Based Access Control (RBAC) in Navigation
  - [x] 5.1 Implement permission checks in `sidebar.tsx` to conditionally hide flat navigation items.
  - [x] 5.2 Implement permission checks in the new tab layouts to conditionally hide specific tabs based on user roles.
- [x] 6.0 Test, Verify Navigation, and Review
  - [x] 6.1 Verify that clicking through the sidebar naturally flows to the correct default tabs.
  - [x] 6.2 Ensure all active states (highlighted items and tabs) render correctly for the current route.
  - [ ] 6.3 Verify RBAC behavior by testing with different user roles (e.g., Administrator, Director).
