import { useState, useEffect } from "react";
import { getTradeHistory } from "@/services/tradeService";

export interface Trade {
  transactionId: string;
  buyerPhone: string;
  sellerName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  offerId: string;
  catalogId: string;
  bppId?: string;
  bppUri?: string;
  deliveryStart?: string;
  deliveryEnd?: string;
  backendStatus: string;
  status: "CONFIRMED" | "COMPLETED" | "PENDING" | "CANCELLED";
  confirmedAt: Date;
}

export const useTradeHistory = (buyerPhone: string) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    try {
      const items = await getTradeHistory("buyer");
      const fetchedTrades = items
        .filter((item) => item.type === "trade")
        .map((item) => {
        return {
          transactionId: item.transaction_id || "",
          buyerPhone,
          sellerName: item.seller_name || "Unknown Seller",
          quantity: item.quantity || 0,
          pricePerUnit: item.price_per_unit || 0,
          totalAmount: item.total_amount || 0,
          offerId: item.offer_ids?.[0] || "",
          catalogId: item.catalog_id || "",
          bppId: item.bpp_id || undefined,
          bppUri: item.bpp_uri || undefined,
          deliveryStart: item.delivery_start || undefined,
          deliveryEnd: item.delivery_end || undefined,
          backendStatus: item.status,
          status: item.status === "COMPLETED" ? "COMPLETED" : item.status === "CONFIRMED" ? "CONFIRMED" : "PENDING",
          confirmedAt: new Date(item.updated_at || item.created_at || Date.now()),
        } as Trade;
      });

      setTrades(fetchedTrades.sort((a, b) => b.confirmedAt.getTime() - a.confirmedAt.getTime()));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch trades:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!buyerPhone) {
      setLoading(false);
      return;
    }

    fetchTrades();
  }, [buyerPhone]);

  return { trades, loading, error, refresh: fetchTrades };
};
