# Assessment System — User-Type Architecture & Feature Documentation

> **Subsystem**: Assessments, Exams, Quizzes, CA, Assignments, and Subject Papers  
> **Primary Spec**: [`ASSESSMENT_DATA_MODEL.md`](../ASSESSMENT_DATA_MODEL.md), [`AGENTS.md`](../.agents/AGENTS.md)  
> **Pre-edit requirement**: Review [`ASSESSMENT_DATA_MODEL.md`](../ASSESSMENT_DATA_MODEL.md) and this file before touching any assessment-related code.

---

## 1. Assessment Types & Database Model Overview

There are **three distinct database models** for assessments. Never confuse them.

| Model | Description | API Endpoint |
|---|---|---|
| `Exam` | Formal exams, CAs, quizzes. `category` field distinguishes them. | `POST /exams` |
| `Assignment` | Student homework/task submissions. Completely separate table. | `POST /assignments` |
| `SubjectExamPaper` | Question paper/bank that links to one or many `Exam` records. | `POST /exams/:examId/papers` |

### 1.1 ExamCategory Enum (DB values)

| DB `category` | Display Name | UI Tab | Teacher Creates Via |
|---|---|---|---|
| `EXAM` | Single Paper Exam | **Exams** | "Create New → Single Paper Exam" |
| `QUIZ` | Quiz / Test | **Quizzes** | "Create New → Quiz" |
| `CA` | Continuous Assessment | **CA** | "Create New → CA" |
| `ASSIGNMENT` | Assignment (rare Exam-type) | **Assignments** | N/A — use `Assignment` model instead |

### 1.2 Assessment Scope Enum

| `scope` | Visibility |
|---|---|
| `SCHOOL` | Visible to all classes in the school |
| `CLASS` | Only the assigned class |
| `DEPARTMENT` | Only students in the linked department |
| `PERSONAL` | Only the creating teacher's personal account |

### 1.3 Assessment Status Enum

| Status | Meaning |
|---|---|
| `DRAFT` | Invisible to students. Teacher can edit freely. |
| `PUBLISHED` | Live — students can see and take it. |
| `ARCHIVED` | Closed. Visible for historical review only. |

---

## 2. Teacher Assessment System (`/dashboard/teacher/exams&quizzes`)

### 2.1 Page Entry Point

- **Route**: `/dashboard/teacher/exams&quizzes`
- **Component**: [`ExamsQuizzesOverview`](../frontend/src/app/dashboard/teacher/exams&quizzes/components/ExamsQuizzesOverview.tsx)
- **Page Wrapper**: [`page.tsx`](../frontend/src/app/dashboard/teacher/exams&quizzes/page.tsx)

This is the **centralized assessment command center** for teachers. It allows authoring, scheduling, and reviewing all assessment types across all assigned classes.

---

### 2.2 Page Layout

The page is composed of the following top-to-bottom sections:

#### 2.2.1 Page Header (`PageHeader.tsx`)
- **Title**: "Assessments" with an info tooltip.
- **Export Dropdown**: Allows exporting the current filtered list as **PDF** or **CSV**. Both exports are school-branded (logo, address, export metadata).
- **Create New Dropdown**: Opens a creation modal for:
  - `Single Paper Exam` → `EXAM` category
  - `Quiz` → `QUIZ` category
  - `CA` → `CA` category
  - `Assignment` → opens `CreateAssignmentForm`
  - `Paper` → opens `CreatePaperForm` (standalone subject paper)

#### 2.2.2 Stat Cards (4 Cards)

| Card | Value Source | Description |
|---|---|---|
| **Total Assessments** | `filteredData.length` | Count of all exams, quizzes, CAs, subject papers, and assignments after filters |
| **Active / Published** | Items with `status === PUBLISHED`, `APPROVED`, or `COMPLETED` | Assessments currently live for students |
| **Draft Assessments** | Items with `status === DRAFT` | Assessments still being prepared |
| **My Modules** | Items where `teacherId === user.id` or teacher is in `assignedTeachers[]` | Teacher's personal authoring scope |

