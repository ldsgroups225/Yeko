# Reproduction Plan: Legacy Inscription Wizard to `/pre-inscription`

## 1. Goal

Reproduce the old `yeko-pro` inscription wizard UX in `apps/school` at route `/pre-inscription`, while aligning implementation with current Yeko architecture:

1. TanStack Start file routing (`apps/school/src/routes`).
2. Shared UI primitives from `@workspace/ui`.
3. Current school data model (`students`, `classes`, `enrollments`, `fee_structures`, `student_fees`, `payments`).
4. Security and multi-tenant constraints (school-scoped data, no hardcoded values, zod-validated inputs, no raw throw in data layer).

## 2. Legacy Flow Analysis (Old `yeko-pro`)

Source reviewed in `/home/darius-kassi/Desktop/yeko-pro/app/inscriptions`.

### 2.1 Step Flow

The legacy wizard is a 6-step flow:

1. `Identification`
2. `Confirmation`
3. `Niveau`
4. `Frais de scolarité`
5. `Paiement`
6. `Succès`

### 2.2 UX Patterns to Preserve

1. Full-page centered flow with strong Yeko branding and logo at top.
2. Horizontal stepper with numeric circles, current step highlight, completed state checkmark, and back navigation by clicking prior steps.
3. Single focused task per step with clear previous/next actions.
4. Visual summary cards before payment and after success.
5. Dark, high-contrast look with orange primary action (as seen in the old screenshot and old theme tokens).

### 2.3 Legacy Step Responsibilities

| Step | User Action | Legacy Data Action |
| --- | --- | --- |
| 1 | Enter school code + student matricule; optionally create student | Search school + student; create student if missing |
| 2 | Confirm school and student details | No mutation |
| 3 | Select grade + toggles (state assignment, orphan, canteen, transport) | Fetch grades |
| 4 | Review fee breakdown | Fetch fee config and compute display totals |
| 5 | Choose payment method and pay | Create enrollment (payment was mocked) |
| 6 | Show success and receipt link | Open receipt PDF endpoint |

### 2.4 Legacy Issues Not to Carry Over

1. `searchAttempts >= 0` logic always true, immediately opening create-student modal on first miss.
2. Hardcoded `parent_id` in student creation payload.
3. Step 4 state update during render (`setState` in render path), which is brittle.
4. Payment amount formula effectively fixed to `10000` (`YEKO_AMOUNT + amount * 0`).
5. Payment methods were mock-only and not tied to actual finance entries.
6. Mixed throw-based server logic (does not follow current Result-oriented policy in data-ops).

## 3. Current Monorepo Constraints and Gaps

### 3.1 Direct Mismatch with Current Schema

1. Current `enrollments` require `classId` and `schoolYearId`; legacy flow chooses only grade.
2. Current fee and payment stack is `fee_structures -> student_fees -> payments (+ allocations)`, not single “first installment” fields.
3. Existing school server functions are mostly `authServerFn`-protected; `/pre-inscription` is public.

### 3.2 Required Architectural Decisions

1. Add **class selection** to the wizard (same step as grade, or a dedicated sub-step).
2. Implement **public server functions** (with `createServerFn`) dedicated to pre-inscription.
3. Keep enrollment creation as `pending` by default; optionally confirm/payment in a controlled follow-up.
4. Use existing finance primitives for real payment capture, or explicitly ship v1 with “reservation only” and no payment mutation.

## 4. Target Route and Module Design

## 4.1 Route

1. New file: `apps/school/src/routes/pre-inscription.tsx`
2. Public route (outside `/_auth`) with no login gate.
3. Loader only for lightweight page metadata; interactive flow done client-side with server functions.

### 4.2 Suggested Feature Folder

Create a dedicated feature folder to keep route thin:

1. `apps/school/src/components/pre-inscription/pre-inscription-wizard.tsx`
2. `apps/school/src/components/pre-inscription/stepper.tsx`
3. `apps/school/src/components/pre-inscription/steps/step-1-identification.tsx`
4. `apps/school/src/components/pre-inscription/steps/step-2-confirmation.tsx`
5. `apps/school/src/components/pre-inscription/steps/step-3-academic-selection.tsx`
6. `apps/school/src/components/pre-inscription/steps/step-4-fee-summary.tsx`
7. `apps/school/src/components/pre-inscription/steps/step-5-payment.tsx`
8. `apps/school/src/components/pre-inscription/steps/step-6-success.tsx`
9. `apps/school/src/components/pre-inscription/create-student-dialog.tsx`

### 4.3 Public API Layer (New)

Add pre-inscription-specific server functions:

1. `apps/school/src/lib/api/pre-inscription.ts`
2. `findSchoolAndStudentByCodeAndMatricule`
3. `createPreInscriptionStudent`
4. `listPreInscriptionClassesBySchoolCode` (grade + class options)
5. `calculatePreInscriptionFees`
6. `submitPreInscription` (enrollment creation, optional payment, response payload for success step)

