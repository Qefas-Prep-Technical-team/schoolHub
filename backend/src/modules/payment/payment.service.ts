import axios from "axios";
import prisma from "../../config/database";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder";

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
  userRole: string,
  plan: string,
  billingType: 'monthly' | 'yearly'
) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status: paystackStatus, amount: paystackAmount, reference: paystackRef, channel } = response.data.data;

    if (paystackStatus !== "success") {
      throw new Error("Payment was not successful");
    }

    // Calculate subscription end date
    const durationMonths = billingType === 'yearly' ? 12 : 1;
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);

    // Save transaction record
    await prisma.transaction.create({
        data: {
            reference: paystackRef,
            amount: paystackAmount / 100,
            status: "SUCCESS",
            paymentMethod: channel,
            userId,
            userType: userRole,
            plan,
            billingCycle: billingType,
        }
    });

    const updateData = {
        plan,
        subscriptionStatus: "ACTIVE",
        subscriptionEnd,
        lastPaymentDate: new Date(),
    };

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
            if (schoolAdmin?.schoolId) {
                await prisma.school.update({
                    where: { id: schoolAdmin.schoolId },
                    data: updateData,
                });
            }
            break;
        }
    }

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Payment verification failed");
  }
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
