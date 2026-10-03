"use client"

import { useState } from "react"
import { Mail, ArrowRight, CheckCircle2, ShieldAlert, CreditCard, Ticket, KeyRound, UserPlus, Smartphone, Loader2 } from "lucide-react"
import { platformClient } from "@/lib/api/platformClient";
import { toast } from "react-toastify";

// --- Email Template Renderer Logic (Copied from backend for preview) ---
const BASE_URL = ''; // Use relative paths for local preview
const LOGO_URL = '/logo/favicon.png';

const twitterIcon = `<a href="https://twitter.com/qefashub" style="display:inline-block;margin:0 6px;"><img src="${BASE_URL}/email/twitter.png" alt="Twitter" width="20" height="20" style="border:0;display:block;" /></a>`;
const facebookIcon = `<a href="https://facebook.com/qefashub" style="display:inline-block;margin:0 6px;"><img src="${BASE_URL}/email/facebook.png" alt="Facebook" width="20" height="20" style="border:0;display:block;" /></a>`;
const instagramIcon = `<a href="https://instagram.com/qefashub" style="display:inline-block;margin:0 6px;"><img src="${BASE_URL}/email/instagram.png" alt="Instagram" width="20" height="20" style="border:0;display:block;" /></a>`;

type EmailIllustration =
  | 'verification'
  | 'success'
  | 'security'
  | 'payment'
  | 'payment-failed'
  | 'invite'
  | 'reset'
  | 'device-code'
  | 'new-device';

const illustrationMap: Record<EmailIllustration, { src: string; bg: string; alt: string }> = {
  verification:     { src: `/email/hero-verification.png`,    bg: '#eef0fc', alt: 'Email Verification' },
  success:          { src: `/email/hero-success.png`,         bg: '#ecfdf5', alt: 'Account Ready' },
  security:         { src: `/email/hero-security.png`,        bg: '#fffbeb', alt: 'Security Alert' },
  payment:          { src: `/email/hero-payment.png`,         bg: '#eff6ff', alt: 'Payment Confirmed' },
  'payment-failed': { src: `/email/hero-payment-failed.png`,  bg: '#fef2f2', alt: 'Payment Failed' },
  invite:           { src: `/email/hero-invite.png`,          bg: '#f5f3ff', alt: "You're Invited" },
  reset:            { src: `/email/hero-reset.png`,           bg: '#f0fdf4', alt: 'Password Reset' },
  'device-code':    { src: `/email/verification-code-new-device.png`, bg: '#f8fafc', alt: 'Verification Code' },
  'new-device':     { src: `/email/new-Device-verified.png`,          bg: '#eef0fc', alt: 'New Device Verified' },
};

