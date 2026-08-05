import axios from "axios";
import crypto from "crypto";
import prisma from "../../config/database";
import { PRICING_PLANS } from "./plans.data";
import { sendPaymentReceiptEmail } from "../auth/auth.service";
import { SubscriptionType, UserRole } from "@prisma/client";
import { SchoolSubscriptionService } from "../subscription/school-subscription.service";
import { UserSubscriptionService } from "../subscription/user-subscription.service";
import { FinanceService } from "../finance/finance.service";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder";

const getPlanId = async (userType: string, plan: string) => {
  const categoryMap: Record<string, string> = {
    'ADMIN': 'schools',
    'TEACHER': 'teachers',
    'STUDENT': 'students',
    'PARENT': 'parents'
  };
  const category = categoryMap[userType.toUpperCase()] || 'schools';

  // Requirement: Fetch the real UUID from the database, not from plans.data.ts
  const dbPlan = await prisma.subscriptionPlan.findFirst({
    where: {
        category: { equals: category, mode: 'insensitive' },
        type: { equals: plan, mode: 'insensitive' },
        isActive: true
    },
    select: { id: true }
  });

  if (dbPlan) return dbPlan.id;

  // Hard fail — do NOT silently return a fake/hardcoded ID that would corrupt Transaction records.
  throw new Error(`No active subscription plan found for category="${category}", type="${plan}". Ensure the plan exists in the database.`);
};

/**
 * Initialize payment with Paystack
 */
export const initializePaymentService = async (params: {
  userId: string;
  amount: number;
  email: string;
  plan: string;
  planCode?: string;
  metadata?: Record<string, unknown>;
}) => {
  try {
    const payload: Record<string, unknown> = {
      email: params.email,
      amount: params.amount * 100, // Paystack works in kobo/cents
      metadata: {
        ...params.metadata,
        userId: params.userId,
        plan: params.plan,
      },
    };

    if (params.planCode) {
      payload.plan = params.planCode;
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || "Paystack initialization failed");
  }
};

/**
 * Verify payment and update subscription
 */
