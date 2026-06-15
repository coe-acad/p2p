import { useQuery } from "@tanstack/react-query";
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

export const tradeHistoryQueryKey = (
  role: "buyer" | "seller",
  buyerPhone?: string,
) => ["tradeHistory", role, buyerPhone ?? null] as const;

const mapTrades = (
  items: Awaited<ReturnType<typeof getTradeHistory>>,
  role: "buyer" | "seller",
  buyerPhone?: string,
): Trade[] => {
  return items
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
    })
    .sort((a, b) => b.confirmedAt.getTime() - a.confirmedAt.getTime());
};

export const useTradeHistory = (
  role: "buyer" | "seller",
  buyerPhone?: string,
) => {
  const enabled = role === "seller" || !!buyerPhone;

  const query = useQuery({
    queryKey: tradeHistoryQueryKey(role, buyerPhone),
    enabled,
    staleTime: 30 * 1000,
    queryFn: async (): Promise<Trade[]> => {
      const items = await getTradeHistory(role);
      return mapTrades(items, role, buyerPhone);
    },
  });

  return {
    trades: query.data ?? [],
    loading: enabled ? query.isLoading : false,
    error: query.error ? (query.error as Error).message : null,
    refresh: async () => {
      await query.refetch();
    },
  };
};
