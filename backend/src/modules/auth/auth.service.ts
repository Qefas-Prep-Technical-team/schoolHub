import { Request, Response } from "express";
import prisma from "../../config/database";
import { Resend } from "resend";

import bcrypt from "bcrypt";
import { generateToken } from "../../utils/generateToken";
import { OAuth2Client } from "google-auth-library";
import { generateUniqueCode } from "../../utils/code-generator";
import { UserRole } from "@prisma/client";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
          <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">S</div>
          <div>
            <h2 style="margin: 0; color: #0f172a; font-weight: 800; letter-spacing: -1px; font-size: 20px;">SchoolHub <span style="color: #2563eb;">Identity</span></h2>
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

export const sendVerificationEmail = async (email: string, code: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : email;

  return await resend.emails.send({
    from: process.env.MAIL_FROM as string,
    to: recipient,
    subject: `[SchoolHub] Verify Your Account ${isTest ? `(Original: ${email})` : ''}`,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 32px; background: #ffffff; color: #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">S</div>
          <div>
            <h2 style="margin: 0; color: #0f172a; font-weight: 800; letter-spacing: -1px; font-size: 20px;">SchoolHub</h2>
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Academic Management System</p>
          </div>
        </div>
        
        <h3 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; letter-spacing: -0.5px;">Welcome to SchoolHub</h3>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Thank you for joining our academic community. Please use the verification code below to activate your account.</p>
        
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

    const token = generateToken({ id: student.id, role: "student" });
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

    const token = generateToken({ id: teacher.id, role: "teacher" });
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

    const token = generateToken({ id: admin.id, role: "admin" });
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

    const token = generateToken({ id: parent.id, role: "parent" });
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
    subject: "Reset Your SchoolHub Password",
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">SchoolHub</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Password Reset Request</p>
        </div>
        
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          
          <p>You requested to reset your password for your SchoolHub account. Click the button below to create a new password:</p>
          
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
          <p>© 2025 SchoolHub. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

export const googleAuthService = async (
  idToken: string,
  userRole: UserRole,
) => {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error("Invalid Google token");

  const { sub: googleId, email, name } = payload;
  if (!email) throw new Error("Google account must have an email");

  let user: any;
  const roleStr = userRole.toLowerCase();

  switch (userRole) {
    case UserRole.STUDENT: {
      user = await prisma.student.findUnique({ where: { googleId } });
      if (!user) {
        user = await prisma.student.findUnique({ where: { email } });
        if (user) {
          user = await prisma.student.update({
            where: { email },
            data: { googleId, authProvider: "GOOGLE" },
          });
        } else {
          const studentCode = await generateUniqueCode(
            prisma,
            "student",
            name || "Student",
          );
          user = await prisma.student.create({
            data: {
              name: name || "Google User",
              email: email,
              googleId,
              authProvider: "GOOGLE",
              studentCode,
              role: UserRole.STUDENT,
              verified: true,
            },
          });
        }
      }
      break;
    }

    case UserRole.PARENT: {
      user = await prisma.parent.findUnique({ where: { googleId } });
      if (!user) {
        user = await prisma.parent.findUnique({ where: { email } });
        if (user) {
          user = await prisma.parent.update({
            where: { email },
            data: { googleId, authProvider: "GOOGLE" },
          });
        } else {
          const parentCode = await generateUniqueCode(
            prisma,
            "parent",
            name || "Parent",
          );
          user = await prisma.parent.create({
            data: {
              fullName: name || "Google User",
              email: email,
              googleId,
              authProvider: "GOOGLE",
              parentCode,
              role: UserRole.PARENT,
            },
          });
        }
      }
      break;
    }

    default:
      throw new Error(
        "Google Login only supported for Students and Parents currently",
      );
  }

  const token = generateToken({ id: user.id, role: roleStr });
  return { user, token };
};
