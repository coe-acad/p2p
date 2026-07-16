import { z } from "zod";

export const TradeStatusSchema = z.object({
  status: z.boolean(),
  price: z.number().nullable(),
  state: z.string().nullable().optional(),
});

export const TradeHistoryItemSchema = z.object({
  type: z.enum(["trade", "catalog"]),
  transaction_id: z.string().optional(),
  catalog_id: z.string().optional(),
  offer_ids: z.array(z.string()).optional(),
  status: z.string(),
  seller_name: z.string().optional(),
  buyer_phone: z.string().optional(),
  bpp_id: z.string().optional(),
  bpp_uri: z.string().optional(),
  quantity: z.number().optional(),
  price_per_unit: z.number().optional(),
  total_amount: z.number().optional(),
  delivery_start: z.string().optional().nullable(),
  delivery_end: z.string().optional().nullable(),
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
