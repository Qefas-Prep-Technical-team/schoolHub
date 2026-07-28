import { Request, Response } from "express";
import prisma from "../../config/database";
import { getIO } from "../../socket";
import { getSingleString } from "../../utils/request-utils";
import { handleError } from "../../utils/error-handler";

export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
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
        userName: ticket.userName,
        userEmail: ticket.userEmail,
        schoolName: ticket.schoolName,
        priority: ticket.priority,
        userType: ticket.userType,
        createdAt: ticket.createdAt
      });
    } catch (_) { /* Socket might not be initialized in tests */ }

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

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    return handleError(res, error, "support.createGuestTicket");
  }
};

export const getTicketMessages = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const userId = (req as any).user.userId || (req as any).user.id;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } }
      }
    });

    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
    if (ticket.userId !== userId) return res.status(403).json({ success: false, message: "Unauthorized" });

    res.status(200).json({ success: true, data: ticket });
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

    // Real-time broadcast
    getIO().to(`ticket:${ticketId}`).emit("new_message", message);

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
