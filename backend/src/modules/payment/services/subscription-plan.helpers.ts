import prisma, { withRetry } from "../../../config/database";

export type SubscriberRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export const ROLE_CATEGORY: Record<SubscriberRole, string> = {
  ADMIN: "schools",
  TEACHER: "teachers",
  STUDENT: "students",
  PARENT: "parents",
};

/** Admin sub-roles allowed to purchase, change, or downgrade the school's plan. */
export const BILLING_ADMIN_ROLES = ["SCHOOL_OWNER", "PRINCIPAL", "ACCOUNTANT", "SUPER_ADMIN"];

/** ₦100 card-validation charge used to start a free trial. */
export const TRIAL_VALIDATION_CHARGE = 100;

/** Statuses for subscription Transaction rows that are not yet settled. */
export const UNSETTLED_TX_STATUSES = ["INITIATED", "PROCESSING"];

export const normalizeRole = (raw?: string | null): SubscriberRole | null => {
  const upper = (raw || "").toUpperCase();
  return upper === "ADMIN" || upper === "TEACHER" || upper === "STUDENT" || upper === "PARENT"
    ? upper
    : null;
};

export const addMonths = (base: Date, months: number): Date => {
  const d = new Date(base.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
};

/** Resolve the real DB plan UUID for a role + plan type. Never returns a fake id. */
export const getPlanId = async (userType: string, plan: string): Promise<string> => {
  const role = normalizeRole(userType) || "ADMIN";
  const category = ROLE_CATEGORY[role];

  const dbPlan = await prisma.subscriptionPlan.findFirst({
    where: {
      category: { equals: category, mode: "insensitive" },
      type: { equals: plan, mode: "insensitive" },
      isActive: true,
    },
    select: { id: true },
  });
  if (dbPlan) return dbPlan.id;

  throw new Error(
    `No active subscription plan found for category="${category}", type="${plan}". Ensure the plan exists in the database.`,
  );
};

export interface SubscriberSnapshot {
  id: string;
  email: string | null;
  trialUsed: boolean;
  subscriptionEnd: Date | null;
  lastPaymentDate: Date | null;
  subscriptionPlanId: string | null;
  billingCycle: string | null;
}

const subscriberSelect = {
  id: true,
  email: true,
  trialUsed: true,
  subscriptionEnd: true,
  lastPaymentDate: true,
  subscriptionPlanId: true,
  billingCycle: true,
} as const;

/** Typed lookup across the four subscriber tables (no dynamic `prisma[table]` access). */
export const findSubscriber = async (
  role: SubscriberRole,
  where: { id: string } | { email: string },
): Promise<SubscriberSnapshot | null> => {
  switch (role) {
    case "ADMIN":
      return withRetry(() => prisma.admin.findFirst({ where, select: subscriberSelect }), "subscription.findSubscriber.admin");
    case "TEACHER":
      return withRetry(() => prisma.teacher.findFirst({ where, select: subscriberSelect }), "subscription.findSubscriber.teacher");
    case "STUDENT":
      return withRetry(() => prisma.student.findFirst({ where, select: subscriberSelect }), "subscription.findSubscriber.student");
    case "PARENT":
      return withRetry(() => prisma.parent.findFirst({ where, select: subscriberSelect }), "subscription.findSubscriber.parent");
  }
};

/**
 * Resolve the school an admin is acting for. Prefers the explicitly requested school
 * (from the auth token) and only ever returns an ACTIVE SchoolAdmin link.
 */
export const resolveAdminSchoolLink = async (
  adminId: string,
  preferredSchoolId?: string | null,
): Promise<{ schoolId: string; role: string } | null> => {
  if (preferredSchoolId) {
    const preferred = await withRetry(
      () =>
        prisma.schoolAdmin.findFirst({
          where: { adminId, schoolId: preferredSchoolId, active: true },
          select: { schoolId: true, role: true },
        }),
      "subscription.resolveAdminSchoolLink.preferred",
    );
    if (preferred) return { schoolId: preferred.schoolId, role: String(preferred.role) };
  }
  const link = await withRetry(
    () =>
      prisma.schoolAdmin.findFirst({
        where: { adminId, active: true },
        select: { schoolId: true, role: true },
      }),
    "subscription.resolveAdminSchoolLink.any",
  );
  return link ? { schoolId: link.schoolId, role: String(link.role) } : null;
};

/** Throws if the admin is linked to a school but lacks a billing-capable sub-role. */
export const assertBillingAdmin = async (adminId: string, preferredSchoolId?: string | null) => {
  const link = await resolveAdminSchoolLink(adminId, preferredSchoolId);
  if (link && !BILLING_ADMIN_ROLES.includes(link.role)) {
    throw new Error(
      "Forbidden: Only School Owners, Principals, or Accountants can manage the school subscription.",
    );
  }
  return link;
};

