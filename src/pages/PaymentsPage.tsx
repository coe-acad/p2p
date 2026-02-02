import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Wallet, Info, FileText, ChevronDown } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import { useUserData } from "@/hooks/useUserData";

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

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();

  // Demo data - completed transactions with payment status (matches home page "This Month" = ₹114)
  const transactions: PaymentTransaction[] = [
    { id: "1", date: "Jan 27", time: "10:00 PM", timeSlot: "6:00 AM - 7:00 AM", units: 2.0, pricePerUnit: 6.25, buyer: "GridCo", paymentStatus: "received" },
    { id: "2", date: "Jan 27", time: "10:00 PM", timeSlot: "8:00 AM - 9:00 AM", units: 2.0, pricePerUnit: 6.50, buyer: "TPDDL", paymentStatus: "received" },
    { id: "3", date: "Jan 27", time: "10:00 PM", timeSlot: "9:00 AM - 10:00 AM", units: 2.0, pricePerUnit: 6.75, buyer: "GridCo", paymentStatus: "confirmed" },
    { id: "4", date: "Jan 26", time: "10:00 PM", timeSlot: "10:00 AM - 11:00 AM", units: 2.5, pricePerUnit: 6.50, buyer: "BSES", paymentStatus: "confirmed" },
    { id: "5", date: "Jan 26", time: "10:00 PM", timeSlot: "7:00 AM - 8:00 AM", units: 1.8, pricePerUnit: 6.25, buyer: "GridCo", paymentStatus: "received" },
    { id: "6", date: "Jan 25", time: "10:00 PM", timeSlot: "11:00 AM - 12:00 PM", units: 3.2, pricePerUnit: 6.50, buyer: "TPDDL", paymentStatus: "received" },
    { id: "7", date: "Jan 25", time: "10:00 PM", timeSlot: "9:00 AM - 10:00 AM", units: 2.0, pricePerUnit: 6.25, buyer: "BSES", paymentStatus: "received" },
  ];

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "received":
        return {
          icon: CheckCircle2,
          label: "Received",
          color: "text-accent",
          bg: "bg-accent/10",
        };
      case "confirmed":
        return {
          icon: Clock,
          label: "Confirmed",
          color: "text-primary",
          bg: "bg-primary/10",
        };
      case "pending":
        return {
          icon: AlertCircle,
          label: "Pending",
          color: "text-amber-600",
          bg: "bg-amber-500/10",
        };
    }
  };

  // Calculate totals
  const totalAmount = transactions.reduce((sum, t) => sum + (t.units * t.pricePerUnit), 0);
  const receivedAmount = transactions
    .filter(t => t.paymentStatus === "received")
    .reduce((sum, t) => sum + (t.units * t.pricePerUnit), 0);

  // Group by date
  const groupedByDate = transactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, PaymentTransaction[]>);

  // Statements toggle
  const [showStatements, setShowStatements] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // Monthly statements data
  const monthlyData = [
    {
      month: "January 2026",
      totalUnits: 189,
      totalAmount: 1247,
      transactions: [
        { date: "Jan 24", time: "2:00 PM", units: 12.5, amount: 81 },
        { date: "Jan 23", time: "1:30 PM", units: 8.2, amount: 54 },
        { date: "Jan 22", time: "3:00 PM", units: 15.0, amount: 98 },
        { date: "Jan 21", time: "12:45 PM", units: 6.8, amount: 44 },
        { date: "Jan 20", time: "2:15 PM", units: 11.3, amount: 74 },
        { date: "Jan 19", time: "1:00 PM", units: 9.7, amount: 63 },
        { date: "Jan 18", time: "3:30 PM", units: 14.2, amount: 93 },
        { date: "Jan 17", time: "2:00 PM", units: 10.5, amount: 69 },
        { date: "Jan 16", time: "1:15 PM", units: 8.9, amount: 58 },
        { date: "Jan 15", time: "2:45 PM", units: 13.1, amount: 86 },
        { date: "Jan 14", time: "12:30 PM", units: 7.6, amount: 50 },
        { date: "Jan 13", time: "3:15 PM", units: 11.8, amount: 77 },
        { date: "Jan 12", time: "1:45 PM", units: 9.2, amount: 60 },
        { date: "Jan 11", time: "2:30 PM", units: 12.0, amount: 78 },
        { date: "Jan 10", time: "1:00 PM", units: 6.5, amount: 42 },
        { date: "Jan 9", time: "3:00 PM", units: 10.8, amount: 70 },
        { date: "Jan 8", time: "2:15 PM", units: 8.4, amount: 55 },
        { date: "Jan 7", time: "1:30 PM", units: 7.3, amount: 48 },
        { date: "Jan 6", time: "2:45 PM", units: 5.2, amount: 34 },
      ],
    },
    {
      month: "December 2025",
      totalUnits: 156,
      totalAmount: 1021,
      transactions: [
        { date: "Dec 31", time: "2:00 PM", units: 10.2, amount: 66 },
        { date: "Dec 30", time: "1:30 PM", units: 8.5, amount: 55 },
        { date: "Dec 29", time: "3:00 PM", units: 12.0, amount: 78 },
        { date: "Dec 28", time: "12:45 PM", units: 7.8, amount: 51 },
      ],
    },
    {
      month: "November 2025",
      totalUnits: 142,
      totalAmount: 928,
      transactions: [
        { date: "Nov 30", time: "2:30 PM", units: 9.5, amount: 62 },
        { date: "Nov 29", time: "1:15 PM", units: 11.2, amount: 73 },
      ],
    },
  ];

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
              <h1 className="text-base font-bold text-foreground">Payments</h1>
              <p className="text-2xs text-muted-foreground">Settlement account</p>
            </div>
          </div>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* UPI Info Card */}
        <div className="bg-card rounded-xl p-3 shadow-card mb-3 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-primary" />
              <p className="text-xs font-medium text-foreground">Settlement Account</p>
            </div>
            <button 
              onClick={() => navigate("/settings/payment")}
              className="text-2xs text-primary hover:underline"
            >
              Edit
            </button>
          </div>
          <p className="text-sm font-bold text-foreground">{userData.upiId || "Not set"}</p>
        </div>

        {/* Info Banner */}
        <div className="bg-muted/50 rounded-xl p-3 mb-3 flex items-start gap-2 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <Info size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-2xs text-muted-foreground">
            All trades are settled at end of month. This page updates daily at 10 PM with transactions from the previous 24 hours.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-card rounded-xl p-3 shadow-card mb-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xs text-muted-foreground">This Month</p>
              <p className="text-lg font-bold text-foreground">₹{Math.round(totalAmount)}</p>
            </div>
            <div>
              <p className="text-2xs text-muted-foreground">Received</p>
              <p className="text-lg font-bold text-accent">₹{Math.round(receivedAmount)}</p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {Object.entries(groupedByDate).map(([date, txns]) => (
            <div key={date} className="space-y-1.5 animate-slide-up">
              <h3 className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide">{date}</h3>
              <div className="space-y-1">
                {txns.map((txn) => {
                  const config = getStatusConfig(txn.paymentStatus);
                  const Icon = config.icon;
                  const amount = txn.units * txn.pricePerUnit;

                  return (
                    <div key={txn.id} className={`px-3 py-2 rounded-lg ${config.bg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Icon size={12} className={config.color} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-foreground truncate">{txn.timeSlot}</span>
                              <span className="text-2xs text-muted-foreground">{txn.buyer}</span>
                            </div>
                            <span className={`text-2xs ${config.color}`}>{config.label}</span>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs font-bold text-foreground">
                            +₹{Math.round(amount)}
                          </p>
                          <p className="text-2xs text-muted-foreground">
                            {Math.round(txn.units)} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">No transactions yet</p>
            </div>
          )}

          {/* View Statements Button */}
          <button
            onClick={() => setShowStatements(!showStatements)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border-t border-border mt-2"
          >
            <FileText size={16} />
            <span>View statements for previous months</span>
            <ChevronDown size={16} className={`transition-transform ${showStatements ? 'rotate-180' : ''}`} />
          </button>

          {/* Statements Section */}
          {showStatements && (
            <div className="space-y-2 animate-slide-up">
              {monthlyData.map((month) => (
                <div key={month.month} className="bg-card rounded-xl shadow-card overflow-hidden">
                  {/* Month Header - Clickable */}
                  <button
                    onClick={() => setExpandedMonth(expandedMonth === month.month ? null : month.month)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{month.month}</p>
                      <p className="text-xs text-muted-foreground">{month.totalUnits} kWh sold</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-primary">₹{month.totalAmount.toLocaleString()}</p>
                      <ChevronDown 
                        size={16}
                        className={`text-muted-foreground transition-transform ${expandedMonth === month.month ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Transactions - Expandable */}
                  {expandedMonth === month.month && (
                    <div className="border-t border-border divide-y divide-border/50 max-h-60 overflow-y-auto">
                      {month.transactions.map((tx, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-muted/20">
                          <div>
                            <p className="text-xs font-medium text-foreground">{tx.date}</p>
                            <p className="text-[10px] text-muted-foreground">{tx.time} • {tx.units} kWh</p>
                          </div>
                          <p className="text-xs font-semibold text-accent">+₹{tx.amount}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
