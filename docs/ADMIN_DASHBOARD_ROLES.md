# Admin Dashboard & Sub-Role RBAC Specification (`ADMIN_DASHBOARD_ROLES.md`)

> **Subsystem**: Administrator Dashboard, Institutional Hierarchy, Sub-Role Access Control (RBAC), and Billing Permission Architecture.  
> **Primary References**: [`AUTH_STATE.md`](../AUTH_STATE.md), [`docs/REGISTRATION_FLOW.md`](REGISTRATION_FLOW.md), [`frontend/src/app/dashboard/admin/components/adminFeatureFlags.ts`](../frontend/src/app/dashboard/admin/components/adminFeatureFlags.ts).

---

## 1. Architectural Overview & Institutional Hierarchy

In Qefas Hub, the platform level user role for institution administrators is `UserRole.ADMIN`. Within an institution/school, administrators possess granular administrative sub-roles defined by `AdminRole`:

```
                       ┌─────────────────────────┐
                       │      SCHOOL_OWNER       │  (Proprietor / Creator of the school)
                       │  • Full portal access   │
                       │  • Billing & Plans      │
                       │  • Subdomain & Theme    │
                       └────────────┬────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│   PRINCIPAL   │            │   REGISTRAR   │            │  ACCOUNTANT   │
│ • Academics   │            │ • Student &   │            │ • Billing &   │
│ • Staff/Team  │            │   Academic    │            │   Invoices    │
│ • Sessions    │            │   Records     │            │ • Payments &  │
│ • Timetable   │            │ • Class list  │            │   Settlements │
└───────────────┘            └───────────────┘            └───────────────┘
```

---

## 2. Admin Roles Matrix & Route Guards

### 2.1 Role Definitions (`AdminRole`)

| Role | Hierarchy / Description | Primary Scopes & Responsibilities |
|---|---|---|
| `SCHOOL_OWNER` | Creator of the school institution via `/signup/school`. Supercedes all guards. | Institutional identity, subdomain setup, subscription/billing plans, banking/settlements, team role assignment, deletion/transfer of ownership. |
| `PRINCIPAL` / `VICE_PRINCIPAL` | Academic and operational executive. | Teacher management, class allocations, timetable approvals, academic calendar, student discipline. |
| `REGISTRAR` | Admissions and official record keeper. | Student enrollments, academic transcripts, student transfers, verification records. |
| `ACCOUNTANT` | Financial administrator. | Tuition fee tracking, invoice creation, billing history, payment settlements. |
| `SUPPORT` / `ADMIN` | General staff / helpdesk administrator. | General portal assistance with restricted access to billing and school settings. |

### 2.2 Route Protection Matrix (`AdminRoleGuard`)

Protected admin sub-routes enforce RBAC using [`AdminRoleGuard`](../frontend/src/components/auth/AdminRoleGuard.tsx):

| Route | Allowed Roles | Guard Message / Behavior |
|---|---|---|
| `/dashboard/admin/billing` | `["SCHOOL_OWNER", "ACCOUNTANT"]` | "Billing and subscription management is restricted to the School Owner and Accountant only." |
| `/dashboard/admin/settings` | `["SCHOOL_OWNER"]` | "Settings are restricted to the School Owner only. Contact your School Owner to make changes." |
| `/dashboard/admin/team` | `["SCHOOL_OWNER", "PRINCIPAL"]` | "Team management is restricted to the School Owner and Principal." |
| `/dashboard/admin/grades` | `["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR"]` | "Grades and academic records are restricted to School Owners, Principals, and Registrars." |
| `/dashboard/admin/finance` | `["SCHOOL_OWNER", "ACCOUNTANT"]` | "Finance and fee management is restricted to the School Owner and Accountant only." |
| `/dashboard/admin/payments` | `["SCHOOL_OWNER", "ACCOUNTANT"]` | "Payments and fee collections management is restricted to the School Owner and Accountant only." |

---

## 3. The School Owner Registration & Verification Invariant

### 3.1 The Bug
When a user registers a school institution at `/signup/school`:
1. A new `School` institution and `Admin` user are created.
2. The user is linked in `SchoolAdmin` with `role: AdminRole.SCHOOL_OWNER`.
3. The user verifies their 6-digit OTP code at `/api/auth/verify-code`.
4. **Failure Point**: Previously, `/api/auth/verify-code` calculated `isSchoolOwner = true`, but returned `normalizedAdmin` containing only generic `role: "ADMIN"` and `isSchoolOwner: true`, but **omitted `adminRole: "SCHOOL_OWNER"`** in the response.
5. In the frontend, `useAuthStore` saved `user.adminRole` as `undefined` (or fell back to `user.role` which was `"ADMIN"`).
6. When navigating to `/dashboard/admin/billing`, `AdminRoleGuard` checked:
   ```ts
   const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined;
   if (adminRole === "SCHOOL_OWNER") return <>{children}</>;
   if (adminRole && allowedRoles.includes(adminRole)) return <>{children}</>;
   ```
   Since `adminRole` resolved to `"ADMIN"`, access was blocked with:
   *"Access Restricted: Billing and subscription management is restricted to the School Owner and Accountant only. Your current role: ADMIN"*.

