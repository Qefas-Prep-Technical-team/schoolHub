import { Request, Response } from "express";
import prisma, { withRetry } from "../../../config/database";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createActivityLog } from "../logs/logs.controller";
import { getSingleString } from "../../../utils/request-utils";
import { getSchoolUsageService } from "../../subscription/quota.service";
import { PricingService } from "../billing/pricing.service";
import { getIO } from "../../../socket";
import { handleError } from "../../../utils/error-handler";
import { createNotification } from "../../notification/notification.service";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Search schools for support purposes
 */
export const searchSchools = async (req: Request, res: Response) => {
  try {
    const { query, plan, status, page = 1, limit = 10 } = req.query as { query?: string; plan?: string; status?: string; page?: string; limit?: string };
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { tenantId: { contains: query as string, mode: 'insensitive' } },
        { schoolCode: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    if (plan && plan !== 'ALL') {
      where.OR = [
        { plan: plan },
        { subscriptionPlanId: plan },
        { planId: plan }
      ];
    }

    if (status && status !== 'ALL') {
      where.subscriptionStatus = status;
    }

    const [schools, total, allPlans] = await Promise.all([
      prisma.school.findMany({
        where,
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
      prisma.school.count({ where }),
      // Fetch all institutional plans
      prisma.subscriptionPlan.findMany({
        where: { 
            OR: [
                { planScope: 'SCHOOL' },
                { category: 'schools' },
                { category: 'INSTITUTION' }
            ],
            isActive: true 
        },
        orderBy: { sortOrder: 'asc' }
      })
    ]);

    // Count schools and return rich tier metadata for each plan
    const planBreakdown = await Promise.all(allPlans.map(async (p) => {
        const count = await prisma.school.count({
            where: { 
                OR: [
                    { subscriptionPlanId: p.id },
                    { planId: p.id },
                    { plan: p.type.toUpperCase() },
                    { plan: p.name }
                ]
            }
        });
        return {
            id: p.id,
            name: p.name,
            count,
            type: p.type,
            monthlyPrice: p.monthlyPrice,
            yearlyPrice: p.yearlyPrice,
            maxStudents: p.maxStudents,
            maxTeachers: p.maxTeachers,
            maxClasses: p.maxClasses,
            maxExams: p.maxExams,
            maxStorageGb: p.maxStorageGb,
            badgeLabel: p.badgeLabel,
            isPopular: p.isPopular,
            description: p.description
        };
    }));

    // Status Breakdown for specific requirement
    const [paidCount, expiredCount, cancelledCount, trialCount] = await Promise.all([
        prisma.school.count({ where: { subscriptionStatus: 'ACTIVE', isTrialActive: false, plan: { not: 'FREE' } } }),
        prisma.school.count({ where: { subscriptionStatus: 'EXPIRED' } }),
        prisma.school.count({ where: { subscriptionStatus: 'CANCELLED' } }),
        prisma.school.count({ where: { isTrialActive: true } })
    ]);

    const statusBreakdown = [
        { name: 'Paid', count: paidCount, type: 'PAID' },
        { name: 'Expired', count: expiredCount, type: 'EXPIRED' },
        { name: 'Cancelled', count: cancelledCount, type: 'CANCELLED' },
        { name: 'Trial', count: trialCount, type: 'TRIAL' }
    ];

    return res.status(200).json({ 
      success: true, 
      data: schools,
      planBreakdown,
      statusBreakdown,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return handleError(res, error, "support.searchSchools");
  }
};

/**
 * Toggle school suspension/deactivation status
 */
export const toggleSchoolStatus = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { status, isActive } = req.body as { status?: string; isActive?: boolean }; // 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'

    const shouldDeactivate = isActive === false || status === 'DEACTIVATED' || status === 'SUSPENDED';
    const targetStatus = shouldDeactivate ? (status || 'DEACTIVATED') : 'ACTIVE';

    const school = await prisma.school.update({
      where: { id },
      data: { subscriptionStatus: targetStatus }
    });

    // Synchronize school admins and revoke active sessions when deactivated
    const schoolAdmins = await prisma.schoolAdmin.findMany({
      where: { schoolId: id },
      select: { adminId: true }
    });
    const adminIds = schoolAdmins.map((sa) => sa.adminId).filter(Boolean);

    if (shouldDeactivate) {
      await prisma.schoolAdmin.updateMany({
        where: { schoolId: id },
        data: { active: false }
      });
      if (adminIds.length > 0) {
        await prisma.admin.updateMany({
          where: { id: { in: adminIds } },
          data: { isActive: false, status: 'DEACTIVATED' }
        });
        await prisma.refreshToken.updateMany({
          where: { userId: { in: adminIds } },
          data: { isValid: false }
        });
      }
    } else {
      await prisma.schoolAdmin.updateMany({
        where: { schoolId: id },
        data: { active: true }
      });
      if (adminIds.length > 0) {
        await prisma.admin.updateMany({
          where: { id: { in: adminIds } },
          data: { isActive: true, status: 'ACTIVE' }
        });
      }
    }

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
      await createActivityLog(
        loggingStaff.id,
        shouldDeactivate ? "SUSPEND_SCHOOL" : "ACTIVATE_SCHOOL",
        "School",
        id,
        { schoolName: school.name, status: targetStatus }
      );
    }

    return res.status(200).json({
      success: true,
      message: `School ${school.name} is now ${targetStatus}`,
      data: school
    });
  } catch (error) {
    return handleError(res, error, "support.toggleSchoolStatus");
  }
};

/**
 * Toggle student account active/deactivated status
 */
export const toggleStudentStatus = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { status, isActive } = req.body as { status?: string; isActive?: boolean };

    const shouldDeactivate = isActive === false || status === 'DEACTIVATED' || status === 'SUSPENDED';
    const targetIsActive = !shouldDeactivate;
    const targetStatus = shouldDeactivate ? (status || 'DEACTIVATED') : 'ACTIVE';

    const student = await prisma.student.update({
      where: { id },
      data: {
        isActive: targetIsActive,
        status: targetStatus,
      }
    });

    if (shouldDeactivate) {
      // Invalidate existing sessions
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isValid: false }
      });
    }

    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
      await createActivityLog(
        loggingStaff.id,
        targetIsActive ? "ACTIVATE_STUDENT" : "DEACTIVATE_STUDENT",
        "Student",
        id,
        { studentName: student.name, status: targetStatus }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} is now ${targetStatus}`,
      data: student
    });
  } catch (error) {
    return handleError(res, error, "support.toggleStudentStatus");
  }
};

/**
 * Toggle teacher account active/deactivated status
 */
export const toggleTeacherStatus = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { status, isActive } = req.body as { status?: string; isActive?: boolean };

    const shouldDeactivate = isActive === false || status === 'DEACTIVATED' || status === 'SUSPENDED';
    const targetIsActive = !shouldDeactivate;
    const targetStatus = shouldDeactivate ? (status || 'DEACTIVATED') : 'ACTIVE';

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        isActive: targetIsActive,
        status: targetStatus,
      }
    });

    if (shouldDeactivate) {
      // Invalidate existing sessions
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isValid: false }
      });
    }

    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
      await createActivityLog(
        loggingStaff.id,
        targetIsActive ? "ACTIVATE_TEACHER" : "DEACTIVATE_TEACHER",
        "Teacher",
        id,
        { teacherName: teacher.name, status: targetStatus }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Teacher ${teacher.name} is now ${targetStatus}`,
      data: teacher
    });
  } catch (error) {
    return handleError(res, error, "support.toggleTeacherStatus");
  }
};

