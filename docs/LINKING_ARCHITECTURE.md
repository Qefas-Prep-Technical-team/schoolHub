# Linking Architecture & School Relationship Specification

> **MANDATORY REVIEW**: Review this file before editing any code under `backend/src/modules/link/`, `backend/src/utils/school-access.ts`, `backend/src/utils/update-current-school.ts`, `frontend/src/app/dashboard/*/components/linking/`, or `Mobile/lib/api/hooks/useLinks.ts`.

---

## 1. System Overview

In Qefas Hub, a single user account (Admin, Teacher, Student, Parent) can be linked to one or more schools without creating duplicate user accounts. Linking is represented primarily through the `RelationshipLink` model in Prisma.

```
       ┌────────────────────────┐
       │         School         │
       └───────────┬────────────┘
                   │
         RelationshipLink
     (LinkType: SCHOOL_TEACHER /
      SCHOOL_STUDENT / PARENT_STUDENT)
                   │
       ┌───────────┴────────────┐
       │   Teacher / Student    │
       │       / Parent         │
       └────────────────────────┘
```

---

## 2. The Relationship Link Model

### 2.1 Schema Definition
Defined in `backend/prisma/schema.prisma`:
- **`leftEntityType` & `leftEntityId`**: Usually the School or Parent.
- **`rightEntityType` & `rightEntityId`**: Usually the Teacher, Student, or Child.
- **`linkType`**:
  - `SCHOOL_TEACHER`: Links an educator to a school institution.
  - `SCHOOL_STUDENT`: Enrolls a student into a school institution.
  - `PARENT_STUDENT`: Connects a parent/guardian to a student ward.
  - `STUDENT_CLASS`: Enrolls a student in a specific class within a school.
- **`status`**:
  - `PENDING`: Request initiated (via invitation code, school invite, or join request) awaiting approval.
  - `ACTIVE`: Approved relationship. Grants access to school-scoped resources.
  - `REJECTED`: Explicitly rejected by admin or user.
  - `DISCONNECTED`: Relationship terminated by either party.

---

## 3. Critical Invariants (Must NEVER be Broken)

### 3.1 Dual Linking on Class Join
When a student joins a class using a Class Join Code:
1. A `STUDENT_CLASS` link is created.
2. A `SCHOOL_STUDENT` relationship link to the class's `schoolId` **MUST** also be created/verified.
   - *Why*: Without the `SCHOOL_STUDENT` link, `authMiddleware.ts` detects `schoolId = undefined` and throws `403 SCHOOL_LINK_REQUIRED` when accessing school assessments, grades, or timetable.

### 3.2 Self-Healing `activeSchoolId`
In `authMiddleware.ts` and `getMe`:
- If `teacher.activeSchoolId` or `student.schoolId` is null in the database:
- The backend checks for any `status: "ACTIVE"` relationship link in `RelationshipLink`, `TeacherSubject`, or `ClassTeacher`.
- If an active school link is found, it automatically writes it back to `activeSchoolId` / `schoolId` to heal the account without user intervention.

### 3.3 Link Request Approval & Quota Check
- Before approving a `SCHOOL_STUDENT` link, the backend **MUST** execute `enforceStudentLimit(schoolId)` in `quota.helpers.ts`.
- If the school has reached its subscription limit (e.g. 50 students on Free Plan), the approval must be rejected with `PLAN_LIMIT_REACHED`.

---

## 4. Key Files & Reference Table

| Layer | File Path | Purpose |
|---|---|---|
| **Backend Route** | `backend/src/modules/link/link.routes.ts` | Endpoints for requesting, responding, listing, and revoking links. |
| **Backend Controller** | `backend/src/modules/link/link.controller.ts` | Request handlers for linking workflows. |
| **Backend Service** | `backend/src/modules/link/link.service.ts` | Business logic, quota checks, notification triggers. |
| **Backend Middleware** | `backend/src/middleware/authMiddleware.ts` | Resolves user school context, self-heals unlinked accounts. |
| **Frontend Web** | `frontend/src/components/linking/` | Link request modals, QR scanners, code verification. |
| **Mobile** | `Mobile/lib/api/hooks/useLinks.ts` | TanStack Query hooks for pending/active links. |
