import { Request, Response } from "express";
import { FinanceService } from "./finance.service";
import prisma from "../../config/database";
import { getSingleString } from "../../utils/request-utils";
import { handleError } from "../../utils/error-handler";

export class FinanceController {
  /**
   * School Admin: Setup bank details
   */
  /**
   * School Admin: Setup bank details
   */
  static async setupBank(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      const user = req.user as any;
      if (user?.userType !== 'SUPER_ADMIN' && user?.schoolId !== schoolId) {
        return res.status(403).json({ success: false, message: "Access denied: You can only manage bank details for your own school" });
      }

      const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || "School Administrator";
      const userRole = user?.adminRole || user?.role || user?.userType || "ADMIN";
      const userContext = {
        userId: user?.id,
        userName,
        userEmail: user?.email,
        userRole
      };

      console.log(`[FinanceController] Setting up bank for school: ${schoolId} by ${userName} (${userRole})`, req.body);
      const account = await FinanceService.setupBank(schoolId, req.body, userContext);
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

      // Verify parent is linked to this student
      if (studentId) {
        const link = await prisma.parentChildLink.findFirst({
          where: { parentId, studentId }
        });
        if (!link) {
          return res.status(403).json({ success: false, message: "Access denied: You can only initiate payments for your linked children" });
        }
      }

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
      const user = req.user;
      if (user?.userType !== 'SUPER_ADMIN' && user?.schoolId !== schoolId) {
        return res.status(403).json({ success: false, message: "Access denied: You can only view analytics for your own school" });
      }

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
      const user = req.user;
      if (user?.userType !== 'SUPER_ADMIN') {
        const account = await prisma.settlementAccount.findUnique({
          where: { id: accountId },
          select: { schoolId: true }
        });
        if (!account || account.schoolId !== user?.schoolId) {
          return res.status(403).json({ success: false, message: "Access denied to this settlement account" });
        }
      }

      const userAny = user as any;
      const userName = userAny?.name || `${userAny?.firstName || ''} ${userAny?.lastName || ''}`.trim() || userAny?.email || "School Administrator";
      const userRole = userAny?.adminRole || userAny?.role || userAny?.userType || "ADMIN";
      const userContext = {
        userId: userAny?.id,
        userName,
        userEmail: userAny?.email,
        userRole
      };

      const result = await FinanceService.removeSubaccount(accountId, userContext);
      res.status(200).json(result);
    } catch (error: any) {
      return handleError(res, error, "finance.removeSubaccount");
    }
  }

  /**
   * School Admin: Get full Bank Account Audit History
   */
  static async getBankAudits(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      const user = req.user;
      if (user?.userType !== 'SUPER_ADMIN' && user?.schoolId !== schoolId) {
        return res.status(403).json({ success: false, message: "Access denied to view bank history for this school" });
      }

      const audits = await FinanceService.getBankAccountAudits(schoolId);
      res.status(200).json({
        success: true,
        data: audits
      });
    } catch (error: any) {
      return handleError(res, error, "finance.getBankAudits");
    }
  }

  /**
   * Manually sync subaccount status
   */
  static async syncSubaccountStatus(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      const user = req.user;
      if (user?.userType !== 'SUPER_ADMIN' && user?.schoolId !== schoolId) {
        return res.status(403).json({ success: false, message: "Access denied: You can only sync accounts for your own school" });
      }

      const { accountId } = req.body;
      const result = await FinanceService.syncSubaccountStatus(schoolId, accountId);
      res.status(200).json(result);
    } catch (error: any) {
      return handleError(res, error, "finance.syncSubaccountStatus");
    }
  }

  /**
   * School Admin: Record offline/manual fee payment
   */
  static async recordManualPayment(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      const user = req.user;
      if (user?.userType !== 'SUPER_ADMIN' && user?.schoolId !== schoolId) {
        return res.status(403).json({ success: false, message: "Access denied: You can only record payments for your own school" });
      }

      const { studentId, parentId, amount, paymentType, paymentMethod, term, session, reference, notes } = req.body;
      if (!studentId || !amount) {
        return res.status(400).json({ success: false, message: "Student and amount are required" });
      }

      const result = await FinanceService.recordManualPayment(schoolId, {
        studentId,
        parentId,
        amount: Number(amount),
        paymentType,
        paymentMethod,
        term,
        session,
        reference,
        notes
      });

      res.status(201).json({
        success: true,
        message: "Payment successfully recorded in institutional ledger",
        data: result
      });
    } catch (error: any) {
      return handleError(res, error, "finance.recordManualPayment");
    }
  }

  /**
   * School Admin: Get detailed transactions with filtering
   */
  static async getSchoolTransactions(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      const user = req.user;
      if (user?.userType !== 'SUPER_ADMIN' && user?.schoolId !== schoolId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      const { page, limit, status, search, paymentType } = req.query;
      const result = await FinanceService.getSchoolTransactions(schoolId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        status: typeof status === 'string' ? status : undefined,
        search: typeof search === 'string' ? search : undefined,
        paymentType: typeof paymentType === 'string' ? paymentType : undefined
      });

      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return handleError(res, error, "finance.getSchoolTransactions");
    }
  }

  /**
   * Resolve bank account number
   */
  static async resolveAccount(req: Request, res: Response) {
    try {
      const { accountNumber, bankCode } = req.body;
      if (!accountNumber || !bankCode) {
        return res.status(400).json({ success: false, message: "accountNumber and bankCode are required" });
      }

      const result = await FinanceService.resolveAccount(accountNumber, bankCode);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      // Account resolution is a user input validation check, not an unhandled server error
      const message = error?.message || "Could not resolve bank account details";
      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * Initiate transcript or graduated student session portal access payment
   */
  static async initiateTranscriptPayment(req: Request, res: Response) {
    try {
      const schoolId = getSingleString(req.params.schoolId);
      const { studentId, sessionId, amount, email, name } = req.body;
      const user = req.user;

      if (!studentId) {
        return res.status(400).json({ success: false, message: "studentId is required" });
      }

      const result = await FinanceService.initiateTranscriptPayment({
        schoolId,
        studentId,
        sessionId,
        amount: amount ? Number(amount) : undefined,
        email: email || user?.email || "guest@student.edu",
        name: name || user?.name || "Student Payer",
        parentId: user?.userType === 'PARENT' ? user.id : undefined,
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return handleError(res, error, "finance.initiateTranscriptPayment");
    }
  }
}

