import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircle, Lightbulb, HelpCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";

const BuyerAskSamaiPage = () => {
  const navigate = useNavigate();

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
            <h1 className="text-lg font-bold text-foreground">Ask Samai</h1>
          </div>

          {/* Samai Assistant Card */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-6 shadow-card animate-slide-up border border-teal-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Samai Assistant</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Get personalized recommendations for your energy purchases and usage patterns that you have.
                </p>
              </div>
            </div>
          </div>

          {/* Features Coming Soon */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-xs font-medium text-muted-foreground px-1">Available Features</p>
            <div className="space-y-2">
              <div className="bg-card rounded-xl p-4 shadow-card border border-border flex items-start gap-3">
                <Lightbulb size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Smart Recommendations</p>
                  <p className="text-xs text-muted-foreground">Get suggestions for optimal energy purchases</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card border border-border flex items-start gap-3">
                <HelpCircle size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Quick Answers</p>
                  <p className="text-xs text-muted-foreground">Ask about energy pricing, local producers, and more</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-sm text-amber-900">
              💡 Chat interface coming soon. In the meantime, explore energy listings and make purchases.
            </p>
          </div>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default BuyerAskSamaiPage;