export const verifyPaymentService = async (
  reference: string,
  userId: string,
  userRoleRaw: string,
  plan: string,
  billingType: 'monthly' | 'yearly'
) => {
  const userRole = userRoleRaw.toUpperCase();
  console.log(`[PaymentService] Verifying payment for user: ${userId}, role: ${userRole}, reference: ${reference}`);

  try {
    // --- IDEMPOTENCY GUARD ---
    // Prevent the same Paystack reference from being processed more than once.
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference }
    });
    if (existingTransaction) {
      console.log(`[PaymentService] Reference ${reference} already processed. Skipping.`);
      // Return a success-like payload so the frontend still transitions to SUCCESS state
      return { alreadyProcessed: true, reference };
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const {
        status: paystackStatus,
        amount: paystackAmount,
        reference: paystackRef,
        channel,
        authorization,
        metadata
    } = response.data.data;

    const authCode = authorization?.authorization_code;

    if (paystackStatus !== "success") {
      throw new Error("Payment was not successful");
    }

    // SECURITY: Extract Plan and Billing from Metadata (Source of Truth)
    // This prevents users from spoofing a different plan in the request body
    const customFields = metadata?.custom_fields || [];
    const metadataPlan = customFields.find((f: { variable_name: string; value: string }) => f.variable_name === 'plan')?.value;
    const metadataBilling = customFields.find((f: { variable_name: string; value: string }) => f.variable_name === 'billing')?.value;
    const isUpgrade = customFields.find((f: { variable_name: string; value: string }) => f.variable_name === 'is_upgrade')?.value === 'true';
    const isTrial = customFields.find((f: { variable_name: string; value: string }) => f.variable_name === 'is_trial')?.value === 'true';

    // Prioritize metadata, fallback to provided params (for backward compatibility if needed)
    const verifiedPlan = metadataPlan || plan;
    const verifiedBilling: 'monthly' | 'yearly' = (metadataBilling || billingType) as 'monthly' | 'yearly';

    if (metadataPlan && plan && metadataPlan.toLowerCase() !== plan.toLowerCase()) {
        console.warn(`[PaymentSecurity] Plan mismatch detected! Request: ${plan}, Metadata: ${metadataPlan}. Using Metadata.`);
    }

    // Calculate subscription end date
    const durationMonths = verifiedBilling === 'yearly' ? 12 : 1;
    let subscriptionEnd = new Date();

    if (isTrial) {
        // Fetch trial days from plans config
        const categoryMap: Record<string, string> = { 'ADMIN': 'schools', 'TEACHER': 'teachers', 'STUDENT': 'students', 'PARENT': 'parents' };
        const category = categoryMap[userRole] || 'schools';
        const planData = PRICING_PLANS.find(p => p.category === category)?.tabs.find(t => t.type.toLowerCase() === verifiedPlan.toLowerCase());
        const trialDays = planData?.trialDays || 7;

        subscriptionEnd.setDate(subscriptionEnd.getDate() + trialDays);
    } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);
    }

    // < 15 days -> continues from where previous starts from.
    // >= 15 days -> starts from payment point.

    // We'll trust the frontend's decision on whether this was a pro-rated upgrade.
    // If it was pro-rated (isUpgrade = true), we should NOT reset the end date if it's already in the future.

    const planId = await getPlanId(userRole, verifiedPlan);

    const updateData: {
      plan: string;
      planId: string;
      subscriptionPlanId: string;
      subscriptionStatus: string;
      lastPaymentDate: Date;
      isTrialActive: boolean;
      trialUsed: boolean;
      trialEndsAt?: Date;
      trialPlan?: string;
      billingCycle: string;
      subscriptionEnd: Date;
    } = {
        plan: verifiedPlan, // Human readable plan name (e.g. "Growth")
        planId: planId, // UUID of the plan
        subscriptionPlanId: planId, // UUID of the plan (Standardized field)
        subscriptionStatus: "ACTIVE",
        lastPaymentDate: new Date(),
        isTrialActive: isTrial,
        trialUsed: true,
        trialEndsAt: isTrial ? subscriptionEnd : undefined,
        trialPlan: isTrial ? verifiedPlan : undefined, // Requirement: Set trial plan name if trialing
        billingCycle: verifiedBilling,
        subscriptionEnd, // default; may be overridden below
    };

    if (isUpgrade) {
        // Find existing subscription end to preserve it
        let existingEnd: Date | null = null;
        if (userRole === "ADMIN") {
            const schoolAdmin = await prisma.schoolAdmin.findFirst({
                where: { adminId: userId },
                include: { school: { select: { subscriptionEnd: true } } }
            });
            existingEnd = schoolAdmin?.school?.subscriptionEnd || null;
        } else {
            const user = await (prisma as unknown as Record<string, { findUnique: (args: { where: { id: string }; select: { subscriptionEnd: boolean } }) => Promise<{ subscriptionEnd: Date | null } | null> }>)[userRole.toLowerCase()].findUnique({
                where: { id: userId },
                select: { subscriptionEnd: true }
            });
            existingEnd = user?.subscriptionEnd || null;
        }

        if (existingEnd && existingEnd > new Date()) {
            updateData.subscriptionEnd = existingEnd;
        } else {
            updateData.subscriptionEnd = subscriptionEnd;
        }
    } else {
        updateData.subscriptionEnd = subscriptionEnd;
    }

    // Save transaction record
    let schoolId: string | undefined;
    if (userRole === "ADMIN") {
        const schoolAdmin = await prisma.schoolAdmin.findFirst({
            where: { adminId: userId },
            select: { schoolId: true }
        });
        schoolId = schoolAdmin?.schoolId;
    }

    await prisma.transaction.create({
        data: {
            reference: paystackRef,
            amount: paystackAmount / 100,
            currency: "NGN",
            status: "SUCCESS",
            paymentMethod: channel,
            authorizationToken: authCode,
            paidAt: new Date(),
            schoolId,
            userId,
            userType: userRole as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT",
            plan,
            planId,
            billingCycle: billingType,
        }
    });


    // Determine Subscription Type for the professional tracking tables
    const subType = isTrial ? SubscriptionType.TRIAL : SubscriptionType.PAID;
    const durationDays = Math.ceil((updateData.subscriptionEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Update the corresponding professional subscription tables and history
    switch (userRole) {
        case "TEACHER":
        case "STUDENT":
        case "PARENT":
            await UserSubscriptionService.updatePlan({
                userId,
                userType: userRole as UserRole,
                planId: updateData.planId,
                type: subType,
                durationDays,
                amountPaid: paystackAmount / 100,
                paymentReference: paystackRef,
                note: `Payment via Paystack (${channel})`,
                isTrial,
                trialPlan: verifiedPlan,
                trialEndsAt: subscriptionEnd
            });
            break;

        case "ADMIN": {
            const schoolAdmin = await prisma.schoolAdmin.findFirst({
                where: { adminId: userId },
                select: { schoolId: true }
            });

            console.log(`[PaymentService] Admin link check: ${schoolAdmin ? 'Link found: ' + schoolAdmin.schoolId : 'No link found for admin ' + userId}`);

            // 1. Update the Individual Admin Subscription
            await UserSubscriptionService.updatePlan({
                userId,
                userType: UserRole.ADMIN,
                planId: updateData.planId,
                type: subType,
                durationDays,
                amountPaid: paystackAmount / 100,
                paymentReference: paystackRef,
                note: `Payment via Paystack (${channel})`,
                isTrial,
                trialPlan: verifiedPlan,
                trialEndsAt: subscriptionEnd
            });

            // 2. Update the Institutional School Subscription (Primary source for billing dashboard)
            if (schoolAdmin?.schoolId) {
                await SchoolSubscriptionService.updatePlan({
                    schoolId: schoolAdmin.schoolId,
                    planId: updateData.planId,
                    type: subType,
                    durationDays,
                    amountPaid: paystackAmount / 100,
                    paymentReference: paystackRef,
                    note: `Institutional Payment via Paystack (${channel})`,
                    isTrial,
                    trialPlan: verifiedPlan,
                    trialEndsAt: subscriptionEnd,
                    assignedBy: userId // The admin ID who paid
                });
                console.log(`[PaymentService] School ${schoolAdmin.schoolId} updated successfully.`);
            }
            break;
        }
    }

    // 4. Send Receipt Email
    try {
        let userEmail: string | undefined;
        if (userRole === "ADMIN") {
            const admin = await prisma.admin.findUnique({ where: { id: userId }, select: { email: true } });
            userEmail = admin?.email;
        } else {
            userEmail = await (prisma as unknown as Record<string, { findUnique: (args: { where: { id: string }; select: { email: boolean } }) => Promise<{ email: string } | null> }>)[userRole.toLowerCase()].findUnique({ where: { id: userId }, select: { email: true } }).then(u => u?.email);
        }

        if (userEmail) {
            await sendPaymentReceiptEmail({
                email: userEmail,
                amount: paystackAmount / 100,
                date: new Date(),
                method: channel || 'Card',
                plan: plan,
                expiryDate: updateData.subscriptionEnd
            });
            console.log(`[PaymentService] Receipt email sent to ${userEmail}`);
        }
    } catch (emailError) {
        console.error("[PaymentService] Failed to send receipt email:", emailError);
        // Don't throw here as the payment was successful
    }

    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    console.error("[PaymentService] Error during verification:", error);
    throw new Error(err.response?.data?.message || err.message || "Payment verification failed");
  }
};

