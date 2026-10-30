# Qefas Hub — AI Agent Engineering Rules

> **MANDATORY**: This file is your primary instruction set for this repository.
> Read it fully before writing any code. Every rule here was derived from real bugs
> and performance issues found in this codebase. Violations will be rejected.

---

## 0. Session Protocol (Blackboard Protocol)

- **Start of every session**: Read `STATE.md` in the workspace root. Understand the current focus, blockers, and last completed work before doing anything.
- **End of every session**: Update `STATE.md` with a dated entry (e.g., `### Wednesday, August 13, 2026`) logging every change made. Use `[x]` checkboxes.
- `STATE.md` is the system's working memory. Never skip this step.
- **Subsystem Architecture Gate & Documentation Review (Docs / Non-Regression Protocol)**:
  - To prevent bug fixes in one area from breaking related subsystems:
    1. **Pre-edit Review**: Before touching any subsystem (Authentication, Linking, Social OAuth, Multitenancy, Assessments, Subscriptions), you MUST first review its corresponding documentation in [`docs/README.md`](../docs/README.md) and specific spec:
       - **Authentication & Database**: [`AUTH_STATE.md`](../AUTH_STATE.md)
       - **School & User Linking**: [`docs/LINKING_ARCHITECTURE.md`](../docs/LINKING_ARCHITECTURE.md)
       - **Social Login & Onboarding**: [`docs/SOCIAL_LOGIN_AND_ONBOARDING.md`](../docs/SOCIAL_LOGIN_AND_ONBOARDING.md)
       - **Assessments & Grading**: [`ASSESSMENT_DATA_MODEL.md`](../ASSESSMENT_DATA_MODEL.md)
    2. **Post-edit Documentation**: Document every update, endpoint change, schema adjustment, or UI behavior shift in the corresponding doc with a clear explanation of what changed, affected files, and verification steps.
- **Modular Component Architecture (Zero Giant Monoliths)**:
  - Always break pages and features into small, functional, and reusable components.
  - Avoid monolithic files (>300–400 lines) combining layout, multiple modals, forms, and business logic.
  - Subcomponents (modals, cards, forms, headers, filters, row items) must be cleanly extracted into a dedicated `components/` subfolder with explicit prop interfaces.


---

## 1. Stack Reference

| Layer | Technology |
|---|---|
| **Mobile** | React Native (Expo), TypeScript Strict, NativeWind (Tailwind) |
| **Mobile Data Fetching** | TanStack Query (`@tanstack/react-query`) |
| **Mobile API Client** | Axios (`Mobile/lib/api/client.ts`) |
| **Backend** | Node.js, Express.js, TypeScript Strict |
| **Backend Validation** | Zod (mandatory at every entry point) |
| **Frontend (Web)** | Next.js, Tailwind CSS |
| **Database ORM** | Prisma |

---

## 2. Mobile — TanStack Query Rules

These rules exist because the majority of performance bugs in this app have been TanStack Query misconfigurations.

### 2.1 ALWAYS Set `staleTime` — Never Leave It at the Default (`0`)

`staleTime: 0` means data is immediately stale, causing a background refetch on every mount and every tab focus. This is the #1 source of unnecessary network requests in this app.

**Required `staleTime` values by data type:**

| Data | `staleTime` |
|---|---|
| Auth user (`/auth/me`) | `Infinity` — use `useAuthUser()` from `useAuth.ts` |
| School stats, performance analysis | `1000 * 60 * 5` (5 min) |
| Parent dashboard aggregate | `1000 * 60 * 3` (3 min) |
| Exam list, student grades | `1000 * 60 * 2` (2 min) |
| Notification unread count | `1000 * 60 * 2` (2 min) |
| Teacher rosters, class lists | `1000 * 60 * 5` (5 min) |
| Device sessions | `1000 * 60 * 10` (10 min) |
| Departments, static school data | `1000 * 60 * 10` (10 min) |

```ts
// CORRECT
export const useParentDashboard = (childId?: string) => {
  return useQuery({
    queryKey: ['parentDashboard', childId],
    queryFn: () => parentService.getDashboard(childId),
    staleTime: 1000 * 60 * 3,
    retry: false,
  });
};

// WRONG — will refetch on every tab focus
export const useParentDashboard = (childId?: string) => {
  return useQuery({
    queryKey: ['parentDashboard', childId],
    queryFn: () => parentService.getDashboard(childId),
    // No staleTime = refetch on every mount
  });
};
```

### 2.2 Polling Intervals — Be Conservative

