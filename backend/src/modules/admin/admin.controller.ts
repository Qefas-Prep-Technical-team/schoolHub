import prisma from "../../config/database";
import { Request, Response } from "express";
import { AdminRole, UserRole } from "generated/prisma";
import bcrypt from "bcryptjs";

// controllers/auth.controller.ts

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
  res: Response
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
          tenantIds: [tenantId],
          verified: false, // Not verified yet
          status: "PENDING", // Waiting for approval
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

      return { admin, schoolAdmin, school };
    });

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
    const { email } = req.params;

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
        `Notification sent to ${schoolOwner.admin.email}: New admin registration from ${pendingAdmin.name} (${pendingAdmin.email}) for ${schoolOwner.school.name}`
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
    const { adminId } = req.params;

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
    const { adminId } = req.params;
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
      reason
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
    `Approval email sent to ${email}: Welcome ${name}, your admin account has been approved!`
  );
};

const sendRejectionNotification = async (
  email: string,
  name: string,
  reason?: string
) => {
  // Implement your email service
  console.log(
    `Rejection email sent to ${email}: Sorry ${name}, your admin registration was rejected. Reason: ${reason}`
  );
};
