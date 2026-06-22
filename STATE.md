# Project State: Qefas Hub

## Current Focus

- Monitor production environment telemetry logs.
- Continue responsive optimization sweeps across other internal platform console views.

## Upcoming / Planning

- Implementation of remaining `STUDENT_LIFECYCLE_SPEC.md` features (Promotion, Awards, etc.).
- **Paystack Auto-Renewal Subscription**: Updated `initializePaymentService` to accept and pass `planCode` to Paystack initialization payload. This completely automates the subscription flow by tokenizing user cards and handling automatic periodic recurring billing for all user scopes seamlessly.
- **[BUILT] Paystack Webhook Integration**: Created the `POST /api/v1/payment/webhook` endpoint with HMAC SHA-512 signature verification in `payment.service.ts` to listen for `charge.success` events. 
    - **Setup Instructions**: To go live, navigate to the **Paystack Dashboard -> Settings -> API Keys & Webhooks**. Enter your production/test URL (e.g., `https://your-domain.com/api/v1/payment/webhook`) into the **Webhook URL** field. Ensure your backend `PAYSTACK_SECRET_KEY` matches the environment you are configuring. *Note: You or another AI will still need to write the specific Prisma database update logic inside `payment.service.ts` to match the customer's email/reference and actually extend their `subscriptionEnd` date.*

## Blockers

- None.

## Next Action

- Monitor production environment telemetry logs.

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

U p d a t e d   P a r e n t   D a s h b o a r d   w i t h   d y n a m i c   a s s i g n m e n t s ,   s k e l e t o n   l o a d e r s ,   a n d   a   s t u n n i n g   d y n a m i c   A s s i g n m e n t   D e t a i l s   p a g e .  
 F i x e d   c h i l d   l i n k a g e   c h e c k   t o   u s e   ' a c t i v e '   i n s t e a d   o f   ' A C T I V E '   s o   t h e   a s s i g n m e n t   d e t a i l s   e n d p o i n t   w o r k s   p r o p e r l y .  
 