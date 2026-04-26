import { Request, Response } from "express";
import prisma from "../../../config/database";
import { createActivityLog } from "../logs/logs.controller";

/**
 * List all subscription plans
 */
export const listPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      include: { _count: { select: { schools: true } } },
      orderBy: { maxStudents: 'asc' }
    });
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to list plans" });
  }
};

/**
 * Create or update a subscription plan
 */
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, maxStudents, maxExams, maxClasses, maxStorageGb } = req.body;

    if (id === 'new') {
      const plan = await prisma.subscriptionPlan.create({
        data: { name, maxStudents, maxExams, maxClasses, maxStorageGb }
      });

      // Activity Log
      const loggingStaff = (req as any).staff;
      if (loggingStaff) {
          await createActivityLog(
              loggingStaff.id,
              "CREATE_PLAN",
              "SubscriptionPlan",
              plan.id,
              { planName: plan.name }
          );
      }

      return res.status(201).json({ success: true, message: "Plan created", data: plan });
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { name, maxStudents, maxExams, maxClasses, maxStorageGb }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "UPDATE_PLAN",
            "SubscriptionPlan",
            id,
            { planName: plan.name }
        );
    }

    return res.status(200).json({ success: true, message: "Plan updated", data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to save plan" });
  }
};

/**
 * Manually assign a school to a plan
 */
export const assignSchoolToPlan = async (req: Request, res: Response) => {
  try {
    const { schoolId, planId, status, endDate } = req.body;

    if (!schoolId || !planId) {
      return res.status(400).json({ success: false, message: "School and Plan are required" });
    }

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: {
        subscriptionPlanId: planId,
        subscriptionStatus: status || 'ACTIVE',
        subscriptionEnd: endDate ? new Date(endDate) : null,
        isTrialActive: false
      }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "ASSIGN_PLAN",
            "School",
            schoolId,
            { schoolName: school.name, planId }
        );
    }

    return res.status(200).json({
      success: true,
      message: `School ${school.name} assigned to new plan`,
      data: school
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to assign plan" });
  }
};

/**
 * Get all schools with their current plans (for management list)
 */
export const listSchoolSubscriptions = async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
        subscriptionPlan: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: schools });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to list subscriptions" });
  }
};
