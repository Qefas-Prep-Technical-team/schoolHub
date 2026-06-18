# Qefas Hub Mobile Application - Implementation Milestones

This document outlines the structured milestone breakdown to successfully set up and build out the React Native (Expo) mobile application for both Android and iOS, in strict alignment with the Flexiti Engineering Constitution (`GEMINI.md`).

## Milestone 1: Environment & Architecture Standardization
*Goal: Align the bare Expo setup with the Flexiti Stack (Tailwind, Zod, TanStack Query).*

- [x] **Tailwind CSS Integration:** Install and configure NativeWind (v4) to allow us to use the exact same Tailwind utility classes used in the Next.js frontend, ensuring UI parity.
- [x] **State & Data Management:** Install TanStack Query (React Query) and Axios to handle all server-side data fetching and caching. *Strictly avoid manual state management.*
- [x] **Validation Layer:** Integrate Zod to validate all incoming API responses and form payloads before they hit the UI.
- [x] **Directory Structure:** Set up the Feature-First Modular architecture inside the `Mobile` app (e.g., separating components, hooks, and services per feature like `auth`, `student`, `teacher`).

## Milestone 2: Theming & UI Consistency
*Goal: Mirror the premium web aesthetic, including dark mode and glassmorphism, natively.*

- [x] **Theme Porting:** Extract the `primaryColor`, gradients, and custom extended colors from the Next.js `tailwind.config.ts` and port them to the mobile `tailwind.config.js`.
- [x] **Typography:** Load the primary project fonts (e.g., Inter or Outfit) using `expo-font` and apply them globally.
- [x] **Foundational UI Library:** Build the core reusable UI components (Buttons, Input Fields, Glassmorphic Cards, Modals) using NativeWind, ensuring they adapt perfectly to both Light and Dark modes.

## Milestone 3: Authentication & Security
*Goal: Connect the mobile app to the Node.js backend securely.*

- [x] **Secure Storage:** Implement `expo-secure-store` to safely store JWT access and refresh tokens on the device.
- [x] **Axios Interceptors:** Set up global Axios interceptors to automatically attach the JWT token to requests and handle 401 unauthorized errors via a refresh token flow.
- [x] **Login Flow:** Build the unified Login screen supporting all roles (Student, Teacher, Parent, Admin) utilizing the exact same Zod schemas used on the web.

## Milestone 4: Core Role-Based Dashboards
*Goal: Translate the web dashboard experiences to touch-friendly mobile interfaces.*

- [ ] **Student Hub:** Implement the Student Dashboard (Classes, Grades, Timetable, and Academic Analytics) using native bottom tabs and swipeable carousels.
- [ ] **Teacher Portal:** Implement the Teacher Dashboard (Taking Attendance, Managing Assignments, and viewing Class grids).
- [ ] **Parent Portal:** Implement the Parent Dashboard to monitor child performance and handle push notifications.
- [ ] **Push Notifications:** Integrate `expo-notifications` to connect with the backend's existing notification system (e.g., for timetable changes or new grades).

## Milestone 5: Polish & Production Build (EAS)
*Goal: Prepare the application for the Google Play Store and Apple App Store.*

- [ ] **Assets Configuration:** Generate and link high-fidelity App Icons, Splash Screens, and Adaptive Icons matching the Qefas Hub branding.
- [ ] **EAS Setup:** Initialize Expo Application Services (`eas build`) and configure the `eas.json` profiles for Development, Preview, and Production.
- [ ] **Native Testing:** Run standalone native builds for iOS (Simulator/TestFlight) and Android (APK/AAB) to test performance and ensure there are no UI overflows or safe-area clipping.
