<!-- cSpell:disable -->

This is the **Ultimate First-Usage & Migration Testing Protocol**. It is designed to be followed sequentially, as the system relies on a "Cascade of Configuration"—where Superadmin settings flow down to the School Admin, whose settings flow down to the Teachers.

---

# 🚀 Yeko Platform: Full Lifecycle "Day Zero" Testing Protocol

## 🌐 Phase 1: The Architect's Foundation (Superadmin)
**Persona:** *Darius, Platform Owner*  
**App:** `apps/core`  
**Goal:** Define the global rules so that a school has a template to work from.

### 1.1 Standardizing the Education System
- [ ] **Define Education Levels:** Navigate to `/app/catalogs/tracks`. Create "Primaire" (ID 2) and "Secondaire" (ID 3).
- [ ] **Map the Tracks:** For "Secondaire", create two tracks: "Enseignement Général" and "Enseignement Technique".
- [ ] **Niveau & Séries Architecture:** 
    - [ ] Go to `/app/catalogs/grades`.
    - [ ] Add "3ème" to "Général". Add "Terminale" to "Général".
    - [ ] Navigate to "Séries" and add "Série C" and "Série D" specifically linked to the "Général" track.
- [ ] **Standard Subject Catalog:** 
    - [ ] Navigate to `/app/catalogs/subjects`.
    - [ ] **Bulk Import Test:** Use the "Modèle" button to download the template, fill it with 10 subjects (Maths, SVT, etc.), and re-upload. Verify the `bulkCreateSubjects` mutation correctly populates the list.

### 1.2 Global Academic Templates
- [ ] **School Year Blueprint:** Go to `/app/catalogs/school-years`. Create a template named "Standard 3-Trimester Year".
- [ ] **Term Structure:** Inside that template, add "Trimestre 1", "Trimestre 2", and "Trimestre 3". Assign them orders 1, 2, and 3.
- [ ] **The "Master" Coefficients:** 
    - [ ] Navigate to `/app/catalogs/coefficients`.
    - [ ] Create a rule: "Maths" in "Terminale C" has a weight of `5`. Verify via the `matrix` view.

### 1.3 Tenant Ignition
- [ ] **School Creation:** Go to `/app/schools/create`. Create "Lycée Scientifique de Yamoussoukro".
- [ ] **Administrative Handover:** 
    - [ ] Open the "Create Admin" dialog for this new school.
    - [ ] Enter "Mme. Diallo" and her email.
    - [ ] **Dev/Prod check:** If in Dev, copy the temporary password from the UI. If in Prod, check the server logs/Resend dashboard for the `sendWelcomeEmail` trigger.

---

## 🏫 Phase 2: The Principal’s First Login (School Admin)
**Persona:** *Mme. Diallo, School Administrator*  
**App:** `apps/school`  
**Goal:** Claim the tenant, brand it, and activate the team.

### 2.1 Identity & Branding
- [ ] **The Profile Claim:** Log in with temporary credentials.
- [ ] **Self-Update:** Navigate to `/settings/profile`. Update your name to "Mme. Fatou Diallo" and add a phone number. Verify the `updateUser` query reflects in the header immediately.
- [ ] **School Branding:** 
    - [ ] Still in Profile, upload the school logo to R2 via the `PhotoUploadDialog`.
    - [ ] Update the physical address and official school email.
- [ ] **Local Policy:** Go to the "Grading Scale" tab. Change the "Excellent" threshold from `16` to `17`. Verify the JSONB `settings` field in the `schools` table updates.

### 2.2 Activating the Academic Year
- [ ] **The First Year:** Navigate to `/settings/school-years`.
- [ ] **Template Selection:** Click "New Year", select the "Standard 3-Trimester Year" template created by Darius.
- [ ] **Date Calibration:** Set the start date to Sept 2025 and end to June 2026. Set as **Active**.
- [ ] **Verification:** Refresh the page. Ensure the `SchoolYearSwitcher` in the header now shows "2025-2026".

