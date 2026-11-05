import { Prisma } from "@prisma/client";
import prisma, { withRetry } from "../../../config/database";

export async function getSchoolTransactionsService(
  schoolId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    paymentType?: string;
  },
) {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 20;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.TransactionHistoryWhereInput = { schoolId };
  if (options.status && options.status !== "ALL") {
    whereClause.status = options.status;
  }
  if (options.search) {
    whereClause.OR = [
      {
        transactionReference: {
          contains: options.search,
          mode: "insensitive",
        },
      },
      {
        payment: {
          student: {
            name: { contains: options.search, mode: "insensitive" },
          },
        },
      },
      {
        payment: {
          parent: {
            fullName: { contains: options.search, mode: "insensitive" },
          },
        },
      },
    ];
  }
  if (options.paymentType && options.paymentType !== "ALL") {
    whereClause.payment = {
      paymentType: options.paymentType,
    };
  }

  const [total, transactions] = await Promise.all([
    withRetry(
      () => prisma.transactionHistory.count({ where: whereClause }),
      "finance.getSchoolTransactionsService.count",
    ),
    withRetry(
      () =>
        prisma.transactionHistory.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            payment: {
              include: {
                student: {
                  select: { id: true, name: true, studentCode: true },
                },
                parent: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        }),
      "finance.getSchoolTransactionsService.findMany",
    ),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      channel: t.channel || "GATEWAY",
      createdAt: t.createdAt,
      paidAt: t.paidAt,
      reference: t.transactionReference,
      paymentReference: t.transactionReference,
      paymentType: t.payment?.paymentType || "School Fee",
      term: t.payment?.term,
      session: t.payment?.session,
      student: t.payment?.student,
      parent: t.payment?.parent,
      gatewayResponse: t.gatewayResponse,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getParentHistoryService(parentId: string) {
  return withRetry(
    () =>
      prisma.payment.findMany({
        where: { parentId },
        include: {
          student: { select: { name: true } },
          school: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    "finance.getParentHistoryService",
  );
}

export async function getGlobalTransactionsService() {
  return withRetry(
    () =>
      prisma.transactionHistory.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          school: { select: { name: true, schoolCode: true } },
          payment: {
            include: {
              student: { select: { name: true, studentCode: true } },
              parent: { select: { fullName: true } },
            },
          },
        },
      }),
    "finance.getGlobalTransactionsService",
  );
}
