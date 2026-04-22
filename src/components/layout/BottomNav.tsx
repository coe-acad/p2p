import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wallet, MessageCircle, Home, User } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import chatbotIcon from "@/assets/chatbot-icon.png";
import SamaiLogo from "@/components/SamaiLogo";

type TabType = "chat" | "home" | "statements";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: TabType) => void;
  mode?: "mobile" | "desktop";
}

const getRouteTab = (pathname: string): TabType => {
  if (pathname.startsWith("/ask-samai") || pathname.startsWith("/buyer-ask-samai")) return "chat";
  if (pathname.startsWith("/payments") || pathname.startsWith("/buyer-payments")) return "statements";
  if (pathname.startsWith("/buyer-home")) return "home";
  if (pathname.startsWith("/home")) return "home";
  return "home";
};

export const BottomNav = ({ activeTab, onTabChange, mode }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { userData } = useUserData();
  const isBuyer = userData.intent === "buy";
  const resolvedActiveTab = (activeTab as TabType | undefined) ?? getRouteTab(location.pathname);

  const navigateTo = (tab: TabType) => {
    if (tab === "chat") navigate(isBuyer ? "/buyer-ask-samai" : "/ask-samai");
    if (tab === "home") navigate(isBuyer ? "/buyer-home" : "/home");
    if (tab === "statements") navigate(isBuyer ? "/buyer-payments" : "/payments");
    onTabChange?.(tab);
  };

  const mobileNav = (
    <div className="border-t border-border/40 bg-card/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-xl items-center justify-around rounded-2xl border border-border/40 bg-white/70 px-2 py-2 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.28)]">
      <button
        onClick={() => navigateTo("chat")}
        className={`flex min-w-[5.5rem] flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
          resolvedActiveTab === "chat" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <img src={chatbotIcon} alt="Samai" className="w-6 h-6" />
        <span className={`text-[10px] font-medium ${resolvedActiveTab === "chat" ? "text-primary" : ""}`}>{t("nav.askSamai")}</span>
      </button>

      <button
        onClick={() => navigateTo("home")}
        className={`flex items-center justify-center rounded-xl px-4 py-1 transition-colors ${
          resolvedActiveTab === "home" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="w-12 h-12 animate-spin-slow flex items-center justify-center">
          <SamaiLogo size="sm" showText={false} />
        </div>
      </button>

      <button
        onClick={() => navigateTo("statements")}
        className={`flex min-w-[5.5rem] flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
          resolvedActiveTab === "statements" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Wallet size={20} />
        <span className={`text-[10px] font-medium ${resolvedActiveTab === "statements" ? "text-primary" : ""}`}>{t("nav.payments")}</span>
      </button>
      </div>
    </div>
  );

  const desktopItems = [
    {
      id: "home" as const,
      label: "Home",
      description: "Overview, trades, and setup",
      icon: Home,
    },
    {
      id: "chat" as const,
      label: t("nav.askSamai"),
      description: "Voice and text commands",
      icon: MessageCircle,
      image: chatbotIcon,
    },
    {
      id: "statements" as const,
      label: t("nav.payments"),
      description: "Settlements and history",
      icon: Wallet,
    },
  ];

  const desktopNav = (
    <div className="hidden h-full flex-col border-r border-border/40 bg-card/70 px-5 py-6 backdrop-blur-md lg:flex">
      <button
        onClick={() => navigate(isBuyer ? "/buyer-home" : "/home")}
        className="flex items-center gap-3 rounded-2xl border border-border/50 bg-white/70 px-4 py-3 text-left shadow-sm transition-colors hover:bg-white/90"
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${isBuyer ? "from-teal-100 to-green-50" : "from-orange-100 to-amber-50"}`}>
          <SamaiLogo size="sm" showText={false} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Samai</p>
          <p className="text-xs text-muted-foreground">{isBuyer ? "Clean energy marketplace" : "Solar trading workspace"}</p>
        </div>
      </button>

      <div className="mt-8 space-y-2">
        {desktopItems.map((item) => {
          const Icon = item.icon;
          const isActive = resolvedActiveTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                isActive
                  ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                  : "border-transparent text-muted-foreground hover:border-border/50 hover:bg-white/60 hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                  isActive ? "bg-primary/15" : "bg-muted/70"
                }`}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label} className="h-6 w-6" />
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className={`text-xs ${isActive ? "text-primary/80" : "text-muted-foreground"}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <button
          onClick={() => navigate(isBuyer ? "/buyer-profile" : "/profile")}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-white/60 px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/70">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">Profile</p>
            <p className="text-xs text-muted-foreground">Account and preferences</p>
          </div>
        </button>
      </div>
    </div>
  );

  if (mode === "desktop") return desktopNav;
  if (mode === "mobile") return mobileNav;

  return (
    <>
      <div className="lg:hidden">{mobileNav}</div>
      {desktopNav}
    </>
  );
};

export default BottomNav;
