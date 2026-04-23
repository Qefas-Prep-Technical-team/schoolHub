import { apiClient } from "../client";

export const paymentService = {
  /**
   * Initialize a payment
   */
  initialize: async (data: { 
    amount: number; 
    email: string; 
    plan: string; 
    metadata?: any 
  }) => {
    const response = await apiClient.post("/payment/initialize", data);
    return response.data.data;
  },

  /**
   * Verify a payment
   */
  verify: async (data: { 
    reference: string; 
    plan: string; 
    billingType: 'monthly' | 'yearly' 
  }) => {
    const response = await apiClient.post("/payment/verify", data);
    return response.data;
  },

  /**
   * Get payment history
   */
  getHistory: async () => {
    const response = await apiClient.get("/payment/history");
    return response.data.data;
  },

  /**
   * Get pricing plans
   */
  getPlans: async () => {
    const response = await apiClient.get("/payment/plans");
    return response.data;
  },

  /**
   * Get pricing FAQs
   */
  getFAQ: async () => {
    const response = await apiClient.get("/payment/faq");
    return response.data;
  }
};
