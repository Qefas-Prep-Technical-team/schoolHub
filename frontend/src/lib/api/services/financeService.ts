import { apiClient } from "../client";

export interface FinanceTransaction {
  id: string;
  amount: number;
  currency?: string;
  createdAt: string;
  paidAt?: string | null;
  paymentReference?: string;
  reference?: string;
  channel?: string;
  status: string;
  paymentType?: string;
  term?: string;
  session?: string;
  student?: {
    id?: string;
    name: string;
    studentCode?: string;
  } | null;
  parent?: {
    id?: string;
    fullName: string;
    email?: string;
    phone?: string;
  } | null;
  gatewayResponse?: Record<string, unknown> | null;
}

export interface FinanceSettlementAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: string;
  isDefault: boolean;
  totalSettled: number;
  paystackSubaccountCode?: string;
  flwSubaccountCode?: string;
}

export interface BankAccountAudit {
  id: string;
  schoolId: string;
  settlementAccountId?: string | null;
  action: string;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  gateway?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

export interface FinanceAnalytics {
  totalRevenue: number;
  pendingRevenue: number;
  activePayerCount: number;
  averageTransaction: number;
  monthlyTrends: Array<{ month: string; revenue: number; count: number }>;
  categoryBreakdown: Array<{ category: string; amount: number; count: number; percentage: number }>;
  recentTransactions: FinanceTransaction[];
  paymentStatus: {
    color: string;
    message: string;
    label: string;
    status: string;
  };
  accounts: FinanceSettlementAccount[];
  bankAudits?: BankAccountAudit[];
  isVerified: boolean;
  transcriptRevenue?: number;
  transcriptCount?: number;
  transcriptTransactions?: FinanceTransaction[];
}

export interface PaginatedTransactionsResponse {
  success: boolean;
  transactions: FinanceTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const financeService = {
  /**
   * School Admin: Setup settlement bank details
   */
  setupBank: async (schoolId: string, data: {
    business_name: string;
    settlement_bank: string;
    bank_name?: string;
    account_number: string;
    percentage_charge: number;
  }) => {
    const response = await apiClient.post(`/finance/setup/${schoolId}`, data);
    return response.data;
  },

  /**
   * School Admin: Get Bank Account Audit History
   */
  getBankHistory: async (schoolId: string): Promise<BankAccountAudit[]> => {
    const response = await apiClient.get<{ success: boolean; data: BankAccountAudit[] }>(
      `/finance/bank-history/${schoolId}`
    );
    return response.data.data;
  },

  /**
   * School Admin: Remove settlement bank details
   */
  removeSubaccount: async (accountId: string) => {
    const response = await apiClient.delete(`/finance/account/${accountId}`);
    return response.data;
  },

  syncSubaccountStatus: async (schoolId: string, accountId?: string) => {
    const response = await apiClient.patch(`/finance/sync/${schoolId}`, { accountId });
    return response.data;
  },

  /**
   * Parent: Initialize fee payment for a child
   */
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

  /**
   * General: Verify a transaction status
   */
  verifyPayment: async (reference: string) => {
    const response = await apiClient.get(`/finance/verify/${reference}`);
    return response.data;
  },

  /**
   * School Admin: Get financial analytics and recent transactions
   */
  getSchoolAnalytics: async (schoolId: string): Promise<FinanceAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: FinanceAnalytics }>(`/finance/analytics/${schoolId}`);
    return response.data.data;
  },

  /**
   * School Admin: Get paginated transactions with filtering
   */
  getSchoolTransactions: async (
    schoolId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      paymentType?: string;
    } = {}
  ): Promise<PaginatedTransactionsResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.status && params.status !== "ALL") query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.paymentType && params.paymentType !== "ALL") query.append("paymentType", params.paymentType);

    const response = await apiClient.get<PaginatedTransactionsResponse>(
      `/finance/transactions/${schoolId}?${query.toString()}`
    );
    return response.data;
  },

  /**
   * School Admin: Record offline/manual fee payment
   */
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
    }
  ) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
      `/finance/manual-payment/${schoolId}`,
      data
    );
    return response.data;
  },

  /**
   * General: Get list of supported banks
   */
  getBanks: async () => {
    const response = await apiClient.get("/finance/banks");
    return response.data.data;
  },

  /**
   * General: Resolve 10-digit bank account number
   */
  resolveAccount: async (accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }> => {
    const response = await apiClient.post<{ success: boolean; data: { accountNumber: string; accountName: string } }>(
      "/finance/resolve-account",
      { accountNumber, bankCode }
    );
    return response.data.data;
  },

  /**
   * Student: Initiate transcript fee payment (Flutterwave split or settlement routing)
   */
  initiateTranscriptPayment: async (
    schoolId: string,
    data: {
      studentId: string;
      sessionId?: string;
      amount?: number;
      email?: string;
      name?: string;
    }
  ): Promise<{
    checkoutUrl?: string;
    paymentReference: string;
    amount: number;
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
        settlementAccount?: {
          bankName: string;
          accountNumber: string;
          accountName: string;
        };
      };
    }>(`/finance/transcript-payment/${schoolId}`, data);
    return response.data.data;
  },

  /**
   * Parent: Get personal payment history
   */
  getParentHistory: async () => {
    const response = await apiClient.get("/finance/history");
    return response.data.data;
  },

  /**
   * Super Admin: Get all transactions across the platform
   */
  getGlobalTransactions: async () => {
    const response = await apiClient.get("/finance/global-transactions");
    return response.data.data;
  }
};
