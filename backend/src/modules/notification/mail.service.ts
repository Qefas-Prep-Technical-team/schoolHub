import { Resend } from "resend";
import prisma from "../../config/database";

// Fallback key if not provided in env
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export type EmailType = 
  | "SUBSCRIPTION_EXPIRY_WARNING_7" 
  | "SUBSCRIPTION_EXPIRY_WARNING_3" 
  | "SUBSCRIPTION_EXPIRY_WARNING_1" 
  | "SUBSCRIPTION_EXPIRED" 
  | "GENERAL_ALERT";

interface SendEmailInput {
  schoolId: string;
  to: string;
  subject: string;
  body: string;
  type: EmailType;
}

export class MailService {
  /**
   * Sends an email via Resend and logs the result to the database
   */
  static async sendSchoolEmail(input: SendEmailInput) {
    const isTest = process.env.RESEND_TEST?.trim() === "true";
    
    // In sandbox/test mode without domain verification, Resend only allows sending from onboarding@resend.dev
    const sender = isTest
      ? "Qefas Hub <onboarding@resend.dev>"
      : (process.env.MAIL_FROM as string)?.trim() || "Qefas Hub <onboarding@resend.dev>";

    // In test mode, reroute to the verified test email so Resend does not reject with 403
    const recipient = isTest
      ? (process.env.TEST_EMAIL as string)?.trim() || input.to
      : input.to;

    const deliverySubject = isTest && recipient !== input.to
      ? `${input.subject} [Simulated for: ${input.to}]`
      : input.subject;

    try {
      // 1. Send via Resend
      const { data, error } = await resend.emails.send({
        from: sender,
        to: recipient,
        subject: deliverySubject,
        html: input.body,
      });

      // 2. Log to database with actual recipient target
      const log = await prisma.emailLog.create({
        data: {
          schoolId: input.schoolId,
          recipientEmail: input.to,
          subject: input.subject,
          body: input.body,
          type: input.type,
          status: error ? "FAILED" : "SENT",
          error: error ? JSON.stringify(error) : null,
        },
      });

      if (error) {
        console.error(`[MailService] Resend failed to send email to ${input.to} (via ${recipient}):`, error);
        return { success: false, log, error };
      }

      console.log(`[MailService] Email sent successfully to ${recipient} (intended for: ${input.to}) for school ${input.schoolId}`);
      return { success: true, log, data };
    } catch (err: any) {
      console.error(`[MailService] Critical error sending email to ${input.to}:`, err);

      // Log failure to database
      const log = await prisma.emailLog.create({
        data: {
          schoolId: input.schoolId,
          recipientEmail: input.to,
          subject: input.subject,
          body: input.body,
          type: input.type,
          status: "FAILED",
          error: err.message || "Unknown error",
        },
      });

      return { success: false, error: err.message, log };
    }
  }
}