### 2.3 Recruitment & HR
- [ ] **The Staff Team:** Navigate to `/users/staff`. Create a user for "M. Robert" (Accountant).
- [ ] **Role Verification:** Log out and log in as M. Robert. Verify he **can** access Accounting but **cannot** access "School Settings".
- [ ] **The Teaching Body:** Navigate to `/users/teachers`.
    - [ ] Create "M. Bamba". 
    - [ ] **Subject Qualification:** In the "Subjects" tab of his profile, assign him "Mathématiques" and "Physique". Verify the `teacher_subjects` junction table records this.

---

## 📋 Phase 3: Infrastructure & Ingestion (Registrar/Admin)
**Persona:** *M. Kouassi, Registrar*  
**App:** `apps/school`  
**Goal:** Map the physical to the digital.

### 3.1 Space & Class Setup
- [ ] **Physical Mapping:** Go to `/spaces/classrooms`. Create "Amphi A" and "Labo 1".
- [ ] **Class Creation:** Go to `/classes`. Create "Terminale C1".
    - [ ] Assign "Amphi A" as the classroom.
    - [ ] Assign "M. Bamba" as the Homeroom Teacher.
- [ ] **Subject Activation:** Go to `/programs/subjects`. Use the "Picker" to add "Maths" and "Physique" from the global catalog to the school's local list for this year.

### 3.2 The Great Student Import
- [ ] **Mass Import:** Navigate to `/students/bulk-operations`.
- [ ] **Validation Stress Test:** Upload a CSV where a student's gender is "X" (invalid). Verify the `validateImportData` server function catches it.
- [ ] **The "Confirmed" Enrollment:** Process the import. 
- [ ] **Manual Enrollment:** Take a "Pending" student and manually move them into "Terminale C1". Verify the `rollNumber` auto-increments.

---

## 💰 Phase 4: Setting the Price (Accountant)
**Persona:** *M. Robert, Accountant*  
**App:** `apps/school`

- [ ] **Tuition Setup:** Go to `/accounting/fee-structures`. Set a fee for "Terminale" at `250,000 FCFA`.
- [ ] **Payment Plan:** Create a "Bimensuel" template (50% upfront, 50% in 3 months).
- [ ] **Collection:** Record a payment for a student. Verify the `student_fees` balance decreases and a `transaction` line is created in the ledger.

---

## 📱 Phase 5: The Classroom Pulse (Teacher)
**Persona:** *M. Bamba, Teacher*  
**App:** `apps/teacher` (Mobile)

- [ ] **Context Sync:** Log in. Verify the app knows you belong to "Lycée Scientifique".
- [ ] **The "Cahier de Texte":** 
    - [ ] Start a session for "Maths". 
    - [ ] Mark a chapter as "In Progress" (Verify `curriculum-progress.ts` update).
    - [ ] Record participation grades for 3 students.
- [ ] **Academic Submission:**
    - [ ] Enter Quiz grades for "Terminale C1".
    - [ ] **Workflow Check:** Click "Submit for Validation". Verify you can no longer edit these grades in the mobile app.

---

## 🔍 Phase 6: Integrity & Quality Audit (Admin/Coordinator)
**Persona:** *Mme. Diallo / Mme. Koné*

- [ ] **Grade Approval:** In `apps/school`, go to `/grades/validations`. See M. Bamba's quiz. **Approve it**.
- [ ] **Audit Trail:** Go to `Audit Logs`. Ensure every action taken by Bamba, Robert, and Diallo is logged with their IP and Timestamp.
- [ ] **Final Report Card:** Generate a preview for a student. Does the "Maths" coefficient (5) correctly calculate the weighted average based on the quiz Bamba just entered?

---

## 🧪 Edge Case "Kill-Switches" (Final Stress Test)
- [ ] **The "Year Switch" Test:** Switch the header to an old school year. Try to record a payment. It should fail or warn (contextual locking).
- [ ] **The "Empty State" Test:** Delete all staff members (except admin). Verify the `staff-table.tsx` shows the custom `EmptyState` component with an "Add Staff" CTA.
- [ ] **The "R2 Leak" Test:** Try to access a student photo URL from an incognito window without a session (if using private buckets). 
- [ ] **Soft Delete:** Delete a user. Search for them. Ensure `deleted_at` is set and they don't appear in lists, but the `audit_logs` still reference their ID.
<!-- cSpell:enable -->
