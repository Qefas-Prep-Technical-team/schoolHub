import { sendTranscriptPaymentSuccessEmail, sendSchoolTranscriptPaymentReceivedEmail } from "../../auth/auth.service";
import prisma, { withRetry } from "../../../config/database";
import { getPaymentGateway } from "../../payment/gateway.factory";
import { createNotification } from "../../notification/notification.service";
import { buildPassForPaymentService, sendTranscriptPassEmailService } from "./finance-transcript.service";

export function getSchoolPaymentStatusService(school: {
  paystackSubaccountStatus?: string;
  flwAccountStatus?: string;
}) {
  const status = school.flwAccountStatus || school.paystackSubaccountStatus || "pending";
  const statusMap: Record<string, { label: string; color: string; message: string }> = {
    active: { label: "Active Account", color: "green", message: "Payments are enabled and processing normally." },
    pending: { label: "Awaiting Verification", color: "yellow", message: "Your bank details are being verified — typically within 24 hours." },
    unverified: { label: "Unverified Account", color: "red", message: "Bank details failed verification. Please review and update your records." },
    none: { label: "No Settlement Account", color: "slate", message: "Connect a bank account to enable automated fee disbursements." },
  };
  return { status, ...(statusMap[status] || statusMap.pending) };
}

export async function initializePaymentService(params: {
  schoolId: string;
  studentId: string;
  parentId: string;
  email: string;
  amount: number;
  metadata: Record<string, unknown>;
}) {
  try {
    const gateway = getPaymentGateway();
    const school = await withRetry(
      () => prisma.school.findUnique({ where: { id: params.schoolId }, include: { settlementAccounts: { where: { isDefault: true } } } }),
      "finance.initializePaymentService.school",
    );

    const isFlw = gateway.name === "FLUTTERWAVE";
    const defaultAcc = school?.settlementAccounts?.[0] ?? null;
    const fallbackAcc = !defaultAcc
      ? isFlw
        ? await withRetry(() => prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, flwAccountStatus: "active" } }), "finance.initializePaymentService.flwAccount")
        : await withRetry(() => prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, paystackSubaccountStatus: "active" } }), "finance.initializePaymentService.psAccount")
      : null;
    const activeAccount = defaultAcc || fallbackAcc;
    const accountStatus = isFlw ? activeAccount?.flwAccountStatus : activeAccount?.paystackSubaccountStatus;

    if (!activeAccount || accountStatus !== "active") {
      throw new Error("PAYMENT_GATE_LOCKED: School settlement account is not active. Please complete bank verification.");
    }

    const subaccountCode: string =
      (isFlw ? activeAccount.flwSubaccountId || activeAccount.flwSubaccountCode : activeAccount.paystackSubaccountCode) ?? "";

    const result = await gateway.initialize({
      userId: params.parentId,
      email: params.email,
      amount: params.amount,
      plan: "SCHOOL_FEES",
      metadata: {
        ...params.metadata,
        schoolId: params.schoolId,
        studentId: params.studentId,
        parentId: params.parentId,
        paymentType: "SCHOOL_FEES",
        settlementAccountId: activeAccount.id,
        subaccountCode,
      },
    });

    await withRetry(
      () =>
        prisma.payment.create({
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
            settlementAccountId: activeAccount.id,
          },
        }),
      "finance.initializePaymentService.createPayment",
    );

    return { authorization_url: result.checkoutUrl, reference: result.txRef, access_code: result.accessCode };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw new Error(err.response?.data?.message || err.message || "Payment initialization failed");
  }
}

