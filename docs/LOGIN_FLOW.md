# Authentication & Device Verification Architecture (`LOGIN_FLOW.md`)

> **Subsystem**: Authentication, Social Login (Google OAuth), Password Login, Trusted Device Cookies, and Device Security Verification.  
> **Primary References**: [`AUTH_STATE.md`](../AUTH_STATE.md), [`docs/REGISTRATION_FLOW.md`](REGISTRATION_FLOW.md), [`docs/SOCIAL_LOGIN_AND_ONBOARDING.md`](SOCIAL_LOGIN_AND_ONBOARDING.md).

---

## 1. Overview of Login Methods

Qefas Hub supports two primary authentication channels across all user roles (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `STAFF`):

1. **Email & Password Authentication**:
   - Primary credential sign-in via dedicated role portal (`/login/school-admin`, `/login/teacher`, `/login/student`, `/login/parent`).
   - Validates credentials using bcrypt against Prisma models.
   - Enforces device verification rules and role portal matching (`WRONG_PORTAL` guard).
2. **Google OAuth (SSO)**:
   - One-click Google sign-in available on all portals via `SocialAuthRow.tsx` / `GoogleLoginButton.tsx`.
   - Handled via Next.js OAuth bridge (`/api/auth/google`) and verified at backend `/auth/google`.
   - Automatically provisions missing profile links and passes role verification.

---

## 2. Trusted Device Architecture & Invariants

```
                             User Sign-In (Email/Password or Google)
                                                │
                                                ▼
                                   Is device already trusted?
                                  • Valid `deviceVerified` cookie
                                  • Mobile app client header
                                  • Prior active session on same hardware/OS
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
                     YES                                                NO
          Direct Session Issuance                         Is Google SSO or Email/Password?
        • Set 365-day device cookie                                      │
        • Issue access & refresh tokens            ┌─────────────────────┴─────────────────────┐
        • Route to Dashboard                      ▼                                           ▼
                                              Google SSO                               Email & Password
                                     • Native browser prompts for              • Backend issues `preAuthToken`
                                       location permission                     • 403 `requiresVerification`
                                     • Fallback to system timezone             • Redirect to `/verification?reason=device`
                                     • Transparent login + notify user         • User enters 6-digit email OTP
                                                                               • Verified 365-day cookie issued
```

### 2.1 The Trusted Device Invariant: Never Re-verify a Known Device
A device is deemed **trusted** if **any** of the following criteria are met:
1. **Valid Persistent Cookie (`deviceVerified`)**: The browser holds a non-expired, JWT-signed `deviceVerified` cookie matching `userId`. Valid for 365 days.
2. **Mobile App Client**: Requests originating from the native Expo mobile app (`x-device-type: mobile`).
3. **Database Hardware Match**: The user has an existing, active session row in `RefreshToken` matching the exact `deviceModel` and `osVersion`.
4. **Valid Pre-Auth Token**: The user just completed 6-digit OTP verification and presents a signed `preAuthToken`.

When a device is verified once, `setDeviceVerifiedCookie(res, userId, deviceInfo.deviceModel)` installs a 365-day HttpOnly cookie, guaranteeing the user is **never asked to verify the same device again**.

---

## 3. Login Pathways Detailed

### 3.1 Email and Password Sign-In Flow
1. **User enters email and password** on the role login page.
2. **Client-side location query**:
   - `useLoginMutation` requests browser geolocation via `requestDeviceLocationPermission()`.
   - If granted, attaches `x-location-permission: granted` and client geolocation headers.
   - If dismissed/denied, transparently falls back to system timezone (`x-client-timezone`).
3. **Backend Credential Validation**:
   - Compares password hash via `bcrypt.compare`.
   - Checks role invariants (e.g. non-owner admins blocked if school subscription expired).
4. **Trusted Device Evaluation**:
   - If **trusted** (cookie, mobile, or DB hardware match):
     - Issues session tokens (`token`, `refreshToken`).
     - Issues/refreshes 365-day `deviceVerified` cookie.
     - Dispatches new device security alert email **only** if it's the very first time this hardware has connected.
     - Navigates immediately to `/dashboard/{role}`.
   - If **unrecognized**:
     - Issues 15-minute `preAuthToken` with `{ userId, userType }`.
     - Returns HTTP `403` with `{ requiresVerification: true, preAuthToken }`.
     - Frontend intercepts 403, saves `preAuthToken` in `sessionStorage`, and routes to:
       ```
       /verification?email={email}&userType={userType}&requestCode=true&reason=device
       ```
     - User enters the 6-digit email verification code via `DeviceVerificationCard.tsx`.
     - Verification endpoint validates OTP, marks device verified, sets `deviceVerified` cookie, and logs in.

---

### 3.2 Google OAuth (SSO) Flow
1. **User clicks Google button** on any portal.
2. **Native browser permission**:
   - Browser asks for native location permission; gracefully defaults to system timezone if denied (zero custom popup blockers).
   - Sets temporary client hint cookies (`google_device_location`, `google_device_type`, `google_device_model`).
3. **Google Consent Screen**:
   - User approves authentication on `accounts.google.com`.
4. **Callback & Backend Exchange**:
   - `/api/auth/google/callback` receives OAuth credentials and calls `/auth/google`.
   - Extracts hardware profile and location data.
   - Performs portal role verification (`WRONG_PORTAL` prevention).
   - If unrecognized device, dispatches security email and in-app alert via `processNewDeviceLogin`.
   - Sets 365-day `deviceVerified` cookie.
   - Completes authentication and redirects user directly to their role dashboard.

---

## 4. Security & Audit Logging
- **New Device Alert Email**: Whenever an unrecognized device is added, `sendNewDeviceLoginEmail` dispatches an email alerting the user with timestamp, device model, and location/IP.
- **In-App High Priority Notification**: `createNotification` records a high-priority `New Device Login Detected` in the user's notification center.
- **Session & Device Revocation**:
  - When a user revokes a session from their settings (`/dashboard/{role}/sessions` or `DeviceSessions.tsx`), the backend `revokeUserSession` handler marks the `RefreshToken` row `isValid: false`.
  - In addition, if the revoked session belongs to the current browser/device, the server explicitly clears the `token`, `refreshToken`, and calls `clearDeviceVerifiedCookie(res)` to wipe the `deviceVerified` cookie.
  - Future login attempts from this hardware/browser will no longer find a valid cookie or active DB session, guaranteeing the device is **no longer trusted** and requiring full security verification before access is granted again.
