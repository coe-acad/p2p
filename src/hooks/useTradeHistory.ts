import { useState, useEffect } from "react";
import { getTradeHistory } from "@/services/tradeService";

export interface Trade {
  type: "trade" | "catalog";
  transactionId: string;
  buyerPhone: string;
  sellerName: string;
  title: string;
  subtitle: string;
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

export const useTradeHistory = (
  role: "buyer" | "seller",
  buyerPhone?: string
) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    try {
      const items = await getTradeHistory(role);
      const fetchedTrades = items
        .map((item) => {
        const rawStatus = item.status || "UNKNOWN";
        const normalizedStatus =
          rawStatus === "COMPLETED"
            ? "COMPLETED"
            : rawStatus === "CONFIRMED"
              ? "CONFIRMED"
              : rawStatus === "CANCELLED"
                ? "CANCELLED"
                : "PENDING";

        const title =
          role === "seller"
            ? item.type === "catalog"
              ? "Published Energy Catalog"
              : rawStatus === "CONFIRMED"
                ? "Accepted Energy Offer"
                : rawStatus === "COMPLETED"
                  ? "Completed Energy Trade"
                  : "Trade Request"
            : item.seller_name || "Unknown Seller";

        const subtitle =
          item.quantity && item.price_per_unit
            ? `${item.quantity} kWh @ ₹${item.price_per_unit.toFixed(2)}/kWh`
            : item.type === "catalog"
              ? (item.catalog_id || "Catalog entry")
              : (item.transaction_id || "Trade entry");

        return {
          type: item.type,
          transactionId: item.transaction_id || "",
          buyerPhone: buyerPhone || item.buyer_phone || "",
          sellerName: item.seller_name || "Unknown Seller",
          title,
          subtitle,
          quantity: item.quantity || 0,
          pricePerUnit: item.price_per_unit || 0,
          totalAmount: item.total_amount || 0,
          offerId: item.offer_ids?.[0] || "",
          catalogId: item.catalog_id || "",
          bppId: item.bpp_id || undefined,
          bppUri: item.bpp_uri || undefined,
          deliveryStart: item.delivery_start || undefined,
          deliveryEnd: item.delivery_end || undefined,
          backendStatus: rawStatus,
          status: normalizedStatus,
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
    if (role === "buyer" && !buyerPhone) {
      setLoading(false);
      return;
    }

    fetchTrades();
  }, [role, buyerPhone]);

  return { trades, loading, error, refresh: fetchTrades };
};
