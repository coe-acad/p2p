import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock } from "lucide-react";
import { getTradeHistory, TradeHistoryItem } from "@/services/tradeService";

const statusLabel = (status: string) => {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "SELECTED":
      return "Selected";
    case "INITIATED":
      return "Initiated";
    case "CONFIRMED":
      return "Confirmed";
    default:
      return status;
  }
};

const TradeHistorySettingsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTradeHistory();
        setItems(data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="screen-container !justify-start !pt-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        <div className="flex items-center gap-2 pb-3 animate-fade-in">
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground">Trade History</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No trades yet.</div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.type}-${item.transaction_id || item.catalog_id}-${index}`}
                className="w-full bg-card rounded-xl p-3 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Package size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.type === "catalog" ? "Catalog" : "Trade"}
                      </p>
                      <p className="text-2xs text-muted-foreground">
                        {item.transaction_id || item.catalog_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-2xs font-medium text-muted-foreground">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistorySettingsPage;