Only poll data that genuinely changes in real-time. Most school data is not real-time.

```ts
// Acceptable — notification badge, 2 minutes
refetchInterval: 1000 * 60 * 2,

// Acceptable — staff summary, 5 minutes
refetchInterval: 1000 * 60 * 5,

// BANNED — fires 4x per minute, excessive background load
refetchInterval: 30000,

// BANNED — do not poll notification list (full list), only the count badge
// useNotifications list: no polling, staleTime: 2min only
```

**Rule**: If you are adding `refetchInterval`, justify it with a comment explaining why
the data needs real-time freshness. Default: no polling.

### 2.3 `useFocusEffect` — ALWAYS Wrap in `InteractionManager`

**Never** call `refetch()` synchronously inside `useFocusEffect`. Synchronous calls during
navigation fire while the JS thread is busy animating the tab transition, causing visible
screen freezes.

```ts
// CORRECT — deferred until after animation settles
import { InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';

useFocusEffect(
  useCallback(() => {
    if (!isConnected) return; // Always guard with network state
    const task = InteractionManager.runAfterInteractions(() => {
      refetchA();
      refetchB();
    });
    return () => task.cancel(); // Cancel if user navigates away immediately
  }, [refetchA, refetchB, isConnected])
);

// WRONG — blocks JS thread during navigation animation
useFocusEffect(
  useCallback(() => {
    refetchA();
    refetchB();
  }, [refetchA, refetchB])
);
```

### 2.4 Shared Hooks — Never Inline `useQuery` in Screen Components

Extract every `useQuery` call into a named hook in `Mobile/lib/api/hooks/`. Inline queries
have no `staleTime`, cannot be shared across screens, and create duplicate cache keys.

```ts
// CORRECT — shared hook in lib/api/hooks/useAuth.ts
import { useAuthUser } from '@/lib/api/hooks/useAuth';
const { data: user } = useAuthUser();

// WRONG — inline query in a screen (no staleTime, not reusable)
const { data: user } = useQuery({
  queryKey: ['authUser'],
  queryFn: async () => (await apiClient.get('/auth/me')).data.data,
  // No staleTime — refetches on every mount
});
```

**The `useAuthUser` hook already exists** at `Mobile/lib/api/hooks/useAuth.ts`.
Always use it instead of writing a new `/auth/me` query.

### 2.5 Set `retry` Intentionally

| Scenario | `retry` value |
|---|---|
| Dashboard / profile data (must succeed) | `retry: 1` or `retry: 2` |
| Supplementary data (departments, sessions) | `retry: 1` |
| 404-expected queries (exam attempt check) | `retry: false` |
| Auth endpoints | Do NOT retry (handled by token refresh interceptor in `client.ts`) |

The default `retry: 3` with exponential backoff adds up to ~30 seconds of delay before
an error state shows on a poor connection. For non-critical endpoints, always set `retry: 1`.

### 2.6 Always Pass `limit` to Paginated Endpoints

Never fetch an open-ended list and slice it in the UI. Request only what you display.

```ts
// CORRECT — fetch only what ExamStatus shows
useExams({ limit: 5 });

// CORRECT — paginated teacher list
adminService.getSchoolTeachers(schoolId, { limit: 50, ...params });

// WRONG — fetches hundreds of records, discards 95%
useExams(); // then .slice(0, 5) in the UI
adminService.getSchoolTeachers(schoolId, { limit: 500 });
```

### 2.7 Precise Cache Invalidation — Never Invalidate Everything

```ts
// CORRECT — only invalidates what changed
queryClient.invalidateQueries({ queryKey: notificationKeys.all });
queryClient.invalidateQueries({ queryKey: ['studentProfile'] });

// WRONG — nukes the entire cache, every component refetches
queryClient.invalidateQueries();
```

### 2.8 Query Key Conventions

All hooks MUST follow these exact query key patterns. Using ad-hoc keys for the same
data creates duplicate network requests and cache misses.