#### 2.2.3 Assessment Card Panel (tabbed + filterable + paginated)

Contains:
- **Category Tabs** — scroll-x tabs (All, Exams, Quizzes, Subject Papers, CA, Assignments)
- **View Mode Toggle** — List (table) or Grid (cards)
- **FilterChips** — Class, Subject, Status, Date dropdowns
- **Teacher Tip Banner** — instructional callout (not shown on Subject Papers or Assignments tabs)
- **ExamsTable** — the actual assessment list (date-sectioned, paginated at 10 items/page)
- **Pagination** — `TeacherPagination` component

---

### 2.3 Category Tabs

| Tab Key | Label | DB `category` fetched |
|---|---|---|
| `all` | All Assessments | Exams + SubjectPapers + Assignments (parallel fetch) |
| `exams` | Exams | `EXAM` |
| `quizzes` | Quizzes | `QUIZ` |
| `subject-papers` | Subject Papers | `SubjectExamPaper` records (standalone papers) |
| `ca` | CA | `CA` |
| `assignment` | Assignments | `Assignment` model |

**Data fetching strategy**:
- `all` tab: Three parallel API calls (`getExams`, `getSubjectPapers`, `getAssignments`) merged and tagged with `_tabType`.
- Other tabs: Single targeted API call.
- Query key: `['teacher-exams', selectedSchoolId, activeTab, filters.status, filters.class]`

---

### 2.4 Filtering

#### Client-Side Filters (applied in `useMemo` in `ExamsQuizzesOverview`)

| Filter | Parameter | Logic |
|---|---|---|
| **Class** | `filters.class` | Matches `item.classId` or `item.class.id` |
| **Subject** | `filters.subject` | Matches `item.subjectId`, `item.subject.id`, or paper subject ID |
| **Status** | `filters.status` | Sent server-side as query param; also used in CSV/PDF metadata |
| **Date** | `filters.date` | "Last Week" (≤7d), "Last Month" (≤30d), "Last 3 Months" (≤90d), "This Year" |

#### Subject Scoping (Teacher Security Layer)

When a teacher is linked to a school (not personal account) and `subjectsData` is populated:
- Terminal exams (`_tabType === 'exams'`) are **always visible** regardless of subject — teachers may be class-wide exam invigilators.
- CAs, Quizzes, Subject Papers, and Assignments are shown only if one of the following is true:
  1. Teacher is the **creator** (`item.teacherId === user.id`)
  2. Item is directly linked to teacher's **assigned subject** (by ID or name)
  3. Teacher appears in `item.assignedTeachers[]`
  4. Attached papers (`item.subjectExamPapers[]`) link to an assigned subject

---

### 2.5 Creating Assessments

#### 2.5.1 Creating an Exam / CA / Quiz (`CreateExamForm`)

Opened via "Create New → Single Paper Exam / Quiz / CA". Same form for all three categories; `category` prop is passed.

**Required Fields**:

| Field | Validation | Notes |
|---|---|---|
| `title` | min 3 characters | Display title for the assessment |
| `subjectId` | required | From teacher's assigned subjects only |
| `classId` | required | From teacher's assigned classes only |
| `durationMinutes` | min 1 | Duration in minutes |
| `totalMarks` | min 1 | Max score |

**Optional Fields**: `startDate`, `resultReleaseAt`, `teacherId` (assign to other teacher), `description`

**On Submit**:
1. Creates the `Exam` record via `POST /exams` with `mode: "SINGLE_SUBJECT"`, `scope: "SCHOOL"`, `status: "DRAFT"`.
2. **Auto-creates a default `SubjectExamPaper`** via `POST /exams/:id/papers`.
3. On success → navigates to the paper's editing page (`/dashboard/teacher/exams&quizzes/papers/:paperId`).

> **Invariant**: Assessment is created as `DRAFT` — invisible to students until explicitly published.

#### 2.5.2 Creating an Assignment (`CreateAssignmentForm`)

Opened via "Create New → Assignment".

