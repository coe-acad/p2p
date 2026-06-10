import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { TradeHistory } from "@/components/TradeHistory";
import { ReceiptText } from "lucide-react";

const OrderHistoryPage = () => {
  return (
    <MainAppShell>
      <div className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-background">
        <PageContainer gap={4}>
          <div className="flex items-center gap-3 fade-in opacity-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Trade history
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Catalogs you've published and trades buyers have confirmed.
              </p>
            </div>
          </div>

          <TradeHistory role="seller" />
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default OrderHistoryPage;
