import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, User, Wallet, Package, LogOut } from "lucide-react";
import { useUserData, extractLocality } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";

const BuyerProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData } = useUserData();
  const { logout } = useAuth();

  const locality = extractLocality(userData.address);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const sections = [
    {
      title: t("profile.account"),
      items: [
        { icon: User, label: t("profile.personalDetails"), sublabel: userData.name || userData.consumerId ? `${userData.name || "Not set"} • ${userData.consumerId || "Not set"}` : "Complete profile", route: "/buyer-settings/profile" },
        { icon: Wallet, label: t("payments.title"), sublabel: userData.upiId || t("profile.setUpPayment"), route: "/buyer-settings/payment" },
      ]
    },
    {
      title: t("profile.yourOrders"),
      items: [
        { icon: Package, label: "Purchase History", sublabel: "View all your energy purchases", route: "/buyer-history" },
      ]
    },
  ];

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
          <h1 className="text-lg font-bold text-foreground">{t("profile.title")}</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3 animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
            <User size={24} className="text-teal-600" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{userData.name}</p>
            <p className="text-xs text-muted-foreground">{userData.phone}</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {sections.map((section, sIndex) => (
            <div key={sIndex} className="animate-slide-up" style={{ animationDelay: `${0.1 * (sIndex + 1)}s` }}>
              <p className="text-xs font-medium text-muted-foreground mb-2 px-1">{section.title}</p>
              <div className="bg-card rounded-xl shadow-card divide-y divide-border">
                {section.items.map((item, iIndex) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={iIndex}
                      onClick={() => item.route && navigate(item.route)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Icon size={16} className="text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-muted-foreground rotate-180" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Logout</span>
        </button>
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default BuyerProfilePage;
