import axios from "axios";
import { auth } from "@/lib/firebase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

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

export const createPayment = async (request: CreatePaymentRequest): Promise<Payment> => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(
    `${BACKEND_URL}/api/payment`,
    request,
    { headers }
  );
  return data.data;
};

export const getPayments = async (): Promise<Payment[]> => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(
    `${BACKEND_URL}/api/payments`,
    { headers }
  );
  return data.payments || [];
};

export const getPayment = async (paymentId: string): Promise<Payment> => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(
    `${BACKEND_URL}/api/payment/${paymentId}`,
    { headers }
  );
  return data.data;
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: "pending" | "completed" | "failed",
  razorpayPaymentId?: string
): Promise<Payment> => {
  const headers = await getAuthHeaders();
  const { data } = await axios.put(
    `${BACKEND_URL}/api/payment/${paymentId}`,
    { status, razorpay_payment_id: razorpayPaymentId },
    { headers }
  );
  return data.data;
};
