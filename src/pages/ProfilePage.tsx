import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, User, Zap, Battery, Gauge, Bell, Globe, FileText, Settings, ChevronRight, MessageSquare, Sparkles, ShoppingCart, Building2, CalendarClock, Wallet, Package } from "lucide-react";
import { useUserData, extractLocality } from "@/hooks/useUserData";
import { VCExtractedData } from "@/utils/vcPdfParser";
import { loadEarningsSuggestion } from "@/utils/earningsSuggestion";
import { getUserProfile, UserProfileResponse } from "@/api/users";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData, setUserData } = useUserData();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const hasFetchedRef = useRef(false);
  
  const loginRaw = localStorage.getItem("samai_login_user");
  let loginIsVerified = false;
  if (loginRaw) {
    try {
      loginIsVerified = Boolean(JSON.parse(loginRaw)?.is_vc_verified);
    } catch {
      loginIsVerified = false;
    }
  }

  useEffect(() => {
    const mobileNumber = localStorage.getItem("samai_mobile_number") || userData.phone;
    const shouldFetch = loginIsVerified || Boolean(userData.isVCVerified);
    const cachedVc = localStorage.getItem("samai_vc_data");
    if (!mobileNumber || !shouldFetch || cachedVc || hasFetchedRef.current) {
      return;
    }

    let isActive = true;
    hasFetchedRef.current = true;
    (async () => {
      try {
        const profile = await getUserProfile(mobileNumber);
        if (!isActive) return;
        setProfileData(profile);
        if (profile.merged) {
          localStorage.setItem("samai_vc_data", JSON.stringify(profile.merged));
        }

        setUserData({
          name: profile.merged?.fullName || profile.user?.name || "",
          phone: profile.user?.mobile_number || mobileNumber,
          address: profile.merged?.address || "",
          discom: profile.merged?.issuerName || "",
          consumerId: profile.merged?.consumerNumber || "",
          isVCVerified: profile.is_vc_verified,
        });
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [loginIsVerified, setUserData, userData.isVCVerified, userData.phone]);

  const cachedVcRaw = localStorage.getItem("samai_vc_data");
  let cachedVcData: VCExtractedData | null = null;
  if (cachedVcRaw) {
    try {
      cachedVcData = JSON.parse(cachedVcRaw);
    } catch {
      cachedVcData = null;
    }
  }

  const isVerified = Boolean(profileData?.is_vc_verified ?? loginIsVerified ?? userData.isVCVerified);
  const vcData = (profileData?.merged || cachedVcData || {}) as VCExtractedData;
  const profileUser = profileData?.user;
  const earningsSuggestion = loadEarningsSuggestion();
  const earningsLabel = earningsSuggestion
    ? `₹${earningsSuggestion.minEarnings}–₹${earningsSuggestion.maxEarnings} / day`
    : t("profile.notSet");

  const address = vcData.address || userData.address;
  const locality = extractLocality(address);
  const roleLabel = profileUser?.role || localStorage.getItem("samai_user_role") || "";
  const safeLocality = isVerified ? locality : "";
  const discomValue = vcData.issuerName || userData.discom;
  const discomLabel = isVerified
    ? [discomValue, safeLocality].filter(Boolean).join(" • ")
    : "";
  const displayName = isVerified ? (vcData.fullName || profileUser?.name || userData.name) : "";
  const inverterDetail = isVerified && vcData.generationCapacity
    ? `Solar • ${vcData.generationCapacity} kW`
    : "";
  const batteryDetail = isVerified && vcData.batteryCapacity
    ? `Storage • ${vcData.batteryCapacity}`
    : "";
  const meterDetail = isVerified
    ? [vcData.issuerName, vcData.meterNumber].filter(Boolean).join(" • ")
    : "";
  const profileDetail = isVerified
    ? [displayName, safeLocality].filter(Boolean).join(", ")
    : "";

  const sections = [
    {
      title: t("profile.account"),
      items: [
        { icon: User, label: t("profile.personalDetails"), sublabel: displayName, route: "/settings/mobile" },
        { icon: ShoppingCart, label: t("profile.yourRole"), sublabel: roleLabel, route: "/settings/role" },
        { icon: Settings, label: t("profile.homeProfile"), sublabel: profileDetail, route: "/settings/devices?type=profile" },
        { icon: Building2, label: t("profile.location"), sublabel: safeLocality, route: "/settings/discom" },
      ]
    },
    {
      title: t("profile.devices"),
      items: [
        { icon: Zap, label: t("profile.solarInverter"), sublabel: inverterDetail, route: "/settings/devices?type=inverter" },
        { icon: Battery, label: t("profile.battery"), sublabel: batteryDetail, route: "/settings/devices?type=battery" },
        { icon: Gauge, label: t("profile.smartMeter"), sublabel: meterDetail, route: "/settings/devices?type=meter" },
      ]
    },
    {
      title: t("profile.locationDiscom"),
      items: [
        { icon: Globe, label: t("profile.discomSettings"), sublabel: discomLabel, route: "/settings/discom" },
        { icon: FileText, label: t("profile.vcDocuments"), sublabel: isVerified ? t("profile.connectionVerified") : "", route: "/settings/vc-documents" },
      ]
    },
    {
      title: t("profile.yourOrders"),
      items: [
        { icon: Package, label: t("profile.orderHistory"), sublabel: t("profile.viewAllTrades"), route: "/order-history" },
        { icon: Wallet, label: t("payments.title"), sublabel: userData.upiId || t("profile.setUpPayment"), route: "/payments" },
      ]
    },
    {
      title: t("profile.preferences"),
      items: [
        { icon: Sparkles, label: "Samai's estimate", sublabel: earningsLabel, route: null },
        { icon: Sparkles, label: t("profile.howSamaiHelps"), sublabel: userData.automationLevel === "auto" ? t("profile.autoPlaceOrders") : t("profile.showRecommendations"), route: "/settings/automation" },
        { icon: MessageSquare, label: t("profile.yourContext"), sublabel: userData.userContext ? (userData.userContext.length > 25 ? userData.userContext.substring(0, 25) + "..." : userData.userContext) : t("profile.notSet"), route: "/settings/context" },
        { icon: CalendarClock, label: t("profile.vacationsHolidays"), sublabel: userData.schoolHolidays || userData.summerVacationStart ? t("profile.datesSaved") : t("profile.notSet"), route: "/settings/vacations" },
        { icon: Bell, label: t("profile.notifications"), sublabel: t("profile.enabled"), route: null },
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
          <h1 className="text-lg font-bold text-foreground">{t("profile.title")}</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3 animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{profileUser?.mobile_number || userData.phone}</p>
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
          {t("profile.startDemoOver")}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
