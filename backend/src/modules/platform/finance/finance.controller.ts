import { Request, Response } from "express";
import prisma from "../../../config/database";
import { handleError } from "../../../utils/error-handler";

/**
 * List all platform transactions across all schools
 */
export const listAllTransactions = async (req: Request, res: Response) => {
  try {
    const { status, schoolId, startDate, endDate } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (schoolId) where.schoolId = schoolId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transactionHistory.findMany({
        where,
        include: {
          school: { select: { name: true, tenantId: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.transactionHistory.count({ where })
    ]);

    return res.status(200).json({ 
      success: true, 
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return handleError(res, error, "finance.listAllTransactions");
  }
};

/**
 * Get platform revenue summary
 */
export const getPlatformRevenue = async (req: Request, res: Response) => {
  try {
    const [successfulTransactions, totalTransactions, failedTransactions, activeSchools] = await Promise.all([
      prisma.transactionHistory.findMany({
        where: { status: 'SUCCESS' },
        select: { amount: true, createdAt: true }
      }),
      prisma.transactionHistory.count(),
      prisma.transactionHistory.count({ where: { status: 'FAILED' } }),
      prisma.school.count()
    ]);

    // Group by month
    const revenueByMonth = successfulTransactions.reduce((acc: any, curr) => {
      const month = curr.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + curr.amount;
      return acc;
    }, {});

    const totalVolume = successfulTransactions.reduce((sum, curr) => sum + curr.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalVolume,
        totalTransactions,
        failedTransactions,
        activeSchools,
        revenueByMonth: Object.entries(revenueByMonth).map(([name, total]) => ({ name, total })),
        currency: "NGN"
      }
    });
  } catch (error) {
    return handleError(res, error, "finance.getPlatformRevenue");
  }
};

/**
 * Monitor settlement/payout status
 */
export const getSettlementStatus = async (req: Request, res: Response) => {
  try {
     const schoolsWithSubaccounts = await prisma.school.findMany({
       where: { paystackSubaccountCode: { not: null } },
       select: {
         id: true,
         name: true,
         paystackSubaccountCode: true,
         paystackSubaccountStatus: true,
         bankName: true
       }
     });

     return res.status(200).json({ success: true, data: schoolsWithSubaccounts });
  } catch (error) {
    return handleError(res, error, "finance.getSettlementStatus");
  }
};
