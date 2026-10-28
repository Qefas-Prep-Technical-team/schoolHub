import { Request, Response } from "express";
import prisma from "../../config/database";
import { getIO } from "../../socket";
import { getSingleString } from "../../utils/request-utils";
import { handleError } from "../../utils/error-handler";
import { PlatformAlertRecipientService, AlertEventType } from "../platform/notifications/recipient.service";

export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (!userId) {
      return res.status(200).json({ success: true, data: [] });
    }
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { messages: true } }
      }
    });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    return handleError(res, error, "support.getMyTickets");
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description, category, priority, conversationHistory } = req.body;
    const user = (req as any).user;
    
    // Determine details based on token payload
    const userId = user.userId || user.id;
    const userType = user.userType || user.role || "USER";
    const userName = user.name || user.fullName || "User";
    const userEmail = user.email || "";
    
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        description,
        category,
        priority: priority || "MEDIUM",
        status: "OPEN",
        userId,
        userType,
        userName,
        userEmail,
        schoolName: user.schoolName || null,
        messages: conversationHistory && Array.isArray(conversationHistory) ? {
          create: conversationHistory.map((msg: any) => ({
            content: msg.content,
            senderId: msg.senderRole === "AI" ? "AI_SYSTEM" : userId,
            senderName: msg.senderRole === "AI" ? "Qefas AI" : userName,
            senderRole: msg.senderRole === "AI" ? "SYSTEM" : "USER"
          }))
        } : undefined
      },
      include: {
        messages: true
      }
    });

    // Notify all connected platform support staff
    try {
      getIO().to('platform:support').emit('new_ticket', {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
        schoolName: ticket.schoolName,
        priority: ticket.priority,
        userType: ticket.userType,
        createdAt: ticket.createdAt
      });
    } catch (_) { /* Socket might not be initialized in tests */ }

    // Dispatch email alert to platform notification recipients
    const normalizedCategory = (category || "").toUpperCase();
    let alertEvent: AlertEventType = "INQUIRIES";
    let alertTitle = `Support Inquiry: ${subject}`;

    if (normalizedCategory === "SUGGESTION") {
      alertEvent = "SUGGESTIONS";
      alertTitle = `New Suggestion: ${subject}`;
    } else if (normalizedCategory === "COMPLAINT") {
      alertEvent = "COMPLAINTS";
      alertTitle = `New Complaint: ${subject}`;
    }

    PlatformAlertRecipientService.dispatchAlert(alertEvent, {
      subject: `[${alertEvent}] ${subject}`,
      title: alertTitle,
      description,
      userName,
      userEmail,
      schoolName: user.schoolName || undefined,
      userType,
      priority: ticket.priority,
    }).catch(err => console.error("[SupportController] Alert dispatch failed:", err));

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    return handleError(res, error, "support.createTicket");
  }
};

export const createGuestTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description, category, priority, conversationHistory, email, name, whatsappNumber } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required for guest support tickets" });
    }
    
    const ticket = await prisma.supportTicket.create({
      data: {
        subject: subject || "AI Escalation: Guest User",
        description: description || `Guest user requested a representative. WhatsApp: ${whatsappNumber || 'Not provided'}`,
        category: category || "AI Handoff",
        priority: priority || "MEDIUM",
        status: "OPEN",
        userId: "GUEST",
        userType: "GUEST" as any, // Not in enum but Prisma allows string if casted or if we use closest enum
        userName: name || "Guest User",
        userEmail: email,
        schoolName: null,
        messages: conversationHistory && Array.isArray(conversationHistory) ? {
          create: conversationHistory.map((msg: any) => ({
            content: msg.content,
            senderId: msg.senderRole === "AI" ? "AI_SYSTEM" : "GUEST_USER",
            senderName: msg.senderRole === "AI" ? "Qefas AI" : (name || "Guest"),
            senderRole: msg.senderRole === "AI" ? "SYSTEM" : "USER"
          }))
        } : undefined
      },
      include: {
        messages: true
      }
    });

    // Notify all connected platform support staff
    try {
      getIO().to('platform:support').emit('new_ticket', {
        id: ticket.id,
        subject: ticket.subject,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
        schoolName: ticket.schoolName,
        priority: ticket.priority,
        userType: ticket.userType,
        createdAt: ticket.createdAt
      });
    } catch (_) { /* Socket might not be initialized in tests */ }

    // Dispatch email alert to registered platform recipients
    PlatformAlertRecipientService.dispatchAlert("INQUIRIES", {
      subject: `[INQUIRIES] Guest Ticket: ${ticket.subject}`,
      title: `New Guest Support Inquiry: ${ticket.subject}`,
      description: ticket.description || 'Guest user requested representative assistance.',
      userName: ticket.userName || 'Guest User',
      userEmail: ticket.userEmail || email,
      userType: 'GUEST',
      priority: ticket.priority,
    }).catch(err => console.error("[SupportController] Guest alert dispatch failed:", err));

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    return handleError(res, error, "support.createGuestTicket");
  }
};

