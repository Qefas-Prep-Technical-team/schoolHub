import { Request, Response } from "express";
import { PlatformAlertRecipientService, AlertEventType } from "./recipient.service";
import { handleError } from "../../../utils/error-handler";
import { z } from "zod";

const recipientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().optional(),
  events: z.array(z.enum([
    "NEW_USERS",
    "PAYMENTS",
    "SUBSCRIPTIONS",
    "COMPLAINTS",
    "SUGGESTIONS",
    "INQUIRIES",
    "SYSTEM_ALERTS",
  ])).min(1, "At least one event must be selected"),
  isActive: z.boolean().optional(),
});

export const getRecipients = async (req: Request, res: Response) => {
  try {
    const recipients = await PlatformAlertRecipientService.getRecipients();
    return res.status(200).json({ success: true, data: recipients });
  } catch (error) {
    return handleError(res, error, "recipient.getRecipients");
  }
};

export const addRecipient = async (req: Request, res: Response) => {
  try {
    const validated = recipientSchema.parse(req.body);
    const recipient = await PlatformAlertRecipientService.addRecipient({
      name: validated.name,
      email: validated.email,
      role: validated.role,
      events: validated.events as AlertEventType[],
      isActive: validated.isActive,
    });
    return res.status(201).json({ success: true, data: recipient });
  } catch (error) {
    return handleError(res, error, "recipient.addRecipient");
  }
};

export const updateRecipient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updateSchema = recipientSchema.partial();
    const validated = updateSchema.parse(req.body);

    const updated = await PlatformAlertRecipientService.updateRecipient(id, {
      ...(validated.name && { name: validated.name }),
      ...(validated.email && { email: validated.email }),
      ...(validated.role && { role: validated.role }),
      ...(validated.events && { events: validated.events as AlertEventType[] }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return handleError(res, error, "recipient.updateRecipient");
  }
};

export const toggleRecipientStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await PlatformAlertRecipientService.toggleRecipient(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return handleError(res, error, "recipient.toggleRecipientStatus");
  }
};

export const deleteRecipient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await PlatformAlertRecipientService.deleteRecipient(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }
    return res.status(200).json({ success: true, message: "Recipient deleted successfully" });
  } catch (error) {
    return handleError(res, error, "recipient.deleteRecipient");
  }
};

export const sendTestAlert = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await PlatformAlertRecipientService.sendTestAlert(id);
    return res.status(200).json({ success: true, message: "Test alert dispatched successfully", data: result });
  } catch (error) {
    return handleError(res, error, "recipient.sendTestAlert");
  }
};
