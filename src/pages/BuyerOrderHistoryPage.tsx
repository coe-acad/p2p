import { useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";

const BuyerOrderHistoryPage = () => {
  const navigate = useNavigate();

  const dummyOrders = [
    {
      id: 1,
      seller: "Green Energy Solar Farm",
      amount: 2500,
      quantity: 25,
      date: "2024-04-20",
      status: "Completed",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 2,
      seller: "Renewable Power Solutions",
      amount: 1800,
      quantity: 18,
      date: "2024-04-19",
      status: "Completed",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 3,
      seller: "Solar Innovation Co.",
      amount: 3200,
      quantity: 32,
      date: "2024-04-18",
      status: "Completed",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 4,
      seller: "EcoEnergy Farms",
      amount: 2100,
      quantity: 21,
      date: "2024-04-17",
      status: "Completed",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 5,
      seller: "Clean Power Ltd",
      amount: 1500,
      quantity: 15,
      date: "2024-04-16",
      status: "Completed",
      statusColor: "bg-green-50 text-green-700 border-green-200",
    },
  ];

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4 !pb-6">
        <PageContainer gap={4}>
          {/* Header */}
          <div className="flex items-center gap-3 animate-fade-in">
            <button
              onClick={() => navigate("/buyer-profile")}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Purchase History</h1>
          </div>

          {/* Orders List */}
          <div className="space-y-3 animate-slide-up">
            {dummyOrders.length > 0 ? (
              dummyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-xl p-4 shadow-card border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart size={18} className="text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.seller}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.quantity} kWh • {order.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        ₹{order.amount.toLocaleString()}
                      </p>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-1 border ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-xl p-8 text-center border border-border">
                <ShoppingCart size={32} className="mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No purchases yet</p>
              </div>
            )}
          </div>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default BuyerOrderHistoryPage;
