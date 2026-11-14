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

### Friday, November 6, 2026
- **Cross-Subdomain Refresh Cookie Alignment & Active Exam Session Keep-Alive**:
  - *Context*: Students taking assessments on `/Exams&Quizzes/exam/[examId]` (or across `www.qefashub.com` vs `api.qefashub.com`) experienced unexpected logouts when their 1-hour access token expired during an active exam.
  - *Root Causes*:
    1. `auth.controller.ts` set `sameSite: "strict"` on the `refreshToken` cookie during initial login, verifyCode, and 2FA login, whereas `/auth/refresh` set `sameSite: "lax"`. Under `sameSite: "strict"`, cross-subdomain XHR requests to `/auth/refresh` could omit the `refreshToken` cookie, resulting in `NO_REFRESH_TOKEN` and immediate logout.
    2. Students staying on the exam tab continuously without blurring/focusing the window never triggered the window `focus` refresh listener in `client.ts`.
  - *Fixes*:
    1. Standardized `refreshToken` cookie `sameSite` to `"lax"` across all login/verification endpoints in [auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts).
    2. Added `localStorage` fallback (`qefas_access_token`) in [auth-store.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/services/auth-store.ts) and [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts) so the `Authorization: Bearer` header is always populated even if browser cookies are cleared or delayed.
    3. Added a proactive 10-minute session keep-alive `executeRefreshToken()` interval in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/Exams&Quizzes/exam/%5BexamId%5D/page.tsx) while an exam attempt is `IN_PROGRESS`.
- **Session Expiry Redirect Preservation & Safe Storage Cleanup During Login**:
  - *Context*: If a student's session expired while taking an exam, logging back in routed them to `/dashboard/student` instead of returning to `/Exams&Quizzes/exam/[examId]`, and `localStorage.clear()` wiped their device fingerprint (`flexiti_device_id`) and locally backed-up answers/question position.
  - *Fixes*:
    1. Updated `handleSessionExpiry()` in [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts) to capture `window.location.pathname + window.location.search`, persist it to `sessionStorage.setItem("pendingJoinRedirect", currentPath)`, and redirect to the appropriate role login portal with `?session=expired&redirect=...`.
    2. Replaced `localStorage.clear()` in `useLoginMutation` and `useLogin2FAMutation` ([use-auth-mutations.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/services/use-auth-mutations.ts)) with `clearStaleAuthStorage()`, preserving `flexiti_device_id`, `qefas_exam_*`, `qefas_paper_draft_*`, `qefas_device_location`, and `qefas_location_granted`, and added `redirectUrl` handling to `useLogin2FAMutation`.
- **Poor-Network / High-Latency Token Refresh Resilience (3G/Mobile Packet-Loss Hardening)**:
  - *Context*: On slow or unstable mobile networks (such as in Nigeria), a single `/auth/refresh` attempt could time out or drop its HTTP response after the server already rotated the refresh token, causing subsequent retries after >30s to fail with `REFRESH_REUSED` and log the user out, or causing 3-round-trip `401 -> refresh -> retry` waterfalls when an access token expired mid-session.
  - *Fixes*:
    1. Extended access token lifespan from `1h` to `6h` in [authService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/services/authService.ts) so exams never experience mid-assessment token expiry.
    2. Increased default refresh token rotation grace window (`REFRESH_GRACE_SECONDS`) from `30s` to `300s` (5 minutes) with up to 3-hop `replacedByTokenId` successor resolution in [auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts), preventing dropped refresh responses on slow 3G connections from triggering `REFRESH_REUSED` logouts.
    3. Added automatic 3-attempt retry with exponential backoff (`1s`, `2s`), a 45s timeout, and offline reconnection waiting (`waitForOnlineConnection`) inside `executeRefreshToken()` in [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts).
    4. Added pre-request local JWT `exp` inspection in `apiClient` request interceptor (proactively refreshing in the background when `<15m` remain, or refreshing prior to dispatch if already expired to eliminate a wasted `401` round-trip) plus a `window.addEventListener("online", ...)` listener.

