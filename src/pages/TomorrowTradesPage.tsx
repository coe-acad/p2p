import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  ShieldAlert,
  Sun,
  Zap,
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useVCStatus } from "@/hooks/useVCStatus";
import { useAuth } from "@/hooks/useAuth";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import { useToast } from "@/hooks/use-toast";
import MainAppShell from "@/components/layout/MainAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getAuthHeaders } from "@/services/authHeaders";

interface TradeItem {
  startTime: string;
  endTime: string;
  kWh: number;
  price: number;
}

interface TomorrowCatalog {
  trades: TradeItem[];
  generatedAt?: string;
  generationId?: string;
  consumptionId?: string;
}

interface DraftCatalog extends TomorrowCatalog {
  id: string;
  source: 'manual' | 'excess_energy'; // manual or auto-generated from cron
  status: 'draft' | 'published';
}

const resolveBackendUrl = (envUrl?: string): string => {
  if (envUrl) return envUrl;
  return "http://localhost:3002";
};

const TomorrowTradesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, profileHydrated } = useUserData();
  const { user } = useAuth();
  const { generation: hasGenerationVC, loading: vcLoading } = useVCStatus();
  const { publishTrades } = usePublishedTrades();
  const backendUrl = resolveBackendUrl(import.meta.env.VITE_BACKEND_URL);

  const isVCVerified = Boolean((userData as any)?.is_vc_verified);
  const [catalog, setCatalog] = useState<TomorrowCatalog | null>(null);
  const [currentDraft, setCurrentDraft] = useState<DraftCatalog | null>(null);
  const [draftCatalogs, setDraftCatalogs] = useState<DraftCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState<string>("Calculating…");
  const [confirmingApprove, setConfirmingApprove] = useState(false);
  const [approvingDraftId, setApprovingDraftId] = useState<string | null>(null);
  const [catalogView, setCatalogView] = useState<"draft" | "real">("real");

  // Form state for creating draft trades. Default to tomorrow 10:00–11:00
  // (wall-clock) so sellers can hit "Add" without first picking a date.
  const [draftForm, setDraftForm] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    return {
      startTime: `${yyyy}-${mm}-${dd}T10:00:00Z`,
      endTime: `${yyyy}-${mm}-${dd}T11:00:00Z`,
      kWh: 5.5,
      price: 8.5,
    };
  });

  // Countdown to the 7 PM IST catalog refresh.
  const calculateRefreshCountdown = () => {
    const now = new Date();
    let istHours = now.getUTCHours() + 5;
    let istMinutes = now.getUTCMinutes() + 30;
    const istSeconds = now.getUTCSeconds();

    if (istMinutes >= 60) {
      istMinutes -= 60;
      istHours += 1;
    }
    if (istHours >= 24) {
      istHours -= 24;
    }

    const msInDay = istHours * 60 * 60 * 1000 + istMinutes * 60 * 1000 + istSeconds * 1000;
    const refreshTimeMs = 19 * 60 * 60 * 1000;

    let msDiff = refreshTimeMs - msInDay;
    if (msDiff <= 0) msDiff += 24 * 60 * 60 * 1000;

    const diffHours = Math.floor(msDiff / (60 * 60 * 1000));
    const diffMinutes = Math.floor((msDiff % (60 * 60 * 1000)) / (60 * 1000));
    return `Refreshes in ${diffHours}h ${diffMinutes}m`;
  };

  useEffect(() => {
    setRefreshCountdown(calculateRefreshCountdown());
    const interval = setInterval(() => {
      setRefreshCountdown(calculateRefreshCountdown());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTomorrowCatalog = async () => {
      if (!profileHydrated) return;

      if (!hasGenerationVC) {
        setLoading(false);
        setError("Please upload your credentials to access tomorrow's catalog");
        return;
      }
      if (!userData?.phone) {
        setLoading(false);
        setError("User phone number not available");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = await user?.getIdToken();
        const encodedPhone = encodeURIComponent(userData.phone);
        const apiUrl = `${backendUrl}/api/sellers/${encodedPhone}/tomorrow`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          if (response.status === 403) throw new Error("You are not authorized to view this catalog");
          throw new Error("Failed to fetch tomorrow's catalog");
        }

        const data = await response.json();
        if (data && typeof data === "object") {
          setCatalog(data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        console.error("Error fetching tomorrow's catalog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTomorrowCatalog();
  }, [userData.phone, profileHydrated, hasGenerationVC]);

  const formatTimeInIST = (utcTimestamp: unknown): string => {
    try {
      if (!utcTimestamp) return "Invalid time";
      const timestampStr = String(utcTimestamp).trim();
      if (!timestampStr) return "Invalid time";

      let date: Date | null = null;
      try {
        date = new Date(timestampStr);
        if (isNaN(date.getTime())) date = null;
      } catch {
        date = null;
      }
      if (!date) {
        const isoMatch = timestampStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (isoMatch) {
          const [, year, month, day, hours, minutes] = isoMatch;
          try {
            date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${String(isoMatch[6]).padStart(2, "0")}Z`);
          } catch {
            date = null;
          }
        }
      }
      if (!date || isNaN(date.getTime())) return "Invalid time";

      const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
      const hours = istDate.getUTCHours();
      const minutes = istDate.getUTCMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = String(minutes).padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return "Invalid time";
    }
  };

  const getTomorrowDateIST = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${weekdays[tomorrow.getDay()]}, ${tomorrow.getDate()} ${months[tomorrow.getMonth()]}`;
  };

  const totalStats = catalog?.trades.reduce(
    (acc, trade) => ({
      kWh: acc.kWh + trade.kWh,
      earnings: acc.earnings + trade.kWh * trade.price,
    }),
    { kWh: 0, earnings: 0 }
  ) || { kWh: 0, earnings: 0 };

  const handleApprove = async () => {
    if (!catalog?.trades || catalog.trades.length === 0) {
      setError("No trades to approve");
      setConfirmingApprove(false);
      return;
    }
    setSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${backendUrl}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ trades: catalog.trades }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to approve catalog");
      }

      // Convert trades to PlannedTrade format and update session storage
      const plannedTrades = catalog.trades.map((trade, idx) => ({
        id: `trade-${idx}`,
        time: `${formatTimeInIST(trade.startTime)} – ${formatTimeInIST(trade.endTime)}`,
        kWh: trade.kWh,
        rate: trade.price,
      }));
      publishTrades(plannedTrades);

      setConfirmingApprove(false);
      toast({
        title: "Catalog published",
        description: "Buyers can now discover your tomorrow's energy.",
      });
      navigate("/home", { state: { justPublished: true } });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to approve catalog";
      console.error("Approve error:", err);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      setConfirmingApprove(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Add offer to current draft
  const handleAddToDraft = () => {
    const newOffer: TradeItem = {
      startTime: draftForm.startTime,
      endTime: draftForm.endTime,
      kWh: draftForm.kWh,
      price: draftForm.price,
    };

    if (!currentDraft) {
      // Create first draft
      const newDraft: DraftCatalog = {
        id: `draft-${Date.now()}`,
        trades: [newOffer],
        source: 'manual',
        status: 'draft',
      };
      setCurrentDraft(newDraft);
    } else {
      // Add to existing draft
      setCurrentDraft({
        ...currentDraft,
        trades: [...currentDraft.trades, newOffer],
      });
    }

    toast({
      title: "Offer added",
      description: "Add more offers or create a new catalog",
    });
  };

  // Finalize current draft and create new one
  const handleCreateNewCatalog = () => {
    if (!currentDraft || currentDraft.trades.length === 0) {
      toast({
        title: "No offers",
        description: "Add at least one offer before creating a catalog",
        variant: "destructive",
      });
      return;
    }
    setDraftCatalogs([...draftCatalogs, currentDraft]);
    setCurrentDraft(null);
    toast({
      title: "Catalog saved",
      description: "Start a new catalog or publish existing ones",
    });
  };

  // Approve a draft catalog and publish it
  const handleApproveDraft = async (draftId: string) => {
    const draft = draftCatalogs.find(d => d.id === draftId);
    if (!draft || draft.trades.length === 0) {
      toast({ title: "Error", description: "No trades in this draft", variant: "destructive" });
      return;
    }

    setApprovingDraftId(draftId);
    setSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${backendUrl}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ trades: draft.trades }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to publish catalog");
      }

      // Convert trades to PlannedTrade format and update session storage
      const plannedTrades = draft.trades.map((trade, idx) => ({
        id: `trade-${idx}`,
        time: `${formatTimeInIST(trade.startTime)} – ${formatTimeInIST(trade.endTime)}`,
        kWh: trade.kWh,
        rate: trade.price,
      }));
      publishTrades(plannedTrades);

      // Remove from drafts and update status
      setDraftCatalogs(draftCatalogs.map(d =>
        d.id === draftId ? { ...d, status: 'published' } : d
      ));

      toast({
        title: "Catalog published",
        description: "Buyers can now discover your tomorrow's energy.",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to publish catalog";
      console.error("Approve draft error:", err);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setSubmitting(false);
      setApprovingDraftId(null);
    }
  };

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
                  Upload your Generation Profile credential to view and publish tomorrow's energy.
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
          {/* Heading row with toggle */}
          <div className="flex items-center gap-2 fade-in opacity-0">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="flex h-9 w-9 -ml-1.5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Tomorrow's catalog
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground nums">{getTomorrowDateIST()}</p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
              <button
                onClick={() => setCatalogView("draft")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all ${
                  catalogView === "draft"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setCatalogView("real")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all ${
                  catalogView === "real"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Real
              </button>
            </div>
          </div>

          {/* DRAFT VIEW — Add Offer Form & Current Draft */}
          {catalogView === "draft" && (
          <>

          {/* Add Offer Form */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Add offer to catalog
            </p>
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Start time</label>
                  <input
                    type="datetime-local"
                    value={draftForm.startTime.slice(0, 16)}
                    onChange={(e) => setDraftForm({ ...draftForm, startTime: e.target.value + ":00Z" })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">End time</label>
                  <input
                    type="datetime-local"
                    value={draftForm.endTime.slice(0, 16)}
                    onChange={(e) => setDraftForm({ ...draftForm, endTime: e.target.value + ":00Z" })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">kWh</label>
                  <input
                    type="number"
                    step="0.1"
                    value={draftForm.kWh}
                    onChange={(e) => setDraftForm({ ...draftForm, kWh: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Price (₹/kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={draftForm.price}
                    onChange={(e) => setDraftForm({ ...draftForm, price: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <Button onClick={handleAddToDraft} variant="outline" className="w-full">
                Add to Draft
              </Button>
            </div>
          </div>

          {/* Current Draft */}
          {currentDraft && currentDraft.trades.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Current draft
              </p>
              <div className="rounded-2xl border border-primary/20 bg-card p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">
                    {currentDraft.trades.length} offer{currentDraft.trades.length !== 1 ? 's' : ''} added
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{currentDraft.trades.reduce((sum, t) => sum + t.kWh * t.price, 0).toFixed(0)} expected earnings · {currentDraft.trades.reduce((sum, t) => sum + t.kWh, 0).toFixed(2)} kWh total
                  </p>
                </div>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {currentDraft.trades.map((trade, idx) => {
                    const startTimeIST = formatTimeInIST(String(trade.startTime || ""));
                    const endTimeIST = formatTimeInIST(String(trade.endTime || ""));
                    const tradePrice = (Number(trade.kWh) || 0) * (Number(trade.price) || 0);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-background p-2 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground nums">
                            {startTimeIST} – {endTimeIST}
                          </p>
                          <p className="text-muted-foreground nums text-[10px]">
                            {Number(trade.kWh || 0).toFixed(2)} kWh · ₹{Number(trade.price || 0).toFixed(2)}/kWh
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold text-foreground nums text-xs">
                          ₹{isFinite(tradePrice) ? tradePrice.toFixed(0) : "0"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleCreateNewCatalog}
                  size="sm"
                  className="w-full"
                >
                  Create New Catalog
                </Button>
              </div>
            </div>
          )}

          {/* Finalized Draft Catalogs Section */}
          {draftCatalogs.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Saved catalogs (ready to publish)
              </p>
              <div className="space-y-2">
                {draftCatalogs.map((draft) => {
                  const draftStats = draft.trades.reduce(
                    (acc, trade) => ({
                      kWh: acc.kWh + trade.kWh,
                      earnings: acc.earnings + trade.kWh * trade.price,
                    }),
                    { kWh: 0, earnings: 0 }
                  );
                  const isPublishing = approvingDraftId === draft.id && submitting;

                  return (
                    <div key={draft.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              Manual Draft
                            </span>
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          ₹{draftStats.earnings.toFixed(0)}
                        </p>
                      </div>

                      {draft.trades.map((trade, idx) => {
                        const startTimeIST = formatTimeInIST(String(trade.startTime || ""));
                        const endTimeIST = formatTimeInIST(String(trade.endTime || ""));
                        const tradePrice = (Number(trade.kWh) || 0) * (Number(trade.price) || 0);
                        return (
                          <div
                            key={idx}
                            className="mb-2 flex items-center gap-3 rounded-lg bg-background p-2 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground nums">
                                {startTimeIST} – {endTimeIST}
                              </p>
                              <p className="text-muted-foreground nums">
                                {Number(trade.kWh || 0).toFixed(2)} kWh · ₹{Number(trade.price || 0).toFixed(2)}/kWh
                              </p>
                            </div>
                            <p className="shrink-0 font-semibold text-foreground nums">
                              ₹{isFinite(tradePrice) ? tradePrice.toFixed(0) : "0"}
                            </p>
                          </div>
                        );
                      })}

                      <Button
                        onClick={() => handleApproveDraft(draft.id)}
                        disabled={submitting}
                        size="sm"
                        className="w-full mt-3"
                      >
                        {isPublishing ? "Publishing..." : "Approve & Publish"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          </>
          )}

          {/* REAL VIEW — Excess Energy Catalog */}
          {catalogView === "real" && (
          <>


          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </span>
              <p className="text-sm text-muted-foreground">Loading tomorrow's offers…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {!hasGenerationVC ? "Credentials required" : "Couldn't load offers"}
                </p>
                <p className="mt-1 break-words text-muted-foreground">{error}</p>
                <button
                  onClick={() => navigate(!hasGenerationVC ? "/vc" : 0 as any)}
                  className="mt-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  {!hasGenerationVC ? "Go to verification" : "Refresh page"}
                </button>
              </div>
            </div>
          )}

          {/* Catalog View — excess energy auto-generated catalogs */}
          {!loading && !error && catalog?.trades && catalog.trades.length > 0 && (
            <>
              {/* Expected Earnings — blue identity frame, green hero amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Excess energy (auto-generated)
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary nums">
                    <Sun className="h-2.5 w-2.5" />
                    100% Solar
                  </span>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]">
                  <p className="text-4xl font-semibold tracking-tight text-accent nums sm:text-5xl">
                    ₹{isFinite(totalStats.earnings) ? totalStats.earnings.toFixed(0) : "0"}
                  </p>
                  <span aria-hidden className="mt-2 block h-[2px] w-8 rounded-full bg-primary" />
                  <p className="mt-2 text-xs text-muted-foreground nums">
                    {isFinite(totalStats.kWh) ? totalStats.kWh.toFixed(2) : "0"} kWh listed for tomorrow.
                  </p>
                </div>
              </div>

              {/* Planned Trades */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Planned trades
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground nums">
                    {refreshCountdown}
                  </p>
                </div>

                <div className="space-y-2">
                  {catalog.trades.map((trade, index) => {
                    if (!trade || typeof trade !== "object") return null;
                    try {
                      const startTimeIST = formatTimeInIST(String(trade.startTime || ""));
                      const endTimeIST = formatTimeInIST(String(trade.endTime || ""));
                      const totalPrice = (Number(trade.kWh) || 0) * (Number(trade.price) || 0);

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3
                                     transition-all duration-200 ease-out
                                     hover:-translate-y-0.5 hover:border-primary/30
                                     hover:shadow-[0_6px_18px_-12px_rgba(36,40,128,0.20)]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                            <Zap className="h-4 w-4 fill-current" strokeWidth={0} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground nums">
                              {startTimeIST} – {endTimeIST}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground nums">
                              {Number(trade.kWh || 0).toFixed(2)} kWh · ₹{Number(trade.price || 0).toFixed(2)}/kWh
                            </p>
                          </div>
                          <p className="shrink-0 text-base font-semibold text-foreground nums">
                            ₹{isFinite(totalPrice) ? totalPrice.toFixed(0) : "0"}
                          </p>
                        </div>
                      );
                    } catch (err) {
                      console.error(`Error rendering trade ${index}:`, err);
                      return null;
                    }
                  })}
                </div>

                <p className="px-1 pt-1 text-[10px] text-muted-foreground">
                  Prices may improve as demand updates.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => setConfirmingApprove(true)}
                  disabled={submitting}
                  size="lg"
                  className="flex-1 gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Publish
                </Button>
              </div>
            </>
          )}

          </>
          )}

          {/* Empty State — contextual based on view */}
          {!loading && !error && (
            <>
              {catalogView === "draft" && !currentDraft && draftCatalogs.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Zap className="h-5 w-5 fill-current" strokeWidth={0} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">No drafts yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add offers above to create and save catalogs.
                    </p>
                  </div>
                </div>
              )}

              {catalogView === "real" && (!catalog?.trades || catalog.trades.length === 0) && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Zap className="h-5 w-5 fill-current" strokeWidth={0} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">No excess energy</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Excess energy catalogs from auto-generation will appear here.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </PageContainer>
      </div>

      {/* Publish confirmation popup — irreversible action gets a confirm */}
      <ConfirmDialog
        open={confirmingApprove}
        onOpenChange={(open) => !submitting && setConfirmingApprove(open)}
        title="Publish tomorrow's catalog?"
        description={`You're about to list ${totalStats.kWh.toFixed(2)} kWh for ₹${totalStats.earnings.toFixed(0)} expected earnings. Buyers will be able to discover and match these slots.`}
        proceedLabel="Publish"
        loading={submitting}
        onProceed={handleApprove}
      />
    </MainAppShell>
  );
};

export default TomorrowTradesPage;
