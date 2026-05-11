import prisma from "../../config/database";
import { Request, Response } from "express";
import { $Enums, AdminRole, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { updateAdminProfileService } from "./admin.service";
import { getSingleString } from "../../utils/request-utils";

import { UserSubscriptionService } from "../subscription/user-subscription.service";

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
    console.error("Verify tenant ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Step 2: Admin self-registration
interface AdminSelfRegisterBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AdminRole;
  schoolId: string;
  tenantId: string;
}

export const registerAdminSelf = async (
  req: Request<{}, {}, AdminSelfRegisterBody>,
  res: Response,
) => {
  try {
    const { name, email, password, confirmPassword, role, schoolId, tenantId } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !role ||
      !schoolId ||
      !tenantId
    ) {
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

    // Validate AdminRole
    const validAdminRoles = Object.values(AdminRole);
    if (!validAdminRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin role",
      });
    }

    // Verify school exists and tenantId matches
    const school = await prisma.school.findFirst({
      where: {
        id: schoolId,
        tenantId: tenantId,
      },
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found or tenant ID mismatch",
      });
    }

    // Check if admin email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin with PENDING status
    const result = await prisma.$transaction(async (tx) => {
        // Create admin user with PENDING status
        const admin = await tx.admin.create({
          data: {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: UserRole.ADMIN,
            tenantId: tenantId,
            verified: false, // Not verified yet
            status: "PENDING", // Waiting for approval
            adminCode: `ADM${Math.floor(1000 + Math.random() * 9000)}`,
          },
        });

        // Create school admin relationship (but admin is pending)
        const schoolAdmin = await tx.schoolAdmin.create({
          data: {
            schoolId: schoolId,
            adminId: admin.id,
            role: role,
          },
        });
        
        await UserSubscriptionService.initializeFreePlan(admin.id, UserRole.ADMIN);

        return { admin, schoolAdmin, school };
      },
    );

    // Send notification to school owner (you can implement email/notification service)
    await notifySchoolOwner(school.id, result.admin);

    return res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully! Waiting for approval from school owner.",
      data: {
        admin: {
          id: result.admin.id,
          name: result.admin.name,
          email: result.admin.email,
          role: result.admin.role,
          status: result.admin.status,
        },
        school: {
          id: result.school.id,
          name: result.school.name,
        },
        nextSteps:
          "You will receive an email once your account is approved by the school owner.",
      },
    });
  } catch (error: any) {
    console.error("Admin self-registration error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Step 3: Check registration status
export const checkAdminStatus = async (req: Request, res: Response) => {
  try {
    const email = req.params.email as string;

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        verified: true,
        createdAt: true,
        schoolAdmins: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status retrieved successfully",
      data: admin,
    });
  } catch (error: any) {
    console.error("Check admin status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Helper function to notify school owner
const notifySchoolOwner = async (schoolId: string, pendingAdmin: any) => {
  try {
    // Find school owner/admin to notify
    const schoolOwner = await prisma.schoolAdmin.findFirst({
      where: {
        schoolId: schoolId,
        role: AdminRole.SCHOOL_OWNER,
      },
      include: {
        admin: true,
        school: true,
      },
    });

    if (schoolOwner) {
      // Send email notification (implement your email service)
      console.log(
        `Notification sent to ${schoolOwner.admin.email}: New admin registration from ${pendingAdmin.name} (${pendingAdmin.email}) for ${schoolOwner.school.name}`,
      );

      // You can integrate with your email service here
      // await sendEmailNotification(schoolOwner.admin.email, pendingAdmin, schoolOwner.school);
    }
  } catch (error) {
    console.error("Error notifying school owner:", error);
  }
};

// controllers/adminApproval.controller.ts
export const getPendingAdmins = async (req: Request, res: Response) => {
  try {
    const schoolId = req.school?.id; // From auth middleware

    const pendingAdmins = await prisma.schoolAdmin.findMany({
      where: {
        schoolId: schoolId,
        admin: {
          status: "PENDING",
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Pending admins retrieved successfully",
      data: pendingAdmins,
    });
  } catch (error: any) {
    console.error("Get pending admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const approveAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.adminId as string;

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        status: "APPROVED",
        verified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        verified: true,
      },
    });

    // Send approval notification email
    await sendApprovalNotification(updatedAdmin.email, updatedAdmin.name);

    return res.status(200).json({
      success: true,
      message: "Admin approved successfully",
      data: updatedAdmin,
    });
  } catch (error: any) {
    console.error("Approve admin error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const rejectAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.adminId as string;
    const { reason } = req.body;

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        status: "REJECTED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    // Send rejection notification email
    await sendRejectionNotification(
      updatedAdmin.email,
      updatedAdmin.name,
      reason,
    );

    return res.status(200).json({
      success: false,
      message: "Admin registration rejected",
      data: updatedAdmin,
    });
  } catch (error: any) {
    console.error("Reject admin error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Helper functions for notifications
const sendApprovalNotification = async (email: string, name: string) => {
  // Implement your email service
  console.log(
    `Approval email sent to ${email}: Welcome ${name}, your admin account has been approved!`,
  );
};

const sendRejectionNotification = async (
  email: string,
  name: string,
  reason?: string,
) => {
  // Implement your email service
  console.log(
    `Rejection email sent to ${email}: Sorry ${name}, your admin registration was rejected. Reason: ${reason}`,
  );
};

export const getSchoolTeachers = async (req: Request, res: Response) => {
  try {
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    // Verify requesting admin belongs to this school
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: req.user!.id,
        schoolId: schoolId as string,
        active: true,
      },
    });

    if (!schoolAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view teachers for this school",
      });
    }

    // Get all teachers linked to this school
    const teachers = await prisma.teacher.findMany({
      where: {
        OR: [
          { activeSchoolId: schoolId },
          { primarySchoolId: schoolId },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        teacherCode: true,
        authProvider: true,
        verified: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error: any) {
    console.error("getSchoolTeachers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getSchoolStudents = async (req: Request, res: Response) => {
  try {
    const search = getSingleString(req.query.search as string | string[] | undefined);
    const classId = getSingleString(req.query.classId as string | string[] | undefined);
    const gender = getSingleString(req.query.gender as string | string[] | undefined);
    const status = getSingleString(req.query.status as string | string[] | undefined);
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);
    const page = getSingleString(req.query.page as string | string[] | undefined) || "1";
    const limit = getSingleString(req.query.limit as string | string[] | undefined) || "10";

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Verify requesting admin belongs to this school
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: req.user!.id,
        schoolId: schoolId as string,
        active: true,
      },
    });

    if (!schoolAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view students for this school",
      });
    }

    // Build where clause
    const where: any = {
      schoolId: schoolId as string,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (classId) {
      where.classes = {
        some: {
          classId: classId,
        }
      };
    }

    if (gender) {
      where.gender = gender as any;
    }

    if (status) {
      where.verified = status === 'verified';
    }

    // Get count and students
    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          studentCode: true,
          authProvider: true,
          verified: true,
          profileImage: true,
          gender: true,
          classes: {
            include: {
              class: true
            }
          },
          department: true
        },
        orderBy: { name: 'asc' }
      }),
    ]);

    return res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
      data: students,
    });
  } catch (error: any) {
    console.error("getSchoolStudents error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getSchoolMembers = async (req: Request, res: Response) => {
  try {
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    // Verify requesting admin belongs to this school
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: req.user!.id,
        schoolId: schoolId as string,
        active: true,
      },
    });

    if (!schoolAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [teachers, students] = await Promise.all([
      prisma.teacher.findMany({
        where: {
          OR: [
            { activeSchoolId: schoolId },
            { primarySchoolId: schoolId },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          teacherCode: true,
          role: true,
        },
      }),
      prisma.student.findMany({
        where: { schoolId: schoolId as string },
        select: {
          id: true,
          name: true,
          email: true,
          studentCode: true,
          role: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        teachers,
        students,
      },
    });
  } catch (error: any) {
    console.error("getSchoolMembers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
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
    console.error("Update admin profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
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

    return res.status(200).json({
      success: true,
      message: "Student verified successfully",
      data: updatedStudent
    });

  } catch (error: any) {
    console.error("Verify student error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};
