import prisma, { withRetry } from "../../../config/database";
import { getActiveSchoolStudentFilter } from "../../school/services/school-member-filters.service";
import { enrichBankAuditsService, BankAuditItemInput } from "./finance-bank-audit.service";
import { getSchoolPaymentStatusService } from "./finance-payments.service";

export async function getSchoolAnalyticsService(schoolId: string) {
  const schoolData = await withRetry(
    () => prisma.school.findUnique({ where: { id: schoolId }, include: { settlementAccounts: true } }),
    "finance.getSchoolAnalyticsService.schoolData",
  );

  if (schoolData && schoolData.settlementAccounts.length === 0 && schoolData.paystackSubaccountCode) {
    await withRetry(
      () =>
        prisma.settlementAccount.create({
          data: {
            schoolId,
            paystackSubaccountCode: schoolData.paystackSubaccountCode,
            paystackSubaccountStatus: schoolData.paystackSubaccountStatus,
            bankName: schoolData.bankName,
            accountNumber: schoolData.accountNumber,
            accountName: schoolData.accountName,
            percentageCharge: schoolData.percentageCharge,
            isDefault: true,
          },
        }),
      "finance.getSchoolAnalyticsService.migrateAccount",
    );
    await withRetry(
      () =>
        prisma.school.update({
          where: { id: schoolId },
          data: { paystackSubaccountCode: null, paystackSubaccountStatus: "pending", bankName: null, accountNumber: null, accountName: null },
        }),
      "finance.getSchoolAnalyticsService.clearLegacy",
    );
  }

  const [
    transactions, settlementAccounts, totalRevenue, pendingRevenue, successfulCount,
    distinctStudents, categoryGroups, recentSuccessTx, rawTranscriptTx, rawAudits,
  ] = await Promise.all([
    withRetry(() => prisma.transactionHistory.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" }, take: 10, include: { payment: { include: { student: { select: { name: true, studentCode: true } } } } } }), "finance.getSchoolAnalyticsService.transactions"),
    withRetry(() => prisma.settlementAccount.findMany({ where: { schoolId }, include: { transactionHistories: { where: { status: "SUCCESS" }, select: { amount: true } } } }), "finance.getSchoolAnalyticsService.accounts"),
    withRetry(() => prisma.transactionHistory.aggregate({ where: { schoolId, status: "SUCCESS" }, _sum: { amount: true } }), "finance.getSchoolAnalyticsService.totalRevenue"),
    withRetry(() => prisma.payment.aggregate({ where: { schoolId, status: "PENDING" }, _sum: { amount: true } }), "finance.getSchoolAnalyticsService.pendingRevenue"),
    withRetry(() => prisma.transactionHistory.count({ where: { schoolId, status: "SUCCESS" } }), "finance.getSchoolAnalyticsService.successfulCount"),
    withRetry(() => prisma.payment.findMany({ where: { schoolId, status: "SUCCESS" }, distinct: ["studentId"], select: { studentId: true } }), "finance.getSchoolAnalyticsService.distinctStudents"),
    withRetry(() => prisma.payment.groupBy({ by: ["paymentType"], where: { schoolId, status: "SUCCESS" }, _sum: { amount: true }, _count: { id: true } }), "finance.getSchoolAnalyticsService.categoryGroups"),
    withRetry(() => prisma.transactionHistory.findMany({ where: { schoolId, status: "SUCCESS" }, orderBy: { createdAt: "desc" }, take: 200, select: { amount: true, createdAt: true } }), "finance.getSchoolAnalyticsService.recentSuccessTx"),
    withRetry(
      () =>
        prisma.transactionHistory.findMany({
          where: { schoolId, status: "SUCCESS", payment: { paymentType: { in: ["TRANSCRIPT", "PORTAL_ACCESS"] } } },
          orderBy: { createdAt: "desc" }, take: 50,
          include: { payment: { include: { student: { select: { id: true, name: true, studentCode: true } }, parent: { select: { id: true, fullName: true, email: true, phone: true } } } } },
        }),
      "finance.getSchoolAnalyticsService.transcriptTx",
    ),
    withRetry(() => prisma.bankAccountAudit.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" }, take: 30 }), "finance.getSchoolAnalyticsService.bankAudits"),
  ]);

  const totalRev = totalRevenue._sum.amount || 0;
  const pendingRev = pendingRevenue._sum.amount || 0;
  const activePayers = distinctStudents.length;
  const averageTx = successfulCount > 0 ? Math.round(totalRev / successfulCount) : 0;

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
    const item = monthlyMap.get(key);
    if (item) {
      item.revenue += tx.amount;
      item.count += 1;
    }
  });

  const accounts = settlementAccounts.map((acc) => ({
    id: acc.id,
    bankName: acc.bankName,
    accountName: acc.accountName,
    accountNumber: acc.accountNumber,
    status: acc.flwAccountStatus || acc.paystackSubaccountStatus || "pending",
    isDefault: acc.isDefault,
    totalSettled: (acc.transactionHistories || []).reduce((sum, t) => sum + t.amount, 0),
    paystackSubaccountCode: acc.paystackSubaccountCode,
    flwSubaccountCode: acc.flwSubaccountCode,
  }));

  const overallStatusValue =
    accounts.length === 0 ? "none" : accounts.some((a) => a.status === "active") ? "active" : accounts.some((a) => a.status === "pending") ? "pending" : "unverified";

  const transcriptGroups = categoryGroups.filter((c) => c.paymentType === "TRANSCRIPT" || c.paymentType === "PORTAL_ACCESS");

  return {
    totalRevenue: totalRev,
    pendingRevenue: pendingRev,
    activePayerCount: activePayers,
    averageTransaction: averageTx,
    transcriptRevenue: transcriptGroups.reduce((sum, c) => sum + (c._sum.amount || 0), 0),
    transcriptCount: transcriptGroups.reduce((sum, c) => sum + c._count.id, 0),
    transcriptTransactions: rawTranscriptTx.map((t) => ({
      id: t.id, amount: t.amount, createdAt: t.createdAt, paidAt: t.paidAt,
      paymentReference: t.transactionReference, channel: t.channel || "GATEWAY", status: t.status,
      student: t.payment?.student, session: t.payment?.session, term: t.payment?.term, paymentType: t.payment?.paymentType,
    })),
    monthlyTrends: Array.from(monthlyMap.values()),
    categoryBreakdown: categoryGroups.map((cat) => ({
      category: cat.paymentType || "School Tuition Fee",
      amount: cat._sum.amount || 0,
      count: cat._count.id,
      percentage: totalRev > 0 ? Math.round(((cat._sum.amount || 0) / totalRev) * 100) : 0,
    })),
    recentTransactions: transactions.map((t) => ({
      id: t.id, amount: t.amount, createdAt: t.createdAt, paidAt: t.paidAt,
      paymentReference: t.transactionReference, channel: t.channel || "GATEWAY", status: t.status,
      student: t.payment?.student, term: t.payment?.term, session: t.payment?.session, paymentType: t.payment?.paymentType,
    })),
    paymentStatus: getSchoolPaymentStatusService({ paystackSubaccountStatus: overallStatusValue }),
    accounts,
    bankAudits: await enrichBankAuditsService(schoolId, rawAudits as unknown as BankAuditItemInput[]),
    isVerified: overallStatusValue === "active",
  };
}

