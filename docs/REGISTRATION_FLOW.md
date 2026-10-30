# Registration, Verification & Onboarding Architecture

> **Subsystem**: User Registration (Dual-Flow: Social OAuth & Email/Password), Account Activation (OTP Verification), Location/Device Detection, and Onboarding Tour Redirection.  
> **Primary References**: [`AUTH_STATE.md`](../AUTH_STATE.md), [`docs/SOCIAL_LOGIN_AND_ONBOARDING.md`](SOCIAL_LOGIN_AND_ONBOARDING.md), [`docs/LINKING_ARCHITECTURE.md`](LINKING_ARCHITECTURE.md).

---

## 1. Architectural Overview & Invariants

Qefas Hub supports two primary entry channels for user registration across roles (`STUDENT`, `TEACHER`, `PARENT`, `ADMIN`):

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                    REGISTRATION ENTRY                       │
                               │        (/signup/[role] or /login with mode=signup)          │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                              ┌───────────────────────────────┴──────────────────────────────┐
                              │                                                              │
                              ▼                                                              ▼
             ┌───────────────────────────────────┐                         ┌───────────────────────────────────┐
             │       SOCIAL OAUTH (Google)       │                         │       EMAIL & PASSWORD FORM       │
             └────────────────┬──────────────────┘                         └─────────────────┬─────────────────┘
                              │                                                              │
                              ▼                                                              ▼
             ┌───────────────────────────────────┐                         ┌───────────────────────────────────┐
             │ Browser Native Geolocation Prompt │                         │ Backend creates account:          │
             │ (`navigator.geolocation`)         │                         │ `verified: false`                 │
             │ NO custom modal popup             │                         └─────────────────┬─────────────────┘
             └────────────────┬──────────────────┘                                           │
                              │                                                              ▼
                              ▼                                            ┌───────────────────────────────────┐
             │ Redirect: `/api/auth/google`      │                         │ Redirect: `/verification`         │
             │ Round-trip with Google OAuth      │                         │ with `requestCode=true`           │
             └────────────────┬──────────────────┘                         └─────────────────┬─────────────────┘
                              │                                                              │
                              ▼                                                              ▼
             ┌───────────────────────────────────┐                         ┌───────────────────────────────────┐
             │ Callback: `/login/callback`       │                         │ 6-digit OTP code dispatched       │
             │ Backend creates/finds user        │                         │ User enters code on 6-box input   │
             │ Auto-verified by Google           │                         └─────────────────┬─────────────────┘
             └────────────────┬──────────────────┘                                           │
                              │                                                              ▼
                              │                                            ┌───────────────────────────────────┐
                              │                                            │ Backend verifies OTP:             │
                              │                                            │ Sets `verified: true`, returns    │
                              │                                            │ JWT tokens + session row          │
                              │                                            └─────────────────┬─────────────────┘
                              │                                                              │
                              └───────────────────────────────┬──────────────────────────────┘
                                                              │
                                                              ▼
                                             ┌───────────────────────────────────┐
                                             │     ONBOARDING TOUR REDIRECTION   │
                                             │  `/onboarding?type=[role]`        │
                                             │  `&redirect=[pendingTarget]`      │
                                             └───────────────────────────────────┘