**Required Fields**:

| Field | Notes |
|---|---|
| `title` | min 3 characters |
| `subjectId` | From teacher's assigned subjects |
| `classId` | From teacher's assigned classes |
| `totalMarks` | min 1 |
| `dueDate` | datetime — required for assignments |

**Optional Fields**: `instructions`

**On Submit**: Calls `teacherService.createAssignment({ classIds: [classId], ... })`. On success → navigates to `/dashboard/teacher/assignments/:id?edit=true`.

#### 2.5.3 Creating a Subject Paper (`CreatePaperForm`)

Opened via "Create New → Paper". Creates a **standalone** `SubjectExamPaper` (not linked to any Exam).

**Required Fields**:

| Field | Notes |
|---|---|
| `subjectId` | From teacher's assigned subjects |
| `title` | min 3 characters |
| `instructions` | min 5 characters |
| `durationMinutes` | min 1 |
| `totalMarks` | min 1 |

**Optional Fields**: `readingContent` (comprehension passage)

**API Call**: `POST /exams/none/papers` (`:examId = "none"` for standalone).

**On Submit**: Navigates to `/dashboard/teacher/exams&quizzes/add-question?paperId=:paperId`.

---

### 2.6 Assessment List — ExamsTable

The list is **date-sectioned** using `getDateGroupLabel()`:

| Section Header | Condition |
|---|---|
| **Today** | `diffDays === 0` |
| **Yesterday** | `diffDays === 1` |
| **DD Month** | `2 <= diffDays <= 7` |
| **DD Month YYYY** | `diffDays > 7` |
| **Undated & Previous Records** | `createdAt` is null or invalid |

Date source priority: `exam.createdAt` → `exam.updatedAt` → `exam.startDate`

#### 2.6.1 Row/Card Actions

| Action | Destination |
|---|---|
| **Eye icon (View)** | Preview page (`/exams&quizzes/preview?id=...`) or `/assignments/:id?preview=true` |
| **Edit icon** | Direct paper route: Single paper → `/papers/:paperId?examId=:examId` (modal targets exam settings); Multi-paper → `/papers/:firstPaperId?examId=:examId&multi=true` (paper-scoped settings); Standalone paper → `/papers/:paperId`; Assignment → `/assignments/:id?edit=true` |
| **Trash icon** | Confirmation dialog → `DELETE /exams/:id` |
| **Click on Card/Row** | Same as Edit destination (always lands directly on paper workspace) |

#### 2.6.2 Status Badge Colors

| Status | Color |
|---|---|
| `PUBLISHED` | Emerald (green) |
| `APPROVED` / `COMPLETED` | Blue |
| `DRAFT` | Amber (yellow) |

#### 2.6.3 "Mine" Badge

Cards/rows where `exam.teacherId === user.id` or the teacher appears in `assignedTeachers[]` display a **"Mine"** badge in primary color with a distinct emerald-tinted card background.

---

### 2.7 Export Feature

#### PDF Export
- Calls `generatePDF()` from `@/utils/pdfGenerator`
- Uses school profile (logo, name, address)
- Columns: `#, Title, Category, Subject, Class, Marks, Duration, Status, Date`
- Orientation: **landscape**
- Filename: `{SchoolName}_Assessments_{tab}_{YYYY-MM-DD}.pdf`

#### CSV Export
- Pure client-side `Blob` download
- Includes school name, address, category label, and export date as header rows
- Filename: `{SchoolName}_Assessments_{tab}_{YYYY-MM-DD}.csv`

---

### 2.8 Sub-Routes (Teacher Assessments)

| Route | Description |
|---|---|
| `/exams&quizzes` | Main assessment overview (this document) |
| `/exams&quizzes/:examId/papers` | Manage papers attached to a multi-subject exam |
| `/exams&quizzes/:examId/paper/:paperId` | Single paper editor within an exam |
| `/exams&quizzes/papers/:paperId` | Standalone/single-paper editor |
| `/exams&quizzes/add-paper` | Add a new subject paper |
| `/exams&quizzes/add-question?paperId=` | Add questions to a subject paper |
| `/exams&quizzes/question-list?paperId=` | View/edit existing questions for a paper |
| `/exams&quizzes/preview?id=&type=` | Preview an exam or subject paper |
| `/exams&quizzes/create` | Alternative create exam route |