function buildEmail(options: {
  illustration: EmailIllustration;
  body: string;
  testMode?: boolean;
  originalRecipient?: string;
}): string {
  const { illustration, body, testMode, originalRecipient } = options;
  const il = illustrationMap[illustration];
  const year = new Date().getFullYear();

  const testBanner =
    testMode && originalRecipient
      ? `<tr><td style="padding:0 32px 16px 32px;">
          <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:10px 14px;text-align:center;font-size:11px;font-weight:700;color:#991b1b;">
            [TEST MODE] Original Recipient: ${originalRecipient}
          </div>
         </td></tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Qefas Hub Preview</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f8;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px -8px rgba(0,0,0,0.14);">

          <!-- Header (Logo + Name) -->
          <tr>
            <td style="padding:28px 32px 0 32px;text-align:left;">
              <table cellpadding="0" cellspacing="0" style="margin:0;">
                <tr>
                  <td style="padding-right:12px;">
                    <img src="${LOGO_URL}" alt="Qefas Hub Logo" width="36" height="36"
                         style="border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.18);display:block;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Qefas Hub</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Illustration Banner -->
          <tr>
            <td style="padding:20px 24px 0 24px;">
              <div style="background:${il.bg};border-radius:18px;text-align:center;padding:16px;">
                <img src="${il.src}" alt="${il.alt}" width="440"
                     style="display:block;width:100%;height:auto;max-height:220px;object-fit:cover;border-radius:12px;" />
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:28px 32px 12px 32px;">
              ${body}
            </td>
          </tr>

          ${testBanner}

          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #f1f5f9;padding-top:24px;text-align:center;">
                    <p style="margin:0 0 4px 0;color:#94a3b8;font-size:12px;line-height:1.6;">
                      Please contact us if you have any questions via email at:
                      <a href="mailto:support@qefashub.com" style="color:#2563eb;font-weight:600;text-decoration:none;">support@qefashub.com</a>
                    </p>
                    <p style="margin:0 0 16px 0;color:#cbd5e1;font-size:11px;">
                      © ${year} Qefas Hub. All rights reserved.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td>${twitterIcon}</td>
                        <td>${facebookIcon}</td>
                        <td>${instagramIcon}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string, color = '#2563eb'): string {
  const finalLabel = label.includes('→') ? label : `${label} →`;
  return `<div style="text-align:center;margin:24px 0 16px 0;">
    <a href="${href}" style="display:inline-block;color:${color};text-decoration:none;font-weight:800;font-size:16px;letter-spacing:0.3px;padding:8px 0;border-bottom:2px solid ${color};">${finalLabel}</a>
  </div>`;
}

function otpBox(code: string, expiryMinutes = 10): string {
  return `<div style="background:#eef0fc;border-radius:16px;padding:24px 16px;text-align:center;margin:20px 0;">
    <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:3px;margin-bottom:14px;">Verification Code</div>
    <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1d4ed8;font-family:'Courier New',Courier,monospace;">${code}</div>
    <div style="margin-top:14px;display:inline-block;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:5px 14px;">
      <span style="font-size:12px;color:#c2410c;font-weight:700;">&#9201; Expires in ${expiryMinutes} minutes</span>
    </div>
  </div>
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 16px;margin-bottom:20px;">
    <span style="font-size:13px;color:#92400e;font-weight:600;">&#128272; Never share this code with anyone. Qefas Hub will never ask for your code.</span>
  </div>`;
}

function infoCard(message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info'): string {
  const styles = {
    info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', icon: 'ℹ️' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#065f46', icon: '✅' },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '⚠️' },
    danger:  { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: '🚨' },
  };
  const s = styles[type];
  return `<div style="background:${s.bg};border:1px solid ${s.border};border-radius:12px;padding:14px 16px;margin-bottom:20px;">
    <span style="font-size:13px;color:${s.color};font-weight:600;">${s.icon} ${message}</span>
  </div>`;
}

function receiptRow(label: string, value: string, highlight = false): string {
  return `<tr>
    <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:10px 0;text-align:right;color:${highlight ? '#059669' : '#0f172a'};font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`;
}

// --- Email Mock Data ---

const templates = [
  {
    id: "verification",
    title: "Email Verification",
    icon: CheckCircle2,
    color: "text-blue-500",
    generate: () => buildEmail({
      illustration: 'verification',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Verify your email</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there! Please use the verification code below to verify your Qefas Hub account.</p>
        ${otpBox("123456")}
      `
    })
  },
  {
    id: "email-verified",
    title: "Email Verified",
    icon: CheckCircle2,
    color: "text-emerald-500",
    generate: () => buildEmail({
      illustration: 'success',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Email successfully verified!</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Thank you for confirming your email address. Your Qefas Hub account is now more secure, and you have full access to all features associated with your account.</p>
        ${infoCard('You can now log in and continue managing your academic workflow.', 'success')}
        ${ctaButton('Go to Dashboard →', '#')}
      `
    })
  },
  {
    id: "welcome",
    title: "Welcome Email",
    icon: Mail,
    color: "text-green-500",
    generate: () => buildEmail({
      illustration: 'success',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Hi John, I'm Ola from Qefas Hub. Welcome!</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">You've just joined one of the most exciting platforms for education management, and we're so glad you're here.</p>
        <p style="margin:0 0 16px 0;color:#0f172a;font-size:16px;font-weight:800;letter-spacing:-0.3px;">Education management, reimagined.</p>
        <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.7;">Qefas Hub brings your entire institution together in one place. Manage your students, teachers, attendance, grades, and parent communication without ever juggling multiple tools. Everything you need is right here, working together.</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Ready to get started? We'd love to have you on board.</p>
        ${ctaButton('Start Your Journey →', '#')}
      `
    })
  },
  {
    id: "admin-invite",
    title: "Admin Registration Request",
    icon: UserPlus,
    color: "text-indigo-500",
    generate: () => buildEmail({
      illustration: 'invite',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">New administrator request for Springfield High</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Someone has asked to join <strong>Springfield High</strong> as an administrator on Qefas Hub, and they're waiting on you.</p>
        <div style="background:#f8fafc;border-radius:14px;padding:18px;margin-bottom:20px;border:1px solid #e2e8f0;">
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">Applicant Details</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Name', 'Jane Doe')}
            ${receiptRow('Email', 'jane@example.com')}
          </table>
        </div>
        ${infoCard("<strong>Action required:</strong> This person won't be able to log in until you approve their request and assign them a role.", 'warning')}
        ${ctaButton('Review Request →', '#')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">If you don't recognize this person, you can simply decline the request.</p>
      `
    })
  },
  {
    id: "admin-approved",
    title: "Admin Account Approved",
    icon: CheckCircle2,
    color: "text-emerald-500",
    generate: () => buildEmail({
      illustration: 'success',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">You're in, Jane!</h1>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Great news: the administrators of <strong>Springfield High</strong> have approved your request, and your access is ready.</p>
        <div style="margin:20px 0;">
          <span style="font-size:15px;color:#475569;margin-right:8px;">Your role:</span>
          <span style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:13px;font-weight:700;padding:6px 16px;border-radius:100px;letter-spacing:0.5px;">Principal</span>
        </div>
        <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.7;">You can now log in and start managing your school on Qefas Hub.</p>
        ${ctaButton('Log In to Dashboard →', '#')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Welcome to the team.</p>
      `
    })
  },
  {
    id: "admin-rejected",
    title: "Admin Account Rejected",
    icon: ShieldAlert,
    color: "text-red-500",
    generate: () => buildEmail({
      illustration: 'security',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Update on your request</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi Jane,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">Thank you for your interest in joining <strong>Springfield High</strong> on Qefas Hub. After reviewing your administrator access request, the school's administrators weren't able to approve it this time.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
          <span style="font-size:14px;color:#475569;font-weight:600;">Reason provided:</span> <span style="font-size:14px;color:#0f172a;">Incorrect school selection.</span>
        </div>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">This is often an easy fix. If you meant to join a different school, you're welcome to submit a new request and select the right one.</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">If you think this decision was made in error, please reach out to the school administrators directly and they'll be happy to help.</p>
      `
    })
  },
  {
    id: "payment-success",
    title: "Payment Receipt",
    icon: CreditCard,
    color: "text-blue-500",
    generate: () => buildEmail({
      illustration: 'payment',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Payment confirmed, thank you!</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We've successfully processed your payment, and your <strong>Premium</strong> subscription is all set. Thank you for choosing Qefas Hub.</p>
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            ${receiptRow('Plan', 'Premium')}
            ${receiptRow('Amount paid', '$99.00', true)}
            ${receiptRow('Date', 'Oct 1, 2026')}
            ${receiptRow('Payment method', 'Card ending in 4242')}
          </table>
        </div>
        ${ctaButton('View Billing Dashboard →', '#')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">If anything looks off, or you have questions about your subscription, just reach out to us at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a> and we'll be glad to help.</p>
      `
    })
  },
  {
    id: "payment-failed",
    title: "Payment Failed",
    icon: ShieldAlert,
    color: "text-red-500",
    generate: () => buildEmail({
      illustration: 'payment-failed',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">We couldn't process your payment</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We tried to renew your <strong>Premium</strong> subscription, but the payment didn't go through. No worries, this is easy to fix.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            ${receiptRow('Plan', 'Premium')}
            ${receiptRow('Amount', '$99.00')}
            ${receiptRow('Reason', 'Insufficient funds')}
          </table>
        </div>
        <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.7;">To keep your Premium features running without interruption, please update your payment method or try again with a different card.</p>
        ${ctaButton('Update Payment Method →', '#')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Need a hand? Our team is happy to help at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a>.</p>
      `
    })
  },
  {
    id: "password-reset",
    title: "Password Reset",
    icon: KeyRound,
    color: "text-slate-500",
    generate: () => buildEmail({
      illustration: 'reset',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Reset your password</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi there,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We received a request to reset the password for your Qefas Hub account. No problem, let's get you back in. Just click the button below to choose a new one.</p>
        ${ctaButton('Reset Password →', '#')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">For your security, this link will expire in 15 minutes.</p>
        <p style="margin:16px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your password won't change unless you use the link above. If you're worried someone else is trying to access your account, contact us at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a>.</p>
        <p style="margin:24px 0 4px 0;color:#94a3b8;font-size:12px;text-align:center;">If the button doesn't work, copy and paste this link into your browser:</p>
        <div style="background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;word-break:break-all;font-size:12px;color:#374151;text-align:center;margin-bottom:8px;">http://localhost:3000/auth/forgot-password/ResetPassword?token=xxx</div>
      `
    })
  },
  {
    id: "new-device",
    title: "New Device Login",
    icon: Smartphone,
    color: "text-amber-500",
    generate: () => buildEmail({
      illustration: 'new-device',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">New device sign-in</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi Jane,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We noticed a new sign-in to your Qefas Hub account. If this was you, you don't need to do anything. If not, please secure your account immediately.</p>
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Device', 'iPhone 14 Pro - Safari')}
            ${receiptRow('Location', 'Lagos, Nigeria')}
            ${receiptRow('Time', 'Oct 1, 2026, 10:30 AM')}
          </table>
        </div>
        ${ctaButton('Secure My Account →', '#')}
        <p style="margin:24px 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Need a hand? Our team is happy to help at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a>.</p>
      `
    })
  },
  {
    id: "device-verification",
    title: "Device Verification",
    icon: ShieldAlert,
    color: "text-indigo-500",
    generate: () => buildEmail({
      illustration: 'device-code',
      body: `
        <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Verify your new device</h1>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">Hi Jane,</p>
        <p style="margin:0 0 20px 0;color:#475569;font-size:15px;line-height:1.7;">We noticed a login attempt to your Qefas Hub account from a device we don't recognize. To continue, enter the verification code below on your login screen.</p>
        
        <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${receiptRow('Device', 'iPhone 14 Pro - Safari')}
            ${receiptRow('Location', 'Lagos, Nigeria')}
            ${receiptRow('Time', 'Oct 1, 2026, 10:30 AM')}
          </table>
        </div>

        <div style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;border:1px dashed #cbd5e1;">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Your verification code</div>
          <div style="font-size:36px;font-weight:900;color:#0f172a;letter-spacing:4px;">123456</div>
        </div>
        <p style="margin:0 0 16px 0;color:#475569;font-size:15px;line-height:1.7;">This code expires in 10 minutes.</p>
        <p style="margin:0 0 24px 0;color:#475569;font-size:14px;line-height:1.6;font-weight:600;">Never share this code with anyone. Qefas Hub will never ask you for it.</p>

        <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="margin:0 0 0 0;color:#64748b;font-size:14px;line-height:1.6;">Didn't try to log in? Someone may have your password. Please reset it right away and contact us at <a href="mailto:support@qefashub.com" style="color:#2563eb;text-decoration:none;font-weight:600;">support@qefashub.com</a> so we can help secure your account.</p>
      `
    })
  }
];

export default function EmailTemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
    const activeTemplate = templates.find(t => t.id === selectedTemplate)
    const [isSending, setIsSending] = useState(false)

    const handleSendTestEmail = async () => {
        const testEmail = prompt(`Enter the email address to receive the "${activeTemplate?.title}" template test:`, "");
        if (!testEmail) return;

        setIsSending(true);
        try {
            await platformClient.post("/platform/email/test", {
                templateId: activeTemplate?.id,
                email: testEmail
            });
            toast.success("Test email sent successfully!");
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to send test email");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Email Templates</h1>
                <p className="text-slate-500 font-medium mt-1">Preview system automated email designs and content.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                        {templates.map((template) => {
                            const Icon = template.icon
                            const isActive = selectedTemplate === template.id

                            return (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                        isActive 
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold" 
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                                    }`}
                                >
                                    <Icon size={18} className={isActive ? "text-indigo-600 dark:text-indigo-400" : template.color} />
                                    <span className="text-sm truncate">{template.title}</span>
                                    {isActive && <ArrowRight size={14} className="ml-auto opacity-50" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner h-[800px] flex flex-col">
                        <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2 justify-between">
                            <div className="flex gap-1.5 w-20">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-1 text-xs text-slate-500 dark:text-slate-400 font-mono flex-1 max-w-md text-center truncate mx-4">
                                Preview: {activeTemplate?.title}
                            </div>
                            <div className="flex justify-end w-20">
                                <button 
                                    onClick={handleSendTestEmail}
                                    disabled={isSending}
                                    className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded border border-indigo-200 dark:border-indigo-500/30 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                                    Test
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#f0f2f8] p-4 relative">
                            {/* We use an iframe to isolate the email styles completely from the dashboard */}
                            {activeTemplate && (
                                <iframe
                                    srcDoc={activeTemplate.generate()}
                                    className="w-full h-full bg-transparent border-0 rounded-xl"
                                    title={activeTemplate.title}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
