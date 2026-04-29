import { apiClient } from "../client";

export const financeService = {
  /**
   * School Admin: Setup settlement bank details
   */
  setupBank: async (schoolId: string, data: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
  }) => {
    const response = await apiClient.post(`/finance/setup/${schoolId}`, data);
    return response.data;
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
  getSchoolAnalytics: async (schoolId: string) => {
    const response = await apiClient.get(`/finance/analytics/${schoolId}`);
    return response.data.data;
  },

  /**
   * General: Get list of supported banks
   */
  getBanks: async () => {
    const response = await apiClient.get("/finance/banks");
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
