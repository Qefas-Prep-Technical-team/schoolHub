# Qefas Hub — Comprehensive Backend Security Audit Report
**Target System**: Qefas Hub Backend API (Node.js / Express / TypeScript / Prisma)  
**Date**: October 22, 2026  
**Audit Scope**: Tenant Isolation (Multi-Tenancy), Cross-School Data Leakage, Teacher/Student Authorization Boundaries, Parent-Child IDOR, and Financial Security.

---

## 1. Executive Summary

A comprehensive, line-by-line security and authorization audit was conducted across the backend codebase (`backend/src/modules/`). The primary focus was verifying:
1. **School Multi-Tenancy**: Whether School A can access, modify, or leak data belonging to School B.
2. **Teacher & Student Access Boundaries**: Whether teachers or students can access data across schools, classes, or exams not assigned to them.
3. **Parent Access Boundaries**: Whether parents can access student records, grades, attendance, or behavior profiles of children not connected to them.
4. **Financial & Administrative Isolation**: Whether settlements, bank accounts, or financial transactions can be accessed or manipulated by unauthorized tenants.

### Summary of Results:
- **Critical Vulnerabilities Found**: 4
- **High Severity Vulnerabilities Found**: 5
- **Medium Severity Vulnerabilities Found**: 3
- **Primary Root Causes**:
  - Overly permissive role checks (e.g. treating local school `ADMIN` as a universal platform superadmin).
  - Missing tenant filter in Prisma queries when query parameters are omitted.
  - Missing parent-child relationship verification (`parentChildLink`) on specific student sub-endpoints (assignments, attendance, history).
  - Client-supplied tenant headers (`x-school-id`) trusted without validating against the authenticated user's session token.

---

## 2. Vulnerability Matrix

| ID | Category | Severity | Title | Affected Component | Status |
|---|---|---|---|---|---|
| **SEC-01** | Multi-Tenancy | **CRITICAL** | Universal School Admin Bypass in `validateSchoolAccess` | `modules/school/school.controller.ts` | **RESOLVED** |
| **SEC-02** | Data Leakage | **CRITICAL** | Global Subjective Answers Leak in Exam Review Queue | `modules/exam/exam-review.service.ts` | **RESOLVED** |
| **SEC-03** | Financial / Tenant | **CRITICAL** | Unprotected School Settlement Bank Setup & Financial Analytics | `modules/finance/finance.controller.ts` | **RESOLVED** |
| **SEC-04** | Access Control | **CRITICAL** | Zero-Authorization on Student Termly Evaluations | `modules/student/termlyEvaluation.controller.ts` | **RESOLVED** |
| **SEC-05** | Student / Exam | **HIGH** | Cross-School & Cross-Class Exam Question & Answer Exposure | `modules/exam/exam-attempt.service.ts` | **RESOLVED** |
| **SEC-06** | Parent / IDOR | **HIGH** | Parent IDOR on Child Assignments & Teacher Feedback | `modules/parent/parent.controller.ts` | **RESOLVED** |
| **SEC-07** | Parent / IDOR | **HIGH** | Missing Parent-Child Link on Student Attendance & Academic History | `modules/student/student.controller.ts` | **RESOLVED** |
| **SEC-08** | Privacy / IDOR | **HIGH** | Behavioral Alert & Psychological Profile Data Exposure | `modules/student/behaviourProfile.controller.ts` | **RESOLVED** |
| **SEC-09** | Multi-Tenancy | **HIGH** | Cross-Tenant Grade Hub Queries for Non-Teacher Roles | `modules/grade/grade.controller.ts` | **RESOLVED** |
| **SEC-10** | Student / Auth | **MEDIUM** | Student Allowed to Submit Class Attendance | `modules/class/attendance.controller.ts` | **RESOLVED** |
| **SEC-11** | Tenant / IDOR | **MEDIUM** | Unrestricted Class Roster & Student Enrollment Details | `modules/class/class.service.ts` | **RESOLVED** |
| **SEC-12** | Spoofing | **MEDIUM** | Unvalidated `x-school-id` Header in Assignment Deletion & Creation | `modules/assignment/assignment.controller.ts` | **RESOLVED** |

