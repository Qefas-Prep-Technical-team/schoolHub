import prisma, { withRetry } from "../../../config/database";
import { createNotification } from "../../notification/notification.service";
import { resolveSchoolId } from "./school-access.service";
import { getSchoolStatsService } from "./school-dashboard.service";
export {
  getSchoolLandingPageService,
  getSchoolLandingPageBySubdomainService,
  updateSchoolLandingPageService,
} from "./school-landing.service";

/**
 * Fetch consolidated billing data for a school
 */
export const getSchoolBillingService = async (
  schoolId: string,
  page = 1,
  limit = 5,
) => {
  const school = await withRetry(
    () =>
      prisma.school.findFirst({
        where: {
          OR: [{ id: schoolId }, { tenantId: schoolId }],
        },
        select: {
          id: true,
          plan: true,
          planId: true,
          subscriptionStatus: true,
          subscriptionEnd: true,
          isTrialActive: true,
          lastPaymentDate: true,
          paystackCustomerCode: true,
          billingCycle: true,
          subscriptionPlanId: true,
        },
      }),
    "school.getSchoolBillingService.findSchool",
  );

  if (!school) {
    throw new Error(
      `School not found for ID: "${schoolId}". Billing data cannot be fetched.`,
    );
  }

  const resolvedId = school.id;
  const skip = (page - 1) * limit;

  const [
    stats,
    transactions,
    totalTransactions,
    storageMetric,
    absoluteLatestTransaction,
    pendingDowngrade,
  ] = await Promise.all([
    getSchoolStatsService(resolvedId),
    withRetry(
      () =>
        prisma.transaction.findMany({
          where: { schoolId: resolvedId, NOT: { status: "PENDING_DOWNGRADE" } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      "school.getSchoolBillingService.transactions",
    ),
    withRetry(
      () =>
        prisma.transaction.count({
          where: { schoolId: resolvedId, NOT: { status: "PENDING_DOWNGRADE" } },
        }),
      "school.getSchoolBillingService.count",
    ),
    withRetry(
      () =>
        prisma.fileMetric.aggregate({
          where: { schoolId: resolvedId },
          _sum: { fileSize: true },
        }),
      "school.getSchoolBillingService.storage",
    ),
    withRetry(
      () =>
        prisma.transaction.findFirst({
          where: { schoolId: resolvedId, NOT: { status: "PENDING_DOWNGRADE" } },
          orderBy: { createdAt: "desc" },
        }),
      "school.getSchoolBillingService.latestTransaction",
    ),
    withRetry(
      () =>
        prisma.transaction.findFirst({
          where: { schoolId: resolvedId, status: "PENDING_DOWNGRADE" },
          orderBy: { createdAt: "desc" },
          select: { plan: true, billingCycle: true, createdAt: true },
        }),
      "school.getSchoolBillingService.pendingDowngrade",
    ),
  ]);

  const subscriptionPlan = school.subscriptionPlanId
    ? await withRetry(
      () =>
        prisma.subscriptionPlan.findUnique({
          where: { id: school.subscriptionPlanId! },
        }),
      "school.getSchoolBillingService.plan",
    )
    : null;

  const isExpired =
    school.subscriptionEnd && new Date(school.subscriptionEnd) < new Date();

  return {
    subscription: {
      plan: isExpired
        ? "FREE"
        : school.isTrialActive && subscriptionPlan
          ? subscriptionPlan.type
          : school.plan,
      planId: school.planId,
      subscriptionStatus: school.isTrialActive
        ? "TRIAL"
        : isExpired
          ? "EXPIRED"
          : school.subscriptionStatus,
      subscriptionEnd: school.subscriptionEnd,
      isTrialActive: school.isTrialActive,
      lastPaymentDate: school.lastPaymentDate,
      paystackCustomerCode: school.paystackCustomerCode,
      subscriptionPlanId: school.subscriptionPlanId,
      billingCycle:
        school.billingCycle ||
        absoluteLatestTransaction?.billingCycle ||
        "monthly",
      amount: isExpired
        ? 0
        : school.billingCycle === "yearly"
          ? subscriptionPlan?.yearlyPrice || 0
          : subscriptionPlan?.monthlyPrice || 0,
      features: isExpired ? [] : subscriptionPlan?.features || [],
    },
    usage: {
      ...stats,
      storageBytes: storageMetric._sum.fileSize
        ? Number(storageMetric._sum.fileSize)
        : 0,
    },
    transactions,
    totalTransactions,
    pendingDowngrade: pendingDowngrade
      ? {
        plan: pendingDowngrade.plan,
        billingCycle: pendingDowngrade.billingCycle,
        scheduledAt: pendingDowngrade.createdAt,
      }
      : null,
  };
};

export interface SubmitInquiryInput {
  subdomain: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const submitInquiryService = async (input: SubmitInquiryInput) => {
  const school = await withRetry(
    () =>
      prisma.school.findFirst({
        where: { subdomain: input.subdomain },
      }),
    "school.submitInquiryService.findSchool",
  );

  if (!school) return null;

  const inquiry = await withRetry(
    () =>
      prisma.inquiry.create({
        data: {
          schoolId: school.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          subject: input.subject,
          message: input.message,
          status: "UNREAD",
        },
      }),
    "school.submitInquiryService.createInquiry",
  );

  await createNotification({
    recipientType: "SCHOOL",
    recipientId: school.id,
    type: "GENERAL",
    title: "New Website Inquiry",
    message: `You have a new inquiry from ${input.name} (${input.email}).`,
    link: "/dashboard/admin/inquiries",
  });

  return inquiry;
};

export const getInquiriesService = async (
  schoolId: string,
  page = 1,
  limit = 10,
) => {
  const resolvedId = (await resolveSchoolId(schoolId)) || schoolId;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    withRetry(
      () =>
        prisma.inquiry.findMany({
          where: { schoolId: resolvedId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      "school.getInquiriesService.findMany",
    ),
    withRetry(
      () =>
        prisma.inquiry.count({
          where: { schoolId: resolvedId },
        }),
      "school.getInquiriesService.count",
    ),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
