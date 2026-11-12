import prisma, { withRetry } from "../../../config/database";
import { CouponService } from "../coupon.service";
import {
  SubscriberRole,
  TRIAL_VALIDATION_CHARGE,
  assertBillingAdmin,
  findSubscriber,
  getPlanId,
  normalizeRole,
} from "./subscription-plan.helpers";

export interface CheckoutAuthUser {
  id: string;
  userType: string;
  schoolId?: string;
}

export interface CheckoutQuoteInput {
  authUser?: CheckoutAuthUser;
  email: string;
  plan: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutQuote {
  userId: string;
  role: SubscriberRole;
  email: string;
  name: string;
  schoolId?: string;
  planId: string;
  planType: string;
  planName: string;
  billing: "monthly" | "yearly";
  months: number;
  isTrial: boolean;
  trialDays: number;
  isUpgrade: boolean;
  resetCycle: boolean;
  couponId?: string;
  couponCode?: string;
  couponDiscount: number;
  /** Server-computed amount the user must pay (Naira). Client amounts are never trusted. */
  amount: number;
}

const truthy = (v: unknown) => v === true || v === "true";

/**
 * Builds an authoritative checkout quote from the DB plan price, the subscriber's
 * real trial/upgrade state, and a server-side coupon re-validation.
 */
export async function buildCheckoutQuote(input: CheckoutQuoteInput): Promise<CheckoutQuote> {
  const meta = input.metadata || {};

  // 1. Role — authenticated token wins; guests must declare a valid role.
  const claimedRole = normalizeRole((meta.user_role as string) || (meta.role as string));
  const role = input.authUser ? normalizeRole(input.authUser.userType) : claimedRole;
  if (!role) throw new Error("Invalid account role for subscription checkout.");
  if (input.authUser && claimedRole && claimedRole !== role) {
    throw new Error("Checkout role does not match your signed-in account.");
  }

  // 2. Subscriber identity — never trust a client-supplied userId.
  const subscriber = input.authUser
    ? await findSubscriber(role, { id: input.authUser.id })
    : await findSubscriber(role, { email: input.email.trim().toLowerCase() });
  if (!subscriber) {
    throw new Error("Account not found. Please verify your email before checkout.");
  }
  const email = subscriber.email || input.email;

  // 3. School context & admin sub-role permissions.
  let schoolId: string | undefined;
  if (role === "ADMIN") {
    const link = await assertBillingAdmin(subscriber.id, input.authUser?.schoolId);
    schoolId = link?.schoolId;
  }

  // 4. Plan & price from the database.
  const planId = await getPlanId(role, input.plan);
  const plan = await withRetry(
    () => prisma.subscriptionPlan.findUnique({ where: { id: planId } }),
    "subscription.quote.plan",
  );
  if (!plan) throw new Error("Selected subscription plan is unavailable.");
  if ((plan.monthlyPrice || 0) <= 0 && (plan.yearlyPrice || 0) <= 0) {
    throw new Error("Free plans do not require checkout. Use the free plan activation instead.");
  }

  const billing: "monthly" | "yearly" = meta.billing === "yearly" ? "yearly" : "monthly";
  const rawMonths = parseInt(String(meta.months ?? 1), 10);
  let months = billing === "yearly" ? 12 : Math.min(12, Math.max(1, Number.isFinite(rawMonths) ? rawMonths : 1));
  const periodPrice = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  let preCouponAmount = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice * months;

  // 5. Current subscription snapshot (school for admins, personal otherwise).
  const snapshot =
    role === "ADMIN" && schoolId
      ? await withRetry(
          () =>
            prisma.school.findUnique({
              where: { id: schoolId },
              select: { trialUsed: true, subscriptionEnd: true, lastPaymentDate: true, subscriptionPlanId: true, billingCycle: true },
            }),
          "subscription.quote.school",
        )
      : subscriber;

  // 6. Pro-rated upgrade — recomputed server-side (mirrors frontend calculateProRatedAmount).
  let isUpgrade = false;
  let resetCycle = false;
  const now = new Date();
  const hasActivePlan = !!snapshot?.subscriptionEnd && snapshot.subscriptionEnd > now;
  if (truthy(meta.is_upgrade) && hasActivePlan && snapshot?.subscriptionPlanId && snapshot.subscriptionPlanId !== planId) {
    const currentPlan = await withRetry(
      () => prisma.subscriptionPlan.findUnique({ where: { id: snapshot.subscriptionPlanId! } }),
      "subscription.quote.currentPlan",
    );
    const currentPrice = currentPlan
      ? snapshot.billingCycle === "yearly" ? currentPlan.yearlyPrice : currentPlan.monthlyPrice
      : 0;
    if (periodPrice > currentPrice) {
      isUpgrade = true;
      months = billing === "yearly" ? 12 : 1;
      const daysSincePayment = snapshot.lastPaymentDate
        ? Math.ceil(Math.abs(now.getTime() - snapshot.lastPaymentDate.getTime()) / 86_400_000)
        : Number.POSITIVE_INFINITY;
      if (daysSincePayment < 15) {
        preCouponAmount = Math.max(0, periodPrice - currentPrice);
        resetCycle = false;
      } else {
        preCouponAmount = periodPrice;
        resetCycle = true;
      }
    }
  }

  // 7. Coupon — re-validated on the server (client discount is ignored).
  let couponId: string | undefined;
  let couponCode: string | undefined;
  let couponDiscount = 0;
  let code = typeof meta.couponCode === "string" ? meta.couponCode.trim() : "";
  if (!code && typeof meta.couponId === "string" && meta.couponId) {
    const c = await prisma.coupon.findUnique({ where: { id: meta.couponId }, select: { code: true } });
    code = c?.code || "";
  }
  if (code && preCouponAmount > 0) {
    const result = await CouponService.validate({
      code,
      email,
      plan: input.plan,
      role,
      amountNaira: preCouponAmount,
      userId: subscriber.id,
    });
    couponId = result.couponId;
    couponCode = result.code;
    couponDiscount = result.discountNaira;
  }

  // 8. Trial — only if plan offers it, never used, not an upgrade, and no coupon.
  const isTrial =
    truthy(meta.is_trial) && plan.hasTrial && !subscriber.trialUsed && !snapshot?.trialUsed && !isUpgrade && !couponId;

  const amount = isTrial ? TRIAL_VALIDATION_CHARGE : Math.max(0, Math.round(preCouponAmount - couponDiscount));

  return {
    userId: subscriber.id,
    role,
    email,
    name: typeof meta.name === "string" ? meta.name : email,
    schoolId,
    planId,
    planType: plan.type,
    planName: plan.name,
    billing,
    months: isTrial ? 1 : months,
    isTrial,
    trialDays: plan.trialDays || 7,
    isUpgrade,
    resetCycle,
    couponId,
    couponCode,
    couponDiscount: isTrial ? 0 : couponDiscount,
    amount,
  };
}

