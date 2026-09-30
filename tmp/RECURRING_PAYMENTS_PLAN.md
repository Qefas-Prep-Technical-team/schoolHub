# Recurring / Auto-Charge Payments — Implementation Plan
> **Qefas Hub** · Last updated: September 2026

This document covers everything needed to automatically charge users who paid with a card — renewing their subscription (or school fee instalment plan) without them needing to re-enter payment details.

---

## How Auto-Charge Works (Concept)

```
First Payment (user types their card)
  └──> Gateway processes card
  └──> Gateway returns authorization_code (Paystack) or card.token (Flutterwave)
  └──> We store that token securely in our DB, linked to the user

Every subsequent billing cycle (cron job fires)
  └──> We call gateway.chargeAuthorization(token, amount, email)
  └──> Gateway charges the card silently — no user interaction needed
  └──> Webhook fires with charge.success or charge.failure
  └──> We update subscription / payment record
  └──> We send receipt email + in-app notification
```

No card numbers ever touch our servers. The token IS the card — whoever holds it can charge.

---

## What's Already in Place ✅

| Feature | Location | Status |
|---|---|---|
| Authorization tokens captured from Paystack | `paystack.adapter.ts` L105 | ✅ Done |
| Card tokens captured from Flutterwave | `flutterwave.adapter.ts` L132 | ✅ Done |
| `authorizationToken` stored on subscription records | `payment.service.ts` L290, L745 | ✅ Done |
| Daily cron job runner | `backend/src/scripts/cron.ts` | ✅ Done |
| Subscription expiry sweep (cron) | `cron.ts` L10 | ✅ Done |
| In-app notification service | `notification.service.ts` | ✅ Done |
| Email builder + templates | `email-template.ts` + `auth.service.ts` | ✅ Done |
| Webhook handlers (charge.success) | `paystack.webhook.ts` | ✅ Done |

---

## What Still Needs to Be Built 🔧

---

### 1. `chargeAuthorization` Method on Gateway Adapters

This is the core missing piece. Neither adapter currently has a method to initiate a charge using a stored token.

#### Add to `gateway.interface.ts`:

```ts
export interface ChargeAuthorizationParams {
  authorizationToken: string;  // Paystack auth_code or Flutterwave card token
  email: string;               // Must match the email used in the original transaction
  amount: number;              // In Naira
  reference: string;           // Our unique idempotency key for this charge attempt
  metadata?: Record<string, unknown>;
}

export interface ChargeAuthorizationResult {
  success: boolean;
  reference: string;
  gatewayRef: string;
  amountNaira: number;
  channel: string;
  failureReason?: string;      // e.g. "Insufficient funds", "Card declined"
}

// Add to PaymentGateway interface:
chargeAuthorization(params: ChargeAuthorizationParams): Promise<ChargeAuthorizationResult>;
```

#### Paystack implementation (`paystack.adapter.ts`):
```ts
async chargeAuthorization(params: ChargeAuthorizationParams): Promise<ChargeAuthorizationResult> {
  const res = await fetch('https://api.paystack.co/transaction/charge_authorization', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authorization_code: params.authorizationToken,
      email: params.email,
      amount: params.amount * 100,  // convert to kobo
      reference: params.reference,
      metadata: params.metadata,
    }),
  });
  const json = await res.json();
  return {
    success: json.data?.status === 'success',
    reference: params.reference,
    gatewayRef: json.data?.reference,
    amountNaira: (json.data?.amount ?? 0) / 100,
    channel: json.data?.channel ?? 'card',
    failureReason: json.data?.gateway_response,
  };
}
```

#### Flutterwave implementation (`flutterwave.adapter.ts`):
```ts
async chargeAuthorization(params: ChargeAuthorizationParams): Promise<ChargeAuthorizationResult> {
  const res = await fetch('https://api.flutterwave.com/v3/charges?type=token', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: params.authorizationToken,
      email: params.email,
      amount: params.amount,
      currency: 'NGN',
      tx_ref: params.reference,
      narration: 'Qefas Hub Subscription Renewal',
    }),
  });
  const json = await res.json();
  return {
    success: json.data?.status === 'successful',
    reference: params.reference,
    gatewayRef: json.data?.flw_ref,
    amountNaira: json.data?.amount ?? 0,
    channel: 'card',
    failureReason: json.data?.processor_response,
  };
}
```

---

### 2. Authorization Token Security & Storage

Currently tokens are stored directly on subscription records. For auto-charge, we need dedicated secure storage.

