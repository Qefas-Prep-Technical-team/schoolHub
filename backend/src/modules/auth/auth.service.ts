import { Request, Response } from "express";
import prisma from "../../config/database";
import { Resend } from "resend";

import bcrypt from "bcrypt";
import { generateToken } from "../../utils/generateToken";

// Get student by code (for parent to verify before linking)
export const getStudentByCode = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;

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
    console.error(error);
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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to link child",
    });
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);
const resendTest = process.env.RESEND_TEST === "true" || false; // default to false if not set

export const sendVerificationEmail = async (email: string, code: string) => {
  const mainEmail = resendTest ? "finixd531@gmail.com" : email;
  await resend.emails.send({
    from: "SchoolHub <onboarding@resend.dev>",
    to: mainEmail,
    subject: "Your Verification Code",
    html: `
     <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f0f8ff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .verification-card {
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 120, 215, 0.15);
            max-width: 480px;
            width: 100%;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .verification-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 120, 215, 0.2);
        }
        
        .header {
            background: linear-gradient(135deg, #4da8ff, #0078d7);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .content {
            padding: 30px;
        }
        
        .code-container {
            background-color: #f0f8ff;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
            border: 1px solid #d1ebff;
        }
        
        .verification-code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #0078d7;
            margin: 10px 0;
            padding: 5px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 120, 215, 0.1);
        }
        
        .instructions {
            color: #555;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .expiry-notice {
            background-color: #fff9e6;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 0 8px 8px 0;
            margin-top: 25px;
        }
        
        .expiry-notice b {
            color: #e6a700;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #777;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        
        @media (max-width: 500px) {
            .verification-code {
                font-size: 32px;
                letter-spacing: 6px;
            }
            
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="verification-card">
        <div class="header">
            <h1>Email Verification</h1>
            <p>Secure your account with verification</p>
        </div>
        
        <div class="content">
            <p class="instructions">Thank you for signing up! To complete your registration, please use the verification code below:</p>
            
            <div class="code-container">
                <p>Your verification code is:</p>
                <div class="verification-code">${code}</div>
                <p>Enter this code on the verification page</p>
            </div>
            
            <div class="expiry-notice">
                <p>This code expires in <b>10 minutes</b>. Please verify your email address before it expires.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>
    `,
  });
};

// Login function
export const loginUser = async (email: string, password: string) => {
  // Check student first
  const student = await prisma.student.findUnique({ where: { email } });
  if (student) {
    const match = await bcrypt.compare(password, student.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateToken({ id: student.id, role: "student" });
    return { user: student, token };
  }

  // Check teacher
  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (teacher) {
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateToken({ id: teacher.id, role: "teacher" });
    return { user: teacher, token };
  }

  // Check admin
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) {
    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateToken({ id: admin.id, role: "admin" });
    return { user: admin, token };
  }

  throw new Error("User not found");
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/forgotPassword/ResetPassword?token=${code}`;

    const data = await resend.emails.send({
      from: "SchoolHub <onboarding@resend.dev>",
      to: [email],
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

    console.log("Password reset email sent to:", email);
    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