/**
 * Toggle parent account active/deactivated status
 */
export const toggleParentStatus = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { status, isActive } = req.body as { status?: string; isActive?: boolean };

    const shouldDeactivate = isActive === false || status === 'DEACTIVATED' || status === 'SUSPENDED';
    const targetIsActive = !shouldDeactivate;
    const targetStatus = shouldDeactivate ? (status || 'DEACTIVATED') : 'ACTIVE';

    const parent = await prisma.parent.update({
      where: { id },
      data: {
        isActive: targetIsActive,
        status: targetStatus,
      }
    });

    if (shouldDeactivate) {
      // Invalidate existing sessions
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isValid: false }
      });
    }

    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
      await createActivityLog(
        loggingStaff.id,
        targetIsActive ? "ACTIVATE_PARENT" : "DEACTIVATE_PARENT",
        "Parent",
        id,
        { parentName: parent.fullName, status: targetStatus }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Parent ${parent.fullName} is now ${targetStatus}`,
      data: parent
    });
  } catch (error) {
    return handleError(res, error, "support.toggleParentStatus");
  }
};

/**
 * Toggle admin account active/deactivated status
 */
export const toggleAdminStatus = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { status, isActive } = req.body as { status?: string; isActive?: boolean };

    const shouldDeactivate = isActive === false || status === 'DEACTIVATED' || status === 'SUSPENDED';
    const targetIsActive = !shouldDeactivate;
    const targetStatus = shouldDeactivate ? (status || 'DEACTIVATED') : 'ACTIVE';

    const admin = await prisma.admin.update({
      where: { id },
      data: {
        isActive: targetIsActive,
        status: targetStatus,
      }
    });

    if (shouldDeactivate) {
      await prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isValid: false }
      });
    }

    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
      await createActivityLog(
        loggingStaff.id,
        targetIsActive ? "ACTIVATE_ADMIN" : "DEACTIVATE_ADMIN",
        "Admin",
        id,
        { adminName: admin.name, status: targetStatus }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Admin ${admin.name} is now ${targetStatus}`,
      data: admin
    });
  } catch (error) {
    return handleError(res, error, "support.toggleAdminStatus");
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
    return handleError(res, error, "support.impersonateAdmin");
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
    return handleError(res, error, "support.listTickets");
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
    return handleError(res, error, "support.getTicketSupportDetails");
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
    getIO().to("platform:support").emit("ticket_updated", ticket);
    if (ticket.userId) {
      getIO().to(`user:${ticket.userId}`).emit("ticket_updated", ticket);
      getIO().to(`user:${ticket.userId}`).emit("support_notification", {
        type: "STATUS_UPDATE",
        title: status ? `Ticket ${status}` : "Ticket Updated",
        content: `Your inquiry "${ticket.subject}" status was updated to ${ticket.status}.`,
        ticketId: id,
        status: ticket.status
      });
    }

    // If marked as RESOLVED or CLOSED, emit session ended to return control to AI
    if (status === "RESOLVED" || status === "CLOSED") {
      getIO().to(`ticket:${id}`).emit("session_ended");
    }

    // Notify user in-dashboard of any status change so they stay updated
    if (status && ticket.userId && ticket.userType && ticket.userType !== "GUEST") {
      try {
        const statusTitleMap: Record<string, string> = {
          IN_PROGRESS: "Support Ticket Under Investigation",
          RESOLVED: "Support Ticket Resolved",
          CLOSED: "Support Ticket Concluded",
          OPEN: "Support Ticket Reopened",
        };
        const statusMsgMap: Record<string, string> = {
          IN_PROGRESS: `Your request "${ticket.subject}" is now being actively investigated by our team.`,
          RESOLVED: `Your support ticket "${ticket.subject}" has been marked as resolved.`,
          CLOSED: `Your support inquiry "${ticket.subject}" has been concluded and closed.`,
          OPEN: `Your support inquiry "${ticket.subject}" has been reopened.`,
        };

        if (statusTitleMap[status]) {
          await createNotification({
            recipientType: ticket.userType as any,
            recipientId: ticket.userId,
            type: "GENERAL",
            title: statusTitleMap[status],
            message: statusMsgMap[status],
            meta: { ticketId: id, status, category: ticket.category }
          });
        }
      } catch (notifErr) {
        console.error("[SupportController] Failed to dispatch status update notification:", notifErr);
      }
    }

    if (status === "RESOLVED" && ticket.userEmail) {
      try {
        const isTest = process.env.RESEND_TEST?.trim() === 'true';
        const recipient = isTest ? process.env.TEST_EMAIL as string : ticket.userEmail;
        
        await resend.emails.send({
          from: process.env.MAIL_FROM as string,
          to: recipient,
          subject: "Your Support Ticket has been Resolved",
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; padding: 30px; max-width: 600px; margin: auto; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Support Ticket Resolved</h2>
              </div>
              <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello <strong>${ticket.userName || "Guest"}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">We are writing to let you know that your support request regarding:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px; margin: 15px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: 500; font-style: italic;">"${ticket.subject}"</p>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">has been fully resolved by our support team.</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">If you have any further questions or if the issue persists, please feel free to reach out to us again at any time.</p>
              </div>
              <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 13px;">
                <p style="margin: 0;">Best regards,</p>
                <p style="margin: 5px 0 0 0; font-weight: 600;">The Qefas Hub Support Team</p>
              </div>
            </div>
          `
        });
      } catch (err) {
        console.error("[SupportController] Error sending resolution notifications:", err);
      }
    }
    
    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    return handleError(res, error, "support.updateTicketStatus");
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

    const agentSenderName = staff.displayName || staff.fullName || "Support Agent";

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        content,
        senderId: staff.id,
        senderName: agentSenderName,
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

    // Broadcast new message with agent profile photo to the ticket room, platform room, and user's personal room
    const socialLinks = staff.socialLinks as any;
    const agentProfileImage =
      staff.profileImage ||
      socialLinks?.agentProfilePicture ||
      socialLinks?.avatarUrl ||
      null;

    const messageWithMeta = {
      ...message,
      senderImage: agentProfileImage,
    };

    getIO().to(`ticket:${ticketId}`).emit("new_message", messageWithMeta);
    getIO().to("platform:support").emit("ticket_message_received", {
      ticketId,
      message: messageWithMeta,
      userName: currentTicket?.userName || "User",
      subject: currentTicket?.subject,
      category: currentTicket?.category
    });

    if (currentTicket?.userId) {
      getIO().to(`user:${currentTicket.userId}`).emit("ticket_message_received", {
        ticketId,
        message: messageWithMeta,
        subject: currentTicket.subject,
        category: currentTicket.category
      });
    }

    // Notify user in-dashboard so their notification badge updates
    if (currentTicket && currentTicket.userId && currentTicket.userType && currentTicket.userType !== "GUEST") {
      createNotification({
        recipientType: currentTicket.userType as any,
        recipientId: currentTicket.userId,
        type: "GENERAL",
        title: "Support Response Received",
        message: `${agentSenderName} replied to your inquiry: "${content.slice(0, 75)}${content.length > 75 ? '...' : ''}"`,
        meta: { ticketId, category: currentTicket.category }
      }).catch(err => console.error("[SupportController] Failed notifying user of agent reply:", err));
    }

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
    return handleError(res, error, "support.replyToTicket");
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
    return handleError(res, error, "support.updateSchoolLimits");
  }
};

/**
 * Get full school details for support
 */
export const getSchoolDetails = async (req: Request, res: Response) => {
  try {
    const id = (req.params.id as string)?.trim();
    
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing school ID" });
    }

    console.log(`[PlatformSupport] Fetching school details for: ${id}`);

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
        admins: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                adminCode: true,
                profileImage: true,
                status: true,
                isActive: true,
              }
            }
          }
        },
        emailLogs: {
          orderBy: {
            createdAt: "desc"
          },
          take: 50
        },
        _count: {
          select: {
            students: true,
            admins: true,
            teachers: true, // Use base teachers relation for more reliable count
            exams: true,
            classes: true
          }
        }
      }
    });

    if (!school) {
      console.warn(`[PlatformSupport] School NOT FOUND for ID: ${id}`);
      return res.status(404).json({ success: false, message: "School not found" });
    }

    // Fetch real-time usage data
    let usageData = null;
    try {
      usageData = await getSchoolUsageService(school.id);
    } catch (e) {
      console.warn("[SupportController] Failed to fetch usage data:", e);
    }

    return res.status(200).json({ 
      success: true, 
      data: {
        ...school,
        usage: usageData
      } 
    });
  } catch (error) {
    return handleError(res, error, "support.getSchoolDetails");
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
      trialEndsAt,
      billingCycle,
      maxStudentsOverride,
      maxTeachersOverride,
      maxExamsOverride,
      maxStorageGbOverride,
      maxClassesOverride,
      maxParentsOverride,
      maxAiUsageOverride,
    } = req.body;

    const school = await prisma.$transaction(async (tx) => {
        const updateData: any = {};

        if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
        if (isTrialActive !== undefined) updateData.isTrialActive = Boolean(isTrialActive);
        if (billingCycle !== undefined) updateData.billingCycle = billingCycle;

        // Quota overrides
        if (maxStudentsOverride !== undefined) updateData.maxStudentsOverride = maxStudentsOverride === null ? null : Number(maxStudentsOverride);
        if (maxTeachersOverride !== undefined) updateData.maxTeachersOverride = maxTeachersOverride === null ? null : Number(maxTeachersOverride);
        if (maxExamsOverride !== undefined) updateData.maxExamsOverride = maxExamsOverride === null ? null : Number(maxExamsOverride);
        if (maxStorageGbOverride !== undefined) updateData.maxStorageGbOverride = maxStorageGbOverride === null ? null : Number(maxStorageGbOverride);
        if (maxClassesOverride !== undefined) updateData.maxClassesOverride = maxClassesOverride === null ? null : Number(maxClassesOverride);
        if (maxParentsOverride !== undefined) updateData.maxParentsOverride = maxParentsOverride === null ? null : Number(maxParentsOverride);
        if (maxAiUsageOverride !== undefined) updateData.maxAiUsageOverride = maxAiUsageOverride === null ? null : Number(maxAiUsageOverride);

        // Safe Plan & SubscriptionPlanId Resolution
        let resolvedPlanId: string | null = null;
        let resolvedPlanType: string = plan ? plan.toUpperCase() : "FREE";

        if (subscriptionPlanId) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subscriptionPlanId);
            if (isUuid) {
                const dbPlan = await tx.subscriptionPlan.findUnique({ where: { id: subscriptionPlanId } });
                if (dbPlan) {
                    resolvedPlanId = dbPlan.id;
                    resolvedPlanType = dbPlan.type.toUpperCase();
                }
            } else if (subscriptionPlanId.includes("-")) {
                const parts = subscriptionPlanId.split("-");
                const type = parts[1] || parts[0];
                const dbPlan = await tx.subscriptionPlan.findFirst({
                    where: { type: { equals: type, mode: "insensitive" } }
                });
                if (dbPlan) {
                    resolvedPlanId = dbPlan.id;
                    resolvedPlanType = dbPlan.type.toUpperCase();
                }
            }
        }

        if (!resolvedPlanId && plan) {
            const dbPlan = await tx.subscriptionPlan.findFirst({
                where: {
                    OR: [
                        { type: { equals: plan, mode: "insensitive" } },
                        { name: { equals: plan, mode: "insensitive" } },
                    ]
                }
            });
            if (dbPlan) {
                resolvedPlanId = dbPlan.id;
                resolvedPlanType = dbPlan.type.toUpperCase();
            }
        }

        updateData.plan = resolvedPlanType;
        if (resolvedPlanId) {
            updateData.subscriptionPlanId = resolvedPlanId;
            updateData.planId = resolvedPlanId;
        }

        // Subscription dates
        if (subscriptionEnd !== undefined) {
            updateData.subscriptionEnd = subscriptionEnd ? new Date(subscriptionEnd) : null;
        }
        if (trialEndsAt !== undefined) {
            updateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
        }

        // Update school
        const updatedSchool = await tx.school.update({
            where: { id },
            data: updateData,
            include: { subscriptionPlan: true }
        });

        const activeStatus = updatedSchool.subscriptionStatus || "ACTIVE";
        const normalizedType = updatedSchool.isTrialActive 
            ? "TRIAL" 
            : (updatedSchool.plan === "FREE" ? "FREE" : "PAID");

        // Sync SchoolSubscription table
        const finalPlanId = updatedSchool.subscriptionPlanId || 
            (await tx.subscriptionPlan.findFirst({ where: { type: { equals: "free", mode: "insensitive" } } }))?.id ||
            (await tx.subscriptionPlan.findFirst())?.id;

        if (finalPlanId) {
            await tx.schoolSubscription.upsert({
                where: { schoolId: id },
                update: {
                    subscriptionPlanId: updatedSchool.subscriptionPlanId || finalPlanId,
                    subscriptionType: normalizedType as any,
                    status: activeStatus as any,
                    expiresAt: updatedSchool.subscriptionEnd || null,
                    updatedAt: new Date()
                },
                create: {
                    schoolId: id,
                    subscriptionPlanId: finalPlanId,
                    subscriptionType: normalizedType as any,
                    status: activeStatus as any,
                    expiresAt: updatedSchool.subscriptionEnd || null,
                    startedAt: new Date()
                }
            });
        }

        // Sync all associated School Admins
        const schoolAdmins = await tx.schoolAdmin.findMany({
            where: { schoolId: id }
        });

        for (const sa of schoolAdmins) {
            await tx.admin.update({
                where: { id: sa.adminId },
                data: {
                    plan: updatedSchool.plan,
                    planId: updatedSchool.subscriptionPlanId || undefined,
                    subscriptionPlanId: updatedSchool.subscriptionPlanId || undefined,
                    subscriptionStatus: activeStatus,
                    subscriptionEnd: updatedSchool.subscriptionEnd,
                    billingCycle: updatedSchool.billingCycle,
                    isTrialActive: updatedSchool.isTrialActive,
                    trialEndsAt: updatedSchool.trialEndsAt,
                }
            });

            await tx.userSubscription.updateMany({
                where: { userId: sa.adminId },
                data: {
                    subscriptionPlanId: updatedSchool.subscriptionPlanId || undefined,
                    subscriptionType: normalizedType as any,
                    status: activeStatus as any,
                    expiresAt: updatedSchool.subscriptionEnd || null,
                    startedAt: new Date()
                }
            });
        }

        // Use PricingService to record subscription change if plan is linked
        if (updatedSchool.subscriptionPlanId) {
            try {
                await PricingService.recordSubscriptionChange({
                    entityId: id,
                    entityType: 'SCHOOL',
                    planId: updatedSchool.subscriptionPlanId,
                    status: activeStatus,
                    type: normalizedType,
                    expiresAt: updatedSchool.subscriptionEnd,
                    billingCycle: updatedSchool.billingCycle,
                    note: 'Manual plan override via platform support console',
                    staffId: (req as any).staff?.id
                });
            } catch (recordErr) {
                console.warn("[SupportController] Could not record subscription change history:", recordErr);
            }
        }

        return updatedSchool;
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
                newPlan: school.plan,
                status: school.subscriptionStatus
            }
        );
    }

    return res.status(200).json({ 
      success: true, 
      message: `Subscription for ${school.name} updated to ${school.plan} (${school.subscriptionStatus})`,
      data: school 
    });
  } catch (error) {
    return handleError(res, error, "support.updateSchoolPlan");
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
    return handleError(res, error, "support.listAllSubscriptionPlans");
  }
};

/**
 * Search students across the platform
 */
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const { query, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { studentCode: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { email: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
      ];
    }

    if (status && status !== 'ALL') {
      where.subscriptionStatus = status;
    }

    const [students, total, allPlans] = await Promise.all([
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
      prisma.student.count({ where }),
      // Fetch all student plans
      prisma.subscriptionPlan.findMany({
        where: { 
            OR: [{ planScope: 'STUDENT' }, { category: 'students' }],
            isActive: true 
        },
        orderBy: { sortOrder: 'asc' }
      })
    ]);

    // Count students for each plan
    const planBreakdown = await Promise.all(allPlans.map(async (p) => {
        const count = await prisma.student.count({
            where: { 
                OR: [{ subscriptionPlanId: p.id }, { planId: p.id }]
            }
        });
        return { id: p.id, name: p.name, count, type: p.type };
    }));

    // Status Breakdown
    const [paidCount, expiredCount, cancelledCount, trialCount] = await Promise.all([
        prisma.student.count({ where: { subscriptionStatus: 'ACTIVE', isTrialActive: false, plan: { not: 'FREE' } } }),
        prisma.student.count({ where: { subscriptionStatus: 'EXPIRED' } }),
        prisma.student.count({ where: { subscriptionStatus: 'CANCELLED' } }),
        prisma.student.count({ where: { isTrialActive: true } })
    ]);

    const statusBreakdown = [
        { name: 'Paid', count: paidCount, type: 'PAID' },
        { name: 'Expired', count: expiredCount, type: 'EXPIRED' },
        { name: 'Cancelled', count: cancelledCount, type: 'CANCELLED' },
        { name: 'Trial', count: trialCount, type: 'TRIAL' }
    ];

    return res.status(200).json({ 
      success: true, 
      data: students,
      planBreakdown,
      statusBreakdown,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return handleError(res, error, "support.searchStudents");
  }
};

/**
 * Search teachers across the platform
 */
export const searchTeachers = async (req: Request, res: Response) => {
  try {
    const { query, plan, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { teacherCode: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { email: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
      ];
    }

    if (plan && plan !== 'ALL') {
      where.OR = [
        { plan: plan },
        { subscriptionPlanId: plan },
        { planId: plan }
      ];
    }

    if (status && status !== 'ALL') {
      where.subscriptionStatus = status;
    }

    const [teachers, total, allPlans] = await Promise.all([
      prisma.teacher.findMany({
        where,
        select: {
          id: true,
          name: true,
          teacherCode: true,
          email: true,
          subscriptionStatus: true,
          school: { select: { id: true, name: true } },
          _count: { select: { classTeachers: true } },
          createdAt: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.teacher.count({ where }),
      // Fetch all teacher plans
      prisma.subscriptionPlan.findMany({
        where: { 
            OR: [{ planScope: 'TEACHER' }, { category: 'teachers' }],
            isActive: true 
        },
        orderBy: { sortOrder: 'asc' }
      })
    ]);

    // Count teachers for each plan
    const planBreakdown = await Promise.all(allPlans.map(async (p) => {
        const count = await prisma.teacher.count({
            where: { 
                OR: [{ subscriptionPlanId: p.id }, { planId: p.id }]
            }
        });
        return { id: p.id, name: p.name, count, type: p.type };
    }));

    // Status Breakdown
    const [paidCount, expiredCount, cancelledCount, trialCount] = await Promise.all([
        prisma.teacher.count({ where: { subscriptionStatus: 'ACTIVE', isTrialActive: false, plan: { not: 'FREE' } } }),
        prisma.teacher.count({ where: { subscriptionStatus: 'EXPIRED' } }),
        prisma.teacher.count({ where: { subscriptionStatus: 'CANCELLED' } }),
        prisma.teacher.count({ where: { isTrialActive: true } })
    ]);

    const statusBreakdown = [
        { name: 'Paid', count: paidCount, type: 'PAID' },
        { name: 'Expired', count: expiredCount, type: 'EXPIRED' },
        { name: 'Cancelled', count: cancelledCount, type: 'CANCELLED' },
        { name: 'Trial', count: trialCount, type: 'TRIAL' }
    ];

    return res.status(200).json({ 
      success: true, 
      data: teachers,
      planBreakdown,
      statusBreakdown,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return handleError(res, error, "support.searchTeachers");
  }
};

/**
 * Search parents across the platform
 */
export const searchParents = async (req: Request, res: Response) => {
  try {
    const { query, plan, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (query) {
      where.OR = [
        { fullName: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { parentCode: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
        { email: { contains: query as string, mode: 'insensitive' as Prisma.QueryMode } },
      ];
    }

    if (plan && plan !== 'ALL') {
      where.OR = [
        { plan: plan },
        { subscriptionPlanId: plan },
        { planId: plan }
      ];
    }

    if (status && status !== 'ALL') {
      where.subscriptionStatus = status;
    }

    const [parents, total, allPlans] = await Promise.all([
      prisma.parent.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          parentCode: true,
          email: true,
          subscriptionStatus: true,
          createdAt: true,
          _count: {
            select: { children: true }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.parent.count({ where }),
      // Fetch all parent plans
      prisma.subscriptionPlan.findMany({
        where: { 
            OR: [{ planScope: 'PARENT' }, { category: 'parents' }],
            isActive: true 
        },
        orderBy: { sortOrder: 'asc' }
      })
    ]);

    // Count parents for each plan
    const planBreakdown = await Promise.all(allPlans.map(async (p) => {
        const count = await prisma.parent.count({
            where: { 
                OR: [{ subscriptionPlanId: p.id }, { planId: p.id }]
            }
        });
        return { id: p.id, name: p.name, count, type: p.type };
    }));

    // Status Breakdown
    const [paidCount, expiredCount, cancelledCount, trialCount] = await Promise.all([
        prisma.parent.count({ where: { subscriptionStatus: 'ACTIVE', isTrialActive: false, plan: { not: 'FREE' } } }),
        prisma.parent.count({ where: { subscriptionStatus: 'EXPIRED' } }),
        prisma.parent.count({ where: { subscriptionStatus: 'CANCELLED' } }),
        prisma.parent.count({ where: { isTrialActive: true } })
    ]);

    const statusBreakdown = [
        { name: 'Paid', count: paidCount, type: 'PAID' },
        { name: 'Expired', count: expiredCount, type: 'EXPIRED' },
        { name: 'Cancelled', count: cancelledCount, type: 'CANCELLED' },
        { name: 'Trial', count: trialCount, type: 'TRIAL' }
    ];

    return res.status(200).json({ 
      success: true, 
      data: parents,
      planBreakdown,
      statusBreakdown,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return handleError(res, error, "support.searchParents");
  }
};

/**
 * Get all platform features for management (Redirected to Unified Manifest)
 */
export const getPlatformFeatures = async (req: Request, res: Response) => {
  try {
    const features = await prisma.platformFeature.findMany({
      include: {
        planAccess: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return res.status(200).json({ success: true, data: features });
  } catch (error) {
    return handleError(res, error, "support.getPlatformFeatures");
  }
};

/**
 * Update a platform feature's toggle states (Redirected to Unified Manifest)
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
    return handleError(res, error, "support.updatePlatformFeature");
  }
};

/**
 * Get enabled features for a specific role (Public/End-user)
 */
export const getPublicRoleFeatures = async (req: Request, res: Response) => {
    try {
        const { role } = req.params as { role: string };
        const validRoles = ['student', 'teacher', 'parent', 'admin'];
        
        if (!validRoles.includes(role.toLowerCase())) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const features = await withRetry(
            () => prisma.platformFeature.findMany(),
            "getPublicRoleFeatures_platformFeature_findMany"
        );
        
        const featureMap: Record<string, boolean> = {};
        features.forEach(f => {
            const roleKey = `${role.toLowerCase()}Enabled` as keyof typeof f;
            featureMap[f.featureKey] = !!f[roleKey];
        });

        // Inject sub_enforced logic for billing feature
        const categoryMap: Record<string, string> = {
            student: 'students',
            teacher: 'teachers',
            parent: 'parents',
            admin: 'schools'
        };
        const category = categoryMap[role.toLowerCase()];
        const enforcementSetting = await withRetry(
            () => prisma.platformSettings.findUnique({
                where: { key: `sub_enforced_${category}` }
            }),
            "getPublicRoleFeatures_platformSettings_findUnique"
        );

        if (enforcementSetting && enforcementSetting.value === "false") {
            featureMap['billing'] = false;
        }

        // Overlay explicit role page visibility from PlatformSettings if configured
        const roleVisibilitySetting = await withRetry(
            () => prisma.platformSettings.findUnique({
                where: { key: `${role.toLowerCase()}_pages_visibility` }
            }),
            "getPublicRoleFeatures_roleVisibility_findUnique"
        );

        if (roleVisibilitySetting?.value) {
            try {
                const parsedVisibility = JSON.parse(roleVisibilitySetting.value);
                if (typeof parsedVisibility === 'object' && parsedVisibility !== null) {
                    Object.entries(parsedVisibility).forEach(([k, v]) => {
                        featureMap[k] = Boolean(v);
                    });
                }
            } catch {
                // Ignore parse errors
            }
        }

        res.json({
            status: "success",
            data: featureMap
        });
    } catch (error) {
    return handleError(res, error, "support.getPublicRoleFeatures");
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
        subscriptionPlan: true,
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
    return handleError(res, error, "support.getStudentDetails");
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
      include: { subscriptionPlan: true }
    });

    // Record the change in subscription tracking tables
    if (student.subscriptionPlanId) {
        await PricingService.recordSubscriptionChange({
            entityId: id,
            entityType: 'STUDENT',
            planId: student.subscriptionPlanId,
            status: student.subscriptionStatus,
            type: student.subscriptionPlan?.type || 'PAID',
            expiresAt: student.subscriptionEnd,
            note: 'Manual plan override via platform support console',
            staffId: (req as any).staff?.id
        });
    }

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
    return handleError(res, error, "support.updateStudentPlan");
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
        subscriptionPlan: true,
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
    return handleError(res, error, "support.getTeacherDetails");
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
      include: { subscriptionPlan: true }
    });

    // Record the change in subscription tracking tables
    if (teacher.subscriptionPlanId) {
        await PricingService.recordSubscriptionChange({
            entityId: id,
            entityType: 'TEACHER',
            planId: teacher.subscriptionPlanId,
            status: teacher.subscriptionStatus,
            type: teacher.subscriptionPlan?.type || 'PAID',
            expiresAt: teacher.subscriptionEnd,
            note: 'Manual plan override via platform support console',
            staffId: (req as any).staff?.id
        });
    }

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
    return handleError(res, error, "support.updateTeacherPlan");
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
        subscriptionPlan: true,
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
    return handleError(res, error, "support.getParentDetails");
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
      },
      include: { subscriptionPlan: true }
    });

    // Record the change in subscription tracking tables
    if (parent.subscriptionPlanId) {
        await PricingService.recordSubscriptionChange({
            entityId: id,
            entityType: 'PARENT',
            planId: parent.subscriptionPlanId,
            status: parent.subscriptionStatus,
            type: parent.subscriptionPlan?.type || 'PAID',
            expiresAt: parent.subscriptionEnd,
            note: 'Manual plan override via platform support console',
            staffId: (req as any).staff?.id
        });
    }

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
    return handleError(res, error, "support.updateParentPlan");
  }
};

/**
 * Permanently delete a student alone with administrator password verification
 */
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { adminPassword, reason } = req.body as { adminPassword?: string; reason?: string };

    if (!adminPassword) {
      return res.status(400).json({ success: false, message: "Administrator password is required to permanently delete a user." });
    }

    const loggingStaff = (req as any).staff;
    const staffRecord = await prisma.platformStaff.findUnique({
      where: { id: loggingStaff?.id },
    });

    if (!staffRecord || !staffRecord.password) {
      return res.status(401).json({ success: false, message: "Staff account unauthenticated." });
    }

    const isMatch = await bcrypt.compare(adminPassword, staffRecord.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect administrator password. Deletion unauthorized." });
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.parentChildLink.deleteMany({ where: { studentId: id } });
      await tx.linkRequest.deleteMany({ where: { OR: [{ requesterStudentId: id }, { targetStudentId: id }] } });
      await tx.classEnrollment.deleteMany({ where: { studentId: id } });
      await tx.attendance.deleteMany({ where: { studentId: id } });
      await tx.behaviourAlert.deleteMany({ where: { studentId: id } });
      await tx.studentBehaviourProfile.deleteMany({ where: { studentId: id } });
      await tx.studentHistory.deleteMany({ where: { studentId: id } });
      await tx.studentEnrollment.deleteMany({ where: { studentId: id } });
      await tx.examAttempt.deleteMany({ where: { studentId: id } });
      await tx.grade.deleteMany({ where: { studentId: id } });
      await tx.studentTermResult.deleteMany({ where: { studentId: id } });
      await tx.studentSubjectTermResult.deleteMany({ where: { studentId: id } });
      await tx.termlyEvaluation.deleteMany({ where: { studentId: id } });
      await tx.payment.deleteMany({ where: { studentId: id } });
      await tx.student.delete({ where: { id } });
    });

    await createActivityLog(
      loggingStaff.id,
      "DELETE_STUDENT",
      "Student",
      id,
      {
        studentName: student.name,
        studentCode: student.studentCode,
        email: student.email,
        schoolId: student.schoolId,
        deletedBy: loggingStaff.email,
        staffName: loggingStaff.fullName,
        reason: reason || "Manual deletion via Operations Console",
        timestamp: new Date().toISOString()
      }
    );

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} has been permanently deleted.`
    });
  } catch (error) {
    return handleError(res, error, "support.deleteStudent");
  }
};

/**
 * Permanently delete a teacher alone with administrator password verification
 */
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { adminPassword, reason } = req.body as { adminPassword?: string; reason?: string };

    if (!adminPassword) {
      return res.status(400).json({ success: false, message: "Administrator password is required to permanently delete a user." });
    }

    const loggingStaff = (req as any).staff;
    const staffRecord = await prisma.platformStaff.findUnique({
      where: { id: loggingStaff?.id },
    });

    if (!staffRecord || !staffRecord.password) {
      return res.status(401).json({ success: false, message: "Staff account unauthenticated." });
    }

    const isMatch = await bcrypt.compare(adminPassword, staffRecord.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect administrator password. Deletion unauthorized." });
    }

    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.linkRequest.deleteMany({ where: { OR: [{ requesterTeacherId: id }, { targetTeacherId: id }] } });
      await tx.classTeacher.deleteMany({ where: { teacherId: id } });
      await tx.teacherSubject.deleteMany({ where: { teacherId: id } });
      await tx.teacherAttendance.deleteMany({ where: { teacherId: id } });
      await tx.timetablePeriod.deleteMany({ where: { teacherId: id } });
      await tx.subject.updateMany({ where: { teacherId: id }, data: { teacherId: null } });
      await tx.grade.deleteMany({ where: { teacherId: id } });
      await tx.teacher.delete({ where: { id } });
    });

    await createActivityLog(
      loggingStaff.id,
      "DELETE_TEACHER",
      "Teacher",
      id,
      {
        teacherName: teacher.name,
        teacherCode: teacher.teacherCode,
        email: teacher.email,
        deletedBy: loggingStaff.email,
        staffName: loggingStaff.fullName,
        reason: reason || "Manual deletion via Operations Console",
        timestamp: new Date().toISOString()
      }
    );

    return res.status(200).json({
      success: true,
      message: `Teacher ${teacher.name} has been permanently deleted.`
    });
  } catch (error) {
    return handleError(res, error, "support.deleteTeacher");
  }
};