export async function recordManualPaymentService(
  schoolId: string,
  data: {
    studentId: string; parentId?: string; amount: number; paymentType?: string;
    paymentMethod?: string; term?: string; session?: string; reference?: string; notes?: string;
  },
) {
  const studentFilter = await getActiveSchoolStudentFilter(schoolId);
  const student = await withRetry(
    () => prisma.student.findFirst({ where: { AND: [{ id: data.studentId }, studentFilter] }, include: { parentLinks: true } }),
    "finance.recordManualPaymentService.student",
  );
  if (!student) throw new Error("Student not found in your school directory");

  let parentId = data.parentId || student.parentLinks?.[0]?.parentId;
  if (!parentId) {
    const bursarEmail = `bursar-${schoolId.slice(0, 8)}@qefas.local`;
    const existingBursar = await withRetry(
      () => prisma.parent.findFirst({ where: { email: bursarEmail } }),
      "finance.recordManualPaymentService.findBursar",
    );
    const resolvedBursar =
      existingBursar ||
      (await withRetry(
        () =>
          prisma.parent.create({
            data: {
              fullName: "Direct Guardian / Bursar Payer",
              email: bursarEmail,
              phone: "0000000000",
              parentCode: `PAR-BURSAR-${Date.now().toString().slice(-4)}`,
              role: "PARENT",
            },
          }),
        "finance.recordManualPaymentService.createBursar",
      ));
    parentId = resolvedBursar.id;
  }

  const ref = data.reference || `MAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const payment = await withRetry(
    () =>
      prisma.payment.create({
        data: {
          schoolId, studentId: data.studentId, parentId: parentId!, amount: data.amount,
          term: data.term || "FIRST", session: data.session || "2025/2026",
          paymentType: data.paymentType || "TUITION", status: "SUCCESS",
          paymentMethod: data.paymentMethod || "CASH", paidAt: new Date(), paymentReference: ref,
        },
      }),
    "finance.recordManualPaymentService.createPayment",
  );
  const transaction = await withRetry(
    () =>
      prisma.transactionHistory.create({
        data: {
          schoolId, paymentId: payment.id, transactionReference: ref, amount: data.amount,
          channel: data.paymentMethod || "MANUAL_CASH", currency: "NGN", status: "SUCCESS", paidAt: new Date(),
          gatewayResponse: { recordedBy: "ADMIN", notes: data.notes || "Manual Cash/POS Payment" },
        },
      }),
    "finance.recordManualPaymentService.createTx",
  );
  return { payment, transaction };
}
