# School Payment Collection — Implementation Plan
> **Qefas Hub** · Last updated: September 2026

This document outlines every layer needed to allow schools on Qefas Hub to accept payments from students and parents directly through the platform.

---

## Overview

There are **two distinct payment flows** on Qefas Hub:

| Flow | Who Pays | Who Gets Paid |
|---|---|---|
| **Platform subscriptions** | School admins | Qefas Hub |
| **School fee collections** | Students / Parents | The school (via split) |

This document focuses entirely on **School Fee Collections** — the infrastructure that allows a school to collect tuition, levies, and other fees from their own students and parents.

---

## What's Already in Place ✅

The payment gateway layer is already built and production-ready:

- **Dual-gateway support**: Paystack and Flutterwave adapters via a shared `PaymentGateway` interface
- **Settlement subaccounts**: Schools can register their bank details and a subaccount is created on Paystack/Flutterwave
- **Split payment routing**: When a school has an active subaccount, payments are automatically split between the school and the platform
- **Webhook handling**: `subaccount.update` and `charge.success` events are handled
- **Bank account management**: Schools can add/remove settlement accounts from the dashboard

---

## What Still Needs to Be Built 🔧

### 1. Fee Structure Management (Database + API)

Schools need to define **what** they are charging for.

#### Database schema additions needed:
```prisma
model FeeCategory {
  id          String   @id @default(cuid())
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  name        String   // e.g. "School Fees", "Library Levy", "Exam Fee"
  description String?
  amount      Float
  currency    String   @default("NGN")
  termId      String?  // optional: scoped to a specific term
  classIds    String[] // empty = applies to all classes
  mandatory   Boolean  @default(true)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  payments    StudentPayment[]
}
```

#### API endpoints needed:
- `POST   /schools/:schoolId/fees` — create a fee category
- `GET    /schools/:schoolId/fees` — list fee categories (with filters for term, class)
- `PATCH  /schools/:schoolId/fees/:id` — update a fee
- `DELETE /schools/:schoolId/fees/:id` — delete a fee

---

### 2. Student Payment Records (Database + API)

Track what each student owes and has paid.

```prisma
model StudentPayment {
  id              String        @id @default(cuid())
  schoolId        String
  studentId       String
  student         Student       @relation(fields: [studentId], references: [id])
  feeCategoryId   String
  feeCategory     FeeCategory   @relation(fields: [feeCategoryId], references: [id])
  amountDue       Float
  amountPaid      Float         @default(0)
  status          PaymentStatus @default(PENDING)
  txRef           String?       // gateway transaction reference
  gatewayUsed     String?       // "PAYSTACK" | "FLUTTERWAVE"
  paidAt          DateTime?
  paidBy          String?       // userId of parent or student who paid
  receiptUrl      String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
  WAIVED
}
```

#### API endpoints needed:
- `GET    /schools/:schoolId/student-payments` — list all payments (filterable by student, status, term)
- `GET    /students/:studentId/payments` — student's own payment record
- `POST   /schools/:schoolId/student-payments/init` — initialize a payment session for a student
- `POST   /schools/:schoolId/student-payments/verify` — verify callback and mark as paid
- `POST   /schools/:schoolId/student-payments/:id/waive` — admin can waive a fee

---

### 3. Payment Initialization Flow (Backend)

When a parent/student wants to pay:

```
1. Client calls POST /schools/:schoolId/student-payments/init
   Body: { studentId, feeCategoryId, payerEmail }

2. Backend:
   a. Finds the FeeCategory
   b. Looks up school's active SettlementAccount
   c. Calls gateway.initialize() with:
      - amount = fee amount
      - metadata = { studentId, feeCategoryId, schoolId, type: "school_fee" }
      - subaccountCode = school's settlement code (for split)
   d. Returns { checkoutUrl, txRef }

3. Client redirects user to checkoutUrl

4. User pays → Gateway redirects to /payment/school-callback

5. Backend verifies payment → updates StudentPayment record → sends receipt email
```

> ⚠️ **Critical**: The split percentage must be configured per-school or per-plan. School fees need a **separate configurable split rate** from platform subscriptions.

---

### 4. Platform Commission / Split Configuration

You need to decide and implement:

| Config | Recommended Approach |
|---|---|
| Platform cut | e.g. 1.5% of each school fee collection |
| Per-plan override | Premium schools may get a lower platform cut |
| Storage | Add `platformFeePercent` to the `School` or `SubscriptionPlan` model |
| Gateway-level | Set via `bearer_subaccount` on Paystack or `subaccount` on Flutterwave |

```prisma
// Addition to School model
platformFeePercent  Float  @default(1.5) // percentage platform takes from school fee payments
```

---

### 5. Receipt Email

When a payment is verified as successful, trigger an email to the parent/student:

```ts
sendSchoolFeeReceiptEmail({
  email: payer.email,
  studentName: student.fullName,
  schoolName: school.name,
  feeName: feeCategory.name,
  amount: amountPaid,
  txRef: txRef,
  paidAt: new Date(),
})
```

