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
    const payload: Record<string, unknown> = {
      email: params.email,
      amount: params.amount * 100, // Paystack works in kobo
      metadata: {
        custom_fields: [
          { display_name: 'User ID',   variable_name: 'user_id',   value: params.userId },
          { display_name: 'User Role', variable_name: 'user_role', value: params.metadata?.['user_role'] ?? '' },
          { display_name: 'Plan',      variable_name: 'plan',      value: params.plan },
          { display_name: 'Billing',   variable_name: 'billing',   value: params.metadata?.['billing'] ?? 'monthly' },
          { display_name: 'Is Upgrade',variable_name: 'is_upgrade',value: String(params.metadata?.['is_upgrade'] ?? false) },
          { display_name: 'Is Trial',  variable_name: 'is_trial',  value: String(params.metadata?.['is_trial'] ?? false) },
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

      return {
        success: true,
        amountNaira: tx.amount / 100,
        reference: tx.reference,
        gatewayRef: tx.reference,
        channel: tx.channel,
        authorizationToken: tx.authorization?.authorization_code,
        meta: {
          userId: getField('user_id'),
          userRole: getField('user_role'),
          plan: getField('plan'),
          billing: getField('billing'),
          isUpgrade: getField('is_upgrade') === 'true',
          isTrial: getField('is_trial') === 'true',
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
          paymentType: meta?.['paymentType'] as string | undefined,
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
}
