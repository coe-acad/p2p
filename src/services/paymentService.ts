import { getAuthHeaders } from "@/services/authHeaders";
import { createApiClient, requestWithRetry, resolveRequiredEnv, toApiError, type RequestOptions } from "@/services/apiClient";
import { PaymentEnvelopeSchema, PaymentsEnvelopeSchema } from "@/services/apiSchemas";

const BPP_URL = resolveRequiredEnv(import.meta.env.VITE_BACKEND_URL, "http://localhost:3002", "VITE_BACKEND_URL");
const BAP_URL = resolveRequiredEnv(import.meta.env.VITE_BAP_URL, "http://localhost:8001", "VITE_BAP_URL");
const bppClient = createApiClient(BPP_URL);
const bapClient = createApiClient(BAP_URL);

export interface Payment {
  payment_id: string;
  phone_number: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  counterparty_phone?: string;
  trade_id?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  razorpay_order_id?: string;
  counterparty_phone?: string;
  trade_id?: string;
  description?: string;
}

export const createPayment = async (request: CreatePaymentRequest, options?: RequestOptions): Promise<Payment> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<{ data: Payment }>(
      bppClient,
      { url: "/api/payment", method: "POST", data: request, headers },
      { ...options, retries: 1 }
    );
    return PaymentEnvelopeSchema.parse(data).data;
  } catch (error) {
    throw toApiError(error, "Failed to create payment");
  }
};

export const getPayments = async (
  role: "buyer" | "seller" = "seller",
  options?: RequestOptions
): Promise<Payment[]> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<{ payments?: Payment[] }>(
      role === "buyer" ? bapClient : bppClient,
      { url: "/api/payments", method: "GET", headers },
      options
    );
    return PaymentsEnvelopeSchema.parse(data).payments;
  } catch (error) {
    throw toApiError(error, "Failed to fetch payments");
  }
};

export const getPayment = async (paymentId: string, options?: RequestOptions): Promise<Payment> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<{ data: Payment }>(
      bppClient,
      { url: `/api/payment/${paymentId}`, method: "GET", headers },
      options
    );
    return PaymentEnvelopeSchema.parse(data).data;
  } catch (error) {
    throw toApiError(error, "Failed to fetch payment details");
  }
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: "pending" | "completed" | "failed",
  razorpayPaymentId?: string,
  options?: RequestOptions
): Promise<Payment> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<{ data: Payment }>(
      bppClient,
      {
        url: `/api/payment/${paymentId}`,
        method: "PUT",
        data: { status, razorpay_payment_id: razorpayPaymentId },
        headers,
      },
      { ...options, retries: 1 }
    );
    return PaymentEnvelopeSchema.parse(data).data;
  } catch (error) {
    throw toApiError(error, "Failed to update payment status");
  }
};