> Use the existing `buildEmail()` system in `email-template.ts` with the `payment` illustration.

---

### 6. Parent & Student Dashboard — Payments UI

#### Parent view (`/dashboard/parent/payments`):
- [ ] List of outstanding fees for each linked child
- [ ] "Pay Now" button per fee item
- [ ] Payment history with receipt download
- [ ] Balance summary card

#### Student view (`/dashboard/student/billing`):
- [ ] View their own outstanding fees
- [ ] Payment history

#### Admin view (`/dashboard/admin/finance`):
- [ ] Overview: total collected this term, outstanding
- [ ] Per-student payment status
- [ ] Bulk reminder: send email to all students with pending fees
- [ ] Export to CSV / PDF

---

### 7. Subscription Gate

Schools should only be able to collect payments if:
- They have an **active subscription** (no free-tier school fee collection)
- They have at least **one active settlement account** (bank details verified)

```ts
// In payment init handler
const school = await prisma.school.findUnique({
  where: { id: schoolId },
  include: { settlementAccounts: true }
});

if (!school.subscriptionActive)
  throw new Error("School subscription is not active");

if (!school.settlementAccounts.some(a => a.status === "active"))
  throw new Error("No active settlement account. Please add your bank details first.");
```

---

### 8. Compliance & Legal Requirements (Nigeria)

| Requirement | Status | Notes |
|---|---|---|
| **CBN regulations** | ⚠️ Review needed | Ensure payment flows comply with CBN guidelines for EdTech platforms |
| **School terms & privacy policy** | ⚠️ Update needed | Must state that Qefas Hub facilitates but does not hold school funds |
| **CAC registration for schools** | ℹ️ Gateway requirement | Schools must provide valid CAC registration for subaccount applications |
| **Refund policy** | ⚠️ Define needed | Decide if Qefas Hub mediates refunds or if schools handle directly |
| **Data retention** | ⚠️ Review needed | Payment records must be retained for 5–7 years per financial regulations |

---

### 9. Webhook Extension for School Payments

The existing webhook handler needs extending to differentiate school fee payments from platform subscription payments:

```ts
// In handleWebhook:
if (event.event === "charge.success") {
  const meta = event.data.metadata;

  if (meta?.type === "school_fee") {
    // Route to FinanceService.handleSchoolFeePayment()
    await FinanceService.handleSchoolFeePayment(event.data);
  } else {
    // Existing subscription logic
    await PaymentService.handleSubscriptionPayment(event.data);
  }
}
```

---

### 10. Testing Checklist

Before going live:

- [ ] End-to-end test: parent initiates → pays → receipt email arrives
- [ ] Split payment verification: confirm school actually receives their cut in Paystack/Flutterwave dashboard
- [ ] Webhook test: simulate `charge.success` with test card → confirm `StudentPayment` status updates to `PAID`
- [ ] Webhook test: simulate failed payment → confirm no status update
- [ ] Test with school that has no settlement account (should block payment init with clear error)
- [ ] Test with inactive school subscription (should block payment init)
- [ ] Partial payment scenario: student pays half → status shows `PARTIAL`
- [ ] Waive flow: admin waives a fee → status shows `WAIVED`, no payment required

---

## Recommended Implementation Order

```
Phase 1 — Foundation (1–2 weeks)
  ├── FeeCategory model + CRUD API
  ├── StudentPayment model + status tracking
  └── platformFeePercent config on School model

Phase 2 — Payment Flow (1 week)
  ├── Payment init endpoint (school_fee type)
  ├── Callback/verify endpoint
  ├── Webhook extension (differentiate school_fee vs subscription)
  └── School fee receipt email

Phase 3 — Dashboard UI (1–2 weeks)
  ├── Parent: outstanding fees + Pay Now flow
  ├── Student: billing page
  └── Admin: collections overview + per-student status + CSV export

Phase 4 — Compliance & Polish (1 week)
  ├── Legal/terms page update
  ├── Refund policy definition
  ├── Subscription gate enforcement
  └── Full E2E test pass on staging
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `backend/src/modules/payment/gateway.interface.ts` | Shared payment gateway contract |
| `backend/src/modules/payment/paystack.adapter.ts` | Paystack implementation |
| `backend/src/modules/payment/flutterwave.adapter.ts` | Flutterwave implementation |
| `backend/src/modules/finance/finance.service.ts` | Settlement account management + payment init |
| `backend/src/modules/finance/paystack.webhook.ts` | Webhook event handler (extend this) |
| `backend/src/utils/email-template.ts` | Email builder (use `payment` illustration for receipt) |
| `frontend/src/app/dashboard/admin/finance` | Admin finance UI (extend this) |
| `frontend/src/app/dashboard/parent/payments` | Parent payments UI (build this) |
| `frontend/src/app/dashboard/student/billing` | Student billing UI (build this) |
