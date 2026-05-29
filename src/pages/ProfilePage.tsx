import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, User, FileText, Wallet, Package, LogOut, ChevronRight } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { PageContainer } from "@/components/layout/PageContainer";
import MainAppShell from "@/components/layout/MainAppShell";
import VCUploadModal from "@/components/modals/VCUploadModal";
import VCDetailsView from "@/components/VCDetailsView";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData } = useUserData();
  const { logout } = useAuth();
  const [showVCModal, setShowVCModal] = useState(false);
  const [showVCDetails, setShowVCDetails] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const vcData = userData?.vc_data as any || {};
  const hasVC = Object.keys(vcData).length > 0;

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Personal Details", sublabel: userData.name || "Set your name", route: "/settings/profile" },
        {
          icon: FileText,
          label: "VC Documents",
          sublabel: hasVC ? "View details" : "Upload credentials",
          action: () => hasVC ? setShowVCDetails(true) : setShowVCModal(true)
        },
      ]
    },
    {
      title: "Transactions",
      items: [
        { icon: Package, label: "Trade History", sublabel: "View all your trades", route: "/order-history" },
        { icon: Wallet, label: "Payments", sublabel: "Manage payment methods", route: "/payments" },
      ]
    },
  ];

  if (showVCDetails) {
    return (
      <MainAppShell>
        <div className="screen-container !justify-start !pt-4 !pb-6">
          <PageContainer gap={4}>
            <VCDetailsView onBack={() => setShowVCDetails(false)} />
          </PageContainer>
        </div>
      </MainAppShell>
    );
  }

  return (
    <MainAppShell>
      <div className="screen-container !justify-start !pt-4 !pb-6">
        <PageContainer gap={4}>
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <button
            onClick={() => navigate("/home")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("profile.title")}</h1>
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
                      onClick={() => item.action ? item.action() : item.route && navigate(item.route)}
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

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Logout</span>
        </button>

        {/* VC Upload Modal */}
        <VCUploadModal
          isOpen={showVCModal}
          onClose={() => setShowVCModal(false)}
          onSuccess={() => {
            setShowVCModal(false);
            // Optionally refresh user data here
          }}
        />
        </PageContainer>
      </div>
    </MainAppShell>
  );
};

export default ProfilePage;
