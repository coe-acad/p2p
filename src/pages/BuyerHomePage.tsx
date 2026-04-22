import { useUserData } from "@/hooks/useUserData";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import { ShoppingCart } from "lucide-react";

const BuyerHomePage = () => {
  const { userData } = useUserData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4 !pb-6">
        <PageContainer gap={4}>
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-foreground">
              {getGreeting()} {userData.name || "Buyer"}!
            </h1>
          </div>

          {/* Buyer Welcome Card */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-6 shadow-card animate-slide-up border border-teal-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                <ShoppingCart size={24} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Welcome to Samai Buyer</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse clean energy from local solar producers and make your first purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder Sections */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-xs font-medium text-muted-foreground px-1">Features Coming Soon</p>
            <div className="bg-card rounded-xl shadow-card divide-y divide-border">
              <div className="p-4 text-center text-sm text-muted-foreground">
                🔍 Browse Available Energy Listings
              </div>
              <div className="p-4 text-center text-sm text-muted-foreground">
                🛒 Make Purchases
              </div>
              <div className="p-4 text-center text-sm text-muted-foreground">
                📋 View Purchase History
              </div>
              <div className="p-4 text-center text-sm text-muted-foreground">
                💳 Payment Integration
              </div>
            </div>
          </div>

          {/* Your Details */}
          <div className="bg-white rounded-xl shadow-card p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Your Details</p>
            <div className="space-y-2 text-sm">
              {userData.name && <p><span className="text-muted-foreground">Name:</span> {userData.name}</p>}
              <p><span className="text-muted-foreground">Phone:</span> {userData.phone}</p>
              <p><span className="text-muted-foreground">Role:</span> Buyer</p>
            </div>
          </div>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default BuyerHomePage;
