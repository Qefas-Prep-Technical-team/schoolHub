# Qefas Hub — Authentication & Database Architecture Log (AUTH_STATE.md)

> **MANDATORY**: Before touching any authentication flow, auth page (login, register, forgot-password, reset-password, OAuth callback, verification), session middleware, or database connection/migration layer:
> 1. **Read this file first** to understand historical decisions, token lifecycle, school links, and guards.
> 2. **Document every change** made to authentication or database connection logic in this file with a dated entry, explanation, affected files, and verification steps.

---

## 1. Authentication Architecture Overview

### User Roles & Entity Types
- `ADMIN` — School Administrators and System Owners
- `TEACHER` — School Educators and Independent Tutors
- `STUDENT` — Learners enrolled in classes / schools
- `PARENT` — Guardians linked to student accounts

### Token Lifecycle & Session Handling
- **JWT Storage**:
  - Web: HttpOnly / Secure cookies & Bearer tokens stored in auth state (`useAuthStore`).
  - Mobile: Expo SecureStore (`Mobile/lib/auth/secure-store.ts`).
- **Token Refresh**:
  - Managed by Axios response interceptors (`lib/api/client.ts`).
  - Automatic token refresh on 401 with queuing to prevent duplicate refresh requests.
  - Automatic redirection to login on token invalidation or manual sign-out (`authEvents.ts`).

### Multi-Tenant & School Context Resolution
- Users (Teachers, Students, Parents) link to schools via:
  - `RelationshipLink` (`LinkEntityType`)
  - Direct `SchoolAdmin` association for Admins
  - `TeacherSubject` / `ClassTeacher`
  - `ClassEnrollment`
- Automatic self-healing of `activeSchoolId` in `authMiddleware.ts` and `getMe` if a user has active school links.

---

## 2. Authentication Flow Directory Reference

### Frontend Web (`frontend/src/app/`)
- `(auth)/login/admin/` — Admin login portal
- `(auth)/login/teacher/` — Teacher login portal
- `(auth)/login/student/` — Student login portal
- `(auth)/login/parent/` — Parent login portal
- `(auth)/login/callback/` — Social OAuth (Google) hydration & onboarding redirection
- `(auth)/register/` — Multi-role registration forms
- `(auth)/verification/` — Email verification, OTP, and onboarding hand-off
- `(auth)/forgot-password/` & `(auth)/reset-password/` — Password recovery flow
- `(auth)/login/services/auth-store.ts` — Zustand authentication store

### Backend API (`backend/src/`)
- `middleware/authMiddleware.ts` — Token authentication, user role verification, school link hydration
- `modules/auth/auth.controller.ts` — Login, registration, token refresh, password resets
- `modules/auth/auth.service.ts` — User credential verification, password hashing (bcrypt), JWT generation
- `modules/link/` — Relationship linking between schools, teachers, students, and parents

### Mobile (`Mobile/`)
- `lib/auth/secure-store.ts` — Native credential storage
- `lib/api/hooks/useAuth.ts` — `useAuthUser()` (cached with `staleTime: Infinity`)
- `lib/api/client.ts` — Axios interceptor for mobile auth

---

## 3. Change History & Audit Log

### Friday, October 30, 2026
- **Admin Exam & Paper Preview Authorization Gate**:
  - *Context*: Previewing exams from `/dashboard/admin/exams/:id/papers/:paperId` triggered "School Connection Required".
  - *Root Cause*: `ExamPreviewPage.tsx` only queried `useTeacherProfile()`, returning null for `ADMIN` users and blocking preview.
  - *Fix*: Integrated `useAuthStore` into `ExamPreviewPage.tsx`, recognized `ADMIN` role with automatic school access, and bypassed `useTeacherProfile` loading.
- **Student & Parent Forgot Password Links**:
  - *Context*: Student and Parent login pages lacked direct access to password recovery.
  - *Fix*: Added themed "Forgot Password?" links in `StudentLoginForm.tsx` and `ParentLoginForm.tsx` routing to `/auth/forgot-password`.
- **Class Join & Automatic School Link Generation**:
  - *Context*: New students connecting via class join code or direct signup links were enrolled in the class without establishing the corresponding `SCHOOL_STUDENT` link.
  - *Fix*: In `auth.controller.ts` (`registerStudent`) and `class.service.ts` (`requestToJoinClassService`), automatically created both `STUDENT_CLASS` and `SCHOOL_STUDENT` relationship links, notifying administrators in real-time.
