# Project State: Qefas Hub

## Current Focus

- Finalizing landing page and authentication UI modernization.
- Optimizing mobile-first navigation and role-based authentication flows.
- Localizing platform assets (images and testimonials) for the Nigerian market.

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
# Project State: Qefas Hub

## Current Focus

- **dashdesign01 Stitch Redesign**: Applying the "Lumina Finance" fintech design system to the SchoolHub landing page.
- Translating the generated Stitch HTML design into production-ready Next.js + Tailwind components.
- Maintaining parity between the new light lavender-white hero aesthetic and the existing dark-mode dashboard.

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
    - [x] **Backend Reliability**: Verified `npm run build` in the backend, confirming full schema normalization and type-safe quota logic.

## Next Action

- [ ] Translate Stitch-generated HTML design into production Next.js + Tailwind components for `IntroSection`, `KeyBenefits`, `MobileExperience`, `UsersSay`, and `FinalCTA`.
- [ ] Perform a full navigation smoke test on mobile to verify `nextjs-toploader` behavior during role-based redirects.
- [ ] Conduct a final audit of authentication labels to ensure 100% consistency across all roles.
- [ ] Verify AI usage reporting in the admin dashboard for newly created student attempts.
- [ ] Finalize production-ready asset optimizations (image compression).