```

---

## 2. Dual Registration Flows

### 2.1 Flow A: Email & Password with OTP Verification

1. **Form Submission**:
   - The user fills out their full name, email, password, confirm password, and optionally invitation codes (`schoolCode`, `classCode`, `teacherCode`, `parentCode`).
   - The frontend validates inputs using Yup schema and submits to `/api/v1/auth/register/[role]`.
   - The backend creates the user record with `verified: false`.
2. **Handoff to Verification**:
   - On response success, the frontend redirects to:
     ```
     /verification?email={encodedEmail}&userType={ROLE}&requestCode=true{&redirect=...}
     ```
   - If an invitation link or join code redirect was present in the query string (`redirect=/join/...`), it is preserved in the URL query string.
3. **OTP Dispatch**:
   - `VerificationCard` mounts, detects `requestCode=true`, calls `/api/v1/auth/request-code`, and cleans up the URL query param to prevent redundant resends on page refresh.
   - The backend generates a 6-digit cryptographic code, hashes it into the database with a 15-minute expiration, and delivers it via email.
4. **Verification & Activation**:
   - The user enters the 6 digits in `CodeInputGroup`.
   - When complete, the form triggers `/api/v1/auth/verify-code`.
   - The backend validates the code, marks `verified: true`, generates access and refresh tokens, writes the `RefreshToken` session row, and returns the authenticated session.
5. **Store Session & Onboarding Landing**:
   - The frontend calls `useAuthStore.getState().setAuth(user, token)`.
   - It sets `hasCompletedOnboarding: false` for newly registered users.
   - It redirects the user to:
     ```
     /onboarding?type={role}&redirect={encodedPendingRedirect}
     ```
   - If the user was an unlinked School Admin without a subscription, they are directed to `/select-plan`.

---

### 2.2 Flow B: Social Registration (Google OAuth)

1. **Native Browser Permission (Zero Custom Popups)**:
   - When the user clicks **Continue with Google** (either in `SocialAuthRow` or `GoogleLoginButton`), the application **does NOT show an in-app popup modal**.
   - Instead, the app directly invokes `requestDeviceLocationPermission()`, which triggers the browser's native Geolocation permission banner (`navigator.geolocation.getCurrentPosition`).
   - If the user grants or denies permission, the result is saved to `localStorage` (`qefas_location_granted`).
   - Timezone location (`getTimezoneLocation()`) and device hints (`getClientDeviceInfo()`) are collected silently as fallbacks.
2. **OAuth Round-Trip**:
   - Browser navigates to `/api/auth/google` with detected device cookies (`google_device_location`, `google_device_model`, `google_device_type`, `google_os_version`, etc.) and URL parameters (`role`, `loc`, `locPerm`, `deviceModel`, `redirect`).
   - User authenticates on Google's consent screen.
3. **Callback Processing**:
   - Google redirects to `/login/callback`.
   - The backend verifies Google identity and checks whether a user with this email exists.
   - For a new user:
     - The backend creates the account with `verified: true` (Google verified email).
     - It creates the `RefreshToken` session row with the device model and location captured from cookies.
     - The callback router detects `isNewUser: true` and forwards the user to:
       ```
       /onboarding?type={role}&redirect={encodedPendingRedirect}
       ```

---

## 3. Native Device & Location Permission Rules

### Strict Invariant: No Custom Permission Popups
Prior versions of the web frontend displayed an artificial React dialog (`GoogleAuthConsentModal`) explaining location access before prompting the browser. This created double prompts and degraded conversion rates.

**Current Invariant**:
- When requesting location and device information during registration or sign-in:
  1. Trigger **only the browser's native permission prompt** (`navigator.geolocation.getCurrentPosition`).
  2. If permission is denied or timed out, gracefully fall back to the client's system timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone` mapped to City, Country).
  3. No custom intermediary modal or alert is rendered.

```ts
// frontend/src/app/(auth)/login/components/SocialAuthRow.tsx
const handleGoogleClick = () => {
  // Directly triggers native browser prompt without any custom popup
  handleProceed(true);
};
```

---

## 4. Component Architecture & Decomposition

In compliance with the **Modular Component Architecture** and the `<300` line threshold rule, large monolithic auth files are split into small, reusable components:

