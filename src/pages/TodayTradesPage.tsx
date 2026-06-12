import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, ChevronDown, ShieldAlert, Timer, Zap } from "lucide-react";
import MainAppShell from "@/components/layout/MainAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useVCStatus } from "@/hooks/useVCStatus";
import { useUserData } from "@/hooks/useUserData";
import { getAuthHeaders } from "@/services/authHeaders";

const formatDateLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

const formatTimeToReadable = (isoTime: string): string => {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoTime;
  }
};

interface HourlyBucket {
  hour: string;
  startTime: string;
  count: number;
  totalKwh: number;
  totalEarnings: number;
  trades: TodayTrade[];
}

const groupTradesByHour = (trades: TodayTrade[]): HourlyBucket[] => {
  const buckets: { [key: string]: HourlyBucket } = {};

  trades.forEach((trade) => {
    const startTime = trade.time.split(" – ")[0];
    const hour = formatTimeToReadable(startTime);

    if (!buckets[hour]) {
      buckets[hour] = {
        hour,
        startTime,
        count: 0,
        totalKwh: 0,
        totalEarnings: 0,
        trades: [],
      };
    }

    buckets[hour].count += 1;
    buckets[hour].totalKwh += trade.kWh;
    buckets[hour].totalEarnings += trade.earnings;
    buckets[hour].trades.push(trade);
  });

  return Object.values(buckets).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

interface TodayTrade {
  id: string;
  time: string;
  kWh: number;
  rate: number;
  earnings: number;
  buyer?: string;
  status: "confirmed" | "pending";
}

const TodayTradesPage = () => {
  const navigate = useNavigate();
  const { generation: hasGenerationVC, loading: vcLoading } = useVCStatus();
  const { userData } = useUserData();
  const [confirmedTrades, setConfirmedTrades] = useState<TodayTrade[]>([]);
  const [pendingTrades, setPendingTrades] = useState<TodayTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHours, setExpandedHours] = useState<Set<string>>(new Set());

  const isVCVerified = Boolean((userData as any)?.is_vc_verified);
  const hasAnything = confirmedTrades.length > 0 || pendingTrades.length > 0;

  const confirmedUnits = confirmedTrades.reduce((sum, t) => sum + t.kWh, 0);
  const confirmedEarnings = confirmedTrades.reduce((sum, t) => sum + t.earnings, 0);

  // Fetch today's trades from backend
  useEffect(() => {
    const fetchTodayTrades = async () => {
      if (!userData?.phone_number) return;
      try {
        const headers = await getAuthHeaders();
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3002";
        const response = await fetch(`${backendUrl}/api/trades`, { headers });
        if (response.ok) {
          const data = await response.json();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Filter trades for today
          const todayTrades = (data.items || []).filter((item: any) => {
            const deliveryEnd = new Date(item.delivery_end);
            return deliveryEnd >= today && deliveryEnd < tomorrow;
          });

          // Separate confirmed and pending
          const confirmed = todayTrades
            .filter((item: any) => item.status === "CONFIRMED" || item.status === "COMPLETED")
            .map((item: any) => ({
              id: item.catalog_id,
              time: `${item.delivery_start} – ${item.delivery_end}`,
              kWh: parseFloat(item.quantity || 0),
              rate: parseFloat(item.price_per_unit || 0),
              earnings: parseFloat(item.total_amount || 0),
              buyer: item.buyer_name,
              status: "confirmed" as const,
            }));

          const pending = todayTrades
            .filter((item: any) => item.status === "PUBLISHED")
            .map((item: any) => ({
              id: item.catalog_id,
              time: `${item.delivery_start} – ${item.delivery_end}`,
              kWh: parseFloat(item.quantity || 0),
              rate: parseFloat(item.price_per_unit || 0),
              earnings: parseFloat(item.total_amount || 0),
              buyer: item.buyer_name,
              status: "pending" as const,
            }));

          setConfirmedTrades(confirmed);
          setPendingTrades(pending);
        }
      } catch (err) {
        console.error("Failed to fetch today's trades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayTrades();
  }, [userData?.phone_number]);

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

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Timer className="h-5 w-5 animate-spin" />
              </span>
              <p className="text-sm text-muted-foreground">Loading today's trades…</p>
            </div>
          )}

          {/* Confirmed section — hourly summary with expansion */}
          {!loading && confirmedTrades.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Confirmed by time
              </p>
              <div className="space-y-2">
                {groupTradesByHour(confirmedTrades).map((bucket) => {
                  const isExpanded = expandedHours.has(`confirmed-${bucket.hour}`);
                  const tradesByAlias = bucket.trades.reduce((acc, trade) => {
                    const alias = trade.id.substring(0, 20) + "...";
                    if (!acc[alias]) acc[alias] = [];
                    acc[alias].push(trade);
                    return acc;
                  }, {} as Record<string, TodayTrade[]>);

                  return (
                    <div
                      key={`confirmed-${bucket.hour}`}
                      className="overflow-hidden rounded-xl border border-accent/20 bg-accent/5 transition-all"
                    >
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedHours);
                          const key = `confirmed-${bucket.hour}`;
                          if (newExpanded.has(key)) {
                            newExpanded.delete(key);
                          } else {
                            newExpanded.add(key);
                          }
                          setExpandedHours(newExpanded);
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-accent/10 transition-colors"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-semibold text-foreground">{bucket.hour}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {bucket.count} match{bucket.count !== 1 ? 'es' : ''} · {bucket.totalKwh.toFixed(1)} kWh
                          </p>
                        </div>
                        <p className="shrink-0 text-right">
                          <p className="text-base font-semibold text-accent nums">
                            ₹{bucket.totalEarnings.toLocaleString("en-IN")}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground nums">
                            {(bucket.totalEarnings / bucket.totalKwh).toFixed(2)}/kWh avg
                          </p>
                        </p>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Expanded view */}
                      {isExpanded && (
                        <div className="border-t border-accent/20 p-4 space-y-3">
                          {bucket.trades.map((trade, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-accent/30 bg-accent/5 p-3 transition-all hover:border-accent/50 hover:shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                                  <CheckCircle className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground nums">
                                    {trade.kWh.toFixed(2)} kWh · ₹{trade.rate.toFixed(2)}/kWh
                                  </p>
                                  {trade.buyer && (
                                    <p className="text-xs font-medium text-accent mt-1">
                                      👤 Buyer: {trade.buyer}
                                    </p>
                                  )}
                                </div>
                                <p className="shrink-0 text-sm font-semibold text-accent nums">
                                  ₹{trade.earnings.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="px-1 pt-2 text-[10px] text-muted-foreground nums">
                Total: {confirmedTrades.length} confirmed trades
              </p>
            </div>
          )}

          {/* Awaiting buyers section — hourly summary with expansion */}
          {!loading && pendingTrades.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Available slots by time
              </p>
              <div className="space-y-2">
                {groupTradesByHour(pendingTrades).map((bucket) => {
                  const isExpanded = expandedHours.has(bucket.hour);
                  const tradesByAlias = bucket.trades.reduce((acc, trade) => {
                    const alias = trade.id.substring(0, 20) + "...";
                    if (!acc[alias]) acc[alias] = [];
                    acc[alias].push(trade);
                    return acc;
                  }, {} as Record<string, TodayTrade[]>);

                  return (
                    <div
                      key={bucket.hour}
                      className="overflow-hidden rounded-xl border border-border bg-card transition-all"
                    >
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedHours);
                          if (newExpanded.has(bucket.hour)) {
                            newExpanded.delete(bucket.hour);
                          } else {
                            newExpanded.add(bucket.hour);
                          }
                          setExpandedHours(newExpanded);
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                          <Timer className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-semibold text-foreground">{bucket.hour}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {bucket.count} slot{bucket.count !== 1 ? 's' : ''} · {bucket.totalKwh.toFixed(1)} kWh
                          </p>
                        </div>
                        <p className="shrink-0 text-right">
                          <p className="text-base font-semibold text-foreground nums">
                            ₹{bucket.totalEarnings.toLocaleString("en-IN")}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground nums">
                            {(bucket.totalEarnings / bucket.totalKwh).toFixed(2)}/kWh
                          </p>
                        </p>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Expanded view */}
                      {isExpanded && (
                        <div className="border-t border-primary/20 p-4 space-y-3">
                          {bucket.trades.map((trade, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 transition-all hover:border-primary/40 hover:shadow-sm"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                                <Zap className="h-4 w-4 fill-current" strokeWidth={0} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground nums">
                                  {trade.kWh.toFixed(2)} kWh · ₹{trade.rate.toFixed(2)}/kWh
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {trade.id.substring(0, 20)}...
                                </p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold text-foreground nums">
                                ₹{trade.earnings.toLocaleString("en-IN")}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="px-1 pt-2 text-[10px] text-muted-foreground nums">
                Total: {pendingTrades.length} slots available
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasAnything && (
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