/**
 * Permanently delete a parent alone with administrator password verification
 */
export const deleteParent = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { adminPassword, reason } = req.body as { adminPassword?: string; reason?: string };

    if (!adminPassword) {
      return res.status(400).json({ success: false, message: "Administrator password is required to permanently delete a user." });
    }

    const loggingStaff = (req as any).staff;
    const staffRecord = await prisma.platformStaff.findUnique({
      where: { id: loggingStaff?.id },
    });

    if (!staffRecord || !staffRecord.password) {
      return res.status(401).json({ success: false, message: "Staff account unauthenticated." });
    }

    const isMatch = await bcrypt.compare(adminPassword, staffRecord.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect administrator password. Deletion unauthorized." });
    }

    const parent = await prisma.parent.findUnique({ where: { id } });
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.parentChildLink.deleteMany({ where: { parentId: id } });
      await tx.linkRequest.deleteMany({ where: { OR: [{ requesterParentId: id }, { targetParentId: id }] } });
      await tx.payment.deleteMany({ where: { parentId: id } });
      await tx.parent.delete({ where: { id } });
    });

    await createActivityLog(
      loggingStaff.id,
      "DELETE_PARENT",
      "Parent",
      id,
      {
        parentName: parent.fullName,
        parentCode: parent.parentCode,
        email: parent.email,
        deletedBy: loggingStaff.email,
        staffName: loggingStaff.fullName,
        reason: reason || "Manual deletion via Operations Console",
        timestamp: new Date().toISOString()
      }
    );

    return res.status(200).json({
      success: true,
      message: `Parent ${parent.fullName} has been permanently deleted.`
    });
  } catch (error) {
    return handleError(res, error, "support.deleteParent");
  }
};

