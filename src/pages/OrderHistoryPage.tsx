import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package, CheckCircle2, Clock, XCircle, ChevronRight, Calendar } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import { useUserData } from "@/hooks/useUserData";

type OrderStatus = "completed" | "active" | "cancelled" | "partial";

interface Order {
  id: string;
  date: string;
  timeSlots: number;
  totalUnits: number;
  totalEarnings: number;
  status: OrderStatus;
  completedSlots: number;
}

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData } = useUserData();
  const isReturningUser = userData.isReturningUser ?? false;

  // Demo orders data - would come from backend in real app
  const orders: Order[] = isReturningUser ? [
    { id: "ORD-2026-0127", date: "Jan 27, 2026", timeSlots: 5, totalUnits: 12, totalEarnings: 78, status: "active", completedSlots: 2 },
    { id: "ORD-2026-0126", date: "Jan 26, 2026", timeSlots: 4, totalUnits: 10, totalEarnings: 65, status: "completed", completedSlots: 4 },
    { id: "ORD-2026-0125", date: "Jan 25, 2026", timeSlots: 6, totalUnits: 15, totalEarnings: 98, status: "completed", completedSlots: 6 },
    { id: "ORD-2026-0124", date: "Jan 24, 2026", timeSlots: 3, totalUnits: 7, totalEarnings: 46, status: "partial", completedSlots: 2 },
    { id: "ORD-2026-0123", date: "Jan 23, 2026", timeSlots: 5, totalUnits: 12, totalEarnings: 78, status: "completed", completedSlots: 5 },
    { id: "ORD-2026-0122", date: "Jan 22, 2026", timeSlots: 4, totalUnits: 9, totalEarnings: 59, status: "completed", completedSlots: 4 },
    { id: "ORD-2026-0121", date: "Jan 21, 2026", timeSlots: 2, totalUnits: 5, totalEarnings: 33, status: "cancelled", completedSlots: 0 },
    { id: "ORD-2026-0120", date: "Jan 20, 2026", timeSlots: 5, totalUnits: 13, totalEarnings: 85, status: "completed", completedSlots: 5 },
  ] : [];

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          label: t("common.completed"),
          color: "text-accent",
          bg: "bg-accent/10",
        };
      case "active":
        return {
          icon: Clock,
          label: t("common.inProgress"),
          color: "text-primary",
          bg: "bg-primary/10",
        };
      case "partial":
        return {
          icon: Clock,
          label: t("trades.partial"),
          color: "text-amber-600",
          bg: "bg-amber-500/10",
        };
      case "cancelled":
        return {
          icon: XCircle,
          label: t("common.cancelled"),
          color: "text-destructive",
          bg: "bg-destructive/10",
        };
    }
  };

  // Group by month
  const groupedOrders = orders.reduce((acc, order) => {
    const month = order.date.split(" ").slice(0, 2).join(" ");
    if (!acc[month]) acc[month] = [];
    acc[month].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // Summary stats
  const completedOrders = orders.filter(o => o.status === "completed" || o.status === "partial").length;
  const totalEarned = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.totalEarnings, 0);

  return (
    <div className="screen-container !justify-start !pt-4">
      <div className="w-full max-w-md flex flex-col h-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate("/profile")}
              className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-base font-bold text-foreground">{t("orders.title")}</h1>
              <p className="text-2xs text-muted-foreground">{t("orders.subtitle")}</p>
            </div>
          </div>
          <SamaiLogo size="sm" showText={false} />
        </div>

        {/* Summary Card */}
        {isReturningUser && (
          <div className="bg-card rounded-xl p-4 shadow-card mb-4 animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xs text-muted-foreground">{t("orders.totalOrders")}</p>
                <p className="text-xl font-bold text-foreground">{orders.length}</p>
                <p className="text-2xs text-muted-foreground">{completedOrders} {t("common.completed").toLowerCase()}</p>
              </div>
              <div>
                <p className="text-2xs text-muted-foreground">{t("orders.totalEarnings")}</p>
                <p className="text-xl font-bold text-accent">₹{totalEarned}</p>
                <p className="text-2xs text-muted-foreground">{t("orders.allTime")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {isReturningUser ? (
            Object.entries(groupedOrders).map(([month, monthOrders]) => (
              <div key={month} className="space-y-2 animate-slide-up">
                <div className="flex items-center gap-2 px-1">
                  <Calendar size={12} className="text-muted-foreground" />
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{month}</h3>
                </div>
                
                <div className="space-y-2">
                  {monthOrders.map((order) => {
                    const config = getStatusConfig(order.status);
                    const StatusIcon = config.icon;

                    return (
                      <button
                        key={order.id}
                        onClick={() => {
                          // Could navigate to order detail page
                        }}
                        className="w-full bg-card rounded-xl p-3 shadow-card hover:bg-muted/30 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                              <Package size={18} className={config.color} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{order.date}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-2xs text-muted-foreground">
                                  {order.timeSlots} {t("orders.slots")} • {order.totalUnits} kWh
                                </span>
                                <span className={`text-2xs font-medium ${config.color}`}>
                                  {config.label}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className={`text-sm font-bold ${order.status === "cancelled" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                ₹{order.totalEarnings}
                              </p>
                              {order.status === "active" && (
                                <p className="text-2xs text-primary">
                                  {order.completedSlots}/{order.timeSlots} {t("orders.done")}
                                </p>
                              )}
                              {order.status === "partial" && (
                                <p className="text-2xs text-amber-600">
                                  {order.completedSlots}/{order.timeSlots} {t("orders.filled")}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            /* New user - empty state */
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{t("orders.noOrders")}</p>
              <p className="text-xs text-muted-foreground max-w-[220px] mx-auto">
                {t("orders.noOrdersMessage")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
