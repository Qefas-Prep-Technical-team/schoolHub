import { Request, Response } from "express";
import prisma from "../../../config/database";

/**
 * Get global platform-wide analytics
 */
export const getGlobalStats = async (req: Request, res: Response) => {
  try {
    // 1. High-level counts
    const [
      schoolCount,
      activeSchoolCount,
      studentCount,
      teacherCount,
      parentCount,
      adminCount
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.admin.count()
    ]);

    // 2. Financial Metrics (Monthly Recurring Revenue placeholder logic)
    // In a real app, we'd sum active subscription amounts.
    // For now, we'll sum successful transaction totals from the last 30 days.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = await prisma.transactionHistory.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        amount: true
      }
    });

    const totalRevenue = await prisma.transactionHistory.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    });

    // 3. Storage Usage
    const storageUsage = await prisma.fileMetric.aggregate({
      _sum: { fileSize: true }
    });

    // 4. Activity Metrics (Simulated from platform login)
    // In a real app, you might have an Activity table.
    const activeSessions = 0; // Placeholder

    return res.status(200).json({
      success: true,
      data: {
        totalSchools: schoolCount,
        activeSchools: activeSchoolCount,
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalParents: parentCount,
        totalAdmins: adminCount,
        totalUsers: studentCount + teacherCount + parentCount + adminCount,
        totalRevenue: (totalRevenue._sum.amount || 0),
        mrr: (recentRevenue._sum.amount || 0),
        currency: "NGN",
        totalStorageBytes: (storageUsage._sum.fileSize || 0),
        activeSessions
      }
    });
  } catch (error: any) {
    console.error("[Platform Analytics Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to aggregate global stats"
    });
  }
};

/**
 * Get school growth data over time (last 6 months)
 */
export const getGrowthStats = async (req: Request, res: Response) => {
  try {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [schoolCount, revenueData] = await Promise.all([
        prisma.school.count({
          where: { createdAt: { gte: start, lte: end } }
        }),
        prisma.transactionHistory.aggregate({
          where: {
            status: 'SUCCESS',
            createdAt: { gte: start, lte: end }
          },
          _sum: { amount: true }
        })
      ]);

      last6Months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        totalSchools: schoolCount,
        revenue: revenueData._sum.amount || 0
      });
    }

    return res.status(200).json({
      success: true,
      data: last6Months
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch growth stats" });
  }
};
