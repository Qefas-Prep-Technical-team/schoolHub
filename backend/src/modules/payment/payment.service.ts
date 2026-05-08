import axios from "axios";
import prisma from "../../config/database";
import { PRICING_PLANS } from "./plans.data";
import { sendPaymentReceiptEmail } from "../auth/auth.service";
import { SubscriptionType, UserRole } from "@prisma/client";
import { SchoolSubscriptionService } from "../subscription/school-subscription.service";
import { UserSubscriptionService } from "../subscription/user-subscription.service";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder";

const getPlanId = async (userType: string, plan: string) => {
  const categoryMap: any = {
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

  // Fallback to constants only if DB record doesn't exist (e.g. during dev)
  const cat = PRICING_PLANS.find(p => p.category === category);
  const tab = cat?.tabs.find(t => t.type.toLowerCase() === plan.toLowerCase());
  return (tab as any)?.id || null;
};

/**
 * Initialize payment with Paystack
 */
export const initializePaymentService = async (params: {
  userId: string;
  amount: number;
  email: string;
  plan: string;
  metadata?: any;
}) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: params.email,
        amount: params.amount * 100, // Paystack works in kobo/cents
        metadata: {
          ...params.metadata,
          userId: params.userId,
          plan: params.plan,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Paystack initialization failed");
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
    const metadataPlan = customFields.find((f: any) => f.variable_name === 'plan')?.value;
    const metadataBilling = customFields.find((f: any) => f.variable_name === 'billing')?.value;
    const isUpgrade = customFields.find((f: any) => f.variable_name === 'is_upgrade')?.value === 'true';
    const isTrial = customFields.find((f: any) => f.variable_name === 'is_trial')?.value === 'true';

    // Prioritize metadata, fallback to provided params (for backward compatibility if needed)
    const verifiedPlan = metadataPlan || plan;
    const verifiedBilling: 'monthly' | 'yearly' = (metadataBilling || billingType) as any;

    if (metadataPlan && plan && metadataPlan.toLowerCase() !== plan.toLowerCase()) {
        console.warn(`[PaymentSecurity] Plan mismatch detected! Request: ${plan}, Metadata: ${metadataPlan}. Using Metadata.`);
    }

    // Calculate subscription end date
    const durationMonths = verifiedBilling === 'yearly' ? 12 : 1;
    let subscriptionEnd = new Date();
    
    if (isTrial) {
        // Fetch trial days from plans config
        const categoryMap: any = { 'ADMIN': 'schools', 'TEACHER': 'teachers', 'STUDENT': 'students', 'PARENT': 'parents' };
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

    const updateData: any = {
        plan: verifiedPlan, // Human readable plan name (e.g. "Growth")
        planId: planId, // UUID of the plan
        subscriptionPlanId: planId, // UUID of the plan (Standardized field)
        subscriptionStatus: "ACTIVE",
        lastPaymentDate: new Date(),
        isTrialActive: isTrial,
        trialUsed: true,
        trialEndsAt: isTrial ? subscriptionEnd : undefined,
        trialPlan: isTrial ? verifiedPlan : undefined, // Requirement: Set trial plan name if trialing
        billingCycle: verifiedBilling
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
            const user = await (prisma as any)[userRole.toLowerCase()].findUnique({
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
            userType: userRole as any,
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
            const user = await (prisma as any)[userRole.toLowerCase()].findUnique({ where: { id: userId }, select: { email: true } });
            userEmail = user?.email;
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
  } catch (error: any) {
    console.error("[PaymentService] Error during verification:", error);
    throw new Error(error.response?.data?.message || "Payment verification failed");
  }
};

/**
 * Fetch consolidated billing data for a user (Student, Teacher, or Parent)
 */
export const getUserBillingService = async (userId: string, role: string, page = 1, limit = 5) => {
    const table = role.toLowerCase();
    const userRole = role.toUpperCase();
    
    // Fetch user with subscription info
    const user = await (prisma as any)[table].findUnique({
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
        }
    });

    if (!user) {
        throw new Error(`User not found for ID: "${userId}" or role mismatch.`);
    }

    const skip = (page - 1) * limit;

    // Determine which field to use for FileMetric based on role
    let fileMetricWhere: any = {};
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
    let usage: any = {
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
    let subscriptionPlan: any = null;
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
                subscriptionPlan = school?.subscriptionPlan;
            }
        } else if (['TEACHER', 'STUDENT', 'PARENT'].includes(userRole)) {
            const profile = await (prisma as any)[table].findUnique({
                where: { id: userId },
                include: { 
                    subscriptionPlan: {
                        include: { featureAccess: { where: { enabled: true }, include: { feature: true } } }
                    } 
                }
            });
            subscriptionPlan = profile?.subscriptionPlan;
        }
    } catch (planError) {
        console.error("[PaymentService] Error fetching subscription plan features:", planError);
    }

    return {
        subscription: {
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEnd: user.subscriptionEnd,
            isTrialActive: user.isTrialActive,
            lastPaymentDate: user.lastPaymentDate,
            paystackCustomerCode: user.paystackCustomerCode,
            billingCycle: user.billingCycle || 'MONTHLY',
            features: subscriptionPlan?.featureAccess?.map((fa: any) => ({
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
        const userId = metadata.find((f: any) => f.variable_name === 'user_id')?.value;
        const userRole = metadata.find((f: any) => f.variable_name === 'user_role')?.value;

        return { userId, userRole };
    } catch (error: any) {
        console.error(`[PaymentService] Error fetching metadata for ref: ${reference}`, error);
        throw new Error("Failed to retrieve transaction metadata");
    }
};