---

## 3. Student Assessment System

### 3.1 Student Exams & Quizzes Page (`/dashboard/student/exams&quizzes`)

Students see all assessments published for their class, filtered by their department if one is locked in.

#### Department Scoping (Backend)
- If `student.departmentId` is set → backend resolves `DepartmentSubject` records to get assigned `subjectId[]`.
- Exams returned: only those matching `subjectId in deptSubjectIds`, or those without a subject restriction (general school exams).
- If no department → all assessments for the student's class/school are shown.

#### Smart Routing on Click (Student)

Assessment card click routing is handled by `AssessmentItem.tsx` and `AssessmentList.tsx`:

| Assessment Status | Student Route |
|---|---|
| `LIVE` / `ONGOING` | `/Exams&Quizzes/exam/:examId` — direct exam taker |
| `UPCOMING`, `CLOSED`, `GRADED`, `SUBMITTED` | `/dashboard/student/exams&quizzes/:examId` — preview page |

Card footer label also adapts:
- `"Start Exam"` — for live assessments
- `"View Details"` — for everything else

#### Department Block Guard (`/dashboard/student/exams&quizzes/:examId`)
- Uses `useStudentProfile` to derive the student's `departmentId`.
- If the exam has explicit `departments[]` restrictions and the student's department is not in that list → renders an access-denied screen with `ShieldAlert` icon and "Go Back" / "View My Exams" buttons.

### 3.2 Student Class Assessments Tab (My Classes → [Class] → Assessments)

The `AssignmentsTable.tsx` in student class detail pages provides:

**Category Sub-Tabs**: `All`, `CA`, `Quiz / Test`, `Exam`, `Assignment` (each with item count badge).

**Smart Action Buttons**:

| State | Button Label | Color | Destination |
|---|---|---|---|
| Graded | `View Result` | Emerald | Exam result page |
| Submitted | `Submitted` | Blue | Exam page |
| Upcoming / Live | `Take` / `Submit` | Pink | Exam taker or assignment page |
| Overdue | `View` | Rose | Assessment page |
| No link | `Not Available` | Disabled | — |

**Department Scoping**: Handled upstream in `page.tsx`. A `"Dept. Scoped"` badge renders in the header subtitle when the student has a locked-in department.

---

## 4. Admin Assessment System

### 4.1 Class Exams Tab (`/dashboard/admin/classes/:id` → Exams tab)

Admins view all assessments scoped to a specific class via the class detail page (`ExamsTab.tsx`).

**DB Category → Frontend Type mapping** (fixed 2026-10-06):
```ts
type: (e.category?.toLowerCase() || e.type?.toLowerCase() || 'exam') as any,
```

| DB `category` | Filter label in Admin UI |
|---|---|
| `EXAM` | Exam |
| `CA` | CA |
| `QUIZ` | Quiz |
| `ASSIGNMENT` | Assignment |

**Known Historical Bug (resolved)**: Prior to 2026-10-06, `category` and `scope` were missing from the Prisma `exams` select inside `getSingleClassService`, causing all assessments on the class page to appear as type "exam". Fixed by adding `category: true` and `scope: true` to the select clause.

### 4.2 Admin Assessment Scope

Admins have full read access to all assessments in their institution (`schoolId` scope). They can view but not directly author assessments — creation remains a teacher function.

---

## 5. Parent Assessment System

### 5.1 Parent View (Indirect — via Child Profile)

Parents do not have a dedicated assessment page. They view their child's assessment results and grades via:
- **Parent Dashboard** (`/dashboard/parent`) → child's recent exam scores and grade summaries.
- **Child Details** → subject-level performance breakdowns derived from `StudentSubjectTermResult`.

Parents see **published results only** — they have no access to draft assessments or question papers.

