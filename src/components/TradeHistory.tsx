import { useState } from "react";
import { useTradeHistory, type Trade } from "@/hooks/useTradeHistory";
import { QuoteOrderModal } from "@/components/QuoteOrderModal";
import { orderService } from "@/services/orderService";
import type { EnergyListing } from "@/hooks/useDiscoverListings";
import { Zap } from "lucide-react";

interface TradeHistoryProps {
  buyerPhone: string;
}

export const TradeHistory = ({ buyerPhone }: TradeHistoryProps) => {
  const { trades, loading, error, refresh } = useTradeHistory(buyerPhone);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'selecting' | 'selected' | 'quoting' | 'quoted' | 'confirming' | 'confirmed'>('idle');

  const statuses = ["CONFIRMED", "COMPLETED", "PENDING", "CANCELLED"];
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

  const tradeToListing = (trade: Trade | null): EnergyListing | null => {
    if (!trade) return null;
    return {
      id: trade.transactionId,
      catalog_id: trade.catalogId,
      offer_id: trade.offerId,
      bpp_id: trade.bppId,
      bpp_uri: trade.bppUri,
      seller_id: trade.sellerName,
      seller_name: trade.sellerName,
      offer_name: `${trade.quantity} kWh offer`,
      quantity_available: trade.quantity,
      quantity_unit: 'kWh',
      price_per_unit: trade.pricePerUnit,
      currency: 'INR',
      total_price: trade.totalAmount,
      source_type: 'SOLAR',
      pricing_model: 'PER_KWH',
      delivery_start: trade.deliveryStart || new Date().toISOString(),
      delivery_end: trade.deliveryEnd || trade.deliveryStart || new Date().toISOString(),
      validity_start: trade.deliveryStart || new Date().toISOString(),
      validity_end: trade.deliveryEnd || trade.deliveryStart || new Date().toISOString(),
      discovered_at: trade.confirmedAt.toISOString(),
    };
  };

  const openPendingTrade = async (trade: Trade) => {
    if (trade.status !== "PENDING") {
      return;
    }

    setSelectedTrade(trade);
    setQuoteError(null);
    setQuote(null);
    setQuoteStatus(trade.backendStatus === "INITIATED" ? "quoting" : "selected");

    if (trade.backendStatus === "INITIATED") {
      try {
        const state = await orderService.getOrderState(trade.transactionId);
        if (state.order_state === "INITIATED" && state.order) {
          setQuote(state.order);
          setQuoteStatus("quoted");
          return;
        }
        setQuoteStatus("selected");
      } catch (err) {
        setQuoteError(err instanceof Error ? err.message : "Failed to load quotation");
        setQuoteStatus("selected");
      }
    }
  };

  const handleGetQuote = async () => {
    if (!selectedTrade) return;

    setQuoteStatus("quoting");
    setQuoteError(null);

    try {
      await orderService.init(selectedTrade.transactionId, {
        offer_id: selectedTrade.offerId,
        bpp_id: selectedTrade.bppId || 'atria-p2p-trading-bpp',
        bpp_uri: selectedTrade.bppUri || 'https://atria-bpp.atriauniversity.ai',
        quantity: selectedTrade.quantity,
        price_per_unit: selectedTrade.pricePerUnit,
        seller_name: selectedTrade.sellerName,
        delivery_start: selectedTrade.deliveryStart || new Date().toISOString(),
        delivery_end: selectedTrade.deliveryEnd || selectedTrade.deliveryStart || new Date().toISOString(),
      });
      const state = await orderService.waitForQuotation(selectedTrade.transactionId);
      setQuote(state.order);
      setQuoteStatus("quoted");
      await refresh();
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "Failed to get quotation");
      setQuoteStatus("selected");
    }
  };

  const handleConfirm = async () => {
    if (!selectedTrade || !quote) return;

    setQuoteStatus("confirming");
    setQuoteError(null);

    try {
      await orderService.confirm(
        selectedTrade.transactionId,
        {
          offer_id: selectedTrade.offerId,
          bpp_id: selectedTrade.bppId || 'atria-p2p-trading-bpp',
          bpp_uri: selectedTrade.bppUri || 'https://atria-bpp.atriauniversity.ai',
          quantity: selectedTrade.quantity,
          price_per_unit: selectedTrade.pricePerUnit,
          seller_name: selectedTrade.sellerName,
          delivery_start: selectedTrade.deliveryStart || new Date().toISOString(),
          delivery_end: selectedTrade.deliveryEnd || selectedTrade.deliveryStart || new Date().toISOString(),
        },
        quote
      );
      await orderService.waitForConfirmation(selectedTrade.transactionId);
      setQuoteStatus("confirmed");
      await refresh();
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "Failed to confirm order");
      setQuoteStatus("quoted");
    }
  };

  const closeQuoteModal = () => {
    setSelectedTrade(null);
    setQuote(null);
    setQuoteError(null);
    setQuoteStatus("idle");
  };

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
              className={`bg-white border border-gray-200 rounded-lg p-4 transition-shadow ${
                trade.status === "PENDING" ? "cursor-pointer hover:shadow-md" : ""
              }`}
              onClick={() => void openPendingTrade(trade)}
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
                        : trade.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-700"
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

      <QuoteOrderModal
        isOpen={Boolean(selectedTrade)}
        listing={tradeToListing(selectedTrade)}
        quote={quote}
        error={quoteError}
        status={quoteStatus}
        onGetQuote={handleGetQuote}
        onConfirm={handleConfirm}
        onBack={closeQuoteModal}
      />
    </div>
  );
};
