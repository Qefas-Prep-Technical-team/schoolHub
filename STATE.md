# Project State: Qefas Hub

## Current Focus

- Final verification and testing of the Pricing/Payment registration flow.
- Monitoring for any edge-case payment verification failures.

## Completed

- **Registration & Billing Alignment**:
  - Standardized Pricing/Checkout registration to use normal registration formats (`sch-XXXXXX` tenant IDs, generated admin/school codes).
  - Synchronized `Admin` and `School` models to use Plan UUIDs (`planId`, `subscriptionPlanId`) instead of plan names.
  - Implemented comprehensive trial tracking: auto-sets `trialEndsAt` and `trialPlan` during payment verification.
  - **Security Hardened**: Implemented Paystack metadata-driven verification (Source of Truth) and strict rate limiting on payment endpoints.
  - **Professional Tracking**: Integrated `UserSubscriptionService` and `SchoolSubscriptionService` to ensure trials and payments are synchronized across Institutional, Individual, and History/Audit tables. Added `expiresAt`, `activatedBy`, and `assignedBy` to history logs.
  - **Comprehensive Trial Logic**: Schools and Admins now accurately track `isTrialActive`, `trialUsed`, `trialPlan`, and `trialEndsAt` across all relevant database entities.
- **Database & Infrastructure**:
  - Resolved Prisma migration blockage by terminating hung database sessions (idle in transaction > 17h).
  - Hardened database connection strings with increased `statement_timeout` (5m) to prevent future DDL timeouts.
  - Fixed `schema.prisma` missing relations (`SubscriptionPlan` ↔ `PlanFeatureAccess`, `Admin` ↔ `SchoolAdmin`) to support deep includes.
  - [x] Successfully regenerated Prisma Client (`npx prisma generate`).
- **Teacher Invitation Workflow**:
  - Implemented `AddTeacherModal` in frontend with options to add by Teacher Code or Pre-register via Email.
  - Added backend endpoints (`inviteTeacher`, `resendClaimEmail`) to handle teacher link requests and pre-registration.
  - Implemented strict rate limiting using `express-rate-limit` for the resend endpoint (5 per day per admin).
  - Automatically linked newly pre-registered teachers to the requesting school.
- **Mobile UI Enhancements**: Admin Bottom Nav, refined Top Nav, and layout padding.
- **Desktop Responsiveness**: Fluid column spans for the admin overview bento grid.
- [x] Migrated branding from SchoolHub to **Qefas Hub** (Backend, UI, Emails, CORS).
- [x] Hardened Authentication Logic:
  - [x] Implemented Generic Error Responses to prevent account enumeration.
  - [x] Integrated `helmet` for robust security headers.
  - [x] Implemented Rate Limiting on all sensitive auth endpoints.
  - [x] Strengthened Yup validation schemas (trimming, normalization, strict patterns).
- [x] Standardized UI Feedback:
  - [x] Enforced **"Toaster-only"** notification policy across all login/signup forms.
  - [x] Removed redundant inline error/success alerts.
  - [x] Enforced **"cursor-pointer"** on all buttons and interactive elements.
- [x] Fixed layout issues (browser scrollbar white space, mobile branding redundancy).
- [x] Restored global NavBar visibility on login and signup pages.
- [x] Centered branding header on Admin login page (desktop).
- [x] Fixed `ReferenceError: setServerError is not defined` in Admin login form.
- [x] Resolved `AxiosError 500` on Login:
  - [x] Fixed malformed `.env` file (removed spaces around `=` and leading spaces).
  - [x] Migrated `authService` from `bcrypt` to `bcryptjs` for Windows compatibility.
  - [x] Added safety check for `null` password hashes in `comparePassword`.
