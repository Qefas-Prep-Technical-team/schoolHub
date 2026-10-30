import prisma, { withRetry } from "../../../config/database";
import { UserRole, AdminRole } from "@prisma/client";
import {
  sendWelcomeEmail,
  sendSetupCompleteEmail,
} from "../auth.service";
import { createNotification } from "../../notification/notification.service";
import { SchoolSubscriptionService } from "../../subscription/school-subscription.service";
import { UserSubscriptionService } from "../../subscription/user-subscription.service";
import { generateAccessToken, generateRefreshToken } from "@services/authService";
import jwt from "jsonwebtoken";
import { DeviceInfo } from "../auth.device";

export interface VerifyCodeInput {
  email: string;
  code: string;
  userType: string;
  deviceInfo: DeviceInfo;
}

export interface SessionTokensResult {
  accessToken: string;
  refreshToken: string;
  deviceVerifiedCookieToken: string;
}

export interface VerifyCodeResult {
  status: number;
  data: {
    success: boolean;
    message?: string;
    isNewUser?: boolean;
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    userRole?: string;
    code?: string | null;
    user?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
  cookies?: {
    token: { value: string; options: Record<string, unknown> };
    refreshToken: { value: string; options: Record<string, unknown> };
    deviceVerified: { value: string; options: Record<string, unknown> };
  };
}

export class VerifyCodeService {
  static async verifyEmailCode(input: VerifyCodeInput): Promise<VerifyCodeResult> {
    const { email, code, userType, deviceInfo } = input;
    const normalizedEmail = email?.trim().toLowerCase();

    console.log("Verifying code for:", {
      email: normalizedEmail,
      userType,
      code,
    });

    if (!email || !code || !userType) {
      return {
        status: 400,
        data: {
          success: false,
          message: "Email, code, and user type are required",
        },
      };
    }

    if (!Object.values(UserRole).includes(userType as UserRole)) {
      return {
        status: 400,
        data: { success: false, message: "Invalid user type" },
      };
    }

    const check = await withRetry(() =>
      prisma.verificationCode.findMany({
        where: { email: normalizedEmail },
      })
    );
    console.log("Existing codes for this email and type:", check);

    const found = await withRetry(() =>
      prisma.verificationCode.findFirst({
        where: {
          email: normalizedEmail,
          code,
          userType: userType as UserRole,
          used: false,
        },
      })
    );

    if (!found) {
      return { status: 400, data: { success: false, message: "Invalid code" } };
    }
    if (found.expiresAt < new Date()) {
      return { status: 400, data: { success: false, message: "Code expired" } };
    }

    await withRetry(() =>
      prisma.verificationCode.update({
        where: { id: found.id },
        data: { used: true },
      })
    );

    let user: any;
    let isSchoolOwner = false;
    let isNewUser = false;

    const buildSessionCookies = (
      accessToken: string,
      refreshToken: string,
      userId: string
    ) => {
      const deviceToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "365d" }
      );

