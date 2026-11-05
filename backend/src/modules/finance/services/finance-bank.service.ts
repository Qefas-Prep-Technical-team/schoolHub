import prisma, { withRetry } from "../../../config/database";
import { getPaymentGateway } from "../../payment/gateway.factory";

export interface BankActorContext {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export async function setupBankService(
  schoolId: string,
  data: {
    business_name: string;
    business_email?: string;
    settlement_bank: string;
    bank_name?: string;
    account_number: string;
    percentage_charge: number;
  },
  userContext?: BankActorContext,
) {
  try {
    const gateway = getPaymentGateway();
    const school = await withRetry(
      () => prisma.school.findUnique({ where: { id: schoolId }, select: { schoolEmail: true, phone: true } }),
      "finance.setupBankService.school",
    );

    const resolvedBusinessEmail =
      data.business_email || userContext?.userEmail || school?.schoolEmail || "finance@schoolhub.ng";

    const sub = await gateway.createSubaccount({
      schoolId,
      businessName: data.business_name,
      bankCode: data.settlement_bank,
      accountNumber: data.account_number,
      splitPercentage: data.percentage_charge,
      businessEmail: resolvedBusinessEmail,
      businessMobile: school?.phone || undefined,
    });

    const isFlw = gateway.name === "FLUTTERWAVE";
    const resolvedBankName = data.bank_name || data.settlement_bank;
    const resolvedUserName = userContext?.userName || "School Administrator";
    const resolvedUserEmail = userContext?.userEmail;
    const resolvedUserRole = userContext?.userRole || "ADMIN";

    const account = await withRetry(
      () =>
        prisma.settlementAccount.create({
          data: {
            schoolId,
            paystackSubaccountCode: isFlw ? undefined : sub.code,
            paystackSubaccountStatus: isFlw ? "pending" : sub.status,
            flwSubaccountId: isFlw ? sub.id : undefined,
            flwSubaccountCode: isFlw ? sub.code : undefined,
            flwAccountStatus: isFlw ? sub.status : undefined,
            bankName: resolvedBankName,
            bankCode: data.settlement_bank,
            accountNumber: data.account_number,
            accountName: data.business_name,
            percentageCharge: data.percentage_charge,
            isDefault: true,
            addedBy: userContext?.userId,
            addedByName: resolvedUserName,
            addedByRole: resolvedUserRole,
          },
        }),
      "finance.setupBankService.createAccount",
    );

    await Promise.all([
      withRetry(
        () => prisma.settlementAccount.updateMany({ where: { schoolId, id: { not: account.id } }, data: { isDefault: false } }),
        "finance.setupBankService.clearOtherDefaults",
      ),
      withRetry(
        () =>
          prisma.bankAccountAudit.create({
            data: {
              schoolId,
              settlementAccountId: account.id,
              action: "ACCOUNT_ADDED",
              bankName: resolvedBankName,
              bankCode: data.settlement_bank,
              accountNumber: data.account_number,
              accountName: data.business_name,
              userId: userContext?.userId,
              userName: resolvedUserName,
              userEmail: resolvedUserEmail,
              userRole: resolvedUserRole,
              gateway: gateway.name,
              details: { subaccountCode: sub.code, percentageCharge: data.percentage_charge, status: sub.status },
            },
          }),
        "finance.setupBankService.createAudit",
      ),
      withRetry(
        () =>
          prisma.school.update({
            where: { id: schoolId },
            data: {
              accountName: data.business_name,
              accountNumber: data.account_number,
              bankName: data.settlement_bank,
              paystackSubaccountCode: isFlw ? undefined : sub.code,
              paystackSubaccountStatus: isFlw ? "active" : sub.status,
              percentageCharge: data.percentage_charge,
            },
          }),
        "finance.setupBankService.updateSchool",
      ),
    ]);

    return account;
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message?.toLowerCase().includes("account number")) {
      throw new Error("Invalid account number. Please verify and try again.");
    }
    throw error;
  }
}

export async function resolveAccountService(accountNumber: string, bankCode: string) {
  const gateway = getPaymentGateway();
  if (typeof gateway.resolveAccount === "function") return gateway.resolveAccount(accountNumber, bankCode);
  throw new Error("Account resolution not supported by current gateway");
}

export async function listBanksService() {
  const gateway = getPaymentGateway();
  return gateway.listBanks("NG");
}

