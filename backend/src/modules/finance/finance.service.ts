import {
  setupBankService,
  resolveAccountService,
  listBanksService,
  updateSubaccountStatusByCodeService,
  removeSubaccountService,
  syncSubaccountStatusService,
} from "./services/finance-bank.service";
import { getBankAccountAuditsService } from "./services/finance-bank-audit.service";
import {
  generateTranscriptPassService,
  verifyTranscriptPassService,
  buildPassForPaymentService,
  sendTranscriptPassEmailService,
  initiateTranscriptPaymentService,
} from "./services/finance-transcript.service";
import {
  getSchoolPaymentStatusService,
  initializePaymentService,
  verifyPaymentService,
} from "./services/finance-payments.service";
import {
  getSchoolAnalyticsService,
  recordManualPaymentService,
} from "./services/finance-ledger.service";
import {
  getSchoolTransactionsService,
  getParentHistoryService,
  getGlobalTransactionsService,
} from "./services/finance-transactions.service";

/**
 * Facade delegating finance operations to modular, <300-line services.
 */
export class FinanceService {
  static setupBank = setupBankService;
  static resolveAccount = resolveAccountService;
  static listBanks = listBanksService;
  static updateSubaccountStatusByCode = updateSubaccountStatusByCodeService;
  static removeSubaccount = removeSubaccountService;
  static syncSubaccountStatus = syncSubaccountStatusService;
  static getBankAccountAudits = getBankAccountAuditsService;

  static generateTranscriptPass = generateTranscriptPassService;
  static verifyTranscriptPass = verifyTranscriptPassService;
  static buildPassForPayment = buildPassForPaymentService;
  static sendTranscriptPassEmail = sendTranscriptPassEmailService;
  static initiateTranscriptPayment = initiateTranscriptPaymentService;

  static getSchoolPaymentStatus = getSchoolPaymentStatusService;
  static initializePayment = initializePaymentService;
  static verifyPayment = verifyPaymentService;

  static getSchoolAnalytics = getSchoolAnalyticsService;
  static recordManualPayment = recordManualPaymentService;
  static getSchoolTransactions = getSchoolTransactionsService;
  static getParentHistory = getParentHistoryService;
  static getGlobalTransactions = getGlobalTransactionsService;
}
