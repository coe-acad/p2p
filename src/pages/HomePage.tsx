import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, User, AlertTriangle, X, Sparkles, Plane, CalendarClock, GraduationCap, Sun, Wallet, Check, ArrowRight, ChevronDown, ChevronUp, EyeOff, Mic, Send, LogOut, Globe, CloudSun, Shield } from "lucide-react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Container,
} from "@mui/material";
import SamaiLogo from "@/components/SamaiLogo";
import RollingNumber from "@/components/RollingNumber";
import MarioCoin from "@/components/MarioCoin";
import chatbotIcon from "@/assets/chatbot-icon.png";
import auLogo from "@/assets/AU-logo.png";
import tecLogo from "@/assets/TEC-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { usePublishedTrades } from "@/hooks/usePublishedTrades";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "@/components/LanguageToggle";
import MainAppShell from "@/components/layout/MainAppShell";
import VCUploadModal from "@/components/modals/VCUploadModal";

// Session storage keys
const NOTIFICATION_SHOWN_KEY = "samai_confirmed_notification_shown";
const ONBOARDING_DEVICES_KEY = "samai_onboarding_devices_done";
const ONBOARDING_TALK_KEY = "samai_onboarding_talk_done";
const ONBOARDING_VC_KEY = "samai_onboarding_vc_done";
const HIDE_SETUP_BANNER_KEY = "samai_hide_setup_banner";
const HIDE_VC_BANNER_KEY = "samai_hide_vc_banner";
const HAS_COMPLETED_FIRST_TRADE_KEY = "samai_has_completed_first_trade";
const SESSION_APPROVED_KEY = "samai_session_approved";

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
// this is the dummy data
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
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };
  
  // Get verification status from router state or userData (persisted)
  // Default to false (unverified) if not set
  const isVCVerified = location.state?.isVCVerified ?? userData.isVCVerified ?? false;
  const justPublished = location.state?.justPublished ?? false;
  
  // Determine if user is new (based on userData flag)
  const isNewUser = !userData.isReturningUser;
  
  const displayName = (userData.name || "").trim();
  const firstName = displayName.split(" ")[0] || "User";
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [hideSetupBanner, setHideSetupBanner] = useState(() => {
    return localStorage.getItem(HIDE_SETUP_BANNER_KEY) === "true";
  });
  const [hideVCBanner, setHideVCBanner] = useState(() => {
    return localStorage.getItem(HIDE_VC_BANNER_KEY) === "true";
  });
  const [showVCModal, setShowVCModal] = useState(false);
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

  // Fetch tomorrow's trades from API
  const [tomorrowTrades, setTomorrowTrades] = useState<any>(null);
  const [fetchedTomorrowData, setFetchedTomorrowData] = useState(false);

  const { user: authUser } = useAuth();

  // Check if VC is verified
  const vcData = userData?.vc_data as any || {};
  const hasVC = Object.keys(vcData).length > 0;

  useEffect(() => {
    const fetchTomorrowTrades = async () => {
      if (!userData?.phone || !authUser || !hasVC) return;

      try {
        const token = await authUser.getIdToken();

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3002";
        const encodedPhone = encodeURIComponent(userData.phone);

        console.log("Fetching tomorrow trades for:", encodedPhone, "with token:", !!token);

        const response = await fetch(`${BACKEND_URL}/api/sellers/${encodedPhone}/tomorrow`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Tomorrow trades response:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Tomorrow trades data:", data);
          setTomorrowTrades(data);
          setFetchedTomorrowData(true);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch tomorrow trades:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            requestUrl: `${BACKEND_URL}/api/sellers/${encodedPhone}/tomorrow`,
            hasToken: !!token,
          });
          setFetchedTomorrowData(true);
        }
      } catch (err) {
        console.error("Error fetching tomorrow trades:", err);
        setFetchedTomorrowData(true);
      }
    };

    fetchTomorrowTrades();
  }, [userData?.phone, authUser, hasVC]);

  // Calculate tomorrow data from actual trades
  const calculateTomorrowData = () => {
    if (!tomorrowTrades?.trades || tomorrowTrades.trades.length === 0) {
      return { units: 0, earnings: 0, avgRate: 0 };
    }

    const totalKwh = tomorrowTrades.trades.reduce((sum: number, trade: any) => sum + (Number(trade.kWh) || 0), 0);
    const totalEarnings = tomorrowTrades.trades.reduce((sum: number, trade: any) => sum + ((Number(trade.kWh) || 0) * (Number(trade.price) || 0)), 0);
    const avgRate = totalKwh > 0 ? totalEarnings / totalKwh : 0;

    return { units: totalKwh, earnings: totalEarnings, avgRate };
  };

  const tomorrowDataFromAPI = calculateTomorrowData();

  // Tomorrow status based on published trades OR justPublished flag from navigation
  const isPublished = tradesData.isPublished || justPublished;
  const tomorrowStatus: TomorrowStatus = isPublished
    ? (tradesData.showConfirmedTrades ? "published_confirmed" : "published_pending")
    : "not_published";
  // Use API data if fetched, otherwise fallback to hardcoded values
  const tomorrowData = fetchedTomorrowData ? tomorrowDataFromAPI : tomorrowExpected;
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
        <Button
          onClick={() => navigate("/prepared", { state: { isVCVerified, hasConfirmedTrades: true, showConfirmed: true } })}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "primary.main",
            textTransform: "none",
            whiteSpace: "nowrap",
            "&:hover": { color: "primary.dark" },
          }}
        >
          {t("common.viewDetails")}
        </Button>
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

  const toggleHideVCBanner = () => {
    const newValue = !hideVCBanner;
    setHideVCBanner(newValue);
    localStorage.setItem(HIDE_VC_BANNER_KEY, String(newValue));
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

  // Check for incomplete onboarding steps (location is now part of verification)
  const getIncompleteSteps = () => {
    const steps = [];
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
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden", position: "relative" }}>
      {/* Minimal background effects */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", opacity: 0.5 }}>
        {/* Subtle top glow */}
        <Box sx={{
          position: "absolute",
          top: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 300,
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }} />
      </Box>

      {/* Content with relative z-index */}
      <Stack sx={{ position: "relative", zIndex: 10, gap: { xs: 1, sm: 2 }, overflow: "auto" }}>
        {/* Incomplete Onboarding Card - Collapsible */}
        {incompleteSteps.length > 0 && !hideSetupBanner && (
          <Card sx={{
            background: "linear-gradient(135deg, rgba(254,196,62,0.1) 0%, rgba(254,175,24,0.05) 100%)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "12px",
            animation: "slideUp 0.5s ease-out",
            overflow: "hidden",
          }}>
            <Button
              onClick={() => setSetupExpanded(!setupExpanded)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                textTransform: "none",
                color: "inherit",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(254,175,24,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <AlertTriangle size={10} sx={{ color: "#f59e0b" }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {t("home.completeSetup")} ({incompleteSteps.length} {incompleteSteps.length > 1 ? t("home.stepsLeftPlural") : t("home.stepsLeft")})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {setupExpanded ? (
                  <ChevronUp size={14} sx={{ color: "#f59e0b" }} />
                ) : (
                  <ChevronDown size={14} sx={{ color: "#f59e0b" }} />
                )}
              </Box>
            </Button>

            {setupExpanded && (
              <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {incompleteSteps.map((step) => (
                  <Button
                    key={step.id}
                    onClick={() => navigate(step.route)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      background: "rgba(255,255,255,0.6)",
                      borderRadius: "8px",
                      textAlign: "left",
                      textTransform: "none",
                      color: "text.primary",
                      "&:hover": { background: "rgba(255,255,255,0.8)" },
                      transition: "all 0.2s",
                    }}
                  >
                    <Typography variant="body2">{step.title}</Typography>
                    <ArrowRight size={12} sx={{ color: "#f59e0b" }} />
                  </Button>
                ))}
                {/* Dev hide option */}
                <Button
                  onClick={toggleHideSetupBanner}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    p: 1.5,
                    fontSize: "0.7rem",
                    color: "text.secondary",
                    textTransform: "none",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  <EyeOff size={9} />
                  <span>[Dev] Hide banner</span>
                </Button>
              </Box>
            )}
          </Card>
        )}

        {/* Dev button to show hidden setup banner */}
        {hideSetupBanner && incompleteSteps.length > 0 && (
          <Button
            onClick={toggleHideSetupBanner}
            sx={{
              fontSize: "0.7rem",
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 1,
              alignSelf: "flex-end",
              textTransform: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            <EyeOff size={9} />
            <span>[Dev] Show setup banner</span>
          </Button>
        )}

        {/* VC Verification Banner - Shown if not verified and not hidden */}
        {!isVCVerified && !hideVCBanner && (
          <Card sx={{
            background: "linear-gradient(135deg, rgba(34,197,233,0.1) 0%, rgba(26,158,122,0.05) 100%)",
            border: "1px solid rgba(26,158,122,0.2)",
            borderRadius: "12px",
            animation: "slideUp 0.5s ease-out",
            overflow: "hidden",
          }}>
            <Button
              onClick={() => setShowVCModal(true)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                textAlign: "left",
                textTransform: "none",
                color: "inherit",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(34,197,233,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Shield size={10} sx={{ color: "#1a9e7a" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Verify your credentials to start trading
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                    Upload your electricity meter or solar system credentials
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ArrowRight size={14} sx={{ color: "#1a9e7a" }} />
              </Box>
            </Button>

            {/* Hide option */}
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Button
                onClick={toggleHideVCBanner}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  p: 1,
                  fontSize: "0.7rem",
                  color: "text.secondary",
                  textTransform: "none",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <EyeOff size={9} />
                <span>[Dev] Hide banner</span>
              </Button>
            </Box>
          </Card>
        )}

        {/* Dev button to show hidden VC banner */}
        {hideVCBanner && !isVCVerified && (
          <Button
            onClick={toggleHideVCBanner}
            sx={{
              fontSize: "0.7rem",
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 1,
              alignSelf: "flex-end",
              textTransform: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            <EyeOff size={9} />
            <span>[Dev] Show VC banner</span>
          </Button>
        )}

        {/* Earnings and Tomorrow Side by Side */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 2 }, flexShrink: 0 }}>
          {/* Section 1: Earnings Snapshot */}
          <Card sx={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "12px",
            p: { xs: 1, sm: 2.5 },
            animation: "slideUp 0.5s ease-out",
            overflow: "hidden",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}>
          {/* Header with toggle */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 1, sm: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#1a9e7a" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.7rem", color: "#1a9e7a" }}>
                  {t("home.earnings")}
                </Typography>
              </Box>
              {/* Toggle buttons */}
              <Box sx={{ display: "flex", background: "rgba(255,255,255,0.6)", borderRadius: "8px", p: 0.5, border: "1px solid rgba(0,0,0,0.05)" }}>
                <Button
                  onClick={() => {
                    setEarningsView("today");
                    if (!isNewUser) {
                      setDisplayedEarnings(initialTodayData.actual);
                      setDisplayedKwh(initialTodayData.actualKwh);
                    }
                  }}
                  sx={{
                    px: 2,
                    py: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    borderRadius: "6px",
                    transition: "all 0.2s",
                    textTransform: "none",
                    ...(earningsView === "today"
                      ? { background: "#f59e0b", color: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                      : { color: "text.secondary", "&:hover": { color: "text.primary" } }),
                  }}
                >
                  {t("home.today")}
                </Button>
                <Button
                  onClick={() => {
                    setEarningsView("month");
                    if (!isNewUser) {
                      setDisplayedEarnings(initialTodayData.actual * 30);
                      setDisplayedKwh(initialTodayData.actualKwh * 30);
                    }
                  }}
                  sx={{
                    px: 2,
                    py: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    borderRadius: "6px",
                    transition: "all 0.2s",
                    textTransform: "none",
                    ...(earningsView === "month"
                      ? { background: "#f59e0b", color: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                      : { color: "text.secondary", "&:hover": { color: "text.primary" } }),
                  }}
                >
                  {t("home.month")}
                </Button>
              </Box>
            </Box>

          {/* Orange earnings card */}
          <Button
            onClick={() => isVCVerified && navigate("/today-trades")}
            disabled={!isVCVerified}
            sx={{
              width: "100%",
              textAlign: "left",
              borderRadius: "8px",
              p: { xs: 1.25, sm: 2 },
              flex: 1,
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(245,158,11,1) 0%, rgba(217,119,6,1) 100%)",
              "&:hover": { background: "linear-gradient(135deg, rgba(251,174,24,1) 0%, rgba(225,130,14,1) 100%)" },
              "&:disabled": { background: "linear-gradient(135deg, rgba(245,158,11,0.5) 0%, rgba(217,119,6,0.5) 100%)" },
              textTransform: "none",
            }}
          >
            {/* Coin Shower Animation for celebrations */}
            {showCelebration && !showMegaCelebration && (
                <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                  {[...Array(8)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute",
                        left: `${10 + i * 12}%`,
                        top: "-20px",
                        animation: `fall ${1 + Math.random() * 0.5}s ease-in forwards`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <MarioCoin size={16 + Math.random() * 8} />
                    </Box>
                  ))}
                </Box>
              )}

              {/* MEGA Celebration Overlay with more coins */}
              {showMegaCelebration && (
                <Box sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 20,
                  pointerEvents: "none",
                  overflow: "hidden",
                }}>
                  {/* Coin shower for mega celebration */}
                  {[...Array(15)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute",
                        left: `${5 + i * 6}%`,
                        top: "-30px",
                        animation: `fall ${1.5 + Math.random() * 1}s ease-in infinite`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    >
                      <Box sx={{ animation: "spin 1s linear infinite" }}>
                        <MarioCoin size={20 + Math.random() * 12} />
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{
                    background: "linear-gradient(135deg, #fcd34d 0%, #fef3c7 50%, #fcd34d 100%)",
                    color: "#b45309",
                    px: 2,
                    py: 1,
                    borderRadius: "9999px",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    animation: "bounce 1s ease-in-out infinite",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    zIndex: 30,
                  }}>
                    🎉 100% {t("home.projected")}! 🎉
                  </Box>
                </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 10, width: "100%" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", mb: 0.5, display: "block" }}>
                    {earningsView === "today" ? t("home.todayEarnings") : t("home.monthEarnings")}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
                    <Typography sx={{ fontSize: { xs: "1.25rem", sm: "1.75rem" }, fontWeight: 900, color: "white", lineHeight: 1 }}>
                      ₹<RollingNumber value={displayedEarnings} />
                    </Typography>
                    {showCelebration && !showMegaCelebration && (
                      <Typography variant="caption" sx={{
                        fontWeight: 700,
                        color: "#fde047",
                        animation: "bounce 1s ease-in-out infinite",
                      }}>
                        +₹{lastEarningsIncrease}!
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
                    {displayedKwh} kWh {t("trades.kwhSold")}
                  </Typography>
                </Box>

                {/* LIVE indicator */}
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "9999px",
                  flexShrink: 0,
                }}>
                  <Box sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#86efac",
                    animation: "pulse 2s ease-in-out infinite",
                  }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "white", textTransform: "uppercase", fontSize: "0.65rem" }}>
                    Live
                  </Typography>
                </Box>
              </Box>
          </Button>

          {/* Projected row with progress bar */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 0.75, sm: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("home.projected")}
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "text.primary" }}>
                ₹{earningsView === "today" ? initialTodayData.expected : monthData.expected}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                ({earningsView === "today" ? initialTodayData.expectedKwh : monthData.expectedKwh} kWh)
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1, background: "rgba(255,255,255,0.6)", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "text.primary" }}>
                {Math.round((displayedEarnings / (earningsView === "today" ? initialTodayData.expected : monthData.expected)) * 100)}%
              </Typography>
            </Box>
          </Box>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (displayedEarnings / (earningsView === "today" ? initialTodayData.expected : monthData.expected)) * 100)}
            sx={{
              height: 8,
              borderRadius: "9999px",
              background: "rgba(26,158,122,0.3)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #fcd34d 0%, #fbbf24 100%)",
                borderRadius: "9999px",
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
          />
          </Card>

          {/* Section 2: Tomorrow Card */}
          <Card sx={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "12px",
            p: { xs: 1, sm: 2.5 },
            animation: "slideUp 0.5s ease-out",
            animationDelay: "0.05s",
            overflow: "hidden",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 1, sm: 1.5 } }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#1a9e7a" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.7rem", color: "#1a9e7a" }}>
                {t("home.tomorrow")}
              </Typography>
            </Box>

            <Button
              onClick={() => navigate("/tomorrow-trades")}
              sx={{
                width: "100%",
                textAlign: "left",
                borderRadius: "8px",
                p: { xs: 1.25, sm: 2 },
                flex: 1,
                background: "linear-gradient(135deg, rgba(245,158,11,1) 0%, rgba(217,119,6,1) 100%)",
                "&:hover": { background: "linear-gradient(135deg, rgba(251,174,24,1) 0%, rgba(225,130,14,1) 100%)" },
                textTransform: "none",
                color: "white",
              }}
            >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", mb: 0.5, display: "block" }}>
                  {t("home.sellingTomorrow")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" }, fontWeight: 900, color: "white" }}>
                    ₹{Math.round(tomorrowData.earnings)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5, display: "block" }}>
                  {(tomorrowData.units || 0).toFixed(2)} kWh
                </Typography>
              </Box>

              {/* Right side - Published status */}
              <Box sx={{ textAlign: "right" }}>
                {isPublished ? (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end", mb: 1 }}>
                      <Check size={12} sx={{ color: "white" }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "white", textTransform: "uppercase" }}>
                        {t("home.published")}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", textTransform: "uppercase", display: "block" }}>
                      {t("home.avgRate")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "white" }}>
                      ₹{(tomorrowData.avgRate || 0).toFixed(2)}/kWh
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", textTransform: "uppercase", mb: 1, display: "block" }}>
                      {t("home.avgRate")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "white" }}>
                      ₹{tomorrowData.avgRate || 6.3}/kWh
                    </Typography>
                  </>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end", mt: 2 }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    {t("home.viewTrades")}
                  </Typography>
                  <ArrowRight size={12} sx={{ color: "rgba(255,255,255,0.9)" }} />
                </Box>
              </Box>
            </Box>
          </Button>
        </Card>
        </Box>

        {/* Nudge cards removed as requested */}

        {/* Chat Input Bar - Always visible */}
        <Card sx={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: "12px",
          p: { xs: 1, sm: 2.5 },
          animation: "slideUp 0.5s ease-out",
          animationDelay: "0.15s",
          flexShrink: 0,
        }}>
          <ChatInputBar />
        </Card>
      </Stack>
    </Box>
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainAppShell contentClassName="lg:py-6">
      <Box sx={{
        mx: "auto",
        display: "flex",
        height: "100%",
        width: "100%",
        maxWidth: "80rem",
        flexDirection: "column",
        overflow: "hidden",
        background: "background.default",
        borderRadius: { xs: 0, lg: "2rem" },
        border: { xs: "none", lg: "1px solid rgba(0,0,0,0.05)" },
        boxShadow: { xs: "none", lg: "0 24px 80px -48px rgba(15,23,42,0.35)" },
        backdropFilter: { xs: "none", lg: "blur(8px)" },
        backgroundColor: { xs: "background.default", lg: "rgba(255,255,255,0.55)" },
      }}>
        {/* Scrollable Content Area */}
        <Box sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          px: { xs: 1.5, sm: 2.5, lg: 4 },
          pt: { xs: 1.5, sm: 2.5, lg: 3 },
          pb: 0,
        }}>
          {/* Header */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            animation: "fadeIn 0.6s ease-out",
            flexShrink: 0,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SamaiLogo size="sm" showText={false} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {getGreeting(t)}, {firstName}!
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Profile dropdown - mobile/tablet only */}
            <Box sx={{ display: { lg: "none" } }}>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(245,158,11,0.1)",
                  "&:hover": { background: "rgba(245,158,11,0.2)" },
                  color: "primary.main",
                }}
              >
                <User size={16} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={() => {
                  navigate("/profile");
                  handleMenuClose();
                }}>
                  <User size={14} style={{ marginRight: 8 }} />
                  {t("home.profile")}
                </MenuItem>
                <MenuItem onClick={() => {
                  navigate("/today-trades");
                  handleMenuClose();
                }}>
                  <FileText size={14} style={{ marginRight: 8 }} />
                  {t("home.todaysTrades")}
                </MenuItem>
                <MenuItem onClick={() => {
                  handleLogout();
                  handleMenuClose();
                }} sx={{ color: "error.main" }}>
                  <LogOut size={14} style={{ marginRight: 8 }} />
                  {t("home.logout")}
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Compact Language & Weather row */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            pb: 1,
            animation: "fadeIn 0.6s ease-out",
            animationDelay: "0.1s",
            flexShrink: 0,
          }}>
            <LanguageToggle />
            <Box sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.5,
              background: "rgba(255,255,255,0.6)",
              borderRadius: "9999px",
              border: "1px solid rgba(0,0,0,0.05)",
            }}>
              <CloudSun size={12} sx={{ color: "primary.main" }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>32°C</Typography>
            </Box>
          </Box>

          {/* Main Content - fills remaining space */}
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            {renderHomeContent()}
          </Box>
        </Box>

        {/* Powered by AU x TEC */}
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          px: { xs: 1.5, sm: 2.5, lg: 4 },
          pb: { xs: 1.5, lg: 2.5 },
          pt: 1.5,
          flexShrink: 0,
        }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
            Powered by
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="img" src={auLogo} alt="AU" sx={{ height: 16, width: "auto" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>×</Typography>
            <Box component="img" src={tecLogo} alt="TEC" sx={{ height: 16, width: "auto" }} />
          </Box>
        </Box>
      </Box>

      {/* VC Upload Modal */}
      <VCUploadModal
        isOpen={showVCModal}
        onClose={() => setShowVCModal(false)}
        onSuccess={() => {
          setUserData({ isVCVerified: false });
          toast({
            title: "Credentials uploaded!",
            description: "Your credentials are pending verification. Trading will be enabled once approved.",
          });
        }}
      />
    </MainAppShell>
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
    <Box>
      {/* Title - matching earnings/tomorrow card style */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 1, sm: 1.5 } }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#1a9e7a" }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.7rem", color: "#1a9e7a" }}>
          {t("home.quickspeak")}
        </Typography>
      </Box>

      {/* Input button with mic and send */}
      <Button
        onClick={handleOpenAskSamai}
        sx={{
          width: "100%",
          textAlign: "left",
          position: "relative",
          borderRadius: "8px",
          p: { xs: 1.25, sm: 2 },
          background: "linear-gradient(135deg, rgba(245,158,11,1) 0%, rgba(217,119,6,1) 100%)",
          "&:hover": { background: "linear-gradient(135deg, rgba(251,174,24,1) 0%, rgba(225,130,14,1) 100%)" },
          overflow: "hidden",
          textTransform: "none",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Mic size={14} sx={{ color: "white" }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 500, color: "white" }}>
            {t("home.askSamai")}
          </Typography>
        </Box>

        <Box sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Send size={14} sx={{ color: "white" }} />
        </Box>
      </Button>
    </Box>
  );
};

export default HomePage;
