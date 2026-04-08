import axios from "axios";
import { auth } from "@/lib/firebase";
import { convertTradesToSchema } from "@/utils/tradeSchemaConverter";
import type { PlannedTrade } from "@/hooks/usePublishedTrades";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3002";

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// Submit planned trades to the backend for Beckn catalog publish
export const submitTrades = async (trades: PlannedTrade[]): Promise<void> => {
  const tradeSubmissions = convertTradesToSchema(trades);
  const headers = await getAuthHeaders();
  await axios.post(
    `${BACKEND_URL}/api/create`,
    { trades: tradeSubmissions },
    { headers }
  );
};

// Poll trade confirmation status by transaction_id
export const getTradeStatus = async (
  transactionId: string
): Promise<{ status: boolean; price: number | null }> => {
  const { data } = await axios.get(`${BACKEND_URL}/api/trade-status`, {
    params: { transaction_id: transactionId },
  });
  return data;
};