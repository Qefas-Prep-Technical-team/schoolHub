import { Request, Response } from "express";
import prisma from "../../../config/database";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { createActivityLog } from "../logs/logs.controller";
import { getSingleString } from "../../../utils/request-utils";
import { PricingService } from "../billing/pricing.service";
import { getIO } from "../../../socket";

/**
 * Search schools for support purposes
 */
export const searchSchools = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 10 } = req.query as { query?: string; page?: string; limit?: string };
    const skip = (Number(page) - 1) * Number(limit);
    
    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where: {
          OR: [
            { name: { contains: query as string, mode: 'insensitive' } },
            { tenantId: { contains: query as string, mode: 'insensitive' } },
            { schoolCode: { contains: query as string, mode: 'insensitive' } },
          ]
        },
        select: {
          id: true,
          name: true,
          tenantId: true,
          schoolCode: true,
          subscriptionStatus: true,
          plan: true,
          createdAt: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.school.count({
        where: {
          OR: [
            { name: { contains: query as string, mode: 'insensitive' } },
            { tenantId: { contains: query as string, mode: 'insensitive' } },
            { schoolCode: { contains: query as string, mode: 'insensitive' } },
          ]
        }
      })
    ]);

    return res.status(200).json({ 
      success: true, 
      data: schools,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Search schools failed:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

/**
 * Toggle school suspension status
 */
export const toggleSchoolStatus = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { status } = req.body; // 'ACTIVE', 'SUSPENDED', etc.

    const school = await prisma.school.update({
      where: { id },
      data: { subscriptionStatus: status }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            status === 'ACTIVE' ? "ACTIVATE_SCHOOL" : "SUSPEND_SCHOOL",
            "School",
            id,
            { schoolName: school.name }
        );
    }

    return res.status(200).json({
      success: true,
      message: `School ${school.name} is now ${status}`,
      data: school
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update school status" });
  }
};

/**
 * Support Impersonation Logic
 * Generates a standard tenant admin token for a school admin.
 */
export const impersonateAdmin = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.body;

    // Find first active admin for this school
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { schoolId, active: true },
      include: { admin: true }
    });

    if (!schoolAdmin) {
      return res.status(404).json({ success: false, message: "No active admin found for this school" });
    }

    const { admin } = schoolAdmin;

    // Generate a standard JWT token (matching the normal auth flow)
    const token = jwt.sign(
      { 
        userId: admin.id, 
        userType: "ADMIN",
        impersonatedBy: (req as any).staff?.id // Audit trail
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1h" }
    );

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "IMPERSONATE_ADMIN",
            "Admin",
            admin.id,
            { adminName: admin.name, schoolId }
        );
    }

    return res.status(200).json({
      success: true,
      message: `Impersonation token generated for ${admin.name}`,
      data: {
        token,
        schoolName: schoolAdmin.schoolId, // Should probably return actual school name if needed
        adminName: admin.name
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Impersonation failed" });
  }
};

/**
 * List support tickets for Support Agents
 */
export const listTickets = async (req: Request, res: Response) => {
  try {
      const tickets = await prisma.supportTicket.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
              _count: { select: { messages: true } }
          }
      });
      return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
      console.error("List tickets error:", error);
      return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

/**
 * Get ticket details with messages Document
 */
export const getTicketSupportDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } }
      }
    });

    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load ticket" });
  }
};

/**
 * Update ticket status/priority
 */
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, priority } = req.body;
    
    // Convert status/priority if passed, otherwise ignore
    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data
    });
    
    // Broadcast status change 
    getIO().to(`ticket:${id}`).emit("ticket_updated", ticket);
    
    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update ticket" });
  }
};

/**
 * Console agent replies to a ticket
 */
export const replyToTicket = async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id as string;
    const { content } = req.body;
    const staff = (req as any).staff;

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        content,
        senderId: staff.id,
        senderName: staff.fullName,
        senderRole: "SUPPORT_AGENT"
      }
    });
    
    // Update ticket time and status to IN_PROGRESS so users see it's being handled
    const currentTicket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if(currentTicket?.status === "OPEN" || currentTicket?.status === "RESOLVED") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date(), status: "IN_PROGRESS" }
      });
    }

    // Broadcast new message to the room
    getIO().to(`ticket:${ticketId}`).emit("new_message", message);

    // Create activity log
    await createActivityLog(
        staff.id,
        "SUPPORT_TICKET_REPLY",
        "SupportTicket",
        ticketId,
        { contentSnippet: content.slice(0, 50) }
    );

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to reply to ticket" });
  }
};

