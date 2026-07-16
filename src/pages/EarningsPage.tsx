import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  History,
  Landmark,
  MinusCircle,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import {
  formatRupees,
  getPayoutDetails,
  getSellerSettlements,
  type PayoutAccount,
  type Settlement,
} from "@/services/settlementService";
import type { LucideIcon } from "lucide-react";

/**
 * Seller earnings — the money truth. Every row is a settlement computed by
 * the payments service from a finished trade: what was actually paid out (or
 * why nothing was). Unlike trade values elsewhere in the app, these amounts
 * are real money movements, not projections.
 */

type ChipKind = "paid" | "in-flight" | "none" | "attention";

const chipFor = (s: Settlement): { kind: ChipKind; label: string } => {
  const payout = (s.payout_status || "").toUpperCase();
  const overall = (s.status || "").toUpperCase();

  if (overall === "NEEDS_REVIEW" || overall === "PARTIAL_STUCK") {
    return { kind: "attention", label: "Under review" };
  }
  if (payout === "PROCESSED") return { kind: "paid", label: "Paid out" };
  if (payout === "REJECTED" || payout === "REVERSED") {
    return { kind: "attention", label: "Under review" };
  }
  if (
    payout === "PENDING" || payout === "QUEUED" ||
    payout === "PROCESSING" || payout === "INITIATED"
  ) {
    return { kind: "in-flight", label: "On the way" };
  }
  // SKIPPED payout, or no payout leg at all (failed / fully refunded trade).
  return { kind: "none", label: "No payout" };
};

const chipVisual = (kind: ChipKind): { Icon: LucideIcon; tileBg: string; tileText: string } => {
  switch (kind) {
    case "paid":
      return { Icon: CheckCircle, tileBg: "bg-accent/12", tileText: "text-accent" };
    case "in-flight":
      return { Icon: Clock, tileBg: "bg-primary/10", tileText: "text-primary" };
    case "attention":
      return { Icon: AlertCircle, tileBg: "bg-destructive/10", tileText: "text-destructive" };
    default:
      return { Icon: MinusCircle, tileBg: "bg-secondary", tileText: "text-muted-foreground" };
  }
};

const RowSkeleton = () => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
    <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-pulse" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
      <div className="h-2.5 w-28 rounded bg-muted/60 animate-pulse" />
    </div>
    <div className="h-5 w-20 rounded bg-muted animate-pulse" />
  </div>
);

const EarningsPage = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [rows, payoutAccount] = await Promise.all([
          getSellerSettlements(),
          getPayoutDetails().catch(() => null),
        ]);
        setSettlements(rows);
        setAccount(payoutAccount);
        setError(null);
      } catch (err) {
        console.error("Failed to load settlements:", err);
        setError("Failed to load your earnings");
        setSettlements([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const paidOut = settlements.filter(
    (s) => (s.payout_status || "").toUpperCase() === "PROCESSED"
  );
  const totalPaidPaise = paidOut.reduce(
    (sum, s) => sum + (s.payout_amount_paise ?? 0), 0
  );
  const needsPayoutMethod = !loading && !account;

  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={5}>
          {/* Heading — blue icon tile for seller persona */}
          <div className="flex items-center gap-3 fade-in opacity-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Earnings
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Settlement payouts for your completed trades.
              </p>
            </div>
          </div>

          {/* Payout method nudge — settlements can't pay out without one */}
          {needsPayoutMethod && (
            <Link
              to="/payout-method"
              className="group flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4
                         transition-all duration-200 ease-out hover:border-primary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Landmark className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Add a payout method</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Payouts stay on hold until we know where to send your money.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          )}

          {/* Summary — real money received, not projections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Total paid out
              </p>
              {paidOut.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent nums">
                  <CheckCircle className="h-2.5 w-2.5" />
                  {paidOut.length} payout{paidOut.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]">
              <p className="text-4xl font-semibold tracking-tight text-accent nums sm:text-5xl">
                {formatRupees(totalPaidPaise)}
              </p>
              <span aria-hidden className="mt-2 block h-[2px] w-8 rounded-full bg-primary" />
              <p className="mt-2 text-xs text-muted-foreground">
                Sent to your payout method after trades complete.
              </p>
            </div>
          </div>

          {/* Error banner */}
          {error && !loading && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Couldn't load earnings</p>
                <p className="mt-1 break-words text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {/* Settlements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Settlements
              </p>
              {!loading && settlements.length > 0 && (
                <p className="text-xs text-muted-foreground nums">{settlements.length} total</p>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            ) : settlements.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <History className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">No settlements yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When a trade completes, its payout shows up here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {settlements.map((s) => {
                  const { kind, label } = chipFor(s);
                  const { Icon, tileBg, tileText } = chipVisual(kind);
                  const ts = s.created_at ? new Date(s.created_at) : null;
                  const kwh =
                    typeof s.allocated_kwh === "number" && typeof s.ordered_kwh === "number"
                      ? s.allocated_kwh < s.ordered_kwh
                        ? `${s.allocated_kwh} of ${s.ordered_kwh} kWh delivered`
                        : `${s.ordered_kwh} kWh delivered`
                      : "Energy sale";

                  return (
                    <div
                      key={s.txn_id ?? `${s.created_at}-${s.payout_amount_paise}`}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3
                                 transition-all duration-200 ease-out
                                 hover:-translate-y-0.5 hover:border-primary/30
                                 hover:shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tileBg} ${tileText}`}>
                        <Icon className="h-5 w-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground nums">{kwh}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground nums">
                          {ts && (
                            <>
                              {ts.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                              {" · "}
                            </>
                          )}
                          <span className={tileText}>{label}</span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-base font-semibold tracking-tight text-primary nums">
                          {typeof s.payout_amount_paise === "number"
                            ? formatRupees(s.payout_amount_paise)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default EarningsPage;
