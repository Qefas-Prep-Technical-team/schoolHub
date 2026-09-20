# Flutterwave Payment Migration Plan

> **Goal**: Replace Paystack with Flutterwave as the school payment gateway while keeping the database intact, maintaining zero downtime, and preserving all existing subscriptions and transaction records.

---

## Current State Analysis

The existing system has **two separate Paystack surfaces**:

| Surface | File | Risk |
|---|---|---|
| Platform subscriptions (SaaS billing) | `payment/payment.service.ts` | High — core revenue flow |
| School fee collections (subaccounts, splits) | `finance/finance.service.ts` | High — school money |
| Webhook (unified) | `payment/payment.route.ts → paystackWebhook` | High — server-to-server |
| Deprecated webhook | `finance/paystack.webhook.ts` | Low — already `@deprecated` |

**Existing DB fields tied to Paystack:**
- `Transaction.reference` — Paystack reference format (e.g. `ps_ref_xxxxx`)
- `SettlementAccount.paystackSubaccountCode`
- `SettlementAccount.paystackSubaccountStatus`

---

## Open Questions

> [!IMPORTANT]
> **Q1**: Should both SaaS subscription payments AND school fee collections both migrate to Flutterwave, or only school fee collections?
>
> **Q2**: Do you want to keep existing Paystack subaccounts active for old schools (backward-compat) while new schools onboard with Flutterwave? Or full cutover?
>
> **Q3**: What is your Flutterwave merchant account type? (Standard / Subaccount with split payments)

---

## Migration Strategy: Zero-Downtime Adapter Pattern

We will use an **Adapter Pattern** — a single `PaymentGateway` interface that both `PaystackAdapter` and `FlutterwaveAdapter` implement. This lets us:
1. Run both gateways in parallel during migration
2. Switch by environment variable: `PAYMENT_GATEWAY=flutterwave`
3. Never break existing Paystack transactions stored in the DB

```
PaymentGatewayInterface
    ├── PaystackAdapter   ← existing code, kept intact
    └── FlutterwaveAdapter ← new code
```

---

## Proposed Changes

---

### Section 1 — Prisma Schema

#### [MODIFY] `schema.prisma`
- Add `gateway` field to `Transaction` model to tag which gateway processed it:
  ```prisma
  model Transaction {
    // ... existing fields
    gateway   String  @default("PAYSTACK") // "PAYSTACK" | "FLUTTERWAVE"
    gatewayRef String? // Raw reference from the gateway (tx_ref for FW, reference for PS)
  }
  ```
- Add Flutterwave-specific columns to `SettlementAccount`:
  ```prisma
  model SettlementAccount {
    // ... existing fields
    flwSubaccountId    String?
    flwSubaccountCode  String?
    flwAccountStatus   String?
  }
  ```
- **Migration is additive** — no existing data is changed, no columns are dropped.

---

### Section 2 — Flutterwave Service (`flutterwave.service.ts`)

#### [NEW] `backend/src/modules/payment/flutterwave.service.ts`

Implements the same interface as the current `payment.service.ts` functions:

**2.1 Initialize Payment**
```ts
// POST https://api.flutterwave.com/v3/payments
{
  tx_ref: generateUniqueRef(),     // Our idempotency key
  amount,
  currency: "NGN",
  redirect_url: FRONTEND_CALLBACK_URL,
  customer: { email, name },
  meta: { userId, plan, billing, is_upgrade, is_trial }, // All in meta (not custom_fields)
  customizations: { title: "Qefas Hub", logo: LOGO_URL }
}
```

**2.2 Verify Payment** (called after redirect OR webhook)
```ts
// GET https://api.flutterwave.com/v3/transactions/{id}/verify
// SECURITY: Always verify server-side — NEVER trust client-supplied status
// Check: data.status === "successful" && data.charged_amount >= expectedAmount
```

**2.3 Idempotency Guard**
```ts
// Check Transaction.gatewayRef before processing — same as existing Paystack guard
const existing = await prisma.transaction.findFirst({
  where: { gatewayRef: flwTransactionId }
});
if (existing) return { alreadyProcessed: true };
```

