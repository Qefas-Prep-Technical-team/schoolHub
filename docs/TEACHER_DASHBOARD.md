# Teacher Dashboard Specification & Architecture (`TEACHER_DASHBOARD.md`)

> **Subsystem**: Teacher Class Management, Offline Grade Recording, Academic Scoping, and Subject Access Control.  
> **Primary References**: [`docs/README.md`](README.md), [`ASSESSMENT_DATA_MODEL.md`](../ASSESSMENT_DATA_MODEL.md), [`AUTH_STATE.md`](../AUTH_STATE.md), [`.agents/AGENTS.md`](../.agents/AGENTS.md).

---

## 1. Architectural Overview

Teachers interact with students, classes, and academic records via `/dashboard/teacher/*`. In Qefas Hub, teachers are scoped to their assigned classes, subjects, and institutional boundary (`schoolId`).

```
Teacher User
    │
    ▼
Teacher Dashboard (/dashboard/teacher)
    │
    ├── My Classes (/dashboard/teacher/my-classes)
    │     ├── Class Details & Roster
    │     ├── Offline Grades & Marksheets
    │     └── Class Attendance & Timetable
    │
    ├── Record Assessment Scores (Offline Modal)
    │     ├── Strict Subject Scoping (Teacher assigned subjects only)
    │     ├── Active Academic Session Resolution
    │     ├── Browser Auto-Save & Recovery (`localStorage`)
    │     └── Grade Hub Publishing / Draft Persistence
```

---

## 2. Invariants & Security Rules

### 2.1 Academic Session & Term Scoping
1. **School-Wide Active Session**:
   - The teacher dashboard must query active academic sessions using the school context (`/api/v1/sessions?schoolId=...`).
   - The modal automatically defaults to the active school term (`FIRST`, `SECOND`, or `THIRD`) and session ID.
   - When a teacher opens the offline grade pad from a class, `schoolId` is passed explicitly from `classData.schoolId` so sessions resolve without falling back to an empty list.

### 2.2 Teacher Subject Scoping (No Subject Bleed)
1. **Only Assigned Subjects in Dropdowns**:
   - In both `RecordScoreEntryModal` and `OfflineGradeSheetSyncModal`, teachers must **never** see subjects taught by other teachers in that class.
   - The subject selection dropdown is strictly filtered by the teacher's active assignments from `useTeacherSubjects(schoolId)` (`teacherSubjectsData`).
   - If a subject is not assigned to the teacher, it is excluded from the selectable options.

### 2.3 Backend Authorization (403 Prevention)
1. **School Context & Affiliation Check**:
   - When teachers record or view offline marks via `/api/v1/grades`, authorization must verify the teacher's affiliation:
     1. Direct `schoolId` match on the user object.
     2. Active `ClassTeacher` assignment for the requested class.
     3. Active `TeacherSubject` assignment in the school.
     4. Active `RelationshipLink` connecting the teacher to the institution.
   - If verified, the teacher is permitted to view sessions and submit marks without experiencing a `403 Forbidden` error.

---

## 3. Offline Grades & Assessment Pad Features

### 3.1 Modal Layout & Button Hierarchy
- **Single Nav Action Bar**:
  - Duplicate action buttons have been removed from the inner `OfflineGradesHeader`.
  - The modal top navigation hosts primary actions:
    - **Cancel**: Closes the dialog cleanly without confirmation dialogs.
    - **Save Draft**: Saves entered scores with `status: "DRAFT"` to the database.
    - **Publish Marks**: Saves and publishes scores with `status: "PUBLISHED"`.
  - The Radix dialog close button is explicitly disabled (`showCloseButton={false}`) to prevent redundant "X" icons.

### 3.2 Dynamic Assessment Title
- When the user modifies the assessment title in the configuration pad (e.g. changing from `"Continuous Assessment 1"` to `"Midterm Test - Chemistry"`), the header banner in `OfflineGradesHeader` dynamically updates to mirror the title in real time.
- If blank, it gracefully defaults to `"Offline Grades & Assessment Pad"`.

### 3.3 Browser Auto-Save & Unsaved Draft Recovery
- **Automatic Persistence**:
  - As soon as marks, remarks, or a custom assessment title are entered, the pad automatically writes a snapshot to `localStorage` under key `qefas_offline_grade_draft_{classId}_{userId}`.
- **Accidental Closure Protection**:
  - If a teacher accidentally cancels or closes the browser tab, reopening the offline grade modal for that class automatically restores their in-progress marks, remarks, and assessment configuration.
