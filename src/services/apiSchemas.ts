import { z } from "zod";

export const PaymentSchema = z.object({
  payment_id: z.string(),
  phone_number: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["pending", "completed", "failed"]),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  counterparty_phone: z.string().optional(),
  trade_id: z.string().optional(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const PaymentEnvelopeSchema = z.object({
  data: PaymentSchema,
});

export const PaymentsEnvelopeSchema = z.object({
  payments: z.array(PaymentSchema).optional().default([]),
});

export const TradeStatusSchema = z.object({
  status: z.boolean(),
  price: z.number().nullable(),
});

export const TradeHistoryItemSchema = z.object({
  type: z.enum(["trade", "catalog"]),
  transaction_id: z.string().optional(),
  catalog_id: z.string().optional(),
  offer_ids: z.array(z.string()).optional(),
  status: z.string(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
});

export const TradeHistoryEnvelopeSchema = z.object({
  items: z.array(TradeHistoryItemSchema).optional().default([]),
});

export const EnsureUserResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
  })
  .passthrough();