/**
 * Fetch consolidated billing data for a user (Student, Teacher, or Parent)
 */
export const getUserBillingService = async (userId: string, role: string, page = 1, limit = 5) => {
    const table = role.toLowerCase();
    const userRole = role.toUpperCase();

    // Fetch user with subscription info
    const user = await (prisma as unknown as Record<string, { findUnique: (args: { where: { id: string }; select: Record<string, boolean> }) => Promise<Record<string, unknown> | null> }>)[table].findUnique({
        where: { id: userId },
        select: {
            id: true,
            plan: true,
            subscriptionStatus: true,
            subscriptionEnd: true,
            isTrialActive: true,
            lastPaymentDate: true,
            paystackCustomerCode: true,
            billingCycle: true,
            subscriptionPlanId: true,
        }
    });

    if (!user) {
        throw new Error(`User not found for ID: "${userId}" or role mismatch.`);
    }

    const skip = (page - 1) * limit;

    // Determine which field to use for FileMetric based on role
    let fileMetricWhere: Record<string, string> = {};
    if (userRole === 'STUDENT') fileMetricWhere = { studentId: userId };
    else if (userRole === 'TEACHER') fileMetricWhere = { teacherId: userId };
    else if (userRole === 'PARENT') fileMetricWhere = { parentId: userId };
    else if (userRole === 'ADMIN') {
        const schoolAdmin = await prisma.schoolAdmin.findFirst({
            where: { adminId: userId },
            select: { schoolId: true }
        });
        if (schoolAdmin?.schoolId) fileMetricWhere = { schoolId: schoolAdmin.schoolId };
        else fileMetricWhere = { id: 'none' }; // No school, no files
    }

    // Fetch transactions and usage sequentially to save connections
    const transactions = await prisma.transaction.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
    });
    const totalTransactions = await prisma.transaction.count({
        where: { userId: userId }
    });
    const storageMetric = await prisma.fileMetric.aggregate({
        where: fileMetricWhere,
        _sum: { fileSize: true }
    });

    // Role-specific usage metrics
    const usage: { storageBytes: number; classes: number; students: number; schools: number } = {
        storageBytes: storageMetric._sum.fileSize ? Number(storageMetric._sum.fileSize) : 0,
        classes: 0,
        students: 0,
        schools: 0
    };

    try {
        if (userRole === 'TEACHER') {
            const classCount = await prisma.classTeacher.count({ where: { teacherId: userId } });
            const studentCount = await prisma.relationshipLink.count({
                where: {
                    linkType: 'TEACHER_STUDENT',
                    status: 'ACTIVE',
                    OR: [{ leftEntityId: userId }, { rightEntityId: userId }]
                }
            });
            const schoolLinkCount = await prisma.relationshipLink.count({
                where: {
                    linkType: 'SCHOOL_TEACHER',
                    status: 'ACTIVE',
                    OR: [{ leftEntityId: userId }, { rightEntityId: userId }]
                }
            });
            usage.classes = classCount;
            usage.students = studentCount;
            usage.schools = schoolLinkCount;
        } else if (userRole === 'PARENT') {
            const childCount = await prisma.parentChildLink.count({ where: { parentId: userId, status: 'active' } });
            usage.students = childCount;
        }
    } catch (usageError) {
        console.error("[PaymentService] Usage calculation error:", usageError);
    }

    // Fetch Subscription Plan with Features separately for accuracy across roles
    let subscriptionPlan: Record<string, unknown> | null = null;
    try {
        if (userRole === 'ADMIN') {
            const schoolAdmin = await prisma.schoolAdmin.findFirst({
                where: { adminId: userId, active: true },
                select: { schoolId: true }
            });
            if (schoolAdmin) {
                const school = await prisma.school.findUnique({
                    where: { id: schoolAdmin.schoolId },
                    include: {
                        subscriptionPlan: {
                            include: { featureAccess: { where: { enabled: true }, include: { feature: true } } }
                        }
                    }
                });
                subscriptionPlan = school?.subscriptionPlan as Record<string, unknown> | null;
            }
        } else if (['TEACHER', 'STUDENT', 'PARENT'].includes(userRole)) {
            const profile = await (prisma as unknown as Record<string, { findUnique: (args: { where: { id: string }; include: Record<string, unknown> }) => Promise<Record<string, unknown> | null> }>)[table].findUnique({
                where: { id: userId },
                include: {
                    subscriptionPlan: {
                        include: { featureAccess: { where: { enabled: true }, include: { feature: true } } }
                    }
                }
            });
            subscriptionPlan = profile?.subscriptionPlan as Record<string, unknown> | null;
        }
    } catch (planError) {
        console.error("[PaymentService] Error fetching subscription plan features:", planError);
    }

    const featureAccess = subscriptionPlan?.featureAccess as Array<{ feature: { featureKey: string; label?: string; name: string }; limitValue: number; enabled: boolean }> | undefined;

    return {
        subscription: {
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEnd: user.subscriptionEnd,
            isTrialActive: user.isTrialActive,
            lastPaymentDate: user.lastPaymentDate,
            paystackCustomerCode: user.paystackCustomerCode,
            subscriptionPlanId: user.subscriptionPlanId,
            billingCycle: user.billingCycle || 'MONTHLY',
            features: featureAccess?.map((fa) => ({
                key: fa.feature.featureKey,
                name: fa.feature.label || fa.feature.name,
                limit: fa.limitValue,
                enabled: fa.enabled
            })) || []
        },
        usage,
        transactions,
        totalTransactions,
    };
};

