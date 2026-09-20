# Multi-Admin RBAC — End-to-End Test Plan

> Run these tests with **both the backend and frontend dev servers running**.
> Backend: `npm run dev` in `/backend`
> Frontend: `npm run dev` in `/frontend`

---

## Pre-requisite: Accounts to Set Up

You need **5 browser sessions** (or use Incognito windows) with these accounts:

| Persona | Role | How to Create |
|---|---|---|
| **Alice** | `SCHOOL_OWNER` | Register a new school at `/signup/school` |
| **Bob** | `PRINCIPAL` | Join Alice's school via school code (approved by Alice) |
| **Carol** | `REGISTRAR` | Join Alice's school via school code (approved by Alice) |
| **Dave** | `ACCOUNTANT` | Join Alice's school via school code (approved by Alice) |
| **Eve** | `SUPPORT` | Join Alice's school via school code (approved by Alice) |

> Get Alice's **School Code** from `/dashboard/admin/school-profile` after she registers.

---

## Section A — Admin Join Flow

### A1. Register as School Owner
- [ ] Go to `/signup/school`
- [ ] Confirm the page shows a **"Register New School"** toggle (default)
- [ ] Fill in all fields and submit
- [ ] Confirm redirect to the admin dashboard
- [ ] Confirm `user.adminRole === "SCHOOL_OWNER"` (check browser DevTools → Application → Zustand store or network `/auth/me` response)

