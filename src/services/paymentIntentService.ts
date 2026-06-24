// FE client for the atria-payments microservice.
//
// Flow this service supports:
//   createPaymentOrder(txnId)  → Razorpay {order_id, key_id, amount, currency}
//   verifyPayment(razorpay)    → flips PENDING→PAID, drives BAP confirm inline
//   getPaymentStatus(txnId)    → polled by the FE while the BAP confirm settles
//   waitForBapConfirmation     → blocks until status==CONFIRMED_TO_BAP or times out
//
// The buyer's Firebase ID token is forwarded on every request — atria-payments
// uses it for both buyer identity (uid/phone) and for forwarding to BAP when
// it needs the canonical priced order. There is no client-side Razorpay key in
// env: the key_id comes back from create-order, so a test↔live switch is one
// env var on the server.

import { createApiClient, requestWithRetry, resolveRequiredEnv } from "@/services/apiClient";
import { getAuthHeaders } from "@/services/authHeaders";

const PAYMENT_URL = resolveRequiredEnv(
  import.meta.env.VITE_PAYMENT_URL,
  "http://localhost:8003",
  "VITE_PAYMENT_URL",
);

const paymentClient = createApiClient(PAYMENT_URL);

export type PaymentStatus =
  | "NONE"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CONFIRMED_TO_BAP";

export interface CreatePaymentOrderResponse {
  order_id: string;
  amount: number; // paise
  currency: string;
  key_id: string;
  status: PaymentStatus;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  status: PaymentStatus;
  order_id: string;
  txn_id: string;
  bap_confirmed: boolean;
  bap_error: string | null;
}

export interface PaymentStatusResponse {
  order_id: string | null;
  txn_id: string;
  status: PaymentStatus;
  bap_confirmed: boolean;
}

const requireAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) {
    // Calling payment endpoints without an authenticated user is a
    // programming bug — the route should never have been reachable.
    throw new Error("Not authenticated");
  }
  return headers;
};

export const paymentIntentService = {
  async createPaymentOrder(txnId: string): Promise<CreatePaymentOrderResponse> {
    const headers = await requireAuthHeaders();
    return requestWithRetry<CreatePaymentOrderResponse>(
      paymentClient,
      {
        url: "/api/payment/create-order",
        method: "POST",
        data: { txn_id: txnId },
        headers: { ...headers, "Content-Type": "application/json" },
      },
      // create-order is non-idempotent on the wire (Razorpay charges a new
      // order id every call). We rely on server-side dedupe via
      // get_active_for_txn, but a single client-driven retry is still safe.
      { timeoutMs: 15000, retries: 1 },
    );
  },

  async verifyPayment(body: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const headers = await requireAuthHeaders();
    return requestWithRetry<VerifyPaymentResponse>(
      paymentClient,
      {
        url: "/api/payment/verify",
        method: "POST",
        data: body,
        headers: { ...headers, "Content-Type": "application/json" },
      },
      // Verify is idempotent server-side (transactional PENDING→PAID), so
      // retrying on a transient network blip is safe.
      { timeoutMs: 15000, retries: 2 },
    );
  },

  async getPaymentStatus(txnId: string): Promise<PaymentStatusResponse> {
    const headers = await requireAuthHeaders();
    return requestWithRetry<PaymentStatusResponse>(
      paymentClient,
      {
        url: `/api/payment/status?transaction_id=${encodeURIComponent(txnId)}`,
        method: "GET",
        headers,
      },
      { timeoutMs: 5000, retries: 1 },
    );
  },

  async waitForBapConfirmation(
    txnId: string,
    options?: { maxAttempts?: number; delayMs?: number },
  ): Promise<PaymentStatusResponse> {
    // Hit when verify returned bap_confirmed=false (BAP confirm-paid raced
    // with a transient failure). We poll the payments service until the
    // record is marked CONFIRMED_TO_BAP — or give up so the UI can surface
    // "finalising is taking longer than expected" instead of hanging forever.
    const maxAttempts = options?.maxAttempts ?? 15;
    const delayMs = options?.delayMs ?? 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const status = await this.getPaymentStatus(txnId);
      if (status.status === "CONFIRMED_TO_BAP") return status;
      if (status.status === "FAILED") {
        throw new Error("Payment failed");
      }
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error("Order is taking longer than expected to finalise");
  },
};
