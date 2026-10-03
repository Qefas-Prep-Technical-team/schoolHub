import { Request, Response } from "express";
import prisma from "../../config/database";
import { Resend } from "resend";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../../services/authService";
import { generateUniqueCode } from "../../utils/code-generator";
import { UserRole } from "@prisma/client";
import { enforceStudentLimit } from "../subscription/quota.helpers";
import { UserSubscriptionService } from "../subscription/user-subscription.service";
import { SubscriptionComplianceService } from "../subscription/subscription-compliance.service";
import { getSingleString } from "../../utils/request-utils";
import { handleError } from "../../utils/error-handler";
import { buildEmail, ctaButton, secondaryLink, otpBox, infoCard, receiptRow } from "../../utils/email-template";


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
    return handleError(res, error, "auth.getStudentByCode");
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
    return handleError(res, error, "auth.linkChildToParent");
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);

type MailPayload = Parameters<typeof resend.emails.send>[0];

/**
 * Single choke point for transactional email.
 * Resend's SDK resolves with `{ error }` instead of throwing, which made every
 * `.catch(console.error)` at the call sites dead code. We log failures here
 * (subject + recipient) and return the untouched result so callers keep working.
 */
const sendMail = async (payload: MailPayload) => {
  const result = await resend.emails.send(payload);
  if (result.error) {
    console.error(
      `[Mail] FAILED subject="${payload.subject}" to=${JSON.stringify(payload.to)}:`,
      result.error,
    );
  }
  return result;
};

// default to false if not set

export const sendEmailUpdateVerification = async (email: string, code: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : email;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `ACTION REQUIRED: Verify Your New Email Address ${isTest ? "(Original: " + email + ")" : ""}`,
    html: buildEmail({
      illustration: 'verification',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Verify Your New Email,</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">To complete the update of your institutional contact records, please use the secure verification code below.</p>
        ${otpBox(code, 10)}
        ${infoCard('If you did not initiate this request, please contact your system administrator immediately.', 'warning')}
      `,
    }),
  });
};

export const sendVerificationEmail = async (email: string, code: string, type: 'welcome' | 'confirmation' | 'device-verification' = 'welcome', deviceInfo?: { deviceModel?: string, location?: string, time?: string }) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : email;

  const subject = type === 'welcome'
    ? `Welcome to Qefas Hub - Verify Your Account ${isTest ? "(Original: " + email + ")" : ""}`
    : type === 'device-verification'
    ? `Qefas Hub New Device Login Verification ${isTest ? "(Original: " + email + ")" : ""}`
    : `Qefas Hub Identity Verification ${isTest ? "(Original: " + email + ")" : ""}`;

  const title = type === 'welcome' ? "Welcome to Qefas Hub" : type === 'device-verification' ? "Verify your new device" : "Verify Your Identity";
  const description = type === 'welcome'
    ? "Thank you for joining our academic community. Please use the verification code below to activate your account and proceed with your subscription."
    : type === 'device-verification'
    ? "We noticed a login attempt to your Qefas Hub account from a device we don't recognize. To continue, enter the verification code below on your login screen."
    : "Please use the secure verification code below to confirm your identity and proceed with your request.";

  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  let bodyContent = `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">${title}</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">${description}</p>
  `;

  if (type === 'device-verification' && deviceInfo) {
      bodyContent += `
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">Device</td>
              <td style="padding:10px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${deviceInfo.deviceModel || 'Unknown Device'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">Location</td>
              <td style="padding:10px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${deviceInfo.location || 'Unknown Location'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">Time</td>
              <td style="padding:10px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${deviceInfo.time || new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>
      `;
  }

  if (type === 'device-verification') {
      bodyContent += `
        <div style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;border:1px dashed #cbd5e1;">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Your verification code</div>
          <div style="font-size:36px;font-weight:900;color:#0f172a;letter-spacing:4px;">${code}</div>
        </div>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">This code expires in 10 minutes.</p>
        <p style="margin:0 0 24px 0;color:#475569;font-size:14px;line-height:1.6;font-weight:600;">Never share this code with anyone. Qefas Hub will never ask you for it.</p>
        <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="margin:0 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Didn't try to log in? Someone may have your password. Please reset it right away and contact us at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a> so we can help secure your account.</p>
      `;
  } else {
      bodyContent += `
        ${otpBox(code, 10)}
      `;
  }

  return await sendMail({
    from: sender,
    to: recipient,
    subject: subject,
    html: buildEmail({
      illustration: type === 'device-verification' ? 'device-code' : 'verification',
      testMode: isTest,
      originalRecipient: email,
      body: bodyContent
    })
  });
};


export const sendNewDeviceLoginEmail = async (email: string, deviceInfo: { deviceModel?: string, location?: string, time?: string }) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : email;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `New Device Login Detected - Qefas Hub ${isTest ? "(Original: " + email + ")" : ""}`,
    html: buildEmail({
      illustration: 'new-device',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">New device sign-in</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We noticed a new sign-in to your Qefas Hub account. If this was you, you don't need to do anything. If not, please secure your account immediately.</p>
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">Device</td>
              <td style="padding:10px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${deviceInfo.deviceModel || 'Unknown Device'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">Location</td>
              <td style="padding:10px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${deviceInfo.location || 'Unknown Location'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">Time</td>
              <td style="padding:10px 0;text-align:right;color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${deviceInfo.time || new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>
        ${ctaButton('Secure My Account', `${(process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '')}/auth/forgot-password`)}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Need a hand? Our team is happy to help at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a>.</p>
      `,
    }),
  });
};

