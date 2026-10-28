import prisma from "../../config/database";
import { getPaymentGateway } from "../payment/gateway.factory";
import jwt from "jsonwebtoken";
import { createNotification } from "../notification/notification.service";
import { MailService } from "../notification/mail.service";

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
      business_email?: string;
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

      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { schoolEmail: true, phone: true },
      });

      const resolvedBusinessEmail =
        data.business_email ||
        userContext?.userEmail ||
        school?.schoolEmail ||
        'finance@schoolhub.ng';

      const sub = await gateway.createSubaccount({
        schoolId,
        businessName: data.business_name,
        bankCode: data.settlement_bank,
        accountNumber: data.account_number,
        splitPercentage: data.percentage_charge,
        businessEmail: resolvedBusinessEmail,
        businessMobile: school?.phone || undefined,
      });

      const isFlw = gateway.name === 'FLUTTERWAVE';
      const resolvedBankName = data.bank_name || data.settlement_bank;

      let resolvedUserName = userContext?.userName;
      let resolvedUserEmail = userContext?.userEmail;
      let resolvedUserRole = userContext?.userRole || "ADMIN";

      if ((!resolvedUserName || resolvedUserName === "School Administrator" || !resolvedUserEmail) && userContext?.userId) {
        const adminUser = await prisma.admin.findUnique({
          where: { id: userContext.userId },
          select: { name: true, email: true, role: true }
        });
        if (adminUser) {
          resolvedUserName = adminUser.name || resolvedUserName;
          resolvedUserEmail = adminUser.email || resolvedUserEmail;
          resolvedUserRole = adminUser.role || resolvedUserRole;
        }
      }

      if (!resolvedUserName || resolvedUserName === "School Administrator") {
        const sa = await prisma.schoolAdmin.findFirst({
          where: { schoolId },
          include: { admin: { select: { name: true, email: true, role: true } } }
        });
        if (sa?.admin) {
          resolvedUserName = sa.admin.name || resolvedUserName;
          resolvedUserEmail = sa.admin.email || resolvedUserEmail;
          resolvedUserRole = sa.admin.role || resolvedUserRole;
        }
      }

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
          addedByName: resolvedUserName || "School Administrator",
          addedByRole: resolvedUserRole || "ADMIN",
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
          userName: resolvedUserName || "School Administrator",
          userEmail: resolvedUserEmail,
          userRole: resolvedUserRole || "ADMIN",
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
   * Cryptographically generate a 30-Day Guaranteed Direct Access Pass for a student.
   * Gives uninterrupted, self-healing access to their transcript records for 1 full month.
   */
  static generateTranscriptPass(data: {
    studentId: string;
    schoolId: string;
    sessionId?: string;
    term?: string;
    paymentReference: string;
  }): { token: string; expiresAt: Date; accessUrl: string; sessionId: string; term: string } {
    const secret = process.env.JWT_SECRET || "qefas_default_transcript_secret_key";
    const expiresInSeconds = 30 * 24 * 60 * 60; // 30 days = 1 month
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const payload = {
      type: "TRANSCRIPT_30_DAY_PASS",
      studentId: data.studentId,
      schoolId: data.schoolId,
      sessionId: data.sessionId || "ALL",
      term: data.term || "ALL",
      reference: data.paymentReference,
      expiresAt: expiresAt.toISOString(),
    };

    const token = jwt.sign(payload, secret, { expiresIn: "30d" });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const accessUrl = `${frontendUrl}/dashboard/student/transcript?pass=${encodeURIComponent(token)}`;

    return { token, expiresAt, accessUrl, sessionId: payload.sessionId, term: payload.term };
  }

  /**
   * Verify a 30-day access pass token and return authenticated access permissions.
   */
  static verifyTranscriptPass(token: string): {
    valid: boolean;
    studentId?: string;
    schoolId?: string;
    sessionId?: string;
    term?: string;
    reference?: string;
    expiresAt?: Date;
    error?: string;
  } {
    try {
      const secret = process.env.JWT_SECRET || "qefas_default_transcript_secret_key";
      const decoded = jwt.verify(token, secret) as {
        type: string;
        studentId: string;
        schoolId: string;
        sessionId: string;
        term?: string;
        reference: string;
        expiresAt: string;
      };

      if (decoded.type !== "TRANSCRIPT_30_DAY_PASS") {
        return { valid: false, error: "Invalid token type" };
      }

      const expiresAt = new Date(decoded.expiresAt);
      if (Date.now() > expiresAt.getTime()) {
        return { valid: false, error: "Access pass has expired (valid for 30 days from clearance payment)" };
      }

      return {
        valid: true,
        studentId: decoded.studentId,
        schoolId: decoded.schoolId,
        sessionId: decoded.sessionId,
        term: decoded.term || "ALL",
        reference: decoded.reference,
        expiresAt,
      };
    } catch (err: any) {
      return { valid: false, error: err?.message || "Invalid or expired access token" };
    }
  }

  /**
   * Helper to build a 30-day access pass from a payment record
   */
  static buildPassForPayment(p: any) {
    return this.generateTranscriptPass({
      studentId: p.studentId,
      schoolId: p.schoolId,
      sessionId: p.session,
      term: p.term,
      paymentReference: p.paymentReference,
    });
  }

  /**
   * Send 30-Day Access Pass link directly to the student's email address.
   */
  static async sendTranscriptPassEmail(params: {
    studentId: string;
    schoolId: string;
    email: string;
    token?: string;
    reference?: string;
  }) {
    let token = params.token;
    let targetReference = params.reference;

    if (!token) {
      const payment = targetReference
        ? await prisma.payment.findFirst({
            where: { paymentReference: targetReference, status: "SUCCESS" }
          })
        : await prisma.payment.findFirst({
            where: {
              studentId: params.studentId,
              status: "SUCCESS",
              OR: [
                { paymentType: "TRANSCRIPT" },
                { term: "All Terms" },
                { session: { contains: "Session" } }
              ]
            },
            orderBy: { paidAt: "desc" }
          });

      if (payment) {
        const generated = this.buildPassForPayment(payment);
        token = generated.token;
        if (!targetReference) targetReference = payment.paymentReference;
      } else {
        throw new Error("No verified transcript clearance payment found for this scholar.");
      }
    }

    if (!token) {
      throw new Error("Failed to resolve or generate valid 30-day transcript access pass.");
    }

    const student = await prisma.student.findUnique({
      where: { id: params.studentId },
      include: {
        school: { select: { name: true } },
        classes: {
          include: {
            class: { select: { name: true, section: true } }
          }
        }
      }
    });

    const verifyResult = this.verifyTranscriptPass(token);
    const expiryStr = verifyResult.expiresAt ? verifyResult.expiresAt.toDateString() : "30 days from confirmation";

    let sessionName = "All Sessions";
    if (verifyResult.sessionId && verifyResult.sessionId !== "ALL") {
      const sess = await prisma.session.findUnique({ where: { id: verifyResult.sessionId } });
      if (sess?.name) sessionName = sess.name;
    }

    const termLabel =
      verifyResult.term === "ALL"
        ? "All Terms"
        : verifyResult.term === "FIRST"
        ? "1st Term"
        : verifyResult.term === "SECOND"
        ? "2nd Term"
        : verifyResult.term === "THIRD"
        ? "3rd Term"
        : (verifyResult.term || "All Terms");

    const className = student?.classes?.[0]?.class
      ? `${student.classes[0].class.name} ${student.classes[0].class.section || ""}`.trim()
      : "Active Class Cohort";

    const studentName = student?.name || "Scholar";
    const schoolName = student?.school?.name || "Institution";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const accessUrl = `${frontendUrl}/dashboard/student/transcript?pass=${encodeURIComponent(token)}`;

    return await MailService.sendSchoolEmail({
      schoolId: params.schoolId,
      to: params.email,
      subject: `Official Transcript 30-Day Access Pass & Clearance Receipt — ${schoolName}`,
      type: "GENERAL_ALERT",
      body: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; padding: 6px 14px; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
              Official Academic Clearance Pass & Receipt
            </span>
          </div>
          <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; text-align: center; letter-spacing: -0.025em;">
            Your Certified Transcript is Ready
          </h2>
          <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0 0 24px 0;">
            ${schoolName} • Office of the Registrar
          </p>

          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
            Hello <strong>${studentName}</strong>,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Your official transcript clearance payment has been verified. To protect institutional record integrity, certified transcripts cannot be accessed directly from the general dashboard. Below is your private <strong>30-Day Guaranteed Direct Access Pass</strong> to preview and download records for what you paid for.
          </p>

          <!-- Clearance Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Cleared Session:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 800; text-align: right;">${sessionName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Academic Term:</td>
                <td style="padding: 6px 0; color: #2563eb; font-weight: 800; text-align: right;">${termLabel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Class Cohort:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${className}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Transaction Reference:</td>
                <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: 700; text-align: right;">${targetReference || verifyResult.reference || "CONFIRMED"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Access Expiry:</td>
                <td style="padding: 6px 0; color: #059669; font-weight: 700; text-align: right;">${expiryStr}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${accessUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(37,99,235,0.3);">
              Preview & Download Certified Transcript
            </a>
          </div>

          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 14px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
              💡 <strong>Direct Access Note:</strong> This link gives you 30 days of exclusive preview and PDF download access for <strong>${sessionName} • ${termLabel}</strong>. You can open it on your phone, laptop, or home computer anytime without paying again.
            </p>
          </div>

          <p style="font-size: 11px; color: #94a3b8; word-break: break-all; margin: 20px 0 0 0; text-align: center;">
            Direct recovery URL: <br/>
            <a href="${accessUrl}" style="color: #2563eb; text-decoration: underline;">${accessUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
          <p style="font-size: 10px; color: #94a3b8; margin: 0; text-align: center;">
            Verification Hash: ${token.slice(0, 24)}... • Powered by Qefas Hub
          </p>
        </div>
      `
    });
  }

  /**
   * Initiate transcript or graduated student session portal access payment.
   */
  static async initiateTranscriptPayment(params: {
    schoolId: string;
    studentId: string;
    sessionId?: string;
    term?: string;
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/dashboard/student/transcript?payment=verifying`;

    const result = await gateway.initialize({
      userId: parentId || student?.id || "student-guest",
      email: params.email || student?.email || "student@example.com",
      amount: feeAmount,
      plan: 'TRANSCRIPT',
      metadata: {
        schoolId: params.schoolId,
        studentId: params.studentId,
        sessionId: params.sessionId || "All Sessions",
        term: params.term || "All Terms",
        paymentType: 'TRANSCRIPT',
        subaccountCode,
        name: params.name || student?.name || "Student",
        redirect_url: redirectUrl,
      }
    });

    await prisma.payment.create({
      data: {
        paymentReference: result.txRef,
        schoolId: params.schoolId,
        studentId: params.studentId,
        parentId: parentId || (await prisma.parent.findFirst())?.id || "",
        amount: feeAmount,
        term: params.term || "All Terms",
        session: params.sessionId || "All Sessions",
        paymentType: "TRANSCRIPT",
        status: "PENDING",
        settlementAccountId: activeAccount?.id || null,
      }
    });

    // Generate prospective 30-day access pass token
    const pass = this.generateTranscriptPass({
      studentId: params.studentId,
      schoolId: params.schoolId,
      sessionId: params.sessionId,
      term: params.term,
      paymentReference: result.txRef,
    });

    return {
      checkoutUrl: result.checkoutUrl,
      paymentReference: result.txRef,
      amount: feeAmount,
      accessPass: pass,
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
      const existingPayment = await prisma.payment.findUnique({
        where: { paymentReference: reference },
        include: {
          student: { select: { id: true, name: true, studentCode: true, email: true } },
          school: { select: { id: true, name: true } },
          parent: { select: { id: true, fullName: true, email: true } }
        }
      });

      // Helper to generate access pass
      const buildPassForPayment = (p: any) => {
        return this.generateTranscriptPass({
          studentId: p.studentId,
          schoolId: p.schoolId,
          sessionId: p.session,
          term: p.term,
          paymentReference: p.paymentReference,
        });
      };

      if (existingPayment && (existingPayment.status === "SUCCESS" || existingPayment.status === "PAID")) {
        // Ensure transactionHistory exists so it always appears in admin ledger
        const existingTx = await prisma.transactionHistory.findUnique({
          where: { transactionReference: reference }
        });
        if (!existingTx) {
          await prisma.transactionHistory.create({
            data: {
              schoolId: existingPayment.schoolId,
              paymentId: existingPayment.id,
              transactionReference: reference,
              amount: existingPayment.amount,
              channel: existingPayment.paymentMethod || "GATEWAY",
              currency: "NGN",
              status: "SUCCESS",
              paidAt: existingPayment.paidAt || new Date(),
            }
          });
        }
        const pass = buildPassForPayment(existingPayment);
        return { success: true, payment: existingPayment, accessPass: pass };
      }

      const gateway = getPaymentGateway();
      const verified = await gateway.verify(reference, flwTransactionId);

      if (verified.success) {
        const paymentMeta = verified.meta as Record<string, unknown>;
        const schoolId = (paymentMeta['schoolId'] || paymentMeta['schoolid']) as string | undefined;
        const studentId = (paymentMeta['studentId'] || paymentMeta['studentid']) as string | undefined;

        // Update Payment status
        const payment = await prisma.payment.update({
          where: { paymentReference: reference },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
            paymentMethod: verified.channel,
          },
          include: {
            student: { select: { id: true, name: true, studentCode: true, email: true } },
            school: { select: { id: true, name: true } },
            parent: { select: { id: true, fullName: true, email: true } }
          }
        });

        // Ensure Transaction History record exists or is created
        await prisma.transactionHistory.upsert({
          where: { transactionReference: reference },
          update: {
            status: "SUCCESS",
            amount: verified.amountNaira,
            channel: verified.channel,
            paidAt: new Date(),
          },
          create: {
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

        // Generate 30-Day Guaranteed Direct Access Pass
        const pass = buildPassForPayment(payment);

        // Notify School Admins in real-time
        const studentName = payment.student?.name || "Student";
        const studentCode = payment.student?.studentCode || "Scholar";
        const sessionLabel = payment.session === "ALL" ? "Cumulative Transcript" : (payment.session || "Official Transcript");
        const termLabel = payment.term && payment.term !== "ALL" && payment.term !== "All Terms" ? ` (${payment.term})` : "";

        try {
          await createNotification({
            recipientType: "SCHOOL",
            recipientId: payment.schoolId,
            type: "GENERAL",
            title: "Transcript Clearance Fee Received",
            message: `${studentName} (${studentCode}) has completed clearance payment of ₦${verified.amountNaira.toLocaleString()} for ${sessionLabel}${termLabel}.`,
            link: `/dashboard/admin/finance?tab=transcripts`,
            priority: "HIGH",
            meta: {
              paymentId: payment.id,
              paymentReference: reference,
              studentId: payment.studentId,
              amount: verified.amountNaira,
              paymentType: "TRANSCRIPT",
              accessUrl: pass.accessUrl,
            }
          });
        } catch (notifErr: any) {
          console.warn("[FinanceService] Admin notification skipped:", notifErr?.message);
        }

        // Notify Student in real-time
        if (payment.studentId) {
          try {
            await createNotification({
              recipientType: "STUDENT",
              recipientId: payment.studentId,
              type: "GENERAL",
              title: "Official Transcript Clearance Confirmed",
              message: `Your clearance payment of ₦${verified.amountNaira.toLocaleString()} has been confirmed. Your transcript records are unlocked with 30-day guaranteed access.`,
              link: `/dashboard/student/transcript?pass=${encodeURIComponent(pass.token)}`,
              priority: "HIGH",
              meta: {
                paymentReference: reference,
                amount: verified.amountNaira,
                paymentType: "TRANSCRIPT",
                accessPass: pass.token,
                expiresAt: pass.expiresAt.toISOString(),
              }
            });
          } catch (studentNotifErr: any) {
            console.warn("[FinanceService] Student notification skipped:", studentNotifErr?.message);
          }
        }

        // Send Email with 30-Day Direct Access Link & Clearance Receipt
        const emailsToSend = new Set<string>();
        if (payment.student?.email) emailsToSend.add(payment.student.email.trim());
        if (payment.parent?.email) emailsToSend.add(payment.parent.email.trim());
        if (paymentMeta['email'] && typeof paymentMeta['email'] === 'string') {
          emailsToSend.add((paymentMeta['email'] as string).trim());
        }

        for (const recipientEmail of emailsToSend) {
          if (!recipientEmail || !recipientEmail.includes('@')) continue;
          try {
            await this.sendTranscriptPassEmail({
              studentId: payment.studentId,
              schoolId: payment.schoolId,
              email: recipientEmail,
              token: pass.token,
              reference,
            });
            console.log(`[FinanceService] Dispatched transcript clearance email to ${recipientEmail}`);
          } catch (mailErr: any) {
            console.warn(`[FinanceService] Email dispatch to ${recipientEmail} skipped:`, mailErr?.message);
          }
        }

        return { success: true, payment, accessPass: pass };
      }

      return { success: false, status: 'failed' };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Verify Payment Error:", err.message);
      throw new Error("Verification failed: " + (err.message || "Unknown error"));
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

      // Fetch dedicated transcript transactions for the Transcripts tab
      const transcriptTransactions = await prisma.transactionHistory.findMany({
        where: {
          schoolId,
          status: "SUCCESS",
          payment: {
            paymentType: { in: ["TRANSCRIPT", "PORTAL_ACCESS"] }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          payment: {
            include: {
              student: { select: { id: true, name: true, studentCode: true } },
              parent: { select: { id: true, fullName: true, email: true, phone: true } }
            }
          }
        }
      }).then(list => list.map(t => ({
        id: t.id,
        amount: t.amount,
        createdAt: t.createdAt,
        paidAt: t.paidAt,
        paymentReference: t.transactionReference,
        channel: t.channel || 'GATEWAY',
        status: t.status,
        student: t.payment?.student,
        session: t.payment?.session,
        paymentType: t.payment?.paymentType
      })));

      return {
        totalRevenue: totalRev,
        pendingRevenue: pendingRev,
        activePayerCount: activePayers,
        averageTransaction: averageTx,
        transcriptRevenue,
        transcriptCount,
        transcriptTransactions,
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
        bankAudits: await this.enrichBankAudits(schoolId, await prisma.bankAccountAudit.findMany({
          where: { schoolId },
          orderBy: { createdAt: "desc" },
          take: 30,
        })),
        isVerified: overallStatusValue === "active"
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[FinanceService] Analytics Error:", err.message);
      throw error;
    }
  }

  /**
   * Helper to enrich bank audit records with real admin user info if missing or generic,
   * and auto-heal the database records so future direct queries are clean.
   */
  private static async enrichBankAudits(schoolId: string, audits: any[]) {
    if (!audits || audits.length === 0) return audits;

    // Collect all userIds and settlementAccount.addedBy
    const userIdsToFetch = new Set<string>();
    for (const a of audits) {
      if (a.userId) userIdsToFetch.add(a.userId);
      if (a.settlementAccount?.addedBy) userIdsToFetch.add(a.settlementAccount.addedBy);
    }

    const adminMap = new Map<string, { id: string; name: string; email: string; role: string }>();
    if (userIdsToFetch.size > 0) {
      const admins = await prisma.admin.findMany({
        where: { id: { in: Array.from(userIdsToFetch) } },
        select: { id: true, name: true, email: true, role: true }
      });
      for (const adm of admins) {
        adminMap.set(adm.id, adm);
      }
    }

    // Fallback: Primary school admin if an audit has no userId or generic info
    let primaryAdmin: { id: string; name: string; email: string; role: string } | null = null;
    const hasGeneric = audits.some((a: any) =>
      !a.userName ||
      a.userName === "School Administrator" ||
      a.userName === "System Administrator" ||
      !a.userEmail
    );
    if (hasGeneric) {
      const sa = await prisma.schoolAdmin.findFirst({
        where: { schoolId },
        include: { admin: { select: { id: true, name: true, email: true, role: true } } }
      });
      if (sa?.admin) {
        primaryAdmin = sa.admin;
      }
    }

    const updates: Promise<any>[] = [];

    const enriched = audits.map((audit: any) => {
      let resolvedName = audit.userName;
      let resolvedEmail = audit.userEmail;
      let resolvedRole = audit.userRole;
      let resolvedUserId = audit.userId;

      const isGenericName = !resolvedName || 
        resolvedName === "School Administrator" || 
        resolvedName === "System Administrator" || 
        resolvedName === "Admin";

      const matchedAdmin = (audit.userId && adminMap.get(audit.userId)) || 
        (audit.settlementAccount?.addedBy && adminMap.get(audit.settlementAccount.addedBy)) ||
        primaryAdmin;

      if (matchedAdmin) {
        if (!resolvedUserId) resolvedUserId = matchedAdmin.id;
        if (isGenericName && matchedAdmin.name) resolvedName = matchedAdmin.name;
        if (!resolvedEmail && matchedAdmin.email) resolvedEmail = matchedAdmin.email;
        if (!resolvedRole && matchedAdmin.role) resolvedRole = matchedAdmin.role;
      }

      // If the row had generic data in DB, schedule a background healing update
      if ((isGenericName || !audit.userEmail) && matchedAdmin?.name) {
        updates.push(
          prisma.bankAccountAudit.update({
            where: { id: audit.id },
            data: {
              userId: resolvedUserId,
              userName: resolvedName,
              userEmail: resolvedEmail,
              userRole: resolvedRole,
            }
          }).catch((e: any) => console.warn("[FinanceService] Audit auto-heal skipped:", e?.message))
        );

        if (audit.settlementAccountId) {
          updates.push(
            prisma.settlementAccount.update({
              where: { id: audit.settlementAccountId },
              data: {
                addedBy: resolvedUserId,
                addedByName: resolvedName,
                addedByRole: resolvedRole,
              }
            }).catch((e: any) => console.warn("[FinanceService] Settlement account auto-heal skipped:", e?.message))
          );
        }
      }

      return {
        ...audit,
        userId: resolvedUserId || audit.userId,
        userName: resolvedName || "Administrator",
        userEmail: resolvedEmail || null,
        userRole: resolvedRole || "ADMIN",
      };
    });

    if (updates.length > 0) {
      Promise.all(updates).catch(() => {});
    }

    return enriched;
  }

  /**
   * Get complete bank account audit history
   */
  static async getBankAccountAudits(schoolId: string) {
    const audits = await prisma.bankAccountAudit.findMany({
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
            addedBy: true,
            addedByName: true,
            addedByRole: true,
          }
        }
      }
    });

    return await this.enrichBankAudits(schoolId, audits);
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
  static async syncSubaccountStatus(
    schoolId: string,
    accountId?: string,
    userContext?: {
      userId?: string;
      userName?: string;
      userEmail?: string;
      userRole?: string;
    }
  ) {
    try {
      const gateway = getPaymentGateway();
      const isFlw = gateway.name === 'FLUTTERWAVE';

      // Resolve which subaccount code/ID to sync
      let subaccountCodeOrId: string | null = null;
      let dbAccountId: string | null = null;

      let acc: any = null;
      if (accountId && typeof accountId === 'string') {
        // @ts-ignore
        acc = await prisma.settlementAccount.findUnique({ where: { id: accountId } });
      }
      if (!acc) {
        // @ts-ignore
        acc = (await prisma.settlementAccount.findFirst({ where: { schoolId, isDefault: true } }))
          // @ts-ignore
          || (await prisma.settlementAccount.findFirst({ where: { schoolId }, orderBy: { createdAt: 'desc' } }));
      }

      subaccountCodeOrId = isFlw
        ? acc?.flwSubaccountId || acc?.flwSubaccountCode || null
        : acc?.paystackSubaccountCode || null;
      dbAccountId = acc?.id || null;

      if (!subaccountCodeOrId) {
        throw new Error("No linked gateway subaccount found to sync. Please set up a school bank account first.");
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

        // @ts-ignore
        await prisma.bankAccountAudit.create({
          data: {
            schoolId,
            settlementAccountId: dbAccountId,
            action: "ACCOUNT_SYNCED",
            accountNumber: acc?.accountNumber,
            bankName: acc?.bankName,
            accountName: acc?.accountName,
            userId: userContext?.userId,
            userName: userContext?.userName || "School Administrator",
            userEmail: userContext?.userEmail,
            userRole: userContext?.userRole || "ADMIN",
            gateway: gateway.name,
            details: {
              syncedStatus: synced.status,
              subaccountCodeOrId,
            }
          }
        }).catch((auditErr: any) => {
          console.warn("[FinanceService] Audit log skipped for sync:", auditErr?.message);
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