---

## 3. Detailed Vulnerability Findings & Fixes

---

### SEC-01: Universal School Admin Bypass in `validateSchoolAccess` (CRITICAL)

- **File**: [`backend/src/modules/school/school.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/school/school.controller.ts#L31)
- **Vulnerability Type**: Broken Object Level Authorization (BOLA / IDOR) / Multi-Tenant Isolation Failure
- **Severity**: **CRITICAL**

#### Mechanics:
The helper function `validateSchoolAccess(user, schoolId)` contains the following logic:
```ts
// school.controller.ts: line 31
if (
  user.userType === 'SUPER_ADMIN' ||
  user.role === 'SUPER_ADMIN' ||
  user.userType === 'ADMIN' ||
  user.role === 'ADMIN'
) {
  return true;
}
```
In Qefas Hub, school principals and local administrators are assigned `userType: 'ADMIN'` or `role: 'ADMIN'` with a `schoolId`. Because this condition treats any `ADMIN` identically to a platform `SUPER_ADMIN`, it bypasses the `user.schoolId === schoolId` check entirely.

#### Impact:
An administrator of School A can supply School B's `schoolId` in the URL parameters and gain full read/write access to School B's profile, staff list, students, classes, and configuration.

#### Remediation:
Restructure the authorization check so only genuine system `SUPER_ADMIN` accounts bypass `schoolId` validation. Local school `ADMIN` accounts must strictly match the target `schoolId`:
```ts
export const validateSchoolAccess = (user: any, targetSchoolId: string): boolean => {
  if (!user) return false;
  
  // Platform Super Admin has universal access
  if (user.userType === 'SUPER_ADMIN' || user.role === 'SUPER_ADMIN') {
    return true;
  }
  
  // Local School Admin, Teacher, Student, Parent must match targetSchoolId
  const userSchoolId = user.schoolId || user.school?.id;
  if (userSchoolId && userSchoolId === targetSchoolId) {
    return true;
  }
  
  return false;
};
```

---

### SEC-02: Global Subjective Answers Leak in Exam Review Queue (CRITICAL)

- **File**: [`backend/src/modules/exam/exam-review.service.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-review.service.ts#L8)
- **Controller**: [`backend/src/modules/exam/exam-review.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-review.controller.ts#L10)
- **Vulnerability Type**: Cross-Tenant Information Disclosure
- **Severity**: **CRITICAL**

#### Mechanics:
The endpoint `GET /api/exams/manual-review-queue` accepts an optional `examId` query parameter:
```ts
// exam-review.service.ts: line 8
export const getManualReviewQueueService = async (examId?: string) => {
  const where: any = {
    isGraded: false,
    examAnswer: {
      question: {
        type: {
          in: ['SHORT_ANSWER', 'LONG_ANSWER', 'ESSAY', 'THEORY', 'FILL_IN_BLANKS']
        }
      }
    }
  };

  if (examId) {
    where.examAnswer.examAttempt = { examId };
  }

  const pendingAnswers = await prisma.subjectExamAnswer.findMany({
    where,
    include: { ... }
  });
};
```
If `examId` is omitted, `where` contains **no `schoolId` filter**.

#### Impact:
Any teacher or admin from School A who hits `/api/exams/manual-review-queue` without query parameters receives a dumped list of all pending subjective student exam answers, student full names, student IDs, and exam papers across **every school on the entire platform**.

#### Remediation:
Pass the authenticated user's `schoolId` to `getManualReviewQueueService` and constrain the query:
```ts
export const getManualReviewQueueService = async (schoolId: string, examId?: string) => {
  const where: any = {
    isGraded: false,
    examAnswer: {
      examAttempt: {
        exam: { schoolId } // Enforce tenant boundary
      },
      question: {
        type: { in: ['SHORT_ANSWER', 'LONG_ANSWER', 'ESSAY', 'THEORY', 'FILL_IN_BLANKS'] }
      }
    }
  };

  if (examId) {
    where.examAnswer.examAttempt.examId = examId;
  }
  
  return await prisma.subjectExamAnswer.findMany({ where, include: { ... } });
};
```

---

### SEC-03: Unprotected School Settlement Bank Setup & Financial Analytics (CRITICAL)

- **File**: [`backend/src/modules/finance/finance.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts)
- **Route**: [`backend/src/modules/finance/finance.route.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.route.ts)
- **Vulnerability Type**: Missing Function Level Access Control & Broken Multi-Tenancy
- **Severity**: **CRITICAL**

#### Mechanics:
1. `GET /api/finance/analytics/:schoolId`: Only checks `authenticateToken`. It does **not** verify if the authenticated user is an admin of `:schoolId`. Any student, teacher, parent, or rival school admin can fetch total tuition revenue, pending balances, collection trends, and transaction totals.
2. `POST /api/finance/setup/:schoolId`: Allows any authenticated user to create or update settlement bank accounts and Paystack subaccount codes for any `:schoolId`. An attacker can overwrite School B's bank account details with their own.
3. `DELETE /api/finance/account/:accountId`: Does not verify ownership of the account ID.
4. `GET /api/finance/global-transactions`: Open to any authenticated user without requiring `SUPER_ADMIN` privileges, leaking platform-wide transaction records.

#### Remediation:
1. Add strict `schoolId` ownership verification:
```ts
if (req.user.userType !== 'SUPER_ADMIN' && req.user.schoolId !== req.params.schoolId) {
  return res.status(403).json({ success: false, error: 'Access denied to this school financial data' });
}
```
2. Restrict financial mutations (`setup`, `delete`) to `['SUPER_ADMIN', 'ADMIN']` AND enforce that `req.user.schoolId === req.params.schoolId`.
3. Protect `/global-transactions` with `authorizeRoles('SUPER_ADMIN')`.

---

### SEC-04: Zero-Authorization on Student Termly Evaluations (CRITICAL)

- **File**: [`backend/src/modules/student/termlyEvaluation.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/termlyEvaluation.controller.ts)
- **Route**: Mounted in `backend/src/modules/student/student.route.ts`
- **Vulnerability Type**: Missing Function Level Access Control / IDOR
- **Severity**: **CRITICAL**

#### Mechanics:
1. `PUT /api/students/:id/termly-evaluation`:
   Does not check user roles or ownership. Any authenticated user (including students and parents) can send a PUT request to update:
   - `principalRemarks`
   - `teacherRemarks`
   - `academicProgress`
   - `promotionStatus`
2. `GET /api/students/:id/termly-evaluation`:
   Does not check if the requesting user is the student, the student's parent, or a teacher/admin in the same school.

#### Impact:
Students can alter their own promotional status and counterfeit the principal's official terminal remarks, or view evaluations of other students.

#### Remediation:
- Protect `PUT /api/students/:id/termly-evaluation` with role checks (`authorizeRoles('ADMIN', 'TEACHER')`) and verify that the target student belongs to the teacher's/admin's `schoolId`.
- On `GET /api/students/:id/termly-evaluation`, allow:
  - Admins & teachers of the same school.
  - The student themselves (`req.user.id === student.userId`).
  - Verified linked parents (`parentChildLink` table).

---

### SEC-05: Cross-School & Cross-Class Exam Question & Answer Exposure (HIGH)

- **File**: [`backend/src/modules/exam/exam-attempt.service.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-attempt.service.ts#L20)
- **Vulnerability Type**: Cross-Tenant & Horizontal Privilege Escalation
- **Severity**: **HIGH**

#### Mechanics:
When a student initiates an exam via `startExamAttemptService({ examId, studentId })`:
```ts
// exam-attempt.service.ts
const exam = await prisma.exam.findUnique({
  where: { id: examId },
  include: { papers: true, ... }
});

if (exam.status !== 'PUBLISHED') {
  throw new BadRequestError('Exam is not published');
}
```
The service validates that the exam exists and is published, but **does not verify**:
1. Whether `exam.schoolId === student.schoolId`.
2. Whether the student is enrolled in `exam.classId` or belongs to the allowed `examDepartments`.

#### Impact:
A student from School A who obtains or guesses an exam UUID from School B can start an attempt, immediately receiving all questions, answer formats, and assessment content from School B. Furthermore, a Junior Secondary student can start exam attempts meant for Senior Secondary students.

#### Remediation:
Add explicit tenant and cohort gating in `startExamAttemptService`:
```ts
const student = await prisma.student.findUnique({
  where: { id: studentId },
  select: { schoolId: true, classId: true, departmentId: true }
});

if (!student || student.schoolId !== exam.schoolId) {
  throw new ForbiddenError('You do not have permission to access exams from this institution');
}

if (exam.classId && exam.classId !== student.classId) {
  throw new ForbiddenError('This exam is not designated for your class cohort');
}
```

---

### SEC-06: Parent IDOR on Child Assignments & Teacher Feedback (HIGH)

- **File**: [`backend/src/modules/parent/parent.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/parent/parent.controller.ts#L46)
- **Vulnerability Type**: Broken Object Level Authorization (IDOR)
- **Severity**: **HIGH**

#### Mechanics:
In `parent.controller.ts`, `getChildResults` correctly verifies the parent-child relationship via `parentChildLink`:
```ts
// getChildResults: SAFE
const isChildLinked = await prisma.parentChildLink.findFirst({
  where: { parentId, studentId: childId }
});
if (!isChildLinked) return res.status(403).json(...);
```
However, in the adjacent `getChildAssignments` method:
```ts
// parent.controller.ts: line 46
export const getChildAssignments = async (req: Request, res: Response) => {
  const { childId } = req.params;
  // MISSING: parentChildLink validation!
  const assignments = await getStudentAssignmentsService({ studentId: childId });
  return res.json({ success: true, data: assignments });
};
```

#### Impact:
A parent logged into the platform can replace `childId` with any student's UUID on the platform to view their homework assignments, submitted answers, grades, and teacher remarks.

#### Remediation:
Add the `parentChildLink` check to `getChildAssignments`:
```ts
const isChildLinked = await prisma.parentChildLink.findFirst({
  where: { parentId: req.user.id, studentId: childId }
});
if (!isChildLinked) {
  return res.status(403).json({ success: false, error: 'Unauthorized access to this student' });
}
```

---

### SEC-07: Missing Parent-Child Link on Student Attendance & Academic History (HIGH)

- **File**: [`backend/src/modules/student/student.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.controller.ts)
- **Endpoints**: `GET /api/students/:id/attendance`, `GET /api/students/:id/history`
- **Vulnerability Type**: Incomplete Authorization Logic (Parent IDOR)
- **Severity**: **HIGH**

#### Mechanics:
The controller guards against student-to-student snooping:
```ts
if (currentUserType === UserRole.STUDENT && currentUserId !== studentId) {
  return res.status(403).json({ error: 'Access denied: Students can only view their own records' });
}
```
However, there is **no check for `currentUserType === UserRole.PARENT`**. If a parent makes a request to `/api/students/:id/attendance` or `/api/students/:id/history`, the endpoint treats them like an admin and returns the data without verifying if `parentId` is linked to `:id`.

#### Impact:
Any parent can view the complete attendance records (dates present, absent, excused) and full academic history of any student in the database.

#### Remediation:
Add parent link verification in both endpoints:
```ts
if (currentUserType === UserRole.PARENT) {
  const isLinked = await prisma.parentChildLink.findFirst({
    where: { parentId: currentUserId, studentId: req.params.id }
  });
  if (!isLinked) {
    return res.status(403).json({ success: false, error: 'Access denied: You are not linked to this student' });
  }
}
```

---

### SEC-08: Behavioral Alert & Psychological Profile Data Exposure (HIGH)

- **File**: [`backend/src/modules/student/behaviourProfile.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/behaviourProfile.controller.ts#L16)
- **Endpoint**: `GET /api/students/:id/behaviour-profile`
- **Vulnerability Type**: Sensitive Data Exposure / Missing Access Control
- **Severity**: **HIGH**

#### Mechanics:
```ts
// behaviourProfile.controller.ts: line 16
if (currentUserType === UserRole.TEACHER) {
  const hasAccess = await verifyTeacherStudentAccess(currentUserId, studentId);
  if (!hasAccess) return res.status(403).json(...);
}
// NO CHECK FOR STUDENT OR PARENT
```
The logic only validates access if the user is a `TEACHER`. For `STUDENT` and `PARENT`, it proceeds directly to `getStudentBehaviourProfileService(studentId)`.

#### Impact:
Any student can view disciplinary logs, counselor notes, and behavioral infraction profiles of any other student. Any parent can view the behavioral records of non-linked students.

#### Remediation:
Enforce ownership for students and parents:
```ts
if (currentUserType === UserRole.STUDENT && currentUserId !== studentId) {
  return res.status(403).json({ success: false, error: 'Access denied' });
}
if (currentUserType === UserRole.PARENT) {
  const isLinked = await prisma.parentChildLink.findFirst({
    where: { parentId: currentUserId, studentId }
  });
  if (!isLinked) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
}
```

---

### SEC-09: Cross-Tenant Grade Hub Queries for Non-Teacher Roles (HIGH)

- **File**: [`backend/src/modules/grade/grade.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/grade/grade.controller.ts#L78)
- **Endpoint**: `GET /api/grades/hub`
- **Vulnerability Type**: Multi-Tenant Data Leak
- **Severity**: **HIGH**

#### Mechanics:
While teachers are strictly constrained to `req.user.schoolId`:
```ts
if (userRole === 'TEACHER') {
  effectiveSchoolId = userSchoolId;
} else {
  // If not a teacher, accepts query param or defaults to 'all'
  effectiveSchoolId = (req.query.schoolId as string) || userSchoolId || 'all';
}
```
If an admin of School A passes `?schoolId=<School_B_UUID>`, `effectiveSchoolId` becomes School B's ID. Furthermore, if a student or parent calls `/api/grades/hub?schoolId=all`, the backend returns grades across all schools.

#### Impact:
School administrators can dump grades, continuous assessments, and grade statistics of competitor institutions.

#### Remediation:
Non-superadmin users must always have their `schoolId` pinned to `req.user.schoolId`:
```ts
if (userRole !== 'SUPER_ADMIN') {
  effectiveSchoolId = req.user.schoolId;
} else {
  effectiveSchoolId = (req.query.schoolId as string) || 'all';
}
```

---

### SEC-10: Student Allowed to Submit Class Attendance (MEDIUM)

- **File**: [`backend/src/modules/class/attendance.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/attendance.controller.ts#L54)
- **Endpoint**: `POST /api/classes/:id/attendance`
- **Vulnerability Type**: Privilege Escalation
- **Severity**: **MEDIUM**

#### Mechanics:
The controller contains an explicit check accommodating students submitting attendance:
```ts
// attendance.controller.ts: line 54
if (user.userType === "STUDENT") {
  // Finds student and passes student.schoolId
}
```
The route permits students to submit classroom-wide attendance registers.

#### Impact:
A student can mark themselves and peers present or absent, compromising official institutional attendance records.

#### Remediation:
Remove student handling and enforce role authorization:
```ts
if (user.userType !== 'ADMIN' && user.userType !== 'TEACHER') {
  return res.status(403).json({ success: false, error: 'Only teachers and administrators can record attendance' });
}
```

---

### SEC-11: Unrestricted Class Roster & Student Enrollment Details (MEDIUM)

- **File**: [`backend/src/modules/class/class.service.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts#L340)
- **Endpoint**: `GET /api/classes/:id`
- **Vulnerability Type**: IDOR / Information Disclosure
- **Severity**: **MEDIUM**

#### Mechanics:
`getSingleClassService(classId)` queries the database by `id: classId` with no validation that the class belongs to the caller's school:
```ts
const singleClass = await prisma.class.findUnique({
  where: { id: classId },
  include: {
    enrollments: { include: { student: true } },
    subjects: true,
    teachers: true
  }
});
```

#### Impact:
Any authenticated user who knows a class UUID can view student names, admission numbers, gender, dates of birth, and assigned teacher rosters of other schools.

#### Remediation:
In `class.controller.ts`, verify that `singleClass.schoolId === req.user.schoolId` (unless `SUPER_ADMIN`).

---

### SEC-12: Unvalidated `x-school-id` Header in Assignments (MEDIUM)

- **File**: [`backend/src/modules/assignment/assignment.controller.ts`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/assignment/assignment.controller.ts)
- **Vulnerability Type**: Header Spoofing / Insecure Trust Boundary
- **Severity**: **MEDIUM**

#### Mechanics:
Endpoints in `assignment.controller.ts` read `schoolId` directly from the client request header:
```ts
const schoolId = (req.headers['x-school-id'] as string) || req.user?.schoolId;
```
When deleting an assignment:
```ts
// deleteAssignmentService
if (userType === 'ADMIN') {
  // skips owner check!
}
```
An admin of School A can pass School B's ID in the `x-school-id` header or target an assignment ID from School B, deleting another school's assignments.

#### Remediation:
Never rely on `x-school-id` from the client for authorization. Derive `schoolId` exclusively from `req.user.schoolId` (verified cryptographically in JWT), and only allow `x-school-id` override if `req.user.userType === 'SUPER_ADMIN'`.

---

## 4. Remediation Checklist & Action Plan (All Resolved)

| Priority | Status | Task Description | Target File(s) |
|---|---|---|---|
| **P0** | [x] **RESOLVED** | Fix `validateSchoolAccess` to ensure local `ADMIN` cannot access other schools | `modules/school/school.controller.ts` |
| **P0** | [x] **RESOLVED** | Add `schoolId` scoping to `getManualReviewQueueService` when `examId` is omitted | `modules/exam/exam-review.service.ts` |
| **P0** | [x] **RESOLVED** | Lock down financial analytics, subaccount setup, and account deletion to matching `schoolId` | `modules/finance/finance.controller.ts` |
| **P0** | [x] **RESOLVED** | Restrict `PUT /api/students/:id/termly-evaluation` to authenticated teachers/admins of same school | `modules/student/termlyEvaluation.controller.ts` |
| **P1** | [x] **RESOLVED** | Enforce `student.schoolId === exam.schoolId` and class check in `startExamAttemptService` | `modules/exam/exam-attempt.service.ts` |
| **P1** | [x] **RESOLVED** | Add `parentChildLink` validation to `getChildAssignments` in parent controller | `modules/parent/parent.controller.ts` |
| **P1** | [x] **RESOLVED** | Add `parentChildLink` validation to student attendance and student history endpoints | `modules/student/student.controller.ts` |
| **P1** | [x] **RESOLVED** | Restrict student behavioral profile endpoint for students (self only) and parents (linked only) | `modules/student/behaviourProfile.controller.ts` |
| **P1** | [x] **RESOLVED** | Pin `schoolId` to `req.user.schoolId` for all non-superadmins in `/api/grades/hub` | `modules/grade/grade.controller.ts` |
| **P2** | [x] **RESOLVED** | Disallow students from submitting classroom attendance | `modules/class/attendance.controller.ts` |
| **P2** | [x] **RESOLVED** | Validate class `schoolId` and parent child enrollment in `class.controller.ts` | `modules/class/class.controller.ts` |
| **P2** | [x] **RESOLVED** | Eliminate client-spoofed `x-school-id` headers via `getValidatedSchoolId` helper | `modules/assignment/assignment.controller.ts` |

---
*Report generated for Qefas Hub Security Review.*
