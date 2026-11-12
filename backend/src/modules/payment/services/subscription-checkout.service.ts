import { SubscriptionType, UserRole } from "@prisma/client";
import prisma, { withRetry } from "../../../config/database";
import { sendPaymentReceiptEmail, sendPaymentFailedEmail } from "../../auth/auth.service";
import { SchoolSubscriptionService } from "../../subscription/school-subscription.service";
import { UserSubscriptionService } from "../../subscription/user-subscription.service";
import { PlatformAlertRecipientService } from "../../platform/notifications/recipient.service";
import { getPaymentGateway } from "../gateway.factory";
import { CouponService } from "../coupon.service";
import { buildCheckoutQuote, CheckoutAuthUser } from "./subscription-quote.service";
import {
  SubscriberRole,
  addMonths,
  findSubscriber,
  normalizeRole,
  resolveAdminSchoolLink,
} from "./subscription-plan.helpers";

// ─────────────────────────────────────────────────────────────────────────────
// Activation
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivateSubscriptionParams {
  userId: string;
  role: SubscriberRole;
  schoolId?: string;
  planId: string;
  planType: string;
  billing: "monthly" | "yearly";
  months: number;
  isTrial: boolean;
  trialDays: number;
  isUpgrade: boolean;
  resetCycle: boolean;
  amountPaid: number;
  reference: string;
  note: string;
}

/** Applies a paid/trial plan to the user (and school for admins), extending from any remaining time. */
export async function activateSubscription(p: ActivateSubscriptionParams): Promise<Date> {
  const now = new Date();
  let existingEnd: Date | null = null;
  if (p.role === "ADMIN" && p.schoolId) {
    const school = await withRetry(
      () => prisma.school.findUnique({ where: { id: p.schoolId }, select: { subscriptionEnd: true } }),
      "subscription.activate.school",
    );
    existingEnd = school?.subscriptionEnd ?? null;
  } else {
    existingEnd = (await findSubscriber(p.role, { id: p.userId }))?.subscriptionEnd ?? null;
  }
  const hasRemaining = !!existingEnd && existingEnd > now;

  let subscriptionEnd: Date;
  if (p.isTrial) {
    subscriptionEnd = new Date(now.getTime() + p.trialDays * 86_400_000);
  } else if (p.isUpgrade && !p.resetCycle && hasRemaining) {
    subscriptionEnd = new Date(existingEnd!.getTime()); // pro-rated: keep current cycle end
  } else {
    subscriptionEnd = addMonths(hasRemaining ? existingEnd! : now, p.months);
  }

  const common = {
    planId: p.planId,
    type: p.isTrial ? SubscriptionType.TRIAL : SubscriptionType.PAID,
    expiresAtOverride: subscriptionEnd,
    billingCycleOverride: p.billing,
    amountPaid: p.amountPaid,
    paymentReference: p.reference,
    note: p.note,
    isTrial: p.isTrial,
    trialPlan: p.isTrial ? p.planType : undefined,
    trialEndsAt: p.isTrial ? subscriptionEnd : undefined,
  };

  await UserSubscriptionService.updatePlan({ ...common, userId: p.userId, userType: p.role as UserRole });

  if (p.role === "ADMIN" && p.schoolId) {
    await SchoolSubscriptionService.updatePlan({ ...common, schoolId: p.schoolId, assignedBy: p.userId });
    // A newly purchased plan supersedes any previously scheduled downgrade.
    await prisma.transaction.updateMany({
      where: { schoolId: p.schoolId, status: "PENDING_DOWNGRADE" },
      data: { status: "SUPERSEDED" },
    });
  }

  return subscriptionEnd;
}

const getEmail = async (role: SubscriberRole, userId: string) =>
  (await findSubscriber(role, { id: userId }))?.email || undefined;

