import { useState } from "react";
import { useTradeHistory, type Trade } from "@/hooks/useTradeHistory";
import { QuoteOrderModal } from "@/components/QuoteOrderModal";
import { orderService } from "@/services/orderService";
import type { EnergyListing } from "@/hooks/useDiscoverListings";
import { AlertCircle, Clock, ReceiptText, Zap } from "lucide-react";

interface TradeHistoryProps {
  role: "buyer" | "seller";
  buyerPhone?: string;
}

/**
 * Status → token-based color. Three semantic groups:
 *   - green (positive / done)
 *   - blue  (in-progress / informational)
 *   - red   (problem / cancelled)
 *   - muted (unknown / default)
 */
const statusTone = (status: string): string => {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return "bg-accent/12 text-accent";
    case "PUBLISHED":
    case "INITIATED":
    case "SELECTED":
    case "CONFIRMING":
      return "bg-primary/10 text-primary";
    case "CANCELLED":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-secondary text-muted-foreground";
  }
};

/** Stripe colour per persona — buyer = green, seller = blue. */
const stripeBgFor = (role: "buyer" | "seller") =>
  role === "seller" ? "bg-primary/12" : "bg-accent/15";

const TradeSkeleton = ({ role = "buyer" }: { role?: "buyer" | "seller" }) => (
  <div className="overflow-hidden rounded-xl border border-primary/12 bg-card shadow-[0_6px_18px_-12px_rgba(36,40,128,0.18)]">
    <div className={`${stripeBgFor(role)} px-4 py-3`}>
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-32 rounded bg-foreground/10 animate-pulse" />
        <div className="h-5 w-20 rounded-full bg-foreground/10 animate-pulse" />
      </div>
      <div className="mt-2 h-2.5 w-24 rounded bg-foreground/10 animate-pulse" />
    </div>
    <div className="space-y-3 px-4 py-4">
      <div className="h-7 w-28 rounded bg-foreground/10 animate-pulse" />
      <div className="h-3 w-44 rounded bg-foreground/10 animate-pulse" />
      <div className="h-3 w-36 rounded bg-foreground/10 animate-pulse" />
    </div>
  </div>
);

export const TradeHistory = ({ role, buyerPhone }: TradeHistoryProps) => {
  const { trades, loading, error, refresh } = useTradeHistory(role, buyerPhone);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'selecting' | 'selected' | 'quoting' | 'quoted' | 'confirming' | 'confirmed'>('idle');

  const statuses = Array.from(new Set(trades.map((trade) => trade.backendStatus))).filter(Boolean);
  const filteredTrades = selectedStatus
    ? trades.filter((trade) => trade.backendStatus === selectedStatus)
    : trades;

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <TradeSkeleton key={i} role={role} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4 text-sm">
        <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">Couldn't load purchase history</p>
          <p className="mt-1 break-words text-muted-foreground">{error}</p>
        </div>
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
    if (role !== "buyer" || trade.status !== "PENDING" || trade.type !== "trade") {
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
        bpp_uri: selectedTrade.bppUri || 'https://stage-atria-bpp.atriauniversity.ai',
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
          bpp_uri: selectedTrade.bppUri || 'https://stage-atria-bpp.atriauniversity.ai',
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
      {/* Status filter — pill row, persona green for active */}
      {statuses.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill
            label="All"
            isActive={selectedStatus === null}
            count={trades.length}
            onClick={() => setSelectedStatus(null)}
            role={role}
          />
          {statuses.map((status) => (
            <FilterPill
              key={status}
              label={status}
              isActive={selectedStatus === status}
              count={trades.filter((t) => t.backendStatus === status).length}
              onClick={() => setSelectedStatus(status)}
              role={role}
            />
          ))}
        </div>
      )}

      {/* Trades list */}
      {filteredTrades.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <ReceiptText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">No trades yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedStatus ? "Nothing matches this filter." : "Your purchase history will show up here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrades.map((trade) => {
            const isPendingClickable =
              role === "buyer" && trade.status === "PENDING" && trade.type === "trade";
            const tradeId = trade.transactionId || trade.catalogId;
            const idShort = tradeId ? tradeId.slice(0, 18) + (tradeId.length > 18 ? "…" : "") : "";

            return (
              <button
                key={tradeId}
                type="button"
                onClick={() => void openPendingTrade(trade)}
                disabled={!isPendingClickable}
                className="group block w-full overflow-hidden rounded-xl border border-primary/12 bg-card text-left
                           shadow-[0_6px_18px_-12px_rgba(36,40,128,0.18)]
                           transition-all duration-200 ease-out
                           enabled:hover:-translate-y-0.5 enabled:hover:border-primary/40
                           enabled:hover:shadow-[0_12px_28px_-18px_rgba(36,40,128,0.28)]
                           disabled:cursor-default
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {/* Persona-coloured stripe — green for buyer, blue for seller */}
                <div className={`${stripeBgFor(role)} px-4 py-3`}>
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {trade.title || "Trade"}
                      </p>
                      {trade.subtitle && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {trade.subtitle}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider nums ${statusTone(trade.backendStatus)}`}
                    >
                      {trade.backendStatus || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Body — amount hero + meta */}
                <div className="space-y-2 px-4 py-3">
                  <p className="text-2xl font-semibold tracking-tight text-foreground nums">
                    ₹{trade.totalAmount.toFixed(2)}
                  </p>

                  {(trade.deliveryStart || trade.deliveryEnd) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <span className="nums">{formatDeliveryWindow(trade.deliveryStart, trade.deliveryEnd)}</span>
                    </div>
                  )}

                  {idShort && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-medium uppercase tracking-wider">ID</span>
                      <span className="truncate nums">{idShort}</span>
                    </div>
                  )}

                  {isPendingClickable && (
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary">
                      Tap to resume →
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <QuoteOrderModal
        isOpen={role === "buyer" && Boolean(selectedTrade)}
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

/**
 * IST-formatted "10:00 AM – 11:00 AM, 11 Jun" style window. Returns "" if both inputs missing.
 */
const formatDeliveryWindow = (start?: string, end?: string): string => {
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  if (start && end) return `${fmtTime(start)} – ${fmtTime(end)}, ${fmtDate(start)}`;
  if (start) return `From ${fmtTime(start)}, ${fmtDate(start)}`;
  if (end) return `Until ${fmtTime(end)}, ${fmtDate(end)}`;
  return "";
};

/**
 * Filter chip — buyer = green active, seller = blue active.
 */
const FilterPill = ({
  label,
  isActive,
  count,
  onClick,
  role,
}: {
  label: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
  role: "buyer" | "seller";
}) => {
  const activeTone =
    role === "seller"
      ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-6px_rgba(36,40,128,0.45)]"
      : "border-accent bg-accent text-accent-foreground shadow-[0_4px_12px_-6px_rgba(31,138,82,0.45)]";
  const restHover =
    role === "seller"
      ? "hover:border-primary/40 hover:text-foreground"
      : "hover:border-accent/40 hover:text-foreground";
  return (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? activeTone
                    : `border-border bg-card text-muted-foreground ${restHover} hover:-translate-y-0.5`
                }`}
  >
    {label}
    <span
      className={`nums rounded-full px-1.5 py-0.5 text-[10px] ${
        isActive ? "bg-accent-foreground/15 text-accent-foreground" : "bg-secondary text-muted-foreground"
      }`}
    >
      {count}
    </span>
  </button>
  );
};
