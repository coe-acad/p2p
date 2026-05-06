import { useState } from "react";
import { useTradeHistory, type Trade } from "@/hooks/useTradeHistory";
import { Zap } from "lucide-react";

interface TradeHistoryProps {
  buyerPhone: string;
}

export const TradeHistory = ({ buyerPhone }: TradeHistoryProps) => {
  const { trades, loading, error } = useTradeHistory(buyerPhone);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const statuses = ["CONFIRMED", "PENDING", "CANCELLED"];
  const filteredTrades = selectedStatus
    ? trades.filter((trade) => trade.status === selectedStatus)
    : trades;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin">
          <Zap size={24} className="text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        Failed to load trades: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === null
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All Trades
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Trades List */}
      {filteredTrades.length === 0 ? (
        <div className="text-center py-8">
          <Zap size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-muted-foreground">No trades found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrades.map((trade) => (
            <div
              key={trade.transactionId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{trade.sellerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {trade.quantity} kWh @ ₹{trade.pricePerUnit.toFixed(2)}/kWh
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(trade.confirmedAt).toLocaleDateString()} at{" "}
                    {new Date(trade.confirmedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    ₹{trade.totalAmount.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                      trade.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : trade.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {trade.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">ID: {trade.transactionId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
