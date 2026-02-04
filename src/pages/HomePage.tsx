import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, User, AlertTriangle, ShieldCheck, X, Sparkles, Plane, CalendarClock, Bell, GraduationCap, Sun, Wallet, Check, ArrowRight, ChevronDown, ChevronUp, EyeOff, Mic, Send, Star } from "lucide-react";
import SamaiLogo from "@/components/SamaiLogo";
import RollingNumber from "@/components/RollingNumber";
import MarioCoin from "@/components/MarioCoin";
import chatbotIcon from "@/assets/chatbot-icon.png";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";

// Session storage keys
const NOTIFICATION_SHOWN_KEY = "samai_confirmed_notification_shown";
const ONBOARDING_LOCATION_KEY = "samai_onboarding_location_done";
const ONBOARDING_DEVICES_KEY = "samai_onboarding_devices_done";
const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";
const HIDE_SETUP_BANNER_KEY = "samai_hide_setup_banner";
const HAS_COMPLETED_FIRST_TRADE_KEY = "samai_has_completed_first_trade";

type TabType = "chat" | "home" | "statements";
type TomorrowStatus = "not_published" | "published_confirmed" | "published_pending";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// Earnings data with animation states - for returning users only
// Today's predicted: ₹186 @ avg ₹6.15/unit = ~30.24 kWh (rounded to 30)
const initialTodayData = { actual: 56, expected: 186, actualKwh: 9, expectedKwh: 30 };
const monthData = { actual: 114, expected: 450, actualKwh: 18, expectedKwh: 72 };

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userData, setUserData } = useUserData();
  const { tradesData, totalUnits, totalEarnings, avgRate, setShowConfirmedTrades } = usePublishedTrades();
  
  // Get verification status from router state or userData (persisted)
  const isVCVerified = location.state?.isVCVerified ?? userData.isVCVerified ?? true;
  const justPublished = location.state?.justPublished ?? false;
  
  // Determine if user is new (based on userData flag)
  const isNewUser = !userData.isReturningUser;
  
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [hideSetupBanner, setHideSetupBanner] = useState(() => {
    return localStorage.getItem(HIDE_SETUP_BANNER_KEY) === "true";
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMegaCelebration, setShowMegaCelebration] = useState(false);
  const [earningsView, setEarningsView] = useState<"today" | "month">("today");
  
  // Animated earnings values - only for returning users
  const [displayedEarnings, setDisplayedEarnings] = useState(isNewUser ? 0 : initialTodayData.actual);
  const [displayedKwh, setDisplayedKwh] = useState(isNewUser ? 0 : initialTodayData.actualKwh);
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
      title: "Trades Confirmed! 🎉",
      description: "7 kWh matched with buyers for tomorrow",
      action: (
        <button
          onClick={() => navigate("/prepared", { state: { isVCVerified, hasConfirmedTrades: true, showConfirmed: true } })}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 whitespace-nowrap"
        >
          View details
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
      const interval = setInterval(() => {
        setDisplayedEarnings(prev => {
          const expected = earningsView === "today" ? initialTodayData.expected : monthData.expected;
          
          // Check if we've reached 100%
          if (prev >= expected) {
            // Trigger MEGA celebration at 100%!
            setShowMegaCelebration(true);
            setTimeout(() => {
              setShowMegaCelebration(false);
              // Reset to initial values for prototype loop
              setDisplayedKwh(earningsView === "today" ? initialTodayData.actualKwh : monthData.actualKwh);
              setDisplayedEarnings(earningsView === "today" ? initialTodayData.actual : monthData.actual);
            }, 5000);
            return prev;
          }
          
          // Trigger normal celebration if not at max
          setShowCelebration(true);
          setCelebrationCount(c => c + 1);
          setTimeout(() => setShowCelebration(false), 3000);
          
          // Animate values increasing
          const earningsIncrease = Math.floor(Math.random() * 8) + 3; // 3-10 rupees
          const kwhIncrease = Math.round((Math.random() * 1.5 + 0.5) * 10) / 10; // 0.5-2 kWh
          
          setLastEarningsIncrease(earningsIncrease);
          setDisplayedKwh(k => Math.min(Math.round((k + kwhIncrease) * 10) / 10, earningsView === "today" ? initialTodayData.expectedKwh : monthData.expectedKwh));
          
          return Math.min(prev + earningsIncrease, expected);
        });
      }, 10000); // Every 10 seconds
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
        text: "Any upcoming school holidays?", 
        icon: GraduationCap,
        route: "/settings/vacations"
      });
    }
    
    // Ask about summer vacation if not set
    if (!userData.summerVacationStart) {
      nudgeList.push({ 
        id: "summer-vacation", 
        text: "My school will go on vacation soon", 
        icon: Sun,
        action: "chat",
        chatMessage: "My school is going on vacation soon. I want to sell all my solar energy during this time except what I need for basic home use."
      });
    }
    
    // Generic nudges if user has filled vacation data
    if (userData.schoolHolidays && userData.summerVacationStart) {
      nudgeList.push({ 
        id: "holiday", 
        text: "Going on a holiday soon?", 
        icon: Plane,
        route: "/settings/vacations"
      });
      nudgeList.push({ 
        id: "event", 
        text: "Any upcoming events?", 
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
    <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
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
      <div className="relative z-10 flex flex-col gap-3">
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
                  Complete setup ({incompleteSteps.length} step{incompleteSteps.length > 1 ? 's' : ''} left)
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

        {/* Pending VC Verification Card */}
        {!isVCVerified && (
          <button
            onClick={() => navigate("/settings/vc-documents")}
            className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-destructive/10 to-orange-50 dark:from-destructive/20 dark:to-orange-900/10 border border-destructive/30 rounded-xl animate-slide-up backdrop-blur-sm text-left hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-destructive" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Complete DISCOM verification</p>
              <p className="text-[10px] text-muted-foreground">Required to publish trades and earn</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-primary">Verify</span>
              <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        )}


        {/* Section 1: Earnings Snapshot - Colorful & Exciting */}
        <div className="relative rounded-xl p-3 shadow-card animate-slide-up overflow-hidden border border-primary/20" 
          style={{ background: "linear-gradient(135deg, hsl(230 65% 55% / 0.08) 0%, hsl(165 45% 45% / 0.08) 50%, hsl(45 90% 55% / 0.06) 100%)" }}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
          
          {/* Colorful accent orbs */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-accent/20 to-green-400/10 rounded-full blur-xl" />
          
          <div className="relative">
            {/* Header with toggle */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">Earnings</p>
              </div>
              {/* Toggle buttons */}
              <div className="flex bg-background/60 backdrop-blur-sm rounded-lg p-0.5 border border-border/50">
                <button
                  onClick={() => setEarningsView("today")}
                  className={`px-2.5 py-1 text-[9px] font-semibold rounded-md transition-all duration-200 ${
                    earningsView === "today" 
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setEarningsView("month")}
                  className={`px-2.5 py-1 text-[9px] font-semibold rounded-md transition-all duration-200 ${
                    earningsView === "month" 
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
            
            {/* Full width earnings card - Vibrant */}
            <button 
              onClick={() => isVCVerified && navigate("/today-trades")}
              className={`relative w-full p-3 rounded-xl text-left transition-all duration-300 overflow-hidden ${
                isVCVerified ? "hover:shadow-lg hover:scale-[1.01] cursor-pointer" : "cursor-default"
              }`}
              style={{ 
                background: earningsView === "month" 
                  ? "linear-gradient(135deg, hsl(230 65% 50%) 0%, hsl(250 70% 45%) 100%)" 
                  : "linear-gradient(135deg, hsl(165 50% 42%) 0%, hsl(150 55% 38%) 100%)"
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
              
              <div className="flex items-center justify-between relative">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-white/80">
                    {earningsView === "today" ? "Today's Earnings" : "This Month"}
                  </p>
                  <div className={`relative inline-flex items-baseline mt-0.5 ${showCelebration ? "scale-110" : ""} transition-transform duration-300`}>
                    {isNewUser ? (
                      <span className="text-3xl font-black text-white drop-shadow-lg">--</span>
                    ) : (
                      <RollingNumber 
                        value={isVCVerified ? (earningsView === "today" ? displayedEarnings : monthData.actual) : 0}
                        prefix="₹"
                        className="text-3xl font-black text-white drop-shadow-lg"
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-white/70 font-medium">
                    {isNewUser ? "-- kWh sold" : (isVCVerified ? `${earningsView === "today" ? displayedKwh : monthData.actualKwh} kWh sold` : "0 kWh sold")}
                  </p>
                </div>
                
                {/* Live indicator - only for returning users */}
                {isVCVerified && !isNewUser && earningsView === "today" && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                    <span className="text-[9px] font-bold text-white">LIVE</span>
                  </div>
                )}
              </div>
              
              {/* Progress bar - Hidden for new users */}
              {isVCVerified && !isNewUser && (
                <div className="mt-3 pt-2 border-t border-white/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-white/80">
                        {earningsView === "today" ? "Predicted" : "Monthly Target"}
                      </span>
                      <span className="text-sm font-black text-white">
                        ₹{earningsView === "today" ? initialTodayData.expected : monthData.expected}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                      <span className="text-xs font-black text-white">
                        {Math.min(100, Math.round((earningsView === "today" 
                          ? displayedEarnings / initialTodayData.expected 
                          : monthData.actual / monthData.expected
                        ) * 100))}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3.5 rounded-full overflow-hidden bg-black/20 shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300"
                      style={{ 
                        width: `${Math.min(100, (earningsView === "today" 
                          ? displayedEarnings / initialTodayData.expected 
                          : monthData.actual / monthData.expected
                        ) * 100)}%` 
                      }}
                    >
                      {/* Shimmer effect on progress bar */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Tomorrow's Status Card - Blue Sky */}
        <div className="relative rounded-xl p-3 shadow-card animate-slide-up overflow-hidden border border-sky-300/30" 
          style={{ background: "linear-gradient(135deg, hsl(200 80% 55% / 0.08) 0%, hsl(210 85% 50% / 0.06) 100%)" }}
        >
          {/* Decorative orbs - sky/cloud effect */}
          <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-sky-400/15 to-blue-500/10 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-cyan-400/10 to-sky-500/5 rounded-full blur-lg" />
          
          <div className="flex items-center justify-between mb-2" onClick={() => navigate("/prepared", { state: { isVCVerified, hasConfirmedTrades: false } })}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">Tomorrow</p>
            </div>
          </div>
          
          {!isVCVerified ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={16} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Complete verification to start trading</p>
            </div>
          ) : tomorrowStatus === "not_published" ? (
            <div className="space-y-2">
              <p className="text-xs text-foreground">Ready to sell your excess energy</p>
              <button 
                onClick={() => navigate("/prepared", { state: { isVCVerified, hasConfirmedTrades: false } })}
                className="btn-solar w-full text-xs !py-2.5 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <Sparkles size={14} />
                  Publish now
                </span>
              </button>
            </div>
          ) : (
            // Both published_confirmed and published_pending show "Published" status
            <button 
              onClick={() => navigate("/prepared", { state: { isVCVerified, hasConfirmedTrades: tomorrowStatus === "published_confirmed", showConfirmed: false } })}
              className="relative w-full p-3 rounded-xl overflow-hidden group hover:shadow-lg hover:scale-[1.01] transition-all" 
              style={{ background: "linear-gradient(135deg, hsl(142 70% 45%) 0%, hsl(152 65% 40%) 100%)" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/25 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/15 to-transparent rounded-tr-full" />
              {/* Check decoration */}
              <div className="absolute top-2 right-3 flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
                <span className="text-[9px] text-white/90 font-semibold uppercase tracking-wide">Published</span>
              </div>
              <div className="flex items-center justify-between relative mt-2">
                <div>
                  <p className="text-[10px] text-white/80 font-medium">Selling tomorrow</p>
                  <p className="text-2xl font-black text-white drop-shadow-md">₹{tomorrowData.earnings}</p>
                  <p className="text-[10px] text-white/70 font-medium">{tomorrowData.units} kWh</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/60 uppercase tracking-wide font-semibold">Avg rate</p>
                  <p className="text-sm font-bold text-white">₹{tomorrowData.avgRate}/kWh</p>
                  <div className="flex items-center justify-end gap-1 mt-1.5">
                    <span className="text-[9px] text-white/80 font-medium">View trades</span>
                    <ArrowRight size={12} className="text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Section 3: QuickSpeak Interface - Colorful */}
        {isVCVerified && (
          <div className="relative rounded-xl p-3 shadow-card animate-slide-up overflow-hidden border border-orange-300/30" 
            style={{ background: "linear-gradient(135deg, hsl(30 80% 55% / 0.08) 0%, hsl(45 90% 55% / 0.06) 100%)" }}
          >
            {/* Decorative orbs */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-tl from-orange-400/15 to-amber-500/10 rounded-full blur-xl" />
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">QuickSpeak</p>
              </div>
              <span className="text-[8px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">भाषिणी</span>
            </div>
            
            <div 
              onClick={() => setActiveTab("chat")}
              className="relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-background/80 to-background/40 border border-border/50 cursor-pointer hover:shadow-lg hover:border-orange-300/50 transition-all duration-200 group backdrop-blur-sm"
            >
              {/* Mic button - vibrant */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("chat");
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                style={{ background: "linear-gradient(135deg, hsl(30 90% 50%) 0%, hsl(15 85% 45%) 100%)" }}
              >
                <Mic size={20} className="text-white" />
              </button>
              
              {/* Input area hint */}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Ask Samai anything...</p>
                <p className="text-[10px] text-muted-foreground">Speak in any language</p>
              </div>
              
              {/* Send button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("chat");
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              >
                <Send size={14} className="text-primary-foreground" />
              </button>
            </div>
            
            {/* Quick suggestion chips - colorful */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                { text: "Going on holiday?", color: "from-blue-500/10 to-blue-600/5 border-blue-300/30 text-blue-700 dark:text-blue-300" },
                { text: "School vacation?", color: "from-purple-500/10 to-purple-600/5 border-purple-300/30 text-purple-700 dark:text-purple-300" },
                { text: "Change my plan", color: "from-teal-500/10 to-teal-600/5 border-teal-300/30 text-teal-700 dark:text-teal-300" },
              ].map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => {
                    setActiveTab("chat");
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("samai-chat-prefill", { detail: suggestion.text }));
                    }, 100);
                  }}
                  className={`text-[10px] px-2.5 py-1 bg-gradient-to-r ${suggestion.color} rounded-full font-medium border hover:scale-105 transition-transform`}
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderChatContent = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatScreen />
    </div>
  );

  const renderStatementsContent = () => (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      <StatementsScreen isVCVerified={isVCVerified} />
    </div>
  );

  return (
    <div className="screen-container !justify-start !pt-4 !pb-0 relative overflow-hidden">
      {/* Celebration Overlay - Constrained to app bounds */}
      {showCelebration && !showMegaCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-xl">
          {/* Confetti particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="absolute animate-[confetti-fall_2s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-20px",
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <div
                className={`w-2 h-2 ${
                  ["bg-amber-400", "bg-amber-500", "bg-accent", "bg-primary", "bg-green-400"][Math.floor(Math.random() * 5)]
                } ${Math.random() > 0.5 ? "rounded-full" : "rotate-45"}`}
              />
            </div>
          ))}
          
          {/* Mario-style floating coins */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`coin-${i}`}
              className="absolute animate-[coin-burst_2s_ease-out_forwards]"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: "50%",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <MarioCoin size={24 + Math.floor(Math.random() * 12)} />
            </div>
          ))}
          
          {/* Central celebration burst */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-[celebration-pulse_1s_ease-out_forwards]">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/30 via-accent/20 to-transparent blur-xl" />
            </div>
          </div>
          
          {/* "+₹X" floating text */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-[float-up_2s_ease-out_forwards]">
            <p className="text-2xl font-bold text-accent drop-shadow-lg">+₹{lastEarningsIncrease}</p>
          </div>
        </div>
      )}

      {/* MEGA Celebration at 100% - Constrained to app bounds */}
      {showMegaCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-xl">
          {/* Golden overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-transparent to-amber-500/20 animate-pulse" />
          
          {/* Tons of confetti */}
          {[...Array(50)].map((_, i) => (
            <div
              key={`mega-confetti-${i}`}
              className="absolute animate-[confetti-fall_3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-30px",
                animationDelay: `${Math.random() * 1.5}s`,
              }}
            >
              <div
                className={`${Math.random() > 0.5 ? "w-3 h-3" : "w-2 h-4"} ${
                  ["bg-amber-400", "bg-yellow-400", "bg-orange-400", "bg-green-400", "bg-primary", "bg-pink-400", "bg-purple-400"][Math.floor(Math.random() * 7)]
                } ${Math.random() > 0.5 ? "rounded-full" : "rotate-45"}`}
              />
            </div>
          ))}
          
          {/* Explosion of Mario coins */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`mega-coin-${i}`}
              className="absolute animate-[coin-burst_2.5s_ease-out_forwards]"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: "40%",
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <MarioCoin size={28 + Math.floor(Math.random() * 20)} />
            </div>
          ))}
          
          {/* Giant central burst */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-[celebration-pulse_1.5s_ease-out_forwards]">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400/50 via-yellow-400/40 to-transparent blur-2xl" />
            </div>
          </div>
          
          {/* Stars burst */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute animate-[coin-burst_2s_ease-out_forwards]"
              style={{
                left: `${25 + Math.random() * 50}%`,
                top: "35%",
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <Star size={16 + Math.random() * 12} className="text-yellow-400 fill-yellow-400 drop-shadow-lg" />
            </div>
          ))}
          
          {/* Big "100% TARGET HIT!" text */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-[float-up_3s_ease-out_forwards] text-center">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-2xl animate-pulse">
              🎉 100% 🎉
            </p>
            <p className="text-sm font-bold text-amber-600 mt-1 drop-shadow-lg">TARGET HIT!</p>
          </div>
          
          {/* Firework bursts */}
          <div className="absolute top-[20%] left-1/4 w-24 h-24 animate-[celebration-pulse_1s_ease-out_forwards]" style={{ animationDelay: "0.3s" }}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400/40 to-transparent blur-xl" />
          </div>
          <div className="absolute top-1/4 right-1/4 w-20 h-20 animate-[celebration-pulse_1s_ease-out_forwards]" style={{ animationDelay: "0.6s" }}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400/40 to-transparent blur-xl" />
          </div>
        </div>
      )}

      {/* Global background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-accent/5 to-transparent" />
      </div>

      <div className="w-full max-w-md flex flex-col h-[100dvh] px-4 relative z-10">
        {/* Header - Enhanced */}
        <div className="flex items-center justify-between py-3 animate-fade-in flex-shrink-0">
          <div>
            <p className="text-xs text-muted-foreground">{getGreeting()},</p>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-lg font-bold text-foreground">{userData.name}</h1>
              <span className="text-[10px] bg-gradient-to-r from-primary/15 to-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold border border-primary/20">Seller</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dev button to reset notification */}
            {notificationShown && (
              <button 
                onClick={resetNotification}
                className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-0.5"
                title="Reset confirmed trades notification"
              >
                <Bell size={10} />
                <span>[Dev]</span>
              </button>
            )}
            <SamaiLogo size="sm" showText={false} />
            <button 
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center border border-border/50 hover:shadow-md transition-all duration-200"
            >
              <User size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content Area - Fixed height to prevent nav overlap */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-16 min-h-0">
          {activeTab === "home" && renderHomeContent()}
          {activeTab === "chat" && renderChatContent()}
          {activeTab === "statements" && renderStatementsContent()}
        </div>

        {/* Bottom Navigation - Always visible, fixed at bottom */}
        <div className="flex-shrink-0 bg-card border-t border-border/50 px-4 py-2 flex justify-around items-center safe-area-pb">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-200 ${activeTab === "chat" ? "bg-primary/10" : "hover:bg-muted/50"}`}
          >
            <img src={chatbotIcon} alt="Ask Samai" className="w-5 h-5" />
            <span className={`text-xs ${activeTab === "chat" ? "text-primary font-semibold" : "text-muted-foreground"}`}>Ask Samai</span>
          </button>
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex items-center justify-center px-5 py-1 rounded-xl transition-all duration-200 ${activeTab === "home" ? "bg-primary/10" : "hover:bg-muted/50"}`}
          >
            <div className="scale-[0.73]">
              <SamaiLogo size="md" showText={false} animated={activeTab === "home"} />
            </div>
          </button>
          <button 
            onClick={() => navigate("/payments")}
            className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-200 hover:bg-muted/50"
          >
            <Wallet size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Payments</span>
          </button>
        </div>
      </div>

    </div>
  );
};

// Chat Screen Component
const ChatScreen = () => {
  const { userData } = useUserData();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: `Hi ${userData.name?.split(' ')[0] || 'there'}! I'm Samai. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const suggestions = [
    "Pause selling tomorrow",
    "Don't sell between 9 AM to 3 PM",
    "Only sell if price is above ₹6",
  ];

  // Speech recognition setup
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: "Sorry, voice input isn't supported in your browser. Please try Chrome or Edge." 
      }]);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Default to Hindi
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        handleSend(transcript);
      } else {
        setInput(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Listen for prefill events from nudges
  useEffect(() => {
    const handlePrefill = (e: CustomEvent) => {
      const message = e.detail;
      if (message) {
        handleSend(message);
      }
    };
    window.addEventListener("samai-chat-prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("samai-chat-prefill", handlePrefill as EventListener);
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    
    // Simulate response
    setTimeout(() => {
      let response = "I understand. Let me help you with that.";
      if (text.toLowerCase().includes("pause")) {
        response = "Done! I've paused selling for tomorrow. You can resume anytime by telling me.";
      } else if (text.toLowerCase().includes("9 am") || text.toLowerCase().includes("3 pm")) {
        response = "Got it! I won't sell your energy between 9 AM and 3 PM. This will apply to all future trades.";
      } else if (text.toLowerCase().includes("₹6") || text.toLowerCase().includes("price")) {
        response = "Perfect! I'll only sell when the price is ₹6 or higher. I'll notify you when good prices are available.";
      } else if (text.toLowerCase().includes("school") && text.toLowerCase().includes("vacation")) {
        response = "Great! I'll maximize your solar sales during the school vacation. I'll keep just enough power for essentials like lights, fans, and fridge, and sell the rest at the best available rates. Would you like to set specific dates for this?";
      }
      setMessages(prev => [...prev, { role: "assistant", text: response }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.map((msg, i) => (
          <div 
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] text-sm ${
                msg.role === "user" 
                  ? "px-3 py-2 rounded-xl bg-primary text-primary-foreground" 
                  : "text-foreground"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => handleSend(s)}
              className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input with Voice */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <button 
          onClick={startListening}
          className={`p-2 rounded-lg transition-all ${
            isListening 
              ? "bg-primary text-primary-foreground animate-pulse" 
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          <Mic size={18} />
        </button>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder={isListening ? "Listening..." : "Ask Samai anything..."}
          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button 
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          className="px-3 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

// Statements Screen Component
const StatementsScreen = ({ isVCVerified }: { isVCVerified: boolean }) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const monthlyData = isVCVerified ? [
    {
      month: "January 2026",
      totalUnits: 189,
      totalAmount: 1247,
      transactions: [
        { date: "Jan 24", time: "2:00 PM", units: 12.5, amount: 81 },
        { date: "Jan 23", time: "1:30 PM", units: 8.2, amount: 54 },
        { date: "Jan 22", time: "3:00 PM", units: 15.0, amount: 98 },
        { date: "Jan 21", time: "12:45 PM", units: 6.8, amount: 44 },
        { date: "Jan 20", time: "2:15 PM", units: 11.3, amount: 74 },
        { date: "Jan 19", time: "1:00 PM", units: 9.7, amount: 63 },
        { date: "Jan 18", time: "3:30 PM", units: 14.2, amount: 93 },
        { date: "Jan 17", time: "2:00 PM", units: 10.5, amount: 69 },
        { date: "Jan 16", time: "1:15 PM", units: 8.9, amount: 58 },
        { date: "Jan 15", time: "2:45 PM", units: 13.1, amount: 86 },
        { date: "Jan 14", time: "12:30 PM", units: 7.6, amount: 50 },
        { date: "Jan 13", time: "3:15 PM", units: 11.8, amount: 77 },
        { date: "Jan 12", time: "1:45 PM", units: 9.2, amount: 60 },
        { date: "Jan 11", time: "2:30 PM", units: 12.0, amount: 78 },
        { date: "Jan 10", time: "1:00 PM", units: 6.5, amount: 42 },
        { date: "Jan 9", time: "3:00 PM", units: 10.8, amount: 70 },
        { date: "Jan 8", time: "2:15 PM", units: 8.4, amount: 55 },
        { date: "Jan 7", time: "1:30 PM", units: 7.3, amount: 48 },
        { date: "Jan 6", time: "2:45 PM", units: 5.2, amount: 34 },
      ],
    },
    {
      month: "December 2025",
      totalUnits: 156,
      totalAmount: 1021,
      transactions: [
        { date: "Dec 31", time: "2:00 PM", units: 10.2, amount: 66 },
        { date: "Dec 30", time: "1:30 PM", units: 8.5, amount: 55 },
        { date: "Dec 29", time: "3:00 PM", units: 12.0, amount: 78 },
        { date: "Dec 28", time: "12:45 PM", units: 7.8, amount: 51 },
      ],
    },
  ] : [];

  return (
    <div className="space-y-3 overflow-y-auto max-h-full pb-4">
      <h2 className="text-base font-bold text-foreground">Statements</h2>
      
      {monthlyData.length === 0 ? (
        <div className="bg-card rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">No statements yet</p>
          <p className="text-xs text-muted-foreground mt-1">Complete verification to start trading</p>
        </div>
      ) : (
        <div className="space-y-2">
          {monthlyData.map((month) => (
            <div key={month.month} className="bg-card rounded-xl shadow-card overflow-hidden">
              {/* Month Header - Clickable */}
              <button
                onClick={() => setExpandedMonth(expandedMonth === month.month ? null : month.month)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{month.month}</p>
                  <p className="text-xs text-muted-foreground">{month.totalUnits} kWh sold</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-primary">₹{month.totalAmount.toLocaleString()}</p>
                  <svg 
                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedMonth === month.month ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Transactions - Expandable */}
              {expandedMonth === month.month && (
                <div className="border-t border-border divide-y divide-border/50 max-h-60 overflow-y-auto">
                  {month.transactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-muted/20">
                      <div>
                        <p className="text-xs font-medium text-foreground">{tx.date}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.time} • {tx.units} kWh</p>
                      </div>
                      <p className="text-xs font-semibold text-accent">+₹{tx.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
