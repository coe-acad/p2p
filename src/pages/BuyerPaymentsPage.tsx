import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Wallet, CreditCard, History, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { getPayments, Payment } from "@/services/paymentService";

const BuyerPaymentsPage = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await getPayments();
        setPayments(data);
      } catch (error) {
        console.error("Failed to load payments:", error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-accent" />;
      case "pending":
        return <Clock size={16} className="text-amber-600" />;
      case "failed":
        return <AlertCircle size={16} className="text-destructive" />;
      default:
        return <History size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4 !pb-6">
        <PageContainer gap={4}>
          {/* Header */}
          <div className="flex items-center gap-3 animate-fade-in">
            <button
              onClick={() => navigate("/buyer-home")}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Payments</h1>
          </div>

          {/* Payment Method Card */}
          <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up border border-teal-200/50">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <CreditCard size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Payment Method</p>
                <p className="text-sm text-muted-foreground mt-1">UPI / Card for energy purchases</p>
              </div>
            </div>
            {userData.upiId ? (
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                <p className="text-sm text-teal-900">
                  <span className="font-medium">UPI ID:</span> {userData.upiId}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payment method added yet</p>
            )}
          </div>

          {/* Payment History */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Recent Transactions</p>
            <div className="bg-card rounded-xl shadow-card">
              <div className="divide-y divide-border">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : payments.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <History size={16} className="mx-auto mb-2 opacity-50" />
                    No transactions yet
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.payment_id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            {getStatusIcon(payment.status)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {payment.counterparty_phone ? `To ${payment.counterparty_phone}` : payment.description || "Energy Purchase"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-foreground">₹{payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground capitalize">{payment.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-4 shadow-card animate-slide-up border border-teal-200" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-600 font-medium">Account Balance</p>
                <p className="text-2xl font-bold text-foreground mt-1">₹0</p>
              </div>
              <Wallet size={32} className="text-teal-500 opacity-20" />
            </div>
          </div>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default BuyerPaymentsPage;