### Student Signup Architecture
- `StudentCard.tsx` ($\approx 210$ lines): Top-level orchestrator holding React Hook Form state, query param synchronization, and modal controls.
- `StudentFormHeader.tsx` ($\approx 40$ lines): Header branding, logo, and sign-in toggle link.
- `StudentRegistrationForm.tsx` ($\approx 210$ lines): Input fields, password visibility toggles, optional invitation code accordion, terms checkbox, submit button, and `SocialAuthRow`.
- `StudentAuthStatus.tsx` ($\approx 160$ lines): Displays active session details, invitation code linking actions, or role mismatch notifications.
- `StudentVisualPanel.tsx` ($\approx 150$ lines): Visual side-panel displaying 3D hero artwork, feature rotation cards, and trust metric badges.
- `StudentModals.tsx` ($\approx 100$ lines): Accessible terms of service and privacy policy modals.
- `StudentFormFields.tsx` ($\approx 60$ lines): Reusable input classes, error field wrappers, eye button toggles, and design tokens.

---

## 5. Onboarding Navigation & Session Retention Architecture

### 5.1 Root Cause Analysis: The Premature "Bounced to Login / Dashboard" Bug
Previously, when users finished registration or OTP verification and navigated to `/onboarding?type={role}`, two race conditions frequently ejected them:

1. **Premature Client-Side `router.replace('/login')`**:
   - In `OnboardingContent` (`(auth)/onboarding/page.tsx`), an authentication `useEffect` ran synchronously before Zustand's persisted state (`isInitialized`) finished hydrating from `localStorage`.
   - Because `isAuthenticated` and `user` evaluated to `false`/`null` during initial mount tick, the component triggered `router.replace('/login')`.
   - **Resolution**: Guard the effect with `if (!isInitialized) return;` so auth checks wait until store hydration is complete.

2. **Auth Route Guard Collision in `useProtectedRoute` & `AuthLayout`**:
   - Routes under `(auth)` (such as `/login`, `/signup`, and `/onboarding`) share the `AuthLayout` wrapper.
   - `AuthLayout` invoked `useProtectedRoute({ requireAuth: false, redirectTo: ... })`.
   - When an authenticated user landed on `/onboarding`, `useProtectedRoute` saw `!requireAuth && isAuthenticated` and forcibly redirected them to `/dashboard` before they could see the onboarding slides.
   - If `hasCompletedOnboarding: false`, `AuthLayout` computed `redirectTo = /onboarding?type=...`, causing an internal redirect ping-pong between `AuthLayout` and `useProtectedRoute`.
   - **Resolution**:
     - In `useProtectedRoute.ts`: When `pathname === "/onboarding"` or `search.get("revisit") === "true"`, `isChecking` is set to `false` and the user is permitted to stay on onboarding.
     - In `useProtectedRoute.ts`: Added support for the custom `redirectTo` prop instead of unilaterally hardcoding `/dashboard`.
     - In `(auth)/layout.tsx`: If the user is already on `/onboarding`, `redirectTo` returns empty string `""` to prevent circular redirect loops.

```ts
// frontend/src/hooks/useProtectedRoute.ts
// If user is authenticated on a non-auth required route (e.g. onboarding)
if (!requireAuth && isAuthenticated) {
  // Allow user to remain on /onboarding
  if (pathname === "/onboarding") {
    setIsChecking(false);
    return;
  }
  // Allow explicit revisit of onboarding
  if (typeof window !== 'undefined') {
    const search = new URLSearchParams(window.location.search);
    if (search.get("revisit") === "true") {
      setIsChecking(false);
      return;
    }
  }
  // Honor custom redirectTo from layout if provided
  if (redirectTo) {
    router.replace(redirectTo);
    return;
  }
  const dashPath = user?.userType ? `/dashboard/${user.userType.toLowerCase().replace('_', '-')}` : "/dashboard";
  router.replace(dashPath);
  return;
}
```

### 5.2 Transition to Dashboard Post-Onboarding
Once the user finishes the onboarding slides or clicks **"Skip Tour & Go to Dashboard"**:
1. `useAuthStore.getState().setHasCompletedOnboarding(true)` marks onboarding as finished.
2. If an invite link redirect (`redirect=/join/...`) exists, the user is immediately forwarded to that target.
3. Otherwise, the router pushes the user to their designated dashboard (`/dashboard/admin`, `/dashboard/teacher`, `/dashboard/student`, or `/dashboard/parent`).

---

