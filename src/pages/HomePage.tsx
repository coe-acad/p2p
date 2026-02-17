import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, User, AlertTriangle, X, Sparkles, Plane, CalendarClock, GraduationCap, Sun, Wallet, Check, ArrowRight, ChevronDown, ChevronUp, EyeOff, Mic, Send, LogOut, Globe, CloudSun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SamaiLogo from "@/components/SamaiLogo";
import RollingNumber from "@/components/RollingNumber";
import MarioCoin from "@/components/MarioCoin";
import chatbotIcon from "@/assets/chatbot-icon.png";
import auLogo from "@/assets/AU-logo.png";
import tecLogo from "@/assets/TEC-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import LanguageToggle from "@/components/LanguageToggle";

// Session storage keys
const NOTIFICATION_SHOWN_KEY = "samai_confirmed_notification_shown";
const ONBOARDING_LOCATION_KEY = "samai_onboarding_location_done";
const ONBOARDING_DEVICES_KEY = "samai_onboarding_devices_done";
const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";
const HIDE_SETUP_BANNER_KEY = "samai_hide_setup_banner";
const HAS_COMPLETED_FIRST_TRADE_KEY = "samai_has_completed_first_trade";
const SESSION_APPROVED_KEY = "samai_session_approved";

type TabType = "chat" | "home" | "statements";
type TomorrowStatus = "not_published" | "published_confirmed" | "published_pending";

const getGreeting = (t: (key: string) => string) => {
  const hour = new Date().getHours();
  if (hour < 12) return t("home.greeting.morning");
  if (hour < 17) return t("home.greeting.afternoon");
  return t("home.greeting.evening");
};

