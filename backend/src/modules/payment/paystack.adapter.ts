import crypto from 'crypto';
import axios from 'axios';
import type {
  PaymentGateway,
  InitializeParams,
  InitializeResult,
  VerifyResult,
  WebhookVerifyResult,
  SubaccountCreateParams,
  SubaccountCreateResult,
  BankListEntry,
  SubaccountSyncResult,
  AccountResolveResult,
} from './gateway.interface';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

const psApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * PaystackAdapter — wraps the existing Paystack logic into the PaymentGateway interface.
 * This preserves all existing behavior while allowing the factory to swap gateways.
 */
export class PaystackAdapter implements PaymentGateway {
  readonly name = 'PAYSTACK' as const;

  // ─────────────────────────────────────────────────────────────
  // Initialize
  // ─────────────────────────────────────────────────────────────
  async initialize(params: InitializeParams): Promise<InitializeResult> {
    const subaccountCode = (params.metadata?.['subaccountCode'] || params.metadata?.['subaccountId']) as string | undefined;
    const redirectUrl =
      (params.metadata?.['redirect_url'] as string) ||
      (params.metadata?.['callbackUrl'] as string) ||
      undefined;

    const payload: Record<string, unknown> = {
      email: params.email,
      amount: Math.round(params.amount * 100), // Paystack works in kobo
      ...(redirectUrl ? { callback_url: redirectUrl } : {}),
      ...(subaccountCode ? { subaccount: subaccountCode } : {}),
      metadata: {
        ...params.metadata,
        paymentType: params.metadata?.['paymentType'] ?? params.plan,
        custom_fields: [
          { display_name: 'User ID', variable_name: 'user_id', value: params.userId },
          { display_name: 'User Role', variable_name: 'user_role', value: params.metadata?.['user_role'] ?? '' },
          { display_name: 'Plan', variable_name: 'plan', value: params.plan },
          { display_name: 'Payment Type', variable_name: 'paymentType', value: String(params.metadata?.['paymentType'] ?? params.plan) },
          { display_name: 'School ID', variable_name: 'schoolId', value: String(params.metadata?.['schoolId'] ?? '') },
          { display_name: 'Student ID', variable_name: 'studentId', value: String(params.metadata?.['studentId'] ?? '') },
          { display_name: 'Session ID', variable_name: 'sessionId', value: String(params.metadata?.['sessionId'] ?? '') },
          { display_name: 'Term', variable_name: 'term', value: String(params.metadata?.['term'] ?? '') },
          { display_name: 'Billing', variable_name: 'billing', value: params.metadata?.['billing'] ?? 'monthly' },
          { display_name: 'Months', variable_name: 'months', value: String(params.metadata?.['months'] ?? 1) },
          { display_name: 'Is Upgrade', variable_name: 'is_upgrade', value: String(params.metadata?.['is_upgrade'] ?? false) },
          { display_name: 'Reset Cycle', variable_name: 'reset_cycle', value: String(params.metadata?.['reset_cycle'] ?? false) },
          { display_name: 'Is Trial', variable_name: 'is_trial', value: String(params.metadata?.['is_trial'] ?? false) },
          { display_name: 'Coupon ID', variable_name: 'coupon_id', value: String(params.metadata?.['couponId'] ?? '') },
          { display_name: 'Coupon Code', variable_name: 'coupon_code', value: String(params.metadata?.['couponCode'] ?? '') },
          { display_name: 'Coupon Discount', variable_name: 'coupon_discount', value: String(params.metadata?.['couponDiscount'] ?? 0) },
        ],
      },
    };

    if (params.metadata?.['planCode']) {
      payload['plan'] = params.metadata['planCode'];
    }

    try {
      const response = await psApi.post<{
        data: { authorization_url: string; access_code: string; reference: string };
      }>('/transaction/initialize', payload);

      return {
        checkoutUrl: response.data.data.authorization_url,
        txRef: response.data.data.reference,
        accessCode: response.data.data.access_code,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Paystack initialization failed');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Verify
  // ─────────────────────────────────────────────────────────────
  async verify(reference: string): Promise<VerifyResult> {
    try {
      const response = await psApi.get<{
        data: {
          status: string;
          amount: number;
          reference: string;
          channel: string;
          authorization?: { authorization_code?: string };
          metadata?: {
            custom_fields?: Array<{ variable_name: string; value: string }>;
          };
        };
      }>(`/transaction/verify/${reference}`);

      const tx = response.data.data;

      if (tx.status !== 'success') {
        throw new Error(`Payment not successful. Status: ${tx.status}`);
      }

      const fields = tx.metadata?.custom_fields ?? [];
      const getField = (key: string) =>
        fields.find((f) => f.variable_name === key)?.value;
      const rawMeta = (tx.metadata ?? {}) as Record<string, unknown>;

      const rawMonths = getField('months') || String(rawMeta['months'] ?? '1');
      const parsedMonths = parseInt(rawMonths, 10);
      const rawCouponDiscount = getField('coupon_discount') || String(rawMeta['couponDiscount'] ?? '0');
      const parsedCouponDiscount = parseFloat(rawCouponDiscount);

      return {
        success: true,
        amountNaira: tx.amount / 100,
        reference: tx.reference,
        gatewayRef: tx.reference,
        channel: tx.channel,
        authorizationToken: tx.authorization?.authorization_code,
        meta: {
          ...rawMeta,
          userId: getField('user_id') || (rawMeta['userId'] as string | undefined),
          userRole: getField('user_role') || (rawMeta['userRole'] as string | undefined) || (rawMeta['user_role'] as string | undefined),
          plan: getField('plan') || (rawMeta['plan'] as string | undefined),
          paymentType: getField('paymentType') || (rawMeta['paymentType'] as string | undefined),
          schoolId: getField('schoolId') || (rawMeta['schoolId'] as string | undefined),
          studentId: getField('studentId') || (rawMeta['studentId'] as string | undefined),
          sessionId: getField('sessionId') || (rawMeta['sessionId'] as string | undefined),
          term: getField('term') || (rawMeta['term'] as string | undefined),
          billing: getField('billing') || (rawMeta['billing'] as string | undefined),
          months: Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 1,
          isUpgrade: getField('is_upgrade') === 'true' || rawMeta['is_upgrade'] === true || rawMeta['isUpgrade'] === true,
          resetCycle: getField('reset_cycle') === 'true' || rawMeta['reset_cycle'] === true || rawMeta['resetCycle'] === true,
          isTrial: getField('is_trial') === 'true' || rawMeta['is_trial'] === true || rawMeta['isTrial'] === true,
          couponId: getField('coupon_id') || (rawMeta['couponId'] as string | undefined) || undefined,
          couponCode: getField('coupon_code') || (rawMeta['couponCode'] as string | undefined) || undefined,
          couponDiscount: Number.isFinite(parsedCouponDiscount) ? parsedCouponDiscount : 0,
        },
        gateway: 'PAYSTACK',
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Paystack verification failed');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Webhook Handler
  // ─────────────────────────────────────────────────────────────
  async handleWebhook(
    rawBody: string,
    headers: Record<string, string>
  ): Promise<WebhookVerifyResult> {
    const signature = headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return { valid: false, event: 'unknown', data: {} };
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { valid: false, event: 'unknown', data: {} };
    }

    const eventType = payload['event'] as string;
    const data = (payload['data'] ?? {}) as Record<string, unknown>;

    if (eventType === 'charge.success') {
      const meta = data['metadata'] as Record<string, unknown> | undefined;
      const customFields = (meta?.['custom_fields'] ?? []) as Array<{
        variable_name: string;
        value: string;
      }>;
      const getField = (key: string) =>
        customFields.find((f) => f.variable_name === key)?.value;

      const customer = data['customer'] as Record<string, string> | undefined;

      return {
        valid: true,
        event: 'charge.success',
        data: {
          reference: data['reference'] as string,
          gatewayRef: data['reference'] as string,
          amountNaira: ((data['amount'] as number) ?? 0) / 100,
          channel: data['channel'] as string,
          authorizationToken: (data['authorization'] as Record<string, string> | undefined)?.[
            'authorization_code'
          ],
          email: customer?.['email'],
          paymentType: (meta?.['paymentType'] as string | undefined) || getField('paymentType'),
          meta: Object.fromEntries(
            customFields.map((f) => [f.variable_name, f.value])
          ),
        },
      };
    }

    if (eventType === 'charge.failed' || eventType === 'charge.declined') {
      const meta = data['metadata'] as Record<string, unknown> | undefined;
      const customFields = (meta?.['custom_fields'] ?? []) as Array<{
        variable_name: string;
        value: string;
      }>;
      const customer = data['customer'] as Record<string, string> | undefined;

      return {
        valid: true,
        event: 'charge.failed',
        data: {
          reference: data['reference'] as string,
          gatewayRef: data['reference'] as string,
          amountNaira: ((data['amount'] as number) ?? 0) / 100,
          channel: data['channel'] as string,
          email: customer?.['email'],
          gateway_response: data['gateway_response'] as string,
          message: data['message'] as string,
          meta: Object.fromEntries(
            customFields.map((f) => [f.variable_name, f.value])
          ),
        },
      };
    }

    if (eventType === 'subaccount.update') {
      return {
        valid: true,
        event: 'subaccount.update',
        data: {
          subaccountCode: data['subaccount_code'] as string,
          status: data['status'] as string,
        },
      };
    }

    return { valid: true, event: 'unknown', data: {} };
  }

  // ─────────────────────────────────────────────────────────────
  // Subaccount
  // ─────────────────────────────────────────────────────────────
  async createSubaccount(params: SubaccountCreateParams): Promise<SubaccountCreateResult> {
    try {
      const response = await psApi.post<{
        data: {
          subaccount_code: string;
          status?: string;
          active?: boolean;
        };
      }>('/subaccount', {
        business_name: params.businessName,
        settlement_bank: params.bankCode,
        account_number: params.accountNumber,
        percentage_charge: params.splitPercentage,
      });

      const sub = response.data.data;
      const status = sub.status ?? (sub.active ? 'active' : 'pending');

      return {
        id: sub.subaccount_code, // Paystack uses the code as the stable identifier
        code: sub.subaccount_code,
        status,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Paystack subaccount creation failed');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // List Banks
  // ─────────────────────────────────────────────────────────────
  async listBanks(_country = 'NG'): Promise<BankListEntry[]> {
    try {
      const response = await psApi.get<{
        data: Array<{ name: string; code: string }>;
      }>('/bank?country=nigeria');

      return response.data.data.map((b) => ({ name: b.name, code: b.code }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch banks from Paystack');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Sync Subaccount Status
  // ─────────────────────────────────────────────────────────────
  async syncSubaccount(subaccountCode: string): Promise<SubaccountSyncResult> {
    try {
      const response = await psApi.get<{
        data: {
          status?: string;
          active?: boolean;
        };
      }>(`/subaccount/${subaccountCode}`);

      const subaccData = response.data.data;
      const status = subaccData.status ?? (subaccData.active ? 'active' : 'pending');
      return { status, active: status === 'active' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Failed to sync subaccount from Paystack');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Resolve Account (Paystack account lookup)
  // ─────────────────────────────────────────────────────────────
  async resolveAccount(accountNumber: string, bankCode: string): Promise<AccountResolveResult> {
    try {
      const response = await psApi.get<{
        status: boolean;
        message: string;
        data: {
          account_number: string;
          account_name: string;
        };
      }>(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);

      if (!response.data.status || !response.data.data?.account_name) {
        throw new Error(response.data.message || 'Could not resolve account details');
      }

      return {
        accountNumber: response.data.data.account_number,
        accountName: response.data.data.account_name,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Failed to resolve bank account');
    }
  }
}
