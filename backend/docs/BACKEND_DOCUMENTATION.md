# SchoolHub Backend — Technical Documentation

> **Stack**: Node.js · Express 5 · TypeScript · Prisma ORM · PostgreSQL · Socket.io · JWT Auth  
> **Base URL**: `https://schoolhub.flexitistudio.com/api` (production) · `http://localhost:5000/api` (local)  
> **All versioned routes**: `/api/v1/...`

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Entry Point & Server Bootstrap](#2-entry-point--server-bootstrap)
3. [Configuration](#3-configuration)
4. [Middleware](#4-middleware)
5. [Route Registry](#5-route-registry)
6. [Modules (API Reference)](#6-modules-api-reference)
   - [Auth](#61-auth-module)
   - [Admin](#62-admin-module)
   - [School](#63-school-module)
   - [Teacher Dashboard](#64-teacher-dashboard-module)
   - [Class](#65-class-module)
   - [Academic](#66-academic-module)
   - [Exam](#67-exam-module)
   - [Grade](#68-grade-module)
   - [Student](#69-student-module)
   - [Link](#610-link-module)
   - [Notification](#611-notification-module)
   - [Session](#612-session-module)
   - [Upload](#613-upload-module)
7. [Real-Time: Socket.io](#7-real-time-socketio)
8. [Authentication Flow](#8-authentication-flow)
9. [Standard Response Format](#9-standard-response-format)
10. [Environment Variables](#10-environment-variables)
11. [Running the Backend](#11-running-the-backend)

---

## 1. Project Structure

```
backend/
├── src/
│   ├── index.ts                  # Server entry point
│   ├── config/
│   │   ├── database.ts           # Prisma client singleton
│   │   └── cloudinary.ts         # Cloudinary config (uploads)
│   ├── middleware/
│   │   ├── authMiddleware.ts     # JWT verification + user context
│   │   ├── rate-limit.middleware.ts  # Login rate limiter
│   │   └── validateRequest.ts    # Yup schema validation wrapper
│   ├── routes/
│   │   └── index.ts              # Master route registry
│   ├── services/
│   │   └── authService.ts        # Token generation utilities
│   ├── socket/
│   │   └── index.ts              # Socket.io init & room management
│   ├── utils/
│   │   └── code-generator.ts     # Unique code helpers (studentCode, etc.)
│   └── modules/                  # Feature modules (controller + service + route)
│       ├── auth/
│       ├── admin/
│       ├── school/
│       ├── teacher/              # Teacher dashboard (separated module)
│       ├── class/
│       ├── academic/
│       ├── exam/
│       ├── grade/
│       ├── student/
│       ├── link/
│       ├── notification/
│       ├── session/
│       └── upload/
├── prisma/
│   └── schema.prisma             # Database schema
├── package.json
└── tsconfig.json
```

### Module Pattern

Every module follows a consistent three-layer pattern:

```
module/
├── module.controller.ts   # HTTP handlers (req/res) — thin layer
├── module.service.ts      # Business logic + Prisma queries
└── module.route.ts        # Express router (applies auth middleware)
```

---

## 2. Entry Point & Server Bootstrap

**File**: `src/index.ts`

```
startup sequence:
1. Load .env
2. Create Express app
3. Apply CORS (allow localhost:3000 + production domain)
4. Apply cookieParser + express.json()
5. Mount /api routes
6. Register global error handler
7. Wrap app in http.Server
8. Init Socket.io on http server
9. Listen on 0.0.0.0:PORT
```

**Allowed CORS Origins**:
- `http://localhost:3000`
- `https://schoolhub.flexitistudio.com`
- `https://www.schoolhub.flexitistudio.com`

**Global Error Handler** sanitises Prisma/file-path details out of error messages before sending to client (prevents database schema leakage).

---

## 3. Configuration

### Database (`src/config/database.ts`)
- Uses a **singleton Prisma client** — one instance reused across the app.
- In `development`, the instance is cached on `global.prisma` to prevent hot-reload connection exhaustion.
- Query logging enabled in development, only errors in production.

### Environment Variables — see [Section 10](#10-environment-variables).

---

## 4. Middleware

### `authenticateToken` (authMiddleware.ts)

Applied to all protected routes. Flow:

```
1. Extract token from:
   a. Authorization: Bearer <token>   header, OR
   b. req.cookies.token               HTTP-only cookie

2. Verify JWT signature against JWT_ACCESS_SECRET

3. Based on decoded userType (ADMIN | TEACHER | STUDENT):
   → Lookup user in DB to resolve schoolId context

4. Attach req.user = { id, userType, schoolId } for downstream handlers

5. Any failure → 401 with specific message (expired vs invalid)
```

### `validateRequest(schema)` (validateRequest.ts)
Yup-based body validation middleware. Returns `400 + message` on first validation error.

### `loginLimiter` (rate-limit.middleware.ts)
Limits login attempts to **10 per IP per 15 minutes** using `express-rate-limit`.

---

## 5. Route Registry

**File**: `src/routes/index.ts`

| Mount Prefix | Module |
|---|---|
| `GET /api/health` | Health check |
| `/api/auth` | Auth module |
| `/api/admin` | Admin module |
| `/api/schools` | School module |
| `/api/teacher` | Teacher Dashboard module |
| `/api/classes` | Class module |
| `/api/academic` | Academic module (subjects, departments) |
| `/api/exams` | Exam module |
| `/api/grades` | Grade module |
| `/api/students` | Student module |
| `/api/links` | Link (relationship) module |
| `/api/notifications` | Notification module |
| `/api/sessions` | Academic session module |
| `/api/upload` | File upload module |

> All routes except auth registration/login endpoints require a valid JWT.

---

## 6. Modules (API Reference)

### 6.1 Auth Module

**Prefix**: `/api/auth`  
**Authentication**: PUBLIC routes only (no token required unless noted)

#### User Types
| Type | Description |
|---|---|
| `SCHOOL` | Registers both a school + admin account |
| `TEACHER` | Individual teacher account |
| `STUDENT` | Individual student account |
| `PARENT` | Parent account, optionally linked to a student |

#### Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/register/school` | Register a new school + admin account |
| `POST` | `/register/teacher` | Register a new teacher |
| `POST` | `/register/student` | Register a new student |
| `POST` | `/register/parents` | Register a new parent |
| `GET` | `/students/code/:studentCode` | Look up a student by their code (for parent linking) |
| `POST` | `/parents/link-child` | Link a parent account to a child via student code |
| `POST` | `/google` | Google OAuth sign-in (STUDENT / PARENT only) |
| `POST` | `/request-code` | Request email verification OTP |
| `POST` | `/verify-code` | Submit OTP to verify email |
| `POST` | `/login` | Login (email + password + userType) |
| `POST` | `/refresh` | Refresh access token via cookie |
| `POST` | `/logout` | Clear session cookie |
| `POST` | `/password/reset/request` | Request password reset email |
| `GET` | `/password/reset/validate/:token` | Validate reset token |
| `POST` | `/password/reset/verify` | Verify reset token |
| `POST` | `/password/reset/complete` | Set new password with reset token |

#### Registration Validation Rules (Yup)
- **Password**: min 8 chars, uppercase, lowercase, number, special character, no spaces
- **School**: `schoolName`, `adminName`, `email`, `password`, optional `subdomain`
- **Student tenantId**: must be 6-digit numeric code
- **Parent studentCode**: format `stu-123456`
- **Login** requires `userType` (ADMIN | TEACHER | STUDENT | PARENT)

#### Token Strategy
- **Access token**: short-lived JWT signed with `JWT_ACCESS_SECRET`, carries `userId` + `userType`
- **Refresh token**: long-lived, stored as HTTP-only cookie
- Google Auth creates/finds user by `googleId`, falls back to email merge

---

### 6.2 Admin Module

**Prefix**: `/api/admin`  
**Authentication**: Mixed (some public, most protected)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/verify-tenant` | Public | Verify a school's tenant ID code |
| `POST` | `/register/admin-self` | Public | Admin self-registration |
| `GET` | `/admin-status/:email` | Public | Check if admin is verified |
| `GET` | `/pending` | 🔒 | Get pending admin approvals |
| `GET` | `/teachers` | 🔒 | Get all school teachers |
| `GET` | `/students` | 🔒 | Get all school students |
| `GET` | `/members` | 🔒 | Get all school members |
| `PATCH` | `/profile` | 🔒 | Update admin profile |
| `PATCH` | `/students/:id/verify` | 🔒 | Manually verify a student |
| `PUT` | `/:adminId/approve` | 🔒 | Approve a pending admin |
| `PUT` | `/:adminId/reject` | 🔒 | Reject a pending admin |

---

### 6.3 School Module

**Prefix**: `/api/schools`  
**Authentication**: All routes protected 🔒

| Method | Path | Description |
|---|---|---|
| `GET` | `/:schoolId/teachers` | List all teachers in a school |
| `GET` | `/:schoolId/students` | List all students in a school |
| `GET` | `/:schoolId/stats` | High-level school statistics |
| `GET` | `/:schoolId/performance-analysis` | School-wide performance analysis |
| `GET` | `/:schoolId/dashboard-summary` | Admin dashboard summary |
| `GET` | `/:schoolId/profile` | Full school profile |
| `PATCH` | `/:schoolId/profile` | Update school profile |
| `GET` | `/:schoolId/settings` | School-wide settings |
| `PATCH` | `/:schoolId/settings` | Update school settings |

---

### 6.4 Teacher Dashboard Module

**Prefix**: `/api/teacher`  
**Authentication**: All routes protected 🔒  
**File**: `src/modules/teacher/`

All endpoints automatically scope data to the authenticated teacher via their JWT `userId`.

| Method | Path | Query Params | Description |
|---|---|---|---|
| `GET` | `/dashboard-stats` | `schoolId?` | Stats: total classes, students, avg performance, attendance |
| `GET` | `/linked-schools` | — | All schools the teacher is connected to |
| `GET` | `/performance-trends` | `schoolId?`, `range?` | Grade trends over 6 months (grouped by month) |
| `GET` | `/students` | `schoolId?`, `classId?`, `search?`, `page?`, `limit?` | Paginated student list with performance + attendance |
| `GET` | `/classes` | `schoolId?` | All assigned classes with aggregated stats |
| `GET` | `/classes/:classId` | — | Full detail for one class (stats, top students, upcoming exams) |
| `GET` | `/classes/:classId/assignments` | `category?` | Exams/assignments for a class |
| `GET` | `/classes/:classId/grades` | — | Grade breakdown per student in a class |

#### Dashboard Stats Response Shape
```json
{
  "stats": { "totalClasses", "totalStudents", "averagePerformance", "attendanceRate" },
  "performanceMetrics": { "topStudents[]", "distribution": { "A", "B", "C", "D", "F" } },
  "recentExams[]"
}
```

#### Authorization Model
The teacher dashboard enforces school-level access before returning data:
1. Check teacher's `schoolId` / `currentSchoolId` in their profile
2. If no direct match → check `RelationshipLink` for `SCHOOL_TEACHER` active link
3. If still unmatched → check `ClassTeacher` table for any class assignment in the school
4. If none pass → return empty data (no 403 thrown, just an empty result)

---

### 6.5 Class Module

**Prefix**: `/api/classes`  
**Authentication**: All routes protected 🔒

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Create a new class |
| `GET` | `/` | List classes (filtered by school/teacher context) |
| `GET` | `/code/:classCode` | Preview class by classroom code |
| `POST` | `/join/request` | Student requests to join a class |
| `PATCH` | `/:id` | Update class details |
| `PATCH` | `/:id/status` | Change class status |
| `PATCH` | `/:id/archive` | Archive a class |
| `POST` | `/subjects/attach` | Attach subjects to a class |
| `PUT` | `/subjects/edit` | Edit class subjects |
| `DELETE` | `/:id/subjects/:subjectId` | Remove a subject from a class |
| `POST` | `/students/add` | Enroll a student in a class |
| `DELETE` | `/:id/students/:studentId` | Remove a student from a class |
| `PATCH` | `/:id/approve` | Admin approves class join request |
| `PATCH` | `/:id/reject` | Admin rejects class join request |
| `GET` | `/:id/attendance` | Get attendance records |
| `POST` | `/:id/attendance` | Submit attendance |
| `GET` | `/:id/attendance/summary` | Attendance summary for a class |
| `GET` | `/:id/timetable` | Get class timetable |
| `POST` | `/:id/timetable` | Add/update a timetable period |
| `DELETE` | `/:id/timetable/:periodId` | Delete a timetable period |
| `GET` | `/preview/:id` | Preview a class by ID |
| `GET` | `/:id/stats` | Class statistics |
| `GET` | `/:id/behaviour-alerts` | List behaviour alerts for a class |
| `POST` | `/:id/behaviour-alerts` | Create a behaviour alert |
| `GET` | `/:id` | Get a single class with full detail |

---

### 6.6 Academic Module

**Prefix**: `/api/academic`  
**Authentication**: All routes protected 🔒

#### Subjects
| Method | Path | Description |
|---|---|---|
| `POST` | `/subjects` | Create a subject |
| `GET` | `/subjects` | List subjects |
| `GET` | `/subjects/:id` | Get single subject |
| `PATCH` | `/subjects/:id` | Update subject |
| `PATCH` | `/subjects/:id/archive` | Archive subject |
| `POST` | `/subjects/:id/departments` | Attach departments to subject |
| `POST` | `/subjects/:id/teachers` | Attach teachers to subject |

#### Departments
| Method | Path | Description |
|---|---|---|
| `POST` | `/departments` | Create a department |
| `GET` | `/departments` | List departments |
| `GET` | `/departments/:id` | Get single department |
| `PATCH` | `/departments/:id` | Update department |
| `PATCH` | `/departments/:id/archive` | Archive department |
| `POST` | `/departments/subjects/attach` | Attach subjects to department |
| `DELETE` | `/departments/:id/subjects/:subjectId` | Remove subject from department |

#### Teacher-Subject Assignment
| Method | Path | Description |
|---|---|---|
| `POST` | `/teacher-subjects/assign` | Assign a teacher to a subject |
| `GET` | `/teacher-subjects` | Get teacher-subject assignments |

#### Grades (Academic context)
| Method | Path | Description |
|---|---|---|
| `GET` | `/grades` | Student grades (filtered) |
| `GET` | `/grades/admin` | Admin view of all grades |
| `GET` | `/grades/:id` | Single grade entry |

---

### 6.7 Exam Module

**Prefix**: `/api/exams`  
**Authentication**: All routes protected 🔒

#### AI Tools
| Method | Path | Description |
|---|---|---|
| `POST` | `/ai/parse-text` | Parse raw text into structured questions (AI) |
| `POST` | `/ai/generate` | Generate exam questions via AI |

#### Subject Papers
| Method | Path | Description |
|---|---|---|
| `GET` | `/papers/all` | List all subject papers |
| `POST` | `/papers` | Create a subject paper |
| `PATCH` | `/papers/:paperId` | Update a paper |
| `PATCH` | `/papers/:paperId/link` | Link paper to an exam |
| `PATCH` | `/papers/:paperId/unlink` | Unlink paper from an exam |

#### Exam CRUD
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List exams |
| `POST` | `/` | Create an exam |
| `GET` | `/:id` | Get exam by ID |
| `PATCH` | `/:id` | Update exam |
| `DELETE` | `/:id` | Delete exam |
| `POST` | `/:id/papers` | Add a subject paper to an exam |
| `GET` | `/:id/papers` | Get all papers for an exam |
| `GET` | `/:id/papers/:paperId` | Get specific exam paper |

#### Questions
| Method | Path | Description |
|---|---|---|
| `POST` | `/:id/papers/:paperId/questions/manual` | Add questions manually |
| `POST` | `/:id/papers/:paperId/questions/ai` | Add AI-generated questions |
| `PATCH` | `/questions/:questionId` | Update a question |
| `PATCH` | `/:id/papers/:paperId/questions/reorder` | Reorder questions |
| `DELETE` | `/questions/:questionId` | Delete a question |

#### Publishing
| Method | Path | Description |
|---|---|---|
| `POST` | `/:id/papers/:paperId/validate` | Validate a subject paper |
| `POST` | `/:id/papers/:paperId/publish` | Publish a subject paper |
| `POST` | `/:id/papers/:paperId/unpublish` | Unpublish a subject paper |
| `DELETE` | `/:id/papers/:paperId` | Delete a subject paper |
| `POST` | `/:id/validate` | Validate full exam |
| `POST` | `/:id/publish` | Publish exam |
| `POST` | `/:id/unpublish` | Unpublish exam |

#### Student Attempts
| Method | Path | Description |
|---|---|---|
| `POST` | `/:id/start` | Start an exam attempt |
| `GET` | `/my/attempts` | Student's own attempts |
| `GET` | `/:id/attempt` | Get current attempt for an exam |
| `GET` | `/:id/attempts` | All attempts for an exam (teacher/admin) |
| `DELETE` | `/:id/attempts/:studentId` | Delete a specific attempt |
| `POST` | `/:id/answers` | Save/update an answer during attempt |
| `POST` | `/:id/submit` | Submit completed attempt |
| `GET` | `/:id/review` | Review data for an attempt |
| `GET` | `/:id/result` | Final result for attempt |

#### Review (Subjective Questions)
| Method | Path | Description |
|---|---|---|
| `GET` | `/review/queue` | Get manual review queue |
| `PATCH` | `/review/answers/:answerId` | Mark a subjective answer |

#### Analytics
| Method | Path | Description |
|---|---|---|
| `GET` | `/:id/ranking` | Student ranking for an exam |
| `GET` | `/:id/analytics/class` | Class-level exam analytics |
| `GET` | `/:id/analytics/department` | Department-level analytics |
| `GET` | `/analytics/session` | Session-wide analytics |
| `GET` | `/my/stats` | Student's own global statistics |

---

### 6.8 Grade Module

**Prefix**: `/api/grades`  
**Authentication**: None enforced at router level (controller may check)

| Method | Path | Description |
|---|---|---|
| `GET` | `/hub` | Grade hub overview (class-level grade summary) |
| `POST` | `/` | Create a grade entry |
| `PATCH` | `/:id` | Update a grade score |
| `DELETE` | `/:id` | Delete a grade |
| `POST` | `/ocr` | Process scanned answer sheets via OCR |
| `POST` | `/bulk` | Bulk create grade entries |

---

### 6.9 Student Module

**Prefix**: `/api/students`  
**Authentication**: All routes protected 🔒

| Method | Path | Description |
|---|---|---|
| `GET` | `/profile` | Get authenticated student's own profile |
| `PATCH` | `/profile` | Update student profile |
| `POST` | `/profile/email/request` | Request email change OTP |
| `POST` | `/profile/email/verify` | Confirm email change with OTP |
| `GET` | `/:id` | Get student by ID |
| `PATCH` | `/profile/department` | Student picks their department |
| `PATCH` | `/:id/department` | Admin sets student's department |

---

### 6.10 Link Module

**Prefix**: `/api/links`  
**Authentication**: All routes protected 🔒

The Link module manages **RelationshipLinks** — bidirectional connection requests between entities (e.g. School ↔ Teacher, Parent ↔ Student).

| Method | Path | Description |
|---|---|---|
| `POST` | `/request` | Create a new link request |
| `PATCH` | `/request/:id/respond` | Accept or reject a link request |
| `PATCH` | `/request/:id/cancel` | Cancel a sent request |
| `GET` | `/request/:id` | Get single link request |
| `GET` | `/requests` | All link requests (admin view) |
| `GET` | `/requests/sent` | Requests you have sent |
| `GET` | `/requests/pending` | Requests pending YOUR action |
| `GET` | `/active` | Your currently active links |
| `GET` | `/profile` | Your linked profile summary |
| `PATCH` | `/active/:id/revoke` | Revoke an active link |
| `POST` | `/requests/batch-action` | Accept/reject multiple requests at once |
| `POST` | `/requests/accept-all` | Accept all requests by category |
| `POST` | `/active/batch-revoke` | Revoke multiple active links |

---

### 6.11 Notification Module

**Prefix**: `/api/notifications`  
**Authentication**: All routes protected 🔒

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get all notifications for the authenticated user |
| `GET` | `/unread-count` | Get count of unread notifications |
| `PATCH` | `/:id/read` | Mark a single notification as read |
| `PATCH` | `/read-all` | Mark all notifications as read |

> Notifications are also pushed in real-time via Socket.io to the user's private room.

---

### 6.12 Session Module

**Prefix**: `/api/sessions`  
**Authentication**: All routes protected 🔒

Academic session management (e.g. 2024/2025 Term 1).

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Create an academic session |
| `GET` | `/` | List all sessions |
| `GET` | `/active` | Get the currently active session |

---

### 6.13 Upload Module

**Prefix**: `/api/upload`  
**Authentication**: Protected 🔒

Handles file uploads (profile images, documents). Uses AWS S3 (presigned URLs) and Cloudinary depending on context.

---

## 7. Real-Time: Socket.io

**File**: `src/socket/index.ts`

Socket.io runs on the same HTTP server as Express. Clients connect and join a **user-specific room** using their user ID.

```
Client connects → emits "join:user" with userId
Server: socket.join(`user:${userId}`)
```

This allows the backend to push notifications/events to a specific user:
```typescript
// From anywhere in the backend:
import { getIO } from "./socket";
getIO().to(`user:${targetUserId}`).emit("notification", payload);
```

**CORS**: same origins as Express.

---

## 8. Authentication Flow

```
                    ┌─────────────────────────────┐
                    │       Client (Browser)       │
                    └────────────┬────────────────-┘
                                 │
                  POST /api/auth/login
                  { email, password, userType }
                                 │
                    ┌────────────▼────────────────-┐
                    │      Auth Controller         │
                    │  loginUser() service         │
                    │  1. Find user by email       │
                    │  2. bcrypt.compare password  │
                    │  3. generateAccessToken()    │
                    │  4. Set refresh token cookie │
                    └────────────┬────────────────-┘
                                 │
                  Response: { token, user }
                                 │
                  ┌──────────────▼──────────────────┐
                  │  Subsequent API requests         │
                  │  Header: Authorization: Bearer.. │
                  │           OR cookie: token       │
                  │                                  │
                  │  authenticateToken middleware     │
                  │  → jwt.verify()                  │
                  │  → attach req.user               │
                  │  → next()                        │
                  └─────────────────────────────────-┘
```

### Password Reset Flow
```
1. POST /auth/password/reset/request    → email with reset link sent via Resend
2. GET  /auth/password/reset/validate/:token → validate token is valid + unexpired
3. POST /auth/password/reset/verify     → verify the token
4. POST /auth/password/reset/complete   → set new password
```

---

## 9. Standard Response Format

All endpoints return JSON in a consistent shape:

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Paginated Responses
```json
{
  "success": true,
  "data": {
    "students": [...],
    "total": 42
  }
}
```

**HTTP Status Codes used**:
| Code | Meaning |
|---|---|
| `200` | OK — request succeeded |
| `400` | Bad request — validation or business logic error |
| `401` | Unauthorised — missing/invalid/expired token |
| `403` | Forbidden — token valid but access denied |
| `404` | Not found |
| `500` | Internal server error |

---

## 10. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string for Prisma |
| `JWT_ACCESS_SECRET` | ✅ | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret key for refresh tokens |
| `RESEND_API_KEY` | ✅ | Resend API key for transactional emails |
| `MAIL_FROM` | ✅ | Sender email address |
| `FRONTEND_URL` | ✅ | Frontend base URL (used in password reset links) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `RESEND_TEST` | No | Set to `"true"` to redirect all emails to `TEST_EMAIL` |
| `TEST_EMAIL` | No | Catch-all email for test mode |
| `CLOUDINARY_URL` | No | Cloudinary upload preset |
| `AWS_ACCESS_KEY_ID` | No | AWS S3 credentials |
| `AWS_SECRET_ACCESS_KEY` | No | AWS S3 credentials |
| `AWS_S3_BUCKET` | No | S3 bucket name |

---

## 11. Running the Backend

### Development
```bash
cd backend
npm install
npm run dev
# Starts ts-node-dev with hot reload on port 5000
```

### Production Build
```bash
npm run build    # tsc + tsc-alias (resolves path aliases)
npm start        # node dist/index.js
```

### Database
```bash
npx prisma generate    # Regenerate Prisma client
npx prisma migrate dev # Run migrations in development
npx prisma studio      # Visual DB browser at localhost:5555
```

### Type Checking
```bash
npx tsc --noEmit    # Check for TypeScript errors without building
```
