"use client";

/**
 * Monthly export tracking and quota management utility for Qefas Hub.
 * Enforces:
 * - Free / Non-paying users: Max 10 exports per calendar month.
 * - Free / Non-paying users: Only basic Master Sheet PDF export allowed without digital signatures.
 * - Premium / Paid users: Unlimited exports, all formats (.pdf, .xlsx, .csv), zip archiving, and verified digital signatures.
 */

const STORAGE_PREFIX = "qefas_export_quota_";
export const FREE_TIER_MONTHLY_EXPORT_LIMIT = 10;

export interface MonthlyQuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  isExceeded: boolean;
  periodKey: string;
}

/**
 * Returns current calendar month key: YYYY-MM
 */
export function getCurrentMonthPeriodKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Retrieves the count of exports used in the current month for a user or school context.
 */
export function getMonthlyExportUsage(contextId: string): MonthlyQuotaStatus {
  if (typeof window === "undefined" || !contextId) {
    return {
      used: 0,
      limit: FREE_TIER_MONTHLY_EXPORT_LIMIT,
      remaining: FREE_TIER_MONTHLY_EXPORT_LIMIT,
      isExceeded: false,
      periodKey: getCurrentMonthPeriodKey(),
    };
  }

  const periodKey = getCurrentMonthPeriodKey();
  const storageKey = `${STORAGE_PREFIX}${contextId}_${periodKey}`;
  const raw = localStorage.getItem(storageKey);
  const used = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  const remaining = Math.max(0, FREE_TIER_MONTHLY_EXPORT_LIMIT - used);

  return {
    used,
    limit: FREE_TIER_MONTHLY_EXPORT_LIMIT,
    remaining,
    isExceeded: used >= FREE_TIER_MONTHLY_EXPORT_LIMIT,
    periodKey,
  };
}

/**
 * Increments the monthly export count for free users.
 */
export function incrementMonthlyExportUsage(contextId: string): number {
  if (typeof window === "undefined" || !contextId) return 0;

  const periodKey = getCurrentMonthPeriodKey();
  const storageKey = `${STORAGE_PREFIX}${contextId}_${periodKey}`;
  const current = getMonthlyExportUsage(contextId).used;
  const updated = current + 1;
  localStorage.setItem(storageKey, String(updated));
  return updated;
}