- **Onboarding Tour Redirection Gate**:
  - *Context*: New registrants with a `pendingRedirect` bypassed the onboarding introduction tour.
  - *Fix*: Preserved `pendingRedirect` across `/onboarding?type=...&redirect=...` in `VerificationCard.tsx` and `login/callback/page.tsx` so new users complete the tour before landing in their final destination.
- **Database Connection Single-Flight Auto-Recovery & Keep-Alive Decoupling**:
  - *Context*: Production (Render) intermittently flooded with `"Engine is not yet connected"` errors for ~15 minutes before recovering.
  - *Root Cause*: Racing `prisma.$disconnect()` and `$connect()` executions between request-level `withRetry` and the background keep-alive CRON ping left the Prisma query engine in a half-disconnected state. Furthermore, a 5s race timeout abandoned in-flight connects, causing continuous reconnect loops.
  - *Fixes*:
    1. Implemented **single-flight reconnect** in [backend/src/config/database.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/config/database.ts) (`reconnectPromise`) where concurrent callers await the same in-flight reconnect rather than triggering new ones.
    2. Made reconnect do `await prisma.$disconnect().catch(() => {})` then `await prisma.$connect()` with no short timeout.
    3. Filtered reconnects to genuine connection errors only (Prisma codes `P1001`, `P1002`, `P1008`, `P1017`, `Engine is not yet connected`, socket closures, timeouts).
    4. Added exponential backoff with randomized jitter before retry.
    5. Made CRON keep-alive ping in [backend/src/scripts/cron.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/scripts/cron.ts) **observe-only** (no reconnect calls; skips when a reconnect is running; exits process with code 1 after 3 consecutive failures for a clean container restart).
    6. Updated [backend/src/index.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/index.ts) to fail fast on startup connect failures (`process.exit(1)`) and cleanly disconnect on `SIGTERM` / `SIGINT`.
    7. Converted orphaned `new PrismaClient()` instances in `termlyEvaluation.service.ts`, `records.service.ts`, and `seed-subscriptions.ts` to use the shared singleton client.
    8. Wrapped `getPublicPlatformSettings`, `getPublicRoleFeatures`, and `googleAuthService` in `withRetry`.
- **Session Stabilization & Token Rotation Race Elimination**:
  - *Context*: Users randomly experienced session expirations and unexpected signouts while actively navigating the app.
  - *Root Causes*:
    1. `authMiddleware.ts` caught all non-JWT server/database errors and returned `401 "Invalid token"`, prompting clients to wipe user sessions upon any transient DB hiccup.
    2. Parallel requests hitting expired 1h access tokens raced `/auth/refresh`. The first request rotated the refresh token (`isValid = false`), causing subsequent requests to fail with `401 "Invalid or revoked refresh token"` and trigger immediate logout.
    3. Mobile client relied on text string-matching (`includes("invalid token")`) rather than structured codes, clearing tokens on non-terminal errors.
  - *Fixes*:
    1. In [authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts), mapped JWT errors to `TOKEN_EXPIRED` and `TOKEN_INVALID`, session lookup failures to `NO_SESSION_ROW` or `USER_INACTIVE`, and all unexpected/database errors to `503 SERVICE_UNAVAILABLE` (never 401). Wrapped lookups in `withRetry`.
    2. In [auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts), introduced a 30s token rotation grace window (`rotatedAt`, `replacedByTokenId`). Benign replays within the grace window return fresh access tokens. Rotations are concurrency-safe via conditional transactions. Wrapped DB queries in `withRetry` and return `503 SERVICE_UNAVAILABLE` on DB failures.
    3. In Web [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts) and Mobile [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/Mobile/lib/api/client.ts), converted refresh logic to a shared `refreshPromise` single-flight function. Decoupled logout from string matching to strict terminal codes (`NO_REFRESH_TOKEN`, `REFRESH_INVALID`, `REFRESH_EXPIRED`, `REFRESH_REUSED`, `USER_INACTIVE`, `DEVICE_UNAUTHORIZED`, `NO_SESSION_ROW`). Retries network/5xx errors without clearing tokens.
    4. Added proactive token refresh on window focus (Web) and `AppState` active foreground (Mobile).


