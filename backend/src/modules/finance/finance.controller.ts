import {
  setupBank,
  removeSubaccount,
  getBankAudits,
  syncSubaccountStatus,
  getBanks,
  resolveAccount,
  initializePayment,
  verifyPayment,
  getSchoolAnalytics,
  getParentHistory,
  getGlobalTransactions,
  recordManualPayment,
  getSchoolTransactions,
  initiateTranscriptPayment,
  verifyTranscriptPass,
  emailTranscriptPass,
} from "./controllers";

export class FinanceController {
  static setupBank = setupBank;
  static removeSubaccount = removeSubaccount;
  static getBankAudits = getBankAudits;
  static syncSubaccountStatus = syncSubaccountStatus;
  static getBanks = getBanks;
  static resolveAccount = resolveAccount;
  static initializePayment = initializePayment;
  static verifyPayment = verifyPayment;
  static getSchoolAnalytics = getSchoolAnalytics;
  static getParentHistory = getParentHistory;
  static getGlobalTransactions = getGlobalTransactions;
  static recordManualPayment = recordManualPayment;
  static getSchoolTransactions = getSchoolTransactions;
  static initiateTranscriptPayment = initiateTranscriptPayment;
  static verifyTranscriptPass = verifyTranscriptPass;
  static emailTranscriptPass = emailTranscriptPass;
}
