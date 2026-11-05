import prisma, { withRetry } from "../../../config/database";

export interface BankAuditActorInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface BankAuditItemInput {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  settlementAccountId?: string | null;
  settlementAccount?: {
    id: string;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    isDefault?: boolean;
    addedBy?: string | null;
    addedByName?: string | null;
    addedByRole?: string | null;
  } | null;
  [key: string]: unknown;
}

/**
 * Helper to enrich bank audit records with real admin user info if missing or generic,
 * and auto-heal the database records so future direct queries are clean.
 */
export async function enrichBankAuditsService(
  schoolId: string,
  audits: BankAuditItemInput[],
) {
  if (!audits || audits.length === 0) return audits;

  const userIdsToFetch = new Set<string>();
  for (const a of audits) {
    if (a.userId) userIdsToFetch.add(a.userId);
    if (a.settlementAccount?.addedBy) {
      userIdsToFetch.add(a.settlementAccount.addedBy);
    }
  }

  const adminMap = new Map<string, BankAuditActorInfo>();
  if (userIdsToFetch.size > 0) {
    const admins = await withRetry(
      () =>
        prisma.admin.findMany({
          where: { id: { in: Array.from(userIdsToFetch) } },
          select: { id: true, name: true, email: true, role: true },
        }),
      "finance.enrichBankAuditsService.admins",
    );
    for (const adm of admins) {
      adminMap.set(adm.id, adm);
    }
  }

  let primaryAdmin: BankAuditActorInfo | null = null;
  const hasGeneric = audits.some(
    (a) =>
      !a.userName ||
      a.userName === "School Administrator" ||
      a.userName === "System Administrator" ||
      !a.userEmail,
  );
  if (hasGeneric) {
    const sa = await withRetry(
      () =>
        prisma.schoolAdmin.findFirst({
          where: { schoolId },
          include: {
            admin: { select: { id: true, name: true, email: true, role: true } },
          },
        }),
      "finance.enrichBankAuditsService.primaryAdmin",
    );
    if (sa?.admin) {
      primaryAdmin = sa.admin;
    }
  }

  const updates: Promise<unknown>[] = [];

  const enriched = audits.map((audit) => {
    let resolvedName = audit.userName;
    let resolvedEmail = audit.userEmail;
    let resolvedRole = audit.userRole;
    let resolvedUserId = audit.userId;

    const isGenericName =
      !resolvedName ||
      resolvedName === "School Administrator" ||
      resolvedName === "System Administrator" ||
      resolvedName === "Admin";

    const matchedAdmin =
      (audit.userId && adminMap.get(audit.userId)) ||
      (audit.settlementAccount?.addedBy &&
        adminMap.get(audit.settlementAccount.addedBy)) ||
      primaryAdmin;

    if (matchedAdmin) {
      if (!resolvedUserId) resolvedUserId = matchedAdmin.id;
      if (isGenericName && matchedAdmin.name) resolvedName = matchedAdmin.name;
      if (!resolvedEmail && matchedAdmin.email) resolvedEmail = matchedAdmin.email;
      if (!resolvedRole && matchedAdmin.role) resolvedRole = matchedAdmin.role;
    }

    if ((isGenericName || !audit.userEmail) && matchedAdmin?.name) {
      updates.push(
        prisma.bankAccountAudit
          .update({
            where: { id: audit.id },
            data: {
              userId: resolvedUserId,
              userName: resolvedName,
              userEmail: resolvedEmail,
              userRole: resolvedRole,
            },
          })
          .catch((e: { message?: string }) =>
            console.warn("[FinanceService] Audit auto-heal skipped:", e?.message),
          ),
      );

      if (audit.settlementAccountId) {
        updates.push(
          prisma.settlementAccount
            .update({
              where: { id: audit.settlementAccountId },
              data: {
                addedBy: resolvedUserId,
                addedByName: resolvedName,
                addedByRole: resolvedRole,
              },
            })
            .catch((e: { message?: string }) =>
              console.warn(
                "[FinanceService] Settlement account auto-heal skipped:",
                e?.message,
              ),
            ),
        );
      }
    }

    return {
      ...audit,
      userId: resolvedUserId || audit.userId,
      userName: resolvedName || "Administrator",
      userEmail: resolvedEmail || null,
      userRole: resolvedRole || "ADMIN",
    };
  });

  if (updates.length > 0) {
    Promise.all(updates).catch(() => {});
  }

  return enriched;
}

/**
 * Get complete bank account audit history
 */
export async function getBankAccountAuditsService(schoolId: string) {
  const audits = await withRetry(
    () =>
      prisma.bankAccountAudit.findMany({
        where: { schoolId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          settlementAccount: {
            select: {
              id: true,
              bankName: true,
              accountNumber: true,
              accountName: true,
              isDefault: true,
              addedBy: true,
              addedByName: true,
              addedByRole: true,
            },
          },
        },
      }),
    "finance.getBankAccountAuditsService",
  );

  return enrichBankAuditsService(
    schoolId,
    audits as unknown as BankAuditItemInput[],
  );
}