| Data | Query Key |
|---|---|
| Auth user | `['authUser']` |
| Student profile | `['studentProfile']` |
| Student exam attempts | `['my-attempts', params]` |
| Exam list | `['exams', params]` |
| Single exam | `['exam', examId]` |
| Exam attempt | `['exam', examId, 'attempt']` |
| Exam review | `['exam', examId, 'review']` |
| Parent dashboard | `['parentDashboard', childId]` |
| Parent children list | `['parent-children']` |
| Child details | `['child-details', childId]` |
| Notifications list | `['notifications', 'list', options]` |
| Notification unread count | `['notifications', 'unreadCount']` |
| School stats | `['mySchoolStats']` |
| School performance analysis | `['mySchoolPerformanceAnalysis', schoolId or 'my']` |
| Dashboard summary (staff) | `['myDashboardSummary']` |
| Today attendance | `['myTodayAttendance', date or 'today']` |
| Admin students | `['adminStudents', schoolId, page, limit, search, filters]` |
| Admin teachers | `['adminTeachers', schoolId, params]` |
| Teacher attendance trend | `['teacherAttendanceTrend', schoolId, days]` |
| Device sessions | `['deviceSessions']` |
| Subscription usage | `['subscription-usage']` |
| School departments | `['schoolDepartments', schoolId]` |
| Grades | `['grades', studentId?, options?]` |
| Classes | `['class', classId]` |

---

## 3. Mobile — React Native Performance Rules

### 3.1 Use `expo-image` for ALL Remote Image URLs

`react-native`'s built-in `Image` has no disk caching. Every navigation to a screen
re-downloads the image. `expo-image` provides automatic memory + disk caching.

```tsx
// CORRECT
import { Image } from 'expo-image';
<Image source={{ uri: profileUrl }} contentFit="cover" />

// WRONG — re-downloads on every render cycle, no caching
import { Image } from 'react-native';
<Image source={{ uri: profileUrl }} />
```

### 3.2 Use `useWindowDimensions()` Instead of `Dimensions.get()`

`Dimensions.get('window')` is a synchronous native bridge call that fires on every render.
The hook version subscribes to changes (rotation, split-screen) and is properly memoized.

```tsx
// CORRECT
const { width } = useWindowDimensions();

// WRONG — synchronous native call on every render
const width = Dimensions.get('window').width;
```

### 3.3 Memoize All Derived Computations Over Arrays

Any function that iterates over a list (sorting, filtering, aggregating scores) MUST
be wrapped in `useMemo` with the source array in the dependency list.

```ts
// CORRECT
const gpa = useMemo(() => {
  return computeGpa(attempts, standaloneGrades);
}, [attempts, standaloneGrades]);

// WRONG — recalculates on every render (tab switches, state updates, etc.)
const gpa = computeGpa(attempts, standaloneGrades);
```

### 3.4 Guard All Refetches with `useNetwork`

Never fire network requests when the device is offline. Every `onRefresh` handler and
`useFocusEffect` must check `isConnected` first.

```ts
const { isConnected } = useNetwork();

const onRefresh = useCallback(async () => {
  if (!isConnected) return; // Block when offline
  setRefreshing(true);
  await Promise.all([refetchA(), refetchB()]);
  setRefreshing(false);
}, [isConnected, refetchA, refetchB]);
```

### 3.5 Notification Badge — Always Use `useUnreadCount()`

Every role dashboard (admin, student, parent, teacher) MUST display the real unread
notification count. Never hardcode a number.

```tsx
// CORRECT — all 4 role dashboards must do this
import { useUnreadCount } from '@/lib/api/hooks/useNotifications';
const { data: unreadData } = useUnreadCount();
const unreadCount = unreadData?.count || 0;

{unreadCount > 0 && (
  <View>
    <Text>{unreadCount > 9 ? '9+' : unreadCount}</Text>
  </View>
)}

// WRONG — hardcoded badge is always stale
<Text>5</Text>
```

---

## 4. TypeScript Rules (Zero Tolerance)

Per the Flexiti Engineering Constitution:

### 4.1 `any` is Banned

```ts
// CORRECT
export const useExams = (params?: Record<string, unknown>) => { ... }

// BANNED
export const useExams = (params?: any) => { ... }
```

Use `unknown` with type narrowing, or define a proper interface.

### 4.2 Type Every API Response

Every service function must declare its return type. Use typed generics on `apiClient`.

```ts
// CORRECT
const response = await apiClient.get<{ success: boolean; data: DashboardData }>(url);
return response.data.data;

// WRONG — hides data shape mismatches that cause silent runtime errors
const response = await apiClient.get(url);
return response.data.data;
```

### 4.3 Use Zod for All Backend Input Validation

Every Express route that accepts request body or params must validate with Zod before
the data reaches the service layer. No exceptions.

```ts
// CORRECT — backend controller
const schema = z.object({ childId: z.string().uuid() });
const parsed = schema.parse(req.params);
```

---

## 5. Backend Architecture Rules

Follow the strict 3-layer pattern. No logic bleeds between layers.