const dispatchSuccessSideEffects = async (args: {
  role: SubscriberRole;
  userId: string;
  amount: number;
  channel: string;
  gatewayName: string;
  planName: string;
  reference: string;
  expiryDate: Date;
}) => {
  const userEmail = await getEmail(args.role, args.userId).catch(() => undefined);
  if (userEmail) {
    await sendPaymentReceiptEmail({
      email: userEmail,
      amount: args.amount,
      date: new Date(),
      method: args.channel || "Card",
      plan: args.planName,
      expiryDate: args.expiryDate,
    }).catch((e) => console.error("[SubscriptionCheckout] Receipt email failed:", e));
  }
  PlatformAlertRecipientService.dispatchAlert("PAYMENTS", {
    subject: `💳 Payment Received: ₦${args.amount.toLocaleString()} (${args.planName.toUpperCase()})`,
    title: "Subscription Payment Received",
    description: `A payment of ₦${args.amount.toLocaleString()} was processed via ${args.gatewayName} (${args.channel || "Card"}).\n\nPlan: ${args.planName}\nReference: ${args.reference}\nExpiry: ${args.expiryDate.toISOString()}`,
    userEmail,
    userType: args.role,
    priority: "HIGH",
  }).catch((e) => console.error("[SubscriptionCheckout] Payment alert failed:", e));
};

// ─────────────────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────────────────

