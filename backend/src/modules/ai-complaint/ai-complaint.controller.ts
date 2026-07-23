import { Request, Response } from "express";
import prisma from "../../config/database";
import { handleError } from "../../utils/error-handler";

export const logComplaint = async (req: Request, res: Response) => {
  try {
    const { complaintText, email, whatsappNumber } = req.body;

    if (!complaintText || !email || !whatsappNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "complaintText, email, and whatsappNumber are required" 
      });
    }

    const complaint = await prisma.aIComplaint.create({
      data: {
        complaintText,
        email,
        whatsappNumber,
        status: "OPEN"
      }
    });

    const successMessage = "Once this issue has been resolved, an email will be sent to you and a representative will reach out to you.";

    res.status(201).json({ 
      success: true, 
      message: successMessage,
      data: complaint 
    });
  } catch (error) {
    return handleError(res, error, "aiComplaint.logComplaint");
  }
};
