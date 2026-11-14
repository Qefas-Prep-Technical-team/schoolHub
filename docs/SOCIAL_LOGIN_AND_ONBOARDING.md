# Social Login (OAuth) & Onboarding Architecture Specification

> **MANDATORY REVIEW**: Review this file before modifying Google/Facebook authentication, OAuth redirect callbacks, invitation token processing, or post-login onboarding tours.

---

## 1. System Overview

Qefas Hub supports social authentication via **Google** and **Facebook**, integrated through Supabase Auth (client SDK) and custom backend token exchange (`/api/v1/auth/google`, `/api/v1/auth/facebook`).

```
  [User Clicks "Continue with Google"]
                    │
           Supabase OAuth Flow
                    │
  [Redirect to /login/callback?code=...]
                    │
  Backend POST /api/v1/auth/google
  - Validates Google/Supabase token
  - Checks Platform Feature Flags
  - Finds or Creates User
  - Checks Staff Invitation Tokens
  - Issues 1h Access Token + 30d Refresh Token
                    │
  Frontend Callback Page
  - Hydrates Zustand Auth Store (useAuthStore.setAuth)
  - Checks if user is new (hasCompletedOnboarding)
  - Routes to /onboarding?type=... or resolveUserDashboard()
```

---

## 2. Critical Invariants (Must NEVER be Broken)

### 2.1 Role-Based Feature Flag Gate
Before authenticating any social user, the backend **MUST** check:
1. `platformSettings` for `google_auth_enabled` (global kill-switch).
2. `platformFeature` for `googleLogin` matching the target role (`studentEnabled`, `teacherEnabled`, `parentEnabled`, `adminEnabled`).
   - If disabled for that specific role, return `403` with a friendly error message explaining that the administrator has disabled Google login for that role.
   - Note: Platform Staff invitations bypass the role-level disablement.

### 2.2 Wrong Portal & Multiple Role Detection
- If an existing user registered as a `TEACHER` attempts to log in via the `STUDENT` Google login page:
  - The backend returns `403 { code: "WRONG_PORTAL", detectedRole: "TEACHER", correctPortal: "/login/teacher" }`.
  - The frontend displays a modal asking if they would like to switch to the correct portal instead of silently failing or creating a duplicate account.

### 2.3 Invitation Token Handshake
If an invite token is passed (`inviteToken` in request body):
- For Platform Staff or School Teachers, the social login links the Google account directly to the pending staff record and marks `isActive = true`.

### 2.4 Onboarding Tour Redirection Gate
When a new user completes OAuth:
- If `isNewUser: true` or `hasCompletedOnboarding: false`:
- The client redirects to `/onboarding?type=[role]&redirect=[targetPath]`.
- **Do not drop `pendingRedirect`**: Any pre-auth URL (e.g. an exam link, class invite, or checkout) must be forwarded as `?redirect=...` so that after the onboarding tour ends, the user arrives at their intended destination.

---

## 3. Key Files & Reference Table

| Layer | File Path | Purpose |
|---|---|---|
| **Backend Route** | `backend/src/modules/auth/auth.routes.ts` | `/google`, `/facebook`, `/facebook-data-deletion`. |
| **Backend Controller** | `backend/src/modules/auth/controllers/google-auth.controller.ts` | `googleAuth` (sets `sameSite: "lax"` refresh cookie, invalidates `sessionCache`). |
| **Backend Service** | `backend/src/modules/auth/auth.service.ts` | `googleAuthService` (checks feature flags, handles staff invites, creates JWTs). |
| **Frontend OAuth Callbacks** | `frontend/src/app/api/auth/{google,facebook}/callback/route.ts` | Exchanges OAuth code with backend, sets `token`, `refreshToken` (`lax`), and 300s `oauth_refresh_token` handoff cookie. |
| **Frontend Callback** | `frontend/src/app/(auth)/login/callback/page.tsx` | Hydrates auth state (`qefas_access_token` & `qefas_refresh_token`), checks onboarding status, handles redirection. |
| **Frontend API Client** | `frontend/src/lib/api/client.ts` | Sends `qefas_refresh_token` in `/auth/refresh` body when cross-origin `refreshToken` cookie is unavailable; prioritizes cookie on `/login/callback`. |
| **Frontend Onboarding** | `frontend/src/app/onboarding/page.tsx` | Guided welcome tour for new roles. |
| **Mobile Auth Hook** | `Mobile/lib/api/hooks/useAuth.ts` | Handles mobile social token handoff. |

---

## 4. Recent Updates (Friday, November 13, 2026)
- **Session Persistence Across OAuth Redirect & Cross-Origin Token Refresh**:
  - `useAuthStore.initialize()` in `frontend/src/app/(auth)/login/services/auth-store.ts` no longer deletes `Cookies.get("token")` while unauthenticated so `AppInitializer` does not wipe freshly issued OAuth cookies before `GoogleAuthCallback` mounts.
  - `google-auth.controller.ts` calls `invalidateSessionCache(user.id)` and sets `sameSite: "lax"` on `refreshToken`.
  - Next.js `/api/auth/google/callback` and `/api/auth/facebook/callback` pass a 300-second `oauth_refresh_token` handoff cookie consumed by `/login/callback` and `useAuthStore.setAuth()` to store `qefas_refresh_token` in `localStorage`, which `executeRefreshToken()` in `client.ts` sends in the `POST /auth/refresh` body when cross-origin cookies are unavailable.
  - `facebook/callback/route.ts` now forwards `user-agent` and `x-forwarded-for` to match `google/callback/route.ts`.
