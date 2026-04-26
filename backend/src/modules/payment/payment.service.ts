import axios from "axios";
import prisma from "../../config/database";
import { PRICING_PLANS } from "./plans.data";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder";

const getPlanId = (userType: string, plan: string) => {
  const categoryMap: any = {
    'ADMIN': 'schools',
    'TEACHER': 'teachers',
    'STUDENT': 'students',
    'PARENT': 'parents'
  };
  const category = categoryMap[userType.toUpperCase()] || 'schools';
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

    const { status: paystackStatus, amount: paystackAmount, reference: paystackRef, channel, authorization } = response.data.data;
    const authCode = authorization?.authorization_code;

    if (paystackStatus !== "success") {
      throw new Error("Payment was not successful");
    }

    // Calculate subscription end date
    const durationMonths = billingType === 'yearly' ? 12 : 1;
    const isUpgrade = response.data.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'is_upgrade')?.value === 'true';
    const isTrial = response.data.data.metadata?.custom_fields?.find((f: any) => f.variable_name === 'is_trial')?.value === 'true';

    let subscriptionEnd = new Date();
    
    if (isTrial) {
        // Fetch trial days from plans config
        const categoryMap: any = { 'ADMIN': 'schools', 'TEACHER': 'teachers', 'STUDENT': 'students', 'PARENT': 'parents' };
        const category = categoryMap[userRole] || 'schools';
        const planData = PRICING_PLANS.find(p => p.category === category)?.tabs.find(t => t.type.toLowerCase() === plan.toLowerCase());
        const trialDays = planData?.trialDays || 7;
        
        subscriptionEnd.setDate(subscriptionEnd.getDate() + trialDays);
    } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);
    }

    // If it's an upgrade, we might want to preserve the existing end date 
    // OR the user might have paid full price if > 15 days.
    // The frontend logic handles the amount. The backend should respect the 'resetCycle' logic.
    // However, for simplicity and safety, we'll check if the amount paid was the full price.
    // Better: let's rely on the metadata from frontend about whether to reset.
    // Actually, according to the requirements: 
    // < 15 days -> continues from where previous starts from.
    // >= 15 days -> starts from payment point.
    
    // We'll trust the frontend's decision on whether this was a pro-rated upgrade.
    // If it was pro-rated (isUpgrade = true), we should NOT reset the end date if it's already in the future.
    
    const updateData: any = {
        plan,
        planId: getPlanId(userRole, plan),
        subscriptionStatus: "ACTIVE",
        lastPaymentDate: new Date(),
        isTrialActive: isTrial,
        trialUsed: true,
        trialEndsAt: isTrial ? subscriptionEnd : undefined
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

    const planId = getPlanId(userRole, plan);

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


    // Update the corresponding model based on user role
    switch (userRole) {
        case "TEACHER":
            await prisma.teacher.update({ where: { id: userId }, data: updateData });
            break;
        case "STUDENT":
            await prisma.student.update({ where: { id: userId }, data: updateData });
            break;
        case "PARENT":
            await prisma.parent.update({ where: { id: userId }, data: updateData });
            break;
        case "ADMIN": {
            const schoolAdmin = await prisma.schoolAdmin.findFirst({
                where: { adminId: userId },
                select: { schoolId: true }
            });
            
            console.log(`[PaymentService] Admin link check: ${schoolAdmin ? 'Link found: ' + schoolAdmin.schoolId : 'No link found for admin ' + userId}`);
            
            // 1. Update the School record (Primary source for billing dashboard)
            if (schoolAdmin?.schoolId) {
                await prisma.school.update({
                    where: { id: schoolAdmin.schoolId },
                    data: updateData,
                });
                console.log(`[PaymentService] School ${schoolAdmin.schoolId} updated successfully.`);
            }

            // 2. Update the Admin record (Used for top-level auth store plan checks)
            await prisma.admin.update({
                where: { id: userId },
                data: {
                    plan: updateData.plan,
                    subscriptionStatus: updateData.subscriptionStatus,
                    subscriptionEnd: updateData.subscriptionEnd,
                    lastPaymentDate: updateData.lastPaymentDate,
                    trialUsed: updateData.trialUsed,
                    isTrialActive: updateData.isTrialActive,
                }
            });
            console.log(`[PaymentService] Admin record ${userId} updated successfully.`);
            break;
        }
    }

    return response.data.data;
  } catch (error: any) {
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
    };

    if (userRole === 'TEACHER') {
        const classCount = await prisma.classTeacher.count({ where: { teacherId: userId } });
        const studentCount = await prisma.relationshipLink.count({
            where: { linkType: 'TEACHER_STUDENT', status: 'ACTIVE', OR: [{ leftEntityId: userId }, { rightEntityId: userId }] }
        });
        usage.classes = classCount;
        usage.students = studentCount;
    } else if (userRole === 'PARENT') {
        const childCount = await prisma.parentChildLink.count({ where: { parentId: userId, status: 'active' } });
        usage.students = childCount;
    }

    const latestTransaction = transactions[0];

    return {
        subscription: {
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEnd: user.subscriptionEnd,
            isTrialActive: user.isTrialActive,
            lastPaymentDate: user.lastPaymentDate,
            paystackCustomerCode: user.paystackCustomerCode,
            billingCycle: latestTransaction?.billingCycle || 'monthly',
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
