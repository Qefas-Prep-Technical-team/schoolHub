import { Resend } from "resend";
import prisma from "../../config/database";

// Fallback key if not provided in env
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export type EmailType = "SUBSCRIPTION_EXPIRY_WARNING_7" | "SUBSCRIPTION_EXPIRY_WARNING_3" | "SUBSCRIPTION_EXPIRY_WARNING_1" | "SUBSCRIPTION_EXPIRED" | "GENERAL_ALERT";

interface SendEmailInput {
  schoolId: string;
  to: string;
  subject: string;
  body: string;
  type: EmailType;
}

export class MailService {
  /**
   * Sends an email and logs it to the database
   */
  static async sendSchoolEmail(input: SendEmailInput) {
    try {
      // 1. Attempt to send via Resend
      const { data, error } = await resend.emails.send({
        from: "Qefas Hub <notifications@qefashub.flexitistudio.com>",
        to: input.to,
        subject: input.subject,
        html: input.body,
      });

      // 2. Log to database
      const log = await prisma.emailLog.create({
        data: {
          schoolId: input.schoolId,
          recipientEmail: input.to,
          subject: input.subject,
          body: input.body,
          type: input.type,
          status: error ? "FAILED" : "SENT",
          error: error ? JSON.stringify(error) : null,
        }
      });

      if (error) {
        console.error(`[MailService] Failed to send email to ${input.to}:`, error);
        return { success: false, log };
      }

      console.log(`[MailService] Email sent and logged for school ${input.schoolId}`);
      return { success: true, log, data };
    } catch (err: any) {
      console.error(`[MailService] Critical error sending email to ${input.to}:`, err);
      
      // Still attempt to log the failure
      const log = await prisma.emailLog.create({
        data: {
          schoolId: input.schoolId,
          recipientEmail: input.to,
          subject: input.subject,
          body: input.body,
          type: input.type,
          status: "FAILED",
          error: err.message || "Unknown error",
        }
      });

      return { success: false, error: err.message, log };
    }
  }
}
