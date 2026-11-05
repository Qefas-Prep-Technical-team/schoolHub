import prisma from "../../config/database";
import { Request, Response } from "express";
import { $Enums, AdminRole, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { updateAdminProfileService, createStudentService } from "./admin.service";
import { getSingleString } from "../../utils/request-utils";
import { createStudentSchema } from "./admin.schema";
import crypto from "crypto";
import {
  sendStudentInvitationEmail,
  sendAdminJoinRequestEmail,
  sendAdminApprovalEmail,
  sendAdminRejectionEmail,
  sendNewAdminJoinedEmail,
  sendAdminLimitReachedEmail,
} from "../auth/auth.service";
import { createNotification } from "../notification/notification.service";
import { UserSubscriptionService } from "../subscription/user-subscription.service";
import { getSchoolUsageService } from "../subscription/quota.service";
import { handleError } from "../../utils/error-handler";
import { generateUniqueCode } from "../../utils/code-generator";

const getAuthorizedSchoolIds = (req: Request): string[] => {
  const user = req.user as any;
  if (!user) return [];

  const schoolIds = new Set<string>();

  if (user.schoolId) schoolIds.add(user.schoolId);
  if (user.tenantId) schoolIds.add(user.tenantId);

  if (Array.isArray(user.schools)) {
    for (const school of user.schools) {
      if (school?.schoolId) schoolIds.add(school.schoolId);
      if (school?.id) schoolIds.add(school.id);
    }
  }

  return [...schoolIds];
};

const hasSchoolAccess = async (req: Request, schoolId: string): Promise<boolean> => {
  const user = req.user as any;
  if (!user) return false;

  if (user.userType === "SUPER_ADMIN" || user.role === "SUPER_ADMIN") {
    return true;
  }

  const authorizedSchoolIds = getAuthorizedSchoolIds(req);
  if (authorizedSchoolIds.includes(schoolId)) {
    return true;
  }

  const schoolAdmin = await prisma.schoolAdmin.findFirst({
    where: {
      adminId: user.id,
      schoolId,
      active: true,
    },
    select: { id: true },
  });

  return Boolean(schoolAdmin);
};

// Step 1: Verify tenant ID and get school info
export const verifyTenantId = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required",
      });
    }

    // Find school by tenantId
    const school = await prisma.school.findFirst({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        tenantId: true,
        subdomain: true,
        schoolEmail: true,
        address: true,
        phone: true,
      },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "Invalid Tenant ID. School not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tenant ID verified successfully",
      data: {
        school,
        redirectTo: `/register/admin?schoolId=${school.id}&tenantId=${tenantId}`,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "admin.verifyTenantId");
  }
};

// ─── Verify School Code (new user-friendly flow) ──────────────────────────────
export const verifySchoolCode = async (req: Request, res: Response) => {
  try {
    const { schoolCode } = req.body;

    if (!schoolCode || typeof schoolCode !== 'string' || !schoolCode.trim()) {
      return res.status(400).json({ success: false, message: "School code is required" });
    }

    const school = await prisma.school.findFirst({
      where: { schoolCode: schoolCode.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        tenantId: true,
        subdomain: true,
        schoolEmail: true,
        address: true,
        phone: true,
      },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "No school found with that code. Please check and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School found",
      data: { school },
    });
  } catch (error: any) {
    return handleError(res, error, "admin.verifySchoolCode");
  }
};

// ─── Admin Self-Registration (school-code based) ──────────────────────────────
interface AdminSelfRegisterBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  schoolCode: string;
}

export const registerAdminSelf = async (
  req: Request<{}, {}, AdminSelfRegisterBody>,
  res: Response,
) => {
  try {
    const { name, email, password, confirmPassword, schoolCode } = req.body;

    if (!name || !email || !password || !confirmPassword || !schoolCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Look up school by schoolCode
    const school = await prisma.school.findFirst({
      where: { schoolCode: schoolCode.trim().toLowerCase() },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "Invalid school code. Please verify and try again.",
      });
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Check plan limit for admins
    const schoolUsage = await getSchoolUsageService(school.id);
    const linkingFeature = schoolUsage.planFeatures.find((f: any) => f.tag === 'linkingHub');
    
    // If the feature exists, has a limit (not unlimited), and usage is >= limit
    if (linkingFeature && linkingFeature.enabled && !linkingFeature.isUnlimited && linkingFeature.limit !== null) {
      if (linkingFeature.usageCount >= linkingFeature.limit) {
        // Send email and notification to existing admins
        await notifyLimitReached(school.id, school.name, name, email);
        return res.status(403).json({
          success: false,
          message: "Admin slot filled, contact the school for assistance",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminCode = await generateUniqueCode(prisma, "admin", name);

    // Create admin + SchoolAdmin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const admin = await tx.admin.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: UserRole.ADMIN,
          tenantId: school.tenantId,
          verified: false,
          status: "PENDING",
          adminCode,
        },
      });

      // Role is PENDING — will be assigned by approver
      await tx.schoolAdmin.create({
        data: {
          schoolId: school.id,
          adminId: admin.id,
          role: AdminRole.PENDING,
        },
      });

      await UserSubscriptionService.initializeFreePlan(admin.id, UserRole.ADMIN, tx);

      return { admin };
    });

    // Notify all SCHOOL_OWNERs and PRINCIPALs via email + in-app notification
    await notifyApprovers(school.id, school.name, result.admin);

    return res.status(201).json({
      success: true,
      message: "Registration submitted. You will be notified once approved.",
      data: {
        admin: {
          id: result.admin.id,
          name: result.admin.name,
          email: result.admin.email,
          status: result.admin.status,
        },
        school: { id: school.id, name: school.name },
      },
    });
  } catch (error: any) {
    return handleError(res, error, "admin.registerAdminSelf");
  }
};