/**
 * Update school usage limits (overrides)
 */
export const updateSchoolLimits = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { maxStudents, maxExams, maxClasses, maxStorageGb } = req.body;

    const school = await prisma.school.update({
      where: { id },
      data: {
        maxStudentsOverride: maxStudents !== undefined ? Number(maxStudents) : undefined,
        maxExamsOverride: maxExams !== undefined ? Number(maxExams) : undefined,
        maxClassesOverride: maxClasses !== undefined ? Number(maxClasses) : undefined,
        maxStorageGbOverride: maxStorageGb !== undefined ? Number(maxStorageGb) : undefined,
      }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "UPDATE_SCHOOL_LIMITS",
            "School",
            id,
            { 
                schoolName: school.name,
                limits: { maxStudents, maxExams, maxClasses, maxStorageGb }
            }
        );
    }

    return res.status(200).json({
      success: true,
      message: `Limits for ${school.name} updated successfully`,
      data: school
    });
  } catch (error) {
    console.error("Failed to update school limits:", error);
    return res.status(500).json({ success: false, message: "Failed to update school limits" });
  }
};

/**
 * Get full school details for support
 */
export const getSchoolDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const school = await prisma.school.findFirst({
      where: {
        OR: [
          { id: id },
          { tenantId: id }
        ]
      },
      include: {
        subscriptionPlan: true,
        settings: true,
        settlementAccounts: true,
        emailLogs: {
          orderBy: {
            createdAt: "desc"
          },
          take: 50 // Limit to last 50 emails for performance
        },
        _count: {
          select: {
            students: true,
            admins: true,
            Teacher_Teacher_activeSchoolIdToSchool: true, // Active teachers
            exams: true,
            classes: true
          }
        }
      }
    });

    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    return res.status(200).json({ success: true, data: school });
  } catch (error) {
    console.error("Failed to get school details:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch school details" });
  }
};

/**
 * Manually update/reset a school's subscription plan
 */
export const updateSchoolPlan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { 
      subscriptionPlanId, 
      plan, 
      subscriptionStatus, 
      subscriptionEnd,
      isTrialActive,
      trialEndsAt
    } = req.body;

    const updateData: any = {
      plan,
      subscriptionStatus,
      isTrialActive: isTrialActive ?? false,
    };

    if (subscriptionPlanId) {
      // Resolve plan ID (handle hardcoded constants if DB is out of sync)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subscriptionPlanId);
      if (!isUuid && subscriptionPlanId.includes('-')) {
        // Resolve by type (e.g., 'schools-starter' -> category='schools', type='starter')
        const parts = subscriptionPlanId.split('-');
        const category = parts[0];
        const type = parts[1];
        
        const resolved = await PricingService.getPlan(type, category);
        if (resolved?.id) {
          updateData.subscriptionPlanId = resolved.id;
        } else {
          console.warn(`Could not resolve plan constant: ${subscriptionPlanId}`);
          // Fallback: don't set subscriptionPlanId if it can't be resolved to a DB record
        }
      } else if (isUuid) {
        updateData.subscriptionPlanId = subscriptionPlanId;
      }
    }

    if (subscriptionEnd) updateData.subscriptionEnd = new Date(subscriptionEnd);
    if (trialEndsAt) updateData.trialEndsAt = new Date(trialEndsAt);

    const school = await prisma.school.update({
      where: { id },
      data: updateData,
      include: { subscriptionPlan: true }
    });

    // Create Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "MANUAL_PLAN_RESET",
            "School",
            id,
            { 
                schoolName: school.name,
                newPlan: plan,
                status: subscriptionStatus
            }
        );
    }

    return res.status(200).json({ 
      success: true, 
      message: `Plan for ${school.name} updated to ${plan || 'custom'}`,
      data: school 
    });
  } catch (error) {
    console.error("Failed to update school plan:", error);
    return res.status(500).json({ success: false, message: "Failed to update school plan" });
  }
};

/**
 * List all available subscription plans for platform support
 */
