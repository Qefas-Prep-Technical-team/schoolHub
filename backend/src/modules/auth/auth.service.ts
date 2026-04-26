import { Request, Response } from "express";
import prisma from "../../config/database";
import { Resend } from "resend";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../../services/authService";
import { generateUniqueCode } from "../../utils/code-generator";
import { UserRole } from "@prisma/client";
import { enforceStudentLimit } from "../subscription/quota.helpers";

// Get student by code (for parent to verify before linking)
export const getStudentByCode = async (req: Request, res: Response) => {
  try {
    const studentCode = req.params.studentCode as string;

    const student = await prisma.student.findFirst({
      where: { studentCode },
      select: {
        id: true,
        name: true,
        email: true,
        studentCode: true,
        createdAt: true,
      },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: "Student not found with this code",
      });
      return;
    }

    return res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

// Link child after registration
export const linkChildToParent = async (req: Request, res: Response) => {
  try {
    const { parentId, studentCode } = req.body;

    const trimmedCode = String(studentCode).trim();

    const student = await prisma.student.findFirst({
      where: { studentCode: trimmedCode },
      select: { id: true, name: true, email: true, studentCode: true },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid student code" });
    }

    const existingLink = await prisma.parentChildLink.findFirst({
      where: { parentId, studentId: student.id }, // still best check
    });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        message: "This student is already linked to your account",
      });
    }

    await prisma.parentChildLink.create({
      data: {
        parentId,
        studentId: student.id,
        studentCode: student.studentCode, // ✅ now stored
        status: "linked",
      },
    });

    return res.json({
      success: true,
      message: "Successfully linked to your child's account!",
      data: {
        student: {
          name: student.name,
          email: student.email,
          studentCode: student.studentCode,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to link child",
    });
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);

// default to false if not set

export const sendEmailUpdateVerification = async (email: string, code: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : email;
  
  return await resend.emails.send({
    from: process.env.MAIL_FROM as string,
    to: recipient,
    subject: `[ACTION REQUIRED] Verify Your New Email Address ${isTest ? `(Original: ${email})` : ''}`,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 32px; background: #ffffff; color: #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">Q</div>
          <div>
            <h2 style="margin: 0; color: #0f172a; font-weight: 800; letter-spacing: -1px; font-size: 20px;">Qefas Hub <span style="color: #2563eb;">Identity</span></h2>
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Institutional Protocol</p>
          </div>
        </div>
        
        <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; letter-spacing: -0.5px;">Verify Your New Email</h3>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">To complete the update of your institutional contact records, please use the secure verification code below.</p>
        
        <div style="margin: 32px 0; padding: 40px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Verification Code</p>
          <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1e293b; font-family: monospace;">
            ${code}
          </div>
        </div>
        
        <div style="padding: 24px; background: #fffcf0; border-radius: 16px; border-left: 4px solid #f59e0b; margin-bottom: 32px;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5; font-weight: 500;">
            <b>Security Note:</b> This code will expire in <b>10 minutes</b>. If you did not initiate this request, please contact your system administrator immediately.
          </p>
        </div>
        
        <div style="border-top: 1px solid #f1f5f9; pt-32; padding-top: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px;">This is an automated institutional message. Please do not reply.</p>
          ${isTest ? `<div style="margin-top: 16px; padding: 12px; background: #fef2f2; border-radius: 8px; color: #991b1b; font-size: 11px; font-weight: 700;">[TEST MODE] Original Recipient: ${email}</div>` : ''}
        </div>
      </div>
    `,
  });
};

export const sendVerificationEmail = async (email: string, code: string, type: 'welcome' | 'confirmation' = 'welcome') => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : email;

  const subject = type === 'welcome' 
    ? `Welcome to Qefas Hub - Verify Your Account ${isTest ? `(Original: ${email})` : ''}` 
    : `[Qefas Hub] Payment Identity Verification ${isTest ? `(Original: ${email})` : ''}`;

  const title = type === 'welcome' ? "Welcome to Qefas Hub" : "Confirm Your Payment";
  const description = type === 'welcome'
    ? "Thank you for joining our academic community. Please use the verification code below to activate your account and proceed with your subscription."
    : "Please use the secure verification code below to confirm your identity and proceed with your payment confirmation.";

  return await resend.emails.send({
    from: process.env.MAIL_FROM as string,
    to: recipient,
    subject: subject,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 32px; background: #ffffff; color: #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">Q</div>
          <div>
            <h2 style="margin: 0; color: #0f172a; font-weight: 800; letter-spacing: -1px; font-size: 20px;">Qefas Hub</h2>
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Academic Management System</p>
          </div>
        </div>
        
        <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; letter-spacing: -0.5px;">${title}</h3>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">${description}</p>
        
        <div style="margin: 32px 0; padding: 40px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Verification Code</p>
          <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1e293b; font-family: monospace;">
            ${code}
          </div>
        </div>
        
        <div style="border-top: 1px solid #f1f5f9; pt-32; padding-top: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px;">This is an automated institutional message. Please do not reply.</p>
          ${isTest ? `<div style="margin-top: 16px; padding: 12px; background: #fef2f2; border-radius: 8px; color: #991b1b; font-size: 11px; font-weight: 700;">[TEST MODE] Original Recipient: ${email}</div>` : ''}
        </div>
      </div>
    `,
  });
};

export const sendSetupCompleteEmail = async (email: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : email;

  return await resend.emails.send({
    from: process.env.MAIL_FROM as string,
    to: recipient,
    subject: `Your Account is Ready - Qefas Hub ${isTest ? `(Original: ${email})` : ''}`,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 32px; background: #ffffff; color: #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">Q</div>
          <div>
            <h2 style="margin: 0; color: #0f172a; font-weight: 800; letter-spacing: -1px; font-size: 20px;">Qefas Hub</h2>
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Institutional Protocol</p>
          </div>
        </div>
        
        <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; letter-spacing: -0.5px;">Account Fully Setup</h3>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Welcome to the fleet! Your institutional identity has been successfully established and your password is now active.</p>
        
        <div style="padding: 24px; background: #f0fdf4; border-radius: 16px; border-left: 4px solid #10b981; margin-bottom: 32px;">
          <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.5; font-weight: 500;">
            <b>Deployment Success:</b> You can now proceed to your dashboard or complete your payment/trial initialization if you haven't already.
          </p>
        </div>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${process.env.FRONTEND_URL}/auth/login" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; transition: all 0.3s ease;">Access Your Dashboard</a>
        </div>
        
        <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px;">This is an automated institutional message. Please do not reply.</p>
          ${isTest ? `<div style="margin-top: 16px; padding: 12px; background: #fef2f2; border-radius: 8px; color: #991b1b; font-size: 11px; font-weight: 700;">[TEST MODE] Original Recipient: ${email}</div>` : ''}
        </div>
      </div>
    `,
  });
};

// Login function
export const loginUser = async (email: string, password: string) => {
  // Check student first
  const student = await prisma.student.findUnique({ where: { email } });
  if (student) {
    if (!student.password)
      throw new Error(
        "This account is linked to Google. Please use Google Login.",
      );
    const match = await bcrypt.compare(password, student.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateAccessToken(student.id, "STUDENT");
    return { user: student, token };
  }

  // Check teacher
  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (teacher) {
    // Guard: Ensure password exists
    if (!teacher.password) {
      throw new Error("Account is not set up with a password");
    }
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateAccessToken(teacher.id, "TEACHER");
    return { user: teacher, token };
  }

  // Check admin
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) {
    if (!admin.password)
      throw new Error(
        "This account is linked to Google. Please use Google Login.",
      );
    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateAccessToken(admin.id, "ADMIN");
    return { user: admin, token };
  }

  // Check parent
  const parent = await prisma.parent.findUnique({ where: { email } });
  if (parent) {
    if (!parent.password)
      throw new Error(
        "This account is linked to Google. Please use Google Login.",
      );
    const match = await bcrypt.compare(password, parent.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateAccessToken(parent.id, "PARENT");
    return { user: parent, token };
  }

  throw new Error("User not found");
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/auth/forgot-password/ResetPassword?token=${code}`;
  
  if (!email) {
    throw new Error("Email is required to send reset link");
  }

  return await resend.emails.send({
    from: process.env.MAIL_FROM as string,
    to: email, // Changed from [email] to email to match working OTP flow
    subject: "Reset Your Qefas Hub Password",
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Qefas Hub</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Password Reset Request</p>
        </div>
        
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          
          <p>You requested to reset your password for your Qefas Hub account. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Reset Your Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            Or copy and paste this link in your browser:
          </p>
          
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; word-break: break-all; font-size: 14px; color: #374151;">
            ${resetLink}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 25px;">
            This reset link will expire in 15 minutes.<br>
            If you didn't request this reset, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>© 2025 Qefas Hub. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

export const googleAuthService = async (
  supabaseToken: string,
  userRole?: UserRole,
) => {
  // Verify Supabase's own signed JWT (the session.access_token from the frontend).
  // This is always present and contains the verified Google user data embedded by Supabase.
  // We verify it with our SUPABASE_JWT_SECRET from the Supabase Dashboard → Settings → API.
  const jwtSecret = process.env.SUPABASE_JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("SUPABASE_JWT_SECRET is not configured on the server.");
  }

  let decoded: any;
  try {
    const parts = supabaseToken.split('.');
    if (parts.length === 3) {
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      console.log("Token Header:", header);
    }
    
    // Support both HS256 (standard) and ES256 (asymmetric)
    decoded = jwt.verify(supabaseToken, process.env.SUPABASE_JWT_SECRET!, {
      algorithms: ['HS256', 'ES256']
    });
  } catch (error: any) {
    console.error("Supabase JWT Verification Failed:", {
      error: error.message,
      name: error.name,
      secretSet: !!process.env.SUPABASE_JWT_SECRET,
      tokenLength: supabaseToken?.length
    });
    throw new Error("Invalid or expired session token");
  }

  // Extract user info from the Supabase JWT payload
  const email: string | undefined = decoded.email;
  const userMeta = decoded.user_metadata || {};
  const name: string | undefined = userMeta.full_name || userMeta.name;
  const googleId: string | undefined = userMeta.provider_id || userMeta.sub;

  if (!email) throw new Error("Google account must have an email");

  let user: any;
  let actualRole: UserRole = userRole;

  // Global lookup to detect "Wrong Portal" logins
  const [existingStudent, existingTeacher, existingAdmin, existingParent] = await Promise.all([
    prisma.student.findFirst({ where: { OR: [{ googleId }, { email }] } }),
    prisma.teacher.findFirst({ where: { OR: [{ googleId }, { email }] } }),
    prisma.admin.findFirst({ where: { OR: [{ googleId }, { email }] } }),
    prisma.parent.findFirst({ where: { OR: [{ googleId }, { email }] } }),
  ]);

  const existingUser = existingStudent || existingTeacher || existingAdmin || existingParent;

  if (existingUser) {
    user = existingUser;
    // Determine the actual role based on which table they were found in
    if (existingStudent) actualRole = UserRole.STUDENT;
    else if (existingTeacher) actualRole = UserRole.TEACHER;
    else if (existingAdmin) actualRole = UserRole.ADMIN;
    else if (existingParent) actualRole = UserRole.PARENT;

    // Link Google ID if not already linked
    if (!user.googleId && googleId) {
      const updateData = { googleId, authProvider: "GOOGLE", verified: true };
      if (actualRole === UserRole.STUDENT) user = await prisma.student.update({ where: { id: user.id }, data: updateData });
      else if (actualRole === UserRole.TEACHER) user = await prisma.teacher.update({ where: { id: user.id }, data: updateData });
      else if (actualRole === UserRole.ADMIN) user = await prisma.admin.update({ where: { id: user.id }, data: { ...updateData, status: "APPROVED" } });
      else if (actualRole === UserRole.PARENT) user = await prisma.parent.update({ where: { id: user.id }, data: updateData });
    }
  } else {
    // If user doesn't exist, create them in the requested role
    if (!userRole) {
      throw new Error("No user role provided. If you are a new user, please sign up through the registration page.");
    }

    switch (userRole) {
      case UserRole.STUDENT: {
        const studentCode = await generateUniqueCode(prisma, "student", name || "Student");
        // Note: Google student signup doesn't have schoolCode in this context initially
        // but if it did, we would enforce it here. 
        user = await prisma.student.create({
          data: {
            name: name || "Google User",
            email,
            googleId,
            authProvider: "GOOGLE",
            studentCode,
            role: UserRole.STUDENT,
            verified: true,
          },
        });
        break;
      }

      case UserRole.TEACHER: {
        const teacherCode = await generateUniqueCode(prisma, "teacher", name || "Teacher");
        user = await prisma.teacher.create({
          data: {
            name: name || "Google User",
            email,
            googleId,
            authProvider: "GOOGLE",
            teacherCode,
            role: UserRole.TEACHER,
            verified: true,
          },
        });
        break;
      }

      case UserRole.ADMIN: {
        const adminCode = await generateUniqueCode(prisma, "admin", name || "Admin");
        user = await prisma.admin.create({
          data: {
            name: name || "Google User",
            email,
            googleId,
            authProvider: "GOOGLE",
            adminCode,
            role: UserRole.ADMIN,
            verified: true,
            status: "APPROVED",
          },
        });
        break;
      }

      case UserRole.PARENT: {
        const parentCode = await generateUniqueCode(prisma, "parent", name || "Parent");
        user = await prisma.parent.create({
          data: {
            fullName: name || "Google User",
            email,
            googleId,
            authProvider: "GOOGLE",
            parentCode,
            role: UserRole.PARENT,
            verified: true,
          },
        });
        break;
      }

      default:
        throw new Error(`Google Login not supported for role: ${userRole}`);
    }
  }

  const token = generateAccessToken(user.id, actualRole);
  return { user, token };
};

