import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, AlertCircle, Zap } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import MainAppShell from "@/components/layout/MainAppShell";
import PageContainer from "@/components/layout/PageContainer";

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

const TomorrowTradesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userData, profileHydrated } = useUserData();
  const { user } = useAuth();

  const [catalog, setCatalog] = useState<TomorrowCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tomorrow's catalog from API
  useEffect(() => {
    const fetchTomorrowCatalog = async () => {
      if (!profileHydrated) {
        console.log("Profile not hydrated yet");
        return;
      }

      if (!userData?.phone) {
        console.log("No phone number in userData:", userData);
        setLoading(false);
        setError("User phone number not available");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get Firebase auth token
        const token = await user?.getIdToken();
        console.log("Token acquired:", !!token);

        const encodedPhone = encodeURIComponent(userData.phone);
        console.log("Encoded phone:", encodedPhone);

        const response = await fetch(
          `/api/sellers/${encodedPhone}/tomorrow`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        console.log("Response status:", response.status);
        console.log("Response headers:", {
          contentType: response.headers.get("content-type"),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log("Error response body:", errorText);
          if (response.status === 403) {
            throw new Error("You are not authorized to view this catalog");
          }
          throw new Error("Failed to fetch tomorrow's catalog");
        }

        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr);
          throw parseErr;
        }

        console.log("Received data:", data);
        console.log("Data type:", typeof data);
        console.log("Trades array:", data?.trades);

        if (data && typeof data === "object") {
          setCatalog(data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        console.error("Error fetching tomorrow's catalog:", err);
        console.error("Error type:", err instanceof Error ? err.constructor.name : typeof err);
        console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace");
      } finally {
        setLoading(false);
      }
    };

    fetchTomorrowCatalog();
  }, [userData.phone, profileHydrated]);

  // Convert UTC timestamp to IST display format
  const formatTimeInIST = (utcTimestamp: string): string => {
    try {
      if (!utcTimestamp || typeof utcTimestamp !== "string") {
        console.warn("Invalid timestamp:", utcTimestamp);
        return "Invalid time";
      }

      let date: Date;

      // Try to parse the timestamp
      try {
        date = new Date(utcTimestamp);
      } catch (e) {
        console.error("Date parsing error:", e, "timestamp:", utcTimestamp);
        return "Invalid time";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date value:", utcTimestamp);
        return "Invalid time";
      }

      // IST is UTC+5:30
      const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

      // Manual formatting to avoid locale-specific issues
      const hours = istDate.getUTCHours();
      const minutes = istDate.getUTCMinutes();

      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");

      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch (err) {
      console.error("formatTimeInIST error:", err);
      return "Invalid time";
    }
  };

  // Get tomorrow's date in IST
  const getTomorrowDateIST = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayName = weekdays[tomorrow.getDay()];
    const monthName = months[tomorrow.getMonth()];
    const date = tomorrow.getDate();

    return `${dayName}, ${date} ${monthName}`;
  };

  // Calculate total earnings and kWh
  const totalStats = catalog?.trades.reduce(
    (acc, trade) => ({
      kWh: acc.kWh + trade.kWh,
      earnings: acc.earnings + trade.kWh * trade.price,
    }),
    { kWh: 0, earnings: 0 }
  ) || { kWh: 0, earnings: 0 };

  return (
    <MainAppShell contentClassName="lg:py-6">
      <PageContainer>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">All set for tomorrow</h1>
            <p className="text-sm text-muted-foreground">{getTomorrowDateIST()} (Recommended)</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tomorrow's offers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Unable to load offers</p>
                <p className="text-sm text-red-700">
                  {error.includes("pattern") || error.includes("authorization")
                    ? "There was a temporary issue loading your catalog. Please refresh and try again."
                    : error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Refresh page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (!catalog?.trades || catalog.trades.length === 0) && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-6 text-center">
            <Zap size={32} className="mx-auto mb-3 text-blue-600" />
            <p className="font-semibold text-blue-900 mb-1">No offers for tomorrow</p>
            <p className="text-sm text-blue-700">
              You don't have any excess energy scheduled for tomorrow. Check back later or adjust your settings.
            </p>
          </div>
        )}

        {/* Catalog View */}
        {!loading && !error && catalog?.trades && catalog.trades.length > 0 && (
          <div className="space-y-6">
            {/* Expected Earnings Card */}
            <div className="rounded-xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium mb-2">Expected Earnings</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-emerald-900">
                  ₹{isFinite(totalStats.earnings) ? totalStats.earnings.toFixed(0) : "0"}
                </span>
              </div>
              <p className="text-sm text-emerald-700">{isFinite(totalStats.kWh) ? totalStats.kWh.toFixed(2) : "0"} kWh</p>
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <p className="text-xs text-emerald-600">100% Solar</p>
              </div>
            </div>

            {/* Planned Trades Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Planned Trades</h2>
                <p className="text-xs text-muted-foreground">Refreshes in 2h 49m</p>
              </div>

              <div className="space-y-3">
                {catalog.trades && Array.isArray(catalog.trades) && catalog.trades.map((trade, index) => {
                  if (!trade || typeof trade !== "object") {
                    console.warn(`Invalid trade at index ${index}:`, trade);
                    return null;
                  }

                  try {
                    console.log(`Processing trade ${index}:`, trade);
                    const startTimeIST = formatTimeInIST(String(trade.startTime || ""));
                    const endTimeIST = formatTimeInIST(String(trade.endTime || ""));
                    const totalPrice = (Number(trade.kWh) || 0) * (Number(trade.price) || 0);

                    return (
                      <div
                        key={index}
                        className="rounded-lg bg-white border border-gray-200 p-4 hover:border-emerald-300 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <p className="font-semibold text-foreground">
                                {startTimeIST} – {endTimeIST}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{Number(trade.kWh || 0).toFixed(2)} kWh</span>
                              <span>₹{Number(trade.price || 0).toFixed(2)}/unit</span>
                            </div>
                          </div>

                          {/* Price on the right */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              ₹{isFinite(totalPrice) ? totalPrice.toFixed(0) : "0"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (err) {
                    console.error(`Error rendering trade ${index}:`, err);
                    return null;
                  }
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  toast({
                    title: "Catalog approved",
                    description: "Your trades are set for tomorrow",
                  });
                  navigate(-1);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Approve Now
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-foreground font-semibold py-3 rounded-lg transition"
              >
                Change
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
              Prices may improve as demand updates.
            </p>
          </div>
        )}
      </PageContainer>
    </MainAppShell>
  );
};

export default TomorrowTradesPage;