export const getTicketMessages = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const userId = (req as any).user?.id || (req as any).user?.userId;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } }
      }
    });

    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
    if (ticket.userId !== userId) return res.status(403).json({ success: false, message: "Unauthorized" });

    // Look up support agent profile photos and names
    const supportStaffIds = ticket.messages
      .filter((m) => m.senderRole === "SUPPORT_AGENT" && m.senderId && m.senderId !== "AI_SYSTEM")
      .map((m) => m.senderId);

    const staffMembers = supportStaffIds.length > 0
      ? await prisma.platformStaff.findMany({
          where: { id: { in: supportStaffIds } },
          select: { id: true, fullName: true, profileImage: true, socialLinks: true }
        })
      : [];

    const staffMap = new Map(staffMembers.map((s) => [s.id, s]));

    const enrichedMessages = ticket.messages.map((m) => {
      const staff = staffMap.get(m.senderId);
      const socialLinks = staff?.socialLinks as any;
      const avatarUrl =
        staff?.profileImage ||
        socialLinks?.agentProfilePicture ||
        socialLinks?.avatarUrl ||
        null;
      const agentDisplayName =
        (staff as any)?.displayName ||
        socialLinks?.displayName ||
        socialLinks?.agentDisplayName ||
        m.senderName;

      return {
        ...m,
        senderName: m.senderRole === "SUPPORT_AGENT" ? agentDisplayName : m.senderName,
        senderImage: avatarUrl,
      };
    });

    const activeAgentStaff = staffMembers[0];
    const activeSocialLinks = activeAgentStaff?.socialLinks as any;
    const assignedAgent = activeAgentStaff
      ? {
          name:
            (activeAgentStaff as any)?.displayName ||
            activeSocialLinks?.displayName ||
            activeSocialLinks?.agentDisplayName ||
            activeAgentStaff.fullName,
          image:
            activeAgentStaff.profileImage ||
            activeSocialLinks?.agentProfilePicture ||
            activeSocialLinks?.avatarUrl ||
            null,
        }
      : null;

    res.status(200).json({
      success: true,
      data: {
        ...ticket,
        messages: enrichedMessages,
        assignedAgent,
      }
    });
  } catch (error) {
    return handleError(res, error, "support.getTicketMessages");
  }
};

export const sendTicketMessage = async (req: Request, res: Response) => {
  try {
    const ticketId = getSingleString(req.params.id);
    const { content } = req.body;
    const user = (req as any).user;
    const senderId = user.userId || user.id;
    const senderName = user.name || user.fullName || "User";

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.userId !== senderId) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        content,
        senderId,
        senderName,
        senderRole: "USER"
      }
    });

    // Also update ticket updatedAt
    await prisma.supportTicket.update({
      where: { id: ticketId as string },
      data: { updatedAt: new Date(), status: "OPEN" } // reopen if closed
    });

    // Real-time broadcast to ticket room and platform support agents
    getIO().to(`ticket:${ticketId}`).emit("new_message", message);
    getIO().to("platform:support").emit("ticket_message_received", {
      ticketId,
      message,
      userName: senderName,
      subject: ticket.subject,
      category: ticket.category
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    return handleError(res, error, "support.sendTicketMessage");
  }
};

export const sendGuestTicketMessage = async (req: Request, res: Response) => {
  try {
    const ticketId = getSingleString(req.params.id);
    const { content, name } = req.body;

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.userId !== "GUEST") {
      return res.status(404).json({ success: false, message: "Guest ticket not found" });
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        content,
        senderId: "GUEST_USER",
        senderName: name || ticket.userName || "Guest User",
        senderRole: "USER"
      }
    });

    await prisma.supportTicket.update({
      where: { id: ticketId as string },
      data: { updatedAt: new Date(), status: "OPEN" }
    });

    getIO().to(`ticket:${ticketId}`).emit("new_message", message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    return handleError(res, error, "support.sendGuestTicketMessage");
  }
};
