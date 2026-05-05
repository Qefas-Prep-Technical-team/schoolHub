# Flexiti Engineering Constitution (GEMINI.md)

This project follows the global Flexiti engineering standards.

## 1. The Flexiti Stack
- **Backend**: Node.js, Express.js, TypeScript (Strict).
- **Frontend**: Next.js, Tailwind CSS ONLY.
- **Mobile**: React Native (Expo), TypeScript.
- **Validation**: Zod (Mandatory for all IO).
- **Architecture**: Feature-First Modular (Controller -> Service -> Repository).

## 2. Strict Coding Standards
- **Zero Tolerance for `any`**: All data must be typed.
- **Zod-First**: Validation must happen at the entry point (Controller/Routes). No unvalidated data reaches the Service layer.
- **Separation of Concerns**:
    - **Controllers**: Handle HTTP protocol (Status codes, Request mapping).
    - **Services**: Handle business logic and orchestration.
    - **Repositories/Models**: Handle database persistence logic.
- **Error Handling**: Global middleware MUST catch and standardize all exceptions. Standard response: `{ success: false, error: "message" }`.

## 3. UI Implementation
- **Web**: Tailwind CSS utility classes ONLY. No ad-hoc CSS modules.
- **Mobile**: Consistent React Native styling patterns mirroring the web aesthetic.
- **Responsive**: Mobile-first approach for all web layouts.

## 4. Blackboard Protocol (STATE.md)
- `STATE.md` is the system's working memory.
- Every session MUST start by reading `STATE.md`.
- Every session MUST end by updating `STATE.md` with Current Focus, Completed, Blockers, and Next Action.

## 5. Prohibited Patterns
- No flat folder structures for complex backends.
- No bypassing Zod validation for "simplicity."
- No manual state management for server-side data (Use TanStack Query).
