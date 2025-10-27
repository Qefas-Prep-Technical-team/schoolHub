// stores/useBillingStore.ts
import { create } from 'zustand';

type BillingType = 'monthly' | 'yearly';

interface BillingStore {
  billingType: BillingType;
  setBillingType: (type: BillingType) => void;
  toggleBillingType: () => void;
}

export const useBillingStore = create<BillingStore>((set) => ({
  billingType: 'monthly',
  setBillingType: (type) => set({ billingType: type }),
  toggleBillingType: () =>
    set((state) => ({
      billingType: state.billingType === 'monthly' ? 'yearly' : 'monthly',
    })),
}));