/**
 * Permanently delete an admin alone with administrator password verification
 */
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { adminPassword, reason } = req.body as { adminPassword?: string; reason?: string };

    if (!adminPassword) {
      return res.status(400).json({ success: false, message: "Administrator password is required to permanently delete an administrator." });
    }

    const loggingStaff = (req as any).staff;
    const staffRecord = await prisma.platformStaff.findUnique({
      where: { id: loggingStaff?.id },
    });

    if (!staffRecord || !staffRecord.password) {
      return res.status(401).json({ success: false, message: "Staff account unauthenticated." });
    }

    const isMatch = await bcrypt.compare(adminPassword, staffRecord.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect administrator password. Deletion unauthorized." });
    }

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.schoolAdmin.deleteMany({ where: { adminId: id } });
      await tx.admin.delete({ where: { id } });
    });

    await createActivityLog(
      loggingStaff.id,
      "DELETE_ADMIN",
      "Admin",
      id,
      {
        adminName: admin.name,
        adminCode: admin.adminCode,
        email: admin.email,
        deletedBy: loggingStaff.email,
        staffName: loggingStaff.fullName,
        reason: reason || "Manual deletion via Operations Console",
        timestamp: new Date().toISOString()
      }
    );

    return res.status(200).json({
      success: true,
      message: `Admin ${admin.name} has been permanently deleted.`
    });
  } catch (error) {
    return handleError(res, error, "support.deleteAdmin");
  }
};

