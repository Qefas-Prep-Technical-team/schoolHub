import type { PaymentGateway } from './gateway.interface';
import { FlutterwaveAdapter } from './flutterwave.adapter';
import { PaystackAdapter } from './paystack.adapter';

/**
 * Gateway Factory
 *
 * Returns the active PaymentGateway based on the PAYMENT_GATEWAY env var.
 * Defaults to Flutterwave.
 *
 * Usage:
 *   import { getPaymentGateway } from './gateway.factory';
 *   const gateway = getPaymentGateway();
 *   const result = await gateway.initialize(params);
 *
 * Switching gateways:
 *   PAYMENT_GATEWAY=flutterwave   → FlutterwaveAdapter (default)
 *   PAYMENT_GATEWAY=paystack      → PaystackAdapter (fallback / backward compat)
 */
export function getPaymentGateway(): PaymentGateway {
  const selection = (process.env.PAYMENT_GATEWAY ?? 'flutterwave').toLowerCase();

  if (selection === 'paystack') {
    return new PaystackAdapter();
  }

  return new FlutterwaveAdapter();
}
