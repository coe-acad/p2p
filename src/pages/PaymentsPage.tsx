import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  History,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { getPayments, Payment } from "@/services/paymentService";
import type { LucideIcon } from "lucide-react";

type StatusKind = "completed" | "pending" | "failed" | "other";

const statusKind = (status?: string): StatusKind => {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "completed";
  if (s === "pending") return "pending";
  if (s === "failed") return "failed";
  return "other";
};

const statusVisual = (kind: StatusKind): { Icon: LucideIcon; tileBg: string; tileText: string; label: string } => {
  switch (kind) {
    case "completed":
      return { Icon: CheckCircle, tileBg: "bg-accent/12", tileText: "text-accent", label: "Completed" };
    case "pending":
      return { Icon: Clock, tileBg: "bg-primary/10", tileText: "text-primary", label: "Pending" };
    case "failed":
      return { Icon: AlertCircle, tileBg: "bg-destructive/10", tileText: "text-destructive", label: "Failed" };
    default:
      return { Icon: History, tileBg: "bg-secondary", tileText: "text-muted-foreground", label: "Unknown" };
  }
};

const PaymentSkeleton = () => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
    <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-pulse" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
      <div className="h-2.5 w-28 rounded bg-muted/60 animate-pulse" />
    </div>
    <div className="h-5 w-20 rounded bg-muted animate-pulse" />
  </div>
);

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await getPayments("seller");
        setPayments(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load payments:", err);
        setError("Failed to load payment history");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const completed = payments.filter((p) => statusKind(p.status) === "completed");
  const totalReceived = completed.reduce((sum, p) => sum + p.amount, 0);

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
                Receivables
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Money buyers have paid for your trades.
              </p>
            </div>
          </div>

          {/* Summary — label outside card, blue hero amount, green confirmed chip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Total received
              </p>
              {completed.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent nums">
                  <CheckCircle className="h-2.5 w-2.5" />
                  {completed.length} confirmed
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]">
              <p className="text-4xl font-semibold tracking-tight text-accent nums sm:text-5xl">
                ₹{totalReceived.toLocaleString("en-IN")}
              </p>
              <span aria-hidden className="mt-2 block h-[2px] w-8 rounded-full bg-primary" />
              <p className="mt-2 text-xs text-muted-foreground">
                Settled across confirmed trades.
              </p>
            </div>
          </div>

          {/* Error banner */}
          {error && !loading && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Couldn't load receivables</p>
                <p className="mt-1 break-words text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {/* Recent receipts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Recent receipts
              </p>
              {!loading && payments.length > 0 && (
                <p className="text-xs text-muted-foreground nums">{payments.length} total</p>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <PaymentSkeleton key={i} />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <History className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">No receipts yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirmed buyer payments will show up here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => {
                  const kind = statusKind(payment.status);
                  const { Icon, tileBg, tileText, label } = statusVisual(kind);
                  const ts = payment.created_at ? new Date(payment.created_at) : null;
                  const party = payment.counterparty_phone
                    ? `From ${payment.counterparty_phone}`
                    : payment.description || "Energy receipt";

                  return (
                    <div
                      key={payment.payment_id}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3
                                 transition-all duration-200 ease-out
                                 hover:-translate-y-0.5 hover:border-primary/30
                                 hover:shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tileBg} ${tileText}`}>
                        <Icon className="h-5 w-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{party}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground nums">
                          {ts && (
                            <>
                              {ts.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                              {" · "}
                              {ts.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                              {" · "}
                            </>
                          )}
                          <span className={tileText}>{label}</span>
                        </p>
                      </div>

                      {/* Amount in blue (persona-consistent for seller) */}
                      <div className="shrink-0 text-right">
                        <p className="text-base font-semibold tracking-tight text-primary nums">
                          ₹{payment.amount.toLocaleString("en-IN")}
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

export default PaymentsPage;