export async function initializeSubscriptionCheckout(params: {
  authUser?: CheckoutAuthUser;
  clientAmount: number;
  email: string;
  plan: string;
  planCode?: string;
  metadata?: Record<string, unknown>;
}) {
  const quote = await buildCheckoutQuote({
    authUser: params.authUser,
    email: params.email,
    plan: params.plan,
    metadata: params.metadata,
  });

  if (Math.abs(params.clientAmount - quote.amount) > 1) {
    console.warn(
      `[SubscriptionCheckout] Client amount ₦${params.clientAmount} ignored; server quote is ₦${quote.amount} (user ${quote.userId}, plan ${quote.planType}).`,
    );
  }

  const frontendUrl = process.env.FRONTEND_URL || "https://www.qefashub.com";

  // ── Zero-amount checkout: only allowed when a server-validated coupon covers the full price ──
  if (quote.amount === 0) {
    if (!quote.couponId || quote.couponDiscount <= 0) {
      throw new Error("Zero-amount checkout requires a valid 100% discount coupon.");
    }
    const reference = `FREE_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await prisma.transaction.create({
      data: {
        reference,
        amount: 0,
        currency: "NGN",
        status: "PROCESSING",
        paymentMethod: "COUPON",
        schoolId: quote.schoolId,
        userId: quote.userId,
        userType: quote.role as UserRole,
        plan: quote.planName,
        planId: quote.planId,
        billingCycle: quote.billing,
        gateway: "FREE_COUPON",
        gatewayRef: reference,
      },
    });
    const expiryDate = await activateSubscription({
      ...quote,
      amountPaid: 0,
      reference,
      note: `Activated via 100% coupon ${quote.couponCode}`,
    });
    await prisma.transaction.update({
      where: { reference },
      data: { status: "SUCCESS", paidAt: new Date(), expiryDate },
    });
    await CouponService.recordUsage({
      couponId: quote.couponId,
      userId: quote.userId,
      userEmail: quote.email,
      discountNaira: quote.couponDiscount,
      paymentReference: reference,
    }).catch((e) => console.error("[SubscriptionCheckout] Coupon usage record failed:", e));

    PlatformAlertRecipientService.dispatchAlert("SUBSCRIPTIONS", {
      subject: `⭐ [Plan Activated] 100% Discount: ${quote.planName}`,
      title: "100% Discount Subscription Activation",
      description: `Plan: ${quote.planName}\nBilling: ${quote.billing}\nCoupon: ${quote.couponCode}\nReference: ${reference}`,
      userEmail: quote.email,
      userType: quote.role,
      priority: "MEDIUM",
    }).catch(() => {});

    const callback = `${frontendUrl}/payment/callback?reference=${reference}&status=successful`;
    return { authorization_url: callback, checkoutUrl: callback, access_code: "FREE_COUPON", reference, isFree: true, amount: 0 };
  }

  // ── Paid checkout: metadata is built by the server, never echoed from the client ──
  const gateway = getPaymentGateway();
  const result = await gateway.initialize({
    userId: quote.userId,
    email: quote.email,
    amount: quote.amount,
    plan: quote.planType,
    metadata: {
      paymentType: "SUBSCRIPTION",
      userId: quote.userId,
      user_role: quote.role,
      schoolId: quote.schoolId ?? "",
      name: quote.name,
      billing: quote.billing,
      months: quote.months,
      is_trial: quote.isTrial,
      is_upgrade: quote.isUpgrade,
      reset_cycle: quote.resetCycle,
      couponId: quote.couponId ?? "",
      couponCode: quote.couponCode ?? "",
      couponDiscount: quote.couponDiscount,
      expectedAmount: quote.amount,
      ...(params.planCode ? { planCode: params.planCode } : {}),
    },
  });

  // Pending ledger row = authoritative record of what was quoted (amount/plan/owner).
  await prisma.transaction.create({
    data: {
      reference: result.txRef,
      amount: quote.amount,
      currency: "NGN",
      status: "INITIATED",
      schoolId: quote.schoolId,
      userId: quote.userId,
      userType: quote.role as UserRole,
      plan: quote.planName,
      planId: quote.planId,
      billingCycle: quote.billing,
      gateway: gateway.name,
    },
  });

  return {
    authorization_url: result.checkoutUrl,
    checkoutUrl: result.checkoutUrl,
    access_code: result.accessCode,
    reference: result.txRef,
    amount: quote.amount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify (shared by redirect callback AND initial-charge webhook)
// ─────────────────────────────────────────────────────────────────────────────

export async function verifySubscriptionPayment(
  reference: string,
  flwTransactionId?: string,
  authUser?: CheckoutAuthUser,
) {
  const existing = await prisma.transaction.findUnique({ where: { reference } });
  if (existing?.status === "SUCCESS") {
    return {
      alreadyProcessed: true,
      reference,
      paymentMethod: existing.paymentMethod || "COUPON",
      expiryDate: existing.expiryDate ? existing.expiryDate.toISOString() : null,
    };
  }
  if (!existing) {
    throw new Error("Unknown subscription payment reference. Please contact support with your receipt.");
  }
  if (authUser && existing.userId && existing.userId !== authUser.id) {
    throw new Error("This payment reference belongs to a different account.");
  }

  const role = normalizeRole(existing.userType);
  if (!role || !existing.userId || !existing.planId) {
    throw new Error("Subscription payment record is incomplete. Please contact support.");
  }

  const gateway = getPaymentGateway();
  let verified;
  try {
    verified = await gateway.verify(reference, flwTransactionId);
  } catch (error) {
    await prisma.transaction.updateMany({
      where: { reference, status: "INITIATED" },
      data: { status: "FAILED" },
    });
    const email = await getEmail(role, existing.userId).catch(() => undefined);
    if (email) {
      await sendPaymentFailedEmail({
        email,
        amount: existing.amount,
        date: new Date(),
        method: gateway.name,
        plan: existing.plan || "",
      }).catch(() => {});
    }
    throw error;
  }

  // SECURITY: amount actually charged must cover the server-quoted amount.
  if (verified.amountNaira + 1 < existing.amount) {
    await prisma.transaction.update({ where: { reference }, data: { status: "AMOUNT_MISMATCH" } });
    throw new Error(
      `Payment amount mismatch: received ₦${verified.amountNaira.toLocaleString()}, expected ₦${existing.amount.toLocaleString()}. Please contact support.`,
    );
  }

  // Atomic claim — only one of (webhook, redirect) may activate the plan.
  const claim = await prisma.transaction.updateMany({
    where: { reference, status: { in: ["INITIATED", "FAILED"] } },
    data: { status: "PROCESSING" },
  });
  if (claim.count === 0) {
    const current = await prisma.transaction.findUnique({ where: { reference } });
    return {
      alreadyProcessed: true,
      reference,
      paymentMethod: current?.paymentMethod || verified.channel,
      expiryDate: current?.expiryDate ? current.expiryDate.toISOString() : null,
    };
  }

  const meta = verified.meta;
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: existing.planId } });
  if (!plan) throw new Error("Subscription plan no longer exists.");
  const billing: "monthly" | "yearly" = existing.billingCycle === "yearly" ? "yearly" : "monthly";
  const months = billing === "yearly" ? 12 : Math.min(12, Math.max(1, Number(meta.months) || 1));
  const isTrial = meta.isTrial === true;

  let expiryDate: Date;
  try {
    expiryDate = await activateSubscription({
      userId: existing.userId,
      role,
      schoolId: existing.schoolId ?? undefined,
      planId: existing.planId,
      planType: plan.type,
      billing,
      months,
      isTrial,
      trialDays: plan.trialDays || 7,
      isUpgrade: meta.isUpgrade === true,
      resetCycle: meta.resetCycle === true,
      amountPaid: verified.amountNaira,
      reference,
      note: `Payment via ${gateway.name} (${verified.channel})`,
    });
  } catch (activationError) {
    // Release the claim so a retry (webhook or callback) can finish activation.
    await prisma.transaction.update({ where: { reference }, data: { status: "INITIATED" } });
    throw activationError;
  }

  await prisma.transaction.update({
    where: { reference },
    data: {
      status: "SUCCESS",
      amount: verified.amountNaira,
      paymentMethod: verified.channel,
      authorizationToken: verified.authorizationToken,
      paidAt: new Date(),
      expiryDate,
      gatewayRef: verified.gatewayRef,
    },
  });

  // Coupon usage is recorded for partial-discount paid checkouts too.
  const couponId = typeof meta.couponId === "string" && meta.couponId ? meta.couponId : undefined;
  const couponDiscount = Number(meta.couponDiscount) || 0;
  if (couponId && couponDiscount > 0) {
    const email = (await getEmail(role, existing.userId)) || "";
    await CouponService.recordUsage({
      couponId,
      userId: existing.userId,
      userEmail: email,
      discountNaira: couponDiscount,
      paymentReference: reference,
    }).catch((e) => console.error("[SubscriptionCheckout] Coupon usage record failed:", e));
  }

  await dispatchSuccessSideEffects({
    role,
    userId: existing.userId,
    amount: verified.amountNaira,
    channel: verified.channel,
    gatewayName: gateway.name,
    planName: plan.name,
    reference,
    expiryDate,
  });

  return { reference, gateway: gateway.name, paymentMethod: verified.channel, expiryDate };
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-renewal (recurring charge webhooks)
// ─────────────────────────────────────────────────────────────────────────────

export async function processSubscriptionRenewal(params: {
  userId: string;
  userRole: string;
  planId: string;
  billingCycle: string;
  amountPaid: number;
  paymentReference: string;
  authorizationToken?: string;
  channel: string;
}) {
  const role = normalizeRole(params.userRole);
  if (!role) throw new Error(`Invalid renewal role ${params.userRole}`);
  const billing: "monthly" | "yearly" = params.billingCycle === "yearly" ? "yearly" : "monthly";

  let schoolId: string | undefined;
  let planId = params.planId;
  let pendingDowngradeId: number | undefined;
  if (role === "ADMIN") {
    schoolId = (await resolveAdminSchoolLink(params.userId))?.schoolId;
    if (schoolId) {
      const pending = await prisma.transaction.findFirst({
        where: { schoolId, status: "PENDING_DOWNGRADE" },
        orderBy: { createdAt: "desc" },
      });
      if (pending?.planId) {
        planId = pending.planId; // apply the scheduled downgrade at renewal
        pendingDowngradeId = pending.id;
      }
    }
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("Renewal plan not found.");
  const expected = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  if (params.amountPaid + 1 < expected) {
    await prisma.transaction.create({
      data: {
        reference: params.paymentReference,
        amount: params.amountPaid,
        currency: "NGN",
        status: "AMOUNT_MISMATCH",
        paymentMethod: params.channel,
        schoolId,
        userId: params.userId,
        userType: role as UserRole,
        plan: plan.name,
        planId,
        billingCycle: billing,
      },
    });
    console.error(`[Renewal] Underpaid renewal ${params.paymentReference}: ₦${params.amountPaid} < ₦${expected}. Not activated.`);
    return;
  }

  const expiryDate = await activateSubscription({
    userId: params.userId,
    role,
    schoolId,
    planId,
    planType: plan.type,
    billing,
    months: billing === "yearly" ? 12 : 1,
    isTrial: false,
    trialDays: 0,
    isUpgrade: false,
    resetCycle: false,
    amountPaid: params.amountPaid,
    reference: params.paymentReference,
    note: `Auto-renewal via gateway (${params.channel})`,
  });

  if (pendingDowngradeId) {
    await prisma.transaction.update({ where: { id: pendingDowngradeId }, data: { status: "APPLIED" } });
  }

  await prisma.transaction.create({
    data: {
      reference: params.paymentReference,
      amount: params.amountPaid,
      currency: "NGN",
      status: "SUCCESS",
      paymentMethod: params.channel,
      authorizationToken: params.authorizationToken,
      paidAt: new Date(),
      schoolId,
      userId: params.userId,
      userType: role as UserRole,
      plan: plan.name,
      planId,
      billingCycle: billing,
      expiryDate,
    },
  });

  await dispatchSuccessSideEffects({
    role,
    userId: params.userId,
    amount: params.amountPaid,
    channel: params.channel,
    gatewayName: getPaymentGateway().name,
    planName: plan.name,
    reference: params.paymentReference,
    expiryDate,
  });
}

