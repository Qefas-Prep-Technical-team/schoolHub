import axios from "axios";
import prisma from "../../config/database";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

/**
 * Service to handle school finance operations
 */
export class FinanceService {
  /**
   * Initialize Paystack Subaccount (Settlement Account)
   */
  static async setupBank(schoolId: string, data: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
  }) {
    try {
      // 1. Create subaccount on Paystack
      let subaccount;
      try {
        const response = await axios.post(
          "https://api.paystack.co/subaccount",
          {
            business_name: data.business_name,
            settlement_bank: data.settlement_bank,
            account_number: data.account_number,
            percentage_charge: data.percentage_charge,
          },
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        subaccount = response.data.data;
      } catch (paystackError: any) {
        const msg = paystackError.response?.data?.message || "";
        if (msg.toLowerCase().includes("account number")) {
          throw new Error("Invalid account number. Please verify and try again.");
        }
        throw paystackError;
      }

      // 2. Save to database in multiple account model
      // Robust status check: use status or active boolean fallback
      let subaccountStatus = subaccount.status;
      if (!subaccountStatus) {
        subaccountStatus = subaccount.active ? "active" : "pending";
      }

      // @ts-ignore - prisma client might not be fully generated yet
      const account = await prisma.settlementAccount.create({
        data: {
          schoolId,
          paystackSubaccountCode: subaccount.subaccount_code,
          paystackSubaccountStatus: subaccountStatus,
          bankName: subaccount.settlement_bank,
          accountNumber: data.account_number,
          accountName: subaccount.business_name,
          percentageCharge: data.percentage_charge,
          isDefault: true
        }
      });

      // 3. Set as default and update others
      // @ts-ignore
      await prisma.settlementAccount.updateMany({
        where: { schoolId, id: { not: account.id } },
        data: { isDefault: false }
      });

      return account;
    } catch (error: any) {
      console.error("[FinanceService] Setup Bank Error:", error.message);
      throw error;
    }
  }

  /**
   * Helper to get settlement status details
   */
  static getSchoolPaymentStatus(school: any) {
    const status = school.paystackSubaccountStatus || "pending";
    
    const statusMap: Record<string, { label: string, color: string, message: string }> = {
      active: {
        label: "Active Account",
        color: "green",
        message: "Payments are enabled and processing normally."
      },
      pending: {
        label: "Awaiting Verification",
        color: "yellow",
        message: "Your bank details are being verified by Paystack typically within 24 hours."
      },
      unverified: {
        label: "Unverified Account",
        color: "red",
        message: "Bank details failed verification. Please review and update your records."
      },
      none: {
        label: "No Settlement Account",
        color: "slate",
        message: "Connect a bank account to enable automated fee disbursements."
      }
    };

    return {
      status,
      ...(statusMap[status] || statusMap.pending)
    };
  }

  /**
   * Initialize a fee payment
   */
  static async initializePayment(params: {
    schoolId: string;
    studentId: string;
    parentId: string;
    email: string;
    amount: number;
    metadata: any;
  }) {
    try {
      // 1. Check if school is active for payments
      const school = await prisma.school.findUnique({
        where: { id: params.schoolId },
        // @ts-ignore
        include: { settlementAccounts: { where: { isDefault: true } } }
      });

      // @ts-ignore
      const activeAccount = school?.settlementAccounts?.[0] || await prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, paystackSubaccountStatus: "active" } });

      if (!activeAccount || activeAccount.paystackSubaccountStatus !== "active") {
        throw new Error("PAYMENT_GATE_LOCKED: School settlement account is not active. Please complete bank verification.");
      }

      // 4. Initialize Paystack Transaction
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: params.email,
          amount: params.amount * 100, // Kobo
          // @ts-ignore
          subaccount: activeAccount.paystackSubaccountCode,
          metadata: {
            ...params.metadata,
            schoolId: params.schoolId,
            studentId: params.studentId,
            parentId: params.parentId,
            paymentType: "SCHOOL_FEES",
            // @ts-ignore
            settlementAccountId: activeAccount.id
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Pre-create the payment record as PENDING
      await prisma.payment.create({
        data: {
          paymentReference: response.data.data.reference,
          schoolId: params.schoolId,
          studentId: params.studentId,
          parentId: params.parentId,
          amount: params.amount,
          term: params.metadata.term || "UNKNOWN",
          session: params.metadata.session || "UNKNOWN",
          paymentType: "SCHOOL_FEES",
          status: "PENDING",
          // @ts-ignore
          settlementAccountId: activeAccount.id
        }
      });

      return response.data.data;
    } catch (error: any) {
      console.error("[FinanceService] Initialize Payment Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Payment initialization failed");
    }
  }

  /**
   * Verify a fee payment (can be called from webhook or client)
   */
  static async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = response.data.data;
      if (data.status === "success") {
        const { schoolId, studentId, parentId, paymentType } = data.metadata;

        // Update Payment status
        const payment = await prisma.payment.update({
          where: { paymentReference: reference },
          data: {
            status: "SUCCESS",
            paidAt: new Date(data.paid_at),
            paymentMethod: data.channel,
          }
        });

        // Create Transaction History record
        await prisma.transactionHistory.create({
          data: {
            schoolId: schoolId,
            paymentId: payment.id,
            transactionReference: reference,
            amount: data.amount / 100,
            gatewayResponse: data,
            channel: data.channel,
            currency: data.currency,
            status: "SUCCESS",
            paidAt: new Date(data.paid_at),
          }
        });

        return { success: true, payment };
      }

      return { success: false, status: data.status };
    } catch (error: any) {
      console.error("[FinanceService] Verify Payment Error:", error.response?.data || error.message);
      throw new Error("Verification failed");
    }
  }

  /**
   * Get analytics for school admin
   */
  static async getSchoolAnalytics(schoolId: string) {
    try {
      // 1. Check for legacy data and migrate if necessary (Migration Bridge)
      const schoolData = await prisma.school.findUnique({
        where: { id: schoolId },
        // @ts-ignore
        include: { settlementAccounts: true }
      });

      // @ts-ignore
      if (schoolData && schoolData.settlementAccounts.length === 0 && schoolData.paystackSubaccountCode) {
        console.log(`[FinanceService] Safety Migration: Moving bank data for school ${schoolId} to new model...`);
        // @ts-ignore
        await prisma.settlementAccount.create({
          data: {
            schoolId,
            // @ts-ignore
            paystackSubaccountCode: schoolData.paystackSubaccountCode,
            // @ts-ignore
            paystackSubaccountStatus: schoolData.paystackSubaccountStatus,
            // @ts-ignore
            bankName: schoolData.bankName,
            // @ts-ignore
            accountNumber: schoolData.accountNumber,
            // @ts-ignore
            accountName: schoolData.accountName,
            // @ts-ignore
            percentageCharge: schoolData.percentageCharge,
            isDefault: true
          }
        });

        // Clear legacy fields to prevent re-migration loop
        await prisma.school.update({
          where: { id: schoolId },
          data: {
            paystackSubaccountCode: null,
            paystackSubaccountStatus: null,
            bankName: null,
            accountNumber: null,
            accountName: null
          }
        });
        console.log(`[FinanceService] Legacy migration complete and cleared for ${schoolId}`);
      }

      const [transactions, settlementAccounts] = await Promise.all([
        prisma.transactionHistory.findMany({
          where: { schoolId },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            payment: {
              include: { student: { select: { name: true } } }
            }
          }
        }),
        // @ts-ignore
        prisma.settlementAccount.findMany({
          where: { schoolId },
          include: {
            transactionHistories: {
              where: { status: "SUCCESS" },
              select: { amount: true }
            }
          }
        })
      ]);

      // Calculate total revenue
      const totalRevenue = await prisma.transactionHistory.aggregate({
        where: { schoolId, status: "SUCCESS" },
        _sum: { amount: true }
      });

      // Map accounts with their individual totals for ATM Display
      const accounts = settlementAccounts.map((acc: any) => ({
        id: acc.id,
        bankName: acc.bankName,
        accountName: acc.accountName,
        accountNumber: acc.accountNumber,
        status: acc.paystackSubaccountStatus,
        isDefault: acc.isDefault,
        totalSettled: acc.transactionHistories.reduce((sum: number, t: any) => sum + t.amount, 0),
        paystackSubaccountCode: acc.paystackSubaccountCode
      }));

      // Overall verification logic
      const overallStatusValue = accounts.length === 0 ? "none" :
                            accounts.some(a => a.status === "active") ? "active" : 
                            accounts.some(a => a.status === "pending") ? "pending" : "unverified";

      return {
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingRevenue: 0,
        activePayerCount: 0,
        averageTransaction: 0,
        recentTransactions: transactions.map(t => ({
          id: t.id,
          amount: t.amount,
          createdAt: t.createdAt,
          paymentReference: t.transactionReference,
          student: t.payment?.student,
          paymentType: t.payment?.paymentType
        })),
        paymentStatus: this.getSchoolPaymentStatus({ paystackSubaccountStatus: overallStatusValue }),
        accounts,
        isVerified: overallStatusValue === "active"
      };
    } catch (error: any) {
      console.error("[FinanceService] Analytics Error:", error.message);
      throw error;
    }
  }

  /**
   * Get list of supported banks from Paystack
   */
  static async listBanks() {
    try {
      const response = await axios.get("https://api.paystack.co/bank?country=nigeria", {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
      });
      return response.data.data;
    } catch (error: any) {
      console.error("[FinanceService] List Banks Error:", error.message);
      throw new Error("Failed to fetch banks list");
    }
  }

  /**
   * Get all transactions across the platform (Super Admin)
   */
  static async getGlobalTransactions() {
    try {
      const transactions = await prisma.transactionHistory.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          school: { select: { name: true, schoolCode: true } },
          payment: {
            include: {
              student: { select: { name: true, studentCode: true } },
              parent: { select: { fullName: true } }
            }
          }
        }
      });

      return transactions;
    } catch (error: any) {
      console.error("[FinanceService] Get Global Transactions Error:", error.message);
      throw new Error("Failed to fetch global transactions");
    }
  }

  /**
   * Update subaccount status from webhook
   */
  static async updateSubaccountStatusByCode(subaccountCode: string, status: string) {
    try {
      // @ts-ignore
      await prisma.settlementAccount.updateMany({
        where: { paystackSubaccountCode: subaccountCode },
        data: { paystackSubaccountStatus: status }
      });
      console.log(`[FinanceService] SettlementAccount ${subaccountCode} updated to ${status}`);
    } catch (error: any) {
      console.error("[FinanceService] Update Subaccount Status Error:", error.message);
    }
  }

  /**
   * Remove settlement bank details from a school
   */
  static async removeSubaccount(accountId: string) {
    try {
      // 1. Fetch current subaccount details
      // @ts-ignore
      const account = await prisma.settlementAccount.findUnique({
        where: { id: accountId },
        select: { id: true, paystackSubaccountCode: true }
      });

      if (!account) throw new Error("Account information not found");

      // 2. If it exists on Paystack, deactivate it
      if (account.paystackSubaccountCode) {
        try {
          await axios.put(
            `https://api.paystack.co/subaccount/${account.paystackSubaccountCode}`,
            { active: false },
            {
              headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
            }
          );
        } catch (apiError: any) {
          console.warn("[FinanceService] Paystack Deactivation Warning:", apiError.response?.data || apiError.message);
        }
      }

      // 3. Delete record
      // @ts-ignore
      await prisma.settlementAccount.delete({
        where: { id: accountId }
      });
      
      return { success: true, message: "Settlement account removed" };
    } catch (error: any) {
      console.error("[FinanceService] Remove Subaccount Error:", error.message);
      throw new Error(error.message || "Failed to remove settlement account");
    }
  }

  /**
   * Manually sync subaccount status from Paystack
   */
  static async syncSubaccountStatus(schoolId: string, accountId?: string) {
    try {
      // 1. Determine which subaccount code to sync
      let subaccountCode: string | null = null;
      
      if (accountId) {
        // @ts-ignore
        const acc = await prisma.settlementAccount.findUnique({ where: { id: accountId } });
        subaccountCode = acc?.paystackSubaccountCode || null;
      } else {
        // Fallback to default
        // @ts-ignore
        const acc = await prisma.settlementAccount.findFirst({ where: { schoolId, isDefault: true } });
        subaccountCode = acc?.paystackSubaccountCode || null;
      }

      if (!subaccountCode) {
        throw new Error("No linked Paystack subaccount found to sync.");
      }

      const response = await axios.get(
        `https://api.paystack.co/subaccount/${subaccountCode}`,
        {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        }
      );

      const subaccData = response.data.data;
      let status = subaccData.status;

      // Fallback: If status field isn't explicitly provided but account is active
      if (!status) {
        status = subaccData.active ? "active" : "pending";
      }
      
      // 2. Update status in DB
      // @ts-ignore
      await prisma.settlementAccount.updateMany({
        where: { paystackSubaccountCode: subaccountCode },
        data: { paystackSubaccountStatus: status }
      });

      return { success: true, status, message: `Account status synced: ${status}` };
    } catch (error: any) {
      console.error("[FinanceService] Sync Subaccount Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to sync subaccount status");
    }
  }
}
