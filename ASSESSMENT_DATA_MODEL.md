# Assessment & Exam System — Data Model Reference

> **Purpose:** This document describes exactly how every assessment type (Exam, CA, Quiz/Test, Assignment, Subject Paper, Final Paper) is stored in the database and fetched by the API. Reference this before building any feature that touches assessments.

---

## 1. Database Models Overview

There are **two separate database models** for assessments. Do NOT confuse them.

| Model | Prisma Model | Description |
|---|---|---|
| `Exam` | `Exam` | Covers Exams, CAs, Quizzes, Tests. The **category** field distinguishes them. |
| `Assignment` | `Assignment` | Standalone tasks submitted by students. A completely different model/table. |
| `SubjectExamPaper` | `SubjectExamPaper` | A re-usable question bank paper that can be linked to one or many `Exam` records. |

---

## 2. The `Exam` Model

**Table:** `Exam`

An `Exam` record is the **umbrella** that defines scope, scheduling, and targeting. It does NOT hold questions directly — it links to `SubjectExamPaper` records.

### 2.1 Key Discriminator Fields

| Field | Type | Values | Meaning |
|---|---|---|---|
| `category` | `ExamCategory` enum | `EXAM`, `CA`, `QUIZ`, `ASSIGNMENT` | **The type of assessment.** This is the primary filter in the UI. |
| `scope` | `AssessmentScope` enum | `CLASS`, `SCHOOL`, `DEPARTMENT`, `PERSONAL` | Who can see it. |
| `status` | `AssessmentStatus` enum | `DRAFT`, `PUBLISHED`, `ARCHIVED` | Publication state. |
| `mode` | `ExamMode` enum | `SINGLE_SUBJECT`, `MULTI_SUBJECT` | Whether the exam has one or many subject papers. |

### 2.2 ExamCategory Enum — How Types Are Stored

```prisma
enum ExamCategory {
  EXAM        // A formal terminal exam (e.g. end of term)
  QUIZ        // A short in-class quiz or test
  CA          // Continuous Assessment (formative)
  ASSIGNMENT  // Used only when an assignment is also an Exam-type record (rare)
}
```

> Note: In most cases, actual student assignments are stored in the separate `Assignment` model (see Section 4), NOT as `Exam` records with `category: ASSIGNMENT`.

### 2.3 What "Subject Paper" and "Final Paper" Mean

These are NOT separate database models. They are **usage patterns** of the same `SubjectExamPaper` model:

| Common Term | What it means in DB |
|---|---|
| **Subject Paper** | A `SubjectExamPaper` linked to an `Exam` with `mode: SINGLE_SUBJECT` |
| **Final Paper** | A `SubjectExamPaper` linked to an `Exam` with `mode: MULTI_SUBJECT` (the main umbrella paper covering all subjects for a final/terminal exam) |
| **Standalone Paper** | A `SubjectExamPaper` with **no linked Exam** (used as a re-usable question bank draft) |

### 2.4 Linking Papers to Exams

The join table `SubjectExamPaperOnExam` (implicit Prisma many-to-many) connects `SubjectExamPaper` to `Exam`.

```
Exam (1) ──────< SubjectExamPaperOnExam >────── SubjectExamPaper
                     (join table)
```

A single `Exam` can have multiple `SubjectExamPaper` records (one per subject, for multi-subject finals).

---

## 3. SubjectExamPaper Model

This model stores the actual **question paper** — questions, reading content, instructions.

| Field | Type | Notes |
|---|---|---|
| `subjectId` | String? | Which subject this paper covers |
| `schoolId` | String? | School that owns it |
| `teacherId` | String? | Teacher who created it |
| `title` | String? | Display title |
| `category` | SubjectPaperStatus | Paper-level category (mirrors ExamCategory usage) |
| `creationMode` | AssessmentCreationMode | `MANUAL`, `AI`, `OMR` |
| `status` | SubjectPaperStatus | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `questions` | Relation | The actual exam questions |
| `exams` | Relation | The `Exam` records this paper is linked to |

---

## 4. Assignment Model

Assignments are a **completely separate model** from `Exam`. They are submitted by students (file upload, text, MCQ) and graded by teachers.

| Field | Type | Notes |
|---|---|---|
| `classId` | String? | Class the assignment belongs to |
| `departmentId` | String? | Optional department filter |
| `schoolId` | String? | School scope |
| `teacherId` | String? | Teacher who set it |
| `status` | AssignmentStatus | `DRAFT`, `PUBLISHED`, `CLOSED` |
| `submissions` | Relation | Student submissions (AssignmentSubmission) |