// ─── Internal: notify all approvers (SCHOOL_OWNER + PRINCIPAL) ───────────────
const notifyApprovers = async (schoolId: string, schoolName: string, pendingAdmin: { id: string; name: string; email: string }) => {
  try {
    const approvers = await prisma.schoolAdmin.findMany({
      where: {
        schoolId,
        active: true,
        role: { in: [AdminRole.SCHOOL_OWNER, AdminRole.PRINCIPAL] },
      },
      include: { admin: { select: { id: true, email: true, name: true } } },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://qefashub.com';
    const approvalUrl = `${frontendUrl}/dashboard/admin/team?tab=pending`;

    await Promise.allSettled(
      approvers.map(async (approver) => {
        // Email notification
        await sendAdminJoinRequestEmail({
          recipientEmail: approver.admin.email,
          recipientName: approver.admin.name,
          applicantName: pendingAdmin.name,
          applicantEmail: pendingAdmin.email,
          schoolName,
          approvalUrl,
        });

        // In-app notification
        await createNotification({
          recipientType: 'ADMIN',
          recipientId: approver.admin.id,
          type: 'GENERAL',
          title: 'New Admin Registration Request',
          message: `${pendingAdmin.name} (${pendingAdmin.email}) has requested to join ${schoolName} as an administrator. Review and assign their role.`,
        });
      })
    );
  } catch (error) {
    // Fire-and-forget — log but don't break the registration response
    console.error("[admin.notifyApprovers] Error:", error);
  }
};

// ─── Internal: notify all approvers that limit was reached ───────────────
const notifyLimitReached = async (schoolId: string, schoolName: string, applicantName: string, applicantEmail: string) => {
  try {
    const approvers = await prisma.schoolAdmin.findMany({
      where: {
        schoolId,
        active: true,
        role: { in: [AdminRole.SCHOOL_OWNER, AdminRole.PRINCIPAL] },
      },
      include: { admin: { select: { id: true, email: true, name: true } } },
    });

    await Promise.allSettled(
      approvers.map(async (approver) => {
        // Email notification
        await sendAdminLimitReachedEmail({
          recipientEmail: approver.admin.email,
          recipientName: approver.admin.name,
          applicantName,
          applicantEmail,
          schoolName,
        });

        // In-app notification
        await createNotification({
          recipientType: 'ADMIN',
          recipientId: approver.admin.id,
          type: 'GENERAL',
          title: 'Admin Registration Blocked - Limit Reached',
          message: `${applicantName} (${applicantEmail}) tried to join as an admin, but your plan's Admin Linking slot is filled. Upgrade to a higher tier to add more admins.`,
        });
      })
    );
  } catch (error) {
    console.error("[admin.notifyLimitReached] Error:", error);
  }
};

// Team Management Handlers (decomposed into ./controllers/admin-team.controller.ts)
export { checkAdminStatus, getPendingAdmins, approveAdmin, rejectAdmin, getSchoolAdmins, updateAdminRole, transferOwnership, removeAdmin } from './controllers/admin-team.controller';

// School Directory Handlers (decomposed into ./controllers/admin-school-directory.controller.ts)
export { getSchoolTeachers, getSchoolStudents, getSchoolMembers } from './controllers/admin-school-directory.controller';

/**
 * Get current admin full profile with all school affiliations
 */
export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        schoolAdmins: {
          include: {
            school: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin profile not found" });
    }

    const schools = admin.schoolAdmins.map((sa: any) => ({
      id: sa.id,
      schoolId: sa.schoolId,
      schoolName: sa.school?.name || "School",
      schoolCode: sa.school?.schoolCode || "N/A",
      logo: sa.school?.logo || null,
      address: sa.school?.address || null,
      phone: sa.school?.phone || null,
      type: sa.school?.type || null,
      role: sa.role,
      active: sa.active,
      joinedAt: sa.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        adminCode: admin.adminCode,
        role: admin.role,
        gender: admin.gender,
        profileImage: admin.profileImage,
        bannerImage: admin.bannerImage,
        verified: admin.verified,
        isActive: admin.isActive,
        status: admin.status,
        isTwoFactorEnabled: admin.isTwoFactorEnabled,
        createdAt: admin.createdAt,
        schools,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "admin.getAdminProfile");
  }
};

/**
 * Update current admin profile
 */
export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { name, gender, profileImage, bannerImage } = req.body;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    console.log("UPDATE ADMIN PROFILE Payload:", { name, gender, profileImage, bannerImage });

    const updated = await updateAdminProfileService(adminId, { 
      name, 
      gender,
      profileImage,
      bannerImage
    } as any);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return handleError(res, error, "admin.updateAdminProfile");
  }
};

/**
 * Manually verify a student (Admin only)
 */
export const verifyStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id as string;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify student belongs to a school this admin manages
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true }
    });

    if (!student || !student.schoolId) {
      return res.status(404).json({ success: false, message: "Student not found or not linked to a school" });
    }

    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId,
        schoolId: student.schoolId,
        active: true
      }
    });

    if (!schoolAdmin) {
      return res.status(403).json({ success: false, message: "You don't have permission to verify this student" });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { verified: true }
    });

    // Also automatically accept any pending link requests between this student and the school
    const pendingRequests = await prisma.linkRequest.findMany({
      where: {
        linkType: "SCHOOL_STUDENT",
        status: "PENDING",
        OR: [
          { requesterId: studentId, targetId: student.schoolId },
          { requesterId: student.schoolId, targetId: studentId }
        ]
      }
    });

    const { respondToLinkRequestService } = require("../link/link.respond.service");

    for (const req of pendingRequests) {
      try {
        await respondToLinkRequestService({
          requestId: req.id,
          action: "ACCEPT",
          currentUserId: adminId,
          currentUserType: "ADMIN"
        });
      } catch (err) {
        console.error("Failed to auto-accept link request for student:", req.id, err);
      }
    }

    // Also notify the student via socket if possible
    try {
      const { getIO } = require("../../socket");
      getIO().to(`user:${studentId}`).emit("link:updated", {
        type: "LINK_ACCEPTED",
        message: "Your school registration has been approved!"
      });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: "Student verified successfully and pending links accepted",
      data: updatedStudent
    });

  } catch (error: any) {
    return handleError(res, error, "admin.verifyStudent");
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "Unauthorized"
      });
    }

    const validation = createStudentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Validation failed",
        error: validation.error.issues[0]?.message || "Validation failed",
        errors: validation.error.format()
      });
    }

    const { fullName, classId, gender } = validation.data;
    let { schoolId } = validation.data;

    // Auto-resolve schoolId from the admin's SchoolAdmin record
    // when the client didn't send it or sent a non-UUID value.
    if (!schoolId) {
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: { adminId, active: true },
        select: { schoolId: true },
      });

      if (!schoolAdmin?.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Admin is not linked to any active school. Please contact your platform administrator.",
          error: "No school link found for this admin."
        });
      }

      schoolId = schoolAdmin.schoolId;
    }

    const result = await createStudentService({
      fullName,
      classId,
      schoolId,
      gender,
      adminId
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: {
        student: result.student,
        email: result.email,
        password: result.passwordPlaintext
      }
    });

  } catch (error: any) {
    return handleError(res, error, "admin.createStudent");
  }
};

