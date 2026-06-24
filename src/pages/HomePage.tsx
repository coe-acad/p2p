import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  RefreshCw,
  ShieldAlert,
  Sun,
  Timer,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import { useVCStatus } from "@/hooks/useVCStatus";
import MainAppShell from "@/components/layout/MainAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { displayName, userData } = useUserData();
  const { tradesData, totalUnits, totalEarnings, avgRate, confirmedEarnings, confirmedUnits } =
    usePublishedTrades();
  const { generation: hasGenerationVC, loading: vcLoading } = useVCStatus();

  const justPublished = location.state?.justPublished ?? false;
  const isVCVerified = Boolean((userData as any)?.is_vc_verified);
  const hasPublished = tradesData.plannedTrades.length > 0;
  const confirmedCount = tradesData.confirmedTrades.length;

  useEffect(() => {
    if (justPublished) {
      toast({
        title: "Catalog published",
        description: "Buyers can now discover your tomorrow's energy.",
      });
      // Clear navigation state so the toast doesn't fire again on refresh.
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justPublished]);

  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={5}>
          {/* Greeting row */}
          <div className="flex items-center justify-between gap-3 fade-in opacity-0">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {getGreeting()}, {displayName || "Seller"}
              </h1>
              {hasPublished ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="nums font-semibold text-primary">{totalUnits.toFixed(2)}</span> ⚡kWh
                  prepared for tomorrow
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  No catalog published yet for tomorrow.
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              aria-label="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.04] text-primary
                         transition-all duration-200 hover:border-primary/50 hover:bg-primary/10"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* VC banner — red box, only when generation VC not on file */}
          {!vcLoading && !hasGenerationVC && !isVCVerified && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/[0.06] p-4 slide-up">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-destructive">Verification required</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your Generation Profile credential to publish trades and earn.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/vc")}
                className="shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Verify
              </Button>
            </div>
          )}

          {/* Earnings overview — no stripe; section label sits outside the card.
              Hairline divider separates the hero amount from the stats. */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Earnings overview
              </p>
              {confirmedCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent nums">
                  <CheckCircle className="h-2.5 w-2.5" />
                  {confirmedCount} confirmed
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]">
              <p className="flex items-baseline gap-1 text-4xl font-semibold tracking-tight text-accent nums sm:text-5xl">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
              <span aria-hidden className="mt-1 block h-[2px] w-8 rounded-full bg-primary" />
              <p className="mt-2 text-xs text-muted-foreground">
                Total earnings across published and confirmed slots.
              </p>

              {/* Hairline divider — replaces the stripe pattern */}
              <div className="my-4 h-px w-full bg-border/60" />

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Units prepared
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground nums">
                    {totalUnits.toFixed(2)}{" "}
                    <span className="text-xs font-medium text-muted-foreground">kWh</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Avg rate
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground nums">
                    ₹{avgRate.toFixed(2)}
                    <span className="text-xs font-medium text-muted-foreground">/kWh</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Confirmed
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-accent nums">
                    {confirmedUnits.toFixed(2)}{" "}
                    <span className="text-xs font-medium text-muted-foreground">kWh</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next action — section label outside, single CTA card below.
              No stripe. A solid blue left-edge accent bar carries the persona
              identity instead. */}
          <div className="space-y-2">
            <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Next action
            </p>
            <button
              type="button"
              onClick={() => navigate("/tomorrow-trades")}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl
                         border border-primary/25 bg-card p-5 text-left
                         shadow-[0_6px_18px_-12px_rgba(36,40,128,0.22)]
                         transition-all duration-300 ease-out
                         hover:-translate-y-0.5 hover:border-primary/55
                         hover:shadow-[0_16px_36px_-18px_rgba(36,40,128,0.36)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {/* Blue left-edge accent line — solid identity bar without a full stripe */}
              <span
                aria-hidden
                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary
                           transition-all duration-300 ease-out group-hover:top-1 group-hover:bottom-1"
              />

              <span className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground
                               shadow-[0_6px_14px_-6px_rgba(36,40,128,0.45)]
                               transition-transform duration-300 ease-out
                               group-hover:scale-105">
                <Sun className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground sm:text-lg">
                  {hasPublished ? "Edit tomorrow's catalog" : "Prepare tomorrow's catalog"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hasPublished
                    ? "Adjust slots and prices before the publish deadline."
                    : "Set prices and slots so buyers can discover your energy."}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Secondary — today's trades. Green icon tile signals "live activity /
              active matches in progress" while the card stays neutral so the blue
              "Next action" above keeps its dominance. */}
          <button
            type="button"
            onClick={() => navigate("/today-trades")}
            className="group flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 text-left
                       transition-all duration-300 ease-out
                       hover:-translate-y-0.5 hover:border-accent/40
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent
                             transition-all duration-300 ease-out
                             group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-105">
              <Timer className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-foreground">View today's trades</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Watch confirmations as buyers discover and match your slots.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
          </button>

          {/* Recently confirmed feed — only if any */}
          {tradesData.confirmedTrades.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Recently confirmed
              </p>
              <div className="space-y-2">
                {tradesData.confirmedTrades.slice(0, 4).map((t, i) => (
                  <div
                    key={`${t.time}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    {/* Blue tile = persona identity for the seller row */}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <Zap className="h-4 w-4 fill-current" strokeWidth={0} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{t.time}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground nums">
                        {t.kWh.toFixed(2)} kWh · ₹{t.rate.toFixed(2)}/kWh
                        {t.buyer && (
                          <>
                            {" · "}
                            <span className="text-foreground">{t.buyer}</span>
                          </>
                        )}
                      </p>
                    </div>
                    {/* Earnings stay in green — "confirmed money in" = success state */}
                    <p className="shrink-0 text-base font-semibold text-accent nums">
                      ₹{t.earnings.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              {tradesData.confirmedTrades.length > 4 && (
                <button
                  type="button"
                  onClick={() => navigate("/today-trades")}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  See all <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default HomePage;
