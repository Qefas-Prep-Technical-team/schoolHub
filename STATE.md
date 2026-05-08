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

## Blockers
- None.

## Next Action
- [ ] Ensure all users can successfully complete the checkout flow without relation errors.
- [ ] Verify trial eligibility logic on the frontend/backend bridge.
- [ ] Final manual verification of the "Toaster-only" flow across all user roles.