export async function verifyPaymentService(reference: string, flwTransactionId?: string) {
  try {
    const existingPayment = await withRetry(
      () =>
        prisma.payment.findUnique({
          where: { paymentReference: reference },
          include: {
            student: { select: { id: true, name: true, studentCode: true, email: true } },
            school: { select: { id: true, name: true, schoolEmail: true, admins: { include: { admin: { select: { email: true } } } } } },
            parent: { select: { id: true, fullName: true, email: true } },
          },
        }),
      "finance.verifyPaymentService.existingPayment",
    );

    if (existingPayment && (existingPayment.status === "SUCCESS" || existingPayment.status === "PAID")) {
      const existingTx = await withRetry(
        () => prisma.transactionHistory.findUnique({ where: { transactionReference: reference } }),
        "finance.verifyPaymentService.existingTx",
      );
      if (!existingTx) {
        await withRetry(
          () =>
            prisma.transactionHistory.create({
              data: {
                schoolId: existingPayment.schoolId,
                paymentId: existingPayment.id,
                transactionReference: reference,
                amount: existingPayment.amount,
                channel: existingPayment.paymentMethod || "GATEWAY",
                currency: "NGN",
                status: "SUCCESS",
                paidAt: existingPayment.paidAt || new Date(),
              },
            }),
          "finance.verifyPaymentService.createTx",
        );
      }
      return { success: true, payment: existingPayment, accessPass: buildPassForPaymentService(existingPayment) };
    }

    const gateway = getPaymentGateway();
    const verified = await gateway.verify(reference, flwTransactionId);
    if (!verified.success) return { success: false, status: "failed" };

    const paymentMeta = verified.meta as Record<string, unknown>;
    const schoolId = (paymentMeta["schoolId"] || paymentMeta["schoolid"]) as string | undefined;

    const payment = await withRetry(
      () =>
        prisma.payment.update({
          where: { paymentReference: reference },
          data: { status: "SUCCESS", paidAt: new Date(), paymentMethod: verified.channel },
          include: {
            student: { select: { id: true, name: true, studentCode: true, email: true } },
            school: { select: { id: true, name: true, schoolEmail: true, admins: { include: { admin: { select: { email: true } } } } } },
            parent: { select: { id: true, fullName: true, email: true } },
          },
        }),
      "finance.verifyPaymentService.updatePayment",
    );

    await withRetry(
      () =>
        prisma.transactionHistory.upsert({
          where: { transactionReference: reference },
          update: { status: "SUCCESS", amount: verified.amountNaira, channel: verified.channel, paidAt: new Date() },
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
          },
        }),
      "finance.verifyPaymentService.upsertTx",
    );

    const pass = buildPassForPaymentService(payment);
    const studentName = payment.student?.name || "Student";
    const studentCode = payment.student?.studentCode || "Scholar";
    const sessionLabel = payment.session === "ALL" ? "Cumulative Transcript" : payment.session || "Official Transcript";
    const termLabel = payment.term && payment.term !== "ALL" && payment.term !== "All Terms" ? ` (${payment.term})` : "";

    await createNotification({
      recipientType: "SCHOOL",
      recipientId: payment.schoolId,
      type: "GENERAL",
      title: "Transcript Clearance Fee Received",
      message: `${studentName} (${studentCode}) has completed clearance payment of ₦${verified.amountNaira.toLocaleString()} for ${sessionLabel}${termLabel}.`,
      link: `/dashboard/admin/finance?tab=transcripts`,
      priority: "HIGH",
      meta: {
        paymentId: payment.id, paymentReference: reference, studentId: payment.studentId,
        amount: verified.amountNaira, paymentType: "TRANSCRIPT", accessUrl: pass.accessUrl,
      },
    }).catch(() => {});

    if (payment.studentId) {
      await createNotification({
        recipientType: "STUDENT",
        recipientId: payment.studentId,
        type: "GENERAL",
        title: "Official Transcript Clearance Confirmed",
        message: `Your clearance payment of ₦${verified.amountNaira.toLocaleString()} has been confirmed. Your transcript records are unlocked with 30-day guaranteed access.`,
        link: `/dashboard/student/transcript?pass=${encodeURIComponent(pass.token)}`,
        priority: "HIGH",
        meta: {
          paymentReference: reference, amount: verified.amountNaira, paymentType: "TRANSCRIPT",
          accessPass: pass.token, expiresAt: pass.expiresAt.toISOString(),
        },
      }).catch(() => {});
    }

    const emailsToSend = new Set<string>();
    if (payment.student?.email) emailsToSend.add(payment.student.email.trim());
    if (payment.parent?.email) emailsToSend.add(payment.parent.email.trim());
    if (paymentMeta["email"] && typeof paymentMeta["email"] === "string") emailsToSend.add(paymentMeta["email"].trim());

    for (const recipientEmail of emailsToSend) {
      if (!recipientEmail || !recipientEmail.includes("@")) continue;
      // Send 30-day Access Pass
      await sendTranscriptPassEmailService({
        studentId: payment.studentId, schoolId: payment.schoolId, email: recipientEmail, token: pass.token, reference,
      }).catch(() => {});

      // Send Dedicated Transcript Order Payment Success Receipt
      await sendTranscriptPaymentSuccessEmail({
        email: recipientEmail,
        studentName,
        schoolName: payment.school?.name || "Institution",
        reference,
        amount: verified.amountNaira,
        paymentMethod: verified.channel,
        session: payment.session || "All Sessions",
        term: payment.term || "All Terms",
      }).catch((err) => console.error("[PaymentVerification] Error sending student transcript payment success email:", err));
    }

    // Send School Institutional Notification
    try {
      const targetSchoolEmail = payment.school?.schoolEmail || payment.school?.admins?.[0]?.admin?.email;
      if (targetSchoolEmail && targetSchoolEmail.includes("@")) {
        await sendSchoolTranscriptPaymentReceivedEmail({
          schoolEmail: targetSchoolEmail,
          schoolName: payment.school?.name || "Institution",
          studentName,
          studentCode,
          amount: verified.amountNaira,
          reference,
          session: payment.session || "All Sessions",
          term: payment.term || "All Terms",
          paymentMethod: verified.channel,
        });
      }
    } catch (schoolMailErr) {
      console.error("[PaymentVerification] Error sending school transcript notification email:", schoolMailErr);
    }

    return { success: true, payment, accessPass: pass };
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error("Verification failed: " + (err.message || "Unknown error"));
  }
}
