import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { TradeHistory } from "@/components/TradeHistory";

const OrderHistoryPage = () => {
  const navigate = useNavigate();

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4 !pb-6">
        <PageContainer gap={4}>
          <div className="flex items-center gap-3 animate-fade-in">
            <button
              onClick={() => navigate("/profile")}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Trade History</h1>
          </div>

          <div className="animate-slide-up">
            <TradeHistory role="seller" />
          </div>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default OrderHistoryPage;
