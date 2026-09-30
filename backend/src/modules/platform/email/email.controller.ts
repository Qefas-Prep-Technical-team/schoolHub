import { Request, Response } from "express";
import * as authService from "../../auth/auth.service";

export const testEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId, email } = req.body;

    if (!templateId || !email) {
      return res.status(400).json({ success: false, message: "Template ID and target email are required." });
    }

    switch (templateId) {
      case "email-verification":
        await authService.sendEmailUpdateVerification(email, "582914");
        break;
      case "welcome":
        await authService.sendWelcomeEmail({
          email,
          name: "Test User",
          role: "Administrator",
          loginUrl: "http://localhost:3000/login"
        });
        break;
      case "admin-request":
        await authService.sendAdminJoinRequestEmail({
          recipientEmail: email,
          recipientName: "Platform Admin",
          applicantName: "Jane Doe",
          applicantEmail: "jane@example.com",
          schoolName: "Springfield High",
          approvalUrl: "http://localhost:3000/review"
        });
        break;
      case "admin-approved":
        await authService.sendAdminApprovalEmail({
          adminEmail: email,
          adminName: "Jane Doe",
          schoolName: "Springfield High",
          assignedRole: "Principal",
          loginUrl: "http://localhost:3000/dashboard"
        });
        break;
      case "admin-rejected":
        await authService.sendAdminRejectionEmail({
          adminEmail: email,
          adminName: "Jane Doe",
          schoolName: "Springfield High",
          reason: "Incorrect school selection"
        });
        break;
      case "payment-receipt":
        await authService.sendPaymentReceiptEmail({
          email,
          plan: "Premium",
          amount: 99.00,
          date: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          method: "Card ending in 4242"
        });
        break;
      case "payment-failed":
        await authService.sendPaymentFailedEmail({
          email,
          plan: "Premium",
          amount: 99.00,
          date: new Date(),
          method: "Card ending in 4242",
          reason: "Insufficient funds"
        });
        break;
      case "password-reset":
        await authService.sendPasswordResetEmail(email, "reset-token-12345");
        break;
      case "device-verification":
        await authService.sendDeviceVerificationCodeEmail({
          email,
          name: "Jane Doe",
          code: "123456",
          deviceName: "iPhone 14 Pro - Safari",
          location: "Lagos, Nigeria",
          time: "Oct 1, 2026, 10:30 AM"
        });
        break;
      case "new-device":
        await authService.sendNewDeviceAlertEmail({
          email,
          name: "Jane Doe",
          deviceName: "iPhone 14 Pro - Safari",
          location: "Lagos, Nigeria",
          time: "Oct 1, 2026, 10:30 AM"
        });
        break;
      default:
        return res.status(400).json({ success: false, message: "Unknown template ID." });
    }

    res.status(200).json({ success: true, data: "Test email sent successfully!" });
  } catch (error: any) {
    console.error("Test email failed:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to send test email." });
  }
};
