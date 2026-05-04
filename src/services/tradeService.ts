import { getAuthHeaders } from "@/services/authHeaders";
import { convertTradesToSchema } from "@/utils/tradeSchemaConverter";
import type { PlannedTrade } from "@/hooks/usePublishedTrades";
import { createApiClient, requestWithRetry, toApiError, type RequestOptions } from "@/services/apiClient";
import { TradeHistoryEnvelopeSchema, TradeHistoryItemSchema, TradeStatusSchema } from "@/services/apiSchemas";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";
const backendClient = createApiClient(BACKEND_URL);

// Submit planned trades to the backend for Beckn catalog publish
export const submitTrades = async (trades: PlannedTrade[], options?: RequestOptions): Promise<void> => {
  try {
    const tradeSubmissions = convertTradesToSchema(trades);
    const headers = await getAuthHeaders();
    await requestWithRetry(
      backendClient,
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
): Promise<{ status: boolean; price: number | null }> => {
  try {
    const data = await requestWithRetry<{ status: boolean; price: number | null }>(
      backendClient,
      { url: "/api/trade-status", method: "GET", params: { transaction_id: transactionId } },
      options
    );
    return TradeStatusSchema.parse(data);
  } catch (error) {
    throw toApiError(error, "Failed to fetch trade status");
  }
};

export type TradeHistoryItem = ReturnType<typeof TradeHistoryItemSchema.parse>;

export const getTradeHistory = async (options?: RequestOptions): Promise<TradeHistoryItem[]> => {
  try {
    const headers = await getAuthHeaders();
    const data = await requestWithRetry<{ items?: TradeHistoryItem[] }>(
      backendClient,
      { url: "/api/trades", method: "GET", headers },
      options
    );
    return TradeHistoryEnvelopeSchema.parse(data).items;
  } catch (error) {
    throw toApiError(error, "Failed to fetch trade history");
  }
};
