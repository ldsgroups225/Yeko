# PRD: UX Workflow Improvement (UX 2.0)

## 1. Introduction

This Product Requirements Document outlines the "UX 2.0" initiative for Yeko School. The goal is to transition the application from a "Linear Configuration Traversal" model to a **"Mission-Based Success"** model. This comprehensive update includes implementing an Onboarding Checklist Widget, leveraging existing Smart Templates from the Core application, and completely restructuring the navigation into semantic hubs. The result will be an ultra-low learning curve and a premium, modern experience aligned with EdTech standards for 2024-2026.

## 2. Goals

- **Drastically Reduce Onboarding Time:** Enable a new administrator to complete the initial school setup (Identity + Structure) in **under 10 minutes** (down from ~45 min).
- **Reduce Cognitive Load:** Consolidate the sidebar navigation to reduce visible top-level items by ~40%, using logical hubs.
- **Leverage Existing Assets:** Utilize the "Smart Templates" (Levels, Series, Tracks) already defined in `apps/core` to populate empty schools instantly.
- **Improve User Engagement:** Transform the passive, empty dashboard into a proactive "Pilotage" hub that guides the user to success.

## 3. User Stories

- **As a new School Administrator**, I want to see a clear checklist on my dashboard upon first login, so I know exactly what steps to take to set up my school (Identity, Year, Structure).
- **As a School Administrator**, I want to import a pre-defined school structure (e.g., "Lycée Standard CI") from a library, so I don't have to manually create every subject, level, and series one by one.
- **As a School Administrator**, I want a navigation menu organized by function (Community, Pedagogy, etc.) rather than a flat list of 12+ items, so I can find tools faster and feel less overwhelmed.
- **As an experienced power user**, I want to use a global search (Cmd+K) to jump to specific students or settings without clicking through menus.

## 4. Functional Requirements

### 4.1. Onboarding Checklist Widget

1. **Placement:** prominently displayed on the "Pilotage" (Dashboard) page.
2. **Behavior:** Non-blocking (Passive). The user is free to navigate away, but the widget remains the focal point of the dashboard until completion.
3. **Steps Tracking:**
   - Step 1: **Identity** (School Name, Logo, Address).
   - Step 2: **Academic Year** (Create/Select active year).
   - Step 3: **Structure** (Import Smart Template).
4. **Completion State:** Once all steps are done, the widget should be minimized or replaced by the standard operational dashboard metrics.

### 4.2. Smart Templates Integration

1. **Source:** Retrieve template data (Education Levels, Series, Tracks/Subjects) from `apps/core` via existing queries/API.
2. **Action:** Provide an "Import Template" action within the Onboarding Widget (Step 3).
3. **Selection:** Allow the user to select from available templates (e.g., "Primary", "Secondary General").
4. **Execution:** On confirmation, bulk create the necessary entities in the `apps/school` database.

### 4.3. Navigation Redesign (Consolidated Hubs)

1. **Structure:** Replace the current sidebar with the following **6 Top-Level Hubs**:
   - **Pilotage:** Dashboard + Onboarding Widget.
   - **Communauté:** Merges Students, Parents, Staff, and Enrollment management.
   - **Pédagogie:** Merges Classes, Subjects, Timetables, and Assignments.
   - **Examens:** Merges Grades, Report Cards, and Statistics.
   - **Trésorerie:** Merges Accounting, Payments, and Fee Structures.
   - **Configuration:** Global settings (Profile, Years, Notifications) - (moved to bottom/icon or distinct section).
2. **Behavior:** Clicking a hub expands its sub-items or navigates to a landing page for that hub.

### 4.4. Global Search (Cmd+K)

1. **Trigger:** Activated via `Cmd+K` (Mac) or `Ctrl+K` (Windows) or a visible search icon in the header.
2. **Scope:** Search across Students, Staff, and Navigation items (e.g., "Go to Payments").

## 5. Non-Goals

- **Mobile App Specifics:** This PRD focuses on the web application experience (desktop/tablet).
- **Template Editing:** This feature does _not_ allow School Admins to create new global Smart Templates in `apps/core`. They only consume them.
- **Complex Customization:** Users cannot partially import a template in V1; it is an all-or-nothing import for simplicity.

## 6. Design Considerations

- **Aesthetics:** Maintain the premium "Glassmorphism" and "Vibrant" aesthetic defined in system prompts.
- **Empty States:** All pages (e.g., Student List) must have "Success Guided" empty states (i.e., "No students yet? [Import from CSV] or [Add Manually]").
- **Icons:** Use consistent iconography for the new Hubs (e.g., `IconThis` from Tabler Icons).

## 7. Technical Considerations

- **Frameworks:** Use TanStack Router for the new navigation structure.
- **Data Ops:** The import logic for templates will heavily rely on `bulkCreate...` mutations already present in `apps/school` or `packages/data-ops`.
- **State Management:** Ensure the Onboarding Widget state reflects the real-time status of the database (e.g., if a Year is deleted, the step un-checks).

## 8. Success Metrics

- **Onboarding Completion Rate:** % of new schools that reach "Operational" state (Students enrolled) within 24 hours.
- **Time to First Value:** Median time from account creation to first student enrollment.
- **Navigation Efficiency:** Reduction in clicks to reach common pages (measured via user testing/analytics).

## 9. Open Questions

- _None._ (User clarified that navigation redesign is permanent for all users and onboarding is passive).