export const listAllSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const plans = await PricingService.resolveAllPlans();
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error("Failed to list plans:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

/**
 * Search students across the platform
 */
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = query ? {
      OR: [
        { name: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { studentCode: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { email: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
      ]
    } : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          name: true,
          studentCode: true,
          email: true,
          gradeLevel: true,
          subscriptionStatus: true,
          school: { select: { id: true, name: true } },
          createdAt: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);

    return res.status(200).json({ 
      success: true, 
      data: students,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Search students failed:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

/**
 * Search teachers across the platform
 */
export const searchTeachers = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = query ? {
      OR: [
        { name: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { teacherCode: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { email: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
      ]
    } : {};

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        select: {
          id: true,
          name: true,
          teacherCode: true,
          email: true,
          subscriptionStatus: true,
          primarySchool: { select: { id: true, name: true } },
          _count: { select: { teacherSubjects: true } },
          createdAt: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.teacher.count({ where })
    ]);

    return res.status(200).json({ 
      success: true, 
      data: teachers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Search teachers failed:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

/**
 * Search parents across the platform
 */
export const searchParents = async (req: Request, res: Response) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = query ? {
      OR: [
        { fullName: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { parentCode: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { email: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
      ]
    } : {};

    const [parents, total] = await Promise.all([
      prisma.parent.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          parentCode: true,
          email: true,
          subscriptionStatus: true,
          _count: { select: { children: true } },
          createdAt: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.parent.count({ where })
    ]);

    return res.status(200).json({ 
      success: true, 
      data: parents,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Search parents failed:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

/**
 * Get all platform features for management
 */
export const getPlatformFeatures = async (req: Request, res: Response) => {
  try {
    const features = await prisma.platformFeature.findMany({
      orderBy: { name: 'asc' }
    });
    return res.status(200).json({ success: true, data: features });
  } catch (error) {
    console.error("Get platform features failed:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch features" });
  }
};

/**
 * Update a platform feature's toggle states
 */
export const updatePlatformFeature = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updateData = req.body;
    
    const feature = await prisma.platformFeature.update({
      where: { id },
      data: updateData
    });
    
    return res.status(200).json({ 
      success: true, 
      message: `Feature ${feature.name} updated successfully`,
      data: feature 
    });
  } catch (error) {
    console.error("Update platform feature failed:", error);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};/**
 * Get enabled features for a specific role (Public/End-user)
 */
export const getPublicRoleFeatures = async (req: Request, res: Response) => {
    try {
        const { role } = req.params as { role: string };
        const validRoles = ['student', 'teacher', 'parent', 'admin'];
        
        if (!validRoles.includes(role.toLowerCase())) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const features = await prisma.platformFeature.findMany();
        
        const featureMap: Record<string, boolean> = {};
        features.forEach(f => {
            const roleKey = `${role.toLowerCase()}Enabled` as keyof typeof f;
            featureMap[f.featureKey] = !!f[roleKey];
        });

        res.json({
            status: "success",
            data: featureMap
        });
    } catch (error) {
        console.error("Error fetching public features:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get full student details for support
 */
export const getStudentDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            schoolCode: true,
            tenantId: true
          }
        },
        department: true,
        classes: {
          include: {
            class: true
          }
        },
        parentLinks: {
          include: {
            parent: true
          }
        },
        subscription: true,
        _count: {
          select: {
            attendances: true,
            behaviourAlerts: true,
            examAttempts: true,
            grades: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Failed to get student details:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch student details" });
  }
};

/**
 * Manually update a student's subscription plan
 */
export const updateStudentPlan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { 
      subscriptionPlanId, 
      plan, 
      subscriptionStatus, 
      subscriptionEnd,
      isTrialActive,
      trialEndsAt
    } = req.body;

    const updateData: any = {
      plan,
      subscriptionStatus,
      isTrialActive: isTrialActive ?? false,
    };

    if (subscriptionPlanId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subscriptionPlanId);
      if (!isUuid && subscriptionPlanId.includes('-')) {
        const parts = subscriptionPlanId.split('-');
        const category = parts[0];
        const type = parts[1];
        
        const resolved = await PricingService.getPlan(type, category);
        if (resolved?.id) {
          updateData.subscriptionPlanId = resolved.id;
        }
      } else if (isUuid) {
        updateData.subscriptionPlanId = subscriptionPlanId;
      }
    }

    if (subscriptionEnd) updateData.subscriptionEnd = new Date(subscriptionEnd);
    if (trialEndsAt) updateData.trialEndsAt = new Date(trialEndsAt);

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: { subscription: true }
    });

    // Create Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "MANUAL_PLAN_RESET_STUDENT",
            "Student",
            id,
            { 
                studentName: student.name,
                newPlan: plan,
                status: subscriptionStatus
            }
        );
    }

    return res.status(200).json({ 
      success: true, 
      message: `Plan for ${student.name} updated to ${plan || 'custom'}`,
      data: student 
    });
  } catch (error) {
    console.error("Failed to update student plan:", error);
    return res.status(500).json({ success: false, message: "Failed to update student plan" });
  }
};

/**
 * Get full teacher details for support
 */
export const getTeacherDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { id: id },
          { teacherCode: id }
        ]
      },
      include: {
        primarySchool: {
          select: {
            id: true,
            name: true,
            schoolCode: true,
            tenantId: true
          }
        },
        teacherSubjects: {
          include: {
            subject: true
          }
        },
        classTeachers: {
          include: {
            class: true
          }
        },
        subscription: true,
        _count: {
          select: {
            teacherSubjects: true,
            classTeachers: true,
            exams: true
          }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    return res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error("Failed to get teacher details:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch teacher details" });
  }
};

/**
 * Manually update a teacher's subscription plan
 */
export const updateTeacherPlan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { 
      subscriptionPlanId, 
      plan, 
      subscriptionStatus, 
      subscriptionEnd,
      isTrialActive,
      trialEndsAt
    } = req.body;

    const updateData: any = {
      plan,
      subscriptionStatus,
      isTrialActive: isTrialActive ?? false,
    };

    if (subscriptionPlanId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subscriptionPlanId);
      if (!isUuid && subscriptionPlanId.includes('-')) {
        const parts = subscriptionPlanId.split('-');
        const category = parts[0];
        const type = parts[1];
        
        const resolved = await PricingService.getPlan(type, category);
        if (resolved?.id) {
          updateData.subscriptionPlanId = resolved.id;
        }
      } else if (isUuid) {
        updateData.subscriptionPlanId = subscriptionPlanId;
      }
    }

    if (subscriptionEnd) updateData.subscriptionEnd = new Date(subscriptionEnd);
    if (trialEndsAt) updateData.trialEndsAt = new Date(trialEndsAt);

    const teacher = await prisma.teacher.update({
      where: { id },
      data: updateData,
      include: { subscription: true }
    });

    // Create Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "MANUAL_PLAN_RESET_TEACHER",
            "Teacher",
            id,
            { 
                teacherName: teacher.name,
                newPlan: plan,
                status: subscriptionStatus
            }
        );
    }

    return res.status(200).json({ 
      success: true, 
      message: `Plan for ${teacher.name} updated to ${plan || 'custom'}`,
      data: teacher 
    });
  } catch (error) {
    console.error("Failed to update teacher plan:", error);
    return res.status(500).json({ success: false, message: "Failed to update teacher plan" });
  }
};