export const sendEmailVerifiedEmail = async (email: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : email;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `Email Verified Successfully - Qefas Hub ${isTest ? "(Original: " + email + ")" : ""}`,
    html: buildEmail({
      illustration: 'success',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Email successfully verified!</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Thank you for confirming your email address. Your Qefas Hub account is now more secure, and you have full access to all features associated with your account.</p>
        ${infoCard('You can now log in and continue managing your academic workflow.', 'success')}
        ${ctaButton('Go to Dashboard', `${(process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '')}/login`)}
      `,
    }),
  });
};

export const sendSetupCompleteEmail = async (email: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : email;

  return await sendMail({
    from: isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: recipient,
    subject: `Your Account is Ready - Qefas Hub ${isTest ? "(Original: " + email + ")" : ""}`,
    html: buildEmail({
      illustration: 'success',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Account Fully Setup,</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Welcome to the fleet! Your institutional identity has been successfully established and your password is now active.</p>
        ${infoCard('Deployment Success: You can now proceed to your dashboard or complete your payment/trial initialization if you have not already.', 'success')}
        ${ctaButton('Access Your Dashboard', `${(process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '')}/auth/login`)}
        ${secondaryLink('Go to website', process.env.FRONTEND_URL || 'https://qefashub.com')}
      `,
    }),
  });
};

export const send2FADisabledEmail = async (email: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : email;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `Security Alert: Two-Factor Authentication Disabled ${isTest ? "(Original: " + email + ")" : ""}`,
    html: buildEmail({
      illustration: 'security',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">2FA Has Been Disabled,</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">This email is to confirm that Two-Factor Authentication (2FA) has been successfully disabled on your Qefas Hub account.</p>
        ${infoCard('Security Recommendation: We strongly suggest leaving 2FA enabled for stronger institutional data protection. You can re-enable it at any time from your account settings.', 'warning')}
        ${infoCard('If you did not make this change, please contact your system administrator immediately.', 'danger')}
      `,
    }),
  });
};

export const sendPaymentReceiptEmail = async (params: {
  email: string;
  amount: number;
  date: Date;
  method: string;
  plan: string;
  expiryDate: Date;
}) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : params.email;

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(params.amount);

  const formattedDate = params.date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedExpiry = params.expiryDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return await sendMail({
    from: (typeof isTest !== 'undefined' && isTest) ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: recipient,
    subject: `Payment Receipt: ${params.plan} Plan - Qefas Hub ${isTest ? "(Original: " + params.email + ")" : ""}`,
    html: buildEmail({
      illustration: 'payment',
      testMode: isTest,
      originalRecipient: params.email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Payment confirmed, thank you!</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We've successfully processed your payment, and your <strong>${params.plan}</strong> subscription is all set. Thank you for choosing Qefas Hub.</p>
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Plan', params.plan)}
            ${receiptRow('Amount paid', formattedAmount, true)}
            ${receiptRow('Date', formattedDate)}
            ${receiptRow('Payment method', params.method)}
          </table>
        </div>
        ${ctaButton('View Billing Dashboard →', `${(process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '')}/dashboard`)}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">If anything looks off, or you have questions about your subscription, just reach out to us at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a> and we'll be glad to help.</p>
      `,
    }),
  });
};


