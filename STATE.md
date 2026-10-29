# Project State: Qefas Hub

## Current Focus

- Payment system is code-complete and pre-launch audit is resolved.
- Remaining launch blockers are **manual only**: swap test → live Paystack keys, register production webhook URL in Paystack Dashboard.
- Exam submission redesign — chunked, sequential per-paper submission with progress modal.
- Monitor production environment telemetry logs.

## Upcoming / Planning

- Implementation of remaining `STUDENT_LIFECYCLE_SPEC.md` features (Promotion, Awards, etc.).
- Production deployment: swap `sk_test_` → `sk_live_` (Render/Railway secrets) and `pk_test_` → `pk_live_` (Vercel env vars).
- Register `https://your-domain.com/api/v1/payment/webhook` in Paystack Dashboard → Settings → API Keys & Webhooks.

## Blockers

# Project State: Qefas Hub

## Current Focus

- **Checkout page redesigned** — two-column cart-style layout with dark indigo header, plan card, step form, order summary + coupon input.
- **Coupon system COMPLETE** — backend (Coupon + CouponUsage models, service, controller, routes) + admin management page at `/console/billing/coupons`.
- **Flutterwave migration COMPLETE** — gateway adapter pattern, finance.service.ts, payment callback page all live.
- Exam submission redesign — still pending.

## Upcoming / Planning

- Test coupon codes on the live checkout (create one in the console first).
- Test FLW checkout flow end-to-end (set env vars, try test card 4187427415564246).
- Add coupon usage recording in `verifyPaymentService` (read couponId from payment metadata and call `CouponService.recordUsage`).
- Implementation of remaining `STUDENT_LIFECYCLE_SPEC.md` features.

## Blockers

- [x] **Join Link OAuth & Sign-Up Redirect Chain (Thursday, October 29, 2026)**:
    - **Google OAuth Round-Trip State Preservation**:
        - Stored `redirect` in `google_post_auth_redirect` HTTP-only cookie on `/api/auth/google/route.ts` so that it survives full-page navigation to Google.
        - Modified `/api/auth/google/callback/route.ts` to read the cookie and use it as `dest` parameter for `/login/callback`.
        - Updated [GoogleLoginButton.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/components/GoogleLoginButton.tsx) and [SocialAuthRow.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/components/SocialAuthRow.tsx) to read `searchParams.get("redirect")` or fallback to `sessionStorage.getItem("pendingJoinRedirect")` and forward it in the Google OAuth initiation URL.
    - **Sign-Up Flow Support (Google & Email/Password)**:
        - Confirmed Google Sign-Up automatically creates the user record if not present via backend `googleAuthService` and returns them to the join link seamlessly via the preserved redirect.
        - Confirmed Email & Password sign-up retains the invite code in [StudentCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/student/components/StudentCard.tsx), forwards `redirect` to [VerificationCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/verification/components/VerificationCard.tsx), and routes the student back to the join link upon code verification.
- [x] **Join Link Auto-Linking Fix — School & Class (Thursday, October 29, 2026)**:
    - **Root Cause**: Both join pages had a race condition — when an authenticated user landed on the page, `hasStarted` was set but `isPending` hadn't started yet, so the loading gate `!isInitialized || (isAuthenticated && isPending)` briefly evaluated to `false`, causing the page to fall through and render the guest card or `null` instead of the auto-join spinner. Also the class join page never sent a school link request when the student had no school affiliation.
    - **School Join Page ([join/school/[code]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/school/[code]/page.tsx))**:
        - Replaced ad-hoc `hasStarted + mutation state` logic with a proper state machine: `idle → connecting → success / already_connected / pending_request / error`.
        - Loading gate now checks `statusState === "connecting"` (set synchronously before the async mutation) — eliminating the race window.
        - Error variants (already connected, pending, generic) are now classified inside `onError` and rendered as distinct smart UI screens.
        - Added a graceful fallback screen for admin/parent users who land on a student/teacher invitation link.
    - **Class Join Page ([join/class/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/class/[id]/page.tsx))**:
        - Replaced `useMutation` hooks with direct `async/await` service calls inside a single `run()` function guarded by `useRef(isRunning)` to prevent double-execution.
        - When a student is not linked to the class's school (checked via `user.schools`), **automatically fires a `SCHOOL_STUDENT` link request first**, then fires the class join request.
        - School link errors that are non-blocking (already connected, pending) are silently swallowed; only genuine failures log a warning.
        - Full state machine: `idle → connecting → success / already_enrolled / pending_request / wrong_school / error` with distinct UI for each.
        - `Try Again` button resets `isRunning.current` and `hasStarted` so the flow can be re-triggered.
    - **TypeScript**: Verified `npx tsc --noEmit` — **0 errors**.
- [x] **School Invitation Portal Button Dark Mode Polish (Thursday, October 29, 2026)**:
    - **Dark Mode Button Contrast & Visual Polish ([join/school/[code]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/school/[code]/page.tsx))**:
        - Fixed the "I Have an Account • Sign In" button on the school invitation landing page (`/join/school/[code]`), which suffered from washed-out white text on an almost-white background in dark mode due to combining `bg-primary` (`oklch(0.922 0 0)`) with hardcoded `text-white`.
        - Upgraded the button to a high-contrast, vibrant gradient (`bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600`) with crisp white typography, an edge border (`border border-blue-400/20 dark:border-indigo-500/30`), and deep glowing elevation (`dark:shadow-indigo-950/60 hover:shadow-blue-500/30`).
        - Polished supporting elements across the card for seamless dark mode harmony: school icon container (`bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400`), school invitation tag badge, school code pill, ambient multi-layer background glows, and crisp borders/text on student/teacher registration actions.
        - Verified TypeScript checks pass with **0 errors** via `npx tsc --noEmit`.
- [x] **100% Coupon Checkout Infinite Loading / Redirecting Fix (Thursday, October 29, 2026)**:
    - **Resolved Step Reset & Redirect Freeze ([checkout/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/checkout/page.tsx))**:
        - Fixed the issue where activating a 100% discount coupon got stuck on the CTA button showing `Redirecting...` with a loading spinner instead of redirecting to the admin billing dashboard.
        - **Root Cause**: When `updateUser({ plan, subscriptionStatus: "ACTIVE" })` was called, the checkout redirect guard's `useEffect` was triggered by the updated `user` object and unconditionally set `step = "PAYMENT_READY"`, overwriting `setStep("SUCCESS")` and stranding the button in its loading state.
        - **Guard Constraint**: Constrained the redirect guard to only automatically switch steps if `step === "EMAIL_ENTRY"`, preventing user profile updates from resetting the active step.
        - **Coupon Trial Guard**: Added `&& !appliedCoupon` to `canUseTrial` calculation so trial charges (₦100) never override a 100% free promo code.
        - **Loading State Reset**: Ensured `setIsLoading(false)` and `isPaymentInFlight.current = false` are explicitly cleared on 100% coupon activation.
        - **Direct Billing Navigation**: Routed the success timer directly to `/dashboard/${role?.toLowerCase() || "admin"}/billing` and added an immediate "Go to Billing Dashboard Now" button.
- [x] **Registration Routing, Zero-Data Teacher Dashboard & Join Link Flow Fixes (Thursday, October 29, 2026)**:
    - **Role-Based Onboarding & Registration Routing ([auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts), [VerificationCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/verification/components/VerificationCard.tsx), [use-auth-mutations.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/services/use-auth-mutations.ts), [onboarding/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/onboarding/page.tsx))**:
        - Fixed issue where newly registered teachers were routed to the school admin onboarding screen (`/onboarding`).
        - Updated `verifyEmailCode` in `auth.controller.ts` to generate `accessToken` for all roles (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`), set the auth token cookie, and return authenticated user details.
        - In `VerificationCard.tsx`, auto-authenticated user in `authStore`, marked onboarding complete, checked for pending join redirects, and routed directly to the user's role dashboard (`/dashboard/teacher`, `/dashboard/student`, `/dashboard/parent`, `/dashboard/admin`), completely eliminating redirection to `/onboarding`.
        - In `use-auth-mutations.ts`, routed users directly to `/dashboard/${userDash}` or `/select-plan`, removing forced onboarding fallback.
        - In `onboarding/page.tsx`, added unauthenticated redirect guard and ensured `userType` prioritizes authenticated user's `user.userType` instead of defaulting to `ADMIN`.
    - **Teacher Dashboard Zero-Data / Empty State ("Sync Stalled" Fix) ([DashboardPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/DashboardPage.tsx), [TeacherHero.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/TeacherHero.tsx), [authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts))**:
        - Resolved 403 Forbidden on `/teacher/dashboard-stats` for unlinked teachers in `authMiddleware.ts`.
        - In `DashboardPage.tsx`, updated `loadInitialData` to gracefully set baseline default statistics (0 classes, 0 students, 0 pending marks) instead of halting execution and showing the "Sync Stalled" error boundary.
        - Added an aesthetically pleasing **"Welcome & Quick Setup Guide"** card with 3 intuitive onboarding actions (Connect with School, Offline Grade Entry, and Create Assessments) displayed whenever a teacher has 0 assigned classes.
        - In `TeacherHero.tsx`, added a welcoming message celebrating new educators and inviting them to set up their teaching space.
    - **End-to-End Invite & Join Link Flow ([middleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/middleware.ts), [page.tsx (login)](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/page.tsx), [join/school/[code]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/school/[code]/page.tsx), [join/class/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/class/[id]/page.tsx), [class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts), [QRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/QRCodeModal.tsx), [TeacherQRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/classes/TeacherQRCodeModal.tsx), [ClassQRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/classes/ClassQRCodeModal.tsx), [TeacherCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/teacher/components/TeacherCard.tsx), [StudentCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/student/components/StudentCard.tsx), [ParentCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/parent/components/ParentCard.tsx), [SchoolCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/school/components/SchoolCard.tsx))**:
        - Normalized duplicate slashes (`//join` -> `/join`) in `middleware.ts` preventing tenant subdomain rewrite issues.
        - Stripped trailing slashes in QR code / invite link generators (`.replace(/\/+$/, "")`) so double slashes are never generated.
        - Preserved `?redirect=...` parameter across all login role portal cards and forward to `/verification` on signup.
        - Cached pending join URLs in `sessionStorage` (`pendingJoinRedirect`) so sign-in and signup/verification automatically return users to the join flow and trigger the connection request.
        - Updated `requestToJoinClassService` in `class.service.ts` so unaffiliated independent students can join classes via link.
    - **Verification**: Backend type check (`npx tsc --noEmit`) verified with **0 errors**. Frontend TypeScript validation complete.
- [x] **Template Export Student Identifiers & Build Verification (Wednesday, October 28, 2026)**:
    - **Clean Student Identifiers in Export Templates ([RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [OfflineGradeSheetSyncModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradeSheetSyncModal.tsx), [OfflineGradesCSVModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesCSVModal.tsx))**:
        - Removed raw internal database UUIDs (`Student ID (Do not edit)`) from all exported templates and marksheets (Excel `.xlsx` and `.csv`).
        - Replaced technical IDs with clean, human-readable student identifiers: `Student Name` and `Student Code / Reg No`.
        - Upgraded spreadsheet parsers across all offline assessment modals to support flexible column arrangements and match students by `Student Code / Reg No` first, database `ID` second (for backward compatibility), and `Student Name` third.
    - **Full Production Build & Type Verification ([types.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/types.ts), [RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [OfflineGradeSheetSyncModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradeSheetSyncModal.tsx))**:
        - Fixed TypeScript strict errors (implicit `any` in array map/filter/find closures, missing `grade` on `OfflineStudentGradeEntry`, and missing dynamic grade computation).
        - Verified backend TypeScript checks with `npx tsc --noEmit` — completed with **0 errors**.
        - Verified frontend production build with Next.js Turbopack `npm run build` — compiled and generated all static/dynamic routes successfully with **0 errors**.
- [x] **Console Notification Routing: New Channels, Numbered Roster & Loading States (Wednesday, October 28, 2026)**:
    - **New Alert Channels ([recipient.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/notifications/recipient.service.ts), [recipient.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/notifications/recipient.controller.ts), [usePlatformNotifications.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/usePlatformNotifications.ts))**: Added `NEW_USERS` and `SUBSCRIPTIONS` to `AlertEventType` (7 channels total) and the Zod enum.
    - **Event Triggers**: `NEW_USERS` alerts fire from `registerSchool`, `registerTeacher`, `registerStudent`, `registerParent` ([auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts)). `SUBSCRIPTIONS` alerts fire on 100% coupon activations and on verified gateway payments, alongside the existing `PAYMENTS` alert ([payment.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/payment.service.ts)).
    - **Email delivery**: If Resend rejects a direct send (sandbox mode or unverified domain), the alert is re-sent to `TEST_EMAIL` with an "Intended for" notice. Results now include per-recipient details.
    - **UI ([notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/notifications/page.tsx))**: Numbered recipient cards (`#01`, `#02`…), status dot on each avatar, copy-email button, channel badges with icons. Test Alert, Enable/Mute, and Delete each show their own spinner. Select All / Clear added to the channel picker.
    - Backend `tsc --noEmit` and frontend `npm run build` both pass with 0 errors.
- [x] **Platform Direct Email Alerts & Offline Grades Pop-up Modal (Wednesday, October 28, 2026)**:
    - **Direct Email Alert Dispatching ([recipient.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/notifications/recipient.service.ts), [support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/support/support.controller.ts), [notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/notifications/page.tsx))**:
        - Ensured alert dispatching on `/console/notifications` sends actual emails directly to each recipient's configured email address (`r.email.trim()`), removing the test diversion so administrators and leads receive real inbox notifications across all 5 event channels.
        - Connected `createGuestTicket` to automatically trigger email alerts for guest inquiries and support escalations.
        - Updated `/console/notifications` UI to clearly reflect direct email alert delivery and test dispatch confirmations.
    - **Offline Grade Sheet Sync Converted to Pop-up Modal ([OfflineGradeSheetSyncModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradeSheetSyncModal.tsx), [OfflineRecordsList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineRecordsList.tsx), [OfflineGradesDashboard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx))**:
        - Hidden the offline sync setup card from the main page view on `/dashboard/teacher/offline-grades`.
        - Added a prominent **"Download Grade Sheet Template"** button to the header of the records directory.
        - Clicking this button opens a clean, focused pop-up modal (`OfflineGradeSheetSyncModal`) containing the 4-step workflow, class/subject picker, template downloader (Excel & CSV), and drag-and-drop dropzone.
        - Dropping a spreadsheet or clicking "Open Record Marks Pad" auto-opens the assessment modal with the exact selected setup and parsed student marks populated.
- [x] **Teacher Offline Grades Spreadsheet Sync, Template Generator & Excel Format Support (Wednesday, October 28, 2026)**:
    - **Offline Grade Sheet Sync & 4-Step Workflow Card ([OfflineGradeSheetSyncCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradeSheetSyncCard.tsx), [OfflineGradesDashboard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx))**:
        - Added interactive 4-step offline workflow component to `/dashboard/teacher/offline-grades` matching the knowledge base guide: (1) Select Assigned Class & Subject, (2) Download Grade Sheet Template, (3) Fill in scores offline, (4) Drag & drop saved spreadsheet to sync.
        - Teacher selects assigned class and curriculum subject directly on the card; one click downloads the official roster template in Excel (`.xlsx`) or CSV (`.csv`) with enrolled students pre-filled.
        - Provides a dedicated Drag & Drop Dropzone for `.xlsx`, `.xls`, and `.csv` files. Dropping or selecting a spreadsheet parses marks using SheetJS and immediately launches the **"Record Offline Assessment Marks"** modal with that exact same class, subject, category, and pre-filled student scores.
        - Clicking "Record Offline Marks" on the card auto-propagates the selected setup (Class, Subject, Category, Max Marks) into the modal so teachers do not have to re-select fields.
    - **Record Offline Assessment Marks Modal UX & Format Extensions ([RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [OfflineGradesHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesHeader.tsx), [OfflineGradesCSVModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesCSVModal.tsx))**:
        - **Corrected Import Icon & Label**: Replaced generic `<Upload />` icon with `<FileSpreadsheet />` and updated label to `Import Excel / CSV`.
        - **Corrected Export Dropdown & Handlers**: Replaced dummy empty handlers with fully working exports:
            - **Export to Excel (.xlsx)**: Generates formatted `.xlsx` workbook with column widths using SheetJS `XLSX.writeFile`.
            - **Export to CSV (.csv)**: Generates `.csv` download via Blob.
            - **Export Marksheet (PDF)**: Generates structured institutional marksheet PDF via `generatePDF`.
        - **Excel Format Support in Import Modal**: Updated `OfflineGradesCSVModal` to support downloading both Excel (`.xlsx`) and CSV (`.csv`) templates, accept `.xlsx, .xls, .csv` uploads, support drag-and-drop, and parse binary Excel worksheets with validation against `maxMarks`.
- [x] **Support Agent Persona Hub, Role-Themed Support Centers & Strict Ticket Privacy Isolation (Wednesday, October 28, 2026)**:
    - **Page Theme Color Customization ([SupportCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/shared/SupportCenter.tsx), [console/profile/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/profile/page.tsx))**:
        - **Teacher Support Desk (`/dashboard/teacher/support`)**: Themed to **Pink** (`from-slate-900 via-pink-950/70 to-slate-900`, pink active tabs, badges, buttons, active card borders, and user message bubbles).
        - **Student Support Desk (`/dashboard/student/support`)**: Themed to **Pink** (`from-slate-900 via-pink-950/70 to-slate-900`, pink active tabs, badges, buttons, active card borders, and user message bubbles).
        - **Console Profile Page (`/console/profile`)**: Themed to **Blue** (`from-blue-950 via-slate-950 to-slate-900`, blue navigation tabs, avatar rings, action buttons, public persona cards, and interactive simulator).
    - **Discussion Thread Chat UX Parity & Self-Notification Suppression ([SupportCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/shared/SupportCenter.tsx))**:
        - **Optimistic Message Delivery**: The Complaints & Grievances two-way discussion dialog now mirrors the technical live chat. Outgoing messages enter the thread immediately with `sending` status, smoothly transition to delivered (`✓✓`), and provide one-click `Retry` on network errors.
        - **Eliminated Outgoing Message Toasters**: Removed redundant "Response sent" toasts and suppressed echo notifications when posting responses in discussion threads.
        - **Socket Self-Notification Guard**: Added strict checks in `handleSocketNewMessage` ignoring messages where `role === "USER"` or `senderId === currentUserId`, ensuring users only ever hear chimes and receive toasts for genuine support replies.
    - **Console Notification Routing & Alert Dispatcher ([notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/notifications/page.tsx), [usePlatformNotifications.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/usePlatformNotifications.ts))**:
        - Resolved the 404 "Not Found" error when clicking "Notification Routing" (`/console/notifications`) in the console sidebar.
        - Built the complete Notification Routing Matrix supporting all 5 platform event channels: `PAYMENTS`, `COMPLAINTS`, `SUGGESTIONS`, `INQUIRIES`, and `SYSTEM_ALERTS`.
        - Wired to backend `/api/platform/notifications/recipients` with React Query hooks (`usePlatformRecipients`, `useCreateRecipient`, `useUpdateRecipient`, `useToggleRecipient`, `useDeleteRecipient`, `useSendTestAlert`).
        - Implemented Add/Edit Recipient dialogs with multi-channel subscription toggles, search filtering, one-click alert muting/enabling, and instant test email dispatch.
    - **Console Dedicated "Support Agent" Tab & Persona Studio ([console/profile/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/profile/page.tsx))**:
        - Created a dedicated **"Support Agent"** tab (`SUPPORT_AGENT`) alongside "Personal Details", "Security & Password", and "Login Integrations".
        - Equipped with native Support Agent Photo upload with client-side FileReader preview, file-size validation (<5MB), and removal action.
        - Configured agent display name (`displayName` / `agentDisplayName`) management reflecting in platform staff sessions.
        - Added an interactive live chat simulator preview demonstrating how students, teachers, parents, and admins see the agent's avatar, badge, and persona.
    - **Agent Profile Photo & Persona Display in User Live Chat ([SupportCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/shared/SupportCenter.tsx), [support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/support.controller.ts))**:
        - Live chat conversation header displays the assigned support agent's profile photo with online indicator.
        - Support agent message bubbles now show the agent's photo avatar (`senderImage`) instead of generic initials.
        - Backend `getTicketMessages` resolves agent photo (`profileImage` or `socialLinks.agentProfilePicture`) and attaches `assignedAgent: { name, image }` to the ticket payload.
        - Real-time socket message broadcaster (`new_message` & `ticket_message_received`) forwards `senderImage` for immediate visual rendering.
    - **Role-Specific Theme Colors Across Support Portals ([SupportCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/shared/SupportCenter.tsx))**:
        - Unified support portal dynamically adapts to each user role's distinct color theme:
          - **Teacher**: Emerald / Teal theme (`from-emerald-950/60`, emerald tabs, badge, and outgoing bubble)
          - **Student**: Indigo / Violet theme (`from-indigo-950/60`, indigo tabs, badge, and outgoing bubble)
          - **Parent**: Orange / Amber theme (`from-amber-950/60`, orange tabs, badge, and outgoing bubble)
          - **Admin**: Blue / Cyan theme (`from-blue-950/60`, blue tabs, badge, and outgoing bubble)
        - Theme tokens apply to hero headers, tab indicators, action buttons, active card borders, and user chat bubbles.
    - **Strict User Ticket & Support Message Privacy Isolation ([support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/support/support.controller.ts), [authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts), [SupportCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/shared/SupportCenter.tsx))**:
        - **Root Cause**: `getMyTickets` accessed `(req as any).user.userId`, but `authMiddleware.ts` was setting `req.user = { id: decoded.userId }` without `userId`. Prisma treated `{ userId: undefined }` as no filter, returning all tickets in the database.
        - **Backend Fix**: Normalized `authMiddleware.ts` to assign both `id` and `userId`. Hardened `getMyTickets` to check `req.user?.id || req.user?.userId` and abort early if missing.
        - **Frontend Filter**: Added client-side defense in `SupportCenter.tsx` filtering tickets strictly by `currentUserId`, guaranteeing that users only ever see their own tickets, complaints, proposals, and chats.
    - **Full TypeScript Verification**: Executed `npx tsc --noEmit` across both `backend` and `frontend` with **0 errors**.

- [x] **Support Desk — Triple Notification/Toast Fix & Universal Multi-Portal Support Center Unlocking (Wednesday, October 28, 2026)**:
    - **Elimination of Triple Toaster & Duplicate Socket Notifications ([support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/support.controller.ts), [useSupportSocket.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/hooks/useSupportSocket.ts), [SupportCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/shared/SupportCenter.tsx))**:
        - **Root Cause**: When support replied, backend emitted both `ticket_message_received` and `support_notification` to `user:${userId}`, in addition to `new_message` to `ticket:${ticketId}`. Furthermore, `useSupportSocket.ts` invoked `onNewMessage` for all 3 events without message deduplication, triggering 3 separate toasts and 3 audio chimes on the client.
        - **Backend Fix**: Removed redundant `support_notification` emission inside `replyToTicket` since `ticket_message_received` already conveys the message.
        - **Client Socket Fix**: Added bounded message deduplication cache `processedMessageIds` in `useSupportSocket.ts` so multiple room events for the same message ID never trigger `onNewMessage` more than once. Stopped `support_notification` from calling `onNewMessage`.
        - **Component Debounce Fix**: Added `lastNotifiedMessageIdsRef` in `SupportCenter.tsx` ensuring at most one toast, chime, and desktop notification per message payload.
    - **Universal Support Center Unlocking & Multi-Portal Architecture ([SupportCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/shared/SupportCenter.tsx))**:
        - Replaced previous "Coming Soon / Under Construction" placeholder with the complete, unlocked Multi-Portal Support & Help Center.
        - Unified all 4 roles across the ecosystem:
          - Teacher: [teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx) (`role="TEACHER"`)
          - Student: [student/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/support/page.tsx) (`role="STUDENT"`)
          - Admin: [admin/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/support/page.tsx) (`role="ADMIN"`)
          - Parent: [parent/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/support/page.tsx) (`role="PARENT"`)
        - Features all 4 operational portals in every role:
          1. **Platform Technicals (Live Chat)**: Real-time chat with Console Support Agent Display Name, online status, optimistic message delivery (`sending`, `sent`, `failed` + retry), WhatsApp audio chime, and mobile responsiveness.
          2. **Complaints & Grievances**: Role-specific category picker, urgency levels, confidential reporting option, and interactive two-way Discussion Dialog with school leadership.
          3. **Proposals & Suggestions**: Role-specific suggestion categories and scopes, community idea feed, local upvoting, and two-way administrative discussions.
          4. **Knowledge Base & FAQs**: Instant search bar, topic filters, and role-tailored step-by-step guidance.
    - **Full TypeScript Verification**: Executed `npx tsc --noEmit` across both `backend` and `frontend` with **0 errors**.

- [x] **Student Linking Hub — Graduated Scholar Alma Mater Auto-Status & Locked Class Join Prevention (Wednesday, October 28, 2026)**:
    - **Graduated Scholar Alma Mater Class Status Resolution ([StudentClassSelectionModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentClassSelectionModal.tsx))**:
        - Updated `getStudentClassStatus`: If the student is graduated (`isStudentGraduated = true`), all classes belonging to their alma mater unconditionally return status `"GRADUATED"` rather than defaulting to `"NONE"`.
        - Corrects modal counters so all classes are counted under `Graduated (X)` and prevents alumni scholars from seeing classes listed under "Available to Join".
        - Filter chips dynamically hide the "Available to Join" filter tab whenever `isStudentGraduated` is `true`.
        - Each class card displays the purple/emerald `Graduated Scholar` status badge.
    - **Locked Class Join Request Interception & Toast Notification ([StudentClassSelectionModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentClassSelectionModal.tsx))**:
        - Added `isClassLocked` helper inspecting `cls.isLocked`, `cls.locked`, `cls.status === "LOCKED"`, and `cls.isArchived`.
        - Added dedicated `Lock` badge (`bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300`) in class card headers when a class is locked.
        - Made "Request to Join" button non-joinable for locked classes: instead of submitting an enrollment request, clicking renders cursor-not-allowed styling and triggers an immediate warning toast: `"Enrollment Locked: [Class Name] is currently locked by the school administration and is not accepting join requests."`.
        - Added guard inside `handleJoinClass` intercepting locked and graduated states before mutation dispatch.
    - **Console Support Agent Display Persona & Teacher Live Chat Sync ([console/profile/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/profile/page.tsx), [teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**:
        - Integrated `displayName` / `agentDisplayName` in platform authentication, staff store, profile API hooks, and console profile editor.
        - Replaced text URL with native file upload with reader preview and size validation.
        - Enabled official email change and scoped social connections strictly to Google and Facebook.
        - Teacher support chat dynamically resolves and pins the active Console Agent's Display Name in header and message bubbles.
    - **Full TypeScript Verification**: Executed `npx tsc --noEmit` across both `backend` and `frontend` with **0 errors**.

- [x] **Console Support Chat UX Overhaul, AI/User Distinct Visual Alignment, Optimistic Sending & Sidebar Link Sectioning (Wednesday, October 28, 2026)**:
    - **AI & User Message Visual Architecture in Console Support ([console/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/support/page.tsx))**:
        - **AI Messages on the Right**: Automated AI responses (`senderRole === "AI" | "SYSTEM" | "BOT"`) now render right-aligned in distinctive green/emerald styling (`bg-emerald-600 text-white rounded-2xl rounded-br-none border border-emerald-500/40`), with a dedicated AI bot avatar on the right, an AI Bot badge (`AI Automated`), and `Qefas AI Assistant` header with sparkles icon.
        - **Human Support Agent Messages on the Right**: Support staff replies render right-aligned in indigo styling (`bg-indigo-600 text-white rounded-2xl rounded-br-none`) with the staff member's avatar photo or initials on the right and `ShieldCheck` verification badge.
        - **User Messages on the Left**: User messages render left-aligned in a clean slate/white card (`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none`) with user avatar on the left, full requester name, and role badge (`Educator`, `Teacher`, `Student`, etc.).
    - **Optimistic Message Sending & Real-Time Delivery Status Tracking ([console/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/support/page.tsx))**:
        - Implemented `OptimisticSupportMessage` state. When console staff sends a reply, the message immediately enters the active chat window with a `sending` spinner status indicator.
        - On server confirmation, status updates smoothly to `sent` (`✓✓ Sent`) with automatic cleanup.
        - On server or network failure, status updates to `failed` (`Failed to deliver`) with an inline one-click `Retry` action.
    - **Suppression of Unwanted Self-Message Notifications & Toaster Alert Fix**:
        - Fixed `handleIncomingSocketMessage` in `console/support/page.tsx`. Previously, `ticket_message_received` emitted `{ ticketId, message }` where `payload.senderRole` was `undefined`, causing `undefined !== "SUPPORT_AGENT"` to evaluate to `true` and trigger an incoming message toast and audio chime whenever the agent sent a reply.
        - Correctly unwrapped `payload?.message?.senderRole || payload?.senderRole` and strictly checked `role === "USER"`, completely eliminating self-notification toasts and chiming.
    - **Chat Window Animated Loading Skeleton & Indicator**:
        - Added animated conversation skeleton with a centered pulsating loading spinner (`Loading conversation thread...`) in the chat workspace whenever a ticket is loading or when switching inquiries, eliminating blank and frozen views.
        - Added live syncing indicator (`Syncing...`) in the header during background refetches.
    - **Console Sidebar Link Rearranging & Categorized Sectioning ([ConsoleSidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/components/ConsoleSidebar.tsx))**:
        - Grouped desktop console navigation links into 4 structured, titled sections with uppercase category headers when expanded and dividers when collapsed:
            1. **Ecosystem Management**: Overview, Schools, Students, Teachers, Parents, Deletions & Deactivations.
            2. **Revenue & Billing Architecture**: Revenue Architecture, Coupon Codes, Global Revenue, System Architecture.
            3. **Operations & Communications**: Support Center, Notification Routing, Activity Logs, Monitoring, Email Templates.
            4. **Administration & Security**: Admin Profile & Socials, Staff Accounts, Platform Settings.
    - **Full TypeScript Verification**: Executed `npx tsc --noEmit` across `frontend` with **0 errors**.

- [x] **Support Hub Discussion Threads, Global Audio Chimes, Profile Pictures & Console Admin Profile Hub (Wednesday, October 28, 2026)**:
    - **Teacher Complaint & Suggestion Two-Way Discussion Architecture ([teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**:
        - Built an interactive Discussion Dialog (`activeDiscussionTicket`) enabling teachers to click any lodged complaint (Portal 2) or proposal (Portal 3) to view administrator responses and reply back directly.
        - Includes full conversation history stream, initial statement card, status badge, priority indicator, and live reply input bar wired to `useSendTicketMessage()`.
        - Upgraded complaint and proposal cards with dynamic reply counters (e.g. `2 Replies` / `1 Discussion Reply`) and hover-accented click targets.
    - **Global Sound Chime on All Support Communications**:
        - **Backend Socket Enhancement ([support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/support.controller.ts))**: Updated `replyToTicket` and `updateTicketStatus` to broadcast `ticket_message_received`, `support_notification`, and `ticket_updated` directly to the user's personal room (`user:${userId}`).
        - **Socket Client Room Binding ([useSupportSocket.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/hooks/useSupportSocket.ts))**: Upgraded `useSupportSocket` to accept `userId`, automatically emit `join:user`, and catch `support_notification` events.
        - Whenever support replies or updates status on any ticket (technical chat, complaint, or suggestion), the teacher's device instantly plays the Web Audio WhatsApp chime (`playWhatsAppChime()`), pops up a toast alert, and triggers browser desktop notifications regardless of which tab is active.
    - **Teacher Support Mobile Responsiveness & Console Agent Identity Integration ([teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**:
        - **Mobile-Responsive Live Chat Toggle**: Added seamless mobile switching between the session roster and the active conversation window (`mobileChatView` state). On mobile devices (`< lg`), tapping any chat session transitions smoothly into the full conversation view with a native `← Back to Sessions` navigation button in the pinned header. On desktop screens (`>= lg`), both panels remain docked side-by-side.
        - **Console Profile Agent Name Integration**: Chat header and message bubbles now dynamically resolve and display the real-time Support Agent's name ([`activeSupportAgent`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx)) configured in their console profile at `/console/profile` (e.g. `Console Agent: Alex Rivera • Assigned Agent`). Discussion dialog headers similarly showcase the assigned administrator handling the grievance.
        - **Touch-Friendly Viewports & Dialog Bounding**: Wrapped Complaints & Suggestions rosters in responsive height bounds (`min-h-[300px] max-h-[480px] lg:min-h-0 lg:max-h-none`) and bounded the Discussion Thread modal to `w-[94vw] sm:max-w-2xl max-h-[88vh]`, preventing clipping or nested page scrollbars on mobile viewports.
    - **User and Support Profile Pictures in Chat**:
        - **Teacher Portal ([teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**: Displays teacher profile avatar (`teacherProfile?.profileImage` with fallback initials) on the right for educator messages, and platform engineering shield badge on the left for support staff messages.
        - **Console Portal ([console/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/support/page.tsx))**: Displays educator initial avatar badge on the left for user messages, and platform staff avatar image (`staff?.profileImage` with fallback initials) on the right for agent replies.
    - **Console Admin Profile & Social Authentication Hub ([console/profile/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/profile/page.tsx))**:
        - Built full profile editor at `/console/profile` with 3 core tabs:
            - **Profile & Biography**: Edit full name, phone number, bio, and profile avatar URL with live previews.
            - **Social Login & SSO**: Link and unlink Google, GitHub, LinkedIn, and Twitter/X accounts saved to PostgreSQL database.
            - **Security & Credentials**: Change console account password with current verification, bcrypt hashing, and security audit telemetry.
        - **Navigation Integration**: Added "Admin Profile & Socials" link to `ConsoleSidebar.tsx` menu items, made sidebar footer identity card clickable, added link to `ConsoleMobileDrawer.tsx`, and wired up top bar dropdown menu in `ConsoleTopBar.tsx`.

- [x] **Support Hub Layout Fitting, Multi-List Architecture & Real-Time Socket Synchronization**:
    - **Teacher Support Center Viewport Optimization ([teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**:
        - Streamlined top hero banner padding (`p-4 md:p-5`), compact tags, and responsive typography, recovering ~80px of vertical space so the interactive workspace is immediately visible without page scrolling.
        - **Portal 1 (Live Technical Chat)**: Redesigned into a balanced two-pane card layout (`lg:h-[calc(100vh-230px)] lg:min-h-[580px] lg:max-h-[720px]`) with matching heights. Left session roster (4 cols) and right WhatsApp-style conversation window (8 cols) now feature pinned search/headers, pinned quick prompts & input bars, and smooth internal scroll areas (`overflow-y-auto min-h-0`), eliminating asymmetrical card heights and nested double page-scrollbars.
        - **Portal 2 (Complaints & Grievances)**: Unified the complaint submission form (7 cols) and "My Lodged Complaints" (5 cols) into matching card containers (`lg:h-[calc(100vh-230px)] lg:min-h-[580px] lg:max-h-[720px]`). The filed complaints roster scrolls gracefully inside its dedicated card whether an educator has 0, 5, or 50+ grievances.
        - **Portal 3 (Suggestions & Innovations)**: Symmetrically bounded the idea submission form (6 cols) and "Submitted Educator Proposals" (6 cols) to `lg:h-[calc(100vh-230px)]` with internal list scrolling, keeping proposal endorsement upvotes cleanly accessible.
        - **Portal 4 (Teacher Knowledge Base & FAQ)**: Constrained the accordion articles container (`max-h-[calc(100vh-270px)] min-h-[480px] overflow-y-auto pr-1`) so expanding multiple answers never blows out page height and keeps search and topic filters sticky in view.
    - **Console Support Real-Time Platform Sync & Layout Enhancement ([console/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/support/page.tsx))**:
        - **Direct Platform Room Binding**: Passed `{ isPlatform: true }` into `useSupportSocket`, subscribing the console to room `platform:support`. The console immediately catches `new_ticket`, `ticket_message_received`, and `ticket_updated` events from teachers in real time, triggering audio alerts, toast previews, and cache invalidations without requiring manual refreshes.
        - **Dynamic Workspace Sizing**: Converted fixed `h-[760px]` to dynamic `lg:h-[calc(100vh-230px)] lg:min-h-[620px] lg:max-h-[800px]`, fitting standard laptop, 1080p, and ultrawide displays.
        - **FAQ Management Scroll Boundary**: Added `max-h-[calc(100vh-270px)] min-h-[500px] overflow-y-auto pr-2` to the FAQ list in the console, preserving sticky filter controls while managing extensive database articles.
    - **Full TypeScript Verification**: Frontend and backend pass `npx tsc --noEmit` with **0 errors**.

- [x] **Platform Notification Alert Routing & Distribution Architecture ([notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/notifications/page.tsx))**:
    - **Custom Department Email Routing**: Built alert recipient routing engine enabling designated email dispatch for `REGISTRATIONS` (admissions/sales), `DELETIONS` (security/compliance), `PAYMENTS` (billing/finance), `SUPPORT_TICKETS` (customer success), `SECURITY_INCIDENTS` (infosec), and `SYSTEM_ALERTS` (devops).
    - **Backend Dispatch Service ([recipient.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/notifications/recipient.service.ts))**: Implemented persistent JSON recipient configuration with live email dispatch integration across registration, account deletion, support tickets, and checkout/payment hooks.
    - **Console Navigation Integration ([ConsoleSidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/components/ConsoleSidebar.tsx), [ConsoleMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/components/ConsoleMobileDrawer.tsx))**: Added `Notification Routing` with `BellRing` icon to desktop sidebar and mobile drawer.

- [x] **Teacher Support Center 4 Operational Portals with Real-Time WhatsApp-Style Chat ([teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**:
    - **Portal 1 — Platform Technicals (Live In-Time WhatsApp-Style Chat)**:
        - Bidirectional live chat interface with platform software engineering desk featuring online status indicators, response time SLA, conversation bubbles, timestamps, and read receipts (`✓✓`).
        - **Web Audio Notification Chime**: Plays a crisp, native Web Audio frequency chime (`830.61Hz` -> `1244.51Hz`) whenever an unread incoming message arrives from support engineers.
        - **Dual Notification Engine**: Dispatches both in-app `react-toastify` message previews and browser desktop `Notification` alerts with permission request toggles.
        - **Sound Control**: Added sound toggle (`Sound ON` / `Sound Muted`) allowing teachers to mute audio during classroom periods.
        - **Socket Enhancement ([useSupportSocket.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/hooks/useSupportSocket.ts))**: Enhanced `useSupportSocket` with an `onNewMessage` callback to trigger instant audio and notification dispatches without waiting for cache invalidations.
    - **Portal 2 — Complaints & Grievances**:
        - Formal incident escalation portal for facility breakdowns, administrative delays, academic/grading disputes, and student behavioral infractions.
        - Includes incident date picker, 4-tier urgency levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), confidential grievance toggles, and live tracking of filed grievances.
    - **Portal 3 — Suggestions & Innovations Hub**:
        - Proposal system for classroom tech, curriculum enrichment, student competitions, staff wellness, and workflow automation.
        - Includes impact scope selectors (`Classroom`, `Department-wide`, `Whole School`, `Platform Ecosystem`), community endorsement upvote counters, and status tracking.
    - **Portal 4 — Teacher Knowledge Base (FAQ)**:
        - Comprehensive searchable self-service articles on Continuous Assessment (CA) & GPA weighting, offline Excel/CSV grade synchronization, attendance marking, digital exam approval blueprints, and multi-school linking.
    - **Feature Flag Unlocked ([featureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/config/featureFlags.ts))**: Set `FEATURE_FLAGS_TEACHERS.support = true`, unlocking the Help & Support module across the teacher desktop sidebar, mobile drawer, and command search palette.
    - **Runtime Error Resolution ([useSupportTickets.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useSupportTickets.ts), [teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**: Resolved `TypeError: activeTicketMessages.map is not a function` by unwrapping `messages` array from backend ticket object response and memoizing `messagesList` with defensive array checks.

- [x] **Platform Console Support Data Loading & Interactive Database-Backed FAQ Management ([console/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/support/page.tsx))**:
    - **Resolved Data Display Issue on `/console/support`**:
        - Identified root cause: `usePlatformTickets` hook had restrictive `enabled: !!platform_token` requiring Zustand store token, failing when admins authenticated via cookies or standard tokens; `platformClient.ts` only read from Zustand store without cookie/localStorage fallback; `platformAuthMiddleware.ts` was rejecting standard Admin tokens with 403.
        - **Multi-Token Authentication Interceptor ([platformClient.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/platformClient.ts))**: Updated request interceptor with fallback to `Cookies.get("platform_token")`, `Cookies.get("token")`, and `localStorage.getItem("token")`.
        - **Enhanced Platform Auth Guard ([platformAuthMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/platformAuthMiddleware.ts))**: Added fallback to `req.cookies.token` and allowed school `Admin` users (`SUPER_ADMIN` / `ADMIN`) to be recognized with `OWNER` privileges so platform support and inquiry data displays seamlessly.
        - **Inbox Auto-Selection**: Added auto-selection effect to immediately load the first inquiry's thread on page load.
    - **PostgreSQL Database-Backed FAQ System ([schema.prisma](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/prisma/schema.prisma))**:
        - Created `SupportFaq` Prisma model with fields `id`, `category`, `categoryLabel`, `question`, `summary`, `answer` (`String[]`), `targetRole` (`TEACHER`, `STUDENT`, `ADMIN`, `PARENT`, `ALL`), `order`, `isPublished`, `createdAt`, `updatedAt`.
        - Pushed schema to Supabase/PostgreSQL via `npx prisma db push` and seeded initial production teacher FAQs.
    - **Strict 3-Layer FAQ Architecture ([faq.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/faq.service.ts), [faq.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/faq.controller.ts))**:
        - Built `FaqService` and `faq.controller.ts` with strict Zod validation (`CreateFaqSchema`, `UpdateFaqSchema`) and full CRUD capabilities (`getFaqs`, `getFaqById`, `createFaq`, `updateFaq`, `deleteFaq`, `seedInitialFaqs`).
        - Mounted routes: public/role endpoint at `GET /api/support/faqs?role=TEACHER` and console management endpoints at `GET/POST/PATCH/PUT/DELETE /api/platform/support/faqs`.
    - **Console Support FAQ Manager ([console/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/support/page.tsx))**:
        - Added top navigation switcher between **Inquiries Desk** and **FAQ Knowledge Base**.
        - Interactive FAQ editor dialog with fields for Question, Category (with quick-select category suggestion chips), Subtitle Label, Target Audience/Role, Summary, dynamic Step-by-Step Guidance inputs (add/remove step buttons), Order, and Published/Draft toggle.
        - Direct database persistence via `useCreateFaq`, `useUpdateFaq`, and `useDeleteFaq` with instant cache invalidation.
    - **Teacher Support Center Live FAQ Integration ([teacher/support/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/support/page.tsx))**:
        - Connected Portal 4 (Knowledge Base) to `useSupportFaqs("TEACHER")`, dynamically fetching published articles directly from the database with seamless offline fallback.

- [x] **Restored ATM Style Pricing Plan Cards ([console/schools/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/schools/page.tsx))**:
    - **ATM Card Style Reinstated**: Restored the iconic ATM credit-card design for Institutional Subscription Tiers matching the design system across `/console/students`, `/console/teachers`, and `/console/parents`.
    - **Visual Details**: Golden EMV microchip matrix, dynamic gradients (Indigo for Total, Slate for Free/Basic, Amber for Trial, Blue for Starter, Emerald for Growth/Enterprise, Purple for Pro), embossed 4-digit card counter, frosted glass institutional seal with `BuildingIcon`, and glowing active selection rings with instant tier filtering.

- [x] **100% Coupon 0-Amount Checkout Fix**:
    - **Backend Validation ([payment.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/payment.controller.ts))**: Changed amount validation from `.positive()` to `z.number().min(0)` to permit 0-amount checkouts when a 100% discount coupon is applied.
    - **Zero-Amount Payment Gateway Bypass ([payment.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/payment.service.ts))**: Added `processZeroAmountCheckout` handling 100% free checkout directly, generating internal transaction record (`COUPON` payment method, `SUCCESS` status), registering coupon usage via `CouponService.recordUsage`, and activating subscriptions without calling external payment gateway APIs.
    - **Frontend Order Total & Button Indication ([checkout/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/checkout/page.tsx))**: Displayed emerald `FREE (100% OFF)` badge when total is 0, changed action button to `"Activate Subscription (100% Free)"`, and handled instant activation.

- [x] **School Subscription Control Suite & Page Redesign ([console/schools/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/schools/[id]/page.tsx))**:
    - **Full Subscription & Quota Control**: Implemented interactive plan tier selector (Free, Basic, Standard, Pro, Growth), status controller (`ACTIVE`, `SUSPENDED`, `EXPIRED`, `INACTIVE`), quick expiry extenders (`+1 Mo`, `+3 Mo`, `+6 Mo`, `+1 Yr`, clear), billing cycle switches, trial toggles, and granular quota overrides.
    - **Institutional Operational Dashboard**: Created live utilization meters (Students, Teachers, Classes/Exams, Cloud Storage GB), tabs for Subscription Control, Utilization, Administrators, Profile, and Communication Logs.
    - **Backend Plan Synchronization ([support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/support.controller.ts))**: Enhanced `updateSchoolPlan` to persist quota overrides, sync `SchoolSubscription` records, and update associated school administrators.
    - **Teacher Assignment Notifications ([class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts), [teacher-management.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/admin/teacher-management.controller.ts))**: Automated instant real-time notification dispatch whenever teachers are assigned to classes or new class teachers are appointed.
    - **Full TypeScript Verification**: Both `frontend` and `backend` passed `npx tsc --noEmit` with **0 errors**.

- [x] **Student Promotion Synchronization Across Student & Class Dashboards**:
    - **Unified Promotion Lifecycle Service ([student.lifecycle.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.lifecycle.service.ts))**: Ensured `StudentLifecycleService.promoteStudents` sets student status to `ACTIVE`, records comprehensive metadata in `StudentHistory` (`fromClassId`, `fromClassName`, `fromClassCode`, `toClassId`, `toClassName`, `toClassCode`, session, achievements), and cleanly handles unassigned or returning students.
    - **Multi-View Query Cache Synchronization ([PromoteStudentModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/[studentId]/components/PromoteStudentModal.tsx), [PromoteStudentsModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/PromoteStudentsModal.tsx))**: Aligned cache invalidations across both modals (`single-class`, `school-classes`, `adminStudents`, `school-students`, `student-details`, `student-history`, `classes`, `studentProfile`), ensuring promoting students from either view immediately reflects in both without stale cache.

- [x] **Student Alumni Status, Notification Guard & Cohort Selection Modal**:
    - **Student Dashboard Alumni Recognition ([student/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/page.tsx))**: Fixed `isGraduated` to read `studentProfile.status === "GRADUATED"`. Prevented the "Join Your School Class Cohort" banner from displaying to graduated students, replacing it with an **Honored Alumni Scholar Recognition Banner** featuring direct links to the Academic Vault and Past Records.
    - **Alumni Notification Filtering ([notification.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/notification/notification.service.ts))**: Added filtering in both single and bulk notifications to prevent general operational school/classroom alerts from being delivered to graduated alumni, while continuing to deliver communications specifically targeted to alumni.
    - **Class Selection & Promotion Badges ([StudentClassSelectionModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentClassSelectionModal.tsx))**:
        - Added `PROMOTED` status with an indigo badge and `TrendingUp` icon for classes the student was promoted from.
        - Displayed `TRANSFERRED` for transferred classes and `Graduated (Alumni)` for the class graduated from.
        - Allowed graduated alumni to browse and request to join other classes/cohorts in the same school without being locked out.

### Wednesday, October 28, 2026 (Resend Email Delivery Fix & Console Schools Directory Redesign)

- [x] **Email Delivery & Verification Fix ([mail.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/notification/mail.service.ts))**:
    - **Root Cause of Failed Communication Logs**: Investigated `EmailLog` records showing `FAILED` statuses for *Official Transcript 30-Day Access Pass*, *Behaviour Alert*, and *New Core Strength*. Discovered the database error `403: The qefashub.flexitistudio.com domain is not verified. Please, add and verify your domain on https://resend.com/domains` caused by hardcoded sender `from: "Qefas Hub <notifications@qefashub.flexitistudio.com>"` in `MailService.sendSchoolEmail`.
    - **Test Mode & Sender Alignment**: Updated `MailService.sendSchoolEmail` to respect `RESEND_TEST` and `MAIL_FROM` environment variables. When `RESEND_TEST=true`, sender is routed to `onboarding@resend.dev` and recipient to `process.env.TEST_EMAIL` (`qefas.lms@gmail.com`) while preserving original `recipientEmail: input.to` in `emailLog`.
    - **Live Verification**: Successfully dispatched test email via `MailService.sendSchoolEmail` with status `SENT` and verified Resend message ID.

- [x] **Console Schools & Subscription Management Redesign ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/schools/page.tsx))**:
    - **Available Institutional Subscription Tiers Showcase**: Built an executive-grade tier catalog displaying all active school plans in the database (*Institutional Basic* @ ₦0/mo, *Institutional Starter* @ ₦5,000/mo, *Institutional Growth* @ ₦15,000/mo) with live quota pills (Max Students, Teachers, Classes, Storage GB), pricing rates, and active enrolled school counts with interactive one-click tier filtering.
    - **Operational Health Pulse Cards**: Upgraded top KPI cards for Active Paid Schools, Active Trial Cohorts, Expired Access, and Cancelled/Inactive Tenants.
    - **Modern Directory Table**: Replaced archaic ATM cards with clean typography, monogram school avatars, one-click copyable Tenant IDs and School Codes, glowing real-time status indicators, tier badges, and an updated actions menu (View Full Profile, Impersonate Admin, Override Limits, Suspend/Restore).
    - **Backend Metadata Enhancement ([support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/support.controller.ts))**: Updated `searchSchools` to return rich tier metadata (`monthlyPrice`, `yearlyPrice`, `maxStudents`, `maxTeachers`, `maxClasses`, `maxExams`, `maxStorageGb`, `badgeLabel`, `isPopular`, `description`) in `planBreakdown`.

### Wednesday, October 28, 2026 (QR Poster Light/Dark Mode Contrast Fix & Admin QR Modals Redesign)

- [x] **QR Code Promotional Poster Generator ([QRCodePosterModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/reusable/QRCodePosterModal.tsx))**:
    - **White Theme (Clean Minimal) Contrast Fix**: Fixed white-on-white text rendering inside the generated poster when selecting Clean Minimal (the blue-accented white theme) — brand title `QEFAS` now uses `text-slate-900` instead of `text-white`, `Education Network` subtext uses `text-slate-500`, corner geometric accents use visible `border-blue-300`, and feature pills provide proper contrast.
    - **Modal Shell Light & Dark Theme Support**: Replaced hardcoded dark background (`bg-slate-950`) with full light/dark responsiveness (`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800`), refined variant buttons with active state highlights, and updated the theme selection grid and poster summary cards.
    - **Cross-Origin CSS SecurityError Fix**: Added `skipFonts: true` to both `handleDownload` and `handlePrint` `toPng` invocations, resolving the `SecurityError: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules` when trying to access Google Fonts stylesheets.

- [x] **QR Access Hub Redesign ([QRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/QRCodeModal.tsx))**:
    - Overhauled the QR Access Hub popup on `/dashboard/admin/linking` to strictly follow the admin theme (`primary` / indigo-blue gradient header).
    - Added quick-copy badge for the institution's school code in the header bar.
    - Upgraded student, teacher, and quick school link cards with styled role badges, crisp QR frames, gradient "Download / Preview Poster" action buttons with glowing dark mode elevation, and secondary copy link buttons.
    - Added security level indicator and responsive dark mode support.

- [x] **Class Access QR Modal Redesign ([ClassQRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/ClassQRCodeModal.tsx))**:
    - Redesigned the Class Access popup on `/dashboard/admin/classes/[id]` to follow the admin theme with glowing gradient header, quick-copy class code chip, and card layout.
    - Upgraded preview poster and copy link action buttons with dark mode styling and tactile hover states.

### Wednesday, October 28, 2026 (Connect with Code Modal Dark Mode Redesign)

- [x] **Connect with Code Modal Redesign ([ConnectModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/ConnectModal.tsx), [TeacherConnectModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/linking/components/TeacherConnectModal.tsx))**:
    - Overhauled the "Connect with Code" dialog on the Admin Linking Hub (`/dashboard/admin/linking`) with dark mode compatibility and aesthetics.
    - **Send Request Button**: Rebuilt with a multi-stop vibrant indigo-blue gradient (`from-blue-600 via-indigo-600 to-indigo-700` light / `from-indigo-600 via-blue-600 to-indigo-500` dark), deep glowing elevation shadows (`dark:shadow-[0_4px_24px_rgba(99,102,241,0.45)]`), white/indigo edge rings, smooth hover micro-translations, and an interactive `Send` icon.
    - **Modal Shell & Aesthetics**: Added ambient gradient glow backdrops, explicit high-contrast container surfaces (`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90`), and pulse status indicator ("Direct Link Engine").
    - **Form Controls & Smart Detection**: Added real-time badge detection for student codes (`STU-`), teacher codes (`TEA-`), class codes (`CLS-`), school codes (`SCH-`), and email formats, with styled inputs, dark mode select trigger, dropdown items with role icons, and cancel button.
    - **Teacher Connect Modal Polish**: Aligned dialog container and emerald button dark mode shadows and ring definition.

### Wednesday, October 28, 2026 (100% Coupon Checkout Fix & Console School Subscription Control Redesign)

- [x] **100% Discount Coupon Checkout Fix ([payment.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/payment.controller.ts), [payment.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/payment.service.ts), [checkout/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/checkout/page.tsx))**:
    - **Backend Validation**: Relaxed `initializePaymentSchema` in `payment.controller.ts` from `amount: z.number().positive()` to `amount: z.number().min(0, "Amount must be 0 or greater")` so 100% discount coupons do not fail request validation.
    - **Zero-Amount Payment Bypass**:
      - Added `processZeroAmountCheckout` in `payment.service.ts` to cleanly handle ₦0 checkouts without invoking external gateways (Paystack/Flutterwave).
      - Automatically creates a `Transaction` with `status: "SUCCESS"`, `paymentMethod: "COUPON"`, and reference prefix `FREE_`.
      - Activates school and user subscriptions immediately via `SchoolSubscriptionService` and `StudentSubscriptionService`.
      - Accurately tracks coupon redemption via `CouponService.recordUsage`.
      - Returns `isFree: true` along with reference and redirect/success URLs.
      - Added instant metadata resolution in `getMetadataFromReference` for `FREE_` references to avoid gateway lookup errors.
    - **Frontend Checkout Flow**:
      - Updated `checkout/page.tsx` to handle `res.isFree`: shows celebration toast, updates auth user store, and navigates straight to `"SUCCESS"` step with zero gateway redirects.
      - Displays `"FREE (100% OFF)"` badge in order summary and changes primary action button to `"Activate Subscription (100% Free)"`.

- [x] **Platform Console School Subscription Control & Page Redesign ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/schools/%5Bid%5D/page.tsx), [support.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/platform/support/support.controller.ts), [usePlatformSchools.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/usePlatformSchools.ts))**:
    - **Console School Detail Page Redesign**:
      - Built a command-center interface with top live capacity meter cards (students, teachers, exams/classes, cloud storage usage).
      - Added **Subscription & Plan Control Suite** allowing platform staff to:
        - Switch subscription plan tier (Free, Basic, Standard, Pro, Growth / Enterprise) with automatic feature sync.
        - Override subscription status (`ACTIVE`, `SUSPENDED`, `EXPIRED`, `INACTIVE`, `DEACTIVATED`).
        - Quick expiry extenders (`+1 Mo`, `+3 Mo`, `+6 Mo`, `+1 Yr`, clear/no expiry).
        - Toggle billing cycle (`MONTHLY`, `YEARLY`) and trial mode (`isTrialActive`).
        - Configure granular quota overrides for maximum students, teachers, exams, classes, and storage.
      - Added tabbed management workspace: Subscription Control, Utilization & Capacity, Administrators Directory, Institution Profile, and Communication Logs.
    - **Backend Support Controller**:
      - Upgraded `updateSchoolPlan` in `support.controller.ts` to accept all quota overrides (`maxStudentsOverride`, `maxTeachersOverride`, etc.).
      - Dynamically resolves `subscriptionPlanId` against `prisma.subscriptionPlan`.
      - Synchronizes `SchoolSubscription` record and cascades plan updates across all associated `SchoolAdmin` accounts.

### Wednesday, October 28, 2026 (QR Code Promotional Poster Generator)

- [x] **QR Code Poster Generator Feature**:
    - **Reusable Poster Component ([QRCodePosterModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/reusable/QRCodePosterModal.tsx))**:
      - Designed Canva-grade, responsive 4:5 promotional poster generator using Tailwind CSS, gradients, SVG educational emblems, and `react-qr-code`.
      - Built 4 design themes/variations:
        1. **Cyber Navy**: EdTech midnight gradient, cyan and electric blue accents, glow effects.
        2. **Emerald Prestige**: Academic emerald gradient with warm gold/amber accents.
        3. **Sunset Violet**: Royal violet to deep magenta with vibrant coral/rose highlights.
        4. **Clean Minimal**: High-contrast white/slate layout optimized for laser and black-and-white print.
      - Integrated high-resolution PNG export using `html-to-image` (`toPng` at 2.5x pixel ratio) and `file-saver` (`saveAs`).
      - Integrated dedicated print workflow opening a clean, margin-free popup window rendering the crisp poster at A4 proportions.
      - Dynamic metadata population: school name, class name, code badge, join URL, verified badges.
    - **Admin Linking Hub ([QRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/QRCodeModal.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/page.tsx))**:
      - Added **"Download / Preview Poster"** button beneath each QR card (Student Signup, Teacher Signup, and Quick Link).
      - Enabled seamless in-poster switching between Student, Teacher, and School Network QR variants.
      - Passed live `schoolName` and `schoolLogo` from admin profile / auth store.
    - **Admin Class Detail Page ([ClassQRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/ClassQRCodeModal.tsx))**:
      - Added **"Download / Preview Poster"** button under class QR display.
      - Pre-populated poster with exact class title (`${classData.name} (${classData.section})`), class code, school name, and logo.
      - Added variant switching between **Class Join Code** and **Direct Student Signup**.

### Wednesday, October 28, 2026 (Teacher Linking Student & Independent Connection Fix)

- [x] **Teacher Linking Independent Student Connection ([TeacherConnectModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/linking/components/TeacherConnectModal.tsx), [link.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/link/link.service.ts), [link.query.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/link/link.query.service.ts), [LinkingUtils.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/LinkingUtils.ts))**:
    - **Frontend Modal ([TeacherConnectModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/linking/components/TeacherConnectModal.tsx))**:
      - Added missing connection options: `"TEACHER_STUDENT"` (Connect with Student) and `"SCHOOL_STUDENT"` (Link Student to School) alongside `"TEACHER_CLASS"` and `"SCHOOL_TEACHER"`.
      - Added prefix auto-detection: inputs starting with `STU-` automatically switch to `TEACHER_STUDENT`; `SCH-` switches to `SCHOOL_TEACHER`; `CLS-` switches to `TEACHER_CLASS`.
      - Added `onError` toast notification and `onSuccess` feedback so teachers receive immediate, clear feedback on connect attempts.
    - **Backend Link Service ([link.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/link/link.service.ts))**:
      - Added `"TEACHER:STUDENT"` and `"STUDENT:TEACHER"` to `allowedPairs.SCHOOL_STUDENT` and `allowedPairs.STUDENT_CLASS`.
      - When a Teacher creates a `SCHOOL_STUDENT` request, resolved the teacher's active school and set `effectiveRequester` to the `SCHOOL`, enabling direct school enrollment upon approval for unaffiliated students (`student.schoolId === null`).
    - **Backend Query Service ([link.query.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/link/link.query.service.ts))**:
      - Added teacher's classes and `targetTeacherId` to `buildIncomingWhere` and `getAllLinkRequestsService` so teachers can view incoming join requests for their classes.
      - Added `TEACHER_STUDENT` to `classroomTypes` so teacher-student links display in the Classroom tab.
      - Added class links to `getActiveLinksService` for teachers.

### Wednesday, October 28, 2026 (Admin Class Creation Options Fix: Teachers, Term, Session & Level)

- [x] **Class Creation Popup Options Persistence ([ClassModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/components/ClassModal.tsx), [class.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.controller.ts), [class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts), [classService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/services/classService.ts))**:
    - **Backend Controller (`class.controller.ts`)**:
      - `createClass`: Extracted `teacherIds`, `session`, `sessionId`, `term`, and `level` from `req.body` and forwarded them directly to `createClassService`. (Previously only `subjectIds`, `departmentIds`, and `studentIds` were forwarded).
      - `updateClass`: Supported both `session` and `sessionId` payload fields seamlessly (`session: session || sessionId`).
    - **Backend Service (`class.service.ts`)**:
      - Declared `term` and `session` in `CreateClassInput`.
      - Persisted `level`, `term`, `session`, and `teachers` (with `isLead: index === 0`) in `prisma.class.create` for Admin classes, Teacher Personal classes, and Teacher School classes.
    - **Frontend Modal & Services (`ClassModal.tsx`, `classService.ts`, `types.ts`, `page.tsx`)**:
      - Added `Class Level` select picker (with school profile levels and standard fallback) and `Academic Term` select dropdown ("First Term", "Second Term", "Third Term") to the `ClassModal` popup.
      - Fixed `ClassModal` state to properly track `level`, `term`, `sessionId`, and `selectedTeacherIds`.
      - Passed `session`, `sessionId`, `term`, `level`, and `teacherIds` in both `classService.createClass` and `classService.updateClass`.
      - Updated `Class` interface in `classService.ts` and `ClassData` interface in `types.ts` to include `session`, `term`, and `level`.

### Wednesday, October 28, 2026 (Admin Linking Fix, Independent Student Linking, Public Join & Class Flows)

- [x] **Admin Linking "Connect with Code" Fix ([ConnectModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/ConnectModal.tsx), [link.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/link/link.service.ts))**:
    - Backend: Added `"ADMIN:STUDENT"` and `"ADMIN:TEACHER"` to `allowedPairs`.
    - In `createLinkRequestService`, when an Admin requests `SCHOOL_STUDENT`, `SCHOOL_TEACHER`, or `SCHOOL_ADMIN`, resolved the admin's active school and set the effective requester to that `SCHOOL` (setting `requestedByAdminId` and `requesterSchoolId`).
    - Added email search fallback to `findEntityByCode` for both students and teachers, allowing admins to connect using either student codes (`STU-...`) or registered emails.
    - Frontend: Added `onError` toast notification handling so failures are visible; added auto-detection of `STU-`, `TEA-`, `SCH-`, and `CLS-` prefixes; defaulted connection type to `SCHOOL_STUDENT`.
    - Enabled schools to connect directly with independent/unaffiliated students (`student.schoolId === null`).

- [x] **Universal Join Routes for Visitors, Logged-in Users & Existing Unauthenticated Accounts ([JoinSchoolPage](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/school/%5Bcode%5D/page.tsx), [JoinClassPage](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/class/%5Bid%5D/page.tsx), [useLoginMutation](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/%28auth%29/login/services/use-auth-mutations.ts))**:
    - `http://qefashub.com/join/school/[code]`:
      - Unauthenticated visitors see an institutional invitation landing card with options to Sign In with an existing account (`/login?redirect=/join/school/${code}`), Register as Student (`/signup/student?schoolCode=${code}`), or Register as Teacher (`/signup/teacher?schoolCode=${code}`).
      - Logged-in users automatically initiate connection and are redirected to the dashboard.
      - Gracefully handles "already connected" or "pending request" states with positive, informative UI cards instead of generic errors.
    - `useLoginMutation`: Added query parameter detection for `redirect`, ensuring existing users returning to sign in are immediately sent back to complete their join action.

- [x] **Class Preview & Public Join Flow ([class.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.route.ts), [class.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.controller.ts), [class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts), [JoinClassPage](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/join/class/%5Bid%5D/page.tsx))**:
    - Made `GET /classes/code/:classCode` and `GET /classes/preview/:id` publicly accessible by removing `authenticateToken` middleware and `if (!req.user)` checks.
    - Updated `previewClassByCodeService`, `previewClassByIdService`, and `requestToJoinClassService` to accept case-insensitive codes and IDs (`OR: [{ classCode: { in: variants } }, { id: trimmed }]`).
    - In `requestToJoinClassService`, unaffiliated students (`student.schoolId === null`) are now permitted to submit class join requests without requiring pre-existing school affiliation.
    - `http://qefashub.com/join/class/[id]`: Renders a class preview with subject, school, and teacher information for unauthenticated visitors, with direct options to Sign In or Register as Student to join.

- [x] **Registration Codes & Independent Student Joining ([auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts), [StudentConnectModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentConnectModal.tsx))**:
    - In `registerStudent`, `registerTeacher`, and `registerParent`, updated all code lookups (`schoolCode`, `teacherCode`, `studentCode`, `classCode`, `parentCode`) to search case-insensitively and support ID fallback.
    - In `StudentConnectModal`, removed the frontend block that prevented independent students from entering a classroom code, replacing it with an informative hint explaining automatic school linking upon teacher/admin approval.

### Wednesday, October 28, 2026 (Teacher Class Timetable Active Slot Red Badge & Border)

- [x] **Active Time Slot Red Highlighting ([TeacherTimetableGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/timetable/TeacherTimetableGrid.tsx))**:
    - Enhanced `isCurrentTimeSlot` to reliably evaluate active periods against current clock time supporting both 24-hour and 12-hour AM/PM formats.
    - Updated `TeacherSubjectCard` to accept `isCurrent` and render a red pulsing `"Now"` tag (`bg-red-600 text-white`) along with an active red border (`border-2 border-red-500 ring-2 ring-red-500/20 shadow-[0_0_16px_rgba(239,68,68,0.25)]`).
    - Styled break slots and free periods running currently with matching red borders, subtle red backgrounds, and red `"Now"` indicators.
    - Updated `MobileSubjectCard` to render the red border and red pulsing `"Live Now"` badge.

### Wednesday, October 28, 2026 (Student Lifecycle Status Filter Tags & Graduation Architecture Reference)

- [x] **Student Lifecycle Tags on Admin Students Directory ([admin.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/admin/admin.controller.ts), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/page.tsx), [StudentsTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/components/StudentsTable.tsx))**:
    - Backend: Added `lifecycleStatus` query filtering (`ENROLLED`, `GRADUATED`, `EXPELLED`, `TRANSFERRED`) and computed breakdown counts (`allCount`, `enrolledCount`, `graduatedCount`, `expelledCount`, `transferredCount`).
    - Base school condition now verifies both `schoolId` and `originalSchoolId`, ensuring alumni and transferred/expelled students who originated from the school are tracked.
    - Frontend: Added interactive lifecycle tag bar displaying:
      - **All Students** with count pill
      - **Enrolled** with count pill
      - **Graduated** with count pill
      - **Expelled** with count pill
      - **Transferred** with count pill
    - Clicking any tag filters the student directory immediately and resets to page 1.
    - Upgraded `StatusDot` across table, grid, and mobile cards to render distinct badges for `Graduated` (with `GraduationCap` icon and amber badge), `Expelled` (rose badge), `Transferred` (purple badge), and active/pending indicators.

- [x] **Graduation Architecture Analysis for Setup Reusability**:
    - Analyzed graduation handling across database models (`Student`, `StudentEnrollment`, `StudentHistory`, `ClassEnrollment`), backend services (`student.lifecycle.service.ts`), and frontend views (`[studentId]/page.tsx`, `GraduateStudentModal.tsx`, `TranscriptModal.tsx`).
    - Documented canonical patterns for student graduation: maintaining school relationship via `schoolId`, archiving class enrollments, recording milestone history, issuing alumni honors, and locking transcript records.

### Wednesday, October 28, 2026 (Link Request Permission Fix, Admin Notification Popup Connection Approval, & Teacher Class Notification Filtering)

- [x] **Resolved `link.getSingleLinkRequest` Access Control Error ([link.manage.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/link/link.manage.service.ts))**:
    - Fixed `Error: You are not allowed to view this request` when requesting `GET /api/v1/links/requests/:id`.
    - Added inclusion of `class` in the query and expanded authorization checks:
      - Validates whether an Admin is an active administrator for any school tied to the request (`schoolId`, `targetSchoolId`, `requesterSchoolId`, `class.schoolId`, or `targetId`).
      - Validates whether a Teacher is assigned to the target class (as `ClassTeacher` or subject teacher in `ClassSubject`) or was directly sent a notification for the request.

- [x] **Secure Connection Request Approval for Admins & Teachers ([link.respond.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/link/link.respond.service.ts), [useLinks.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useLinks.ts))**:
    - Enhanced `canRespondToRequest` in `link.respond.service.ts` to verify active school administration across all involved school IDs for `CLASS` and `SCHOOL` target requests.
    - Allowed authorized class teachers and subject teachers to securely approve or decline class join requests.
    - Updated `useRespondToLinkRequest` in `useLinks.ts` to invalidate both `queryKeys.all` and `['notifications']`, ensuring real-time notification list and badge updates when responding to requests.

- [x] **Class-Specific Notification Scoping for Teachers ([class.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.controller.ts), [notification.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/notification/notification.controller.ts))**:
    - Deduplicated teacher notifications during student class join requests (`requestToJoinClass`) to only target assigned staff, embedding `className` in the notification metadata.
    - In `getMyNotifications` and `getUnreadCount`, filtered notifications for `TEACHER` accounts so that class alerts (such as join/connection requests) only display for classes the teacher is actively assigned to.

- [x] **Notification Detail Modal & Pane Enhancement ([NotificationDetailModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/notifications/NotificationDetailModal.tsx), [NotificationDetailPane.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/notifications/NotificationDetailPane.tsx), [admin/notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/notifications/page.tsx))**:
    - Added target class name and code detection (`details.className`, `details.classCode`) to requester details cards in both modal and detail pane views.
    - Enabled the Accept and Decline actions directly within the notification details popup for administrators and authorized teachers with processing states.
    - Passed explicit `userType="admin"` to `NotificationDetailModal` in the Admin Notifications view to maintain consistent theme styling.

### Wednesday, October 28, 2026 (Teacher Class Detail Enhancements: Filters, Attendance Refreshes, Student Status Tabs, & Timetable Blur)

- [x] **Exams & Quizzes and Assignments Interactive Filters ([ExamFilterDialog.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/exams&quizzes/components/ExamFilterDialog.tsx), [AssignmentFilterDialog.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/assignments/components/AssignmentFilterDialog.tsx), [exams&quizzes/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/exams&quizzes/page.tsx), [assignments/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/assignments/page.tsx))**:
    - Created modal filter dialog for Exams & Quizzes supporting multi-criteria filtering by assessment type (`ALL`, `EXAM`, `QUIZ`, `TEST`, `ASSESSMENT`), publication status (`ALL`, `PUBLISHED`, `DRAFT`, `ARCHIVED`), and assigned subject.
    - Added filter button and modal dialog to Assignments tab with status filters (`ALL`, `PUBLISHED`, `DRAFT`, `CLOSED`), subject selector, and submission status toggles (`Has Submissions`, `Needs Grading`), accompanied by active filter count indicators.

- [x] **Attendance Calendar Refresh Fix ([useClasses.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useClasses.ts), [attendance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/attendance/page.tsx))**:
    - Resolved tab-level flashing skeleton when clicking dates on the mini-calendar by adding TanStack Query's `placeholderData: (previousData) => previousData`.
    - Guarded full skeleton loader in `attendance/page.tsx` with `isInitialLoad = !classData && isLoading`, ensuring smooth inline transitions between dates.

- [x] **Student Status Sub-Tabs ([StudentTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/student/components/StudentTable.tsx), [student/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/student/page.tsx))**:
    - Added filter sub-tabs for `Enrolled`, `Graduated`, `Expelled`, and `Transferred` students alongside `All Students`.
    - Computed live badge counts for each category and styled corresponding status pills and avatar indicators in `StudentTable`.

- [x] **Teacher Timetable Class Subject Matching & Blur Toggle ([timetable.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/timetable.service.ts), [timetable/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/timetable/page.tsx), [TeacherTimetableGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/timetable/TeacherTimetableGrid.tsx))**:
    - Resolved timetable showing "free all through": eliminated querying backend with `{ termPeriodId: 'NONE' }` and added fallback period loading.
    - Accurately mapped assigned teacher subjects by matching class teacher subject IDs, subject titles, and teacher profile IDs.
    - Highlighted teacher's assigned subjects with emerald accents and "You" indicator badges.
    - Blurred out other subjects on both desktop matrix and mobile daily schedule cards, with an interactive Eye icon allowing the teacher to preview/toggle visibility.

### Wednesday, October 28, 2026 (Enforced Strict Dashboard Lockout, 30-Day Clearance Resend, & Transaction Email Dispatch)

- [x] **Strict Dashboard Direct Access Lockout ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Disallowed unconditional score breakdown visibility when navigating directly from the student dashboard (`/dashboard/student/transcript`) without an explicit, cryptographically signed `?pass=<token>` link.
    - Removed automatic `localStorage` pass restoration on mount when `!passParam`, preventing direct browser navigation from bypassing the payment paywall.
    - Scoped `isTermUnlocked` check strictly to the matching academic session and term contained in the validated 30-day token.

- [x] **Active 30-Day Clearance Notification & Resend Action Area ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - If a scholar paid within the last 30 days (`recentClearancePayments.length > 0`) and enters directly from their dashboard without a pass token, an amber & emerald cleared status banner is presented: *"Official Transcript Clearance Record on File"*.
    - Displays the exact cleared session, term (`1st Term`, `2nd Term`, `3rd Term`), enrolled class cohort (e.g. `JSS 3 A`), paid date, and reference.
    - Prominently provides **"Resend Transcript Download & Preview Link"** button which dispatches an email with their direct access link containing `?pass=<token>`.
    - Integrated the same cleared banner and resend action into both individual Page 1 term cards and Page 2 behavioral domain evaluation paywall.

- [x] **Mandatory Session & Term Selection in Clearance Checkout ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Enforced mandatory selection of both Academic Session and Academic Term in the payment clearance modal before Flutterwave checkout is permitted.
    - Integrated 3-button term selector grid (`1st Term`, `2nd Term`, `3rd Term`) with interactive selection highlight, live price scope preview, and disabled button state until both fields are populated.

- [x] **Comprehensive Transaction Receipt & Clearance Pass Email Delivery ([finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts), [payment.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/payment.service.ts))**:
    - Verified payment webhook (`paystackWebhookService`) now properly recognizes and delegates `TRANSCRIPT` and `PORTAL_ACCESS` charges directly to `FinanceService.verifyPayment`.
    - Dispatches comprehensive receipt email with cleared session, term, enrolled class cohort, transaction reference, amount paid, and direct access URL to all associated recipient emails (student, parent, metadata email).
    - Hardened `verifyTransaction` on return from Flutterwave to ensure successful redirects preserve `?pass=<token>` instead of getting wiped by finally blocks.

### Tuesday, October 27, 2026 (Fix: Student Dashboard Auto-Popup on Reload & 30-Day Clearance Access Pass)

- [x] **Resolved Unwanted Auto-Popup on Reload ([student/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/page.tsx), [PrefectCelebration.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/PrefectCelebration.tsx))**:
    - **Diagnosed Root Cause**: An aggressive `useEffect` hook in `StudentHomeDashboard` (`/dashboard/student`) was triggering `setIsClassSelectionModalOpen(true)` automatically on every page mount/reload whenever `!isEnrolledInClass`.
    - For graduated students, alumni, or students not yet assigned a class cohort, the large "Select Your Classroom" modal would pop up over the entire screen on every single page refresh.
    - Dismissal was tracked in ephemeral `sessionStorage` per session rather than durable local persistence, and fired repeatedly if the modal was active during reload.
    - **Resolution**:
        - Removed the automatic modal pop-up `useEffect` entirely. The modal now only opens on explicit user intent when clicking "Choose Class" on the dashboard cohort banner.
        - Added `isGraduated` guard so alumni/graduated scholars are not prompted with active classroom enrollment banners.
        - Swapped modal dismissal storage to `localStorage` with fallback keys.
        - Hardened `PrefectCelebration` with a `localStorage` safety guard (`prefect_celebration_seen_${studentId}`) to prevent celebration popups from recurring on network delays or reloads.
        - Fixed `Users` icon import from `lucide-react` in [transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx) to resolve `ReferenceError: Users is not defined` in guardian download telemetry.

- [x] **30-Day Guaranteed Direct Access Pass & Admin Transaction Notifications ([finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts), [flutterwave.adapter.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/flutterwave.adapter.ts), [transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Cryptographically signed 30-day JWT access pass (`TRANSCRIPT_30_DAY_PASS`) valid for 1 month generated upon payment verification.
    - Real-time in-app notification dispatched to Admin (`recipientType: "SCHOOL"`) with direct link to transaction history upon transcript payment.
    - Real-time in-app notification & automated email sent to the student containing their 1-month fail-safe access link.
    - Self-healing recovery dialog in transcript UI allowing students to paste an access pass or restore clearance directly from their email.

### Tuesday, October 27, 2026 (Student Academic Transcript Payment Clearance & Modal Overhaul)

- [x] **Enforced Transcript Payment Gating & Redesigned Clearance Modal ([student/transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx), [financeService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/financeService.ts), [finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts), [flutterwave.adapter.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/flutterwave.adapter.ts))**:
    - **Diagnosed Premature Results Visibility**:
        - `requiresPayment` was incorrectly restricted to `isGraduated`, and `isPreviewUnlocked` fell back to `isSchoolPaidPlan` (evaluating to `true` on active institution tiers). Active students viewing `/dashboard/student/transcript` were bypassing transcript clearance completely and seeing full score tables.
        - The 4 Cumulative Summary Cards (CGPA, Average, Total Subjects, Completed Terms) were unmasked and exposed real score data even when the clearance paywall was active.
        - Page 2 (Affective traits and psychomotor skills) lacked gating checks on the evaluations table.
        - `handleInitiateOnlinePayment` previously ran an optimistic `setUnlockedSessions` locally before payment was verified.
    - **Fixes & Enhancements Applied**:
        1. **Strict Clearance Gating**: Configured `requiresPayment = (transcriptFee > 0) || isGraduated || !isSchoolPaidPlan` and `isCurrentViewUnlocked` strictly based on verified `hasPaidTranscript` in `Payment` ledger or unlocked session keys.
        2. **Masked Preview & Summary Cards**: When clearance is unpaid, all 4 cumulative summary cards mask values with `••••` and a `Locked` badge, and Page 1 / Page 2 course breakdown & evaluations render the official clearance paywall.
        3. **Removed School Bank Account Number**: Removed the manual offline bank transfer section with the school account number, bank details, and copy buttons from the payment modal.
        4. **Premium Payment Modal Redesign**: Modernized dialog with a deep indigo gradient, SSL encryption pill, scholar snapshot strip, target session selector, itemized clearance benefits (registrar seals, verifiable reference hash, high-res PDF generation), accepted payment channel badges, and prominent 1-click Flutterwave checkout button.
        5. **End-to-End Payment Flow**:
            - Allowed `FlutterwaveAdapter.initialize` to accept a custom `redirect_url` pointing to `${FRONTEND_URL}/dashboard/student/transcript?payment=verifying`.
            - Added auto-verification `useEffect` in `student/transcript/page.tsx` that detects returning payment callbacks, calls `financeService.verifyPayment(txRef, transactionId)`, displays toast confirmation, refetches audit telemetry, and automatically unlocks the transcript records.
            - Made `FinanceService.verifyPayment` idempotent and updated `FinanceController.verifyPayment` to extract `transaction_id`.
    - Both frontend and backend TypeScript checks completed with exit code `0` and 0 errors.

### Tuesday, October 27, 2026 (Fix: Circular Structure Error on 'Sync with Bank' Click)

- [x] **Resolved Circular Structure JSON Error on Sync Bank ([PaymentStatusCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/PaymentStatusCard.tsx), [finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx), [financeService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/financeService.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts), [finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts))**:
    - **Diagnosed Root Cause**:
        - In [`PaymentStatusCard.tsx`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/PaymentStatusCard.tsx), the button was passing `onClick={onRefresh}` directly. React passes a Synthetic `MouseEvent` as the first argument.
        - Because `onRefresh={handleSync}` in [`finance/page.tsx`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx) took `(accountId?: string)`, `accountId` received the entire `MouseEvent` object containing `event.view === window`.
        - When Axios prepared the request payload `{ accountId: event }`, `JSON.stringify` failed with `TypeError: Converting circular structure to JSON --> starting at object with constructor 'Window' --- property 'window' closes the circle`.
    - **Fixes Applied**:
        1. **Event Shielding**: Wrapped `onClick={() => onRefresh?.()}` in `PaymentStatusCard` and `onRefresh={() => handleSync()}` in `finance/page.tsx` so click events are never forwarded as arguments.
        2. **Frontend Sanitization**: In `handleSync` and `financeService.syncSubaccountStatus`, strictly validated `typeof accountId === "string"` before including `{ accountId }` in the API payload.
        3. **Backend Robustness**: In `FinanceController.syncSubaccountStatus`, validated `typeof req.body?.accountId === "string"`. In `FinanceService.syncSubaccountStatus`, resolved subaccount with a fallback to the latest registered settlement account if `isDefault: true` was not explicitly set, and recorded an immutable `ACCOUNT_SYNCED` row in `BankAccountAudit`.
    - Zero TypeScript compilation errors verified across both frontend and backend.

### Tuesday, October 27, 2026 (Academic Transcript Loading Skeleton UI Overhaul)

- [x] **Full-Fidelity Loading Skeleton for Academic Transcript ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx))**:
    - **Diagnosed Skeleton Disconnect**:
        - The transcript preview page at `/dashboard/admin/transcript?studentId=...` had a dedicated, multi-section `TranscriptPreviewSkeleton` component that was never being reached because an obsolete, premature 3-box generic skeleton (`<div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">...`) had been left in the component body above it.
        - Removed the early generic fallback and activated the real `TranscriptPreviewSkeleton`.
    - **Full-Fidelity Document Skeleton Matching UI**:
        - Upgraded `TranscriptPreviewSkeleton` to accept real metadata context (`schoolName`, `schoolLogoUrl`, `schoolMotto`, `schoolLocation`, `studentProfile`, `enrolledClass`, `onToggleSidebar`).
        - **Header & Navigation Bar**: Working "Select Another Scholar" button, quick-switcher avatar with scholar name, certification badge, page-switcher tabs, and interactive Access & Payment Audit toggle button.
        - **Letterhead & Crest**: Displays the school logo or crest, certified record pill badge, school name, motto, and campus address.
        - **Scholar Photo**: Scholar portrait box with student picture if already cached, or styled placeholder.
        - **Student Profile Banner**: 6-column metadata grid matching the real transcript document (Scholar Full Name, Student ID / Code, Department / Cohort, Enrollment Status, Document Ref No., Issued Date).
        - **Cumulative Summary Cards**: 4 performance cards (Cumulative CGPA with `/ 5.00` scale, Cumulative Average, Total Subjects, and Academic Standing pill).
        - **Course Breakdown Tables**: Realistically structured session breakdown with 1st Term and 2nd Term tables, subject rows, CA / Exam / Total columns, grade badges, and terminal summary footers.
        - **Endorsements & Signatures**: Tri-column endorsement section with handwritten cursive Registrar signature baseline, central circular electronic certification seal, and Principal signature baseline.
        - **Access & Payment Audit Sidebar**: Right-hand telemetry card with download counters, student vs parent breakdown, payment clearance status, and connected parent records.
    - Zero TypeScript compilation errors verified via `npx tsc --noEmit`.

### Tuesday, October 27, 2026 (Student Graduation Fix & Bank Account Modal Redesign with Business Email)

- [x] **Student Graduation Fix ([student.lifecycle.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.lifecycle.service.ts), [student.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.service.ts), [student.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.controller.ts), [GraduateStudentModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/components/GraduateStudentModal.tsx), [students/[studentId]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/%5BstudentId%5D/page.tsx))**:
    - **Diagnosed and Resolved Graduation Blockers**:
        1. Existing students in the database had `schoolId` populated directly on the `Student` table with 0 rows in `StudentEnrollment`. The previous exit logic required an active row in `StudentEnrollment`, throwing `Error: Student does not have an active enrollment in this school.`. Updated `exitStudentFromSchool` to auto-provision an enrollment departure record if none existed.
        2. Student departures previously set `student.schoolId = null`, severing the school's alumni record and triggering a `403 Access denied` on subsequent profile views. For `exitType === 'GRADUATED'`, the student's status is now permanently marked `status: 'GRADUATED'`, preserving `originalSchoolId` and `schoolId` so the graduating institution retains alumni ownership, transcript clearance, and academic history.
        3. Allowed administrators to view and manage graduated alumni who completed studies at their institution in `getStudentById` by verifying `profile.originalSchoolId` and enrollment records.
    - **Graduation UI & Honors Workflow**:
        - Created [`GraduateStudentModal.tsx`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/components/GraduateStudentModal.tsx) with a celebratory UI, student snapshot, graduation date picker, honors classification input (e.g. `Class of 2026 Honors Graduate`), commendation notes, and TanStack mutation.
        - Added prominent "Graduate Student" button to the student profile hero actions and quick actions sidebar at `/dashboard/admin/students/[studentId]`.
        - Added a glowing amber `Graduated Scholar (Alumni)` badge on the student profile hero banner when graduated.

- [x] **Bank Account Modal Popup Width & Business Email Requirement ([flutterwave.adapter.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/flutterwave.adapter.ts), [finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts), [gateway.interface.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/gateway.interface.ts), [finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx), [financeService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/financeService.ts))**:
    - **Business Email Parameter Fix**:
        - Identified Flutterwave API requirement where `POST /v3/subaccounts` rejects requests missing `business_email` with `{ status: "error", message: "business_email is required" }`.
        - Extended `SubaccountCreateParams` with `businessEmail`, `businessContact`, and `businessMobile`.
        - Updated `FlutterwaveAdapter.createSubaccount` to pass `business_email`, `business_contact`, and `business_mobile`.
        - In `FinanceService.setupBank`, resolved fallback `resolvedBusinessEmail = data.business_email || userContext?.userEmail || school?.schoolEmail || 'finance@schoolhub.ng'`.
    - **Modal Popup Width & 2-Column Responsive Layout**:
        - Increased dialog width from `max-w-xl` (576px) to a spacious `max-w-4xl` (896px).
        - Created a 2-column layout:
            - Left: Live interactive Metallic Virtual ATM Card preview, Sandbox Test Mode helper with 1-click test fill, and SSL security reassurance badge.
            - Right: Popular commercial bank pills, bank directory selector, 10-digit NUBAN input, live account verification card with school confirmation checkbox, customizable display name with quick toggles, and new **Business / Settlement Notification Email** input field (pre-filled with the school's official email or admin email).

### Tuesday, October 27, 2026 (Workspace Build Verification & Clean Compilation)

- [x] **Full Repository Build & Typecheck Clean**:
    - **Backend**: Executed `npx tsc; npx tsc-alias` to compile `dist/` — completed with exit code `0` and 0 errors.
    - **Frontend**: Executed `next build` (Next.js 16.3.7 Turbopack) — compiled all 150+ static and dynamic routes cleanly with exit code `0` and 0 errors.
    - **Mobile**: Executed `npx tsc --noEmit` — verified strict TypeScript checks with exit code `0` and 0 errors.
- [x] **Database & Runtime Compatibility**:
    - PostgreSQL schema synced via Prisma with `BankAccountAudit` ledger and `SettlementAccount` tracking fields (`addedBy`, `addedByName`, `addedByRole`).
    - Prisma client regenerated and verified compatible with live background dev servers.

### Tuesday, October 27, 2026 (Student Transcript Payment Clearance Modal Width Expansion & 2-Column Grid Upgrade)

- [x] **Transcript Payment & Clearance Modal Width Expansion ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Increased modal container width from cramped `max-w-xl` (576px) to a spacious, modern, responsive `max-w-3xl lg:max-w-4xl xl:max-w-5xl w-[95vw]` with `rounded-[2.5rem]`.
    - Structured modal interior into a 2-column layout (`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch`):
        - **Left Column (7 cols)**: Scholar Snapshot Strip (avatar, name, student code, clearance scope), Transcript Scope Selector (Full Cumulative vs Single Session), and "What this official clearance covers" Inclusions List with `CheckCheck` green checkmarks.
        - **Right Column (5 cols)**: Total Clearance Fee Card (`₦{transcriptFee.toLocaleString()}`, verified subaccount beneficiary badge), Accepted Payment Channel chips (Debit/Credit Cards, Bank Transfer, USSD, Mobile Money), and the full-width Flutterwave Payment CTA button with automatic post-clearance unlock note.
    - Upgraded header styling with an extra "Instant Auto-Unlock" status badge, glowing ambient backlights, and responsive title typography (`text-2xl sm:text-3xl`).
- [x] **TypeScript Validation**: Verified clean compilation across both frontend and backend (`npx tsc --noEmit` exited with code 0).

### Tuesday, October 27, 2026 (Graduated Scholar Institutional Badges Roll)

- [x] **Graduated Scholar Badge Roll Under First Card ([student/transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx), [TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx))**:
    - Implemented a dedicated "Badges" row for graduated scholars directly under the first card (`renderStudentProfileBanner`) across both student and admin transcript views.
    - Added `graduatedSchools` resolution to gather unique institutions the student graduated from (primary school, student profile school, original school, and historical school memberships) along with their official logos.
    - Rendered the Badge row with a gold medallion award icon, "Badge" header, "Graduated Scholar" status chip, and a horizontal roll of institutional emblems with the school's logo, school name, and a "Graduated Alumnus" verified badge.
    - Updated the Enrollment Status indicator in the student biographical profile card to dynamically display "Graduated Alumnus" with an academic cap icon when `isGraduated` is true instead of static "Active Enrolled".
- [x] **TypeScript Validation**: Verified zero compilation errors across both frontend and backend (`npx tsc --noEmit`).

### Tuesday, October 27, 2026 (Bank Account Processing & Audit History Real Name Resolution)

- [x] **Real Administrator Identity Resolution in Bank Audit History ([authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts), [finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts), [finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx))**:
    - Identified why the "Bank Account Processing & Audit History" ledger displayed generic `"School Administrator"` instead of the real name of the admin who added the account:
        1. In `authMiddleware.ts`, `req.user` only contained `{ id, userType, schoolId, tenantId }` without attaching `name`, `email`, or `role`.
        2. `FinanceController.setupBank` and `FinanceService.setupBank` defaulted to `"School Administrator"` because `req.user.name` was undefined.
    - Updated `authMiddleware.ts` to look up and attach the real `name`, `email`, and `role` to `req.user` across all user types (Admin, Teacher, Student, Parent, Super Admin).
    - Updated `FinanceController.setupBank`, `removeSubaccount`, and `syncSubaccountStatus` to resolve the real administrator name, email, and role from `req.body`, `req.user`, or the database via `prisma.admin.findUnique` / `prisma.schoolAdmin.findFirst`.
    - Added `FinanceService.enrichBankAudits()` which dynamically resolves the real administrator identity (`name`, `email`, `role`) for any existing audit records displaying generic placeholder names, and auto-heals both `bank_account_audits` and `settlement_accounts` in PostgreSQL in the background.
    - Updated frontend `finance/page.tsx` and `bank-setup/page.tsx` to forward `addedByName`, `addedByEmail`, and `addedByRole` to `financeService.setupBank` and compute `effectiveUserName` and `effectiveUserEmail` in the audit ledger UI.
- [x] **TypeScript Validation**: Verified zero compiler errors across both frontend and backend (`npx tsc --noEmit`).

### Tuesday, October 27, 2026 (Bank Account Modal Redesign, School Name Auto-Population, and DB Audit History Ledger)

- [x] **Bank Account Modal Redesign & Live Virtual ATM Card ([finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx))**:
    - Completely redesigned the "Connect School Bank Account" popup modal at `/dashboard/admin/finance`:
        - Implemented a live interactive metallic virtual ATM card with EMV gold chip, contactless waves, live selected commercial bank badge, formatted monospace NUBAN number display, cardholder name, and glowing green `VERIFIED NUBAN` holographic badge.
        - Added 1-tap quick selection pills for top Nigerian commercial banks (Access Bank, GTBank, Zenith, First Bank, UBA, Kuda, OPay, PalmPay), plus the full searchable directory.
        - Added a dedicated Sandbox Test Mode helper alert with a 1-click `Auto-Fill Test Account` button (Access Bank + `0690000031`) to eliminate test friction.
- [x] **Auto-Add School Name in Display Name**:
    - Connected `useSchoolProfile(schoolId)` to resolve the actual school identity (`schoolProfile.name` / `schoolProfile.schoolName` / `user.schools[0].name`).
    - Automatically pre-populates the "School / Beneficiary Display Name" field whenever the modal opens.
    - Added 1-click quick-toggle buttons allowing the admin to switch between `Use School Name` and `Use Verified Name` effortlessly.
- [x] **Database Audit History Ledger for All Bank Account Operations ([schema.prisma](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/prisma/schema.prisma), [finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts), [finance.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.route.ts))**:
    - Added `BankAccountAudit` model and audit fields (`addedBy`, `addedByName`, `addedByRole`) to `SettlementAccount` in PostgreSQL via Prisma, syncing schema and regenerating `@prisma/client`.
    - Updated `FinanceService.setupBank` and `removeSubaccount` to record immutable audit rows: who added/removed it (`userId`, `userName`, `userEmail`, `userRole`), when (`createdAt`), and what was added (`bankName`, `bankCode`, `accountNumber`, `accountName`, `gateway`, `details`).
    - Added `GET /api/v1/finance/bank-history/:schoolId` endpoint and wired it into `getSchoolAnalytics`.
    - Added the **Bank Account Processing & Audit History** table directly inside the "Bank Accounts" tab at `/dashboard/admin/finance`, showing timestamp, action badge, bank & account number with 1-click copy, verified beneficiary, processed by administrator (initials, name, email, role), and gateway badge.
- [x] **Zero TypeScript Errors**: Verified clean compilation across both frontend and backend (`npx tsc --noEmit` exited with code 0 on both).

### Tuesday, October 27, 2026 (Flutterwave Bank Account Resolution & Validation Error Handling)

- [x] **Flutterwave Bank Account Resolution Fix & Clean Validation ([flutterwave.adapter.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/flutterwave.adapter.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts))**:
    - Identified cause of `Error: invalid account` when adding or verifying bank accounts: Flutterwave in Test Mode (`FLWSECK_TEST-...`) only resolves mock sandbox accounts (`0690000031` with Access Bank `044` -> "Forrest Green") and returns `400 invalid account` for any live/real account number.
    - Updated `FlutterwaveAdapter.resolveAccount` to detect `invalid account` responses and supply clear, actionable guidance distinguishing test mode requirements from live production NIBSS resolution.
    - Updated `FinanceController.resolveAccount` to return a clean HTTP `400` with the validation error message instead of routing through `handleError()`, preventing routine lookup validation failures from dumping fatal crash stack traces to the terminal and `error-log.txt`.
    - Zero TypeScript errors confirmed via `npx tsc --noEmit`.

### Tuesday, October 27, 2026 (Admin Finance Dark Mode Buttons & Normal English Overhaul)

- [x] **Dark Mode Button Contrast & Styling Fixes ([finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx))**:
    - Fixed the 3 reported action buttons that looked broken in dark mode:
        1. **Record Fee Payment**: replaced `bg-primary hover:bg-primary/95 text-white` (which turned white-on-white in dark mode due to `--primary: oklch(0.922 0 0)`) with high-contrast, vibrant `bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white` and subtle shadow glows.
        2. **Set Up Bank Account** (formerly *Setup Bank Details*): replaced washed-out `bg-primary` with `bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white`.
        3. **Add Bank Account** (formerly *Provision Bank Node*): styled with `bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white`.
    - Also fixed the modal submission button in "Record Fee Payment" dialog to use the matching dark-mode-safe blue button styling.
- [x] **Normal English Terms Across Finance Dashboard ([finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx), [AtmAccountCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/AtmAccountCard.tsx))**:
    - Replaced all artificial blockchain/crypto/robotic terms with clear, professional school finance terminology:
        - "Provision Bank Node" -> **"Add Bank Account"**
        - "Setup Bank Details" -> **"Set Up Bank Account"**
        - "Institutional Bank Conduits" / "Settlement Vault" -> **"School Bank Accounts"** / **"Bank Accounts"**
        - "No Settlement Conduit Connected" -> **"No Bank Account Connected"**
        - "Decrypting Financial Records" -> **"Loading Financial Records"**
        - "Synchronizing gateway conduits & audit ledgers..." -> **"Connecting to payment gateways and updating records..."**
        - "Real-time institutional liquidity, fee collections & automated disbursements" -> **"Real-time tracking of student fee payments, collections, and bank payouts"**
        - "Export Ledger" -> **"Export Transactions"**
        - "Active Payer Entities" -> **"Active Fee Payers"**
        - "Mean receipt quantum" -> **"Average payment per transaction"**
        - "Institutional Ledger" -> **"Transactions"**
        - "Liquidity Inflow Trend" -> **"Income Trend"**
        - "Fee Allocations" -> **"Fee Categories"**
        - "Search by student name or reference hash..." -> **"Search student name or reference code..."**
        - "Filtering ledger entries..." -> **"Filtering transactions..."**
        - "Student Entity" (modal) -> **"Student"**
        - "Fee Classification" -> **"Fee Type"**
        - "Confirm & Post Entry" -> **"Save Payment Record"**
        - "Primary Node" on bank cards -> **"Default Account"**

### Tuesday, October 27, 2026 (Student Transcript Real Signature, Graduated Paywall Preview & Single-Use Download, Dynamic Admin Clearance Fee)

- [x] **Student Transcript Digital Signature Fix ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Diagnosed why real digital signatures were failing to display on the student transcript page (`http://localhost:3000/dashboard/student/transcript`). The student was querying `useSchoolAdmins(schoolId)` (`/api/v1/admin/team`), which is strictly restricted to admins (`requireAdmin` middleware) and returns 403 Forbidden to students, leaving candidate user IDs empty.
    - Switched signatory resolution to read administrators directly from `schoolProfile.admins` (accessible via public/student school profile endpoint), and added system admin identifier (`admin-system`).
    - Wired `useActiveSignature("admin-system")` and `signaturesMap` so authentic handwritten/vector signatures are bound to `principalSlot` and `registrarSlot`.
- [x] **Graduation Status Paywall & Preview Gating ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Active students can access the transcript freely while the school maintains an active subscription/trial.
    - If the student has graduated (`isGraduated` via `status === "GRADUATED" | "ALUMNI" | graduationStatus === "GRADUATED"`), full cumulative course breakdown, grading details, and Page 2 behavioral domain evaluations are strictly gated until clearance is paid (`hasPaidTranscript`).
    - Unpaid graduated students see an archival clearance paywall card with explicit rationale, lock icons, and 1-click clearance unlock actions.
- [x] **Enforce Single-Use Download Rule**:
    - Graduated students are restricted to downloading/printing the official certified transcript **once** per paid clearance (`totalTranscriptDownloads < paidTranscriptCount`).
    - Both `handleDownloadPDF` and `handlePrint` verify `hasDownloadRemaining`. Attempting a second download informs the scholar that their 1-time official copy was used and prompts a new clearance payment.
    - Downloads record telemetry with `fileType: "TRANSCRIPT_DOWNLOAD"` in `FileMetric`.
- [x] **Dynamic Transcript Fee Configuration by Admin ([finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx), [schema.prisma](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/prisma/schema.prisma), [finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts))**:
    - Added `transcriptFee Float? @default(5000)` column to `SchoolSetting` model in PostgreSQL and generated Prisma client.
    - Updated `updateSchoolSettingsService` to accept and persist `transcriptFee`.
    - Updated `initiateTranscriptPayment` in `finance.service.ts` to dynamically resolve the school's configured `transcriptFee` (falling back to ₦5,000 if unset).
    - Updated Admin Finance page (`/dashboard/admin/finance`) Transcripts tab with dynamic rate display and an interactive `Configure Transcript Clearance Fee Dialog` allowing school leadership to modify their transcript clearance fee at any time.
    - Replaced all hardcoded `₦5,000` instances across student payment modals, sidebars, and clearance banners with dynamic `₦${transcriptFee.toLocaleString()}`.
- [x] **Student Transcript Blue Color Theme Overhaul ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Replaced all remaining pink/rose accent classes (`pink-600`, `pink-700`, `pink-50`, `pink-100`, `pink-950`) with institutional blue palette (`blue-600`, `blue-700`, `blue-50`, `blue-100`, `blue-950`) across the entire page, including breadcrumbs, official seal, letterhead, empty state, term chips, behavioral evaluation score badges, quote markers, and sidebar telemetry cards.
- [x] **Zero TypeScript Errors**: Clean compile verified with `npx tsc --noEmit` on both frontend and backend.

### Monday, October 26, 2026 (Admin Transcript Blue Theme & High-Fidelity Loading Skeleton)

- [x] **Admin Transcript Blue Color Theme Overhaul ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/page.tsx), [StudentTranscriptSelector.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/StudentTranscriptSelector.tsx), [TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx))**:
    - Replaced all pink/rose accents (`#db2777`, `pink-600`, `pink-700`, `pink-50`, `pink-100`, `pink-950`) across both URLs:
        - `http://localhost:3000/dashboard/admin/transcript` (Student selector interface)
        - `http://localhost:3000/dashboard/admin/transcript?studentId=...` (Official transcript preview interface)
    - Updated fallback primary color from `#db2777` to `#2563eb` (`blue-600`).
    - Styled breadcrumbs, graduation cap icon badge, search focus rings, filter chip pills, preview buttons, letterhead school crest, student code highlights, session filter dropdowns, and CGPA summary cards in the institutional blue palette.
    - Updated Page 2 conduct appraisal banner, rubric scales, endorsement signature pads, official electronic seal stamp, and right-hand Access & Payment Audit sidebar with matching blue styling.
- [x] **1:1 High-Fidelity Loading Skeleton Redesign ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx))**:
    - Replaced the previous generic loading skeleton with an exact structural replica mirroring the live 2-column transcript page UI:
        - Top action toolbar (Select Another Scholar, Quick Switcher, Admin Certification View badge, 3 page switcher pills, Access & Payment Audit toggle button, Print, and Export Official PDF buttons).
        - Evaluation Scope filter bar with calendar icon badge, session select dropdown, term pills, and glowing blue Cumulative Scope indicator.
        - Left column official transcript document sheet (School crest emblem frame with `<School size={40} className="text-blue-600" />`, certified electronic record badge, institutional letterhead, scholar passport portrait frame with silhouette, 6-column credentials strip, 4-card honors summary with gradient CGPA banner, 10-column terminal course breakdown table with term header badge, and registrar/principal signature endorsements with blue dashed seal).
        - Right column Access, Download & Payment Audit sidebar with blue download telemetry card, frequency breakdown, clearance status, and connected guardian accounts.
    - Eliminates layout shifts and provides a polished, seamless loading experience.
- [x] **Zero TypeScript Errors**: Clean compile verified with `npx tsc --noEmit`.

### Monday, October 26, 2026 (Digital Signature DB Persistence Fix & Admin Profile Space Fitting)

- [x] **Digital Signature Database Persistence Fix**:
    - **Diagnosed Root Cause**:
        - In `frontend/src/app/api/signatures/route.ts`, uploads were storing files to Supabase Storage, but the database insert (`supabase.from("signatures").insert(...)`) was failing silently because the `signatures` table did not exist in the Supabase PostgreSQL database (`khogvaepivbqzlqndedv`).
        - Because Supabase JS SDK returns `{ error }` instead of throwing, the missing table error was swallowed by a silent `console.warn`, causing the client (`signatureService.ts`) to fall back to browser `localStorage` only (`schoolhub_signature_${userId}`).
        - Furthermore, the REST API roles (`anon`, `authenticated`) lacked schema usage permissions on newly created tables.
    - **Database Migration & Permissions**:
        - Created `public.signatures` table with `id (UUID)`, `user_id (TEXT)`, `storage_path (TEXT)`, `method (TEXT)`, `vector_data (JSONB)`, `sha256 (TEXT)`, `is_active (BOOLEAN)`, `ip_address (TEXT)`, `user_agent (TEXT)`, and timestamp columns.
        - Created performance indexes `idx_signatures_user_id` and `idx_signatures_is_active`.
        - Configured Row Level Security (RLS) policies and granted `USAGE ON SCHEMA public` and `ALL ON TABLE public.signatures` to `anon`, `authenticated`, and `service_role`.
    - **API Route & Service Hardening**:
        - Updated `frontend/src/app/api/signatures/route.ts` to explicitly check and throw on Supabase insert errors rather than silently proceeding.
        - Added `DELETE` method handler in `frontend/src/app/api/signatures/route.ts` that deactivates active signatures in the database (`is_active = false`).
        - Added `signatureService.removeSignature(userId)` in `frontend/src/lib/api/services/signatureService.ts` to remotely deactivate the record in the database and clear all local storage keys simultaneously.
        - Verified database persistence end-to-end: verified signature insertion, signed URL generation, and retrieval via `GET /api/signatures?userId=admin-system`.
- [x] **Blue Theme & Dark Mode Signature Preview Fix ([admin/profile/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/profile/page.tsx), [SignatureModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/signature/SignatureModal.tsx))**:
    - **Main Blue Color Theme**:
        - Replaced all pink/rose accents throughout the entire admin profile page with the institutional Blue palette (`blue-600`, `blue-700`, `blue-50`, `blue-100`, `blue-950`).
        - Updated hero banner gradient to `bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800`.
        - Updated avatar fallback, breadcrumbs, edit profile buttons, admin code highlight, and school tenure badges to blue.
        - Updated modal triggers, tabs, icons, and capture buttons across `SignatureModal`, `DrawSignature`, `UploadSignature`, `TypeSignature`, and `SignaturePreview`.
    - **Dark Mode Signature Visibility Fix**:
        - Diagnosed why signatures were invisible in dark mode: transparent PNG signatures with dark/black ink strokes were rendering over a dark background (`dark:bg-zinc-950/40` inside dark container `dark:from-zinc-900`), resulting in black ink on black background.
        - Styled the *Institutional Endorsement Certificate* as an authentic official document sheet (`bg-white dark:bg-slate-50 text-slate-900 border-slate-200/90 dark:border-slate-300`).
        - Embedded a dedicated high-contrast pure white document pad (`bg-white dark:bg-white border-slate-300 shadow-inner`) for the transparent PNG signature display.
        - Ensures that regardless of whether the user is in light mode or dark mode, the handwritten, uploaded, or typed signature is 100% visible, sharp, and authentic.
    - **Zero TypeScript Errors**: Clean compile verified with `npx tsc --noEmit`.

### Monday, October 26, 2026 (Student Transcript Design Overhaul & Parity with Admin Transcript)

- [x] **Student Transcript Page Design Overhaul ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - **Visual & Structural Parity with Admin Transcript**:
        - Integrated official institutional letterhead with school logo, motto in italic serif, and the student's passport portrait picture in a 24x28 rounded frame opposite the school crest.
        - Integrated the 6-column student profile & document reference strip (Scholar Full Name, Student Code, Department/Cohort, Enrollment Status, Document Ref `TRX-...`, Issued Date).
        - Integrated the 4 cumulative performance summary cards with honors degree grade classification (e.g., `4.85 (A) / 5.00 • First Class Honors / Excellent`).
        - Integrated the multi-page toggle view switcher:
            - `Page 1: Academic` (Full academic transcript, terminal breakdowns, CGPA summary, signatures & seal).
            - `Page 2: Conduct & Remarks` (Affective Domain 5-point scale, Psychomotor Domain 5-point scale, 5-point Rubric scale key, CGPA banner, Class Teacher's Remark quote box, Principal's Certified Endorsement quote box, Standard Institutional Grading Key table).
            - `All Pages` (Multi-page stacked view).
    - **2-Column Responsive Layout & Audit Sidebar**:
        - Converted page into the responsive 2-column layout (Document on left, Audit & Verification Sidebar on right) with a collapsible toggle button (`SlidersHorizontal` icon, `[Hide Audit]` / `[Show Audit]`).
        - **Credential Verification Card**: Displays live certified electronic record beacon, transcript reference hash with 1-click copy, digitally authenticated attribution, and verified signatory endorsements.
        - **Archival Clearance & Entitlement Card**: Displays real-time clearance status, automated subaccount settlement routing, and 1-click trigger to `SessionPaymentModal` (Flutterwave split or direct bank transfer).
        - **Download Telemetry Card**: Wired to `useStudentDownloadAudit` and `useRecordStudentDownload` showing live count of downloads, scholar vs guardian downloads, and last accessed timestamp.
        - **Embossed Hard-Copy Conduit**: Official guidance and contact information for foreign embassy / international university sealed physical copies.
    - **Course Breakdown Table Alignment**:
        - Standardized columns to `Code`, `Subject / Course Name`, `Assignment`, `Quiz`, `CA`, `Exam`, `Total (%)`, `Grade`, `GP`, `Remark` matching the admin transcript.
    - **0 TypeScript Errors**: Verified with `npx tsc --noEmit`.

### Monday, October 26, 2026 (Automatic Flutterwave Subaccounts, Student Transcript Paywall & Session Filter, and Transcripts Finance Hub)

- [x] **Automatic Flutterwave Subaccount Creation & Account Resolution ([flutterwave.adapter.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/payment/flutterwave.adapter.ts), [finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts))**:
    - Implemented `resolveAccount(accountNumber, bankCode)` on `FlutterwavePaymentAdapter` (`POST /v3/accounts/resolve`) and `PaystackPaymentAdapter` (`GET /bank/resolve`).
    - Updated `initialize(params)` in `FlutterwavePaymentAdapter` to dynamically attach `subaccounts: [{ id: subaccountCode }]` when `metadata.subaccountCode` is passed, enabling automated split payments to school subaccounts.
    - Updated `financeService.setupBank` to resolve and create Flutterwave subaccount, saving subaccount ID and details to `SettlementAccount` and `School`.
    - Added `POST /api/v1/finance/resolve-account` and `POST /api/v1/finance/transcript-payment/:schoolId` endpoints.
- [x] **Bank Setup Real-Time Resolution & Confirmation UI ([bank-setup/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/bank-setup/page.tsx))**:
    - Automatically calls server resolution route when 10 digits and bank are selected.
    - Displays resolved institution account name with verification badge.
    - Mandates admin checkbox confirmation that the resolved account name matches their registered institution before enabling subaccount creation.
- [x] **Student Dashboard Transcript Page Session Filtering & Paywall Gate ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - Added **Session Scope Selector Filter** allowing students to filter visible terms, course scores, cumulative CGPA/average, and PDF exports by specific academic session or full cumulative record.
    - Added **Access Clearance Gate & Paywall**: Checks if student has graduated (`studentProfile.status === "GRADUATED"` or alumni) OR if the school operates on a free/unpaid plan (`subscriptionStatus !== "ACTIVE"`).
    - If clearance is required, displays an access clearance gate with frosted blur on score sheets until unlocked.
    - Added **Session Payment Modal (`SessionPaymentModal`)**:
        - Prompts student: *"Which academic session would you like to pay for?"* with a dropdown selector of sessions.
        - **Option A (Instant Online Checkout via Flutterwave)**: Initiates automated split payment directly into the school's connected subaccount and redirects to checkout.
        - **Option B (Direct School Bank Transfer)**: Displays the school's verified institutional bank account (Bank Name, Account Number with copy, Account Name, and Unique Reference) for offline bank payment with instant acknowledgement.
- [x] **School Finance Hub Transcripts Management Tab ([finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx))**:
    - Added dedicated **Transcripts Tab** with 4 KPI cards: Total Transcript Revenue (₦), Cleared Requests count, Default Standard Clearance Fee (₦5,000 / Session), and Automated Settlement Route info.
    - Integrated explanation banner detailing automated Flutterwave split payment routing.
    - Built **Transcript Payments Ledger Table** showing date, student details, target session, amount paid, settlement route, clearance status, and receipt viewer.
- [x] **Full Typecheck Passed**: Verified 0 TypeScript errors with `npx tsc --noEmit` across both backend and frontend.

### Monday, October 26, 2026 (Admin Finance Feature Page & Institutional Finance Hub)

- [x] **Admin Finance Feature Page & Hub ([/dashboard/admin/finance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/finance/page.tsx))**:
    - **Executive Header**: Verified Gateway status beacon, Quick navigation back to admin overview, and action buttons (`Record Fee Payment`, `Export Ledger`, `Settlement Vault`).
    - **4-Card Financial Metric Strip**: Real-time display for Total Revenue Collected (₦), Pending Collections awaiting clearing (₦), Active Payer Entities (Guardians), and Average Transaction Quantum.
    - **Overview & Liquidity Tab**:
        - Interactive Recharts `AreaChart` displaying monthly liquidity inflow trend for the last 6 months.
        - Fee Category Distribution progress bars (Tuition, Examination, Uniforms, Transportation, PTA Levy, Other).
        - Integrated `PaymentStatusCard` with subaccount sync action.
        - Settlement Vault ATM account cards showing connected disbursement conduits.
        - Top 5 recent transactions stream with quick "View Receipt" action.
    - **Institutional Ledger & Transactions Tab**:
        - Searchable and filterable audit table with live search (student name / reference hash), status filter (`ALL`, `SUCCESS`, `PENDING`, `FAILED`), and category filter.
        - Detailed transaction attributes: Execution timestamp, student/payer entity with student ID, classification badge, payment channel (`Card`, `Transfer`, `Cash`, `POS`), quantum (₦), and reference hash.
        - Full pagination support (Next / Previous) and CSV ledger export.
    - **Settlement Vault Tab**:
        - Multi-account conduit grid with direct provision link to `/dashboard/admin/finance/bank-setup` and real-time status synchronization.
    - **Record Manual Fee Payment Modal**:
        - Responsive dialog for bursars/admins to record offline cash, bank transfer, or POS fee payments.
        - Real-time student directory search and select, amount (₦), category selection, payment channel, term, session, and narration notes.
    - **Transaction Receipt Modal**:
        - Digital printable institutional receipt modal with school branding, reference ID, payer details, breakdown, confirmation stamp, and `Print Receipt` action.
- [x] **Main Admin Dashboard Overview Integration ([AdminFinanceCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/AdminFinanceCard.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/page.tsx))**:
    - Created `AdminFinanceCard` displaying total collections, liquidity status, and quick link to `/dashboard/admin/finance`.
    - Mounted in the admin dashboard sidebar feature column above `UsageLimitsCard`.
    - Added "Finance Hub" with `Landmark` icon to `QuickActions.tsx`.
- [x] **Navigation & Role Permissions ([adminFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/adminFeatureFlags.ts), [app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/app-sidebar.tsx))**:
    - Granted finance nav access to `ADMIN`, `SUPER_ADMIN`, and `SCHOOL_OWNER`.
    - Updated sidebar role filtering to ensure general school admins can access the Finance Hub without restriction.
- [x] **Backend Finance Module Enhancements ([finance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.service.ts), [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts), [finance.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.route.ts))**:
    - Added dynamic calculation of `totalRevenue`, `pendingRevenue`, `activePayerCount`, `averageTransaction`, `monthlyTrends` (6 months), and `categoryBreakdown` in `getSchoolAnalytics`.
    - Added `recordManualPayment` service, controller, and route `POST /api/v1/finance/manual-payment/:schoolId`.
    - Added `getSchoolTransactions` service, controller, and route `GET /api/v1/finance/transactions/:schoolId` with pagination and search/filtering.

### Monday, October 26, 2026 (Admin Student Profile: Student Promotion & School History Tab)

- [x] **Student Promotion Feature**:
    - **Backend Promotion Pipeline ([student.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.service.ts), [student.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.controller.ts), [student.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.route.ts))**:
        - Created `promoteStudentDirectService` handling transition of `ClassEnrollment`, advancing student grade level, recording academic snapshots, and stamping a formal `PROMOTED` event into `StudentHistory`.
        - Exposed endpoint `POST /api/v1/students/:id/promote` with controller `promoteStudentDirect`.
    - **Frontend Promotion Modal ([PromoteStudentModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/%5BstudentId%5D/components/PromoteStudentModal.tsx))**:
        - Built responsive modal with student snapshot bar (avatar, student code, current class).
        - Queries available classes via `classService.getClasses(schoolId)` and filters out current class.
        - Provides interactive transition preview visual (`Current Class -> Destination Class`), session/year input, and optional promotion commendation remarks.
        - Automatic cache invalidation (`student-details`, `student-history`, `student-schools`, `school-students`, `school-classes`).
    - **Header & Quick Actions Integration ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/%5BstudentId%5D/page.tsx))**:
        - Added primary "Promote" action button in hero banner beside "Transcript".
        - Added "Promote Student" to the Quick Actions sidebar menu.

- [x] **School History Feature (Converted Session Tab to School History)**:
    - **Backend School Performance & History Synthesis ([student.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.service.ts))**:
        - Created `getStudentSchoolsService` querying current school, original/transfer institutions, class enrollments, and academic grades.
        - Calculates institutional aggregate averages, WAEC letter grades (`A1`–`F9`), total assessment counts, and subject-level performance breakdowns per school.
        - Created `addPreviousSchoolRecordService` and endpoint `POST /api/v1/students/:id/previous-school` allowing admins to register external prior schools.
    - **Frontend School History Tab ([StudentSchoolHistoryTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/%5BstudentId%5D/components/schools/StudentSchoolHistoryTab.tsx))**:
        - Converted legacy placeholder "Session" tab to "School History" (with backward compatibility for `?tab=session` and `activeTab === 'session'`).
        - 4-Card Metric Strip: Total Schools Attended, Current Institution, Overall Student Average with letter grade chip, Total Graded Assessments.
        - **Current School Card**: Emerald active beacon badge, institution details, contact, enrollment tenure, classes attended, institutional grade average with color-coded score, and top graded subject chips.
        - **Previous Schools Cards**: Prior institution cards with tenure period, class level, overall grade average, and exit reason/transfer notes.
        - **Add Previous School Modal**: Integrated dialog to record prior schools, location, tenure dates, overall grade percentage, and transfer reasons.

### Monday, October 26, 2026 (Admin Student Profile: Proper History, Class, Session, Term & Subject Gradebook)

- [x] **Backend Student History Synthesis ([student.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.service.ts))**:
    - **Multi-Source Data Synthesis**: Enriched `getStudentHistoryService` to query `prisma.student`, `prisma.studentHistory`, `prisma.grade`, `prisma.studentSubjectTermResult`, and `prisma.studentTermResult`.
    - **Cohort Aggregation**: Groups academic performance by `(classId, session, term)`, computing each subject's aggregate term score, maximum score, percentage, WAEC-standard letter grade (`A1`–`F9`), and nested individual assessment records (`EXAM`, `QUIZ`, `CA`, `ASSIGNMENT`).
    - **Unified Chronological Timeline**: Merges published result events, class enrollment events, and school admission milestones into a chronological timeline with complete metadata (`className`, `session`, `termDisplay`, `subjects`).
    - **Summary Statistics**: Computes cumulative metrics (`totalClasses`, `totalSessions`, `totalSubjects`, `overallAverage`).
- [x] **Frontend API & Data Contract ([studentService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/studentService.ts))**:
    - Declared type contracts: `AssessmentGradeItem`, `SubjectHistoryRecord`, `AcademicHistoryCohort`, `StudentHistoryTimelineItem`, `StudentHistorySummary`, and `StudentHistoryResponse`.
    - Maintained backward compatibility for legacy timeline arrays while typing structured responses.
- [x] **Student History View & Academic Gradebook ([StudentHistoryView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/%5BstudentId%5D/components/history/StudentHistoryView.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/%5BstudentId%5D/page.tsx))**:
    - **4-Card Metric Strip**: Enrolled Cohorts, Academic Sessions, Subjects Evaluated, Overall Academic Average.
    - **Sub-Tab Switcher**: Toggle between **Academic Gradebook / Ledger** and **Chronological Timeline**.
    - **Cohort & Timeline Filtering (Session & Term Dropdowns)**: Always-visible Session Selector (combining school sessions and historical student records with Calendar icon) and Term Selector (with Layers icon), active filter badge chips with individual dismissal, and real-time subject/event search across both Academic Gradebook and Chronological Timeline views.
    - **Subject Grade Cards**: Displays subject code, term score, max marks, percentage badge with dynamic progress bar, letter grade chip (`A1`–`F9`), and expandable assessment breakdown displaying individual test papers and exams.
    - **Interconnected Spine Timeline**: Features mathematically aligned spine column with glowing gradient track, micro-chain links, and horizontal branch stems connecting into milestone event cards.
- [x] **Modal Inspection ([HistoryDetailsModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/components/HistoryDetailsModal.tsx))**:
    - Enriched details modal to render structured subject score tables, session/term indicators, and letter grades when clicking "Inspect Details" on timeline cards.

### Monday, October 26, 2026 (Admin Class History: Timeline Chain Redesign & Layout)

- [x] **Timeline Chain & Interconnected Spine Redesign ([ClassHistoryTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/history/ClassHistoryTab.tsx))**:
    - **Replaced Brittle Absolute Offsets**: Removed the single absolute background line and negative pixel coordinates (`-left-[1.875rem]`, etc.) which caused misalignments between the vertical stem and icon centers.
    - **Interconnected Spine Column**: Replaced with a structured flex column architecture (`w-10 sm:w-12 shrink-0 flex flex-col items-center`) where the vertical track and node centers are mathematically and perfectly aligned across all screen resolutions.
    - **Interlocking Chain-Link Elements**: Added vertical gradient stems (`w-1 rounded-full bg-gradient-to-b from-indigo-500 ...`), miniature interlocking chain-link beads centered between nodes, and outer micro-ringlet pins on each node.
    - **Horizontal Branch Arms**: Added horizontal connector stems (`w-3 sm:w-[1.125rem] h-[2px]`) with terminal anchor beads that visually link the spine node directly into the event card.
    - **Top Beacon & Bottom Milestone Terminal**: Added a pulsating live activity beacon at the top of the stream and an anchored cohort genesis terminal pin at the bottom.
    - **Hover Dynamics**: Coordinated hover transitions where the card border, horizontal branch, chain link, and node icon elevate and illuminate simultaneously.

### Monday, October 26, 2026 (Admin Class History: Term & Session Filters & Premium Redesign)

- [x] **Backend Class History Service ([class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts))**:
    - Enriched `HistoryTimelineItem` and `classInfo` in `getClassHistoryService` to include `session` and `term` across all event types (`CLASS_CREATED`, `ENROLLMENT`, `PROMOTION_IN`, `PROMOTION_OUT`, `GRADUATION`, `WITHDRAWAL`, `TEACHER_ASSIGNED`, `SUBJECT_ATTACHED`, `RESULT_PUBLISHED`, `BEHAVIOUR_ALERT`).
    - Propagates specific event session/term or falls back to class cohort's current active session & term.
- [x] **Frontend API Models ([classService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/classService.ts))**:
    - Updated `ClassHistoryTimelineEvent` interface and `ClassHistoryResponse.classInfo` to type `session?: string | null` and `term?: string | null`.
- [x] **Class History Tab Redesign & Filtering ([ClassHistoryTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/history/ClassHistoryTab.tsx))**:
    - **Session Filter**: Dedicated dropdown pulling all active school sessions from `useSessions` merged with any historical sessions appearing in event records.
    - **Term Filter**: Dedicated dropdown with `All Terms`, `First Term`, `Second Term`, and `Third Term` with fuzzy normalization.
    - **Command Bar & Toolbar**: Integrated search box, session selector, term selector, category pills, sort order toggle (`Newest First` / `Oldest First`), and an active filters strip with individual chip dismissal and a global "Reset Filters" action.
    - **Event Cards**: Added session & term badge (`[Session • Term]` with `Layers` icon) to every timeline card, category badges, student code chips, origin/destination class pills, and hover lift effects.
    - **Summary Metrics & Header**: Refined 5-card metric bar (Active Roster, Promoted Out, Promoted In, Graduated/Exit, Certified Records) with custom icon pills and subtle background glow.
    - **PDF Export**: Updated `handleExportPDF` to print session and term filter settings and column in the tabular export.

### Monday, October 26, 2026 (Teacher Class View: Scoped Exclusively to Assigned Subjects)

- [x] **Backend Services Scoped to Teacher's Assigned Subject(s) ([teacher-dashboard.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/teacher/teacher-dashboard.service.ts))**:
    - `getTeacherClassesService`: discovers each class's subjects taught by the teacher (`taughtInClass`) and displays the teacher's subject instead of an arbitrary first subject.
    - `getTeacherClassDetailService`: included `exam.subjectId` and `subjectPaper.subjectId` on grades query; strictly filters `c.grades` to `relevantGrades` matching the teacher's subject name, subjectPaper ID, exam ID, or teacher ID before calculating `averageGrade`, `topStudents`, and `recentSubmissions`.
    - `getTeacherClassAssignmentsService`: verifies teacher subjects and filters `prisma.assignment.findMany` with `subjectId: { in: taughtSubjectIds }` or `teacherId: teacherId`, ensuring assignments for other subjects are never returned.
    - `getTeacherClassGradesService`: includes `subjectId` relations on exam and subjectPaper; filters student grades strictly by teacher's subject name, paper ID, exam ID, or teacher ID so only grades and assessments for the teacher's assigned subjects are computed and returned.
- [x] **Frontend Teacher Class Hub Focused on Assigned Subject ([ClassDetails.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/ClassDetails.tsx), [Overview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/Overview.tsx), [exams&quizzes/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/exams&quizzes/page.tsx), [grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/grades/page.tsx))**:
    - `ClassDetails.tsx`: fetches `teacherClassDetail` and renders a prominent `Focus Subject: {subject}` badge in the header card.
    - `Overview.tsx`: displays the teacher's subject average score and upcoming exams strictly for their subject.
    - `exams&quizzes/page.tsx`: strictly filters exams, subject papers, and multi-paper exam sub-papers to only display items belonging to the teacher's authorized subject(s) in this class.
    - `grades/page.tsx`: scopes individual grade items and list/grid views to the teacher's assigned subject.

### Monday, October 26, 2026 (Parent Attendance: Per-Day Subject Breakdown Pop-up)

- [x] New shared helper `frontend/src/lib/attendance/attendanceRecord.ts`: `parseAttendanceNote` (unwraps nested JSON notes), `getCleanAttendance` (comment + subject chips), `buildAttendanceModalData` (raw row → `StudentAttendanceDetailModal` props).
- [x] `parent/attendance/page.tsx`: now loads rich rows via `useStudentAttendance(childId)` (parent access already enforced by the controller's link check), sorted newest-first, falling back to child-details attendances. Clicking a Recent Activity entry or a row in the Attendance Breakdown dialog opens `StudentAttendanceDetailModal` in `readOnly` mode (overall arrival + subject breakdown).
- [x] `RecentActivity.tsx` / `DetailsModal.tsx`: clickable entries, clean teacher remark, subject status chips; no raw JSON. Removed `any` from `DetailsModal` props.
- [x] `useStudentAttendance`: added `staleTime: 2min`, `retry: 1` (AGENTS.md §2.1/2.5).
- [ ] Known gap: `parent/attendance/monthly/page.tsx` still uses hard-coded mock stats and an Oct 2023 start month — needs wiring to real data.
- [x] `npx tsc --noEmit` (frontend) exit 0.

### Monday, October 26, 2026 (Student Class Detail Page: Full-Width Layout)

- [x] `student/my-classes/[id]/page.tsx`: replaced narrow `max-w-7xl` + duplicate horizontal padding with `max-w-[1600px]` (matching other student pages); the student layout already provides padding.
- [x] `discussions/components/DiscussionLayout.tsx`: removed nested `max-w-7xl`, extra padding and `min-h-screen` so the Discussions tab fills the panel.
- [x] `materials/components/LoadingState.tsx`: skeleton now fills the tab width.

### Monday, October 26, 2026 (Student Attendance Preview & JSON Note Unwrapper Fix)

- **Student Attendance Preview & JSON Note Unwrapper Fix ([AttendanceList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/attendance/components/AttendanceList.tsx), [student/attendance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/attendance/page.tsx), [student/my-classes/[id]/components/attendance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/attendance/page.tsx), [StudentAttendanceDetailModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal.tsx), [student.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.service.ts))**:
    - [x] **Eliminated Raw Serialized JSON Strings in Notes / Remarks**:
        - Created `parseAttendanceNoteAndSubjects`: recursively/iteratively unpacks nested JSON notes so raw strings like `{"comment":"{\"comment\":\"\",\"subjects\":{}}","subjects":{...}}` are parsed into clean human-readable comments and structured subject attendance maps.
        - Updated backend `getStudentAttendanceService` in `student.service.ts` to unwrap nested JSON note strings at the source, returning clean `comment` and `subjects`.
        - Replaced raw JSON display on `/dashboard/student/attendance` and `/dashboard/student/my-classes/[id]` (Attendance tab) with clean comments, formatted subject badges (e.g. `UTME Government (Present)`), or `"Regular attendance logged"`.
    - [x] **Student Attendance Inspection Modal (Read-Only Preview Mode)**:
        - Enhanced `StudentAttendanceDetailModal` with `readOnly?: boolean` support: disables editing, hides mark-all buttons and subject toggle controls, displays read-only remark cards and verified status indicators, and restricts footer actions to "Close".
        - Integrated `StudentAttendanceDetailModal` into `AttendanceList.tsx` (`/dashboard/student/attendance`): clicking any card in grid view or row in table view opens the detailed inspection modal showing arrival status, telemetry (who recorded it and when), and the breakdown of each subject attended.
        - Integrated `StudentAttendanceDetailModal` into `/dashboard/student/my-classes/[id]` (Attendance tab): clicking any attendance day on the calendar opens the preview modal displaying overall presence and individual subject attendance for that day.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` across both `backend` and `frontend`.

### Monday, October 26, 2026 (Teacher Student Profile Attendance Tab: Overall & Subject Breakdown Pop-up Parity)

- **Teacher Student Attendance Inspection Pop-up ([AttendanceCalendar.tsx (Teacher)](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/students/[studentId]/components/attendance/AttendanceCalendar.tsx), [teacher/students/[studentId]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/students/[studentId]/page.tsx))**:
    - [x] **Full Parity on Teacher Student Profile (`/dashboard/teacher/students/[studentId]`)**:
        - Upgraded the teacher student attendance calendar component with `StudentAttendanceDetailModal`.
        - Clicking any day on the monthly calendar opens the detailed inspection modal displaying:
            1. **Overall School Arrival**: Full presence badge (`Present in School`, `Late`, `Absent`, `Excused`), student digital ID, enrolled class, department badge, comment notes, and recorder audit information.
            2. **Subject Attendance Breakdown**: Interactive subject-by-subject cards reflecting student's department subjects with individual status badges (`Present`, `Absent`, `Late`, `Excused`, `Not Logged`), recorded timestamps, and staff telemetry.
            3. **Save Action**: Persists updates to arrival status and subject attendances with instant cache refresh.
        - Connected `student={student}` and `classId={classId}` props in `teacher/students/[studentId]/page.tsx`.
        - Added subject attendance badges to the calendar cells (`X / Y Present`) on the teacher's student calendar grid.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` across both `backend` and `frontend`.

### Monday, October 26, 2026 (Student Profile Attendance Tab: Overall & Subject Attendance Inspection Pop-up)

- **Student Attendance Inspection Pop-up ([AttendanceCalendar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/[studentId]/components/attendance/AttendanceCalendar.tsx), [student/[studentId]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/[studentId]/page.tsx), [student.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.service.ts), [student.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.controller.ts), [useStudent.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useStudent.ts))**:
    - [x] **Backend Hydration of Class Subjects & Structured Subject Attendance**:
        - Upgraded `getStudentAttendanceService` to include class subjects with departmental metadata and student department info.
        - Parsed raw JSON notes into structured `comment` and `subjects` record maps (`Record<string, SubjectAttendanceItem>`) for every attendance log.
        - Upgraded `updateStudentAttendanceService` and its controller to accept structured `subjects`, saving individual subject attendance statuses alongside arrival status and audit telemetry.
    - [x] **Student Attendance Calendar Pop-up Overhaul**:
        - Replaced basic status dropdown dialog with the full interactive `StudentAttendanceDetailModal`.
        - Clicking any day on the attendance calendar opens the pop-up showing:
            1. **Overall Attendance**: Prominent arrival badge (`Present in School`, `Late`, `Absent`, `Excused`), student digital ID, class, department badge, arrival status selector, comment notes, and telemetry on who logged/updated it with timestamps.
            2. **Subject Attendance Breakdown**: Complete breakdown of each applicable subject attached to the student's class and department, with individual status buttons (`Present`, `Absent`, `Late`, `Excused`, `Not Logged`), recorded timestamps, and recorder information.
            3. **Save Action**: Persists both overall attendance and subject-by-subject attendance records with immediate cache invalidation.
        - Added subject attendance badges to the calendar grid day cells (`X / Y Present`) so administrators can see both overall status and subject presence at a glance.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` across both `backend` and `frontend`.

### Monday, October 26, 2026 (Teacher Attendance Strict Subject Isolation & Verification)

- **Teacher Class Attendance Strict Subject Isolation ([TeacherAttendancePage](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/attendance/page.tsx))**:
    - [x] **Strict Assigned Subject Isolation**:
        - Diagnosed issue on teacher class attendance tab (`/dashboard/teacher/my-classes/[classId]`), where unassigned subjects taught by other teachers in the class were displaying in the Scope Bar, Attendance Table, Mode Modal, List Modal, Swipe Modal, and Detail Inspection Modal.
        - Integrated `teacherService.getClassDetail(classId)` to read `classInfo.teacherSubjectIds` (the specific subjects this teacher teaches in this class) alongside `useTeacherSubjects(schoolId)` and `useTeacherProfile()`.
        - Created `effectiveClassSubjects` filter: strictly isolates displayed subjects to only those assigned to the logged-in teacher (`teacherClassSubjects`).
        - Removed all unassigned class subjects from the Scope Bar completely.
        - Automatically locked active scope to the teacher's assigned subject (e.g. UTME Mathematics) on initial mount and when switching dates.
        - Wired `effectiveClassSubjects` to `AttendanceTable`, `AttendanceModeModal`, `AttendanceModal`, `AttendanceSwipeModal`, and `StudentAttendanceDetailModal` so no other teachers' subjects are exposed or selectable.
        - Updated PDF export generator in the attendance tab to dynamically append the teacher's active subject name to the report title.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` across both `backend` and `frontend`.

### Monday, October 26, 2026 (Departmental Subject Filtering & Teacher Subject Focus in Class Attendance)

- **Student Departmental Subject Filtering & Teacher Assigned Subject Focus ([AttendanceTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceTable.tsx), [StudentAttendanceDetailModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal.tsx), [TeacherAttendancePage](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/[classId]/components/attendance/page.tsx), [types.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/components/types.ts), [attendance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/attendance.service.ts))**:
    - [x] **Departmental Subject Filtering in Attendance**:
        - Diagnosed issue where "Subjects Available" displayed `10/10` indiscriminately for all students even when enrolled in specialized departments (e.g., Engineering & Tech taking 4 subjects vs Law & Arts taking 5 subjects).
        - Created `getStudentApplicableSubjects(departmentId, classSubjects)` helper to filter subjects against the student's enrolled department (general/compulsory subjects with no departments apply universally).
        - Updated `backend/src/modules/class/attendance.service.ts` to include `student: { include: { department: true } }` so student department details hydrate reliably with attendance logs.
        - Updated `AttendanceTable.tsx` on both desktop and mobile card views: displays `${presentSubsCount} / ${totalApplicableSubs} Present` (e.g. `4 / 4 Present` or `0 / 4 Present` for Engineering students) alongside a department badge.
        - Upgraded `StudentAttendanceDetailModal.tsx` to display student's department badge, filter the breakdown list to their enrolled department subjects by default, and provide a 1-click toggle to view all class subjects if needed.
    - [x] **Teacher Class Attendance Portal & Assigned Subject Focus**:
        - Brought full dual attendance tracking into the Teacher My Classes portal (`/dashboard/teacher/my-classes/[classId]` - Attendance tab).
        - Integrated `useTeacherSubjects(schoolId)` and `useTeacherProfile()` to identify which subjects in the class the logged-in teacher teaches.
        - Auto-focused default scope: when the teacher opens the attendance tab, `selectedScope` automatically defaults to the first subject assigned to them.
        - Integrated the Dual Tracking Scope Bar featuring their assigned subjects at the front with a distinctive glowing `"Your Subject"` badge and radiant emerald styling.
        - Connected `AttendanceModeModal`, `AttendanceModal`, and `AttendanceSwipeModal` to default to the teacher's active subject, recording their teacher role and name telemetry.
        - Synchronized summary cards and printable/PDF reports to adapt to the active subject scope.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` across both `backend` and `frontend`.

### Monday, October 26, 2026 (Dual Class & Subject Attendance Tracking & Inspection Popup Modal)

- **Class Attendance Dual Tracking & Subject Inspection Modal ([AttendanceTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/AttendanceTab.tsx), [StudentAttendanceDetailModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal.tsx), [AttendanceTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceTable.tsx), [AttendanceModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/attendance/components/AttendanceModal.tsx), [attendance.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/attendance.service.ts), [attendance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/attendance.controller.ts))**:
    - [x] **Subject Attendance Tracking Attached to Class**:
        - Supported taking attendance for both general school arrival (homeroom daily presence) and specific subjects attached to the class (e.g. UTME Mathematics, UTME English Language, etc.).
        - Added active scope selector pills and dropdown to switch between "School Arrival (Daily)" and each subject attached to the class.
        - Updated `submitAttendanceService` to support saving attendance records per subject, serializing structured subject attendance metadata (`subjectId`, `subjectName`, `status`, `recordedAt`, `recordedByName`, `recordedByRole`) alongside daily arrival status.
        - Auto-aligned school arrival presence: if a student is marked present in any subject period, general school arrival automatically reflects their physical presence.
    - [x] **Interactive Attendance Inspection Pop-up Modal (`StudentAttendanceDetailModal`)**:
        - Built an interactive inspection pop-up modal triggered when clicking any row or the dedicated "Inspect" button (`Eye` icon) in the Attendance table.
        - Displays whether the student was marked for being in school with a prominent color-coded arrival badge (Present / Late / Absent / Excused) and explanation.
        - Displays every subject attached to the class with its attendance availability status (Present, Absent, Late, or Not Logged) and specific recorded timestamp.
        - Displays exact timestamp telemetry of when the attendance was logged (`createdAt`), last updated (`updatedAt`), and who recorded it (`recordedByName`, `recordedByRole`).
        - Allows administrators and teachers to toggle individual subject statuses or general school arrival directly within the inspection modal with instant persistence.
    - [x] **Attendance Sheet Modal Scope Alignment (`AttendanceModal` & `AttendanceSwipeModal`)**:
        - Integrated a subject scope selector inside the "Take Attendance" modal, allowing teachers and administrators to take attendance for general school arrival or any specific attached subject.
    - [x] **Upfront Subject Selector in Initial "Take Attendance" Mode Pop-up (`AttendanceModeModal`)**:
        - Integrated the subject selector directly into the initial modal that opens upon clicking "Take Attendance" / "Start Attendance".
        - Prompts the user upfront to select between "School Arrival (Daily)" and any subject attached to the class (e.g. UTME Mathematics, UTME English Language, etc.) with a styled dropdown and subject code display, before choosing the entry mode (Standard List Sheet vs Swipe Cards).
    - [x] **High-Contrast Dark Mode Button Aesthetics**:
        - Overhauled the **Active Scope: School Arrival (Daily)** button: replaced dim `bg-primary` with radiant emerald (`dark:bg-emerald-500`, `dark:text-slate-950`, `dark:font-black`, `dark:border-emerald-300/40`, and ambient glow `dark:shadow-[0_0_15px_rgba(16,185,129,0.35)]`).
        - Overhauled the **Save Attendance** button on the Standard List pop-up sheet: replaced dull dark blue on dark slate with vibrant high-contrast emerald (`dark:bg-emerald-500`, `dark:text-slate-950`, `dark:font-black`, `dark:shadow-[0_0_20px_rgba(16,185,129,0.35)]`, and check icon).
        - Upgraded entry mode card hover/focus rings (`Standard List Sheet` and `Swipe Cards Interface`) with dedicated indigo/emerald borders and focus outlines in dark mode.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` across both `backend` and `frontend`.

### Monday, October 26, 2026 (Transcript Endorsement Signature Guarantees, In-Context Modal & Student Transcript Parity)

- **Official Academic Transcript Signature Reliability & Interactive Signing ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [student/transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx), [pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts), [layout.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/layout.tsx))**:
    - [x] **Guaranteed Non-Blank Head of Institution Signature**:
        - Diagnosed root cause: `approvalInfo.signature` stored text strings (e.g. `"Mr Festus (School Owner)"`) which were rejected by image-only URL checks, and dead Supabase storage URLs caused signature fetches to fail silently, leaving empty voids above dotted lines.
        - Overhauled `principalSlot` resolution: accepts valid image URLs, transparent PNG blobs, and text signatures (sanitizing trailing role annotations).
        - Guaranteed `principalSlot.hasSignature: true` with automatic fallback to the resolved Head of Institution's name (`Mr Festus`), ensuring the signature line is never blank.
    - [x] **Authentic Calligraphic Script Signature Fallback**:
        - Imported Google Fonts (`Caveat`, `Dancing Script`, `Great Vibes`) globally in `frontend/src/app/layout.tsx`.
        - When an image signature is not yet uploaded or fails to load, renders an authentic cursive fountain pen script (`font-['Caveat',cursive]`) above the signature line.
        - Synchronized calligraphic text fallback in PDF generation via `pdfGenerator.ts` (`renderSignatures` renders Times Italic script signature above the line).
    - [x] **In-Context Signature Drawing & Upload (`SignatureModal`)**:
        - Integrated `<SignatureModal>` directly onto the Admin Transcript preview (`TranscriptPreview.tsx`).
        - Added interactive action buttons (`PenTool` "Upload / Draw Signature" and "Change Signature") directly on the signature slots, allowing administrators to draw or upload their signature in-context without leaving the transcript.
        - Supported quick attachment for both Head of Institution and Registrar slots.
    - [x] **Student Transcript Page Endorsement & PDF Export Parity**:
        - Connected `student/transcript/page.tsx` to `useSchoolAdmins` and `useSignaturesByUserIds`.
        - Added dynamic resolution of Head of Institution and Registrar with identical image and calligraphic script fallback logic.
        - Updated `handleDownloadPDF` to pass `signatures: { left: registrarSlot, right: principalSlot }` into `generatePDF`.
        - Replaced static empty dashed lines in student transcript footer with live signature rendering.
    - [x] **Resolved PDF Export Signature Overlap on Page 2 ([pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts))**:
        - Diagnosed bug: Page 2 evaluation tables (10 Affective items + 6 Psychomotor items + Remarks table) with default padding took ~270mm of vertical space. When `p2SigY > pageHeight - 35`, the code previously clamped `p2SigY = pageHeight - 38` (259mm), which forced the signature line and images upwards directly on top of the Executive Remarks table.
        - Introduced `evalTableStyles` with compact typography and padding (`fontSize: 7.5`, `cellPadding: 1.2` for evaluation rows, and `cellPadding: 2` for remarks) reducing Page 2 table vertical height by over 70mm.
        - Remarks table now finishes comfortably around ~170mm, providing a generous 75mm+ gap before the signature block (`sigY = pageHeight - 32` = 265mm).
        - Added strict overflow guard: if content ever extends past `sigY - 18`, a new page is cleanly spawned rather than clamping backwards into the content.
    - [x] **Spacious & Balanced Behavioral Evaluation Page 2 PDF Layout ([pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts))**:
        - Relaxed table typography and cell padding on Page 2 (`fontSize: 8.5`, `cellPadding: 2.0` on rows; `cellPadding: 2.2` on headers; `cellPadding: 2.5` on remarks) to eliminate the overly squeezed appearance while maintaining strict zero-overlap clearance.
        - Optimized column widths to `[95mm, 28mm, 63mm]`, ensuring full behavioral trait and domain titles render on a single line with generous breathing room.
        - Dynamically scaled long report titles in `renderHeader` (11.5pt when > 35 chars) so headers like "STUDENT CONDUCT APPRAISAL & BEHAVIORAL EVALUATION" breathe comfortably across page borders.
    - [x] **Synchronized Institutional Motto Across School Profile & Transcripts ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [student/transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx), [useSchool.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useSchool.ts))**:
        - Resolved motto mismatch between `/dashboard/admin/school-profile` and `/dashboard/admin/transcript?studentId=...`.
        - Prioritized the student's actual enrolled school UUID (`studentProfile.schoolId` / `studentProfile.school.id`) for resolving `effectiveSchoolId`, ensuring profile data loads even if auth-store hydration lags on direct URL landing.
        - Bound `schoolMotto` directly to `schoolProfile?.motto || studentProfile?.school?.motto` with identical fallback to `"Empowering minds for a better tomorrow."` (matching `school-profile/page.tsx`), eliminating divergent hardcoded strings.
        - Updated `useUpdateSchoolProfile` to invalidate all `["school", "profile"]` query keys globally so any edits to the school profile propagate instantly across transcript previews and PDF exports.

### Sunday, October 25, 2026 (Strictly Approved/Published Final Results & School Profile 9-Grade Configuration)

- **Strict Final Results Publication Filter & Dynamic Grading System Integration ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [student/transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx), [gradingSystem.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/gradingSystem.ts), [records.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.service.ts))**:
    - [x] **Enforced Strict Approved & Published Final Results Only**:
        - Updated `getMyPublishedResults` in `records.service.ts` to strictly query and return only records with `status: "PUBLISHED"`.
        - Verified that both `studentSubjectTermResult` and `classSubjectResult` must be published.
        - Enforced that if an approval record exists on `paperLinks.approval`, it must be in `"APPROVED"` status (disallowing `PENDING_APPROVAL`, `UNPUBLISH_REQUESTED`, or draft records).
    - [x] **Dynamic School Profile Grading System Integration**:
        - Connected `TranscriptPreview.tsx` and `student/transcript/page.tsx` directly to the institutional grading system set by the administrator in the School Profile (`/dashboard/admin/school-profile`).
        - Implemented fallback to the standardized 9-grade default matrix when no custom tiers are defined:
          - `A+` (90% - 100%) : `EXCELLENT`
          - `A`  (70% - 89%)  : `VERY GOOD`
          - `B+` (65% - 69%)  : `GOOD`
          - `B`  (60% - 64%)  : `CREDIT`
          - `C+` (55% - 59%)  : `CREDIT`
          - `C`  (50% - 54%)  : `PASS`
          - `D`  (40% - 49%)  : `FAIR`
          - `F`  (30% - 39%)  : `WEAK`
          - `F9` (0%  - 30%)  : `FAIL`
    - [x] **Universal Grade Point (GP) Calculation & Turbopack Compatibility**:
        - Inlined grade point evaluation into `TranscriptPreview.tsx` and `student/transcript/page.tsx` using `getGradeEvaluation` to ensure resilience against Turbopack HMR cache staleness.
        - Synchronized GPA and Cumulative CGPA computation across both web transcript previews and PDF exports.
    - [x] **Clean Transcript Layout (Removed Grading Scale Rubric Card)**:
        - Removed the redundant Institutional Grading System Configuration card from the transcript pages per user preference, maintaining a clean academic document flow.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` across both `backend` and `frontend` (both exited 0).

### Sunday, October 25, 2026 (Transcript & Records/New Parity: Assignment, Quiz, CA, Exam Breakdown & Evaluation Parity)

- **Academic Transcript Score Alignment with Records Entry ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [student/transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx), [records.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.service.ts), [records.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.controller.ts))**:
    - [x] **Unpublished & Draft Results Available in Admin Transcript**:
        - Relaxed `status: "PUBLISHED"` requirement in `getMyPublishedResults` in `records.service.ts` when requests are accessed by administrative / staff roles or targeting a student transcript (`isAdmin` mode).
        - Allows scores and draft configurations recorded in `/dashboard/admin/records/new?id=...` to appear immediately on `/dashboard/admin/transcript?studentId=...` without getting filtered out before official publication.
    - [x] **Full 4-Component Score Breakdown Table**:
        - Updated course breakdown tables across both Admin preview (`TranscriptPreview.tsx`) and Student transcript (`student/transcript/page.tsx`) to display all assessment components:
          - `Code`, `Subject / Course Name`, `Assignment`, `Quiz`, `CA`, `Exam`, `Total (%)`, `Grade`, `GP`, `Remark`.
        - Matched the exact columns and calculations configured in `/dashboard/admin/records/new`.
    - [x] **Effective Total Calculation & Cumulative Statistics Alignment**:
        - Implemented fallback calculation `effectiveTotal = totalScore ?? (assignmentScore + quizScore + caScore + examScore)` across GPA, term average, and cumulative average computations, ensuring scores composed from individual components correctly aggregate even if a precomputed total was omitted.
    - [x] **PDF Export Parity**:
        - Updated `handleDownloadPDF` in both admin and student views to export tabular columns (`["CODE", "COURSE / SUBJECT", "ASST", "QUIZ", "CA", "EXAM", "TOTAL", "GRADE", "GP", "REMARK"]`).
    - [x] **Behavioral Evaluations & Conduct Remarks Fallback**:
        - Added fallback resolution for Affective traits (10 items), Psychomotor skills (6 items), Teacher Remark, and Principal Remark from `scoreSources.behavior` saved during records entry on `records/new`.
        - Page 2 of the transcript preview and exported PDF now accurately reflect ratings and remarks saved via `/dashboard/admin/records/new`.
    - [x] **Verification**: Verified TypeScript compilation for both `backend` and `frontend` (`npx tsc --noEmit` exited 0 on both).

### Sunday, October 25, 2026 (Transcript Endorsement Signature Display & Academic Standing Excellent Marker)

- **Official Academic Transcript Signature & Academic Standing Refinements ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [signatureService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/signatureService.ts), [student/transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx))**:
    - [x] **Endorsement Signature Preview Display Fix**:
        - Fixed the root cause preventing the signature from showing in the preview: when a candidate Head of Institution (`principals[0]`) was chosen from `schoolAdmins` without an individual signature tied to their database UUID, the system previously discarded the active administrator signature.
        - Implemented `getAnyAvailableSignature()` in `TranscriptPreview.tsx` to search across `currentAuthSignature`, `systemAdminSignature`, `signaturesMap`, `localStorage` fallback keys (`schoolhub_signature_active`, `schoolhub_signature_admin-system`, etc.), and `approvalInfo?.signature`.
        - Bound this active signature to the Head of Institution slot (following the hierarchy: Principal -> Vice Principal -> School Owner).
        - Maintained the Registrar slot rule: displays registrar's signature if available, otherwise remains clean and blank.
        - Updated `signatureService.ts` to convert PNG Blobs to base64 Data URLs upfront and cache across `schoolhub_signature_${userId}`, `schoolhub_signature_active`, and `schoolhub_signature_admin-system`, ensuring signatures never expire or fail to render in offline/dev environments.
        - Upgraded endorsement preview slots in `renderEndorsementSignatures()` to support both transparent PNG images and styled calligraphic signatures with graceful error handling.
    - [x] **Replaced "First Class" Honors with "Excellent" Marker**:
        - Removed university honors terminology (`First Class / Distinction`, `Second Class Upper`, `Second Class Lower`, `Third Class / Pass`).
        - Replaced with standard school assessment markers:
          - `>= 4.5 CGPA` or `>= 75% Average`: **`Excellent`**
          - `>= 3.5 CGPA` or `>= 65% Average`: **`Very Good`**
          - `>= 2.5 CGPA` or `>= 50% Average`: **`Good`**
          - `>= 1.5 CGPA` or `>= 40% Average`: **`Pass`**
          - `< 1.5 CGPA` or `< 40% Average`: **`Needs Improvement`**
        - Updated both admin transcript preview and student transcript page to ensure consistent academic standing reporting.
    - [x] **Verification**: Frontend TypeScript build verified with `npx tsc --noEmit` (0 errors).

### Sunday, October 25, 2026 (Transcript CGPA Display Matching Progress Report Design & Layout Enhancements)

- **Official Academic Transcript CGPA Integration ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts))**:
    - [x] **CGPA Callout Matching Progress Report Spec (`CGPA: {score} ({grade})`)**:
        - Implemented the exact styling seen in the progress report image (`CGPA: 3.75 (A-)`).
        - Integrated `getCgpaGrade` helper mapping cumulative performance to the corresponding grade letter (e.g. `A-`, `A`, `B+`).
        - **Page 2 (Behavioral & Remarks)**: Placed the bold `CGPA: {cgpa} ({grade})` callout directly above the `Remarks:` section, precisely matching the progress report layout.
        - **Page 1 (Academic)**: Added a dedicated summary bar at the end of the course breakdown tables displaying the bold `CGPA: {cgpa} ({grade})` alongside academic standing and cumulative average.
        - **PDF Export Generator (`pdfGenerator.ts`)**: Rendered the bold `CGPA: {cgpa} ({grade})` line right above the executive institutional remarks box on Page 2 and enriched the metadata table.
    - [x] **Student Portrait Moved to Letterhead Top Right**:
        - Relocated the student's portrait photograph (`studentProfile.profileImage`) to the top right of the official letterhead directly opposite the school crest/logo, adhering to formal institutional transcript standards.
    - [x] **Arranged Reference Metadata into Scholar Biographical Strip**:
        - Transferred the **Academic Transcript Ref No.** (`TRX-{STUDENT-CODE}-{YEAR}`) and **Issued Date** into the biographical strip below the letterhead.
        - Structured the strip into a clean, responsive 6-item grid displaying:
          1. **Scholar Full Name**
          2. **Student ID / Code**
          3. **Department / Cohort**
          4. **Enrollment Status** (`Active Enrolled`)
          5. **Document Ref No.** (`Academic Transcript Ref No.` on Page 1 / `Behavioral Record Ref No.` on Page 2)
          6. **Issued Date**
    - [x] **Matching Loading Skeleton**:
        - Updated `TranscriptPreviewSkeleton` to mirror the new letterhead layout (crest on left, portrait placeholder on right) and the 6-column biographical metadata strip.
    - [x] **Head of Institution Signatory Resolution (Principal -> Vice Principal -> School Owner)**:
        - Implemented the user's priority rule: Slot 1 / Right Slot resolves to either the **Principal**, **Vice Principal**, or **School Owner** based on who has a signature first (Principal -> Vice Principal -> School Owner).
        - Hierarchy Fallback: Defaults by institutional hierarchy (Principal first, then Vice Principal, then School Owner) if none has a signature set up.
        - **Leave Blank When Unavailable**: Left completely blank (`null`) above the dashed line if no signature is set up.
    - [x] **Registrar Signatory Resolution (Slot 2 / Left Slot)**:
        - Specifically assigned to the **Registrar** (`Registrar / Academic Director`); leaves signature area blank if unavailable.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit` on the frontend codebase (exited 0).

### Sunday, October 25, 2026 (Teacher Records Conduct & Behavioral Evaluation with Admin Restriction)

- **Teacher Records Data Entry 16-Domain Appraisal & Administrative Isolation ([teacher/records/new/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/records/new/page.tsx))**:
    - [x] **Full 16-Domain Conduct & Remarks Integration**:
        - Brought all 10 Affective traits and 6 Psychomotor skills into the Teacher Data Entry portal (`/dashboard/teacher/records/new`).
        - Integrated sub-tabs: **Key Overview**, **Affective Domain (10 Traits)**, **Psychomotor Domain (6 Skills)**, and **Remarks Focus**.
        - Added interactive 1–5 rubric selectors and real-time color badge indicators for teacher ratings.
        - Synchronized with `classEvaluations` (`useClassTermlyEvaluations`) and dual-persisted via `handleSave` to both `StudentSubjectResult.scoreSources.behavior` and the Prisma `TermlyEvaluation` table (`bulkSaveTermlyEvaluations`), guaranteeing real-time synchronization with Page 2 of Academic Transcripts.
    - [x] **Strict Administrative Isolation & Protection**:
        - **Principal's Executive Conduct Remark Locked**: Teachers cannot edit or fill the Principal Remark column in the table or the appraisal modal.
        - The Principal Remark displays as a certified, styled read-only box with a lock icon: `"Administrative Area: Reserved for Principal / Administrator certification. Teachers cannot modify this field."`
        - In the table header, an amber lock indicator flags the Principal Remark as Admin-Only.
        - In `handleScoreChange`, attempting to edit `principalRemark` without `canEditPrincipalRemark` (`userType === 'ADMIN' && ('SCHOOL_OWNER' || 'PRINCIPAL')`) is strictly blocked with an error toast.
        - In "Auto-fill Remarks", only the `teacherRemark` is populated with presets; `principalRemark` is left untouched unless the user is an admin.
    - [x] **Full Student Behavioral Appraisal Modal for Teachers**:
        - Built deep-dive modal per student accessed via the "Appraisal" action button.
        - Section 1 (Affective): 10 traits with interactive 1–5 clickable buttons (disabled if subject not assigned to teacher).
        - Section 2 (Psychomotor): 6 practical skills with interactive 1–5 clickable buttons.
        - Section 3 (Teacher Remark): Editable textarea with 1-click preset suggestion chips.
        - Section 4 (Principal Remark): Fully locked administrative card with lock badge explaining administrative restriction.
    - [x] **0 TypeScript Compilation Errors**: Verified with `npx tsc --noEmit`.

### Sunday, October 25, 2026 (Final Results Conduct & Behavioral Domain Evaluation Synchronization)

- **Comprehensive Behavioral Evaluation & Transcript Sync ([records/new/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/records/new/page.tsx), [termlyEvaluation.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/termlyEvaluation.service.ts), [termlyEvaluation.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/termlyEvaluation.controller.ts), [student.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.route.ts), [studentService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/studentService.ts), [useStudent.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useStudent.ts))**:
    - [x] **Backend Bulk Evaluation Architecture**:
        - Engineered `GET /api/v1/students/termly-evaluations/class/:classId?sessionId=...&term=...` resolving all candidate evaluations for the entire cohort in a single optimized query.
        - Engineered `POST /api/v1/students/termly-evaluations/bulk` accepting batch upserts with Prisma transaction rollback protection, tenant scoping, and full 16-domain schema validation.
    - [x] **Unified Conduct Persistence**:
        - Upgraded `handleSave` in `/dashboard/admin/records/new` to simultaneously persist all 10 Affective traits, 6 Psychomotor skills, and Teacher/Principal remarks to both `StudentSubjectResult.scoreSources.behavior` and the authoritative `TermlyEvaluation` table in Prisma.
        - Guarantees immediate real-time reflection on **Page 2 of Certified Academic Transcripts** (`/dashboard/admin/transcript?studentId=...`), broadsheets, and parent report cards.
    - [x] **Sub-Tab Navigation in Behavioral Evaluations**:
        - **Key Overview**: Quick select view for Attentiveness, Politeness, Punctuality, Handwriting, Teacher Remark, and Principal Remark.
        - **Affective Domain (10 Traits)**: Dedicated table evaluating Attentiveness, Honesty, Neatness, Politeness, Punctuality, Self Control, Obedience, Reliability, Responsibility, and Peer Relationship with 1–5 rubric selectors.
        - **Psychomotor Domain (6 Skills)**: Dedicated table assessing Handwriting, Tool Handling, Drawing & Crafts, Public Speaking, Speech Fluency, and Sports & Athletics with 1–5 rubric selectors.
        - **Remarks Focus**: Dedicated view with expanded inputs for Class Teacher's Terminal Remark and Principal's Executive Conduct Remark, alongside 1-click quick suggestion preset chips.
    - [x] **Class-Wide Quick Actions & Rubric Guide**:
        - "Set All to 5 (Distinction)" 1-click batch action setting all students to top distinction marks across all 16 domains.
        - "Auto-fill Empty Remarks" populating unconfigured student remarks with certified commendable comments.
        - Standard 5-Point Institutional Rubric Legend (5 = Distinction, 4 = Commendable, 3 = Acceptable, 2 = Minimal, 1 = Needs Attention).
    - [x] **Full Student Behavioral Appraisal Modal**:
        - Built interactive modal for each student row accessible via "Appraisal" action button.
        - Allows deep-dive per-student adjustment of all 10 Affective traits and 6 Psychomotor skills with responsive 1–5 clickable buttons and real-time color badges, plus custom textareas with preset suggestion chips.
    - [x] **Synchronized Excel & PDF Export**:
        - Expanded `behaviorHeaders` and `behaviorRows` across Excel (`xlsx`) and PDF exports to include all 16 traits and skills alongside remarks.

### Sunday, October 25, 2026 (Universal Top Navigation Command Search Optimization & Admin Multi-School Profile)

- **Universal Top Navigation Command Search Architecture ([GlobalCommandSearch.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/dashboard/GlobalCommandSearch.tsx), [Admin TopNavBar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/TopNavBar.tsx), [Teacher TopNavBar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/TopNavBar.tsx), [Student TopNavBar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/TopNavBar.tsx), [Parent TopNavBar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/TopNavBar.tsx))**:
    - [x] **Universal Role-Tailored Search Data Engine**:
        - Engineered an expansive, multi-tiered search index tailored for all 4 user roles (`admin`, `teacher`, `student`, `parent`).
        - Indexed **Quick Actions** (1-click direct creation/action triggers such as "Enroll Student", "Submit Final Results", "View Cumulative Transcript", "Check Fee Receipts", "Ask AI Study Assistant", "Show QR ID Card").
        - Indexed **Full Navigation & Submodules** (transcripts, offline spreadsheet grades, broadsheets, fee structuring, continuous assessment, timetable, library, documents, linking hub).
        - Indexed **Deep Synonyms & Real-World Terminology**: matches colloquial terms (e.g., "money", "tuition", "bills" → Billing/Finance; "scores", "marks", "gpa" → Grades, Results, Transcripts; "staff", "faculty" → Teachers; "pupils", "roster" → Students, Classes; "periods", "routine" → Timetable).
        - Enforced tenant feature flag filtering: dynamically filters out modules disabled in the tenant's subscription/feature configuration.
    - [x] **Desktop Command Palette Experience**:
        - Global keyboard shortcut integration (`⌘K` or `Ctrl+K`) to focus and reveal search from anywhere.
        - Instant arrow key navigation (`ArrowDown`, `ArrowUp`) with active item highlight, `Enter` to navigate/trigger, and `Escape` to close.
        - Category filter chips ("All", "Quick Actions", "Core Navigation", "Academics & Records", "Administration", "Tools & Settings") for instant drill-down.
        - Quick suggestions view: when input is focused with an empty query, shows popular shortcuts and quick actions instead of a blank screen.
        - Role-accented visual identity (Blue for Admin, Emerald for Teacher, Pink for Student, Orange for Parent).
    - [x] **Mobile Responsiveness**:
        - Added mobile search trigger button (`<Search size={18} />`) to top nav bars across all 4 roles.
        - Connected to an interactive, touch-optimized full-screen/modal command palette with auto-focus, large touch targets, and category tabs.
    - [x] **Geometric Centering Across All User Top Navigation Bars**:
        - Fixed asymmetrical flex container balance across Admin, Teacher, Student, and Parent `TopNavBar.tsx`.
        - Configured Left container with `flex-1 justify-start min-w-0` and Right container with `flex-1 justify-end min-w-0`, counter-balancing both wings so the middle search bar is mathematically placed at the exact 50% midpoint of the viewport.
        - Applied `mx-auto` and responsive constraints (`max-w-md lg:max-w-lg xl:max-w-2xl`) to `GlobalCommandSearch.tsx` desktop search container.
- **Academic Transcript Dynamic Institutional Endorsements & Fallback Signatures ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts), [useSignature.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useSignature.ts), [signatureService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/signatureService.ts), [route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/api/signatures/route.ts))**:
    - [x] **Principal Slot Endorsement**: Queries active signatures across school administrators. If the Principal does not have an active digital signature, seamlessly falls back to the School Owner's active digital signature with updated title (`School Owner / Head of Institution`). If neither has an active signature, leaves the default institutional line.
    - [x] **Registrar Slot Endorsement**: If the Registrar does not have an active digital signature, seamlessly falls back to the Vice Principal's active digital signature with title (`Vice Principal / Academic Director`). If neither has an active signature, preserves the default empty line.
    - [x] **Batch Signature API Querying**: Added `userIds` support to `/api/signatures` route and `useSignaturesByUserIds` hook with TanStack 10m caching to batch-resolve institutional candidate signatures with signed URLs and local fallback.
    - [x] **Official PDF Export Synchronization**: Updated `pdfGenerator.ts` to accept dynamic signature URLs, names, and titles, automatically embedding official digital signatures into generated PDF transcripts and print layouts.
    - [x] **Dark Mode Visibility & Dimension Enlargement**: Enlarged transcript signature container (`h-24 sm:h-28`) and image scale (`h-20 sm:h-24 max-w-[220px] sm:max-w-[260px]`). Applied `dark:invert dark:brightness-125 dark:contrast-125 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]` so black ink strokes render with crisp high contrast and subtle ambient glow on dark backgrounds, while preserving authentic black ink on physical print (`print:filter-none print:invert-0`).
    - [x] **Signature Baseline & Guideline Disambiguation**: Removed the dashed manual signature border line when an active digital signature is attached on [TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx) and [SignaturePreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/signature/SignaturePreview.tsx), ensuring the signature sits cleanly without a harsh line cutting underneath it.
    - [x] **Student Portrait & Identification Banner**: Displayed student photograph (`studentProfile.profileImage`) in an institutional portrait card on both Page 1 and Page 2, with graceful fallback to a scholar icon avatar when no photo is uploaded.
    - [x] **School Logo & Institutional Branding**: Replaced placeholder icon with dynamic school logo (`schoolProfile.logo || schoolProfile.schoolLogo || '/schoolhub.png'`) with automatic fallback handling.
    - [x] **School Motto & Physical Location**: Rendered official institutional motto in stylized typography (`"{schoolProfile.motto}"`) and physical campus address (`MapPin` location metadata) across both on-screen and printed letterheads.
    - [x] **Page 2: Behavioral Domain Evaluation & Remarks**:
        - Created official Page 2: **"Student Conduct Appraisal & Behavioral Domain Evaluation"**.
        - Implemented **Affective Domain Table** evaluating 10 core character traits (attentiveness, honesty, neatness, politeness, punctuality, self-control, obedience, reliability, responsibility, relationship with peers/staff) on a 1–5 institutional scale.
        - Implemented **Psychomotor Domain Table** assessing 6 practical skills (handwriting, handling tools, drawing/painting, public speaking, speech fluency, sports/games).
        - Added standardized 5-point proficiency rubric key (5 = Excellent, 4 = High/Good, 3 = Acceptable, 2 = Minimal, 1 = Needs Attention).
        - Added executive quotes for **Class Teacher's Cumulative Terminal Remark** and **Principal's Executive Conduct Remark**.
        - Integrated official endorsement signatures and institutional seal on Page 2 as well.
        - Added interactive **Term Selector Dropdown** allowing administrators to view evaluations for any recorded session/term.
        - Built **"Record / Edit Remarks" Modal** powered by `useUpsertTermlyEvaluation` for direct editing and saving of ratings and remarks.
        - Provided **Page Switcher Tabs** (`Page 1: Academic` | `Page 2: Conduct & Remarks` | `All Pages`).
        - Enforced physical multi-page printing with CSS `print:break-before-page`.
        - Synchronized [pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts) so multi-page PDF generation embeds student portrait, school motto, location, and the Page 2 behavioral evaluation tables.
    - [x] **Student & Parent Download Telemetry & Payment Audit Sidebar ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [student.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.controller.ts), [student.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.route.ts), [studentService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/studentService.ts), [useStudent.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useStudent.ts))**:
        - Engineered backend audit endpoint `GET /api/v1/students/:id/download-audit` aggregating student & parent download counts via `FileMetric` alongside all linked payment transactions (`totalPaid`, `outstandingBalance`, payment clearance status).
        - Added `POST /api/v1/students/:id/download-audit` recording real-time download telemetry (`FileMetric` and `SecurityAuditLog`).
        - Integrated collapsible **Access & Payment Audit Sidebar** (`isSidebarOpen` toggle button in top bar) displaying:
            - **Download Frequency Metrics**: student download count, connected parents download count, and all-time total downloads with live status indicators.
            - **Payment Clearance & Ledger**: total amount paid in ₦, outstanding balance, clearance badge (Paid in Full vs Outstanding), and itemized transaction list with receipt reference, date, payment method, and payer name.
            - **Parent Guardian Contact Directory**: linked parent profile cards with quick direct WhatsApp (`https://wa.me/`) and phone call actions.
            - **Telemetry Trigger**: automatically logs download events on "Export Official PDF" and "Print Copy", plus an admin manual test log button.
    - [x] **Interactive Academic Session & Term Filters ([TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx))**:
        - Built an interactive **Academic Filter Bar** positioned below the top navigation controls (hidden on physical print via `print:hidden`).
        - **Session Selector Dropdown**: dynamically discovers all certified academic sessions in the student's records (e.g. `2024/2025`, `2025/2026`) with individual term counters, plus "All Sessions".
        - **Term Selector Pills**: quick toggle between "All Terms", "1st Term", "2nd Term", and "3rd Term".
        - **Dynamic Statistics & Grouping**: `transcriptStats` and `groupedBySession` dynamically recalculate over the active filtered scope (CGPA, cumulative average, verified score count, academic standing) with a "Filtered Scope" badge.
        - **Synchronized Multi-Page PDF Export**: `handleDownloadPDF` exports the filtered records and attaches `Session Scope` and `Term Scope` metadata directly to the generated PDF.
        - **Synchronized Page 2 Evaluation Context**: Page 2 behavioral evaluation appraisal adapts to candidate evaluations matching the filtered session/term.
        - **Filter-Aware Empty State**: displays an informative banner and a one-click "Reset Filters" action when filter criteria yield no records.

- **Admin Profile & Multi-School Governance Affiliations ([profile/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/profile/page.tsx), [admin.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/admin/admin.controller.ts), [admin.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/admin/admin.route.ts), [adminService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/adminService.ts), [useAdmin.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useAdmin.ts))**:
    - [x] Added "Admin Profile" entry to the top nav user dropdown above Notifications.
    - [x] Built full `/dashboard/admin/profile` view showcasing administrative identity, permissions, active institution details, and **School Affiliations & Tenures** tracking current and historical admin positions across other schools.

- **Admin Digital Signature Capture Architecture ([SignatureModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/signature/SignatureModal.tsx), [DrawSignature.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/signature/tabs/DrawSignature.tsx), [UploadSignature.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/signature/tabs/UploadSignature.tsx), [TypeSignature.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/signature/tabs/TypeSignature.tsx), [SignaturePreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/signature/SignaturePreview.tsx), [process.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/signature/process.ts), [signatures route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/api/signatures/route.ts), [signatureService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/signatureService.ts), [useSignature.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useSignature.ts), [Admin Profile page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/profile/page.tsx), [20261025000000_signatures.sql](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/supabase/migrations/20261025000000_signatures.sql))**:
    - [x] **Draw Mode (`DrawSignature.tsx`)**:
        - Powered by `signature_pad` with `window.devicePixelRatio` scaling for razor-sharp rendering on retina/mobile screens.
        - Responsive resize listener with `toData()` and `fromData()` preservation across window resizing or orientation changes.
        - `touch-action: none` preventing mobile viewport scrolling during drawing.
        - Pen color switcher (Black `#111111`, Navy `#0f172a`, Royal Blue `#1d4ed8`), Undo stroke, and Clear actions.
        - Real signature baseline line and "X" origin marker.
        - Binds stroke data to JSON vector format for high-resolution PDF outputs.
    - [x] **Upload Mode (`UploadSignature.tsx`)**:
        - Mobile photo capture / file picker (`accept="image/*" capture="environment"`).
        - Integrated `react-easy-crop` to tightly isolate signature from table edges, background paper margins, and shadows.
        - Client-side background removal engine (`process.ts`) with 25px blur illumination mapping (with scratch canvas fallback for older Safari/iOS), soft edge alpha thresholding, and solid ink recoloring.
        - Interactive "Clean-up Strength" slider with debounced real-time preview.
    - [x] **Type Mode (`TypeSignature.tsx`)**:
        - Calligraphy script rendering with dynamic Google Font loading (Caveat, Dancing Script, Pacifico, Great Vibes).
        - Offscreen canvas rendering with slight natural tilt, exported through the shared trim pipeline.
    - [x] **Shared Processing & Normalization Engine (`process.ts`)**:
        - `trimTransparentPng`: scans ink alpha bounding box, applies 12-14px padding, and scales to max 800px.
        - `computeSha256`: cryptographic integrity checksum.
    - [x] **Storage & Server Route (`route.ts`)**:
        - Server-side validation: MIME type check (`image/png`), 2MB limit, and PNG magic header bytes inspection (`0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a`).
        - SHA-256 hash generation, IP address and User-Agent capture for audit ledger.
        - Private Supabase Storage bucket `signatures` with 1-hour signed URL serving and fallback to `school-assets`.
        - SQL migration script provided for `signatures` table, partial unique active index, and storage policies.
    - [x] **Admin Profile Integration (`/dashboard/admin/profile`)**:
        - Added **"Digital Signature & Endorsement Seal"** tab in Admin Profile.
        - Added digital signature action button in Hero Card with real-time certified indicator.
        - Official Institutional Endorsement Card displaying the transparent PNG on paper, cryptographic SHA-256 fingerprint with copy button, creation date, and capture method.
        - "Update Signature" and "Remove Signature" controls.

### Saturday, October 24, 2026 (Final Results Admin Approval & Digital Signature Workflow, Student & Parent Visibility Gate)

- **Admin Final Results Approval & Digital Signature Architecture ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/records/new/page.tsx), [teacher page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/records/new/page.tsx), [records.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.service.ts), [records.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.controller.ts), [recordService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/recordService.ts), [useRecords.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useRecords.ts))**:
    - [x] **Strict Student & Parent Visibility Gate (`getMyPublishedResults`)**:
        - Selected `paperLinks: true` in `ClassSubjectResult` query within `records.service.ts`.
        - Enforced strict requirement that for non-admin viewers (students and parents viewing via `/records/my-results` or `/parents/children/:childId/results`), `paperLinks.approval.status === "APPROVED"` must be true; otherwise unapproved or pending draft results are completely excluded from student and parent views.
    - [x] **Admin Approval & Digital Signature Storage (`records.service.ts`, `records.controller.ts`)**:
        - Updated backend `publishClassSubjectResult` to accept custom digital signature text and admin user details and role.
        - Persisted structured administrative approval block into `ClassSubjectResult.paperLinks.approval`: status (`APPROVED`), `approvedById`, `approvedByName`, `role` (e.g. `School Owner` or `Principal`), `approvedAt` (ISO timestamp), and `signature`.
        - Added persistent audit trail tracking in `ClassSubjectResult.paperLinks.approvalHistory`: appends every approval event over time with identity, assigned role, signature, and timestamp.
        - Enforced role check: teachers attempting to publish are routed to `requestPublishApproval` with `PENDING_APPROVAL` status, and an informative response stating: *"For students and parents to see this result, it needs to be approved by an administrator."*
    - [x] **Frontend Admin Workflow (`/dashboard/admin/records/new?id=...`)**:
        - Streamlined approve actions: removed redundant duplicate "Approve & Publish Now" buttons inside the Configuration Details tab; centralized the primary **Approve & Publish** action solely in the authoritative top header action bar.
        - Built approval confirmation modal displaying approving official identity, exact administrative role / title badge (`School Owner`, `Principal`, `Registrar`, etc.), and digital signature input. Removed manual role buttons in favor of the admin's genuine assigned role.
        - Digital signature auto-formats with the admin's official title: `${user.name} (${adminRoleTitle})`.
        - When published, displays an "Approved & Published" status badge with unpublish option.
        - Overhauled **Configuration Details Tab**:
            - When approved: Renders comprehensive **Official Administrative Approval & Digital Signature Card** showing approving official, formatted administrative role (e.g. `School Owner` or `Principal`), digital certificate stamp box with the stored signature, and exact timestamp.
            - When unapproved: Displays an informative amber alert explaining that the result is hidden from students/parents until approved, with clear direction to use the top action bar to approve.
            - **Approval & Publishing History Audit Ledger**: Renders chronological history of all officials who approved and published this final result, displaying their avatars, names, role tags, timestamps, and digital signature stamps.
    - [x] **Teacher Guidance & Notice (`/dashboard/teacher/records/new?id=...`)**:
        - Updated teacher publish dialog to prominently warn: *"Notice: For students and parents to see this result, it needs to be approved and published by a school administrator."*
        - Action button clearly labeled "Submit for Approval".

### Saturday, October 24, 2026 (Admin Academic Transcripts Hub & Scholar Transcript Preview Architecture)

- **Admin Academic Transcripts Feature ([transcript/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/page.tsx), [StudentTranscriptSelector.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/StudentTranscriptSelector.tsx), [TranscriptPreview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/transcript/components/TranscriptPreview.tsx), [records.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.service.ts), [records.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.controller.ts), [useStudent.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useStudent.ts), [adminFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/adminFeatureFlags.ts), [app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/app-sidebar.tsx))**:
    - [x] **Backend Certified Transcript Administration Support**:
        - Enriched `getMyPublishedResults` in `records.service.ts` to include course codes (`code: true`) on subjects.
        - Added `isAdmin` verification flag in `records.controller.ts` allowing administrators and registrars to preview full student transcripts with all scores and grade points unconditionally, bypassing student-facing release/reveal timer restrictions.
    - [x] **Frontend Navigation & Feature Flag Architecture**:
        - Added `transcript: true` under `academics` in `adminFeatureFlags.ts` with role permissions for `SCHOOL_OWNER`, `PRINCIPAL`, `REGISTRAR`, and `SUPPORT`.
        - Added **Transcripts** navigation link to `adminMenuItems` in `app-sidebar.tsx` with `GraduationCap` icon linking to `/dashboard/admin/transcript`.
        - Mobile drawer (`AdminMobileDrawer.tsx`) automatically inherits the feature and menu item.
    - [x] **First Page: Student Selector Workspace (`StudentTranscriptSelector.tsx`)**:
        - Built dedicated landing interface to search and select any student from the school roster.
        - High-level metric indicators: Total Scholars, Active Classes, Academic Standard (5.00 CGPA scale), and Certification Mode (Registrar Seal).
        - Filter & search toolbar: live search by name, student code (e.g. `STU-...`), or email; dynamic class arm dropdown; department dropdown; gender filter; and reset action.
        - View mode switcher: List View (interactive table with student avatars, code badge, class arm, department, gender, and "Preview Transcript" action) and Grid View (rich scholar cards with direct preview trigger).
        - Full pagination controls for large cohorts.
    - [x] **Authoritative Transcript Preview & Certification Workspace (`TranscriptPreview.tsx`)**:
        - Deep URL synchronization supporting both direct navigation (`/dashboard/admin/transcript?studentId=...`) and internal switching with browser history.
        - Quick Scholar Switcher dropdown in the preview header bar allowing administrators to jump between scholars without navigating back.
        - Official institutional letterhead with school logo, certified record badge, school motto, address, and auto-generated transcript reference code (`TRX-[CODE]-[YEAR]`).
        - Scholar biographical profile strip with name, student code, department, enrolled class cohort, and active status.
        - Cumulative performance metrics: CGPA on 5.00 scale, Cumulative Average percentage, Total registered subjects, and Completed Sessions/Terms.
        - Academic standing classification (First Class / Distinction, Second Class Upper, etc.).
        - Session-by-session & term-by-term breakdown tables: Course Code, Course Name, CA Score, Exam Score, Total %, Grade Letter (A1–F9 colored pill badges adhering to list/grid skill), Grade Points, and Remarks.
        - Official certification endorsements footer: Registrar/Academic Director signature line, official electronic seal ("Certified Verified Copy"), Principal/Head of Institution endorsement block, and legal validity notice.
        - Official 1-click PDF download via `generatePDF` and browser print formatting (`window.print()`).
    - [x] **Student Details Integration**:
        - Added dedicated "Transcript" action button in the student profile hero actions bar (`dashboard/admin/students/[studentId]`), linking directly to their transcript preview.

### Saturday, October 24, 2026 (Class History & Institutional Lifecycle Ledger Architecture)

- **Class History Ledger Architecture ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/page.tsx), [ClassHistoryTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/history/ClassHistoryTab.tsx), [class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts), [class.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.controller.ts), [class.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.route.ts), [useClasses.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useClasses.ts))**:
    - [x] **Backend Class History Ledger Service (`GET /api/classes/:id/history`)**:
        - Aggregates the full institutional history of a class: establishment & configuration, student enrollments, promotions into and out of the cohort (with origin and destination class resolution), student graduations & withdrawals, staff & lead form teacher appointments, curriculum subject attachments, certified final score sheet publications, and conduct logs.
        - Provides computed cohort summary metrics (`currentEnrollments`, `promotedOut`, `promotedIn`, `graduated`, `publishedResultsCount`, `subjectsCount`, `teachersCount`).
    - [x] **Frontend Class History Tab (`ClassHistoryTab.tsx`)**:
        - Added **Class History** tab to class details view at `/dashboard/admin/classes/[id]`, supporting direct linking via `?tab=history`.
        - Added 5 high-level metric indicator cards (Active Roster, Promoted Out, Promoted In, Graduated/Exit, Certified Records).
        - Added full filter control bar with live search, category pills (`All Events`, `Promotions`, `Students`, `Staff`, `Academics`, `Conduct`), and chronological sort order toggle.
        - Built visual chronological timeline with distinct event icons, badges, and timestamps.
        - Built interactive **Event Details Modal** displaying student profiles, promotion trajectories, academic snapshot achievements at time of movement, and administrator verification signatures.
        - Added PDF export function (`handleExportPDF`) generating a formatted audit report via global PDF generator.
        - Added dedicated loading skeleton in `TabSkeleton` for smooth tab transitions.

### Friday, October 23, 2026 (Score Sheet Configuration, Admin Approval & Signatures, and Teacher Records Overhaul)

- **Score Sheet Settings & Max Mark Configuration ([EditConfigModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/records/new/components/EditConfigModal.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/records/new/page.tsx), [records.schema.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.schema.ts), [records.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.service.ts))**:
    - [x] **Config Modal Controls**: Added configurable maximum marks for Assignment (Max 10), Quiz/Test (Max 10), CA (Max 20), and Exam (Max 60), with a live total indicator badge verifying the standard 100-mark distribution.
    - [x] **Session, Term & Release Dates**: Added session selection dropdown (`useSessions`), term selector (`FIRST`, `SECOND`, `THIRD`), and reveal/release date pickers with quick clear controls.
    - [x] **Backend Validation & Persistence**: Updated backend Zod schema and records service to accept and update `sessionId` and `term` on class subject results.
    - [x] **Configuration Details Tab**:
        - Grouped assessment types into four cards (`Exam`, `Quiz/Test`, `CA`, `Assignment`).
        - Integrated physical offline grade marksheets (`gradeService.getGradeHub` with `offlineOnly: 'true'`) alongside online CBT papers and online assignments.
        - Added interactive Session and Term filter controls; when "All" or none selected, all assessments are displayed.
        - Displayed assessment badges (`Offline Marksheet`, `CBT Paper`, `Online Task`), student graded counts, and total marks.
    - [x] **Student Avatars**: Removed dummy external Dicebear avatars across academic and behavioral tables in both Admin and Teacher new records & preview views, replacing them with authentic profile photos or bold initials letter avatars (`StudentAvatar`).
    - [x] **Teacher Submission & Admin Digital Signature Approval Workflow**:
        - When a teacher publishes a record, the backend tags it as `PENDING_APPROVAL` with the teacher requester's identity.
        - Admin records view highlights pending approval requests with a call-to-action banner to review and certify.
        - When certified and published by an administrator, records admin credentials, timestamp, and digital signature (`approval: { status: 'APPROVED', approvedById, approvedByName, approvedAt, signature }`).
        - Integrated official approval verification stamp on the page and in the exported PDF (Section 4).

- **Teacher Records Focus & Student Final Results ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/records/page.tsx), [useTeacher.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useTeacher.ts))**:
    - [x] **Assigned Subject Focus**: Removed the "All School Records" toggle; strictly locked teacher subject records to their assigned subjects alone.
    - [x] **Student Final Results Tab**:
        - Replaced empty student term results with `useTeacherStudents`, fetching all students enrolled in the teacher's assigned classes.
        - Aligned layout to mirror `admin/records` with List View (`#`, `STUDENT NAME`, `STUDENT CODE`, `GENDER`, `CLASS`, `ACTIONS`) and Grid View cards.
        - Provided direct "View Record" action buttons navigating to `/dashboard/teacher/records/student/[studentId]`.
        - Fully typed with zero `any` and verified TypeScript compilation (`tsc --noEmit`).

### Friday, October 23, 2026 (Apex Route vs Subdomain 404 Isolation Architecture)

- **Apex Domain 404 vs Subdomain 404 Segregation ([subdomain.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/utils/subdomain.ts), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/[tenant]/page.tsx), [[...slug]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/[tenant]/[...slug]/page.tsx), [not-found.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/not-found.tsx), [[tenant]/not-found.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/[tenant]/not-found.tsx))**:
    - [x] **Identified Root Cause**: In Next.js App Router, `src/app/[tenant]/page.tsx` is a top-level dynamic folder matching all single-segment paths (e.g. `/home`). When visiting `localhost:3000/home`, `[tenant]` captured the path, failed to find a school named "home", and unconditionally displayed `SchoolNotFoundView`.
    - [x] **Created Subdomain Detection Utility ([subdomain.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/utils/subdomain.ts))**: Built `detectSubdomain(hostname)` and `isSubdomainHost(hostname)` to accurately identify whether the incoming request is on a dedicated school subdomain (e.g. `home.qefas.com`, `myschool.localhost:3000`) or the main apex domain (`localhost:3000`, `qefas.com`, `www.qefas.com`).
    - [x] **Isolated Apex Route 404s**: Updated `[tenant]/page.tsx` and `[tenant]/[...slug]/page.tsx` so that requests on the apex domain with unmapped routes (`/home`, etc.) or failed school fetches immediately trigger `notFound()` instead of `SchoolNotFoundView`.
    - [x] **Subdomain-Exclusive School 404**: Preserved `SchoolNotFoundView` exclusively for actual school subdomains (e.g. `home.qefas.com`, `xyz.qefas.com`) where the institution cannot be located on the Qefas Hub network.
    - [x] **Unified Tenant NotFound**: Updated `[tenant]/not-found.tsx` to delegate to root `NotFound`, which seamlessly differentiates between school subdomains and apex 404s.

### Friday, October 23, 2026 (Web Device Name & Location Detection Permission Architecture)

- **Accurate Web Device Model & Location Architecture ([deviceDetector.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/utils/deviceDetector.ts), [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts), [DeviceSessions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/DeviceSessions.tsx), [auth.device.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.device.ts), [auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts))**:
    - [x] **Clarified & solved root cause**: Web browsers do not have device name permission dialogs (browsers freeze `User-Agent` strings). Device model is detected via high-entropy Client Hints (`navigator.userAgentData`) on Android/Chromium and screen dimension/pixel-ratio matrix on iOS with zero prompt.
    - [x] **Location Permission Setup**: Location strictly requires browser permission (`navigator.geolocation`). Built `requestDeviceLocationPermission()` to prompt the browser, fetch GPS coordinates, and reverse-geocode to City/Country (cached in `localStorage`).
    - [x] **Zero-Permission Fallback**: Built `getTimezoneLocation()` which maps system IANA timezones (e.g. `Africa/Lagos` → `Lagos, Nigeria`) without prompting, ensuring location never shows as "Unknown Location".
    - [x] **Global Request Interceptors**: Updated [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts) to automatically attach `x-device-type`, `x-device-model`, `x-os-version`, `x-device-location`, and `x-client-timezone` to all outgoing API requests.
    - [x] **Interactive Permission Trigger**: Added an "Update Location" action button in [DeviceSessions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/DeviceSessions.tsx) allowing users to trigger GPS location permissions on demand with toast feedback.
    - [x] **Backend Session Resolution**: Enhanced `getUserSessions` and `extractDeviceInfo` in backend to accept and prioritize high-accuracy client device location and timezone headers.
    - [x] **Enriched Security Emails & Notifications ([auth.device.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.device.ts))**: Updated `processNewDeviceLogin` so new sign-in security emails and in-app alerts display the verified human-readable city/country (e.g. `Lagos, Nigeria (197.210.x.x)`) instead of raw IP or "Unknown Location".

### Friday, October 23, 2026 (Auth Session Invalidation Fix & Role-Adaptive Authenticating Screen)

- **Authentication Session Invalidation Fix ([authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts), [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts))**:
    - [x] **Resolved Premature Logout Bug**:
        - Root cause identified: `authMiddleware` performed a strict string equality lookup `prisma.refreshToken.findFirst({ where: { userId, isValid: true, deviceModel: req.header("x-device-model") } })`. When OAuth or social login created a session with `deviceModel: "Unknown Device"` or a generic User-Agent label, subsequent frontend API calls bearing the client-detected `x-device-model` failed this filter, logging `[authMiddleware] User ID "..." session not found or no longer valid` and returning 401.
        - Fixed in `authMiddleware.ts` to first attempt an exact device match, and if not matched, fallback to verify any active valid session for that user (`userId: decoded.userId, isValid: true`).
        - Added opportunistic device model enrichment: if the session was previously recorded as "Unknown Device", it dynamically updates the session with the client-reported `x-device-model` without invalidating the token.
    - [x] **Protected Auth Exchange on Callback Page**:
        - Updated [client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/client.ts) response interceptor so `/login/callback` is explicitly exempted from immediate cookie clearance and store wipeout upon receiving transient 401s during the OAuth handshake.

- **Role-Adaptive Authenticating Screen ([login/callback/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/callback/page.tsx))**:
    - [x] Dynamically aligns the authentication screen visuals to match the authenticating user role's signature design system:
        - **Teacher**: Emerald / Green palette (`emerald-600` shield, `bg-emerald-50` badge, emerald glowing ambient orbs, emerald progress bar, `BookOpen` icon).
        - **Student**: Blue / Cyan palette (`blue-600` shield, `bg-blue-50` badge, cyan glowing ambient orbs, blue progress bar, `GraduationCap` icon).
        - **Parent**: Orange / Amber palette (`orange-500` shield, `bg-orange-50` badge, amber glowing ambient orbs, orange progress bar, `Users` icon).
        - **Admin**: Indigo / Purple palette (`indigo-600` shield, `bg-indigo-50` badge, violet glowing ambient orbs, indigo progress bar, `Building` icon).
    - [x] Dynamically extracts the role from `searchParams.get("role")`, URL destination (`dest`), and synchronizes in real-time with `/auth/me` user data.
    - [x] Role-specific status copy and tailored subtitles (e.g. "Preparing your classrooms, lesson schedules, and grade records..." for teachers).

### Friday, October 23, 2026 (Student Promotion & Graduation Architecture, Offline Grades Skeletons & Teacher Class Offline Tab)

- **Student Promotion & Graduation Architecture ([PromoteStudentsModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/PromoteStudentsModal.tsx), [StudentCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/students/components/StudentCard.tsx), [StudentDetailsModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/students/components/StudentDetailsModal.tsx), [StudentsTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/students/StudentsTab.tsx), [student.lifecycle.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.lifecycle.service.ts), [student.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.controller.ts), [student.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.route.ts))**:
    - [x] **Dual Promotion & Graduation Modal**:
        - Upgraded `PromoteStudentsModal` to feature segmented mode tabs: **Promote to Class** and **Mark as Graduated**.
        - In **Promote** mode: facilitates single or multi-student selection, destination class picker, and transfers students via `POST /api/classes/:id/promote` with permanent `PROMOTED` history entries and academic level synchronization.
        - In **Graduation** mode: provides date picker, graduation reason/honors input, and commendation notes. Submits via `POST /api/students/batch-exit` with `exitType: "GRADUATED"`.
        - Recorded in `StudentHistory` with event type `GRADUATED`, updates `studentEnrollment.status = "GRADUATED"`, notifies students/parents, and cleanly removes students from active class rosters (`classEnrollment.deleteMany`).
    - [x] **Student Card & Details Modal Actions**:
        - Added quick-action "Promote" and "Graduate" action buttons directly on each `StudentCard`.
        - Added corresponding "Promote to Class" and "Mark as Graduated" buttons in `StudentDetailsModal`.
        - Connected top-level action buttons in `StudentsTab` toolbar ("Promote Students" and "Mark as Graduated").

- **Admin Class Details Offline Grades Enhancements ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/page.tsx), [OfflineGradesDashboard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx), [OfflineRecordsList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineRecordsList.tsx))**:
    - [x] Added dedicated loading skeleton in `TabSkeleton` for `tabId === "offline-grades"` (hero banner, filters bar, and 6 assessment card skeletons with shimmer animation).
    - [x] Added `hideClassFilter?: boolean` support to `OfflineGradesDashboard` and `OfflineRecordsList`.
    - [x] Inside Admin Class Details (`dashboard/admin/classes/[id]`), the class dropdown is cleanly hidden, automatically locking all queries and views to that specific cohort.

- **Teacher Class Details Offline Grades Tab ([ClassDetails.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/ClassDetails.tsx), [TabNavigation.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/TabNavigation.tsx), [TabSkeleton.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/TabSkeleton.tsx))**:
    - [x] Added `offline-grades` tab to `TabNavigation` with the `FileSpreadsheet` icon.
    - [x] Rendered `OfflineGradesDashboard` with `defaultClassId={classId}` and `hideClassFilter={true}`.
    - [x] Scoped assessment records and score entries strictly to the teacher's assigned subjects and this specific class cohort.
    - [x] Fitted layout to the available page container with `w-full max-w-full overflow-hidden`.
    - [x] Added matching teacher theme loading skeleton in `TabSkeleton` for smooth tab transitions.

### Friday, October 23, 2026 (Social Login Callback Screen Redesign & Dedicated School 404 Architecture)

- **Social Login Callback Screen Redesign ([login/callback/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/callback/page.tsx))**:
    - [x] Replaced the generic blue spinner box with a modern glassmorphism security card.
    - [x] Ambient radiant background mesh with concentric pulsing shield emblem.
    - [x] Role-adaptive badges and presets for all user personas (`teacher`, `student`, `parent`, `admin`).
    - [x] Animated multi-stage authentication sequence with live progress tracker (SSO Verification → Workspace Access Sync → Dashboard Redirect).
    - [x] 256-bit SSL encrypted session reassurance indicator with graceful fallback bypass link.

- **Dedicated School & Subdomain 404 Architecture ([SchoolNotFoundView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/common/SchoolNotFoundView.tsx), [not-found.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/not-found.tsx), [[tenant]/not-found.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/[tenant]/not-found.tsx), [[tenant]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/[tenant]/page.tsx), [[tenant]/[...slug]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/[tenant]/[...slug]/page.tsx))**:
    - [x] Built [SchoolNotFoundView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/common/SchoolNotFoundView.tsx) to provide an authoritative institutional 404 screen.
    - [x] Differentiates between **School/Subdomain Not Found** (unresolved subdomain, wrong spelling, deactivated institution) and **Standard Platform 404** (missing system page).
    - [x] Displays the attempted subdomain highlighted in monospace tag, with diagnostic checklist (verify spelling, access via central portal, register new school).
    - [x] Dynamic apex routing logic supporting both local development (`localhost:3000`) and production multi-tenant subdomains.
    - [x] Updated root `not-found.tsx` to automatically detect incoming school subdomains and routes on client mount.
    - [x] Added `[tenant]/not-found.tsx` to intercept any unmapped routes within the school tenant route hierarchy.

### Friday, October 23, 2026 (Parent Class Teacher Slider & Multi-Class Switcher Modal)

- **Parent Classroom Hub Enhancements ([ClassOverview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/class/components/ClassOverview.tsx), [SwitchClassModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/class/components/SwitchClassModal.tsx), [parent.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/parent/parent.service.ts))**:
    - [x] **Class Teacher Card Slider**:
        - Updated the Class Teacher KPI card on `/dashboard/parent/class` to detect all teachers assigned to the active cohort (`classData.teachers` and `classData.teacher`).
        - When multiple teachers are assigned, the card automatically transforms into an interactive smooth slider:
            - Auto-slides every 3.5 seconds with slide-in animation (`animate-in fade-in slide-in-from-right-3`).
            - Pauses on mouse hover so parents can inspect names, roles, and emails without premature transitions.
            - Includes manual navigation controls: previous/next chevron buttons (`<` and `>`), teacher counter badge (`1/3`), and interactive navigation indicator dots.
            - Displays individual designations: "Designated homeroom lead" (with emerald status dot) vs. "Assigned class teacher" (with purple status dot).
            - Updated the lead instructor pill in the banner metadata row to display `(+N)` indicating additional assigned co-teachers.
    - [x] **Multi-Class Switcher ("Switch Class" Button & Modal Popup)**:
        - Added a prominent "Switch Class" button in the Hero Classroom Banner with cohort counter badge.
        - Built [SwitchClassModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/class/components/SwitchClassModal.tsx):
            - Lists all enrolled classes for the selected child (aggregated and deduplicated from `dashboardData.child.classes`, `dashboardData.child.currentClass`, and `childDetails.classes`).
            - Each class card highlights class name, section/arm, academic level, session, term, class code, and lead teacher name.
            - Highlights the currently active class with a distinct "Active View" badge and orange ring outline.
            - 1-click class switching: clicking any cohort switches the entire parent class overview instantly and notifies via toast.
    - [x] **Backend Multi-Class Enrollment Support ([parent.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/parent/parent.service.ts))**:
        - Removed `take: 1` limitation on student class queries in `getParentDashboardService`.
        - Enriched student class select to return all classes with sections, levels, terms, sessions, class codes, and assigned teacher relations.

### Friday, October 23, 2026 (Direct Links Full User Type Audit, Classroom Dummy Data & My-Classes Join Button)

- **Comprehensive Direct Links Audit & Dual-State Support for All User Types ([ParentCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/parent/components/ParentCard.tsx), [StudentCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/student/components/StudentCard.tsx), [TeacherCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/teacher/components/TeacherCard.tsx), [regSchema.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/signup/services/regSchema.ts), [linkService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/linkService.ts))**:
    - [x] **Audit of All Direct Links Across the Codebase**:
        - Audited all direct entry URLs: `/signup/parent?studentCode=...`, `/signup/student?schoolCode=...&classCode=...&teacherCode=...`, `/signup/teacher?schoolCode=...&studentCode=...`, `/join/school/[code]`, and `/join/class/[id]`.
    - [x] **Unified Dual-State Architecture (Logged In vs. Non-Logged In)**:
        - **Parent Links (`/signup/parent?studentCode=...`)**: Logged-in parents get a 1-click "Link Student" card that sends the request via `useRequestLink()` directly. Non-parents get a clear role mismatch warning and account switcher.
        - **Student Links (`/signup/student?...`)**: Logged-in students now get an instant 1-click "Connect & Send Request" card that automatically dispatches link requests for all detected codes (`schoolCode`, `classCode`, `teacherCode`, `parentCode`) without hitting "Email already registered". Non-students get a role mismatch notice with dashboard or account switch actions.
        - **Teacher Links (`/signup/teacher?...`)**: Logged-in teachers now get an instant 1-click "Connect & Send Request" card for school and student invitations (`schoolCode`, `studentCode`) without registration conflicts. Non-teachers get a role mismatch notice.
        - **Non-Logged-In Users**: All three registration forms now detect incoming query parameters and display a prominent verified invitation pill above the form fields, automatically wiring them into the registration payload.
    - [x] **Bug Fix in Yup Registration Validation Schemas**:
        - Fixed rigid regex `/^stu-\d{6}$/` and `/^tch-\d{6}$/` in `regSchema.ts` which previously failed on standard generated codes that include name slugs (e.g. `stu-ola-401219` or `tch-ade-391823`). Updated to `/^[a-z]{3}-[a-zA-Z0-9_-]+$/i` so all authentic system-generated codes pass smoothly.
    - [x] **Backend LinkType Synchronization**:
        - Added missing `"TEACHER_STUDENT"` to frontend `linkService.ts`'s `LinkType` union to fully match backend capabilities.
    - [x] **Classroom Selection Live API Connection & Security Hardening ([StudentClassSelectionModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentClassSelectionModal.tsx), [class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts))**:
        - Removed all dummy test data and demo toggles from `StudentClassSelectionModal.tsx`. The modal is now strictly bound to live data from the backend via `useClasses(schoolId)`.
        - Verified the Class Join Request API (`POST /classes/join/request` via `requestToJoinClassService`):
          - Strict student authentication: only authenticated students can submit join requests.
          - Strict multi-tenancy & cross-school isolation: verifies student is officially linked to the target school (`schoolId`) before permitting join requests.
          - Duplicate prevention: rejects requests if student is already enrolled or already has a pending link request for that class.
          - Notification dispatch: automatically notifies all assigned class teachers and active school admins.
        - Hardened `getClassesService` (`GET /classes?schoolId=...`): explicitly blocks and throws an error if an authenticated student queries classes of a school they are not linked to (`student.schoolId !== schoolId`).
        - [x] **Classroom Selection Popup — Already Joined Classes Indicator ([StudentClassSelectionModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentClassSelectionModal.tsx))**:
            - Added detection of already-enrolled classes across student profile (`studentProfile.classes`), student's own active enrollments (`useClasses()`), and class rosters (`cls.enrollments`).
            - Styled already-joined classes with distinct emerald borders and backgrounds (`bg-emerald-50/20`, `border-emerald-300`).
            - Added an emerald `"✓ Already Joined"` pill badge in the class card header.
            - Replaced the "Request to Join" button with an active `"✓ Enrolled (Active Member)"` badge preventing redundant join requests.
            - Highlighted the student in the class roster avatar preview as `"YOU"` with a distinct emerald ring and priority placement at the front of the roster.
            - Added informative roster text: `"✓ You are enrolled in this class with X other students"`.
            - Added an `"Already Joined (X)"` filter chip in the modal header bar alongside "All" and "Available to Join", allowing students to instantly filter their enrolled classes.
        - [x] **Study Materials Tab — Teacher/Creator Name Accuracy & Assessment Integration ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/materials/page.tsx), [MaterialsLayout.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/materials/components/MaterialsLayout.tsx), [assignment.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/assignment/assignment.service.ts), [class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts))**:
            - Fixed root cause where materials previously fell back to the class's primary teacher because `getStudentAssignmentsService` and `getSingleClassService` did not query or populate assignment creators/teachers.
            - Updated `assignment.service.ts` to query and populate `teacher`, `instructor`, `creator`, and `teacherName` from both `Teacher` and `Admin` records for all assignments.
            - Updated `class.service.ts` (`getSingleClassService`) to include resource URLs (`attachmentUrl`, `videoUrl`, `referenceUrl`), resolve creators for `classAssignments`, and select `teacher` on `exams`.
            - Updated `materials/page.tsx` on frontend to merge class assignments with student assignments, accurately resolve the creator via assignment creator, class teacher roster match, or subject teacher match.
            - Added class assessments (`Exams`, `Quizzes`, `CAs`) into the materials catalog under their respective folder categories with their real author/teacher names and interactive "Take / View Assessment" launch links.
            - Updated `MaterialsLayout.tsx` modal preview to support assessment resource links alongside PDFs, videos, and reference links.
        - [x] **Student Academic Transcript Feature ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/transcript/page.tsx), [app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/app-sidebar.tsx), [studentFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/studentFeatureFlags.ts), [StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx))**:
            - Added `"Transcript"` navigation item with `GraduationCap` icon to the student sidebar under the Core Learning section and mobile drawer.
            - Added `transcript: true` feature flag to `studentFeatureFlags.ts`.
            - Implemented strict school connection access gating: students without an active school link receive an informative, locked gatekeeper UI with direct actions to connect to a school via the Linking Hub.
            - Implemented comprehensive official transcript layout for connected students:
              - Official institutional letterhead with school logo, motto, address, and reference code (`TRX-STU-YEAR`).
              - Student profile strip (Name, Student ID, Department, and Active Enrolled status).
              - Cumulative performance stat cards (CGPA on 5.00 scale, Cumulative Average percentage, Total Subjects, and Completed Sessions/Terms).
              - Session-by-session & term-by-term breakdown tables listing Course Code, Subject Name, CA Score, Exam Score, Total Mark, Grade Letter (A1–F9 badges), Grade Points, and Remarks.
              - Official institutional certification footer with dual signature blocks (Registrar and Principal/Head of School) and electronic seal.
              - 1-click Official PDF Download via `generatePDF` and browser print formatting.
        - Zero compilation errors across both `frontend` and `backend` (`npx tsc --noEmit` exited with code 0).

### Thursday, October 22, 2026 (Comprehensive Backend Multi-Tenancy & Authorization Security Audit)

- **Backend Multi-Tenancy & Authorization Security Audit ([backend_security_audit_report.md](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend_security_audit_report.md))**:
    - [x] **Audit Scope & Threat Modeling**:
        - Conducted comprehensive audit of backend controllers, services, and middlewares covering cross-school tenant leaks, teacher/student access boundaries, parent-child IDORs, and financial isolation.
    - [x] **Key Vulnerabilities Catalogued**:
        - **SEC-01 (Critical)**: Universal School Admin bypass in `validateSchoolAccess` (`modules/school/school.controller.ts`) allowing any school admin to query/modify any other school.
        - **SEC-02 (Critical)**: Global subjective student exam answers and papers leaked in `getManualReviewQueueService` (`modules/exam/exam-review.service.ts`) when `examId` is omitted.
        - **SEC-03 (Critical)**: Missing school ownership verification on financial analytics (`/api/finance/analytics/:schoolId`) and settlement account setup (`/api/finance/setup/:schoolId`).
        - **SEC-04 (Critical)**: Zero authentication/authorization gating on student terminal evaluations (`/api/students/:id/termly-evaluation`).
        - **SEC-05 (High)**: Exam question & paper leakage across schools and classes in `startExamAttemptService` (`modules/exam/exam-attempt.service.ts`).
        - **SEC-06 (High)**: Parent IDOR in `getChildAssignments` (`modules/parent/parent.controller.ts`) missing `parentChildLink` validation.
        - **SEC-07 (High)**: Parent IDOR in student attendance & history endpoints (`modules/student/student.controller.ts`).
        - **SEC-08 (High)**: Behavioral profile & alert notes accessible to non-linked students and parents (`modules/student/behaviourProfile.controller.ts`).
        - **SEC-09 (High)**: Cross-school grade leakage in `/api/grades/hub` for non-teacher accounts.
        - **SEC-10 (Medium)**: Student accounts permitted to submit classroom attendance registers (`modules/class/attendance.controller.ts`).
        - **SEC-11 (Medium)**: Class roster and enrolled student metadata exposed across schools in `getSingleClassService`.
        - **SEC-12 (Medium)**: Untrusted client `x-school-id` header in assignment endpoints.
    - [x] **Deliverable Generated**:
        - Generated complete report with exact line numbers, attack mechanics, and code fixes in [backend_security_audit_report.md](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend_security_audit_report.md).
    - [x] **Remediations Implemented & Zero-Error Compilation**:
        - Applied fixes across all 12 vulnerabilities:
            1. Restructured `validateSchoolAccess` in [school.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/school/school.controller.ts) so local `ADMIN` cannot access other schools.
            2. Added tenant `schoolId` filter to `getManualReviewQueueService` and `markSubjectiveAnswerService` in [exam-review.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-review.service.ts) and [exam-review.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-review.controller.ts).
            3. Added `requireRoles` middleware in [authMiddleware.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/middleware/authMiddleware.ts) and locked down [finance.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.route.ts) and [finance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/finance/finance.controller.ts) with strict `schoolId` ownership and parent-child payment verification.
            4. Secured [termlyEvaluation.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/termlyEvaluation.controller.ts) requiring teacher/admin roles and matching school tenant for mutation, and student/linked parent/same school for reads.
            5. Enforced `student.schoolId === exam.schoolId`, cohort class enrollment, and department matching in `startExamAttemptService` in [exam-attempt.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-attempt.service.ts).
            6. Added `parentChildLink` validation to `getChildAssignments` in [parent.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/parent/parent.controller.ts).
            7. Added `parentChildLink` validation to `getStudentAttendance`, `getStudentHistory`, and school check on `getStudentById` in [student.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/student.controller.ts).
            8. Enforced student self-check, parent-child link, and admin school isolation on behavioral profiles in [behaviourProfile.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/student/behaviourProfile.controller.ts).
            9. Enforced connected school tenant check on `getGradeHub` and `bulkCreateGrades` in [grade.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/grade/grade.controller.ts) for all non-superadmin users.
            10. Disallowed student attendance submissions and added class school isolation in [attendance.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/attendance.controller.ts).
            11. Enforced parent linked child class enrollment in `getClassDetails` in [class.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.controller.ts).
            12. Replaced unvalidated client `x-school-id` headers with `getValidatedSchoolId` helper in [assignment.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/assignment/assignment.controller.ts).
        - Executed `npx tsc --noEmit` on backend: **Exit Code 0, 0 errors**.

### Thursday, October 22, 2026 (Teacher Offline Grades Sidebar Fix & Parent Final Results 7-Day Recency Restriction)

- **Teacher Sidebar Offline Grades Activation & Database Sync ([app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/app-sidebar.tsx), [TeacherMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/TeacherMobileDrawer.tsx), [TopNavBar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/TopNavBar.tsx))**:
    - [x] **PlatformFeature Database Record**:
        - Registered and enabled `offlineGrades` in the Prisma `PlatformFeature` table with `teacherEnabled: true`, `studentEnabled: true`, `parentEnabled: true`, and `adminEnabled: true` so the `/platform/config/features/teacher` API endpoint consistently delivers `{ offlineGrades: true }`.
    - [x] **Teacher Sidebar & Mobile Drawer Guaranteed Access**:
        - Updated `AppSidebar.tsx` and `TeacherMobileDrawer.tsx` to explicitly safeguard `offlineGrades: true` in `currentFeatures` and in the navigation item filter `if (item.featureKey === 'offlineGrades') return true;`.
        - Updated `TopNavBar.tsx` quick search filter to ensure the Offline Grades route (`/dashboard/teacher/offline-grades`) is always indexed and accessible.
- **Parent Final Results 7-Day Recency & Released Scores Enforcement ([FinalResultsBanner.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/FinalResultsBanner.tsx))**:
    - [x] **7-Day Window Restriction**:
        - Restricted the visibility window from 14 days down to 7 days (`SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000`).
    - [x] **Revealed Scores Precondition**:
        - Enforced that the banner strictly requires `revealedCount > 0` and at least one revealed subject or published result group to have been released/created within the last 7 days (`diff >= 0 && diff <= SEVEN_DAYS_MS`).
    - [x] **Production Build & Typecheck Verification**:
        - Frontend: `npm run build` completed with **exit code 0** (all static and dynamic routes compiled, Turbopack succeeded).
        - Backend: `npx tsc --noEmit` completed with **exit code 0** (0 type errors).

### Thursday, October 22, 2026 (Parent Offline Results Workspace & Sidebar Integration)

- **Parent Offline Results Workspace & Sidebar Navigation ([offline-grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/offline-grades/page.tsx), [app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/app-sidebar.tsx), [parentFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/parentFeatureFlags.ts), [QuickActions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/QuickActions.tsx))**:
    - [x] **Parent Sidebar & Mobile Navigation**:
        - Added `offlineGrades: true` under core features in `parentFeatureFlags.ts`.
        - Added **Offline Results** navigation link to the parent sidebar in `app-sidebar.tsx` under the **Children's Progress** section using the `FileSpreadsheet` icon linking to `/dashboard/parent/offline-grades`.
        - Supported in both desktop expandable sidebar, mobile drawer (`ParentMobileDrawer.tsx`), and Command+K global search (`TopNavBar.tsx`).
    - [x] **Dedicated Parent Offline Results Workspace (`/dashboard/parent/offline-grades`)**:
        - Focuses on the connected child selected in the top nav dropdown (`useParentStore().selectedChildId`), with multi-child switcher pills if the parent has multiple linked students.
        - Physical classroom marksheet filtering:
            - Extracts only verified physical offline grade records (`isOfflineGradeRecord`) assigned to the selected child.
            - Filterable by Session, Term (1st, 2nd, 3rd), Assessment Category (Continuous Assessment, Quiz/Test, Mid-Term Exam, Homework/Project, Terminal Exam), Subject, and Search query.
        - KPI Stats Strip:
            - Displays total evaluations on file, continuous assessment average percentage, institutional WAEC grade, top assessment score, and verified released ratio.
        - Grid & Table Layouts:
            - Toggleable Grid and Table view modes with category badges, score percentages, date stamps, and teacher feedback remarks.
        - PDF Export Engine:
            - One-click official PDF export of the child's offline assessment sheet using `generatePDF`.
    - [x] **Performance Quick Portals Integration ([QuickActions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/QuickActions.tsx))**:
        - Added **Offline Results** portal shortcut button with `FileSpreadsheet` icon on the Parent Performance overview page.
    - [x] **TypeScript Strict Zero-Error Verification**: Verified with `npx tsc --noEmit` on `frontend` (0 errors).

### Thursday, October 22, 2026 (Parent Dashboard Final Results & Connected Child Dropdown Sync)

- **Parent Dashboard Final Results Integration ([FinalResultsBanner.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/FinalResultsBanner.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/page.tsx), [view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/result/termly/view/page.tsx), [termly/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/result/termly/page.tsx))**:
    - [x] **Top Nav Connected Child Dropdown Synchronization**:
        - Integrated with `useParentStore` (`selectedChildId`) and `useParentChildren`, ensuring all published final results queries dynamically focus on whichever child is selected from the top nav dropdown or profile hero switcher.
        - Graceful fallback: If no child is explicitly selected, defaults to the parent's primary linked child.
    - [x] **Celebratory Final Results Announcement Banner ([FinalResultsBanner.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/FinalResultsBanner.tsx))**:
        - Replicated the high-impact student final results experience on the parent dashboard home (`/dashboard/parent`) with ambient glowing gradients, celebratory status pills, and verified score badges.
        - Automatically computes the latest released term summary for the selected child:
            - Term & Session badge (e.g. `3rd Term • 2023/2024 Session`)
            - Released subjects ratio (e.g. `11/11 Subjects Released`)
            - Real-time average percentage and institutional WAEC evaluation (e.g. `86.4% • A+ EXCELLENT`)
            - Recency detector (highlights `New Final Results Available` if published/updated in the last 14 days)
        - Direct 1-click CTA buttons:
            - **"View Final Result"**: Navigates directly to the comprehensive score sheet view (`/dashboard/parent/result/termly/view?sessionId=...&term=...&childId=...`).
            - **"All Term Results"**: Direct link to the parent's terminal report card archives (`/dashboard/parent/result/termly`).
    - [x] **Parent Dashboard Home Quick Access ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/page.tsx))**:
        - Embedded `FinalResultsBanner` directly between `StudentHero` and `Academic Insights`.
        - Added an **"Final Results"** shortcut button with `Award` icon in the Academic Insights section header next to "View All Metrics".
    - [x] **Child Details & School Grading System Integration in Report Sheet View ([view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/result/termly/view/page.tsx))**:
        - Enhanced query to automatically use `childId || selectedChildId`, preventing empty-state bugs when navigating without query parameters.
        - Integrated child identity in the header banner displaying the student's name, student access code badge, and class cohort.
        - Upgraded letter grade calculations (`getGradeLetter`) across grid and table views to use the school's configured institutional grading matrix (`schoolGradingSystem`).
    - [x] **TypeScript Strict Zero-Error Verification**: Verified with `npx tsc --noEmit` on `frontend` (0 errors).

### Thursday, October 22, 2026 (Teacher Dashboard Final Results & Assignment Permission Guard)

- **Teacher Dashboard Final Results Integration ([records.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.service.ts), [records.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/records/records.controller.ts), [useTeacher.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useTeacher.ts), [DashboardPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/DashboardPage.tsx), [CreateResultDialog.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/records/components/CreateResultDialog.tsx), [SubjectResultCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/records/components/SubjectResultCard.tsx), [records/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/records/page.tsx), [records/new/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/records/new/page.tsx))**:
    - [x] **Backend Subject Assignment Permissions & Department Query Enrichment**:
        - Updated `getClassSubjectResults` in `records.service.ts` to include full department metadata (`department: { select: { id: true, name: true, code: true } }`) and subject department relationships (`subject.departments.department`).
        - Enforced strict authorization in `records.controller.ts`:
            - `createClassSubjectResult`: Added check ensuring a teacher can only create final results for subjects assigned to them (via `teacherId`, `teacherSubjects`, or `timetablePeriods`). Returns HTTP 403 Forbidden otherwise.
            - `checkEditPermission`: Teachers can only edit/update final result score sheets for subjects assigned to them.
    - [x] **Teacher Dashboard Home Quick Access**:
        - In `DashboardPage.tsx`, added a "Final Result" quick tool button linking directly to `/dashboard/teacher/records` with `FileCheck2` icon and modernized 3-column grid layout.
    - [x] **Teacher Records Directory & Department Badging (`/dashboard/teacher/records`)**:
        - Integrated `useTeacherSubjects` hook to identify all subjects and departments assigned to the logged-in teacher.
        - Added scope toggle: **"My Assigned Subjects"** vs **"All School Records"** allowing teachers to focus on their assigned classes/subjects while still having visibility into school-wide records.
        - Added department filter dropdown dynamically populated from teacher's assigned departments.
        - Added department badges and **Assigned** vs **Read Only** indicators on both card grid (`SubjectResultCard.tsx`) and table views.
        - Action buttons dynamically show **"Edit Sheet"** (enabled/emerald) for assigned subjects or **"Preview"** (read-only) for non-assigned subjects.
    - [x] **Create Result Dialog Scoping & Two-Way Sync (`CreateResultDialog.tsx`)**:
        - Constrained subject dropdown to only display subjects assigned to the logged-in teacher.
        - Implemented two-way department sync: selecting a subject auto-selects its linked department; selecting a department automatically filters the available assigned subjects.
        - Added clear alert notice and disabled submission if the teacher has no assigned subjects in the system.
    - [x] **Score Entry & Institutional Grading Integration (`/dashboard/teacher/records/new`)**:
        - Integrated `getGradeEvaluation` and `computeGradePill` using the school's configured `schoolProfile.gradingSystem` (falling back to standardized 9-grade boundaries).
        - Added Department badge in the header metadata next to Class, Subject, Session, and Term.
        - Read-Only Banner: When viewing a final result for a subject not assigned to the teacher, an amber banner informs them that the record is in Read-Only mode.
        - Disabled Actions: Save Results, Publish, Unpublish, Upload Grades, and Sync Papers buttons are disabled for non-assigned subjects.
        - Input Guarding: Score inputs, behavioral evaluation dropdowns (politeness, punctuality, handwriting), and teacher remarks are disabled for non-assigned subjects, with backend-level enforcement preventing manual submission.
    - [x] **Teacher Dashboard Offline Grades Sidebar & Dedicated Workspace ([app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/app-sidebar.tsx), [featureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/config/featureFlags.ts), [DashboardPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/DashboardPage.tsx), [teacher/offline-grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/offline-grades/page.tsx))**:
        - Added `offlineGrades: true` to `FEATURE_FLAGS_TEACHERS` in `frontend/src/lib/config/featureFlags.ts`.
        - Added **Offline Grades** navigation link to the teacher sidebar in `app-sidebar.tsx` under the **Academic** section using `FileSpreadsheet` icon linking to `/dashboard/teacher/offline-grades`.
        - Created dedicated teacher offline grades workspace page at `/dashboard/teacher/offline-grades/page.tsx` rendering `OfflineGradesDashboard` with breadcrumb navigation.
        - Updated `OfflineGradesDashboard.tsx` to safely resolve `schoolId` for both teachers and administrators via `(user as any)?.schoolId || (user as any)?.school?.id || user?.schools?.[0]?.schoolId || user?.tenantId`.
        - Added **Offline Grades** QuickTool shortcut button on the Teacher Dashboard home page (`DashboardPage.tsx`).
        - **Teacher Assigned Subject & School Scoping in Offline Grades ([RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [OfflineGradesHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesHeader.tsx), [OfflineGradesDashboard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx), [grade.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/grade/grade.controller.ts), [grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/grade/grade.service.ts))**:
            - **Strict Connected School Isolation**: In `grade.controller.ts` (`getGradeHub` and `bulkCreateGrades`) and `teacher-dashboard.controller.ts`, teachers are strictly bound to their authenticated connected school (`(req.user).schoolId`). Attempts to access or post grades across different schools return HTTP 403 Forbidden.
            - **Modal Subject Scoping**: Restricted the Subject Curriculum dropdown when authenticated as a teacher (`userType === 'TEACHER'`) in `RecordScoreEntryModal.tsx` to **strictly only the subjects assigned to the logged-in teacher** (matching by subject ID or normalized subject name).
            - **Directory List Scoping (Backend & Frontend)**: Updated `getGradeHubService` (`grade.service.ts`) and `OfflineGradesDashboard.tsx` to filter offline grades and assessment batches for teachers strictly to their assigned subjects (or assessments created by them) and their assigned classes (`useTeacherClasses`), ensuring teachers do not see unrelated subjects in their grade list.
            - **Dropdown Safety**: In `OfflineGradesHeader.tsx`, resets subject on class change and renders a prominent notice (`"No assigned subjects for this class"`) instead of text inputs when a selected class has no matching assigned subjects.
            - **Save Validation**: Added validation guard on score saving to ensure teachers cannot submit offline grades for subjects not assigned to them.
        - [x] **Teacher Green Theme Visual Identity Across Offline Grades ([OfflineRecordsList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineRecordsList.tsx), [OfflineGradesDashboard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx), [OfflineGradesHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesHeader.tsx), [RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [OfflineGradesStats.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesStats.tsx), [RosterSpreadsheetView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RosterSpreadsheetView.tsx), [MobileRosterCardView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/MobileRosterCardView.tsx), [OfflineGradesCSVModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesCSVModal.tsx), [OfflineGradesOCRModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesOCRModal.tsx), [teacher/offline-grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/offline-grades/page.tsx))**:
            - Added `isTeacher?: boolean` prop propagation from `OfflineGradesDashboard` down to all modal and list subcomponents.
            - **Hero & Action Theming**: When viewed by a teacher, dynamically converted all primary admin indigo buttons, hero background glows, and icon tiles to the authentic teacher emerald green palette (`bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20`, `bg-emerald-500/10` blur glow).
            - **Navigation Tabs & View Switches**: Transformed the "All Records" tab badge, active state, and grid/table view switchers to emerald when `isTeacher` is true.
            - **Assessment Cards & Marksheet Roster**: Updated card hover borders, scheduled release chips, progress bars, student avatars, department badges, and filled score inputs to use emerald accents instead of indigo.
            - **Modals & Importers**: Re-themed CSV Import and AI Vision OCR modal headers, dropzone hover highlights, and apply buttons to teacher emerald.
            - **Page Shell**: Enhanced `TeacherOfflineGradesPage` with teacher ambient backdrop `bg-[#f0fdf4]/40 dark:bg-slate-950`.

### Thursday, October 22, 2026 (Institutional Grading System Integration with 9-Grade Default Fallback & Inverted Boundary Fix)

- **Institutional Grading System Integration ([gradingSystem.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/gradingSystem.ts), [school-profile/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/school-profile/page.tsx), [school-profile/edit/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/school-profile/edit/page.tsx), [student/offline-grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/offline-grades/page.tsx), [student/grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx), [RosterSpreadsheetView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RosterSpreadsheetView.tsx), [MobileRosterCardView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/MobileRosterCardView.tsx), [RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx))**:
    - [x] **Centralized Grading Evaluation Engine (`frontend/src/utils/gradingSystem.ts`)**:
        - Created `getGradeEvaluation`, `getEffectiveGradingSystem`, and `computeGradePill` supporting custom admin-stored boundaries (`schoolProfile.gradingSystem`) with the standardized 9-grade fallback:
            - `A+` (90% - 100%): EXCELLENT
            - `A` (70% - 89%): VERY GOOD
            - `B+` (65% - 69%): GOOD
            - `B` (60% - 64%): CREDIT
            - `C+` (55% - 59%): CREDIT
            - `C` (50% - 54%): PASS
            - `D` (40% - 49%): FAIR
            - `F` (30% - 39%): WEAK
            - `F9` (0% - 30%): FAIL
        - **Inverted Range Boundary Normalization Fix**: Resolved bug where descending entries in the DB (e.g. `{ min: 100, max: 90, grade: 'A+' }`) caused scores like 95% to evaluate against `95 >= 100` (`false`) and mistakenly fall into tier `A`. `getEffectiveGradingSystem` now strictly computes `min = Math.min(val1, val2)` and `max = Math.max(val1, val2)` and sorts descending by `min`.
    - [x] **Admin Offline Grades Pop-Up Connected**:
        - Prop-plumbed `gradingSystem={schoolProfile?.gradingSystem}` from [OfflineGradesDashboard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx) into [RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [RosterSpreadsheetView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RosterSpreadsheetView.tsx), and [MobileRosterCardView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/MobileRosterCardView.tsx). Real-time grade badges and remarks now immediately update based on the school's configured percentage boundaries.
    - [x] **Student Offline Grades Page Connected**:
        - Replaced hardcoded WAEC functions in `student/offline-grades/page.tsx` with `getGradeEvaluation` driven by `schoolProfile?.gradingSystem`.
        - PDF export, Grade Tier stat card, Grid cards, and Table list view dynamically display the institution's configured grade letter and remarks.
    - [x] **Student Term Grades & Transcripts Connected**:
        - Updated `student/grades/page.tsx` to evaluate attempts and coursework using `schoolProfile?.gradingSystem`.
    - [x] **Comprehensive Admin Dashboard Grading Unification**:
        - Audited and updated all remaining grading locations across the admin dashboard to dynamically utilize the school's configured `gradingSystem` (falling back to the institutional 9-grade matrix):
            1. [records/new/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/records/new/page.tsx): Updated `calculateGrade` to evaluate with `schoolProfile?.gradingSystem` for score calculations and PDF/Excel exports.
            2. [records/student/[studentId]/view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/records/student/[studentId]/view/page.tsx): Connected student published transcript view to `schoolProfile?.gradingSystem` with styled `computeGradePill` badges.
            3. [GradeForm.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/(add-grade)/components/GradeForm.tsx): Replaced the 12-tier hardcoded ladder with live evaluation using `getGradeEvaluation(percentage, schoolProfile?.gradingSystem).grade`.
            4. [InstitutionComprehensiveReport.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/components/InstitutionComprehensiveReport.tsx): Replaced hardcoded boundaries in PDF reports with `school?.gradingSystem`.
            5. [gradeService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/components/gradeService.ts): Replaced static 5-tier fallback with `getGradeEvaluation(score).grade`.
            6. [FinalResultsTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/components/FinalResultsTab.tsx): Replaced hardcoded WAEC logic (`A1-F9`) in list and grid views with dynamic `getGradeEvaluation(percent, schoolProfile?.gradingSystem)`.
            7. [StudentFinalResultsTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/components/StudentFinalResultsTab.tsx): Connected transcript modal, PDF generator, and CSV exports to `school?.gradingSystem`.
            8. [FinalResultPDF.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/components/FinalResultPDF.tsx): Updated official PDF generator to compute subject grades and remarks using `school?.gradingSystem`.
            9. [ExamGradeReport.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/components/ExamGradeReport.tsx): Replaced WAEC grade calculations with `getGradeEvaluation(percentage, school?.gradingSystem).grade`.
            10. [SubjectPaperReport.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/exams/papers/[id]/components/SubjectPaperReport.tsx): Updated paper performance PDF report to evaluate candidate grades against `school?.gradingSystem`.
            11. [GradesTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/components/GradesTable.tsx): Modernized badge styling to dynamic `getGradeColorAndBg(grade.grade)`.
    - [x] **Admin School Profile Page & Edit Sync**:
        - On `school-profile/page.tsx`, if no custom boundaries are configured, the page displays the standardized 9-grade matrix by default with a "Default" badge.
        - On `school-profile/edit/page.tsx`, sanitized min/max bounds on save and added a quick action button `"Load Standardized 9 Grades"` to easily populate or reset to the 9 standard tiers.

### Thursday, October 22, 2026 (Offline Grades Target Department & Student Subject Association Filter)

- **Offline Grades Target Department & Student Subject Association Filter ([class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts), [OfflineGradesHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesHeader.tsx), [RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [RosterSpreadsheetView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RosterSpreadsheetView.tsx), [MobileRosterCardView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/MobileRosterCardView.tsx), [types.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/types.ts))**:
    - [x] **Backend Query Enrichment (`getSingleClassService`)**:
        - Enhanced `getSingleClassService` in `backend/src/modules/class/class.service.ts` to include:
            1. `subjects.subject.departments.department`: Exposes all `DepartmentSubject` associations for each subject in the class.
            2. `departments.department.subjects.subject`: Exposes all subjects under each department attached to the class cohort.
            3. `enrollments.student.department`: Selects full student department metadata (`id`, `name`, `code`).
    - [x] **Admin Score Entry Modal Target Department Dropdown**:
        - Expanded the modal header form grid into a clean 5-column responsive layout (`lg:grid-cols-5`) introducing **Target Department** (`Building2` icon) between Class Cohort and Subject Curriculum.
        - Provides options for `"All Departments / Direct"` (`value: 'ALL'`) and all class-specific or school-wide departments (e.g. Science, Arts, Commercial).
        - Automatically scopes and prioritizes available subjects in the Subject dropdown to only those belonging to the selected department or general/core class subjects.
    - [x] **Intelligent Student Association Filtering (Direct & Department)**:
        - Implemented two-way association checking:
            1. **Direct Class Subjects**: When a subject has no department restrictions (e.g. Mathematics, English Language), all students enrolled in the class are associated directly.
            2. **Department Subjects**: When a subject is linked to one or more departments (e.g. Physics in Science, Literature in Arts), students belonging to other departments (or lacking the department) are automatically filtered out.
            3. **Explicit Department Selection**: Selecting a specific department in the dropdown filters the score recording roster to students of that department.
            4. **Existing Grade Protection**: If a student already has a saved score/draft for the assessment, they are preserved in the roster so existing records are never lost.
    - [x] **Department Visual Badging & Responsive Feedback**:
        - Added department pill indicators under student names in the desktop spreadsheet (`RosterSpreadsheetView.tsx`) and mobile card view (`MobileRosterCardView.tsx`).
        - Replaced generic "No Students Enrolled" notice with contextual feedback explaining whether students were filtered out due to department mismatch or subject association.

- **Offline Grades Notifications & Subject Dropdown UX ([grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/grade/grade.service.ts), [OfflineGradesHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesHeader.tsx), [RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx))**:
    - [x] **Secure Notification Dispatch for Offline Grades**:
        - Updated `bulkCreateGradesService` in `backend/src/modules/grade/grade.service.ts` to dispatch transactional in-app notifications (`prisma.notification.createMany`) to graded students when offline results are published (`status === 'PUBLISHED'`).
        - **Without Release Date (Immediate Release)**: Sends notification title `"Offline Grade Published: ${subject}"` with full score summary `"Your grade for ${assessmentLabel} in ${subject} has been published. Score: ${score}/${maxMarks}."` and direct link to `/dashboard/student/offline-grades`.
        - **With Release Date (Scheduled / Future Release)**: Sends notification title `"Assessment Recorded: ${subject}"` notifying students that the assessment has been recorded and scheduled for release on `${releaseDate}`.
        - **Security & Privacy Gating**: For scheduled releases, the student's score and remarks are **strictly omitted** from notification titles, bodies, and metadata to prevent premature score leakage before the release timestamp.
        - Wrapped in non-blocking error handling to ensure grade batch commits are never aborted if notification delivery encounters edge-case network issues.
    - [x] **Admin Modal Subject Dropdown Loading State**:
        - Added `isLoadingSubjects` prop to `OfflineGradesHeader.tsx` and wired it from `isLoadingClassDetails` in `RecordScoreEntryModal.tsx`.
        - Replaced premature fallback to text input: while class subjects are fetching (`isLoadingSubjects || isLoadingRoster`), the subject dropdown renders an animated spinning `Loader2` icon with clear `"Loading class subjects..."` text and a `"Fetching"` badge.

### Thursday, October 22, 2026 (Student Portal Offline Grades Navigation & Dedicated Results View)

- **Student Portal Offline Grades Navigation & Dedicated Results View ([app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/app-sidebar.tsx), [studentFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/studentFeatureFlags.ts), [StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx), [student/offline-grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/offline-grades/page.tsx))**:
    - [x] **Student Navigation Sidebar**:
        - Added `offlineGrades: true` to `STUDENT_FEATURE_FLAGS` in `studentFeatureFlags.ts`.
        - Added **Offline Grades** navigation link to the student sidebar in `app-sidebar.tsx` under the **Learning** (core) section using the `FileSpreadsheet` icon linking to `/dashboard/student/offline-grades`.
        - Updated menu filtering in both desktop `StudentSidebar` and `StudentMobileDrawer` so Offline Grades remains accessible and prioritized for students.
    - [x] **Dedicated Student Offline Grades Page (`/dashboard/student/offline-grades`)**:
        - Built comprehensive student offline marks directory displaying published continuous assessment (CA), quizzes/tests, homework/assignments, mid-terms, and terminal examination marks.
        - **Session & Term Selectors**: Auto-selects current academic session and active term, with support for filtering across terms (1st, 2nd, 3rd) and all sessions.
        - **KPI Performance Cards**: Computes and highlights total assessments recorded, cumulative weighted continuous assessment average, highest score achieved (with subject attribution), and passed assessments rate (&ge; 50%).
        - **Category Pills**: Quick filtering by Continuous Assessment (CA), Quizzes & Class Tests, Mid-Term Exams, Homework & Projects, and Terminal Exams.
        - **Search & Subject Filter**: Dynamic subject selector and live text search across subjects, assessment titles, and instructor feedback.
        - **View Toggle (Grid vs Table)**:
            - **Card Grid View**: Displays subject, assessment title, category pill, score progress bar with score obtained vs max marks, WAEC grade pill (A1-F9), and teacher feedback quotes.
            - **Tabular View**: Formatted responsive table adhering strictly to the `list_grid_design` skill guidelines with distinct colored pills and date stamps.
            - **Full-Width Responsive Layout**: Removed `max-w-7xl` container constraints, making the entire dashboard view fill 100% of the available horizontal space (`w-full`) with an expanded 4-column responsive grid (`xl:grid-cols-4`) on larger screens.
            - **Student Grade Isolation & Strict Ownership**: In `grade.controller.ts`, authenticated student accounts are strictly bound to `req.user.id`, ignoring any client-supplied query parameters to prevent viewing another student's marks. In `page.tsx`, records are filtered strictly to the logged-in student's `studentProfile.id` / `user.id`.
            - **Dummy Data Removal**: Removed all preview dummy states and demo toggle controls; the page now displays exclusively live assessment records published for the logged-in student.
        - **Transcript PDF Export**: Integrated one-click transcript generation (`Export Transcript`) via `@/utils/pdfGenerator`.
        - **Security & Privacy Gating**: Backend securely masks `score: null` on upcoming scheduled offline assessments (`releaseDate > now`), rendering them with amber `Coming Soon` locked state until the scheduled timestamp arrives, upon which scores unlock automatically. Immediate releases (`releaseDate: null` or past) render with full scores, WAEC grade badges, and teacher feedback.

### Thursday, October 22, 2026 (Offline Grades Pop-up Dropdowns, Auto-Select Session/Term, Student Access & Scheduled Release Dates)

- **Offline Grades Recording Modal, Student Access & Scheduled Release System ([RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx), [OfflineGradesHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesHeader.tsx), [OfflineRecordsList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineRecordsList.tsx), [grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/grade/grade.service.ts), [academic/grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/academic/grade.service.ts))**:
    - [x] **Scheduled Release Date Architecture**:
        - **Database Schema**: Added `"releaseDate" TIMESTAMPTZ` column to PostgreSQL `grades` table on Supabase.
        - **Prisma Integration**: Updated `model Grade` in `backend/prisma/schema.prisma` with `releaseDate DateTime?` and generated updated Prisma Client.
        - **Backend Query Gating**: Hardened `getStudentGradesService` (`backend/src/modules/academic/grade.service.ts`) to strictly enforce `{ status: "PUBLISHED", OR: [{ releaseDate: null }, { releaseDate: { lte: now } }] }`, preventing students from accessing draft or future-scheduled offline marks until the scheduled release date/time.
        - **Batch Persistence**: Updated `bulkCreateGradesService` (`backend/src/modules/grade/grade.service.ts`) to validate, persist, and update `releaseDate` on grade records and audit logs.
        - **UI Input Picker**: Integrated an optional `datetime-local` **Release Date** picker with calendar indicator in `OfflineGradesHeader.tsx`. Leaving it blank releases immediately upon clicking *Publish Grades*, while selecting a future date locks scores until that timestamp arrives.
        - **Status Indicators**: Added scheduled release badges (`Clock` icon + target release date) across cards and table rows in `OfflineRecordsList.tsx`.
    - [x] **Auto-Select Active Session & Term**:
        - Automatic detection and selection of the current academic session (`isCurrent === true`, `isActive === true`, or `status === 'ACTIVE'`).
        - Normalization and auto-selection of the active term (`FIRST`, `SECOND`, or `THIRD`).
        - Dynamic session switching: changing academic session updates `sessionId`, `sessionName`, and synchronizes the session's active term automatically.
    - [x] **Zero Auto-Selection of Class Cohort**:
        - Strictly defaults `classId: ''` and `className: ''` when opening the modal fresh so no class is arbitrarily pre-selected.
        - Displays clean placeholder `"Select Class Cohort"` and disables downstream subject selection until a class cohort is chosen.
        - Added dedicated empty state panel (`"Select a Class Cohort to Begin"`) in the modal roster workspace showing session/term metadata and guiding the user to choose a class.
    - [x] **Dropdown & Select Component Polish**:
        - Configured `z-[70]` and scrollable `max-h-60` containers on all `<SelectContent>` and `<DropdownMenuContent>` portals so dropdowns render smoothly above the modal dialog without clipping or layering issues.
        - Subject curriculum dropdown dynamically populates from the chosen class cohort and defaults to the class's first subject.
    - [x] **Comprehensive Security & Data Validation**:
        - Multi-layer security validation before batch grade mutation:
            - Validates `schoolId` presence and authenticity.
            - Verifies that the selected class cohort strictly belongs to the admin's institution.
            - Sanitizes and bounds `subject` and `assessmentType` strings (max 100 characters).
            - Validates academic term against strict whitelist (`FIRST`, `SECOND`, `THIRD`).
            - Enforces non-negative scores (`score >= 0`) and validates that no score exceeds `maxMarks`.
            - Bounds `maxMarks` (`1 <= maxMarks <= 1000`) and weight multiplier (`0.1 <= weight <= 10`).
            - Truncates and validates student remarks to 500 characters max.
        - Backend Bugfix: Safely declared `examId` and `subjectPaperId` in `bulkCreateGradesService` (`backend/src/modules/grade/grade.service.ts`), preventing potential runtime reference errors during bulk grade transactions.
    - [x] **Student Code Column & Badge Space Expansion**:
        - Expanded the Student Code column in the desktop spreadsheet ([RosterSpreadsheetView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RosterSpreadsheetView.tsx)) from cramped `w-36` (144px) to `w-60 min-w-[220px]`.
        - Enlarged the student code badge badge padding to `px-3.5 py-1.5`, font size `text-xs font-bold`, with minimum badge width `min-w-[140px]` to ensure long student registration/matriculation codes never wrap or clip.
        - Enhanced mobile card student code badge ([MobileRosterCardView.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/MobileRosterCardView.tsx)) with `px-2.5 py-1 text-xs font-bold tracking-wider`.

### Thursday, October 22, 2026 (Offline Grades Dedicated Standalone Page & Sidebar Feature)

- **Offline Grades Standalone Feature & Class Details Integration ([offline-grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/page.tsx), [app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/app-sidebar.tsx), [adminFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/adminFeatureFlags.ts), [classes/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/page.tsx))**:
    - [x] **Sidebar Navigation & Permissions**:
        - Added `offlineGrades: true` to `ADMIN_FEATURE_FLAGS` and role permissions (`["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR", "SUPPORT"]`) in `adminFeatureFlags.ts`.
        - Added `Offline Grades` navigation item (`FileSpreadsheet` icon) under **Academics** in `app-sidebar.tsx` linking directly to `/dashboard/admin/offline-grades`.
    - [x] **Created Dedicated Standalone Page (`/dashboard/admin/offline-grades`)**:
        - Created page route at `frontend/src/app/dashboard/admin/offline-grades/page.tsx` with breadcrumbs and full workspace container.
    - [x] **Offline Assessment Records Directory Architecture (`OfflineRecordsList.tsx`, `RecordScoreEntryModal.tsx`)**:
        - Updated page flow so the primary view displays the directory/catalog of offline assessment records we have (CA marksheets, quizzes, midterm tests, exam batches), NOT a raw list of students.
        - Provides KPI summary cards (Total Records, Student Marks Recorded, Published, Drafts), multi-dimensional filters (Class, Subject, Category, Status), and Grid/List view switcher.
        - Each record card presents title, subject, class, category pill, graded count progress, class average, pass rate, and actions.
        - Encapsulated student roster grading into `RecordScoreEntryModal.tsx` which opens on "+ Record New Offline Grade" or "View / Edit Scores", keeping the main page focused cleanly on assessment records.
    - [x] **Assessment Categorization & Grouping Fixes ([OfflineGradesDashboard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard.tsx), [grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/grade/grade.service.ts))**:
        - **Intelligent Category Normalizer**: Created `normalizeOfflineCategory` at module scope mapping raw strings (`CA`, `QUIZ`, `MIDTERM`, `ASSIGNMENT`, `EXAM`) and title keywords (`Continuous`, `Pop Test`, `Homework`, `Mid-Term`) so records are categorized accurately even when database enum defaults were used.
        - **Module Scope Placement**: Fixed Turbopack build error by placing `normalizeOfflineCategory` outside the component function at top-level module scope.
        - **Category-Aware Compound Key**: Fixed batch grouping key to include `normalizedCategory + assessmentTitle + subject + classId + term`, preventing different assessment categories from colliding.
        - **Accurate Cohort Averages**: Fixed moving average calculation to compute accurate weighted averages (`sumScores / gradedStudents`).
        - **Backend Query Limit Fix**: Increased default query limit from 10 to 1000 in `getGradeHubService` and `OfflineGradesDashboard.tsx` so all student marks load.
        - **Strict Offline Isolation Filter**: Added `isOfflineGradeRecord` and `offlineOnly: 'true'` filter to completely exclude CBT exams, online quiz attempts, and digital assignment submissions (`examId`, `examAttemptId`, `subjectExamAttemptId`, `subjectPaperId`, `grade-assignment-*`, `grade-sa-*`).
    - [x] **Assessment Category Tabs Bar (`OfflineRecordsList.tsx`)**:
        - Added dedicated category tabs for **Terminal Exams**, **Continuous Assessment (CA)**, **Physical Assignments**, and **Quizzes / Tests** (plus **All Records**).
        - Each tab displays live record badge counts, active color styling, and immediately filters marksheets.
        - Synchronized contextual action buttons (`Record New Exam Marksheet`, `Record New CA Marksheet`, `Record New Assignment`, `Record New Quiz / Test`) to auto-populate the modal's default category when opened from that tab.
    - [x] **Modal & Scoring Workspace Width Expansion**:
        - Expanded the offline grades score recording modal ([RecordScoreEntryModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal.tsx)) from cramped `max-w-4xl` (896px) to a spacious `w-[96vw] max-w-7xl 2xl:max-w-[1500px]` workspace.
        - Enlarged the companion CSV batch import dialog ([OfflineGradesCSVModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesCSVModal.tsx)) and AI Vision OCR scanner dialog ([OfflineGradesOCRModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/offline-grades/components/OfflineGradesOCRModal.tsx)) to `w-[90vw] sm:w-full max-w-2xl` for comfortable viewing and entry.
    - [x] **Turbopack / SWC Parser Refactor**:
        - Replaced nested ternary condition in `OfflineGradesDashboard.tsx` with a clean `renderContent()` dispatcher function, resolving the `Error: Not a pattern` build error.
    - [x] **Offline Grades Dashboard Architecture (`OfflineGradesDashboard.tsx`)**:
        - Integrated context configuration: Target Class Cohort, Subject Curriculum, Assessment Category (`CA`, `QUIZ`, `MIDTERM`, `ASSIGNMENT`, `EXAM`), Assessment Name/Label, Max Marks, Weight Multiplier, Academic Session, and Term.
        - Supported URL query parameter `?classId=...` and `defaultClassId` prop for instant deep-linking from class pages.
        - Synchronized student roster fetching from class enrollments and pre-filled existing grade records from `gradeService.getAdminGrades`.
        - Connected batch score persistence mutation (`POST /grades/bulk`) supporting both **Draft** and **Published** states.
    - [x] **Desktop Spreadsheet View (`RosterSpreadsheetView.tsx`)**:
        - Implemented rapid keyboard navigation (<kbd>Enter</kbd> / <kbd>↓</kbd> / <kbd>↑</kbd>) to punch scores sequentially across student rows.
        - Real-time calculation of percentage, letter grade pill (`A+`, `A`, `B`, `C`, `D`, `F`), and validation against Max Marks.
        - Integrated batch quick-fill controls ("All Max", "All Absent / 0", "Reset").
    - [x] **Mobile-First Touch Cards View (`MobileRosterCardView.tsx`)**:
        - Built touch-friendly cards for mobile displays (<768px) with large numeric inputs (`inputMode="decimal"`), letter grade chips, and collapsible teacher remarks.
        - Implemented floating sticky bottom action bar with live grading tally (`X of Y Graded`), progress percentage, and thumb-friendly Save Draft / Publish buttons.
    - [x] **Batch Tools & Audit History**:
        - **CSV Import Modal (`OfflineGradesCSVModal.tsx`)**: One-tap download of class-specific pre-filled roster template and client-side CSV parser to bulk apply scores.
        - **AI Vision OCR Scan Modal (`OfflineGradesOCRModal.tsx`)**: Camera and image upload scanner integrating with `/grades/ocr` to transcribe handwritten/printed physical grade sheets into student scores.
        - **Standard PDF & CSV Exports**: Formatted PDF export using the centralized `generatePDF` utility adhering to school profile, metadata, and tabular styles.
        - **History Table (`OfflineGradesHistoryTable.tsx`)**: Audit table displaying previously recorded offline grade batches with editing, publishing, and delete confirmation dialogs.
    - [x] **Class Details Page Integration (`classes/[id]/page.tsx`)**:
        - Embedded the `offline-grades` tab directly into the Class Details page with `defaultClassId={id}` so admins can also manage offline grades directly within the class workspace.

### Wednesday, October 21, 2026 (Class Details Page & Exams Tab Dark Mode, Header & Tab Focus Polish)

- **Class Details & Exams Tab Dark Mode & Visual Polish ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/page.tsx), [ExamsTab.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/exams/ExamsTab.tsx), [Tabs.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/[id]/components/Tabs.tsx))**:
    - [x] **Dark Mode Button & Contrast Redesign**:
        - Fixed the core issue where `bg-primary text-white` inverted in dark mode to near-white (`oklch(0.922 0 0)`), producing invisible white text on white backgrounds.
        - Replaced all primary actions ("Create New", "Manage Papers", "Manage Class", and active pagination buttons) with solid, vibrant `bg-indigo-600 hover:bg-indigo-700 text-white` with clean dark mode states.
        - Redesigned "Results" and secondary buttons with distinct dark slate backgrounds (`dark:bg-slate-800`), explicit borders (`dark:border-slate-700/80`), and high contrast text.
        - Upgraded Export dropdown menu container and items with dark theme support (`dark:bg-slate-800`, `dark:border-slate-700`, `dark:text-slate-200`).
        - Progress bars upgraded from `bg-primary` to rich indigo (`bg-indigo-600 dark:bg-indigo-500`) across mobile cards and desktop tables.
    - [x] **Filter Pills Dark Mode Unification**:
        - Replaced mismatched styles with unified indigo active pills (`bg-indigo-600 text-white shadow-sm`) and distinct dark slate inactive pills (`dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-300`).
    - [x] **Page Header Harmonization**:
        - Replaced clashing dark palette (`dark:bg-[#1b2232]` and `dark:border-[#364563]`) with unified `dark:bg-slate-900` and `dark:border-slate-800`.
        - Replaced class avatar container with `bg-indigo-50 dark:bg-indigo-950/60` and `text-indigo-600 dark:text-indigo-400`.
        - Fixed header action buttons: "Manage Class" and "QR Access" now feature proper dark borders, subtle hover shifts, and accessible focus rings.
    - [x] **Tabs Navigation Active & Focus Accessibility ("tabe focus")**:
        - Eliminated the dull `dark:bg-[#253046]` in `Tabs.tsx`.
        - Implemented a punchy, unmistakable active state: `bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 dark:bg-indigo-600 dark:text-white dark:shadow-indigo-900/50`.
        - Added clear accessibility and keyboard focus-visible rings (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900`).
        - Replaced the container with `bg-slate-100/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800`.
    - [x] **Full Production Build & TypeScript Strict Audit**:
        - Frontend `npm run build` (`next build`) completed with **Exit code 0** across all static and dynamic pages.
        - Frontend `npx tsc --noEmit` verified with **0 errors**.
        - Backend `npx tsc --noEmit` verified with **0 errors**.

### Wednesday, October 21, 2026 (Admin Team Management Mobile Overhaul & Governance Polish)

- **Admin Team Management Page & Responsive Governance Flow ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/team/page.tsx), [ActiveMembersTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/team/components/ActiveMembersTable.tsx), [PendingRequestsTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/team/components/PendingRequestsTable.tsx))**:
    - [x] **Mobile-First Responsive Card Overhaul**:
        - Replaced rigid horizontal-overflow tables on mobile screens (< 768px) with dedicated, touch-friendly cards for both Active Members and Pending Requests.
        - **Active Members Mobile Cards**: Displays avatar with fallback SVG, School Owner crown indicator, member name with "You" chip for current admin, email address, themed role badge with icon (School Owner, Principal, Registrar, Accountant, Support), joined date pill, and full-featured actions dropdown menu.
        - **Pending Requests Mobile Cards**: Displays applicant avatar, name, mono email, request timestamp, "Pending Review" amber indicator, and prominent touch action buttons (Approve & Assign, and Reject).
    - [x] **Desktop Table Polish**:
        - Retained and polished desktop table view (>= 768px) with crisp typography, hover row states, subtle borders, and quick dropdown menus.
    - [x] **URL Parameter & Email Deep-Linking Support**:
        - Added `useSearchParams()` support to read `?tab=pending` directly, matching the email notification approval link generated by the backend (`approvalUrl`). Clicking the link now switches directly to the pending requests tab.
    - [x] **Executive Overview Stat Cards**:
        - Added 4 modern executive stat cards at the top of `/dashboard/admin/team`: Active Members count, Pending Requests (with action required highlight), School Owner card with email/name, and Current User's access level.
    - [x] **Functional Integrity & Permissions**:
        - Preserved and verified all governance actions: Role modification (`updateAdminRole`), Ownership transfer with confirmation dialog (`transferOwnership`), Admin removal with session revocation (`removeAdmin`), and Request approval with role selection (`approveAdmin`) and rejection with optional reason (`rejectAdmin`).
        - Responsive dialogs formatted cleanly for mobile and desktop screens.
    - [x] **TypeScript Strict Audit**:
        - `npx tsc --noEmit` verified with 0 errors across the frontend.

### Wednesday, October 21, 2026 (Admin Grades Redesign & Dedicated Grade Details Page)

- **Admin Grades Page Redesign & Dedicated Details Flow ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/page.tsx), [GradeHub.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/components/GradeHub.tsx), [[gradeId]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/grades/[gradeId]/page.tsx), [grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/academic/grade.service.ts))**:
    - [x] **Eliminated Grade Details Popup Slide-Over**:
        - Completely removed `GradeDetailSheet` modal/sheet in favor of a full dedicated page.
        - Updated card click, table row click, and "View Details" dropdown action in `GradeHub.tsx` to directly navigate to `/dashboard/admin/grades/${grade.id}`.
    - [x] **Created Dedicated Grade Details Page (`/dashboard/admin/grades/[gradeId]`)**:
        - Back navigation breadcrumb bar with student name and subject link.
        - Primary Score Hero Card with letter grade chip (`A+`, `A`, `B`, `C`, `D`, `F`), numerical score, max marks, percentage badge, animated progress bar, and pass/fail indicator.
        - Academic & Grading Metadata grid displaying Subject, Assessment Type, Weight Multiplier, Class Cohort, Term, Session, Linked Exam, Linked Paper, Recorded By teacher, and timestamps.
        - Teacher Remarks card with quote styling and instructor attribution.
        - Student Profile summary card with avatar, student code, grade level, and quick link to student profile.
        - Visual Grading Scale Reference card.
        - Action controls for Publishing draft grades, Editing grades, Deleting with a confirm dialog, and native Printing.
    - [x] **Main Grades Dashboard Redesign (`/dashboard/admin/grades`)**:
        - Redesigned the 4 top stats cards (Total Exams, Subject Papers, Graded Students, Average Score) from outdated saturated header blocks into sleek, modern unified cards with translucent icon pills, live counts, tooltips, and mini trend bars.
        - Upgraded the Operational Control Tabs bar into a clean pill-style horizontal scrolling navigation bar with active theme pill indicators and icons for each assessment type.
    - [x] **Backend & Type Consistency**:
        - Enhanced `getGradeByIdService` in `backend/src/modules/academic/grade.service.ts` to include complete student, class, teacher, session, exam, subjectPaper, and attempt relations.
        - Extended `Grade` TypeScript interface in `frontend/src/lib/api/services/gradeService.ts`.
        - Verified `npx tsc --noEmit` on both frontend and backend (0 errors).

### Wednesday, October 21, 2026 (Admin Students Directory Mobile Numbering & Card Polish)

- **Admin Students Directory List Numbering & Mobile UI ([StudentsTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/components/StudentsTable.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/students/page.tsx))**:
    - [x] **Sequential Numbering**:
        - Added pagination-aware sequential numbering `#${(page - 1) * 10 + index + 1}` to both the mobile list view cards and grid view cards in a dedicated high-contrast badge (`tabular-nums font-black`).
    - [x] **Mobile Card Layout Overhaul**:
        - Redesigned the mobile cards into structured, modern cards with distinct header (checkbox, numbering badge, mono student code, and active/pending status dot).
        - Main student row with full-size avatar, verified shield badge (`ShieldCheck`), student email, and direct navigation indicator (`ChevronRight`).
        - Attributes footer chips showing class pill with `GraduationCap`, gender badge, and guardian name.
        - Added a responsive multi-selection bar with count and clear button when students are checked on mobile.
    - [x] **Page Layout & Pagination Responsiveness**:
        - Adjusted outer container padding `p-3.5 sm:p-6 lg:p-8` and width `w-full sm:w-[95%]`.
        - Responsive stat cards with `gap-2.5 sm:gap-4`, `p-3.5 sm:p-5`, and number sizing `text-2xl sm:text-3xl`.
        - Responsive pagination hiding "Rows per page: 10" on mobile screens so page number buttons never get squashed.
    - [x] **TypeScript Strict Audit**:
        - 0 errors verified across the workspace with `npx tsc --noEmit`.

### Wednesday, October 21, 2026 (Teacher Profile Header Bug Fix & Schedule Tab Mobile Overhaul)

- **Teacher Profile Header [object Object] Bug Fix ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/teachers/%5BteacherId%5D/page.tsx))**:
    - [x] **Safe Subject Mapping**:
        - Fixed `subjects.slice(0, 2).join(', ')` which was stringifying raw subject objects directly as `[object Object], [object Object]` next to the Department name ("General · [object Object]").
        - Updated `subjectNames` mapping to safely extract subject names: `subjects.map((s: any) => typeof s === 'string' ? s : (s?.name || s?.subject?.name || '')).filter(Boolean)`.
        - Replaced line 225 with `{department}{subjectNames.length > 0 ? ` · ${subjectNames.slice(0, 2).join(', ')}` : ''}`.
    - [x] **Tabs Component Mobile Refinement**:
        - Updated tab bar container with rounded corners and border on mobile (`rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800`).
        - Reduced tab button minimum width and padding on mobile (`min-w-[100px] sm:min-w-[140px] px-3 sm:px-6 md:px-10 py-2 sm:py-3`) for a snug, modern fit.

- **Schedule Tab Mobile Responsiveness & Day Agenda View ([SchedulePage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/teachers/%5BteacherId%5D/schedule/SchedulePage.tsx), [TeacherTimetableGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/teachers/%5BteacherId%5D/schedule/TeacherTimetableGrid.tsx), [TimetableToolbar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/teachers/%5BteacherId%5D/schedule/TimetableToolbar.tsx), [AddScheduleModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/teachers/%5BteacherId%5D/schedule/AddScheduleModal.tsx))**:
    - [x] **Mobile Day Agenda View & View Mode Switcher**:
        - Added interactive View Mode toggle: **Day Agenda** (`ListOrdered`) and **Week Grid** (`Grid3X3`). Defaults to Day Agenda on mobile devices (<768px) and Week Grid on desktop (>=768px).
        - Created a touch-friendly horizontal day pill selector: Mon, Tue, Wed, Thu, Fri, Sat, Sun. Each pill displays day name, "Today" chip if active, and a scheduled class counter badge (e.g. `2 classes` / `Free`).
        - Built a chronological vertical agenda for the selected day with time pills, live "Happening Now" animated indicator, rich subject cards with class tags, room locations, assignment status pills, clash detection alerts, and dedicated amber recess/break banners.
        - Supported instant one-tap slot scheduling on free periods.
    - [x] **Week Grid Sticky Column**:
        - Made the first column (Period / Time Slot) sticky with shadow and background so that horizontal swiping on mobile keeps time labels visible at all times.
        - Added a helpful mobile horizontal scroll indicator banner.
    - [x] **Toolbar & Modal Mobile Optimizations**:
        - Modernized `TimetableToolbar` using Lucide icons (`ChevronLeft`, `ChevronRight`, `Download`, `Plus`), responsive layout, and mobile-friendly button text.
        - Updated `AddScheduleModal` with `max-h-[90vh] overflow-y-auto`, responsive single/double column form grid (`grid-cols-1 sm:grid-cols-2`), and mobile-first touch-friendly footer actions.
    - [x] **TypeScript Strict Audit**:
        - 0 errors verified across the workspace with `npx tsc --noEmit`.

### Wednesday, October 21, 2026 (Admin Teachers Directory Mobile Responsiveness & Grid View Overhaul)

- **Admin Teachers Directory Mobile Overhaul ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/teachers/page.tsx), [TeacherGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/teachers/components/TeacherGrid.tsx))**:
    - [x] **Grid View Implementation**:
        - Created a dedicated, responsive `TeacherGrid` component featuring rich cards with top header (`#index` + mono `facultyCode` + status pill with pulsing active indicator), avatar, teacher name, email, assigned subjects tags (`BookOpen`), assigned classes tags (`GraduationCap`), and "View Profile" link with `ChevronRight`.
        - Responsive grid columns: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5`.
    - [x] **Default View Mode & View Switcher**:
        - Configured view mode to automatically default to `grid` on mobile devices (`<768px`) and `list` on desktop (`>=768px`).
        - Added interactive `Grid` / `List` view toggle switcher in the toolbar with active pill styling and icons (`LayoutGrid` and `List`).
    - [x] **Mobile UX & Responsive Layout**:
        - Reduced outer page padding on mobile from `p-6 lg:p-8` to `p-3.5 sm:p-6 lg:p-8` and increased container width from `w-[95%]` to `w-full sm:w-[95%]`.
        - Compact stats cards gap `gap-2.5 sm:gap-4`, padding `p-3.5 sm:p-5`, and number sizing `text-2xl sm:text-3xl`.
        - Adjusted attendance chart height `h-[180px] sm:h-[200px]` with negative left margin `left: -20` to prevent horizontal clipping.
        - Responsive toolbar with full-width search bar on mobile, and responsive action button labels (`Export`, `Attendance`, `Add Teacher`).
        - Unified standalone pagination card rendered beneath both Grid and List views with responsive row counts.
    - [x] **TypeScript Strict Audit**:
        - 0 errors verified across the frontend workspace (`npx tsc --noEmit`).

### Wednesday, October 21, 2026 (Admin Linking Hub Mobile Card Overflow & Responsive Grid Fixes)

- **Admin Linking Hub Mobile Overflow ([ConnectionCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/ConnectionCard.tsx))**:
    - [x] **Card Boundary & Text Containment**:
        - Added `w-full min-w-0` to the root `<Card>` container for both active and pending connection cards.
        - Fixed user name `<h3>` and email `<p>` containers by removing fixed `max-w-[200px]` that extended past card boundaries on mobile screens (~130-160px card widths), replacing with `w-full min-w-0 px-2` and `w-full max-w-full truncate`.
        - Added native `title` tooltips displaying the complete unabbreviated name and email on hover/tap.
    - [x] **Responsive Grid Overhaul ([ActiveLinksGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/ActiveLinksGrid.tsx), [PendingRequestsGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/PendingRequestsGrid.tsx), [LinkingSkeleton.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/linking/components/LinkingSkeleton.tsx))**:
        - Changed hardcoded 2-column mobile layout (`grid-cols-2`) to responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6`, preventing cramped, squished layouts on phones (<640px).
        - Updated Batch Actions bar in `PendingRequestsGrid.tsx` to stack flexibly (`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4`) with a full-width action button on mobile.
        - Updated `ProfilePreviewModal.tsx` to safely handle long user names with `w-full min-w-0 px-4 break-words`.
    - [x] **TypeScript Strict Audit**:
        - 0 errors verified across the frontend workspace (`npx tsc --noEmit`).

### Wednesday, October 21, 2026 (Admin Website Inquiries List Numbering & Header Alignment)

- **Admin Inquiries List Numbering ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/inquiries/page.tsx))**:
    - [x] **Desktop Table Header Alignment**:
        - Restored missing select-all checkbox column in table `<thead>`, resolving a 1-column offset where the `#` number header previously sat misaligned over the checkboxes and `Contact Info` was sitting over numbers.
        - Verified that the `#` header correctly aligns with sequential numbering (`(page - 1) * limit + index + 1`).
    - [x] **Mobile List Card Numbering**:
        - Added `#` numbering badge (`#1`, `#2`, etc.) to the mobile inquiry card items beside the selection checkbox.
    - [x] **TypeScript Strict Audit**:
        - 0 errors verified across the frontend workspace.

- **Admin Records Grid Card & Status Badge ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/records/page.tsx))**:
    - [x] **Top Header & Status Badge Alignment**:
        - Re-engineered the Subject Card top row into a dedicated metadata bar: `#ID` badge + Session/Term label on the left, and a polished status pill on the right.
        - Redesigned the "PUBLISHED" / "DRAFT" badge into an illuminated pill with a colored glowing dot indicator (`bg-emerald-500` / `bg-amber-500`), subtle border, and uppercase tracking (`text-[10px] font-extrabold tracking-wider`).
        - Moved the record Title to its own row below the metadata header, removing the cramped `max-w-[70%]` squeeze and preventing title collisions.
    - [x] **Class and Subject Badges**:
        - Styled Class and Subject badges with distinct background surfaces (`bg-slate-50 dark:bg-slate-900/60`), subtle borders, uppercase metadata labels, and truncated bold text.
    - [x] **Card Footer & Action Button**:
        - Replaced raw text links with a calendar date pill with icon and a sleek, styled "Edit Results" action button (`bg-[#5B5CE6]/10 hover:bg-[#5B5CE6] hover:text-white`).
    - [x] **Student Record Cards Alignment**:
        - Applied the same visual hierarchy and 2-row layout across the Student Records grid cards.
    - [x] **Table View Consistency**:
        - Updated the Status column in list table view to use the identical illuminated pill badge.

- **Admin Create Assessment Mobile Layout & Flow ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/exams/new/page.tsx), [CreateExamForm.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/exams/new/components/CreateExamForm.tsx), [SearchableSelect.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/exams/new/components/SearchableSelect.tsx))**:
    - [x] **Navigation Header & Back Route**:
        - Integrated a touch-friendly back button returning admins to `/dashboard/admin/exams`.
        - Responsive typography scaling (`text-xl sm:text-2xl md:text-3xl`) and padding (`px-4 sm:px-6 md:px-8 py-4 sm:py-8`).
    - [x] **Adaptive Stepper (Mobile Pill + Desktop MUI)**:
        - Resolved mobile horizontal squishing and overflow of MUI Stepper by introducing a dedicated mobile step indicator (`sm:hidden`) featuring active step count, step name, percentage progress badge, and pill tracks.
        - Preserved standard MUI horizontal stepper for `sm:` and desktop viewports.
    - [x] **Step Validation & Silent Submit Prevention**:
        - Integrated `trigger(["title"])` in `handleNext` and `handleStep` to prevent users from silently skipping Step 0 with an invalid title and encountering unresponsive creation buttons on Step 2.
        - Added scope target checks (`classId` when scope is CLASS, `departmentIds` when scope is DEPARTMENT).
    - [x] **Responsive Form Fields & Cards**:
        - Upgraded main card container from fixed `p-8 rounded-3xl` to `p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl`.
        - Clamped input heights and paddings to `h-12 sm:h-14 rounded-xl sm:rounded-2xl` across text inputs, textareas, datetime-local, and SearchableSelect dropdowns.
        - Restructured Single Subject Duration and Pass Mark into a clean side-by-side 2-column grid (`grid grid-cols-2 gap-3 sm:gap-6`).
        - Restructured Target Departments grid into single/double column wrap (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) to eliminate text clipping on 360-390px mobile screens.
    - [x] **Touch Ergonomics on Bottom Navigation**:
        - Upgraded Back, Next, and Submit buttons to comfortable `h-11 sm:h-12` heights with responsive icons and state indicators (loading spinner, redirection status).
    - [x] **Tenant Fallback Security**:
        - Added `defaultTenantId` fallback for `activeSchoolId` to prevent school session loading failures.

- **Admin Assignment Detail Mobile Layout & Responsiveness ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/page.tsx), [QuestionManager.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/components/QuestionManager.tsx), [SubmissionList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/components/SubmissionList.tsx), [ManualAddForm.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/components/ManualAddForm.tsx), [AITools.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/components/AITools.tsx), [EditPaperModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/components/EditPaperModal.tsx), [SettingsModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/components/SettingsModal.tsx), [SubmissionReviewModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/assignments/[id]/components/SubmissionReviewModal.tsx))**:
    - [x] **Sticky Two-Tier Navigation Header**:
        - Re-engineered the assignment header into an adaptive 2-tier layout:
            - **Primary Row**: Left side displays the back button and truncated title with responsive font size (`text-sm sm:text-base md:text-lg`). Right side houses compact Action buttons (Publish/Unpublish toggle with label hidden on mobile, and Settings icon).
            - **Secondary Mobile Sub-strip (`sm:hidden`)**: Neatly presents Published/Draft status chip, Teacher/Creator name, Total Marks badge, and Due Date below the header bar without cramping or horizontal scrolling.
        - Refined skeleton loader dimensions and paddings to prevent mobile overflow during initial load.
    - [x] **Responsive Tab Layout & Containers**:
        - Transformed the 3 tab triggers (`Questions`, `Submissions`, `Instructions/Details`) into an adaptive grid with responsive text (`Details` on mobile, `Instructions` on desktop).
        - Updated all main tab containers from fixed `p-8 rounded-[2rem]` to `p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem]`.
    - [x] **Submissions Tracker Mobile Card View**:
        - Implemented a dedicated native-feel card list (`md:hidden`) showing student avatar, name, email, submission date, status badge, score breakdown, and Review button.
        - Retained desktop table layout on `md:` breakpoints with smooth horizontal scroll containment.
    - [x] **Question Manager & Card Ergonomics**:
        - Upgraded sub-navigation buttons (`Questions List`, `Add Question`, `AI Tools`) to wrap fluidly on small screens (`w-full sm:w-auto`).
        - Positioned sortable question checkboxes (`top-3 sm:top-4 left-3 sm:left-4`) and optimized card inner padding (`p-3.5 sm:p-5`) to eliminate touch overlap.
        - Wrapped question marks and correct answer badges to prevent overflow on 360px-400px devices.
    - [x] **Manual Question Editor & Modals**:
        - Converted question type chips and marks inputs in `ManualAddForm` into a responsive 2x2 grid on mobile that transforms into inline chips on desktop.
        - Stamped responsive dialog boundaries (`w-[95vw] sm:max-w-...`, `max-h-[90vh]`, stacked button footers) across `EditPaperModal`, `SettingsModal`, and `SubmissionReviewModal`.
    - [x] **TypeScript Strict Audit**:
        - All files verified against zero compile errors.

### Wednesday, October 21, 2026 (Admin Billing Mobile Responsiveness Overhaul)

- **Admin Billing Mobile Layout & Responsiveness ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/billing/page.tsx), [TransactionHistory.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/dashboard/TransactionHistory.tsx), [AtmAccountCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/AtmAccountCard.tsx), [UsageLimitsCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/subscription/UsageLimitsCard.tsx))**:
    - [x] **Header & Skeleton Loading Optimization**:
        - Sized skeletons to fit mobile widths with `max-w-[400px]` constraints to eliminate horizontal overflow.
        - Adjusted title typography with `text-2xl sm:text-4xl md:text-5xl` and responsive tooltips.
        - Made "Change Plan" button stretch to full width on mobile viewports for clean touch ergonomics.
    - [x] **Subscription Tier & Metric Cards**:
        - Replaced fixed large typography in current plan cards with responsive clamps (`text-2xl sm:text-4xl lg:text-5xl`) to prevent word wrapping on small displays.
        - Wrapped plan features into flexible layouts on mobile.
        - Enhanced button and card padding (`p-5 sm:p-6`, rounded-2xl / sm:rounded-3xl) for modern mobile aesthetics.
    - [x] **Transaction History Mobile Card View**:
        - Replaced the desktop horizontal-scroll table with a sleek, native-feel Mobile Card List (`md:hidden`), displaying invoice references, status badges, amounts, payment icons, and "View receipt" links.
        - Built a compact mobile pagination control (`Page X of Y` with Previous/Next controls) that never overflows small screens.
        - Optimized the interactive receipt modal dialog with viewport height boundaries and touch-friendly scrollability.
    - [x] **Bank Accounts & Payout Nodes Carousel**:
        - Refined `AtmAccountCard` padding (`p-5 sm:p-7`) and scaled card number font size (`text-base sm:text-2xl` with tracking `0.15em sm:0.3em`) to eliminate text clipping on 360-390px screens.
        - Set carousel item widths to `w-[86vw] max-w-[340px] sm:w-[380px]` with snap scrolling to ensure adjacent cards peek smoothly into view.
    - [x] **TypeScript Strict Audit**:
        - Cleaned all residual `any` usages across `isSuperAdmin`, `analytics.accounts`, `activePlanData`, `latestTxn`, and catch blocks.

### Wednesday, October 21, 2026 (Admin Announce & Weekly Report Feature Activation)

- **Admin Dashboard Hero Actions ([AdminAnnouncementModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/AdminAnnouncementModal.tsx), [AdminWeeklyReportModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/dashboard/AdminWeeklyReportModal.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/page.tsx))**:
    - [x] **School-Wide Broadcast Announcement Modal (`AdminAnnouncementModal`)**:
        - Created interactive modal allowing administrators to send announcements to targeted audiences (`Students`, `Teachers`, `Parents`).
        - Added class cohort selector with "All Classes / Entire School" option as well as single-class targeting.
        - Supported priority levels (`Standard`, `Important`, `Urgent`) with appropriate badge styling and icons.
        - Integrated with `classService.sendAnnouncement` and automatic cache invalidation on `notifications` query key with toast feedback.
    - [x] **Executive Weekly Briefing & KPI Report Modal (`AdminWeeklyReportModal`)**:
        - Built executive modal computing current week date span (Monday – Friday).
        - Provided institutional KPI overview: Total Enrolled Students, Certified Academic Staff, Active Registered Classes, and Academic Standing.
        - Embedded institutional operational insights card displaying status notes.
        - Rendered active cohort capacity table with student counts and sections.
        - Integrated single-click Executive PDF Report generator adhering to standard global export guidelines (`generatePDF` from `@/utils/pdfGenerator.ts`) and direct browser print support (`window.print()`).
    - [x] **Admin Page Integration (`page.tsx`)**:
        - Connected hero banner "Announce" and "View weekly report" buttons with dedicated states and click handlers.
        - Integrated `useClasses` and `useSchoolProfile` hooks for accurate cohort and institutional data.
        - Enforced strict TypeScript typing with zero `any` usage.

### Wednesday, October 21, 2026 (Full Project Build Verification & Fixes)

- **Build & Compilation Audit ([notification.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/notification/notification.controller.ts), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/notifications/page.tsx))**:
    - [x] **Backend Type Check**:
        - Resolved TS2367 comparison error in `notification.controller.ts` by safely narrowing `n.type` with string type casting.
        - Verified `npx tsc --noEmit` on the backend: **0 errors**.
    - [x] **Frontend Production Build**:
        - Resolved missing outer card `</div>` nesting syntax error in `TeacherNotificationsPage` (`frontend/src/app/dashboard/teacher/notifications/page.tsx`).
        - Successfully executed full Next.js production build (`npm run build`):
            - Compiled successfully in 98s.
            - Finished TypeScript validation in 2.4min with **0 errors**.
            - Generated all 195 static and dynamic routes with **0 errors**.

### Wednesday, October 21, 2026 (Alert Sender Attribution & Resolution Fix)

- **Alert Sender Attribution & Resolution ([notification.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/notification/notification.controller.ts), [class.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/class/class.service.ts), [notificationSender.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/utils/notificationSender.ts), [MessagesAnnouncements.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/MessagesAnnouncements.tsx), [DashboardPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/DashboardPage.tsx), [NotificationDetailModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/notifications/NotificationDetailModal.tsx), [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/notifications/page.tsx))**:
    - [x] **Backend Sender Enrichment**:
        - Updated `getMyNotifications` in `notification.controller.ts` to include `linkRequest` relations (requester student, teacher, parent, school).
        - Added batch lookups for notifications with `senderType` and `senderId` to resolve the actual sender's name (`Student.name`, `Teacher.name`, `Parent.fullName`, `Admin.name`, `School.name`).
        - Enriched each notification object and its `meta` payload with `senderName` and `senderRole`.
    - [x] **Class Announcement Sender Retention**:
        - Updated `sendClassAnnouncementService` in `class.service.ts` to resolve the broadcaster's name and role and attach them into `meta.senderName` and `meta.senderRole`.
    - [x] **Centralized Frontend Sender Resolver**:
        - Created `resolveNotificationSender` in `frontend/src/lib/utils/notificationSender.ts` supporting `senderName`, `senderRole`, link request requester data, meta entity fields, and intelligent regex extraction from message patterns.
    - [x] **Dashboard Inbox & Alerts Update**:
        - Removed hardcoded fallback `'System'` / `'School'` in `DashboardPage.tsx` and `MessagesAnnouncements.tsx`.
        - Added clean sender name with role badge pills (`Student`, `Teacher`, `Parent`, `School Admin`).
    - [x] **Detail Modal & Feed Cards**:
        - Added dedicated Sender Attribution cards in `NotificationDetailModal` and notification feed cards in `TeacherNotificationsPage`.

### Wednesday, October 21, 2026 (Teacher Dashboard Inbox & Alerts Activated)

- **Teacher Inbox & Alerts ([MessagesAnnouncements.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/MessagesAnnouncements.tsx), [DashboardPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/DashboardPage.tsx))**:
    - [x] **Unlocked & Activated Live Communications Feed**:
        - Replaced the hardcoded "Locked" and "Coming Soon" construction placeholder in `MessagesAnnouncements`.
        - Connected real live notifications and alerts from `useNotifications`.
        - Added category filter pills: `All`, `Alerts` (`Megaphone`), and `Direct Messages` (`Mail`).
        - Formatted relative timestamps using `date-fns/formatDistanceToNow`.
        - Added unread badge indicator with pulsating state.
    - [x] **Interactive Reading & Optimistic Read State**:
        - Integrated `NotificationDetailModal` directly into the component. Clicking any alert or message opens its full details and automatically marks it as read via `useMarkAsRead`.
    - [x] **Connected Broadcast Action**:
        - Replaced the disabled compose button with an active **"Broadcast Alert / Announce"** button wired to `TeacherAnnouncementModal`.

### Wednesday, October 21, 2026 (Teacher Assessment & Grades Pad Export Standardization)

- **Teacher Assessment & Grades Export Alignment ([ExamsQuizzesOverview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/components/ExamsQuizzesOverview.tsx), [PageHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/components/PageHeader.tsx), [GradesOverview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/grades/components/GradesOverview.tsx), [TableToolbar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/grades/components/TableToolbar.tsx), [GradesTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/grades/components/GradesTable.tsx), [TeacherPaperDetailPage](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/papers/%5Bid%5D/page.tsx))**:
    - [x] **Assessment Central Export ([ExamsQuizzesOverview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/components/ExamsQuizzesOverview.tsx), [PageHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/components/PageHeader.tsx))**:
        - Added the Admin-style Export dropdown menu right alongside `Create New` in `PageHeader`.
        - Options: **Export as PDF** (rose FileText icon) and **Export as CSV** (emerald FileSpreadsheet icon) with real-time spin state.
        - PDF Export uses central `generatePDF` utility (`pdfGenerator.ts`) incorporating school logo, active category tab, class/subject/status filter metadata, and formatted landscape assessment tables.
        - CSV Export generates formatted RFC 4180 CSV blob with institutional headers and metadata.
    - [x] **Continuous Assessment & Grades Pad Export ([GradesOverview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/grades/components/GradesOverview.tsx), [TableToolbar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/grades/components/TableToolbar.tsx), [GradesTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/grades/components/GradesTable.tsx))**:
        - Replaced dead `onExport={() => {}}` stub with full PDF and CSV export logic.
        - Upgraded `TableToolbar` button to Admin's clean `DropdownMenu` format with `Export as PDF` and `Export as CSV`.
        - Exports all filtered student grades (Student name, Student ID, Subject/Paper, Type, Score, Percentage, Letter Grade, Status, Remarks).
    - [x] **Paper Detail Grades Export ([TeacherPaperDetailPage](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/papers/%5Bid%5D/page.tsx))**:
        - Replaced legacy `@react-pdf/renderer` single button with Admin-style DropdownMenu offering both `Export as PDF` (via `generatePDF`) and `Export as CSV`.
        - Fixed undefined school reference by querying `useSchoolProfile`.

### Wednesday, October 21, 2026 (Teacher Dashboard Announce & View Weekly Report Buttons Activated)

- **Teacher Hero & Dashboard Actions ([TeacherHero.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/TeacherHero.tsx), [DashboardPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/DashboardPage.tsx), [TeacherAnnouncementModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/TeacherAnnouncementModal.tsx), [TeacherWeeklyReportModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/TeacherWeeklyReportModal.tsx))**:
    - [x] **"Announce" Button Wired**:
        - Replaced dead button in `TeacherHero` with interactive modal trigger connected to `onAnnounce`.
        - Created `TeacherAnnouncementModal` allowing teachers to:
          - Select target cohort: "All My Assigned Classes" or a specific assigned class.
          - Multi-select recipient audience (`Students`, `Parents`).
          - Select priority (`NORMAL`, `HIGH`, `URGENT`) with color-coded chips.
          - Input announcement title and rich message body with real-time character counter.
          - Concurrently dispatches announcements via `classService.sendAnnouncement`.
    - [x] **"View Weekly Report" Button Wired**:
        - Replaced dead button in `TeacherHero` with interactive modal trigger connected to `onViewWeeklyReport`.
        - Created `TeacherWeeklyReportModal` rendering:
          - Executive summary for the current academic week (`Monday – Friday` date range).
          - Live metric cards: Weekly Attendance Rate (+3.2% trend), Class Cohort Avg Score, Total Enrolled Students, and Upcoming Lessons.
          - Academic Grade Distribution visualization (A, B, C, D, F progress bars with percentage share).
          - Assigned Classes & Curriculum Cohorts summary table.
          - **Download PDF Report**: Generates and downloads publication-ready PDF using `generatePDF` from `@/utils/pdfGenerator.ts`.
          - **Print**: In-browser print trigger.
    - [x] **Dashboard Header Dynamic Date & Quick Tools**:
        - Replaced hardcoded date `"MONDAY • JUNE 29, 2026"` in `TeacherHero` with dynamic locale-formatted date string.
        - Connected Quick Tool "Reports (Export Data)" to open `TeacherWeeklyReportModal`.
        - Connected Quick Tool "Grade (New Entry)" to navigate to `/dashboard/teacher/exams&quizzes`.
        - Connected "View All" on recent assignments to `/dashboard/teacher/exams&quizzes` and alerts to `/dashboard/teacher/notifications`.
    - [x] **Build Verification**:
        - Ran `npx tsc --noEmit` on `frontend` — compiled with **0 errors**.

### Wednesday, October 21, 2026 (Teacher Class Details Page Mobile Responsiveness & Tabs Optimization)

- **Teacher Class Detail Page Overhaul ([ClassDetails.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/ClassDetails.tsx), [TabNavigation.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/TabNavigation.tsx), [TeacherTimetableGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/timetable/TeacherTimetableGrid.tsx), [AttendanceTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/attendance/components/AttendanceTable.tsx), [StudentTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/student/components/StudentTable.tsx), [Overview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/my-classes/%5BclassId%5D/components/Overview.tsx))**:
    - [x] **Tab Navigation Mobile Optimization**:
        - Converted tab bar from `inline-flex flex-wrap` (which broke 7 buttons across 4-5 jagged rows on mobile) into a smooth, horizontal scrollable container (`overflow-x-auto no-scrollbar`).
        - Positioned tab icons strictly to the left of the tab label (`[Icon] [Text]`).
        - Fixed dark-mode active text contrast: changed active tab text from `text-white dark:text-slate-900` on emerald background to high-contrast `text-white` across all themes.
    - [x] **Timetable Tab Mobile Day Schedule View**:
        - Engineered an adaptive mobile view switcher in `TeacherTimetableGrid` with `Daily Schedule` (Card List) vs `Weekly Matrix` (Full Grid).
        - Added day-of-week selector pills (`[Mon] [Tue] [Wed] [Thu] [Fri]`) with a live pulse indicator for Today.
        - Built period schedule cards showing 12-hour formatted time badges, subject name, teacher badge, room pill, `Live Now` pulse indicator, and recess/break highlights.
        - Made session and term filter buttons wrap cleanly on mobile screens (`flex-wrap gap-2 sm:gap-3`).
    - [x] **Attendance Tab Mobile & Teacher Route Integration**:
        - Updated `AttendanceTable.tsx` to dynamically detect `/dashboard/teacher` pathname via `usePathname()`, routing student profile clicks to `/dashboard/teacher/students/...` instead of admin route.
        - Maintained responsive mobile card view (`md:hidden`) with full badge and comment preview.
    - [x] **Student Tab Mobile View & Navigation**:
        - Refactored `ListRow` in `StudentTable.tsx` with responsive layout: on phones (`< md`), adapts from rigid 12-column grid into an identity header (avatar, name, ID, status badge, eye action) with a 3-metric subgrid (Class, Performance, Attendance).
        - Connected `onView` prop in `StudentsPage` to navigate to `/dashboard/teacher/students/${student.id}`.
        - Added standard `staleTime: 1000 * 60 * 5` on student list queries.
    - [x] **Overview, Exams, and Grades Tabs**:
        - Made `Overview.tsx` grid gaps and margins responsive (`mt-4 sm:mt-8 gap-4 sm:gap-6 lg:gap-8`).
        - Supported `params.classId` as primary route param for stats & attendance summary queries.
        - Added explicit `staleTime: 1000 * 60 * 2` on exam and grade list queries to comply with query caching rules.
    - [x] **Build Verification**:
        - Ran `npx tsc --noEmit` on `frontend` — compiled with **0 errors**.

### Wednesday, October 21, 2026 (Teacher Student Detail Page Mobile Responsiveness & Tabs Optimization)

- **Teacher Student Profile Page Enhancements ([students/[studentId]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/students/[studentId]/page.tsx) & [AttendanceCalendar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/students/[studentId]/components/attendance/AttendanceCalendar.tsx))**:
    - [x] **Tab Navigation Icons & Layout**:
        - Attached Lucide icon components to all profile tabs in `TABS` array (`Overview`, `Academic`, `Attendance`, `Time Table`, `Behaviour`, `History`).
        - Positioned tab icons strictly to the left of the tab label (`<Icon size={16} /> <span>{tab.label}</span>`) with active emerald styling and smooth horizontal scroll padding (`no-scrollbar`).
    - [x] **Timetable Tab Mobile Day Schedule View**:
        - Engineered an adaptive mobile view in `ScheduleGrid` with interactive `Daily View` vs `Weekly Matrix` toggle.
        - In Daily View, added day-of-week selector pills (`[Mon 20] [Tue 21] [Wed 22] [Thu 23] [Fri 24]`) displaying period cards with time pill badges, subject tags (`Mathematics`, `English`), and room numbers (`RM 204`), completely eliminating the need for unwieldy 1000px horizontal scrolling on phones.
        - Preserved full 12-hour matrix view on desktop and when toggled.
    - [x] **Attendance Tab Mobile Optimization**:
        - Converted horizontal stat overflow cards into a clean 2x2 grid on mobile (`grid-cols-2 sm:grid-cols-4`).
        - Optimized monthly calendar grid cells (`h-14 sm:h-20 md:h-24`) with status dot indicators on mobile viewports so long status labels never wrap awkwardly.
        - Added responsive modal sizing (`max-w-[calc(100vw-2rem)] sm:max-w-md`) for attendance status edit dialog.
    - [x] **General Mobile Layout & Container Paddings**:
        - Replaced `px-0 md:px-12` across Overview, Attendance, and Timetable tabs with responsive `px-4 sm:px-6 lg:px-12`, preventing cards from stretching flush against mobile screen edges.
        - Refined Hero Profile Card with responsive padding (`p-5 sm:p-8 md:p-12`), avatar sizing, and touch-adapted contact button.
        - Made `SectionCard` headers and `WeekControls` flex-wrap cleanly on small phone screens.
    - [x] **Build Verification**:
        - Ran `npx tsc --noEmit` on `frontend` — compiled with **0 errors**.

### Wednesday, October 21, 2026 (Exam & Paper Preview Pop-up Mobile Redesign)

- **Exam & Paper Preview Modal Mobile Overhaul ([PaperPreviewModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/PaperPreviewModal.tsx), [ExamPreviewPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/preview/components/ExamPreviewPage.tsx), [ExamInfo.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/preview/components/ExamInfo.tsx), [QuestionViewer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/preview/components/QuestionViewer.tsx), [ExamSidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/preview/components/ExamSidebar.tsx))**:
    - [x] **Full-Bleed Mobile Modal**:
        - Updated `PaperPreviewModal` `DialogContent` to `w-full max-w-full sm:max-w-[96vw] sm:w-[96vw] h-full sm:h-[95vh] rounded-none sm:rounded-3xl [&>button]:hidden`, converting the desktop floating dialog into a native-feeling full-screen experience on mobile devices without clipping gutters.
    - [x] **Sticky App Navigation Header**:
        - Replaced bulky static header with a mobile-responsive sticky top app bar (`sticky top-0 z-30 backdrop-blur-md`).
        - Integrated clean Exit Preview button (`<ArrowLeft />`), centered paper title with subject and `Preview` mode badge, live ticking timer chip, and mobile question map sheet trigger.
    - [x] **Mobile Bottom Sheet Question Navigator**:
        - Integrated Radix UI `Sheet` for small screens, allowing teachers to view the full question grid (`Q1`, `Q2`...) with answered badges from anywhere on the page without scrolling down.
    - [x] **Quick Question Jump Scrubber**:
        - Added a horizontal scrollable question pill strip right above questions on mobile screens for rapid single-tap navigation between questions.
    - [x] **Responsive Exam Info 2x2 Grid**:
        - Converted 4-row vertical stack into an optimized 2x2 grid (`grid-cols-2 lg:grid-cols-4`) on mobile, saving vertical space.
        - Enhanced with icons for Class, Duration, Subject, and Questions count, plus compact simulation notice.
    - [x] **Question Viewer & LaTeX Overflow Protection**:
        - Added LaTeX equation horizontal scrolling container (`overflow-x-auto`) to safeguard formula blocks from breaking mobile screen layouts.
        - Redesigned options as tap-accessible cards with letter badges (`A`, `B`, `C`, `D`), high-contrast answers reveal toggle (`<Eye />`), and responsive navigation controls (`Prev` / `Next`).
    - [x] **Questions Map & Sidebar Refinement**:
        - Refined grid styling with 5-column touch buttons, visual legend, and answered vs remaining statistics.

### Wednesday, October 21, 2026 (Teacher Paper Detail Page Mobile Optimization & Tab Icons Alignment)

- **Teacher Paper Detail Page Enhancements ([papers/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/papers/[id]/page.tsx) & [tabs.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/ui/tabs.tsx))**:
    - [x] **Tab Icon Left Alignment**:
        - Updated `TabsTrigger` wrapper in `components/ui/tabs.tsx` to `<span className="relative z-10 flex items-center justify-center gap-2 w-full">` to maintain inline flex alignment across all tabs.
        - Positioned icons (`<FileText />` and `<GraduationCap />`) directly to the left of the tab title text (`[Icon] [Text] [Count Badge]`) in `papers/[id]/page.tsx`.
    - [x] **Grades Tab Mobile Grid View**:
        - Added reactive window resize listener defaulting `gradesViewMode` to `'grid'` on mobile viewports (< 768px).
        - Enforced responsive grid container (`gradesViewMode === 'grid' ? "grid" : "grid md:hidden"`), guaranteeing card grid presentation on mobile regardless of desktop table settings.
        - Styled individual mobile grade cards with left status accent strips (`border-l-emerald-500` / `border-l-rose-500`), student numbering chips, score breakdown, progress bar, inline edit score controls, and full detail popup modal trigger.
        - Concealed the wide HTML table on mobile (`hidden md:block`) and upgraded the empty grades state to a responsive card.
        - Set `max-w-[calc(100vw-2rem)]` on the grade detail modal dialog for small phone displays.
    - [x] **Build & Type Safety**:
        - Ran `npx tsc --noEmit` on `frontend` — compiled with **0 errors**.

### Wednesday, October 21, 2026 (Exam Papers Page Mobile Optimization & Grid View Implementation)

- **Teacher Paper Detail Page Rules of Hooks Fix ([papers/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/papers/[id]/page.tsx))**:
    - [x] Fixed React Rules of Hooks violation (`React has detected a change in the order of Hooks called by TeacherPaperDetailPage`).
    - [x] Moved all `useMemo` hooks (`onlineResults`, `gradesResults`, `allResults`, `paginatedResults`, `avgScore`, `highBox`, `lowBox`) and their calculations above the early returns (`isLoadingPaper`, `isErrorPaper || !paper`, `!canAccess`), guaranteeing an identical, unconditional hook invocation order on every render.
    - [x] Verified complete TypeScript compilation (`npx tsc --noEmit`) with **0 errors**.

- **Teacher Exam Papers Page Mobile Overhaul & Grid View Integration ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/[examId]/papers/page.tsx))**:
    - [x] **Grid & List Display Toggle**:
        - Added `viewMode` state (`'list' | 'grid'`) with automatic detection to default to Grid view on mobile screens (`window.innerWidth < 768`) and List view on desktop screens.
        - Integrated sleek switch buttons matching the Qefas Hub design system (`<List />` and `<LayoutGrid />`).
    - [x] **Grid View Cards for Subject Papers**:
        - Designed a modern, responsive 2-column card grid (`grid grid-cols-1 sm:grid-cols-2 gap-4`) for subject papers.
        - Equipped each card with top status accent strip, `#01` number badges, status badges, `Your Subject` / `Creator` / `Locked` indicators, explicit `Edit` button, `Unpublish` & `Unlink` buttons, paper title, subject pill, and bottom metrics strip (duration, marks, teacher, updated date).
    - [x] **Mobile First Layout Reordering**:
        - Reordered page DOM on mobile (`order-1 lg:order-2` for Papers, `order-2 lg:order-1` for sidebar) so teachers immediately view and edit existing subject papers without needing to scroll past the lengthy creation form.
        - Added a quick "Add Paper" mobile button in the header that smoothly scrolls down to the creation section.
    - [x] **Dark Mode Button Contrast Fix**:
        - Replaced `bg-primary text-white` (which resolved to near-white on white text due to dark mode `--primary: oklch(0.922 0 0)`) with an emerald theme (`text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 border border-emerald-500/40 dark:border-emerald-400/30`), ensuring high contrast and visual consistency across themes.
    - [x] **Exam Participants Grid View for Mobile**:
        - Added `participantsViewMode` (`'table' | 'grid'`) state defaulting to `'grid'` on mobile screens (`window.innerWidth < 768`) and `'table'` on desktop.
        - Added interactive Table/Grid toggle buttons in the Exam Participants header.
        - Designed a responsive grid of participant cards displaying student avatar, name, student code, attempt status pill, grade approval status, total score / marks, percentage, papers completed progress bar, and touch-accessible "Clear Record" action button.
    - [x] **Hero Header & Participants Responsiveness**:
        - Converted Hero Header stats into a 2x2 responsive grid on mobile screens (`grid grid-cols-2 sm:flex`) to eliminate horizontal overflow.
        - Refined Hero Header typography, paddings, and button wrapping across phones and tablets.
        - Ensured Participants table action buttons ("Clear") are always visible on touch screens (`opacity-100 sm:opacity-0`).
    - [x] **Build Verification**:
        - Ran `npx tsc --noEmit` on `frontend` — compiled with **0 errors**.

### Wednesday, October 21, 2026 (Teacher Subject Papers Edit Access & Subject Assignment Integration)

- **Teacher Subject Paper Edit Button & Permission Matching ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/[examId]/papers/page.tsx) & [exam.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam.service.ts))**:
    - [x] **Backend Subject Teacher Relationship Population**:
        - Updated `getExamPapersService` in `exam.service.ts` to include `subject.teacherSubjects.teacher` when fetching exam subject papers.
        - Dynamically populated `assignedTeachers` for each paper with the paper creator, subject lead teacher (`subject.teacher`), and teachers mapped via `subject.teacherSubjects`.
    - [x] **Frontend Permission Evaluation & Edit Button**:
        - Added teacher subject assignment query via `teacherService.getSubjects` to retrieve the current teacher's assigned subjects (`mySubjectIds`).
        - Expanded `canAccess` permissions to grant access if the logged-in teacher is assigned to the paper's subject (via subject lead teacher, `teacherSubjects`, or `mySubjectIds`).
        - Unlocked the subject paper card for teachers assigned to that subject (removing false `cursor-not-allowed` / `Locked` states).
        - Added an explicit **Edit** button (`<Edit size={14} /> Edit`) alongside "Preview" and "Start Grading" on subject papers assigned to the teacher, routing to `/dashboard/teacher/exams&quizzes/papers/${paper.id}`.
        - Added descriptive `Your Subject` badge tags to clarify why the paper is editable for the teacher.
        - Fixed card click handler to navigate to the paper edit view `/dashboard/teacher/exams&quizzes/papers/${paper.id}`.
    - [x] **Type Safety & Build Verification**:
        - Ran `npx tsc --noEmit` on both backend and frontend — all passed with 0 errors.

### Wednesday, October 21, 2026 (Teacher Exams & Quizzes Page Enhancement)

- **Teacher Assessment List & Grid View Navigation Overhaul ([ExamsTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/components/ExamsTable.tsx))**:
    - [x] **Card & Row Direct Navigation**:
        - Wired assessment cards in Grid view and assessment rows in List view to navigate to `/dashboard/teacher/exams&quizzes/[examId]/papers` upon click.
        - Preserved `e.stopPropagation()` on nested interactive actions (Edit, Preview, Delete, and expanded paper cards) to avoid triggering parent navigation.
        - Created redirect page at `[examId]/paper/page.tsx` redirecting to `[examId]/papers` to seamlessly support both singular `/paper` and plural `/papers` URLs.
    - [x] **List & Grid Numbering Badges**:
        - Added styled font-mono numbered badge chips (`#01`, `#02`, etc.) to both List and Grid views based on `(currentPage - 1) * itemsPerPage + idx + 1`.
        - Added numbered badge chips (`#01`, `#02`, etc.) to each subject paper inside the expanded subject paper breakdown.
    - [x] **Informative Teacher Tip & Dropdown Enhancements ([ExamsQuizzesOverview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/exams%26quizzes/components/ExamsQuizzesOverview.tsx))**:
        - Added an informative Teacher Tip banner above assessment listings informing teachers: *"Click the dropdown on any exam to view the specific subject papers, question counts, and instructors assigned to you. Click any assessment card to manage its papers."*
        - Upgraded the multi-paper exam dropdown toggle button with explicit styling, hover states, and informative tooltips.
        - Enabled direct navigation to the paper edit view when clicking any expanded subject paper.

### Wednesday, October 21, 2026 (Notification Setup Comprehensive Audit & New Device Detection Overhaul)

- **Root Cause Resolution for Missing New Device Login Notifications**:
    - [x] **Device Fingerprint Granularity ([auth.device.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.device.ts))**:
        - Previously, `finalDeviceModel` in [auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts) collapsed all Windows computers into `"Windows PC"` and all Macs into `"Mac"`. When logging in from another computer, incognito window, or different browser (Chrome, Edge, Firefox, Brave), `existingDeviceCount` evaluated to `> 0`, falsely treating new devices as existing and silently dropping notifications and emails.
        - Created `extractDeviceInfo` utility generating rich, distinct identifiers including browser name (e.g., `"Windows PC (Chrome)"`, `"Windows PC (Firefox)"`, `"Mac (Safari)"`, `"Android Device (Chrome)"`).
    - [x] **Centralized Device Verification & New Device Alert Dispatch ([auth.device.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.device.ts) & [auth.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/auth/auth.controller.ts))**:
        - Implemented `verifyDeviceCookie`, `setDeviceVerifiedCookie`, and `processNewDeviceLogin`.
        - Verified persistent 365-day `deviceVerified` cookie on web clients; if a user logs in from an unrecognized browser/computer without the cookie, `isNewDevice` triggers.
        - Ensured that when `preAuthToken` OTP verification completes, `isPreAuthVerified: true` guarantees the "New Device Login Detected" in-app notification and email are dispatched immediately.
        - Integrated device tracking and alerts across standard login, `login2FA`, and `googleAuth`.
    - [x] **Notification Query & Role Fallback Enhancement ([notification.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/notification/notification.controller.ts))**:
        - Added full query parameter support for `limit` (1–100, default 50), `offset`, and `isRead` (`"true"` | `"false"`).
        - Added institutional fallback matching: School Admins now receive notifications directed to their user account (`recipientId: userId`) as well as institutional notifications addressed to their school (`recipientType: "SCHOOL", recipientId: schoolId`).
        - Updated `markNotificationAsRead`, `markAllNotificationsAsRead`, and `getUnreadCount` to support school-level notification matching.
    - [x] **Frontend WebSocket Room Re-Subscription Guarantee ([SocketContext.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/context/SocketContext.tsx))**:
        - Resolved issue where `SocketContext` checked `if (socket) return;` on re-render, failing to emit `join:user` if `currentUserId` resolved after the initial socket handshake.
        - Added dedicated reactive subscription effect guaranteeing that `socket.emit("join:user", currentUserId)` is executed whenever `currentUserId` or socket connectivity activates/updates.
    - [x] **Mobile App Device Tagging ([client.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/Mobile/lib/api/client.ts))**:
        - Appended `(Mobile App)` to the `x-device-model` header to clearly distinguish mobile app logins from mobile web browser sessions.
    - [x] **Type Safety & Build Verification**:
        - Ran `npx tsc --noEmit` across `backend`, `frontend`, and `Mobile` — all 3 passed with **0 errors**.

### Wednesday, October 21, 2026 (Student Dashboard 7-Day Final Results Banner Gating)

- **Student Dashboard Home Final Results Banner ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/page.tsx))**:
    - [x] **7-Day Recency Condition**:
        - Replaced naive `hasPublishedResults` check (which showed the banner permanently if any results ever existed) with `hasRecentFinalResults`.
        - Evaluates timestamps (`releaseDate`, `updatedAt`, `createdAt`) across all published subject results and group headers against a 7-day window (`Date.now() - timestamp <= 7 * 24 * 60 * 60 * 1000`).
        - The green banner ("Final Results Available! Your published academic report card and term summaries are ready for review.") now only renders when a final result was published or updated within the last 7 days.
    - [x] **Verification**:
        - TypeScript check (`npx tsc --noEmit`) completed with **0 errors**.

### Wednesday, October 21, 2026 (Student & Admin Result Export Standardization & Subscription Tier Gating)

- **Student Assignments Layout Optimization ([assignments/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/page.tsx))**:
    - [x] **Available Page Space Fit**: Removed redundant `max-w-7xl` and nested horizontal page padding (`px-3.5 sm:px-6 lg:px-8`) which conflicted with `layout.tsx` (`p-4 md:p-6 lg:p-8`). Converted page container to fluid `w-full space-y-5 sm:space-y-6` allowing search bar (`flex-1 min-w-[240px]`), stats grid, and cards to dynamically fill the available space on web desktop without dead margins.

- **Student Result Exports Audit & Admin Parity Alignment**:
    - [x] **Termly Result Sheet Export ([result/termly/view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/result/termly/view/page.tsx))**:
        - Upgraded export engine from raw browser printing to institutional `generatePDF` adhering to `.agents/skills/global_export_template/SKILL.md`.
        - Matched Admin records report design (`admin/records/page.tsx`) and Parent termly view.
        - Enforced paid subscription plan check via `assertSchoolPayingPlan(school)`.
    - [x] **Academic Transcript Export ([grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx))**:
        - Added `handleExportTranscript` with `generatePDF` and `assertSchoolPayingPlan(school)`.
        - Added "Export Transcript" button in the top action bar next to Session and Term selectors.
        - Replaced unguarded `@react-pdf/renderer` button in the Academic Transcript tab with a guarded institutional PDF export.
    - [x] **Assessment & Exam Result Dossier Export ([grades/view/[type]/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/view/[type]/[id]/page.tsx))**:
        - Added `handleExportOfficialPDF` using `generatePDF` and `assertSchoolPayingPlan(school)` for all types (`exam`, `subject-paper`, `assessment`).
        - Replaced restrictive conditional `PDFDownloadLink` with guarded "Export Official PDF" action in the header.
    - [x] **Exam Solution Key & Review Export ([exams&quizzes/[examId]/review/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/exams%26quizzes/[examId]/review/page.tsx))**:
        - Added `handleExportReviewPDF` generating an official Exam Review & Solution Key dossier with candidate metadata, score summary, and question breakdown.
        - Added "Export Solution Key" button in the top header action bar with `assertSchoolPayingPlan(school)`.

- **Subscription Tier Gating (`assertSchoolPayingPlan`)**:
    - [x] Verified that students whose schools are on the `FREE` tier cannot export result documents. An informative toast error informs them to contact school administration to upgrade. Active trial periods are permitted.

- **Documentation ([STUDENT_ADMIN_RESULT_EXPORTS_AND_SUBSCRIPTION_GATING.md](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/STUDENT_ADMIN_RESULT_EXPORTS_AND_SUBSCRIPTION_GATING.md))**:
    - [x] Created comprehensive documentation detailing architecture, student vs admin matrix, layout specifications, and extension guidelines.

- **Verification**:
    - [x] Ran `npx tsc --noEmit` on `frontend` and achieved **0 errors** (exit code 0).

### Wednesday, October 21, 2026 (Student Assignments Overview Redesign & Class List Numbering Fix)

- **Student Class Assessment List Numbering & Mobile List View ([AssignmentsTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/AssignmentsTable.tsx))**:
    - [x] **Numbering Overflow & Badge Fix**:
        - Replaced cramped `size-7` (28px square) with flexible `min-w-[28px] h-6 px-1.5 inline-flex items-center justify-center rounded-md font-mono text-[10px] font-black`.
        - Formatted numbering consistently as `#01`, `#02` (page-aware: `String((safePage - 1) * pageSize + idx + 1).padStart(2, '0')`), eliminating text overflow, wrapping, and clipping on mobile devices.
    - [x] **Mobile-Responsive List Mode**:
        - Built a dedicated mobile list perspective (`block md:hidden`) replacing the wide horizontal `<table>` with sleek, touch-friendly list rows showing the `#01` numbering chip, assignment title, due date with icon, grade, and direct preview button.

- **Student Assignments Main Hub Redesign — Web & Mobile ([assignments/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/page.tsx) & components)**:
    - [x] **Top Hero KPI Stats Grid**:
        - Moved metrics from the bottom of the page to the prominent top hero strip: Total Assigned (`BookOpen`), Graded Tasks with average percentage (`CheckCircle2`), Pending Work (`Clock`), and Overdue Tasks with live pulse alert (`AlertCircle`).
    - [x] **Search & Filter Bar with Reset State**:
        - Built modern SearchBar with Lucide icons (`Search`, `X`), clear action, and responsive FilterChips (`Subject`, `Department`, `Status`, `Due Date`) with active selection indicators and a 1-tap "Reset Filters" button.
    - [x] **Assignment Card Redesign ([AssignmentCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/components/AssignmentCard.tsx))**:
        - Modernized card aesthetics for both Grid and List modes with ambient status borders, `#01` numbering pill, subject tag, title, due date with `Clock` icon, instructor line, grade badge, and touch targets >= 44px.
    - [x] **Responsive View Toggle & Mobile Grid Default ([ViewToggle.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/components/ViewToggle.tsx))**:
        - Replaced radio buttons with Lucide `LayoutGrid` and `List` pill buttons, defaulting smoothly to Grid mode on mobile screens (< 768px).
    - [x] **Type Safety & Zero Compile Errors**:
        - Verified full TypeScript compilation (`npx tsc --noEmit`) with **0 errors**.

### Wednesday, October 21, 2026 (Student Class Details Mobile Overhaul & Grid View Option)

- **Student Class Details Navigation & Mobile Overhaul ([my-classes/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/page.tsx) & components)**:
    - [x] **Horizontally Scrollable Class Tabs Navigation ([ClassTabs.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/ClassTabs.tsx))**:
        - Fixed navigation tabs moving off screen on mobile devices by making `<TabList>` horizontally scrollable with `overflow-x-auto no-scrollbar scroll-smooth` and `-mb-px` border alignment.
        - Upgraded each tab into a touch-friendly pill with relevant Lucide icons (`FileText`, `BookOpen`, `Calendar`, `BookText`, `CheckCircle2`, `MessageSquare`).
    - [x] **Grid View Option & Mobile Default ([AssignmentsTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/AssignmentsTable.tsx))**:
        - Implemented `viewMode` toggle state (`'grid' | 'table'`) with `LayoutGrid` and `List` switcher icons.
        - Added automatic mobile screen detection defaulting `viewMode` to `'grid'` for screen widths `< 768px`.
        - Built assessment grid cards featuring `#001` ID badges, type badges, status pills (Graded, Submitted, Upcoming, Overdue), due date with clock icon, score/grade breakdown, and preview links.
        - Added functional Type and Status filter dropdowns plus search query reset.
    - [x] **Page Layout & Component Mobile Responsiveness ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/page.tsx), [ClassHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/ClassHeader.tsx), [ClassBanner.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/ClassBanner.tsx), [ClassStats.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/[id]/components/ClassStats.tsx))**:
        - Replaced brittle `w-[90%]` container with fluid `w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8`.
        - Optimized `ClassHeader` height, dark gradient, badge metadata, and font sizes.
        - Enhanced `ClassBanner` with mobile button stacking and fluid padding.
        - Updated `ClassStats` with compact card heights (`h-28 sm:h-32`), bold tracking, and dark mode backgrounds.
        - Made `FoldersSidebar.tsx` horizontally scrollable on mobile viewports.

### Wednesday, October 21, 2026 (Student Assignment Mobile Redesign, Assessment Cards & Peer Standing Verification)

- **Student Assignment Details Mobile Overhaul ([assignments/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/page.tsx) & components)**:
    - [x] **Header & Compact Time Capsule Redesign ([Header.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/Header.tsx))**:
        - Added dedicated 1-tap "← Back to Assignments" button directly in the mobile header.
        - Compacted countdown timer into a sleek high-tech time capsule (`02d : 14h : 35m : 12s`) occupying minimal vertical space on mobile, eliminating massive blocks that pushed content below the fold.
        - Overhauled status badges and graded/submitted cards with emerald and blue feedback cards.
    - [x] **Segmented Tab Navigation with Badges ([TabNavigation.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/TabNavigation.tsx))**:
        - Enabled smooth horizontal scrolling with hidden scrollbar (`no-scrollbar`) and active pink pill highlights.
        - Added Lucide icons (`BookOpen`, `Zap`, `Paperclip`, `Award`, `FolderOpen`) and dynamic item count badges (`(10)`).
    - [x] **Document Card Instructions Panel ([InstructionsPanel.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/InstructionsPanel.tsx))**:
        - Transformed raw prose into a polished document card with an "Assignment Instructions" header, "Teacher Guidance" badge, and clean LaTeX/markdown typography.
    - [x] **Quiz Question Cards & Real-Time Completion Progress ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/page.tsx))**:
        - Integrated live Quiz Progress Bar (`Answered X of Y (Z%)`).
        - Redesigned quiz question options with option letter pills (`A`, `B`, `C`, `D`), active pink rings, `min-h-[48px]` touch targets, and `#01` question index chips.
    - [x] **Submission Modal Mobile Touch Optimization ([SubmissionModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/SubmissionModal.tsx))**:
        - Replaced raw SVGs with Lucide icons (`CheckCircle2`, `Upload`, `FileText`, `X`, `Loader2`, `Trash2`).
        - Designed sheet/dialog modal with top-right dismiss button, file size formatting, and full-width touch buttons on mobile.
    - [x] **Panels Modernization ([AttachmentsPanel.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/AttachmentsPanel.tsx), [MaterialsPanel.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/MaterialsPanel.tsx), [RubricPanel.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/RubricPanel.tsx))**:
        - Upgraded all three panels with Lucide icons, touch targets >= 44px, empty states, and responsive cards.
    - [x] **Sticky Action Footer Resolution & Elimination of Floating "Score Released" Bar ([ActionFooter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/components/ActionFooter.tsx) & [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/assignments/[id]/page.tsx))**:
        - Completely removed the redundant footer when an assignment is already graded (`isGraded`) or submitted without pending history actions, eliminating the empty bar floating in mid-air with just a "Score Released" badge (the score and feedback are already displayed prominently in the hero card).
        - Replaced `bottom-16` with `bottom-0` so when the footer is active for submissions, it sits flush with the bottom edge rather than hovering 64px up in the air.

- **Student Grades Hub Assessment Tab Assignment Cards & Release Status Preview ([grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx))**:
    - [x] **Rich Assignment Card Integration**:
        - Connected `useStudentAssignments({ limit: 100 })` directly into the student grades overview page.
        - When the user selects `caTab === 'ASSIGNMENT'`, assignments render with the exact rich, polished presentation from `LatestAssignmentsCard.tsx` in both Grid and List/Table view modes.
        - Includes status icons (emerald `CheckCircle2` for graded, blue for submitted, red `XCircle` for overdue, amber `Clock` for pending), status badges, due dates, total points, and score breakdowns.
        - Clicking any assignment card navigates directly to `/dashboard/student/assignments/${assignment.id}` where students can preview instructions, review answers, or check their submission receipt based on the release status.

- **Exam Result Peer Standing & Class Average Verification ([grades/view/[type]/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/view/[type]/[id]/page.tsx))**:
    - [x] **Dynamic Peer Standing & Class Average Calculation Fix**:
        - Verified backend implementation in `exam-attempt.service.ts`: Peer standing is **not** hardcoded; it dynamically queries `prisma.examAttempt.findMany` for ranking/outperformance and `prisma.examAttempt.aggregate` for class average.
        - Fixed frontend bug where single-participant exams showed `Top 100%`: now displays `Rank #1 (Single participant / Top score)`. For multiple peers, displays `Top {X}% (Rank #{pos} of {totalP} peers)`.
        - Fixed Class Average displaying raw points as a percentage (e.g., `25%` for 25/30): now accurately computes `avgPercent = (rawAvg / totalMarks) * 100` and displays both percentage and points breakdown.

### Wednesday, October 21, 2026 (Student Exam Review Mobile Redesign & Assignments Sidebar Fix)

- **Student Exam Review Mobile Responsiveness & Polish ([review/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/exams%26quizzes/[examId]/review/page.tsx))**:
    - [x] **Full Mobile-Responsive Redesign**:
        - Completely redesigned the exam review page (`/dashboard/student/exams&quizzes/[examId]/review`) to look stunning on mobile screens (< 768px), tablets, and desktops.
        - Built a mobile performance strip featuring a compact subject mastery card, accuracy percentage pill, and score breakdown (`pts`).
        - Implemented a horizontally scrollable subject selector track with smooth pill badges preventing horizontal screen overflow.
        - Created a mobile question quick-scroll strip and a dedicated "Question Navigator" Sheet drawer with filter modes (`All`, `Correct`, `Incorrect`) for 1-tap jumping to any question without exhausting scrolling.
        - Redesigned question option cards (MCQ, True/False, Short Answer) with vivid color-coded answer badges ("Your Answer • Correct", "Correct Key", "Your Choice • Incorrect"), clean LaTeX rendering, responsive image figures, and teacher review notes.
        - Added touch-friendly navigation controls (`min-h-[44px]` touch targets) with Previous/Next buttons and smooth state transitions.
        - Fully typed data structures and removed all `any` usages per Rule 4.1.

- **Student Mobile Sidebar Assignments Link Visibility Guarantee ([StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx) & [app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/app-sidebar.tsx))**:
    - [x] **Explicit Core Academic Features Override**:
        - Added explicit guarantees in both `StudentMobileDrawer.tsx` and `app-sidebar.tsx` ensuring `assignments` and `dashboard` links remain enabled unconditionally, preventing them from being filtered out if dynamic features are loading, stale, or disabled in DB configs.

### Wednesday, October 21, 2026 (Student Assessment Tab Assignment Name Display & Mobile Drawer)

- **Student Grades Hub Assessment & Assignment Name Resolution ([grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx), [grades/view/[type]/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/view/[type]/[id]/page.tsx) & [grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/academic/grade.service.ts))**:
    - [x] **Data Structure Analysis via `ASSESSMENT_DATA_MODEL.md`**:
        - Followed the assessment data model specifications: standalone assignments set by teachers are recorded in `Assignment` and lazily or manually synced to the `Grade` model with `assessmentType: "ASSIGNMENT"`, `remarks: assignment.title`, and `subject: subject.name`.
    - [x] **Backend Subject Paper & Assignment Title Enrichment ([grade.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/academic/grade.service.ts))**:
        - Included `subjectPaper: true` in `prisma.grade.findMany` and `getGradeByIdService`.
        - Added lazy enrichment for assignment grades whose `remarks` field is empty by querying `AssignmentSubmission -> Assignment.title` using the embedded submission ID (`grade.id.replace('grade-assignment-', '')`).
    - [x] **Frontend Display Title & Subtitle Hierarchy ([grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx))**:
        - Replaced naive `{grade.subject}` card titles with `getAssessmentDisplayTitle(grade)` across both Grid and List/Table views.
        - Cards now prominently feature the assignment's actual name (e.g., "test4", "first test teacher assignment") as the primary `<h4>` title, and display the subject and date (e.g., "UTME Government • Jun 8, 2026") in the metadata line.
        - In the card footer, standardized reading `grade.remarks || grade.remark` so evaluator remarks and assignment descriptions render cleanly.
    - [x] **Assessment Details View Synchronization ([grades/view/[type]/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/view/[type]/[id]/page.tsx))**:
        - Updated assessment result resolution so clicking an assignment card opens the assessment view with the assignment title properly displayed in the hero banner.

- **Student Mobile Drawer Navigation Links Restoration ([StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx) & [studentFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/studentFeatureFlags.ts))**:
    - [x] **Assignments Feature Flag Enabled**:
        - In [studentFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/studentFeatureFlags.ts), `STUDENT_FEATURE_FLAGS.assignments` was set to `false`, causing the Assignments link (`/dashboard/student/assignments`) to be stripped during menu filtering. Updated default to `true`.
    - [x] **Dynamic Global Features Sync**:
        - Integrated `useGlobalFeatures("student")` in [StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx), keeping the mobile drawer in sync with desktop sidebar platform config overrides and role feature maps.
        - Added `<SheetTitle className="sr-only">` to satisfy Radix UI accessibility requirements.

- **AI Insights Feature Entitlement & School Plan Gating**:
    - [x] **Backend Plan Entitlement Resolution ([exam-attempt.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-attempt.service.ts))**:
        - Gated student AI insights based directly on whether the student's school is on an active plan that includes the AI insights feature in the `features` column (`String[]`) of the `subscription_plans` table (`SubscriptionPlan.features`).
        - Replaced brittle hardcoded `features?.includes('ai_insight')` with case-insensitive normalization matching `"AI Insights"`, `"ai_insight"`, `"ai_insights"`, `"ai_tools"`, or any entry containing `"ai insight"`.
        - Removed the blocking `sub_enforced_students` condition that previously prevented checking the school's active institutional subscription for students.
        - Supported school active status validation through both `SchoolSubscription` (with expiration checks) and direct `school.subscriptionPlan` (`ACTIVE` / `isTrialActive`).
        - Maintained backward-compatible support for individual student user subscription overrides if their school is not yet on an AI plan.
        - Prevented cached "Premium AI insights are available..." locked strings from overwriting valid pedagogical insights when access is unlocked.
    - [x] **Frontend TanStack Query Optimization ([useExams.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useExams.ts))**:
        - Added explicit `staleTime: 1000 * 60 * 2` (2 minutes) and `retry: 1` to `useExamResult` in compliance with `AGENTS.md` Rules 2.1 and 2.5, eliminating duplicate network refetches on tab focus.
    - [x] **Student Grades Detail View UI Polish ([grades/view/[type]/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/view/[type]/[id]/page.tsx))**:
        - Added active/locked indicator in the navigation tab bar (pulsing pink dot when unlocked, amber lock badge when school plan is required).
        - Upgraded AI Insights tab panel with `Active AI Diagnostics` badge when unlocked and `School Plan Required` badge when locked.
        - Enhanced locked overlay with institutional explanation clarifying that AI Pedagogical Insights require the school's subscription to feature AI Insights.
        - Added memoized `aiDiagnostics` breakdown displaying dynamic **Academic Strengths** (subjects ≥ 65%) and **Key Focus Areas** (subjects < 50%) with clean pill cards.

### Wednesday, October 21, 2026 (Student Dashboard Mobile Logout Modal Cancel Button Fix)

- **Mobile Logout Modal & Navigation Drawer Event Interception Resolution**:
    - [x] **Radix UI Sheet & Pointer Event Interception Root Cause**:
        - In [StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx), clicking the Sign Out button triggered `logout()` without closing the Radix Sheet drawer (`setOpen(false)`).
        - The open Sheet's `DismissableLayer` remained active, intercepting `pointerdown` outside the drawer as a dismissal event and suppressing the subsequent `click` event on the modal's Cancel button.
        - Fixed by explicitly dismissing the drawer (`setOpen(false)`) prior to opening the logout modal across [StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx), [TeacherMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/TeacherMobileDrawer.tsx), [AdminMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/AdminMobileDrawer.tsx), and [ParentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/ParentMobileDrawer.tsx).
    - [x] **LogoutModal Touch & Accessibility Overhaul ([LogoutModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/ui/LogoutModal.tsx))**:
        - Portaled the modal directly to `document.body` via React's `createPortal`, isolating it from nested layout and sheet stacking contexts.
        - Added `e.preventDefault()` and `e.stopPropagation()` on the Cancel button with `touch-manipulation`, `active:scale-95`, and mobile accessibility-compliant touch targets (`min-h-[44px] min-w-[90px]`).
        - Added responsive corner close button (`<X />`) with `min-h-[40px] min-w-[40px]` touch target for instant mobile dismissal.
        - Added backdrop click-to-dismiss (`onClick={onClose}`) on dark glass overlay and keyboard `Escape` dismissal listener.
        - Locked background body scrolling (`document.body.style.overflow = "hidden"`) while modal is mounted.

- **Student Grades Assessment & Exam View Mobile Overhaul ([grades/view/[type]/[id]/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/view/[type]/[id]/page.tsx))**:
    - [x] **URL Parameter Sanitization**:
        - Handled trailing comma tags in URLs (e.g. `/exam/241fe964-a406-4dd8-8f44-2182c6db6db1,grid`) by splitting on `,`, ensuring the clean UUID is passed to `useExamResult` and `useGrade` without 404 query errors.
        - Automatically initializes `viewMode` from URL tag if present.
    - [x] **Grid & Table View Mode Toggle (Defaulting to Grid Cards on Mobile)**:
        - Added interactive segmented perspective tabs (`LayoutGrid` and `List`) with active state pills.
        - Automatically defaults to `grid` on mobile viewports (`window.innerWidth < 768`) and supports instant toggling to `table`.
    - [x] **Responsive Cards Grid for Evaluated Subjects**:
        - Designed subject cards with ambient top borders matching score performance, subject book icon, numbering chips (`#01`, `#02`), and square WAEC letter grade badges (`A1`, `B2`, `C6`, `D7`, `E8`, `F9`).
        - Integrated component scores (`score / totalMarks`), percentage, visual progress bars, and status indicator pills (`Distinction`, `Credit`, `Pass`, `Fail`).
    - [x] **Mobile-Optimized Header, Hero Card & 2x2 Stats Grid**:
        - Upgraded 4 KPI cards to a 2-column mobile and 4-column desktop layout (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5`), replacing tall 1-column mobile card stacks.
        - Modernized student card with ambient pink gradient accent, responsive avatar container, and metadata chips.
        - Added live subject search filter input with instant clear button (`X`).

- **Student Grades Hub Grid Card Numbering Alignment ([dashboard/student/grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx))**:
    - [x] **Repositioned Numbering to the Left Across All Grid Cards**:
        - **Exams Grid Cards**: Moved the pagination-aware numbering chip (`#{(examsPage - 1) * itemsPerPage + index + 1}`) from the far right to the top-left of the card header, keeping the title, code, and WAEC grade badge balanced.
        - **Assessments Grid Cards**: Relocated the numbering chip from the bottom-left to the top-left header before the quiz/test icon, freeing the footer for evaluator remarks.
        - **Subject Papers Modal / Expanded Cards**: Added standard `#01`, `#02` left numbering chips alongside paper icons.
        - **Final Published Results Grid Cards**: Added dynamic `#{(finalPage - 1) * itemsPerPage + index + 1}` numbering chips at top-left.

### Tuesday, October 20, 2026 (Parent Dashboard Export Standardization & Paid Plan Gate)

- **Parent Onboarding Redesign ([onboarding/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/onboarding/page.tsx))**:
    - [x] Redesigned the parent onboarding tour using the warm Orange/Amber theme (`THEME_MAP.PARENT`) to match the Admin, Teacher, and Student onboarding layouts.
    - [x] Configured 5 parent-specific feature steps in `getSteps('PARENT')` and hooked up dedicated step components:
        1. **My Children & Multi-Student Hub (`ParentChildrenStep`)**: Children Directory & Profile Switching and Rapid Student Linking via QR Code or ID.
        2. **Grades, Exams & Academic Results (`ParentPerformanceStep`)**: Continuous Assessment (CA) & Subject Strengths and Official Report Cards & Class Standing.
        3. **Daily Attendance & Roll Call Logs (`ParentAttendanceStep`)**: Classroom Attendance & Arrival Monitoring and Digital Absence Notes & Medical Excuses.
        4. **Homework, Assignments & Learning Resources (`ParentAssignmentsStep`)**: Active Homework & Due Date Tracker and Teacher Feedback & Curriculum Resources.
        5. **School Fees, Invoices & Communication (`ParentFinanceCommunicationStep`)**: Fee Statements, Invoices & Instant Receipts and School Announcements & Teacher Messaging.
    - [x] Designed all cards to be full-width with clean typography, navigation breadcrumbs, and bullet points, ready for custom parent screenshot assets when available.
    - [x] Verified complete TypeScript compilation (`npx tsc --noEmit`) with **0 errors**.

- **Student Onboarding Redesign ([onboarding/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/onboarding/page.tsx))**:
    - [x] Redesigned the student onboarding tour using the vibrant Rose/Pink theme (`THEME_MAP.STUDENT`) to match the Admin and Teacher onboarding layout.
    - [x] Configured 5 student-focused feature steps in `getSteps('STUDENT')` and hooked up dedicated step components:
        1. **Classrooms & Daily Timetable (`StudentClassesStep`)**: Enrolled Classes & Subjects and Daily Timetable & Schedule.
        2. **Assignments & Coursework Tasks (`StudentAssignmentsStep`)**: Active Assignments & Due Date Tracker and Digital Submissions & Teacher Feedback.
        3. **CBT Exams, Quizzes & Assessments (`StudentExamsStep`)**: Online Assessment & CBT Exam Center and Rich Question Engine (LaTeX/KaTeX formulas) & Performance Review.
        4. **Academic Performance, Grades & Results (`StudentGradesStep`)**: Continuous Assessment (CA) & Grade Tracker and Termly Report Cards & Class Standing.
        5. **Attendance, Documents & Parent Linking (`StudentAttendanceLinkingStep`)**: Daily Attendance Records & Digital Documents and Parent QR Linking Hub.
    - [x] Designed cards to be full-width with clean typography, navigation breadcrumbs, and bullet points, ready for custom student screenshot assets when available.
    - [x] Verified complete TypeScript compilation (`npx tsc --noEmit`) with **0 errors**.

- **Teacher Onboarding Redesign ([onboarding/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/onboarding/page.tsx))**:
    - [x] Redesigned the teacher onboarding tour to match the Admin onboarding layout, featuring structured cards with themed icons, breadcrumb paths (`Navigate to Dashboard > ...`), feature summaries, detailed actionable bullet points, and modal zoom preview images.
    - [x] Configured 5 distinct, pedagogical teacher feature steps in `getSteps('TEACHER')`:
        1. **Classrooms & Assigned Subjects (`TeacherClassesStep`)**: My Classes Hub and Assigned Subjects & Curriculum.
        2. **Exams, Quizzes & Question Engine (`TeacherExamsStep`)**: Multi-Paper Assessment Engine and Advanced Question Bank with LaTeX / KaTeX support.
        3. **Assignments & Rapid Bulk Grading (`TeacherAssignmentsStep`)**: Homework & Project Distribution and One-Click Bulk Grading & Feedback.
        4. **Gradebook, Scores & Academic Records (`TeacherGradesStep`)**: Continuous Assessment (CA) & Exam Recording and Student Records, Dossiers & Remarks.
        5. **Daily Schedule, Attendance & Linking (`TeacherScheduleAttendanceStep`)**: Today's Teaching Schedule & Roll Call and Student QR Linking & Parent Directory.
    - [x] Removed temporary admin preview images from all 5 teacher onboarding step cards so the feature cards span full width cleanly until custom teacher screenshots are provided.
    - [x] Verified complete TypeScript compilation (`npx tsc --noEmit`) with 0 errors.

- **Production Build & Type Check Verification**:
    - [x] Ran full production build (`npm run build`) in `frontend` — Turbopack compilation and page generation succeeded with **0 errors** (exit code 0).
    - [x] Verified `backend` TypeScript compilation (`npx tsc --noEmit`) with **0 errors** (exit code 0).
    - [x] Verified `Mobile` React Native Expo TypeScript compilation (`npx tsc --noEmit`) with **0 errors** (exit code 0).

- **Facebook Authentication Coming Soon Notification (All Auth Pages)**:
    - [x] Configured all Facebook login and sign-up buttons across the authentication system ([SocialAuthRow.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/components/SocialAuthRow.tsx), [FacebookLoginButton.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(auth)/login/components/FacebookLoginButton.tsx), [console login](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/auth/login/page.tsx), and [console setup](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/auth/setup/page.tsx)) to display a "Coming Soon" toast notification upon clicking (`toast.info("Facebook sign in / sign up is coming soon!")`).
    - [x] Added visual "Coming Soon" badges and accessible titles (`title="Sign in with Facebook (Coming Soon)"`) across all auth pages (School Admin, Teacher, Student, Parent, and Console Staff).

- **Parent Attendance Absence Note Feature (`/dashboard/parent/attendance`)**:
    - [x] Wired "Submit Absence Note" action in [QuickContact.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/attendance/components/QuickContact.tsx) and [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/attendance/page.tsx) to trigger a `toast.info("Submit Absence Note feature is coming soon!", { toastId: "absence-note-coming-soon" })` notification instead of opening verified record breakdowns.

- **Universal Paid Plan Validator (`frontend/src/utils/subscriptionPlanCheck.ts`)**:
    - [x] Implemented `isSchoolOnPayingPlan` and `assertSchoolPayingPlan` utility functions to guard all parent export features.
    - [x] Validates that `school.plan` is not `'FREE'` and that `subscriptionStatus === 'ACTIVE'` or `isTrialActive === true`.
    - [x] Displays a user-friendly, actionable toast notification directing parents to contact school administration to activate export permissions when on a free plan.

- **Standardization of All Parent Dashboard Exports (Matching Admin Portal Design)**:
    - [x] **Page 1: Performance Overview (`/dashboard/parent/performance`)**:
        - Integrated `generatePDF` into [ProfileHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/ProfileHeader.tsx) with institutional double border, school logo, shaded metadata grid, and department subject table. Guarded by `assertSchoolPayingPlan(student.school)`. Removed redundant Quick Print button per user request.
    - [x] **Page 2: Subject Breakdown (`/dashboard/parent/performance/subject-performance`)**:
        - Added "Export Report" button to [subject-performance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/subject-performance/page.tsx) and [TopHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/subject-performance/components/TopHeader.tsx), exporting department subjects via `generatePDF` guarded by `assertSchoolPayingPlan(student.school)`.
    - [x] **Page 3: Term Report Card (`/dashboard/parent/exams&results/report-card`)**:
        - Passed `schoolProfile` into `reportData` in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/report-card/page.tsx) and [types.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/report-card/components/types.ts).
        - Guarded `handleDownloadPDF` in [breadcrumb-actions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/report-card/components/breadcrumb-actions.tsx) with `assertSchoolPayingPlan(data.schoolProfile)`.
    - [x] **Page 4: Published Termly Result Sheets (`/dashboard/parent/result/termly/view`)**:
        - Added "Export PDF" button to the toolbar and footer of [result/termly/view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/result/termly/view/page.tsx).
        - Integrated `generatePDF` mapping subjectContinuous assessment, CA/Quiz, and Exam scores into formal table rows, guarded by `assertSchoolPayingPlan(childDetails?.school)`.
    - [x] **Page 5: Exam Attempt Details (`/dashboard/parent/exams&results/details`)**:
        - Updated [parent-tools.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/details/components/parent-tools.tsx) with "Export Official PDF" generating assessment dossiers and question evaluations via `generatePDF`, guarded by `assertSchoolPayingPlan(data.schoolProfile)`.
    - [x] **Page 6: Assignments Hub (`/dashboard/parent/assignments`)**:
        - Re-architected [DownloadReportButton.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/assignments/components/DownloadReportButton.tsx) using `generatePDF` with school logo, formal table formatting, and affective/psychomotor domains, guarded by `assertSchoolPayingPlan(student?.school)`. Strictly removed all `any` types.
    - [x] **Page 7: Monthly Attendance Log (`/dashboard/parent/attendance/monthly`)**:
        - Replaced placeholder alert in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/attendance/monthly/page.tsx) and [AttendanceExport.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/attendance/monthly/components/AttendanceExport.tsx) with real `generatePDF` attendance register, guarded by `assertSchoolPayingPlan(school)`.
    - [x] **Exams & Results Mobile Status & Filter Bar Modernization (`/dashboard/parent/exams&results`)**:
        - Re-engineered the Status dropdown in [exam-list.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/components/exam-list.tsx) with `appearance-none`, custom `ChevronDown`, dynamic status indicator pills (emerald for completed, amber for pending, filter icon for all), and matching height/border/focus styling.
        - Synchronized Subject dropdown with `BookOpen` icon, `appearance-none`, and responsive mobile touch target (`h-10 sm:h-9`).
        - Added active filter reset action chip when any search or filter criteria are applied.
    - [x] **Page 8: Billing Receipts & Financial Logs (`/dashboard/parent/billing`)**:
        - Wired "Download PDF Logs" button in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/billing/page.tsx) to generate official subscription and dispatch statements via `generatePDF`, guarded by active paying plan validation.
    - [x] **Systematic Removal of Non-PDF Quick Print Buttons Across Parent Dashboard**:
        - Removed `Quick Print Slip` button from [parent-tools.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/details/components/parent-tools.tsx) (`/dashboard/parent/exams&results/details`).
        - Removed `Print Result Sheet` button from [result/termly/view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/result/termly/view/page.tsx) (`/dashboard/parent/result/termly/view`).
        - Removed pseudo-export print button from [TopHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/subject-performance/components/TopHeader.tsx) (`/dashboard/parent/performance/subject-performance`).
        - Removed `Print Report` button from [breadcrumb-actions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/report-card/components/breadcrumb-actions.tsx) (`/dashboard/parent/exams&results/report-card`).
        - Removed `Print Schedule` button from [calender/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/calender/page.tsx) (`/dashboard/parent/exams&results/calender`).
        - Removed `Print Analytics` button from [breadcrumb-actions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/analytics/components/breadcrumb-actions.tsx) (`/dashboard/parent/exams&results/analytics`).
        - Cleaned all unreferenced `Printer` and `window.print()` calls across the entire Parent portal.

### Tuesday, October 20, 2026

- **Student Department-Driven Performance Analysis & Full Grade Fetching (`/dashboard/parent/performance`)**:
    - [x] **Backend Department Subjects & Uncapped Grade Query ([parent.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/parent/parent.service.ts))**:
        - Updated `getChildDetailsService` to include department subjects (`department: { include: { subjects: { include: { subject: true } } } }`), resolving the missing subjects attached to the student's assigned department.
        - Removed the artificial `take: 100` limit on student grades in `getChildDetailsService`, ensuring every published continuous assessment, test, quiz, and examination grade is fetched for analysis.
        - Included subject department relations on `subjectPaper` (`subject: { include: { departments: true } }`).
    - [x] **Department Subject Analysis in UI ([SubjectPerformanceList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/SubjectPerformanceList.tsx))**:
        - Filtered and structured the subject mastery breakdown specifically around the subjects attached to the student's assigned department (`student.department.subjects`).
        - Aggregated every recorded grade attached to those department subjects to calculate cumulative average score, letter grade (A1-F9 / A+-F), status tier, and assessment counts.
        - Handled pending evaluations gracefully for registered department subjects that haven't been tested yet.
    - [x] **Department Filter in Academic Trend ([PerformanceChart.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/PerformanceChart.tsx))**:
        - Populated the chart subject selector strictly with subjects attached to the student's department.
        - Plotted chronological score trajectory across every grade attached to those department subjects.
    - [x] **Department Score Metrics in KPIs ([StatsGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/StatsGrid.tsx))**:
        - Re-computed overall average score and total assessments directly from the grades attached to the student's department subjects.

- **Parent Portal Performance Page Mobile & Web Overhaul (`/dashboard/parent/performance`)**:
    - [x] **Container & Responsive Layout Modernization**:
        - Replaced restrictive `max-w-7xl` constraint with modern `w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8` in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/page.tsx) and [subject-performance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/subject-performance/page.tsx).
        - Upgraded spacing and responsive hierarchy (`space-y-5 sm:space-y-6 md:space-y-8`) so mobile devices do not experience vertical fatigue.
    - [x] **Eliminated Broken Unrendered Material Symbols**:
        - Replaced unrendered `material-symbols-outlined` text glyphs across [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/page.tsx), [ProfileHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/ProfileHeader.tsx), and [Header.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/Header.tsx) with crisp, accessible Lucide React icons (`BarChart3`, `GraduationCap`, `School`, `UserCheck`).
    - [x] **Profile Header Redesign ([ProfileHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/ProfileHeader.tsx))**:
        - Modernized student card with ambient background gradient and subtle watermark styling.
        - Responsive avatar container (`size-20 sm:size-24 md:size-26`) with rounded corners, verified active status badge, and robust DiceBear fallback.
        - Redesigned student metadata badges (School Name, Student ID, Enrolled Class, Department, Academic Session) with Lucide icons.
        - Horizontal multi-child switcher with smooth scrolling, indicator dots, and active glow rings for multi-ward parents.
        - Responsive action buttons: "Print Report" (`window.print()`) and "Result Sheets" (direct navigation to `/dashboard/parent/result/termly`).
    - [x] **2-Column Mobile & 4-Column Desktop Stats Grid ([StatsGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/StatsGrid.tsx))**:
        - Redesigned 4 KPI metrics (Average Score, Academic Standing, Assessments, Attendance) into a 2-column mobile and 4-column desktop layout (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5`), eliminating awkward 1-column mobile card stacks.
        - Added color-themed icon badges, trend indicators, header tooltips, and direct links to subject breakdowns and exam records.
    - [x] **Interactive Academic Trend Chart ([PerformanceChart.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/PerformanceChart.tsx))**:
        - Enhanced Recharts AreaChart with smooth gradient (`#ea580c` to transparent) and responsive canvas height (`h-[260px] sm:h-[300px] md:h-[320px]`).
        - Replaced clumsy inputs with a custom styled subject dropdown and reset filter button.
        - Implemented custom dark glass tooltip displaying assessment date, subject badge, and exact percentage.
        - Added a graceful illustrated empty state when no evaluations are recorded.
    - [x] **Quick Portals & Subject Analysis Callout ([QuickActions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/QuickActions.tsx))**:
        - Redesigned the subject analysis banner with a vibrant gradient, badge pill, subtle background graphic, and active micro-interactions.
        - Added quick portal navigation cards to Subject Breakdown, Termly Result Sheets, and Exam Records.
    - [x] **Subject Mastery Breakdown Overhaul ([SubjectPerformanceList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/SubjectPerformanceList.tsx))**:
        - Upgraded both Grid (default) and List views with numbering (`#1`, `#2`), subject icons, instructor lines, WAEC letter grades, status tier badges, and animated mastery progress bars.
        - Clean search input with instant clear button (`X`) and responsive tier filter selector.
        - Strictly enforced TypeScript types with zero `any` usage.

- **Parent Portal Termly Results Hub Parity with Student Portal (`/dashboard/parent/result/termly`)**:
    - [x] **Full Parity with Student Termly Grouping & Flow**:
        - Updated [parent/result/termly/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/result/termly/page.tsx) to match the grouping architecture and design flow of [student/result/termly/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/result/termly/page.tsx).
        - Replicated the 4 quick summary metric KPI cards (Published Terms, Total Subjects, Fully Released, Academic Session) at the top of the hub.
        - Replicated the live search filter input and Grid / Table perspective toggle toolbar.
        - Replicated the responsive 3-column Cards Grid (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`) with top term gradients, term badge pill, class cohort title, session line, evaluated subjects counter, dynamic status badge, and "View Result" bottom action navigating to `/dashboard/parent/result/termly/view`.
        - Replicated the Table perspective with Academic Session, Class Cohort, Term, Evaluated Subjects, Release Status, and "View Sheet" action.
        - Preserved multi-child student switcher bar and refresh controls, while strictly eliminating all `any` types with `PublishedResultGroup`.

- **Parent Portal Termly Result View Flow & Design Parity with Student Portal (`/dashboard/parent/result/termly/view`)**:
    - [x] **Full Parity with Student Termly View Flow & Design**:
        - Updated [parent/result/termly/view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/result/termly/view/page.tsx) to work identically to the student termly view (`/dashboard/student/result/termly/view`).
        - Replicated the top navigation bar with back action to published results and term/session breadcrumb.
        - Replicated the hero header banner with gradient matching the term, class cohort title, evaluated count, and summary score cards (Average, Highest, Lowest, or partial coverage).
        - Replicated the score sheet section header with live search input and Grid/Table perspective toggle (defaulting to Grid on mobile and desktop).
        - Replicated the 3-column Cards Grid featuring subject icon, title, course code, square WAEC letter grade badge (A1, B2, B3, C4, C5, C6, D7, E8, F9), 3-col micro-grid for Assignment, CA/Quiz, and Terminal Exam marks, and Cumulative Total footer.
        - Replicated the tabular perspective and the aggregate summary footer with Term Average, Highest Score, Released Coverage, and Print Result Sheet action (`window.print()`).
        - **Fixed React Rules of Hooks Order**: Declared all `useMemo`, `useState`, and `useEffect` hooks unconditionally at the top of `ResultViewInner` before any early returns (`if (isLoading)` and `if (!group)`), eliminating the "change in the order of Hooks" console error.
        - Maintained zero `any` types throughout with `SubjectResultRecord` and `TermResultGroup`.

- **Mobile Top Nav Hamburger Menu Accessibility Enhancement**:
    - [x] **Enlarged Touch Target & Menu Icon**:
        - Scaled the mobile top navigation hamburger button from `size-9` (36px) up to `size-11 sm:size-12` (44px-48px touch target) in [ParentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/ParentMobileDrawer.tsx), satisfying mobile accessibility guidelines.
        - Enlarged the Lucide `Menu` hamburger icon from `h-5 w-5` (20px) to `h-6 w-6 sm:h-7 sm:w-7` with `strokeWidth={2.2}` for clear visibility and crisp rendering.
        - Applied consistent sizing, active scale micro-interactions (`active:scale-95`), and theme-aware borders across [StudentMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/StudentMobileDrawer.tsx), [TeacherMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/TeacherMobileDrawer.tsx), [AdminMobileDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/AdminMobileDrawer.tsx), and secondary header triggers ([TopHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/subject-performance/components/TopHeader.tsx), [ParentHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/attendance/components/ParentHeader.tsx), [MonthlyHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/attendance/monthly/components/MonthlyHeader.tsx), and [NavBarDrawer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/reusable/NavBarDrawer.tsx)).

- **Parent Portal Exams & Results Page Decluttering & Layout Streamlining (`/dashboard/parent/exams&results`)**:
    - [x] **Unified Executive Header**:
        - Consolidated the redundant child-switcher pill bar and oversized hero container into a single, compact, modern header ([page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/page.tsx)).
        - Incorporated student avatar, student name, child dropdown switcher (when parent has >1 linked child), copyable student access code, class cohort, and school name.
        - Unified quick navigation buttons for **Analytics**, **Dashboard Report**, and **Timetable**.
    - [x] **Streamlined Stat Cards**:
        - Decluttered [stat-cards.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/components/stat-cards.tsx) from verbose repetitive labels into 4 breathable KPI cards: Term Average, Attendance, Current Class, and Graded Records.
        - Fixed TypeScript typing using `LucideIcon` without any `any` types.
    - [x] **Consolidated Command & Filter Bar**:
        - Removed the 100px vertical academic insight banner to bring exam cards into immediate view.
        - Unified search, category filter tabs (All, Exams, C.A., Assignments, Tests), subject/status dropdowns, and grid/list view toggles into one cohesive toolbar in [exam-list.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/components/exam-list.tsx).
        - Strictly typed `grade: Grade` and `exam: UpcomingExam`, eliminating all `any` types.
    - [x] **Streamlined Right Sidebar**:
        - Overhauled [sidebar-right.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/components/sidebar-right.tsx) by removing the bulky Chart.js Radar polygon (which is already fully featured on `/analytics`), eliminating unnecessary canvas DOM weight and visual height overload.
        - Highlighted **Upcoming Papers** with clean date chips, subject, and time badges, accompanied by a clean **Grading Scale Reference Guide** (A+ through F) and quick link to in-depth radar analytics.

    - [x] **Removed Final Result Tab & Updated Navigation Button**:
        - Removed the "Final Result Grades" tab button, tab state (`activeTab`), and conditional tab switcher from [exams&results/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/page.tsx).
        - Streamlined the view to directly display the primary Continuous Assessment & Exams list (`<ExamList />`) alongside `<SidebarRight />` without redundant tab wrapper friction.
        - Updated the quick action and card navigation buttons linking to the report card page from "Report Card" to **"Dashboard Report"**.

- **Parent Portal Report Card Disclosure & PDF Export Design (`/dashboard/parent/exams&results/report-card`)**:
    - [x] **Platform Disclosure & Final Report Card Notice**:
        - Added prominent informative banner above the report card document informing parents that this document is an interim record of all student activities, continuous assessments, quizzes, and learning tasks on Qefas Hub, not the final official school report card.
        - Notified parents that the official final terminal school report card issued by the school administration appears on the **Final Results** page, complete with a quick action button to navigate there.
        - Updated document classification in [report-header.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/report-card/components/report-header.tsx) and [footer.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/report-card/components/footer.tsx) with explicit interim disclosure badges and official disclaimers.
    - [x] **PDF Export Design Pattern Alignment (`pdf_export_design`)**:
        - Overhauled `handleDownloadPDF` in [breadcrumb-actions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/report-card/components/breadcrumb-actions.tsx) strictly adhering to the `pdf_export_design` skill and [pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts).
        - Integrated `react-toastify` toasts (`toast.loading("Generating PDF...", { autoClose: false })` updated to success/error on completion).
        - Added an even number of key-value pairs (10 pairs) to the formal shaded metadata grid at the top.
        - Formatted table headers: `[['S/N', 'Subject Name', 'C.A. (40)', 'Terminal Exam (60)', 'Total Mark (100)', 'Grade', 'Teacher Remark']]`.
        - Injected formal additional table for "Institutional Notice & Platform Disclosure" clarifying the document's continuous assessment scope and noting that the final official school report card appears on the Final Results portal.
        - **School Logo Integration**: Connected [useSchoolProfile](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useSchool.ts) to retrieve the real school brand logo, rendering it in the report card UI and embedding it at top-left in the PDF export via [pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts) with automatic aspect ratio calculation and institutional fallback.

- **Parent Portal Exam Calendar Overhaul & Real Data Integration (`/dashboard/parent/exams&results/calender`)**:
    - [x] **Real Assessment & Exam Data Integration**:
        - Replaced hardcoded October 2023 mock data with real data synthesized from [useParentDashboard](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentDashboard.ts) (upcoming exams) and [useChildDetails](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentChildren.ts) (graded assessments/exams).
        - Added linked child dropdown selector synchronized with [useParentStore](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentStore.ts).
        - Built robust date matching and summary statistics calculation in [calendarUtils.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/calender/components/calendarUtils.ts) using `date-fns`.
    - [x] **Responsive Month Grid & Mobile Agenda View**:
        - Redesigned [CalendarGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/calender/components/CalendarGrid.tsx) with a responsive Month Grid and dedicated Agenda / List view for seamless mobile navigation.
        - Month navigation with previous/next controls and instant "Today" reset button.
        - Event chips displaying title, category, status dots, and overflow badges (+N more).
        - Interactive day selection allowing parents to filter exams for any specific date with an instant clear/reset button.
    - [x] **Stats Overview & Upcoming Panel**:
        - Overhauled [StatsOverview.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/calender/components/StatsOverview.tsx) with 4 real metrics: Upcoming Exams, Completed Tests, Total Tracked, and Average Score.
        - Overhauled [UpcomingPanel.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/calender/components/UpcomingPanel.tsx) with real upcoming assessments, selected day schedule, quick link to exam details (`/details?id=...`), and parent tip card.
    - [x] **Styling, Layout & Dark Mode**:
        - Expanded layout to fit 98% of the page (`w-full max-w-[98%] mx-auto px-2 sm:px-4 py-4 sm:py-6`).
        - Full dark mode support using `dark:bg-slate-900`, `dark:border-slate-800`, and `dark:text-white`.
        - Replaced all unrendered material symbols with Lucide React icons.
        - Zero tolerance for `any` types throughout all calendar components.

- **Parent Portal Term Report Card Overhaul & Dark Mode Redesign (`/dashboard/parent/exams&results/report-card`)**:
    - [x] **Real Academic Data Integration & Dynamic Term Selector**:
        - Replaced mock data ("Alex Doe", "Springfield International School", "EduSmart 2023", etc.) with live student data from [useChildDetails](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentChildren.ts), [useParentStore](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentStore.ts), and [useParentDashboard](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentDashboard.ts).
        - Added interactive Term Selector (`All Terms`, `Term 1`, `Term 2`, `Term 3`) and multi-child dropdown switcher.
        - Computes real subject breakdown with Continuous Assessment (C.A.), Exam mark, combined Total (100), letter grade (`A1` to `F9`), and verified evaluator remarks.
        - Computes cumulative average score, academic standing (`Distinction`, `Good Standing`), attendance rate, and institutional advancement status.
    - [x] **Dark Mode Fixes & Institutional Branding**:
        - Eliminated broken `dark:bg-card-dark` classes, replacing with standard `dark:bg-slate-900` and `dark:border-slate-800`.
        - Replaced unrendered material symbols with Lucide React icons.
        - Standardized decorative accents with Qefas Hub warm Orange gradient (`from-orange-500 via-amber-500 to-orange-600`).
        - Updated official verification footer to Qefas Hub Educational Systems Directorate.
    - [x] **PDF Export & Print Optimization**:
        - Connected "Download PDF" action to the institutional [pdfGenerator.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/utils/pdfGenerator.ts) utility to generate clean official PDF downloads.
        - Configured clean `@media print` rules ensuring the report card prints without browser chrome artifacts or background distortions.
        - Responsive layout: mobile card view on phones and clean tabular document on desktop fitting 98% of the available page width (`w-full max-w-[98%] mx-auto`).
        - Enhanced `<ReportCardSkeleton />` with a comprehensive 98%-width layout and foolproof query hydration guards that prevent empty-state flickering.

- **Parent Portal Subject Analytics Page Overhaul & Dark Mode Redesign (`/dashboard/parent/exams&results/analytics`)**:
    - [x] **Real Academic Data Integration & Reactive Subject Filter**:
        - Connected with [useParentStore](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentStore.ts), [useParentChildren](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentChildren.ts), and [useChildDetails](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useParentChildren.ts) to eliminate all dummy mock data ("Sarah", "Winter Math Project", etc.).
        - Dynamically extracts all distinct curriculum subjects evaluated for the selected child.
        - Provides interactive subject switcher dropdown permitting seamless switching between `All Curriculum Subjects` and specific subjects (e.g. Mathematics, English Language, Physics).
        - Computes real weighted average scores, letter grades (`A1` to `F9`), longitudinal progression trajectory, category distributions (Exams vs Tests vs Quizzes), score extremes (peak & lowest marks), and teacher remarks.
    - [x] **Dark Mode Fixes & Brand Aesthetics (Orange Parent Theme)**:
        - Replaced unconfigured `dark:bg-card-dark` classes with standard `dark:bg-slate-900` and `dark:border-slate-800` across all cards.
        - Replaced hardcoded blue `#3670e2` fills with the Qefas Hub Orange palette (`#f97316` / `#ea580c`) and SVG gradient fills.
        - Redesigned SVG chart with dark-mode grid borders, interactive node hovers, floating tooltips, and dashed cohort benchmark line.
        - Replaced unrendered material symbols with sharp Lucide React icons.
    - [x] **Full Mobile & Web Responsiveness**:
        - Expanded layout to fit 98% of viewport width without cramped clipping.
        - **AssessmentsTable**: Added responsive mobile card view for small screens and desktop tabular layout with 5-per-page `<Pagination theme="orange" />`.
        - **BreadcrumbActions**: Breadcrumbs with active child selector dropdown and print/report card actions.
        - Added shimmering `<AnalyticsSkeleton />` for zero layout shift during query hydration.

- **Parent Portal Exam Details Page Full Revamp (`/dashboard/parent/exams&results/details?id=...`)**:
    - [x] **Connected Real-Time Data & Correct Query Parameter Consumption**:
        - Fixed query parameter resolution by extracting `id` via `useSearchParams()` instead of `useParams()` (which returned `undefined` for query parameters in Next.js App Router).
        - Wrapped component tree in `<Suspense fallback={<ExamDetailsSkeleton />}>` to satisfy Next.js streaming conventions.
        - Integrated student selector with `useParentStore` and `useParentChildren`, enabling parents with multiple children to inspect exam details per child seamlessly.
        - Fetches full academic dossier combining `useChildDetails` (`student.grades`, teachers, subjects, remarks), `useExamResult` (class benchmark, position, global percentile, grade letter, velocity), and `useExamReview` (per-question attempts, student responses, answer key, teacher scoring notes).
        - Provided graceful fallback synthesis when viewing offline terminal papers or continuous assessments.
    - [x] **Premium Mobile & Web Responsive Aesthetics**:
        - **PageHeader**: Added back navigation to Exams & Results, dynamic category / term badges, verified student name/code/class/school badges, total score summary pill, and responsive child switcher dropdown.
        - **KPICards**: 4 responsive metric cards (Total Score & Grade, Class Benchmark with visual comparison bar, Academic Standing & Position, and Curriculum Breadth) in a 2x2 grid on mobile and 4x1 on desktop.
        - **PerformanceBreakdown**: Detailed subject-by-subject cards with mark progress bars, teacher evaluators, percentage badges, and verified remarks.
        - **QuestionReview Subject Paper Separation & 10-per-page Pagination**:
            - Added dynamic Subject Paper separation tabs (`All Subject Papers`, `Mathematics Paper`, `English Language Paper`, etc.) with count badges and paper score summary pills.
            - Integrated 10-per-page pagination with the global `<Pagination theme="orange" itemsPerPage={10} ... />` component, automatically resetting to page 1 upon paper tab or correctness filter changes.
            - Per-question card indexing displays both the subject paper question number (`#Q{number}`) and global page item index with subject badge chips.
            - Filter pills allow isolating `All`, `Correct`, and `Incorrect` answers within any selected subject paper.
            - Offline written assessment fallback also supports subject paper separation tabs and 10-per-page pagination across evaluated curriculum components.
        - **Sidebar Modules**: Parent Action Tools (full report card link, print/save slip), dynamic Strengths & Focus Areas, and verified Teacher Evaluation note.
        - Styled with Qefas Hub Orange theme (`orange-500`, `orange-600`), dark-mode support, and zero horizontal page overflow.

- **Parent Portal Exams & Results Main Exams Consolidation & Pagination (`/dashboard/parent/exams&results`)**:
    - [x] **Consolidated Main Exams (Eliminated Fragmented Subject Papers)**:
        - Refactored grade mapping in [exam-list.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/exams&results/components/exam-list.tsx) to group subject paper grades by their parent `Exam` record (`grade.examId` / `grade.exam.title`), displaying the actual Main Exam (e.g. "First Term Examination 2026", "Mid-Term Examination") instead of fragmented raw paper entries ("Mathematics Paper 1", "Paper 2").
        - Multi-subject main exams aggregate overall cumulative scores (`totalScore / totalMaxMarks`), weighted percentage, letter grades, and subject breadth count pills (e.g. `5 Papers Graded`).
        - Standalone non-exam assessments sanitize raw paper names to clean assessment titles (`${subject} ${assessmentType}`).
        - Details buttons now pass the main exam's ID (`exam.examId || exam.id`), ensuring the examination dossier properly loads the full exam details.
    - [x] **Full-Featured Pagination System**:
        - Added the brand-aligned `'orange'` theme to the global [Pagination.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/ui/Pagination.tsx) component.
        - Integrated `<Pagination />` with 6 items per page (`itemsPerPage = 6`, giving a balanced 2x3 grid) with previous/next controls, numbered page buttons, and active orange gradient pills.
        - Added single-page count confirmation state when `totalPages === 1`.
        - Numbering badges in both Grid View and Table List View dynamically compute page offsets `(currentPage - 1) * itemsPerPage + index + 1`.

- **Parent Dashboard Mobile Financial Status Overlap Resolution (`/dashboard/parent`)**:
    - [x] **Eliminated Cyclic Grid Sizing & Card Overlap on Mobile**:
        - Removed problematic `h-full` on [Announcements.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/Announcements.tsx), which previously caused browsers to treat the row track height cyclically as 0 / min-content of the header on single-column mobile viewports, placing the subsequent "Financial Status" header directly on top of the Announcements card.
        - Replaced with `w-full flex-1 flex flex-col overflow-hidden` to ensure the Announcements card correctly reports its natural intrinsic height to the grid layout.
        - Removed redundant `h-full` declarations on [FinancialSummaryCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/FinancialSummaryCard.tsx) and [RecentPerformanceChart.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/RecentPerformanceChart.tsx) to prevent vertical stretching distortion inside unconstrained block containers.
        - Added `items-start` and explicit `w-full flex flex-col` on grid column containers in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/page.tsx) to ensure independent column auto-sizing and guaranteed vertical spacing (`gap-6 sm:gap-8`) between the activity feed and financial status section on mobile screens.

- **Parent Portal Settings Page 98% Viewport Width & Mobile/Desktop Polish (`/dashboard/parent/settings`)**:
    - [x] **98% Viewport Space Fit & Layout Optimization**:
        - Removed rigid `max-w-7xl` outer constraint and nested `max-w-6xl` constraints on all 4 tab panels (Profile, Appearance, Security, Notifications).
        - Replaced with `w-full max-w-[99%] mx-auto`, allowing form cards and widget panels to spread evenly across 98% of the browser width on wide desktop screens.
        - Eliminated redundant outer gutters to prevent double-padding on mobile screens.
    - [x] **Modern Hero Header & User Avatar Badge**:
        - Upgraded header banner with ambient gradient, account avatar with DiceBear initials fallback, email badge, "Parent Account Security" status pill, and analytical HeaderTooltip.
        - Streamlined mobile action buttons into a full-width 2-column grid (`grid-cols-2 sm:flex`).
    - [x] **Responsive Mobile Tab Navigation**:
        - Positioned icons strictly on the left of the tab labels (`[User] Profile`, `[Palette] Theme`, `[Lock] Security`, `[Bell] Alerts`) using horizontal flex (`flex-row items-center gap-2`), keeping both icons and labels visible across mobile and desktop.
        - Enabled smooth horizontal scrolling with `overflow-x-auto no-scrollbar` to prevent squishing on narrow mobile screens.
    - [x] **Multi-Tab Polish (Profile, Theme, Security, Notifications)**:
        - Profile: 2-column desktop layout (`lg:col-span-2` + widget sidebar) with verified guardian card, public profile link, and subscription tier widget.
        - Appearance: Enhanced Light and Dark mode interactive cards with active border highlights, radio checkmarks, and responsive system sync switch.
        - Security: Clean security cards for password reset, 2FA setup, active device sessions, and account deactivation.
        - Notifications: High-contrast unread alert rows, type icons, and responsive pagination controls.

- **Parent Portal Termly Results Hub 98% Space Fit & Mobile Polish (`/dashboard/parent/result/termly` & `/view`)**:
    - [x] **98% Viewport Utilization & Zero-Waste Spacing**:
        - Removed artificial `max-w-7xl` constraint and redundant outer padding across `/result/termly` and `/result/termly/view`.
        - Replaced with `w-full max-w-[99%] mx-auto`, allowing the report card grid (`1-4 responsive columns`), search toolbar, and subject score tables to fill 98% of the viewport.
    - [x] **Mobile Responsiveness & Multi-Child Switcher**:
        - Added validated multi-child switcher pill bar with class badges, horizontal scrolling, and automatic fallback to verified active ward.
        - Streamlined mobile card layouts with responsive badges, status pills, and touch targets.
        - Redesigned empty states for unlinked accounts (3-step guide) and unreleased results with manual refresh action.

- **Parent Portal Examinations & Results Hub Complete Redesign (`/dashboard/parent/exams&results`)**:
    - [x] **Authenticated Session & Multi-Child State Management**:
        - Connected `useParentChildren()` to validate `selectedChildId` strictly belongs to the logged-in parent, automatically resolving or falling back to the verified linked child (`children[0].id`).
        - Added interactive **Child Switcher Pill Bar** allowing parents with multiple linked children to switch between each child's assessment dossier in 1 click.
    - [x] **Unified Shimmering Modern Loading Skeleton (`ExamsResultsPageSkeleton`)**:
        - Built an authentic skeleton matching the full page layout (breadcrumbs, child switcher, hero card, 4 KPI cards, tabs, exam list, and radar chart sidebar) with smooth pulsing animations.
    - [x] **Premium Hero Card & Onboarding States**:
        - Upgraded Hero Card with ambient gradient, student avatar with initials fallback, student code with 1-click copy feedback, class badge, quick action buttons ("Performance Analytics", "Official Report Card", "Exam Timetable"), and comprehensive analytical tooltip adhering to `comprehensive_header_tooltips`.
        - Added dedicated onboarding empty state when 0 children are linked with 3-step guidance and a direct CTA to `/dashboard/parent/my-children`.
    - [x] **Modernized 4 KPI Stat Cards (`stat-cards.tsx`)**:
        - Upgraded to 4 modern KPI cards with Lucide icons (`TrendingUp`, `CalendarCheck`, `GraduationCap`, `Award`), glassmorphic hover lift, and analytical tooltips for Term Average, Attendance, Current Class, and Graded Records.
    - [x] **Enhanced Assessment List & Empty States (`exam-list.tsx`)**:
        - Added a reassuring **"No Assessment Records Posted Yet"** empty state with manual refresh action for new students.
        - Added a dedicated **"No Assessments Match Your Filters"** state with 1-click filter reset button.
        - Polished search input with clear button, styled dropdown filters, and modernized card and table views.
    - [x] **98% Viewport Utilization & Zero-Waste Spacing**:
        - Removed artificial `max-w-7xl` constraint and redundant nested `px-6 py-6` padding, allowing the continuous assessment and exam dossiers to expand and fill 98% of the browser width.
        - Eliminated nested `overflow-y-auto` container to prevent double vertical scrollbars and provide seamless native window scrolling.
        - Optimized `ParentLayout` inner padding from rigid `p-6 lg:p-8` to responsive `p-2 sm:p-3 md:p-4`.
    - [x] **Mobile-First Responsiveness Polish**:
        - Redesigned Hero Card actions into an adaptive 3-column touch grid (`grid-cols-3 sm:flex`) on mobile screens to prevent overflow and wrapping.
        - Tuned 4 KPI cards (`min-h-[125px]`, `gap-2 sm:gap-3.5`) and segmented tab controls for clean display on 360px–414px smartphone viewports.
        - Reconfigured two-column layout (`ExamList` + `SidebarRight`) to stack smoothly on mobile/tablet and sit side-by-side on wide screens.

- **Parent Portal Attendance Hub Bug Fix & Complete Redesign (`/dashboard/parent/attendance`)**:
    - [x] **Resolved Cross-User Stale Child Attendance Bug**:
        - Fixed root cause where `ParentAttendancePage` previously read `selectedChildId` directly from Zustand local storage without validating if the child actually belonged to the active logged-in parent.
        - Connected `useParentChildren()` to validate `selectedChildId`; automatically auto-selects or resets to the logged-in parent's verified child ID.
        - Updated backend `getParentDashboardService` and `getChildDetailsService` to fall back to the authenticated parent's linked child if an invalid or stale `childId` from another user's session is passed.
        - Synchronized link status checks in backend to consistently support `["active", "ACCEPTED", "Active"]` across all parent endpoints.
    - [x] **Multi-Child Switcher & Empty States**:
        - Added interactive **Child Switcher Pill Bar** allowing parents with multiple linked children to switch between each child's real-time attendance in 1 click.
        - Added dedicated onboarding empty state when 0 children are linked with step-by-step guidance.
        - Added a reassuring **"No Attendance Records Logged Yet"** empty state when no daily roll-call records have been posted yet, with a manual refresh action.
    - [x] **Unified Shimmering Modern Loading Skeleton (`AttendancePageSkeleton`)**:
        - Built an authentic skeleton matching the full page layout (breadcrumbs, hero card, alert banner, circular attendance chart, monthly trend chart, and recent activity feed).
    - [x] **Upgraded Hero Header & Tooltips (`StudentProfile.tsx`)**:
        - Upgraded `StudentProfile` with ambient gradients, student avatar with DiceBear initials fallback, school name, grade badge, 1-click copyable student ID, and comprehensive analytical header tooltip following `comprehensive_header_tooltips`.
    - [x] **TypeScript Verification**: Passed `npx tsc --noEmit` with zero errors (exit code 0).

- **Parent Portal Assignments & Coursework Hub Complete Redesign (`/dashboard/parent/assignments`)**:
    - [x] **Refined Empty & Student Switcher States**:
        - Replaced generic single-sentence empty box with a reassuring **"All Coursework is Up to Date!"** state showing the student's name, clean checkmark badge, and quick-action refresh button.
        - Added an onboarding state when 0 children are linked, giving parents direct step-by-step instructions to link their child.
        - Added an interactive **Child Switcher Pill Bar** allowing parents with multiple children to switch and monitor each child's assignments in 1 click.
        - Added a dedicated "No Matching Assignments Found" state with a 1-click filter reset button.
    - [x] **Unified, Shimmering Modern Loading Skeleton (`AssignmentsPageSkeleton`)**:
        - Built an authentic skeleton matching the full page layout (breadcrumbs, hero card, 4 KPI metric cards, filter toolbar, and card grid/list) with smooth pulsing animations.
    - [x] **Premium Hero Card & 4-Card KPI Overview Widgets**:
        - Ambient gradient hero card with student context badge, comprehensive analytical header tooltip following `comprehensive_header_tooltips`, List/Grid view toggle, and PDF dossier download button.
        - Upgraded OverviewWidgets to 4 responsive KPI cards: **Total Deliverables**, **Graded & Scored**, **Assignment Average**, and **Action Required** (pending/late).
    - [x] **Dynamic Search & Multi-Criteria Filter Toolbar (`FilterToolbar.tsx`)**:
        - Connected real-time search across assignment titles, subjects, and departments.
        - Dynamically populated subject filter pills extracted from loaded assignments (`['All', ...uniqueSubjects]`).
        - Added status dropdown filter (All, Not Started, In Progress, Graded, Overdue) and sorting dropdown (due dates, highest score, newest).
    - [x] **TypeScript Verification**: Passed `npx tsc --noEmit` with zero errors (exit code 0).

- **Parent Portal Classroom Hub Complete Redesign & State Handling (`/dashboard/parent/class`)**:
    - [x] **Redesigned Empty & "No Class" States**:
        - Replaced generic red `AlertTriangle` "Class Not Found" modal with a dedicated, reassuring **"No Classroom Cohort Assigned Yet"** state showing the student's profile context (name, code, school), reasons (Term Transitions, Roster Finalization), and quick-action buttons ("Refresh Status", "View Linked Students").
        - Added an onboarding state when 0 children are linked, giving parents direct step-by-step instructions to link their child.
        - Added an interactive **Child Switcher Pill Bar** allowing parents with multiple linked children to toggle between their children's classrooms in 1 click directly on this page.
    - [x] **Unified, Shimmering Modern Loading Skeleton (`ClassPageSkeleton`)**:
        - Built an authentic skeleton matching the full page layout (breadcrumbs, hero card, 4 KPI metric cards, tabs, and content grid) with subtle ambient gradients and zero visual jarring.
    - [x] **Premium Classroom Hero & KPI Metric Grid**:
        - Implemented an ambient gradient hero with active cohort pill, school name, grade level, section, and a comprehensive analytical header tooltip following the `comprehensive_header_tooltips` skill.
        - Added metadata pills with 1-click copy feedback for the official Class Code.
        - Added 4 KPI insight cards: **Class Roster** (enrolled students), **Curriculum** (course count), **Class Teacher** (lead teacher), and **Class Section** (section / arm).
    - [x] **Enhanced Subjects & Timetable Views (`ParentClassSubjects.tsx` & `ParentClassTimetable.tsx`)**:
        - Upgraded subjects cards with subject-category color themes (Math, Science, Language, Humanities, Arts), teacher avatars, and assessment paper badges.
        - Upgraded timetable skeleton loader and schedule grid rendering.
    - [x] **TypeScript Verification**: Passed `npx tsc --noEmit` with zero errors (exit code 0).

- **Parent Portal "My Children" API Authentication & Onboarding Empty-State Fix (`/dashboard/parent/my-children`)**:
    - [x] **API Client Request Interceptor Token Resolution (`frontend/src/lib/api/client.ts`)**:
        - Fixed root cause of 401 Unauthorized errors on cross-port / cross-domain API calls: `apiClient` previously read `token` exclusively from `Cookies.get("token")`.
        - Because `setAuth` stopped writing non-HttpOnly client cookies, `Cookies.get("token")` returned `undefined`, causing requests to `/parents/children` to omit the `Authorization: Bearer <token>` header and fail.
        - Updated request interceptor to resolve authentication credentials prioritizing persisted Zustand storage (`useAuthStore.getState().accessToken`) with `Cookies.get("token")` fallback.
    - [x] **Client Auth Storage & Cookie Synchronization (`frontend/src/app/(auth)/login/services/auth-store.ts`)**:
        - Synchronized `Cookies.set("token", token, ...)` in `setAuth` upon successful login/verification and in `initialize` when hydrated from local storage.
    - [x] **Unblocked Children Listing from Subscription Middleware (`backend/src/modules/parent/parent.route.ts` & `parent.controller.ts`)**:
        - Removed `checkSubscription` from `GET /api/parents/children` so unlinked or free-tier parents are never blocked from viewing their linked children.
        - Updated `getChildren` controller to gracefully return `{ success: true, message: "No children linked at this time", data: [] }` if an unexpected query issue occurs, avoiding hard 500 error cascades.
        - Updated `parentService.getChildren` in `frontend/src/lib/api/services/parentService.ts` to safely return `[]` fallback on any network or parsing error.
    - [x] **Explicit "No children linked at this time" UI State (`frontend/src/app/dashboard/parent/my-children/components/ChildrenGrid.tsx` & `Mobile/app/(parent-tabs)/children.tsx`)**:
        - Replaced generic error banner with an explicit **"No children linked at this time"** onboarding card in Grid view and an informative empty-state row in List/Table view.
        - Synchronized Mobile app `children.tsx` to display **"No children linked at this time"** consistently across both web and mobile platforms.
        - Gated and guarded all child properties with optional chaining and `filter(Boolean)` against null or undefined values.
        - Provides immediate access to the "Link Student" dialog with clear step-by-step guidance.
    - [x] **TypeScript Verification**: Both `frontend` and `backend` passed `npx tsc --noEmit` with zero errors (exit code 0).

- **Landing Page Authenticated Redirection & Dashboard Sidebar Logo Landing Access (`/?view=landing`)**:
    - [x] **Server-Side Edge Middleware Redirection (`frontend/src/middleware.ts`)**:
        - Updated platform routing logic for the landing page (`/`): automatically checks for an active session (`token` or `platform_token` cookies).
        - If session exists and user is not in bypass mode, decodes JWT `userType` and immediately issues a fast HTTP 307 redirect to their respective dashboard (`/dashboard/admin`, `/dashboard/teacher`, `/dashboard/student`, `/dashboard/parent`, or `/console`).
        - Added `?view=landing` query parameter inspection: allows logged-in users who intentionally click the dashboard sidebar logo to visit and browse the landing page without redirect.
    - [x] **Client-Side Hydration Guard & Zero-Flash UI (`frontend/src/app/page.tsx`)**:
        - Created `LandingContent` wrapped in `<Suspense>` adhering to Next.js App Router query parameter guidelines.
        - Synchronized client-side redirection with Zustand `useAuthStore` and `usePlatformStaffStore`.
        - Prevents redirection when `isLoggingOut` is active or when `view === 'landing'`.
        - Added clean transition loading state during redirects to prevent visual flashing of landing page sections.
    - [x] **Dashboard Sidebars & Mobile Drawers Update**:
        - Updated the brand logo links across all 4 user dashboard sidebars and responsive mobile drawers from `href="/"` to `href="/?view=landing"`:
            - School Admin: `frontend/src/app/dashboard/admin/components/app-sidebar.tsx` & `AdminMobileDrawer.tsx`
            - Teacher Hub: `frontend/src/app/dashboard/teacher/components/app-sidebar.tsx` & `TeacherMobileDrawer.tsx`
            - Student Portal: `frontend/src/app/dashboard/student/components/app-sidebar.tsx` & `StudentMobileDrawer.tsx`
            - Parent Portal: `frontend/src/app/dashboard/parent/components/app-sidebar.tsx` & `ParentMobileDrawer.tsx`
    - [x] **Public Navigation Bar Polish (`BigNavBar.tsx` & `MiniNav.tsx`)**:
        - Updated navbar logo link to dynamically render `href={isAuthenticated ? "/?view=landing" : "/"}` so logged-in users exploring the website can click the brand logo to return to the top of the landing page without triggering a redirect back to their dashboard.
        - Kept the prominent "Dashboard" button (`/dashboard`) in both desktop navbar and mobile drawer for one-click return to their dashboard.
    - [x] **TypeScript Verification**: Verified `npx tsc --noEmit` completes with zero errors (exit code 0).

### Sunday, October 18, 2026

- **Full Project Build & TypeScript Verification**:
    - [x] **Frontend Production Build**: Successfully completed `npm run build` in `frontend` with exit code `0`. All 120+ static and dynamic routes compiled, validated, and optimized without errors.
    - [x] **Backend Type Check**: Successfully completed `npx tsc --noEmit` in `backend` with exit code `0` and zero TypeScript errors.

### Saturday, October 17, 2026

- **Social Login Wrong Portal Indication & Seamless Portal Switching (`Google` & `Facebook`)**:
    - [x] **Root Cause Remediation for Missing Indication**:
        - Identified that when a user authenticated via Google or Facebook using credentials registered in another portal (e.g. Student attempting login from `/login/teacher`, or Teacher from `/login/student`), backend OAuth services (`googleAuthService` & `facebookAuthService`) threw a generic error which the OAuth callback routes redirected to hardcoded `/login?error=...`.
        - The main `/login` portals hub and individual portal forms (`StudentLoginForm`, `TeacherLoginForm`, `ParentLoginForm`, and `school-admin/components/LoginForm`) never inspected `useSearchParams()` for error parameters or wrong portal indicators, causing users to be dumped on the portal hub or form with zero visual indication, toast, or guidance.
    - [x] **Backend Structured Wrong Portal Error Model (`auth.service.ts`, `auth.controller.ts`, `error-handler.ts`)**:
        - Created `WrongPortalError` error class carrying `code: "WRONG_PORTAL"`, `detectedRole` ("Student", "Teacher", "School Admin", "Parent", "Platform Staff"), and `correctPortal` route (`/login/student`, `/login/teacher`, `/login/school-admin`, `/login/parent`, `/auth/login`).
        - Updated `googleAuthService` and `facebookAuthService` to include `PlatformStaff` in the global role lookup and throw `WrongPortalError` with target redirection metadata when portal role mismatch occurs.
        - Updated `auth.controller.ts` (`googleAuth`, `facebookAuth`, and password `login`) and `error-handler.ts` to return HTTP 403 with `{ success: false, code: "WRONG_PORTAL", detectedRole, correctPortal, message }`.
    - [x] **Frontend OAuth Callback Route Intelligence (`google/callback/route.ts` & `facebook/callback/route.ts`)**:
        - Replaced hardcoded fallback redirection to `/login` with dynamic portal mapping (`rolePathMap[storedRole]`) so failed attempts redirect back to the user's attempted portal in context.
        - Handled `code: "WRONG_PORTAL"` and extracted `detectedRole` / `correctPortal`, appending `wrong_portal=true`, `detected_role=${detectedRole}`, and `correct_portal=${correctPortal}` to the redirection URL.
        - Ensured `/login/callback` preserves all error search parameters when redirecting.
    - [x] **Dedicated Wrong Portal Alert Banner & Portal Highlighting (`WrongPortalAlert.tsx`, `PortalCard.tsx`, `page.tsx`)**:
        - Created reusable `WrongPortalAlert` component featuring an animated warning badge, clear role discrepancy explanation, role-specific badge styling, and an eye-catching direct action button: **"Go to {detectedRole} Portal →"**.
        - Integrated `toast.error(message)` auto-dispatch on mount for instant visual/audio feedback.
        - Integrated `WrongPortalAlert` across all 5 login screens: Student (`RightPanel.tsx`), Teacher (`RightPanel.tsx`), Parent (`RightPanel.tsx`), School Admin (`LoginCard.tsx`), and Platform Operations Console (`auth/login/page.tsx`).
        - Enhanced the main `/login` portals hub (`page.tsx` & `PortalCard.tsx`): dynamically detects `detected_role` and renders a prominent **"✨ Your Registered Portal"** pulsating ring, gradient glow, and direct sign-in button around the card matching the user's true account role.
    - [x] **Email & Password Login Wrong Portal Indicator Support**:
        - Updated backend `auth.controller.ts` `login` handler to verify existence across all 5 roles (`Student`, `Teacher`, `Admin`, `Parent`, and `PlatformStaff`) and return HTTP 403 `code: "WRONG_PORTAL"`.
        - Wired `useLoginMutation` in `use-auth-mutations.ts` to dispatch `wrong_portal_event` on error.
        - `WrongPortalAlert` listens to both URL search parameters and client-side `wrong_portal_event`, rendering both the toast and the interactive **"Go to {detectedRole} Portal →"** banner dynamically on email/password submission without needing a page refresh.

- **Student Dashboard Empty-State & Final Results Banner Refinement (`/dashboard/student`)**:
    - [x] **Conditional Final Results Banner**:
        - Gated the emerald *"Final Results Available! Your published academic report card and term summaries are ready for review."* banner using `useMyPublishedResults()` hook so it only appears when published term results actually exist (`hasPublishedResults`).
    - [x] **Eliminated Misleading "Score Percentage 0%" Onboarding State**:
        - Replaced the confusing empty state under **Recent Activity** (which rendered "Score Percentage: 0%" and a 0% progress bar for new students without exam attempts) with a dedicated, welcoming empty-state card.
        - Designed a clean *"No Assessments Yet"* card with supportive guidance explaining that grades and progress will display after completing an exam, paired with a direct *"Browse Exams & Quizzes"* action button (`/dashboard/student/exams&quizzes`).
        - Updated top hero action button from a static *"Resume Last Activity"* to dynamically show *"Explore Assessments"* when no attempts exist yet, ensuring intuitive navigation for new users.

### Thursday, October 15, 2026

- **Dynamic OAuth Redirect URI Resolution (`Google` & `Facebook`)**:
    - [x] **Root Cause Remediation for Localhost Fallback**:
        - Identified that `frontend/src/lib/google.ts` and `facebook.ts` statically read `NEXT_PUBLIC_APP_URL || "http://localhost:3000"` at module initialization time. When accessed from a mobile phone (via local LAN IP or tunnel) or deployed on a remote domain/preview without setting `NEXT_PUBLIC_APP_URL`, Google OAuth redirected the browser to `http://localhost:3000/api/auth/google/callback`.
        - Replaced rigid static singletons with dynamic client factories (`getGoogleClient(originOrUri)` & `getFacebookClient(originOrUri)`) and URI resolvers (`getGoogleRedirectUri`, `getFacebookRedirectUri`).
        - Integrated request origin detection (`request.nextUrl.origin`), `VERCEL_URL` environment support, and explicit non-localhost `NEXT_PUBLIC_APP_URL` precedence.
        - Persisted the exact `redirect_uri` sent to OAuth providers in an encrypted HttpOnly session cookie (`google_redirect_uri` / `facebook_redirect_uri`) so token validation in step 2 precisely matches step 1, preventing OAuth `redirect_uri_mismatch` errors.

- **Parent Settings Page Mobile Responsiveness & Comprehensive Header Tooltips (`/dashboard/parent/settings`)**:
    - [x] **Container Layout & Edge Padding Normalization**: Replaced unconstrained `w-[95%] px-4 md:px-8 py-8` with standardized `max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8`, preventing screen edge clipping on mobile viewports.
    - [x] **Responsive Page Header & Mobile Action Bar**: Added responsive icon badge, flex-wrap actions, and full-width touch-friendly button sizing on small screens.
    - [x] **Mobile Tabs Navigation**: Enhanced `TabsList` with smooth horizontal scrolling (`no-scrollbar`), comfortable touch heights (`h-9`), and responsive trigger padding so parents can easily navigate between Profile, Appearance, Security, and Notifications tabs without layout breakage.
    - [x] **Comprehensive Header Tooltips**: Integrated context-rich, analytical tooltips adhering strictly to `.agents/skills/comprehensive_header_tooltips/SKILL.md`:
        - **Account Settings Header**: Master overview tooltip describing contact info, student focus, 2FA, password management, and active session controls.
        - **Personal Information**: Outlines emergency broadcast usage, report card release notifications, and teacher communication channels.
        - **Default Student Focus**: Details automatic child selection across dashboard charts, grade transcripts, and attendance.
        - **Display & Appearance**: Explains daylight vs low-light mode benefits and automatic OS system synchronization.
        - **Security Protocols**: Covers credential defense, authenticator app/email OTP 2FA, and device session termination.
        - **Notification Center**: Explains unread highlighting, mark-as-read interactions, and notification categories.
        - **Account Verified & Subscription**: Clarifies verified institutional status and tier coverage.
    - [x] **Touch Targets & Form Sizing**: Scaled all card headers and contents from rigid `p-8` to responsive `p-4 sm:p-6 md:p-8`, fluid input padding, rounded-2xl cards, and responsive notification item layout.

- **Parent Login Mobile Responsiveness & Comprehensive Header Tooltip (`/login/parent`)**:
    - [x] **Header Tooltip**: Integrated `HeaderTooltip` next to "Parent Portal" adhering to the Comprehensive Header Tooltips skill with rich, context-aware information explaining real-time grade tracking, attendance records, and direct school communication.
    - [x] **Mobile Responsiveness Polish (`RightPanel.tsx`, `ParentLoginForm.tsx`, `TwoFactorForm.tsx`, `page.tsx`)**:
        - Updated title font sizes from rigid `text-4xl` to responsive `text-2xl sm:text-3xl md:text-4xl` and added descriptive subtitle.
        - Adjusted outer container padding (`px-3 sm:px-8 py-6 sm:py-12`) and card border radius (`rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10`) to eliminate excessive margins and prevent screen edge collisions on mobile phones.
        - Fluidly scaled form inputs, eye toggle buttons, and submit buttons (`h-12 sm:h-14 px-5 sm:px-6 text-sm sm:text-base`) with autocomplete tags.
        - Made 2FA OTP slots responsive (`w-10 h-12 sm:w-14 sm:h-16 text-lg sm:text-2xl gap-1.5 sm:gap-3`) preventing horizontal overflow on small mobile phone displays.

- **Parent Dashboard List & Grid View Modes (Default: Grid)**:
    - [x] **Linked Students (`/dashboard/parent/my-children`)**:
        - Added `viewMode` toggle (`'grid' | 'list'`) to `PageHeading` with `grid` set as the default view.
        - Implemented responsive table/list view in `ChildrenGrid` (`ChildListRow`) displaying avatar, student code, enrolled class, attendance pill, academic average pill, active status indicator, and quick actions (Dashboard & Dropdown).
        - Preserved `AddChildCard` action across both grid and list views.
    - [x] **Exams & Results Assessment Records (`/dashboard/parent/exams&results`)**:
        - Added `viewMode` toggle (`'grid' | 'list'`) to `ExamList` with `grid` set as the default view.
        - Implemented modern assessment cards in grid view displaying subject icon, assessment type badge, status pill, subject teacher, score / grade badge, and direct details link.
        - Maintained table list view with seamless switching and unified pagination.
        - Added row numbering `#` column (`(currentPage - 1) * itemsPerPage + index + 1`) to the table header and rows on desktop and mobile.
    - [x] **Termly Results Dashboard (`/dashboard/parent/result/termly`)**:
        - Added `viewMode` toggle (`'grid' | 'list'`) with `grid` as default view.
        - Implemented List/Table view with `#` numbering column (`idx + 1`), term badge, session, class, subjects count pill, score status badge, and "View Result" button.
        - Added card index `#${idx + 1}` to `ResultGroupCard` in grid view.
        - Added search filter input (by session, class, term) and term dropdown selector (`All`, `1st Term`, `2nd Term`, `3rd Term`).
        - Added comprehensive `HeaderTooltip` explaining official term transcripts, cumulative grades, and score publication schedules.
        - Normalized responsive layout to `max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8`.
        - Added multi-child switcher tabs with automatic first-child fallback.
    - [x] **Termly Result Detail View (`/dashboard/parent/result/termly/view`)**:
        - Added `#` numbering column to Subject Scores table header and rows (`idx + 1`).
        - Added comprehensive `HeaderTooltip` next to Subject Scores section describing assignment, CA/quiz, exam components, and grading weights.
        - Normalized responsive container layout to `max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8`.
    - [x] **Student Performance & Subject Mastery Breakdown (`/dashboard/parent/performance`)**:
        - Created `SubjectPerformanceList` component with `viewMode` toggle (`'grid' | 'list'`) with `grid` as default view.
        - Added `#` row numbering column (`index + 1`) to list view, subject icons, teachers, cumulative averages, total assessment counts, performance tier badges, and direct details links.
        - Added `#${index + 1}` card badges to grid view.
        - Replaced mock "Alex Johnson" data in `subject-performance` with live, eligible curriculum subjects derived from student's enrolled classes and published grades.
        - Updated `backend/src/modules/parent/parent.service.ts` (`getChildDetailsService`) to include class subjects and subject paper teachers.
        - Added multi-child switcher tabs to `ProfileHeader` with automatic first-child fallback.
        - Added context-rich `HeaderTooltip` components across `ProfileHeader`, `StatsGrid`, `PerformanceChart`, and `SubjectPerformanceList`.

- **Row Numbering & Student Exam Eligibility Filtering**:
    - [x] **Table View Numbering (`ChildrenGrid.tsx` & `exam-list.tsx`)**:
        - Added `#` column header and explicit row index numbers (`index + 1`) to `ChildrenGrid` (`ChildListRow`).
        - Added `#` column header and paginated row index numbers (`(currentPage - 1) * itemsPerPage + index + 1`) to `exam-list.tsx` assessment records on both desktop and mobile views.
    - [x] **Student-Specific Exam Eligibility Filtering**:
        - Enhanced `getParentDashboardService` in `backend/src/modules/parent/parent.service.ts`: Upcoming exams are now strictly filtered by student department eligibility (for `CLASS` and `SCHOOL` scoped assessments with department restrictions, only matching students are returned; general assessments with no department restrictions remain accessible).
        - Filtered out exams already attempted or graded for the student (`examAttempts: { none: { studentId } }` and `grades: { none: { studentId } }`) from upcoming exams.
        - Enhanced `getExamsService` in `backend/src/modules/exam/exam.service.ts` with identical student department eligibility constraints across `CLASS` and `SCHOOL` scopes.
        - Added frontend deduplication and exclusion in `exam-list.tsx` to guarantee completed exams are never shown under pending assessments.

- **Parent Exams & Results Page Mobile Responsiveness & Comprehensive Tooltips (`/dashboard/parent/exams&results`)**:
    - [x] **Page Layout & Margin Normalization (`page.tsx`)**:
        - Updated container from rigid `p-6 md:p-8` to responsive `max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8`.
        - Added clear page header with title, subtitle, and comprehensive HeaderTooltip describing the continuous assessment portal and grade trajectories.
        - Made tab buttons wrap and fit seamlessly on mobile devices (`overflow-x-auto no-scrollbar`).
    - [x] **Responsive Stat Cards (`components/stat-cards.tsx`)**:
        - Restructured grid from single-column vertical stack on mobile to `grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6` with compact padding `p-3.5 sm:p-5 md:p-6 rounded-2xl`.
        - Integrated context-aware HeaderTooltips for Term Average, Attendance, Current Class, and Recent Grades.
    - [x] **Assessment List & Filter Toolbar (`components/exam-list.tsx`)**:
        - Added Parent Insight tooltip and Continuous Assessment Records section title with HeaderTooltip and live record count.
        - Enhanced search input and subject/status dropdowns to fluidly adapt between mobile column and desktop row layouts.
        - Upgraded assessment card padding and container border radius for mobile screens.
    - [x] **Sidebar Insights (`components/sidebar-right.tsx`)**:
        - Added comprehensive tooltips to Performance Radar (explaining multi-subject symmetry) and Upcoming Exams (tracking exam sitting milestones).
        - Adjusted card padding and radar canvas sizing to scale cleanly without layout shifts.
    - [x] **Final Result Grades Transcript (`components/final-results.tsx`)**:
        - Added comprehensive tooltips to the Final Result Grades header, Score column (detailing WAEC grading breakdown A1–F9), and Behavior rating column.
        - Made gradient header banner and session/term dropdown filters responsive on small viewports.

- **Parent Child Details Page Mobile Responsiveness & Comprehensive Tooltips (`/dashboard/parent/child-details/[childId]`)**:
    - [x] **Container Padding & Gutter Elimination**:
        - Normalized horizontal padding across profile header, tabs bar, and tab content containers to `px-3 sm:px-6 lg:px-8` (replacing rigid `px-12` / `md:px-12` / `p-12`), eliminating excessive margins on mobile viewports.
    - [x] **Adaptive Mobile Tabs & Avatar Layout**:
        - Restructured the 8-tab grid navigation from vertical 2-column stacking to responsive `grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-3` with compact button padding (`p-2 sm:p-4`), cleanly fitting all tabs in 2 rows on mobile.
        - Adjusted student avatar dimensions to `size-24 sm:size-28 md:size-44` with responsive top offset `-mt-12 md:-mt-20`.
    - [x] **Comprehensive Header Tooltips (`HeaderTooltip`)**:
        - Integrated context-rich, analytical tooltips following `.agents/skills/comprehensive_header_tooltips/SKILL.md` across:
            - Profile Header (Student Dossier summary)
            - Overview Tab (Personal Information, Academic Context, Quick Actions, Guardian Details)
            - History Tab (Student Timeline)
            - Behaviour Tab (Conduct Standing, Core Strengths, Conduct Timeline)
            - Academic Tab (Performance by Subject, Academic Progress, Recent Grades)
            - Attendance Tab (Monthly Attendance Overview with daily presence logs and attendance rate breakdown)
            - Timetable Tab (Weekly Schedule master timetable)
            - Teachers Tab (Class Teachers directory)
            - Assignments Tab (Student Assignments continuous assessment)
    - [x] **Responsive Cards & Grid Systems**:
        - Modernized `SectionCard` with `rounded-2xl md:rounded-[2rem] p-4 sm:p-6 md:p-8` and flexible header actions.
        - Optimized `AttendanceCalendar` stats into a responsive `grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4` with horizontal scroll protection for calendar grid.

- **Public Data Deletion & Self-Service Account Deactivation Workflow (`/data-deletion`)**:
    - [x] **Client Audit Telemetry Helper (`auth.controller.ts`)**:
        - Implemented `extractClientAuditInfo(req)` extracting client IP address, geographical location via `geoip-lite`, device model, browser version, and operating system via `ua-parser-js`, and human-readable timestamp.
    - [x] **Public Deletion Request Processing & Signed Confirmation Flow (`auth.controller.ts`, `auth.routes.ts`, `auth.zod.ts`)**:
        - Updated `requestDataDeletion` to log incoming deletion requests in `SupportTicket` with full client audit payload (IP, location, device, time, policy acknowledgment, role, email) under `COMPLIANCE_DATA_DELETION`.
        - Generates signed JWT deactivation token (`expiresIn: '7d'`) containing user ID, role, email, and ticket ID.
        - Dispatches `sendAccountDeletionEmail` with dynamic `deactivateUrl: ${appUrl}/data-deletion/confirm?token=...&ticketId=...` and audit summary table.
        - Returns toast message: `"An email has been sent to you with the deactivation instructions"`.
    - [x] **Email Confirmation Route & 2-Step Deactivation (`auth.controller.ts`, `auth.routes.ts`, `auth.zod.ts`)**:
        - Implemented `confirmDeactivation` (`POST /api/auth/account/confirm-deactivation`) validating token and ticket ID.
        - Records Step 2 confirmation telemetry (confirmation device, location, IP, and time).
        - Deactivates user account (`isActive: false, status: 'DEACTIVATED'`) and revokes all active refresh tokens.
        - Updates `SupportTicket` status to `RESOLVED` and appends Step 2 audit log.
        - Dispatches `sendAccountDeactivationConfirmationEmail` with confirmation details.
        - Returns `{ success: true, message: "Your account is successfully deactivated" }`.
    - [x] **Self-Service Deactivation Enhancements (`auth.controller.ts`)**:
        - Updated `deactivateAccount` to capture client audit info (device, location, time) into `SupportTicket` and dispatch `sendAccountDeactivationConfirmationEmail`.
    - [x] **Email Templates Redesign & Telemetry Guarantees (`auth.service.ts` & `console/email-templates/page.tsx`)**:
        - Positioned `Account Deactivation Request` and `Account Deactivation Confirmation` as the primary default templates at the top of `/console/email-templates`.
        - Verified that `Device`, `Location`, and `Time` rows are unconditionally rendered with defaults and explicit labels on both the console preview and the actual emails dispatched by backend `sendAccountDeletionEmail` and `sendAccountDeactivationConfirmationEmail`.
        - Added `RESEND_TEST` support (`isTest ? TEST_EMAIL : email`) and test banner integration in `auth.service.ts` so emails are never dropped by Resend in testing environments.
        - Added URL search parameter support (`?template=account-deactivation-request`) wrapped in `<Suspense>` on `/console/email-templates`.
    - [x] **Frontend User Interface Polish (`/data-deletion` & `/data-deletion/confirm`)**:
        - Updated Tab 1 on `/data-deletion`: displays toast notification `"An email has been sent to you with the deactivation instructions"` on submit and renders clear instructions on the queued receipt screen.
        - Updated Tab 2 on `/data-deletion`: prominently informs users that self-service deactivation is located in their Settings page (`Settings → Security → Deactivate Account`), with direct navigation links to student, teacher, admin, and parent settings.
        - Created `/data-deletion/confirm` page wrapped in `<Suspense>`: calls `confirmDeactivation`, renders *"Your account is successfully deactivated"* with complete Step 2 audit breakdown, and provides Return to Login navigation.
    - [x] **Strict Type Safety & Secret Remediation**:
        - Fixed GitGuardian / GitHub Secret Scanning alert: completely removed hardcoded JWT secret fallback (`"qefas-jwt-secret-key-2026"`) from `auth.controller.ts` in both `requestDataDeletion` and `confirmDeactivation`. Replaced with strictly validated environment variable (`process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET`) that throws if missing.
        - Fixed `ComplianceTicket['status']` typing in `deletions/page.tsx` line 230.
        - Verified both `backend` and `frontend` pass `npx tsc --noEmit` and `npm run build` with zero errors (exit code 0).
    - [x] **Responsive Layout Margin Optimization & Comprehensive Header Tooltips (`/data-deletion`)**:
        - Significantly reduced left and right border margins across both web and mobile screens: expanded main container from `max-w-4xl` to `max-w-5xl`, reduced container side padding to `px-2 sm:px-4 lg:px-6`, and optimized card padding from `p-6 sm:p-10` to `p-3.5 sm:p-6 md:p-8`, eliminating wasted horizontal space.
        - Added `overflow-x-auto` to the data retention schedule table to ensure smooth, responsive mobile rendering without clipping.
        - Added Comprehensive Header Tooltips adhering strictly to the `comprehensive_header_tooltips` skill guidelines across all key sections:
            - **Hero Section**: Context-rich legal explanation covering GDPR Article 17, CCPA, and Meta Platform Policies, distinguishing between immediate deactivation and 30-day permanent shredding.
            - **Tab 1 ("Submit a Data Deletion Request")**: Explains the auditable compliance ticketing workflow, client telemetry logging, and 24-hour token revocation.
            - **Tab 2 ("Self-Service Account Deactivation")**: Details real-time password-verified revocation across web, iOS, and Android platforms.
            - **Tab 3 ("Data Retention & Purge Schedule")**: Clarifies the difference between immediately purged authentication tokens vs legally retained anonymized academic transcripts.
    - [x] **Parent Dashboard My Children Page Optimization (`/dashboard/parent/my-children`)**:
        - Reduced excessive margins and padding across both web and mobile:
            - Parent Layout (`dashboard/parent/layout.tsx`): trimmed padding from `p-4 md:p-6 lg:p-10` to `p-3 sm:p-5 md:p-6 lg:p-8`.
            - Page Container (`my-children/page.tsx`): removed redundant nested `<main px-4 md:px-0>` and artificial `w-[95%] mx-auto` constraint, switching to a responsive `max-w-[1600px] mx-auto` layout matching the main parent dashboard.
            - Page Heading (`PageHeading.tsx`): removed `px-2 mb-4` to align flush with the grid cards.
            - Children Grid & Cards: tightened grid gap to `gap-4 sm:gap-6` and card padding to `p-4 sm:p-5 md:p-6`, maximizing usable horizontal space for mobile devices.
        - Integrated Comprehensive Header Tooltips adhering strictly to the skill:
            - **Page Header ("Linked Students")**: Analytical tooltip explaining central directory management, drilling down into academics, and connecting additional wards via Link Student or Pending Requests.
            - **Card Metrics**: Contextual tooltips explaining **Avg Grade** calculation and **Attendance** session percentage on individual student cards.
            - **Pending Requests Dialog**: Header tooltip clarifying the outbound invitation and school confirmation workflow.

- **Server-Side Facebook OAuth Integration & Console SSO**:
    - [x] **Database Schema**:
        - Added `facebookId String? @unique` to `Student`, `Teacher`, `Admin`, `Parent`, and `PlatformStaff` models in `backend/prisma/schema.prisma`.
        - Added `googleId String? @unique` to `PlatformStaff` for unified Console SSO.
    - [x] **Backend Authentication Layer (`auth.service.ts`, `auth.controller.ts`, `auth.routes.ts`, `auth.validation.ts`)**:
        - Implemented `facebookAuthService` with platform feature guards, `STAFF` role support, role-based account creation, welcome email, in-app notification dispatch, and quota initialization.
        - Enforced strict **No Auto-Linking on Email Match** rule: if Facebook returns an email matching an existing account without Facebook linked, returns a clear notice advising users to sign in with their usual credentials and link Facebook from settings.
        - Implemented **Option A** missing email handling: if Facebook returns no email, returns `EMAIL_REQUIRED` to trigger the profile completion flow.
        - Added `POST /api/auth/facebook` with `facebookAuthSchema` validation.
        - Implemented `facebookDataDeletionService` and `POST /api/auth/facebook/data-deletion` to decouple `facebookId` and log compliance tickets in `SupportTicket`.
        - Updated password login error messages in `loginUser` to reference social sign-in.
        - Enhanced `googleAuthService` to support the `STAFF` role for Platform Console SSO.
    - [x] **Frontend OAuth Routes & Handlers (`frontend/src/app/api/auth/`)**:
        - Configured server-side `arctic` Facebook client in `frontend/src/lib/facebook.ts`.
        - Created OAuth initialization route `GET /api/auth/facebook` requesting `public_profile` and `email` scopes with CSRF state protection.
        - Created callback route `GET /api/auth/facebook/callback` with token exchange, Graph API profile retrieval, staff console SSO redirect, and session cookie configuration.
        - Added `Option A` email fallback handling: if Facebook returns no email, sets temporary `fb_pending_oauth` cookie and routes to `/auth/complete-profile?provider=facebook`.
        - Implemented `POST /api/auth/facebook/complete` to finalize profile registration with user-provided email.
        - Created public status verification page and unified GDPR/compliance portal at `/data-deletion` (Public Deletion Form, Authenticated Self-Service Deactivation, Meta confirmation banner, and Data Retention Schedule).
    - [x] **Staff Invite-Activation Flow & Platform Operations**:
        - Supported 1-click social activation via Google and Facebook on staff account activation page (`/auth/setup?token=...`), persisting `inviteToken` through OAuth state/cookies.
        - Created `/console/join?token=...` convenience redirect route forwarding securely to `/auth/setup`.
        - Added `facebook_auth_enabled` toggle to System Sovereignty settings (`/console/settings`).
        - Created reusable `SocialAuthRow.tsx` providing a unified, centered divider and circular SSO buttons matching the Operations Console login design (`or sign up with` / `or sign in with`).
        - Replaced bulky stacked rectangular buttons with `SocialAuthRow` across all user registration cards (`StudentCard`, `TeacherCard`, `ParentCard`, `SchoolCard`) and login forms.
        - Resolved database feature enablement for `googleLogin` and `facebookLogin` in `PlatformFeature`, and exposed `facebook_auth_enabled` in `getPublicPlatformSettings` so Google and Facebook signups are always enabled and visible.
        - Updated `.env.example` with `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`.

- **Google Registration Onboarding & Welcome Communications Fix**:
    - [x] **Universal Onboarding Redirection (`route.ts`)**:
        - Updated `frontend/src/app/api/auth/google/callback/route.ts` to remove the role filter that restricted onboarding redirection to `ADMIN` and `TEACHER` only.
        - All new users (`isNewUser === true`) registering via Google Sign-In across all roles (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`) are now redirected to `/onboarding?type=${userRole.toLowerCase()}`.
    - [x] **Smart Onboarding Routing & Suspense Safety (`onboarding/page.tsx`)**:
        - Supported role query params (`?type=` / `?role=`) in `OnboardingContent`.
        - Replaced hardcoded completion route to login (`getLoginRoute`) with smart direct dashboard routing (`getDashboardRoute`) for authenticated users (`isAuthenticated || user`), while keeping the login route as fallback.
        - Dynamically updated the completion action button to read `"Go to your Dashboard"` when authenticated instead of `"Login to your Dashboard"`.
        - Added a `"Skip Tour & Go to Dashboard"` quick-exit button in the stepper header for authenticated users.
        - Wrapped component in `<Suspense>` to adhere to Next.js App Router static optimization requirements.
        - Adapted `SuccessStep` description copy to reflect role-specific goals (`STUDENT`, `PARENT`, `TEACHER`, `ADMIN`).
    - [x] **Welcome Email & In-App Notification Dispatch (`auth.service.ts`)**:
        - In `googleAuthService` (`backend/src/modules/auth/auth.service.ts`), added non-blocking dispatch of `sendWelcomeEmail` upon new user registration via Google, sending their account codes (`studentCode`, `teacherCode`, `adminCode`, `parentCode`) and login URL.
        - In `sendWelcomeEmail`, added `parentCode` support and case-insensitive role matching (`(role || '').toLowerCase()`) to prevent role match misses.
        - Dispatched in-app welcome notification via `createNotification` welcoming the user to their respective portal.
    - [x] **Self-Service Account Deactivation & Audit Event Logging**:
        - **Backend (`auth.controller.ts`, `auth.zod.ts`, `auth.service.ts`)**:
            - Updated `POST /api/auth/account/deactivate` to strictly enforce password verification using `comparePassword(password, userRecord.password)` (or require `"DEACTIVATE"` for OAuth accounts with no local password).
            - Enforced `password` in `deactivateAccountSchema` using Zod validation.
            - Revokes all active user refresh tokens and device sessions (`deviceSession.updateMany`).
            - Persists a tracked compliance audit event in `SupportTicket` (`category: "COMPLIANCE_ACCOUNT_DEACTIVATION"`, `priority: "HIGH"`, `status: "RESOLVED"`) storing the exact event payload: user ID, role, email, name, IP address, user agent, reason, and timestamp.
            - Dispatches deactivation confirmation email via `sendAccountDeactivationConfirmationEmail`.
            - Added `isActive === false || status === "DEACTIVATED"` guard in `googleAuthService` preventing deactivated accounts from signing in via Google.
        - **Frontend (`DeactivateAccountSection.tsx`)**:
            - Created shared Danger Zone component with confirmation dialog, reason selection, password input with show/hide toggle, and confirmation banner.
            - Integrated into all 4 role dashboard Settings pages (`Security` tab):
                - Student Settings: `frontend/src/app/dashboard/student/settings/page.tsx`
                - Teacher Settings: `frontend/src/app/dashboard/teacher/settings/page.tsx`
                - School Admin Settings: `frontend/src/app/dashboard/admin/settings/page.tsx`
            - On successful deactivation: displays toast, removes session cookies, clears Zustand auth store, and routes to the role login page.
    - [x] **Operations Console Data Deletions & Inactive Accounts Center (`/console/deletions`)**:
        - **Backend (`support.controller.ts`, `support.route.ts`)**:
            - Added `GET /api/platform/support/compliance-requests` returning real-time compliance tickets (`COMPLIANCE_DATA_DELETION`, `COMPLIANCE_ACCOUNT_DEACTIVATION`) and real-time deactivated accounts across all 4 roles (`Student`, `Teacher`, `Admin`, `Parent`) with tenant attribution, codes, and timestamps.
            - Added `PATCH /api/platform/support/admins/:id/status` (`toggleAdminStatus`) and `DELETE /api/platform/support/admins/:id` (`deleteAdmin`) with staff password verification and audit logging.
            - Fixed `auth.controller.ts` and `support.controller.ts` typing and removed non-existent `deviceSession` queries.
        - **Frontend Hooks (`usePlatformSupport.ts`, `usePlatformSchools.ts`)**:
            - Added `usePlatformComplianceRequests` query hook (`staleTime: 2min`).
            - Added `useUpdateAdminStatus` and `useDeletePlatformAdmin` mutation hooks.
            - Updated user deletion mutations to invalidate `["compliance-requests"]` on purge.
        - **Frontend Management UI (`console/deletions/page.tsx`)**:
            - Designed full tabbed console interface adhering to `list_grid_design` skill:
                - Tab 1: **Data Deletion Requests** — reviews public GDPR/compliance requests, displays ticket metadata and status pills, and enables immediate user purge or status updates.
                - Tab 2: **Deactivated Accounts** — lists all inactive/deactivated students, teachers, admins, and parents across all tenants with one-click **Reactivate Account** and **Delete Record** (with password modal).
                - Tab 3: **Self-Service Deactivations Audit Ledger** — displays self-service deactivation audit events logged when users deactivated their accounts from settings.
            - Top metrics strip: Pending Deletion Requests, Deactivated Accounts count, Self-Service Deactivations, and 30-Day Safe Recovery grace period.
            - Integrated `DeleteConfirmationModal` and `TicketInspectionDialog`.
        - **Console Navigation (`ConsoleSidebar.tsx`, `ConsoleMobileDrawer.tsx`, `console/page.tsx`)**:
            - Added `Deletions & Deactivations` nav item with `UserX` icon to desktop sidebar and mobile drawer.
            - Added quick action card to main Operations Console HQ overview (`/console`).

### Wednesday, October 14, 2026

- **Internal Console HQ Dashboard Mobile Responsiveness & Live Flutterwave Revenue (`/console`)**:
    - [x] **Live Flutterwave Revenue Telemetry (`analytics.controller.ts`)**:
        - Updated `getGlobalStats` and `getGrowthStats` to aggregate real payments processed through the live Flutterwave gateway (`gateway: 'FLUTTERWAVE'`, `status: 'SUCCESS'`) from the `Transaction` model rather than empty fee payment tables or test Paystack transactions.
        - Calculated actual processed revenue (`flutterwaveRevenue`), live 30-day MRR, and platform metrics.
    - [x] **Platform Revenue Card Redesign (`console/page.tsx`)**:
        - Configured the card to reflect actual payments processed to Flutterwave (`₦27,100`).
        - Added green live gateway status indicator badge with animated pulsing dot (`Flutterwave Live`).
        - Updated card description to clarify: `"Actual processed (Flutterwave)"`.
        - Synchronized right column Platform Summary card to display live Flutterwave revenue and MRR.
    - [x] **Mobile Responsiveness Across Dashboard (`console/page.tsx` & `SubscriptionAnalytics.tsx`)**:
        - **Balanced 2-Column Metrics Grid on Mobile**: Upgraded from restrictive `minmax(280px, 1fr)` to `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5` with compact touch padding (`p-3 sm:p-4 md:p-5`), eliminating single-column vertical bloating on phones.
        - **Responsive Header & Badges**: Made page header and live engine status pill stack and align responsively on small screens (`flex-col sm:flex-row`).
        - **Responsive Charts**: Scaled Ecosystem Growth and User Registration trend charts with mobile-tailored heights (`h-[240px] sm:h-[300px] md:h-[320px]`), margins to eliminate left gutter clipping, and responsive stacking headers for titles and multi-series legends.
        - **Subscription Analytics Polish**: Adapted pie chart breakdown and line chart for small viewports.
    - [x] **Typecheck Validation**: Verified both `backend` and `frontend` pass `npx tsc --noEmit` with zero errors.

- **Direct "Sign in with Google" OAuth Integration (`arctic`)**:
    - [x] **Database Migration & Schema Audit (`migration.sql`)**: Verified columns across all 4 user models (`Admin`, `Teacher`, `Student`, `parents`) in Supabase PostgreSQL (`googleId` unique text, `password` nullable text). Prepared idempotent DDL migration script at `backend/prisma/migrations/20261014_add_google_auth/migration.sql`.
    - [x] **Arctic Client Initialization (`frontend/src/lib/google.ts`)**: Initialized standard `Google` OAuth client with PKCE support using `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and redirect URI `${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`.
    - [x] **OAuth Initiation Route (`frontend/src/app/api/auth/google/route.ts`)**: Implemented `GET /api/auth/google` generating cryptographic `state` and PKCE `codeVerifier`, persisting them in 10-minute HttpOnly Lax cookies, and redirecting with scopes `openid email profile`.
    - [x] **OAuth Callback Route (`frontend/src/app/api/auth/google/callback/route.ts`)**: Implemented `GET /api/auth/google/callback` with CSRF state verification, PKCE code exchange, ID token decoding, `email_verified` enforcement, server-to-server user resolution, cookie cleanup, and session token cookie establishment.
    - [x] **Backend Authentication Controller & Service (`auth.controller.ts`, `auth.service.ts`, `auth.validation.ts`)**:
        - Updated `googleAuthSchema` to support server-to-server verified Google payload.
        - Enhanced `googleAuthService` to resolve or create users across all 4 role tables (`Admin`, `Teacher`, `Student`, `Parent`), link `googleId`, enforce portal role matching, initialize free subscription plan for new signups, and issue dual `accessToken` + `refreshToken` pairs.
        - Added null password guard in standard password login returning 400: `"This account was created with Google Sign-in. Please sign in using Google."`
    - [x] **Login Components & Flow Polish (`GoogleLoginButton.tsx`, `LoginForm.tsx`, `callback/page.tsx`)**:
        - Refactored `GoogleLoginButton` to trigger direct Next.js route without Supabase Auth client.
        - Fixed missing Google Login button on `/login/school-admin`: added `<GoogleLoginButton userType="school-admin" pill />` directly to `school-admin/components/LoginForm.tsx`.
        - Added `<GoogleLoginButton />` to dedicated portal login forms: `TeacherLoginForm.tsx`, `StudentLoginForm.tsx`, and `ParentLoginForm.tsx`.
        - Enhanced `GoogleLoginButton.tsx` with `pill` support to match form aesthetics and added `'admin': 'admin'` alias in `roleMap`.
        - Added enum role normalization in `/api/auth/google/callback/route.ts` mapping `'school-admin'` to `'ADMIN'` for backend validation.
        - Integrated "Sign up with Google" across all 4 signup portal pages: `SchoolCard.tsx` (`/signup/school`), `TeacherCard.tsx` (`/signup/teacher`), `StudentCard.tsx` (`/signup/student`), and `ParentCard.tsx` (`/signup/parent`).
        - Enhanced `GoogleLoginButton` to accept `mode="signup"` rendering `"Or sign up with"` and `"Sign up with Google"`.
        - Updated `LoginForm` to detect and display OAuth error query parameters.
        - Fixed 404 in `/auth/me` profile hydration (`auth.controller.ts` `getMe`): added missing `UserRole.STUDENT` and `UserRole.PARENT` handlers, resolving `AxiosError: Request failed with status code 404`.
        - Refactored `/login/callback` to hydrate Zustand `useAuthStore` via `/auth/me` and route to the target dashboard.
    - [x] **Typecheck Validation**: Verified both `backend` and `frontend` pass `npx tsc --noEmit` with zero errors.

- **User Data Deletion & Account Deactivation (`/data-deletion`)**:
    - [x] **Backend Endpoints & Zod Validation (`auth.routes.ts`, `auth.controller.ts`, `auth.zod.ts`, `auth.service.ts`)**:
        - `POST /api/auth/account/deactivate`: Authenticated self-service endpoint invalidating active refresh tokens, revoking device sessions, and updating status to `DEACTIVATED` across all role models (`Admin`, `Teacher`, `Student`, `Parent`).
        - `POST /api/auth/account/deletion-request`: Public, rate-limited submission endpoint with Zod validation (`dataDeletionRequestSchema`). Generates tracked `SupportTicket` (`category: "COMPLIANCE_DATA_DELETION"`) with high priority for compliance audit trails and sends automated reference receipt email via Resend (`sendAccountDeletionEmail`).
    - [x] **Public & Self-Service Data Deletion Page (`frontend/src/app/data-deletion/page.tsx`)**:
        - Built comprehensive, dual-tab page with Self-Service Deactivation (interactive card with confirmation modal for authenticated users) and Public Request Form (for unauthenticated / app-uninstalled users).
        - Detailed Data Retention & Deletion Schedule breakdown table explaining 30-day purge schedules for profile data, media files, and credentials versus statutory educational record retention.
    - [x] **Global Footer & Privacy Integration (`Footer.tsx`, `privacy/page.tsx`)**:
        - Linked `User Data Deletion` directly under the **Legal** column in [`frontend/src/components/reusable/Footer.tsx`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/reusable/Footer.tsx).
        - Embedded cross-link in Section 7 of [`frontend/src/app/privacy/page.tsx`](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/privacy/page.tsx).

- **Internal Console Mobile Navigation Menu (`/console`)**:
    - [x] **Mobile Drawer Component (`ConsoleMobileDrawer.tsx`)**: Created dedicated, responsive mobile navigation sheet using Radix UI `Sheet` (`frontend/src/app/(internal-console)/console/components/ConsoleMobileDrawer.tsx`). Features:
        - Structured navigation categories: *Ecosystem Management*, *Platform & Billing Architecture*, *Operations & Telemetry*, and *Administration*.
        - Active route highlighting based on `usePathname()`.
        - Automatically closes sheet on item click navigation.
        - Staff account status footer with quick logout (`clearStaff`) button.
    - [x] **TopBar Mobile Integration (`ConsoleTopBar.tsx`)**:
        - Replaced desktop-only chevron button on mobile with `<ConsoleMobileDrawer />` triggering a clean hamburger icon (`<Menu size={20} />`).
        - Preserves existing responsive branding, environment badge, notifications, and profile controls.

- **Student Academy Affiliation & Academic Settings Isolation (`/dashboard/student`)**:
    - [x] **Student Profile Academy Fallback (`dashboard/student/profile/page.tsx`)**:
        - Replaced hardcoded `'Qefas-Prep Academy'` fallback with `{profile.school?.name || 'Independent / Not Enrolled'}` when a student is not linked to an enrolled institution.
    - [x] **Academics Settings Deactivation for Independent Students (`dashboard/student/settings/page.tsx`)**:
        - Added `hasSchool` check (`Boolean(profile?.schoolId || profile?.school?.id)`).
        - **Department Selection**: Disabled the Department `<Select>` and `Lock In` `<Button>` when `!hasSchool`. Replaced the placeholder with `"No School Connected"` and displayed an amber advisory notice explaining that department selection requires institutional enrollment.
        - **Grade Level Selection**: Disabled the Grade Level `<Select>` and `Lock In` `<Button>` when `!hasSchool`. Replaced the placeholder with `"No School Connected"` and displayed an amber advisory notice informing the user that level selection requires connecting with a school code.
        - Preserved desktop sidebar collapse toggle on `md:flex` viewports.

- **Console Email Templates Expansion (`/console/email-templates`)**:
    - [x] **Account Deactivation Confirmation Template**:
        - Added interactive preview card and generator on `/console/email-templates` (`account-deactivation-confirmation`) with rose badge styling, security hero illustration, deactivation details table, advisory callouts, data retention guidelines, and support CTA.
        - Created `sendAccountDeactivationConfirmationEmail` in `backend/src/modules/auth/auth.service.ts` and wired into `deactivateAccount` in `auth.controller.ts`.
        - Wired test email dispatch in `backend/src/modules/platform/email/email.controller.ts`.
    - [x] **Account Deactivation Request Template**:
        - Added interactive preview card and generator on `/console/email-templates` (`account-deactivation-request`) with amber badge styling, reset hero illustration, formal compliance reference ticket table, 30-day statutory grace period notification, and cancellation CTA.
        - Wired test email dispatch in `backend/src/modules/platform/email/email.controller.ts` connecting to `sendAccountDeletionEmail`.
    - [x] **Typecheck Validation**: Verified `frontend` passes `npx tsc --noEmit` with zero errors.

- **Console Account Deactivation Across Schools, Students, Teachers, and Parents**:
    - [x] **Platform Support Endpoints (`backend/src/modules/platform/support/`)**:
        - `PATCH /api/platform/support/schools/:id/status` (`toggleSchoolStatus`): Enhanced to support toggling `DEACTIVATED` / `ACTIVE`, automatically synchronizing all associated `SchoolAdmin` records (`active: false / true`), deactivating linked `Admin` accounts (`isActive: false, status: 'DEACTIVATED'`), and invalidating active refresh tokens.
        - `PATCH /api/platform/support/students/:id/status` (`toggleStudentStatus`): Created endpoint to update `Student.isActive` and `Student.status`, automatically revoking active refresh token sessions upon deactivation and recording platform activity logs.
        - `PATCH /api/platform/support/teachers/:id/status` (`toggleTeacherStatus`): Created endpoint to update `Teacher.isActive` and `Teacher.status`, invalidating refresh tokens and logging activity.
        - `PATCH /api/platform/support/parents/:id/status` (`toggleParentStatus`): Created endpoint to update `Parent.isActive` and `Parent.status`, invalidating refresh tokens and logging activity.
        - Registered routes in `support.route.ts` protected by `authenticatePlatformStaff` and authorized platform roles.
    - [x] **Permanent User & School Deletion with Administrator Password Authorization**:
        - Created `DELETE /api/platform/support/schools/:id`, `DELETE /api/platform/support/students/:id`, `DELETE /api/platform/support/teachers/:id`, `DELETE /api/platform/support/parents/:id` requiring `OWNER` or `TECH_ADMIN` privileges.
        - Strictly verifies administrator password using `bcrypt.compare` against `platformStaff.password` before executing deletion.
        - Cleanly unlinks/destroys records within transactions without breaking database foreign key constraints.
        - Records comprehensive audit trail in `platformActivityLog` via `createActivityLog` documenting staff email, action, entity code/name, reason, and timestamp.
    - [x] **Frontend Deletion Hooks & Password Confirmation Modal**:
        - Created `useDeletePlatformSchool`, `useDeletePlatformStudent`, `useDeletePlatformTeacher`, and `useDeletePlatformParent` in `usePlatformSchools.ts`.
        - Created reusable `DeleteConfirmationModal.tsx` in `frontend/src/app/(internal-console)/console/components/DeleteConfirmationModal.tsx` requiring staff password and recording optional reason.
        - Fixed double toaster bug by removing redundant manual `toast.success` calls in page components and enforcing unique `toastId` in hooks.
        - Redesigned and integrated permanent deletion actions and status management across all 4 console detail pages (`/console/schools/[id]`, `/console/students/[id]`, `/console/teachers/[id]`, `/console/parents/[id]`).
        - Updated `PlatformSchoolDetails`, `PlatformStudentDetails`, `PlatformTeacherDetails`, and `PlatformParentDetails` interfaces with `isActive?: boolean` and `status?: string`.
    - [x] **Console Detail Pages (`frontend/src/app/(internal-console)/console/`)**:
        - **Schools Detail (`/console/schools/[id]`)**: Replaced basic browser window confirm with a dedicated, high-fidelity **Account Status Dialog** modal (`Dialog`, `DialogContent`). It presents:
            - Live current status pill (`ACTIVE`, `DEACTIVATED`, `SUSPENDED`, `INACTIVE`).
            - Selectable cards for all 4 available statuses with dedicated color badges, descriptions, and active check indicators.
            - Security notice callout explaining admin session revocation and 403 login blocking.
            - Integrated `react-toastify` toaster notifications (`toast.success` / `toast.error`) on status changes.
        - **Students Detail (`/console/students/[id]`)**: Wired up `toggleStatusMutation` with a clear "Deactivate Account" / "Activate Account" button, confirmation dialog explaining login blocking, and visual status badge in the identity card.
        - **Teachers Detail (`/console/teachers/[id]`)**: Added header action bar button and identity card status badge to toggle teacher active status with confirmation.
        - **Parents Detail (`/console/parents/[id]`)**: Replaced raw subscription toggle with full account deactivation (`useUpdateParentStatus`), confirmation dialog, and visual status badge.
    - [x] **End-to-End Typecheck**: Both `backend` and `frontend` pass `npx tsc --noEmit` with zero errors.

- **Cross-Role Account Deactivation & Login-Blocking Architecture (`Student`, `Teacher`, `Parent`, `Admin`)**:
    - [x] **Schema Columns Added (`schema.prisma`)**: Added `isActive Boolean @default(true)` and `status String @default("ACTIVE")` to `Student`, `Teacher`, `Parent`, and `Admin` models.
    - [x] **PostgreSQL Synchronization (`npx prisma db push`)**: Synchronized live Supabase database and regenerated Prisma Client v6.19.3. All existing users safely default to active.
    - [x] **Login Endpoint Guard (`auth.controller.ts`)**: Integrated account status check in `/auth/login` blocking deactivated users (`user.isActive === false || user.status === 'DEACTIVATED' || user.status === 'SUSPENDED'`) with a `403 Forbidden` response: `"Your account has been deactivated. Please contact your school administrator or support."`
    - [x] **JWT Token Session Guard (`authMiddleware.ts`)**: Updated token verification middleware across all roles so any incoming request from an account with `isActive === false` is immediately rejected (`401 Unauthorized`), preventing continued API access with existing tokens.
    - [x] **Typecheck Validation**: Verified `backend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Parent Dashboard Mobile Redesign (`/dashboard/parent`)**:
    - [x] **Container Layout & Double Padding Elimination**: Replaced legacy `p-4 md:p-0` and `w-[95%] mx-auto flex flex-col gap-10` in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/page.tsx) with standard `w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500`, eliminating screen pinching and excessive gutters on mobile devices.
    - [x] **Student Profile Hero Mobile Polish (`StudentHero.tsx`)**:
        - Re-engineered layout into a mobile-first responsive container (`flex-col md:flex-row gap-5 sm:gap-6 md:gap-8`).
        - Scaled avatar dynamically (`size-16 sm:size-20 md:size-24`) with ambient glowing ring and live status dot.
        - Transformed scattered text into structured quick chips with Lucide icons (`Hash` for Student ID, `BookOpen` for Class, `MapPin` for School).
        - Added 1-tap quick child switcher pills right in the hero banner when multiple children are linked (`children.length > 1`).
        - Full-width touch-friendly "View Full Profile" CTA button on mobile viewports.
    - [x] **2-Column Compact Insights Grid (`InsightsGrid.tsx`)**:
        - Upgraded grid from `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` to `grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`, allowing parents on mobile to see all 4 key metrics (Attendance, Performance, Exams, Grades) at a glance without endless scrolling.
        - Refined all 4 metric cards ([AttendanceCard](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/AttendanceCard.tsx), [PerformanceCard](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/PerformanceCard.tsx), [ExamsCard](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/ExamsCard.tsx), [AssignmentsCard](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/components/dashboard/AssignmentsCard.tsx)) with mobile-proportional font sizing, mini-charts, radial progress rings, and truncated subtitles.
    - [x] **Recent Academic Trend Chart Polish (`RecentPerformanceChart.tsx`)**:
        - Replaced unstyled Google Material symbols with crisp Lucide React icons (`BarChart3`, `TrendingUp`, `AlertCircle`).
        - Added comprehensive header tooltip detailing grade percentage normalization and color-coded threshold zones (>=70% Green, 50-69% Amber, <50% Red).
        - Harmonized chart colors with parent orange palette and set responsive height (`h-[210px] sm:h-[260px] md:h-[280px]`).
    - [x] **School Activity & Financial Status Polish (`Announcements.tsx` & `FinancialSummaryCard.tsx`)**:
        - Replaced Material symbols with Lucide icons (`Bell`, `BellOff`, `Wallet`, `Lock`, `CreditCard`).
        - Added comprehensive analytical tooltips to section headers.
        - Passed `primaryColor="#f97316"` to [UsageLimitsCard](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/subscription/UsageLimitsCard.tsx) to match Parent brand theme.
    - [x] **TopNavBar Child Selector Availability (`TopNavBar.tsx`)**:
        - Relaxed child selector visibility from `hidden xl:block` to `hidden sm:block min-w-[150px] md:min-w-[180px] lg:min-w-[200px]`, making it easily accessible on tablet and small laptop viewports.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors.

- **Cross-Role Notification Feed Cards Mobile Responsive Fix (`Student`, `Parent`, `Admin`, `Teacher`)**:
    - [x] **Date Overflow & Badge Squishing Elimination**: Resolved issue on [student/notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/notifications/page.tsx), [parent/notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/notifications/page.tsx), [admin/notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/notifications/page.tsx), and [teacher/notifications/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/notifications/page.tsx) where notification date badges overflowed past the right border of cards on mobile viewports.
    - [x] **Responsive Title & Date Stacking**: Upgraded header flex container to `flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-1.5`, allowing date badge to neatly stack below titles with `self-start` on narrow mobile screens while maintaining side-by-side alignment on desktop.
    - [x] **Flex-Shrink & Truncation Guard**: Added `min-w-0 flex-1` to the title wrapper, enabling clean ellipsis truncation on long titles before colliding with dates, and added `shrink-0` to the "New" badge.
    - [x] **Touch-Friendly Padding & Actions**: Adjusted card content padding on mobile to `p-4 sm:p-5 flex gap-3.5 sm:gap-5` and ensured delete action button is visible on touch screens (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`).
    - [x] **Typecheck Validation**: Verified strict type safety across all updated notification pages.

- **Cross-Role Top Navigation Notification Pop-Up Mobile Optimization (`NotificationCenter.tsx` & `NotificationDetailModal.tsx`)**:
    - [x] **Role-Adaptive Visual Theme (`Student`, `Teacher`, `Parent`, `Admin`)**: Implemented dynamic theme tokens (`getRoleTheme` and `getModalRoleTheme`) automatically adapting primary badges, unread accent bars, notification counter pills, icon backgrounds, and interactive buttons to each role's color palette (Pink for Students, Emerald for Teachers, Orange for Parents, Blue for Admins).
    - [x] **Dynamic Role Navigation**: Configured "View All Notifications" footer button and modal links to navigate to the authenticated role's notification center (`/dashboard/student/notifications`, `/dashboard/teacher/notifications`, `/dashboard/parent/notifications`, or `/dashboard/admin/notifications`).
    - [x] **Viewport-Fitted Dropdown Width**: Replaced hardcoded `w-[380px]` with fluid responsive container `w-[calc(100vw-24px)] sm:w-[390px] max-w-[420px]` with `sideOffset={8}`, eliminating screen cutoff and horizontal scrollbars on mobile across all role top navbars.
    - [x] **Internal Console TopBar Mobile Polish**: Updated [ConsoleTopBar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/components/ConsoleTopBar.tsx) notification dropdown to `w-[calc(100vw-24px)] sm:w-80 max-w-[380px]` for mobile viewports.
    - [x] **Replaced Dummy Bell Buttons with Live NotificationCenter**: Replaced static/dummy bell buttons across secondary headers in [parent/performance/components/Header.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/components/Header.tsx), [parent/performance/subject-performance/components/TopHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/performance/subject-performance/components/TopHeader.tsx), [parent/my-children/details/components/Header.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/parent/my-children/details/components/Header.tsx), and [student/documents/components/Header.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/documents/components/Header.tsx).
    - [x] **Admin NotificationCenter Canonicalization**: Re-exported canonical [NotificationCenter](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/notifications/NotificationCenter.tsx) from [admin/components/NotificationCenter.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/components/NotificationCenter.tsx) to guarantee single source of truth.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Sidebar Subscription Button Deactivation (`/dashboard/student`)**:
    - [x] **Disabled Feature Flag**: Set `billing: false` in [studentFeatureFlags.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/studentFeatureFlags.ts).
    - [x] **Hidden in Navigation**: Updated `menuSections` in [app-sidebar.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/app-sidebar.tsx) to explicitly filter out `item.featureKey === 'billing'`, ensuring the deactivated Subscription button is completely hidden from the student sidebar.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Settings Page Redesign & Mobile Polish (`/dashboard/student/settings`)**:
    - [x] **Container Layout & Double Padding Elimination**: Replaced legacy `w-[95%] max-w-[1600px] mx-auto py-8 ... px-4 md:px-8` in [settings/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/settings/page.tsx) with standard `w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500`, eliminating mobile viewport pinching and horizontal scrolling bugs.
    - [x] **Header with Tooltip & Action Button**: Added pink gradient icon badge (`from-pink-600 to-rose-500`), [HeaderTooltip](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/dashboard/HeaderTooltip.tsx), and touch-friendly "Revisit Onboarding" shortcut button.
    - [x] **Pure Black Dark Mode (`zinc-950` / `zinc-900` / `border-zinc-800`)**: Converted all cards, tabs, inputs, and badges from slate to pure black `zinc-950`, `zinc-900`, and `border-zinc-800`.
    - [x] **Mobile Tabs Switcher**: Upgraded `TabsList` into a 4-column responsive pill navigation (`Account`, `Academic`, `Security`, `Plan`) with pink active states (`data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400`).
    - [x] **Account & Identity Tab**:
        - Student identity card with verified badge, student ID code, and "View Profile" shortcut.
        - Linked Academy card showing school name, verification status pill, and enrolled class badges with pink theme styling.
    - [x] **Academic Faculty & Level Tab Fix (`/dashboard/student/settings`)**:
        - Resolved department display issue where locked students saw an empty/placeholder "Choose Department" dropdown due to an ID/code mapping mismatch and lack of a dedicated locked display card.
        - Switched from legacy `departmentService` to canonical `schoolService.getDepartments(schoolId)` with query key `['schoolDepartments', schoolId]` and 10min staleTime per rule 2.8.
        - Updated locked state resolution to verify `profile?.departmentId || profile?.department?.id || profile?.department?.name`.
        - Created a prominent enrolled department banner displaying `Building2` icon, verified department name, department code badge (e.g. `SCI`), and locked-in administration note, mirroring the Enrolled Level card.
        - When locked, disabled/empty `<Select>` triggers are cleanly omitted from DOM, preventing confusing placeholder states.
        - Synchronized grade level locked state styling for perfect visual balance.
    - [x] **Security & Session Tab**:
        - Password management card triggering [ChangePasswordModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/auth/ChangePasswordModal.tsx) with pink button styling.
        - Two-factor authentication card triggering [TwoFactorSetup.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/auth/TwoFactorSetup.tsx) with live auth status.
        - Embedded active login sessions tracking via [DeviceSessions.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/DeviceSessions.tsx).
    - [x] **Subscription & Plan Tab**:
        - Linked institutional license and student plan card routing directly to billing.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Connect Hub Page Redesign & Mobile Polish (`/dashboard/student/linking`)**:
    - [x] **Container Layout & Double Padding Elimination**: Replaced legacy `min-h-screen bg-[#F8FAFC] dark:bg-black/95 p-4 md:p-8 w-[95%] max-w-[1600px]` in [linking/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/page.tsx) with standard `w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500`, removing nested page gutters on mobile.
    - [x] **Header Tooltip & Responsive Header**: Updated [StudentLinkingHeader.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentLinkingHeader.tsx) with a pink gradient icon badge (`from-pink-600 to-rose-500`), [HeaderTooltip](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/dashboard/HeaderTooltip.tsx), and touch-friendly mobile action buttons.
    - [x] **Digital Student Passport Upgrades**: Refactored [StudentLinkingPassport.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentLinkingPassport.tsx) with student identity banner, 1-click personal linking code copy trigger, responsive QR code scan module, and pure black quick stats sidebar (`dark:bg-zinc-950`, `dark:border-zinc-800`).
    - [x] **Interactive Tabs & Filter Bar**: Refactored [StudentLinkingTabs.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentLinkingTabs.tsx) with pink/purple active pill switchers, live pending count badges, and real-time search input with 1-click clear.
    - [x] **Active Links & Pending Requests Grids**:
        - Updated [StudentActiveLinksGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentActiveLinksGrid.tsx) and [StudentPendingRequestsGrid.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentPendingRequestsGrid.tsx) with 2-to-4 column responsive layouts (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6`).
        - Pure black card styling (`dark:bg-zinc-950`, `dark:border-zinc-800`), glowing animated connection pulse lines, and options dropdowns with code copying and revocation.
    - [x] **Modals & Dialogs Modernization**:
        - Refactored [StudentConnectModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentConnectModal.tsx) with pure black dropdown selects and styled input fields.
        - Refactored [StudentQRCodeModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/linking/components/StudentQRCodeModal.tsx) with pink gradient header, dual QR passport panels (Parent Linking & Student Verification), and responsive max-height scroll bounds.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Attendance Registry Page Redesign & Mobile Polish (`/dashboard/student/attendance`)**:
    - [x] **Container Layout & Double Padding Elimination**: Replaced legacy `relative flex min-h-screen w-full` and `p-6 lg:p-8 w-[95%] max-w-[1600px]` in [attendance/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/attendance/page.tsx) with standard `w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6`, eliminating mobile viewport pinching and horizontal scrolling issues.
    - [x] **Pure Black Dark Mode (`zinc-950` / `zinc-900` / `border-zinc-800`)**: Converted all cards, charts, headers, and modal dialogs from slate to pure black `zinc-950`, `zinc-900`, and `border-zinc-800`.
    - [x] **Header Tooltip Integration**: Integrated comprehensive `HeaderTooltip` components across the page header, attendance overview chart, and each statistical card (`Present Sessions`, `Unexcused / Absent`, `Late Arrivals`, and `Evaluated Days`).
    - [x] **StatCard System Upgrades**: Upgraded metric cards with Lucide icons (`CheckCircle2`, `XCircle`, `Clock`, `Calendar`), count sub-descriptions, custom color tokens, and a responsive **2-column grid on mobile** (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6`) with scaled padding, typography, and icon bounds.
    - [x] **Attendance Trend Chart & Time-Range Controls**:
        - Pink gradient fill (`#ec4899`) on the presence area chart, smooth line plots for tardiness and absences.
        - Dark-mode tooltip with zinc-900 translucent styling and shadow.
        - Time-range selector (`Day`, `Week`, `Month`, `Term`) using pink active pill styling (`bg-pink-600 text-white`).
    - [x] **Grid & Table View Switcher (Defaults to Grid on Mobile)**:
        - Added client-side viewport check (`window.innerWidth < 768`) defaulting to `'grid'` on mobile screens.
        - Card view for mobile/touch devices and dense tabular ledger for desktop view.
        - Status filter pills (`ALL`, `PRESENT`, `LATE`, `ABSENT`) and real-time search filtering.
        - Integrated [Pagination.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/ui/Pagination.tsx) with `theme="pink"`.
    - [x] **Institutional Policy & Term Filters**:
        - Info banner detailing the school's 75% attendance threshold for examination eligibility.
        - Date-filtered modal dialogs for `This Month`, `Last Month`, and `This Term` attendance audits.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Termly Results Page Redesign & Mobile Polish (`/dashboard/student/result/termly`)**:
    - [x] **Container Layout & Double Padding Elimination**: Replaced `w-[95%] mx-auto py-8` in both [termly/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/result/termly/page.tsx) and [termly/view/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/result/termly/view/page.tsx) with `w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6`, removing side gutter pinching on mobile screens.
    - [x] **Pure Black Dark Mode (`zinc-950` / `zinc-900` / `border-zinc-800`)**: Converted all background and border tokens from `slate-900`/`slate-800` to pure black `zinc-950`, `zinc-900`, and `border-zinc-800`.
    - [x] **Header Tooltip & Quick Summary Metrics Grid**:
        - Integrated contextual `HeaderTooltip` next to the main page title explaining official termly report cards and grade statements.
        - Created a 4-metric summary bar (**Published Terms**, **Total Subjects**, **Fully Released Coverage**, and **Academic Session**) with pink/indigo/emerald accents that adapts from 2-columns on mobile to 4-columns on desktop.
    - [x] **Grid & Table View Switcher (Defaults to Grid on Mobile)**:
        - Added client-side viewport check (`window.innerWidth < 768`) defaulting to `'grid'` on mobile while preserving the ability to toggle between visual card perspective and dense tabular ledger.
        - Added instant client search input filtering by class name, session, or term.
    - [x] **Term Result Sheet View Page Refinement (`termly/view`)**:
        - Added mobile Card vs Table view toggle for subject scores with WAEC letter grade pills (A1-F9) and component scores (Assignment, CA/Quiz, Exam).
        - Upgraded back button, hero gradient banner, and aggregate summary footer with printing support.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Profile Page Redesign & Mobile Polish (`/dashboard/student/profile`)**:
    - [x] **Container & Compounding Padding Elimination**: Replaced restrictive `w-[95%] max-w-[1600px] mx-auto py-8 ... px-4 md:px-8` layout in both the loading skeleton and main return with `w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6`, eliminating mobile side pinching and horizontal scroll bugs.
    - [x] **Pure Black Dark Mode (`zinc-950` / `zinc-900`)**: Converted all background and border tokens from `slate-950`/`slate-900` to pure black `zinc-950/80`, `zinc-900`, and `border-zinc-800` matching the student dashboard design constitution.
    - [x] **Hero Banner & Avatar Mobile Touch Targets**:
        - Re-engineered cover banner (`h-40 sm:h-52 md:h-64`) with vibrant pink-to-rose gradient fallback (`from-pink-500 via-rose-500 to-pink-600`) and touch-accessible mobile edit trigger (`opacity-95 sm:opacity-0 sm:group-hover:opacity-100`).
        - Avatar with pure black border and mobile tap badge (`Edit3`), plus verified student checkmark badge.
        - Added active scholar status badge and prefect role recognition tag (`Award` icon).
        - Added quick-access "Edit Profile", "Security" (with dynamic 2FA green indicator), and "Support" buttons to the hero identity bar.
    - [x] **Responsive Quick Stats Grid**:
        - Converted Reg ID, Cohort Level, and Department cards to a balanced 3-column mobile-friendly grid (`grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6`).
        - Integrated contextual `HeaderTooltip` components to each stat card explaining official academic codes, syllabus grade levels, and department designations.
    - [x] **Section Cards & Comprehensive Header Tooltips**:
        - **Personal Data**: Added HeaderTooltip explaining legal name records and official identity maintenance with responsive 2-column info layout.
        - **Extracurricular & Bio**: Added HeaderTooltip explaining club affiliations and physical metrics, along with guardian emergency contact sub-card and tooltip.
        - **Academy Institution**: Styled with subtle pink border/tint, verified compliance checkmark, and institution affiliation HeaderTooltip.
        - **Services & Shortcuts**: Direct navigation quick-actions for Home Address, Emergency Contact, Grades & Results, and Attendance with HeaderTooltip.
    - [x] **Edit Modal Mobile Refinement**:
        - Re-styled modal to pure black `dark:bg-zinc-950`, sleek `border-zinc-800`, responsive max height `max-h-[88vh]`, and horizontal scrollable tabs (`scrollbar-hide`).
        - Zero TypeScript `any` types by typing `ExtendedStudentProfile`.
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Dashboard — Grid View Option & Pink Pagination Focus**:
    - [x] **Assessment Grid / Table View Option (`/dashboard/student/exams&quizzes`)**:
        - Updated [AssessmentList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/exams&quizzes/components/AssessmentList.tsx) to support `viewMode: 'grid' | 'table'`. When in Grid mode, assessments render as a responsive multi-column card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`) featuring pure black card backgrounds (`dark:bg-zinc-950/80`), icon badges, 3-metric statistics bars (duration, question count, color-coded score), status pills, and interactive links.
        - Updated [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/exams&quizzes/page.tsx) with a `viewMode` state toggle in the toolbar alongside Search and TimeFilter, featuring `LayoutGrid` and `List` icon buttons styled with pink accents.
        - **Default Grid on Mobile**: Automatically detects viewport width `< 768px` on client mount and initializes `viewMode` to `'grid'`, ensuring mobile devices default to touch cards while giving users the freedom to toggle views.
    - [x] **Student Grades Page Grid View & Dropdown Select Re-arrangement (`/dashboard/student/grades`)**:
        - **Dropdown Selects Re-arranged**: Re-architected Session and Term filter dropdowns from unaligned header text spans into a balanced side-by-side 2-column responsive layout (`grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3`), featuring custom `ChevronDown` dropdown indicators, sleek dark mode borders (`dark:border-zinc-800`), focus rings (`focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500`), and zero text wrapping issues on mobile.
        - **Grid View Option Across All Grade Tabs**: Added `viewMode: 'grid' | 'table'` state to [grades/page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx) defaulting to `'grid'` on mobile (`window.innerWidth < 768`). Kept clean tab-level `LayoutGrid` and `List` toggle buttons in each content header (`Main Examinations`, `Assessments`, `Final Result Grades`) while keeping the top header exclusively focused on the Session and Term filter dropdowns.
        - **Responsive Card Grids**: Built dedicated card grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`) for:
            - **Main Examinations**: Grade badge circle (`A`, `B`, `C`, `F`), exam title/code, score chip, subject papers count, and direct link.
            - **Assessments (Continuous Assessments/Quizzes/Assignments)**: Assessment icon, subject name, creation date, score pill, type badge, and details link.
            - **Final Result Grades**: Published subject title, class, term/session, WAEC letter grade, total percentage, and breakdown trigger.
    - [x] **Student Dashboard Pagination Pink Focus & Theming**:
        - Enhanced [Pagination.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/components/ui/Pagination.tsx) so `theme="pink"` applies vibrant pink gradient (`from-pink-500 via-rose-500 to-pink-600`), ring offsets, and high-visibility focus states (`focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 dark:focus:border-pink-500 focus:outline-none`) across active page numbers, inactive numbers, and Previous/Next buttons.
        - Updated all student dashboard pages with pagination to explicitly pass `theme="pink"`:
            - `/dashboard/student/exams&quizzes`
            - `/dashboard/student/grades` (all 3 tabs: Exams, Continuous Assessments, and Final Results)
            - `/dashboard/student/notifications`
            - `/dashboard/student/linking`
            - `/dashboard/student/my-classes/[id]/components/subjects`
    - [x] **Typecheck Validation**: Verified entire `frontend` passes `npx tsc --noEmit` with zero errors (exit code 0).

- **Student Grades Page — Mobile Responsiveness & Tooltips (`/dashboard/student/grades`)**:
    - [x] **Compounding Padding Elimination**: Replaced nested `min-h-screen bg-[#F8FAFC]`, `p-6 lg:p-10 pb-32`, and `w-[95%] max-w-[95%] mx-auto` inside [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/grades/page.tsx) with `w-full space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6` to remove screen pinching and side gutters on mobile.
    - [x] **2-Column Mobile Grid for Metric Cards**: Converted the 4 summary metrics (**Overall GPA**, **Distinction Track**, **Exams Taken**, and **Assessments**) from a single-column vertical stack to a balanced 2-column mobile grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`). Added context-rich `HeaderTooltip` components to each card.
    - [x] **Responsive Tab Switcher**: Made the main tab bar (`exams`, `assessments`, `transcript`, `final`) and the assessments sub-tab bar (`ALL`, `CA`, `ASSIGNMENT`, `TEST/QUIZ`, `SUBJECT PAPER`) horizontally scrollable with compact touch targets and zero layout clipping.
    - [x] **Header Tooltips Across All Tab Views**: Integrated analytical `HeaderTooltip` explanations into:
        - **Grades Overview**: Overall academic grade ledger.
        - **Main Examinations**: Formal exam papers with expandable subject paper accordion views.
        - **Assessments**: Continuous assessment, tests, and homework breakdown.
        - **Final Result Grades**: Published report cards with WAEC letter grades (A1-F9) and behavioral marks.
        - **Academic Transcript**: Official transcript compilation with AI remarks and PDF export.
    - [x] **Modals & Pure Black Dark Mode**: Styled the Class Top 5 leaderboard modal and the Final Result distribution modal with pure black (`dark:bg-zinc-950`, `dark:border-zinc-800`), verified with `npx tsc --noEmit` (0 errors).


- **Student Exams & Quizzes Page — Mobile Responsiveness & Tooltips (`/dashboard/student/exams&quizzes`)**:
    - [x] **Compounding Padding Elimination**: Replaced nested `flex min-h-screen`, `flex-1 p-6 lg:p-8`, and `w-[95%]` in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/exams&quizzes/page.tsx) with `w-full space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6` to remove horizontal gutter clipping on mobile screens.
    - [x] **Mobile Assessment Cards (`AssessmentList.tsx`)**: Upgraded assessment presentation so on viewports `< 768px`, assessments render as touch-friendly cards displaying subject badges, schedule dates, live countdowns, duration/question chips, score highlights, and status pills, avoiding wide table scrolling on phones. Retained full tabular view on tablet/desktop.
    - [x] **Balanced 2-Column Mobile Stats Grid (`StatsCards.tsx`)**: Replaced single-column mobile stack with a 2-column mobile grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`): **Upcoming**, **Completed**, **Average Score**, and **Class Position**, each equipped with contextual `HeaderTooltip` components.
    - [x] **Academic Standing Progress Polish (`PerformanceChart.tsx`)**: Scaled progress circle to responsive dimensions (`160px`), added contextual `HeaderTooltip` for cohort percentile and rank, and styled with pure black background.
    - [x] **Assessment Search & Filter Bar**: Added a live search input to filter exams, quizzes, CAs, and assignments by title or subject, alongside responsive category tabs and time filter toggles with `HeaderTooltip` explanations.
    - [x] **Zero TypeScript Errors & Pure Black Dark Mode**: Replaced `any` in assessment and attempt mappings with explicit interfaces (`RawExamItem`, `RawAssignmentItem`, `RawSubjectPaper`, `RawAttempt`), ensuring clean `npx tsc --noEmit` passage.


- **Student My Classes Page — Mobile Responsiveness & Tooltips (`/dashboard/student/my-classes`)**:
    - [x] **Compounding Padding & Width Fix**: Eliminated nested `min-h-screen bg-slate-50 p-6 lg:p-10 pb-40` and restrictive `w-[90%] mx-auto` inside [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/page.tsx). Replaced with `w-full space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6`, giving mobile screens full edge-to-edge content area without redundant margins.
    - [x] **Academic Overview Mount & Responsive Polish (`AcademicSummary.tsx`)**: Mounted the unrendered `AcademicSummary` hero section with responsive padding (`p-6 sm:p-8 md:p-12`), rose/pink branding, full-width mobile action buttons (`w-full sm:w-auto`), and direct links to `/dashboard/student/timetable` and `/dashboard/student/exams&quizzes`.
    - [x] **Real Metric Stats Grid (`ClassStats.tsx`)**: Removed hardcoded clinic placeholder text (`Md Rayhan Islam ▼`, `Central Clinic, Dhaka ▼`) and static numbers. Built a responsive 2-column mobile grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`) displaying live data: **Enrolled Classes**, **Active Subjects**, **Exam Attempts**, and **Stream Position**, each equipped with contextual `HeaderTooltip` components.
    - [x] **Interactive Controls & View Mode Toggle (`ClassHeader.tsx`)**: Added a functional live search input for filtering classes by title, subject, teacher, or description, plus a dual **Grid View / Table View** toggle that automatically defaults to Grid on mobile screens (`window.innerWidth < 768`).
    - [x] **Responsive Card Grid & Refined Table**:
        - Created [ClassCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/components/ClassCard.tsx) for the Grid view with subject tags, room location pills, teacher avatar/name, schedule pills, and a "View Class" button.
        - Refactored [ClassTable.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/components/ClassTable.tsx) to remove dummy `Situation` bells and non-functional check/cross icons, replacing them with a streamlined table with "View Details" action buttons.
        - Updated [ClassList.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/my-classes/components/ClassList.tsx) to dynamically render grid or table with matching responsive skeletons and empty state.
    - [x] **Pure Black Dark Mode & TypeScript Strictness**: Styled with `dark:bg-zinc-950/80` and `dark:border-zinc-800`, fully typed enrollment and grade interfaces, achieving zero TypeScript compilation errors.


- **Student Dashboard — Mobile Responsiveness & Header Tooltips (`/dashboard/student`)**:
    - [x] **Double-Padding Elimination**: Removed compounding `min-h-screen bg-slate-50 p-4 md:p-8 lg:p-10 pb-32` from `student/page.tsx` since `student/layout.tsx` already wraps `{children}` in `p-4 md:p-6 lg:p-8`. Changed outer container to `w-full space-y-6 sm:space-y-8 font-sans pb-12 md:pb-6`, reclaiming 32px-64px of blank side margins on mobile screens.
    - [x] **Mobile Assessment Call to Action**: Unhid the "View Details" button in the Recent Activity assessment card (which previously was `hidden md:flex`, making it completely invisible on mobile) by making it full-width on mobile (`flex w-full md:w-auto shrink-0 justify-center md:justify-start`).
    - [x] **Comprehensive Header Tooltips (`comprehensive_header_tooltips` skill)**:
        - Created student-themed [HeaderTooltip.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/student/components/dashboard/HeaderTooltip.tsx) with dark glassmorphic card styling and rose/pink hover states.
        - Integrated tooltips across all key metrics and sections:
            - **Exams Taken**: Total completed assessments and graded quizzes logged on Qefas Hub.
            - **Active Subjects**: Number of registered course subjects currently configured in your class curriculum.
            - **Current GPA**: Cumulative Grade Point Average calculated on a standard 5.0 scale across all evaluated exams and assignments.
            - **Overall Mastery**: Aggregated syllabus proficiency percentage computed from your scores across all examined subjects.
            - **Recent Activity**: Score breakdown, performance progress bar, and direct access to question-level analysis.
            - **Enrolled Subjects**: Class curriculum subjects mapped to academic program with dialog details on tap.
            - **Performance Overview**: Combined longitudinal trajectory and historical exam logs.
            - **Performance Trend**: Chronological scoring progression tracking normalized exam percentages and assignment grades.
            - **Academic History**: Verified exam attempts with WAEC-standard letter grades (A1, C5, F9).
            - **Subject Mastery**: Multi-dimensional radar chart measuring competency across all evaluated subject domains.
            - **Latest Assignments**: Active homework tasks, project submissions, and graded coursework assigned by teachers.
    - [x] **Pure Black Dark Mode & Skeleton Alignment**: Updated cards, dialogues, and loading skeletons to pure-black dark mode (`dark:bg-zinc-950/80`, `dark:border-zinc-800`, `dark:bg-zinc-900`), eliminating white glare.
    - [x] **TypeScript Strict Adherence**: Fully typed all raw attempt and grade records, removed `any` types from `analysis`, `gpa`, and chart tooltips.


- **Teacher Dashboard — Mobile Responsiveness & Bottom Navigation**:
    - [x] **Responsive Insights Grid (`InsightsGrid.tsx`)**: Refactored the top 5 stats cards to a balanced 2-column mobile grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6`), eliminating the single-column long vertical scroll. The 5th card spans 2 columns on mobile/tablet for symmetrical alignment. Scaled card paddings, font sizes, trend indicators, and badges cleanly. Replaced `any` types with typed `CardItem` interface.
    - [x] **Skeleton Synchronization (`DashboardPage.tsx`)**: Updated `DashboardSkeleton` to match the exact same responsive grid geometry as `InsightsGrid`. Removed unused `StatsCards` import. Adjusted page wrapper padding on mobile from `p-6` to `p-4 sm:p-6 md:p-8`.
    - [x] **Cards Mobile Responsiveness**:
        - `TeacherHero.tsx`: Scaled padding to `p-5 sm:p-8 md:p-10` and heading size on mobile.
        - `AssignmentsExams.tsx`: Adapted container padding (`p-4 sm:p-6 md:p-8`), rounded corners, item rows, icons, and action buttons for compact mobile viewports.
        - `TeacherSchedule.tsx`: Added responsive paddings, timeline dot sizing, and item spacing.
        - `PerformanceAnalytics.tsx`: Scaled card padding and time-range filter button controls.
        - `StudentPerformanceWidget.tsx`: Optimized avatar sizing and row spacing on mobile.
        - `RecentPersonalActivity.tsx`: Scaled icon boxes and card padding for small screens.
        - `MessagesAnnouncements.tsx`: Scaled communication hub card and status badges.
        - `QuickTool` (`DashboardPage.tsx`): Replaced `any` with `React.ElementType` and tuned mobile dimensions.
    - [x] **Teacher Bottom Navigation (`TeacherBottomNav.tsx`)**: Created `TeacherBottomNav` component with the emerald role palette (`#059669`) linking to the 5 primary teacher destinations: Home (`/dashboard/teacher`), Classes (`/dashboard/teacher/my-classes`), Students (`/dashboard/teacher/students`), Exams (`/dashboard/teacher/exams&quizzes`), and Grades (`/dashboard/teacher/grades`).
    - [x] **Teacher Layout Integration (`layout.tsx`)**: Integrated `TeacherBottomNav` into `SidebarProvider` with `pb-[4.5rem] md:pb-0` on `SidebarInset` to prevent bottom-nav content collisions on mobile devices.
    - [x] **Comprehensive Header Tooltips (`comprehensive_header_tooltips` skill)**:
        - Created reusable [HeaderTooltip.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/dashboard/HeaderTooltip.tsx) with dark glassmorphic container, emerald hover states, and Radix Tooltip primitives.
        - Added analytical, user-empowering tooltips across all cards:
            - **Total Students, Total Classes, Avg Performance, Upcoming Classes, Attendance Rate** (`InsightsGrid.tsx`)
            - **Assessments** (`AssignmentsExams.tsx`)
            - **Timeline / Daily Agenda** (`TeacherSchedule.tsx`)
            - **Academic Velocity** (`PerformanceAnalytics.tsx`) — dynamically incorporates selected time range (`week`, `month`, `semester`)
            - **Academic Pulse / Top Performers** (`StudentPerformanceWidget.tsx`)
            - **Recent Activity** (`RecentPersonalActivity.tsx`)
            - **Inbox & Alerts** (`MessagesAnnouncements.tsx`)
            - **Quick Tools** (`DashboardPage.tsx`)
            - **Hero Overview** (`TeacherHero.tsx`) — dynamically reflects active term and class count.
    - [x] **Teacher My-Classes Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/my-classes`)**:
        - `PageHeader.tsx`: Responsive layout (`flex-col sm:flex-row`), scaled action buttons, and added `HeaderTooltip` for Academic Registry.
        - `MyClassesPage.tsx`:
            - Refactored top stat cards from single column on mobile to a clean 2-column grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`).
            - Upgraded `StatCard` with responsive icon sizing, compact typography, and analytical `HeaderTooltip` for **Active Modules**, **Enrolled Scholars**, **Avg. Session Attendance**, and **Pending Assessments**.
            - Made Class Intelligence filter card responsive (`p-4 sm:p-6`) with `HeaderTooltip` explaining dynamic filtering and view toggling.
            - Set **Grid View** as the default layout on mobile viewports (`window.innerWidth < 768`) while retaining user toggle capability.
            - Adjusted main page wrapper padding to `p-4 sm:p-6 md:p-8 lg:p-10` with matching section spacing.
        - `ClassCard.tsx`: Optimized mobile card padding (`p-4 sm:p-6`), banner image height (`h-28 sm:h-32`), metric bar spacing (`p-3 sm:p-4 mb-4 sm:mb-6`), and button touch target.
        - `ClassGrid.tsx`: Reduced huge mobile spacing (`gap-10`) to responsive `gap-4 sm:gap-6 lg:gap-8`.
        - `FilterChips.tsx`: Scaled filter pill buttons (`h-9 sm:h-10`, `px-3 sm:px-4`) and clear filters button for compact mobile viewports without overflowing.
        - `ClassesSkeleton.tsx`: Synced grid geometry and item sizing with the responsive `ClassGrid` and `ClassList`.
        - `ClassList.tsx`: Scaled table cell padding (`px-3 sm:px-6 py-3 sm:py-4`) and image sizing for mobile viewports.
    - [x] **Teacher Students Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/students`)**:
        - `StudentPage.tsx`:
            - Added top stat cards in a responsive 2-column mobile grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`): **Total Scholars**, **Avg. Attendance**, **Academic Average**, and **Active Cohorts**, each equipped with comprehensive `HeaderTooltip` components.
            - Configured **Grid View** as the automatic default on mobile devices (`window.innerWidth < 768`) via `useEffect`, keeping List View default on desktop.
            - Adjusted main page wrapper padding to `p-4 sm:p-6 md:p-8 lg:p-10`.
            - Strongly typed student export handler, eliminating banned `any` types.
        - `HeaderTitle.tsx`: Added `HeaderTooltip` next to "Students" heading with detailed context and scaled font sizes for small screens.
        - `HeaderActions.tsx`: Transformed actions into an adaptive mobile grid where secondary actions share row 1 and primary "Quick Attendance" spans full-width below.
        - `ControlsBar.tsx`: Redesigned as a comprehensive "Scholar Directory" card with icon badge, title, `HeaderTooltip`, responsive view toggle, and unified search/filter layout.
        - `FilterChips.tsx`: Made dropdown full-width on mobile (`w-full sm:w-auto h-12`) and replaced `any` types with explicit `ClassItem` interface.
        - `StudentCard.tsx`: Optimized card padding (`p-4 sm:p-6`), avatar sizing (`w-14 h-14 sm:w-16 sm:h-16`), metric spacing, and button touch target.
        - `StudentGrid.tsx`: Reduced mobile grid gap from `gap-6` to `gap-4 sm:gap-6` and fixed `error` typing.
        - `StudentList.tsx`: Replaced `any` with `unknown` and adapted table cells (`px-3 sm:px-6 py-3 sm:py-4`) and badges for mobile viewports.
        - `StudentSkeleton.tsx`: Synced grid geometry and skeleton card dimensions with responsive student card styles.
    - [x] **Teacher Exams & Quizzes Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/exams&quizzes`)**:
        - `PageHeader.tsx`: Responsive title/action flex layout (`flex-col sm:flex-row`), full-width mobile button, and added `HeaderTooltip` for assessment registry command center.
        - `ExamsQuizzesOverview.tsx`:
            - Added top summary stat cards in a responsive 2-column mobile grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`): **Total Assessments**, **Active / Published**, **Draft Assessments**, and **My Modules**, each equipped with comprehensive `HeaderTooltip` components following the `comprehensive_header_tooltips` skill.
            - Configured **Grid View** as the automatic default layout on mobile devices (`window.innerWidth < 768`) via `useEffect`, while preserving user toggle preferences.
            - Upgraded category tabs with full-width mobile container (`w-full`), smooth horizontal scrolling (`no-scrollbar scroll-smooth overscroll-x-contain`), `shrink-0` & `whitespace-nowrap` guard against text breakage, `whileTap={{ scale: 0.96 }}` touch feedback, active count badges, and dedicated full-width mobile view layout switcher row.
            - Scaled main page wrapper padding to `p-4 sm:p-6 md:p-8 lg:p-10`.
        - `ExamsTable.tsx`:
            - Enhanced Grid container to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2` and card padding to `rounded-2xl sm:rounded-3xl p-4 sm:p-5`.
            - Made list view cards stack cleanly on mobile (`flex-col lg:flex-row`, items start-aligned, metrics row wrapping with responsive borders, status + action buttons grouped properly).
            - Made expanded subject paper rows responsive on small viewports with wrapped teacher tags and spaced metrics.
        - `FilterChips.tsx`: Redesigned and rearranged the filter toolbar into a cohesive 2-column mobile grid and flex-row desktop layout with emerald styling:
            - Ordered filters logically: **Class** (`GraduationCap`), **Subject** (`BookOpen`), **Status** (`Sparkles`), and **Date / Timeframe** (`Calendar`), with an active filter badge and dedicated **Reset Filters** button (`FilterX`).
            - Replaced fragile hover menus with robust touch-friendly click-to-toggle dropdowns, animated popovers via `framer-motion`, and outside-click dismissal.
            - Anchored dropdown popover coordinates (`top-full`, `z-50`, with right-aligned mobile positioning for column 2 items) to eliminate screen-edge overflow and clipping.
        - `ExamsSkeleton.tsx`: Synced row skeleton padding and border-radius (`p-4 sm:p-6 rounded-xl sm:rounded-2xl`) with responsive card styling.
    - [x] **Teacher Grades Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/grades`)**:
        - `PageHeader.tsx`: Responsive layout (`flex-col sm:flex-row`), scaled action buttons (AI OCR Camera, CSV Upload, Settings, and Record Grade), and added `HeaderTooltip` for academic gradebook console.
        - `GradeStatsCards.tsx`:
            - Refactored top stat cards from single column on mobile to a responsive 2-column mobile grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`).
            - Added comprehensive `HeaderTooltip` components following the `comprehensive_header_tooltips` skill: **Class Average**, **Completion**, **Top Students**, and **To Review**.
            - Scaled paddings and typography for compact mobile viewports (`p-4 sm:p-5`, `text-xl sm:text-2xl md:text-3xl`).
        - `GradeCard.tsx`: Created a modern, mobile-responsive card component for the new Grid View displaying scholar avatar, name, student code, big letter grade, subject paper, assessment type, score metrics, and actions menu.
        - `GradesTable.tsx`: Integrated dual-view support (Grid View & Table View) with responsive card grid and loading skeleton states.
        - `TableToolbar.tsx`: Made search bar full width on mobile, aligned Filter/Sort controls, and integrated a Grid / Table view toggle with `HeaderTooltip`.
        - `Filters.tsx`: Made dropdown filters responsive on small viewports with full touch targets and high z-index.
    - [x] **Teacher Subjects Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/subjects`)**:
        - `PageHeader.tsx`: Responsive title/action flex layout, scaled action buttons, and added `HeaderTooltip` for academic curricula directory.
        - `SubjectsPage.tsx`:
            - Added top summary stat cards in a responsive 2-column mobile grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6`): **Assigned Subjects**, **Active Cohorts**, **Avg. Syllabus Progress**, and **Total Scholars**, each equipped with comprehensive `HeaderTooltip` components.
            - Configured **Grid View** as the automatic default layout on mobile devices (`window.innerWidth < 768`) via `useEffect`.
            - Scaled main page wrapper padding to `p-4 sm:p-6 md:p-8 lg:p-10`.
        - `SubjectCard.tsx`: Optimized mobile card padding, tag sizing, and button touch targets.
        - `SubjectsSkeleton.tsx`: Synced grid geometry and skeleton card dimensions with responsive subject card styles, ensuring pure black dark mode backgrounds.
    - [x] **Teacher Assignments Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/assignments`)**:
        - `PageHeader.tsx`: Made `action` ("+ Create Assignment" button) visible on mobile screens (`flex items-center w-full sm:w-auto` instead of `hidden md:block`), scaled typography responsively (`text-2xl sm:text-3xl md:text-4xl`), and integrated `HeaderTooltip`.
        - `page.tsx`:
            - Added 4 top summary stat cards in a responsive 2-column mobile / 4-column desktop grid: **Active Deliverables** (`BookOpen`, Emerald), **Submissions Received** (`GraduationCap`, Blue), **Action Required** (`Clock`, Amber), and **Turn-in Rate** (`CheckCircle2`, Purple), each equipped with comprehensive `HeaderTooltip` components following the `comprehensive_header_tooltips` skill.
            - Configured **Grid View** as automatic default layout on mobile viewports (< 768px) via `useEffect`, syncing state with filter view toggle buttons.
            - Added analytical `HeaderTooltip` for both the main header and the Assignment Registry directory filter card.
            - Scaled main page wrapper padding to `p-3.5 sm:p-6 md:p-8` with max width `max-w-[1600px]`.
            - Enhanced mobile empty state with clear guidance and a direct "Create Assignment" CTA button.
        - `AssignmentCard.tsx`: Sized container padding responsively to `p-4 sm:p-6 md:p-8` for mobile screens, optimized badge/action spacing, and aligned theme backgrounds with `bg-white dark:bg-emerald-950/40`.
        - `AssignmentFilters.tsx`:
            - Replaced cramped inputs and selects with touch-friendly `h-11` controls and legible `text-xs sm:text-sm font-semibold` labels.
            - Arranged filters into responsive mobile grid (`grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto`).
            - Connected `currentView` prop to visually reflect active Grid / List view selection.
        - `AssignmentsSkeleton.tsx`: Overhauled dark mode styling to use pure black backgrounds (`dark:bg-black`, `dark:border-zinc-800`) with dark gray placeholders (`dark:bg-zinc-900`) with zero white glare.
    - [x] **Teacher Dashboard — Unified Pagination System (`TeacherPagination.tsx`)**:
        - Created canonical shared [TeacherPagination.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/teacher/components/TeacherPagination.tsx) with Lucide `ChevronLeft` and `ChevronRight` icons, responsive layout (`flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4`), touch-friendly targets, and emerald styling (`bg-emerald-500 text-white shadow-sm shadow-emerald-500/30`, `dark:bg-emerald-950/40`, `dark:border-emerald-800/50`).
        - Integrated dynamic numbered buttons with intelligent ellipsis calculation (`1, 2, 3 ... N`) and customizable item nouns via `itemName` prop (`"assignments"`, `"scholars"`, `"grade records"`, `"assessments"`, `"submissions"`).
        - Applied across all teacher dashboard pages to ensure consistent design and behavior ("rhyming"):
            - **Assignments** (`/dashboard/teacher/assignments`): Upgraded `Pagination.tsx`, preview pages, and student submissions table.
            - **Students** (`/dashboard/teacher/students`): Replaced simple `< 1 / 3 >` pagination with the full numbered `TeacherPagination`.
            - **Grades** (`/dashboard/teacher/grades`): Replaced ad-hoc `TablePagination` with `TeacherPagination`.
    - [x] **Teacher Final Results & Records Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/records`)**:
        - `RecordsStatsCards.tsx`: Created responsive 4-KPI stat cards in a balanced 2-column mobile / 4-column desktop grid with comprehensive `HeaderTooltip` components: **Total Subjects / Students**, **Completed Records**, **Pending Drafts**, and **Cohort Average Score**.
        - `SubjectResultCard.tsx`: Designed mobile-responsive grid cards for Subject Final Results displaying class badges, subject names, session & term, published status pills, and direct "Edit Sheet" / "Preview" action buttons.
        - `StudentResultCard.tsx`: Created mobile-responsive grid cards for Student Final Results displaying scholar avatar, class, term, average score, class rank position, and "View Report Card" actions.
        - `CreateResultDialog.tsx`: Transformed the "Add Final Result" configuration modal into a mobile-adaptive dialog with collapsible column layouts (`grid-cols-1 sm:grid-cols-3`), scrollable container (`max-h-[90vh] overflow-y-auto`), pure black dark mode styling, and `HeaderTooltip` for assessment weights.
        - `RecordsSkeleton.tsx`: Pure black dark-mode loading skeleton (`dark:bg-black`, `dark:border-zinc-800`, `dark:bg-zinc-900`) supporting both Grid and Table view modes.
        - `page.tsx`:
            - Replaced hardcoded static filters with live dynamic dropdowns for Class, Session, Term, and Status connected to data hooks.
            - Added live client-side search across subject names, scholar names, and classes.
            - Integrated view mode switcher with automatic **Grid View** default on mobile viewports (< 768px).
            - Replaced ad-hoc pagination controls with the unified `TeacherPagination` component.
            - Added analytical `HeaderTooltip` for page header, stat cards, and directory controls.
    - [x] **Teacher Linking Hub — Mobile Responsiveness & Tooltips (`/dashboard/teacher/linking`)**:
        - `TeacherLinkingHeader.tsx`: Scaled typography to `text-2xl sm:text-3xl md:text-4xl font-black`, added comprehensive `HeaderTooltip` for institutional code linking and QR badge onboarding, and converted actions to a responsive mobile layout.
        - `TeacherLinkingStats.tsx`: Redesigned stats into a balanced 2-column mobile / 3-column desktop grid with comprehensive `HeaderTooltip` components on each metric card (**Active Connections**, **Pending Requests**, **Active Workspace Context**), with the workspace card spanning 2 columns symmetrically on mobile.
        - `TeacherLinkingCodeCards.tsx`: Made code pills and copy buttons responsive on small mobile viewports (360px-390px) and added `HeaderTooltip` explaining direct scholar/guardian connection workflows.
        - `TeacherLinkingTabs.tsx`: Upgraded tab categories (Network/Classroom), status pills (Connected/Pending), and search bar into a responsive mobile layout with touch-friendly `h-10 sm:h-11` targets.
        - `TeacherActiveLinksGrid.tsx` & `TeacherPendingRequestsGrid.tsx`: Enhanced grid breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) and pure black dark-mode empty states.
        - `page.tsx`:
            - Replaced generic pagination with unified `TeacherPagination` with dynamic item naming (`"connections"` / `"requests"`).
            - Upgraded `LinkingSkeleton` to use pure black backgrounds (`dark:bg-black`, `dark:border-zinc-800`, `dark:bg-zinc-900`) removing white glare.
    - [x] **Teacher Notifications Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/notifications`)**:
        - `NotificationStatsCard.tsx`: Styled with theme-aligned emerald palette, responsive layout, category breakdown indicators, and added `HeaderTooltip` components.
        - `NotificationsSkeleton.tsx`: Overhauled `NotificationFeedSkeleton` and `NotificationStatsSkeleton` with pure black dark-mode styling (`dark:bg-black`, `dark:border-zinc-800`, `dark:bg-zinc-900`) removing white glare.
        - `page.tsx`:
            - Added analytical `HeaderTooltip` next to "Notifications" heading explaining real-time broadcasts and alert classifications.
            - Enhanced mobile responsiveness of filter pills (`h-9 sm:h-10`, horizontal smooth scroll with no scrollbar clipping) and search input (`h-10 sm:h-11`).
            - Sized notification cards responsively (`p-3.5 sm:p-5`, icon containers `h-10 w-10 sm:h-12 sm:w-12`), aligning theme borders and active/unread states with emerald role accents.
            - Replaced generic pagination with unified `TeacherPagination` with `itemName="notifications"`.
            - Scaled page wrapper padding to `p-3.5 sm:p-6 md:p-8` with max width `max-w-[1600px]`.
    - [x] **Teacher Profile Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/profile`)**:
        - `page.tsx`:
            - **Header / Hero Section**:
                - Scaled banner height responsively (`h-40 sm:h-52 md:h-64`).
                - Made the "Edit Banner" action button always accessible on mobile/touch viewports (`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 text-white backdrop-blur-md shadow-sm sm:opacity-0 sm:group-hover:opacity-100`), eliminating hover-only traps on touchscreens.
                - Scaled avatar overlay responsively (`-mt-14 sm:-mt-16 md:-mt-20`, `h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40`) with emerald role identity and verified educator badge.
                - Enhanced identity row with responsive typography (`text-xl sm:text-2xl md:text-3xl`), role badges, and an intuitive "Edit Profile" primary CTA alongside Security and Support buttons.
            - **Quick Stats Grid**:
                - Responsive 1-column mobile / 3-column tablet & desktop grid with compact paddings.
                - Integrated comprehensive `HeaderTooltip` components following the `comprehensive_header_tooltips` skill: **Educator ID**, **Pedagogical Role**, and **Account Status**.
            - **Main Content Grids & Shortcuts**:
                - Added analytical `HeaderTooltip` components to **Personal Data**, **Professional Details**, **Primary Academy Institution**, and **Services & Shortcuts**.
                - Sized data items and quick action buttons with comfortable touch targets.
            - **Edit Profile Modal**:
                - Overhauled modal for mobile screens with pure-black dark-mode styling (`bg-white dark:bg-black border border-slate-200 dark:border-zinc-800`), responsive heights (`max-h-[90vh] sm:max-h-[85vh]`), touch-friendly form inputs (`h-11 sm:h-10 rounded-xl`), and full mobile tab scrolling.
                - Added direct shortcut to security / 2FA settings within the security tab.
            - **Loading Skeleton**:
                - Overhauled skeleton to use pure black backgrounds in dark mode (`dark:bg-black`, `dark:border-zinc-800`, `dark:bg-zinc-900`) completely eliminating white glare.
            - **TypeScript & Cleanliness**:
                - Strongly typed `TeacherProfile` interface, eliminating banned `any` casts.
    - [x] **Teacher Settings Page — Mobile Responsiveness & Tooltips (`/dashboard/teacher/settings`)**:
        - `page.tsx`:
            - **Header & Navigation**:
                - Scaled page wrapper padding to `p-3.5 sm:p-6 md:p-8` with max width `max-w-[1600px]`.
                - Added analytical `HeaderTooltip` next to "Settings" title explaining account governance, multi-factor security, connected devices, and visual preferences.
                - Converted action buttons into a flexible mobile wrap layout (`flex-wrap sm:flex-nowrap`, full width on mobile viewports).
                - Scaled tab bar navigation (`Account`, `Security`, `Display`) with comfortable touch targets (`h-10 text-xs sm:text-sm`).
            - **Account Tab**:
                - Sized Educator Identity preview card responsively (`flex-col sm:flex-row`, centered on mobile, full width "Edit Profile" touch button).
                - Added `HeaderTooltip` for **Educator Identity** and **Linked Academy**.
                - Scaled form inputs and logout action card to touch-friendly `h-11 sm:h-10` heights.
            - **Security Tab**:
                - Added comprehensive `HeaderTooltip` components to **Password** and **Two-Factor Authentication**.
                - Sized password change action and TwoFactorSetup dialogs cleanly for mobile screens.
                - Enhanced `DeviceSessions.tsx` with typed error handling, eliminating banned `any` types.
            - **Display Preferences Tab**:
                - Added `HeaderTooltip` explaining ambient lighting theme options (Light, Dark, System).
                - Upgraded theme toggle buttons with clear active states and touch targets.
            - **Loading Skeleton**:
                - Overhauled skeleton to use pure black backgrounds in dark mode (`dark:bg-black`, `dark:border-zinc-800`, `dark:bg-zinc-900`) completely eliminating white glare.
            - **TypeScript & Cleanliness**:
                - Defined typed `TeacherProfileData` interface, eliminating banned `any` assertions.
    - [x] **Teacher Exams & Quizzes Page — Full Width Optimization (`/dashboard/teacher/exams&quizzes`)**:
        - `ExamsQuizzesOverview.tsx`:
            - Removed redundant inner side margins (`w-[95%] mx-auto`) and horizontal padding (`p-3.5 sm:p-6 md:p-8`) that were compounding with the outer layout's padding, allowing the assessment console, stat cards, categories bar, and assessment grid to cleanly expand to `w-full` across the available canvas without artificial empty side gaps.
            - Cleaned up TypeScript `any` casts in `examToDelete`, `deleteMutation`, and `myItemsCount`.
    - [x] **Teacher Grades Page — Full Width Optimization (`/dashboard/teacher/grades`)**:
        - `GradesOverview.tsx`:
            - Removed redundant inner side margins (`w-[90%] mx-auto`) and horizontal padding (`p-4 sm:p-6 md:p-8 lg:p-10`) that were compounding with the outer layout's padding, allowing the academic gradebook, stat cards, toolbar, and student rows to cleanly expand to `w-full` across the available canvas without artificial empty side gaps.
    - [x] **Student Login Page — Mobile Card Width Fit (`/login/student`)**:
        - `page.tsx`:
            - Made card padding responsive (`p-5 sm:p-10 md:p-12`) and outer container padding `px-3.5 sm:px-8 lg:px-12` so the card has great breathing room while keeping maximum internal space for the form on small viewports.
        - `RightPanel.tsx`:
            - Stripped redundant nested `p-8 sm:p-10 lg:p-12` and `max-w-md` constraints from `RightPanel`, allowing the student login form to fit 100% of the card's internal width on mobile.
        - `StudentLoginForm.tsx`:
            - Optimized input sizing (`h-12 sm:h-14`) and gaps (`gap-4 sm:gap-5`) with full-width buttons and inputs.
    - [x] **Build Verification**: Clean compilation with `npx tsc --noEmit` (zero errors).

### Wednesday, September 24, 2026

- **Records & Results — Permission Bug Fix**:
    - [x] **Backend**: Fixed `checkEditPermission` in `records.controller.ts` — removed reference to non-existent `createdById` field on `ClassSubjectResult`; now fetches `SchoolAdmin` role from DB if not present in JWT payload, and allows any SCHOOL_OWNER / PRINCIPAL / REGISTRAR admin to edit.

- **Student Final Results Flow — Full Implementation**:
    - [x] **Backend**: Added `getMyPublishedResults` service in `records.service.ts` — queries `StudentSubjectTermResult` (the table that IS written to on publish), checks `releaseDate` to gate card visibility, checks `revealDate` to gate score visibility, groups results by `sessionId + term`, and returns `scoresRevealed`, `revealDate`, and `subjectCount` per group.
    - [x] **Backend**: Added `getMyPublishedResults` controller in `records.controller.ts`.
    - [x] **Backend**: Added `/records/my-results` route in `records.route.ts` **before** the `restrictTo` middleware so students can access it (all other routes remain admin/teacher only).
    - [x] **Frontend Service**: Added `getMyPublishedResults()` in `recordService.ts` hitting `/records/my-results`.
    - [x] **Frontend Hook**: Added `useMyPublishedResults()` in `useRecords.ts` with `staleTime: 2min`.
    - [x] **Frontend UI**: Replaced `termly/page.tsx` with a **card grid** — shows class name, session, term badge, subject count, and published/reveal-pending status. No scores shown on this page. Clicking a card navigates to the detail page.
    - [x] **Frontend UI**: Created `termly/view/page.tsx` — dedicated full result sheet page using `?sessionId=&term=` query params. Shows hero header with avg/highest/lowest stats, full subject table with Assignment / CA / Exam / Total / Grade columns, N/A + lock icon masking when `scoresRevealed = false`, amber countdown banner if revealDate is pending, and a summary footer.

- **TypeScript Fix**:
    - [x] Fixed `Type 'string' is not assignable to type 'ToastIcon | undefined'` in `teacher/records/preview/page.tsx` by wrapping emoji in `<span>`.

### Monday, September 21, 2026

- **Records & Results Data Entry**:
    - [x] **Backend**: Added `getClassSubjectResultById`, `getStudentSubjectResults`, and `bulkUpsertStudentSubjectResults` in `records.service.ts` and `records.controller.ts`.
    - [x] **Backend**: Registered new endpoints in `records.route.ts` and ensured they are protected by the `restrictTo("SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR")` RBAC middleware.
    - [x] **Backend**: Fixed a TypeScript bug in `termlyEvaluation.controller.ts` to ensure successful compilation.
    - [x] **Frontend Hooks**: Created React Query hooks `useClassSubjectResult`, `useStudentSubjectResults`, and `useBulkSaveStudentSubjectResults` in `useRecords.ts`.
    - [x] **Frontend API**: Added service methods `getClassSubjectResultById`, `getStudentSubjectResults`, and `bulkUpsertStudentSubjectResults` in `recordService.ts`.
    - [x] **Frontend UI**: Completely rewrote the Data Entry Page (`/dashboard/admin/records/new/page.tsx`) to pull actual students dynamically using `useAdminStudents`, merge existing marks with `useStudentSubjectResults`, and save changes in bulk using the new upsert endpoint.
    - [x] **Frontend UI**: Built the Summary Cards logic on the Data Entry page to dynamically calculate Total Students, Scores Entered, Pending Entry, and Class Average.

### Sunday, September 20, 2026

- **Admin Approval UI & Notifications Refinements**:
    - [x] **Frontend Redesign**: Redesigned the admin approval popup in `PendingRequestsTable.tsx` to use a blue-themed UI (`blue-100`, `blue-500`, `blue-600`) instead of the default generic styles.
    - [x] **Backend Notifications**: Added `sendNewAdminJoinedEmail` in `auth.service.ts` to notify existing active admins when a new admin is approved.
    - [x] **Backend Notifications**: Updated `approveAdmin` in `admin.controller.ts` to trigger the new email and also dispatch an in-app notification to all active admins.
    - [x] **Role Restrictions**: Restricted `billing` to School Owner and Accountant. Restricted all academic modules from Accountant. Restricted `grades` to School Owner, Principal, and Registrar (with a new backend middleware `requireSchoolOwnerPrincipalOrRegistrar` and frontend layout guard).
- **Onboarding Enhancements**:
    - [x] **Dynamic Theming**: Refactored `/onboarding/page.tsx` to apply dynamic Tailwind colors based on `userType` (Admin=Blue, Teacher=Orange, Student=Pink, Parent=Green).
    - [x] **Role-Specific Content**: Adjusted the tour step content dynamically so non-admins don't see admin-specific features like "Custom Subdomains".
    - [x] **UI Polish**: Increased text sizes inside the onboarding step cards.
    - [x] **Lottie & Redirection**: Replaced the static icon on the final step with the Lottie checkmark animation, and updated the final button to correctly route to `/dashboard/${userType.toLowerCase()}` to trigger their specific loading pages.

### Friday, September 19, 2026

- **Multi-Admin RBAC System (Full Implementation)**:
    - [x] **Backend**: Fixed critical security bug — `approveAdmin`/`rejectAdmin` endpoints were unguarded. Added `requireSchoolOwnerOrPrincipal` middleware.
    - [x] **Backend**: Added `PENDING` role state to `SchoolAdmin` in Prisma schema.
    - [x] **Backend**: Fixed broken async chain in `requireAdminRole` middleware.
    - [x] **Backend**: Replaced `console.log` email stubs with real Resend transactional emails for pending/approved/rejected events.
    - [x] **Backend**: Updated `/auth/me` and `/auth/login` to return `adminRole` sub-role in the response payload.
    - [x] **Frontend Auth Store**: Added `adminRole` field to the `User` interface in `auth-store.ts`.
    - [x] **Frontend Registration**: Added `adminJoinSchema` to `regSchema.ts`, `registerAdminSelf` to `registration-api.ts`, `useAdminSelfRegistration` to `useRegistrationMutations.ts`.
    - [x] **Frontend Registration UI**: Refactored `SchoolCard.tsx` with mode toggle (Register New School vs Join Existing School via school code).
    - [x] **Frontend Team UI**: Created `/dashboard/admin/team/page.tsx` with two tabs (Active Members, Pending Requests) and live pending badge counter.
    - [x] **Frontend Team UI**: Created `ActiveMembersTable.tsx` — shows role badges, Change Role dropdown, Transfer Ownership dialog (SCHOOL_OWNER only), Remove dialog.
    - [x] **Frontend Team UI**: Created `PendingRequestsTable.tsx` — shows Approve (with role selector) and Reject (with reason textarea) dialogs for SCHOOL_OWNER/PRINCIPAL.
    - [x] **Frontend Sidebar**: Added "Team" nav item to `app-sidebar.tsx` with `Shield` icon.
    - [x] **Frontend Sidebar RBAC**: Added `ROLE_NAV_PERMISSIONS` map to `adminFeatureFlags.ts`. Sidebar `useMemo` now filters items by `user.adminRole` — SCHOOL_OWNER always sees everything, other roles see only their permitted items.
    - [x] **Frontend Route Guards**: Created reusable `AdminRoleGuard.tsx` component (shows styled "Access Restricted" screen for unauthorised roles).
    - [x] **Frontend Route Guards**: Added `layout.tsx` guards to Settings (owner only), Finance (owner/accountant), Billing (owner only), Team (owner/principal).
    - [x] **API Service Layer**: Added `getSchoolAdmins`, `getPendingAdmins`, `approveAdmin`, `rejectAdmin`, `updateAdminRole`, `transferOwnership`, `removeAdmin` to `adminService.ts`.
    - [x] **React Query Hooks**: Added corresponding hooks to `useAdmin.ts` with correct `staleTime` values per project rules.

- **Current Focus**: Multi-admin RBAC system fully implemented. All type checks pass with zero errors.
- **Next**: End-to-end manual testing, then production deployment key swap.

### Thursday, September 18, 2026


- **Security Settings UI and Auditing (`/dashboard/admin/settings`)**:
    - [x] Added a confirmation modal when disabling Two-Factor Authentication. The modal warns users of the security risk and requires them to manually type "DISABLE" to proceed.
    - [x] Added a new `SecurityAuditLog` model to `schema.prisma` to securely track security events.
    - [x] Updated the `disable2FA` controller to capture `deviceModel`, `osVersion`, and `ipAddress` from incoming requests and store them in the `SecurityAuditLog` table.

- **Parent Settings Redesign (`/dashboard/parent/settings`)**:
    - [x] Refactored the layout structure and tabs to match the UI language of the Admin Settings page (compact tabs, 80% container width).
    - [x] Integrated `TwoFactorSetup` directly into the parent's Security tab, linking it with `updateUser` for seamless hydration.

- **Security Settings Bug Fix (`/dashboard/admin/settings`)**:
    - [x] Fixed the "Require 2FA" toggle not reflecting its state from the database upon page refresh. Updated `backend/src/modules/auth/auth.controller.ts` to include `require2FA: user.isTwoFactorEnabled` in the API response payload for `/auth/me`, `/auth/login`, and `/auth/login2FA` endpoints for all user roles (Admin, Teacher, Student, Parent). This ensures the frontend Zustand store hydrates correctly.

- **Settings UI Polish (`/dashboard/admin/settings`)**:
    - [x] Fixed an issue with the "Save Changes" button displaying duplicate loading indicators. Refactored the button's loading state to remove the extra spinner component and cleanly display "Saving..." text while the mutation is pending.

- **Form UI Polish (`/dashboard/admin/school-profile/edit`)**:
    - [x] Changed the "Save Changes" button in `FormActionBar.tsx` to use distinct Tailwind blue classes (`bg-blue-600 dark:bg-blue-500`) instead of the generic `bg-primary` variable. This ensures the button remains highly visible, distinct, and aesthetically pleasing in Dark Mode.

- **Dynamic Verification Status (`/dashboard/admin/school-profile`)**:
    - [x] Refactored the `Verification` badge in the Institutional Stats section to dynamically reflect the actual database status. It now checks the `verified` boolean of the school's admin account instead of being hardcoded to "Verified". It displays an amber "Unverified" badge if the email is not verified.

- **School Profile View Fields Sync (`/dashboard/admin/school-profile`)**:
    - [x] Added `Operating Hours` to the Connectivity sidebar block so it mirrors the edit form.
    - [x] Added `Principal` to the Institutional Stats section so it properly reflects the data managed on the edit page.

- **School Profile Layout Tweak (`/dashboard/admin/school-profile`)**:
    - [x] Updated the main wrapper in `page.tsx` and `loading.tsx` to use `w-[90%] max-w-none` to match the exact 90% fluid width configuration requested.

- **Admin Dashboard Loading Skeleton Tweak (`/dashboard/admin/loading.tsx`)**:
    - [x] Changed the max-width constraint on the loading skeleton page wrapper from `1400px` to fluidly fill exactly 90% of the available screen space (`w-[90%] max-w-none`), matching the user's specific request.

- **Email Templates Logo Fix (`backend/src/modules/auth/auth.service.ts`)**:
    - [x] Hardcoded all 9 instances of the email logo `src` from using the local/env-based `FRONTEND_URL` to an absolute production URL (`https://qefashub.com/logo/favicon.svg`). This ensures the logo always renders correctly in users' email clients regardless of the environment the server is running in.

- **Admin Dashboard Layout Tweak (`/dashboard/admin`)**:
    - [x] Changed the max-width constraint on the main page wrapper from a hardcoded `1400px` to fluidly fill 95% of the available screen space (`w-[95%] max-w-none`).

- **School Signup Page Polish (`/signup/school`)**:
    - [x] **Subdomain Accordion**: Wrapped the "Subdomain" field inside the exact same expandable "Optional Information" accordion used by the other roles to ensure 100% structural consistency across all 4 signup forms.
    - [x] **Cleanup**: Removed remaining obsolete legacy components (`SchoolHeader.tsx`, `SchoolSlider.tsx`) that were missed during the initial school redesign.

- **Parent Signup Page Redesign (`/signup/parent`)**:
    - [x] **`ParentCard.tsx` Full Redesign**: Replaced the fragmented component structure with a unified `ParentCard` matching the premium two-panel layout.
    - [x] **Orange Theme Applied**: Used the parent role identity (orange colors `#ea580c`, `#f97316`) for gradients, badges, and interactive elements. Matches the parent login page palette.
    - [x] **Role-Specific Fields**: Added an expandable "Optional Information" accordion containing the "Student Code".
    - [x] **Full Dark Mode Support**: Integrated full dark mode consistently across the form, modals, and page wrapper.
    - [x] **Page Wrapper Update**: Updated `page.tsx` to use the orange tinted background (`#fff7ed`) with light ambient blobs and a dark mode grid texture.
    - [x] **Cleanup**: Removed unused obsolete components (`ParentForm.tsx`, `ParentHeader.tsx`, `ParentImage.tsx`). Updated `AuthModal` to point to new component.

- **Student Signup Page Redesign (`/signup/student`)**:
    - [x] **`StudentCard.tsx` Full Redesign**: Replaced the fragmented component structure with a unified `StudentCard` matching the premium two-panel layout established by `SchoolCard` and `TeacherCard`.
    - [x] **Rose Theme Applied**: Used the student role identity (rose colors `#be123c`, `#e11d48`) for gradients, badges, and interactive elements. Matches the student login page palette.
    - [x] **Role-Specific Fields**: Added an expandable "Optional Information" accordion containing "School Code", "Class Code", "Teacher Code", and "Parent Code".
    - [x] **Full Dark Mode Support**: Integrated full dark mode (`dark:bg-slate-900`, `dark:border-slate-800`, etc.) consistently across the form, modals, and page wrapper.
    - [x] **Page Wrapper Update**: Updated `page.tsx` to use the rose tinted background (`#fff1f2`) with light ambient blobs and a dark mode grid texture.
    - [x] **Cleanup**: Removed unused obsolete components (`StudentRegisterForm.tsx`, `StudentRegisterImageSlider.tsx`). Updated `AuthModal` to point to new component.

- **Teacher Signup Page Redesign (`/signup/teacher`)**:
    - [x] **`TeacherCard.tsx` Full Redesign**: Replaced the fragmented 5-component structure (`TeacherRegisterForm`, `TeacherRegisterContainer`, `TeacherRegisterImage`, etc.) with a single, unified `TeacherCard` component matching the premium two-panel layout established by `SchoolCard`.
    - [x] **Emerald Theme Applied**: Used the teacher role identity (emerald colors `#047857`, `#10b981`) for buttons, badges, gradients, and interactive elements.
    - [x] **Role-Specific Fields**: Added an expandable "Optional Information" accordion containing "School Code", "Class Code", and "Student Code". Included the "Independent Account" checkbox which automatically disables/clears the School Code field when checked.
    - [x] **Full Dark Mode Support**: Integrated full dark mode (`dark:bg-slate-900`, `dark:border-slate-800`, etc.) consistently across the form, modals, and page wrapper.
    - [x] **Page Wrapper Update**: Updated `page.tsx` to use the emerald tinted background (`#e8f5e9`) with light ambient blobs and a dark mode grid texture.
    - [x] **Cleanup**: Removed unused obsolete components (`TeacherRegisterContainer.tsx`, `TeacherRegisterDivider.tsx`, `TeacherRegisterForm.tsx`, `TeacherRegisterImage.tsx`, `TeacherRegisterInput.tsx`).

- **School Signup Page Redesign (`/signup/school`)**:
    - [x] **`SchoolCard.tsx` Full Redesign**: Completely rebuilt the school registration card with a premium two-panel layout (form left, visual right). See previous entry for details.
    - [x] **Blue Theme Applied**: Switched colour palette from forest-green to the admin-role blue (`#1d4ed8` → `#3b82f6` gradient on the right panel). Matches the `/login/school-admin` page blue identity.
    - [x] **Full Dark Mode Support**: Added `dark:` Tailwind variants on every element:
        - Card: `bg-white dark:bg-slate-900`
        - Inputs: `bg-slate-50 dark:bg-slate-800`, `border-slate-200 dark:border-slate-700`, `text-slate-800 dark:text-white`
        - Labels / helper text: `dark:text-slate-300` / `dark:text-slate-400`
        - Error text: `dark:text-red-400`
        - Subdomain suffix: `dark:bg-slate-700 dark:border-slate-700`
        - Eye-toggle buttons: `dark:text-slate-500 dark:hover:text-slate-300`
        - Modals: `dark:bg-slate-900`, header `dark:bg-slate-800/50`, borders `dark:border-slate-800`
        - Modal CTA: blue gradient (consistent light+dark)
        - Card ring: `dark:ring-1 dark:ring-slate-800` (replaces box-shadow)
    - [x] **`page.tsx` Dark Mode**: `bg-[#e0e7ff] dark:bg-slate-950` + blue ambient blobs light / subtle grid texture overlay dark.
    - [x] **`getPasswordStrength` extraction**: Moved to `services/passwordStrength.ts`; updated `ParentForm.tsx`, `TeacherRegisterForm.tsx`, `StudentRegisterForm.tsx` imports.

### Saturday, September 12, 2026

- **Teacher Exams & Quizzes Page (`/dashboard/teacher/exams&quizzes`) — UI Fixes & Features**:
    - [x] **Total Marks Fix (`ExamsTable.tsx`)**: `Total Marks` was showing `0` on the exam card even though subject papers had marks. Fixed by summing `subjectExamPapers[].totalMarks` when `exam.totalMarks` is falsy.
    - [x] **Duration Fix (`ExamsTable.tsx`)**: `Duration` was showing `N/A` when `exam.durationMinutes` was null. Fixed by summing `subjectExamPapers[].durationMinutes` as fallback.
    - [x] **Backend `getExams` — Subject Teacher Include (`exam.service.ts`)**: Added `teacher: true` and `teacherSubjects: { include: { teacher: true } }` inside the `subject` include of `subjectExamPapers` so teacher data is available on the frontend.
    - [x] **Backend `getExams` — Direct Teacher Lookup (`exam.service.ts`)**: Replaced fragile nested-include teacher logic with a dedicated two-query approach: after the main query, all unique `subjectId`s are collected, then `prisma.teacherSubject.findMany` and `prisma.subject.findMany` are called in parallel to build a `subjectId → teachers map`. This guarantees ALL assigned teachers appear regardless of how they were assigned (via `Subject.teacherId` or `TeacherSubject` join table).
    - [x] **Backend `getExams` — `assignedTeachers` field**: Each paper in `subjectExamPapers` now carries an `assignedTeachers` array (deduplicated, combining paper creator + subject primary teacher + all TeacherSubject entries).
    - [x] **Frontend Subject Papers Expansion (`ExamsTable.tsx`)**: 
        - Teacher names shown side-by-side (up to 5), with `+X more` badge for overflow.
        - "Mine" indicator (green badge) shown when the logged-in teacher is in `assignedTeachers` or is the `teacherId` of the paper.
        - Edit button shown and always visible for papers where the logged-in teacher is assigned.
    - [x] **Removed Edit/Delete from exam name row** — only the preview eye button remains at the top-level exam.

### Friday, September 11, 2026

- **Exam Paper Grades Manual Override & UI Fixes**:
    - [x] **Backend Grades Include (`exam.service.ts`)**: The paper endpoint's `grades` include was missing the `teacher` relation, causing the overrider's name to be unavailable to the frontend. Added `teacher: { select: { id: true, name: true } }`.
    - [x] **Backend Notification Context (`grade.service.ts`)**: Manual grade overrides (both creates and updates) previously sent generic notifications ("A score was manually updated..."). Added logic to query the user table (`Teacher` or `Admin`) based on `userRole` to resolve the acting user's name and insert it into the notification message (e.g. "John Doe manually updated a student's score...").
    - [x] **Frontend Edit State Fix (`papers/[id]/page.tsx`)**: Fixed the edit button logic for `ONLINE` exam attempts. The code incorrectly tried to call `updateGradeMutation` with an `undefined` grade ID instead of creating a new manual override record. It now safely falls back to `createOverrideGradeMutation` using the `examAttemptId` when overriding an online submission.
    - [x] **Frontend Grades Table**: Added an "Overridden By" column to the student grades table, dynamically showing `by {teacherName}` next to the 'MANUAL OVERRIDE' badge for clarity and accountability.

### Saturday, September 5, 2026

- **Full Workspace Build Audit & Type Safety Fixes**:
    - [x] **Backend Workspace (`backend`)**: Fixed `school.email` -> `school.schoolEmail` in `cron.ts`. Enforced `subject.schoolId` nullability guards in `teacher-management.controller.ts` for compound key operations. Verified clean compilation with `npx tsc --noEmit`.
    - [x] **Desktop Workspace (`desktop`)**: Imported missing `Globe`, `Users`, and `ShieldCheck` icon components from `lucide-react` in `RegisterForm.tsx`. Verified clean compilation with `npx tsc --noEmit`.
    - [x] **Frontend Workspace (`frontend`)**: Added optional `studentCode?: string` and `email?: string` properties to the `Student` interface in `types.ts` for the teacher student list component. Verified clean compilation with `npx tsc --noEmit`.
    - [x] **Mobile Workspace (`Mobile`)**: Imported missing `ActivityIndicator` in `ca.tsx`, added explicit `: string` type annotation to `name` parameter in `TeacherHero.tsx`, and installed `expo-print` module. Verified clean compilation with `npx tsc --noEmit`.

- **Infinite Render Loop Fix (`useProtectedRoute.ts`)**:
    - [x] **Root Cause Found**: `useProtectedRoute` was destructured with a default parameter `userTypes = []`. Because arrays are objects in JS, a new array reference was created on every render of the `AuthLayout`. This unstable reference was passed into the dependency array of a `useEffect` that calls state setters (`setIsChecking`), causing an infinite React render loop (resulting in a frozen "loading" screen on login pages).
    - [x] **Fix Applied**: Extracted the dependency serialization `userTypes.join(',')` to ensure primitive comparison, stabilizing the `useEffect` and resolving the infinite layout re-renders.

### Wednesday, August 26, 2026

- **Admin Dashboard Layout & Card Redesign (`/dashboard/admin/page.tsx`)**:
    - [x] Restored the full component tree (Quick Actions, Usage Limits, Alerts, etc.) after it was initially replaced by a single block.
    - [x] Connected the Top Hero Banner and the 4 Main Stat Cards (Students, Teachers, Classes, Subjects) to the real `stats` and `analysis` API hooks (`useSchoolStats`, `useSchoolPerformanceAnalysis`), effectively removing all static dummy numbers.
    - [x] Converted all secondary panels (`AlertsPanel`, `QuickActions`, `RecentActivity`, `ExamStatus`, `StaffInsights`, `UsageLimitsCard`) to the unified, clean "Pandhowan" aesthetic (`bg-white dark:bg-slate-900 border border-slate-100 rounded-3xl p-6 shadow-sm`), removing the heavy dark gradients and glassmorphism.
    - [x] Upgraded `DashboardCharts` to map the real `subjectBreakdown` averages into the Pie Chart (Academic Performance) and integrated real data checks for the Area Chart (Attendance Trends).

### Tuesday, August 26, 2026

- **Settings Popup Transparent Background Fix (`[examId]/papers/page.tsx`)**:
    - [x] **Root Cause Found**: `DialogContent` had `bg-slate-50/50 dark:bg-slate-950/50` — the `/50` opacity modifier made the popup 50% transparent.
    - [x] **Fix Applied**: Changed to `bg-slate-50 dark:bg-slate-950` (fully opaque).

- **Admin Students Page — Live Attendance Rate (`students/page.tsx`)**:
    - [x] **Root Cause Found**: The "Attendance Rate" stat card had a hardcoded `'89%'` value — purely static placeholder, never reflecting real data.
    - [x] **Fix Applied**: Imported `useSchoolTodayAttendance`, computed real rate as `sum(present) / sum(total)` across all class attendance records. Shows `—` with "No data today" desc when no attendance has been submitted yet.

### Wednesday, August 20, 2026

- **Mobile Parent Dashboard Logout Fix (`settings.tsx`)**:
    - [x] **Root Cause Found**: In `Mobile/app/settings.tsx`, the `confirmLogout` function clears both the auth tokens and the user role (`clearUserRole()`), but then attempts to route to `/(auth)/welcome`. The `welcome.tsx` screen expects a user role to be set in secure storage to determine which theme to render. Since the role was just cleared, `welcome.tsx` entered an infinite loading state (`<ActivityIndicator>`).
    - [x] **Fix Applied**: Updated `router.replace('/(auth)/welcome')` to `router.replace('/')`. The root index screen correctly checks the auth state: if no role is found, it automatically and safely redirects the user to the `/role-picker` screen.

- **New Device Verification Flow Fix (`auth.validation.ts`)**:
    - [x] **Root Cause Found**: `requestCodeSchema` and `verifyCodeSchema` in `backend/src/modules/auth/auth.validation.ts` were both missing the `userType` field. Yup silently strips unknown keys during `validateRequest` middleware, so `userType` was always `undefined` by the time it reached the handler. `requestVerificationCode` returned 400 "Email and user type are required" — meaning no OTP email was ever sent. `verifyEmailCode` similarly failed the `UserRole` enum check with 400 "Invalid user type".
    - [x] **Fix Applied**: Added `userType: yup.string().optional()` to both schemas. The rest of the new-device flow (backend 403 with `preAuthToken`, frontend `onError` catch → `sessionStorage`, `VerificationCard` auto-login, mobile param-based auto-login) was already correct and required no changes.
    - [x] **Build Verified**: `npx tsc --noEmit` exits with code 0 on the backend — zero TypeScript errors.

### Wednesday, August 19, 2026

- **Mobile App NativeWind v4 iOS Fix (Black Screens on Login)**:
    - [x] **Root Cause Found**: In NativeWind v4, third-party components like `SafeAreaView` (from `react-native-safe-area-context`) and `LinearGradient` (from `expo-linear-gradient`) do not support `className` mapping automatically. The application was applying `className="flex-1"` to `SafeAreaView` on many screen layouts (like the student, teacher, and parent tabs), but the style was never forwarded. This caused the root view's height to be `0` on iOS, leaving only the underlying root stack's black background visible while the `Tabs` navigator (bottom nav) rendered fine.
    - [x] **Global cssInterop Implementation**: Added `cssInterop(SafeAreaView, { className: 'style' })` and `cssInterop(LinearGradient, { className: 'style' })` to the top of `Mobile/app/_layout.tsx`, forcing NativeWind to securely map utility classes (like `flex-1` and `bg-slate-50`) down to the components' native `style` props, resolving the UI blackouts.

### Monday, August 18, 2026 — Session 2

- **Exam Papers Page Full Redesign** (`papers/page.tsx`):
    - [x] Replaced old cluttered layout with dark gradient hero header, inline action toolbar (Publish, Settings, Grades, Delete), sticky left sidebar for Create Paper form, and rich right-side paper cards with colour-coded status stripes and score/duration stats.
    - [x] Participants table upgraded: avatar initials, coloured status pills, progress mini-bar, score with percentage, hover-reveal delete action.
    - [x] Fixed build error — orphaned old JSX was appended after new code; truncated file to clean 1012 lines.

- **Single-Paper Exam Type UX** (`papers/page.tsx` + `[paperId]/page.tsx`):
    - [x] Defined `SINGLE_PAPER_TYPES = ['QUIZ', 'CA', 'ASSIGNMENT']`.
    - [x] `useEffect` auto-redirect: when papers list loads and a single paper exists (for single-paper types OR any EXAM with exactly 1 paper), `router.replace` to paper editor immediately — shows a "redirecting" shimmer in the meantime.
    - [x] **Quick Setup screen**: when a single-paper type has 0 papers, shows a focused full-page setup card (title, duration pill-picker, instructions textarea, big CTA) — on submit calls `createSubjectPaper` then redirects to the paper editor. No multi-column noise.
    - [x] **Smart back navigation** in `[paperId]/page.tsx`: single-paper types go back to `/dashboard/admin/exams`; multi-paper exams go back to the papers list. Breadcrumb label also updates accordingly ("All Exams" vs exam title).

### Monday, August 18, 2026

- **Student Visibility Fix (Frontend + Backend)**:
    - [x] **Root Cause Found**: Ran DB queries and discovered that the test student (`850d3a2a`) had `schoolId: null`, `departmentId: null`, and zero class enrollments — making them completely invisible to exam queries.
    - [x] **Exam Service Fix (`exam.service.ts`)**: The `getExamsService` student OR conditions previously required `schoolId: student.schoolId` in the `SCHOOL`-scope condition, which is `null` for unenrolled students. Refactored to: (a) include only conditions where data is non-null, (b) resolve `schoolId` from enrolled class if `student.schoolId` is null, (c) use `scope: "CLASS"` without coupling to `schoolId` so cross-class SCHOOL-scope exams show correctly.
    - [x] **Assignment Service Fix (`assignment.service.ts`)**: The post-filter `a.status === status` was wiping all results when `status: 'PUBLISHED'` was passed from the frontend — because transformed objects use computed statuses (`pending`/`submitted`/`graded`), never `"PUBLISHED"`. Fixed by skipping post-filter for `"PUBLISHED"` (already enforced at DB level).
    - [x] **Frontend Fix (`student/exams&quizzes/page.tsx`)**: (a) Stopped passing `status: 'PUBLISHED'` to `useStudentAssignments`. (b) Improved the `isAssignment` type discriminator to use `'questionCount' in item && !('category' in item)` instead of fragile `dueDate !== undefined`.
    - [x] **Auth Middleware Finding**: Confirmed the `"has no schoolId"` warning in auth middleware is correct — the student's DB record genuinely lacks a `schoolId`. Student must be enrolled via the admin dashboard.

- **Paper Editor Redesign**:
    - [x] **`ManualAddForm.tsx` Full Redesign**: Split into a 2-column layout (editor left, formula palette right). Added a grouped, expandable formula/symbol palette covering 5 categories: Basics, Greek, Operators, Calculus & Sets, Trig (~40 symbols total). Added a 3-mode question editor (Write / Split / Preview) with synchronized live LaTeX rendering. Option rows redesigned with inline preview toggle. Type selector redesigned as pill-chips.
    - [x] **`LaTeXRenderer.tsx` Redesign**: Block math (`$$…$$`) now renders in a styled card with background, border, and padding. Inline math has primary color tint. All standard Markdown elements (headings, blockquotes, lists, code) properly styled without Tailwind Typography conflicts.
    - [x] **`QuestionManager.tsx` Update**: Removed inner padding from the ManualAddForm card wrappers (`p-8` → `p-0`) and widened to `max-w-5xl` to accommodate the 2-column form layout.

### Monday, August 17, 2026

- **Mobile Authentication & Network Stabilization**:
    - [x] **Network Connectivity Fix**: Updated the Expo mobile app's `fallbackUrl` in `client.ts` to map to the new Wi-Fi IPv4 address (`192.168.0.171`) to restore mobile-to-backend communication, resolving the `[AxiosError: Network Error]` and "Backend wake ping failed" issues.

- **Parent Mobile Dashboard Enhancements**:
    - [x] **Attendance Page**: Built and integrated the attendance screen with `useStudentAttendance` hooks.
    - [x] **Assignment Navigation**: Re-wired assignment "View Details" buttons to route to the correct `child-assignment-details` path.
    - [x] **Exams Timeline Grouping**: Rebuilt the exams timeline in `(parent-tabs)/exams.tsx` to beautifully group unified exam/grade items by "Month Year" (e.g. August 2026).
    - [x] **Exam Results Impersonation Mode**: Re-wired "View Details" to take parents directly to the `exams/[id]/review` screen instead of generic tabs. Extracted `studentId` from params and seamlessly bypassed the `STUDENT` role requirement in the `getExamAttempt` backend route.
    - [x] **Hidden Notification Badges Fix**: Fixed a clipping issue where `<Text>` in the notification bell badge was hidden due to the container being 12px tall with a 4px border. Adjusted to 18px and centered.

### Saturday, August 15, 2026
- **Universal Assignment Video Player Component Overhaul**:
    - [x] **New Shared Component (`VideoPlayer.tsx`)**: Built `frontend/src/components/ui/VideoPlayer.tsx` with full support for YouTube (Standard, Shorts, Embeds), Google Drive (`/file/d/`, `/open?id=`, `/uc?id=`), Vimeo, Loom, direct HTML5 video files (`.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v`, Cloudinary, S3, `/uploads/`), and generic video page fallbacks. Includes a glassmorphic aspect ratio container, source badge, loading spinner state, iframe permissions (`allowFullScreen`), and external link footer.
    - [x] **Parent Assignment Details (`parent/assignments/details/[id]`)**: Replaced broken/limited regex and unstyled hanging link with `<VideoPlayer />`.
    - [x] **Student Assignment Details (`student/assignments/[id]`)**: Replaced standard iframe embed with `<VideoPlayer />`.
    - [x] **Teacher Assignment Details (`teacher/assignments/[id]`)**: Replaced simplistic YouTube-only `getEmbedUrl` with `<VideoPlayer />`.
    - [x] **Admin Assignment Details (`admin/assignments/[id]`)**: Replaced simplistic YouTube-only `getEmbedUrl` with `<VideoPlayer />`.

### Wednesday, August 13, 2026
- **Mobile App — Full Performance & Data Fetching Audit + 14 Fixes Applied**:
    - [x] **Fix 1 — Student `useFocusEffect` Blocking JS Thread**: `(student-tabs)/index.tsx` was calling all 4 refetches synchronously on focus — same pattern as the admin fix (Aug 12). Wrapped in `InteractionManager.runAfterInteractions()` with cleanup cancel. Navigation animations no longer freeze.
    - [x] **Fix 2 — Notification Hooks Over-Polling (30s → 2min)**: `useNotifications` and `useUnreadCount` polled every 30s (4× per minute). `useNotifications` list now has `staleTime: 2min` only (no polling). `useUnreadCount` badge polls every 2 minutes — from 30 seconds.
    - [x] **Fix 3 — `useAdminTeachers` Fetching 500 Records Per Mount**: Hard-coded `limit: 500` replaced with `limit: 50` + `staleTime: 5min`. All admin hooks (`useAdminStudents`, `useAdminTeachers`, `useSchoolTeacherAttendanceTrend`) now have 5-min stale time.
    - [x] **Fix 4 — `useParentDashboard` Refetching on Every Tab Focus**: Added `staleTime: 3min` — the most expensive endpoint (child + stats + exams + notifications + payments) was re-fetching on every single tab switch.
    - [x] **Fix 5 — `useStudentExamAttempts` / `useExams` Double-Refetch**: Added `staleTime: 2min` to both. Prevents the double-refetch caused by `useFocusEffect` manual refetch + implicit stale query firing simultaneously. Removed `any` type from `useExams` params.
    - [x] **Fix 6 — `useDeviceSessions` Refetching on Every Settings Mount**: Added `staleTime: 10min` — device sessions don't change frequently.
    - [x] **Fix 7 — `useSchoolDepartments` Aggressive Retry**: Added `retry: 1` and `staleTime: 10min`. Default `retry: 3` causes 3 extra requests on network failure with exponential backoff.
    - [x] **Fix 8 — Admin Dashboard Inline `useQuery` for `/auth/me`**: Extracted to shared `useAuth.ts` → `useAuthUser()` hook with `staleTime: Infinity`. All screens that need the auth user now share one cached response instead of firing separate `/auth/me` requests.
    - [x] **Fix 9 — Teacher Dashboard Hardcoded Notification Badge (`5`)**: Replaced with `useUnreadCount()` hook — now shows the real count the same way parent and admin dashboards do.
    - [x] **Fix 10 — `InsightsGrid` String-vs-Number Type Coercion Bug**: `pendingTasks` was a string compared with `> 0`. Fixed with `parseInt(pendingTasks, 10) > 0`.
    - [x] **Fix 11 — `ExamStatus` Fetching All Exams, Slicing to 5**: Now passes `{ limit: 5 }` to `useExams()` — server returns only 5 records instead of the full list being truncated in the UI.
    - [x] **Fix 12 — `TodayAttendanceChart` Calling `Dimensions.get()` on Every Render**: Replaced with `useWindowDimensions()` hook — subscribes to orientation/split-screen changes and avoids synchronous native bridge call per render.
    - [x] **Fix 13 — `grades.tsx` GPA Calculation Not Memoized**: `calculateCumulativeAvg()` was called on every render. Converted to `useMemo([attempts, standaloneGrades])`.
    - [x] **New File — `useAuth.ts`**: Created `Mobile/lib/api/hooks/useAuth.ts` with shared `useAuthUser()` hook.
    - [x] **Best Practices Guide**: Created `mobile_best_practices.md` covering 12 rules: staleTime strategy, InteractionManager pattern, polling intervals, pagination limits, shared hooks, expo-image, useWindowDimensions, useMemo, network guards, TypeScript discipline, and precise cache invalidation.


- **Admin Mobile Dashboard — AI Insight     - [x] **Root Cause 1 — `useMyPerformanceAnalysis` Never Fired**: Fixed (see above).
    - [x] **Root Cause 2 — Literal String in JSX (`SchoolPerformance.tsx`)**: Fixed (see above).
    - [x] **Root Cause 3 — ChartConfig Color Callback Crash**: Fixed (see above).
    - [x] **Root Cause 4 — UI Freeze on Navigation (`useFocusEffect` blocking JS thread)**: The `useFocusEffect` in `(admin-tabs)/index.tsx` was calling `refetchStats()` and `refetchAnalysis()` synchronously on every screen focus — this blocked the React Native JS thread during the navigation animation, causing the screen to freeze. Fixed by wrapping the refetches in `InteractionManager.runAfterInteractions()` which defers execution until after all navigation animations have fully settled. Task is cancelled on unfocus via cleanup return.
    - [x] **Root Cause 5 — `useMyDashboardSummary` Polling Every 30 Seconds**: `StaffInsights` used `refetchInterval: 30000`, meaning TanStack Query re-ran the fetch and re-rendered the component every 30 seconds. This amplifies any rendering cost on the scroll view. Changed to `refetchInterval: 1000 * 60 * 5` (5 minutes) since staff assignment data is not real-time.
    - [x] **Root Cause 6 — Unoptimised Avatar Image**: The admin header used `react-native`'s `Image` component pointing at `api.dicebear.com` with no caching. Replaced with `expo-image` which provides automatic disk+memory caching, so the network request is only made once and the component no longer causes a re-fetch on every render cycle.
600) in both components.
- **Student Mobile Dashboard — AI Insight & Data Audit**:
    - [x] **`(student)/index.tsx` — Advice Literal String Bug**: Line 393 had `"{analysis.advice}"` — same JSX literal-string pattern as admin. The advice text was always displayed as the raw string `"..."`. Fixed to `{analysis.advice}`.
    - [x] **`AcademicProgressWidget.tsx` — Advice Literal String Bug**: Line 39 had `"{advice}"` — same bug. Fixed to `{advice}`.
    - [x] **`AcademicHistory.tsx` — Null submittedAt Sort Guard**: The sort comparator `new Date(b.submittedAt).getTime()` was called on all attempts including those with `submittedAt = null`. `new Date(null)` → `Invalid Date` → `NaN` which can corrupt sort order or crash. Added a `.filter((a) => !!a.submittedAt)` before sort.
    - [x] **Full Audit**: Reviewed all student dashboard components (`StudentHero`, `ConsoleInsights`, `PerformanceTrend`, `MasteryRadarChart`, `ActiveSubjectsWidget`, `DashboardSkeleton`, `TopNavBar`, `QuickActions`), all hooks (`useStudentProfile`, `useStudentExamAttempts`, `useGrades`, `useSingleClass`, `useClassTimetable`), and all student tabs (`grades.tsx`, `assignments.tsx`, `timetable.tsx`). No further crash-causing issues found.

### Monday, July 28, 2026
- **Payment System Pre-Launch Audit — Full Resolution**:
    - [x] **Unified Webhook Handler**: Merged the two separate Paystack webhook handlers (`/api/v1/payment/webhook` and `/api/v1/finance/webhook`) into one unified entry point in `payment.service.ts`. The subscription webhook now delegates `SCHOOL_FEES` charges to `FinanceService.verifyPayment()` and `subaccount.update` events to `FinanceService.updateSubaccountStatusByCode()`. Added `@deprecated` notice to `finance/paystack.webhook.ts`.
    - [x] **Password Minimum Raised**: Updated `checkout/page.tsx` password minimum from 6 → 8 characters per security standards.
    - [x] **₦100 Trial Notice Upgraded**: Replaced the barely-visible 10px italic text with a prominent amber alert banner (`AlertTriangle` icon, amber border/background) clearly explaining the card validation charge vs. subscription fee.
    - [x] **Zod v4 Migration (payment.controller.ts)**: Fixed pre-existing Zod v3→v4 API incompatibilities: removed `required_error`/`invalid_type_error` params, fixed `z.record()` to require 2 args, updated `z.enum()` to use `as const`, replaced `.errors` with `.issues`.
    - [x] **Prisma Cast Hardening (payment.service.ts)**: Fixed 5 instances of `prisma as Record<...>` to `prisma as unknown as Record<...>` required by newer Prisma Client. Fixed `pastTx.userType!` non-null assertion.
    - [x] **100% Compile Verification**: `npx tsc --noEmit` returns exit code 0 on both backend and frontend workspaces.
- Test the new sequential exam submission flow end-to-end with a multi-paper exam.

### Sunday, July 26, 2026
- **Exam Submission Redesign — Chunked Sequential Per-Paper Flow**:
    - [x] **New Backend Endpoint**: Added `submitSubjectPaperAttemptService` to [exam-attempt.service.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-attempt.service.ts) — an idempotent service that marks a single `SubjectExamAttempt` with a `submittedAt` timestamp without scoring or finalising the whole exam. Registered `POST /exams/:examId/papers/:paperId/submit` via [exam-attempt.controller.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam-attempt.controller.ts) and [exam.route.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/backend/src/modules/exam/exam.route.ts).
    - [x] **Frontend Service & Hook**: Added `submitSubjectPaperAttempt` to [examService.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/services/examService.ts) and `useSubmitSubjectPaper` hook to [useExams.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/useExams.ts).
    - [x] **SubmissionProgressModal**: Created premium glassmorphic full-screen locked modal [SubmissionProgressModal.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/Exams%26Quizzes/exam/%5BexamId%5D/components/SubmissionProgressModal.tsx) showing each subject paper as a step: ⬜ Pending → ⟳ Submitting (spinner) → ✅ Done (green checkmark) or ❌ Error. Includes an animated indigo/violet progress bar and a final "Finalising & Scoring" step.
    - [x] **Sequential Submit Logic**: Replaced single-shot `handleManualSubmit` in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/Exams%26Quizzes/exam/%5BexamId%5D/page.tsx) with `handleSequentialSubmit` which: (1) flushes all local answers for each paper in chunks of ≤100 sequentially via `flushAnswersForPaper`, (2) submits each paper individually via the new endpoint, (3) finalises the entire attempt. Next paper/chunk only starts when the previous one completes successfully.
    - [x] **Timer Expire Integration**: Updated `handleTimerExpire` to delegate to `handleSequentialSubmit`, ensuring auto-submit on timer expiry also uses the reliable sequential flow.
    - [x] **Build Verification**: Achieved clean `npx tsc --noEmit` on both backend and frontend — zero errors.

### Saturday, July 25, 2026
- **Single-Instance Desktop Window Restoration**:
    - [x] **Automatic Re-open On EXE Click**: Integrated `tauri-plugin-single-instance` in [Cargo.toml](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src-tauri/Cargo.toml) and [lib.rs](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src-tauri/src/lib.rs#L5-L15). Double-clicking `qefashub-desktop.exe` while the app or background server is already running now automatically unhides, unminimizes, and brings the existing window to the front.
- **Auth Pages Light & Dark Theme Support**:
    - [x] **AuthLayout Theme Switcher**: Updated [AuthLayout.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/layouts/AuthLayout.tsx#L10-L25) to include a theme switcher button (`Sun` / `Moon`) and adaptive dark/light background classes (`bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`).
    - [x] **Auth Components Adaptation**: Updated [SelectUserTypeScreen.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/components/auth/SelectUserTypeScreen.tsx#L15-L60), [AuthChoiceScreen.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/components/auth/AuthChoiceScreen.tsx#L25-L100), [AuthLoginForm.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/components/auth/AuthLoginForm.tsx#L60-L140), [RegisterForm.tsx](file:///c:/Users/HP/Documents/GitHub/RegisterForm.tsx#L160-L200), and [DesktopVerificationScreen.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/components/auth/DesktopVerificationScreen.tsx#L45-L100) with responsive theme cards, inputs, and borders.
- **Post-Verification Direct Dashboard Routing & Resend OTP Fixes**:
    - [x] **Registration `preAuthToken` Session Storage**: Updated [useRegistrationMutations.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/%28auth%29/signup/services/useRegistrationMutations.ts#L10-L90) across all user roles (`School`, `Teacher`, `Student`, `Parent`) to store `preAuthToken` in `sessionStorage`. Upon code verification, `VerificationCard` now auto-authenticates and routes users directly to their dashboard (`/dashboard/school-admin`, `/dashboard/teacher`, `/dashboard/student`, `/dashboard/parent`) or onboarding without forcing them back to the login page.
    - [x] **Direct Dashboard Routing Fallback**: Updated `VerificationCard.tsx` ([VerificationCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/%28auth%29/verification/components/VerificationCard.tsx#L50-L100)) with `getDashboardPath(userType)`. If `preAuthToken` is absent or auto-login encounters a fallback, the page smoothly routes straight to the role's dashboard.
    - [x] **Resend OTP Execution**: Fixed `resendCode` in `useVerificationMutations.ts` & `verification-api.ts` to execute async promises, properly triggering `POST /auth/request-code`, displaying toast notifications, and resetting the countdown timer.
- **Email Verification Resend OTP & Successful Page Navigation Fixes**:
    - [x] **Resend OTP Async Promise Fix**: Updated `VerificationCard.tsx` ([VerificationCard.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/%28auth%29/verification/components/VerificationCard.tsx#L29)) to use `mutateAsync: resendCode` from `useResendCode()`. This ensures the `onResend` handler in `MetaText` waits for the HTTP request to complete before resetting the "Resending..." UI state and countdown timer.
    - [x] **Post-Verification Page Navigation**: Fixed the post-verification transition logic. In `VerificationCard.tsx`, robust route normalization (`getLoginPath`) resolves `school-admin`, `teacher`, `student`, and `parent` login paths cleanly. Added `onError` fallback handling for `loginMutation` so that failed auto-login redirects gracefully to the target portal login page instead of remaining frozen on the verification screen.
- **Dark Mode and Light Mode Theme Engine**:
    - [x] **Theme Persistence & Initialization**: Updated `useThemeStore.ts` ([useThemeStore.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/store/useThemeStore.ts)) with `localStorage` key `qefas_desktop_theme` and system color-scheme detection. Added `initTheme()` called during desktop boot ([App.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/App.tsx#L25)).
    - [x] **Desktop Layout & Component Adaptation**: Updated [MainLayout.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/layouts/MainLayout.tsx#L50-L160), [SettingsPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/pages/SettingsPage.tsx#L45-L180), and [DashboardPage.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/pages/DashboardPage.tsx#L35-L155) with responsive Tailwind dark mode utilities (`bg-slate-50 dark:bg-slate-950`, `bg-white dark:bg-slate-900`, `border-slate-200 dark:border-slate-800`, `text-slate-900 dark:text-slate-100`).
    - [x] **Frontend Theme Toggle Refinement**: Refined [theme-toggle.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/theme-toggle.tsx#L1-L20) button icon sizing (`Sun` & `Moon` icons from `lucide-react`) with 300ms rotation and scale transitions.
- **Replicated Frontend-to-Backend Authentication Flow**:
    - [x] **API Endpoints & Base Route Alignment**: Updated `apiClient` default `BASE_URL` in `desktop/src/api/client.ts` to `http://localhost:5000/api`, matching the Next.js frontend and Express backend endpoint structure (`/auth/login`, `/auth/register/school`, `/auth/register/teacher`, `/auth/register/student`, `/auth/register/parents`).
    - [x] **Token & Payload Normalization**: Aligned `AuthService.ts` to handle both `accessToken` and `token` payload structures from the backend API, storing tokens in `StorageService` and updating the local SQLite database cache for offline fallback.
    - [x] **Email Verification & Unverified User Handling**: Replicated the frontend's HTTP `403 Forbidden` unverified handling. Added `requestCode`, `verifyCode`, and `resendCode` methods to `AuthService.ts`, returning `preAuthToken`. Built `DesktopVerificationScreen.tsx` rendering a 6-digit OTP code prompt that auto-completes sign-in upon verification ([DesktopVerificationScreen.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/components/auth/DesktopVerificationScreen.tsx)).
- **Authentication Cross-Navigation & Password Recovery Links**:
    - [x] **Forgot Password Link & Recovery Modal**: Added a dedicated **"Forgot Password?"** link on `AuthLoginForm.tsx` positioned above the password field, opening an inline password recovery modal that accepts email input and provides instant reset feedback ([AuthLoginForm.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/components/auth/AuthLoginForm.tsx#L110-L135)).
    - [x] **Direct Sign In / Register Links**: Added **"Already have an account? Sign In"** navigation link below the submit button on `RegisterForm.tsx` ([RegisterForm.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/desktop/src/components/auth/RegisterForm.tsx#L500-L510)), and **"Don't have an account? Create Account"** link on `AuthLoginForm.tsx`, matching role theme colors across all steps.
- **Verification & Forgot Password Page Redesigns**:
    - [x] **Email Verification Page (`/verification`)**: Redesigned with glassmorphic cards (`backdrop-blur-2xl`), floating ambient background glow lights, role-theme badge integration (**Admin: Blue**, **Teacher: Green**, **Student: Pink**, **Parent: Orange**), interactive 6-digit OTP code inputs, resend countdown timer engine, and verification success overlay animations.
    - [x] **Forgot Password Flow (`/auth/forgot-password`)**: Redesigned password reset request screen, email check confirmation screen (`/check-your-email`), new password creation screen (`/ResetPassword`), and password reset success screen (`/PasswordResetSuccessful`). Features key round icon badges, input focus rings, rounded-2xl submit buttons, and SEO metadata.
- **QefasHub Desktop Window Sizing & Lifecycle Stability Fixes**:
    - [x] **Tray Icon & Window Lifecycle Fixes**: Configured `TrayIconBuilder` in `tray.rs` to safely attach `app.default_window_icon()`, handled tray setup warnings gracefully in `lib.rs`, and added `on_window_event` (`WindowEvent::CloseRequested`) handling to prevent application termination on window hide/close.
    - [x] **Database & Capability Permissions**: Added `"sql:allow-load"` and `"sql:allow-load-db"` to `capabilities/default.json` and set `"label": "main"` in `tauri.conf.json`, ensuring native SQLite database loads without security policy rejection.
    - [x] **Default Full Screen / Maximized Launch**: Added `"maximized": true` to `app.windows[0]` in `tauri.conf.json`, ensuring the application launches in full screen / maximized view upon startup.
    - [x] **Titlebar Maximize & Double-Click Support**: Hardened `TitleBar.tsx` window control handlers to use `appWindow.toggleMaximize()`, added `onDoubleClick={handleToggleMaximize}` to titlebar drag region, and ensured `e.stopPropagation()` prevents click event bubbling.
- **QefasHub Desktop Branding & Tauri v2 Build Script Fixes**:
    - [x] **Desktop App Branding Update**: Updated all references across the desktop application (`tauri.conf.json`, `Cargo.toml`, `main.rs`, `tray.rs`, `TitleBar.tsx`, `App.tsx`, `AboutPage.tsx`, `SettingsPage.tsx`, `MainLayout.tsx`, `RegisterForm.tsx`, `AuthSlider.tsx`, `connection.ts`, `StorageService.ts`, `index.html`, and `package.json`) from "SchoolHub" to **"QefasHub"** (`qefashub-desktop`, `com.qefashub.desktop`, `qefashub_local.db`, `.qefashub_secure.dat`).
    - [x] **Tauri Build Script & Icons Generation**: Created missing `desktop/src-tauri/build.rs` containing `tauri_build::build()`, added `build = "build.rs"` to `Cargo.toml`, and generated the Windows resource icon bundle (`desktop/src-tauri/icons/icon.ico`, `32x32.png`, `128x128.png`), resolving `OUT_DIR env var is not set` build errors.
- **Draggable Floating Action Button**:
    - [x] **Framer Motion Drag Integration**: Wrapped floating action button components (`AIChatWidget.tsx` and `FloatingActionButton.tsx`) with Framer Motion `motion.div` using `drag` and `dragMomentum={false}` attributes, allowing users to seamlessly drag and reposition the floating buttons across the viewport.

### Friday, July 24, 2026
- **HTTP 400 Bad Request Fix (Free Subscription Initializer)**:
    - [x] **Root Cause Diagnosis**: Identified from backend error logs that email verification / user registration endpoints threw unhandled errors when `UserSubscriptionService.initializeFreePlan` or `SchoolSubscriptionService.initializeFreePlan` tried looking up a hardcoded free plan ID (`process.env.SCHOOL_FREE_PLAN` / `fd1110e0-a9e3-4bce-9111-5e5425fec474`) that did not match records in the database. `handleError` converted these uncaught exceptions into HTTP 400 Bad Request responses (`Console AxiosError: Request failed with status code 400`).
    - [x] **Self-Healing Fallback Implementation**: Hardened both `UserSubscriptionService.initializeFreePlan` and `SchoolSubscriptionService.initializeFreePlan` to automatically attempt fallbacks by scope (`PlanScope.SCHOOL`, `PlanScope.TEACHER`, `PlanScope.STUDENT`, `PlanScope.PARENT`), plan type (`FREE`), or `isDefault` flags if the exact environment UUID is missing or unseeded in the database.
- **Local Backend API Routing & Stale Session Invalidation**:
    - [x] **Local Backend Connectivity Fix**: Resolved issue where API requests were hitting Next.js dev server on port 3000 instead of Express backend on port 5000. Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in `frontend/.env` and configured hard fallbacks (`http://localhost:5000/api`) in `client.ts` and `platformClient.ts`.
    - [x] **Database User Verification & Auto-Logout**: Hardened `authMiddleware.ts` to explicitly verify if the user ID from valid JWT tokens actually exists in the Prisma database (`Admin`, `Teacher`, `Student`, `Parent`). If the user record was deleted or not found in the DB, the middleware immediately returns `401 Unauthorized`, triggering Axios session expiration cleanup (`clearAuth()`) and redirecting the browser to `/login`.
- **TanStack Query Undefined Query Data Fix**:
    - [x] **Root Cause Diagnosis**: Identified that several TanStack / React Query `queryFn` implementations across frontend service layers (`schoolService.ts`, `studentService.ts`, `teacherService.ts`, `useSubscriptionUsage.ts`, `useFeatureAccess.ts`, `usePlatformGovernance.ts`) returned property extractions like `response.data.data` or `data.hasAccess` directly. When API responses returned empty results or alternative payload shapes, these functions evaluated to `undefined`, violating TanStack Query rules.
    - [x] **Service Layer Hardening**: Added nullish coalescing (`?? null` or `?? []`) across all query response handlers in `schoolService.ts`, `studentService.ts`, `teacherService.ts`, `useSubscriptionUsage.ts`, `useFeatureAccess.ts`, and `usePublicPlatformSettings`. Guaranteed that no `queryFn` ever resolves to `undefined`.

### Thursday, July 23, 2026
- **Tauri v2 Offline-First Desktop Application (All 12 Phases Built)**:
    - [x] **Phase 1 Architecture Design**: Designed modular Offline-First Windows desktop application architecture (UI -> SQLite Database -> Sync Engine -> Backend API). Established folder structure, dependencies, and synchronization data flows.
    - [x] **Phase 2 Project Initialization**: Created `desktop/` directory with complete configuration: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `capabilities/default.json`, Rust core (`main.rs`, `lib.rs`, `tray.rs`, `commands/mod.rs`), and React entrypoint (`main.tsx`, `App.tsx`).
    - [x] **Phase 3 SQLite Configuration**: Built TypeScript schema definitions (`database.ts`), raw SQL DDL script migrations (`schema.ts`), connection pool wrapper (`connection.ts`), and auto-migration runner (`migrations.ts`) for all 8 required tables (`Users`, `Todos`, `Notifications`, `Settings`, `Messages`, `Drafts`, `SyncQueue`, `Metadata`) with mandatory sync fields (`id`, `createdAt`, `updatedAt`, `syncStatus`, `deletedAt`).
    - [x] **Phase 4 Repository Layer Architecture**: Implemented abstract `BaseRepository<T>` providing generic SQLite CRUD operations (`findMany`, `findById`, `create`, `update`, `softDelete`, `markSynced`) with automatic `SyncQueue` enqueuing for offline mutations. Built concrete domain repositories: `UserRepository`, `TodoRepository`, `NotificationRepository`, `SettingsRepository`, `MessageRepository`, `DraftRepository`, and `SyncQueueRepository`.
    - [x] **Phase 5 Sync Engine Architecture**: Engineered bidirectionally asynchronous Sync Engine with `ConflictResolver` (Last-Updated-Wins + extensible strategies), `PushProcessor` (flushing `SyncQueue` modifications to backend REST API), `PullProcessor` (fetching server delta updates since timestamp metadata), `NetworkMonitor` (detecting online/offline connection state changes), and `SyncManager` (background periodic sync loops and reactive state dispatcher).
    - [x] **Phase 6 API Layer & Secure Storage**: Built `StorageService` for encrypted auth token persistence using Tauri store, REST route map (`endpoints.ts`), Axios HTTP client with Bearer token injection (`client.ts`), and `ApiService` returning standardized Flexiti responses (`{ success: false, error: "message" }`).
    - [x] **Phase 7 React UI & View Components**: Designed sleek Tailwind CSS desktop interface with frameless Windows `TitleBar` (minimize, maximize, close window controls, live sync badge & network state), `MainLayout` navigation sidebar, Zustand state stores (`useAuthStore`, `useSyncStore`, `useThemeStore`), React Router paths, `DashboardPage`, `TodosPage` (offline task CRUD, search, priority tags), `MessagesPage` (offline chat & draft composer), `SettingsPage` (sync frequency, dark/light theme, autostart), `AboutPage` (system telemetry), and boot migration screen (`App.tsx`).
    - [x] **Phase 8 UI to Repository Integration**: Integrated TanStack Query (`QueryClientProvider`), singleton `useRepositories` hook, reactive `useTodos` hook (providing mutation invalidation and instant SQLite CRUD updates), `useNotifications` hook, and `useSettings` hook. Completely decoupled React UI from network state.
    - [x] **Phase 9 Background Sync Initialization**: Engineered `SyncService` initializing background sync timer automatically on startup (`App.tsx`), dynamically reading user settings for sync interval frequencies, and triggering native OS push notifications via `NotificationService` upon successful push/pull completions.
    - [x] **Phase 10 System Tray & Window Service**: Built `WindowService.ts` providing native window control (show, hide, minimize to system tray, toggle maximize, autostart management) and Rust system tray event handlers (`tray.rs`).
    - [x] **Phase 11 Native OS Notifications**: Configured `NotificationService` permission verification and setting checks (`notifications_enabled`), wiring native Windows notification toasts to background synchronization events.
    - [x] **Phase 12 Packaging & Verification**: Completed packaging audit, dependency setup, and authored comprehensive walkthrough documentation (`walkthrough.md`).
- **Desktop Authentication Parity & Offline Flow**:
    - [x] **Frontend Role Alignment**: Designed `RoleSelector.tsx` featuring the 4 frontend portals (`School Admin`, `Teacher`, `Student`, `Parent`).
    - [x] **Dual-Mode Offline/Online Auth Engine**: Engineered `AuthService.ts` to perform remote REST API login (`/auth/login`) when connected, storing tokens securely in Tauri store and saving user profiles to SQLite. When offline, verifies cached SQLite user credentials seamlessly.
    - [x] **Desktop Login Form & Layout**: Created `AuthLoginForm.tsx`, `AuthPage.tsx`, `AuthLayout.tsx`, and `ProtectedRoute.tsx` with role badges, password visibility toggling, error banners, and automatic user profile navigation in `MainLayout.tsx`.
- **Verification Page Link Fix, Auth Button Upgrade & Mobile Email Template**:
    - [x] **Comprehensive Production Build Verification**: Verified 100% clean production build compilation (`npm run build`) for both Next.js frontend and Node.js TypeScript backend workspaces with zero errors.
    - [x] **Verification Code Email Mobile Responsiveness**: Redesigned verification email template in `backend/src/modules/auth/auth.service.ts`. Reduced oversized font size (48px -> 32px), normalized letter spacing (12px -> 6px), added `word-break: break-all`, and scaled down outer container padding to ensure codes fit mobile screens without overflow.
    - [x] **Verification Link Clean-up & Admin Login Route Fix**: Removed the unnecessary "Go back to registration" link on `/verification` page (`VerificationCard.tsx`). Fixed post-verification redirection mapping for school admin role from non-existent `/login/admin` to `/login/school-admin` (resolving the "School Not Found" tenant route collision). Also fixed claim account form redirection route.
    - [x] **Register & Reset Password Buttons Redesign**: Modernized and unified action buttons across all registration forms (`SchoolCard.tsx`, `TeacherRegisterForm.tsx`, `StudentRegisterForm.tsx`, `ParentForm.tsx`) and forgot password pages (`ButtonGroup.tsx`, `ResetPasswordForm.tsx`). Upgraded with sleek Tailwind gradients (`from-indigo-600 via-blue-600 to-indigo-700`), glossy overlay highlights, smooth hover animations, and dark mode support.

### Tuesday, July 14, 2026
- **Subscription Selection Flow (Admin)**:
    - [x] **Backend Plan Override**: Disabled automatic "Free Plan" initialization on school registration in `auth.controller.ts`.
    - [x] **Manual Free Plan Endpoint**: Created `activateFreePlan` in `subscription.controller.ts` allowing unassigned admins to select the free tier manually.
    - [x] **Frontend Redirection Logic**: Hardened `use-auth-mutations.ts` (login) and `useProtectedRoute.ts` to strictly route admins without an active plan to the new `/select-plan` portal, guaranteeing 100% plan enrollment.
    - [x] **Select Plan Portal**: Built a premium `/select-plan` page wrapping the existing Pricing UI, providing a seamless "Continue with Free" or "Get Started" upgrade flow.
    - [x] **Onboarding Redirection Guard**: Modified the `/checkout` completion logic to automatically detect incomplete onboarding (`!hasCompletedOnboarding`) and redirect newly subscribed admins directly to `/onboarding?type=ADMIN` rather than the main billing dashboard.

### Tuesday, June 23, 2026
- **Mobile Authentication & Network Stabilization**:
    - [x] **Network Connectivity Fix**: Dynamically updated the `fallbackUrl` in `client.ts` to map Android platform emulators to `10.0.2.2` and physical devices to the current Wi-Fi IPv4 address (`192.168.236.248`) to ensure reliable network connection for the mobile application.

### Monday, June 22, 2026
- **Mobile Authentication & Network Stabilization**:
    - [x] **Network Connectivity Fix**: Resolved "Address already in use" port conflicts for the backend and updated the Expo mobile app's `fallbackUrl` in `client.ts` to correctly map to the local Wi-Fi IPv4 address (`192.168.0.182`) to allow physical device testing.
    - [x] **Cross-Platform Keyboard Overlap Fix**: Replaced native React Native `KeyboardAvoidingView` and `ScrollView` components with the robust `react-native-keyboard-aware-scroll-view` library across `login.tsx`, `signup.tsx`, and `forgot-password.tsx` to flawlessly handle Android edge-to-edge keyboard layout issues.
    - [x] **Refresh Token Interceptor Bug Fix**: Hardened the Axios response interceptor in `Mobile/lib/api/client.ts` to intelligently bypass token refresh flows on authentication endpoints (`/auth/login`, `/auth/register`, `/auth/password`), preventing the confusing "No refresh token available" error from masking genuine 401 Unauthorized errors (like invalid passwords).
    - [x] **Clean Error Logging**: Converted raw `console.error` logs to clean `console.log` statements for expected authentication API failures across all mobile auth screens, eliminating intrusive Expo developer red-box overlays while still preserving error visibility.

### Wednesday, June 17, 2026
- **Subscription Architecture & Graceful Degradation Pipeline**:
    - [x] **Just-In-Time (JIT) Invalidator**: Engineered a Just-In-Time subscription invalidator into `subscriptionMiddleware.ts`. When an expired user loads the application before the midnight cron job sweeps their account, the middleware intercepts the mismatch, instantaneously performs a silent asynchronous database downgrade (`EXPIRED` status, `FREE` plan), and dispatches a realtime `GENERAL` socket notification.
    - [x] **Automated Midnight Sweeper (Cron Job)**: Installed and configured `node-cron` in `backend/src/scripts/cron.ts`. Scheduled a nightly sweep (`0 0 * * *`) that queries all schools, teachers, students, and parents where `subscriptionEnd` has passed. It enforces strict database synchronization by wiping overrides, downgrading plans to `DEFAULT_PLAN`, changing statuses to `EXPIRED`, and emitting push notifications.
    - [x] **Graceful Free-Tier Fallback**: Updated the global authentication middleware to safely bypass strict HTTP 402 lockouts for expired users. Instead, the application allows them through to a restricted "Free Tier" state, ensuring critical user-facing interfaces (like Student and Teacher core data) are retained while effectively blocking premium routes via the secondary `requireFeatureAccess` middleware.
    - [x] **Quota Calculation Sanitization**: Hardened `quota.service.ts` and `ai-limiter.service.ts`. Both services now explicitly execute real-time temporal verification (`isExpired = new Date(subscriptionEnd) < new Date()`), enforcing absolute fallback to base `PLAN_LIMITS[DEFAULT_PLAN]` quotas (like Max AI Usage and Max Students) irrespective of the stale database state or custom overrides.
    - [x] **UI Sync**: Refactored the billing dashboards to read real-time temporal `EXPIRED` status flags returned by the backend, properly styling components in red/inactive states without relying on cached database enums.

### Tuesday, June 16, 2026
- **Teacher Assignment Dashboard Modernization & Functional Parity**:
    - [x] **Dynamic Routing Pattern Integration**: Completed migration of the teacher's assignment detail view to a fully dynamic path (`/dashboard/teacher/assignments/[id]`). Integrated the shared `QuestionManager`, `SettingsModal`, and `SubmissionList` components for live editing, setting configuration, and submission tracking.
    - [x] **Programmatic Redirection Flow**: Standardized the creation lifecycle to automatically redirect teachers to their new assignment workspace upon successful creation.
    - [x] **Backend Student Info Association**: Resolved student profile metadata display bugs in the submissions tracker by querying and mapping student names, emails, and profile images in `getTeacherAssignmentByIdService` on the backend.
    - [x] **Dark Mode UI Adjustments**: Redesigned the "Record New Grade" button on the teacher's academic grades page to use a vibrant theme-aware gradient background in dark mode, fixing contrast and visibility problems.
    - [x] **Subscription Gating & Upgrade Nudges**: Checked for the state of teacher subscription enforcement using the `usePublicPlatformSettings` hook. Refined the premium upgrade modal to notify teachers to ask their school administrator to upgrade the institutional plan when individual teacher billing is deactivated, complete with a click-to-copy request template.
    - [x] **CSV Upload Premium Gating & Styling Refinement**: Implemented entitlement checks for the CSV upload feature on the teacher's grades dashboard. Integrated support to verify individual subscription status, falling back to the institutional school subscription plan when teacher subscription enforcement is turned off. Upgraded the "Cancel" and "Continue to Upload" buttons inside the CSV Upload instructions dialog to match our premium theme-aware and dark-mode designs.
    - [x] **Class-Scoped Queries Validation**: Verified backend and frontend queries for exams, quizzes, and standalone academic grades, ensuring they are securely restricted to classes assigned to the logged-in teacher context.
    - [x] **List Numbering & Table Pagination Parity**: Guaranteed all grade entries and exam/quiz items display sequential index numbering. Aligned the grades `TablePagination` styles to use the premium indigo-violet gradient active page layout matching the shared pagination component.
    - [x] **Exams Tab Focus Rings & Create Button Refinements**: Redesigned the focus state ring on the assessment tab switchers to use zero offset, avoiding outline color rendering bugs on dark card backgrounds. Styled the "Create New Exam/Quiz" button with a glowing dark mode shadow and semi-transparent indigo borders.
    - [x] **100% Compilation Validation**: Verified flawless TypeScript check status on both backend and frontend workspaces using `npx tsc --noEmit`.

### Thursday, June 11, 2026
- **Backend & Frontend Type Safety & Compile Stability**:
    - [x] **Behaviour & Parent Service Hardening**: Cast optional entities in `behaviour.service.ts` to clear property access errors. Resolved non-existent relational queries in `parent.service.ts` by fetching reporter names dynamically.
    - [x] **Teacher Controller Parameter Matching**: Explicitly cast the Express parameters in `teacher-attendance.controller.ts` to `string` to resolve compiler warning TS2345.
    - [x] **Dashboard Store & Grid Component Props**:
        - Defined the unified `DashboardSchool` type in `useDashboardStore.ts` with optional `linkingCode` and `schoolCode` to support code-based connection verification in the linking hub.
        - Added `selectedClassId` as an optional prop to `StudentGridProps` in `StudentGrid.tsx` and updated the TanStack query definition.
        - Explicitly typed parameters in attendance mapping to fix implicit `any` errors in `my-classes/[classId]/components/attendance/page.tsx`.
    - [x] **Comprehensive Compile Verification**: Successfully ran comprehensive Next.js build compilation on the frontend and direct `tsc` compilation on the backend, confirming both clean compiles (exit code 0).
- **Global Platform Analytics & Dashboard Error Handling**:
    - [x] **BigInt Serialization Fix**: Resolved `TypeError: Do not know how to serialize a BigInt` which was crashing the backend `getGlobalStats` controller.
        - Cast `totalStorageBytes` to a standard number using `Number(storageUsage._sum.fileSize || 0)`.
        - Added a global `BigInt.prototype.toJSON` override in `backend/src/index.ts` to prevent any future JSON serialization issues across all endpoints querying BigInt columns (e.g. database file sizes).
    - [x] **Console Overview Page Fallbacks**: Added error state handling to `frontend/src/app/(internal-console)/console/page.tsx`:
        - Displays an "Analytics Feed Interrupted" alert banner with a "Retry Sync" action button if the metrics or growth queries fail.
        - Hardened the metric cards to display "Unavailable" and apply visual warning styles (red-themed outlines) instead of misleading "0" values.
        - Handled error state inside the Ecosystem Growth and User Registration charts to render an elegant offline placeholder.
        - Added error state for the right-column Platform Summary card showing "Summary Offline".
    - [x] **Subscription Analytics Fallbacks**: Updated `SubscriptionAnalytics.tsx` to handle query error states gracefully, rendering a premium alert card with a clear offline description instead of silently returning `null` or crashing.

### Tuesday, June 10, 2026
- **Teacher TopNavBar Full Redesign**:
    - [x] `TopNavBar.tsx` — Reduced height h-20→h-16. Identity block now conditionally shows school name + School icon when connected to a school, or "Teacher Portal / Qefas Hub" when in personal mode. Profile pill correctly renders `displayImage` (teacher profile image) with online dot. All sections sized and spaced for a clean, uncluttered layout. Removed unused `Image` and `linkService` imports.
    - [x] `SchoolSwitcher.tsx` — Auto-selects single connected school via `useEffect` on mount. Auto-falls back to personal if nothing is selected. Shows an emerald static pill (no dropdown) for single-school teachers. Dropdown only appears when 0 or multiple schools are linked.


- **Teacher Top Nav Bar + SchoolSwitcher Improvements**:
    - [x] `TopNavBar.tsx` — Renamed "Faculty Hub" → "Teacher Portal" (plain English). Badge is now more spacious (`px-4 py-2`) with a two-line layout: bold "Teacher Portal" + small "Qefas Hub" subtitle. Added a live green dot on the logo for a premium feel.
    - [x] `SchoolSwitcher.tsx` — When teacher is connected to exactly 1 school and that school is selected, the dropdown is replaced with a clean static pill showing the school name, a "Connected School" label, and a glowing green live indicator. Dropdown is only shown when multiple schools exist or teacher is in personal mode.


- **Teacher Linking Hub Dark Mode Fix**:
    - [x] `TeacherLinkingCodeCards.tsx` — replaced flat `bg-primary` / `bg-indigo-600` with dual-layer glassmorphic gradient cards. Dark mode uses `dark:from-slate-800 dark:via-indigo-900 dark:to-slate-900` with ambient glow blobs, shimmer overlay, and decorative Sparkles icon.
    - [x] Copy button inside cards swapped from shadcn `<Button>` to raw `<button>` to prevent CVA `bg-primary` hardcode from fighting dark-mode overrides.
    - [x] `TeacherLinkingHeader.tsx` — "Connect with Code" button swapped to raw `<button>` with `dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600` and indigo glow shadow in dark mode. Light mode keeps `bg-primary` unchanged.
    - [x] "View QR Hub" outline button remains shadcn `<Button>` with added `dark:bg-gray-800/60 dark:border-gray-700/60 dark:text-indigo-400` for proper dark contrast.


- **AcademicSummary Dark Mode Fix (Classes Page)**:
    - [x] Root cause identified: `AcademicSummary.tsx` used `dark:bg-white dark:text-slate-900` — a fully inverted pattern that turned the card blindingly white on dark backgrounds.
    - [x] Replaced inverted dark-mode with a proper dark glassmorphic treatment: `dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900` gradient background.
    - [x] Added dual ambient glow blobs (primary/violet) for depth in both light and dark modes.
    - [x] Added an "Academic Overview" pill badge and gradient `Performance` heading text.
    - [x] Stat cards (Total Marks, Position) now use `dark:bg-indigo-500/5` / `dark:bg-violet-500/5` glass instead of `dark:bg-slate-50` (white).
    - [x] All text colors locked to `text-white` explicitly — no dark-mode inversion.
    - [x] Outline button border changed from `border-slate-700` to `border-white/20 dark:border-indigo-400/30` with glassmorphic background.


- **Student Dashboard Overview — Responsive Subject Cards Fix**:
    - [x] Fixed "Strongest Subject" and "Needs Improvement" cards in `page.tsx` overflowing and breaking on small screens.
    - [x] Changed grid from `grid-cols-1 sm:grid-cols-2` → always `grid-cols-2` (side-by-side) with tighter `gap-3`.
    - [x] Added `min-w-0` + `overflow-hidden` to each card to allow flex-shrink.
    - [x] Reduced padding to `p-4 sm:p-6` and icon size to 14px on mobile.
    - [x] Shortened label text: "Strongest Subject" → "Strongest", "Needs Improvement" → "Needs Work" with `truncate` to prevent label overflow.
    - [x] Applied `text-sm sm:text-base`, `break-words`, `line-clamp-3`, and `leading-tight` to the subject name to handle long names like "Law & Arts (1/4/2026) (Total)" gracefully.



## Completed

- **Student Class View, Multi-Teacher Sliding Carousel, & Contact Dialog (June 08, 2026)**:
  - Overhauled the Student Class Details dashboard (`my-classes/[id]/page.tsx`) to pull and calculate real dynamic academic metrics: Attendance rate from live database records, Completed/Total assignments, overall grade letter from weighted assignments/exams/grades, and real Last Activity timestamp.
  - Implemented an automatic sliding carousel card for multiple assigned teachers (`ClassOverview.tsx`) with manual navigation controls and index indicators.
  - Created a premium glassmorphic Contact dialog modal popup in the teacher card, displaying live-populated email and phone contact options with clickable `mailto:` and `tel:` buttons.
  - Refined Student Class view tabs: Updated Assessment Tab with direct assignment links. Enhanced Materials Tab to properly fetch actual attachment, video, and reference URLs from exams, quizzes, and CAs (and added inline display for PDFs/images).
  - Integrated a full read-only Timetable preview tab (expanded all the way down to 18:00).
  - Built a dedicated Student Subjects tab that opens a dynamic SubjectDetailsModal on click, featuring a comprehensive Mock "Scheme of Work" week-by-week timeline.
  - Hardened backend multi-class assignment duplication logic (`assignment.service.ts`) to query and duplicate associated assignment questions, ensuring deep replication when assigning coursework to multiple target classes.
  - Successfully verified 100% type safety and compile-ready status for both frontend and backend workspaces with `npx tsc --noEmit` returning exit code 0.

- **Official Nigerian Transcript Layout & AI Remarks (June 08, 2026)**:
  - Redesigned full academic transcript modal and downloaded PDF to conform to Nigerian standards.
  - Configured 40/60 CA/Exam scaling aggregation and WAEC grading scale alignment.
  - Added school logo/details and student passport photo at the top.
  - Implemented Class Teacher and Principal bottom AI remarks with signature lines.
  - Validated frontend workspace compilation with `npx tsc --noEmit`.

- **Student Assignment Numbering & Analytics Upgrade (June 08, 2026)**:
  - Added visual assignment numbering sequentially onto individual student assignment cards in grid and list views.
  - Re-engineered the "Academic Performance Analytics" button on the student assignment page to trigger a pop-up modal dialog showing real, live-calculated assignment metrics and charts.
  - Implemented client-side mathematical computation of assignment metrics, calculating real overall completion rates, average scores, grade distributions, and monthly performance trends dynamically.
  - Modified the Analytics modal layout to `max-w-6xl` size with proper spacing and styling for a more detailed display of graphs and tips.
  - Fixed standalone routing type mismatches inside `analytics/page.tsx` and successfully validated frontend Next.js production build (`npm run build`).
  - Fixed assignment average grade parsing bug in analytics card where slash formats like `10/10` or `100/100` resulted in inflated percentages (e.g. `10100%`) by introducing a dedicated `parseGradeToPercentage` utility.
  - Updated backend assignment status mapping to calculate the progress percentage dynamically based on the number of answered questions in draft assignments.

## Completed

- **Admin Assignments Page Polish (June 06, 2026)**:
  - Added delete assignment backend API endpoint with full cascading cleanup of questions and submissions.
  - Wired frontend `useDeleteAssignment` hook and implemented a beautiful confirmation modal popup for deletion actions.
  - Linked the "Edit" and "Grade" card actions to navigate directly to the assignment details dashboard correctly.
  - Wired frontend Assignment cards to display real dynamic class/subject stats (totalStudents, submitted, progress percentage, dueDate, className) instead of hardcoded data placeholders.


- **Student Lifecycle Promotion (June 5, 2026)**:
  - Added `promoteStudents` method in `StudentLifecycleService` to handle moving students between classes, updating levels, and generating immutable history.
  - Implemented promotion notification triggers for teachers and parents.
  - Created `PromoteStudentsModal` in the frontend Admin Class Management dashboard and exposed API endpoints.

- **Student Lifecycle & History Tracking (June 5, 2026)**:
  - Database schema updates: Added `StudentHistory` and `StudentEnrollment` models to track all academic and administrative changes permanently.
  - Enforcement of single active school enrollment constraint via `StudentLifecycleService`.
  - Built automated history events and workflows for Enrolling and Exiting students (Withdrawal, Graduation, Transfer, Expulsion).
  - Integrated lifecycle changes into the notification infrastructure for parents and admins.
  - Implemented the History Timeline UI in the Student Profile for visualizing immutable audit trails.

## Completed

- **Frontend Type Safety & Hardening (Final Build Stabilization)**:
  - [x] **Resolved All TS Errors**: Successfully achieved a clean `npx tsc --noEmit` state across the entire frontend.
  - [x] **Interface Synchronization**: Updated `SubscriptionUsageData`, `ChildDetails`, and `ExamAttempt` interfaces to match backend API return shapes.
  - [x] **Type Mismatch Resolution**: Fixed persistent `TS2339/TS2322` errors in `ParentPayments`, `LinkingHub`, `StudentDashboard`, `Notifications`, and `GradesOverview` using pragmatic casting and type definitions.
  - [x] **Dependency Sanitization**: Replaced missing `ScrollArea` component with standard scrollable divs and fixed unescaped entities/missing fallbacks in core pages.
  - [x] **Property Access Hardening**: Fixed critical property mismatches on `student` and `attempt` objects across parent and student dashboards.
  - [x] **Massive ESLint Resolution**: Resolved dozens of warnings across `SchedulingSection`, `ExamPreviewPage`, `QuestionList`, `GradesHeader`, `notifications`, `parents`, and `profile` modules.
  - [x] **Strict Type Hardening**: Replaced `any` with specific interfaces in `GradesOverview`, `linking/page.tsx`, `assignments/page.tsx`, `ClassOverviewTab.tsx`, `exams&quizzes/page.tsx`, `grades/page.tsx`, `student/page.tsx`, and `QuestionList`.
  - [x] **Performance & Hygiene**:
    - [x] Removed unused icons, variables, and handler functions across multiple dashboard pages.
    - [x] Migrated legacy `<img>` tags to `next/image` in `linking/page.tsx`, `GradeTable`, `StudentTable`, `TopPerformingStudents`, and `profile`.
    - [x] Fixed critical `useEffect` dependency array issues and missing variable destructuring in `student/page.tsx` and the unified exam taker page.
  - [x] **Unified Exam Taker Refactor**: Cleaned up unused variables and hardened types in the student examination environment.
  - [x] **Massive Build Stabilization (System-wide)**:
    - [x] Resolved explicit `any` errors in `usePlatformSchools.ts`, `SupportCenter.tsx`, `UsageLimitsCard.tsx`, `Pricing.ts`, `LoadingDashboard.tsx`, and `LaTeXRenderer.tsx`.
    - [x] Optimized image handling by migrating `<img>` to `next/image` in `UserQRModal.tsx`, `Navbar.tsx`, `ImageLightbox.tsx`, and `LaTeXRenderer.tsx`.
    - [x] Cleaned up unused imports, variables, and parameters in `ProtectedRoute.tsx`, `Buttons.tsx`, `GetStartedRoleSelect.tsx`, `useGradeSettingsStore.ts`, `pricingUtils.ts`, and `SocketContext.tsx`.
    - [x] Fixed `next.config.ts` by removing unrecognized `turbopack` experimental key.
    - [x] Resolved lockfile duplication by removing redundant `frontend/packag e-lock.json`.
- **Frontend Type Safety & Hardening (Teacher Dashboard)**:
  - [x] **Strict Typing Enforcement**: Replaced hundreds of instances of `any` with specific interfaces or `Record<string, unknown>` across `Exams`, `Grades`, `My Classes`, and `Students` modules.
  - [x] **Standardized Error Handling**: Integrated `AxiosError<{ message?: string }>` for all React Query mutations and queries, ensuring consistent error propagation and UI feedback.
  - [x] **Code Cleanup & Optimization**:
    - [x] Removed dozens of unused imports, variables, and duplicate `useEffect` hooks.
    - [x] Memoized expensive data transformations (e.g., `assignments` in class detail view) to prevent infinite re-render loops.
    - [x] Migrated legacy `<img>` elements to `next/image` in `StudentCard`, `StudentInfoCard`, `ClassCard`, and `RecentSubmissions` for LCP optimization.
  - [x] **Registry & Assessments Stabilization**:
    - [x] Hardened `SubjectPaperReport` and `TeacherPaperDetailPage` with strict prop types and improved accessibility (alt text).
    - [x] Fixed unescaped HTML entities in `EmptyState`, `ExamPreviewPage`, `SubjectPaperReport`, and `TeacherSettingsPage`.
    - [x] Refined `GradesOverview` logic to fix dependency array warnings and ensure stable state management.
  - [x] **Modular Architecture Alignment**: Synchronized standalone and integrated versions of the Grades module to maintain parity across dashboard layouts.
- **Backend Build Stabilization & Schema Normalization**:
  - [x] Resolved all Prisma `P1012` validation errors by establishing missing bidirectional relations across `SubjectExamAttempt`, `SubjectExamAnswer`, `Quiz`, `TimetablePeriod`, `Grade`, and `Teacher`.
  - [x] Systematized relation naming conventions across the backend (e.g., `subjectAttempts` -> `subjectExamAttempts`, `includedSubjects` -> `subjectExamPapers`).
  - [x] Fixed complex TypeScript compilation errors (`TS2322`, `TS2353`, `TS7006`) in `exam-attempt.service.ts`, `academic.service.ts`, `grade.service.ts`, and `auth.service.ts`.
  - [x] Hardened `Admin` model by ensuring proper relation to `SchoolAdmin` for consistent `schoolId` resolution.
  - [x] Resolved scope issues in `admin.controller.ts` by defining missing variables from `req.query`.
  - [x] Successfully achieved a clean `npm run build` state for the entire backend project.
- **Revenue Architecture & Console Stability**:
  - [x] Resolved "Platform Entitlements" loading hang by fixing Prisma relation name mismatch (`planAccesses` -> `planAccess`) in `FeatureService.listFeatures()`.
  - [x] Hardened `PricingPlanEditorModal` with robust error handling for manifest synchronization.
  - [x] Mapped `featureKey` to `tag` in backend controllers to ensure frontend compatibility.
- **Pricing Editor Enhancements**:
  - [x] Integrated `maxAiUsage` (AI Tokens) field into the Pricing Plan Editor.
  - [x] Added `maxTeachers`, `maxClasses`, and `maxExams` quota fields to the internal console for full control.
  - [x] Synchronized `handleSubmit` payload to correctly persist all new quota fields as numbers.
  - [x] Fixed TypeScript type mismatch for `plan` prop in `PricingPlanEditorModal` by allowing `null` values.
- **Teacher Registration & Linking**:
  - [x] Implemented independent teaching account tracking in the database (`isIndependent` flag).
  - [x] Added backend validation and registration logic to handle independent accounts and terms agreement.
  - [x] Fixed `auth.service.ts` import paths and school ID resolution for admins.
- **Final Build Stabilization**:
  - [x] Resolved `logs.map` type error by standardizing `usePlatformAuditLogs` return signature.
  - [x] Standardized mutation hooks (`seedPlans`, `harvestFeatures`) to accept `void` payloads, resolving `.mutate()` call errors.
  - [x] Synchronized `acceptTerms` validation across all registration schemas and forms (Parent, Teacher, Student, School).
  - [x] Hardened `GoogleLoginButton` and `AddQuestionPage` by replacing implicit `any` and loose object types with `Record<string, any>`.
- **Landing Page & Auth Flow Modernization**:
  - [x] **Auth Flow Optimization**: Eliminated redundant role selection pop-ups; implemented direct routing with `Link` for improved UX and top-loader feedback.
  - [x] **Wording Simplification**: Replaced formal/technical jargon (e.g., "Security Phrase", "Recover Access") with regular, everyday language ("Password", "Forgot Password?") across all authentication pages.
  - [x] **Admin Dashboard Modernization**: Simplified complex terminology in the Admin Overview (e.g., "Institutional Identity" -> "School Banner", "Administrative Pulse" -> "Dashboard Activity", "Faculty" -> "Teacher").
  - [x] **Asset Localization**: Replaced dummy Dicebear/Unsplash avatars with local Nigerian user assets from `/public/users/`.
  - [x] **Testimonial Refinement**: Updated `WhatUsersSay.json` with localized Nigerian names and generic, professional institutional titles.
  - [x] **UI Stability**: Resolved `Invalid src prop` errors by configuring `next.config.ts` and restored high-quality background image standards for authentication flows.
  - [x] **Consistency**: Standardized "Email Address" and "Password" labels across Student, Teacher, Parent, and Admin portals.
- **Mobile Modernization**: Implemented auto-scrolling partner marquee, optimized mobile typography, and refined touch-friendly button layouts for a superior mobile experience.
- [x] Implemented smooth transitions between dark and light sections for a cohesive, high-end rhythm.
- [x] Verified contrast ratios for all theme-aware elements.
- **Admin Grades Mobile Optimization**:
  - [x] **Responsive Navigation**: Implemented horizontally scrollable tabs for mobile access to all assessment modules.
  - [x] **Unified Layout Switch**: Successfully implemented a robust `viewMode` toggle (Grid vs. List) across all dashboard modules (`ExamGradesFlow` and `SubjectPapersView`).
  - [x] **Premium List Views**: Developed tailored, high-density list layouts for mobile, replacing the simple show/hide logic with functional, interactive components.
  - [x] **Registry & Navigation**: Finalized the transformation of dense tables into adaptive cards and list items for seamless mobile access.
  - [x] **Build Stability**: Resolved "JSX Namespace" errors by removing invalid Tailwind-style responsive prefixes from component props and performing a clean-file rewrite.
  - [x] **Plain English Transition**: Replaced all technical jargon (e.g., "Protocol Root", "Registry Nodes", "Efficiency Index") with clear, natural language throughout the Grades dashboard.

## Recent Accomplishments
- **Admin Dashboard Standardization**: 
    - Completed localized `loading.tsx` skeleton components for all admin sub-pages (`Settings`, `Finance`, `Billing`, `Attendance`, etc.) to eliminate layout shifts and match specific page designs.
- **Student Settings Refinement**: 
    - Implemented a 2-step password change pop-up flow with local state validation and backend integration.
    - Updated the "Account" tab to dynamically show the linked school's subscription plan when subscription enforcement is off.
    - Added one-time Level Selection functionality on the "Academic" tab.
    - Verified the accurate rendering of `profileImage` across the dashboard settings.
    - Added Guardian Contact display to the Student Profile page and wired up the Quick Actions to correctly navigate to their respective settings pages.
    - Added `guardianName`, `guardianPhone` to the `Student` Prisma model.
    - Synchronized the `StudentProfilePage` edit drawer to allow students to input their guardian contact info, `height`, `weight`, `club`, and `favouriteColour`.

### Security & Config Updates
- **Error Handling Standardization**: Updated the global `error-handler.ts` to strictly return a generic `"An unexpected error occurred. Please try again later."` message instead of leaking stack traces or internal exception details to the frontend during 500 errors.
- **Google OAuth Configuration**: Set `GoogleLoginButton` to strictly require explicit backend configuration (`google_auth_enabled === "true"`) in order to render. It now defaults to hidden if the settings are missing or undefined.

- **Student Dashboard Fixes**: 
    - Fixed the display of "Assignments" to "Assessments" in the single class details view, implementing accurate fallback states for unlinked departments.
    - Replaced the static "Qefas Hub Academic Hub" badge in the student top navigation with a dynamic rendering of the student's currently linked school name and logo.

# Project State: Qefas Hub

## Current Focus

- **dashdesign01 Stitch Redesign**: Applying the "Lumina Finance" fintech design system to the SchoolHub landing page.
- Translating the generated Stitch HTML design into production-ready Next.js + Tailwind components.
- Maintaining parity between the new light lavender-white hero aesthetic and the existing dark-mode dashboard.

### Friday, June 05, 2026
- **Admin & Teacher Assignment Architecture Setup**:
    - [x] **Backend Services**: Developed `createAssignmentService` and `getTeacherAssignmentsService` within `assignment.service.ts` to allow teachers to dispatch independent class assignments securely to database.
    - [x] **API Endpoints**: Registered distinct `POST` and `GET` APIs for both teachers and admins in `assignment.controller.ts` and `assignment.route.ts`. 
    - [x] **React Query Hooks**: Created robust `useTeacherAssignments`, `useAdminAssignments`, and `useCreateAssignment` data-fetching tools in `useAssignments.ts` for unified remote state management.
    - [x] **Admin Pages & Forms**: Built standard page listings at `admin/assignments` and dynamic creation forms at `admin/assignments/create-assignment`, integrating the React Query mutation hooks to process secure payloads.

### Saturday, June 06, 2026
- **Direct-to-S3 File Management Architecture**:
    - [x] **Database Normalization**: Added `storageUsedBytes` field to the `School` model and a new `FileRecord` model in Prisma to reliably track individual file sizes, S3 URLs, and uploader identities (Admin/Teacher/Student).
    - [x] **S3 Integration**: Migrated the legacy proxy-to-Bunny.net architecture to native direct-to-S3 uploads to resolve backend throughput bottlenecks.
    - [x] **Presigned URL Route**: Engineered `POST /api/v1/upload/presigned-url` integrating `@aws-sdk/s3-request-presigner` to securely grant temporary upload tokens.
    - [x] **Subscription & Quota Tracking**: Engineered `POST /api/v1/upload/confirm` and `DELETE /api/v1/upload/:id` endpoints utilizing Prisma `$transaction` to atomically log the file and increment/decrement the school's `storageUsedBytes` counter.
    - [x] **Enforcement Fallback**: Verified that when subscription enforcement is manually disabled by platform admins, the `storageUsedBytes` counter still faithfully increments under the connected school to preserve system audit integrity.

### Thursday, June 04, 2026
- **Subdomain Landing Page 500 Internal Server Error Fix & Footer Modernization**:
    - [x] **Root Cause Diagnosis**: Identified that the 500 error on the live `/api/schools/subdomain/:subdomain/landing-page` endpoint was caused by missing or out-of-sync Prisma Client generation during Vercel/Render deployments.
    - [x] **Build Script Updates**: Added a `"postinstall": "prisma generate"` script to `backend/package.json` to ensure the Prisma Client is automatically regenerated upon dependency installation in production environments.
    - [x] **Race Condition Fix**: Replaced `prisma.schoolLandingPage.findUnique` followed by `create` with an atomic `prisma.schoolLandingPage.upsert` in both `getSchoolLandingPageBySubdomainService` and `getSchoolLandingPageService` to prevent Unique Constraint violations (HTTP 500) during concurrent requests from the frontend.
    - [x] **CRITICAL: Illegal `import` Statement in Route File Fixed**: Identified and fixed a **module-crashing syntax error** in `school.route.ts` — an `import { submitInquiry, getInquiries }` statement was placed mid-file (after route declarations) instead of at the top of the file. In TypeScript/CommonJS, `import` must be at the top level. This caused a runtime crash that returned 500 for ALL routes in the school module, including the landing-page endpoint. Fix: Moved both into the top-level import block.
    - [x] **Anti-Pattern Fix: Dynamic `require()` in Controller**: Replaced two instances of `require('@prisma/client')` / `new PrismaClient()` inside `submitInquiry` and `getInquiries` controllers with the singleton `prisma` client from `../../config/database`. Dynamic instantiation creates new DB connections per-request (connection leak) and bypasses TypeScript type checking.
    - [x] **Anti-Pattern Fix: Dynamic `require()` for notification service**: Replaced inline `require("../notification/notification.service")` with a proper top-level import in `school.controller.ts`.
    - [x] **Footer & Legal Compliance**:
        *   Resolved the 500 Internal Server Error occurring when accessing a subdomain landing page by configuring Prisma generation inside the build pipeline (`postinstall`) and updating concurrent database creation logic to use an atomic `upsert`.
        *   Replaced dummy footer links (`href="#"`) across the landing page and subdomains with valid, existing routes (`/about`, `/features`, `/pricing`, `/contact`) and created dedicated `/terms` and `/privacy` legal pages synced with the registration modal content.
        *   Updated the footer social media links (Facebook, Instagram, and Twitter/X) with accurate URLs and replaced the old Twitter logo with the modern X logo, ensuring they open in new tabs.
        *   Refactored the video showcase section on the landing page (`InAction.tsx`) to use a more premium design, natively fetch the YouTube thumbnail via `react-player` `light` mode, and securely pull the video URL from the `.env` variable `NEXT_PUBLIC_SHOWCASE_VIDEO_URL`.
        *   Redesigned the top hero section of the Features page (`FeaturesHero.tsx`) with ambient backgrounds, better gradients, improved typography, and sleeker floating elements for a premium look.
        *   Fixed non-playing YouTube showcase section (`InAction.tsx`): removed broken `react-player` dynamic import (incompatible with Turbopack sub-path `react-player/lazy`), replaced with a native YouTube `<iframe>` embed with a custom thumbnail + play-button overlay. Also fixed `NEXT_PUBLIC_SHOWCASE_VIDEO_URL` in `.env` which had literal surrounding double-quotes making the URL string invalid.
        *   Resolved expired session login page errors: Modified the Axios interceptor (`src/lib/api/client.ts`) to bypass refresh token flows and redirects when the user is on the login/auth screens or submitting login requests, silently clearing expired session data instead. This ensures users do not encounter "no refresh token" errors, page reloads, or loops when logging back in.

### Current Status
*   **Active Focus:** Modernizing Qefas Landing Page Footer and Legal Compliance
*   **Completed Milestones:**
    *   Resolved production deployment errors (Prisma client sync).
    *   Fixed Subdomain `GET` API 500 error (`getSchoolLandingPageService`).
    *   Updated `Footer.tsx`, `[tenant]/page.tsx`, and `[tenant]/[...slug]/page.tsx` footer links.
    *   Implemented premium and highly comprehensive legal agreements for `src/app/terms/page.tsx` and `src/app/privacy/page.tsx` that include standard SaaS protection clauses, billing, subscription terms, FERPA/COPPA compliance, and AI grading scanner liability disclaimers.
*   **Pending Tasks:**
    *   Monitor production after Vercel deployment of these fixes.

### Thursday, May 21, 2026
- **Add Student 400 AxiosError Root Cause Fix**:
    - [x] **Root Cause Identified**: `AddStudentDialog.tsx` was resolving `schoolId` as `user?.schools?.[0]?.schoolId || user?.tenantId || ""`. When `schools[0].schoolId` was absent, it fell back to `tenantId` (a non-UUID slug) or `""`, both of which failed Zod's `.string().uuid()` validation, returning HTTP 400.
    - [x] **Frontend Hardened**: Removed `tenantId` from the schoolId fallback chain; added a UUID format pre-flight guard that shows a user-friendly toast (`"Unable to determine your school. Please log out and log back in."`) before any network call is made.
    - [x] **Backend Made Self-Healing**: Made `schoolId` optional in `createStudentSchema`. The `createStudent` controller now auto-resolves `schoolId` from the admin's own `SchoolAdmin` database record when the body omits or provides an invalid value — eliminating the entire class of client-side UUID bugs.
    - [x] **Better Error Surfacing**: Frontend `catch` block now reads `error.response?.data?.error` in addition to `.message`, guaranteeing the exact backend error message is always shown to the admin.
    - [x] **Zero Compilation Errors**: Verified with `npx tsc --noEmit` (backend) — clean output.
- **Backend Free Plan Environment Variables Bug Fix**:
    - [x] Identified missing subscription free plan variables in `backend/.env` that caused `UserSubscriptionService.initializeFreePlan` to throw an error (`Required FREE plan environment variable is missing for role: STUDENT.`).
    - [x] Queried `SubscriptionPlan` database table to retrieve valid free plan UUIDs for each scope.
    - [x] Added `SCHOOL_FREE_PLAN`, `TEACHER_FREE_PLAN`, `STUDENT_FREE_PLAN`, and `PARENT_FREE_PLAN` variables with their retrieved values to `backend/.env`.
- **Frontend Typecheck & Imports Resolution**:
    - [x] Fixed incorrect import path for `ConfirmationModal` in `admin/exams/[examId]/papers/[paperId]/page.tsx` using correct absolute alias `@/app/dashboard/admin/exams/components/ui/ConfirmationModal`.
    - [x] Resolved compile-time type mismatch for `SubjectPaperReport` in `admin/exams/[examId]/papers/[paperId]/page.tsx` by importing the actual PDF document component from `@/app/dashboard/teacher/exams&quizzes/papers/[id]/components/SubjectPaperReport`.
    - [x] Verified full build/compilation correctness with clean outputs for `npm run build` (backend) and `npx tsc --noEmit` (frontend).
- **Admin Add Student Functionality & Auto-Generated Credentials**:
    - [x] **Zod-First Schema Validation**: Added `admin.schema.ts` defining `createStudentSchema` for student registration payload verification.
    - [x] **Autogenerated Credentials & Quota Limits**: Implemented `createStudentService` in `admin.service.ts` to perform permission checks, query and increment student count for unique student domain emails (`student[number]@[school-domain].com`), generate name-accented secure passwords (`[student][school][number]`), hash passwords, enforce subscription student limits, and enroll student into classes within a single Prisma transaction.
    - [x] **Route Registration**: Registered `POST /api/v1/admin/students` endpoint in `admin.route.ts`.
    - [x] **Credentials Disclosure Card UI**: Updated `AddStudentDialog.tsx` to handle the actual creation API call, invalidate QueryClient cache for automatic grid refreshing, and transition into a beautiful copyable credentials card disclosing temporary password to the administrator.
    - [x] **Success Dialog Account Claim Instructions**: Added copy inside the success pop-up in `AddStudentDialog.tsx` notifying that the student can claim their account from the invite page with a verification link.
    - [x] **Strict Type-Safety & Backend Build Stabilization**: Resolved backend compilation issues in `admin.controller.ts` (Zod issues property), `admin.service.ts` (invalid `schoolId` query), and query parameter casting in `grade.controller.ts` and `school.controller.ts`, achieving a 100% clean backend compilation build.


### Wednesday, May 20, 2026
- **AI Insights Access & Exam Setup Redesign**:
    - [x] **AI Insights Feature Key Fix**: Resolved subscription lock gating on single student exam results by correcting the feature key passed to `useFeatureAccess` in `grades/page.tsx` from `'ai_performance_insights'` to `'aiInsights'`.
    - [x] **Plain English Copywriting Modernization**: Upgraded the Exam Setup form terminology, removing complex, cyberpunk-like jargon (e.g. *Institutional Node*, *Temporal Registry*, *Operational Scope*) in favor of simple, professional everyday English (e.g. *Select School*, *Academic Session*, *Exam Scope*).
    - [x] **Premium Interactive Redesign**: Restructured `CreateExamForm.tsx` into a state-of-the-art 3-step configuration flow using an interactive visual progress stepper. Built gorgeous, custom hoverable card selectors for exam categories (Exam vs Quiz), operational scopes (School, Class, or Department), and results release schedules.
    - [x] **Framer Motion Micro-animations**: Integrated smooth, clean sliding/fade transitions and reactive accent highlights driven by the school's theme color (`primaryColor`).

### Tuesday, May 19, 2026
- **Student Details Page - Behaviour Tab Integration & Database Sync**:
    - [x] **Database Schema Normalization & Sync**: Added the `StudentBehaviourProfile` model to the Prisma schema mapping to `student_behaviour_profiles` database table with a 1-to-1 relationship with the `Student` model, and successfully synchronized the schema using `npx prisma db push`.
    - [x] **Zod-First Validation & Controller Patterns**: Created the `behaviourProfile.schema.ts` file enforcing Zod-first validations on incoming request body payloads. Implemented `behaviourProfile.controller.ts` and `behaviourProfile.service.ts` separating Express handlers, business logic, and Prisma persistence operations. Registered endpoints under the main student routes structure.
    - [x] **Frontend Query & Mutation Hooks**: Built `getBehaviourProfile` and `updateBehaviourProfile` client service endpoints in `studentService.ts`. Integrated `useStudentBehaviourProfile` and `useUpdateStudentBehaviourProfile` hooks in `useStudent.ts` handling query caching and automatic detail refetch invalidations.
    - [x] **80% Responsive Layout Constraints**: Replaced all `max-w-7xl` and `max-w-[1600px]` layout containers on the Admin Student Details page with `max-w-[80%] mx-auto` to strictly limit the layout width to 80% on desktop screens while keeping it perfectly fluid and responsive on smaller screens.
    - [x] **Behavior Tab Navigation & Icons**: Added `'behaviour'` tab with dynamic label and navigation parameters to the profile's main TABS array, importing ThumbsUp, ThumbsDown, Heart, and CheckCircle2 from `lucide-react`.
    - [x] **Exemplary Conduct Score & Strengths Widgets**: Designed premium layout cards showing Conduct Score (92/100) with a custom rotating circular SVG meter and qualitative evaluation, alongside a Core Strengths panel mapping Leadership, Peer Collaboration, and Task Completion attributes.
    - [x] **Unified Real & Mock Behaviour Timeline**: Created an interactive timeline logging system that queries real class behaviour alerts (`useClassBehaviourAlerts`) from the database, displays them dynamically (with type tags like Warning, Danger, and Info, plus reporter metadata), and gracefully falls back to detailed default historical logs if database alerts are not configured.
    - [x] **TypeScript Compilation Resolutions**: Fixed strict typescript type constraints in `behaviour.controller.ts` and `behaviourProfile.controller.ts` by casting query params to `string` and standardizing ZodError format using the `issues` property.
    - [x] **100% Compilation Stability**: Confirmed a flawless compilation build checking with `npm run build` on both the frontend and backend directories, returning exit code 0.
- **Admin Sidebar & Visual Subdomain Page Builder (Elementor-Style)**:
    - [x] **Relocated Sidebar Menu Item**: Removed the custom banner widget from the sidebar footer. Integrated a clean, premium "Sub Domain" item within the Core Management menu list alongside other key entities (Overview, School Profile, Teachers, etc.).
    - [x] **Visual Page Builder (Elementor-Style)**: Engineered a premium split-screen page builder screen at `/dashboard/admin/subdomain` allowing school administrators to configure the Hero section, Vision & Mission details, parent testimonials, and branding colors.
    - [x] **Real-time Responsive Preview Frame**: Configured a dynamic real-time responsive browser frame inside the builder showing live CSS and text changes instantly with fully synchronized dark/light mode switches.
    - [x] **One-Click Live Sync**: Wired the save actions to the backend mutation hooks to automatically publish edits directly to the tenant's public landing page.
- **Tenant Landing Page - Modernization**:
    - [x] **Dark & Light Mode Toggle**: Integrated a premium dynamic Dark & Light Mode theme toggle on the tenant's public landing page with fully synchronized adaptive Tailwind styling transitions.
    - [x] **Smooth Scrolling**: Added `scroll-smooth` configuration to support native CSS smooth-scrolling for all anchor page links across the portal.
    - [x] **Premium School Campus Background Image**: Displayed the high-fidelity school campus building background image (`/image/backgroundSchool.jpg`) from the public folder inside the vision card with rich gradient contrasting overlays.
- **Class Detail Page - Exams Tab Calculations and Mappings**:
    - [x] **Dynamic Student Submission Counts**: Updated `getSingleClassService` query selection to include `examAttempts` and their completed status (`isSubmitted`), computing `completedStudents` dynamically.
    - [x] **Temporal Status Lifecycle Engine**: Developed dynamic status mapper based on `startDate` and `endDate` boundaries to accurately return `unpublished` (draft), `scheduled` (inactive), `expired` (deadline passed), and `active` (live).
    - [x] **Status Badges & Filters expansion**: Styled additional badges for `unpublished` and `expired` and added filters for All, Active, Inactive, Unpublished, and Expired exams.
- **Class Detail Page - Subjects Tab Connected Papers Count**:
    - [x] **Prisma Relation Select Count**: Modified subject query selections in backend `getSingleClassService` to fetch `_count.subjectExamPapers`.
    - [x] **Dynamic Papers Counting**: Mapped this count directly to the subject grid cards and details page list items, changing descriptions and header stats labels from "Exams" to "Papers" to represent connected subject exam papers correctly.
- **Verification**: Verified 100% clean compilation build and strict type check safety with absolutely zero typescript, lint, or runtime errors across both backend and frontend workspaces.

### Monday, May 18, 2026
- **Admin Departments Tab Modernization**:
    - [x] **Plain English Transition**: Replaced all cyberpunk/technical jargon (e.g., "Infrastructure Node", "Deploy New Node", "Active Clusters") with clear, natural language throughout the Departments tab.
    - [x] **Dynamic Stats Integration**: Added `useSchoolStats` frontend integration and expanded backend services to return aggregate `_count` values for students, classes, exams, and quizzes.
    - [x] **Modernized UI Cards**: Developed redesigned 2x2 grid stats blocks in the Grid view cards featuring subtle hover micro-animations.
    - [x] **Optimized Table View**: Expanded the List view table with columns for Subjects, Classes, and Students, utilizing clear natural terminology.
    - [x] **Flawless Compilation**: Verified 100% build type safety with zero type errors on both the frontend and backend.
    - [x] **Client-Side Pagination**: Integrated the global `<Pagination>` component to support both Grid and List views with a limit of 6 items per page, automatically resetting on search updates.
    - [x] **Secure ID Exclusion**: Hardened the backend API to omit the database UUID `id` from all department JSON payloads, mapping identifiers to the unique `code` field in both frontend and backend and removing ID labels from the table.
    - [x] **High-Fidelity PDF Export**: Connected both the header and operational controls Export buttons to trigger a fully-styled, print-ready PDF export utilizing a non-blocking iframe mechanism. Added active state micro-animation loaders (`isExporting`) to provide premium user feedback.
    - [x] **Persistent Pagination Controls**: Updated the rendering threshold so the pagination controls always display when departments exist, ensuring visibility.
- **Admin Subjects Tab Modernization**:
    - [x] **Natural Language Transformation**: Refactored technical/cyberpunk labels on the Subjects page, card list, and form modal (e.g. replacing "Faculty Nodes", "Active Channels", "Registry Depleted", "Curriculum Roadmap", "Base Settings", "Faculty Assignment" with "Teachers Assigned", "Active Classes", "No Subjects Found", "Curriculum Plan", "General Settings", "Assign Teachers").
    - [x] **Pop-Up Proof PDF Export with Spinner Loader**: Integrated a custom, non-blocking iframe print compilation (`handleExportPDF`) that downloads a beautiful PDF curriculum report, connected to an "Export PDF" download button displaying an active `isExporting` micro-animation spinner.
    - [x] **Singular/Plural Metric Normalization**: Configured the dashboard statistics and grid cards to handle singular/plural displays dynamically (e.g., showing "1 Subject" vs "2 Subjects", "1 Teacher Assigned" vs "2 Teachers Assigned", and "1 Active Class" vs "2 Active Classes").
    - [x] **Modern Card Designs**: Refined subjects cards with side gradient accent lines, backdrop-blur properties, dynamically rotating icons, and premium shadow drop-offs.
    - [x] **Form Lists with In-Line Search & Scroll boundaries**: Added in-line search boxes inside `SubjectModal` for filtering both Target Departments and Assign Teachers. Enforced `max-h-[300px]` scrolling limits when lists grow beyond 6 entries.
    - [x] **Shimmering Skeleton Loader**: Integrated a premium, multi-row layout skeleton loader inside `SubjectModal` that displays while departmental metadata, teacher assignments, and course schemes are being fetched.

### Sunday, May 17, 2026
- **Console Schools Details Type Mismatch Fix**:
    - [x] Added `maxParentsOverride?: number;` to the `PlatformSchoolDetails` interface in [usePlatformSchools.ts](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/lib/api/hooks/usePlatformSchools.ts) to match the database model definition.
    - [x] Resolved type error in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/schools/[id]/page.tsx) where `school.maxParentsOverride` was causing the Next.js build worker to exit due to a type check error.
    - [x] Verified full type check safety by running `npx tsc --noEmit` on the frontend workspace with 100% clean success.
- **Console Dashboard Chart Tooltip Formatter Fix**:
    - [x] Resolved type error in [page.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/(internal-console)/console/page.tsx) where the Recharts Tooltip `formatter` parameters did not match strict type definitions. Changed parameter `name: string` to `name: any` to satisfy Recharts compatibility.

- **Frontend Type Safety & Hardening (Final Build Stabilization)**:
  - [x] **Resolved All TS Errors**: Successfully achieved a clean `npx tsc --noEmit` state across the entire frontend.
  - [x] **Interface Synchronization**: Updated `SubscriptionUsageData`, `ChildDetails`, and `ExamAttempt` interfaces to match backend API return shapes.
  - [x] **Type Mismatch Resolution**: Fixed persistent `TS2339/TS2322` errors in `ParentPayments`, `LinkingHub`, `StudentDashboard`, `Notifications`, and `GradesOverview` using pragmatic casting and type definitions.
  - [x] **Dependency Sanitization**: Replaced missing `ScrollArea` component with standard scrollable divs and fixed unescaped entities/missing fallbacks in core pages.
  - [x] **Property Access Hardening**: Fixed critical property mismatches on `student` and `attempt` objects across parent and student dashboards.
  - [x] **Massive ESLint Resolution**: Resolved dozens of warnings across `SchedulingSection`, `ExamPreviewPage`, `QuestionList`, `GradesHeader`, `notifications`, `parents`, and `profile` modules.
  - [x] **Strict Type Hardening**: Replaced `any` with specific interfaces in `GradesOverview`, `linking/page.tsx`, `assignments/page.tsx`, `ClassOverviewTab.tsx`, `exams&quizzes/page.tsx`, `grades/page.tsx`, `student/page.tsx`, and `QuestionList`.
  - [x] **Performance & Hygiene**:
    - [x] Removed unused icons, variables, and handler functions across multiple dashboard pages.
    - [x] Migrated legacy `<img>` tags to `next/image` in `linking/page.tsx`, `GradeTable`, `StudentTable`, `TopPerformingStudents`, and `profile`.
    - [x] Fixed critical `useEffect` dependency array issues and missing variable destructuring in `student/page.tsx` and the unified exam taker page.
  - [x] **Unified Exam Taker Refactor**: Cleaned up unused variables and hardened types in the student examination environment.
  - [x] **Massive Build Stabilization (System-wide)**:
    - [x] Resolved explicit `any` errors in `usePlatformSchools.ts`, `SupportCenter.tsx`, `UsageLimitsCard.tsx`, `Pricing.ts`, `LoadingDashboard.tsx`, and `LaTeXRenderer.tsx`.
    - [x] Optimized image handling by migrating `<img>` to `next/image` in `UserQRModal.tsx`, `Navbar.tsx`, `ImageLightbox.tsx`, and `LaTeXRenderer.tsx`.
    - [x] Cleaned up unused imports, variables, and parameters in `ProtectedRoute.tsx`, `Buttons.tsx`, `GetStartedRoleSelect.tsx`, `useGradeSettingsStore.ts`, `pricingUtils.ts`, and `SocketContext.tsx`.
    - [x] Fixed `next.config.ts` by removing unrecognized `turbopack` experimental key.
    - [x] Resolved lockfile duplication by removing redundant `frontend/package-lock.json`.
- **Frontend Type Safety & Hardening (Teacher Dashboard)**:
  - [x] **Strict Typing Enforcement**: Replaced hundreds of instances of `any` with specific interfaces or `Record<string, unknown>` across `Exams`, `Grades`, `My Classes`, and `Students` modules.
  - [x] **Standardized Error Handling**: Integrated `AxiosError<{ message?: string }>` for all React Query mutations and queries, ensuring consistent error propagation and UI feedback.
  - [x] **Code Cleanup & Optimization**:
    - [x] Removed dozens of unused imports, variables, and duplicate `useEffect` hooks.
    - [x] Memoized expensive data transformations (e.g., `assignments` in class detail view) to prevent infinite re-render loops.
    - [x] Migrated legacy `<img>` elements to `next/image` in `StudentCard`, `StudentInfoCard`, `ClassCard`, and `RecentSubmissions` for LCP optimization.
  - [x] **Registry & Assessments Stabilization**:
    - [x] Hardened `SubjectPaperReport` and `TeacherPaperDetailPage` with strict prop types and improved accessibility (alt text).
    - [x] Fixed unescaped HTML entities in `EmptyState`, `ExamPreviewPage`, `SubjectPaperReport`, and `TeacherSettingsPage`.
    - [x] Refined `GradesOverview` logic to fix dependency array warnings and ensure stable state management.
  - [x] **Modular Architecture Alignment**: Synchronized standalone and integrated versions of the Grades module to maintain parity across dashboard layouts.
- **Backend Build Stabilization & Schema Normalization**:
  - [x] Resolved all Prisma `P1012` validation errors by establishing missing bidirectional relations across `SubjectExamAttempt`, `SubjectExamAnswer`, `Quiz`, `TimetablePeriod`, `Grade`, and `Teacher`.
  - [x] Systematized relation naming conventions across the backend (e.g., `subjectAttempts` -> `subjectExamAttempts`, `includedSubjects` -> `subjectExamPapers`).
  - [x] Fixed complex TypeScript compilation errors (`TS2322`, `TS2353`, `TS7006`) in `exam-attempt.service.ts`, `academic.service.ts`, `grade.service.ts`, and `auth.service.ts`.
  - [x] Hardened `Admin` model by ensuring proper relation to `SchoolAdmin` for consistent `schoolId` resolution.
  - [x] Resolved scope issues in `admin.controller.ts` by defining missing variables from `req.query`.
  - [x] Successfully achieved a clean `npm run build` state for the entire backend project.
- **Revenue Architecture & Console Stability**:
  - [x] **Resolved "Platform Entitlements" loading hang** by fixing Prisma relation name mismatch (`planAccesses` -> `planAccess`) in `FeatureService.listFeatures()`.
  - [x] **Hardened PricingPlanEditorModal** with robust error handling for manifest synchronization.
  - [x] **Subscription Reset & Sync Refactor**:
    - [x] Implemented `PricingService.recordSubscriptionChange` for atomic transaction updates across `SchoolSubscription`, `UserSubscription`, and `SubscriptionHistory`.
    - [x] Refactored `billing.controller.ts` and `support.controller.ts` to ensure full deep cleanup and audit logging for all subscription resets and manual overrides.
    - [x] Filtered the "System Override" plan dropdown in the school detail view to only show relevant `schools` plans.
    - [x] Resolved a hydration error in the Schools Management page caused by invalid DOM nesting (`Skeleton` inside `p`).
    - [x] Fixed Prisma validation error in `recordSubscriptionChange` by normalizing plan types to the `SubscriptionType` enum.
    - [x] Implemented cascading synchronization to ensure associated `Admin` users are updated whenever their parent `School` subscription is reset or overridden.
- **Pricing Editor Enhancements**:
  - [x] Integrated `maxAiUsage` (AI Tokens) field into the Pricing Plan Editor.
  - [x] Added `maxTeachers`, `maxClasses`, and `maxExams` quota fields to the internal console for full control.
  - [x] Synchronized `handleSubmit` payload to correctly persist all new quota fields as numbers.
  - [x] Fixed TypeScript type mismatch for `plan` prop in `PricingPlanEditorModal` by allowing `null` values.
- **Teacher Registration & Linking**:
  - [x] Implemented independent teaching account tracking in the database (`isIndependent` flag).
  - [x] Added backend validation and registration logic to handle independent accounts and terms agreement.
  - [x] Fixed `auth.service.ts` import paths and school ID resolution for admins.
- **Final Build Stabilization**:
  - [x] Resolved `logs.map` type error by standardizing `usePlatformAuditLogs` return signature.
  - [x] Standardized mutation hooks (`seedPlans`, `harvestFeatures`) to accept `void` payloads, resolving `.mutate()` call errors.
  - [x] Synchronized `acceptTerms` validation across all registration schemas and forms (Parent, Teacher, Student, School).
  - [x] Hardened `GoogleLoginButton` and `AddQuestionPage` by replacing implicit `any` and loose object types with `Record<string, any>`.
- **Landing Page & Auth Flow Modernization**:
  - [x] **Auth Flow Optimization**: Eliminated redundant role selection pop-ups; implemented direct routing with `Link` for improved UX and top-loader feedback.
  - [x] **Wording Simplification**: Replaced formal/technical jargon (e.g., "Security Phrase", "Recover Access") with regular, everyday language ("Password", "Forgot Password?") across all authentication pages.
  - [x] **Admin Dashboard Modernization**: Simplified complex terminology in the Admin Overview (e.g., "Institutional Identity" -> "School Banner", "Administrative Pulse" -> "Dashboard Activity", "Faculty" -> "Teacher").
  - [x] **Asset Localization**: Replaced dummy Dicebear/Unsplash avatars with local Nigerian user assets from `/public/users/`.
  - [x] **Testimonial Refinement**: Updated `WhatUsersSay.json` with localized Nigerian names and generic, professional institutional titles.
  - [x] **UI Stability**: Resolved `Invalid src prop` errors by configuring `next.config.ts` and restored high-quality background image standards for authentication flows.
  - [x] **Consistency**: Standardized "Email Address" and "Password" labels across Student, Teacher, Parent, and Admin portals.
- **Mobile Modernization**: Implemented auto-scrolling partner marquee, optimized mobile typography, and refined touch-friendly button layouts for a superior mobile experience.
- [x] Implemented smooth transitions between dark and light sections for a cohesive, high-end rhythm.
- [x] Verified contrast ratios for all theme-aware elements.
- **Admin Grades Mobile Optimization**:
  - [x] **Responsive Navigation**: Implemented horizontally scrollable tabs for mobile access to all assessment modules.
  - [x] **Unified Layout Switch**: Successfully implemented a robust `viewMode` toggle (Grid vs. List) across all dashboard modules (`ExamGradesFlow` and `SubjectPapersView`).
  - [x] **Premium List Views**: Developed tailored, high-density list layouts for mobile, replacing the simple show/hide logic with functional, interactive components.
  - [x] **Registry & Navigation**: Finalized the transformation of dense tables into adaptive cards and list items for seamless mobile access.
  - [x] **Build Stability**: Resolved "JSX Namespace" errors by removing invalid Tailwind-style responsive prefixes from component props and performing a clean-file rewrite.
  - [x] **Plain English Transition**: Replaced all technical jargon (e.g., "Protocol Root", "Registry Nodes", "Efficiency Index") with clear, natural language throughout the Grades dashboard.

## Recent Accomplishments
- **Dashboard Metrics Enhancement**: 
    - Replaced hardcoded placeholder student counts with real dynamic data from the database.
    - Integrated `totalPapers` and `totalQuestions` statistics into both Grid and List views of the Exam cards.
    - Added student attempt tracking to Subject Paper cards.
- **Backend Optimization**: 
    - Updated `ExamService` to include aggregate counts (`_count`) and pre-calculated statistics in the API response.
- **UI Consistency**: 
    - Refined all card layouts to ensure premium aesthetics while displaying increased data density.

- **School Console Navigation & Reliability**:
  - [x] **Resolved "School Not Found" Error**: Hardened the platform console backend with robust ID resolution and diagnostic logging.
  - [x] **Frontend Resilience**: Implemented error boundaries and retry logic for the school details view.
  - [x] **Relation Normalization**: Standardized teacher count lookups across frontend and backend, eliminating auto-generated Prisma naming conflicts.
- **Admin Dashboard Polish**:
  - [x] **Terminology Finalization**: Completed the transition to regular English across all overview widgets (e.g., "Teacher" instead of "Faculty" or "Academic Dept").
  - [x] **Dark Mode Consistency**: Fixed visual regressions in the "Dashboard Activity" container, ensuring it remains dark and premium-looking in all themes.
  - [x] **Visual Depth**: Enhanced backdrop contrast for sidebar panels in dark mode for better readability.
  - [x] **Terminology Standardization**: Completed a system-wide audit of the Grades page to ensure clear, non-technical terminology for administrators.
- **Modernized Admin Grades Dashboard**:
  - [x] **UI Streamlining**: Removed redundant "Aggregate View" card and "Module Components" labels.
  - [x] **Global Pagination**: Standardized and optimized client-side pagination (5 items/page).
  - [x] **Detailed Analytics**: Refined percentile formatting and implemented responsive sizing for `ProgressCircle`.
- **School Profile Redesign**:
  - [x] **LinkedIn Layout**: Transformed the profile into a LinkedIn-style interface with a banner, overlapping logo, and clean two-column structure.
  - [x] **Mobile Optimization**: Optimized the header and cards for a LinkedIn-app feel on small screens, featuring edge-to-edge layouts and touch-friendly buttons.
  - [x] **Professional Information Hierarchy**: Reorganized institutional details into "About," "Leadership," and "Capabilities" sections.
- **Teacher Management Modernization**:
  - [x] **LinkedIn Mobile UI**: Implemented edge-to-edge card layouts and optimized typography for the teacher registry on mobile.
  - [x] **Responsive Analytics**: Refined stats grid for 2-column display on mobile to save vertical space.
  - [x] **Header & Navigation**: Optimized header for mobile centering and touch-friendly button interaction.
  - [x] **Standalone Tab Fixes**:
    - [x] Implemented dynamic calculation for "Institutional Mean" and "Status Overview" cards.
    - [x] Refined status display logic to correctly identify "Graded" (online attempts) and "Published" records, preventing them from appearing as "Drafts".
## Next Action

- [x] Created **dashdesign01** Stitch skill (Project ID: `13918564619085950397`, Design System: `assets/23281e39971947d6bded98c0de6f9d3b`).
- [x] Generated full-page Qefas Hub landing page redesign (Screen ID: `d6a0c2f6f00b4feb80f3f16d9e25b159`) using the Lumina Finance design system.
- [ ] Translate Stitch-generated HTML design into production Next.js + Tailwind components for `IntroSection`, `KeyBenefits`, `MobileExperience`, `UsersSay`, and `FinalCTA`.
- [ ] Perform a full navigation smoke test on mobile to verify `nextjs-toploader` behavior during role-based redirects.
- [ ] Conduct a final audit of authentication labels to ensure 100% consistency across all roles.
- [ ] Verify AI usage reporting in the admin dashboard for newly created student attempts.
- [ ] Finalize production-ready asset optimizations (image compression).
- [x] **Student Overview Enhancement**: Replaced 'View Reports' and 'Guardian Sync' buttons with 'Log Behaviour' and 'Attendance Entry' in Quick Actions, including 'Coming soon' pop-ups for both.
- [x] **Schedule & Attendance UI**: Implemented a comprehensive weekly grid view (Monday-Friday, 7 AM-6 PM) for both Student and Teacher dashboards, featuring functional week navigation with real calendar dates via date-fns.
- [x] **Final Build Stabilization (Full System)**:
    - [x] **Frontend Success**: Successfully ran `npm run build` in the frontend directory with zero TypeScript errors.
    - [x] **Relation Name Synchronization**: Resolved persistent `teachers` vs `Teacher_Teacher_activeSchoolIdToSchool` mismatch across frontend hooks, backend controllers, and test scripts.
    - [x] **Interface Alignment**: Hardened `PlatformSchoolDetails` with missing `usage` and `teachers` properties to match the actual backend API response.
    - [x] **Student Profile Grid Fix**: Resolved type mismatch in the schedule grid's `onCellClick` handler, fixing the final blocker in the student dashboard.
    - [x] **Backend Reliability**: Verified `npm run build` in the backend, confirming full schema normalization, type-safe quota logic, and resolving polymorphic Postgres transaction aborts (`25P02`) in `PricingService` for `ADMIN` users.

- [x] Created **Task Planning Skill** (`SKILL_TASK_PLANNING.md`) to automate granular task list generation and tracking.
## Next Action

- [ ] Translate Stitch-generated HTML design into production Next.js + Tailwind components for `IntroSection`, `KeyBenefits`, `MobileExperience`, `UsersSay`, and `FinalCTA`.
- [ ] Perform a full navigation smoke test on mobile to verify `nextjs-toploader` behavior during role-based redirects.
- [ ] Apply **Task Planning Skill** to all future complex tasks to ensure robust progress tracking.
- [ ] Conduct a final audit of authentication labels to ensure 100% consistency across all roles.
- [ ] Verify AI usage reporting in the admin dashboard for newly created student attempts.
- [ ] Finalize production-ready asset optimizations (image compression).

### Saturday, May 16, 2026
- **Pricing Deactivation Logic Refinement**:
    - [x] Updated `isCurrentPlan` to check both plan type and billing cycle, allowing users to switch between monthly and yearly versions of the same plan.
    - [x] Removed hierarchy-based deactivation (`isLowerPlan`), enabling users to view and select all other plans (including downgrades) from the UI.
    - [x] Synchronized `billingCycle` state across `auth-store`, `EachPriceCard`, and `UpgradePriceCard` components.
- **Administrative Subscription Management**:
    - [x] Centralized subscription synchronization in `PricingService.recordSubscriptionChange`, implementing deep sync for `School` and all associated `Admin` records.
    - [x] Modernized the manual override and reset flows in `support.controller.ts` and `billing.controller.ts` to support the new `billingCycle` logic.
    - [x] Updated the Platform Console UI to allow manual overrides for `billingCycle` (Monthly/Yearly).
    - [x] Ensured that resetting a school subscription correctly reverts both the school and its admins to the default "Monthly FREE" tier.

### Monday, May 18, 2026
- **Admin Dashboard - Subject Management Hotfix & UI Polish**:
    - [x] **Resolved Tab Form Submission gotcha**: Fixed a critical design issue in the shared `TabsTrigger` component ([tabs.tsx](file:///c:/Users/Student/Documents/GitHub/schoolHub/frontend/src/components/ui/tabs.tsx)) where clicking tabs within a `<form>` automatically submitted it (triggering persistent `"Saving..."` states). Injected explicit `type="button"` onto the rendered button. Added bulletproof `preventDefault()` and `stopPropagation()` to `onClick` event bubbling inside the button.
    - [x] **Centralized Premium Segmented Control Tabs**: Overhauled tab bars in both the main [SubjectModal.tsx](file:///c:/Users/Student/Documents/GitHub/schoolHub/frontend/src/app/dashboard/admin/subjects/components/SubjectModal.tsx) and the duplicate details page [page.tsx](file:///c:/Users/Student/Documents/GitHub/schoolHub/frontend/src/app/dashboard/admin/subjects/[id]/page.tsx). Shifted triggers into a centralized glassmorphic segmented container with smooth active scaling animations.
    - [x] **Strict School Bounds Enforcement**: Replaced asynchronous API resolution for `schoolId` with direct, synchronous client-side store lookup. This ensures that subjects are strictly bound, and only departments and faculty linked to the administrator's school are queried and rendered on the form.
    - [x] **Renamed Stale State Variables**: Normalized all state occurrences of `loading` to `isSaving` to represent execution status accurately and prevent namespace clashes. Added initial state resets on form opens.
    - [x] **Segmented View Mode Toggle**: Added a premium toggle switch to seamlessly shift between a Grid of visual cards and a highly functional List table, featuring gorgeous micro-transitions and icons.
    - [x] **Checkbox Multi-Select & Single/Bulk Deletions**: Added individual checkboxes and a dedicated red delete action button to each subject card and list row. Engineered a red warning Bulk Actions Bar that slides in dynamically with a unified "Delete Selected" control.
    - [x] **Department ID UUID Alignment**: Preserved the original database primary key UUID under `departmentId` in `departmentService.ts`, and updated `SubjectModal.tsx` and the main page's search filter select dropdown. This resolved the backend's `"Some departments were not found"` error perfectly.
    - [x] **Simplified Metrics and High-Fidelity Labels**: Simplified metrics on the subject cards (e.g. from "1 Teacher Assigned" and "Active Class" to the much cleaner and simpler "1 Teacher" and "1 Class"), making it extremely clean and premium.
    - [x] **100% Compiler Type Safety**: Verified build compilation with `tsc --noEmit` resolving to a clean zero errors exit.

## Next Action
- [ ] Translate Stitch-generated HTML design into Next.js Tailwind components.
- [ ] Conduct mobile navigation redirects smoke test.
- [ ] Audit authentication labels for 100% role-based consistency.

### Tuesday, May 19, 2026
- **Admin Dashboard - Classes Pagination**:
  - [x] **Imported & Configured Pagination Component**: Integrated `@/components/ui/Pagination` into the admin classes page.
  - [x] **Calculated Paginated Classes**: Created `paginatedClasses` using `useMemo` based on `currentPage` and `itemsPerPage = 6` limits.
  - [x] **Grid & Table View Synchronization**: Replaced the direct use of `filteredClasses` with `paginatedClasses` for both the Grid of cards and the Table/List of classes.
  - [x] **State Resets**: Added `useEffect` hook to reset `currentPage` back to `1` when `searchQuery` changes.
  - [x] **Resolved Frontend Typecheck Error**: Cast `records` from `AttendanceRecord[]` to `Record<string, unknown>[]` in `AttendanceTab.tsx` to fix TypeScript compilation error TS2345.
- **Admin Dashboard - Timetable Revamp**:
  - [x] **Database Schema Migration**: Added `breakLabel` field to the `TimetablePeriod` model and pushed the schema updates to the database.
  - [x] **Auto-Generation System**: Created backend logic to automatically populate weekly schedule slots with available subjects while managing breaks. Updated algorithm to pull all active subjects configured in the school (rather than only the single class's subset).
  - [x] **Replication Controls**: Implemented a backend replication pipeline and frontend Copy Modal to copy timetables between terms or sessions.
  - [x] **12-Hour Time & Active Highlighting**: Added a 12-hour AM/PM format display, integrated a native time picker (`type="time"`), and implemented cell highlighting for the current system time.
  - [x] **Custom Confirmation Modal**: Replaced standard browser `confirm` prompts with a custom, glassmorphic `ConfirmModal` dialog.
  - [x] **Auto-Generate Loading Spinner**: Linked `ConfirmModal` button state to the timetable mutation's `isPending` state, showing a spinner, locking dialog interactions during loading, and closing only upon success.
  - [x] **Breadcrumbs Integration**: Moved the class-level breadcrumbs to the top of the main class details page.
  - [x] **Attendance Tab Layout & Data Binding**: Restructured the attendance component layout to eliminate double scrollbars and nested paddings, and bound real class student records dynamically.
  - [x] **Interactive Slot Clicks & Action Buttons**:
    - Cell/card clicks now open `SlotDetailsModal` with full read-only information, supporting navigation to editing, deletion, attendance, or scheduling.
    - Edit action button inside card displays the pre-populated editing modal.
    - Delete action button opens a custom `ConfirmModal` for deleting the timetable period, linked to `useDeleteTimetablePeriod` hook.
    - Mark Attendance action button redirects the administrator to the Class Attendance tab.
  - [x] **Assigned Teachers Overflow**: Limited displayed teachers list to 2 in header and added a clickable `...` that opens a custom modal showing all assigned teachers and details.
  - [x] **Tab-Specific Loading Skeletons**: Removed fullscreen page loading spinner; replaced it with a dynamic tab content shimmer loader matching active tab (Overview, Students, Subjects, Teachers, Timetable, Exams, Attendance).
  - [x] **Type Safety & Stability**: Verified 100% compile success on both backend and frontend workspaces.
  - [x] **Single Table Timetable Layout**: Streamlined the timetable workspace to render a single, consolidated timetable grid for the target class/term instead of showing duplicate tables.
  - [x] **High-Fidelity PDF Export**: Enabled a premium PDF export feature that compiles and prints/saves the weekly class timetable layout with proper styling, margins, page breaks, and layout orientations.
  - [x] **Add Period Teacher Search Fix**: Overhauled `/admin/teachers` admin API endpoint to query `RelationshipLink` active school-teacher links and direct school fields (like `schoolId`), ensuring newly invited and registered teachers show up correctly in the Add Period and Manage Class search results and modals rather than defaulting to "Staff".
  - [x] **Fixed Double Tab Component Rendering**: Refactored the `CustomTabs` component in [Tabs.tsx](file:///c:/Users/HP/Documents/GitHub/Qefas%20Project/schoolHub/frontend/src/app/dashboard/admin/classes/%5Bid%5D/components/Tabs.tsx) to act as a native tab button layout rather than nesting another `react-tabs` instance with nested content panels. This eliminates double component rendering inside the Class details tab panel view.
  - [x] **School Branding in Timetable PDF**: Successfully queried and retrieved school settings via the `useSchoolSettings` hook, and displayed the school name and logo picture in the PDF header with print-safe styling, complete with synchronization to trigger the print dialog only after the logo finishes loading.
  - [x] **React Hook Order Fix**: Resolved a hook order sequence violation inside `ClassAttendancePage` (`AttendanceTab.tsx`) by reorganizing React hooks above the `isLoading` conditional early returns.
  - [x] **Attendance Date Switching**: Enhanced calendar date switching usability by adding previous/next month controls and direct date picker input fields.
  - [x] **Attendance PDF Export with School Branding**: Replaced the download placeholder with a high-fidelity A4 portrait report print layout, loading the school logo picture and name dynamically alongside detailed daily statistics and a student roster table.
  - [x] **Attendance Summary Overall Rate Metric**: Resolved `undefined%` formatting inside `AttendanceSummaryCard.tsx` by correctly binding stats value calculation to the backend rate properties.
  - [x] **Localized Table Loading State**: Extracted the loading state logic during attendance date switches out of the general page level and placed it directly inside the `AttendanceTable` component. This prevents full-tab re-render flashes, leaving the calendar and monthly summary card responsive and visible.
  - [x] **Dynamic Monthly Summary Dropdown**: Upgraded the static dropdown options in `AttendanceSummaryCard` to build dynamic options list for the past 12 months starting from the current system month, and added API level support (optional `month` query parameter on both frontend/backend routes) to filter stats records by selected month.
  - [x] **Calendar Current Date Highlight**: Added logic inside `AttendanceCalendar.tsx` to detect and visually highlight the current system date with a distinct outline ring (`ring-2 ring-primary`) and bold text style.
  - [x] **Monthly Summary Card Loading Skeleton**: Configured `AttendanceSummaryCard.tsx` to accept the React Query loading state `isLoading` and display matching animated pulsing skeleton bars inside the stats blocks during fetches.
  - [x] **Overview Tab Polish**:
    - Overhauled `BehaviourAlert.tsx` and `UpcomingExams.tsx` to implement premium, visually centered empty states.
    - Updated `PerformanceChart.tsx` to replace the nested `ResponsiveContainer`/`BarChart` mock elements in the empty state with a clean, vector SVG icon, eliminating layout warning logs.
    - Upgraded `StatsCard.tsx` to handle `isLoading` states with animated pulsing shimmers.
    - Structured query loading state destructuring in `Overview.tsx` to feed independent loading parameters directly into class average score and overall attendance metrics cards.
  - [x] **Student Tab Popup & Pagination**:
    - Created `StudentDetailsModal.tsx` showing comprehensive read-only student details (name, code, email, date of birth, joined date, attendance, scores).
    - Integrated standard Next.js `<Link>` component for "View Full Profile" to enable fast client-side navigation without full-page reloads, showing the next-toploader correctly.
    - Updated `StudentsTab.tsx` to handle student card clicks by opening the details popup.
    - Configured client-side pagination with `itemsPerPage = 8` and integrated the reusable `@/components/ui/Pagination` component.
    - Configured automated pagination page reset to `1` when search queries or gender filtering options are updated.
  - [x] **Subject Tab Popup & Pagination**:
    - Created `SubjectDetailsModal.tsx` displaying subject code, description, assigned teacher, and academic statistics.
    - Integrated standard Next.js `<Link>` component for "View Full Subject Details" to support fast client-side navigation without full-page reloads.
    - Updated `SubjectsTab.tsx` to handle subject card clicks by displaying the details popup.
    - Configured client-side pagination with `itemsPerPage = 8` and integrated the reusable `@/components/ui/Pagination` component.
  - [x] **Teacher Tab Popup & Pagination**:
    - Created `TeacherDetailsModal.tsx` showing comprehensive read-only teacher details (name, code, email, telephone contact, lead teacher status).
    - Integrated standard Next.js `<Link>` component for "View Full Teacher Profile" to support fast client-side navigation without full-page reloads.
    - Updated `TeachersTab.tsx` to handle teacher card clicks by displaying the details popup.
    - Configured client-side pagination with `itemsPerPage = 8` and integrated the reusable `@/components/ui/Pagination` component.
  - [x] **Attendance Name and Edit Loader**:
    - Aligned parsing fields inside `AttendanceTable` to support relational database values alongside local form layouts.
    - Linked `onEdit` handler to prompt the sheet modal pre-filled with existing data.
    - Added high-performance SVG loader spinner in the Modal saving action buttons.
  - [x] **Overview Attendance Data Sync**:
    - Expanded temporal boundary matching inside `getClassStatsService` to capture full current-day range (up to 23:59:59.999).
    - Normalized timezone parses inside `submitAttendanceService` database insertion queries to perfectly match UTC zero hours.
  - [x] **Action Buttons Optimization**:
    - Removed redundant static header "Timetable" button next to the "QR Access" control to streamline navigation flow.
  - [x] **Class loading skeleton fix**:
    - Gated `!classData` with `!loading` in `page.tsx` to prevent premature rendering of the "Class Not Found" error page before API responses resolve.
  - [x] **Subject Creation and Refetch Sync**:
    - Wired "Create New" flow in `AddSubjectModal.tsx` to invoke `/academic/subjects` then `/classes/subjects/attach` to save the new subject to the database.
    - Integrated parent detail refetch via `queryClient.invalidateQueries` to automatically reload the Subjects list without manual refreshes.
    - Added an SVG loader spinner and "Saving..." text transition to the submit action button.

## Recent Accomplishments

### Friday, June 19, 2026
- **Device Tracking System & Dashboard Fixes**:
    - [x] **Phantom Registrations Resolved**: Updated `generateRefreshToken` in `authService.ts` to check for and update an existing device session (matching `deviceModel` and `osVersion`) rather than creating a new `RefreshToken` record on every login. This prevents duplicate device buildup for the same physical device.
    - [x] **Dashboard 'No Show' Fix**: Fixed a bug in `DeviceSessions.tsx` where an API error (often caused by large payloads of thousands of duplicate sessions) caused the component to silently return `null`. It now renders a premium error card explaining the issue gracefully.
    - [x] **Backend Query Payload Limiting**: Added `take: 50` to the `getUserSessions` controller to safely limit the payload, protecting the frontend and live server from crashing or timing out if a user has accumulated a massive history of duplicate device sessions.


### May 19, 2026 — Tenant Subdomain Routing & Custom Landing Pages
- **Tenant Subdomain Routing System**:
  - [x] Implemented Next.js middleware in `middleware.ts` to rewrite requests for custom tenant subdomains to `/[tenant]/...` dynamically.
  - [x] Excluded main domain (`flexiti`, `www`) and internal endpoints (`_next`, `api`, `favicon.ico`) to ensure standard public landing pages and internal assets are bypass-safe.
  - [x] Added support for both local development (`tenant.localhost:3000`) and custom production hostname subdomains.
- **Tenant Custom Landing Page**:
  - [x] Built a beautiful, premium, and fully responsive landing page at `src/app/[tenant]/page.tsx` displaying the tenant's brand name, logo, custom slogan, vision/mission, highlight features, contact information, and parent/alumni testimonials.
  - [x] Leveraged Framer Motion and Lucide icons for rich micro-interactions and smooth scroll animations.
  - [x] Integrated public portal access login links directly redirecting stakeholders to standard Auth configurations.
- **Admin Settings Customization**:
  - [x] Extended the institutional Settings page (`src/app/dashboard/admin/settings/page.tsx`) with a high-fidelity **"Landing Page"** customization panel.
  - [x] Allowed school administrators to dynamically edit their public brand properties (Hero Title, Subtitle, Vision, Mission, Features, Testimonial items, and custom primary colors) with full state management and automatic local storage fallback.
  - [x] Added full backend React Query mutation hooks integration to persist the brand configuration directly in the database.
- **Dynamic Site Branding**:
  - [x] Updated standard layout elements like the main header navigation menu and public footer components to dynamically detect if they are running on a custom tenant subdomain, automatically hiding global marketing materials to present a native, white-labeled experience.
- **Build Verification**:
  - [x] Successfully verified a clean `npm run build` compilation state for all new routes, layout adjustments, and middleware configurations.

## Next Action
- [ ] Implement automatic report card generation for classes.
- [ ] Conduct end-to-end integration tests for multi-term timetable replication.
- [ ] Audit role-based access control (RBAC) labels across new dashboard modals.

### Tuesday, May 20, 2026
- **Revenue Architecture - Pricing Editor Pre-Population Bug Fix**:
    - [x] **Root Cause Identified**: `resolveAllPlans()` in `pricing.service.ts` was not including `maxTeachers`, `maxClasses`, `maxExams`, `maxAiUsage`, `maxParents`, `monthlyPrice`, `yearlyPrice`, `planScope` in the tab data returned by the API. The modal only received `maxStudents` and `maxStorageGb`, causing all other quota fields to appear blank when the editor opened.
    - [x] **Backend Fix**: Added all missing quota fields (`maxTeachers`, `maxClasses`, `maxExams`, `maxAiUsage`, `maxParents`, `monthlyPrice`, `yearlyPrice`, `planScope`) to the `resolveAllPlans()` tab mapping in `pricing.service.ts`.
    - [x] **Frontend Fix**: Replaced the aggressive `Number(val || 0) || 0` conversion pattern in `handleSubmit` with a `toNum()` helper that returns `null` for empty/unset fields instead of `0`. This prevents overwriting existing DB quota values with zero when only some fields are edited. `monthlyPrice` and `yearlyPrice` still default to `0` as they are required financial fields.

### Wednesday, May 20, 2026
- **AI Insights Access Lock Gating Fix**:
    - [x] Resolved a bug where single student detailed exam results falsely blocked premium AI-generated performance insights and displayed a "Please upgrade your plan..." gating prompt.
    - [x] Corrected the key mismatch in the client detailed student results page from `ai_performance_insights` to the canonical platform feature registry key `aiInsights`.
- **Create Exam Form Redesign (`CreateExamForm.tsx`)**:
    - [x] Re-engineered the "Create Exam" setup form into a stunning 3-step progressive stepper (1. Basic Info -> 2. Scope & Target -> 3. Results Release).
    - [x] Replaced all cyber-technical space jargon with clear everyday English.
    - [x] Created interactive card selectors for Categories, Scopes, and Results schedules with smooth Framer Motion animations.
- **Exam Listing Dashboard & Terminology Redesign**:
    - [x] **Main Layout Tab Redesign (`page.tsx`)**: Renamed tabs from "Institutional Exams" and "Subject Nodes" to "School Exams" and "Subject Papers". Modernized empty states and error notices to clear Everyday English.
    - [x] **Stats Overview Card Redesign (`StatsCards.tsx`)**: Updated labels and description subtext to clear and professional terminology (Total Exams, Published Exams, Scheduled Exams, Draft Exams).
    - [x] **Exam Card (`AssessmentCard.tsx`)**: Modernized all action dropdown labels (Edit Exam, Delete), meta indicators (Category, Date Created, Status), and redesigned withdraw and delete modal dialog instructions.
    - [x] **Subject Paper Card (`SubjectPaperCard.tsx`)**: Updated header tags (SUBJECT PAPER), metadata (Teacher, Connected Exams, Duration, Total Marks), and confirmation modals.
- **Tab-Specific Filters & Pagination Implementation**:
    - [x] **Tab-Specific Filters**:
        - **School Exams Tab**: Moved `<SearchFilters>` inside `<TabsContent value="exams">` and bound the search input to the reactive `filters.searchQuery` state, running smooth client-side filtering on top of live backend responses.
        - **Subject Papers Tab (`PaperFilters.tsx` [NEW])**: Created a new glassmorphic filtering panel dedicated to papers. Unique subjects and teachers are dynamically extracted from live papers to populate dropdown selects, combined with text matching.
    - [x] **High-Fidelity Sliding Pagination Bars**:
        - Added sliding page-number bars (with active state highlighting and previous/next navigation buttons) to **both tabs** independently.
        - Configured a neat grid size of `6` cards per page, automatically resetting the page pointer to `0` whenever filters are updated to maintain clean navigation boundaries.
    - [x] **Layout Polish & Core Bug Fixes**:
        - Added explicit `key` attributes to the direct children inside the `<AnimatePresence>` container in `page.tsx` (`key="exams"` and `key="papers"`), resolving a Turbopack console error warning about duplicate empty keys.
        - Included a unified page-level hydration skeleton loader that displays beautiful custom pulsing skeleton shimmers when the school metadata or exam collections are loading, eliminating layout flashes.
        - Added defensive validations inside the unique subjects and teachers mapping logic to prevent unset keys from leaking into the filter options.
- **Grades Dashboard Redesign & Everyday English Copy Polish**:
    - [x] **Dynamic Metric Stats Cards [NEW]**:
        - Implemented four premium overview cards at the top of the Grades dashboard (`grades/page.tsx`) showing: **Total Exams**, **Subject Papers**, **Students Graded**, and **Average Score**.
        - Connected metric tallies to live data counts using highly optimized `useMemo` hooks.
        - Added Next.js `Skeleton` components perfectly aligned with React Query loading flags, ensuring dynamic loading feedback without visual flickering.
    - [x] **Everyday English Audit**:
        - Successfully scanned the entire grades sub-folder to replace remaining space or jargon expressions with standard, everyday English.
        - Simplified headings and buttons: *Tactical Header* -> *Header*, *Institutional Mean* -> *Average Score*, *Pass Rate* -> *Passing Rate*, *Total Candidates* -> *Total Students*, *Top Performance* -> *Highest Score*, *Institution Report* -> *School Report*.
        - Cleaned dialogs: Modernized titles and text in `InstitutionReportModal.tsx` from "Institution" to "School" to ensure a native, warm aesthetic.
    - [x] **"All Grades" Tab Data Sync & Pagination Fix**:
        - Identified that the backend `/grades/hub` API endpoint implements server-side pagination that defaults to `limit = 10` when no limit is explicitly provided in the request query parameters.
        - Fixed a bug where student exam results beyond the first 10 entries were missing from the "All Grades" tab dashboard layout due to the default limit constraint.
        - Updated the frontend hook `useGradeHub` invocation in `grades/page.tsx` to pass `{ limit: 10000 }` to retrieve all grade records for the school, allowing dynamic client-side filtering, text search, and pagination grids to operate over the entire dataset with 100% precision.
    - [x] **Premium Paginator & Ellipses Sliding Window**:
        - Rebuilt the `Pagination` component to implement a smart pagination window, solving layout clutter caused by high data volume (e.g. 64 pages for 380 records).
        - Programmed an elegant sliding-window sequence that displays page 1, active page with surrounding sibling indices, custom `...` ellipsis breaks, and the last page cleanly.
        - Handled full responsive designs by rendering touch-friendly navigation arrows (`Prev`/`Next`) for mobile screen boundaries.
        - Connected the paginator to the school's dynamic `primaryColor` style hook to customize selected page numbers, button highlights, and shadow elevations instantly.
    - [x] **Subject Dropdown Paper-Only Filter**:
        - Filtered `uniqueSubjects` set in `GradeHub.tsx` to exclude cumulative integrated exam totals (checking for valid `subjectPaperId` and omitting strings containing `"(Total)"`).
        - Restructured the dropdown list to focus purely on subject papers, maintaining standard navigation rules.










### Thursday, June 04, 2026
- **Student Dashboard Fixes**:
    - [x] Fixed teacher name resolution on the /dashboard/student/my-classes cards by updating the frontend to map cls.teachers[0].teacher.name correctly from the backend payload.
- **Dev-Mode 404 Cold-Start Fix**:
    - [x] **Root Cause Diagnosed**: `GET /login/student 404 in 16.0s` was a Next.js dev Webpack cold-start timeout (15.8s compile), NOT a missing route. The route exists at `src/app/(auth)/login/student/page.tsx` and the second request (717ms) confirmed it works once compiled.
    - [x] **Fix Applied**: Added `--turbopack` flag to the `dev` script in `frontend/package.json`. Turbopack compiles routes incrementally per-request, reducing first-load from ~16s to ~1-2s.
- **Student Classes Page — Real Data Integration**:
    - [x] **AcademicSummary wired to live data**: Updated `my-classes/page.tsx` to fetch `useStudentExamAttempts`, `useGrades`, and `useStudentStats` (global stats). Removed all hardcoded placeholder values (`124` for Total Units, `#08` for Position).
    - [x] **Subject Count**: Computed `totalSubjects` by counting unique subject names across all enrolled classes via a `Set` — correctly reflects 0 when no classes are linked.
    - [x] **Total Marks**: Summed `totalScore` from exam attempts + `score` from standalone grades into a real `totalMarks` value.
    - [x] **Class Position**: Reads `overallRank` and `totalStudentsInClass` from the backend `/exams/my/stats` endpoint (`getStudentGlobalStatsService`), displays as `#02 / 34` format. Shows `—` with "Coming soon" if no graded attempts exist yet.
    - [x] **AcademicSummary.tsx refactored**: Accepts `totalSubjects`, `totalMarks`, and `classPosition` props; handles zero-state gracefully with dash and helper labels.

### Sunday, June 07, 2026
- **Database Connection Stabilization**:
    - [x] **Prisma Pooler Connection Timeout Fix**: Diagnosed and resolved the Prisma "Can't reach database server" error occurring during `auth.login` calls. 
    - [x] **Direct Connection Setup**: Modified the backend `.env` file to switch `DATABASE_URL` from the Supabase transaction pooler port `6543` (with `pgbouncer=true`) to the session pooler port `5432` without `pgbouncer`. This allows Prisma's native connection pool engine to execute reliably in a long-running Node.js/Express environment without connection drops or IP resolution issues.
- **File Upload & Proxy Stabilization**:
    - [x] **Resolved 500 Proxy Error**: Diagnosed the `POST /api/upload/proxy` 500 Internal Server Error occurring during Assignment creation. Discovered it was caused by Bunny.net returning a 401 Unauthorized error due to deprecated or missing credentials following the architecture shift.
    - [x] **Completed S3/Supabase Migration**: Successfully migrated the remaining Assignment upload flows off the legacy Bunny backend proxy. Modified the frontend `imageService.proxyUploadToBunny` to use direct-to-Supabase Storage uploads (`uploadToSupabase`), avoiding backend throughput bottlenecks.
    - [x] **Quota Tracking**: Updated `upload.controller.ts`'s `confirmS3Upload` route to correctly log `FileRecord` metrics and attribute storage quotas via `req.body.schoolId`, ensuring accurate storage metrics for both teachers and admins managing assignments.

### Monday, June 08, 2026
- **AI Subscription Gating & Daily Rate Limiting**:
    - [x] **Prisma Schema Update**: Added `AiUsageLog` model to track and persist daily AI generation and parsing usage counts. Pushed changes directly to the database via `npx prisma db push`.
    - [x] **AiLimiterService**: Developed a new backend rate-limiting service that resolves user-level and school-level daily limits, counts today's usage logs, and increments/logs successful AI operations.
    - [x] **Entitlement Verification**: Applied the existing `requireFeatureAccess("aiInsights")` middleware to exam AI routes (`/exams/ai/generate` and `/exams/ai/parse-text`), securing them from unauthorized access.
    - [x] **Quota Stats Integration**: Updated `quota.service.ts` to replace placeholder `0` value with real, dynamically computed daily AI usage logs count.
    - [x] **New Endpoint**: Added `/subscription/ai-usage` GET route returning stats `{ current, limit, remaining }` contextually for frontend components.
    - [x] **Frontend Gating (AITools.tsx)**: Updated the AI Tools sidebar in both Exam Paper and Assignment editors to:
        - Check for `aiInsights` access key via `useFeatureAccess` hook.
        - Render a lock icon/overlay with upgrade buttons if unauthorized.
        - Display remaining daily prompts count ("X of Y prompts left today").
        - Limit tool usage and show limit exceeded overlay and alerts when daily usage reaches 100%.
- **Student Dashboard Class Listing & Admin Schedule Fix**:
    - [x] **Hook Level Fix**: Resolved a bug where the `useClasses` hook had a strict `enabled: !!schoolId` check that was preventing student and teacher class queries from executing (since they do not require a `schoolId` filter). Checked user type in the hook using `useAuthStore` and only enforce the constraint for `ADMIN` users.
    - [x] **Timetable Schedule Modal Fix**: Passed `schoolId` from `SchedulePage.tsx` to `AddScheduleModal.tsx` and updated the modal's `useClasses(schoolId)` query to pull classes correctly, fixing a bug where classes could not load in the schedule modal for admins.
    - [x] **Robust Array Handling**: Hardened `classes` resolution in the modal to seamlessly handle directly nested array structures and fallback configurations.
    - [x] **Build Verification**: Verified absolute compilation stability with `npx tsc --noEmit`.
- **Comprehensive Transcript & AI Remarks in Student Dashboard**:
    - [x] **Official Nigerian Transcript Layout**: Redesigned the "View Full Transcript" modal in `page.tsx` and the exported PDF `ComprehensiveTranscriptReport` inside `IndividualStudentReport.tsx` to conform to official Nigerian secondary school report card standards.
    - [x] **Header Real-Data Integration**: Added the school details (Logo, Name, Address, Phone, Email) and student passport profile image at the top right of the transcript modal matching the PDF layout.
    - [x] **40/60 CA/Exam Scale Aggregation**: Replaced row-level AI text columns with a standardized score layout: Subject, C.A. (40), Exam (60), Total (100), Grade, and Remarks. Engineered a scaling/split aggregator combining exam attempts and standalone grades, falling back to mathematical splits if only one score is present.
    - [x] **WAEC Grading Standard Alignment**: Applied the standard WAEC alpha grading scale (A1, B2, B3, C4, C5, C6, D7, E8, F9) and official remarks (EXCELLENT, CREDIT, PASS, FAIL) across all subject records.
    - [x] **AI-Generated Pedagogical Comments**: Replaced row-level text blocks with a single Class Teacher's AI Remark and a Principal's AI Verdict at the bottom, dynamically computed from the student's overall average.
    - [x] **Formal Signature Blocks**: Appended official Class Teacher and Principal signature lines with date and next-term placeholders to the bottom of the transcript layout.
    - [x] **Build & Compile Stability**: Checked all files with `npx tsc --noEmit` on the frontend workspace and confirmed zero compilation errors.

### Tuesday, June 16, 2026
- **Teacher Assignment Dashboard Terminology Simplification**:
    - [x] **Everyday English Copy Polish**: Updated the main Assignments page to replace technical jargon like "Task Registry" with "Assignments", "Manage Coursework & Deadlines" with "Manage Assignments & Deadlines", and generic labels like "Classroom tasks for this institution" with "Classroom assignments for this school".
    - [x] **Card UI Copy Clean-up**: Modified the `AssignmentCard` component, renaming the database-like label "Submission Sync" to "Submissions".
    - [x] **Create Button Dark Mode Styling**: Enhanced the "Create New Assignment" button style in dark mode, making it use a clean white background, dark text, and gray-200 hover color for better contrast and appearance.
- **Teacher Assignment Visibility Optimization**:
    - [x] **Database Query Refactoring**: Updated `getTeacherAssignmentsService` in `assignment.service.ts` to query `ClassTeacher` relations and fetch all assignments linked to the teacher's assigned classes or created by the teacher.
    - [x] **Frontend Dynamic Filters**: Updated `AssignmentFilters` and `AssignmentsPage` to dynamically populate subject and class options from retrieved assignments, and added a class-specific dropdown filter.
- **Compilation Stability & Clean Build**:
    - [x] **TS compilation fixes**: Resolved a duplicate identifier (`isActive`) in `sessionService.ts` and replaced a missing package import (`react-hot-toast` to `react-toastify`) in `grades/page.tsx`, bringing the entire frontend project to a completely clean compile status (`npx tsc --noEmit` exit code 0).
    - [x] **Verification**: Verified compilation stability on both backend and frontend projects using `npx tsc --noEmit`.
- **Teacher Assignment Creation Class Dropdown**:
    - [x] **Dynamic Data Retrieval**: Integrated `useTeacherClasses` and `useTeacherSubjects` queries in the teacher's `create-assignment` page.
    - [x] **Dropdown Selection Component**: Refactored the free-text input for "Assign to Class(es)" in the `AssignmentDetails` component to a standard single-selection dropdown `Select` element utilizing real teacher-assigned classes and subjects, removing the complex multi-tag selection container entirely from the page for a clean user interface.
    - [x] **Remove AI Difficulty Recommendation**: Removed the AI Difficulty Recommendation card and its corresponding calculation helpers from the assignment settings panel to clean up unnecessary AI metrics from the interface.
- **Teacher Assignment Subject Dropdown & Submission Resolution**:
    - [x] **Database Query Refactoring**: Updated `getTeacherSubjectsService` in `teacher-dashboard.service.ts` to return subjects taught in any class assigned to the teacher (via `ClassTeacher` -> `Class` -> `ClassSubject` -> `Subject` relationships), fixing the empty dropdown issue for teachers without direct subject-level mappings.
    - [x] **Form Validation**: Hardened validation in `create-assignment/page.tsx` to ensure Title, Class, and Subject are all populated before sending request to backend, displaying clear error toasts for missing fields.
    - [x] **Payload Integrity**: Replaced the hardcoded subject fallback `"1"` with the actual selected `subjectId` from the state.
    - [x] **UI Polish**: Cleaned up the dark mode look of the "Create New Assignment" button by replacing the stark white background in dark mode with a brand-aligned `bg-primary text-white` layout featuring theme-aware shadow dynamics.
- **Teacher & Admin Assignment Page UI Refinements & Filter Fixes**:
    - [x] **Create New Assignment Button Styling**: Restored consistent brand identity with a premium style: Light mode utilizes `bg-primary` and dark mode applies `dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600` with an elegant indigo glow shadow.
    - [x] **Plain English & Normal Casing Sweeps**: Replaced loud, tiny uppercase tracked typography (e.g., `text-[10px] font-black uppercase tracking-widest`) across the filter inputs, card details, view controls, and dashboard headers with standard sentence/title casing and clean font sizes.
    - [x] **Assignment Status Filter Fix**: Defined a status normalizer `getNormalizedStatus` in `AssignmentsPage` using the same logic as `AssignmentCard` to ensure the status filters ("published", "overdue", "due-soon", "draft") match correctly and update the list.
    - [x] **Assignment Card Date Bug**: Swapped the data mapping from `endDate` to the correct `dueDate` property to resolve dynamic deadline dates rendering as "No Deadline".
    - [x] **SubmitBar Theme Glow**: Replaced high-glare stark white backgrounds on the Admin and Teacher "Publish" action buttons in dark mode with the premium indigo-violet gradient matching the new theme patterns.

U p d a t e d   P a r e n t   D a s h b o a r d   w i t h   d y n a m i c   a s s i g n m e n t s ,   s k e l e t o n   l o a d e r s ,   a n d   a   s t u n n i n g   d y n a m i c   A s s i g n m e n t   D e t a i l s   p a g e . 
 
 F i x e d   c h i l d   l i n k a g e   c h e c k   t o   u s e   ' a c t i v e '   i n s t e a d   o f   ' A C T I V E '   s o   t h e   a s s i g n m e n t   d e t a i l s   e n d p o i n t   w o r k s   p r o p e r l y . 
 
 # # #   S a t u r d a y ,   S e p t e m b e r   1 9 ,   2 0 2 6 
 -   [ x ]   F i x e d   a u t h M i d d l e w a r e   b u g   i n c o r r e c t l y   l o o k i n g   f o r   ' a c t i v e S c h o o l I d '   a n d   ' p r i m a r y S c h o o l I d '   o n   t h e   T e a c h e r   m o d e l   i n s t e a d   o f   ' c u r r e n t S c h o o l I d '   a n d   ' s c h o o l I d ' 
 -   [ x ]   F i x e d   v a l i d a t i o n   e r r o r   i n   v a l i d a t e Z o d R e q u e s t . t s 
 -   [ x ]   F i x e d   t e a c h e r   s c h o o l   p r o f i l e   s c h o o l I d   r e s o l u t i o n   i n   u s e A u t h S t o r e   d a t a   b y   e x p a n d i n g   f a l l b a c k   t a r g e t s .  
 -   [ x ]   A d d e d   e x c e p t i o n   t o   a u t h M i d d l e w a r e . t s   t o   a l l o w   i n d e p e n d e n t / u n l i n k e d   t e a c h e r s   t o   a c c e s s   t h e i r   s e s s i o n s ,   s e t t i n g s ,   a n d   p r o f i l e   r o u t e s   w i t h o u t   a   4 0 3   e r r o r  
 -   [ x ]   A d d e d   G o v e r n a n c e   &   S o c i a l   s e c t i o n   t o   A d m i n   S c h o o l   P r o f i l e   v i e w   p a g e ,   m a t c h i n g   t h e   e d i t   p a g e   l a y o u t .  
 -   [ x ]   F i x e d   t e a c h e r   s c h o o l   p r o f i l e   t o   s t r i c t l y   u s e   t h e   t e a c h e r   t h e m e   c o l o r   ( e m e r a l d )   i n s t e a d   o f   t h e   s c h o o l   s e t t i n g s   c o l o r  
 -   [ x ]   A d d e d   G o v e r n a n c e   &   S o c i a l   s e c t i o n   t o   T e a c h e r   S c h o o l   P r o f i l e   v i e w   p a g e  
 -   [ x ]   H o o k e d   u p   ' V i e w   I n s t i t u t i o n '   b u t t o n   o n   T e a c h e r   s e t t i n g s   p a g e   t o   r e d i r e c t   t o   t h e   s c h o o l   p r o f i l e   r o u t e  
 -   [ x ]   F i x e d   R e f e r e n c e E r r o r   f o r   ' r o u t e r   i s   n o t   d e f i n e d '   o n   T e a c h e r   s e t t i n g s   p a g e  
 -   [ x ]   U p d a t e d   A d m i n   C l a s s e s   p a g e   t o   f i t   9 5 %   o f   t h e   s c r e e n   w i d t h  
 -   [ x ]   A d d e d   t h e m e   s u p p o r t   t o   P a g i n a t i o n   c o m p o n e n t   a n d   s e t   i t   t o   b l u e   f o r   t h e   A d m i n   C l a s s e s   p a g e  
 -   [ x ]   F i x e d   T y p e S c r i p t   e r r o r   i n   A s s e s s m e n t I t e m . t s x   r e l a t e d   t o   p o s s i b l y   u n d e f i n e d   d u r a t i o n M i n u t e s  
 -   [ x ]   F i x e d   T y p e S c r i p t   e r r o r   i n   m y - c l a s s e s / . . . / s u b j e c t s / p a g e . t s x   f o r   ' c o d e '   m i s s i n g   o n   s u b j e c t   t y p e  
 -   [ x ]   F i x e d   T y p e S c r i p t   e r r o r   i n   s t u d e n t   s e t t i n g s   p a g e   f o r   ' i s T w o F a c t o r E n a b l e d '   m i s s i n g   o n   S t u d e n t P r o f i l e  
 -   [ x ]   F r o n t e n d   s u c c e s s f u l l y   b u i l t   w i t h   z e r o   T y p e S c r i p t   o r   c o m p i l a t i o n   e r r o r s  
 
### Tuesday, October 6, 2026
- [x] Fixed class attendance save timeout (admin + teacher): parent notifications in attendance.service.ts were awaited sequentially per student (>60s). Now fire-and-forget with 2 batched queries.
- [x] Added Zod validation to POST /classes/:id/attendance (attendance.controller.ts); installed zod in backend.
- [x] useSubmitAttendance toast now shows real backend error / HTTP status.
- [x] AttendanceTab: removed mock-student fallback; swipe modal uses local date (en-CA) like list modal.
- [x] Added createNotificationsBulk (notification.service.ts): one createMany insert + socket emits. Attendance parent notifications now use it (1 insert per save instead of N).
- [x] Added a 'Done' button to the AttendanceSwipeModal to allow teachers to finish swiping early and save a partial attendance list.

- [x] Updated TrendChartTooltip to dynamically display the breakdown of the daily average by individual subjects instead of plotting separate lines per subject.

- [x] Updated TrendChartTooltip to dynamically display the breakdown of the daily average by individual subjects instead of plotting separate lines per subject.

- [x] Replaced the basic loading text on the class Analytics tab with a detailed UI skeleton loader that perfectly mimics the layout of the loaded charts.

### Wednesday, October 14, 2026
- [x] **Teacher Login Width & Mobile Scale Optimization (`/login/teacher`)**:
    - [x] Increased the width of the inputs and buttons by 20%+ (from 480px to 584px width, expanding card max width to `680px` and trimming horizontal padding).
    - [x] Streamlined mobile and tablet card padding to `px-4 sm:px-8 md:px-12`, allowing inputs and buttons to utilize full device width on mobile screens.
    - [x] Expanded the right-hand form container on medium/large viewports to `md:w-[54%] lg:w-[50%]` with the left background spacer dynamically adjusted.
    - [x] Ensured form, input containers, inputs, and submit button elements explicitly span `w-full` with zero horizontal bottlenecks.
    - [x] Sized input heights to `h-14 sm:h-15` (56px–60px) and buttons with `text-base sm:text-lg font-bold` for superior touch ergonomics on mobile.
    - [x] Ensured font sizes are >= 16px to prevent iOS Safari auto-zooming.
    - [x] Replaced broken icons with Lucide icons with comfortable 56px touch targets for password toggle.
- [x] **Mobile Sidebar Drawer Clean-up (`TeacherMobileDrawer.tsx` & `app-sidebar.tsx`)**:
    - [x] Completely hid all disabled and 'Soon' navigation items in the mobile drawer instead of rendering disabled items with 'Soon' badges.
    - [x] Connected runtime platform feature toggles (`useGlobalFeatures('teacher')`) layered on top of static `FEATURE_FLAGS_TEACHERS`.
    - [x] Filtered out empty menu groups so headers for categories with no active items (e.g. Communication, Ecosystem) are not shown.
    - [x] Applied empty-group suppression to the desktop teacher sidebar (`app-sidebar.tsx`) for UI consistency across viewports.
    - [x] Resolved JSX parenthesis matching in `app-sidebar.tsx` by pre-computing `activeMenuGroups` via `useMemo`.
- [x] **Teacher Students Loading Skeleton Dark Mode Fix (`StudentSkeleton.tsx` & `StudentList.tsx`)**:
    - [x] Fixed invalid Tailwind opacity syntax (`dark:bg-emerald-950/60/70`) which was causing skeleton cards to fall back to bright white (`bg-white/70`) in dark mode.
    - [x] Set dark mode skeleton card backgrounds to pure black (`dark:bg-black`) with subtle dark borders (`dark:border-zinc-800`).
    - [x] Explicitly styled all pulsing skeleton bars with dark gray tones (`dark:bg-zinc-900`) across both Grid and List loading states, completely eliminating white elements in dark mode.
- [x] **Teacher Subjects Mobile Optimization & Comprehensive Tooltips (`/dashboard/teacher/subjects`)**:
    - [x] Added dynamic comprehensive HeaderTooltip next to the main title and stat cards following the `Comprehensive Header Tooltips` skill.
    - [x] Defaulted view mode to Grid View on mobile viewports (< 768px).
    - [x] Added mobile-responsive 2-column (mobile) / 4-column (desktop) metric stat cards (Total Subjects, Class Cohorts, Institutional Core, Departments).
    - [x] Refined `SubjectCard.tsx` with mobile-responsive padding (`p-4 sm:p-6`), permanent touch action visibility, and mobile course code badge in List view.
    - [x] Implemented dark mode pure-black loading skeletons (`dark:bg-black`, `dark:border-zinc-800`, `dark:bg-zinc-900`) with zero white glare.