- [x] Optimized Global UI Scaling & Fluid Density (V2):
  - [x] Set base font-size to `13px` to achieve the user's preferred 80% zoom feel at 100%.
  - [x] Implemented fluid `auto-fill` grid for metrics (min-width `280px`).
  - [x] Implemented flex-wrap re-arrangement for the main dashboard (charts vs status).
  - [x] Tightened card internal padding to `p-5` and outer layout padding to `md:p-6`.
  - [x] Slimmed down Admin TopBar height to `64px`.
- [x] **Teacher Profile Ownership & Editing**:
  - [x] Restricted profile editing to the school that created the teacher account.
  - [x] Automatically disabled editing capabilities once a teacher claims their account.
  - [x] Implemented `EditTeacherModal` for admins to manage core identity data (Name, Gender, Department).
  - [x] Added "Edit" buttons to both grid and list views in the Teachers directory with strict ownership checks.
  - [x] Hardened backend `updateTeacher` endpoint with mandatory ownership and claim-status verification.
- [x] **Teacher Hub Subscription Enforcement**:
  - [x] Implemented teacher capacity checks (`maxTeachers`) across all subscription tiers, including FREE.
  - [x] Integrated platform-wide feature toggles (`teacher_hub_enabled`) into the Linking Hub.
  - [x] Enforced capacity limits on link request creation, response acceptance, and admin invitations.
- [x] Created `flexiti-security-engine` skill.
- [x] Resolved Next.js Turbopack font resolution error.
- [x] Resolved `AxiosError: timeout of 60000ms exceeded` on Link Requests:
  - [x] Added 12 critical indices to `LinkRequest` table.
  - [x] Optimized `buildIncomingWhere` to avoid expensive nested joins for Admins.
- [x] Fixed empty "Link Requests" list and missing names:
  - [x] Corrected data extraction logic (moved from `.data` to `.items`).
  - [x] Implemented polymorphic name resolution for `LinkRequest` objects in the UI.
- [x] Fixed incorrect "Confirm Your Payment" wording in registration verification emails.
- [x] Removed all global and local skills from the system.
- [x] Fixed Prisma `P2024` connection pool timeout by increasing `connection_limit` to 10.
- [x] Fixed Prisma `P2025` (Record not found) during registration:
  - [x] Refactored `SchoolSubscriptionService` and `UserSubscriptionService` to support optional transaction clients.
  - [x] Updated `auth.controller.ts` to pass the transaction client (`tx`) to subscription initialization methods.
  - [x] This resolves the issue where sub-transactions couldn't see uncommitted records from the parent transaction.
- [x] Fixed misconfigured plan scopes in the database:
  - [x] Corrected 3 Student plans and 2 Teacher plans that were erroneously set to `SCHOOL` scope.
  - [x] This resolves the "Invalid plan scope" error during Student/Teacher payment verification.
- [x] Fixed Prisma `P2028` (Transaction not found) during checkout finalization:
  - [x] Increased interactive transaction timeout to 30s to prevent premature closure during complex onboarding.
  - [x] Consolidated redundant database updates on `Admin` and `School` models to minimize roundtrips.
  - [x] Transitioned initial updates to `findUnique` lookups, deferring all persistent state changes to a single final update call per role.
- [x] Optimized heavy database queries in `School` and `Link` modules to resolve 60s Axios timeouts.
- [x] Restored `node_modules` integrity by running `npm install` after accidental deletion of `skills` sub-directories.
- [x] Fixed `express-rate-limit` validation error in `admin.route.ts` that was blocking server startup.
- [x] **Teacher Registration Enhancements**:
  - [x] Implemented independent teaching account tracking in the database (`isIndependent` flag).
  - [x] Added optional fields accordion (School/Student/Class Codes) to reduce form clutter.
  - [x] Added Privacy and Terms agreement checkbox with functional pop-up modals.
  - [x] Updated backend validation and registration logic to handle independent accounts and terms agreement.

## Blockers

- None.

## Next Action

