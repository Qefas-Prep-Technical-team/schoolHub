import { toast } from 'react-toastify';

export interface SchoolSubscriptionContext {
  id?: string;
  name?: string;
  plan?: string | null;
  subscriptionStatus?: string | null;
  isTrialActive?: boolean;
  subscriptionEnd?: string | Date | null;
}

/**
 * Checks whether a school is on a valid paying subscription plan (any plan other than FREE).
 * Trial periods also grant temporary active status.
 */
export function isSchoolOnPayingPlan(school?: SchoolSubscriptionContext | null): boolean {
  if (!school) return false;

  // Active institutional trial
  if (school.isTrialActive) return true;

  // Check plan name - must not be FREE or empty
  const planName = (school.plan || '').trim().toUpperCase();
  if (!planName || planName === 'FREE' || planName === 'NONE') {
    return false;
  }

  // Check subscription status - must be ACTIVE
  const status = (school.subscriptionStatus || '').trim().toUpperCase();
  if (status !== 'ACTIVE') {
    return false;
  }

  // Check subscription expiry if present
  if (school.subscriptionEnd) {
    const expiry = new Date(school.subscriptionEnd);
    if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return false;
    }
  }

  return true;
}

/**
 * Asserts that the child's school is on a paying plan.
 * If not, displays a helpful notification toast and returns false.
 */
export function assertSchoolPayingPlan(school?: SchoolSubscriptionContext | null): boolean {
  const isPaying = isSchoolOnPayingPlan(school);
  if (!isPaying) {
    toast.error(
      "Export and downloadable reports are an institutional feature reserved for schools on an active paid subscription. Please contact your school administration to upgrade from the Free tier.",
      { autoClose: 6000 }
    );
    return false;
  }
  return true;
}
