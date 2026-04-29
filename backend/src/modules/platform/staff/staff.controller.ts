import { Request, Response } from "express";
import prisma from "../../../config/database";
import { hashPassword } from "../auth/auth.service";
import crypto from "crypto";
import { Resend } from "resend";
import { getSingleString } from "../../../utils/request-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handle staff creation (Owner only)
 */
export const createStaff = async (req: Request, res: Response) => {
  try {
    const { fullName, email, role } = req.body;

    if (!fullName || !email || !role) {
      return res.status(400).json({ success: false, message: "Name, email, and role are required" });
    }

    const existing = await prisma.platformStaff.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Staff email already exists" });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const staff = await prisma.platformStaff.create({
      data: {
        fullName,
        email,
        role: role as any,
        inviteToken,
        inviteExpires,
        isActive: false // inactive until setup
      },
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await prisma.platformActivityLog.create({
            data: {
                staffId: loggingStaff.id,
                action: "CREATE_STAFF",
                entityType: "PlatformStaff",
                entityId: staff.id,
                details: { email: staff.email, role: staff.role }
            }
        });
    }

    const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const setupLink = `${baseUrl}/auth/setup?token=${inviteToken}`;

    const isTest = process.env.RESEND_TEST?.trim() === 'true';
    const recipient = isTest ? process.env.TEST_EMAIL as string : email;

    await resend.emails.send({
      from: (process.env.MAIL_FROM as string) || "noreply@qefashub.com",
      to: recipient,
      subject: `You have been invited to Qefas Hub ${isTest ? `(Original: ${email})` : ''}`,
      html: `
        <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 32px; background: #ffffff; color: #1e293b;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">Q</div>
            <div>
              <h2 style="margin: 0; color: #0f172a; font-weight: 800; font-size: 20px;">Qefas Hub Infrastructure</h2>
              <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Platform Administration</p>
            </div>
          </div>
          
          <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Welcome aboard, ${fullName.split(' ')[0]}!</h3>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">You have been securely provisioned a <b>${role.replace('_', ' ')}</b> account on the Qefas Admin Platform. Please initialize your secure credentials to gain access.</p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${setupLink}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">Initialize Account</a>
          </div>
          
          <div style="padding: 24px; background: #fffcf0; border-radius: 16px; border-left: 4px solid #f59e0b; margin-bottom: 32px;">
            <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
              <b>Security Note:</b> This invitation will securely expire in <b>24 hours</b>. If you require a new link, contact your platform owner.
            </p>
          </div>
          
          <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px;">This is an automated infrastructure system message.</p>
          </div>
        </div>
      `
    });

    return res.status(201).json({
      success: true,
      message: "Staff invitation sent successfully",
      data: { id: staff.id, fullName: staff.fullName, email: staff.email, role: staff.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create staff" });
  }
};

/**
 * List all platform staff
 */
export const listStaff = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      prisma.platformStaff.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.platformStaff.count()
    ]);

    return res.status(200).json({ 
      success: true, 
      data: staff,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to list staff" });
  }
};

/**
 * Toggle staff active status
 */
export const toggleStaffStatus = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { isActive } = req.body;

    if (id === (req as any).staff?.id) {
       return res.status(400).json({ success: false, message: "Cannot deactivate yourself" });
    }

    const staff = await prisma.platformStaff.update({
      where: { id },
      data: { isActive: !!isActive }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await prisma.platformActivityLog.create({
            data: {
                staffId: loggingStaff.id,
                action: isActive ? "ACTIVATE_STAFF" : "DEACTIVATE_STAFF",
                entityType: "PlatformStaff",
                entityId: id,
                details: { fullName: staff.fullName }
            }
        });
    }

    return res.status(200).json({ success: true, message: `Staff account ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

/**
 * Delete staff account (Owner only)
 */
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);

    if (id === (req as any).staff?.id) {
       return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    }

    const targetStaff = await prisma.platformStaff.findUnique({ where: { id } });
    await prisma.platformStaff.delete({ where: { id } });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff && targetStaff) {
        await prisma.platformActivityLog.create({
            data: {
                staffId: loggingStaff.id,
                action: "DELETE_STAFF",
                entityType: "PlatformStaff",
                entityId: id,
                details: { fullName: targetStaff.fullName, email: targetStaff.email }
            }
        });
    }

    return res.status(200).json({ success: true, message: "Staff account deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete staff" });
  }
};

/**
 * Verify staff invitation token
 */
export const verifyStaffInvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: "Token required" });

    const staff = await prisma.platformStaff.findUnique({
      where: { inviteToken: token as string }
    });

    if (!staff || !staff.inviteExpires || staff.inviteExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation link" });
    }

    return res.status(200).json({
      success: true,
      data: { email: staff.email, fullName: staff.fullName }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Complete staff setup (set password)
 */
export const completeStaffSetup = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password required" });
    }

    const staff = await prisma.platformStaff.findUnique({
      where: { inviteToken: token }
    });

    if (!staff || !staff.inviteExpires || staff.inviteExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation link" });
    }

    const hashedPassword = await hashPassword(password);
    
    await prisma.platformStaff.update({
      where: { id: staff.id },
      data: {
        password: hashedPassword,
        inviteToken: null,
        inviteExpires: null,
        isActive: true, // activate account
      }
    });

    // Activity Log for activation
    await prisma.platformActivityLog.create({
      data: {
          staffId: staff.id,
          action: "SETUP_ACCOUNT",
          entityType: "PlatformStaff",
          entityId: staff.id,
          details: { email: staff.email }
      }
    });

    return res.status(200).json({ success: true, message: "Account setup successfully. You can now login." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to setup account" });
  }
};

/**
 * Update a staff member's role (OWNER only)
 */
export const updateStaffRole = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    if (id === (req as any).staff?.id) {
       return res.status(400).json({ success: false, message: "Cannot modify your own access level" });
    }

    const updatedStaff = await prisma.platformStaff.update({
      where: { id },
      data: { role: role as any }
    });

    return res.status(200).json({ success: true, message: "Role updated successfully", data: updatedStaff });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update role" });
  }
};

/**
 * Send a credential reset / fresh invite email
 */
export const requestCredentialReset = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);

    const staff = await prisma.platformStaff.findUnique({ where: { id } });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.platformStaff.update({
      where: { id },
      data: {
        inviteToken,
        inviteExpires
      }
    });

    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/setup?token=${inviteToken}`;
    const isTest = process.env.RESEND_TEST?.trim() === 'true';
    const recipient = isTest ? process.env.TEST_EMAIL as string : staff.email;

    await resend.emails.send({
      from: (process.env.MAIL_FROM as string) || "noreply@qefashub.com",
      to: recipient,
      subject: `Reset Credentials for Qefas Hub ${isTest ? `(Original: ${staff.email})` : ''}`,
      html: `
        <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 32px; background: #ffffff; color: #1e293b;">
          <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Credentials Reset Requested</h3>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Hello ${staff.fullName.split(' ')[0]}, an administrator has re-issued your connection link to the Qefas Platform. Please click below to reset your password and secure your account.</p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${setupLink}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">Set New Password</a>
          </div>
          <div style="padding: 24px; background: #fffcf0; border-radius: 16px; border-left: 4px solid #f59e0b; margin-bottom: 32px;">
            <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
              <b>Security Note:</b> This reset link will securely expire in <b>24 hours</b>. Your old password remains active until you set a new one.
            </p>
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, message: "Credential reset email dispatched securely." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to dispatch reset email" });
  }
};