export async function updateSubaccountStatusByCodeService(subaccountCode: string, status: string) {
  try {
    const psCount = await withRetry(
      () => prisma.settlementAccount.count({ where: { paystackSubaccountCode: subaccountCode } }),
      "finance.updateSubaccountStatusByCode.count",
    );
    await withRetry(
      () =>
        psCount > 0
          ? prisma.settlementAccount.updateMany({ where: { paystackSubaccountCode: subaccountCode }, data: { paystackSubaccountStatus: status } })
          : prisma.settlementAccount.updateMany({ where: { flwSubaccountCode: subaccountCode }, data: { flwAccountStatus: status } }),
      "finance.updateSubaccountStatusByCode.update",
    );
  } catch (error: unknown) {
    console.error("[FinanceService] Update Subaccount Status Error:", (error as { message?: string }).message);
  }
}

export async function removeSubaccountService(accountId: string, userContext?: BankActorContext) {
  const account = await withRetry(
    () =>
      prisma.settlementAccount.findUnique({
        where: { id: accountId },
        select: {
          id: true, schoolId: true, bankName: true, bankCode: true,
          accountNumber: true, accountName: true, paystackSubaccountCode: true, flwSubaccountCode: true,
        },
      }),
    "finance.removeSubaccountService.findAccount",
  );
  if (!account) throw new Error("Account information not found");

  await withRetry(
    () =>
      prisma.bankAccountAudit.create({
        data: {
          schoolId: account.schoolId,
          settlementAccountId: account.id,
          action: "ACCOUNT_DELETED",
          bankName: account.bankName,
          bankCode: account.bankCode,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          userId: userContext?.userId,
          userName: userContext?.userName,
          userEmail: userContext?.userEmail,
          userRole: userContext?.userRole,
          details: { subaccountCode: account.flwSubaccountCode || account.paystackSubaccountCode },
        },
      }),
    "finance.removeSubaccountService.createAudit",
  );

  try {
    const gateway = getPaymentGateway();
    const codeOrId = account.flwSubaccountCode || account.paystackSubaccountCode;
    if (codeOrId) await gateway.syncSubaccount(codeOrId).catch(() => {});
  } catch { /* Non-fatal */ }

  await withRetry(() => prisma.settlementAccount.delete({ where: { id: accountId } }), "finance.removeSubaccountService.delete");
  return { success: true, message: "Settlement account removed" };
}

export async function syncSubaccountStatusService(schoolId: string, accountId?: string, userContext?: BankActorContext) {
  const gateway = getPaymentGateway();
  const isFlw = gateway.name === "FLUTTERWAVE";

  const acc =
    (accountId && typeof accountId === "string"
      ? await withRetry(() => prisma.settlementAccount.findUnique({ where: { id: accountId } }), "finance.syncSubaccountStatus.byId")
      : null) ||
    (await withRetry(() => prisma.settlementAccount.findFirst({ where: { schoolId, isDefault: true } }), "finance.syncSubaccountStatus.default")) ||
    (await withRetry(() => prisma.settlementAccount.findFirst({ where: { schoolId }, orderBy: { createdAt: "desc" } }), "finance.syncSubaccountStatus.latest"));

  const subaccountCodeOrId = isFlw ? acc?.flwSubaccountId || acc?.flwSubaccountCode || null : acc?.paystackSubaccountCode || null;
  if (!subaccountCodeOrId || !acc) {
    throw new Error("No linked gateway subaccount found to sync. Please set up a school bank account first.");
  }

  const synced = await gateway.syncSubaccount(subaccountCodeOrId);
  await withRetry(
    () =>
      prisma.settlementAccount.update({
        where: { id: acc.id },
        data: isFlw ? { flwAccountStatus: synced.status } : { paystackSubaccountStatus: synced.status },
      }),
    "finance.syncSubaccountStatus.update",
  );

  await prisma.bankAccountAudit
    .create({
      data: {
        schoolId,
        settlementAccountId: acc.id,
        action: "ACCOUNT_SYNCED",
        accountNumber: acc.accountNumber,
        bankName: acc.bankName,
        accountName: acc.accountName,
        userId: userContext?.userId,
        userName: userContext?.userName || "School Administrator",
        userEmail: userContext?.userEmail,
        userRole: userContext?.userRole || "ADMIN",
        gateway: gateway.name,
        details: { syncedStatus: synced.status, subaccountCodeOrId },
      },
    })
    .catch(() => {});

  return { success: true, status: synced.status, message: `Account status synced: ${synced.status}` };
}