```
HTTP Request
    |
    v
Controller   -> Parse request, validate with Zod, call Service, return HTTP response
    |
    v
Service      -> Business logic, orchestration, no HTTP concerns
    |
    v
Repository   -> Database queries via Prisma only
```

- **Controllers** return `{ success: true, data: ... }` or delegate errors to global middleware.
- **Services** throw typed errors — never write `res.json()` in a service.
- **Repositories** never contain business logic.
- **Standard error response**: `{ success: false, error: "message" }`

### 5.1 Controller Decomposition Protocol

#### Trigger
Whenever you read, edit, fix, or add to any handler in a controller file under `backend/src/modules/**/*.controller.ts`, and that file is over 300 lines OR the handler you touch is over 40 lines OR it contains Prisma calls or business logic, you MUST run this protocol on the handler you touched BEFORE finishing the task. Do not wait to be asked.

#### Scope Rule (Important)
Only decompose what you touched. Do not refactor the whole controller or unrelated handlers. The controller shrinks gradually, one touched handler at a time.

#### Target Structure
```
modules/<module>/
  controllers/<feature>.controller.ts   (thin handlers, grouped by use case)
  controllers/index.ts                  (barrel: re-exports every handler)
  services/<feature>.service.ts         (business logic + Prisma via withRetry)
  schemas/<feature>.schemas.ts          (zod validation, if the handler validates input)
  <module>.routes.ts                    (imports from the barrel, unchanged)
```

A handler should only: parse/validate the request, call a service, and send the response (about 10–20 lines). All Prisma calls and business logic live in services, and all DB calls go through `withRetry`. Services never import controllers. Name files by what they do; if a description needs "and", split it again.

#### Steps
1. **Baseline first.** Before changing anything, run `npx tsc --noEmit` and the existing tests/build. Note any pre-existing failures so you don't blame yourself for them.
2. **Refactor commit (pure move, no behavior change).**
   - Extract the touched handler's logic into the matching service function (create the service file if needed).
   - Move the thin handler into a feature-named controller file, or keep it in place if the file is already small.
   - Re-export it from the barrel so no route or import elsewhere breaks.
   - Preserve the exact response shapes, status codes, error messages and logging. Do not "improve" anything in this step.
3. **Verify the refactor.** All of these must pass before continuing:
   - `npx tsc --noEmit` has no new errors.
   - Build succeeds (`npm run build`).
   - No circular imports (controller -> service only, never the reverse).
   - Existing tests pass. If the handler has no test, add a minimal one (or a scripted request) covering the happy path and one error path.
   - Smoke test the affected route(s): start the server and call the endpoint (curl or the test client). Confirm the status code and response body match what it returned before the move. For auth/session routes, also test the unauthenticated and expired-token paths.
4. **Behavior change commit (only now).** Apply the actual fix or feature the task asked for, on top of the clean structure. Re-run the verification from step 3.
5. **Report.** End your reply with:
   - Files created/moved/changed
   - Controller line count before -> after
   - Verification results (tsc, build, tests, routes smoke-tested with status codes)
   - Anything you could NOT verify and why

#### Hard Rules
- Never mix a pure move and a behavior change in the same commit.
- If verification fails and you can't fix it quickly, revert the refactor and tell me instead of leaving things half-moved.
- Don't rename routes, change response shapes, or alter auth/middleware order during a move.
- Don't add dependencies for this.
- If the touched handler is already thin and in a small file, say "no decomposition needed" and move on.
- Update `STATE.md` (and `AUTH_STATE.md` for auth changes) with a one-line note of what was decomposed.

#### Never Skip
If you are about to say "done" and haven't run step 3 on the code you moved, you are not done.

---


## 6. Known Bugs and Anti-Patterns — Do Not Repeat

These were all found in production code in this repository.

| Anti-Pattern | Problem | Correct Fix |
|---|---|---|
| `"{variable}"` in JSX | Renders literal string `"..."` instead of value | `{variable}` without quotes |
| `new Date(null)` in sort comparators | Produces `NaN`, corrupts sort order | Filter `null` dates before sorting |
| `refetchInterval: 30000` | 4 requests/minute per hook — excessive load | Use 2–5 minute intervals minimum |
| `limit: 500` in API call | Downloads hundreds of records on every mount | Use realistic page sizes (20–50) |
| Synchronous `refetch()` in `useFocusEffect` | Freezes navigation animation (JS thread block) | Wrap in `InteractionManager.runAfterInteractions()` |
| Inline `useQuery` in screen components | No `staleTime`, not reusable, duplicate cache entries | Extract to a hook in `lib/api/hooks/` |
| `Dimensions.get('window')` in render | Synchronous native bridge call per render | Use `useWindowDimensions()` |
| `react-native` `Image` for remote URLs | No disk caching — re-downloads every render | Use `expo-image` |
| Hardcoded notification count | Always stale, shows wrong number | Use `useUnreadCount()` |
| String compared with `> 0` as a number | JS type coercion — silent, incorrect result | `parseInt(value, 10) > 0` |
| `retry: 3` (default) on non-critical queries | 30s of retries on poor connections | `retry: 1` for supplementary endpoints |