- [x] Run `npx prisma generate` in backend.
- [x] Fixed JSX syntax error in `checkout/page.tsx` (dangling `div` tags).
- [x] Restored "Confirm Password" field in checkout registration flow.
- [x] Integrated Terms & Conditions and Privacy Policy into the pricing/checkout pathway.
- [x] Added terms audit fields to Google Auth registration.
- [x] Resolved `PrismaClientValidationError` in `getSchoolStatsService` and `getSchoolStudentsService`:
    - [x] Added missing explicit relations to `schema.prisma` for `ClassEnrollment`, `ExamAttempt`, `ClassTeacher`, `Grade`, `Class`, `School`, `Student`, `Teacher`, `Exam`, and `Subject`.
    - [x] Successfully regenerated Prisma Client (`npx prisma generate`) after resolving EPERM locks.
# Project State: Qefas Hub

## Current Focus

- Final verification of Revenue Architecture console stability.
- Monitoring for any further Prisma relation mismatches in platform routes.

## Completed

- **Revenue Architecture & Console Stability**:
  - [x] Resolved "Platform Entitlements" loading hang by fixing Prisma relation name mismatch (`planAccesses` -> `planAccess`) in `FeatureService.listFeatures()`.
  - [x] Hardened `PricingPlanEditorModal` with robust error handling for manifest synchronization.
  - [x] Mapped `featureKey` to `tag` in backend controllers to ensure frontend compatibility.
- **Pricing Editor Enhancements**:
  - [x] Integrated `maxAiUsage` (AI Tokens) field into the Pricing Plan Editor.
  - [x] Added `maxTeachers`, `maxClasses`, and `maxExams` quota fields to the internal console for full control.
  - [x] Synchronized `handleSubmit` payload to correctly persist all new quota fields as numbers.
- **Registry Maintenance**:
  - [x] Successfully purged obsolete features (`Behavior & Remarks`, `Linking Hub`, `Teacher Management`) from the platform feature registry.
  - [x] Cleaned up orphaned `PlanFeatureAccess` links via automated script.
- **Mobile UI Enhancements**: Admin Bottom Nav, refined Top Nav, and layout padding.
- **Desktop Responsiveness**: Fluid column spans for the admin overview bento grid.

## Blockers

- None.

## Next Action

- [ ] Complete the redesign of the active state for the Usage Limits Card.
- [ ] Redesign the Admin Billing Page heading with a more suitable aesthetic (collaborate with user).
- [ ] Verify trial eligibility logic on the frontend/backend bridge.
- [ ] Final manual verification of the "Toaster-only" flow across all user roles.

## Platform-Wide Feature Governance (Active Session)

### Current Focus
- Verification of cross-role feature deactivation logic and route protection.
- Ensuring zero UI flicker during dynamic platform configuration hydration.

### Completed
- **Global Feature Guarding**:
  - [x] Integrated `FeatureGuard` middleware across Admin, Teacher, and Student dashboard layouts.
  - [x] Expanded `DEFAULT_ROUTE_MAP` in `FeatureGuard.tsx` to include critical routes for all roles (Billing, Exams, Grades, etc.).
- **UI Performance & UX**:
  - [x] Eliminated UI flickering across all roles by synchronizing Sidebar menu rendering with global feature flag loading states.
  - [x] Implemented sophisticated skeleton loaders in `AdminSidebar`, `TeacherSidebar`, and `StudentSidebar` to mask content during initial hydration.
  - [x] Added explicit role-level redirects on `/billing` pages (Admin, Teacher, Student) to block access when the module is deactivated.
- **Revenue Console Resilience**:
  - [x] Updated `PricingTab.tsx` with dynamic fallback logic: if a user's primary role pricing is deactivated, the console now pivots to show other active/enforced categories.
  - [x] Integrated "Full Access Protocol" messaging with a premium `Sparkles` icon for users with deactivated subscription enforcement.

### Next Action
- [ ] Perform final QA on Admin portal critical paths to ensure no administrative routes are erroneously blocked.
- [ ] Monitor the "Full Access Protocol" fallback for edge cases where all pricing categories might be deactivated (rare but theoretically possible).

