import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getMyTickets, createTicket, getTicketMessages, sendTicketMessage, createGuestTicket, sendGuestTicketMessage } from "./support.controller";

const router = Router();

// Guest routes (Unauthenticated)
router.post("/guest-tickets", createGuestTicket);
router.post("/guest-tickets/:id/messages", sendGuestTicketMessage);

router.use(authenticateToken); // Ensure only logged in users can access

router.get("/tickets", getMyTickets);
router.post("/tickets", createTicket);
router.get("/tickets/:id/messages", getTicketMessages);
router.post("/tickets/:id/messages", sendTicketMessage);

export default router;
