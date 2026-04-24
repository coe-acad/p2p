import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Check, Zap, ChevronDown, AlertCircle } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import MainAppShell from "@/components/layout/MainAppShell";
import { getPayments, Payment } from "@/services/paymentService";

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [expandedPayments, setExpandedPayments] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await getPayments();
        setPayments(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load payments:", err);
        setError("Failed to load payment history");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const pendingPayments = payments.filter(p => p.status === "pending");
  const totalAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

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

          {/* Error State */}
          {error && !loading && (
            <div className="bg-destructive/10 rounded-xl p-3 flex gap-3 animate-slide-up mx-auto w-full max-w-2xl">
              <AlertCircle size={18} className="text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Pending Payments Card */}
          <div className="bg-card rounded-xl shadow-card animate-slide-up overflow-hidden flex flex-col flex-shrink-0 max-h-40 mx-auto w-full max-w-2xl">
            <button
              onClick={() => setExpandedPayments(!expandedPayments)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-foreground">Pending Payments</h3>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                  {loading ? "..." : pendingPayments.length}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform ${expandedPayments ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedPayments && (
              <div className="border-t border-border px-4 space-y-2 overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : pendingPayments.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No pending payments</div>
                ) : (
                  pendingPayments.map((payment) => (
                    <div key={payment.payment_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Zap size={16} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {payment.counterparty_phone ? `To ${payment.counterparty_phone}` : payment.description || "Energy Payment"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.currency} • Status: {payment.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-foreground">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
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