/**
 * Schedule a plan downgrade at the end of the current billing period.
 * The current plan stays active; the new plan takes effect at renewal.
 * Industry-standard pattern: no charge now, downgrade at period end.
 */
export const scheduleDowngradeService = async (
  userId: string,
  userRole: string,
  newPlan: string,
  billingCycle: 'monthly' | 'yearly'
) => {
  const role = userRole.toUpperCase();
  const newPlanId = await getPlanId(role, newPlan);

  if (role === 'ADMIN') {
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { adminId: userId },
      select: { schoolId: true }
    });

    if (!schoolAdmin?.schoolId) {
      throw new Error('No school found for this admin');
    }

    // Record the pending downgrade on the school — active plan is unchanged
    await prisma.school.update({
      where: { id: schoolAdmin.schoolId },
      data: {
        pendingPlan: newPlan,
        pendingPlanId: newPlanId,
        pendingBillingCycle: billingCycle,
      } as any // Graceful: only persisted if schema has these fields
    }).catch(() => {
      // If schema doesn't have the field yet, log and continue.
      // The downgrade intent is captured in the audit log below.
      console.warn('[ScheduleDowngrade] pendingPlan field not found in schema. Audit-log only.');
    });

    // Create an audit transaction record for the scheduled downgrade
    await prisma.transaction.create({
      data: {
        reference: `DOWNGRADE-${userId}-${Date.now()}`,
        amount: 0,
        currency: 'NGN',
        status: 'PENDING_DOWNGRADE',
        schoolId: schoolAdmin.schoolId,
        userId,
        userType: 'ADMIN',
        plan: newPlan,
        planId: newPlanId,
        billingCycle,
        paymentMethod: 'SCHEDULED',
      }
    });

    console.log(`[PaymentService] Downgrade scheduled: Admin ${userId} → ${newPlan} (${billingCycle})`);
    return { scheduled: true, plan: newPlan, billingCycle };
  }

  throw new Error('Downgrade scheduling is only supported for ADMIN role currently');
};