// Earnings data with animation states - for returning users only
// Varied projected values with proportional kWh: ₹6.15 per kWh rate
// Today: ₹178 → 29 kWh, Tomorrow: ₹185 → 30 kWh
// Month = 30x of today's values
const initialTodayData = { actual: 56, expected: 178, actualKwh: 9, expectedKwh: 29 };
const tomorrowExpected = { earnings: 185, units: 30 }; // Different from today's projection
const monthData = { actual: 56 * 30, expected: 178 * 30, actualKwh: 9 * 30, expectedKwh: 29 * 30 }; // 30x ratio

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userData, setUserData } = useUserData();
  const { tradesData, totalUnits, totalEarnings, avgRate, setShowConfirmedTrades } = usePublishedTrades();
  
  // Get verification status from router state or userData (persisted)
  const isVCVerified = location.state?.isVCVerified ?? userData.isVCVerified ?? true;
  const justPublished = location.state?.justPublished ?? false;
  
  // Determine if user is new (based on userData flag)
  const isNewUser = !userData.isReturningUser;
  
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const displayName = (userData.name || "").trim();
  const firstName = displayName.split(" ")[0] || "User";
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [hideSetupBanner, setHideSetupBanner] = useState(() => {
    return localStorage.getItem(HIDE_SETUP_BANNER_KEY) === "true";
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMegaCelebration, setShowMegaCelebration] = useState(false);
  const [earningsView, setEarningsView] = useState<"today" | "month">("today");
  
  // Animated earnings values - only for returning users
  // Both actual (earned) and expected scale 30x for month view
  const getInitialEarnings = () => isNewUser ? 0 : initialTodayData.actual;
  const getInitialKwh = () => isNewUser ? 0 : initialTodayData.actualKwh;
  const [displayedEarnings, setDisplayedEarnings] = useState(getInitialEarnings());
  const [displayedKwh, setDisplayedKwh] = useState(getInitialKwh());
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [lastEarningsIncrease, setLastEarningsIncrease] = useState(5);
  
  // Tomorrow status based on published trades OR justPublished flag from navigation
  const isPublished = tradesData.isPublished || justPublished;
  const tomorrowStatus: TomorrowStatus = isPublished 
    ? (tradesData.showConfirmedTrades ? "published_confirmed" : "published_pending")
    : "not_published";
  const tomorrowData = { 
    units: totalUnits, 
    earnings: totalEarnings, 
    avgRate: avgRate 
  };
  // Only show confirmed trades if explicitly flagged
  const hasConfirmedTrades = tradesData.showConfirmedTrades && tradesData.confirmedTrades.length > 0;

  // Session-based notification state
  const [notificationShown, setNotificationShown] = useState(() => {
    return sessionStorage.getItem(NOTIFICATION_SHOWN_KEY) === "true";
  });


  const showConfirmedNotification = () => {
    toast({
      title: t("home.tradesConfirmed"),
      description: `7 ${t("home.kwhMatchedBuyers")}`,
      action: (
        <button
          onClick={() => navigate("/prepared", { state: { isVCVerified, hasConfirmedTrades: true, showConfirmed: true } })}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 whitespace-nowrap"
        >
          {t("common.viewDetails")}
        </button>
      ),
    });
    sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, "true");
    setNotificationShown(true);
  };

  const resetNotification = () => {
    sessionStorage.removeItem(NOTIFICATION_SHOWN_KEY);
    setNotificationShown(false);
  };

  // Show confirmed trades notification after 15s
  useEffect(() => {
    if (hasConfirmedTrades && isVCVerified && !notificationShown) {
      const timer = setTimeout(() => {
        showConfirmedNotification();
      }, 15000); // 15 second delay
      return () => clearTimeout(timer);
    }
  }, [hasConfirmedTrades, isVCVerified, notificationShown]);

  // Celebration animation effect - trigger every 10 seconds with value increase
  // Only for returning users (not new users who have no earnings yet)
  // Stops at 100% progress with MEGA celebration, then resets and restarts for prototype demo
  useEffect(() => {
    // Skip celebration logic for new users
    if (isVCVerified && !isNewUser) {
      const LAST_PRICE_KEY = "samai_last_trade_price";

  const fetchTradeStatus = async () => {
    try {
      const response = await fetch(
        "https://atria-bbp.atriauniversity.ai/api/trade-status"
      );
      const data = await response.json();

      if (!data.status || data.price == null) {
        return;
      }

      const newPrice = Number(data.price);
      const storedPrice = Number(localStorage.getItem(LAST_PRICE_KEY)) || 0;

      if (newPrice > storedPrice) {
        const incrementAmount = newPrice;

        setDisplayedEarnings(prev => prev + incrementAmount);

        localStorage.setItem(LAST_PRICE_KEY, String(newPrice));
        setShowCelebration(true);
        setLastEarningsIncrease(incrementAmount);
        setTimeout(() => setShowCelebration(false), 3000);
      }

    } catch (error) {
      console.error("Trade status API failed:", error);
    }
  };

  const interval = setInterval(fetchTradeStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [isVCVerified, earningsView, isNewUser]);

  const toggleHideSetupBanner = () => {
    const newValue = !hideSetupBanner;
    setHideSetupBanner(newValue);
    localStorage.setItem(HIDE_SETUP_BANNER_KEY, String(newValue));
  };

  const dismissNudge = (id: string) => {
    setDismissedNudges([...dismissedNudges, id]);
  };

  // Build personalized nudges based on user data
  const buildNudges = () => {
    const nudgeList = [];
    
    // Ask about school holidays if not set
    if (!userData.schoolHolidays) {
      nudgeList.push({ 
        id: "school-holidays", 
        text: t("home.schoolHolidays"), 
        icon: GraduationCap,
        route: "/settings/vacations"
      });
    }
    
    // Ask about summer vacation if not set
    if (!userData.summerVacationStart) {
      nudgeList.push({ 
        id: "summer-vacation", 
        text: t("home.summerVacation"), 
        icon: Sun,
        action: "chat",
        chatMessage: "My school is going on vacation soon. I want to sell all my solar energy during this time except what I need for basic home use."
      });
    }
    
    // Generic nudges if user has filled vacation data
    if (userData.schoolHolidays && userData.summerVacationStart) {
      nudgeList.push({ 
        id: "holiday", 
        text: t("home.holidaySoon"), 
        icon: Plane,
        route: "/settings/vacations"
      });
      nudgeList.push({ 
        id: "event", 
        text: t("home.upcomingEvents"), 
        icon: CalendarClock,
        route: "/settings/vacations"
      });
    }
    
    return nudgeList.filter(n => !dismissedNudges.includes(n.id));
  };

  const nudges = buildNudges();

  // Check for incomplete onboarding steps
  const getIncompleteSteps = () => {
    const steps = [];
    if (localStorage.getItem(ONBOARDING_LOCATION_KEY) !== "true") {
      steps.push({ id: "location", title: "Verify electricity connection", route: "/onboarding/location" });
    }
    if (localStorage.getItem(ONBOARDING_DEVICES_KEY) !== "true") {
      steps.push({ id: "devices", title: "Confirm your solar setup", route: "/onboarding/devices" });
    }
    if (localStorage.getItem(ONBOARDING_TALK_KEY) !== "true") {
      steps.push({ id: "talk", title: "Help Samai understand you", route: "/onboarding/talk" });
    }
    return steps;
  };

  const incompleteSteps = getIncompleteSteps();

  const renderHomeContent = () => (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden relative">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top warm glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl" />
        
        {/* Accent glow */}
        <div className="absolute top-1/3 -right-32 w-[250px] h-[250px] bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-8 w-1.5 h-1.5 bg-primary/30 rounded-full animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-12 w-1 h-1 bg-accent/40 rounded-full animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-primary/25 rounded-full animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Content with relative z-index */}
      <div className="relative z-10 flex flex-col gap-2">
        {/* Incomplete Onboarding Card - Collapsible */}
        {incompleteSteps.length > 0 && !hideSetupBanner && (
          <div className="bg-gradient-to-r from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 border border-orange-300/40 dark:border-orange-700/30 rounded-xl animate-slide-up backdrop-blur-sm overflow-hidden">
            <button 
              onClick={() => setSetupExpanded(!setupExpanded)}
              className="w-full flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-200 dark:bg-orange-800/40 flex items-center justify-center">
                  <AlertTriangle size={10} className="text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  {t("home.completeSetup")} ({incompleteSteps.length} {incompleteSteps.length > 1 ? t("home.stepsLeftPlural") : t("home.stepsLeft")})
                </p>
              </div>
              <div className="flex items-center gap-1">
                {setupExpanded ? (
                  <ChevronUp size={14} className="text-orange-500" />
                ) : (
                  <ChevronDown size={14} className="text-orange-500" />
                )}
              </div>
            </button>
            
            {setupExpanded && (
              <div className="px-3 pb-3 space-y-1.5">
                {incompleteSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => navigate(step.route)}
                    className="w-full flex items-center justify-between p-2 bg-white/60 dark:bg-background/60 backdrop-blur-sm rounded-lg text-left hover:bg-white/80 dark:hover:bg-background/80 transition-all duration-200 group"
                  >
                    <span className="text-xs text-foreground">{step.title}</span>
                    <ArrowRight size={12} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
                {/* Dev hide option */}
                <button
                  onClick={toggleHideSetupBanner}
                  className="w-full flex items-center justify-center gap-1 p-1.5 text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  <EyeOff size={9} />
                  <span>[Dev] Hide banner</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dev button to show hidden setup banner */}
        {hideSetupBanner && incompleteSteps.length > 0 && (
          <button
            onClick={toggleHideSetupBanner}
            className="text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1 self-end"
          >
            <EyeOff size={9} />
            <span>[Dev] Show setup banner</span>
          </button>
        )}

        {/* Section 1: Earnings Snapshot - Green gradient card matching reference */}
        <div className="relative rounded-xl p-3 shadow-card animate-slide-up overflow-hidden border border-accent/20" 
          style={{ background: "linear-gradient(135deg, hsl(35 90% 95%) 0%, hsl(45 85% 92%) 50%, hsl(140 45% 92%) 100%)" }}>
          
          <div className="relative">
            {/* Header with toggle */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">{t("home.earnings")}</p>
              </div>
              {/* Toggle buttons */}
              <div className="flex bg-card/80 backdrop-blur-sm rounded-lg p-0.5 border border-border/50">
                <button
                  onClick={() => {
                    setEarningsView("today");
                    if (!isNewUser) {
                      setDisplayedEarnings(initialTodayData.actual);
                      setDisplayedKwh(initialTodayData.actualKwh);
                    }
                  }}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 ${
                    earningsView === "today" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("home.today")}
                </button>
                <button
                  onClick={() => {
                    setEarningsView("month");
                    if (!isNewUser) {
                      setDisplayedEarnings(initialTodayData.actual * 30);
                      setDisplayedKwh(initialTodayData.actualKwh * 30);
                    }
                  }}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 ${
                    earningsView === "month" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("home.month")}
                </button>
              </div>
            </div>
            
            {/* Green inner card - Today's Earnings */}
            <button 
              onClick={() => isVCVerified && navigate("/today-trades")}
              disabled={!isVCVerified}
              className="w-full text-left rounded-lg p-3 mb-2 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(145 55% 42%) 0%, hsl(155 50% 38%) 100%)" }}
            >
              {/* Coin Shower Animation for celebrations */}
              {showCelebration && !showMegaCelebration && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-bounce"
                      style={{
                        left: `${10 + i * 12}%`,
                        top: `-20px`,
                        animation: `fall ${1 + Math.random() * 0.5}s ease-in forwards`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <MarioCoin size={16 + Math.random() * 8} />
                    </div>
                  ))}
                </div>
              )}

              {/* MEGA Celebration Overlay with more coins */}
              {showMegaCelebration && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none overflow-hidden">
                  {/* Coin shower for mega celebration */}
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${5 + i * 6}%`,
                        top: `-30px`,
                        animation: `fall ${1.5 + Math.random() * 1}s ease-in infinite`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    >
                      <MarioCoin size={20 + Math.random() * 12} className="animate-spin" />
                    </div>
                  ))}
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-900 px-4 py-2 rounded-full font-bold text-sm animate-bounce shadow-lg z-30">
                    🎉 100% {t("home.projected")}! 🎉
                  </div>
                </div>
              )}
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[10px] text-white/80 mb-0.5">{earningsView === "today" ? t("home.todayEarnings") : t("home.monthEarnings")}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                      ₹<RollingNumber value={displayedEarnings} />
                    </span>
                    {showCelebration && !showMegaCelebration && (
                      <span className="text-xs font-bold text-amber-300 animate-bounce ml-1">
                        +₹{lastEarningsIncrease}!
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/70 mt-0.5">{displayedKwh} kWh {t("trades.kwhSold")}</p>
                </div>
                
                {/* LIVE indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-[10px] font-semibold text-white uppercase">Live</span>
                </div>
              </div>
            </button>
            
            {/* Predicted row with progress bar - includes kWh */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t("home.projected")}</span>
                <span className="text-base font-bold text-foreground">
                  ₹{earningsView === "today" ? initialTodayData.expected : monthData.expected}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({earningsView === "today" ? initialTodayData.expectedKwh : monthData.expectedKwh} kWh)
                </span>
              </div>
              <div className="px-2.5 py-1 bg-card/80 rounded-lg border border-border/50">
                <span className="text-sm font-bold text-foreground">
                  {Math.round((displayedEarnings / (earningsView === "today" ? initialTodayData.expected : monthData.expected)) * 100)}%
                </span>
              </div>
            </div>
            
            {/* Two-tone progress bar */}
            <div className="w-full h-2 bg-accent/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, (displayedEarnings / (earningsView === "today" ? initialTodayData.expected : monthData.expected)) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tomorrow Card - Blue/teal gradient matching reference */}
        <div className="relative rounded-xl p-3 shadow-card animate-slide-up overflow-hidden border border-sky-200/50" 
          style={{ animationDelay: "0.05s", background: "linear-gradient(135deg, hsl(45 85% 95%) 0%, hsl(180 40% 94%) 50%, hsl(200 50% 92%) 100%)" }}>
          
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">{t("home.tomorrow")}</p>
          </div>
          
          <button
            onClick={() => {
              if (tomorrowStatus === "not_published") {
                navigate("/prepared");
              } else {
                navigate("/prepared", { state: { isVCVerified, hasConfirmedTrades: tomorrowStatus === "published_confirmed" } });
              }
            }}
            className="w-full text-left rounded-lg p-3"
            style={{ background: "linear-gradient(135deg, hsl(175 50% 42%) 0%, hsl(185 45% 38%) 100%)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-white/80 mb-0.5">{t("home.sellingTomorrow")}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">
                    ₹{tomorrowData.earnings || tomorrowExpected.earnings}
                  </span>
                </div>
                <p className="text-[10px] text-white/70 mt-0.5">{tomorrowData.units || tomorrowExpected.units} kWh</p>
              </div>
              
              {/* Right side - Published status */}
              <div className="text-right">
                {isPublished ? (
                  <>
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <Check size={12} className="text-white" />
                      <span className="text-[10px] font-semibold text-white uppercase">{t("home.published")}</span>
                    </div>
                    <p className="text-[10px] text-white/70 uppercase">{t("home.avgRate")}</p>
                    <p className="text-sm font-bold text-white">₹{tomorrowData.avgRate || 6.3}/kWh</p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-white/70 uppercase mb-1">{t("home.avgRate")}</p>
                    <p className="text-sm font-bold text-white">₹{tomorrowData.avgRate || 6.3}/kWh</p>
                  </>
                )}
                <div className="flex items-center gap-1 justify-end mt-2">
                  <span className="text-xs text-white/90">{t("home.viewTrades")}</span>
                  <ArrowRight size={12} className="text-white/90" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Nudge cards removed as requested */}

        {/* Chat Input Bar - Always visible */}
        <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <ChatInputBar />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col bg-background">
      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden px-3 pt-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 animate-fade-in flex-shrink-0">
          <div className="flex items-center gap-2">
            <SamaiLogo size="sm" showText={false} />
            <div>
              <p className="text-sm font-semibold text-foreground">{getGreeting(t)}, {firstName}!</p>
              <div className="flex items-center gap-2">
                <p className="text-2xs text-muted-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          </div>
          
          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <User size={16} className="text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-[9998]">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User size={14} className="mr-2" />
                {t("home.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/today-trades")}>
                <FileText size={14} className="mr-2" />
                {t("home.todaysTrades")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/")} className="text-destructive">
                <LogOut size={14} className="mr-2" />
                {t("home.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Compact Language & Weather row */}
        <div className="flex items-center gap-2 pb-1 animate-fade-in flex-shrink-0">
          <LanguageToggle />
          <div className="flex items-center gap-1 px-2 py-0.5 bg-card/60 rounded-full border border-border/30">
            <CloudSun size={12} className="text-primary" />
            <span className="text-[10px] text-muted-foreground">32°C</span>
          </div>
        </div>

        {/* Main Content - fills remaining space */}
        <div className="flex-1 min-h-0 overflow-auto">
          {renderHomeContent()}
        </div>
      </div>
      
      {/* Powered by AU x TEC */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span className="text-[10px] text-muted-foreground">Powered by</span>
        <div className="flex items-center gap-1.5">
          <img src={auLogo} alt="AU" className="h-4 w-auto" />
          <span className="text-[10px] text-muted-foreground">×</span>
          <img src={tecLogo} alt="TEC" className="h-4 w-auto" />
        </div>
      </div>

      {/* Bottom Navigation - Fixed at bottom, outside scroll area */}
      <div className="flex-shrink-0">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

// QuickSpeak Card Component - Clickable to open Ask Samai page
const ChatInputBar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Vacation/action prompts for QuickSpeak
  const suggestions = [
    { text: t("home.suggestHoliday") || "Going on holiday?" },
    { text: t("home.suggestSchoolVacation") || "School vacation?" },
    { text: t("home.suggestChangePlan") || "Change my plan" },
  ];

  const handleOpenAskSamai = () => {
    navigate("/ask-samai");
  };

  return (
    <button 
      onClick={handleOpenAskSamai}
      className="w-full text-left relative rounded-xl p-2.5 shadow-card overflow-hidden border border-primary/20 hover:shadow-lg transition-shadow" 
      style={{ background: "linear-gradient(135deg, hsl(35 90% 95%) 0%, hsl(40 85% 93%) 50%, hsl(45 80% 91%) 100%)" }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">{t("home.quickspeak")}</p>
        </div>
        <span className="text-xs text-primary font-medium">भाषिणी</span>
      </div>
      
      {/* Inner cream card with mic and input */}
      <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 mb-2 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Mic size={18} className="text-primary-foreground" />
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{t("home.askSamai")}</p>
          <p className="text-[10px] text-muted-foreground">{t("home.speakAnyLanguage")}</p>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Send size={14} className="text-primary-foreground" />
        </div>
      </div>
      
      {/* Suggested prompts - pill style */}
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-card/80 border border-primary/20 rounded-full text-[10px] text-foreground"
          >
            {s.text}
          </span>
        ))}
      </div>
    </button>
  );
};

// Bottom Navigation Component - Clean 3-tab structure with Home at center
const BottomNav = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: TabType) => void }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Navigate to Ask Samai page
  const handleAskSamaiClick = () => {
    navigate("/ask-samai");
    onTabChange("chat");
  };

  return (
    <div className="flex items-center justify-around py-2 bg-card/90 backdrop-blur-sm border-t border-border/30">
      {/* Ask Samai - Left - scrolls to QuickSpeak */}
      <button
        onClick={handleAskSamaiClick}
        className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
          activeTab === "chat" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <img src={chatbotIcon} alt="Samai" className="w-6 h-6" />
        <span className={`text-[10px] font-medium ${activeTab === "chat" ? "text-primary" : ""}`}>{t("nav.askSamai")}</span>
      </button>
      
      {/* Home - Center with bigger rotating Logo (no caption) - 20% bigger */}
      <button
        onClick={() => {
          navigate("/home");
          onTabChange("home");
        }}
        className={`flex items-center justify-center px-4 py-1 transition-colors ${
          activeTab === "home" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <div className="w-12 h-12 animate-spin-slow flex items-center justify-center">
          <SamaiLogo size="sm" showText={false} />
        </div>
      </button>
      
      {/* Payments - Right */}
      <button
        onClick={() => {
          navigate("/payments");
          onTabChange("statements");
        }}
        className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
          activeTab === "statements" ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Wallet size={20} />
        <span className={`text-[10px] font-medium ${activeTab === "statements" ? "text-primary" : ""}`}>{t("nav.payments")}</span>
      </button>
    </div>
  );
};

export default HomePage;
