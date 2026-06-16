import { Request, Response } from "express";
import prisma from "../../../config/database";
import { handleError } from "../../../utils/error-handler";

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
        totalStorageBytes: Number(storageUsage._sum.fileSize || 0),
        activeSessions
      }
    });
  } catch (error: any) {
    return handleError(res, error, "analytics.getGlobalStats");
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

      const [schoolCount, revenueData, studentCount, teacherCount, parentCount] = await Promise.all([
        prisma.school.count({
          where: { createdAt: { gte: start, lte: end } }
        }),
        prisma.transactionHistory.aggregate({
          where: {
            status: 'SUCCESS',
            createdAt: { gte: start, lte: end }
          },
          _sum: { amount: true }
        }),
        prisma.student.count({
          where: { createdAt: { gte: start, lte: end } }
        }),
        prisma.teacher.count({
          where: { createdAt: { gte: start, lte: end } }
        }),
        prisma.parent.count({
          where: { createdAt: { gte: start, lte: end } }
        })
      ]);

      last6Months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        totalSchools: schoolCount,
        revenue: revenueData._sum.amount || 0,
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalParents: parentCount
      });
    }

    return res.status(200).json({
      success: true,
      data: last6Months
    });
  } catch (error) {
    return handleError(res, error, "analytics.getGrowthStats");
  }
};

/**
 * Get subscription distribution and historical growth
 */
export const getSubscriptionAnalytics = async (req: Request, res: Response) => {
  try {
    // 1. Current distribution (Percentages)
    const [
      activePaid,
      expired,
      free,
      trial,
      cancelled,
      totalSchools
    ] = await Promise.all([
      prisma.schoolSubscription.count({ where: { status: 'ACTIVE', subscriptionType: 'PAID' } }),
      prisma.schoolSubscription.count({ where: { status: 'EXPIRED' } }),
      prisma.schoolSubscription.count({ where: { subscriptionType: 'FREE' } }),
      prisma.schoolSubscription.count({ where: { subscriptionType: 'TRIAL' } }),
      prisma.schoolSubscription.count({ where: { status: 'CANCELLED' } }),
      prisma.school.count()
    ]);

    // Individual users
    const [userActivePaid, userExpired, userFree, userTrial, userCancelled, totalUsers] = await Promise.all([
      prisma.userSubscription.count({ where: { status: 'ACTIVE', subscriptionType: 'PAID' } }),
      prisma.userSubscription.count({ where: { status: 'EXPIRED' } }),
      prisma.userSubscription.count({ where: { subscriptionType: 'FREE' } }),
      prisma.userSubscription.count({ where: { subscriptionType: 'TRIAL' } }),
      prisma.userSubscription.count({ where: { status: 'CANCELLED' } }),
      prisma.admin.count().then(a => prisma.teacher.count().then(t => prisma.student.count().then(s => prisma.parent.count().then(p => a + t + s + p))))
    ]);

    const globalTotalEntities = totalSchools + totalUsers;
    const stats = {
      paid: {
        count: activePaid + userActivePaid,
        percentage: globalTotalEntities > 0 ? ((activePaid + userActivePaid) / globalTotalEntities) * 100 : 0
      },
      expired: {
        count: expired + userExpired,
        percentage: globalTotalEntities > 0 ? ((expired + userExpired) / globalTotalEntities) * 100 : 0
      },
      free: {
        count: free + userFree,
        percentage: globalTotalEntities > 0 ? ((free + userFree) / globalTotalEntities) * 100 : 0
      },
      trial: {
        count: trial + userTrial,
        percentage: globalTotalEntities > 0 ? ((trial + userTrial) / globalTotalEntities) * 100 : 0
      },
      cancelled: {
        count: cancelled + userCancelled,
        percentage: globalTotalEntities > 0 ? ((cancelled + userCancelled) / globalTotalEntities) * 100 : 0
      }
    };

    // 2. Growth over time (Last 6 months)
    const history = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const [monthPaid, monthExpired, monthFree, monthTrial] = await Promise.all([
            prisma.subscriptionHistory.count({
                where: { subscriptionType: 'PAID', createdAt: { gte: start, lte: end } }
            }),
            prisma.subscriptionHistory.count({
                where: { status: 'EXPIRED', createdAt: { gte: start, lte: end } }
            }),
            prisma.subscriptionHistory.count({
                where: { subscriptionType: 'FREE', createdAt: { gte: start, lte: end } }
            }),
            prisma.subscriptionHistory.count({
                where: { subscriptionType: 'TRIAL', createdAt: { gte: start, lte: end } }
            })
        ]);

        history.push({
            month: date.toLocaleString('default', { month: 'short' }),
            paid: monthPaid,
            expired: monthExpired,
            free: monthFree,
            trial: monthTrial
        });
    }

    return res.status(200).json({
      success: true,
      data: {
        distribution: stats,
        history
      }
    });
  } catch (error) {
    return handleError(res, error, "analytics.getSubscriptionAnalytics");
  }
};
