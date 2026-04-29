import { Request, Response } from "express";
import prisma from "../../../config/database";
import { LinkStatus, SubscriptionStatus, SubscriptionType } from "@prisma/client";
import { createActivityLog } from "../logs/logs.controller";
import { getSingleString } from "../../../utils/request-utils";

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
    const id = getSingleString(req.params.id);
    const { 
      name, type, category, monthlyPrice, yearlyPrice, description, 
      maxStudents, maxExams, maxClasses, maxStorageGb, maxTeachers, 
      maxParents, maxAiUsage, features, badgeLabel, buttonText, 
      isActive, isPopular, hasTrial, trialDays, sortOrder 
    } = req.body;

    const planData = {
      name, type: type || 'custom', category: category || 'schools', 
      monthlyPrice: Number(monthlyPrice) || 0, 
      yearlyPrice: Number(yearlyPrice) || 0, 
      description, maxStudents: Number(maxStudents) || 0, 
      maxExams: Number(maxExams) || 0, maxClasses: Number(maxClasses) || 0, 
      maxStorageGb: Number(maxStorageGb) || 1, 
      maxTeachers: Number(maxTeachers) || 0, 
      maxParents: Number(maxParents) || 0, 
      maxAiUsage: Number(maxAiUsage) || 0, 
      features: features || [], badgeLabel, 
      buttonText: buttonText || "Get Started", 
      isActive: isActive !== undefined ? isActive : true, 
      isPopular: !!isPopular, hasTrial: !!hasTrial, 
      trialDays: Number(trialDays) || 0, 
      sortOrder: Number(sortOrder) || 0
    };

    if (id === 'new') {
      const plan = await prisma.subscriptionPlan.create({
        data: planData
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

    //const id = req.params.id as string;
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: planData
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "UPDATE_PLAN",
            "SubscriptionPlan",
            id as string,
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
        subscriptionStatus: (status as SubscriptionStatus) || SubscriptionStatus.ACTIVE,
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

/**
 * Reset a school's subscription to default (Newly registered state)
 */
export const resetSchoolSubscription = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID is required" });
    }

    // 1. Get the school to ensure it exists
    const schoolExists = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true }
    });

    if (!schoolExists) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    // 2. Perform the reset
    const school = await prisma.school.update({
      where: { id: schoolId },
      data: {
        plan: "FREE",
        subscriptionPlanId: null,
        subscriptionStatus: SubscriptionStatus.INACTIVE,
        isTrialActive: false,
        trialUsed: false,
        trialEndsAt: null,
        subscriptionEnd: null,
        maxStudentsOverride: null,
        maxExamsOverride: null,
        maxClassesOverride: null,
        maxStorageGbOverride: null,
      }
    });

    // 3. Clean up school_subscriptions table
    await prisma.schoolSubscription.deleteMany({
      where: { schoolId }
    });

    // 4. Reset linked teachers and students if necessary?
    // User asked to "reset their subscription", so focusing on school level first.

    // 5. Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "RESET_SUBSCRIPTION",
            "School",
            schoolId,
            { schoolName: schoolExists.name, reason: "Manual reset via console" }
        );
    }

    return res.status(200).json({
      success: true,
      message: `Subscription for ${schoolExists.name} has been reset to default`,
      data: school
    });
  } catch (error: any) {
    console.error("resetSchoolSubscription error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to reset subscription" 
    });
  }
};

/**
 * Reset a student's subscription to default (FREE)
 */
export const resetStudentSubscription = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const studentExists = await prisma.student.findUnique({
      where: { id: studentId },
      select: { name: true }
    });

    if (!studentExists) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        plan: "FREE",
        subscriptionPlanId: null,
        subscriptionStatus: SubscriptionStatus.INACTIVE,
        isTrialActive: false,
        trialUsed: false,
        trialEndsAt: null,
        subscriptionEnd: null
      }
    });

    // Clean up user_subscriptions table
    await prisma.userSubscription.deleteMany({
      where: { userId: studentId, userType: "STUDENT" }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "RESET_STUDENT_SUBSCRIPTION",
            "Student",
            studentId,
            { studentName: studentExists.name, reason: "Manual reset via console" }
        );
    }

    return res.status(200).json({
      success: true,
      message: `Subscription for ${studentExists.name} has been reset to default`,
      data: student
    });
  } catch (error: any) {
    console.error("resetStudentSubscription error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to reset subscription" 
    });
  }
};

/**
 * Reset a teacher's subscription to default (FREE)
 */
export const resetTeacherSubscription = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: "Teacher ID is required" });
    }

    const teacherExists = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { name: true }
    });

    if (!teacherExists) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        plan: "FREE",
        subscriptionPlanId: null,
        subscriptionStatus: SubscriptionStatus.INACTIVE,
        isTrialActive: false,
        trialUsed: false,
        trialEndsAt: null,
        subscriptionEnd: null
      }
    });

    // Clean up user_subscriptions table
    await prisma.userSubscription.deleteMany({
      where: { userId: teacherId, userType: "TEACHER" }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "RESET_TEACHER_SUBSCRIPTION",
            "Teacher",
            teacherId,
            { teacherName: teacherExists.name, reason: "Manual reset via console" }
        );
    }

    return res.status(200).json({
      success: true,
      message: `Subscription for ${teacherExists.name} has been reset to default`,
      data: teacher
    });
  } catch (error: any) {
    console.error("resetTeacherSubscription error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to reset subscription" 
    });
  }
};
/**
 * Manually reset a parent's subscription to FREE.
 */
export const resetParentSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Parent ID is required" });
    }

    // Update parent plan to FREE and clear dates
    const parent = await prisma.parent.update({
      where: { id },
      data: {
        plan: "FREE",
        subscriptionStatus: SubscriptionStatus.INACTIVE,
        isTrialActive: false,
        trialEndsAt: null,
        subscriptionEnd: null,
        planId: null
      }
    });

    // Delete any active user_subscriptions for this parent
    await prisma.userSubscription.deleteMany({
      where: { userId: id, userType: "PARENT" }
    });

    // Log the action
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
      await createActivityLog(
        loggingStaff.id,
        "RESET_PARENT_SUBSCRIPTION",
        "Parent",
        id,
        { parentName: parent.fullName }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Subscription for ${parent.fullName} has been reset to FREE tier.`
    });
  } catch (error: any) {
    console.error("resetParentSubscription error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to reset subscription" 
    });
  }
};
