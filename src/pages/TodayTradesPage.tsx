import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, ShieldAlert, Timer, Zap } from "lucide-react";
import MainAppShell from "@/components/layout/MainAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import { useVCStatus } from "@/hooks/useVCStatus";
import { useUserData } from "@/hooks/useUserData";

const formatDateLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

const TodayTradesPage = () => {
  const navigate = useNavigate();
  const { generation: hasGenerationVC, loading: vcLoading } = useVCStatus();
  const { userData } = useUserData();
  const {
    tradesData,
    plannedUnits,
    plannedEarnings,
    confirmedUnits,
    confirmedEarnings,
  } = usePublishedTrades();

  const isVCVerified = Boolean((userData as any)?.is_vc_verified);
  const plannedTrades = tradesData.plannedTrades;
  const confirmedTrades = tradesData.confirmedTrades;
  const hasAnything = plannedTrades.length > 0 || confirmedTrades.length > 0;

  // VC Guard
  if (!vcLoading && !hasGenerationVC && !isVCVerified) {
    return (
      <MainAppShell>
        <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
          <PageContainer gap={4}>
            <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/[0.06] p-4 slide-up">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-destructive">Verification required</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your Generation Profile credential to view today's trades.
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/vc")} className="w-full">
              Go to verification
            </Button>
          </PageContainer>
        </div>
      </MainAppShell>
    );
  }

  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={5}>
          {/* Heading row */}
          <div className="flex items-center gap-2 fade-in opacity-0">
            <button
              onClick={() => navigate("/home")}
              aria-label="Back"
              className="flex h-9 w-9 -ml-1.5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Today's trades
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground nums">{formatDateLabel()}</p>
            </div>
          </div>

          {/* Summary — blue hero amount, green confirmed chip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Earned so far
              </p>
              {confirmedTrades.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent nums">
                  <CheckCircle className="h-2.5 w-2.5" />
                  {confirmedTrades.length} confirmed
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]">
              <p className="text-4xl font-semibold tracking-tight text-accent nums sm:text-5xl">
                ₹{confirmedEarnings.toLocaleString("en-IN")}
              </p>
              <span aria-hidden className="mt-2 block h-[2px] w-8 rounded-full bg-primary" />
              <p className="mt-2 text-xs text-muted-foreground nums">
                {confirmedUnits.toFixed(2)} kWh sold to buyers today.
              </p>
            </div>
          </div>

          {/* Confirmed section */}
          {confirmedTrades.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Confirmed
              </p>
              <div className="space-y-2">
                {confirmedTrades.map((t, i) => (
                  <div
                    key={`c-${t.time}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
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
                    <p className="shrink-0 text-base font-semibold text-accent nums">
                      ₹{t.earnings.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awaiting buyers section */}
          {plannedTrades.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Awaiting buyers
              </p>
              <div className="space-y-2">
                {plannedTrades.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Timer className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{t.time}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground nums">
                        {t.kWh.toFixed(2)} kWh · ₹{t.rate.toFixed(2)}/kWh
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground nums">
                      ₹{Math.round(t.kWh * t.rate).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <p className="px-1 pt-1 text-[10px] text-muted-foreground nums">
                {plannedUnits.toFixed(2)} kWh listed · expected ₹{plannedEarnings.toLocaleString("en-IN")}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!hasAnything && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Timer className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Nothing live today</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Publish tomorrow's catalog to start matching with buyers.
                </p>
              </div>
              <Button onClick={() => navigate("/tomorrow-trades")} size="sm" className="mt-1">
                Prepare catalog
              </Button>
            </div>
          )}
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default TodayTradesPage;
