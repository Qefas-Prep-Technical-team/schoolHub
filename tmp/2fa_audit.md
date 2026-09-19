# 2FA Flow Audit Report

Full trace of every step in the Two-Factor Authentication flow — turning on, logging in, and turning off.

---

## ✅ Turn ON Flow

| Step | What happens | Status |
|---|---|---|
| User toggles the Switch ON | `handleToggle(true)` opens the QR dialog and calls `generate2FA` | ✅ Correct |
| Backend generates secret | `speakeasy.generateSecret()` with `name: "Qefas Hub (user@email.com)"` and `issuer: "Qefas Hub"` | ✅ Authenticator apps **will show "Qefas Hub"** and the user's email |
| Secret saved temporarily | Stored in `admin.twoFactorSecret` (DB) before verification | ✅ Correct |
| QR code displayed | `QRCode.toDataURL(secret.otpauth_url)` rendered as a base64 image | ✅ Correct |
| Manual entry code shown | `secret.base32` displayed in the modal for manual entry | ✅ Correct |
| User enters 6-digit code | `verify2FA` called with `code` | ✅ Correct |
| Backend verifies | `speakeasy.totp.verify()` — validates the code against the stored secret | ✅ Correct |
| 2FA marked active | `isTwoFactorEnabled: true` saved to DB | ✅ Correct |
| Auth store updated | `onUpdate(true)` calls `updateUser({ require2FA: true, isTwoFactorEnabled: true })` | ✅ Correct |

---

## ✅ Login WITH 2FA Flow

| Step | What happens | Status |
|---|---|---|
| User logs in with email/password | Backend finds user, validates password | ✅ Correct |
| 2FA intercept fires | `if (user.isTwoFactorEnabled)` — backend issues a short-lived `tempToken` (10 min expiry) instead of a full session | ✅ Secure |
| Backend returns `require2FA: true` | Response includes `{ require2FA: true, tempToken }` | ✅ Correct |
| Frontend detects this | `if (response.require2FA)` in `useLoginMutation` calls `setPending2FA()` | ✅ Correct |
| Pending 2FA state set | User stored in store with `isAuthenticated: false` — user cannot access dashboard | ✅ Secure |
| Login page shows TwoFactorForm | `user?.require2FA ? <TwoFactorForm /> : <LoginForm />` | ✅ Correct |
| User submits their code | `useLogin2FAMutation` calls `authAPI.login2FA({ tempToken, code })` | ✅ Correct |
| Backend verifies code | Validates TOTP against stored secret | ✅ Secure |
| Full session issued | Access token + refresh token set as HttpOnly cookies | ✅ Secure |
| User redirected to dashboard | `setAuth()` called, user redirected | ✅ Correct |

---

## ✅ Turn OFF Flow

| Step | What happens | Status |
|---|---|---|
| User toggles Switch OFF | `handleToggle(false)` opens the danger confirmation dialog | ✅ Correct |
| User must type "DISABLE" | Confirm button disabled until `disableConfirmation === 'DISABLE'` | ✅ Secure |
| Backend disables 2FA | Sets `isTwoFactorEnabled: false` AND **nulls out `twoFactorSecret`** | ✅ Secure (secret destroyed) |
| Audit log written | Creates `SecurityAuditLog` with `userId`, `userRole`, `action: "2FA_DISABLED"`, `deviceModel`, `osVersion`, `ipAddress`, and a timestamp | ✅ Complete audit trail |
| Auth store updated | `onUpdate(false)` → `updateUser({ require2FA: false, isTwoFactorEnabled: false })` | ✅ Correct |

---

## ✅ Page Refresh Persistence

| Check | Result |
|---|---|
| `/auth/me` returns `require2FA: user.isTwoFactorEnabled` | ✅ Yes — fixed, returns value from DB |
| `/auth/login` returns `require2FA` | ✅ Yes |
| `/auth/login2FA` returns `require2FA` | ✅ Yes |
| `normalizeUser()` in auth-store normalizes both field names | ✅ Yes — `require2FA` and `isTwoFactorEnabled` always in sync |

---

## 🔐 Security Assessment

| Concern | Assessment |
|---|---|
| `tempToken` for 2FA login has a short expiry | ✅ 10 minutes — good |
| Full session token NOT issued before 2FA verification | ✅ `isAuthenticated: false` during pending 2FA |
| TOTP secret wiped on disable | ✅ `twoFactorSecret: null` — cannot be reused |
| All 2FA routes require `authenticateToken` middleware | ✅ Protected |
| Disable confirmation requires typing "DISABLE" | ✅ Prevents accidental disabling |
| Audit log captures device, IP, timestamp on disable | ✅ Full forensic record |

---

## ⚠️ One Minor Note

The `normalizeUser` function is defined at the **end** of `auth-store.ts` (line 193) but called from functions above (line 105). This works in TypeScript/JavaScript because `const` + arrow functions are **not hoisted**, but since `normalizeUser` is a module-level `const` and the functions that call it are methods of an object created with `create()`, they are all resolved at runtime — not at parse time. **This is safe**, but it's worth knowing.

---

## Summary

The full 2FA flow is **correctly implemented and secure**. Authenticator apps will correctly display **"Qefas Hub"** as the service name and the user's **email address** as the account identifier.