### Sunday, November 8, 2026
- **Strict Device Verification Gate on Login**:
  - *Context*: When a user logged in from an unrecognized device, device verification was being skipped because `auth.controller.ts` lacked a check against the user's total count of established sessions, or fell through when sessions weren't explicitly matched.
  - *Fix*:
    1. In [backend/src/modules/auth/auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts) (`login`), queried `prisma.refreshToken.count({ where: { userId: user.id, isValid: true } })`.
    2. If the user has prior recorded sessions (`userSessionsCount > 0`), the request is strictly required to match an active session with identical `deviceModel` and `osVersion`, possess a valid 365-day `deviceVerified` cookie, or carry a verified `preAuthToken`.
    3. If not matched, the login responds with `403 requiresVerification: true` and a short-lived `preAuthToken`, redirecting to `/verification?reason=device` to enter an OTP code.
- **Onboarding Route Guard Precision**:
  - *Context*: Existing users logging in were briefly redirected to `/onboarding` before reaching their dashboard because `hasCompletedOnboarding` defaulted to `false` in `auth-store.ts`.
  - *Fix*: Updated `setAuth` in [frontend/src/app/(auth)/login/services/auth-store.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/services/auth-store.ts) to set `hasCompletedOnboarding: true` by default upon successful login, ensuring only explicit registration flows flag `hasCompletedOnboarding: false`.

### Friday, November 13, 2026
- **Strict `SCHOOL_TEACHER` Link Validation in Auth Self-Heal & Admin Teacher Endpoints**:
  - *Context*: Claimed teachers with a stale `activeSchoolId`/`primarySchoolId` (from a `PENDING`/`REJECTED`/`REVOKED` link or a private `TEACHER_STUDENT` link's `schoolId`) appeared in a school's teacher list on `/dashboard/admin/teachers`, and `GET /admin/teachers/:id` lacked school-link authorization so any school admin could inspect unlinked teachers' full profiles.
  - *Fixes*:
    1. Updated [backend/src/middleware/authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts) to validate claimed teachers' school context strictly against `RelationshipLink` rows with `linkType: "SCHOOL_TEACHER"` and `status: "ACTIVE"`, self-healing `activeSchoolId` to a valid linked school or clearing stale pointers to `null`.
    2. Updated [backend/src/modules/school/services/school-member-filters.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/school/services/school-member-filters.service.ts) (`getActiveSchoolTeacherFilter`) so claimed teachers are only included if they have an `ACTIVE` `SCHOOL_TEACHER` link (while unclaimed pre-registered placeholders created by the school remain visible), and self-healed stale claimed-teacher school pointers pointing to that school.
    3. Decomposed `getTeacherById` into [backend/src/modules/admin/services/teacher-profile.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/admin/services/teacher-profile.service.ts) and [backend/src/modules/admin/controllers/teacher-profile.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/admin/controllers/teacher-profile.controller.ts), added `verifyAdminHasAccessToTeacher` across `getTeacherById`, `updateTeacher`, `getTeacherTimetable`, `createTimetablePeriod`, `getTeacherAttendance`, and `markTeacherAttendance` (`403` when unlinked), and scoped `teacherSubjects`/`classTeachers` to the admin's authorized schools.
- **Complete All-Role Sign-Out & Landing-Page Redirect Cleanup**:
  - *Root Causes*:
    1. Backend `logout` (`backend/src/modules/auth/auth.controller.ts`) only cleared `refreshToken` when present, never cleared `httpOnly` `token` or `platform_token` cookies, omitted matching cookie attributes (`httpOnly`, `secure`, `sameSite`, `path: "/"`), lacked `withRetry`, and left `authMiddleware` `sessionCache` populated for up to 30s. `platformLogout` also omitted matching `path`/`httpOnly`/`secure`/`sameSite` attributes.
    2. Frontend `useAuthStore.clearAuth()` (`frontend/src/app/(auth)/login/services/auth-store.ts`) omitted `userType: null`, lacked `partialize` (persisting `isLoggingOut: true` into `localStorage["auth-storage"]`), and left `"auth-storage"`, `"token"`, `"dashboard-context"`, `"parent-storage"`, `"session-storage"`, `"user-storage"`, `"platform-staff-storage"`, and `sessionStorage["pendingJoinRedirect"]` intact — allowing `/` (`LandingContent`) and `initialize()` to retain stale dashboard/role context or redirect back after sign-out.
    3. Internal Console `ConsoleTopBar.tsx` called `clearStaff()` and routed to nonexistent `/console/login` (404), `ConsoleSidebar.tsx`/`ConsoleMobileDrawer.tsx` skipped `/platform/auth/logout`, Parent `MonthlySidebar.tsx` and `my-children/Header.tsx` had unwired `Log Out` buttons, `DeviceSessions.tsx` redirected on current-device revocation without calling `clearAuth()` or `queryClient.clear()`, `useProtectedRoute.ts` raced `?redirect=` onto `/login` during logout, and signup/unauthorized sign-out links skipped backend cookie revocation.
  - *Fixes*:
    1. Decomposed backend `logout` ([logout.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/controllers/logout.controller.ts), [logout.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/services/logout.service.ts)) and `platformLogout` ([platform/auth/controllers/logout.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/auth/controllers/logout.controller.ts)), exported `invalidateSessionCache` from [authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts), wrapped refresh token deletion in `withRetry`, unconditionally cleared `token`, `refreshToken` (`lax` & `strict`), and `platform_token` with matching attributes via `clearAuthCookies`, and applied `clearAuthCookies` + `invalidateSessionCache` to `revokeUserSession` and `deactivateAccount`.
    2. Updated `useAuthStore` ([auth-store.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/services/auth-store.ts)) and `usePlatformStaffStore` ([usePlatformStaffStore.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/store/usePlatformStaffStore.ts)) with `partialize`, full cookie + `localStorage`/`sessionStorage` + auxiliary store cleanup in `clearAuth()` / `clearStaff()`, unauthenticated cookie hygiene in `initialize()`, `LandingContent` `isHydrated` guard in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/page.tsx), and clean `router.replace("/login")` in `useActualLogoutMutation` + `useProtectedRoute.ts`.
    3. Wired all internal console (`ConsoleTopBar`, `ConsoleSidebar`, `ConsoleMobileDrawer` via `usePlatformLogoutMutation`), parent sub-pages (`MonthlySidebar`, `my-children/Header`), current-device `DeviceSessions`, and signup/unauthorized sign-out actions.
