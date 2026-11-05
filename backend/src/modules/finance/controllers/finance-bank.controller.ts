import { Request, Response } from "express";
import prisma, { withRetry } from "../../../config/database";
import { getSingleString } from "../../../utils/request-utils";
import { handleError } from "../../../utils/error-handler";
import { FinanceService } from "../finance.service";
import {
  resolveAndAuthorizeFinanceSchool,
  resolveFinanceActorContext,
} from "../services/finance-access.service";
import {
  setupBankSchema,
  resolveAccountSchema,
} from "../schemas/finance.schemas";

/**
 * School Admin: Setup settlement bank details
 */
export async function setupBank(req: Request, res: Response) {
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
          "Access denied: Only School Owners or Accountants can manage settlement bank details for their school",
      });
    }

    const parsed = setupBankSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message || "Invalid bank setup payload",
      });
    }

    const userContext = await resolveFinanceActorContext(req, schoolId, {
      addedByName: parsed.data.addedByName,
      addedByEmail: parsed.data.addedByEmail,
      addedByRole: parsed.data.addedByRole,
    });

    const account = await FinanceService.setupBank(
      schoolId,
      parsed.data,
      userContext,
    );
    return res.status(200).json({
      success: true,
      message: "Settlement account created and verified",
      data: account,
    });
  } catch (error: unknown) {
    return handleError(res, error, "finance.setupBank");
  }
}

/**
 * Remove settlement bank details
 */
export async function removeSubaccount(req: Request, res: Response) {
  try {
    const accountId = getSingleString(req.params.accountId);
    const account = await withRetry(
      () =>
        prisma.settlementAccount.findUnique({
          where: { id: accountId },
          select: { schoolId: true },
        }),
      "finance.removeSubaccount.findAccount",
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Settlement account not found",
      });
    }

    const { authorized, schoolId } = await resolveAndAuthorizeFinanceSchool(
      req,
      account.schoolId,
    );
    if (!authorized || !schoolId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this settlement account",
      });
    }

    const userContext = await resolveFinanceActorContext(req, schoolId);
    const result = await FinanceService.removeSubaccount(
      accountId,
      userContext,
    );
    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleError(res, error, "finance.removeSubaccount");
  }
}

/**
 * School Admin: Get full Bank Account Audit History
 */
export async function getBankAudits(req: Request, res: Response) {
  try {
    const rawSchoolId = getSingleString(req.params.schoolId);
    const { authorized, schoolId } = await resolveAndAuthorizeFinanceSchool(
      req,
      rawSchoolId,
    );
    if (!authorized || !schoolId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to view bank history for this school",
      });
    }

    const audits = await FinanceService.getBankAccountAudits(schoolId);
    return res.status(200).json({
      success: true,
      data: audits,
    });
  } catch (error: unknown) {
    return handleError(res, error, "finance.getBankAudits");
  }
}

/**
 * Manually sync subaccount status
 */
export async function syncSubaccountStatus(req: Request, res: Response) {
  try {
    const rawSchoolId = getSingleString(req.params.schoolId);
    const { authorized, schoolId } = await resolveAndAuthorizeFinanceSchool(
      req,
      rawSchoolId,
    );
    if (!authorized || !schoolId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only sync accounts for your own school",
      });
    }

    const rawAccountId = req.body?.accountId;
    const accountId =
      typeof rawAccountId === "string" && rawAccountId.trim()
        ? rawAccountId.trim()
        : undefined;

    const userContext = await resolveFinanceActorContext(req, schoolId);
    const result = await FinanceService.syncSubaccountStatus(
      schoolId,
      accountId,
      userContext,
    );
    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleError(res, error, "finance.syncSubaccountStatus");
  }
}

/**
 * Get list of supported banks
 */
export async function getBanks(_req: Request, res: Response) {
  try {
    const banks = await FinanceService.listBanks();
    return res.json({ success: true, data: banks });
  } catch (error: unknown) {
    return handleError(res, error, "finance.getBanks");
  }
}

/**
 * Resolve bank account number
 */
export async function resolveAccount(req: Request, res: Response) {
  try {
    const parsed = resolveAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ||
          "accountNumber and bankCode are required",
      });
    }

    const result = await FinanceService.resolveAccount(
      parsed.data.accountNumber,
      parsed.data.bankCode,
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not resolve bank account details";
    return res.status(400).json({
      success: false,
      message,
    });
  }
}