**2.4 Webhook Signature Verification**
```ts
// Flutterwave uses a secret hash header: "verif-hash"
// NOT HMAC — just a plain string comparison
const secretHash = process.env.FLW_WEBHOOK_SECRET;
if (req.headers["verif-hash"] !== secretHash) {
  return res.status(401).send("Invalid signature");
}
```

**2.5 Subaccount / Split Payment Setup**
```ts
// POST https://api.flutterwave.com/v3/subaccounts
{
  account_bank: bankCode,
  account_number,
  business_name,
  split_type: "percentage",
  split_value: percentage
}
```

---

### Section 3 — Gateway Adapter Pattern

#### [NEW] `backend/src/modules/payment/gateway.interface.ts`
```ts
export interface PaymentGateway {
  initialize(params: InitializeParams): Promise<InitializeResult>;
  verify(reference: string): Promise<VerifyResult>;
  handleWebhook(payload: unknown, headers: Record<string, string>): Promise<void>;
}
```

#### [NEW] `backend/src/modules/payment/gateway.factory.ts`
```ts
export function getPaymentGateway(): PaymentGateway {
  const gateway = process.env.PAYMENT_GATEWAY || "flutterwave";
  if (gateway === "paystack") return new PaystackAdapter();
  return new FlutterwaveAdapter(); // default
}
```

#### [MODIFY] `payment.controller.ts` / `payment.service.ts`
- Replace all direct `axios.post("https://api.paystack.co/...")` calls with:
  ```ts
  const gateway = getPaymentGateway();
  const result = await gateway.initialize(params);
  ```
- Keep existing Paystack code as `PaystackAdapter` — no deletion.

---

### Section 4 — Webhook Handler

#### [MODIFY] `payment.route.ts`
- Keep the same route: `POST /api/v1/payment/webhook`
- The handler delegates to `gateway.handleWebhook()` — which knows the correct signature header format for whichever gateway is active.
- **Respond `200` immediately** before any DB processing to prevent Flutterwave retries:
  ```ts
  res.sendStatus(200); // Always respond first
  await processWebhookAsync(payload); // Then process
  ```

#### Event mapping (Flutterwave → existing logic):
| Flutterwave Event | Maps To |
|---|---|
| `charge.completed` where status=`successful` | Existing `charge.success` handler |
| `subscription.cancelled` | Existing downgrade/cancel handler |
| `transfer.completed` | School fee settlement confirmation |

---

### Section 5 — Finance Service (School Fees)

#### [MODIFY] `finance/finance.service.ts`
- Replace `setupBank()` Paystack subaccount call with Flutterwave equivalent
- Store result in new `flwSubaccountId` / `flwSubaccountCode` columns
- Keep old `paystackSubaccountCode` column **read-only** (for existing schools that already have Paystack subaccounts)
- Add a `gateway` field to `SchoolFeeTransaction` to track which gateway processed it

---

### Section 6 — Environment Variables

```env
# Switch gateway: "flutterwave" | "paystack"
PAYMENT_GATEWAY=flutterwave

# Flutterwave credentials
FLW_PUBLIC_KEY=FLWPUBK-xxxxx
FLW_SECRET_KEY=FLWSECK-xxxxx
FLW_WEBHOOK_SECRET=your_custom_secret_string  # Set this in FW dashboard → Webhooks

# Keep Paystack vars for backward compatibility (existing subscriptions)
PAYSTACK_SECRET_KEY=sk_live_xxxxx
```

---

### Section 7 — Frontend Changes

#### [MODIFY] `frontend/src/app/checkout/` or payment modal
- Change inline `Paystack.pop()` / Paystack JS script to **Flutterwave inline JS**:
  ```ts
  import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
  
  const config = {
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
    tx_ref: txRef,      // Generated server-side, passed down
    amount,
    currency: "NGN",
    payment_options: "card, banktransfer, ussd",
    customer: { email, name },
    customizations: { title: "Qefas Hub" }
  };
  ```