/**
 * Get detailed information about a specific parent for platform support.
 */
export const getParentDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const parent = await prisma.parent.findFirst({
      where: {
        OR: [
          { id: id },
          { parentCode: id }
        ]
      },
      include: {
        children: {
          include: {
            student: {
              include: {
                school: {
                  select: {
                    id: true,
                    name: true,
                    schoolCode: true
                  }
                }
              }
            }
          }
        },
        subscription: true,
        _count: {
          select: {
            children: true,
            payments: true
          }
        }
      }
    });

    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }

    return res.status(200).json({ 
      success: true, 
      data: parent
    });
  } catch (error) {
    console.error("Failed to fetch parent details:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch parent details" });
  }
};

/**
 * Manually update a parent's subscription plan (platform override).
 */
export const updateParentPlan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { plan, subscriptionStatus, trialEndsAt, subscriptionEnd } = req.body;

    const parent = await prisma.parent.update({
      where: { id },
      data: {
        plan: plan !== undefined ? plan : undefined,
        subscriptionStatus: subscriptionStatus !== undefined ? subscriptionStatus : undefined,
        trialEndsAt: trialEndsAt !== undefined ? (trialEndsAt ? new Date(trialEndsAt) : null) : undefined,
        subscriptionEnd: subscriptionEnd !== undefined ? (subscriptionEnd ? new Date(subscriptionEnd) : null) : undefined,
      }
    });

    // Create Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "MANUAL_PLAN_OVERRIDE_PARENT",
            "Parent",
            id,
            { 
                parentName: parent.fullName,
                newPlan: plan,
                status: subscriptionStatus
            }
        );
    }

    return res.status(200).json({ 
      success: true, 
      message: `Plan for ${parent.fullName} updated to ${plan || 'custom'}`,
      data: parent 
    });
  } catch (error) {
    console.error("Failed to update parent plan:", error);
    return res.status(500).json({ success: false, message: "Failed to update parent plan" });
  }
};