      return {
        token: {
          value: accessToken,
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          },
        },
        refreshToken: {
          value: refreshToken,
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
          },
        },
        deviceVerified: {
          value: deviceToken,
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge: 365 * 24 * 60 * 60 * 1000,
          },
        },
      };
    };

    switch (userType) {
      case UserRole.ADMIN: {
        user = await withRetry(() =>
          prisma.admin.findUnique({
            where: { email: normalizedEmail },
            include: { schoolAdmins: { include: { school: true } } },
          })
        );

        if (!user) {
          return {
            status: 401,
            data: { success: false, message: "Invalid credentials" },
          };
        }

        isSchoolOwner = user.schoolAdmins.some(
          (sa: any) => sa.role === AdminRole.SCHOOL_OWNER
        );
        isNewUser = !user.verified;

        user = await withRetry(() =>
          prisma.admin.update({
            where: { email: normalizedEmail },
            data: {
              verified: true,
              status: isSchoolOwner ? "APPROVED" : "PENDING",
            },
            include: { schoolAdmins: { include: { school: true } } },
          })
        );

        if (isNewUser) {
          await UserSubscriptionService.initializeFreePlan(
            user.id,
            UserRole.ADMIN
          );

          const ownerAdmin = user.schoolAdmins.find(
            (sa: any) => sa.role === AdminRole.SCHOOL_OWNER
          );
          if (ownerAdmin) {
            await SchoolSubscriptionService.initializeFreePlan(
              ownerAdmin.school.id
            );
          }
        }

        const schools = user.schoolAdmins.map((sa: any) => ({
          schoolId: sa.school.id,
          schoolName: sa.school.name,
          adminRole: sa.role,
          approved:
            sa.role === AdminRole.SCHOOL_OWNER || user.status === "APPROVED",
        }));
        const ownerSchool = user.schoolAdmins.find(
          (sa: any) => sa.role === AdminRole.SCHOOL_OWNER
        );

        const schoolCode = ownerSchool?.school?.schoolCode || null;

        if (isNewUser && isSchoolOwner && ownerSchool) {
          sendSetupCompleteEmail(user.email).catch(console.error);

          createNotification({
            recipientType: "ADMIN",
            recipientId: user.id,
            type: "GENERAL",
            title: "Welcome to Qefas Hub",
            message:
              "Your school owner account has been successfully verified and activated. You can now start setting up your digital campus.",
          }).catch(console.error);
        } else if (isNewUser) {
          sendWelcomeEmail({
            email: user.email,
            name: user.name,
            role: userType,
            loginUrl: `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/login`,
          }).catch(console.error);

          createNotification({
            recipientType: "ADMIN",
            recipientId: user.id,
            type: "GENERAL",
            title: "Email Verified",
            message:
              "Your email has been verified. You are currently pending approval from your school owner.",
          }).catch(console.error);
        }

        const updatedAdmin = await withRetry(() =>
          prisma.admin.findUnique({
            where: { id: user.id },
            include: { schoolAdmins: { include: { school: true } } },
          })
        );

        const accessToken = generateAccessToken(user.id, UserRole.ADMIN);
        const refreshToken = await generateRefreshToken(
          user.id,
          UserRole.ADMIN,
          deviceInfo
        );
        const cookies = buildSessionCookies(accessToken, refreshToken, user.id);

        const resolvedAdminRole =
          user.schoolAdmins.find((sa: any) => sa.role === AdminRole.SCHOOL_OWNER)
            ?.role ||
          user.schoolAdmins[0]?.role ||
          (isSchoolOwner ? AdminRole.SCHOOL_OWNER : null);

        const normalizedAdmin = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || "ADMIN",
          adminRole: resolvedAdminRole,
          userType: "ADMIN",
          tenantId: user.tenantId,
          status: user.status,
          verified: user.verified,
          isSchoolOwner,
          schools,
          plan: updatedAdmin?.plan || ownerSchool?.school?.plan || "Free",
        };

        return {
          status: 200,
          cookies,
          data: {
            success: true,
            isNewUser,
            token: accessToken,
            accessToken,
            refreshToken,
            message: isSchoolOwner
              ? "School owner verified and account approved!"
              : "Admin verified! Waiting for school owner approval.",
            userRole: userType,
            code: schoolCode,
            user: normalizedAdmin,
            data: {
              token: accessToken,
              accessToken,
              refreshToken,
              user: normalizedAdmin,
              admin: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status,
                verified: user.verified,
                isSchoolOwner,
              },
              schools,
            },
          },
        };
      }

      case UserRole.TEACHER: {
        const oldTeacher = await withRetry(() =>
          prisma.teacher.findUnique({
            where: { email: normalizedEmail },
          })
        );
        if (oldTeacher) isNewUser = !oldTeacher.verified;

        user = await withRetry(() =>
          prisma.teacher.update({
            where: { email: normalizedEmail },
            data: { verified: true },
          })
        );

        if (isNewUser) {
          await UserSubscriptionService.initializeFreePlan(
            user.id,
            UserRole.TEACHER
          );

          sendWelcomeEmail({
            email: user.email,
            name: user.name,
            role: userType,
            loginUrl: `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/login`,
          }).catch(console.error);

          createNotification({
            recipientType: "TEACHER",
            recipientId: user.id,
            type: "GENERAL",
            title: "Account Verified",
            message:
              "Welcome to Qefas Hub! Your teacher account is verified and ready.",
          }).catch(console.error);
        }

        const updatedTeacher = await withRetry(() =>
          prisma.teacher.findUnique({
            where: { id: user.id },
          })
        );

        const accessToken = generateAccessToken(user.id, UserRole.TEACHER);
        const refreshToken = await generateRefreshToken(
          user.id,
          UserRole.TEACHER,
          deviceInfo
        );
        const cookies = buildSessionCookies(accessToken, refreshToken, user.id);

        const normalizedTeacher = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || "TEACHER",
          userType: "TEACHER",
          teacherCode: user.teacherCode,
          tenantId: user.tenantId,
          verified: user.verified,
          plan: updatedTeacher?.plan || "Free",
        };

        return {
          status: 200,
          cookies,
          data: {
            success: true,
            isNewUser,
            token: accessToken,
            accessToken,
            refreshToken,
            message: "Teacher verified successfully!",
            userRole: userType,
            code: user.teacherCode,
            user: normalizedTeacher,
            data: {
              token: accessToken,
              accessToken,
              refreshToken,
              user: normalizedTeacher,
              teacher: user,
            },
          },
        };
      }

      case UserRole.STUDENT: {
        const oldStudent = await withRetry(() =>
          prisma.student.findUnique({
            where: { email: normalizedEmail },
          })
        );
        if (oldStudent) isNewUser = !oldStudent.verified;

        user = await withRetry(() =>
          prisma.student.update({
            where: { email: normalizedEmail },
            data: { verified: true },
          })
        );

        if (isNewUser) {
          await UserSubscriptionService.initializeFreePlan(
            user.id,
            UserRole.STUDENT
          );

          sendWelcomeEmail({
            email: user.email,
            name: user.name,
            role: userType,
            loginUrl: `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/login`,
          }).catch(console.error);

          createNotification({
            recipientType: "STUDENT",
            recipientId: user.id,
            type: "GENERAL",
            title: "Account Verified",
            message:
              "Welcome to Qefas Hub! Your student account is verified and ready to go.",
          }).catch(console.error);
        }

        const updatedStudent = await withRetry(() =>
          prisma.student.findUnique({
            where: { id: user.id },
          })
        );

        const accessToken = generateAccessToken(user.id, UserRole.STUDENT);
        const refreshToken = await generateRefreshToken(
          user.id,
          UserRole.STUDENT,
          deviceInfo
        );
        const cookies = buildSessionCookies(accessToken, refreshToken, user.id);

        const normalizedStudent = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "STUDENT",
          userType: "STUDENT",
          studentCode: user.studentCode,
          tenantId: user.tenantId,
          verified: user.verified,
          plan: updatedStudent?.plan || "Free",
        };

        return {
          status: 200,
          cookies,
          data: {
            success: true,
            isNewUser,
            token: accessToken,
            accessToken,
            refreshToken,
            message: "Student verified successfully!",
            userRole: userType,
            code: user.studentCode,
            user: normalizedStudent,
            data: {
              token: accessToken,
              accessToken,
              refreshToken,
              user: normalizedStudent,
              student: user,
            },
          },
        };
      }

      case UserRole.PARENT: {
        const oldParent = await withRetry(() =>
          prisma.parent.findUnique({
            where: { email: normalizedEmail },
          })
        );
        if (oldParent) isNewUser = !oldParent.verified;

        user = await withRetry(() =>
          prisma.parent.update({
            where: { email: normalizedEmail },
            data: { verified: true },
          })
        );

        if (isNewUser) {
          await UserSubscriptionService.initializeFreePlan(
            user.id,
            UserRole.PARENT
          );

          sendWelcomeEmail({
            email: user.email,
            name: user.fullName || "Parent",
            role: userType,
            loginUrl: `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/login`,
          }).catch(console.error);

          createNotification({
            recipientType: "PARENT",
            recipientId: user.id,
            type: "GENERAL",
            title: "Account Verified",
            message:
              "Welcome to Qefas Hub! Your parent account is now verified.",
          }).catch(console.error);
        }

        const updatedParent = await withRetry(() =>
          prisma.parent.findUnique({
            where: { id: user.id },
          })
        );

        const accessToken = generateAccessToken(user.id, UserRole.PARENT);
        const refreshToken = await generateRefreshToken(
          user.id,
          UserRole.PARENT,
          deviceInfo
        );
        const cookies = buildSessionCookies(accessToken, refreshToken, user.id);

        const normalizedParent = {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: "PARENT",
          userType: "PARENT",
          parentCode: user.parentCode,
          tenantId: user.tenantId,
          verified: user.verified,
          plan: updatedParent?.plan || "Free",
        };

        return {
          status: 200,
          cookies,
          data: {
            success: true,
            isNewUser,
            token: accessToken,
            accessToken,
            refreshToken,
            message: "Parent verified successfully!",
            userRole: userType,
            code: user.parentCode,
            user: normalizedParent,
            data: {
              token: accessToken,
              accessToken,
              refreshToken,
              user: normalizedParent,
              parent: user,
            },
          },
        };
      }

      default:
        return {
          status: 400,
          data: { success: false, message: "Invalid user type" },
        };
    }
  }
}