- On payment complete (callback), call `POST /api/v1/payment/verify` with `{ transaction_id, tx_ref }`
- Server verifies with Flutterwave API before updating DB

#### [MODIFY] `frontend/src/app/dashboard/admin/billing/`
- Remove any Paystack-specific UI references (e.g. "Powered by Paystack" logos)
- No other billing UI changes needed

---

## Security Checklist

- [x] **Server-side verification** — NEVER trust client-supplied `status=successful`. Always call Flutterwave `GET /v3/transactions/{id}/verify`.
- [x] **Amount validation** — After verifying, confirm `data.charged_amount >= expectedAmount` to prevent underpayment attacks.
- [x] **Idempotency** — Guard using `Transaction.gatewayRef` BEFORE processing.
- [x] **Webhook signature** — Verify `verif-hash` header matches `FLW_WEBHOOK_SECRET`.
- [x] **Webhook responds 200 first** — Process async after response to prevent duplicate retries.
- [x] **Rate limiting** — Keep existing `express-rate-limit` on `/initialize` and `/verify`.
- [x] **Zod validation** — All controller inputs validated before reaching service.
- [x] **No secret keys in frontend** — Only `FLW_PUBLIC_KEY` is exposed client-side.
- [x] **Transaction DB lock** — Use Prisma transactions (`$transaction`) when updating subscription + creating Transaction record to prevent partial writes.

---

## Zero-Downtime Migration Plan

> Execute in this exact order in production.

```
Step 1: Deploy schema migration (additive only — no dropped columns)
         → prisma migrate deploy
         
Step 2: Deploy backend with both adapters (PAYMENT_GATEWAY=paystack still set)
         → No behaviour change. Old code path still active.
         
Step 3: Set PAYMENT_GATEWAY=flutterwave in env vars (Render/Railway)
         → All NEW payments route through Flutterwave.
         → Old Paystack webhook still registered; keeps processing historical events.
         
Step 4: Register Flutterwave webhook URL in FW Dashboard:
         → https://your-api-domain.com/api/v1/payment/webhook
         
Step 5: Monitor for 48h. Watch for:
         - Verification failures (check logs)
         - Webhook 200 responses
         - Correct DB subscription updates
         
Step 6: After confidence, remove PAYSTACK_SECRET_KEY from env (optional)
```

---

## Files Changed Summary

| File | Action |
|---|---|
| `backend/prisma/schema.prisma` | MODIFY — add `gateway`, `gatewayRef`, `flwSubaccountId` fields |
| `backend/src/modules/payment/gateway.interface.ts` | NEW |
| `backend/src/modules/payment/gateway.factory.ts` | NEW |
| `backend/src/modules/payment/flutterwave.service.ts` | NEW |
| `backend/src/modules/payment/paystack.adapter.ts` | NEW (wraps existing service) |
| `backend/src/modules/payment/payment.service.ts` | MODIFY — use `getPaymentGateway()` |
| `backend/src/modules/payment/payment.controller.ts` | MODIFY — minor wiring |
| `backend/src/modules/finance/finance.service.ts` | MODIFY — add FLW subaccount path |
| `backend/src/modules/finance/paystack.webhook.ts` | KEEP (deprecated, no change) |
| `frontend/src/` (checkout/billing) | MODIFY — swap Paystack JS for FLW SDK |

---

## Verification Plan

### Automated
- `npx tsc --noEmit` on backend and frontend after each section

### Manual (use FLW Test Mode)
- [ ] Initiate a test payment → confirm redirect URL with `tx_ref`
- [ ] Complete test payment → confirm DB `Transaction` record created with `gateway=FLUTTERWAVE`
- [ ] Confirm subscription activated in DB
- [ ] Simulate Flutterwave webhook event → confirm `200` response and correct DB update
- [ ] Attempt webhook with wrong `verif-hash` → confirm `401`
- [ ] Attempt duplicate `tx_ref` verify → confirm idempotency guard returns early
- [ ] Test school fee payment → confirm split to school's FLW subaccount
