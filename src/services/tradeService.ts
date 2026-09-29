import { getAuthHeaders } from "@/services/authHeaders";
import { createApiClient, requestWithRetry, toApiError, type RequestOptions, BACKEND_URL, BAP_URL } from "@/services/apiClient";

const bppClient = createApiClient(BACKEND_URL);
const bapClient = createApiClient(BAP_URL);

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

const normalizeTradeHistoryItem = (raw: unknown): TradeHistoryItem => {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    type: item.type === "catalog" ? "catalog" : "trade",
    transaction_id: typeof item.transaction_id === "string" ? item.transaction_id : undefined,
    catalog_id: typeof item.catalog_id === "string" ? item.catalog_id : undefined,
    offer_ids: Array.isArray(item.offer_ids) ? item.offer_ids.filter((value): value is string => typeof value === "string") : undefined,
    status: typeof item.status === "string" ? item.status : "UNKNOWN",
    seller_name: typeof item.seller_name === "string" ? item.seller_name : undefined,
    buyer_phone: typeof item.buyer_phone === "string" ? item.buyer_phone : undefined,
    bpp_id: typeof item.bpp_id === "string" ? item.bpp_id : undefined,
    bpp_uri: typeof item.bpp_uri === "string" ? item.bpp_uri : undefined,
    quantity: typeof item.quantity === "number" ? item.quantity : undefined,
    price_per_unit: typeof item.price_per_unit === "number" ? item.price_per_unit : undefined,
    total_amount: typeof item.total_amount === "number" ? item.total_amount : undefined,
    delivery_start: typeof item.delivery_start === "string" ? item.delivery_start : undefined,
    delivery_end: typeof item.delivery_end === "string" ? item.delivery_end : undefined,
    updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
    created_at: typeof item.created_at === "string" ? item.created_at : undefined,
  };
};

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
