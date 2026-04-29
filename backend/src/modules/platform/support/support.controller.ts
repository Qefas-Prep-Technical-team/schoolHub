import { Request, Response } from "express";
import prisma from "../../../config/database";
import jwt from "jsonwebtoken";
import { createActivityLog } from "../logs/logs.controller";
import { getSingleString } from "../../../utils/request-utils";

/**
 * Search schools for support purposes
 */
export const searchSchools = async (req: Request, res: Response) => {
  try {
    const query = getSingleString(req.query.query as string);
    const schools = await prisma.school.findMany({
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
      take: 20
    });
    return res.status(200).json({ success: true, data: schools });
  } catch (error) {
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
 * List support tickets (Placeholder/Minimal)
 */
export const listTickets = async (req: Request, res: Response) => {
  try {
      // Assuming SupportTicket model exists from Step B
      const tickets = await (prisma as any).supportTicket.findMany({
          orderBy: { createdAt: 'desc' },
          include: { school: { select: { name: true } } }
      });
      return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
      return res.status(200).json({ success: true, data: [], message: 'Ticketing system initialized' });
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