/**
 * Get payment history
 */
export const getPaymentHistoryService = async (userId: string) => {
  return await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Extract metadata from a Paystack reference (Used for guest checkout verification)
 */
export const getMetadataFromReference = async (reference: string) => {
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const metadata = response.data.data.metadata?.custom_fields || [];
        const userId = metadata.find((f: { variable_name: string; value: string }) => f.variable_name === 'user_id')?.value;
        const userRole = metadata.find((f: { variable_name: string; value: string }) => f.variable_name === 'user_role')?.value;

        return { userId, userRole };
    } catch (error: unknown) {
        console.error(`[PaymentService] Error fetching metadata for ref: ${reference}`, error);
        throw new Error("Failed to retrieve transaction metadata");
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER: Extend a user's subscription on auto-renewal
// ─────────────────────────────────────────────────────────────────────────────
const extendSubscriptionOnRenewal = async (params: {
  userId: string;
  userRole: string;
  planId: string;
  planName: string;
  billingCycle: string;
  amountPaid: number;
  paymentReference: string;
  authorizationToken?: string;
  channel: string;
}) => {
  const { userId, userRole, planId, planName, billingCycle, amountPaid, paymentReference, authorizationToken, channel } = params;
  const durationMonths = billingCycle === 'yearly' ? 12 : 1;
  const durationDays = durationMonths * 30;

  let schoolId: string | undefined;

  const subType = SubscriptionType.PAID;

  switch (userRole) {
    case "TEACHER":
    case "STUDENT":
    case "PARENT":
      await UserSubscriptionService.updatePlan({
        userId,
        userType: userRole as UserRole,
        planId,
        type: subType,
        durationDays,
        amountPaid,
        paymentReference,
        note: `Auto-renewal via Paystack (${channel})`,
      });
      break;

    case "ADMIN": {
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: { adminId: userId },
        select: { schoolId: true }
      });
      schoolId = schoolAdmin?.schoolId;

      await UserSubscriptionService.updatePlan({
        userId,
        userType: UserRole.ADMIN,
        planId,
        type: subType,
        durationDays,
        amountPaid,
        paymentReference,
        note: `Auto-renewal via Paystack (${channel})`,
      });

      if (schoolId) {
        await SchoolSubscriptionService.updatePlan({
          schoolId,
          planId,
          type: subType,
          durationDays,
          amountPaid,
          paymentReference,
          note: `Institutional Auto-renewal via Paystack (${channel})`,
          assignedBy: userId,
        });
      }
      break;
    }
  }

  // Log the renewal transaction
  await prisma.transaction.create({
    data: {
      reference: paymentReference,
      amount: amountPaid,
      currency: "NGN",
      status: "SUCCESS",
      paymentMethod: channel,
      authorizationToken,
      paidAt: new Date(),
      schoolId,
      userId,
      userType: userRole as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT",
      plan: planName,
      planId,
      billingCycle,
    }
  });

  // Send renewal receipt email (non-blocking)
  try {
    let userEmail: string | undefined;
    if (userRole === "ADMIN") {
      const admin = await prisma.admin.findUnique({ where: { id: userId }, select: { email: true } });
      userEmail = admin?.email;
    } else {
      const user = await (prisma as unknown as Record<string, { findUnique: (args: { where: { id: string }; select: { email: boolean } }) => Promise<{ email: string } | null> }>)[userRole.toLowerCase()].findUnique({ where: { id: userId }, select: { email: true } });
      userEmail = user?.email;
    }

    if (userEmail) {
      const nextExpiry = new Date();
      nextExpiry.setMonth(nextExpiry.getMonth() + durationMonths);
      await sendPaymentReceiptEmail({
        email: userEmail,
        amount: amountPaid,
        date: new Date(),
        method: channel || 'Card',
        plan: planName,
        expiryDate: nextExpiry,
      });
    }
  } catch (emailError) {
    console.error("[PaymentService] Failed to send renewal receipt email:", emailError);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER: Resolve user from Paystack charge data
// Tries: 1. Metadata fields, 2. authorization_code match in Transaction table,
//        3. Email match across all user tables.
// ─────────────────────────────────────────────────────────────────────────────
const resolveUserFromChargeData = async (data: {
  customer?: { email?: string };
  authorization?: { authorization_code?: string };
  metadata?: { custom_fields?: Array<{ variable_name: string; value: string }> };
}): Promise<{ userId: string; userRole: string; planId: string; planName: string; billingCycle: string } | null> => {
  const email = data.customer?.email;
  const authCode = data.authorization?.authorization_code;
  const customFields = data.metadata?.custom_fields || [];

  // 1. Try metadata (present on the first charge / initial setup)
  const metaUserId = customFields.find(f => f.variable_name === 'user_id')?.value;
  const metaUserRole = customFields.find(f => f.variable_name === 'user_role')?.value;
  const metaPlan = customFields.find(f => f.variable_name === 'plan')?.value;
  const metaBilling = customFields.find(f => f.variable_name === 'billing')?.value;

  if (metaUserId && metaUserRole && metaPlan) {
    try {
      const planId = await getPlanId(metaUserRole, metaPlan);
      return { userId: metaUserId, userRole: metaUserRole.toUpperCase(), planId, planName: metaPlan, billingCycle: metaBilling || 'monthly' };
    } catch {
      console.warn('[Webhook] Could not resolve planId from metadata fields.');
    }
  }

  // 2. Try matching by authorization_code saved in past transactions
  if (authCode) {
    const pastTx = await prisma.transaction.findFirst({
      where: { authorizationToken: authCode },
      orderBy: { createdAt: 'desc' },
    });
    if (pastTx && pastTx.userId && pastTx.planId && pastTx.plan) {
      return {
        userId: pastTx.userId,
        userRole: pastTx.userType!,
        planId: pastTx.planId,
        planName: pastTx.plan,
        billingCycle: pastTx.billingCycle || 'monthly',
      };
    }
  }

  // 3. Fallback: match by email across all user tables
  if (email) {
    const [admin, teacher, student, parent] = await Promise.all([
      prisma.admin.findFirst({ where: { email }, select: { id: true, plan: true, subscriptionPlanId: true, billingCycle: true } }),
      prisma.teacher.findFirst({ where: { email }, select: { id: true, plan: true, subscriptionPlanId: true, billingCycle: true } }),
      prisma.student.findFirst({ where: { email }, select: { id: true, plan: true, subscriptionPlanId: true, billingCycle: true } }),
      prisma.parent.findFirst({ where: { email }, select: { id: true, plan: true, subscriptionPlanId: true, billingCycle: true } }),
    ]);

    const found = admin
      ? { ...admin, role: 'ADMIN' }
      : teacher
        ? { ...teacher, role: 'TEACHER' }
        : student
          ? { ...student, role: 'STUDENT' }
          : parent
            ? { ...parent, role: 'PARENT' }
            : null;

    if (found && found.subscriptionPlanId && found.plan) {
      return {
        userId: found.id,
        userRole: found.role,
        planId: found.subscriptionPlanId,
        planName: found.plan,
        billingCycle: found.billingCycle || 'monthly',
      };
    }
  }

  return null;
};

/**
 * Handle Paystack Webhook Events
 *
 * This is the UNIFIED, single webhook endpoint registered in the Paystack Dashboard.
 * It handles:
 *   1. charge.success → Subscription auto-renewals (via extendSubscriptionOnRenewal)
 *   2. charge.success where paymentType === "SCHOOL_FEES" → School fee payments (via FinanceService)
 *   3. subaccount.update → Subaccount status changes (via FinanceService)
 *
 * Only ONE webhook URL should be registered in Paystack:
 *   Production: https://your-domain.com/api/v1/payment/webhook
 */
export const paystackWebhookService = async (signature: string, payload: {
  event: string;
  data: {
    reference?: string;
    amount?: number;
    channel?: string;
    customer?: { email?: string };
    authorization?: { authorization_code?: string };
    metadata?: {
      custom_fields?: Array<{ variable_name: string; value: string }>;
      paymentType?: string;
    };
    subaccount_code?: string;
    status?: string;
  };
}) => {
  // 1. Verify Paystack HMAC-512 Signature
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(payload)).digest('hex');
  if (hash !== signature) {
    throw new Error('Invalid signature');
  }

  const event = payload.event;
  const data = payload.data;

  // ─── Branch A: charge.success ─────────────────────────────────────────────
  if (event === 'charge.success') {
    const reference = data.reference;
    const amountKobo = data.amount || 0;
    const amountNaira = amountKobo / 100;
    const channel = data.channel || 'card';
    const paymentType = data.metadata?.paymentType;

    if (!reference) {
      console.warn('[Webhook] charge.success received with no reference. Ignoring.');
      return { success: true };
    }

    // ── Branch A-1: School fee payment (delegated to FinanceService) ──────────
    if (paymentType === 'SCHOOL_FEES') {
      console.log(`[Webhook] Delegating SCHOOL_FEES charge.success (ref: ${reference}) to FinanceService.`);
      await FinanceService.verifyPayment(reference);
      return { success: true };
    }

    // ── Branch A-2: Subscription auto-renewal ─────────────────────────────────
    // Idempotency: skip if already processed
    const existing = await prisma.transaction.findUnique({ where: { reference } });
    if (existing) {
      console.log(`[Webhook] Reference ${reference} already recorded. Skipping.`);
      return { success: true };
    }

    // Resolve which user and plan this charge belongs to
    const resolved = await resolveUserFromChargeData(data);

    if (!resolved) {
      console.error(
        `[Webhook] Could not resolve user for charge.success reference: ${reference}, email: ${data.customer?.email}`
      );
      // Return success to Paystack regardless — we don't want Paystack to keep retrying
      // for charges we legitimately cannot map to a user.
      return { success: true };
    }

    const { userId, userRole, planId, planName, billingCycle } = resolved;

    console.log(
      `[Webhook] Processing auto-renewal for user ${userId} (${userRole}), plan: ${planName}, amount: ₦${amountNaira}`
    );

    await extendSubscriptionOnRenewal({
      userId,
      userRole,
      planId,
      planName,
      billingCycle,
      amountPaid: amountNaira,
      paymentReference: reference,
      authorizationToken: data.authorization?.authorization_code,
      channel,
    });

    console.log(`[Webhook] Auto-renewal complete for user ${userId}.`);
    return { success: true };
  }

  // ─── Branch B: subaccount.update ──────────────────────────────────────────
  if (event === 'subaccount.update') {
    const { subaccount_code, status } = data;
    if (subaccount_code && status) {
      console.log(`[Webhook] Subaccount update: ${subaccount_code} → ${status}`);
      await FinanceService.updateSubaccountStatusByCode(subaccount_code, status);
    } else {
      console.warn('[Webhook] subaccount.update received without subaccount_code or status. Ignoring.');
    }
    return { success: true };
  }

  // All other events — acknowledge to Paystack without processing
  console.log(`[Webhook] Unhandled event type: ${event}. Acknowledging without processing.`);
  return { success: true };
};
