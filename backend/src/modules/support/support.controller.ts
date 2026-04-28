import { Request, Response } from "express";
import prisma from "../../config/database";
import { getIO } from "../../socket";

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
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description, category, priority } = req.body;
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
        schoolName: user.schoolName || null
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
    console.error("Create ticket error:", error);
    res.status(500).json({ success: false, message: "Failed to create ticket" });
  }
};

export const getTicketMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    res.status(500).json({ success: false, message: "Failed to load messages" });
  }
};

export const sendTicketMessage = async (req: Request, res: Response) => {
  try {
    const { id: ticketId } = req.params;
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
      where: { id: ticketId },
      data: { updatedAt: new Date(), status: "OPEN" } // reopen if closed
    });

    // Real-time broadcast
    getIO().to(`ticket:${ticketId}`).emit("new_message", message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};
