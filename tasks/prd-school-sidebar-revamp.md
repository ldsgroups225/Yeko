# Product Requirements Document: School Sidebar Revamp

## 1. Introduction/Overview

The Yeko School application's sidebar currently suffers from duplication, cognitive overload, scattered settings, and excessive depth. This project aims to revamp the entire `sidebar.tsx` architecture to a "Flat Navigation" model, combined with a secondary horizontal tabbed navigation (Tabs) for complex pages. The goal is to create a more user-centric, task-focused, and simplified navigation structure as detailed in the brainstorming document.

## 2. Goals

- **Simplify Navigation:** Reduce the cognitive load on users by eliminating nested menus in the main sidebar.
- **Consolidate Operations:** Group related tasks together (e.g., all accounting functions under "Comptabilité", all configurations under "Configurations").
- **Improve Discoverability:** Replace hidden deeply nested links with visible horizontal tabs on the main feature pages.

## 3. User Stories

- As a School Director, I want to see a flat, scannable sidebar so that I can quickly map out where I need to go without clicking through nested menus.
- As a User, when I click on a primary navigation item like "Comptabilité", I want to land on a high-level dashboard or default view and use horizontal tabs to switch between specific tasks (like Transactions, Fee Types), so I don't lose my context.
- As an Administrator, I want a single centralized "Configurations" tab so that I don't have to hunt across different modules to change system settings.

## 4. Functional Requirements

1. **Flat Sidebar Architecture:** The `sidebar.tsx` must only display top-level items organized sequentially into logical sections:
   - **Essentiel:** Tableau de bord, Élèves, Classes, Personnel
   - **Opérations:** Emploi du temps, Assiduité & Conduite, Notes et moyennes, Comptabilité
   - **Système:** Programmes, Espaces, Configurations
2. **Remove Shortcuts & Collapsibles:** The current "Raccourcis" section and all collapsible sub-menus/accordions must be completely removed from the sidebar.
3. **Default Tab Routing:** Clicking a sidebar item must navigate the user to the default/first tab for that module (e.g., clicking "Comptabilité" navigates to the Overview/Dashboard tab).
4. **Secondary Tab Navigation:** Complex modules must implement horizontal tab navigation on their respective pages:
   - **Notes et moyennes:** Tabs for Bulletins (default), Saisie, Validations, Statistiques.
   - **Comptabilité:** Tabs for Aperçu (default), Transactions, Frais & Échéanciers, Catalogue Tarifaire.
   - **Personnel:** Unified list with role filters and dynamic columns (Teachers vs. Staff).
   - **Assiduité & Conduite:** Tabs for Élèves, Professeurs.
   - **Configurations:** Tabs for Profil de l'École, Années Scolaires, Pédagogie & Bulletins, Assiduité & Conduite, Comptabilité & Finances, Système & Notifications.
5. **Role-Based Access Control (RBAC):** Tabs and sidebar items must be completely hidden from the UI if the user's role lacks the necessary permissions for that specific view.

## 5. Non-Goals (Out of Scope)

- Complete redesign of the internal page components (e.g., rewriting the tables, forms, or data structures themselves, unless necessary to accommodate the new Tabs).
- Changes to the backend APIs, server functions, or database schemas.
- Modifying routing or navigation for `apps/core` or `apps/teacher`.

## 6. Design Considerations

- **UI/UX:** Use existing standard UI components (Tabs from UI package). Maintain the "Flat" aesthetics with clear active state highlights on the sidebar.
- **Localization:** Ensure all new navigation labels and Tab names are correctly localized in French (i18n).
- **Responsive:** Ensure the horizontal tabs overflow gracefully or scroll horizontally on smaller screens.

## 7. Technical Considerations

- **Routing (`apps/school/src/routes/_auth/`)**:
  - Ensure `index.tsx` files for complex folders (like `accounting` or `grades`) either redirect to the default tab path or act as a layout shell containing the `<Tabs />` component and an `<Outlet />`.
  - The revamp will mostly impact `sidebar.tsx` and the layout/route structure of the main 11 business modules.
- **Migration Strategy**: Implement incrementally by building the new "Flat" sidebar first, mapping existing deep links, and then systematically converting individual complex pages to the new Tabbed Layout.

## 8. Success Metrics

- **Reduced Time to Task:** Decrease in the average number of clicks required to reach key configuration screens or specific accounting views.
- **User Satisfaction:** Positive qualitative feedback and fewer support requests regarding finding specific features.

## 9. Open Questions

- Are there any specific edge cases in the current deeply nested routing that might conflict with a flat layout approach?
- Which existing Tab component from our UI library (`packages/ui`) should be established as the strict standard for all secondary navigations?
