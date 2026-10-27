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
  static async setupBank(
    schoolId: string,
    data: {
      business_name: string;
      settlement_bank: string;       // bank code
      bank_name?: string;            // human readable bank name
      account_number: string;
      percentage_charge: number;
    },
    userContext?: {
      userId?: string;
      userName?: string;
      userEmail?: string;
      userRole?: string;
    }
  ) {
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
      const resolvedBankName = data.bank_name || data.settlement_bank;

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
          bankName: resolvedBankName,
          bankCode: data.settlement_bank,
          accountNumber: data.account_number,
          accountName: data.business_name,
          percentageCharge: data.percentage_charge,
          isDefault: true,
          addedBy: userContext?.userId,
          addedByName: userContext?.userName,
          addedByRole: userContext?.userRole,
        }
      });

      // Set as default and clear all other accounts
      await prisma.settlementAccount.updateMany({
        where: { schoolId, id: { not: account.id } },
        data: { isDefault: false }
      });

      // Record Audit Process in DB: who added it, when, what was added
      await prisma.bankAccountAudit.create({
        data: {
          schoolId,
          settlementAccountId: account.id,
          action: "ACCOUNT_ADDED",
          bankName: resolvedBankName,
          bankCode: data.settlement_bank,
          accountNumber: data.account_number,
          accountName: data.business_name,
          userId: userContext?.userId,
          userName: userContext?.userName,
          userEmail: userContext?.userEmail,
          userRole: userContext?.userRole,
          gateway: gateway.name,
          details: {
            subaccountCode: sub.code,
            percentageCharge: data.percentage_charge,
            status: sub.status,
          }
        }
      });

      // Update School record
      await prisma.school.update({
        where: { id: schoolId },
        data: {
          accountName: data.business_name,
          accountNumber: data.account_number,
          bankName: data.settlement_bank,
          paystackSubaccountCode: isFlw ? undefined : sub.code,
          paystackSubaccountStatus: isFlw ? 'active' : sub.status,
          percentageCharge: data.percentage_charge,
        }
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
   * Resolve an account number against a bank code using the active gateway.
   */
  static async resolveAccount(accountNumber: string, bankCode: string) {
    const gateway = getPaymentGateway();
    if (typeof gateway.resolveAccount === 'function') {
      return await gateway.resolveAccount(accountNumber, bankCode);
    }
    throw new Error("Account resolution not supported by current gateway");
  }

  /**
   * Initiate transcript or graduated student session portal access payment.
   */
  static async initiateTranscriptPayment(params: {
    schoolId: string;
    studentId: string;
    sessionId?: string;
    amount?: number;
    email: string;
    name?: string;
    parentId?: string;
  }) {
    const gateway = getPaymentGateway();
    const school = await prisma.school.findUnique({
      where: { id: params.schoolId },
      include: {
        settlementAccounts: { where: { isDefault: true } },
        settings: true,
      }
    });

    if (!school) {
      throw new Error("School not found");
    }

    const configuredFee = (school.settings as any)?.transcriptFee;
    const feeAmount = params.amount && params.amount > 0 ? params.amount : (configuredFee && configuredFee > 0 ? configuredFee : 5000);

    const isFlw = gateway.name === 'FLUTTERWAVE';
    let activeAccount = (school.settlementAccounts?.[0] as any) || null;
    if (!activeAccount) {
      activeAccount = isFlw
        ? await prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, flwAccountStatus: 'active' } })
        : await prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, paystackSubaccountStatus: 'active' } });
    }

    const subaccountCode: string = (isFlw
      ? activeAccount?.flwSubaccountId || activeAccount?.flwSubaccountCode
      : activeAccount?.paystackSubaccountCode) ?? '';

    const student = await prisma.student.findUnique({
      where: { id: params.studentId },
      include: { parentLinks: true }
    });

    const parentId = params.parentId || student?.parentLinks?.[0]?.parentId || "";

    const result = await gateway.initialize({
      userId: parentId || student?.id || "student-guest",
      email: params.email || student?.email || "student@example.com",
      amount: feeAmount,
      plan: 'TRANSCRIPT',
      metadata: {
        schoolId: params.schoolId,
        studentId: params.studentId,
        sessionId: params.sessionId || "All Sessions",
        paymentType: 'TRANSCRIPT',
        subaccountCode,
        name: params.name || student?.name || "Student",
      }
    });

    await prisma.payment.create({
      data: {
        paymentReference: result.txRef,
        schoolId: params.schoolId,
        studentId: params.studentId,
        parentId: parentId || (await prisma.parent.findFirst())?.id || "",
        amount: feeAmount,
        term: "All Terms",
        session: params.sessionId || "All Sessions",
        paymentType: "TRANSCRIPT",
        status: "PENDING",
        settlementAccountId: activeAccount?.id || null,
      }
    });

    return {
      checkoutUrl: result.checkoutUrl,
      paymentReference: result.txRef,
      amount: feeAmount,
      settlementAccount: activeAccount ? {
        bankName: activeAccount.bankName,
        accountNumber: activeAccount.accountNumber,
        accountName: activeAccount.accountName,
      } : null,
    };
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

      // Calculate total revenue, pending revenue, and counts
      const [totalRevenue, pendingRevenue, successfulCount, distinctStudents, categoryGroups, recentSuccessTx] = await Promise.all([
        prisma.transactionHistory.aggregate({
          where: { schoolId, status: "SUCCESS" },
          _sum: { amount: true }
        }),
        prisma.payment.aggregate({
          where: { schoolId, status: "PENDING" },
          _sum: { amount: true }
        }),
        prisma.transactionHistory.count({
          where: { schoolId, status: "SUCCESS" }
        }),
        prisma.payment.findMany({
          where: { schoolId, status: "SUCCESS" },
          distinct: ['studentId'],
          select: { studentId: true }
        }),
        prisma.payment.groupBy({
          by: ['paymentType'],
          where: { schoolId, status: "SUCCESS" },
          _sum: { amount: true },
          _count: { id: true }
        }),
        prisma.transactionHistory.findMany({
          where: {
            schoolId,
            status: "SUCCESS"
          },
          orderBy: { createdAt: "desc" },
          take: 200,
          select: { amount: true, createdAt: true }
        })
      ]);

      const totalRev = totalRevenue._sum.amount || 0;
      const pendingRev = pendingRevenue._sum.amount || 0;
      const activePayers = distinctStudents.length;
      const averageTx = successfulCount > 0 ? Math.round(totalRev / successfulCount) : 0;

      // Group monthly trend for last 6 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap = new Map<string, { month: string; revenue: number; count: number }>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyMap.set(key, { month: key, revenue: 0, count: 0 });
      }
      recentSuccessTx.forEach((tx) => {
        const txDate = new Date(tx.createdAt);
        const key = `${monthNames[txDate.getMonth()]} ${txDate.getFullYear()}`;
        if (monthlyMap.has(key)) {
          const item = monthlyMap.get(key)!;
          item.revenue += tx.amount;
          item.count += 1;
        }
      });
      const monthlyTrends = Array.from(monthlyMap.values());

      // Category breakdown
      const categoryBreakdown = categoryGroups.map((cat) => ({
        category: cat.paymentType || "School Tuition Fee",
        amount: cat._sum.amount || 0,
        count: cat._count.id,
        percentage: totalRev > 0 ? Math.round(((cat._sum.amount || 0) / totalRev) * 100) : 0
      }));

      // Map accounts — surface the best available status (FLW or Paystack)
      const accounts = settlementAccounts.map((acc: Record<string, unknown>) => ({
        id: acc.id,
        bankName: acc.bankName,
        accountName: acc.accountName,
        accountNumber: acc.accountNumber,
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

      const transcriptRevenue = categoryGroups
        .filter(c => c.paymentType === 'TRANSCRIPT' || c.paymentType === 'PORTAL_ACCESS')
        .reduce((sum, c) => sum + (c._sum.amount || 0), 0);
      const transcriptCount = categoryGroups
        .filter(c => c.paymentType === 'TRANSCRIPT' || c.paymentType === 'PORTAL_ACCESS')
        .reduce((sum, c) => sum + c._count.id, 0);

      return {
        totalRevenue: totalRev,
        pendingRevenue: pendingRev,
        activePayerCount: activePayers,
        averageTransaction: averageTx,
        transcriptRevenue,
        transcriptCount,
        monthlyTrends,
        categoryBreakdown,
        recentTransactions: transactions.map(t => ({
          id: t.id,
          amount: t.amount,
          createdAt: t.createdAt,
          paidAt: t.paidAt,
          paymentReference: t.transactionReference,
          channel: t.channel || 'GATEWAY',
          status: t.status,
          student: t.payment?.student,
          paymentType: t.payment?.paymentType
        })),
        paymentStatus: this.getSchoolPaymentStatus({ paystackSubaccountStatus: overallStatusValue }),
        accounts,
        bankAudits: await prisma.bankAccountAudit.findMany({
          where: { schoolId },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
        isVerified: overallStatusValue === "active"
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Analytics Error:", err.message);
      throw error;
    }
  }

  /**
   * Get complete bank account audit history
   */
  static async getBankAccountAudits(schoolId: string) {
    return await prisma.bankAccountAudit.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        settlementAccount: {
          select: {
            id: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            isDefault: true,
          }
        }
      }
    });
  }

  /**
   * Record an offline / manual fee payment (Cash, Bank Transfer, POS, Cheque)
   */
  static async recordManualPayment(schoolId: string, data: {
    studentId: string;
    parentId?: string;
    amount: number;
    paymentType?: string;
    paymentMethod?: string;
    term?: string;
    session?: string;
    reference?: string;
    notes?: string;
  }) {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: { parentLinks: true }
    });

    if (!student) {
      throw new Error("Student not found");
    }

    let parentId = data.parentId || student.parentLinks?.[0]?.parentId;
    if (!parentId) {
      const fallbackParent = await prisma.parent.findFirst();
      if (fallbackParent) {
        parentId = fallbackParent.id;
      } else {
        const cashier = await prisma.parent.create({
          data: {
            fullName: "Direct Guardian / Bursar Payer",
            email: `bursar-${schoolId.slice(0, 8)}@qefas.local`,
            phone: "0000000000",
            parentCode: `PAR-BURSAR-${Date.now().toString().slice(-4)}`,
            role: "PARENT"
          }
        });
        parentId = cashier.id;
      }
    }

    const ref = data.reference || `MAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await prisma.payment.create({
      data: {
        schoolId,
        studentId: data.studentId,
        parentId,
        amount: data.amount,
        term: data.term || "FIRST",
        session: data.session || "2025/2026",
        paymentType: data.paymentType || "School Tuition Fee",
        status: "SUCCESS",
        paymentMethod: data.paymentMethod || "CASH",
        paidAt: new Date(),
        paymentReference: ref
      }
    });

    const transaction = await prisma.transactionHistory.create({
      data: {
        schoolId,
        paymentId: payment.id,
        transactionReference: ref,
        amount: data.amount,
        channel: data.paymentMethod || "CASH",
        currency: "NGN",
        status: "SUCCESS",
        paidAt: new Date(),
        gatewayResponse: {
          manual: true,
          notes: data.notes || "Manual recording by Bursar / Admin",
          recordedAt: new Date().toISOString()
        }
      }
    });

    return { payment, transaction };
  }

  /**
   * Get detailed paginated transactions for school
   */
  static async getSchoolTransactions(schoolId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    paymentType?: string;
  }) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { schoolId };
    if (options.status && options.status !== 'ALL') {
      whereClause.status = options.status;
    }
    if (options.search) {
      whereClause.OR = [
        { transactionReference: { contains: options.search, mode: 'insensitive' } },
        { payment: { student: { name: { contains: options.search, mode: 'insensitive' } } } },
        { payment: { parent: { fullName: { contains: options.search, mode: 'insensitive' } } } }
      ];
    }
    if (options.paymentType && options.paymentType !== 'ALL') {
      whereClause.payment = {
        ...(whereClause.payment || {}),
        paymentType: options.paymentType
      };
    }

    const [total, transactions] = await Promise.all([
      prisma.transactionHistory.count({ where: whereClause }),
      prisma.transactionHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          payment: {
            include: {
              student: { select: { id: true, name: true, studentCode: true } },
              parent: { select: { id: true, fullName: true, email: true, phone: true } }
            }
          }
        }
      })
    ]);

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        channel: t.channel || 'GATEWAY',
        createdAt: t.createdAt,
        paidAt: t.paidAt,
        reference: t.transactionReference,
        paymentType: t.payment?.paymentType || 'School Fee',
        term: t.payment?.term,
        session: t.payment?.session,
        student: t.payment?.student,
        parent: t.payment?.parent,
        gatewayResponse: t.gatewayResponse
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
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
  static async removeSubaccount(accountId: string, userContext?: { userId?: string; userName?: string; userEmail?: string; userRole?: string }) {
    try {
      const account = await prisma.settlementAccount.findUnique({
        where: { id: accountId },
        select: {
          id: true,
          schoolId: true,
          bankName: true,
          bankCode: true,
          accountNumber: true,
          accountName: true,
          paystackSubaccountCode: true,
          flwSubaccountCode: true,
        }
      });

      if (!account) throw new Error("Account information not found");

      // Record Audit in DB before deletion
      await prisma.bankAccountAudit.create({
        data: {
          schoolId: account.schoolId,
          settlementAccountId: account.id,
          action: "ACCOUNT_DELETED",
          bankName: account.bankName,
          bankCode: account.bankCode,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          userId: userContext?.userId,
          userName: userContext?.userName,
          userEmail: userContext?.userEmail,
          userRole: userContext?.userRole,
          details: {
            subaccountCode: account.flwSubaccountCode || account.paystackSubaccountCode,
          }
        }
      });

      // Best-effort deactivation on the active gateway (non-fatal if it fails)
      try {
        const gateway = getPaymentGateway();
        const codeOrId = account.flwSubaccountCode || account.paystackSubaccountCode;
        if (codeOrId) {
          await gateway.syncSubaccount(codeOrId).catch(() => {});
        }
      } catch {
        // Non-fatal — proceed with DB deletion regardless
      }

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
