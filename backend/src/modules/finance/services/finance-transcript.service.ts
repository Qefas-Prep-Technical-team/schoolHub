import { sendTranscriptDeliveryEmail } from "../../auth/auth.service";
import prisma, { withRetry } from "../../../config/database";
import { getPaymentGateway } from "../../payment/gateway.factory";
import { MailService } from "../../notification/mail.service";
import {
  TranscriptPassResult,
  generateTranscriptPassService,
  verifyTranscriptPassService,
} from "./finance-transcript-token.service";

export {
  TranscriptPassResult,
  generateTranscriptPassService,
  verifyTranscriptPassService,
};

export function buildPassForPaymentService(p: {
  studentId: string;
  schoolId: string;
  session?: string | null;
  term?: string | null;
  paymentReference: string;
}) {
  return generateTranscriptPassService({
    studentId: p.studentId,
    schoolId: p.schoolId,
    sessionId: p.session || undefined,
    term: p.term || undefined,
    paymentReference: p.paymentReference,
  });
}

export async function sendTranscriptPassEmailService(params: {
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
      ? await withRetry(
        () =>
          prisma.payment.findFirst({
            where: { paymentReference: targetReference, studentId: params.studentId, status: { in: ["SUCCESS", "PAID"] } },
          }),
        "finance.sendTranscriptPassEmail.byRef",
      )
      : await withRetry(
        () =>
          prisma.payment.findFirst({
            where: {
              studentId: params.studentId,
              status: { in: ["SUCCESS", "PAID"] },
              OR: [{ paymentType: "TRANSCRIPT" }, { term: "All Terms" }, { session: { contains: "Session" } }],
            },
            orderBy: { paidAt: "desc" },
          }),
        "finance.sendTranscriptPassEmail.latest",
      );

    if (!payment) throw new Error("No verified transcript clearance payment found.");
    const generated = buildPassForPaymentService(payment);
    token = generated.token;
    if (!targetReference) targetReference = payment.paymentReference;
  }

  const student = await withRetry(
    () =>
      prisma.student.findUnique({
        where: { id: params.studentId },
        include: {
          school: { select: { name: true } },
          classes: { include: { class: { select: { name: true, section: true } } } },
        },
      }),
    "finance.sendTranscriptPassEmail.student",
  );

  const verifyResult = verifyTranscriptPassService(token);
  const expiryStr = verifyResult.expiresAt ? verifyResult.expiresAt.toDateString() : "30 days from confirmation";

  let sessionName = "All Sessions";
  if (verifyResult.sessionId && verifyResult.sessionId !== "ALL" && verifyResult.sessionId !== "All Sessions") {
    if (verifyResult.sessionId.includes("/")) {
      sessionName = verifyResult.sessionId;
    } else {
      const sess = await withRetry(
        () =>
          prisma.session.findFirst({
            where: {
              schoolId: params.schoolId,
              OR: [{ id: verifyResult.sessionId }, { name: verifyResult.sessionId }],
            },
          }),
        "finance.sendTranscriptPassEmail.session",
      );
      if (sess?.name) sessionName = sess.name;
      else sessionName = verifyResult.sessionId;
    }
  }

  const termMap: Record<string, string> = { ALL: "All Terms", FIRST: "1st Term", SECOND: "2nd Term", THIRD: "3rd Term" };
  const termLabel = termMap[verifyResult.term || "ALL"] || verifyResult.term || "All Terms";

  const className = student?.classes?.[0]?.class
    ? `${student.classes[0].class.name} ${student.classes[0].class.section || ""}`.trim()
    : "Active Class Cohort";

  const studentName = student?.name || "Scholar";
  const schoolName = student?.school?.name || "Institution";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const accessUrl = `${frontendUrl}/dashboard/student/transcript?pass=${encodeURIComponent(token)}`;

    const docketNumber = targetReference || verifyResult.reference || `TRANS-DOC-${new Date().getFullYear()}-${params.studentId.slice(0, 6).toUpperCase()}`;
  const verificationUrl = `${frontendUrl}/verify/transcript/${encodeURIComponent(docketNumber)}`;

  try {
    return await sendTranscriptDeliveryEmail({
      email: params.email,
      studentName,
      schoolName,
      docketNumber,
      accessUrl,
      verificationUrl,
      expiryDate: expiryStr,
      session: sessionName,
      term: termLabel,
    });
  } catch (err) {
    console.warn("[TranscriptService] Fallback to MailService for transcript pass email:", err);
    return MailService.sendSchoolEmail({
      schoolId: params.schoolId,
      to: params.email,
      subject: `Official Transcript 30-Day Access Pass & Clearance Receipt — ${schoolName}`,
      type: "GENERAL_ALERT",
      body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:18px;background:#fff;">
        <h2 style="color:#0f172a;text-align:center;">Your Certified Transcript is Ready</h2>
        <p style="color:#64748b;font-size:13px;text-align:center;">${schoolName} • Office of the Registrar</p>
        <p style="color:#334155;font-size:14px;">Hello <strong>${studentName}</strong>, your official transcript clearance payment has been verified. Below is your private <strong>30-Day Guaranteed Direct Access Pass</strong>:</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;font-size:13px;">
          <p style="margin:4px 0;"><strong>Session:</strong> ${sessionName} • <strong>Term:</strong> ${termLabel}</p>
          <p style="margin:4px 0;"><strong>Class:</strong> ${className} • <strong>Ref:</strong> ${docketNumber}</p>
          <p style="margin:4px 0;"><strong>Valid Until:</strong> ${expiryStr}</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${accessUrl}" style="background:#2563eb;color:#fff;padding:14px 28px;text-decoration:none;border-radius:12px;font-weight:800;font-size:14px;display:inline-block;">Preview & Download Certified Transcript</a>
        </div>
      </div>`,
    });
  }
}

export async function initiateTranscriptPaymentService(params: {
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
  const school = await withRetry(
    () =>
      prisma.school.findUnique({
        where: { id: params.schoolId },
        include: { settlementAccounts: { where: { isDefault: true } }, settings: true },
      }),
    "finance.initiateTranscriptPayment.school",
  );
  if (!school) throw new Error("School not found");

  const student = await withRetry(
    () => prisma.student.findUnique({ where: { id: params.studentId }, include: { parentLinks: true } }),
    "finance.initiateTranscriptPayment.student",
  );
  if (!student) throw new Error("Student record not found");

  const isGraduated = student.status === "GRADUATED" || student.status === "ALUMNI";
  const rawPlan = String(school.plan || "FREE").toUpperCase();
  const rawSubStatus = String(school.subscriptionStatus || "").toUpperCase();
  const isSchoolPaidPlan =
    Boolean(school.isTrialActive) ||
    (rawPlan !== "FREE" && rawPlan !== "" && rawSubStatus !== "EXPIRED" && rawSubStatus !== "CANCELLED");

  const rawConfiguredFee = (school.settings as { transcriptFee?: number } | null)?.transcriptFee;
  const configuredFee =
    rawConfiguredFee !== undefined && rawConfiguredFee !== null
      ? Number(rawConfiguredFee)
      : 5000;

  let feeAmount = configuredFee;
  if (isGraduated) {
    feeAmount = configuredFee > 0 ? configuredFee : 5000;
  } else if (!isSchoolPaidPlan) {
    feeAmount = configuredFee > 0 ? configuredFee : 5000;
  } else {
    feeAmount = Math.max(0, configuredFee);
  }

  // Validate that official records exist for the targeted payment scope
  const rawSessionParam =
    params.sessionId && params.sessionId !== "All Sessions" && params.sessionId !== "ALL"
      ? params.sessionId.trim()
      : undefined;
  const targetTerm =
    params.term && params.term !== "All Terms" && params.term !== "ALL"
      ? params.term.trim()
      : undefined;

  let resolvedSessionId: string | undefined = rawSessionParam;
  let resolvedSessionName = rawSessionParam || "All Sessions";

  if (rawSessionParam) {
    const matchedSession = await withRetry(
      () =>
        prisma.session.findFirst({
          where: {
            schoolId: params.schoolId,
            OR: [{ id: rawSessionParam }, { name: rawSessionParam }],
          },
          select: { id: true, name: true },
        }),
      "finance.initiateTranscriptPayment.resolveSession",
    );
    if (matchedSession) {
      resolvedSessionId = matchedSession.id;
      resolvedSessionName = matchedSession.name;
    }
  }

  const resultCount = await withRetry(
    () =>
      prisma.studentSubjectTermResult.count({
        where: {
          studentId: params.studentId,
          schoolId: params.schoolId,
          status: "PUBLISHED",
          ...(resolvedSessionId ? { sessionId: resolvedSessionId } : {}),
          ...(targetTerm ? { term: targetTerm as any } : {}),
        },
      }),
    "finance.initiateTranscriptPayment.verifyRecords",
  );

  if (resultCount === 0) {
    const scopeLabel = targetTerm ? `${targetTerm} Term` : "the selected period";
    throw new Error(
      isGraduated
        ? `No published academic records exist for ${scopeLabel}. Graduated scholars cannot pay for unrecorded or empty terms.`
        : `No published academic records exist for ${scopeLabel}. Clearance payment is unavailable until results are officially published.`,
    );
  }

  // If complimentary (₦0 on Paid School Plan for active student), issue a 30-day pass immediately without hitting gateway
  if (feeAmount === 0) {
    const freeRef = `COMP-TRANS-${Date.now()}-${params.studentId.slice(0, 6).toUpperCase()}`;
    const accessPass = generateTranscriptPassService({
      studentId: params.studentId,
      schoolId: params.schoolId,
      sessionId: resolvedSessionId || "ALL",
      term: targetTerm || "ALL",
      paymentReference: freeRef,
    });
    return {
      checkoutUrl: accessPass.accessUrl,
      paymentReference: freeRef,
      amount: 0,
      accessPass,
      settlementAccount: null,
    };
  }

  const isFlw = gateway.name === "FLUTTERWAVE";
  const defaultAccount = school.settlementAccounts?.[0] ?? null;
  const fallbackAccount = !defaultAccount
    ? isFlw
      ? await withRetry(
          () => prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, flwAccountStatus: "active" } }),
          "finance.initiateTranscriptPayment.flwAccount",
        )
      : await withRetry(
          () => prisma.settlementAccount.findFirst({ where: { schoolId: params.schoolId, paystackSubaccountStatus: "active" } }),
          "finance.initiateTranscriptPayment.psAccount",
        )
    : null;
  const activeAccount = defaultAccount || fallbackAccount;
  const accountStatus = isFlw ? activeAccount?.flwAccountStatus : activeAccount?.paystackSubaccountStatus;
  const subaccountCode: string =
    (isFlw ? activeAccount?.flwSubaccountId || activeAccount?.flwSubaccountCode : activeAccount?.paystackSubaccountCode) ?? "";

  if (!activeAccount || accountStatus !== "active" || !subaccountCode) {
    throw new Error(
      "PAYMENT_GATE_LOCKED: School settlement bank account is not active or verified yet. Please contact your school administration to complete bank verification.",
    );
  }

  let parentId = params.parentId || student?.parentLinks?.[0]?.parentId;
  if (!parentId) {
    const studentDirectEmail =
      student.email && student.email.includes("@")
        ? `scholar-payer-${student.id.slice(0, 12)}@qefas.local`
        : `scholar-payer-${student.id}@qefas.local`;
    const existingPayer = await withRetry(
      () => prisma.parent.findFirst({ where: { email: studentDirectEmail } }),
      "finance.initiateTranscriptPayment.findPayer",
    );
    const resolvedPayer =
      existingPayer ||
      (await withRetry(
        () =>
          prisma.parent.create({
            data: {
              fullName: `${student.name || params.name || "Scholar"} (Direct Scholar Payer)`,
              email: studentDirectEmail,
              phone: "0000000000",
              parentCode: `PAR-SCH-${student.id.slice(0, 6).toUpperCase()}`,
              role: "PARENT",
            },
          }),
        "finance.initiateTranscriptPayment.createPayer",
      ));
    parentId = resolvedPayer.id;
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const redirectUrl = `${frontendUrl}/dashboard/student/transcript?payment=verifying`;

  const result = await gateway.initialize({
    userId: parentId || student?.id || "student-guest",
    email: params.email || student?.email || "student@example.com",
    amount: feeAmount,
    plan: "TRANSCRIPT",
    metadata: {
      schoolId: params.schoolId,
      studentId: params.studentId,
      sessionId: resolvedSessionId || "All Sessions",
      sessionName: resolvedSessionName,
      term: targetTerm || "All Terms",
      paymentType: "TRANSCRIPT",
      settlementAccountId: activeAccount.id,
      subaccountCode,
      name: params.name || student?.name || "Student",
      redirect_url: redirectUrl,
    },
  });

  await withRetry(
    () =>
      prisma.payment.create({
        data: {
          paymentReference: result.txRef,
          schoolId: params.schoolId,
          studentId: params.studentId,
          parentId,
          amount: feeAmount,
          term: targetTerm || "All Terms",
          session: resolvedSessionName,
          paymentType: "TRANSCRIPT",
          status: "PENDING",
          settlementAccountId: activeAccount.id,
        },
      }),
    "finance.initiateTranscriptPayment.createPayment",
  );

  return {
    checkoutUrl: result.checkoutUrl,
    paymentReference: result.txRef,
    amount: feeAmount,
    settlementAccount: {
      bankName: activeAccount.bankName,
      accountNumber: activeAccount.accountNumber,
      accountName: activeAccount.accountName,
    },
  };
}
