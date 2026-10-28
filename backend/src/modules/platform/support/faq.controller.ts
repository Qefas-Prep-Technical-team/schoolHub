import { Request, Response } from "express";
import { FaqService, CreateFaqSchema, UpdateFaqSchema } from "./faq.service";
import { z } from "zod";

/**
 * List FAQs (Public & Authenticated)
 * GET /api/support/faqs?role=TEACHER
 * GET /api/platform/support/faqs
 */
export const listFaqs = async (req: Request, res: Response) => {
  try {
    const roleQuery = (req.query.role || req.query.targetRole) as string | undefined;
    const includeUnpublished = req.query.all === "true" || !!(req as any).staff;

    const faqs = await FaqService.getFaqs(roleQuery, includeUnpublished);
    return res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error: any) {
    console.error("Error in listFaqs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error?.message,
    });
  }
};

/**
 * Get FAQ details by ID
 * GET /api/platform/support/faqs/:id
 */
const getParamId = (id: string | string[] | undefined): string => {
  if (Array.isArray(id)) return id[0] || "";
  return id || "";
};

export const getFaqDetails = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "FAQ ID is required" });
    }

    const faq = await FaqService.getFaqById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    return res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (error: any) {
    console.error("Error in getFaqDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ details",
      error: error?.message,
    });
  }
};

/**
 * Create a new FAQ (Platform Staff / Admin only)
 * POST /api/platform/support/faqs
 */
export const createFaq = async (req: Request, res: Response) => {
  try {
    const parsed = CreateFaqSchema.parse(req.body);
    const created = await FaqService.createFaq(parsed);

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully and saved to database",
      data: created,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || (error as any).errors || [];
      return res.status(400).json({
        success: false,
        message: issues[0]?.message || "Validation failed",
        errors: issues,
      });
    }
    console.error("Error in createFaq:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ",
      error: error?.message,
    });
  }
};

/**
 * Update an existing FAQ (Platform Staff / Admin only)
 * PATCH /api/platform/support/faqs/:id
 * PUT /api/platform/support/faqs/:id
 */
export const updateFaq = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "FAQ ID is required" });
    }

    const parsed = UpdateFaqSchema.parse(req.body);
    const updated = await FaqService.updateFaq(id, parsed);

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully in database",
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || (error as any).errors || [];
      return res.status(400).json({
        success: false,
        message: issues[0]?.message || "Validation failed",
        errors: issues,
      });
    }
    console.error("Error in updateFaq:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
      error: error?.message,
    });
  }
};

/**
 * Delete an FAQ (Platform Staff / Admin only)
 * DELETE /api/platform/support/faqs/:id
 */
export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "FAQ ID is required" });
    }

    await FaqService.deleteFaq(id);

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully from database",
    });
  } catch (error: any) {
    console.error("Error in deleteFaq:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
      error: error?.message,
    });
  }
};
