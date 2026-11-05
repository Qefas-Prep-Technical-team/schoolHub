import { apiClient } from "../client";
import {
  FinanceTransaction,
  FinanceSettlementAccount,
  BankAccountAudit,
  FinanceAnalytics,
  PaginatedTransactionsResponse,
} from "./finance.types";

export type {
  FinanceTransaction,
  FinanceSettlementAccount,
  BankAccountAudit,
  FinanceAnalytics,
  PaginatedTransactionsResponse,
};

export interface TranscriptAccessPassInfo {
  token: string;
  expiresAt: string;
  accessUrl: string;
  sessionId?: string;
  term?: string;
}

export const financeService = {
  setupBank: async (
    schoolId: string,
    data: {
      business_name: string;
      business_email?: string;
      settlement_bank: string;
      bank_name?: string;
      account_number: string;
      percentage_charge: number;
      addedByName?: string;
      addedByEmail?: string;
      addedByRole?: string;
    },
  ) => {
    const response = await apiClient.post(`/finance/setup/${schoolId}`, data);
    return response.data;
  },

  getBankHistory: async (schoolId: string): Promise<BankAccountAudit[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: BankAccountAudit[];
    }>(`/finance/bank-history/${schoolId}`);
    return response.data.data;
  },

  removeSubaccount: async (accountId: string) => {
    const response = await apiClient.delete(`/finance/account/${accountId}`);
    return response.data;
  },

  syncSubaccountStatus: async (schoolId: string, accountId?: string) => {
    const payload =
      typeof accountId === "string" && accountId.trim()
        ? { accountId: accountId.trim() }
        : {};
    const response = await apiClient.patch(
      `/finance/sync/${schoolId}`,
      payload,
    );
    return response.data;
  },

  initializePayment: async (data: {
    schoolId: string;
    studentId: string;
    amount: number;
    term: string;
    session: string;
    paymentType: string;
  }) => {
    const response = await apiClient.post("/finance/pay", data);
    return response.data.data;
  },

  verifyPayment: async (
    reference: string,
    transactionId?: string,
  ): Promise<{
    success: boolean;
    data?: {
      payment: Record<string, unknown>;
      accessPass?: TranscriptAccessPassInfo;
    };
    status?: string;
  }> => {
    const params = transactionId
      ? `?transaction_id=${encodeURIComponent(transactionId)}`
      : "";
    const response = await apiClient.get<{
      success: boolean;
      data?: {
        payment: Record<string, unknown>;
        accessPass?: TranscriptAccessPassInfo;
      };
      status?: string;
    }>(`/finance/verify/${reference}${params}`);
    return response.data;
  },

  getSchoolAnalytics: async (schoolId: string): Promise<FinanceAnalytics> => {
    const response = await apiClient.get<{
      success: boolean;
      data: FinanceAnalytics;
    }>(`/finance/analytics/${schoolId}`);
    return response.data.data;
  },

  getSchoolTransactions: async (
    schoolId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      paymentType?: string;
    } = {},
  ): Promise<PaginatedTransactionsResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.status && params.status !== "ALL")
      query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.paymentType && params.paymentType !== "ALL")
      query.append("paymentType", params.paymentType);

    const response = await apiClient.get<PaginatedTransactionsResponse>(
      `/finance/transactions/${schoolId}?${query.toString()}`,
    );
    return response.data;
  },

  recordManualPayment: async (
    schoolId: string,
    data: {
      studentId: string;
      parentId?: string;
      amount: number;
      paymentType?: string;
      paymentMethod?: string;
      term?: string;
      session?: string;
      reference?: string;
      notes?: string;
    },
  ) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Record<string, unknown>;
    }>(`/finance/manual-payment/${schoolId}`, data);
    return response.data;
  },

  getBanks: async () => {
    const response = await apiClient.get("/finance/banks");
    return response.data.data;
  },

  resolveAccount: async (
    accountNumber: string,
    bankCode: string,
  ): Promise<{ accountNumber: string; accountName: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { accountNumber: string; accountName: string };
    }>("/finance/resolve-account", { accountNumber, bankCode });
    return response.data.data;
  },

  initiateTranscriptPayment: async (
    schoolId: string,
    data: {
      studentId: string;
      sessionId?: string;
      term?: string;
      amount?: number;
      email?: string;
      name?: string;
    },
  ): Promise<{
    checkoutUrl?: string;
    paymentReference: string;
    amount: number;
    accessPass?: TranscriptAccessPassInfo;
    settlementAccount?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  }> => {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        checkoutUrl?: string;
        paymentReference: string;
        amount: number;
        accessPass?: TranscriptAccessPassInfo;
        settlementAccount?: {
          bankName: string;
          accountNumber: string;
          accountName: string;
        };
      };
    }>(`/finance/transcript-payment/${schoolId}`, data);
    return response.data.data;
  },

  verifyTranscriptPass: async (
    token: string,
    studentId?: string,
  ): Promise<{
    valid: boolean;
    studentId?: string;
    schoolId?: string;
    sessionId?: string;
    term?: string;
    reference?: string;
    expiresAt?: string;
    error?: string;
  }> => {
    const studentParam = studentId
      ? `&studentId=${encodeURIComponent(studentId)}`
      : "";
    const response = await apiClient.get<{
      success: boolean;
      data: {
        valid: boolean;
        studentId?: string;
        schoolId?: string;
        sessionId?: string;
        term?: string;
        reference?: string;
        expiresAt?: string;
        error?: string;
      };
    }>(
      `/finance/transcript-pass/verify?token=${encodeURIComponent(token)}${studentParam}`,
    );
    return response.data.data;
  },

  emailTranscriptPass: async (data: {
    studentId: string;
    schoolId: string;
    email: string;
    token?: string;
    reference?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/finance/transcript-pass/email", data);
    return response.data;
  },

  getParentHistory: async () => {
    const response = await apiClient.get("/finance/history");
    return response.data.data;
  },

  getGlobalTransactions: async () => {
    const response = await apiClient.get("/finance/global-transactions");
    return response.data.data;
  },
};
