import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, Clock, AlertCircle, Zap, TrendingUp, TrendingDown, Sparkles, Building2, Calendar, Timer } from "lucide-react";

type PaymentStatus = "received" | "confirmed" | "pending";

interface PaymentTransaction {
  id: string;
  date: string;
  time: string;
  timeSlot: string;
  units: number;
  pricePerUnit: number;
  buyer: string;
  paymentStatus: PaymentStatus;
}

interface PaymentDetailSheetProps {
  transaction: PaymentTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentDetailSheet = ({ transaction, open, onOpenChange }: PaymentDetailSheetProps) => {
  if (!transaction) return null;

  const amount = transaction.units * transaction.pricePerUnit;
  
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "received":
        return {
          icon: CheckCircle2,
          label: "Payment Received",
          color: "text-accent",
          bg: "bg-accent/10",
          description: "Funds credited to your UPI account"
        };
      case "confirmed":
        return {
          icon: Clock,
          label: "Trade Confirmed",
          color: "text-primary",
          bg: "bg-primary/10",
          description: "Settlement pending at month end"
        };
      case "pending":
        return {
          icon: AlertCircle,
          label: "Pending Confirmation",
          color: "text-amber-600",
          bg: "bg-amber-500/10",
          description: "Awaiting buyer confirmation"
        };
    }
  };

  const config = getStatusConfig(transaction.paymentStatus);
  const StatusIcon = config.icon;

  // Generate insights based on trade data
  const avgMarketRate = 6.35;
  const rateVsMarket = ((transaction.pricePerUnit - avgMarketRate) / avgMarketRate) * 100;
  const isAboveAvg = rateVsMarket > 0;
  
  const insights = [
    {
      icon: isAboveAvg ? TrendingUp : TrendingDown,
      title: isAboveAvg ? "Above Market Rate" : "Market Rate",
      description: isAboveAvg 
        ? `You sold ${Math.abs(rateVsMarket).toFixed(1)}% above the average market rate of ₹${avgMarketRate}/kWh`
        : `Sold at market rate. Peak hours (7-10 AM) often fetch ₹7+/kWh`,
      positive: isAboveAvg
    },
    {
      icon: CheckCircle2,
      title: "Completed Sale",
      description: "Full quantity sold without partial fill or cancellation",
      positive: true
    },
    {
      icon: Zap,
      title: transaction.timeSlot.includes("6:00") || transaction.timeSlot.includes("7:00") ? "Morning Peak" : "Standard Hours",
      description: transaction.timeSlot.includes("6:00") || transaction.timeSlot.includes("7:00")
        ? "Morning slots typically have higher demand from commercial buyers"
        : "Consider targeting 6-9 AM slots for potentially higher rates",
      positive: transaction.timeSlot.includes("6:00") || transaction.timeSlot.includes("7:00")
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-left">Order Details</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(85vh-80px)] py-4 space-y-4">
          {/* Amount Header */}
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-foreground">+₹{Math.round(amount)}</p>
            <p className="text-sm text-muted-foreground mt-1">{Math.round(transaction.units)} kWh @ ₹{transaction.pricePerUnit}/kWh</p>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${config.bg}`}>
            <StatusIcon size={20} className={config.color} />
            <div>
              <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Trade Information</h3>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span className="text-xs">Date</span>
                </div>
                <span className="text-sm font-medium text-foreground">{transaction.date}, 2026</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer size={14} />
                  <span className="text-xs">Time Window</span>
                </div>
                <span className="text-sm font-medium text-foreground">{transaction.timeSlot}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 size={14} />
                  <span className="text-xs">Buyer</span>
                </div>
                <span className="text-sm font-medium text-foreground">{transaction.buyer}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap size={14} />
                  <span className="text-xs">Energy Sold</span>
                </div>
                <span className="text-sm font-medium text-foreground">{transaction.units} kWh</span>
              </div>
            </div>
          </div>

          {/* Samai Insights */}
          <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Samai Insights</h3>
            </div>
            
            <div className="space-y-3">
              {insights.map((insight, idx) => {
                const InsightIcon = insight.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${insight.positive ? 'bg-accent/15' : 'bg-muted'}`}>
                      <InsightIcon size={12} className={insight.positive ? 'text-accent' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{insight.title}</p>
                      <p className="text-2xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-card rounded-xl p-4 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">Payment Breakdown</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Energy Value</span>
                <span className="text-foreground">₹{(transaction.units * transaction.pricePerUnit).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="text-foreground">₹0.00</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="text-sm font-semibold text-foreground">Net Earnings</span>
                <span className="text-sm font-bold text-accent">₹{Math.round(amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentDetailSheet;
