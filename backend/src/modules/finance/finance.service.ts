import prisma from "../../config/database";
import { getPaymentGateway } from "../payment/gateway.factory";

/**
 * Service to handle school finance operations.
 *
 * All gateway calls are routed through getPaymentGateway() so that
 * flipping PAYMENT_GATEWAY=flutterwave instantly switches the provider
 * for bank setup, fee collection, and settlement syncs.
 */
export class FinanceService {
  /**
   * Create a Settlement Subaccount via the active gateway.
   * Stores Paystack-specific fields for backward compat and FLW fields for new schools.
   */
  static async setupBank(schoolId: string, data: {
    business_name: string;
    settlement_bank: string;       // bank code
    account_number: string;
    percentage_charge: number;
  }) {
    try {
      const gateway = getPaymentGateway();

      const sub = await gateway.createSubaccount({
        schoolId,
        businessName: data.business_name,
        bankCode: data.settlement_bank,
        accountNumber: data.account_number,
        splitPercentage: data.percentage_charge,
      });

      const isFlw = gateway.name === 'FLUTTERWAVE';

      // @ts-ignore - prisma client might not be fully generated yet
      const account = await prisma.settlementAccount.create({
        data: {
          schoolId,
          // Paystack fields (preserved for backward compat)
          paystackSubaccountCode: isFlw ? undefined : sub.code,
          paystackSubaccountStatus: isFlw ? 'pending' : sub.status,
          // Flutterwave fields
          flwSubaccountId: isFlw ? sub.id : undefined,
          flwSubaccountCode: isFlw ? sub.code : undefined,
          flwAccountStatus: isFlw ? sub.status : undefined,
          // Shared
          bankName: data.settlement_bank,
          accountNumber: data.account_number,
          accountName: data.business_name,
          percentageCharge: data.percentage_charge,
          isDefault: true,
        }
      });

      // Set as default and clear all other accounts
      // @ts-ignore
      await prisma.settlementAccount.updateMany({
        where: { schoolId, id: { not: account.id } },
        data: { isDefault: false }
      });

      return account;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Setup Bank Error:", err.message);
      // Surface friendly message for account number failures
      if (err.message?.toLowerCase().includes("account number")) {
        throw new Error("Invalid account number. Please verify and try again.");
      }
      throw error;
    }
  }

