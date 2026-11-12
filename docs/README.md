# Architecture & Feature Knowledge Index (`docs/`)

> **MANDATORY FOR ALL AGENTS & DEVELOPERS**:
> When modifying, fixing, or adding code to any subsystem below, you MUST review its dedicated architecture specification before making any code changes.
> After making modifications, you MUST document your changes in the corresponding spec and update `STATE.md`.

---

## 📚 Core Architecture Specifications

| Subsystem | Specification Document | Key Responsibilities & Invariants |
|---|---|---|
| **Authentication & Database Connection** | [`AUTH_STATE.md`](../AUTH_STATE.md) | Token lifecycle (1h JWT + 30d refresh token), single-flight rotation grace window (30s), PgBouncer connection resilience (`withRetry`), multi-device tracking, strict error codes (`TOKEN_EXPIRED`, `NO_SESSION_ROW`, `503 SERVICE_UNAVAILABLE`). |
| **Registration & OTP Verification** | [`REGISTRATION_FLOW.md`](REGISTRATION_FLOW.md) | Dual registration (Social vs Email/Password), 6-digit OTP code verification before account activation, native browser geolocation permission (no custom popups), onboarding redirect preservation. |
| **School & User Relationship Linking** | [`LINKING_ARCHITECTURE.md`](LINKING_ARCHITECTURE.md) | `RelationshipLink` state machine (`PENDING`, `ACTIVE`, `REJECTED`, `DISCONNECTED`), self-healing `activeSchoolId`, teacher & student invitations, class enrollments, and code generators (`SchoolCode`, `StudentCode`, etc.). |
| **Social Login (OAuth) & Onboarding** | [`SOCIAL_LOGIN_AND_ONBOARDING.md`](SOCIAL_LOGIN_AND_ONBOARDING.md) | Google & Facebook OAuth flows, Supabase Auth integration, multi-role callback routing, pre-auth verification, onboarding tour redirection, and account claiming. |
| **Multi-Tenancy & Subdomains** | [`MULTITENANCY_ARCHITECTURE.md`](MULTITENANCY_ARCHITECTURE.md) | Subdomain extraction in Next.js middleware, custom domains, dynamic routing `app/[subdomain]/`, system vs tenant path exclusions, and database tenant isolation (`School.tenantId`). |
| **Assessments, Exams & Grading** | [`ASSESSMENT_DATA_MODEL.md`](../ASSESSMENT_DATA_MODEL.md) & [`school_grading_system_sync`](../.agents/skills/school_grading_system_sync/SKILL.md) | Assessments data model (exams, tests, quizzes, assignments, offline CA), 9-grade matrix fallback, termly results, and student department scoping. |
| **Assessment System — All User Types** | [`ASSESSMENT_SYSTEM.md`](ASSESSMENT_SYSTEM.md) | Full user-type breakdown of assessment flows for Teacher, Student, Admin, and Parent. Covers page layout, creation forms, subject scoping, smart routing, department guards, export, and API reference. |
| **Subscriptions, Billing & Paystack** | [`SUBSCRIPTION_AND_BILLING.md`](SUBSCRIPTION_AND_BILLING.md) | Tier enforcement (`FREE`, `BASIC`, `PREMIUM`), Paystack webhooks, trial periods, student quotas, and subscription sweepers. |
| **School Fees Payment & Term Catalog** | [`SCHOOL_FEES_PAYMENT_ARCHITECTURE.md`](SCHOOL_FEES_PAYMENT_ARCHITECTURE.md) | Folder-based Term & Class/Department fee catalogs, auto-sum + `"More"` spillover line-item reconciliation, partial & full installment payments, per-catalog `SettlementAccount` routing, Parent/Student overview widgets & dedicated payment pages, and Console email templates. |
| **Admin Dashboard & Sub-Role RBAC** | [`ADMIN_DASHBOARD_ROLES.md`](ADMIN_DASHBOARD_ROLES.md) | Institutional hierarchy (`SCHOOL_OWNER`, `PRINCIPAL`, `REGISTRAR`, `ACCOUNTANT`), route gating via `AdminRoleGuard`, billing permissions, and self-healing session states. |
| **Teacher Dashboard & Offline Grades** | [`TEACHER_DASHBOARD.md`](TEACHER_DASHBOARD.md) | Class management, offline assessment pad, teacher subject scoping, browser draft auto-recovery, and academic session resolution. |
| **Student Dashboard & Academic Profile** | [`STUDENT_DASHBOARD.md`](STUDENT_DASHBOARD.md) | Enrolled subjects department scoping, academic department & grade level locking modal, profile completion, and dismiss persistence. |
| **Login Flow & Trusted Device Verification** | [`LOGIN_FLOW.md`](LOGIN_FLOW.md) | Dual login pathways (Email/Password & Google SSO), 365-day trusted device cookie caching, database session validation, pre-auth verification redirection, and native location collection. |

---

## 🛡️ The Non-Regression Protocol

To prevent bug fixes from breaking other parts of the system:
1. **Identify Affected Subsystems**: Before writing code, match the files you plan to touch with the table above.
2. **Review Invariants**: Read the specific document to understand existing edge cases, background jobs, and error contracts.
3. **Run Pre-Commit Verification**:
   - `npx tsc --noEmit` on affected packages (`backend/`, `frontend/`, `Mobile/`).
   - Smoke test both happy path and failure path.
4. **Update Documentation**: Update the respective document in `docs/` or `AUTH_STATE.md` with:
   - What changed
   - Affected files
   - Verification results
