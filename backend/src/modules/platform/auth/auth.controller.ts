import { Request, Response } from "express";
import prisma from "../../../config/database";
import { comparePassword, hashPassword, generateStaffToken } from "./auth.service";
import { handleError } from "../../../utils/error-handler";

/**
 * Isolated login for Platform Staff
 */
export const platformLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find staff record
    const staff = await prisma.platformStaff.findUnique({
      where: { email },
    });

    if (!staff || !staff.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or account deactivated",
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, staff.password || "");
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await prisma.platformStaff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate isolated staff token
    const token = generateStaffToken({
      id: staff.id,
      email: staff.email,
      role: staff.role,
    });

    // Set cookie
    res.cookie("platform_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Platform login successful",
      data: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        token
      },
    });
  } catch (error: any) {
    return handleError(res, error, "auth.platformLogin");
  }
};

/**
 * Staff logout
 */
export const platformLogout = async (req: Request, res: Response) => {
  res.clearCookie("platform_token");
  return res.status(200).json({
    success: true,
    message: "Logged out from platform console",
  });
};

/**
 * Get current staff profile with fallback to admin
 */
export const getStaffProfile = async (req: Request, res: Response) => {
  try {
    const staffId = (req as any).staff?.id;
    if (!staffId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Try finding in platform_staff
    let staff: any = await prisma.platformStaff.findUnique({
      where: { id: staffId },
    });

    // 2. Fallback: check Admin table
    if (!staff) {
      const admin = await prisma.admin.findUnique({
        where: { id: staffId },
      });
      if (admin) {
        staff = {
          id: admin.id,
          fullName: admin.name,
          email: admin.email,
          role: "OWNER",
          phone: null,
          bio: "Platform Chief Administrator & System Operations",
          profileImage: admin.profileImage,
          googleId: admin.googleId,
          facebookId: admin.facebookId,
          githubId: null,
          linkedinId: null,
          twitterId: null,
          socialLinks: {},
          isTwoFactorEnabled: admin.isTwoFactorEnabled,
          lastLoginAt: admin.updatedAt,
          createdAt: admin.createdAt,
        };
      }
    }

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff record not found" });
    }

    const socialObj = (staff.socialLinks && typeof staff.socialLinks === "object") ? (staff.socialLinks as Record<string, any>) : {};
    const staffDisplayName = (staff as any).displayName || socialObj.displayName || socialObj.agentDisplayName || staff.fullName;

    return res.status(200).json({
      success: true,
      data: {
        id: staff.id,
        fullName: staff.fullName,
        displayName: staffDisplayName,
        email: staff.email,
        role: staff.role || "OWNER",
        phone: staff.phone || null,
        bio: staff.bio || null,
        profileImage: staff.profileImage || null,
        googleId: staff.googleId || null,
        facebookId: staff.facebookId || null,
        githubId: staff.githubId || null,
        linkedinId: staff.linkedinId || null,
        twitterId: staff.twitterId || null,
        socialLinks: staff.socialLinks || {},
        isTwoFactorEnabled: !!staff.isTwoFactorEnabled,
        lastLoginAt: staff.lastLoginAt,
        createdAt: staff.createdAt,
      },
    });
  } catch (error) {
    return handleError(res, error, "auth.getStaffProfile");
  }
};

/**
 * Update current staff profile
 */