---

## 6. Separation of Device Verification vs Email Verification

To ensure clean routing, explicit error recovery, and proper onboarding tracking, **Device Authorization** and **Email Activation** are separated into two dedicated components coordinated by a central dispatcher:

### 6.1 Architecture & Separation Matrix

| Feature | Email Verification (`EmailVerificationCard.tsx`) | Device Verification (`DeviceVerificationCard.tsx`) |
|---|---|---|
| **Trigger Origin** | New user sign-up via Email & Password | Sign-in from an unrecognized browser/device or revoked device session (`403 Forbidden`) |
| **Identification Flags** | Initial registration URL param (`/verification?email=...&userType=...`) | `sessionStorage.getItem('preAuthToken')` OR URL param (`reason=device` or `isDevice=true`) |
| **OTP Request Type** | `requestCode({ email, userType, isDeviceVerification: false })` | `requestCode({ email, userType, isDeviceVerification: true })` |
| **Headline & Copy** | *"Verify Your Email"* — "Enter the 6-digit confirmation code to activate your account." | *"Verify New Device"* — "We detected an unrecognized device or login location. Enter the code to authorize this session." |
| **Onboarding Flag** | `setHasCompletedOnboarding(false)` — Brand new accounts must go through onboarding | `setHasCompletedOnboarding(true)` — Existing accounts skip onboarding |
| **Post-Verification Destination** | Directs user to `/select-plan` (unpaid admin) or `/onboarding?type={role}` | Directs user immediately to `/dashboard/{role}` or honors any pending `/join/...` redirect |

### 6.2 The Dispatcher Pattern
[`VerificationCard.tsx`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/verification/components/VerificationCard.tsx) serves as a thin router:
```tsx
export default function VerificationCard() {
  const searchParams = useSearchParams();
  const reasonParam = searchParams.get('reason');

  const isDeviceCheck =
    reasonParam === 'device' ||
    searchParams.get('isDevice') === 'true' ||
    (typeof window !== 'undefined' && Boolean(sessionStorage.getItem('preAuthToken')));

  if (isDeviceCheck) {
    return <DeviceVerificationCard />;
  }

  return <EmailVerificationCard />;
}
```

---

## 7. Verification Checklist

- [x] Dual registration paths (Social OAuth vs Email/Password + OTP) documented.
- [x] Email/Password flow strictly enforces 6-digit OTP verification before account activation.
- [x] Both flows cleanly land on `/onboarding?type={role}` with any pending `redirect` preserved.
- [x] Removed custom permission modals (`GoogleAuthConsentModal`); permissions use native browser prompt.
- [x] All decomposed files remain well under the 300-line limit.
- [x] Fixed premature redirect to `/login` by waiting for `isInitialized` store hydration in `OnboardingContent`.
- [x] Fixed premature redirect to `/dashboard` in `useProtectedRoute` and circular redirect in `(auth)/layout.tsx`.
- [x] Separated `DeviceVerificationCard` from `EmailVerificationCard` with dedicated routing, distinct UI copy, and decoupled onboarding behavior.
- [x] Ensured `verifyEmailCode` issues a database-backed `refreshToken` session row alongside `accessToken` to eliminate post-verification `401 NO_SESSION_ROW` session drops.

---

## 8. Post-Verification Session Persistence (NO_SESSION_ROW Prevention)

When an OTP is verified at `/api/auth/verify-code`, the backend issues:
1. `accessToken` (HTTP-only cookie `token` + response JSON).
2. `refreshToken` (HTTP-only cookie `refreshToken` + response JSON) and persists an active session row in the database via `generateRefreshToken(userId, userType, deviceInfo)`.
3. `deviceVerified` (HTTP-only cookie).

Without Step 2, subsequent authenticated API calls fail `authMiddleware`'s active session validation check (`activeSession = prisma.refreshToken.findFirst(...)`), causing immediate `401 NO_SESSION_ROW` and client logout. Generating both tokens upon verification guarantees session validity across all roles.
