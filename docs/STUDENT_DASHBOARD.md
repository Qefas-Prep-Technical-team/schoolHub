# Student Dashboard Specification & Architecture (`STUDENT_DASHBOARD.md`)

> **Subsystem**: Student Portal, Enrolled Subjects Scoping, Academic Department & Level Locking, and Profile Completion.  
> **Primary References**: [`docs/README.md`](README.md), [`ASSESSMENT_DATA_MODEL.md`](../ASSESSMENT_DATA_MODEL.md), [`AUTH_STATE.md`](../AUTH_STATE.md), [`.agents/AGENTS.md`](../.agents/AGENTS.md).

---

## 1. Architectural Overview

The student dashboard (`/dashboard/student`) provides scholars with a centralized hub for tracking active assessments, exam attempts, published report cards, timetable schedules, and curriculum courses.

```
Student User
    │
    ▼
Student Dashboard (/dashboard/student)
    │
    ├── Profile Verification & Academic Locking Modal (StudentAcademicLockModal.tsx)
    │     ├── Department / Faculty Lock (Single-choice permanent selection)
    │     ├── Academic Grade Level Lock (Institutional level selection)
    │     └── "Don't Show Again" Local Persistence (`qefas_student_dismiss_academic_lock_modal_{studentId}`)
    │
    ├── Enrolled Subjects Carousel
    │     ├── Department-Scoped Subjects (Only subjects mapped to student's locked department)
    │     ├── Cross-Cohort Shared Subjects (Class/School/Global curriculum courses)
    │     └── Subject Details Dialog Inspection
    │
    ├── Academic Performance & Mastery (Radar Chart & Historical Trends)
    └── Active Class Assignments & Timetable Access
```

---

## 2. Invariants & Security Rules

### 2.1 Department-Scoped Enrolled Subjects
1. **Curriculum Filtering When Department is Locked In**:
   - If a student has selected and locked in their academic department (`profile.departmentId` or `profile.department.id`):
     - The "Enrolled Subjects" horizontal card carousel on `http://localhost:3000/dashboard/student` strictly displays subjects assigned to their department.
     - Subjects with explicit `DEPARTMENT` scope that belong to other departments are excluded.
     - Subjects linked to the student's department via `class.departments` or `subject.departments` are retained.
     - If curriculum subjects declare school-wide or class-wide scope (`SCHOOL`, `CLASS`, `GLOBAL`), they remain accessible unless explicit departmental restrictions apply.
2. **Fallback for Unlocked / Junior Scholars**:
   - If the student has not yet locked in a department (e.g. Junior Secondary students or unclassified cohorts), all enrolled curriculum subjects configured on their active class roster are presented.

### 2.2 Academic Profile Completion Popup (`StudentAcademicLockModal`)
1. **Automatic Trigger Invariant**:
   - When a student arrives on the dashboard (`/dashboard/student`), the system inspects `studentProfile`:
     - Checks if `isDepartmentLocked` (`profile.departmentId` or `profile.department.id` or `profile.department.name`) is false.
     - Checks if `isLevelLocked` (`profile.level`) is false.
   - If either the department OR the grade level is not locked in, the modal triggers automatically.
2. **Identical Functionality to Settings Academic Tab**:
   - Replicates the exact visual cards, states, and locking mutations as found in `/dashboard/student/settings` (Academic Tab):
     - **Department / Faculty Card**: Allows selecting from school departments (`schoolService.getDepartments(schoolId)` with 10-minute `staleTime`). Displays `Locked In` badge with department code once confirmed.
     - **Grade Level Card**: Allows selecting from the institution's configured levels (`school.levels`). Displays `Locked In` badge once confirmed.
     - Confirms via `studentService.updateDepartment` and `studentService.updateLevel`, automatically invalidating `studentKeys.profile()`.
3. **"Don't Show Again" Dismissal Option**:
   - Includes a dedicated `"Don't show again"` button with the `EyeOff` icon.
   - Persists student-scoped dismissal in browser storage under `qefas_student_dismiss_academic_lock_modal_{studentId}`.
   - Once dismissed, the popup will not appear automatically on future visits, while the student can still configure these settings anytime in `/dashboard/student/settings?tab=academic` or `/dashboard/student/profile`.

---

## 3. Component Architecture

- **`frontend/src/app/dashboard/student/components/StudentAcademicLockModal.tsx`**:
  - Modal container dialog powered by Radix UI.
  - Houses the dual-card grid (Department Card & Grade Level Card) with reactive mutations and feedback toasts.
  - Provides `"Don't show again"` and `"Close"` actions.
- **`frontend/src/app/dashboard/student/page.tsx`**:
  - Enforces `filteredEnrolledSubjects` using `useMemo` based on `studentDepartmentId`.
  - Computes `enrolledSubjectsCount` strictly from the filtered set so stats cards accurately reflect the scholar's active subjects.
  - Renders `<StudentAcademicLockModal />` conditioned on modal state and localStorage dismissal.