> Assignments are fetched via the `/assignments` endpoint, **NOT** via `/classes/:id`.

---

## 5. API Endpoints

### 5.1 Create an Exam / CA / Quiz

**POST** `/exams`

Send `category` in the request body to set the type.

```json
{
  "title": "End of Term Math Exam",
  "category": "EXAM",
  "scope": "CLASS",
  "classId": "uuid",
  "mode": "SINGLE_SUBJECT",
  "status": "DRAFT",
  "durationMinutes": 60,
  "startDate": "2026-11-01T08:00:00Z",
  "endDate": "2026-11-01T09:00:00Z"
}
```

Default for `category` if omitted: `"EXAM"`.

### 5.2 Create a Subject Paper

**POST** `/exams/:examId/papers`

Use `:examId = "none"` to create a standalone paper (not linked to any exam).

```json
{
  "subjectId": "uuid",
  "title": "Mathematics Paper 1",
  "category": "EXAM",
  "creationMode": "MANUAL",
  "durationMinutes": 90
}
```

### 5.3 Get Exams for a Class (via class detail)

**GET** `/classes/:id`

The response includes an `exams` array. Each exam object returns:

```json
{
  "id": "uuid",
  "title": "Mid-Term CA",
  "category": "CA",
  "scope": "CLASS",
  "status": "PUBLISHED",
  "startDate": "...",
  "endDate": "...",
  "totalMarks": 30,
  "durationMinutes": 45
}
```

### 5.4 Filter Exams by Category

**GET** `/exams?classId=uuid&category=CA`

Valid `category` query values: `EXAM`, `CA`, `QUIZ`, `ASSIGNMENT`

---

## 6. Frontend Mapping — ExamsTab

**File:** `frontend/src/app/dashboard/admin/classes/[id]/components/exams/ExamsTab.tsx`

The frontend reads `e.category` (DB value) and lowercases it for display/filtering:

```ts
// Correct mapping after fix on 2026-10-06
type: (e.category?.toLowerCase() || e.type?.toLowerCase() || 'exam') as any,
```

| DB `category` | Frontend `type` | Filter label |
|---|---|---|
| `EXAM` | `exam` | Exam |
| `CA` | `ca` | CA |
| `QUIZ` | `quiz` | Quiz |
| `ASSIGNMENT` | `assignment` | Assignment |

---

## 7. Known Bugs Fixed

| Date | Bug | Fix |
|---|---|---|
| 2026-10-06 | `category` and `scope` were not included in the `exams` select inside `getSingleClassService`, causing all exams on the class page to show as type "exam". | Added `category: true` and `scope: true` to the Prisma select in `class.service.ts`. |
| 2026-10-06 | ExamType filter on class Exams tab only showed "Exam" and "Quiz". | Added "CA" and "Assignment" options to the FilterButton in `ExamsTab.tsx`. |

---

## 8. Quick Reference: Where Is Each Assessment Stored?

```
Student takes a formal test?         → Exam model (category: EXAM or QUIZ)
Student does continuous assessment?  → Exam model (category: CA)
Student submits a homework task?     → Assignment model
Teacher creates a question paper?   → SubjectExamPaper model (linked to an Exam)
School runs a final/terminal exam?  → Exam (MULTI_SUBJECT) + multiple SubjectExamPaper records
Term-level aggregated score for a subject? → ClassSubjectResult / StudentSubjectTermResult model
Term-level aggregated score overall?       → StudentTermResult model
```

---

## 9. Final Results Data Models

The system calculates and stores aggregated "Final Results" at the end of a term/session. These are separate from individual exams and assignments.

| Model | Description |
|---|---|
| `ClassSubjectResult` | Aggregates the results for a specific subject within a class for a given term/session. |
| `StudentSubjectTermResult` | A student's final score for a specific subject in a term (combines CA, Exam, Quiz, Assignment). |
| `StudentTermResult` | A student's overall performance across all subjects for a term (Total score, Average, Position, Grade). |

### 9.1 API Endpoints for Final Results
- `GET /records/class-subject-results`: Fetch aggregated subject results for classes.
- `GET /records/student-term-results`: Fetch overall student term results.
- `GET /records/student-subject-results`: Fetch a specific student's subject breakdown for a term.

