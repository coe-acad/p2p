import { useEffect, useRef, useState } from "react";
import { useTradeHistory } from "@/hooks/useTradeHistory";
import { formatRupees, getBuyerRefunds, type Refund } from "@/services/settlementService";
import { ZapOff, Clock, ReceiptText, Sun, Undo2, Zap } from "lucide-react";

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
      return "bg-accent/10 text-accent";
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

/** Statuses where energy is still moving — shown with a blinking charge bolt. */
const IN_PROGRESS = new Set(["INITIATED", "SELECTED", "CONFIRMING"]);

const TradeSkeleton = () => (
  <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
    <div className="h-9 w-9 shrink-0 rounded-[11px] bg-foreground/10 animate-pulse" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-3.5 w-32 rounded bg-foreground/10 animate-pulse" />
      <div className="h-2.5 w-44 rounded bg-foreground/10 animate-pulse" />
    </div>
    <div className="space-y-2">
      <div className="h-3.5 w-16 rounded bg-foreground/10 animate-pulse" />
      <div className="h-4 w-20 rounded-full bg-foreground/10 animate-pulse" />
    </div>
  </div>
);

export const TradeHistory = ({ role, buyerPhone }: TradeHistoryProps) => {
  const { trades, loading, error } = useTradeHistory(role, buyerPhone);
  // Default to CONFIRMED so the page opens with completed purchases (what
  // users most often come here for). If the first load returns no confirmed
  // trades, fall back to "show all" so a user with only pending orders isn't
  // greeted by an empty view. The ref guards against clobbering a manual
  // filter selection on later refreshes.
  const [selectedStatus, setSelectedStatus] = useState<string | null>("CONFIRMED");
  const filterInitializedRef = useRef(false);
  // Refunds keyed by transaction — enrichment only. A lookup failure must
  // never break the history view, so errors are swallowed silently.
  const [refundsByTxn, setRefundsByTxn] = useState<Record<string, Refund>>({});

  useEffect(() => {
    if (role !== "buyer") return;
    let cancelled = false;
    getBuyerRefunds()
      .then((refunds) => {
        if (cancelled) return;
        const byTxn: Record<string, Refund> = {};
        for (const refund of refunds) {
          if (refund.txn_id) byTxn[refund.txn_id] = refund;
        }
        setRefundsByTxn(byTxn);
      })
      .catch(() => {
        /* enrichment only — history renders fine without refund chips */
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  useEffect(() => {
    if (filterInitializedRef.current || loading || trades.length === 0) return;
    filterInitializedRef.current = true;
    const hasConfirmed = trades.some((t) => t.backendStatus === "CONFIRMED");
    if (!hasConfirmed) setSelectedStatus(null);
  }, [loading, trades]);

  const statuses = Array.from(new Set(trades.map((trade) => trade.backendStatus))).filter(Boolean);
  const filteredTrades = selectedStatus
    ? trades.filter((trade) => trade.backendStatus === selectedStatus)
    : trades;

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <TradeSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4 text-sm">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><ZapOff className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">Couldn't load purchase history</p>
          <p className="mt-1 break-words text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Group the visible trades by delivery day ("Today", "Yesterday", "24 Sep").
  const groups: Array<{ day: string; items: typeof filteredTrades }> = [];
  for (const trade of filteredTrades) {
    const day = dayLabel(trade.deliveryStart || trade.deliveryEnd);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(trade);
    else groups.push({ day, items: [trade] });
  }

  // Month summary over the trades already loaded (no extra requests).
  const now = new Date();
  const monthTrades = trades.filter((t) => {
    const iso = t.deliveryStart || t.deliveryEnd;
    if (!iso) return false;
    const d = new Date(iso);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthKwh = monthTrades.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const monthAmount = monthTrades.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  return (
    <div className="space-y-4">
      {monthTrades.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_6px_18px_-12px_rgba(20,24,100,0.25)]">
          <div className="flex items-center justify-between">
            <p className="kicker-zap text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {now.toLocaleDateString("en-IN", { month: "long" })}
            </p>
            <span className="text-xs text-muted-foreground nums">
              {monthTrades.length} {monthTrades.length === 1 ? "order" : "orders"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 border-t border-border pt-3">
            <div>
              <p className="text-lg font-medium tracking-tight text-foreground nums">{monthKwh.toFixed(2)}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                kWh {role === "buyer" ? "bought" : "sold"}
              </p>
            </div>
            <div className="border-l border-border pl-3">
              <p className="text-lg font-medium tracking-tight text-foreground nums">
                ₹{monthAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {role === "buyer" ? "Spent" : "Trade value"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Status filter chips */}
      {statuses.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill
            label="All"
            isActive={selectedStatus === null}
            count={trades.length}
            onClick={() => setSelectedStatus(null)}
          />
          {statuses.map((status) => (
            <FilterPill
              key={status}
              label={status}
              isActive={selectedStatus === status}
              count={trades.filter((t) => t.backendStatus === status).length}
              onClick={() => setSelectedStatus(status)}
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
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.day}>
              <p className="px-1 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {group.day}
              </p>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {group.items.map((trade) => {
                  const tradeId = trade.transactionId || trade.catalogId;
                  const refund =
                    role === "buyer" && trade.transactionId
                      ? refundsByTxn[trade.transactionId]
                      : undefined;
                  const deliveryWindow = formatDeliveryWindow(trade.deliveryStart, trade.deliveryEnd);

                  return (
                    <div key={tradeId} className="flex items-start gap-3 px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-primary/10 text-primary">
                        <Sun className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{trade.title || "Trade"}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground nums">
                          {trade.quantity ? `${trade.quantity.toFixed(2)} kWh` : trade.subtitle}
                          {deliveryWindow && (
                            <>
                              {" · "}
                              <Clock className="inline h-3 w-3 align-[-2px]" /> {deliveryWindow}
                            </>
                          )}
                        </p>

                        {/* Refund chip — real money state from the payments system */}
                        {refund && (
                          <span
                            className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider nums ${
                              refund.status === "PROCESSED"
                                ? "bg-accent/10 text-accent"
                                : refund.status === "FAILED"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Undo2 className="h-2.5 w-2.5" />
                            {refund.status === "PROCESSED"
                              ? `Refunded ${formatRupees(refund.amount_paise)}`
                              : refund.status === "FAILED"
                                ? "Refund failed — contact support"
                                : `Refund of ${formatRupees(refund.amount_paise)} processing`}
                          </span>
                        )}

                        {tradeId && (
                          <p className="mt-1 break-all text-[10px] text-muted-foreground/80 nums">ID {tradeId}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="text-sm font-semibold text-foreground nums">₹{trade.totalAmount.toFixed(2)}</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider nums ${statusTone(trade.backendStatus)}`}
                        >
                          {IN_PROGRESS.has(trade.backendStatus) && (
                            <Zap aria-hidden strokeWidth={0} className="charge-blink h-2.5 w-2.5 fill-current" />
                          )}
                          {trade.backendStatus || "PENDING"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** "Today" / "Yesterday" / "24 Sep" for grouping; "Undated" when missing. */
const dayLabel = (iso?: string): string => {
  if (!iso) return "Undated";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
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

/** Filter chip — primary when active (matches the marketplace chips). */
const FilterPill = ({
  label,
  isActive,
  count,
  onClick,
}: {
  label: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
  >
    {label}
    <span
      className={`nums rounded-full px-1.5 py-0.5 text-[10px] ${
        isActive ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-muted-foreground"
      }`}
    >
      {count}
    </span>
  </button>
);
