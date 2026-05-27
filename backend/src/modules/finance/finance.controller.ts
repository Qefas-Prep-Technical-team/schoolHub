import { Request, Response } from "express";
import { FinanceService } from "./finance.service";
import prisma from "../../config/database";
import { getSingleString } from "../../utils/request-utils";
import { handleError } from "../../utils/error-handler";

export class FinanceController {
  /**
   * School Admin: Setup bank details
   */
  static async setupBank(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      console.log(`[FinanceController] Setting up bank for school: ${schoolId}`, req.body);
      const account = await FinanceService.setupBank(schoolId, req.body);
      res.status(200).json({
        success: true,
        message: "Settlement account created and verified",
        data: account
      });
    } catch (error: any) {
      return handleError(res, error, "finance.setupBank");
    }
  }

  /**
   * Parent: Initialize payment for a student
   */
  static async initializePayment(req: Request, res: Response) {
    try {
      const { schoolId, studentId, amount, term, session, paymentType } = req.body;
      const parentId = (req as any).user.id;
      const email = (req as any).user.email;

      const initializationData = await FinanceService.initializePayment({
        schoolId,
        studentId,
        parentId,
        email,
        amount,
        metadata: { term, session, paymentType }
      });

      res.status(200).json({
        success: true,
        data: initializationData
      });
    } catch (error: any) {
      return handleError(res, error, "finance.initializePayment");
    }
  }

  /**
   * Verify a transaction
   */
  static async verifyPayment(req: Request, res: Response) {
    try {
      const reference = getSingleString(req.params.reference);
      const result = await FinanceService.verifyPayment(reference);
      res.status(200).json(result);
    } catch (error: any) {
      return handleError(res, error, "finance.verifyPayment");
    }
  }

  /**
   * School Admin: Get dashboard analytics
   */
  static async getSchoolAnalytics(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      console.log(`[FinanceController] Fetching analytics for school: ${schoolId}`);
      const analytics = await FinanceService.getSchoolAnalytics(schoolId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
      return handleError(res, error, "finance.getSchoolAnalytics");
    }
  }

  /**
   * Parent: Get personal payment history
   */
  static async getParentHistory(req: Request, res: Response) {
    try {
      const parentId = (req as any).user.id;
      const history = await prisma.payment.findMany({
        where: { parentId },
        include: {
          student: { select: { name: true } },
          school: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" }
      });
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      return handleError(res, error, "finance.getParentHistory");
    }
  }

  /**
   * Get list of supported banks
   */
  static getBanks = async (req: Request, res: Response) => {
    try {
      const banks = await FinanceService.listBanks();
      res.json({ success: true, data: banks });
    } catch (error: any) {
      return handleError(res, error, "finance.Unknown");
    }
  };

  /**
   * Super Admin: Get all transactions across the platform
   */
  static async getGlobalTransactions(req: Request, res: Response) {
    try {
      const transactions = await FinanceService.getGlobalTransactions();
      res.status(200).json({ success: true, data: transactions });
    } catch (error: any) {
      return handleError(res, error, "finance.getGlobalTransactions");
    }
  }

  /**
   * Remove settlement bank details
   */
  static async removeSubaccount(req: Request, res: Response) {
    try {
      const accountId = getSingleString(req.params.accountId);
      const result = await FinanceService.removeSubaccount(accountId);
      res.status(200).json(result);
    } catch (error: any) {
      return handleError(res, error, "finance.removeSubaccount");
    }
  }

  /**
   * Manually sync subaccount status
   */
  static async syncSubaccountStatus(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      const { accountId } = req.body;
      const result = await FinanceService.syncSubaccountStatus(schoolId, accountId);
      res.status(200).json(result);
    } catch (error: any) {
      return handleError(res, error, "finance.syncSubaccountStatus");
    }
  }
}