  /**
   * Helper to get settlement status details for the UI.
   * Gateway-agnostic: reads the best available status field.
   */
  static getSchoolPaymentStatus(school: { paystackSubaccountStatus?: string; flwAccountStatus?: string }) {
    const status = school.flwAccountStatus || school.paystackSubaccountStatus || "pending";

    const statusMap: Record<string, { label: string, color: string, message: string }> = {
      active: {
        label: "Active Account",
        color: "green",
        message: "Payments are enabled and processing normally."
      },
      pending: {
        label: "Awaiting Verification",
        color: "yellow",
        message: "Your bank details are being verified — typically within 24 hours."
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
   * Initialize a school fee payment via the active gateway.
   */
  static async initializePayment(params: {
    schoolId: string;
    studentId: string;
    parentId: string;
    email: string;
    amount: number;
    metadata: Record<string, unknown>;
  }) {
    try {
      const gateway = getPaymentGateway();

      // Fetch the active settlement account for this school
      // @ts-ignore
      const school = await prisma.school.findUnique({
        where: { id: params.schoolId },
        // @ts-ignore
        include: { settlementAccounts: { where: { isDefault: true } } }
      });

      const isFlw = gateway.name === 'FLUTTERWAVE';

      // @ts-ignore
      let activeAccount = school?.settlementAccounts?.[0];
      if (!activeAccount) {
        // @ts-ignore
        activeAccount = isFlw
          // @ts-ignore
          ? await prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, flwAccountStatus: 'active' } })
          // @ts-ignore
          : await prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, paystackSubaccountStatus: 'active' } });
      }

      const accountStatus = isFlw ? activeAccount?.flwAccountStatus : activeAccount?.paystackSubaccountStatus;

      if (!activeAccount || accountStatus !== 'active') {
        throw new Error("PAYMENT_GATE_LOCKED: School settlement account is not active. Please complete bank verification.");
      }

      // Determine the correct subaccount code / ID for split payments
      const subaccountCode: string = (isFlw
        ? activeAccount.flwSubaccountId || activeAccount.flwSubaccountCode
        : activeAccount.paystackSubaccountCode) ?? '';

      const result = await gateway.initialize({
        userId: params.parentId,
        email: params.email,
        amount: params.amount,
        plan: 'SCHOOL_FEES',
        metadata: {
          ...params.metadata,
          schoolId: params.schoolId,
          studentId: params.studentId,
          parentId: params.parentId,
          paymentType: 'SCHOOL_FEES',
          settlementAccountId: activeAccount.id,
          subaccountCode, // adapter picks this up from metadata for split routing if needed
        },
      });

      // Pre-create the payment record as PENDING
      await prisma.payment.create({
        data: {
          paymentReference: result.txRef,
          schoolId: params.schoolId,
          studentId: params.studentId,
          parentId: params.parentId,
          amount: params.amount,
          term: (params.metadata.term as string) || "UNKNOWN",
          session: (params.metadata.session as string) || "UNKNOWN",
          paymentType: "SCHOOL_FEES",
          status: "PENDING",
          // @ts-ignore
          settlementAccountId: activeAccount.id
        }
      });

      return {
        authorization_url: result.checkoutUrl,
        reference: result.txRef,
        access_code: result.accessCode,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("[FinanceService] Initialize Payment Error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Payment initialization failed");
    }
  }

  /**
   * Verify a school fee payment (called from webhook or client).
   * Gateway-agnostic: uses the stored paymentReference to look up the gateway and verify.
   */
  static async verifyPayment(reference: string, flwTransactionId?: string) {
    try {
      const gateway = getPaymentGateway();
      const verified = await gateway.verify(reference, flwTransactionId);

      if (verified.success) {
        const paymentMeta = verified.meta as Record<string, unknown>;
        const schoolId = paymentMeta['schoolId'] as string | undefined;
        const studentId = paymentMeta['studentId'] as string | undefined;
        const parentId = paymentMeta['parentId'] as string | undefined;

        // Update Payment status
        const payment = await prisma.payment.update({
          where: { paymentReference: reference },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
            paymentMethod: verified.channel,
          }
        });

        // Create Transaction History record
        await prisma.transactionHistory.create({
          data: {
            schoolId: schoolId || payment.schoolId,
            paymentId: payment.id,
            transactionReference: reference,
            amount: verified.amountNaira,
            gatewayResponse: { gateway: verified.gateway, gatewayRef: verified.gatewayRef },
            channel: verified.channel,
            currency: "NGN",
            status: "SUCCESS",
            paidAt: new Date(),
          }
        });

        return { success: true, payment };
      }

      return { success: false, status: 'failed' };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Verify Payment Error:", err.message);
      throw new Error("Verification failed");
    }
  }

  /**
   * Get analytics for school admin.
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
            paystackSubaccountStatus: "pending",
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

      // Map accounts — surface the best available status (FLW or Paystack)
      const accounts = settlementAccounts.map((acc: Record<string, unknown>) => ({
        id: acc.id,
        bankName: acc.bankName,
        accountName: acc.accountName,
        accountNumber: acc.accountNumber,
        // Show the most up-to-date status regardless of gateway
        status: (acc.flwAccountStatus as string) || (acc.paystackSubaccountStatus as string) || 'pending',
        isDefault: acc.isDefault,
        totalSettled: (acc.transactionHistories as Array<{ amount: number }>).reduce((sum, t) => sum + t.amount, 0),
        paystackSubaccountCode: acc.paystackSubaccountCode,
        flwSubaccountCode: acc.flwSubaccountCode,
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
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Analytics Error:", err.message);
      throw error;
    }
  }

  /**
   * Return the list of supported banks from the active gateway.
   */
  static async listBanks() {
    const gateway = getPaymentGateway();
    return gateway.listBanks('NG');
  }

  /**
   * Get all transactions across the platform (Super Admin).
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
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Get Global Transactions Error:", err.message);
      throw new Error("Failed to fetch global transactions");
    }
  }

  /**
   * Update subaccount status from webhook (called by paystackWebhookService).
   * Writes to both Paystack and FLW status columns to stay consistent.
   */
  static async updateSubaccountStatusByCode(subaccountCode: string, status: string) {
    try {
      // Try Paystack column first (existing schools)
      // @ts-ignore
      const psCount = await prisma.settlementAccount.count({
        where: { paystackSubaccountCode: subaccountCode }
      });

      if (psCount > 0) {
        // @ts-ignore
        await prisma.settlementAccount.updateMany({
          where: { paystackSubaccountCode: subaccountCode },
          data: { paystackSubaccountStatus: status }
        });
      } else {
        // Try FLW column
        // @ts-ignore
        await prisma.settlementAccount.updateMany({
          where: { flwSubaccountCode: subaccountCode },
          data: { flwAccountStatus: status }
        });
      }

      console.log(`[FinanceService] SettlementAccount ${subaccountCode} updated to ${status}`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Update Subaccount Status Error:", err.message);
    }
  }

  /**
   * Remove settlement bank details from a school.
   */
  static async removeSubaccount(accountId: string) {
    try {
      // @ts-ignore
      const account = await prisma.settlementAccount.findUnique({
        where: { id: accountId },
        // @ts-ignore
        select: { id: true, paystackSubaccountCode: true, flwSubaccountCode: true }
      });

      if (!account) throw new Error("Account information not found");

      // Best-effort deactivation on the active gateway (non-fatal if it fails)
      try {
        const gateway = getPaymentGateway();
        const codeOrId = account.flwSubaccountCode || account.paystackSubaccountCode;
        if (codeOrId) {
          // Sync to confirm it's still there, then let it naturally expire
          await gateway.syncSubaccount(codeOrId).catch(() => {});
        }
      } catch {
        // Non-fatal — proceed with DB deletion regardless
      }

      // @ts-ignore
      await prisma.settlementAccount.delete({ where: { id: accountId } });

      return { success: true, message: "Settlement account removed" };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Remove Subaccount Error:", err.message);
      throw new Error(err.message || "Failed to remove settlement account");
    }
  }

  /**
   * Manually sync subaccount status from the active gateway.
   */
  static async syncSubaccountStatus(schoolId: string, accountId?: string) {
    try {
      const gateway = getPaymentGateway();
      const isFlw = gateway.name === 'FLUTTERWAVE';

      // Resolve which subaccount code/ID to sync
      let subaccountCodeOrId: string | null = null;
      let dbAccountId: string | null = null;

      if (accountId) {
        // @ts-ignore
        const acc = await prisma.settlementAccount.findUnique({ where: { id: accountId } });
        subaccountCodeOrId = isFlw
          ? acc?.flwSubaccountId || acc?.flwSubaccountCode || null
          : acc?.paystackSubaccountCode || null;
        dbAccountId = acc?.id || null;
      } else {
        // @ts-ignore
        const acc = await prisma.settlementAccount.findFirst({ where: { schoolId, isDefault: true } });
        subaccountCodeOrId = isFlw
          ? acc?.flwSubaccountId || acc?.flwSubaccountCode || null
          : acc?.paystackSubaccountCode || null;
        dbAccountId = acc?.id || null;
      }

      if (!subaccountCodeOrId) {
        throw new Error("No linked gateway subaccount found to sync.");
      }

      const synced = await gateway.syncSubaccount(subaccountCodeOrId);

      // Write back to the correct column
      if (dbAccountId) {
        // @ts-ignore
        await prisma.settlementAccount.update({
          where: { id: dbAccountId },
          data: isFlw
            ? { flwAccountStatus: synced.status }
            : { paystackSubaccountStatus: synced.status }
        });
      }

      return { success: true, status: synced.status, message: `Account status synced: ${synced.status}` };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error("[FinanceService] Sync Subaccount Error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Failed to sync subaccount status");
    }
  }
}