- **Google/Facebook OAuth Session & Cross-Origin Refresh Stabilization**:
  - *Root Causes*:
    1. `useAuthStore.initialize()` in `auth-store.ts` removed `Cookies.get("token")` whenever `!state.accessToken || !state.user`; on `/login/callback`, `<AppInitializer>` ran its effect before `GoogleAuthCallback` read the OAuth cookie, wiping the newly issued `"token"` cookie before hydration or `/auth/me` could succeed.
    2. Next.js OAuth callbacks ([google/callback/route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/api/auth/google/callback/route.ts) and [facebook/callback/route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/api/auth/facebook/callback/route.ts)) called the backend server-to-server via Axios, so `Set-Cookie: refreshToken` on the Next.js origin wasn't shared with the cross-origin API domain, causing subsequent `/auth/refresh` requests to fail with `401 NO_REFRESH_TOKEN` and redirect to `?session=expired`. Additionally `google-auth.controller.ts` still used `sameSite: "strict"` and did not invalidate stale `sessionCache` entries.
  - *Fixes*:
    1. Removed `Cookies.remove("token")` from the unauthenticated `else` branch of `initialize()` in [auth-store.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/services/auth-store.ts), persisted `oauth_refresh_token` -> `localStorage["qefas_refresh_token"]` in `setAuth()`, and cleared `qefas_refresh_token` + `oauth_refresh_token` in `clearAuth()`.
    2. Updated [google-auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/controllers/google-auth.controller.ts) to call `invalidateSessionCache(user.id)` and set `sameSite: "lax"` on `refreshToken`.
    3. Updated [google/callback/route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/api/auth/google/callback/route.ts) and [facebook/callback/route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/api/auth/facebook/callback/route.ts) to use `sameSite: "lax"` and emit a short-lived (300s) `oauth_refresh_token` handoff cookie (plus forwarding `user-agent` / `x-forwarded-for` in Facebook callback).
    4. Updated [callback/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/callback/page.tsx), [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts), and [use-auth-mutations.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/services/use-auth-mutations.ts) so `/login/callback` prioritizes the fresh `token` cookie, passes `Authorization: Bearer` directly to `/auth/me`, persists `qefas_access_token` / `qefas_refresh_token`, and `executeRefreshToken()` submits `{ refreshToken }` in the POST body to `/auth/refresh` (with rotated `refreshToken` persistence).




