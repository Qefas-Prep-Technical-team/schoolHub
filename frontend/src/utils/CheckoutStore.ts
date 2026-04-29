import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutState {
  plan: string;
  billing: 'monthly' | 'yearly';
  role: string;
  discountedAmount?: number;
  isUpgrade?: boolean;
  redirectBackUrl?: string;
  setCheckoutDetails: (details: { 
      plan: string; 
      billing: 'monthly' | 'yearly'; 
      role: string;
      discountedAmount?: number;
      isUpgrade?: boolean;
      redirectBackUrl?: string;
  }) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      plan: '',
      billing: 'monthly',
      role: 'STUDENT',
      discountedAmount: undefined,
      isUpgrade: false,
      redirectBackUrl: undefined,
      setCheckoutDetails: (details) => set(details),
      clearCheckout: () => set({ plan: '', billing: 'monthly', role: 'STUDENT', discountedAmount: undefined, isUpgrade: false, redirectBackUrl: undefined }),
    }),
    {
      name: 'checkout-storage',
    }
  )
);
