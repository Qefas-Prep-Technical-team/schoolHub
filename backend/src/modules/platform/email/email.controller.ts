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
      case "account-deactivation-confirmation":
        await authService.sendAccountDeactivationConfirmationEmail({
          email,
          name: "Jane Doe",
          role: "Student",
          ticketId: `DEACT-${Date.now().toString(36).toUpperCase()}-TEST`,
          device: "Chrome 128 • Windows PC",
          location: "Lagos, Nigeria",
          time: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", 10:30 AM",
        });
        break;
      case "account-deactivation-request": {
        const testTicketId = `DEL-${Date.now().toString(36).toUpperCase()}-TEST`;
        const testFrontendUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendAccountDeletionEmail({
          email,
          name: "Jane Doe",
          role: "Student",
          ticketId: testTicketId,
          device: "iPhone 15 Pro • Safari 17.4",
          location: "Lagos, Nigeria",
          time: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", 10:30 AM",
          deactivateUrl: `${testFrontendUrl}/data-deletion/confirm?token=demo_test_token&ticketId=${testTicketId}`,
        });
        break;
      }
      case "transcript-delivery":
      case "transcript-receipt-link": {
        const testDocRef = `TRANS-DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendTranscriptDeliveryEmail({
          email,
          studentName: "Jane Doe",
          schoolName: "Springfield High School",
          docketNumber: testDocRef,
          accessUrl: `${appUrl}/dashboard/student/transcript?doc=${testDocRef}`,
          verificationUrl: `${appUrl}/verify/transcript/${testDocRef}`,
          expiryDate: "30-Day Guaranteed Direct Pass",
          session: "2025/2026 Academic Session",
          term: "All Terms",
        });
        break;
      }
      case "transcript-payment-success": {
        const testRef = `TRX-TRN-${Math.floor(10000 + Math.random() * 90000)}-QEF`;
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendTranscriptPaymentSuccessEmail({
          email,
          studentName: "Jane Doe",
          schoolName: "Springfield High School",
          reference: testRef,
          amount: 15000,
          paymentMethod: "Card • Paystack",
          session: "2025/2026 Academic Session",
          term: "All Terms",
          destination: "University of London Admissions",
          loginUrl: `${appUrl}/dashboard/student/transcript`,
        });
        break;
      }
      case "school-transcript-payment": {
        const testRef = `TRX-TRN-${Math.floor(10000 + Math.random() * 90000)}-QEF`;
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendSchoolTranscriptPaymentReceivedEmail({
          schoolEmail: email,
          schoolName: "Springfield High School",
          studentName: "Jane Doe",
          studentCode: "SCH-2026-0891",
          amount: 15000,
          reference: testRef,
          session: "2025/2026 Academic Session",
          term: "All Terms",
          paymentMethod: "Card (Paystack Split Settlement)",
          dashboardUrl: `${appUrl}/dashboard/admin/finance?tab=transcripts`,
        });
        break;
      }
      case "student-graduating": {
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendStudentGraduationEmail({
          email,
          studentName: "Jane Doe",
          studentCode: "SCH-2020-0491",
          schoolName: "Springfield High School",
          cohort: "Class of 2026",
          academicStanding: "First Class Distinction",
          gpa: "4.85 / 5.00",
          valedictoryDocket: "CERT-QEF-2026-9942",
          ceremonyDate: "July 25, 2026",
          loginUrl: `${appUrl}/login`,
        });
        break;
      }
      case "parent-graduation": {
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendParentGraduationEmail({
          parentEmail: email,
          parentName: "Chief Robert Doe",
          studentName: "Jane Doe",
          studentCode: "SCH-2020-0491",
          schoolName: "Springfield High School",
          cohort: "Class of 2026",
          academicStanding: "First Class Distinction",
          gpa: "4.85 / 5.00",
          valedictoryDocket: "CERT-QEF-2026-9942",
          ceremonyDate: "July 25, 2026",
          loginUrl: `${appUrl}/login`,
        });
        break;
      }
      case "school-accept-teacher": {
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendSchoolAcceptTeacherEmail({
          teacherEmail: email,
          teacherName: "Mr. David Adeleke",
          teacherCode: "TCH-SPG-4091",
          schoolName: "Springfield High School",
          department: "Department of Physical Sciences",
          subject: "Senior Mathematics",
          classes: "SS 1 Gold, SS 2 Diamond",
          effectiveDate: "Sept 1, 2026",
          loginUrl: `${appUrl}/login`,
        });
        break;
      }
      case "school-accept-student": {
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendSchoolAcceptStudentEmail({
          studentEmail: email,
          studentName: "Jane Doe",
          studentCode: "SCH-2026-STU-8821",
          schoolName: "Springfield High School",
          className: "JSS 1 Gold",
          session: "2026/2027 Academic Session",
          formMaster: "Mrs. Angela Davies",
          houseOrDivision: "Emerald House",
          resumptionDate: "Monday, Sept 14, 2026",
          loginUrl: `${appUrl}/login`,
        });
        break;
      }
      case "parent-child-link-accepted":
      case "parent-link-accepted": {
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendParentStudentLinkAcceptedEmail({
          recipientEmail: email,
          recipientName: "Chief Robert Doe",
          recipientRole: "PARENT",
          parentName: "Chief Robert Doe",
          studentName: "Jane Doe",
          studentCode: "SCH-2026-STU-8821",
          schoolName: "Springfield High School",
          className: "SS 2 Science",
          relationship: "Father / Primary Guardian",
          loginUrl: `${appUrl}/login`,
        });
        break;
      }
      case "student-parent-link-accepted": {
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendParentStudentLinkAcceptedEmail({
          recipientEmail: email,
          recipientName: "Jane Doe",
          recipientRole: "STUDENT",
          parentName: "Chief Robert Doe",
          studentName: "Jane Doe",
          studentCode: "SCH-2026-STU-8821",
          schoolName: "Springfield High School",
          className: "SS 2 Science",
          relationship: "Father / Primary Guardian",
          loginUrl: `${appUrl}/login`,
        });
        break;
      }
      case "student-suspension": {
        const appUrl = (process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
        await authService.sendStudentSuspensionEmail({
          recipientEmail: email,
          recipientName: "Jane Doe",
          recipientRole: "STUDENT",
          studentName: "Jane Doe",
          studentCode: "SCH-2026-STU-8821",
          schoolName: "Springfield High School",
          className: "SS 2 Science",
          sanction: "Temporary Academic Suspension",
          duration: "5 School Days",
          effectivePeriod: "Monday, Nov 2 - Friday, Nov 6, 2026",
          reason: "Gross violation of campus academic code and unauthorized laboratory access",
          hearingDocket: "DISC-BRD-2026-042",
          reinstatementDate: "Friday, Nov 6, 2026 - 10:00 AM",
          loginUrl: `${appUrl}/login`,
        });
        break;
      }
      default:
        return res.status(400).json({ success: false, message: "Unknown template ID." });
    }

    res.status(200).json({ success: true, data: "Test email sent successfully!" });
  } catch (error: any) {
    console.error("Test email failed:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to send test email." });
  }
};