---

## 6. Core Invariants (All User Types)

| Rule | Enforced By |
|---|---|
| Assessments are `DRAFT` by default — invisible to students until published | `CreateExamForm` hardcodes `status: "DRAFT"` |
| Teachers only see subjects they are assigned to in dropdowns | `teacherService.getSubjects({ schoolId })` scoped by JWT identity |
| Students in a department only see assessments for their department's subjects | Backend dept scoping in `exam.service.ts` |
| Terminal exams are visible to all class teachers regardless of subject assignment | Frontend filter: `if (effectiveType === 'exams') return true` |
| Assignment deletion uses `examService.deleteExam` (same endpoint for Exam model) | `ExamsQuizzesOverview.tsx` `deleteMutation` |
| Subject Papers created without an exam link use `:examId = "none"` | `CreatePaperForm` calls `examService.createSubjectPaper(null, ...)` |

---

## 7. API Reference

| Operation | Method | Endpoint |
|---|---|---|
| Create exam / CA / quiz | `POST` | `/exams` |
| Get teacher's exams | `GET` | `/exams?schoolId=&category=&status=&classId=` |
| Create subject paper | `POST` | `/exams/:examId/papers` (`:examId = "none"` for standalone) |
| Get subject papers | `GET` | `/teacher/subject-papers?schoolId=` |
| Create assignment | `POST` | `/assignments` |
| Get assignments | `GET` | `/assignments?schoolId=&status=&classId=` |
| Delete exam | `DELETE` | `/exams/:id` |
| Get class assessments | `GET` | `/classes/:id` → `.exams[]` |
| Filter exams by category | `GET` | `/exams?classId=&category=` |
| Final results — class-subject | `GET` | `/records/class-subject-results` |
| Final results — student term | `GET` | `/records/student-term-results` |

---

## 8. Change Log

| Date | Change | Files Affected |
|---|---|---|
| 2026-10-06 | Added `category: true`, `scope: true` to Prisma select in `getSingleClassService` — fixes all-class exams showing as type "exam" | `class.service.ts`, `ExamsTab.tsx` |
| 2026-11-01 | Student smart routing — live exams → direct exam taker, others → preview page | `AssessmentItem.tsx`, `AssessmentList.tsx`, `my-classes/[id]/page.tsx` |
| 2026-11-01 | Backend department subject scoping for student exams and assignments | `exam.service.ts`, `assignment.service.ts` |
| 2026-11-01 | Department block guard on student exam preview page | `exams&quizzes/[examId]/page.tsx` |
| 2026-11-01 | Student class assessments tab rebuilt with category sub-tabs and smart action buttons | `AssignmentsTable.tsx` |
| 2026-11-02 | Initial assessment system documentation created | `docs/ASSESSMENT_SYSTEM.md` |

---

## 9. Verification Checklist (Assessment Features)

- [ ] Teacher `CreateExamForm` only shows teacher's assigned subjects in the Subject dropdown.
- [ ] Teacher `CreateExamForm` only shows teacher's assigned classes in the Class dropdown.
- [ ] Assessment is created as `DRAFT` — confirmed invisible to students on student dashboard.
- [ ] Deleting an assessment shows a confirmation dialog before firing the mutation.
- [ ] On "All" tab, all three data sources (exams, papers, assignments) are merged correctly.
- [ ] Subject scoping filter correctly hides non-teacher-subject CAs/quizzes without hiding terminal exams.
- [ ] Student in a department sees only department-scoped assessments on `/dashboard/student/exams&quizzes`.
- [ ] Student not in a department sees all class/school assessments.
- [ ] Live exam routes student directly to exam taker (`/Exams&Quizzes/exam/:id`).
- [ ] Non-live exam routes student to preview page (`/dashboard/student/exams&quizzes/:id`).
- [ ] Department block guard renders denied screen for out-of-department exams on student preview page.
- [ ] PDF export includes school logo, address, and all relevant metadata columns.
- [ ] CSV export is properly formatted with school header rows.
