/**
 * Calculates the pro-rated amount for a plan upgrade.
 * Rules:
 * 1. If used < 15 days: Pay (NewPrice - OldPrice). Cycle continues.
 * 2. If used >= 15 days: Pay (NewPrice). Cycle resets.
 */
export const calculateProRatedAmount = (
    currentPlanPrice: number,
    newPlanPrice: number,
    lastPaymentDate: string | Date | null,
    _billingType: 'monthly' | 'yearly'
) => {
    const defaultRes = { amount: newPlanPrice, discount: 0, isUpgrade: newPlanPrice > currentPlanPrice, resetCycle: true, diffDays: 0 };
    
    if (!lastPaymentDate) return defaultRes;

    const lastPayment = new Date(lastPaymentDate);
    if (isNaN(lastPayment.getTime())) return defaultRes;

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastPayment.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isUnderThreshold = diffDays < 15;

    if (isUnderThreshold && newPlanPrice > currentPlanPrice) {
        return {
            amount: Math.max(0, newPlanPrice - currentPlanPrice),
            discount: currentPlanPrice,
            isUpgrade: true,
            resetCycle: false,
            diffDays
        };
    }

    return {
        amount: newPlanPrice,
        discount: 0,
        isUpgrade: newPlanPrice > currentPlanPrice,
        resetCycle: true,
        diffDays
    };
};