### 3.2 The Multi-Layer Fix
1. **Backend (`auth.controller.ts` -> `verifyEmailCode`)**:
   Explicitly includes `adminRole: resolvedAdminRole` in `normalizedAdmin` and in the response payload:
   ```ts
   const resolvedAdminRole =
     user.schoolAdmins.find((sa: any) => sa.role === AdminRole.SCHOOL_OWNER)?.role ||
     user.schoolAdmins[0]?.role ||
     (isSchoolOwner ? AdminRole.SCHOOL_OWNER : null);
   ```
2. **Frontend State Hydration (`auth-store.ts` -> `normalizeUser`)**:
   Automatically derives `adminRole` and `isSchoolOwner` from `user.adminRole`, `user.isSchoolOwner`, or the attached `schools[0].adminRole` array.
3. **Frontend Guard Resilience (`AdminRoleGuard.tsx`)**:
   Directly evaluates `user?.isSchoolOwner || user?.adminRole === "SCHOOL_OWNER" || schoolAdminRole === "SCHOOL_OWNER"`, guaranteeing that the school creator always bypasses restrictions immediately without any role discrepancy.

---

## 4. Verification & Testing Checklist

- [x] Verified `SchoolAdmin` link assigns `AdminRole.SCHOOL_OWNER` during school registration.
- [x] Verified `verifyEmailCode` returns `adminRole: "SCHOOL_OWNER"` alongside `isSchoolOwner: true`.
- [x] Verified `useAuthStore` stores `adminRole` and `isSchoolOwner` in normalized user state.
- [x] Verified `AdminRoleGuard` allows seamless access to `/dashboard/admin/billing` for the registered school owner.

---

## 5. Recent Admin Dashboard Feature Updates

### 5.1 Dark & Light Mode Responsive Loading Skeletons (`/dashboard/admin/team`)
- **Status**: Completed & Verified.
- **Context**: The dedicated team page skeleton loader (`frontend/src/app/dashboard/admin/team/loading.tsx`) previously had low contrast and inconsistent visibility across theme switches.
- **Enhancement**:
  - Re-architected with theme-aware tokens (`bg-slate-200/80 dark:bg-slate-700/60` and `border-slate-200/80 dark:border-slate-800`).
  - Added metric cards, status filter pill skeletons, and tabular rows with alternating pulse animations to deliver high visual fidelity in both light and dark modes.

### 5.2 Offline Grades & Assessment Pad Enhancements
- **Status**: Completed & Verified.
- **Modal Header Toolbar Cleanup**:
  - Consolidated duplicate "Save Draft" and "Publish Grades" action buttons so actions only reside in the persistent top modal navigation (`RecordScoreEntryModal.tsx`).
  - Removed duplicate close controls: hidden redundant Radix `DialogContent` close button (`showCloseButton={false}`) and cleaned the 'Cancel' button styling without inner duplicate icons.
- **Dynamic Assessment Title Display**:
  - Dynamically updates the header banner in `OfflineGradesHeader.tsx` to mirror the live user-typed assessment title (`config.assessmentType`) while falling back gracefully to `"Offline Grades & Assessment Pad"`.
- **Browser Auto-Save & Draft Recovery**:
  - Auto-persists work-in-progress score entries and assessment metadata to `localStorage` under a user-and-cohort-scoped key (`qefas_offline_grade_draft_{classId}_{userId}`).
  - Prevents accidental data loss if the modal is canceled or closed prematurely.
  - Surfaces an active `"Auto-saved draft"` indicator with a dedicated `"Clear Draft"` action button so staff can instantly discard browser storage and start a fresh assessment pad.

### 5.3 Admin Overview (`/dashboard/admin`) Sub-Role RBAC, Multi-Tenant Security & Modular Decomposition
- **Status**: Completed & Verified (November 3, 2026).
- **Sub-Role Access Control on `/dashboard/admin`**:
  - Added `canAdminRoleAccessFeature(adminRole, featureKey)` in `adminFeatureFlags.ts`.
  - Gated `AdminFinanceCard` (`finance` permission) and `UsageLimitsCard` (`billing` permission) on `frontend/src/app/dashboard/admin/page.tsx` so financial revenue, settlement vault status, and plan upgrade widgets are only rendered and queried for `SCHOOL_OWNER`, `ACCOUNTANT`, `ADMIN`, and `SUPER_ADMIN` (preventing unauthorized API calls and restricted links for `PRINCIPAL`, `REGISTRAR`, and `SUPPORT`).
  - Updated `QuickActions.tsx` and `AdminBottomNav.tsx` to filter shortcuts and mobile bottom navigation tabs by the current admin's sub-role (`ROLE_NAV_PERMISSIONS`).
  - Updated `useProtectedRoute.ts` so secondary admins (`PRINCIPAL`, `REGISTRAR`, `SUPPORT`) are not redirected to `/select-plan`.