---

## 7. File Structure Reference (Mobile)

```
Mobile/
|-- app/
|   |-- (admin-tabs)/
|   |   |-- index.tsx          <- Admin dashboard (uses useAuthUser, useMySchoolStats)
|   |   |-- teachers.tsx       <- Teacher management (useAdminTeachers limit: 50)
|   |   |-- students.tsx
|   |   |-- classes.tsx
|   |   `-- exams.tsx
|   |-- (student-tabs)/
|   |   |-- index.tsx          <- Student dashboard (InteractionManager pattern)
|   |   |-- grades.tsx         <- Grades (memoized GPA calculation)
|   |   |-- assignments.tsx
|   |   `-- timetable.tsx
|   |-- (parent-tabs)/
|   |   `-- index.tsx          <- Parent dashboard (useParentDashboard staleTime: 3min)
|   |-- (teacher-tabs)/
|   |   `-- index.tsx          <- Teacher dashboard (useUnreadCount badge)
|   `-- _layout.tsx            <- QueryClientProvider lives here
|-- components/
|   |-- admin-dashboard/
|   |-- student-dashboard/
|   |-- parent-dashboard/
|   `-- teacher-dashboard/
`-- lib/
    |-- api/
    |   |-- client.ts          <- Axios instance with automatic token refresh interceptor
    |   |-- hooks/             <- ALL useQuery / useMutation hooks go here
    |   |   |-- useAuth.ts         <- useAuthUser() staleTime: Infinity (SHARED — use this)
    |   |   |-- useAdmin.ts        <- staleTime: 5min, limit: 50
    |   |   |-- useExams.ts        <- staleTime: 2min
    |   |   |-- useGrades.ts
    |   |   |-- useLinks.ts
    |   |   |-- useNotifications.ts <- badge: poll 2min, list: no poll
    |   |   |-- useParentChildren.ts
    |   |   |-- useParentDashboard.ts <- staleTime: 3min
    |   |   |-- useSchool.ts        <- staleTime: 5min
    |   |   |-- useStudent.ts       <- useDeviceSessions staleTime: 10min
    |   |   |-- useSubjects.ts
    |   |   `-- useSubscriptionUsage.ts
    |   `-- services/          <- Raw API call functions (no hooks, no useQuery here)
    |       |-- adminService.ts
    |       |-- examService.ts
    |       |-- parentService.ts
    |       |-- schoolService.ts
    |       `-- notificationService.ts
    |-- auth/
    |   |-- secure-store.ts    <- Token storage (Expo SecureStore)
    |   `-- authEvents.ts      <- Logout event emitter
    `-- utils/
```

---

## 8. Pre-Submission Checklist

Before marking any mobile task as complete, verify every item below:

- [ ] Every new `useQuery` has an explicit **`staleTime`** set (see table in section 2.1)
- [ ] Every `useFocusEffect` with refetch calls uses **`InteractionManager.runAfterInteractions()`** with a cancel cleanup return
- [ ] No `refetchInterval` below 2 minutes — if added, a comment explains why
- [ ] Remote images use **`expo-image`**, not `react-native`'s `Image`
- [ ] Screen dimensions use **`useWindowDimensions()`**, not `Dimensions.get()`
- [ ] Derived array computations (sort, filter, aggregate) are wrapped in **`useMemo`**
- [ ] All network calls are guarded with **`if (!isConnected) return`**
- [ ] Notification badge uses **`useUnreadCount()`** — never a hardcoded number
- [ ] All API calls pass a **`limit`** parameter to paginated endpoints
- [ ] No **`any`** type in any new code
- [ ] Query keys match the canonical table in section 2.8
- [ ] If authentication or database code was touched: [`AUTH_STATE.md`](AUTH_STATE.md) was reviewed prior to edits and documented with changes
- [ ] Code is broken into small, reusable, and functional components (no giant monolithic files)
- [ ] `STATE.md` has been updated with a dated entry for today's changes
