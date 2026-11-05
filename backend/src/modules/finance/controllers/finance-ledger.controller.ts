import { Request, Response } from "express";
import prisma, { withRetry } from "../../../config/database";
import { getSingleString } from "../../../utils/request-utils";
import { handleError } from "../../../utils/error-handler";
import { FinanceService } from "../finance.service";
import { resolveAndAuthorizeFinanceSchool } from "../services/finance-access.service";
import {
  initiatePaymentSchema,
  recordManualPaymentSchema,
} from "../schemas/finance.schemas";

/**
 * Parent: Initialize payment for a linked student
 */
export async function initializePayment(req: Request, res: Response) {
  try {
    const parsed = initiatePaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid payment payload",
      });
    }

    const { schoolId, studentId, amount, term, session, paymentType } =
      parsed.data;
    const parentId = req.user?.id || "";
    const email = req.user?.email || "";

    const link = await withRetry(
      () =>
        prisma.parentChildLink.findFirst({
          where: { parentId, studentId },
        }),
      "finance.initializePayment.parentLink",
    );
    if (!link) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: You can only initiate payments for your linked children",
      });
    }

    const initializationData = await FinanceService.initializePayment({
      schoolId,
      studentId,
      parentId,
      email,
      amount,
      metadata: { term, session, paymentType },
    });

    return res.status(200).json({
      success: true,
      data: initializationData,
    });
  } catch (error: unknown) {
    return handleError(res, error, "finance.initializePayment");
  }
}

/**
 * Verify a transaction
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const reference = getSingleString(req.params.reference);
    const flwTransactionId = (req.query.transaction_id ||
      req.query.flw_transaction_id) as string | undefined;
    const result = await FinanceService.verifyPayment(
      reference,
      flwTransactionId,
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    return handleError(res, error, "finance.verifyPayment");
  }
}

/**
 * School Admin: Get dashboard analytics (Restricted to SCHOOL_OWNER / ACCOUNTANT / ADMIN / SUPER_ADMIN of the school)
 */
export async function getSchoolAnalytics(req: Request, res: Response) {
  try {
    const rawSchoolId = getSingleString(req.params.schoolId);
    const { authorized, schoolId } = await resolveAndAuthorizeFinanceSchool(
      req,
      rawSchoolId,
    );
    if (!authorized || !schoolId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: Only School Owners or Accountants can view financial analytics for their school",
      });
    }

    const analytics = await FinanceService.getSchoolAnalytics(schoolId);
    return res.status(200).json({ success: true, data: analytics });
  } catch (error: unknown) {
    return handleError(res, error, "finance.getSchoolAnalytics");
  }
}

/**
 * Parent: Get personal payment history
 */
export async function getParentHistory(req: Request, res: Response) {
  try {
    const parentId = req.user?.id || "";
    const history = await FinanceService.getParentHistory(parentId);
    return res.status(200).json({ success: true, data: history });
  } catch (error: unknown) {
    return handleError(res, error, "finance.getParentHistory");
  }
}

/**
 * Super Admin: Get all transactions across the platform
 */
export async function getGlobalTransactions(_req: Request, res: Response) {
  try {
    const transactions = await FinanceService.getGlobalTransactions();
    return res.status(200).json({ success: true, data: transactions });
  } catch (error: unknown) {
    return handleError(res, error, "finance.getGlobalTransactions");
  }
}

/**
 * School Admin: Record offline/manual fee payment
 */
export async function recordManualPayment(req: Request, res: Response) {
  try {
    const rawSchoolId = getSingleString(req.params.schoolId);
    const { authorized, schoolId } = await resolveAndAuthorizeFinanceSchool(
      req,
      rawSchoolId,
    );
    if (!authorized || !schoolId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: Only School Owners or Accountants can record payments for their school",
      });
    }

    const parsed = recordManualPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ||
          "Student and a positive amount are required",
      });
    }

    const result = await FinanceService.recordManualPayment(
      schoolId,
      parsed.data,
    );

    return res.status(201).json({
      success: true,
      message: "Payment successfully recorded in institutional ledger",
      data: result,
    });
  } catch (error: unknown) {
    return handleError(res, error, "finance.recordManualPayment");
  }
}

/**
 * School Admin: Get detailed transactions with filtering
 */
export async function getSchoolTransactions(req: Request, res: Response) {
  try {
    const rawSchoolId = getSingleString(req.params.schoolId);
    const { authorized, schoolId } = await resolveAndAuthorizeFinanceSchool(
      req,
      rawSchoolId,
    );
    if (!authorized || !schoolId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to view transactions for this school",
      });
    }

    const { page, limit, status, search, paymentType } = req.query;
    const result = await FinanceService.getSchoolTransactions(schoolId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status: typeof status === "string" ? status : undefined,
      search: typeof search === "string" ? search : undefined,
      paymentType: typeof paymentType === "string" ? paymentType : undefined,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    return handleError(res, error, "finance.getSchoolTransactions");
  }
}

