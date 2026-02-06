# Grade Management & E2E Test Preparation

## Session Summary: Grade Publishing Refinements and Persistence

During this session, we focused on two key areas of the application: enabling flexible grade publishing workflows and ensuring the persistence of local draft states.

### 1. Incomplete Grade Publishing

We refined the publishing logic to accommodate real-world teaching scenarios where not all students may be graded simultaneously.

- **Confirmation Workflow**: Implemented a `ConfirmationDialog` (using `@workspace/ui/components/confirmation-dialog`) that triggers when a teacher attempts to publish a note with missing grades.
- **Automated Handling**: configured the system to automatically assign a grade of `0` to any student missing a grade upon explicit confirmation, ensuring data integrity while allowing the publication to proceed.
- **Logic Refactoring**: Split the publishing logic into `handlePublish` (check logic) and `executePublish` (write logic) to support both direct and confirmed execution paths.
- **UI Feedback**: Updated the `UnpublishedNoteSheet` to provide visual warnings (amber styling) and explanatory text when grades are missing.

### 2. Persistent Draft Indicator

We resolved a critical UX issue where the "Unpublished Note" indicator would vanish upon navigation or reload.

- **Context-Wide Discovery**: Updated `localNotesService.findUnpublishedNote` to allow searching for drafts by `classId` and `teacherId` alone, removing the strict dependency on `subjectId`. This ensures drafts are detected immediately upon entering the class view.
- **Dynamic Counting**: Added a `countUnpublishedNotes` method to the local database service to retrieve the exact number of pending drafts.
- **Real-Time Queries**: Integrated a new React Query (`unpublished-count`) in the `ClassDetailPage` to drive the notification badge.
- **State Synchronization**: Ensured that saving or publishing a note triggers an immediate refetch of both the note details and the count, keeping the UI in sync with the local PGlite database.

---

## E2E Test Plan: Grade Creation and Publication

This test plan validates the complete lifecycle of a grade, from explicit creation to local persistence and final server publication.

### Test Environment

- **User Role**: Teacher
- **Pre-requisites**:
  - Logged in user with access to at least one school and classroom.
  - Device/Browser in a valid state (local DB initialized).
  - Network connection available (for final publication).

### E2E Flow Scenarios

#### Scenario 1: Navigation and Grade Creation

**Objective**: Verify the user can navigate to a specific classroom and create a local draft.

1. **Navigation**
   - **Step**: Tap the **Planning** / **École** tab on the bottom navigation bar.
   - **Step**: Navigate to **Schools** list.
   - **Step**: Select a specific **School** (e.g., "Lycée Jules Verne").
   - **Step**: Select a **Classroom** (e.g., "6ème A").
   - **Check**: Validates that the Class Detail view loads correctly (Student list, existing grades).

2. **Draft Creation**
   - **Step**: Click the **"Ajouter une note"** (Add Note) button.
   - **Check**: The grade form/entry mode appears (Evaluation metadata: Title, Type, Coef, Max Points).
   - **Step**: Fill in the grade details:
     - Title: "Test E2E Evaluation"
     - Subject: Select a subject (e.g., "History")
     - Type: "Devoir"
     - Max Points: "20"
   - **Step**: Enter grades for at least one student.
   - **Step**: Click **"Enregistrer"** (Save) to save locally.
   - **Check**: Form closes or valid toast appears confirming local save.

#### Scenario 2: Persistence and Indicator Verification

**Objective**: Verify that the system correctly identifies and persists the unpublished draft.

1. **Indicator Visibility**
   - **Check**: The **"Note non publiée"** (Unpublished Note) button appears in the action bar.
   - **Check**: The badge on the button shows the correct count (e.g., "1").

2. **Persistence (Optional/Robustness)**
   - **Step**: Navigate back to the School list or Dashboard.
   - **Step**: Return to the same **Classroom**.
   - **Check**: The **"Note non publiée"** button is still visible immediately upon load.

#### Scenario 3: Publication

**Objective**: Verify the draft can be successfully published to the server.

1. **Initiate Publication**
   - **Step**: Click the **"Note non publiée"** button.
   - **Check**: The **Unpublished Note Sheet** opens, displaying the draft summary.
   - **Check**: If students are missing grades, the "Publier" button should be amber/warning styled.

2. **Execute Publish**
   - **Step**: Click **"Publier la note"**.
   - **Conditional Check**:
     - *If incomplete*: A confirmation dialog should appear ("Il y a X élève(s) sans note..."). Click **"Publier quand même"**.
   - **Check**: Success toast appears ("Note publiée avec succès !").
   - **Check**: The **"Note non publiée"** button disappears.
   - **Check**: The new grade column appears in the main grades table (if applicable/implemented).