/**
 * Permanently delete a school alone with administrator password verification
 */
export const deleteSchool = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { adminPassword, reason } = req.body as { adminPassword?: string; reason?: string };

    if (!adminPassword) {
      return res.status(400).json({ success: false, message: "Administrator password is required to permanently delete an institution." });
    }

    const loggingStaff = (req as any).staff;
    const staffRecord = await prisma.platformStaff.findUnique({
      where: { id: loggingStaff?.id },
    });

    if (!staffRecord || !staffRecord.password) {
      return res.status(401).json({ success: false, message: "Staff account unauthenticated." });
    }

    const isMatch = await bcrypt.compare(adminPassword, staffRecord.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect administrator password. Deletion unauthorized." });
    }

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.schoolAdmin.deleteMany({ where: { schoolId: id } });
      await tx.schoolSetting.deleteMany({ where: { schoolId: id } });
      await tx.schoolLandingPage.deleteMany({ where: { schoolId: id } });
      await tx.schoolSubscription.deleteMany({ where: { schoolId: id } });
      await tx.fileRecord.deleteMany({ where: { schoolId: id } });
      await tx.student.updateMany({ where: { schoolId: id }, data: { schoolId: null } });
      await tx.student.updateMany({ where: { originalSchoolId: id }, data: { originalSchoolId: null } });
      await tx.teacher.updateMany({ where: { schoolId: id }, data: { schoolId: null, activeSchoolId: null, currentSchoolId: null, primarySchoolId: null } });
      await tx.class.deleteMany({ where: { schoolId: id } });
      await tx.subject.deleteMany({ where: { schoolId: id } });
      await tx.school.delete({ where: { id } });
    });

    await createActivityLog(
      loggingStaff.id,
      "DELETE_SCHOOL",
      "School",
      id,
      {
        schoolName: school.name,
        schoolCode: school.schoolCode,
        tenantId: school.tenantId,
        deletedBy: loggingStaff.email,
        staffName: loggingStaff.fullName,
        reason: reason || "Manual deletion via Operations Console",
        timestamp: new Date().toISOString()
      }
    );

    return res.status(200).json({
      success: true,
      message: `School ${school.name} has been permanently deleted.`
    });
  } catch (error) {
    return handleError(res, error, "support.deleteSchool");
  }
};

