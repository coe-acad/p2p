import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Check, Zap, ChevronDown } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import MainAppShell from "@/components/layout/MainAppShell";

interface Trade {
  id: string;
  seller: string;
  amount: number;
  units: number;
  date: string;
}

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [expandedTrades, setExpandedTrades] = useState(false);

  // Mock trade data - replace with actual data from backend
  const activeTrades: Trade[] = [
    { id: "1", seller: "Solar Farm A", amount: 450, units: 50, date: "2026-04-20" },
    { id: "2", seller: "Rooftop Solar B", amount: 320, units: 40, date: "2026-04-19" },
    { id: "3", seller: "Grid Clean C", amount: 280, units: 35, date: "2026-04-18" },
  ];

  const totalAmount = activeTrades.reduce((sum, trade) => sum + trade.amount, 0);

  return (
    <MainAppShell>
      <div className="w-full flex flex-col h-full px-4 lg:px-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 animate-fade-in flex-shrink-0 mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/home")}
                className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft size={18} className="text-foreground" />
              </button>
              <div>
                <h1 className="text-base font-bold text-foreground">Payments</h1>
                <p className="text-2xs text-muted-foreground">Make a payment</p>
              </div>
            </div>
            <SamaiLogo size="sm" showText={false} />
          </div>

          {/* Info Card */}
          <div className="bg-card rounded-xl p-2 shadow-card animate-slide-up space-y-1 flex-shrink-0 mx-auto w-full max-w-2xl">
            <h3 className="text-xs font-semibold text-foreground">How you'll receive payments</h3>
            <ul className="space-y-0.5">
              <li className="flex items-center gap-1.5">
                <Check size={12} className="text-accent flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground">Earnings from sold energy are settled monthly</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check size={12} className="text-accent flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground">Direct deposit to your UPI account</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check size={12} className="text-accent flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground">Track all transactions on this page</span>
              </li>
            </ul>
          </div>

          {/* Total Amount Card */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl p-2 shadow-card animate-slide-up border border-primary/20 flex-shrink-0 mx-auto w-full max-w-2xl">
            <p className="text-[10px] text-muted-foreground">Total Amount to Pay</p>
            <p className="text-xl font-bold text-foreground">₹{totalAmount.toLocaleString()}</p>
          </div>

          {/* Active Trades Card */}
          <div className="bg-card rounded-xl shadow-card animate-slide-up overflow-hidden flex flex-col flex-shrink-0 max-h-40 mx-auto w-full max-w-2xl">
            <button
              onClick={() => setExpandedTrades(!expandedTrades)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-foreground">Active Trades</h3>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                  {activeTrades.length}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform ${expandedTrades ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedTrades && (
              <div className="border-t border-border px-4 space-y-2 overflow-y-auto flex-1">
                {activeTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Zap size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{trade.seller}</p>
                        <p className="text-xs text-muted-foreground">{trade.units} kWh</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">₹{trade.amount}</p>
                      <p className="text-xs text-muted-foreground">{trade.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Button - Fixed at Bottom */}
          <div className="border-t border-border pt-3 pb-3 bg-background flex-shrink-0 mt-auto mx-auto w-full max-w-2xl">
            <button
              onClick={() => navigate("/payment")}
              className="w-full btn-solar !py-4 text-lg font-semibold flex items-center justify-center gap-3"
            >
              <CreditCard size={24} />
              Make Payment
            </button>
          </div>
      </div>
    </MainAppShell>
  );
};

export default PaymentsPage;
