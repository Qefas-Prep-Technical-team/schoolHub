/**
 * PaymentGateway — shared contract for all payment providers.
 *
 * Both PaystackAdapter and FlutterwaveAdapter implement this interface.
 * The rest of the application only ever sees this type, never a concrete adapter.
 */

export interface InitializeParams {
  userId: string;
  email: string;
  amount: number;       // Naira (not kobo)
  plan: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeResult {
  /** URL the user should be redirected to for checkout */
  checkoutUrl: string;
  /** Our idempotency key / reference to track this transaction */
  txRef: string;
  /** Gateway-specific access code (Paystack) or null (Flutterwave) */
  accessCode?: string;
}

export interface VerifyResult {
  success: boolean;
  /** Amount actually charged, in Naira */
  amountNaira: number;
  /** Gateway transaction reference (used for idempotency) */
  reference: string;
  /** Raw gateway transaction ID (flw_ref for FW, reference for PS) */
  gatewayRef: string;
  /** Payment channel: "card" | "bank_transfer" | "ussd" etc. */
  channel: string;
  /** Authorization token for card auto-renewal (Paystack only) */
  authorizationToken?: string;
  /** Metadata embedded at initialization time */
  meta: {
    userId?: string;
    userRole?: string;
    plan?: string;
    billing?: string;
    isUpgrade?: boolean;
    is_upgrade?: boolean;
    resetCycle?: boolean;
    reset_cycle?: boolean;
    isTrial?: boolean;
    months?: number;
  };
  /** Which gateway processed this transaction */
  gateway: 'PAYSTACK' | 'FLUTTERWAVE';
}

export interface WebhookVerifyResult {
  /** Whether the webhook signature is valid */
  valid: boolean;
  /** Normalized event type */
  event: 'charge.success' | 'charge.failed' | 'subscription.cancelled' | 'subaccount.update' | 'unknown';
  data: {
    reference?: string;
    gatewayRef?: string;
    amountNaira?: number;
    channel?: string;
    authorizationToken?: string;
    email?: string;
    subaccountCode?: string;
    status?: string;
    paymentType?: string;
    meta?: Record<string, string>;
    gateway_response?: string;
    message?: string;
  };
}

export interface SubaccountCreateParams {
  schoolId: string;
  businessName: string;
  bankCode: string;
  accountNumber: string;
  splitPercentage: number;
}

export interface SubaccountCreateResult {
  id: string;
  code: string;
  status: string;
}

export interface BankListEntry {
  name: string;
  code: string;
}

export interface SubaccountSyncResult {
  /** Raw status string from the gateway */
  status: string;
  /** True if the subaccount is active and can receive splits */
  active: boolean;
}

export interface PaymentGateway {
  /**
   * Create a checkout session and return a redirect URL.
   */
  initialize(params: InitializeParams): Promise<InitializeResult>;

  /**
   * Verify a completed payment server-side. NEVER trust client-supplied status.
   * @param reference - The tx_ref (FW) or reference (PS) returned from initialize / callback.
   * @param flwTransactionId - For Flutterwave only: the numeric transaction_id from the callback.
   */
  verify(reference: string, flwTransactionId?: string): Promise<VerifyResult>;

  /**
   * Parse and validate an inbound webhook payload.
   * Returns a normalized WebhookVerifyResult regardless of provider format.
   */
  handleWebhook(
    rawBody: string,
    headers: Record<string, string>
  ): Promise<WebhookVerifyResult>;

  /**
   * Create a settlement subaccount for a school.
   * Used when a new school sets up their bank details.
   */
  createSubaccount(params: SubaccountCreateParams): Promise<SubaccountCreateResult>;

  /**
   * Return the list of supported banks for the country.
   * @param country - ISO country code (default: "NG")
   */
  listBanks(country?: string): Promise<BankListEntry[]>;

  /**
   * Sync / fetch a subaccount's current status from the gateway.
   * @param subaccountCodeOrId - The gateway-issued subaccount code or ID.
   */
  syncSubaccount(subaccountCodeOrId: string): Promise<SubaccountSyncResult>;

  /** Which gateway this adapter represents */
  readonly name: 'PAYSTACK' | 'FLUTTERWAVE';
}