/**
 * @desc Get all compliance requests (Account deactivations & data deletion requests) and deactivated accounts across the ecosystem
 * @route GET /api/platform/support/compliance-requests
 */
export const listComplianceRequests = async (req: Request, res: Response) => {
  try {
    const { category, status, search, role } = req.query as {
      category?: string;
      status?: string;
      search?: string;
      role?: string;
    };

    // 1. Fetch compliance tickets (Data deletion & account deactivation requests)
    const ticketWhere: any = {
      category: category ? category : { in: ["COMPLIANCE_DATA_DELETION", "COMPLIANCE_ACCOUNT_DEACTIVATION"] },
    };

    if (status) {
      ticketWhere.status = status;
    }

    if (role && role !== "ALL") {
      ticketWhere.userType = role.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      ticketWhere.OR = [
        { userEmail: { contains: q, mode: "insensitive" } },
        { userName: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
      ];
    }

    const tickets = await prisma.supportTicket.findMany({
      where: ticketWhere,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { messages: true } },
      },
    });

    // 2. Fetch all currently deactivated users across all 4 role tables
    const q = search && search.trim() ? search.trim() : null;

    let deactivatedStudents: any[] = [];
    let deactivatedTeachers: any[] = [];
    let deactivatedAdmins: any[] = [];
    let deactivatedParents: any[] = [];

    const baseWhere = {
      OR: [{ isActive: false }, { status: "DEACTIVATED" }],
    };

    if (!role || role === "ALL" || role.toUpperCase() === "STUDENT") {
      deactivatedStudents = await prisma.student.findMany({
        where: q ? {
          AND: [
            baseWhere,
            {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
                { studentCode: { contains: q, mode: "insensitive" } },
              ]
            }
          ]
        } : baseWhere,
        select: {
          id: true,
          name: true,
          email: true,
          studentCode: true,
          status: true,
          isActive: true,
          updatedAt: true,
          createdAt: true,
          school: { select: { id: true, name: true, schoolCode: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      });
    }

    if (!role || role === "ALL" || role.toUpperCase() === "TEACHER") {
      deactivatedTeachers = await prisma.teacher.findMany({
        where: q ? {
          AND: [
            baseWhere,
            {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
                { teacherCode: { contains: q, mode: "insensitive" } },
              ]
            }
          ]
        } : baseWhere,
        select: {
          id: true,
          name: true,
          email: true,
          teacherCode: true,
          status: true,
          isActive: true,
          updatedAt: true,
          createdAt: true,
          school: { select: { id: true, name: true, schoolCode: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      });
    }

    if (!role || role === "ALL" || role.toUpperCase() === "ADMIN") {
      deactivatedAdmins = await prisma.admin.findMany({
        where: q ? {
          AND: [
            baseWhere,
            {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
                { adminCode: { contains: q, mode: "insensitive" } },
              ]
            }
          ]
        } : baseWhere,
        select: {
          id: true,
          name: true,
          email: true,
          adminCode: true,
          status: true,
          isActive: true,
          updatedAt: true,
          createdAt: true,
          schoolAdmins: { select: { school: { select: { id: true, name: true, schoolCode: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      });
    }

    if (!role || role === "ALL" || role.toUpperCase() === "PARENT") {
      deactivatedParents = await prisma.parent.findMany({
        where: q ? {
          AND: [
            baseWhere,
            {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { fullName: { contains: q, mode: "insensitive" } },
                { parentCode: { contains: q, mode: "insensitive" } },
              ]
            }
          ]
        } : baseWhere,
        select: {
          id: true,
          fullName: true,
          email: true,
          parentCode: true,
          status: true,
          isActive: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      });
    }

    // Format deactivated users into a standardized shape
    const deactivatedUsers = [
      ...deactivatedStudents.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        code: s.studentCode,
        role: "STUDENT",
        status: s.status,
        isActive: s.isActive,
        deactivatedAt: s.updatedAt,
        createdAt: s.createdAt,
        schoolName: s.school?.name || null,
      })),
      ...deactivatedTeachers.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        code: t.teacherCode,
        role: "TEACHER",
        status: t.status,
        isActive: t.isActive,
        deactivatedAt: t.updatedAt,
        createdAt: t.createdAt,
        schoolName: t.school?.name || null,
      })),
      ...deactivatedAdmins.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        code: a.adminCode,
        role: "ADMIN",
        status: a.status,
        isActive: a.isActive,
        deactivatedAt: a.updatedAt,
        createdAt: a.createdAt,
        schoolName: a.schoolAdmins?.[0]?.school?.name || null,
      })),
      ...deactivatedParents.map(p => ({
        id: p.id,
        name: p.fullName,
        email: p.email,
        code: p.parentCode,
        role: "PARENT",
        status: p.status,
        isActive: p.isActive,
        deactivatedAt: p.updatedAt,
        createdAt: p.createdAt,
        schoolName: null,
      })),
    ].sort((a, b) => new Date(b.deactivatedAt).getTime() - new Date(a.deactivatedAt).getTime());

    // Summary counts
    const totalDeletionRequests = tickets.filter(t => t.category === "COMPLIANCE_DATA_DELETION").length;
    const pendingDeletionRequests = tickets.filter(t => t.category === "COMPLIANCE_DATA_DELETION" && t.status !== "RESOLVED" && t.status !== "CLOSED").length;
    const totalDeactivationTickets = tickets.filter(t => t.category === "COMPLIANCE_ACCOUNT_DEACTIVATION").length;

    return res.status(200).json({
      success: true,
      data: {
        tickets,
        deactivatedUsers,
        summary: {
          totalDeletionRequests,
          pendingDeletionRequests,
          totalDeactivationTickets,
          totalDeactivatedUsers: deactivatedUsers.length,
          totalStudentsDeactivated: deactivatedStudents.length,
          totalTeachersDeactivated: deactivatedTeachers.length,
          totalAdminsDeactivated: deactivatedAdmins.length,
          totalParentsDeactivated: deactivatedParents.length,
        }
      }
    });
  } catch (error) {
    return handleError(res, error, "support.listComplianceRequests");
  }
};