export const updateStaffProfile = async (req: Request, res: Response) => {
  try {
    const staffId = (req as any).staff?.id;
    if (!staffId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { fullName, email, phone, bio, profileImage, displayName, agentDisplayName, socialLinks } = req.body;
    const chosenDisplayName = displayName !== undefined ? displayName : agentDisplayName;
    const finalDisplayName = chosenDisplayName !== undefined ? (chosenDisplayName?.trim() || null) : undefined;

    const existingStaff = await prisma.platformStaff.findUnique({ where: { id: staffId } });
    if (existingStaff) {
      if (email && email.trim() !== existingStaff.email) {
        const emailTaken = await prisma.platformStaff.findFirst({
          where: {
            email: email.trim(),
            id: { not: staffId }
          }
        });
        if (emailTaken) {
          return res.status(400).json({ success: false, message: "Email is already in use by another staff account" });
        }
      }

      let mergedSocialLinks = socialLinks !== undefined ? socialLinks : (existingStaff.socialLinks as any) || {};
      if (finalDisplayName !== undefined) {
        mergedSocialLinks = {
          ...(typeof mergedSocialLinks === "object" ? mergedSocialLinks : {}),
          displayName: finalDisplayName,
          agentDisplayName: finalDisplayName,
        };
      }

      const updated = await prisma.platformStaff.update({
        where: { id: staffId },
        data: {
          ...(fullName ? { fullName: fullName.trim() } : {}),
          ...(email ? { email: email.trim() } : {}),
          ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
          ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
          ...(profileImage !== undefined ? { profileImage: profileImage?.trim() || null } : {}),
          ...(socialLinks !== undefined || finalDisplayName !== undefined ? { socialLinks: mergedSocialLinks } : {}),
        },
      });

      if (finalDisplayName !== undefined) {
        try {
          await prisma.$executeRawUnsafe(
            'ALTER TABLE "platform_staff" ADD COLUMN IF NOT EXISTS "displayName" TEXT;'
          );
          await prisma.$executeRawUnsafe(
            'UPDATE "platform_staff" SET "displayName" = $1 WHERE id = $2',
            finalDisplayName,
            staffId
          );
        } catch (colErr) {
          console.warn("[Auth] Non-fatal sql error updating displayName column:", colErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          ...updated,
          displayName: finalDisplayName || (updated as any).displayName || updated.fullName,
        },
      });
    }

    // Fallback: check Admin table
    const existingAdmin = await prisma.admin.findUnique({ where: { id: staffId } });
    if (existingAdmin) {
      if (email && email.trim() !== existingAdmin.email) {
        const adminEmailTaken = await prisma.admin.findFirst({
          where: {
            email: email.trim(),
            id: { not: staffId }
          }
        });
        if (adminEmailTaken) {
          return res.status(400).json({ success: false, message: "Email is already in use by another account" });
        }
      }

      const updatedAdmin = await prisma.admin.update({
        where: { id: staffId },
        data: {
          ...(fullName ? { name: fullName.trim() } : {}),
          ...(email ? { email: email.trim() } : {}),
          ...(profileImage !== undefined ? { profileImage: profileImage?.trim() || null } : {}),
        },
      });

      if (finalDisplayName !== undefined) {
        try {
          await prisma.$executeRawUnsafe(
            'ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "displayName" TEXT;'
          );
          await prisma.$executeRawUnsafe(
            'UPDATE "Admin" SET "displayName" = $1 WHERE id = $2',
            finalDisplayName,
            staffId
          );
        } catch (colErr) {
          console.warn("[Auth] Non-fatal sql error updating Admin displayName column:", colErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: updatedAdmin.id,
          fullName: updatedAdmin.name,
          displayName: finalDisplayName || (updatedAdmin as any).displayName || updatedAdmin.name,
          email: updatedAdmin.email,
          profileImage: updatedAdmin.profileImage,
        },
      });
    }

    return res.status(404).json({ success: false, message: "Staff record not found" });
  } catch (error) {
    return handleError(res, error, "auth.updateStaffProfile");
  }
};

/**
 * Change current staff password
 */
export const changeStaffPassword = async (req: Request, res: Response) => {
  try {
    const staffId = (req as any).staff?.id;
    if (!staffId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const staff = await prisma.platformStaff.findUnique({ where: { id: staffId } });
    if (staff) {
      const isMatch = await comparePassword(currentPassword, staff.password || "");
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Incorrect current password" });
      }
      const hashed = await hashPassword(newPassword);
      await prisma.platformStaff.update({
        where: { id: staffId },
        data: { password: hashed },
      });
      return res.status(200).json({ success: true, message: "Password updated successfully" });
    }

    const admin = await prisma.admin.findUnique({ where: { id: staffId } });
    if (admin) {
      const isMatch = await comparePassword(currentPassword, admin.password || "");
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Incorrect current password" });
      }
      const hashed = await hashPassword(newPassword);
      await prisma.admin.update({
        where: { id: staffId },
        data: { password: hashed },
      });
      return res.status(200).json({ success: true, message: "Password updated successfully" });
    }

    return res.status(404).json({ success: false, message: "Staff not found" });
  } catch (error) {
    return handleError(res, error, "auth.changeStaffPassword");
  }
};

/**
 * Link or unlink social login provider
 */
export const linkSocialAccount = async (req: Request, res: Response) => {
  try {
    const staffId = (req as any).staff?.id;
    if (!staffId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { provider, action, identifier } = req.body;
    if (!provider || !action) {
      return res.status(400).json({ success: false, message: "Provider and action are required" });
    }

    const staff = await prisma.platformStaff.findUnique({ where: { id: staffId } });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff record not found" });
    }

    const currentSocialLinks = (staff.socialLinks as Record<string, string>) || {};
    const fieldMap: Record<string, string> = {
      google: "googleId",
      github: "githubId",
      linkedin: "linkedinId",
      twitter: "twitterId",
      facebook: "facebookId",
    };

    const targetField = fieldMap[provider.toLowerCase()];
    if (!targetField) {
      return res.status(400).json({ success: false, message: "Unsupported provider" });
    }

    let updateData: Record<string, any> = {};
    if (action === "link") {
      const idVal = identifier || `${provider}_${Date.now()}`;
      updateData[targetField] = idVal;
      updateData.socialLinks = {
        ...currentSocialLinks,
        [provider.toLowerCase()]: identifier || idVal,
      };
    } else {
      updateData[targetField] = null;
      const nextSocialLinks = { ...currentSocialLinks };
      delete nextSocialLinks[provider.toLowerCase()];
      updateData.socialLinks = nextSocialLinks;
    }

    await prisma.platformStaff.update({
      where: { id: staffId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: action === "link" ? `${provider} account connected successfully` : `${provider} account unlinked`,
      data: {
        provider,
        action,
        socialLinks: updateData.socialLinks,
      },
    });
  } catch (error) {
    return handleError(res, error, "auth.linkSocialAccount");
  }
};