Validation schemas:

1. `apps/school/src/schemas/pre-inscription.ts`
2. Strict zod validation for every step payload.

## 5. Step-by-Step Reproduction Plan

### Phase 0: Foundation and Contracts

1. Define data contract objects for wizard state and server responses.
2. Decide v1 payment behavior:
   1. Option A: full payment creation using `recordPayment`.
   2. Option B: enrollment reservation only (no payment), with “pay at school” messaging.
3. Finalize class selection UX (required due schema).

### Phase 1: Public Read APIs

1. Implement school lookup by code (active schools only).
2. Implement student lookup by matricule scoped to school.
3. Implement class/grade list query scoped to school and active year.
4. Add anti-abuse controls for public endpoints:
   1. Basic request throttling strategy.
   2. Generic error responses to reduce data probing.

### Phase 2: Public Mutations

1. Student creation endpoint for “new student” fallback.
2. Enrollment creation endpoint using current `enrollments` model.
3. Optional fee assignment trigger for newly created enrollment when needed.
4. Optional payment recording endpoint (if payment is in scope for v1).

### Phase 3: Wizard UI Shell

1. Build page shell with centered max-width container and branded visual.
2. Build sticky stepper with:
   1. Current step highlighting.
   2. Completed step state.
   3. Back-navigation to previous steps only.
3. Implement persistent wizard state store (React state is sufficient for v1).

### Phase 4: Individual Steps

1. Step 1: Identification
   1. School code + matricule form with zod resolver.
   2. Search action and error handling.
   3. “Create new student” dialog path.
2. Step 2: Confirmation
   1. School details card.
   2. Student details card.
3. Step 3: Academic Selection
   1. Grade and class selection (required adaptation).
   2. Legacy toggle options retained where meaningful.
4. Step 4: Fee Summary
   1. Compute display breakdown from current fee model.
   2. Show annual/required-now amounts based on agreed rule.
5. Step 5: Payment
   1. Method selection UI (Orange, MTN, Moov, Wave visual choices).
   2. Map selected provider to actual `payment.method/mobileProvider` if real payment is enabled.
   3. Handle pending/failed/success states.
6. Step 6: Success
   1. Enrollment recap.
   2. Receipt reference and follow-up instructions.

### Phase 5: i18n and Copy

1. Add keys in:
   1. `apps/school/src/i18n/locales/fr.ts`
   2. `apps/school/src/i18n/locales/en.ts`
2. Regenerate typesafe i18n outputs.
3. Ensure no hardcoded UI strings remain in the wizard components.

### Phase 6: QA and Hardening

1. Unit tests (schemas and fee calculations).
2. Integration tests for public API functions:
   1. Valid lookup.
   2. Unknown school.
   3. Unknown matricule.
   4. Duplicate enrollment attempt.
3. E2E flow test for full wizard.
4. Accessibility checks:
   1. Keyboard navigation across steps.
   2. Focus management in dialog.
   3. Proper semantics for lists and alerts.

## 6. UX Reproduction Checklist

1. Keep six numbered steps and same semantic progression.
2. Keep dark branded ambiance with orange CTA hierarchy.
3. Keep strong visual summaries before and after payment.
4. Preserve “search existing student or create new” split in step 1.
5. Improve mobile ergonomics (single-column cards and sticky step labels collapse on small screens).

## 7. Security and Data Integrity Checklist

1. No hardcoded IDs or secrets.
2. Strict zod validation on all public inputs.
3. Ensure all school-scoped reads and writes are filtered by resolved `schoolId`.
4. Prevent duplicate active enrollments for same student/year.
5. Guard public mutation endpoints with abuse mitigation.
6. Log mutation failures and suspicious repeated lookup patterns.

## 8. Definition of Done

1. `/pre-inscription` route is accessible and fully functional.
2. Full 6-step journey works with current schema (including class requirement).
3. All user-facing strings are localized (`fr` and `en`).
4. Legacy UX feel is preserved while removing known legacy bugs.
5. Tests cover happy path and core failure paths.

## 9. Delivery Sequence

1. Implement foundational public API contracts and class-selection adaptation first.
2. Build and wire steps 1 to 4.
3. Implement step 5 payment mode (full payment or reservation-only per final product decision).
4. Finish success step + receipt flow.
5. Complete i18n, tests, and polish pass.

## 10. Open Product Decision Required Before Implementation Lock

1. Should v1 create a real `payments` record during step 5, or only create a pending enrollment and defer payment to back-office?
2. If real payment is required, what exact allocation strategy is expected for `student_fees` in the first transaction?
3. If class auto-assignment is preferred over explicit class selection, what deterministic rule should be used when multiple classes share the selected grade?