- **Multi-Tenant & Entity Data Leak Fixes**:
  - **`GET /api/exams` (`controllers/exam-list.controller.ts` & `exam.service.ts`)**: Enforced `validateSchoolAccess` for school admins, forbade `isPersonal` or unscoped queries for admins, verified `parentChildLink` when parents pass `availableForStudentId`, and sanitized all `teacher` selects so password hashes are never returned.
  - **`POST /api/classes/:id/announcement` & `GET /api/classes` (`controllers/class-dashboard.controller.ts` & `class.service.ts`)**: Added `canManageClass` authorization check before broadcasting class announcements, resolved `schoolId` (UUID or `tenantId`), and sanitized `teacher`/`student` selects to strip sensitive fields.
  - **School Endpoints & Active Link Filtering (`modules/school/services/*` & `controllers/*`)**: Restricted admin-only school endpoints with `validateAdminSchoolAccess`, sanitized `admin` and `teacher` selects in `getSchoolProfileService` and `getDashboardRecentActivityService`, and filtered `getSchoolTeachersService`, `getSchoolStudentsService`, `getSchoolStatsService`, `getDashboardRecentActivityService`, and `getSchoolUsageService` to exclude `PENDING`, `REJECTED`, or `DISCONNECTED` link requests and scope `unassignedTeachers` to classes within the current school.
- **Modular File Decomposition (<300 lines)**:
  - Decomposed `app-sidebar.tsx` (194 lines), `AdminWeeklyReportModal.tsx` (175 lines), `AdminAnnouncementModal.tsx` (191 lines), `financeService.ts` (248 lines), `useExams.ts` (226 lines), `school.controller.ts` (2 lines + controllers <240 lines), `school.service.ts` (40 lines + services <290 lines), `notification.controller.ts` (95 lines + service 292 lines), and `quota.service.ts` (3 lines + services <260 lines).

### 5.4 Admin Team Governance (`/dashboard/admin/team`) Multi-Tenant Isolation, Sub-Role RBAC & Modular Decomposition
- **Status**: Completed & Verified (November 3, 2026).
- **Sub-Role & Route Security (`backend/src/modules/admin/admin.route.ts` & `admin.middleware.ts`)**:
  - Added `requireSchoolOwnerOrPrincipal` middleware to `GET /api/v1/admin/team` (previously only `requireAdmin`, which allowed `REGISTRAR`, `ACCOUNTANT`, and `SUPPORT` sub-roles to query the full school admin team list via API despite being blocked in the UI).
  - Hardened `loadAndValidateAdmin` in `admin.middleware.ts` to resolve `req.params.schoolId`, `req.query.schoolId`, or `req.body.schoolId` (by UUID or `tenantId`) against the caller's active `schoolAdmins` records and reject unauthorized cross-school requests with `403 Forbidden`, preventing multi-school context confusion and blocking `schoolId: undefined` queries.
- **Unauthenticated Enumeration & Cross-Tenant Leak Fixes (`services/admin-team.service.ts`, `services/admin-team-members.service.ts`)**:
  - **Public Status Endpoint (`GET /api/v1/admin/admin-status/:email`)**: Previously returned internal admin UUIDs, names, and full `schoolAdmins` arrays with school IDs/names to unauthenticated callers. Now strips internal IDs and school directory details for unauthenticated requests, returning only `{ email, status, verified, adminRole }`.
  - **Mandatory `schoolId` Guard**: All team queries and mutations (`getSchoolAdminsService`, `getPendingAdminsService`, `approveAdminService`, `rejectAdminService`, `updateAdminRoleService`, `transferOwnershipService`, `removeAdminService`) strictly require a verified non-empty `schoolId` so Prisma `where: { schoolId }` never evaluates with `undefined`.
  - **Session Revocation on Rejection/Removal**: `rejectAdminService` and `removeAdminService` deactivate the `schoolAdmin` association (`active: false`) and invalidate active `refreshToken` rows (`isValid: false`) in a single database transaction.
- **Modular File Decomposition (<300 lines)**:
  - **Frontend (`frontend/src/app/dashboard/admin/team/`)**: Decomposed `ActiveMembersTable.tsx` (473 -> 282 lines) and `PendingRequestsTable.tsx` (410 -> 258 lines) by extracting `teamRoleConfig.ts` (98 lines), `ActiveMemberDialogs.tsx` (136 lines), and `PendingRequestDialogs.tsx` (187 lines), with `page.tsx` at 278 lines.
  - **Backend (`backend/src/modules/admin/`)**: Decomposed team handlers out of `admin.controller.ts` (1493 -> 1089 lines) into `controllers/admin-team.controller.ts` (296 lines), `services/admin-team.service.ts` (266 lines), `services/admin-team-members.service.ts` (186 lines), and `schemas/admin-team.schemas.ts` (39 lines), with `admin.middleware.ts` at 292 lines.



