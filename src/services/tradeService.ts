import { getAuthHeaders } from "@/services/authHeaders";
import { convertTradesToSchema } from "@/utils/tradeSchemaConverter";
import type { PlannedTrade } from "@/hooks/usePublishedTrades";
import { createApiClient, requestWithRetry, toApiError, type RequestOptions } from "@/services/apiClient";
import { TradeStatusSchema } from "@/services/apiSchemas";

const BPP_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";
const BAP_URL = import.meta.env.VITE_BAP_URL ?? "http://localhost:8001";
const bppClient = createApiClient(BPP_URL);
const bapClient = createApiClient(BAP_URL);

// Submit planned trades to the backend for Beckn catalog publish
export const submitTrades = async (trades: PlannedTrade[], options?: RequestOptions): Promise<void> => {
  try {
    const tradeSubmissions = convertTradesToSchema(trades);
    const headers = await getAuthHeaders();
    await requestWithRetry(
      bppClient,
      { url: "/api/create", method: "POST", data: { trades: tradeSubmissions }, headers },
      { ...options, retries: 1 }
    );
  } catch (error) {
    throw toApiError(error, "Failed to submit trades");
  }
};

// Poll trade confirmation status by transaction_id
export const getTradeStatus = async (
  transactionId: string,
  options?: RequestOptions
): Promise<{ status: boolean; price: number | null; state?: string | null }> => {
  try {
    const data = await requestWithRetry<{ status: boolean; price: number | null; state?: string | null }>(
      bppClient,
      { url: "/api/trade-status", method: "GET", params: { transaction_id: transactionId } },
      options
    );
    return TradeStatusSchema.parse(data);
  } catch (error) {
    throw toApiError(error, "Failed to fetch trade status");
  }
};

export interface TradeHistoryItem {
  type: "trade" | "catalog";
  transaction_id?: string;
  catalog_id?: string;
  offer_ids?: string[];
  status: string;
  seller_name?: string;
  buyer_phone?: string;
  bpp_id?: string;
  bpp_uri?: string;
  quantity?: number;
  price_per_unit?: number;
  total_amount?: number;
  delivery_start?: string;
  delivery_end?: string;
  updated_at?: string;
  created_at?: string;
}

const normalizeTradeHistoryItem = (item: any): TradeHistoryItem => ({
  type: item?.type === "catalog" ? "catalog" : "trade",
  transaction_id: typeof item?.transaction_id === "string" ? item.transaction_id : undefined,
  catalog_id: typeof item?.catalog_id === "string" ? item.catalog_id : undefined,
  offer_ids: Array.isArray(item?.offer_ids) ? item.offer_ids.filter((value: unknown) => typeof value === "string") : undefined,
  status: typeof item?.status === "string" ? item.status : "UNKNOWN",
  seller_name: typeof item?.seller_name === "string" ? item.seller_name : undefined,
  buyer_phone: typeof item?.buyer_phone === "string" ? item.buyer_phone : undefined,
  bpp_id: typeof item?.bpp_id === "string" ? item.bpp_id : undefined,
  bpp_uri: typeof item?.bpp_uri === "string" ? item.bpp_uri : undefined,
  quantity: typeof item?.quantity === "number" ? item.quantity : undefined,
  price_per_unit: typeof item?.price_per_unit === "number" ? item.price_per_unit : undefined,
  total_amount: typeof item?.total_amount === "number" ? item.total_amount : undefined,
  delivery_start: typeof item?.delivery_start === "string" ? item.delivery_start : undefined,
  delivery_end: typeof item?.delivery_end === "string" ? item.delivery_end : undefined,
  updated_at: typeof item?.updated_at === "string" ? item.updated_at : undefined,
  created_at: typeof item?.created_at === "string" ? item.created_at : undefined,
});

export const getTradeHistory = async (
  role: "buyer" | "seller" = "seller",
  options?: RequestOptions
): Promise<TradeHistoryItem[]> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<{ items?: unknown[] }>(
      role === "buyer" ? bapClient : bppClient,
      { url: "/api/trades", method: "GET", headers },
      options
    );
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.map(normalizeTradeHistoryItem);
  } catch (error) {
    throw toApiError(error, "Failed to fetch trade history");
  }
};