- **Visual Feedback & Clear Action**:
  - An `"Auto-saved draft"` pulse badge appears in the top navigation.
  - A `"Clear Draft"` button is rendered allowing the teacher to discard the local browser draft at any time and return to a blank marksheet.
- **Automatic Cleanup**:
  - Upon successful database save (`Save Draft` or `Publish Marks`), the `localStorage` key is automatically purged.

---

## 4. Verification Checklist

- [x] Verified teacher assigned subjects dropdown contains only the teacher's subjects.
- [x] Verified active academic session populates correctly in the offline assessment pad.
- [x] Verified teacher can save drafts and publish marks without 403 authorization errors.
- [x] Verified only one set of Save Draft / Publish buttons exists in the top nav.
- [x] Verified the assessment title dynamically updates the header banner.
- [x] Verified browser auto-save protects against accidental modal cancellation.
- [x] Verified "Clear Draft" button clears local storage and resets the roster.

---

## 3. Teacher Dashboard Mobile Navigation & Class Details Polish

### 3.1 Mobile Navigation Optimization
- **`TopNavBar.tsx`**:
  - Tightened spacing on `< sm` and `< md` viewports (`gap-2 sm:gap-3`, `px-3 sm:px-4 md:px-6`).
  - Adjusted `SchoolSwitcher` text truncation (`max-w-[90px] xs:max-w-[120px] sm:max-w-[150px]`) so workspace titles no longer cause horizontal crowding or overflow on small devices.
  - Made QR action button gracefully hidden on sub-380px screens while retaining drawer, search trigger, notification center, theme toggle, and profile pill.
- **`TeacherMobileDrawer.tsx`**:
  - Optimized drawer touch targets and verified smooth slide-in menu for teacher tools.

### 3.2 Class Cohort Header Card Redesign (`ClassDetails.tsx`)
- **Location**: `frontend/src/app/dashboard/teacher/my-classes/[classId]/components/ClassDetails.tsx`
- **Redesign Details**:
  - Re-engineered the header card from an unformatted wrapping line into a structured, responsive layout.
  - Top line: Prominent Class Avatar (`size-12 sm:size-16`), Class Name + Section highlight, and a pulsing `Active Cohort` status chip.
  - Metadata Chips: Structured chips for `Code: {classCode}`, `Level: {level}`, `Session: {session}`, `Term: {term}`, and `{count} Scholars Enrolled`.
  - Focus Subject Breakdown: Comma-separated focus subjects are parsed and rendered as distinct emerald pill tags (`UTME Government`, `UTME Literature`, `UTME Economics`, etc.) with the `BookOpen` icon.

### 3.3 Real Data Synchronization for Upcoming Exams (`UpcomingExams.tsx` & Backend)
- **Backend Service**: `backend/src/modules/teacher/teacher-dashboard.service.ts` (`getTeacherClassDetailService`)
  - Included `subjectExamPapers` with full relation nesting to resolve actual subject names for multi-subject and paper-based assessments.
  - Fixed upcoming activities date sorting logic: previously checked `new Date(e.startDate || e.createdAt) > new Date()`, which dropped exams whose `startDate` was null or past.
  - Now sorts exams by scheduled date/recent activity, returns real titles, subjects, total marks, durations, and category tags (`EXAM`, `QUIZ`, `CA`).
- **Frontend Components**:
  - `Overview.tsx`: Passes real assessment titles, subjects, dates, durations, and points to `UpcomingExams`.
  - `UpcomingExams.tsx`: Completely redesigned into a card featuring custom subject category icons (biology, mathematics, humanities, languages), category badges (Official Exam, Quiz, Continuous Assessment), duration/marks counters, and quick link to the class exams tab.

### 3.4 Offline Grades Date Categorization & Real Creator Attribution
- **Date Categorization & Sorting**:
  - In `OfflineGradesDashboard.tsx`, assessment groups automatically sort in descending chronological order (`createdAt` / `updatedAt`) so that newly recorded offline grade sheets appear at the top.
  - Added an intuitive **Date Range Filter** (`All Time`, `Recorded Today`, `This Week`, `This Month`, `This Term`) in `OfflineRecordsToolbar.tsx` and `OfflineRecordsList.tsx`.
  - Cards Grid (`OfflineRecordsGrid.tsx`) displays the full recorded date pill (e.g. `Oct 31, 2026`) next to the term label.
  - Table List (`OfflineRecordsTable.tsx`) features a dedicated tabular **Date** column displaying the date formatted to institutional standards.
