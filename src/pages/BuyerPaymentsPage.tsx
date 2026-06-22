import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Clock,
  CreditCard,
  History,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { Button } from "@/components/ui/button";
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

const BuyerPaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await getPayments("buyer");
        setPayments(data);
      } catch (error) {
        console.error("Failed to load payments:", error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const completed = payments.filter((p) => statusKind(p.status) === "completed");
  const totalConfirmed = completed.reduce((sum, p) => sum + p.amount, 0);

  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={5}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 animate-slide-up" style={{ animationDelay: "0s" }}>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 text-accent shadow-sm">
                <CreditCard className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Payment History
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track your purchases and payments
                </p>
              </div>
            </div>
          </div>

          {/* Summary card — payment overview */}
          <div className="group rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-background p-6 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)] transition-all duration-300 ease-out hover:border-primary/25 hover:shadow-[0_12px_28px_-12px_rgba(36,40,128,0.30)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Total Spent
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-accent nums">
                <CheckCircle className="h-3 w-3" />
                {completed.length} settled
              </span>
            </div>
            <p className="mt-4 text-5xl font-bold tracking-tight text-primary nums sm:text-6xl">
              ₹{totalConfirmed.toLocaleString("en-IN")}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span aria-hidden className="block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-accent opacity-100 group-hover:w-16 transition-all duration-300" />
              <p className="text-sm text-muted-foreground">across all purchases</p>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  Recent Transactions
                </p>
                {!loading && payments.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground nums">{payments.length} payment{payments.length !== 1 ? 's' : ''} recorded</p>
                )}
              </div>
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
                  <p className="text-sm font-medium text-foreground">No transactions yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your payment history will show up here.
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
                    ? `To ${payment.counterparty_phone}`
                    : payment.description || "Energy purchase";

                  return (
                    <div
                      key={payment.payment_id}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3
                                 transition-all duration-200 ease-out
                                 hover:-translate-y-0.5 hover:border-primary/30
                                 hover:shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]"
                    >
                      {/* Status avatar */}
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tileBg} ${tileText}`}>
                        <Icon className="h-5 w-5" />
                      </span>

                      {/* Party + meta */}
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

                      {/* Amount — blue tint for financial values, consistent with summary hero */}
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

          {/* CTA */}
          <Button
            onClick={() => navigate("/buyer-payment")}
            size="lg"
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <CreditCard className="h-4 w-4" />
            Make a payment
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default BuyerPaymentsPage;
