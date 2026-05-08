# Project State: Qefas Hub

## Current Focus
- Verification of subscription initialization after the P2025 fix.

## Completed
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
- [x] Optimized heavy database queries in `School` and `Link` modules to resolve 60s Axios timeouts.
- [x] Restored `node_modules` integrity by running `npm install` after accidental deletion of `skills` sub-directories.
- [x] Fixed `express-rate-limit` validation error in `admin.route.ts` that was blocking server startup.

## Blockers
- None.

## Next Action
- [ ] Final manual verification of the "Toaster-only" flow across all user roles.
- [ ] Review any remaining hardcoded branding in secondary modules.