#### New model — `SavedCard`:
```prisma
model SavedCard {
  id                 String   @id @default(cuid())
  userId             String
  userType           String   // "SCHOOL" | "TEACHER" | "STUDENT" | "PARENT"
  gateway            String   // "PAYSTACK" | "FLUTTERWAVE"
  authorizationToken String   // ENCRYPT THIS — see security note below
  cardLast4          String   // Last 4 digits (safe to store)
  cardBrand          String   // "Visa" | "Mastercard" etc.
  cardExpMonth       String?  // "09"
  cardExpYear        String?  // "2028"
  email              String   // Email used for the original transaction
  isDefault          Boolean  @default(false)
  isActive           Boolean  @default(true)
  createdAt          DateTime @default(now())
  lastUsedAt         DateTime?
  lastChargeStatus   String?  // "success" | "failed"
  lastChargeAt       DateTime?
}
```

> ⚠️ **Security**: `authorizationToken` must be **encrypted at rest** using AES-256 (e.g. with Node's `crypto` module or a KMS). Never store raw Paystack `authorization_code` or Flutterwave card tokens in plaintext in the database.

#### Encryption utility (`backend/src/utils/crypto.ts`):
```ts
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32-byte hex key in env

export function encryptToken(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(ciphertext: string): string {
  const [ivHex, tagHex, dataHex] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(Buffer.from(dataHex, 'hex')) + decipher.final('utf8');
}
```

Add to `.env`:
```
ENCRYPTION_KEY=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

---

### 3. Auto-Charge Cron Job

Add a new cron job in `cron.ts` that runs **daily at 08:00** and charges all subscriptions due for renewal.

#### Logic:
```
For each user/school whose subscriptionEnd is within the next 24 hours:
  1. Look up their SavedCard (isDefault=true, isActive=true)
  2. If no card → skip and send "Payment method needed" email + notification
  3. If card exists → generate unique reference (idempotency key)
  4. Call gateway.chargeAuthorization(...)
  5. On success:
     a. Extend subscriptionEnd by 1 month/year
     b. Update SavedCard.lastChargeStatus = "success"
     c. Send receipt email
     d. Send "Subscription renewed" in-app notification
  6. On failure:
     a. Log attempt to ChargeAttempt table
     b. Send "Payment failed" email with update card CTA
     c. Send in-app notification
     d. Schedule retry (see retry logic below)
```

#### Idempotency — critical:
```ts
// Generate a deterministic, unique reference per billing cycle
const reference = `renewal_${userId}_${format(renewalDate, 'yyyyMM')}`;

// Before charging, check if we already have a successful charge with this reference
const existing = await prisma.chargeAttempt.findFirst({
  where: { reference, status: 'success' }
});
if (existing) continue; // already charged this cycle — skip
```

---

### 4. Charge Attempt Log (Database)

Track every auto-charge attempt for audit, retry logic, and support:

```prisma
model ChargeAttempt {
  id            String   @id @default(cuid())
  userId        String
  userType      String
  savedCardId   String
  reference     String   @unique // our idempotency key
  gatewayRef    String?           // gateway's own reference
  gateway       String            // "PAYSTACK" | "FLUTTERWAVE"
  amountNaira   Float
  status        String            // "pending" | "success" | "failed"
  failureReason String?
  attemptNumber Int      @default(1)
  chargedAt     DateTime @default(now())
  resolvedAt    DateTime?
}
```

---

### 5. Retry Logic for Failed Charges

Never give up on the first failure. Implement a 3-attempt schedule:

| Attempt | When | Action if fails again |
|---|---|---|
| 1st | Day of renewal | Send failure email + in-app notification |
| 2nd | +3 days | Send reminder email with "Update Card" CTA |
| 3rd | +7 days | Send final warning email. After this, suspend subscription |

#### Implementation in cron:
```ts
// In daily cron, also check for failed retries
const pendingRetries = await prisma.chargeAttempt.findMany({
  where: {
    status: 'failed',
    attemptNumber: { lt: 3 },
    chargedAt: { lte: subDays(now, retryDays[attempt]) }
  }
});

for (const attempt of pendingRetries) {
  await retryCharge(attempt);
}
```

---

### 6. Email Templates Needed

All 6 templates below should use the existing `buildEmail()` system.

#### 6.1 — `sendPreChargeReminderEmail` (3 days before renewal)
```
Subject: Your Qefas Hub subscription renews in 3 days

Hi {{name}},

Your {{plan}} subscription renews on {{renewalDate}} and we'll automatically
charge {{amount}} to your {{cardBrand}} card ending in {{last4}}.

No action needed — we've got you covered.

[Manage Subscription →]

If you'd like to update your payment method before the charge, you can do so
in your billing settings.
```
- Illustration: `payment`

#### 6.2 — `sendAutoRenewalSuccessEmail` (after successful auto-charge)
```
Subject: Subscription renewed — you're all set

Hi {{name}},

Your {{plan}} subscription has been renewed and will remain active until {{nextRenewalDate}}.

Plan        {{plan}}
Amount      {{amount}}
Card        {{cardBrand}} ending in {{last4}}
Date        {{chargeDate}}
Reference   {{txRef}}

[View Billing Dashboard →]
```
- Illustration: `payment`

#### 6.3 — `sendAutoChargeFailed1Email` (first failure)
```
Subject: We couldn't renew your subscription

Hi {{name}},

We tried to charge your {{cardBrand}} card ending in {{last4}} for your
{{plan}} subscription, but the payment didn't go through.

Reason: {{failureReason}}

Your subscription is still active. We'll try again in 3 days.

[Update Payment Method →]

If you need help, reply to this email or reach us at support@qefashub.com.
```
- Illustration: `payment-failed`

#### 6.4 — `sendAutoChargeFailed2Email` (second failure, +3 days)
```
Subject: Still having trouble renewing your subscription

Hi {{name}},

We tried again to process your subscription renewal, but the payment
still didn't go through. We'll make one final attempt in 4 days.

To avoid any service interruption, please update your payment method now.

[Update Card →]
```
- Illustration: `payment-failed`

#### 6.5 — `sendAutoChargeFinalWarningEmail` (third failure, +7 days)
```
Subject: Action required — your subscription will be suspended

Hi {{name}},

We've made 3 attempts to renew your {{plan}} subscription, but haven't
been able to process the payment.

Your access will be suspended on {{suspensionDate}} unless you
update your payment method and complete the renewal.

[Renew Now →]

We'd hate to lose you. If you're having trouble, our team is here to help
at support@qefashub.com.
```
- Illustration: `payment-failed`

#### 6.6 — `sendNoPaymentMethodEmail` (no card on file at renewal time)
```
Subject: Add a payment method to keep your subscription active

Hi {{name}},

Your {{plan}} subscription expires on {{expiryDate}}, and we don't have
a payment method on file to renew it automatically.

[Add Payment Method →]

If you'd prefer to renew manually, you can do that from your billing dashboard.
```
- Illustration: `payment`

---

### 7. In-App Notifications

Every email above should be paired with an in-app notification:

| Event | Title | Message | Severity |
|---|---|---|---|
| Pre-charge reminder (3 days) | "Subscription renewing soon" | "Your {{plan}} plan renews on {{date}}. Card: {{last4}}" | `INFO` |
| Auto-charge success | "Subscription renewed ✓" | "Your {{plan}} subscription is active until {{nextDate}}" | `SUCCESS` |
| First charge failure | "Payment failed" | "We couldn't charge your card ending in {{last4}}. We'll retry in 3 days." | `WARNING` |
| Second charge failure | "Renewal still failing" | "Please update your payment method to avoid service interruption." | `WARNING` |
| Final warning | "Subscription at risk" | "Update your payment method today or your access will be suspended." | `DANGER` |
| No card on file | "Payment method needed" | "Add a card to renew your subscription automatically." | `WARNING` |

#### Implementation:
```ts
await createNotification({
  recipientType: userType,
  recipientId: userId,
  type: 'BILLING',   // Add BILLING to the NotificationType enum
  title: 'Payment failed',
  message: `We couldn\'t charge your card ending in ${last4}. We\'ll retry in 3 days.`,
  actionUrl: '/dashboard/admin/settings?tab=billing',
});
```

---

### 8. Card Management UI

#### 8.1 — Saved Cards Panel (`/dashboard/admin/settings?tab=billing`)

Display:
- List of saved cards with brand logo, last 4, expiry
- Default badge on the active card
- "Remove card" action (with confirm dialog)
- "Add new card" — triggers a ₦50 test charge that is immediately refunded (to validate the card)
- "Make default" on any card

```tsx
<SavedCardsSection>
  {savedCards.map(card => (
    <CardItem
      brand={card.cardBrand}         // "Visa" | "Mastercard"
      last4={card.cardLast4}
      expiry={`${card.cardExpMonth}/${card.cardExpYear}`}
      isDefault={card.isDefault}
      lastCharged={card.lastChargeAt}
      lastStatus={card.lastChargeStatus}
    />
  ))}
  <AddCardButton />
</SavedCardsSection>
```

#### 8.2 — Billing History Panel
- List of `ChargeAttempt` records
- Status badge: `Success` (green), `Failed` (red), `Pending` (amber)
- Download receipt button on successful charges

#### 8.3 — Auto-Renewal Toggle
- On/Off switch per subscription
- Warning on disable: "If you turn this off, your subscription won't renew automatically and you'll need to pay manually before it expires."

---

### 9. User Consent & Legal Requirements

**You must get explicit consent before charging a card automatically.**

#### At checkout (first payment):
Add a checkbox:
```
☑ Save my card and automatically renew my subscription.
  I can cancel anytime from my billing settings.
  By checking this, I authorise Qefas Hub to charge this card for future renewals.
```

If the box is unchecked → don't save the token → user pays manually each cycle.

#### Consent record:
```prisma
model AutoChargeConsent {
  id         String   @id @default(cuid())
  userId     String
  userType   String
  savedCardId String
  consentedAt DateTime @default(now())
  ipAddress  String?
  userAgent  String?
  revokedAt  DateTime?  // set when user turns off auto-renewal
}
```

#### Cancellation:
- User must be able to turn off auto-renewal at any time from the dashboard
- After cancellation, send a confirmation email: "Auto-renewal has been turned off. Your subscription will expire on {{date}}."

---

### 10. API Endpoints Needed

| Method | Path | Description |
|---|---|---|
| `GET` | `/billing/cards` | List user's saved cards |
| `DELETE` | `/billing/cards/:cardId` | Remove a saved card |
| `PATCH` | `/billing/cards/:cardId/default` | Set a card as default |
| `GET` | `/billing/history` | List charge attempts |
| `GET` | `/billing/history/:chargeId/receipt` | Download receipt PDF |
| `PATCH` | `/billing/auto-renewal` | Toggle auto-renewal on/off |
| `POST` | `/billing/retry-charge` | Manually trigger a retry (admin or user) |

---

### 11. Webhook — Ensure Idempotent Handling

When a `charge.success` webhook fires from an auto-charge, it **must not create a duplicate subscription extension**.

```ts
// In webhook handler
const existingCharge = await prisma.chargeAttempt.findUnique({
  where: { reference: data.reference }
});

if (!existingCharge || existingCharge.status === 'success') {
  return; // Already processed — ignore duplicate webhook
}

await prisma.chargeAttempt.update({
  where: { reference: data.reference },
  data: { status: 'success', resolvedAt: new Date() }
});

// Now extend subscription
await extendSubscription(existingCharge.userId);
```

---

### 12. Pre-Launch Testing Checklist

- [ ] Test card saved correctly (last4, brand, encrypted token stored)
- [ ] Simulate auto-charge via Paystack test card `4084084084084081` (success)
- [ ] Simulate declined card `4084080000000409` → failure email + notification fires
- [ ] Verify idempotency: trigger webhook twice → subscription only extended once
- [ ] Verify retry schedule: first failure → 3-day retry → 7-day final warning → suspension
- [ ] Verify pre-charge reminder email arrives 3 days before renewal
- [ ] Confirm receipt email arrives within 30 seconds of successful charge
- [ ] Test "Remove card" → auto-renewal disabled → no-card email fires on next cycle
- [ ] Test "Turn off auto-renewal" → consent record revoked → confirmation email arrives
- [ ] Confirm authorization tokens are encrypted in DB (run `SELECT authorizationToken FROM SavedCard LIMIT 1` — must not be plaintext)

---

## Recommended Implementation Order

```
Phase 1 — Charging Infrastructure (1 week)
  ├── chargeAuthorization() on both adapters
  ├── SavedCard model + encryptToken utility
  ├── AutoChargeConsent model + ChargeAttempt model
  └── ENCRYPTION_KEY in env

Phase 2 — Cron Job (3–4 days)
  ├── Auto-charge cron (daily 08:00)
  ├── Retry logic (3-attempt schedule)
  └── Idempotency key generation + duplicate prevention

Phase 3 — Notifications & Emails (3–4 days)
  ├── 6 new email templates in auth.service.ts
  ├── BILLING notification type
  └── Pre-charge, success, failed, final warning, no-card notifications

Phase 4 — Dashboard UI (1 week)
  ├── Saved cards panel (list, default, remove)
  ├── Add card flow with ₦50 test charge
  ├── Billing history with receipt download
  ├── Auto-renewal toggle
  └── Consent checkbox at checkout

Phase 5 — Compliance & Testing (3–4 days)
  ├── Consent record storage + revocation
  ├── Cancellation confirmation email
  ├── Full E2E test pass on staging
  └── Legal review of auto-charge disclosure text
```

---

## Key Files to Modify / Create

| File | Change |
|---|---|
| `payment/gateway.interface.ts` | Add `chargeAuthorization()` to interface |
| `payment/paystack.adapter.ts` | Implement `chargeAuthorization()` |
| `payment/flutterwave.adapter.ts` | Implement `chargeAuthorization()` |
| `utils/crypto.ts` | **Create** — AES-256 encrypt/decrypt for tokens |
| `scripts/cron.ts` | Add auto-charge + retry cron jobs |
| `modules/auth/auth.service.ts` | Add 6 new email functions |
| `modules/notification/notification.service.ts` | Add BILLING notification type |
| `prisma/schema.prisma` | Add SavedCard, ChargeAttempt, AutoChargeConsent models |
| `modules/finance/paystack.webhook.ts` | Extend for auto-charge idempotent handling |
| `frontend/src/app/dashboard/admin/settings/` | Add billing tab with card management UI |
