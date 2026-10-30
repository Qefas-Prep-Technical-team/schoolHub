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
