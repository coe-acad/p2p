import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, Timer, Zap, Search } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";

type TradeStatus = "searching" | "confirmed" | "completed" | "expired";

interface Trade {
  id: string;
  timeSlot: string;
  units: number;
  pricePerUnit: number;
  status: TradeStatus;
  matchedUnits?: number;
  buyer?: string;
}

// Price catalog for different time slots (₹6-7 range)
const priceCatalog: Record<string, number> = {
  "6:00 AM": 6.25,
  "7:00 AM": 6.25,
  "8:00 AM": 6.50,
  "9:00 AM": 6.75,
  "10:00 AM": 6.75,
  "11:00 AM": 6.50,
  "12:00 PM": 6.50,
  "1:00 PM": 6.25,
  "2:00 PM": 6.25,
  "3:00 PM": 6.50,
  "4:00 PM": 6.75,
  "5:00 PM": 6.50,
};

const TodayTradesPage = () => {
  const navigate = useNavigate();

  // Demo data with 1-hour windows - amounts calculated from units * price
  // Total completed: 2.0 + 2.0 + 2.0 + 2.5 = 8.5 kWh, earning ~₹55
  const trades: Trade[] = [
    { id: "1", timeSlot: "6:00 AM - 7:00 AM", units: 2.0, pricePerUnit: 6.25, status: "completed", buyer: "GridCo" },
    { id: "2", timeSlot: "7:00 AM - 8:00 AM", units: 0.8, pricePerUnit: 6.25, status: "expired" },
    { id: "3", timeSlot: "8:00 AM - 9:00 AM", units: 2.0, pricePerUnit: 6.50, status: "completed", buyer: "TPDDL" },
    { id: "4", timeSlot: "9:00 AM - 10:00 AM", units: 2.0, pricePerUnit: 6.75, status: "completed", buyer: "GridCo" },
    { id: "5", timeSlot: "10:00 AM - 11:00 AM", units: 3.5, pricePerUnit: 6.75, status: "completed", matchedUnits: 2.5, buyer: "BSES" },
    { id: "6", timeSlot: "11:00 AM - 12:00 PM", units: 1.5, pricePerUnit: 6.50, status: "confirmed", buyer: "GridCo" },
    { id: "7", timeSlot: "12:00 PM - 1:00 PM", units: 1.0, pricePerUnit: 6.25, status: "searching" },
  ];

  const getStatusConfig = (trade: Trade) => {
    const isPartial = trade.status === "completed" && trade.matchedUnits !== undefined;
    
    switch (trade.status) {
      case "searching":
        return {
          icon: Search,
          label: "Searching",
          color: "text-muted-foreground",
          bg: "bg-muted/50",
          badgeColor: "bg-muted text-muted-foreground",
        };
      case "confirmed":
        return {
          icon: Timer,
          label: "Confirmed",
          color: "text-primary",
          bg: "bg-primary/10",
          badgeColor: "bg-primary/20 text-primary",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          label: isPartial ? `Partial (${trade.matchedUnits}/${trade.units} kWh)` : "Completed",
          color: "text-accent",
          bg: "bg-accent/10",
          badgeColor: isPartial ? "bg-amber-500/20 text-amber-600" : "bg-accent/20 text-accent",
        };
      case "expired":
        return {
          icon: AlertCircle,
          label: "Expired",
          color: "text-destructive",
          bg: "bg-destructive/10",
          badgeColor: "bg-destructive/20 text-destructive",
        };
    }
  };

  // Calculate actual earned amounts (only from completed/partial trades)
  const completedTrades = trades.filter(t => t.status === "completed");
  
  const totalEarnings = completedTrades.reduce((sum, t) => {
    const effectiveUnits = t.matchedUnits ?? t.units;
    return sum + (effectiveUnits * t.pricePerUnit);
  }, 0);

  const totalUnits = completedTrades.reduce((sum, t) => {
    return sum + (t.matchedUnits ?? t.units);
  }, 0);

  const groupedTrades = {
    completed: trades.filter(t => t.status === "completed"),
    confirmed: trades.filter(t => t.status === "confirmed"),
    searching: trades.filter(t => t.status === "searching"),
    expired: trades.filter(t => t.status === "expired"),
  };

  const renderTradeCard = (trade: Trade) => {
    const config = getStatusConfig(trade);
    const Icon = config.icon;
    const isPartial = trade.status === "completed" && trade.matchedUnits !== undefined;
    const effectiveUnits = trade.matchedUnits ?? trade.units;
    const amount = effectiveUnits * trade.pricePerUnit;

    return (
      <div key={trade.id} className={`px-3 py-2 rounded-lg ${config.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon size={12} className={config.color} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground truncate">{trade.timeSlot}</span>
                {trade.buyer && (trade.status === "completed" || trade.status === "confirmed") && (
                  <span className="text-2xs text-muted-foreground">{trade.buyer}</span>
                )}
              </div>
              {isPartial && (
                <span className="text-2xs bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded-full">
                  Partial ({trade.matchedUnits}/{trade.units} kWh)
                </span>
              )}
            </div>
          </div>
          <div className="text-right ml-2">
            <p className={`text-xs font-bold ${trade.status === "expired" ? "text-muted-foreground line-through" : "text-foreground"}`}>
              ₹{Math.round(amount)}
            </p>
            <p className="text-2xs text-muted-foreground">
              ₹{Math.round(trade.pricePerUnit)}/unit · {isPartial ? `${Math.round(effectiveUnits)}/${Math.round(trade.units)}` : Math.round(effectiveUnits)} kWh
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, trades: Trade[]) => {
    if (trades.length === 0) return null;
    
    return (
      <div className="space-y-1.5">
        <h3 className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        <div className="space-y-1">
          {trades.map(renderTradeCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="screen-container !justify-start !pt-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate("/home")}
              className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-base font-bold text-foreground">Today's Trades</h1>
              <p className="text-2xs text-muted-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Summary Card */}
        <div className="bg-card rounded-xl p-3 shadow-card mb-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xs text-muted-foreground">Earned so far</p>
              <p className="text-xl font-bold text-primary">₹{Math.round(totalEarnings)}</p>
              <p className="text-2xs text-muted-foreground">{Math.round(totalUnits)} kWh sold</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap size={20} className="text-primary" />
            </div>
          </div>
        </div>

        {/* Trade Sections */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {renderSection("Completed", groupedTrades.completed)}
          {renderSection("Confirmed", groupedTrades.confirmed)}
          {renderSection("Planned Trades", groupedTrades.searching)}
          {renderSection("Expired", groupedTrades.expired)}

          {trades.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">No trades scheduled for today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayTradesPage;
