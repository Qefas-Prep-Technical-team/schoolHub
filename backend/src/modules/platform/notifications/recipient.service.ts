import prisma from "../../../config/database";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export type AlertEventType = 
  | "NEW_USERS"
  | "PAYMENTS" 
  | "SUBSCRIPTIONS"
  | "COMPLAINTS" 
  | "SUGGESTIONS" 
  | "INQUIRIES" 
  | "SYSTEM_ALERTS";

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  role: string;
  events: AlertEventType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SETTING_KEY = "notification_recipients";

export class PlatformAlertRecipientService {
  /**
   * Fetch all configured recipients
   */
  static async getRecipients(): Promise<NotificationRecipient[]> {
    try {
      const setting = await prisma.platformSettings.findUnique({
        where: { key: SETTING_KEY },
      });

      if (!setting || !setting.value) {
        // Return default owner/platform recipient if configured
        const defaultEmail = process.env.MAIL_FROM || process.env.TEST_EMAIL || "support@qefas.com";
        const initial: NotificationRecipient[] = [
          {
            id: uuidv4(),
            name: "Platform Operations Team",
            email: defaultEmail,
            role: "Operations Lead",
            events: [
              "NEW_USERS",
              "PAYMENTS",
              "SUBSCRIPTIONS",
              "COMPLAINTS",
              "SUGGESTIONS",
              "INQUIRIES",
              "SYSTEM_ALERTS",
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        await prisma.platformSettings.create({
          data: {
            key: SETTING_KEY,
            value: JSON.stringify(initial),
          },
        });

        return initial;
      }

      return JSON.parse(setting.value);
    } catch (error) {
      console.error("[PlatformAlertRecipientService] Error fetching recipients:", error);
      return [];
    }
  }

  /**
   * Save full list of recipients
   */
  static async saveRecipients(recipients: NotificationRecipient[]): Promise<NotificationRecipient[]> {
    await prisma.platformSettings.upsert({
      where: { key: SETTING_KEY },
      update: {
        value: JSON.stringify(recipients),
        updatedAt: new Date(),
      },
      create: {
        key: SETTING_KEY,
        value: JSON.stringify(recipients),
      },
    });
    return recipients;
  }

  /**
   * Add a new recipient
   */
  static async addRecipient(data: {
    name: string;
    email: string;
    role?: string;
    events: AlertEventType[];
    isActive?: boolean;
  }): Promise<NotificationRecipient> {
    const recipients = await this.getRecipients();

    const newRecipient: NotificationRecipient = {
      id: uuidv4(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: (data.role || "Support Member").trim(),
      events: data.events || ["COMPLAINTS", "SUGGESTIONS"],
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    recipients.push(newRecipient);
    await this.saveRecipients(recipients);
    return newRecipient;
  }

  /**
   * Update an existing recipient
   */
  static async updateRecipient(
    id: string,
    updates: Partial<Omit<NotificationRecipient, "id" | "createdAt">>
  ): Promise<NotificationRecipient | null> {
    const recipients = await this.getRecipients();
    const index = recipients.findIndex((r) => r.id === id);
    if (index === -1) return null;

    recipients[index] = {
      ...recipients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveRecipients(recipients);
    return recipients[index];
  }

  /**
   * Delete a recipient
   */
  static async deleteRecipient(id: string): Promise<boolean> {
    const recipients = await this.getRecipients();
    const filtered = recipients.filter((r) => r.id !== id);
    if (filtered.length === recipients.length) return false;

    await this.saveRecipients(filtered);
    return true;
  }

  /**
   * Toggle recipient active status
   */
  static async toggleRecipient(id: string): Promise<NotificationRecipient | null> {
    const recipients = await this.getRecipients();
    const target = recipients.find((r) => r.id === id);
    if (!target) return null;

    target.isActive = !target.isActive;
    target.updatedAt = new Date().toISOString();
    await this.saveRecipients(recipients);
    return target;
  }

  /**
   * Dispatch an alert to all recipients subscribed to a given event
   */
  static async dispatchAlert(
    event: AlertEventType,
    payload: {
      subject: string;
      title: string;
      description: string;
      userName?: string | null;
      userEmail?: string | null;
      schoolName?: string | null;
      userType?: string | null;
      priority?: string | null;
      metadata?: Record<string, any>;
    }
  ) {
    try {
      const allRecipients = await this.getRecipients();
      const targetRecipients = allRecipients.filter(
        (r) => r.isActive && r.events.includes(event)
      );

      if (targetRecipients.length === 0) {
        console.log(`[PlatformAlertRecipientService] No active recipients for alert event: ${event}`);
        return { dispatched: 0 };
      }

      const isTest = process.env.RESEND_TEST?.trim() === "true";
      const sender = isTest
        ? "Qefas Hub <onboarding@resend.dev>"
        : (process.env.MAIL_FROM as string)?.trim() || "Qefas Hub <onboarding@resend.dev>";

      const badgeColor =
        event === "NEW_USERS"
          ? "#06b6d4"
          : event === "PAYMENTS"
          ? "#10b981"
          : event === "SUBSCRIPTIONS"
          ? "#8b5cf6"
          : event === "COMPLAINTS"
          ? "#f43f5e"
          : event === "SUGGESTIONS"
          ? "#f59e0b"
          : event === "INQUIRIES"
          ? "#3b82f6"
          : "#6366f1";

      const eventLabel =
        event === "NEW_USERS"
          ? "New User Onboarding"
          : event === "PAYMENTS"
          ? "Payment Notification"
          : event === "SUBSCRIPTIONS"
          ? "Plan Subscription"
          : event === "COMPLAINTS"
          ? "User Complaint"
          : event === "SUGGESTIONS"
          ? "Platform Suggestion"
          : event === "INQUIRIES"
          ? "Support Inquiry"
          : "System Alert";

      const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; padding: 30px; max-width: 620px; margin: auto; background-color: #0f172a; border-radius: 16px; color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; padding: 6px 14px; background-color: ${badgeColor}20; border: 1px solid ${badgeColor}40; border-radius: 9999px; margin-bottom: 12px;">
              <span style="color: ${badgeColor}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${eventLabel}</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">${payload.title}</h1>
          </div>

          <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
            <p style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Summary / Details</p>
            <p style="color: #f1f5f9; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${payload.description}</p>

            ${
              payload.userName || payload.userEmail || payload.schoolName
                ? `
              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #334155;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  ${
                    payload.userName
                      ? `<tr><td style="color: #94a3b8; padding: 4px 0; width: 110px;">Submitted By:</td><td style="color: #ffffff; font-weight: 600;">${payload.userName} ${payload.userType ? `(${payload.userType})` : ""}</td></tr>`
                      : ""
                  }
                  ${
                    payload.userEmail
                      ? `<tr><td style="color: #94a3b8; padding: 4px 0;">Email:</td><td style="color: #ffffff; font-weight: 600;"><a href="mailto:${payload.userEmail}" style="color: #818cf8; text-decoration: none;">${payload.userEmail}</a></td></tr>`
                      : ""
                  }
                  ${
                    payload.schoolName
                      ? `<tr><td style="color: #94a3b8; padding: 4px 0;">Institution:</td><td style="color: #ffffff; font-weight: 600;">${payload.schoolName}</td></tr>`
                      : ""
                  }
                  ${
                    payload.priority
                      ? `<tr><td style="color: #94a3b8; padding: 4px 0;">Priority:</td><td style="color: #ffffff; font-weight: 600;">${payload.priority}</td></tr>`
                      : ""
                  }
                </table>
              </div>
            `
                : ""
            }
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://qefashub.com/console/support" style="display: inline-block; padding: 12px 28px; background-color: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 10px;">
              Open Support Console →
            </a>
          </div>

          <div style="margin-top: 25px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">This is an automated alert dispatched to registered Qefas Hub platform administrators.</p>
          </div>
        </div>
      `;

      // Dispatch to each recipient directly to their configured email address
      const sendPromises = targetRecipients.map(async (r) => {
        const targetEmail = r.email.trim();
        const targetSubject = payload.subject;

        try {
          // Attempt direct delivery to recipient
          let deliveryRes = await resend.emails.send({
            from: sender,
            to: targetEmail,
            subject: targetSubject,
            html: emailHtml,
          });

          // In test/sandbox mode without verified custom domain, Resend rejects non-owner emails (HTTP 403).
          // Fallback to verified test email so the notification email is guaranteed to be physically delivered!
          if (deliveryRes.error && process.env.TEST_EMAIL) {
            const fallbackTo = (process.env.TEST_EMAIL as string).trim();
            console.warn(`[PlatformAlertRecipientService] Direct send to ${targetEmail} failed (${deliveryRes.error.message}). Re-routing to verified fallback inbox (${fallbackTo})...`);
            deliveryRes = await resend.emails.send({
              from: sender,
              to: fallbackTo,
              subject: `${targetSubject} [Intended for: ${targetEmail}]`,
              html: `
                <div style="background-color: #fef3c7; color: #92400e; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-family: sans-serif; font-size: 12px; border: 1px solid #fde68a;">
                  <strong>Routing Notice:</strong> This platform alert is intended for <code>${targetEmail}</code> (${r.name}). Delivered to verified developer/admin inbox <code>${fallbackTo}</code> during testing.
                </div>
                ${emailHtml}
              `,
            });
          }

          if (deliveryRes.error) {
            console.error(`[PlatformAlertRecipientService] Resend reported error delivering alert for ${targetEmail}:`, deliveryRes.error);
          } else {
            console.log(`[PlatformAlertRecipientService] Email alert dispatched for ${targetEmail} (Message ID: ${deliveryRes.data?.id})`);
          }

          await prisma.emailLog.create({
            data: {
              recipientEmail: r.email,
              subject: payload.subject,
              body: emailHtml,
              type: event,
              status: deliveryRes.error ? "FAILED" : "SENT",
              error: deliveryRes.error ? JSON.stringify(deliveryRes.error) : null,
            },
          });

          return { recipient: r.email, success: !deliveryRes.error, messageId: deliveryRes.data?.id };
        } catch (err: any) {
          console.error(`[PlatformAlertRecipientService] Error sending alert to ${r.email}:`, err);
          return { recipient: r.email, success: false, error: err.message };
        }
      });

      const results = await Promise.all(sendPromises);
      return { 
        dispatched: results.filter((r) => r.success).length, 
        total: targetRecipients.length,
        details: results 
      };
    } catch (err) {
      console.error("[PlatformAlertRecipientService] Failed dispatching alert:", err);
      return { dispatched: 0 };
    }
  }

  /**
   * Send a test dispatch email to a specific recipient
   */
  static async sendTestAlert(recipientId: string) {
    const recipients = await this.getRecipients();
    const r = recipients.find((x) => x.id === recipientId);
    if (!r) throw new Error("Recipient not found");

    return this.dispatchAlert("SYSTEM_ALERTS", {
      subject: "🔔 [Test Dispatch] Qefas Hub Notification Routing Verification",
      title: "Notification Routing Channel Active",
      description: `Hello ${r.name},\n\nThis is a verification test to confirm that your email address (${r.email}) is successfully configured to receive platform alerts for: ${r.events.join(", ")}.\n\nNo action is required on your part.`,
      userName: r.name,
      userEmail: r.email,
      priority: "LOW",
    });
  }
}