### A2. Toggle to Join Existing School
- [ ] Go to `/signup/school` in a new session (Bob's account)
- [ ] Click **"Join Existing School"** toggle
- [ ] Confirm the form switches to: **School Code**, Name, Email, Password fields
- [ ] Enter an **invalid school code** → confirm error message shown
- [ ] Enter **Alice's valid school code** → submit
- [ ] Confirm success message: _"Your request has been sent. An admin will review it."_
- [ ] Confirm Bob **cannot** log in yet (or if they can, they see a "pending" state)

### A3. Email Notification
- [ ] Confirm Alice receives an email notifying her of Bob's pending request
- [ ] Check email contains Bob's name and email

---

## Section B — Team Management Page

> Login as **Alice (SCHOOL_OWNER)**

### B1. Page Access
- [ ] Navigate to `/dashboard/admin/team`
- [ ] Confirm **"Team"** appears in the sidebar
- [ ] Confirm the page loads with two tabs: **Active Members** and **Pending Requests**

### B2. Pending Requests Tab
- [ ] Click **Pending Requests** tab
- [ ] Confirm Bob's request appears with status **"Pending Review"**
- [ ] Confirm the **Approve** and **Reject** buttons are visible

### B3. Approve Bob as Principal
- [ ] Click **Approve** next to Bob
- [ ] Confirm a dialog appears asking you to **select a role**
- [ ] Select **Principal** → click "Approve & Assign Role"
- [ ] Confirm Bob disappears from Pending tab
- [ ] Confirm Bob appears in **Active Members** tab with role badge **"Principal"**
- [ ] Confirm Bob receives an approval email

### B4. Reject Eve's Request
- [ ] Submit Eve's join request (repeat A2 for Eve)
- [ ] As Alice, go to Pending Requests
- [ ] Click **Reject** next to Eve
- [ ] Enter a reason: _"Unrecognized applicant"_
- [ ] Confirm Eve disappears from pending list
- [ ] Confirm Eve receives a rejection email with the reason

### B5. Approve Carol (Registrar) and Dave (Accountant)
- [ ] Repeat B3 for Carol → assign **Registrar**
- [ ] Repeat B3 for Dave → assign **Accountant**

---

## Section C — Role-Based Sidebar Filtering

> Each test below: **log in as that persona**, navigate to the admin dashboard.

### C1. SCHOOL_OWNER (Alice)
- [ ] Confirm sidebar shows ALL items including: Team, Settings, Finance, Billing, Linking Hub, Sub Domain, Session Management, Invitations

### C2. PRINCIPAL (Bob)
- [ ] Confirm sidebar shows: Team, School Profile, Teachers, Students, Classes, Grades, Exams, etc.
- [ ] Confirm sidebar **DOES NOT show**: Settings, Finance, Billing, Sub Domain, Linking Hub, Session Management

### C3. REGISTRAR (Carol)
- [ ] Confirm sidebar shows: Overview, Teachers, Students, Classes, Grades, Exams, Assignments, Attendance, Invitations
- [ ] Confirm sidebar **DOES NOT show**: Team, Settings, Finance, Billing, Sub Domain, School Profile, Linking Hub

### C4. ACCOUNTANT (Dave)
- [ ] Confirm sidebar shows: Overview, Finance, Payments, Transaction History
- [ ] Confirm sidebar **DOES NOT show**: Team, Settings, Billing, Teachers, Students, Exams

### C5. SUPPORT (Eve)
> Note: Eve was rejected. Use a fresh SUPPORT account approved by Alice for this test.
- [ ] Confirm sidebar shows **only**: Overview (basic view)
- [ ] Confirm no management items are shown

---

## Section D — RBAC Route Guards

> Try to navigate directly to restricted URLs by typing them in the address bar.

### D1. Non-owner accessing Settings
- [ ] Log in as **Bob (Principal)**
- [ ] Navigate directly to `/dashboard/admin/settings`
- [ ] Confirm **"Access Restricted"** screen appears
- [ ] Confirm the screen shows Bob's current role: **Principal**
- [ ] Confirm the **"Back to Dashboard"** button works

### D2. Non-accountant accessing Finance
- [ ] Log in as **Bob (Principal)**
- [ ] Navigate to `/dashboard/admin/finance`
- [ ] Confirm **"Access Restricted"** screen appears

### D3. Accountant can access Finance
- [ ] Log in as **Dave (Accountant)**
- [ ] Navigate to `/dashboard/admin/finance`
- [ ] Confirm the page **loads successfully** (no access denied)

### D4. Non-owner cannot access Billing
- [ ] Log in as **Dave (Accountant)**
- [ ] Navigate to `/dashboard/admin/billing`
- [ ] Confirm **"Access Restricted"** appears

### D5. Non-owner/principal cannot access Team
- [ ] Log in as **Carol (Registrar)**
- [ ] Navigate to `/dashboard/admin/team`
- [ ] Confirm **"Access Restricted"** appears

---

## Section E — Active Members Actions (Owner Only)

> Login as **Alice (SCHOOL_OWNER)**

### E1. Change Role
- [ ] Go to `/dashboard/admin/team` → Active Members tab
- [ ] Find Carol (Registrar) → click the `⋯` action menu
- [ ] Select **Change to Principal** → confirm toast success
- [ ] Confirm Carol's badge updates to **Principal**

### E2. Remove Admin
- [ ] Find Dave (Accountant) → click `⋯` → **Remove from Team**
- [ ] Confirm a dialog appears
- [ ] Confirm → Dave is removed from the table
- [ ] Confirm Dave can no longer access the admin dashboard

### E3. Transfer Ownership
- [ ] Find Bob (Principal) → click `⋯` → **Transfer Ownership**
- [ ] Confirm a warning dialog appears explaining the consequence
- [ ] Confirm → Alice's role should change to Principal, Bob becomes SCHOOL_OWNER
- [ ] Verify by checking the Active Members tab — confirm badge swap

### E4. Non-owner cannot see action menu
- [ ] Log in as **Bob (now SCHOOL_OWNER after E3)**
- [ ] Confirm Alice's row shows **no `⋯` action button** (since Alice is now Principal, not owner)

---

## Section F — Security Edge Cases

### F1. Pending admin cannot log in (if applicable)
- [ ] While a request is pending approval, attempt to log in with that account
- [ ] Confirm the backend returns an appropriate error (e.g. `"Your account is pending approval"`)

### F2. Direct API call guard (Postman / curl)
- [ ] Try calling `PUT /api/v1/admin/:id/approve` with a **teacher token**
- [ ] Confirm `403 Forbidden` response

### F3. Double-role prevention
- [ ] Confirm a user cannot be added to the same school twice

---

## Expected Pass Criteria

All checkboxes above should be ticked. Any failures should be noted and filed as issues.