- **Real Creator Attribution**:
  - In `backend/src/modules/grade/grade.service.ts` (`getGradeHubService`), resolved the actual creator name from `Teacher` or `Admin` tables (`creatorName`), even for historical records where `teacherId` referenced a staff or admin user ID.
  - In `createGradeEntryService` and `bulkCreateGradesService`, `teacherId` is securely resolved to the corresponding `Teacher` record ID upon grade entry.
  - In both Grid and Table views, each offline marksheet prominently attributes who created it (e.g. `"Recorded by: John Doe"` instead of generic fallbacks).
- **Persistent Grade in Modal Resolution**:
### 3.5 Strict Assigned Subject Filtering, Dark Mode Grades Statistics & Assignments Empty State
- **Strict Subject Filtering for Teachers**:
  - In `backend/src/modules/grade/grade.service.ts` (`getGradeHubService`), teachers are strictly restricted to grades belonging to their assigned subjects (from `TeacherSubject`, `Subject.teacherId`, `TimetablePeriod.teacherId`, and profile focus subjects) or assessments explicitly recorded by the teacher.
  - In `frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx`, removed open class context grade leakage so teachers only see assessments matching their assigned subjects.
- **Grades Statistics Dark Mode Polish (`GradeStatistics.tsx`)**:
  - Completely redesigned the 4 summary cards (`Class Average`, `Highest Score`, `Lowest Score`, `Passing Rate`) in `GradeStatistics.tsx`.
  - Replaced low-contrast `bg-slate-50` with high-contrast `bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800` styling, glowing themed icons, and tabular numbers.
- **Assignments Empty State (`AssignmentTable.tsx`)**:
  - Replaced blank table with a dedicated empty state banner when `assignments.length === 0`: `"No assignments available at this moment"`.

### 3.6 Date Arrangement Sectioning Across Class Details Grids & Lists
- Purely frontend UI arrangement sectioning without altering API fetching mechanics:
  - **Grades Tab (`GradeTable.tsx`)**: Table rows and student cards are grouped and displayed with date headers (e.g. `Today`, `Yesterday`, `30 May`, `April 2026`).
  - **Assignments Tab (`AssignmentTable.tsx`)**: Table displays assignments partitioned by creation/update dates (e.g. `30 May`, `April 2026`).
  - **Exams & Subject Papers Tab (`ExamTable.tsx`)**: Assessments arranged chronologically under date headers while preserving expandable papers.
  - **Students Tab (`StudentTable.tsx`)**: Restored standard roster presentation without alteration to original student fetching or schema.

### 3.7 Offline Grades Assigned Class & Subject Scoping (`/dashboard/teacher/offline-grades`)
- **Global & Class-Level Scoping Architecture**:
  - **Backend Scoping (`grade.service.ts` - `getGradeHubService`)**:
    - When `currentTeacherId` is present, the query resolves:
      1. All classes assigned to the teacher via `ClassTeacher` and `TimetablePeriod`.
      2. All subjects assigned to the teacher via `TimetablePeriod` schedules in those classes, `ClassSubject` matching the teacher, direct `TeacherSubject` assignments, direct `Subject` assignments, and teacher profile focus subjects.
    - Offline and online grades are strictly filtered so teachers only see records that:
      - Were directly created/recorded by the teacher (`teacherId: currentTeacherId`), OR
      - Belong to their assigned classes (`classId: { in: assignedClassIds }`) AND match their assigned subjects (`subject: { in: subjectNames, mode: 'insensitive' }`).
  - **Frontend Scoping (`OfflineGradesDashboard.tsx`)**:
    - Aggregates subject IDs and subject names across all assigned classes from `useTeacherClasses` and `useTeacherSubjects`.
    - Handles both exact and substring/synonym subject name matching (e.g. `"Math"` matching `"Mathematics"`, `"English Language"` matching `"English"`).
    - Ensures that when viewing `/dashboard/teacher/offline-grades`, all offline grades across all of the teacher's assigned classes and assigned subjects show up without leakage of unassigned subjects or unassigned classes.
  - **Date Sectioning**:
    - Applied the standard `date_sectioning_display` pattern to all views in Offline Grades (Grid & Table), dynamically grouping assessments by creation/activity dates (`Today`, `Yesterday`, `Day Month`, `Month Year`) with role-themed accent dots and count badges.


