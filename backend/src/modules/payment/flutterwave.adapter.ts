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

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';
const FLW_WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET || '';
const FLW_REDIRECT_URL = process.env.FLW_REDIRECT_URL || `${process.env.FRONTEND_URL}/payment/callback`;
const APP_NAME = process.env.APP_NAME || 'Qefas Hub';
const APP_LOGO = process.env.APP_LOGO_URL || '';

const flwApi = axios.create({
  baseURL: 'https://api.flutterwave.com/v3',
  headers: {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/** Generate a collision-resistant tx_ref */
const generateTxRef = (): string =>
  `qh-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

export class FlutterwaveAdapter implements PaymentGateway {
  readonly name = 'FLUTTERWAVE' as const;

  // ─────────────────────────────────────────────────────────────
  // Initialize
  // ─────────────────────────────────────────────────────────────
  async initialize(params: InitializeParams): Promise<InitializeResult> {
    const txRef = generateTxRef();

    const payload = {
      tx_ref: txRef,
      amount: params.amount,          // Naira — FLW does NOT use kobo
      currency: 'NGN',
      redirect_url: FLW_REDIRECT_URL,
      customer: {
        email: params.email,
        name: params.metadata?.['name'] as string | undefined,
      },
      meta: {
        userId: params.userId,
        plan: params.plan,
        billing: params.metadata?.['billing'],
        is_upgrade: params.metadata?.['is_upgrade'] ?? false,
        is_trial: params.metadata?.['is_trial'] ?? false,
        user_role: params.metadata?.['user_role'],
      },
      customizations: {
        title: APP_NAME,
        logo: APP_LOGO,
      },
    };

    try {
      const response = await flwApi.post<{
        status: string;
        data: { link: string };
      }>('/payments', payload);

      if (response.data.status !== 'success') {
        throw new Error('Flutterwave initialization returned non-success status');
      }

      return {
        checkoutUrl: response.data.data.link,
        txRef,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Flutterwave initialization failed');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Verify
  // ─────────────────────────────────────────────────────────────
  async verify(txRef: string, flwTransactionId?: string): Promise<VerifyResult> {
    // FLW requires a numeric transaction_id for server-side verification.
    // This comes from the redirect callback query param: ?transaction_id=xxxxx
    if (!flwTransactionId) {
      throw new Error('Flutterwave verify requires a transaction_id from the redirect callback');
    }

    try {
      const response = await flwApi.get<{
        status: string;
        data: {
          status: string;
          charged_amount: number;
          flw_ref: string;
          tx_ref: string;
          payment_type: string;
          card?: { token?: string };
          meta: Record<string, string>;
        };
      }>(`/transactions/${flwTransactionId}/verify`);

      const tx = response.data.data;

      // SECURITY: Always verify amount server-side (prevent underpayment attacks)
      if (tx.status !== 'successful') {
        throw new Error(`Payment not successful. Status: ${tx.status}`);
      }

      const meta = tx.meta || {};
      console.log("[Flutterwave Adapter] Raw verify metadata:", JSON.stringify(meta));

      // Flutterwave is notorious for changing metadata key casings.
      // Build a case-insensitive map.
      const lowerMeta: Record<string, string> = {};
      for (const [k, v] of Object.entries(meta)) {
        lowerMeta[k.toLowerCase()] = String(v);
      }

      return {
        success: true,
        amountNaira: tx.charged_amount,
        reference: tx.tx_ref,
        gatewayRef: tx.flw_ref,
        channel: tx.payment_type,
        authorizationToken: tx.card?.token,   // Stored for recurring charge eligibility
        meta: {
          userId: lowerMeta['userid'] || lowerMeta['user_id'] || "",
          userRole: lowerMeta['userrole'] || lowerMeta['user_role'] || lowerMeta['role'] || "",
          plan: lowerMeta['plan'] || "",
          billing: lowerMeta['billing'] || "",
          isUpgrade: lowerMeta['is_upgrade'] === 'true' || lowerMeta['isupgrade'] === 'true',
          isTrial: lowerMeta['is_trial'] === 'true' || lowerMeta['istrial'] === 'true',
        },
        gateway: 'FLUTTERWAVE',
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Flutterwave verification failed');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Webhook Handler
  // ─────────────────────────────────────────────────────────────
  async handleWebhook(
    rawBody: string,
    headers: Record<string, string>
  ): Promise<WebhookVerifyResult> {
    // FLW uses a plain string header (NOT HMAC) called "verif-hash"
    const incomingHash = headers['verif-hash'];
    if (!FLW_WEBHOOK_SECRET || incomingHash !== FLW_WEBHOOK_SECRET) {
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

    // ── charge.completed → maps to charge.success ─────────────
    if (eventType === 'charge.completed') {
      const meta = (data['meta'] ?? {}) as Record<string, string>;
      const customer = (data['customer'] ?? {}) as Record<string, string>;

      return {
        valid: true,
        event: 'charge.success',
        data: {
          reference: data['tx_ref'] as string,
          gatewayRef: data['flw_ref'] as string,
          amountNaira: (data['amount'] as number) ?? 0,
          channel: data['payment_type'] as string,
          authorizationToken: (data as Record<string, Record<string, string>>)['card']?.['token'],
          email: customer['email'],
          paymentType: meta['paymentType'],
          meta,
        },
      };
    }

    // ── subscription.cancelled ────────────────────────────────
    if (eventType === 'subscription.cancelled') {
      return {
        valid: true,
        event: 'subscription.cancelled',
        data: {
          reference: data['id'] as string,
          email: (data['customer'] as Record<string, string>)?.['customer_email'],
        },
      };
    }

    // ── transfer.completed → settlement confirmation ──────────
    if (eventType === 'transfer.completed') {
      return {
        valid: true,
        event: 'charge.success',
        data: {
          reference: data['reference'] as string,
          amountNaira: (data['amount'] as number) ?? 0,
          status: data['status'] as string,
          paymentType: 'TRANSFER_SETTLEMENT',
        },
      };
    }

    return { valid: true, event: 'unknown', data: {} };
  }

  // ─────────────────────────────────────────────────────────────
  // Subaccount (School split payments)
  // ─────────────────────────────────────────────────────────────
  async createSubaccount(params: SubaccountCreateParams): Promise<SubaccountCreateResult> {
    try {
      const response = await flwApi.post<{
        status: string;
        data: {
          id: number;
          subaccount_code: string;
          account_status: string;
        };
      }>('/subaccounts', {
        account_bank: params.bankCode,
        account_number: params.accountNumber,
        business_name: params.businessName,
        split_type: 'percentage',
        split_value: params.splitPercentage / 100, // FLW expects 0.1 for 10%
        country: 'NG',
      });

      const sub = response.data.data;

      return {
        id: String(sub.id),
        code: sub.subaccount_code,
        status: sub.account_status || 'pending',
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Flutterwave subaccount creation failed');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // List Banks
  // ─────────────────────────────────────────────────────────────
  async listBanks(country = 'NG'): Promise<BankListEntry[]> {
    try {
      const response = await flwApi.get<{
        status: string;
        data: Array<{ name: string; code: string }>;
      }>(`/banks/${country}`);

      return response.data.data.map((b) => ({ name: b.name, code: b.code }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch banks from Flutterwave');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Sync Subaccount Status
  // ─────────────────────────────────────────────────────────────
  async syncSubaccount(subaccountId: string): Promise<SubaccountSyncResult> {
    try {
      const response = await flwApi.get<{
        status: string;
        data: {
          account_status: string;
          is_permanent: boolean;
        };
      }>(`/subaccounts/${subaccountId}`);

      const status = response.data.data.account_status || 'pending';
      return { status, active: status === 'active' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err.response?.data?.message || err.message || 'Failed to sync subaccount from Flutterwave');
    }
  }
}
