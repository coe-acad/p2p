import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Zap, Battery, Gauge, Bell, Globe, FileText, Settings, ChevronRight, MessageSquare, Sparkles, ShoppingCart, Building2, CalendarClock, Wallet } from "lucide-react";
import { useUserData, extractLocality } from "@/hooks/useUserData";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();
  
  const locality = extractLocality(userData.address);

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Personal Details", sublabel: userData.name, route: "/settings/mobile" },
        { icon: ShoppingCart, label: "Your Role", sublabel: "Seller", route: "/settings/role" },
        { icon: Settings, label: "Home Profile", sublabel: "3 BHK • Residential", route: "/settings/devices?type=profile" },
        { icon: Building2, label: "Location", sublabel: locality, route: "/settings/discom" },
      ]
    },
    {
      title: "Devices",
      items: [
        { icon: Zap, label: "Solar Inverter", sublabel: "Growatt • 5 kW", route: "/settings/devices?type=inverter" },
        { icon: Battery, label: "Battery", sublabel: "Luminous • 10 kWh", route: "/settings/devices?type=battery" },
        { icon: Gauge, label: "Smart Meter", sublabel: "Genus • Bi-directional", route: "/settings/devices?type=meter" },
      ]
    },
    {
      title: "Location & DISCOM",
      items: [
        { icon: Globe, label: "DISCOM Settings", sublabel: `${userData.discom || "BESCOM"} • ${locality}`, route: "/settings/discom" },
        { icon: FileText, label: "VC Documents", sublabel: "Connection VC Verified ✓", route: "/settings/vc-documents" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Sparkles, label: "How Samai Helps", sublabel: userData.automationLevel === "auto" ? "Auto-place orders" : "Show recommendations", route: "/settings/automation" },
        { icon: Wallet, label: "Payment Method", sublabel: userData.upiId || "Not set", route: "/settings/payment" },
        { icon: MessageSquare, label: "Your Context", sublabel: userData.userContext ? (userData.userContext.length > 25 ? userData.userContext.substring(0, 25) + "..." : userData.userContext) : "Not set", route: "/settings/context" },
        { icon: CalendarClock, label: "Vacations & Holidays", sublabel: userData.schoolHolidays || userData.summerVacationStart ? "Dates saved" : "Not set", route: "/settings/vacations" },
        { icon: Bell, label: "Notifications", sublabel: "Enabled", route: null },
      ]
    },
  ];

  return (
    <div className="screen-container !justify-start !pt-4 !pb-6">
      <div className="w-full max-w-md flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button 
            onClick={() => navigate("/home")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Profile & Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3 animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={24} className="text-primary" />
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
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Demo Reset */}
        <button
          onClick={() => navigate("/")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
        >
          ← Start demo over
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
