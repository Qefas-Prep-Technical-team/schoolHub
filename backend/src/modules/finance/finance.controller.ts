import { Request, Response } from "express";
import { FinanceService } from "./finance.service";
import prisma from "../../config/database";

export class FinanceController {
  /**
   * School Admin: Setup bank details
   */
  static async setupBank(req: Request, res: Response) {
    try {
      const schoolId = req.params.schoolId as string;
      console.log(`[FinanceController] Setting up bank for school: ${schoolId}`, req.body);
      const account = await FinanceService.setupBank(schoolId, req.body);
      res.status(200).json({
        success: true,
        message: "Settlement account created and verified",
        data: account
      });
    } catch (error: any) {
      console.error("[FinanceController] Setup Bank Error:", error);
      res.status(400).json({ success: false, message: error.message });
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
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Verify a transaction
   */
  static async verifyPayment(req: Request, res: Response) {
    try {
      const reference = req.params.reference as string;
      const result = await FinanceService.verifyPayment(reference);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * School Admin: Get dashboard analytics
   */
  static async getSchoolAnalytics(req: Request, res: Response) {
    try {
      const schoolId = req.params.schoolId as string;
      console.log(`[FinanceController] Fetching analytics for school: ${schoolId}`);
      const analytics = await FinanceService.getSchoolAnalytics(schoolId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
      console.error("[FinanceController] Analytics Error:", error);
      res.status(400).json({ success: false, message: error.message });
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
      res.status(400).json({ success: false, message: error.message });
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
      res.status(500).json({ success: false, message: error.message });
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
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Remove settlement bank details
   */
  static async removeSubaccount(req: Request, res: Response) {
    try {
      const accountId = req.params.accountId as string;
      const result = await FinanceService.removeSubaccount(accountId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Manually sync subaccount status
   */
  static async syncSubaccountStatus(req: Request, res: Response) {
    try {
      const schoolId = req.params.schoolId as string;
      const { accountId } = req.body;
      const result = await FinanceService.syncSubaccountStatus(schoolId, accountId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("[FinanceController] Sync Subaccount Error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