export const sendPaymentFailedEmail = async (params: {
  email: string;
  amount: number;
  date: Date;
  method: string;
  plan: string;
  reason?: string;
}) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : params.email;

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(params.amount);

  const formattedDate = params.date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return await sendMail({
    from: (typeof isTest !== 'undefined' && isTest) ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: recipient,
    subject: `Payment Failed: ${params.plan} Plan - Qefas Hub ${isTest ? "(Original: " + params.email + ")" : ""}`,
    html: buildEmail({
      illustration: 'payment-failed',
      testMode: isTest,
      originalRecipient: params.email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">We couldn't process your payment</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We tried to process the payment for your <strong>${params.plan}</strong> subscription, but the payment didn't go through. No worries, this is easy to fix.</p>
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Plan', params.plan)}
            ${params.amount > 0 ? receiptRow('Amount', formattedAmount) : ''}
            ${receiptRow('Reason', params.reason || 'Transaction declined')}
          </table>
        </div>
        <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.7;">To keep your Premium features running without interruption, please update your payment method or try again with a different card.</p>
        ${ctaButton('Update Payment Method →', `${(process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '')}/pricing`, '#dc2626')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Need a hand? Our team is happy to help at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a>.</p>
      `,
    }),
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
    await SubscriptionComplianceService.verifyAndSyncStatus({ userId: student.id, userType: UserRole.STUDENT });
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
    await SubscriptionComplianceService.verifyAndSyncStatus({ userId: teacher.id, userType: UserRole.TEACHER });
    return { user: teacher, token };
  }

  // Check admin
  const admin = await prisma.admin.findUnique({
    where: { email },
    include: { schoolAdmins: true }
  });
  if (admin) {
    if (!admin.password)
      throw new Error(
        "This account is linked to Google. Please use Google Login.",
      );
    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error("Invalid credentials");

    const token = generateAccessToken(admin.id, "ADMIN");
    await SubscriptionComplianceService.verifyAndSyncStatus({
      userId: admin.id,
      userType: UserRole.ADMIN,
      schoolId: (admin as any).schoolAdmins?.[0]?.schoolId || null
    });
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
    await SubscriptionComplianceService.verifyAndSyncStatus({ userId: parent.id, userType: UserRole.PARENT });
    return { user: parent, token };
  }

  throw new Error("User not found");
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  let baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = baseUrl.includes('localhost') ? `http://${baseUrl}` : `https://${baseUrl}`;
  }
  const resetLink = `${baseUrl}/auth/forgot-password/ResetPassword?token=${code}`;

  if (!email) {
    throw new Error("Email is required to send reset link");
  }

  return await sendMail({
    from: process.env.NODE_ENV === 'test' ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: email,
    subject: "Reset Your Qefas Hub Password",
    html: buildEmail({
      illustration: 'reset',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Reset your password</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We received a request to reset the password for your Qefas Hub account. No problem, let's get you back in. Just click the button below to choose a new one.</p>
        ${ctaButton('Reset Password →', resetLink)}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">For your security, this link will expire in 15 minutes.</p>
        <p style="margin:16px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your password won't change unless you use the link above. If you're worried someone else is trying to access your account, contact us at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a>.</p>
        <p style="margin:24px 0 4px 0;color:#94a3b8;font-size:12px;text-align:center;">If the button doesn't work, copy and paste this link into your browser:</p>
        <div style="background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;word-break:break-all;font-size:12px;color:#374151;text-align:center;margin-bottom:8px;">${resetLink}</div>
      `,
    }),
  });
};



export const sendTeacherInvitationEmail = async (email: string, token: string, schoolName: string, teacherName: string) => {
  let baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = baseUrl.includes('localhost') ? `http://${baseUrl}` : `https://${baseUrl}`;
  }
  const claimLink = `${baseUrl}/auth/claim-account?token=${token}&type=teacher`;

  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : email;

  return await sendMail({
    from: (typeof isTest !== 'undefined' && isTest) ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: recipient,
    subject: `Invitation to join ${schoolName} on Qefas Hub`,
    html: buildEmail({
      illustration: 'invite',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Hello ${teacherName},</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">You have been invited to join <strong>${schoolName}</strong> as a teacher on Qefas Hub. Your account has been pre-registered by the school administrator.</p>
        ${infoCard('Your institutional account is ready. Click the button below to set up your password and access your dashboard.', 'info')}
        ${ctaButton('Claim Your Account', claimLink)}
        ${secondaryLink('Go to website', process.env.FRONTEND_URL || 'https://qefashub.com')}
      `,
    }),
  });
};


export const sendStudentInvitationEmail = async (email: string, token: string, schoolName: string, studentName: string) => {
  let baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = baseUrl.includes('localhost') ? `http://${baseUrl}` : `https://${baseUrl}`;
  }
  const claimLink = `${baseUrl}/auth/claim-account?token=${token}&type=student`;

  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : email;

  return await sendMail({
    from: (typeof isTest !== 'undefined' && isTest) ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: recipient,
    subject: `Invitation to join ${schoolName} on Qefas Hub`,
    html: buildEmail({
      illustration: 'invite',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Hello ${studentName},</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">You have been invited to join <strong>${schoolName}</strong> as a student on Qefas Hub. Your account has been pre-registered by your school.</p>
        ${infoCard('Your student account is ready. Click the button below to set up your password and access your learning dashboard.', 'info')}
        ${ctaButton('Claim Your Account', claimLink)}
        ${secondaryLink('Go to website', process.env.FRONTEND_URL || 'https://qefashub.com')}
      `,
    }),
  });
};



export const googleAuthService = async (
  supabaseToken: string,
  userRole?: UserRole,
) => {
  // Check if Google Auth is enabled in platform settings
  const googleAuthSetting = await prisma.platformSettings.findUnique({
    where: { key: "google_auth_enabled" }
  });

  if (googleAuthSetting && googleAuthSetting.value === "false") {
    throw new Error("Google Authentication is currently deactivated by the platform administrator.");
  }

  // Check if Google Auth is enabled for this specific role
  if (userRole) {
    const googleAuthFeature = await prisma.platformFeature.findUnique({
      where: { featureKey: "googleLogin" }
    });

    if (googleAuthFeature) {
      const roleKey = `${userRole.toLowerCase()}Enabled` as keyof typeof googleAuthFeature;
      if (googleAuthFeature[roleKey] === false) {
        throw new Error(`Google Authentication is deactivated for ${userRole}s.`);
      }
    }
  }

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
  let actualRole: UserRole = userRole as UserRole;


  // Global lookup to detect "Wrong Portal" logins
  const [existingStudent, existingTeacher, existingAdmin, existingParent] = await Promise.all([
    prisma.student.findFirst({ where: { OR: [{ googleId }, { email }] } }),
    prisma.teacher.findFirst({ where: { OR: [{ googleId }, { email }] } }),
    prisma.admin.findFirst({ where: { OR: [{ googleId }, { email }] }, include: { schoolAdmins: true } }),
    prisma.parent.findFirst({ where: { OR: [{ googleId }, { email }] } }),
  ]);

  const existingUser = existingStudent || existingTeacher || existingAdmin || existingParent;

  if (existingUser) {
    // Check if they exist in the exact role they are trying to log in as
    let foundInRequestedRole = false;

    if (userRole === UserRole.STUDENT && existingStudent) {
      user = existingStudent;
      foundInRequestedRole = true;
    } else if (userRole === UserRole.TEACHER && existingTeacher) {
      user = existingTeacher;
      foundInRequestedRole = true;
    } else if (userRole === UserRole.ADMIN && existingAdmin) {
      user = existingAdmin;
      foundInRequestedRole = true;
    } else if (userRole === UserRole.PARENT && existingParent) {
      user = existingParent;
      foundInRequestedRole = true;
    }

    if (!foundInRequestedRole) {
      // Find what role they actually are to give a helpful error message
      let detectedRole = "";
      if (existingAdmin) detectedRole = "School Admin";
      else if (existingTeacher) detectedRole = "Teacher";
      else if (existingStudent) detectedRole = "Student";
      else if (existingParent) detectedRole = "Parent";

      throw new Error(`This email is registered as a ${detectedRole}. Please login through the correct portal.`);
    }

    actualRole = userRole as UserRole; // They are in the correct portal

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
        user = await prisma.student.create({
          data: {
            name: name || "Google User",
            email,
            googleId,
            authProvider: "GOOGLE",
            studentCode,
            role: UserRole.STUDENT,
            verified: true,
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });
        await UserSubscriptionService.initializeFreePlan(user.id, UserRole.STUDENT);
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
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });
        await UserSubscriptionService.initializeFreePlan(user.id, UserRole.TEACHER);
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
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });
        await UserSubscriptionService.initializeFreePlan(user.id, UserRole.ADMIN);
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
            acceptedTerms: true,
            termsAcceptedAt: new Date(),
          },
        });
        await UserSubscriptionService.initializeFreePlan(user.id, UserRole.PARENT);
        break;
      }

      default:
        throw new Error(`Google Login not supported for role: ${userRole}`);
    }
  }

  const token = generateAccessToken(user.id, actualRole);

  // Real-time subscription compliance check
  await SubscriptionComplianceService.verifyAndSyncStatus({
    userId: user.id,
    userType: actualRole,
    schoolId: user.schoolId || (user as any).schoolAdmins?.[0]?.schoolId || null
  });

  return { user, token };
};

// ─────────────────────────────────────────────────────────────────────────────
// Payment Failure Email
// Sent when a Paystack charge.failed webhook is received for a subscription
// auto-renewal. Non-blocking — caller wraps in try/catch.
// ─────────────────────────────────────────────────────────────────────────────
export const sendPaymentFailureEmail = async (params: {
  email: string;
  plan: string;
  amount: number;
  date: Date;
  method: string;
  reason?: string;
}) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : params.email;

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(params.amount);

  const formattedDate = params.date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const dashboardUrl = `${(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/dashboard/billing`;

  return await sendMail({
    from: (typeof isTest !== 'undefined' && isTest) ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: recipient,
    subject: `Action Required: Payment Failed for ${params.plan} Plan — Qefas Hub${isTest ? ` (Original: ${params.email})` : ''}`,
    html: buildEmail({
      illustration: 'payment-failed',
      testMode: isTest,
      originalRecipient: params.email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Payment Failed,</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We were unable to renew your <strong>${params.plan}</strong> plan subscription. Please update your payment method to keep your access active.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          ${receiptRow('Plan', params.plan)}
          ${receiptRow('Amount', formattedAmount)}
          ${receiptRow('Date', formattedDate)}
          ${receiptRow('Method', params.method)}
          ${params.reason ? receiptRow('Reason', params.reason) : ''}
        </table>
        ${infoCard('To keep your subscription active and avoid losing access to premium features, please update your payment method in your billing dashboard as soon as possible.', 'danger')}
        ${ctaButton('Update Payment Method', dashboardUrl, '#6366f1')}
      `,
    }),
  });
};

export const sendSubscriptionExpiredEmail = async (email: string, planName: string) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? process.env.TEST_EMAIL as string : email;

  const dashboardUrl = `${(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/dashboard/billing`;

  return await sendMail({
    from: (typeof isTest !== 'undefined' && isTest) ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim(),
    to: recipient,
    subject: `Subscription Expired: ${planName} Plan — Qefas Hub${isTest ? ` (Original: ${email})` : ''}`,
    html: buildEmail({
      illustration: 'payment-failed',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Your Subscription Has Expired,</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Your <strong>${planName}</strong> premium access has ended and your account has been transitioned to the Free tier.</p>
        ${infoCard('To regain access to your premium features and limits, please renew your subscription from your billing dashboard.', 'danger')}
        ${ctaButton('Renew Subscription', dashboardUrl, '#6366f1')}
      `,
    }),
  });
};


// ─── Admin Join Request Email

// ─── Admin Join Request Email ─────────────────────────────────────────────────
// Sent to every SCHOOL_OWNER and PRINCIPAL when a new admin requests to join.
export const sendAdminJoinRequestEmail = async (params: {
  recipientEmail: string;
  recipientName: string;
  applicantName: string;
  applicantEmail: string;
  schoolName: string;
  approvalUrl: string;
}) => {
  const { recipientEmail, recipientName, applicantName, applicantEmail, schoolName, approvalUrl } = params;
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : recipientEmail;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `New Admin Request for ${schoolName} — Action Required${isTest ? ` (Original: ${recipientEmail})` : ''}`,
    html: buildEmail({
      illustration: 'invite',
      testMode: isTest,
      originalRecipient: recipientEmail,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">New administrator request for ${schoolName}</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi ${recipientName},</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Someone has asked to join <strong>${schoolName}</strong> as an administrator on Qefas Hub, and they're waiting on you.</p>
        <div style="background:#f8fafc;border-radius:14px;padding:18px;margin-bottom:20px;border:1px solid #e2e8f0;">
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Applicant Details</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Name', applicantName)}
            ${receiptRow('Email', applicantEmail)}
          </table>
        </div>
        ${infoCard("<strong>Action required:</strong> This person won't be able to log in until you approve their request and assign them a role.", 'warning')}
        ${ctaButton('Review Request →', approvalUrl)}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">If you don't recognize this person, you can simply decline the request.</p>
      `,
    }),
  });
};

// ─── Admin Approval Email ─────────────────────────────────────────────
// Sent to the newly approved admin with their assigned role.


// ─── Admin Approval Email ─────────────────────────────────────────────────────
// Sent to the newly approved admin with their assigned role.
export const sendAdminApprovalEmail = async (params: {
  adminEmail: string;
  adminName: string;
  schoolName: string;
  assignedRole: string;
  loginUrl: string;
}) => {
  const { adminEmail, adminName, schoolName, assignedRole, loginUrl } = params;
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : adminEmail;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  // Format role name for display (e.g. SCHOOL_OWNER → School Owner)
  const formattedRole = assignedRole
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const roleColors: Record<string, string> = {
    SCHOOL_OWNER: '#1d4ed8',
    PRINCIPAL: '#7c3aed',
    REGISTRAR: '#0f766e',
    ACCOUNTANT: '#b45309',
    SUPPORT: '#0369a1',
  };
  const roleColor = roleColors[assignedRole] || '#2563eb';

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `You're approved! Welcome to ${schoolName} — ${formattedRole}${isTest ? ` (Original: ${adminEmail})` : ''}`,
    html: buildEmail({
      illustration: 'success',
      testMode: isTest,
      originalRecipient: adminEmail,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">You're in, ${adminName}!</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Great news: the administrators of <strong>${schoolName}</strong> have approved your request, and your access is ready.</p>
        <div style="margin:20px 0;">
          <span style="font-size:15px;color:#475569;margin-right:8px;">Your role:</span>
          <span style="display:inline-block;background:${roleColor};color:#ffffff;font-size:13px;font-weight:700;padding:6px 16px;border-radius:100px;letter-spacing:0.5px;">${formattedRole}</span>
        </div>
        <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.7;">You can now log in and start managing your school on Qefas Hub.</p>
        ${ctaButton('Log In to Dashboard →', loginUrl)}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Welcome to the team.</p>
      `,
    }),
  });
};

// ─── New Admin Joined Notification Email ────────────────────────────────────────────
// Sent to existing active school admins when a new admin is approved.


// ─── New Admin Joined Notification Email ──────────────────────────────────────
// Sent to existing active school admins when a new admin is approved.
export const sendNewAdminJoinedEmail = async (params: {
  recipientEmail: string;
  recipientName: string;
  newAdminName: string;
  assignedRole: string;
  schoolName: string;
}) => {
  const { recipientEmail, recipientName, newAdminName, assignedRole, schoolName } = params;
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : recipientEmail;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  const formattedRole = assignedRole
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `New Admin Joined ${schoolName} — ${formattedRole}${isTest ? ` (Original: ${recipientEmail})` : ''}`,
    html: buildEmail({
      illustration: 'success',
      testMode: isTest,
      originalRecipient: recipientEmail,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">New Admin Joined the Team,</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName}</strong>, <strong>${newAdminName}</strong> has just been approved and joined the admin team at <strong>${schoolName}</strong> as a <strong>${formattedRole}</strong>.</p>
        ${infoCard('This is just an informational notification. No action is required from you.', 'info')}
      `,
    }),
  });
};

// ─── Generic Welcome Email

// ─── Generic Welcome Email ────────────────────────────────────────────────────
export const sendWelcomeEmail = async (params: {
  email: string;
  name: string;
  role: string;
  loginUrl: string;
}) => {
  const { email, name, role, loginUrl } = params;
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : email;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  // Format role name for display
  const formattedRole = role
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `Welcome to Qefas Hub! Your account is verified${isTest ? ` (Original: ${email})` : ''}`,
    html: buildEmail({
      illustration: 'success',
      testMode: isTest,
      originalRecipient: email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Hi ${name}, I'm Ola from Qefas Hub. Welcome!</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">You've just joined one of the most exciting platforms for education management, and we're so glad you're here.</p>
        <p style="margin:0 0 16px 0;color:#0f172a;font-size:16px;font-weight:800;letter-spacing:-0.3px;">Education management, reimagined.</p>
        <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.7;">Qefas Hub brings your entire institution together in one place. Manage your students, teachers, attendance, grades, and parent communication without ever juggling multiple tools. Everything you need is right here, working together.</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Ready to get started? We'd love to have you on board.</p>
        ${ctaButton('Start Your Journey →', loginUrl)}
      `,
    }),
  });
};

// ─── Admin Rejection Email

// ─── Admin Rejection Email ────────────────────────────────────────────────────
// Sent to the rejected admin with an optional reason from the approver.
export const sendAdminRejectionEmail = async (params: {
  adminEmail: string;
  adminName: string;
  schoolName: string;
  reason?: string;
}) => {
  const { adminEmail, adminName, schoolName, reason } = params;
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : adminEmail;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `Update on your admin request for ${schoolName}${isTest ? ` (Original: ${adminEmail})` : ''}`,
    html: buildEmail({
      illustration: 'security',
      testMode: isTest,
      originalRecipient: adminEmail,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Update on your request</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi ${adminName},</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Thank you for your interest in joining <strong>${schoolName}</strong> on Qefas Hub. After reviewing your administrator access request, the school's administrators weren't able to approve it this time.</p>
        ${reason ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
          <span style="font-size:14px;color:#475569;font-weight:600;">Reason provided:</span> <span style="font-size:14px;color:#0f172a;">${reason}</span>
        </div>` : ''}
        ${reason && reason.toLowerCase().includes('school') ? `<p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">This is often an easy fix. If you meant to join a different school, you're welcome to submit a new request and select the right one.</p>` : ''}
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">If you think this decision was made in error, please reach out to the school administrators directly and they'll be happy to help.</p>
      `,
    }),
  });
};


export const sendAdminLimitReachedEmail = async (params: { recipientEmail: string; recipientName: string; applicantName: string; applicantEmail: string; schoolName: string; }) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : params.recipientEmail;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();
  return await sendMail({
    from: sender,
    to: recipient,
    subject: `Admin Slot Filled: ${params.applicantName} tried to join ${params.schoolName}`,
    html: buildEmail({
      illustration: 'invite',
      testMode: isTest,
      originalRecipient: params.recipientEmail,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Admin Limit Reached,</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${params.recipientName}</strong>, <strong>${params.applicantName}</strong> (${params.applicantEmail}) tried to join <strong>${params.schoolName}</strong> as an administrator, but your current plan's admin slot limit has been reached.</p>
        ${infoCard('Please upgrade to a higher tier to allow additional administrators to join your school.', 'warning')}
        ${ctaButton('Upgrade Plan', `${(process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '')}/dashboard/billing`, '#6366f1')}
      `,
    }),
  });
};

export const sendNewDeviceAlertEmail = async (params: {
  email: string;
  name: string;
  deviceName: string;
  location: string;
  time: string;
}) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : params.email;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `New login to your Qefas Hub account${isTest ? ` (Original: ${params.email})` : ''}`,
    html: buildEmail({
      illustration: 'new-device',
      testMode: isTest,
      originalRecipient: params.email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">New device sign-in</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi ${params.name},</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We noticed a new sign-in to your Qefas Hub account. If this was you, you don't need to do anything. If not, please secure your account immediately.</p>
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Device', params.deviceName)}
            ${receiptRow('Location', params.location)}
            ${receiptRow('Time', params.time)}
          </table>
        </div>
        ${ctaButton('Secure My Account →', `${(process.env.FRONTEND_URL || 'https://qefashub.com').replace(/\/$/, '')}/auth/forgot-password`, '#dc2626')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Need a hand? Our team is happy to help at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a>.</p>
      `,
    }),
  });
};

export const sendDeviceVerificationCodeEmail = async (params: {
  email: string;
  name: string;
  code: string;
  deviceName?: string;
  location?: string;
  time?: string;
}) => {
  const isTest = process.env.RESEND_TEST?.trim() === 'true';
  const recipient = isTest ? (process.env.TEST_EMAIL as string)?.trim() : params.email;
  const sender = isTest ? 'onboarding@resend.dev' : (process.env.MAIL_FROM as string)?.trim();

  return await sendMail({
    from: sender,
    to: recipient,
    subject: `Device Verification Code: ${params.code}${isTest ? ` (Original: ${params.email})` : ''}`,
    html: buildEmail({
      illustration: 'device-code',
      testMode: isTest,
      originalRecipient: params.email,
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Verify your new device</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi ${params.name},</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We noticed a login attempt to your Qefas Hub account from a device we don't recognize. To continue, enter the verification code below on your login screen.</p>
        
        ${params.deviceName ? `
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Device', params.deviceName)}
            ${params.location ? receiptRow('Location', params.location) : ''}
            ${params.time ? receiptRow('Time', params.time) : ''}
          </table>
        </div>
        ` : ''}

        <div style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;border:1px dashed #cbd5e1;">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Your verification code</div>
          <div style="font-size:36px;font-weight:900;color:#0f172a;letter-spacing:4px;">${params.code}</div>
        </div>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">This code expires in 10 minutes.</p>
        <p style="margin:0 0 24px 0;color:#475569;font-size:14px;line-height:1.6;font-weight:600;">Never share this code with anyone. Qefas Hub will never ask you for it.</p>

        <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="margin:0 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Didn't try to log in? Someone may have your password. Please reset it right away and contact us at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a> so we can help secure your account.</p>
      `,
    }),
  });
};
