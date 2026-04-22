import { useNavigate } from "react-router-dom";
import { ChevronLeft, Wallet, CreditCard, History } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";

const BuyerPaymentsPage = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();

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
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <History size={16} className="mx-auto mb-2 opacity-50" />
                  No transactions yet
                </div>
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