/**
 * @route   POST /api/v1/admin/students/:id/invite
 * @desc    Invite a pre-registered student to claim their account
 * @access  Private (Admin)
 */
export const inviteStudent = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const studentId = req.params.id as string;
    const email = (req.body.email as string)?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { schoolAdmins: { include: { school: true } } },
    });

    if (!admin || !admin.schoolAdmins[0]) {
      return res.status(403).json({ success: false, message: "Unauthorized or not linked to a school" });
    }

    const school = admin.schoolAdmins[0].school;

    // Check if student exists and belongs to this school
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId: school.id },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Admins can update the email and resend as long as it's not claimed
    if (student.isClaimed) {
      return res.status(400).json({ success: false, message: "Student account is already claimed" });
    }

    // Check if new email is already used by anyone
    const [existingStudentEmail, existingTeacher, existingAdmin, existingParent] = await Promise.all([
      prisma.student.findFirst({ where: { email, id: { not: studentId } } }),
      prisma.teacher.findUnique({ where: { email } }),
      prisma.admin.findUnique({ where: { email } }),
      prisma.parent.findUnique({ where: { email } })
    ]);

    if (existingStudentEmail || existingTeacher || existingAdmin || existingParent) {
      return res.status(400).json({ success: false, message: "Email is already taken" });
    }

    // Generate token
    const invitationToken = crypto.randomBytes(32).toString("hex");

    // Update student with new email and token
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        email,
        invitationToken,
        isClaimed: false, // Explicitly keep as false
      },
    });

    // Send email
    await sendStudentInvitationEmail(
      updatedStudent.email,
      invitationToken,
      school.name,
      updatedStudent.name
    );

    return res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error: any) {
    return handleError(res, error, "admin.inviteStudent");
  }
};
